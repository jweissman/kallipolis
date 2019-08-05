import { setMaxListeners } from "cluster";
import { BinaryOp } from "../Kallipolis/SemanticAttributes/AbstractSyntaxTree";

export abstract class VMValue {
    kind: string = 'never';
    type: Type<VMValue> = VMDynamic
    abstract pretty(): string;
    abstract toJS(): any;
    abstract plus(v: VMValue): VMValue;
    abstract minus(v: VMValue): VMValue;
    abstract times(v: VMValue): VMValue;
    abstract divide(v: VMValue): VMValue;
}

export class VMDynamic extends VMValue {
    kind: string = 'any';
    constructor(private value: any) {
        super();
    }
    pretty(): string { return this.value.toString() };
    toJS(): any { return this.value; };
    plus(v: VMValue): VMValue { throw new Error("nope"); };
    minus(v: VMValue): VMValue { throw new Error("nope"); };
    times(v: VMValue): VMValue { throw new Error("nope"); };
    divide(v: VMValue): VMValue { throw new Error("nope"); };
}

export class VMInt extends VMValue {
    kind = 'Int';
    type = VMInt;

    constructor(private value: number) {
        super();
    }
    pretty(): string {
        return this.value.toString();
    }
    getValue() { return this.value; }
    toJS() { return Number(this.value); }
    plus(right: VMInt) {
        if (!(right instanceof VMInt)) {
            throw new Error("Can only add ints to ints")
        }
        return new VMInt(this.getValue() + right.getValue());
    }
    minus(right: VMInt) {
        if (!(right instanceof VMInt)) {
            throw new Error("Can only subtract ints from ints")

        }
        return new VMInt(this.getValue() - right.getValue());
    }
    times(right: VMInt) {
        if (!(right instanceof VMInt)) {
            throw new Error("Can only multiply ints by ints")
        }
        return new VMInt(this.getValue() * right.getValue());
    }
    divide(right: VMInt) {
        if (!(right instanceof VMInt)) {
            throw new Error("Can only divide ints by ints")
        }
        return new VMInt(this.getValue() / right.getValue());
    }
}

export class VMStr extends VMValue {
    kind: string = 'String';
    type = VMStr; 
    constructor(private contents: string) {
        super();
    }
    pretty(): string {
        return '"' + this.contents + '"';
    }
    toJS() { return String(this.contents); }
    getContents(): string { return this.contents; }
    plus(right: VMStr | VMInt) {
        if (right instanceof VMStr) {
            return new VMStr(this.getContents() + right.getContents());
        } else if (right instanceof VMInt) {
            return new VMStr(this.getContents() + right.getValue());
        } else {
            throw new Error("Can only add strings to strings or ints")
        }
    }
    minus(right: VMStr) {
        if (!(right instanceof VMInt)) {
            throw new Error("Can only subtract strings from strings")
        }
        return new VMStr(this.getContents().replace(
            right.getContents(), ''
        ));
    }
    times(right: VMInt) {
        if (!(right instanceof VMInt)) {
            throw new Error("Can only multiply strings by ints")
        }
        return new VMStr(
            Array(right.getValue()).fill(this.contents).join('')
        );
    }
    divide(right: VMStr) {
        return this;
    }
}

export class VMList<T> extends VMValue {
    pretty(): string {
        throw new Error("Method not implemented.");
    }
    toJS() {
        throw new Error("Method not implemented.");
    }
    plus(v: VMValue): VMValue {
        throw new Error("Method not implemented.");
    }
    minus(v: VMValue): VMValue {
        throw new Error("Method not implemented.");
    }
    times(v: VMValue): VMValue {
        throw new Error("Method not implemented.");
    }
    divide(v: VMValue): VMValue {
        throw new Error("Method not implemented.");
    }
}

export interface Type<T> extends Function { new (...args: any[]): T; }

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
        this.addBinaryOp('+', VMInt, VMInt)
        this.addBinaryOp('-', VMInt, VMInt)
        this.addBinaryOp('*', VMInt, VMInt)
        this.addBinaryOp('*', VMStr, VMStr)
        this.addBinaryOp('/', VMInt, VMInt)
    }

    check(v: VMValue): boolean {
        return v instanceof VMInt;
    }
}

export class StringVMType extends VMType {
    type = VMStr
    constructor() {
        super();
        this.addBinaryOp('+', VMInt, VMStr)
        this.addBinaryOp('+', VMStr, VMStr)
        this.addBinaryOp('-', VMStr, VMStr)
        this.addBinaryOp('*', VMInt, VMStr)
        this.addBinaryOp('/', VMStr, VMList)
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