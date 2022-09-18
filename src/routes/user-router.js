const express = require('express');
const passport = require('passport');
const { checkAuthenticationHandler } = require('./router-utils');


const userRouter = express.Router();
userRouter.use(passport.authenticate('session'))
userRouter.use(checkAuthenticationHandler)

userRouter.get('/', (req, res) => {
    res.send(req.user);
});


module.exports = userRouter;