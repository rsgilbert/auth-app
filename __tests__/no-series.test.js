const { beforeAll, beforeEach, describe, expect, test } = require("@jest/globals");
const { nextNoFor } = require("../src/services/no-series");
const db = require('../src/db.js')


beforeEach(() => {

})


describe('no series', () => {
    beforeEach(async () => {
        let stmt = 'DELETE FROM no_series WHERE code = ?'
        let values = ['test_nos']
        await db.query(conn => conn.query(stmt, values))
    })
    describe('nextNoFor()', () => {
        beforeEach(async () => {
            let stmt = 'INSERT INTO no_series(code, last_no) VALUES(?,?)'
            let values = ['test_nos', 'TEST-0027']
            await db.query(conn => conn.query(stmt, values))
        })
        test('returns a string', async () => {
            const result = await nextNoFor('test_nos')
            expect(result).toBeTruthy()
            expect(result).not.toBe('')
            expect(result).toBe('TEST-0028')
        })
    })
})