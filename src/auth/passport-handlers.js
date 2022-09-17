/**
 * 
 * @param {Express.User} user 
 * @param {(err: any, id?: any) => void} cb 
 */
async function serializeUserHandler(user, cb) {
    cb(null, user)
}

/**
 * 
 * @param {Express.User} user 
 * @param {(err: any, id?: any) => void} cb 
 */
 async function deserializeUserHandler(user, cb) {
    cb(null, user)
}


module.exports = {
    serializeUserHandler,
    deserializeUserHandler
}
