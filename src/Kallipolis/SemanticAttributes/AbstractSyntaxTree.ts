import { ActionDict, Node } from "ohm-js";
import { Type } from "../../Utils/Type";
import { VMValue, VMInt, VMStr } from "../../Virtue/VMValue";
import { VMType, BinaryOpMetadata } from "../../Virtue/Types";
import Justice from "../../Virtue/Justice";

export class KalTypeError extends Error {
    constructor(m: string) {
        super(m);
        Object.setPrototypeOf(this, KalTypeError.prototype);
    }
}


type Context = Justice;

export abstract class KalExpression {
    abstract type(ctx: Context): Type<VMValue>
}

export class Identifier extends KalExpression {
    constructor(public value: string) {
        super();
    }

    type(ctx: Context): Type<VMValue> {
        return ctx.findVariableTypeByName(this.value)
    }
}

export class NumberLiteral extends KalExpression {
    constructor(public value: number) {
        super();
    }

    type(ctx: Context): Type<VMValue> {
        return VMInt
    }
}

export class StringLiteral extends KalExpression {
    constructor(public value: string) {
        super();
    }

    type(ctx: Context): Type<VMValue> {
        return VMStr
    }
}

export class AssignmentExpr extends KalExpression {
    constructor(
        public name: KalExpression,
        public value: KalExpression
    ) {
        super();
    }

    derefName(e: KalExpression): string { 
        if (e instanceof Identifier) {
            return e.value;
        } else if (e instanceof JudgmentExpr) {
            return this.derefName(e.value)
        } else {
            console.log("deref failed!", { e })
            throw new Error("Cannot deref name of assignment lhs")
        }
    }

    type(ctx: Context): Type<VMValue> { 
        let t = this.value.type(ctx)
        let name: string = this.derefName(this.name)
        if (this.name instanceof JudgmentExpr) {
            let j: JudgmentExpr = this.name;
            let judgment = j.judgedType;
            if (judgment instanceof SimpleTypeExpr) {
                let intendedType = ctx.findTypeByName(judgment.value)
                let matched: boolean = t === intendedType.type
                if (!matched) {
                    throw new KalTypeError(
                        `Expected ${judgment.value} but got ${t.name}`
                    )
                }
            } else {
                throw new Error("Don't know how to render judgment " + judgment);
            }
        }
        ctx.suggestVariableType(name, t)
        return t
    }
}

export abstract class TypeExpr extends KalExpression {}

export class SimpleTypeExpr extends TypeExpr {
    constructor(
        public value: string
    ) {
        super();
    }

    type(ctx: Context): Type<VMValue> {
        throw new Error("A type expression has no type (a girl has no name)")
    }
}

export abstract class TypedefExpr extends KalExpression {
    constructor(public name: KalExpression, public typedef: KalExpression) {
        super();
    }
}

export class JudgmentExpr extends KalExpression {
    constructor(public value: Identifier, public judgedType: TypeExpr) {
        super();
    }

    type(ctx: Context): Type<VMValue> {
        return this.judgedType.type(ctx)
    }
}

export type BinaryOp = '+' | '-' | '*' | '/'
export class BinaryExpr extends KalExpression {
    constructor(
        public left: KalExpression,
        public right: KalExpression,
        public op: BinaryOp
    ) {
        super();
    }

    private derefType(ctx: Context, maybeId: KalExpression): VMType {
        let t: Type<VMValue>;
        if (maybeId instanceof Identifier) {
            let id: Identifier = maybeId;
            let { value } = id;
            t = ctx.findVariableTypeByName(value)
        } else {
            t = maybeId.type(ctx)
        }
        return ctx.dereferenceTypeName(t.name)
    }
    
    type(ctx: Context): Type<VMValue> {
        let leftType: VMType = this.derefType(ctx, this.left);
        let rightType: VMType = this.derefType(ctx, this.right)
        if (leftType) {
            let matchingOp: BinaryOpMetadata | undefined = leftType.getBinaryOp(this.op).
                find((op: BinaryOpMetadata) => op.opType === rightType.type)
            if (matchingOp) {
                return matchingOp.resultType;
            } else {
                throw new Error(
                    "Binary expression has invalid type: " +
                    leftType.type.name + this.op + rightType.type.name
                )
            }
        } else {
            console.warn("NO TYPE FOR LEFT FOUND", { left: this.left, right: this.right, leftType, rightType })
            throw new Error("Couldn't find type for left: " + this.left)
        }
    }
}

export class ParenExpr extends KalExpression {
    constructor(
        public stmt: KalExpression
    ) {
        super();
    }

    type(ctx: Context): Type<VMValue> {
        return this.stmt.type(ctx);
    }
}

export class ProgramExpr extends KalExpression {
    constructor(
        public stmts: KalExpression[]
    ) {
        super();
    }

    type(ctx: Context): Type<VMValue> {
        return this.stmts[this.stmts.length-1].type(ctx);
    }
}

const Tree: ActionDict = {
    Program: (stmts: Node) =>
        new ProgramExpr(stmts.tree),

    Assignment_judged: (name: Node, _eq: Node, val: Node)   => 
        new AssignmentExpr(name.tree, val.tree),
    Assignment_inferred: (name: Node, _eq: Node, val: Node)   => 
        new AssignmentExpr(name.tree, val.tree),

    Judgment: (judged: Node, _col: Node, type: Node) =>
        new JudgmentExpr(judged.tree, type.tree),

    Type_simple: (name: Node) =>
        new SimpleTypeExpr(name.tree.value),

    AddExp_plus: (left: Node, _pl: Node, right: Node) =>
        new BinaryExpr(left.tree, right.tree, '+'),
    AddExp_minus: (left: Node, _pl: Node, right: Node) =>
        new BinaryExpr(left.tree, right.tree, '-'),

    MulExp_times: (left: Node, _pl: Node, right: Node) =>
        new BinaryExpr(left.tree, right.tree, '*'),
    MulExp_divide: (left: Node, _pl: Node, right: Node) =>
        new BinaryExpr(left.tree, right.tree, '/'),

    PriExp_paren: (_lp: Node, contents: Node, _rp: Node) =>
        new ParenExpr(contents.tree),

    StringLiteral: (string: Node) => new StringLiteral(
        String(string.tree)
    ),

    string: (_lq: Node, s: Node, _rq: Node) => s.sourceString,

    NumberLiteral: (number: Node) => new NumberLiteral(
        Number(number.sourceString)
    ),

    Name: (ident: Node) => new Identifier(
        ident.sourceString
    ),

    EmptyListOf: (): Node[] => [],
    emptyListOf: (): Node[] => [],

    NonemptyListOf: (eFirst: Node, _sep: any, eRest: Node) =>
        [eFirst.tree, ...eRest.tree],

    nonemptyListOf: (eFirst: Node, _sep: any, eRest: Node) =>
        [eFirst.tree, ...eRest.tree],

}

export default Tree;