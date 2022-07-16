const express = require('express');
const passport = require('passport');


const userRouter = express.Router();
userRouter.use(passport.authenticate('bearer', { session: false }));

userRouter.get('/user', (req, res) => {
    console.log(req);
    res.send(req.user);
});



module.exports = userRouter;