import { VMCommand, VMResult, Divide } from "./Command";
import { VMType } from "./Types";
import { Type } from "../Utils/Type";
import { VMValue } from "./VMValue";

export abstract class VM {
    [x: string]: any;
    abstract read(command: VMCommand): VMResult;
    abstract write(command: VMCommand): VMResult;
    abstract push(command: VMCommand): VMResult;
    abstract add(command: VMCommand): VMResult;
    abstract subtract(command: VMCommand): VMResult;
    abstract multiply(command: VMCommand): VMResult;
    abstract divide(command: Divide): VMResult;

    // abstract dereferenceTypeName(name: string): VMType;
    // abstract findTypeByName(value: string): VMType;
    // abstract findVariableTypeByName(value: string): Type<VMValue>;
    // abstract suggestVariableType(value: string, type: Type<VMValue>): void;

    abstract debug(): string;
}