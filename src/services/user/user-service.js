
const { hashPassword, generateConfirmationCode } = require('../../auth/utils.js');
const  { query } = require('../../db.js');
const db = require('../../db.js');
const { sendEmailNotification } = require('../mail/mail-service.js');


// to be moved to a user service
async function selectUserByEmail(email) {
    const stmt = 'SELECT * FROM users WHERE email = ?';
    const values = [email];
    const [user] = await query(client => client.query(stmt, values));
    if(!user) throw Error('No user with email ' + email);
    return user;
}

async function confirmUserByEmail(email) {
    let stmt = 'UPDATE users SET confirmation_code = ? WHERE email = ?';
    let values = ['', email];
    await query(c => c.query(stmt, values));
    stmt = 'UPDATE users SET confirmed = true WHERE email = ?';
    values = [email];
    await query(c => c.query(stmt, values));
    stmt = 'SELECT * FROM users WHERE email = ?';
    values = [email];
    const [user] = await query(c => c.query(stmt, values));
    return user;
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
        if(!user) {
            // no such user, create the user
            const userId = new Date().getTime().toString();
            stmt = 'INSERT INTO users(user_id, email, hashed_password, confirmation_code) VALUES(?, ?, ?, ?) RETURNING *';
            values = [userId, email, hashPassword(plainPassword), generateConfirmationCode()];
            [user] = await tQuery(client => client.query(stmt, values));
            await sendConfirmationCodeEmailNotification(user);
            return user;
        }
        if(user?.confirmed) {
            throw Error(`User with email ${email} already exists and has been confirmed. Consider resetting password`);
        }
        if(user?.confirmed === false) {
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
        }
        throw Error('Illegal state');
    });
    console.log('inserted user', user);
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