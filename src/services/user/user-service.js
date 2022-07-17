
const { hashPassword, generateToken, generateConfirmationCode } = require('../../auth/utils.js');
const  { query } = require('../../db.js');
const db = require('../../db.js');
const { sendEmailNotification } = require('../mail/mail-service.js');


function generateUserToken(user) {
    return generateToken({ user_id: user['user_id'], email: user['email'] });
}
// to be moved to a user service
async function selectUserByEmail(email) {
    const stmt = 'SELECT * FROM users WHERE email = $1';
    const values = [email];
    const [user] = await query(client => client.query(stmt, values));
    if(!user) throw Error('No user with email ' + email);
    return user;
}

async function confirmUserByEmail(email) {
    let stmt = 'UPDATE users SET confirmation_code = $1 WHERE email = $2';
    let values = ['', email];
    await query(c => c.query(stmt, values));
    stmt = 'UPDATE users SET confirmed = true WHERE email = $1';
    values = [email];
    await query(c => c.query(stmt, values));
    stmt = 'SELECT * FROM users WHERE email = $1';
    values = [email];
    const [user] = await query(c => c.query(stmt, values));
    return user;
}

async function insertUser(email, plainPassword) {
    const user = await db.transaction(async tQuery => {
        const userId = new Date().getTime();
        const stmt = 'INSERT INTO users(user_id, email, hashed_password, confirmation_code) VALUES($1, $2, $3, $4) RETURNING *';
        const values = [userId, email, hashPassword(plainPassword), generateConfirmationCode()];
        const [user] = await tQuery(client => client.query(stmt, values));
        await sendConfirmationCodeEmailNotification(user);
        return user;
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
        html: `<p>Your confirmaton code is ${confirmation_code}`
    });
}


module.exports = {
    insertUser,
    confirmUserByEmail,
    selectUserByEmail,
    generateUserToken
}