const passport = require('passport')

/**
 * 
 * @param {Express.User} user 
 * @param {(err: any, id?: any) => void} cb 
 */
async function serializeUserHandler(user, cb) {
    console.log('serializing user', user)
    process.nextTick(() => cb(null, {
        id: 'james_id',
        username: 'gil',
        picture: 'http://x'
    }))
}

/**
 * 
 * @param {Express.User} user 
 * @param {(err: any, id?: any) => void} cb 
 */
 async function deserializeUserHandler(user, cb) {
    console.log('deserializing user', user)
    process.nextTick(() => cb(null, user))
}


module.exports = {
    serializeUserHandler,
    deserializeUserHandler
}
