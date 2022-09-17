const express = require('express');
const {
    selectUserByEmail,
    insertUser,
    confirmUserByEmail
} = require('../services/user/user-service.js');
const { body } = require('express-validator');
const passport = require('passport');
const { expressValidatorHandler } = require('./router-utils');
const http = require('@passioncloud/http')

const authRouter = express.Router();

authRouter.post('/login',
    body("email").isEmail(),
    body("password").isLength({ min: 2 }),
    expressValidatorHandler,
    passport.authenticate('local'),
    async (req, res) => {
        console.log(req.user)
        return res.send('successfully logged in')
    })

authRouter.post('/signup',
    body("email").isEmail(),
    body("password").isLength({ min: 5 }),
    expressValidatorHandler,
    async (req, res) => {
        try {
            const { email, password } = req.body;
            await insertUser(email, password);
            res.statusCode = http.statusCodes.CREATED;
            return res.end();
        } catch (e) {
            res.statusCode = http.statusCodes.BAD_REQUEST;
            return res.send(e.message);
        }
    });

authRouter.post('/confirm',
    body("email").isEmail(),
    body("confirmation_code").isLength({ min: 4, max: 4 }),
    expressValidatorHandler, 
    async (req, res) => {
        try {
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
                res.statusCode = http.statusCodes.BAD_REQUEST;
                return res.send('Wrong confirmation code');
            }
        } catch (e) {
            res.statusCode = http.statusCodes.INTERNAL_SERVER_ERROR;
            return res.send(e.message);
        }
    });

authRouter.post("/logout", 
    passport.session(), 
    async (req, res, next) => {
    req.logOut(err => {
        if(err) next(err)
    })
    res.status(http.statusCodes.NO_CONTENT).end()
})


module.exports = authRouter;





