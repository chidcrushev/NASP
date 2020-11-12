const express   = require('express');
const routes    = express.Router();
const User 		= require("../models/user");
const passport  = require("passport");
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn } = require('../src/middleware');



//Routing to all the pages.
//Route to the landing page
routes.get('/', (request, response)=>{

    //Set up passport authentication
         
    response.redirect("/register"); 
})


// start register 
routes.get("/register" , (req,res) => {
	res.render("users/register");

});

routes.post('/register', catchAsync(async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
           // req.flash('success', 'Welcome!');
            res.redirect('/home');
        })
    } catch (e) {
        //req.flash('error', e.message);
        res.redirect('register');
    }
}));

// end register

//Route to the login page
routes.get('/login', (request, response)=>{
    response.render('users/login')

}) 


routes.post('/login', passport.authenticate('local', { failureRedirect: '/login' }), (req, res) => {
    //req.flash('success', 'welcome back!');    
    res.redirect("/home");
});

//Route to the logout page
routes.get("/logout", (req,res) => {
	req.logout();
	//req.flash("success","Goodbye!");
	res.redirect("/register");
} )


//Route to the home page
routes.get('/home' ,(request, response)=>{
    response.render('home');

}) 


//Route to the dashboard page
routes.get('/dashboard', (request,response)=>{
    response.send("Hello, from the dashboard page");
})


//Route to the sell product page
routes.get('/sell-product', (request, response)=>{
    response.send("Hello, from the sell product page");
})


//Route for the logout page- This redirects to the signin page
routes.get('/logout', (request,response)=>{
    response.redirect('/signin');
})


//exporting the router module.
module.exports= routes;