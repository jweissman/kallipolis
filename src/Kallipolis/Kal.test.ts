import KalInterpreter from "./KalIntepreter";
import { KalTypeError } from "./SemanticAttributes/AbstractSyntaxTree";

describe("Kal", () => {
    let kal = new KalInterpreter()
    it('echoes back a number', () => {
        expect(kal.evaluate('2')).toEqual(2)
    })

    describe('arithmetic', () => {
        it('adds numbers', () => {
            expect(kal.evaluate('2+2')).toEqual(4);
            expect(kal.evaluate('5+8')).toEqual(13);
        })

        it('subtracts numbers', () => {
            expect(kal.evaluate('2-1')).toEqual(1);
            expect(kal.evaluate('10-14')).toEqual(-4);
        })

        it('multiplies numbers', () => {
            expect(kal.evaluate('2+3*4')).toEqual(14);
        })

        it('divides numbers', () => {
            expect(kal.evaluate('2+9/3')).toEqual(5);
        })

        it('divides numbers', () => {
            expect(kal.evaluate('2+9/3')).toEqual(5);
        })

        it('parens', () => {
            expect(kal.evaluate('2*(3+4)')).toEqual(14);
        })
    })

    it('stores and retrieves values', () => {
        expect(kal.evaluate('a=3; a+4; b=5; a+b')).toEqual(8);
    })

    it('strings', () => {
        expect(kal.evaluate('"hi"')).toEqual("hi")
        expect(kal.evaluate('greeting="hello"; greeting + " world"')).toEqual("hello world")
    })
    
    it.skip('typedefs', () => {
        // alias
        expect(kal.evaluate('type Name = String')).toEqual('Name')
        expect(kal.evaluate('name: Name = "Sam"')).toEqual('Sam')

        // tuple
        // function
        // higher-order? (with params?)
        // list
    })

    describe('enforces type judgments', () => {
        it('checks for Ints on an assignment', () => {
            expect(kal.evaluate('a: Int = 123')).toEqual(123)
            expect(kal.evaluate('b: Int = 100 + 24')).toEqual(124)
            expect(() => kal.evaluate('c: Int = "hello"')).toThrowError(KalTypeError)
            expect(() => kal.evaluate('a + "hello"')).not.toThrowError(KalTypeError)
        })

        it('checks for Strings on an assignment', () => {
            expect(kal.evaluate('a: String = "hello"')).toEqual("hello")
            expect(() => kal.evaluate('b: String = 1234')).toThrowError(KalTypeError)
        })
    })
})