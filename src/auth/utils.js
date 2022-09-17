const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const random = require('random')

function hashPassword(plainPassword) {
    return bcrypt.hashSync(plainPassword, 10);
}

function passwordMatch(plainPassword, hashedPassword) {
    return bcrypt.compareSync(plainPassword, hashedPassword);
}

function generateConfirmationCode() {
    // @ts-ignore
    return random.int(1000, 9999).toString()
}


module.exports = {
    passwordMatch,
    hashPassword,
    generateConfirmationCode
}

