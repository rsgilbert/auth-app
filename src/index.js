const express = require('express')
const passport = require('passport');
const localStrategy = require('./auth/local-strategy.js')
const authRouter = require('./routes/auth-router.js');
const userRouter = require('./routes/user-router.js');
const morgan = require('morgan');
const cors = require('cors');
const session = require('express-session')
const { serializeUserHandler, deserializeUserHandler } = require('./auth/passport-handlers.js');
const { body } = require('express-validator');
const { logErrorHandler, handleError } = require('./routes/router-utils.js');

passport.use(localStrategy)
passport.serializeUser(serializeUserHandler)
passport.deserializeUser(deserializeUserHandler)
const app = express();

app.use(session({
    secret: 'abcdefg',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 1000 * 60 * 10, // expires in 10 mins
     } 
}))


app.use(morgan('tiny', { immediate: true })); // log the moment request hits the server
app.use(morgan('tiny'));
app.use(cors({
    credentials: true,
    origin: [/localhost/] // only localhost for now
}));
app.use(express.json());

app.use('/auth', authRouter);
app.use('/user', userRouter);

app.get('/', (req, res) => res.send('Success, running'));

app.get('/test', (req, res) => {
    console.log(req.headers.cookie)
    // res.setHeader('set-cookie', ['jackie=1234; samesite=none;'])
    res.cookie('melody', 'christmas')
    res.send("Test successful. App is running.")
});

// error handler middleware come last
app.use(logErrorHandler);
app.use(handleError);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('running on port', port));
app.listen(3003, ()=> console.log('also running on port 3003'))




