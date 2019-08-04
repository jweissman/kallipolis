import { ActionDict, Node } from "ohm-js";

const PrettyPrinter: ActionDict = {
    Assignment_judged: (name: Node, _eq: Node, val: Node)    => `${name.pretty}=${val.pretty}`,
    Assignment_inferred: (name: Node, _eq: Node, val: Node)  => `${name.pretty}=${val.pretty}`,
    Judgment: (judged: Node, _col: Node, type: Node)         => `${judged.pretty}: ${type.pretty}`,
    AddExp_plus: (left: Node, _pl: Node, right: Node)        => `${left.pretty} + ${right.pretty}`,
    NumberLiteral: (number: Node)                            => Number(number.sourceString),
    Name: (ident: Node)                                      => ident.sourceString,
}

export default PrettyPrinter;