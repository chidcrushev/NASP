
//Install the Dependencies
const express = require('express');
const path = require('path');
const app = express();
const http = require('http').createServer(app);
const session = require('express-session');
const bodyParser = require('body-parser');
const port = process.env.PORT || 2000; // used
const router = require('../routing/routes');
const hbs = require('express-handlebars');
const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("../models/user");
const methodOverride = require("method-override");

// mongo DB
mongoose.connect('mongodb://localhost:27017/NASP_DB', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false

});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});
// end mongo DB


// Static folder
console.log(__dirname)
app.use(express.static(path.join(__dirname, 'src'), { extensions: ['html', 'htm'] }));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));


const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
}

app.use(session(sessionConfig))

// passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// end passport 

app.use((req, res, next) => {
    //console.log(req.session);
    res.locals.currentUser = req.user;
    next();
})


//Handling cache and cookies
app.use('/*', (req, res, next) =>{
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    next();
});



//Setting up handlebars.
app.engine('hbs', hbs({
    extname: 'hbs',
    defaultLayout: path.join(__dirname, './views/main'),
    partialsDir: [
        //  path to your partials
        path.join(__dirname, 'views/partials'),
    ]
}))

//Setting up routing
app.use('/', router);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Start the server on port 2000
http.listen(port, () => {
    console.log(`Server is listening on port ${port}`)
});


