const express = require('express');
const {passwordMatch} = require('../auth/utils');
const {
    selectUserByEmail,
    generateUserToken,
    insertUser,
    confirmUserByEmail
} = require('../services/user/user-service.js');
const {body, validationResult} = require('express-validator');

const authRouter = express.Router();

// full path will be /auth/login
authRouter.post('/login',
    body("email").isEmail(),
    body("password").isLength({min: 2}),
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({errors: errors.array()});
            }
            const {email, password} = req.body;
            const user = await selectUserByEmail(email);
            const isPasswordMatch = passwordMatch(password, user['hashed_password']);
            if (isPasswordMatch) {
                return res.send(generateUserToken(user));
            } else {
                res.statusCode = 401;
                res.statusMessage = 'Wrong password';
                return res.send('Wrong password');
            }
        } catch (e) {
            res.statusCode = 500;
            res.statusMessage = e.message;
            return res.send(e.message);
        }
    });

authRouter.post('/signup',
    body("email").isEmail(),
    body("password").isLength({min: 5}),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }
        try {
            const {email, password} = req.body;
            const user = await insertUser(email, password);
            // console.log(user);
            res.statusCode = 201;
            return res.json({});
        } catch (e) {
            res.statusCode = 400;
            res.statusMessage = e.message;
            return res.send(e.message);
        }
    });

authRouter.post('/confirm', async (req, res) => {
    try {
        const {confirmationCode, email} = req.body;
        let user = await selectUserByEmail(email);
        console.log(user);
        if (user.confirmed) {
            return res.end();
        }
        if (user.confirmation_code === confirmationCode) {
            user = confirmUserByEmail(email);
            return res.send(generateUserToken(user));
        } else {
            res.statusCode = 400;
            res.statusMessage = 'Wrong confirmation code';
            return res.send('Wrong confirmation code');
        }
    } catch (e) {
        res.statusCode = 500;
        res.statusMessage = e.message;
        return res.send(e.message);
    }
});


module.exports = authRouter;





