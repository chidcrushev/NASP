//Importing the libraries
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

//Importing the UserModel
const userModel = require('../models/user');

//Establishing the session in the browser
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    const user = await userModel.findById(id);
    done(null, user);
});


//Passport Signin
passport.use('signin', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true    
}, async (req, email, password, done) => {
    
    const user = await userModel.findOne({email:email});
  
     //Checks whether there is an user with the email id
     if(!user) {
        console.log("User not found") ;
        return done(null, false, {errorSignInMsg :'Invalid email. Please try again!' })

    }
    //Checks whether the password is correct or not
    if (user){
        console.log(user);
       if(user.password != password)
         return done(null, false, {errorSignInMsg: 'Password wrong. Please Try again!'})
    }
    done(null, user);
    return;
}));


module.exports = passport;