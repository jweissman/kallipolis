import KalInterpreter from "./KalIntepreter";

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
        expect(kal.evaluate('a=3; a+4')).toEqual(7);
        expect(kal.evaluate('b=5; a+b')).toEqual(8);
    })

    it('strings', () => {
        expect(kal.evaluate('greeting="hello"; greeting + " world"')).toEqual("hello world")
    })

    it('evaluates type judgments', () => {
        expect(kal.evaluate('a: Int = 123')).toEqual(123)
        expect(kal.evaluate('b: Int = 100 + 24')).toEqual(124)
    })

    //it("evaluates simple expressions", () => {
    //    expect(kal.evaluate('2+2')).toEqual(4)
    //    expect(kal.evaluate('"hello world"')).toEqual('hello world')
    //    expect(kal.evaluate('[1,2,3][0]')).toEqual(1)
    //    expect(kal.evaluate('{greeting: "hi"}.greeting')).toEqual('hi')
    //    expect(kal.evaluate('(a,b)=>{}')).toEqual('()=>{}')
    //})
})