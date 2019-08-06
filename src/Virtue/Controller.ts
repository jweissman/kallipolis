import { VM } from "./VM";
import Justice from "./Justice";
import assertUnreachable from "../Utils/assertUnreachable";
import { VMCommand, VMResult, describeCommand } from "./Command";

type Program = VMCommand[]
export class Controller {
    debug: boolean = false
    constructor(private vm: VM = new Justice()) {
        console.debug("Kallipolis on VirtueVM v0.1")
    }

    getVM() { return this.vm }

    execute(
        program: Program,
    ): VMResult | null {
        let res = null;
        program.forEach(step => {
            res = this.executeOne(step)
            if (this.debug) {
                console.log(
                    describeCommand(step).padEnd(28), "---",
                    res.message
                    )
            }
        });
        return res;
    }

    private executeOne(command: VMCommand): VMResult {
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
            case 'subtract':
                res = this.vm.subtract(command);
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

export default Controller;