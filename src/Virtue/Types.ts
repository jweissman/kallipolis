import { VMValue, VMDynamic, VMInt, VMStr } from "./VMValue";
import { BinaryOp } from "../Kallipolis/SemanticAttributes/AbstractSyntaxTree";
import { Type } from "../Utils/Type";

export type BinaryOpMetadata = { opType: Type<VMValue>, resultType: Type<VMValue> }

export abstract class VMType {
    getBinaryOp(op: BinaryOp) {
        return this.binaryOperations[op];
    }

    abstract type: Type<VMValue>;
    abstract check(v: VMValue): boolean;

    private binaryOperations: {
        [name: string]: BinaryOpMetadata[],
    } = {};

    addBinaryOp(opName: string, operandType: Type<VMValue>, resultType: Type<VMValue>) {
        this.binaryOperations[opName] = 
            this.binaryOperations[opName] || [];
        this.binaryOperations[opName].push({ opType: operandType, resultType });
    }

    checkBinaryOp(opName: string, type: Type<VMValue>): boolean {
        let opData = this.binaryOperations[opName];
        if (opData &&
            opData.length) {
            return !!opData.find(op => op.opType === type)
        }
        return false;
    }
}

export class AnyVMType extends VMType {
    type = VMDynamic
    check(v: VMValue): boolean {
        return true;
    }
}

export class SimpleVMType extends VMType {
    type = VMDynamic
    constructor(private name: string) {
        super();
    }
    getName() { return this.name }
    check(v: VMValue): boolean {
        throw new Error("Must de-ref a simple named type to a 'concretion' before calling check!");
    }
}

export class IntegerVMType extends VMType {
    type = VMInt
    constructor() {
        super();
        this.addBinaryOp('+', VMInt, VMInt) // int + int = int
        this.addBinaryOp('-', VMInt, VMInt) // int - int = int
        this.addBinaryOp('*', VMInt, VMInt) // int * int = int
        this.addBinaryOp('/', VMInt, VMInt) // int / int = int (but does it!??)
        this.addBinaryOp('*', VMStr, VMStr) // int * str = str (copy)
        this.addBinaryOp('+', VMStr, VMStr) // int + str = str (to_s)
    }

    check(v: VMValue): boolean {
        return v instanceof VMInt;
    }
}

export class StringVMType extends VMType {
    type = VMStr
    constructor() {
        super();
        this.addBinaryOp('+', VMInt, VMStr) // str + int = str (to_s)
        this.addBinaryOp('*', VMInt, VMStr) // str * int = str (copy)

        this.addBinaryOp('+', VMStr, VMStr) // str + str = str (concat)
        this.addBinaryOp('-', VMStr, VMStr) // str - str = str (remove instances of s2 from s1)
        // this.addBinaryOp('/', VMStr, VMList)
    }

    check(v: VMValue): boolean {
        return v instanceof VMStr;
    }
}

export function typeFromValue(v: VMValue, types: { [key: string]: VMType }): VMType {
    let type = types[v.kind];
    if (type instanceof SimpleVMType) {
        return types[type.getName()];
    } else {
        return type;
    }
}