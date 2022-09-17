const { describe, expect, it, test } = require('@jest/globals');
const { generateConfirmationCode } = require('../src/auth/utils');


describe('utils', () => {
    describe('generateConfirmationCode()', () => {
        test('result is random', () => {
            const code1 = generateConfirmationCode();
            const code2 = generateConfirmationCode();
            expect(code1).not.toEqual(code2);
        })
        test('result is a string of digits', () => {
            const result = generateConfirmationCode()
            for(let d of result) {
                expect(Number(d)).not.toBeNaN()
            }
        })
        test('result is 4 digits', () => {
            expect(generateConfirmationCode()).toHaveLength(4)
        })
    })
})
