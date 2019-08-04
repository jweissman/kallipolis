import { VM, VMCommand, VMResult } from "./VM";
import Justice from "./Justice";
import assertUnreachable from "../Utils/assertUnreachable";

export class VMController {
    constructor(private vm: VM = new Justice()) {}
    execute(command: VMCommand): VMResult {
        let res: VMResult | null = null;
        switch(command.kind) { 
            case 'write': 
                res = this.vm.write(command);
                break;
            case 'read':
                res = this.vm.read(command);
                break;
            case 'push':
                res = this.vm.push(command);
                break;
            case 'add':
                res = this.vm.add(command);
                break;
            case 'multiply':
                res = this.vm.multiply(command);
                break;
            case 'divide':
                res = this.vm.divide(command);
                break;
            default:
                assertUnreachable(command);
        }
        if (res) {
            return res;
        } else {
            throw new Error(
                "VM attempted to execute command, but did not return a valid result: "
                + command
            )
        }
    }
}

export default VMController;