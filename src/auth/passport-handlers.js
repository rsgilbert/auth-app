const passport = require('passport')

/**
 * 
 * @param {Express.User} user 
 * @param {(err: any, id?: any) => void} cb 
 */
async function serializeUserHandler(user, cb) {
    console.log('serializing user', user)
    cb(null, user)
}

/**
 * 
 * @param {Express.User} user 
 * @param {(err: any, id?: any) => void} cb 
 */
 async function deserializeUserHandler(user, cb) {
    console.log('deserializing user', user)
    cb(null, user)
}


module.exports = {
    serializeUserHandler,
    deserializeUserHandler
}
