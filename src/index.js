const express = require('express')
const passport = require('passport');
const { initPassportLocalStrategy } = require('./auth/init.js');



const app = express();
initPassportLocalStrategy();

app.use(passport.initialize());

app.get('/', (req, res) => res.send('Success, running'));
app.get('/users', authenticationMiddleware(), (req, res) => {
    res.send('This is users page')
})


function authenticationMiddleware() {
    return function(req, res, next) {
        console.log('checking')
        if(req.isAuthenticated()) {
            return next();
        }
        res.statusCode = 401;
        return res.send('You are not authenticated');
    }
};

const port = process.env.PORT || 3000;
app.listen(port, ()=> console.log('running on port', port));