import { Grammar, Semantics, Dict } from 'ohm-js';
import { VMCommand } from './VM';
import VMController from './VMController';


type Program = VMCommand[];

abstract class Interpreter {
    abstract vm: VMController;
    abstract parse(input: string): Dict | undefined;
    abstract compile(expr: Dict): Program;
    evaluate(input: string): any {
        let parsed = this.parse(input)
        if (parsed) {
            let source: Dict = parsed;
            let cmds: Program = this.compile(source)
            let res = this.vm.execute(cmds);
            if (res && res.value) { return res.value.toJS() }
        } else {
            console.debug("Parse failed.");
        }
    }
}

export interface Language {
    grammar: Grammar
    semantics: Semantics
}
export abstract class SimpleInterpreter extends Interpreter {
    abstract language: Language
    parse(input: string): Dict | undefined {
        let { grammar, semantics } = this.language;
        try {
            let match = grammar.match(input);
            if (match.succeeded()) {
                return semantics(match);
            } else {
                console.warn(match.shortMessage);
            }
        } catch (e) {
            console.warn("Match failed (maybe due to missing semantics?): " + e.message)
        }
    }
}

export default Interpreter;