const db = require('../db.js')

const { Strategy: LocalStrategy } = require('passport-local')
const { passwordMatch } = require('./utils')

const localStrategy = new LocalStrategy({
    usernameField: 'email' // client supplies email field in request body
}, async (username, password, done) => {
    try{
        console.log('running local strategy')
        const stmt = 'SELECT * FROM users WHERE email = $1'
        const values = [username]
        /** @type {User[]} */
        const [user] = await db.query(client => client.query(stmt, values))
        if(!user) {
            throw Error('No user found with email ' + username)
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