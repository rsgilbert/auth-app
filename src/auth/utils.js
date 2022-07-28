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
    const publicKey = fs.readFileSync('./keys/public-key.pem').toString();
    return jwt.verify(token, publicKey);
}

function generateToken(payload) {
    const privateKey = fs.readFileSync('./keys/private-key.pem').toString();
    return jwt.sign(payload, privateKey, { algorithm: 'RS256', expiresIn: '1h' });
}

function hashPassword(plainPassword) {
    return bcrypt.hashSync(plainPassword, 10);
}

function passwordMatch(plainPassword, hashedPassword) {
    return bcrypt.compareSync(plainPassword, hashedPassword);
}

function generateConfirmationCode() {
    return `${randomDigit()}${randomDigit()}${randomDigit()}${randomDigit()}`;
}

function randomDigit() {
    return Math.floor(Math.random() * 10);
}

module.exports = {
    decodeToken, 
    generateToken,
    passwordMatch,
    hashPassword,
    generateConfirmationCode
}

