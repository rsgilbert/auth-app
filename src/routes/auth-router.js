const express = require('express');
const { passwordMatch } = require('../auth/utils');
const {
    selectUserByEmail,
    insertUser,
    confirmUserByEmail
} = require('../services/user/user-service.js');
const userService = require('../services/user/user-service');
const { body, validationResult } = require('express-validator');
const passport = require('passport');
const { expressValidatorHandler } = require('./router-utils');

const authRouter = express.Router();

authRouter.post('/login',
    body("email").isEmail(),
    body("password").isLength({ min: 2 }),
    expressValidatorHandler,
    passport.authenticate('local'),
    function (req, res) {
        console.log(req.user)
        return res.send('successfully logged in')
    })

authRouter.post('/signup',
    body("email").isEmail(),
    body("password").isLength({ min: 5 }),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const { email, password } = req.body;
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

authRouter.post('/confirm',
    body("email").isEmail(),
    body("confirmation_code").isLength({ min: 4, max: 4 }), async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const { confirmation_code, email } = req.body;
            let user = await selectUserByEmail(email);
            console.log(user);
            if (user.confirmed) {
                return res.end();
            }
            if (user.confirmation_code === confirmation_code) {
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



module.exports = authRouter;





