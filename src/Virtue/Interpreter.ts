import { Grammar, Semantics, Dict } from 'ohm-js';
import Controller from './Controller';
import { VMCommand } from './Command';

type Program = VMCommand[];

abstract class Interpreter {
    abstract ctrl: Controller;
    abstract parse(input: string): Dict | undefined;
    abstract analyze(expr: Dict): void;
    abstract compile(expr: Dict): Program;

    evaluate(input: string): any {
        let parsed = this.parse(input)
        if (parsed) {
            let source: Dict = parsed;
            this.analyze(source.tree)
            
            let cmds: Program = this.compile(source)
            let res = this.ctrl.execute(cmds);
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
            console.warn("Lex error: " + e.message)
        }
    }

}

export default Interpreter;