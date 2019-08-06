import grammar from './Grammar';
import semantics from './Semantics';
import { SimpleInterpreter } from '../Virtue/Interpreter';
import { Node } from 'ohm-js';
import { NumberLiteral, BinaryExpr, KalExpression, ProgramExpr, AssignmentExpr, Identifier, JudgmentExpr, StringLiteral, ParenExpr, SimpleTypeExpr } from './SemanticAttributes/AbstractSyntaxTree';
import Controller from '../Virtue/Controller';
import assertUnreachable from '../Utils/assertUnreachable';
import { VMInt, VMStr } from '../Virtue/VMValue';
import { VMType, SimpleVMType, AnyVMType } from '../Virtue/Types';
import { VMCommand, Push, Read, Write } from '../Virtue/Command';
import Justice from '../Virtue/Justice';

class KalInterpreter extends SimpleInterpreter {
    ctrl = new Controller()
    vm = this.ctrl.getVM()
    language = { grammar, semantics }

    analyze(e: ProgramExpr) {
        if (this.vm instanceof Justice) {
            let justice: Justice = this.vm;
            let program = e.stmts;
            program.forEach(step => step.type(justice))
        }
    }

    compile(node: Node): VMCommand[] {
        return this.exprToCommands(node.tree);
    }


    private exprToCommands(e: KalExpression): VMCommand[] {
        let cmds: VMCommand[] = []
        if (e instanceof ProgramExpr) {
            cmds = this.program(e);
        } else if (e instanceof BinaryExpr) {
            cmds = this.binaryOp(e);
        } else if (e instanceof NumberLiteral) {
            let push: Push = {
                kind: 'push',
                value: new VMInt(e.value)
            }
            cmds.push(push)
        } else if (e instanceof StringLiteral) {
            let push: Push = {
                kind: 'push',
                value: new VMStr(e.value)
            }
            cmds.push(push)
        } else if (e instanceof AssignmentExpr) {
            cmds = this.assign(e)
        } else if (e instanceof Identifier) {
            let read: Read = {
                kind: 'read',
                key: e.value
            }
            cmds.push(read)
        } else if (e instanceof ParenExpr) {
            this.exprToCommands(e.stmt).forEach(c => cmds.push(c))
        } else {
            console.warn("COULD NOT COMPILE", { e })
            throw new Error("Could not compile expression: " + JSON.stringify(e))
        }
        return cmds;
    }

    private program(p: ProgramExpr): VMCommand[] {
        let cmds: VMCommand[] = []
        p.stmts.forEach(stmt => {
            cmds = [...cmds, ...this.exprToCommands(stmt)]
        })
        return cmds;
    }

    private binaryOp(be: BinaryExpr): VMCommand[] {
        let cmds: VMCommand[] = [
            ...this.exprToCommands(be.right),
            ...this.exprToCommands(be.left),
        ]
        switch (be.op) {
            case '+': cmds.push({ kind: 'add' }); break;
            case '-': cmds.push({ kind: 'subtract' }); break;
            case '*': cmds.push({ kind: 'multiply' }); break;
            case '/': cmds.push({ kind: 'divide' }); break;
            default: assertUnreachable(be.op);
        }
        return cmds;
    }

    private deriveVMType(je: JudgmentExpr): VMType {
        if (je.judgedType instanceof SimpleTypeExpr) {
            let e: SimpleTypeExpr = je.judgedType;
            return new SimpleVMType(e.value);
        } else {
            throw new Error("Don't know how to type: " + je.judgedType)
        }
    }

    private assign(a: AssignmentExpr): VMCommand[] {
        let cmds: VMCommand[] = []
        cmds = [...this.exprToCommands(a.value)]
        let key: Identifier;
        let type: VMType = new AnyVMType();
        if (a.name instanceof JudgmentExpr) {
            key = a.name.value;
            type = this.deriveVMType(a.name);
        } else if (a.name instanceof Identifier) {
            key = a.name;
        } else {
            throw new Error(
                "Expected to assign to an identifier (or judgment about one), got " +
                a.name
            )
        }
        let write: Write = {
            kind: 'write',
            key: key.value,
            type,
        }
        cmds.push(write)
        return cmds;
    }
}

export default KalInterpreter;