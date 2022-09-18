
const { describe, test, expect, beforeEach, jest: requiredJest } = require("@jest/globals");
const mailService = require('../src/services/mail/mail-service.js')
const mailServiceSpy = requiredJest.spyOn(mailService, 'sendEmailNotification')
    // @ts-ignore
    .mockResolvedValue()
const noseries = require('../src/services/no-series.js')
const noseriesSpy = requiredJest.spyOn(noseries, 'nextNoFor')
    .mockResolvedValue('TEST-USER-XXX')
const { selectUserByEmail, confirmUserByEmail, insertUser } = require("../src/services/user/user-service")
const db = require('../src/db.js')



describe('user service', () => {
    beforeEach(async () => {
        let stmt = 'DELETE FROM users WHERE email LIKE ?'
        let values = 'test%'
        await db.query(conn => conn.query(stmt, values))
    })
    describe('selectUserByEmail(email)', () => {
        test('throws error if no matching user', () => {
            expect(async () => {
                await selectUserByEmail("xxx@mail.com")
            }).rejects.toThrowError('No user')
        })
        test('returns correct user', async () => {
            let stmt = 'INSERT INTO users(user_id, email) VALUES(?, ?)'
            let values = ['TEST-USER-0001', 'test1@mail.com']
            await db.query(conn => conn.query(stmt, values))
            stmt = 'INSERT INTO users(user_id, email) VALUES(?, ?)'
            values = ['TEST-USER-0002', 'test2@mail.com']
            await db.query(conn => conn.query(stmt, values))
            let user = await selectUserByEmail('test1@mail.com')
            expect(user).toMatchObject({
                email: 'test1@mail.com',
                user_id: 'TEST-USER-0001'
            })
        })
    })

    describe('confirmUserByEmail(email)', () => {
        let user_id = 'TEST-USER-0001'
        let email = 'test2@mail.com'
        let confirmation_code = '5432'
        beforeEach(async () => {
            let stmt = 'INSERT INTO users(user_id, email, confirmation_code) VALUES (?,?,?)'
            let values = [user_id, email, confirmation_code]
            await db.query(conn => conn.query(stmt, values))
        })
        test('throws error if user does not exist', async () => {
            expect(async () => {
                await confirmUserByEmail('yyy@mail.com', '1234')
            }).rejects.toThrowError()
        })
        test('throws error if incorrect confirmation code is given', async () => {
            // testing helps you rethink and reorganize code
            // It helps you spot our requirements and bring everything about a single requirement in one place
            // In this case, I realized that the function for confirming user by email needs the parameter for confirmation code to check and confirm its correct
            // before updating the user record. So I reorganized the code.
            expect(async () => {
                await confirmUserByEmail(email, '2222')
            }).rejects.toThrowError()
        })
        test('updates confirm field on user if confirmation code is correct', async () => {
            await confirmUserByEmail(email, confirmation_code)
            const user = await selectUserByEmail(email)
            expect(user).toMatchObject({
                confirmed: 1
            })
        })
    })

    describe('insertUser(email, plainPassword)', () => {
        test('throws error if user exists and has been confirmed', () => {
            expect(async () => {
                const email = 'test1@mail.com'
                const user = await insertUser(email, 'pass')
                await confirmUserByEmail(email, user.confirmation_code)
                await insertUser(email, 'pass2')
            }).rejects.toThrowError()
        })

        test('sends email to user', async () => {
            await insertUser('test1@mail.com', 'pass')
            expect(mailServiceSpy).toHaveBeenCalled()
        })
        test('sends email to user with correct confirmation code', async () => {
            mailServiceSpy.mockClear()
            await insertUser('test1@mail.com', 'pass')
            const user = await selectUserByEmail('test1@mail.com')
            const param1 = mailServiceSpy.mock.calls[0][0]
            expect(param1.html).toMatch(user.confirmation_code)
        })
        test('inserts a new user record into database if no user with given email exists', async () => {
            // before count
            let stmt = 'SELECT COUNT(*) AS count FROM users'
            let values = []
            let [result] = await db.query(c => c.query(stmt, values))
            const beforeCount = result.count
            await insertUser('test8@mail.com', 'pass');
            // after count
            [result] = await db.query(c => c.query(stmt, values))
            const afterCount = result.count
            expect(afterCount).toBe(beforeCount + 1)
        })
        test('updates existing database record if a user with given email exists but has not yet been confirmed', async () => {
            const email = 'test7@mail.com'
            let stmt = 'INSERT INTO users (user_id, email, hashed_password, confirmation_code) VALUES (?,?,?,?) RETURNING *'
            let values = ['TEST-USER-0006', email, 'xxxx', '1234']
            const [initialUser] = await db.query(c => c.query(stmt, values))
            const updatedUser = await insertUser(email, 'pass5')
            let user = await selectUserByEmail(email)
            expect(user).toMatchObject({
                user_id: 'TEST-USER-0006',
                email,
                confirmation_code: updatedUser.confirmation_code
            })
            expect(user.hashed_password).not.toBe(initialUser.hashed_password)
            expect(user.hashed_password).toBe(updatedUser.hashed_password)
        })
    })
})