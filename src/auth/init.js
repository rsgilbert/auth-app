const bcrypt = require('bcryptjs');
const passport = require('passport');
const query = require('../query.js');

const LocalStrategy = require('passport-local').Strategy;

// const user = {
//     email: 'pypie@python.org',
//     hashedPassword: 'pingpong'
// }

function initPassportLocalStrategy() {
    passport.use(new LocalStrategy(async (username, password, done) => {
        try {
            const rows = await query(client => {
                const stmt = 'SELECT * FROM users WHERE email = $1'
                const values = [username]
                return client.query(stmt, values);
            });
            console.log(rows);
            if (!rows.length) {
                return done(null, false);
            }
            // a row was found
            const firstRow = rows[0]
            console.log(firstRow)
            const isPasswordCorrect = passwordMatch(password, firstRow.hashed_password);
            return isPasswordCorrect ? done(null, firstRow) : done(null, false)
        }
        catch (e) { done(e) }
    })
    );
}


async function passwordMatch(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
}

module.exports.initPassportLocalStrategy = initPassportLocalStrategy;