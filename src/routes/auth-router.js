const express = require('express');
const { hashPassword, generateToken, passwordMatch, confirmationCode } = require('../auth/utils');
const query = require('../query');


const authRouter = express.Router();

authRouter.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await selectUserByEmail(email);
        const isPasswordMatch = passwordMatch(password, user['hashed_password']);
        if(isPasswordMatch) {
            return res.send(generateUserToken(user));
        }
        else {
            res.statusCode = 401;
            res.statusMessage = 'Wrong password';
            return res.send('Wrong password');
        }
    }
    catch (e) {
        res.statusCode = 500;
        res.statusMessage = e.message;
        return res.send(e.message);
    }
}); 

authRouter.post('/signup', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await insertUser(email, password);
        // console.log(user);
        res.statusCode = 201;
        return res.json({});
    }
    catch (e) {
        res.statusCode = 500;
        res.statusMessage = e.message;
        return res.send(e.message);
    }
});

authRouter.post('/confirm', async (req, res) => {
    try {
        const { confirmationCode, email } = req.body;
        let user = await selectUserByEmail(email);
        console.log(user);
        if(user.confirmed) {
            return res.end();
        }
        if(user.confirmation_code === confirmationCode) {
            user = confirmUserByEmail(email);
            return res.send(generateUserToken(user));
        }
        else {
            res.statusCode = 400;
            res.statusMessage = 'Wrong confirmation code';
            return res.send('Wrong confirmation code');
        }
    }
    catch (e) {
        res.statusCode = 500;
        res.statusMessage = e.message;
        return res.send(e.message);
    }
});

function generateUserToken(user) {
    return generateToken({ user_id: user['user_id'], email: user['email'] });
}

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
    const userId = new Date().getTime();
    const stmt = 'INSERT INTO users(user_id, email, hashed_password, confirmation_code) VALUES($1, $2, $3, $4) RETURNING *';
    const values = [userId, email, hashPassword(plainPassword), confirmationCode()];
    const [user] = await query(client => client.query(stmt, values));
    return user;
}



module.exports = authRouter;





