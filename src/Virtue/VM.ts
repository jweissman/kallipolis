import assertUnreachable from "../Utils/assertUnreachable";


export abstract class VMValue {
    abstract pretty(): string;
    abstract toJS(): any;
    abstract plus?(v: VMValue): VMValue;
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
    times(right: VMInt) {
        return new VMStr(
            Array(right.getValue()).fill(this.contents).join('')
        );
    }
    // could mean 'split'?
    divide(right: VMStr) {
        // throw new Error("Can't divide a string?")
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

export interface Read {
    kind: 'read',
    key: string
}

export interface Write {
    kind: 'write',
    key: string,
    // value: VMValue,
    type?: VMType
}

export interface Push {
    kind: 'push',
    value: VMValue,
    type?: VMType
}

export interface Add {
    kind: 'add',
    type?: VMType
}

export interface Multiply {
    kind: 'multiply',
    type?: VMType
}

export interface Divide {
    kind: 'divide',
    type?: VMType
}

export interface VMResult {
    message: string
    value: VMValue
}

export type VMCommand = Read
                      | Write
                      | Push
                      | Add
                      | Multiply
                      | Divide

export const describeCommand: (cmd: VMCommand) => string = (cmd) => {
    switch (cmd.kind) {
        case 'read':     return `READ FROM ${cmd.key} ONTO _TOP_`;
        case 'write':    return `WRITE _TOP_ TO ${cmd.key}`;
        case 'push':     return `PUSH  ${cmd.value.pretty()}`;
        case 'add':      return `ADD`;
        case 'multiply': return `MULTIPLY`;
        case 'divide':   return `DIVIDE`;
    }
    return assertUnreachable(cmd);
}

export abstract class VM {
    abstract read(command: VMCommand): VMResult;
    abstract write(command: VMCommand): VMResult;
    abstract push(command: VMCommand): VMResult;
    abstract add(command: VMCommand): VMResult;
    abstract multiply(command: VMCommand): VMResult;
    abstract divide(command: Divide): VMResult;
}