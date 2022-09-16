const express = require('express')
const passport = require('passport');
const bearerStrategy = require('./auth/bearer-strategy.js');
const localStrategy = require('./auth/local-strategy.js')
const authRouter = require('./routes/auth-router.js');
const userRouter = require('./routes/user-router.js');
const morgan = require('morgan');
const cors = require('cors');
const session = require('express-session')
const { serializeUserHandler, deserializeUserHandler } = require('./auth/passport-handlers.js');
const { body } = require('express-validator');
const { expressValidatorHandler, checkAuthenticationHandler, logErrorHandler, handleError } = require('./routes/router-utils.js');

passport.use(localStrategy)
passport.use(bearerStrategy);
passport.serializeUser(serializeUserHandler)
passport.deserializeUser(deserializeUserHandler)
const app = express();

app.use(session({
    secret: 'abcdefg',
    resave: false,
    saveUninitialized: false,
    cookie:{maxAge: 1000 * 60 * 10 } // expires in 10 mins
}))


app.use(morgan('tiny', { immediate: true })); // log the moment request hits the server
app.use(morgan('tiny'));
app.use(cors());
app.use(express.json());

app.use('/auth', authRouter);
app.use('/user', userRouter);

app.get('/', (req, res) => res.send('Success, running'));

app.get('/test', (req, res) => {
    console.log(req.headers.cookie)
    console.log(req.user)
    res.send("Test successful. App is running. Cookies are " + JSON.stringify(req.headers.cookie))
});



// error handler middleware come last
app.use(logErrorHandler);
app.use(handleError);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('running on port', port));




