const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

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

function decodeToken(token) {
    const publicKey = fs.readFileSync(path.join(__dirname, 'keys/public-key.pem')).toString();
    return jwt.verify(token, publicKey);
}

async function passwordMatch(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
}

module.exports = {
    decodeToken, 
    passwordMatch
}

