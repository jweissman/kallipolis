import grammar from './Grammar';
import PrettyPrinter from './SemanticAttributes/PrettyPrinter';
import AbstractSyntaxTree from './SemanticAttributes/AbstractSyntaxTree';

const SemanticAttributes = {
    Pretty: PrettyPrinter,
    Tree: AbstractSyntaxTree,
}

let s = grammar.createSemantics();
s.addAttribute("pretty", SemanticAttributes.Pretty);
s.addAttribute("tree",   SemanticAttributes.Tree);
export default s;