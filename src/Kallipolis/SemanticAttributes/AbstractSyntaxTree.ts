import { ActionDict, Node } from "ohm-js";

export abstract class KalExpression {}

export class Identifier extends KalExpression {
    constructor(public value: string) {
        super();
    }
}

export class NumberLiteral extends KalExpression {
    constructor(public value: number) {
        super();
    }
}

export class StringLiteral extends KalExpression {
    constructor(public value: string) {
        super();
    }
}

export class AssignmentExpr extends KalExpression {
    constructor(
        public name: Identifier,
        public value: KalExpression
    ) {
        super();
    }
}

export abstract class TypeExpr extends KalExpression {}

export class SimpleTypeExpr extends TypeExpr {
    constructor(
        public value: string
    ) {
        super();
    }
}

export class JudgmentExpr extends KalExpression {
    constructor(public value: Identifier, public type: TypeExpr) {
        super();
    }
}

type BinaryOp = '+' | '-' | '*' | '/'
export class BinaryExpr extends KalExpression {
    constructor(
        public left: KalExpression,
        public right: KalExpression,
        public op: BinaryOp
    ) {
        super(); 
    }
}

export class ParenExpr extends KalExpression {
    constructor(
        public stmt: KalExpression
    ) {
        super();
    }
}

export class ProgramExpr extends KalExpression {
    constructor(
        public stmts: KalExpression[]
    ) {
        super();
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