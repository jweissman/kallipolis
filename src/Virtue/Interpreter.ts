import { Grammar, Semantics, Dict } from 'ohm-js';
import { VMCommand, VMValue, describeCommand } from './VM';
import VMController from './VMController';

export interface Language {
    grammar: Grammar
    semantics: Semantics
}


abstract class Interpreter {
    abstract vm: VMController;
    abstract parse(input: string): Dict;
    abstract compile(expr: Dict): VMCommand[];
    evaluate(input: string): any {
        let cmds: VMCommand[] = this.compile(this.parse(input))
        let val: VMValue | null = null;
        for (let cmd of cmds) {
            let res = this.vm.execute(cmd);
            // console.log(res.message);
            val = res.value
        }
        if (val) {
            return val.toJS()
        }
    }
}

export abstract class SimpleInterpreter extends Interpreter {
    abstract language: Language
    parse(input: string): Dict {
        let { grammar, semantics } = this.language;
        let match = grammar.match(input);
        if (match.succeeded()) {
            return semantics(match);
        } else {
            console.warn(match.message);
            throw new Error("KalInterpreter#evaluate: failed to parse input string")
        }
    }
}

export default Interpreter;