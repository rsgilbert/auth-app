const express = require('express');
const passport = require('passport');


const userRouter = express.Router();
userRouter.use(passport.authenticate('bearer'));

userRouter.get('/user', (req, res) => {
    res.send('user');
});



module.exports = userRouter;