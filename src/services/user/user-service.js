
const { hashPassword, generateConfirmationCode } = require('../../auth/utils.js');
const { query } = require('../../db.js');
const db = require('../../db.js');
const { sendEmailNotification } = require('../mail/mail-service.js');
const { nextNoFor } = require('../no-series.js');


/**
 * Selects a user record from the database by their email
 * @param {string} email 
 * @returns {Promise<User>}
 */
async function selectUserByEmail(email) {
    const stmt = 'SELECT * FROM users WHERE email = ?';
    const values = [email];
    const [user] = await query(client => client.query(stmt, values));
    if (!user) throw Error('No user with email ' + email);
    return user;
}

/**
 * Confirms that the provided confirmation_code is correct and if so updates
 * the user record to indicate that it has been confirmed. Otherwise throws an error
 * If the user has already been confirmed the function leaves it at that.
 * @param {string} email 
 * @param {string} confirmation_code 
 * @throws if no user with email or the confirmation code is incorrect
 * @returns {Promise<void>}
 */
async function confirmUserByEmail(email, confirmation_code) {
    let user = await selectUserByEmail(email);
    if (user.confirmed) return;
    if (user.confirmation_code !== confirmation_code) {
        throw Error('Wrong confirmation code')
    }
    let stmt = "UPDATE users SET confirmation_code = '', confirmed = 1 WHERE email = ?"
    let values = [email]
    await db.query(c => c.query(stmt, values))
}

/**
 * 
 * @param {string} email 
 * @param {string} plainPassword 
 * @returns {Promise<User>}
 */
async function insertUser(email, plainPassword) {
    const user = await db.transaction(async tQuery => {
        // check if a user already exists
        let stmt = 'SELECT * FROM users WHERE email = ?'
        let values = [email]
        /** @type [User] */
        let [user] = await tQuery(client => client.query(stmt, values));
        if (!user) {
            // no such user, create the user
            const userId = await nextNoFor('users')
            stmt = 'INSERT INTO users(user_id, email, hashed_password, confirmation_code) VALUES(?, ?, ?, ?) RETURNING *';
            values = [userId, email, hashPassword(plainPassword), generateConfirmationCode()];
            [user] = await tQuery(client => client.query(stmt, values));
            await sendConfirmationCodeEmailNotification(user);
            return user;
        }
        // user exists 
        if (user.confirmed) {
            // user exists and has been confirmed confirmed
            throw Error(`User with email ${email} already exists and has been confirmed. Consider resetting password`);
        }
        // user exists but has not yet been confirmed
        // We update the password and send new confirmation code
        stmt = 'UPDATE users SET hashed_password = ? WHERE email = ?';
        values = [hashPassword(plainPassword), email];
        await tQuery(client => client.query(stmt, values));
        // update confirmation code
        stmt = 'UPDATE users SET confirmation_code = ? WHERE email = ?';
        values = [generateConfirmationCode(), email];
        await tQuery(client => client.query(stmt, values));
        stmt = 'SELECT * FROM users WHERE email=?';
        values = [email];
        [user] = await tQuery(client => client.query(stmt, values));
        await sendConfirmationCodeEmailNotification(user);
        return user;
    });
    return user;
}



async function sendConfirmationCodeEmailNotification(user) {
    const { email, confirmation_code } = user
    await sendEmailNotification({
        recipientList: [email],
        ccList: [],
        subject: 'Confirmation Code',
        html: `<p>Your confirmaton code is ${confirmation_code}</p>`
    });
}


module.exports = {
    insertUser,
    confirmUserByEmail,
    selectUserByEmail
}