const express = require('express');


const authRouter = express.Router();

authRouter.post('/login', (req, res) => {
    res.send('login')
});

authRouter.post('/signup', (req, res) => {
    res.send('signup')
});

authRouter.post('/signout', (req, res) => {
    res.send('signout')
});


module.exports = authRouter;