import { VM } from "./VM";
import { VMValue  } from "./VMValue";
import { BinaryOp } from "../Kallipolis/SemanticAttributes/AbstractSyntaxTree";
import { VMType, IntegerVMType, StringVMType, AnyVMType, SimpleVMType, typeFromValue } from "./Types";
import { Type } from "../Utils/Type";
import { Multiply, VMResult, Divide, Add, Subtract, Push, Write, Read } from "./Command";

export default class Justice extends VM {
    typeDefs: { [key: string]: VMType } = {
        Int: new IntegerVMType(),
        String: new StringVMType(),
    }
    typeDb: { [key: string]: Type<VMValue> } = {}
    db: { [key: string]: VMValue } = {}
    stack: VMValue[] = []
    get top() { return this.stack[this.stack.length-1]; }

    debug() { 
        return ["~~~ JUSTICE VM ~~~"].join("\n")
    }

    dereferenceTypeName(name: string) {
        let baseTypes: { [key: string]: VMType }  = { 
            VMInt: new IntegerVMType(),
            VMStr: new StringVMType(),
            VMDynamic: new AnyVMType(),
        }
        return baseTypes[name];
    }

    findVariableTypeByName(name: string): Type<VMValue> {
        let t = this.typeDb[name];
        return t;
    }

    findTypeByName(typeName: string) {
        return this.typeDefs[typeName];
    }

    suggestVariableType(name: string, value: Type<VMValue>): void {
        this.typeDb[name] = value;
    }

    multiply(_m: Multiply): VMResult { 
        return this.binaryOp('times', '*', (left: VMValue, right: VMValue) =>
            left.times(right)
        )
    }

    divide(_d: Divide): VMResult { 
        return this.binaryOp('over', '/', (left: VMValue, right: VMValue) =>
            left.divide(right)
        )
    }

    add(_a: Add): VMResult { 
        return this.binaryOp('plus', '+', (left: VMValue, right: VMValue) =>
            left.plus(right)
        )
    }

    subtract(_s: Subtract): VMResult { 
        return this.binaryOp('minus', '-', (left: VMValue, right: VMValue) =>
            left.minus(right)
        )
    }

    push(p: Push): VMResult {
        let { value } = p;
        this.stack.push(value);
        return {
            message: `Pushed ${p.value.pretty()}`,
            value: p.value
        };
    }

    write(w: Write): VMResult {
        let message = '';
        let { key } = w;
        let v = this.top;
        let { type: t } = w;
        if (t) {
            if (t instanceof SimpleVMType) {
                let typeName = t.getName();
                let resolved = this.findTypeByName(typeName)
                this.suggestVariableType(key, resolved.type)
            }
        }
        this.db[key] = v
        message = `Assigned ${v.pretty()} to ${key}`
        return { message, value: v };
    }

    read(r: Read): VMResult {
        let value = this.db[r.key]
        this.stack.push(value);
        return { message: `Read from ${r.key}`, value }
    }

    private binaryOp(name: string, opName: BinaryOp, method: (l: VMValue, r: VMValue) => VMValue): VMResult {
        let left = this.stack.pop();
        let right = this.stack.pop();
        let result;
        if (left && right) {
            let leftType = typeFromValue(left, this.typeDefs)
            let rightType = typeFromValue(right, this.typeDefs)
            let validOp = leftType.checkBinaryOp(opName, rightType.type)
            if (!validOp) {
                throw new Error(`Type error: binary op ${opName} not supported for lhs type ${leftType.type.name} and rhs type ${rightType.type.name}`)
            }
            result = method(left, right);
            this.stack.push(result);
            return {
                message: `Calculate ${left.pretty()} ${name} ${right.pretty()} (yielding ${result.pretty()})`,
                value: result
            }
        } else {
            throw new Error(`Could not compute ${left} ${name} ${right}`)
        }
    }
}
