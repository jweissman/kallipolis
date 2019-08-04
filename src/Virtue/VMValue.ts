export abstract class VMValue {
    abstract pretty(): string;
    abstract toJS(): any;
    abstract plus?(v: VMValue): VMValue;
    abstract minus(right: VMValue): VMValue;
    abstract times?(v: VMValue): VMValue;
    abstract divide?(v: VMValue): VMValue;
}

export class VMInt extends VMValue {
    constructor(private value: number) {
        super();
    }
    pretty(): string {
        return this.value.toString();
    }
    getValue() { return this.value; }
    toJS() { return Number(this.value); }
    plus(right: VMInt) {
        return new VMInt(this.getValue() + right.getValue());
    }
    minus(right: VMInt) {
        return new VMInt(this.getValue() - right.getValue());
    }
    times(right: VMInt) {
        return new VMInt(this.getValue() * right.getValue());
    }
    divide(right: VMInt) {
        return new VMInt(this.getValue() / right.getValue());
    }
}

export class VMStr extends VMValue {
    constructor(private contents: string) {
        super();
    }
    pretty(): string {
        return '"' + this.contents + '"';
    }
    toJS() { return String(this.contents); }
    getContents(): string { return this.contents; }
    plus(right: VMStr) {
        return new VMStr(this.getContents() + right.getContents());
    }
    minus(right: VMStr) {
        return new VMStr(this.getContents().replace(
            right.getContents(), ''
        ));
    }
    times(right: VMInt) {
        return new VMStr(
            Array(right.getValue()).fill(this.contents).join('')
        );
    }
    divide(right: VMStr) {
        return this;
    }
}


export class VMType { }
export class IntegerVMType extends VMType {}
export class StringVMType extends VMType {}

export interface TypedVMValue {
    type?:  VMType
    value:  VMValue
}
