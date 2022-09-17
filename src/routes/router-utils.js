const {validationResult} = require("express-validator");

function expressValidatorHandler(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }
    next();
}

const checkAuthenticationHandler = (req, res, next) => {
    if(req.isAuthenticated()) {
        return next()
    }
    res.statusCode = 401
    return res.send('Not authenticated')
}


const logErrorHandler = (err, req, res, next) => {
    console.error(err.stack)
    next(err);
}

const handleError = (err, req, res, next) => {
    res.statusCode = 500;
    res.json({ error: err.message });
}

module.exports = {
    checkAuthenticationHandler,
    logErrorHandler,
    handleError,
    expressValidatorHandler
}