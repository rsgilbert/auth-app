const express = require('express');
const {passwordMatch} = require('../auth/utils');
const {
    selectUserByEmail,
    generateUserToken,
    insertUser,
    confirmUserByEmail
} = require('../services/user/user-service.js');
const userService = require('../services/user/user-service');
const {body, validationResult} = require('express-validator');

const authRouter = express.Router();

// full path will be /auth/login
// Creates and returns a refresh token that the user can use to request for access/auth tokens
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
                const refreshToken = await userService.createRefreshToken(user);
                console.log('refresh token is', refreshToken)
                return res.send(refreshToken);
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
            return res.end();
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
            return res.end();
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

authRouter.post("/auth-token",
    body("refresh_token").isLength({min: 5}),
    async function (req, res) {
    const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }
        try {
            const refreshToken = req.body['refresh_token']
            const authToken = await userService.createAuthToken(refreshToken)
            return res.send(authToken)
        } catch (e) {
            res.statusCode = 500;
            res.statusMessage = e.message;
            return res.send(e.message);
        }
    });


module.exports = authRouter;





