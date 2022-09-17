const db = require('../db.js')

const { Strategy: LocalStrategy } = require('passport-local')
const { passwordMatch } = require('./utils')

const localStrategy = new LocalStrategy({
    usernameField: 'email' // client supplies email field in request body
}, async (username, password, done) => {
    try{
        const stmt = 'SELECT * FROM users WHERE email = ?'
        const values = [username]
        /** @type {User[]} */
        const [user] = await db.query(client => client.query(stmt, values))
        if(!user) {
            throw Error('No user found with email ' + username)
        }
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