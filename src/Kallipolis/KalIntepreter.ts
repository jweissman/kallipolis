import grammar from './Grammar';
import semantics from './Semantics';
import { SimpleInterpreter } from '../Virtue/Interpreter';
import { VMCommand, VMInt, Push, Write, Read } from '../Virtue/VM';
import { Node } from 'ohm-js';
import { NumberLiteral, BinaryExpr, KalExpression, ProgramExpr, AssignmentExpr, Identifier, JudgmentExpr } from './SemanticAttributes/AbstractSyntaxTree';
import VMController from '../Virtue/VMController';
import assertUnreachable from '../Utils/assertUnreachable';

class KalInterpreter extends SimpleInterpreter {
    vm = new VMController()
    language = { grammar, semantics }

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
        } else if (e instanceof AssignmentExpr) {
            cmds = this.assign(e)
        } else if (e instanceof Identifier) {
            let read: Read = {
                kind: 'read',
                key: e.value
            }
            cmds.push(read)
        }

        else {
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
            ...this.exprToCommands(be.left),
            ...this.exprToCommands(be.right),
        ]
        switch (be.op) {
            case '+': cmds.push({ kind: 'add' }); break;
            case '*': cmds.push({ kind: 'multiply' }); break;
            case '/': cmds.push({ kind: 'divide' }); break;
            default: assertUnreachable(be.op);
        }
        return cmds;
    }

    private assign(a: AssignmentExpr): VMCommand[] {
        let cmds: VMCommand[] = []
        cmds = [...this.exprToCommands(a.value)]
        let key: Identifier;
        if (a.name instanceof JudgmentExpr) {
            key = a.name.value;
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
        }
        cmds.push(write)
        return cmds;
    }
}

export default KalInterpreter;