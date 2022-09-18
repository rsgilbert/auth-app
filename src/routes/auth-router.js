const express = require('express');
const {
    selectUserByEmail,
    insertUser,
    confirmUserByEmail
} = require('../services/user/user-service.js');
const { body } = require('express-validator');
const passport = require('passport');
const { expressValidatorHandler } = require('./router-utils');
const http = require('@passioncloud/http');

const authRouter = express.Router();

authRouter.post('/login',
    body("email").isEmail(),
    body("password").isLength({ min: 2 }),
    expressValidatorHandler,
    passport.authenticate('local'), async (req, res) => {
        // let userCookie = `user=${JSON.stringify(req.user)}`
        // res.setHeader('set-cookie', userCookie)
        res.status(http.statusCodes.OK).json({})
    })

authRouter.post('/signup',
    body("email").isEmail(),
    body("password").isLength({ min: 5 }),
    expressValidatorHandler,
    async (req, res, next) => {
        try {
            const { email, password } = req.body;
            await insertUser(email, password);
            res.statusCode = http.statusCodes.CREATED;
            return res.end();
        } catch (e) {
            next(e)
        }
    });

authRouter.post('/confirm',
    body("email").isEmail(),
    body("confirmation_code").isLength({ min: 4, max: 4 }),
    expressValidatorHandler,
    async (req, res, next) => {
        try {
            const { email, confirmation_code } = req.body
            await confirmUserByEmail(email, confirmation_code)
            res.status(http.statusCodes.OK).end()
        } catch (e) {
            next(e)
        }
    });

authRouter.post("/logout",
    passport.session(),
    async (req, res, next) => {
        req.logOut(err => {
            if (err) next(err)
        })
        res.status(http.statusCodes.NO_CONTENT).end()
    })


module.exports = authRouter;





