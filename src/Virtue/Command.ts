import { VMType } from "./Types";
import { VMValue } from "./VMValue";
import assertUnreachable from "../Utils/assertUnreachable";

export interface Read {
    kind: 'read',
    key: string
}

export interface Write {
    kind: 'write',
    key: string,
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

export interface Subtract {
    kind: 'subtract',
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
                      | Subtract
                      | Multiply
                      | Divide

export const describeCommand: (cmd: VMCommand) => string = (cmd) => {
    switch (cmd.kind) {
        case 'read':     return `READ FROM ${cmd.key} ONTO _TOP_`;
        case 'write':    return `WRITE _TOP_ TO ${cmd.key}`;
        case 'push':     return `PUSH  ${cmd.value.pretty()}`;
        case 'add':      return `ADD`;
        case 'subtract': return `SUBTRACT`;
        case 'multiply': return `MULTIPLY`;
        case 'divide':   return `DIVIDE`;
    }
    return assertUnreachable(cmd);
}