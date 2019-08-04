import {
    VM,
    VMType,
    TypedVMValue,
    VMValue,
    Multiply,
    VMResult,
    Add,
    Push,
    Write,
    IntegerVMType,
    VMInt,
    Read,
    Divide
} from "./VM";

// the Justice VM engine :D
// a tiny vm with a handful of operations
export default class Justice extends VM {
    types: { [key: string]: VMType } = {}
    db: { [key: string]: TypedVMValue } = {}
    stack: VMValue[] = []
    get top() { return this.stack[this.stack.length-1]; }
    
    multiply(_m: Multiply): VMResult { 
        let left = this.stack.pop();
        let right = this.stack.pop();
        let result;
        if (left && left.times && right) {
            result = left.times(right);
            this.stack.push(result);
            return {
                message: `Multiplied ${left.pretty()} and ${right.pretty()} yielding ${result.pretty()}`,
                value: result
            }
        } else {
            throw new Error("Could not multiply " + { left, right})
        }
    }

    divide(_d: Divide): VMResult { 
        let left = this.stack.pop();
        let right = this.stack.pop();
        let result;
        if (left && right && right.divide) {
            result = right.divide(left);
            this.stack.push(result);
            return {
                message: `Divided ${right.pretty()} by ${left.pretty()} yielding ${result.pretty()}`,
                value: result
            }
        } else {
            throw new Error("Could not divide " + { left, right})
        }
    }



    add(_a: Add): VMResult { 
        let left = this.stack.pop();
        let right = this.stack.pop();
        let result;
        if (left && left.plus && right) {
            result = left.plus(right);
            this.stack.push(result);
            return {
                message: `Added ${left.pretty()} and ${right.pretty()} yielding ${result.pretty()}`,
                value: result
            }
        } else {
            throw new Error("Could not add " + { left, right})
        }
        
    }

    push(p: Push): VMResult {
        let { value } = p;
        this.stack.push(value);
        return {
            message: `Pushed ${p.value.pretty()}`,
            value: p.value
        };
    }

    write(w: Write): VMResult {
        let message = '';
        let { key } = w;
        let v = this.top;
        let { type } = w;
        if (type) {
            if (type instanceof IntegerVMType) {
                if (!(v instanceof VMInt)) {
                    throw new Error(`${v} is not an integer!`)
                }
            }
        }
        this.db[key] = { type, value: v };
        message = `Assigned ${v.pretty()} to ${key}`
        return { message, value: v };
    }

    read(r: Read): VMResult {
        let value = this.db[r.key].value
        this.stack.push(value);
        return { message: `Read ${value.pretty()} from ${r.key}`, value }
    }
}
