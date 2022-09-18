const {validationResult} = require("express-validator");
const http = require('@passioncloud/http')


function expressValidatorHandler(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const firstError = errors.array()[0]
        console.log(firstError)
        const msg = `Validation Error: ${firstError.param} -> ${firstError.msg}`
        return res.status(http.statusCodes.BAD_REQUEST).json({error: msg});
    }
    next();
}

const checkAuthenticationHandler = (req, res, next) => {
    if(req.isAuthenticated()) {
        return next()
    }
    res.statusCode = http.statusCodes.UNAUTHORIZED
    return res.send('Not authenticated')
}


const logErrorHandler = (err, req, res, next) => {
    console.error(err.stack)
    next(err);
}

const handleError = (err, req, res, next) => {
    res.statusCode = http.statusCodes.INTERNAL_SERVER_ERROR
    res.json({ error: err.message });
}

module.exports = {
    checkAuthenticationHandler,
    logErrorHandler,
    handleError,
    expressValidatorHandler
}