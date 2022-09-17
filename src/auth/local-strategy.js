const db = require('../db.js')

const { Strategy: LocalStrategy } = require('passport-local')
const { passwordMatch } = require('./utils')
const { selectUserByEmail } = require('../services/user/user-service.js')

const localStrategy = new LocalStrategy({
    usernameField: 'email' // client supplies email field in request body
}, async (username, password, done) => {
    try{
        const user = await selectUserByEmail(username)
        if(!user.confirmed) {
            throw Error('User is not confirmed')
        }
        const isMatch = passwordMatch(password, user.hashed_password)
        if(!isMatch) throw Error('Wrong password')
        return done(null, user)
    }
    catch(e) {
        done(e, false)
    }
})

module.exports = localStrategy