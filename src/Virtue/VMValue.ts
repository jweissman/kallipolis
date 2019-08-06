import { Type } from "../Utils/Type";

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