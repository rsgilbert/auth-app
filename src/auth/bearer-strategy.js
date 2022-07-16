const query = require('../query.js');
const { Strategy: BearerStrategy } = require('passport-http-bearer');
const { decodeToken } = require('./utils.js');


const bearerStrategy = new BearerStrategy({}, async (token, done) => {
    try {
        const contents = decodeToken(token);
        const userId = contents['user_id'];
        const stmt = 'SELECT user_id, email FROM users WHERE user_id = $1'
        const values = [userId];
        const [user] = await query(client => client.query(stmt, values));
        if (!user) {
            throw Error(`No user with user_id ${userId}`)
        }
        console.log(user)
        return done(null, user, contents);
    }
    catch (e) {
        // console.log('there was an error', e)
        done(e, false)
    }
});



module.exports = bearerStrategy;