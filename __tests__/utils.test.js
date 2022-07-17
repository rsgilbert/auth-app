const { describe, expect, it } = require('@jest/globals');
const { confirmationCode } = require('../src/auth/utils');

describe('utils', () => {
    it('generates a random confirmation code', () => {
        const code1 = confirmationCode();
        const code2 = confirmationCode();
        console.log(code1);
        expect(code1).not.toEqual(code2);
    });
})