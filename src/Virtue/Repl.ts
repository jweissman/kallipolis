import Interpreter from "./Interpreter";
import repl from 'repl';
import fs from 'fs';

class VirtueRepl {
    constructor(
        private interpreter: Interpreter,
        private prompt: string,
        private logo: string,
        private smallLogo: string,
    ) {}

    debug() { console.log(this.smallLogo) }

    boot() {
        const args = process.argv.slice(2);
        if (args.length === 0) {
            console.log(this.logo)
            repl.start({
                prompt: this.prompt,
                eval: (input: string, _ctx: any, _filename: any, cb: any) => {
                    const out = this.interpreter.evaluate(input);
                    if (out) { cb(null, out) };
                },
                terminal: true,
            })
        } else {
            const contents = fs.readFileSync(args[0]).toString();
            console.log(this.interpreter.evaluate(contents));
        }
    }
}

export default VirtueRepl;