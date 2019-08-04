import {
    VM,
    Multiply,
    VMResult,
    Add,
    Push,
    Write,
    Read,
    Divide,
    Subtract,
} from "./VM";
import { VMValue, VMInt, VMType, TypedVMValue, IntegerVMType } from "./VMValue";

class VMError extends VMValue {
    constructor(private message: string) {
        super();
    }
    pretty(): string {
        return this.message;
    }
    toJS() {
        throw new Error(this.message);
    }
    plus(right: VMInt) { return this; }
    minus(right: VMInt) { return this; }
    times(right: VMInt) { return this; }
    divide(right: VMInt) { return this; }
}
// the Justice VM engine :D
export default class Justice extends VM {
    types: { [key: string]: VMType } = {}
    db: { [key: string]: TypedVMValue } = {}
    stack: VMValue[] = []
    get top() { return this.stack[this.stack.length-1]; }

    multiply(_m: Multiply): VMResult { 
        return this.binaryOp('times', (left: VMValue, right: VMValue) => left.times
            ? left.times(right)
            : new VMError(`${left.pretty()} cannot be multiplied`)
        )
    }

    divide(_d: Divide): VMResult { 
        return this.binaryOp('over', (left: VMValue, right: VMValue) => left.divide
            ? left.divide(right)
            : new VMError(`${left.pretty()} cannot be divided`)
        )
    }

    add(_a: Add): VMResult { 
        return this.binaryOp('plus', (left: VMValue, right: VMValue) => left.plus
            ? left.plus(right)
            : new VMError(`${left.pretty()} cannot be added`)
        )
    }

    subtract(_s: Subtract): VMResult { 
        return this.binaryOp('minus', (left: VMValue, right: VMValue) => left.minus
            ? left.minus(right)
            : new VMError(`${left.pretty()} cannot be added`)
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
        let { type } = w;
        if (type) {
            if (type instanceof IntegerVMType) {
                if (!(v instanceof VMInt)) {
                    throw new Error(`${v} is not an integer!`)
                }
            }
        }
        this.db[key] = { type, value: v };
        message = `Assigned ${v.pretty()} to ${key}`
        return { message, value: v };
    }

    read(r: Read): VMResult {
        let value = this.db[r.key].value
        this.stack.push(value);
        return { message: `Read ${value.pretty()} from ${r.key}`, value }
    }

    private binaryOp(name: string, method: (l: VMValue, r: VMValue) => VMValue): VMResult {
        let left = this.stack.pop();
        let right = this.stack.pop();
        let result;
        if (left && right) {
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
