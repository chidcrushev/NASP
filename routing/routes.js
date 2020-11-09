const express   = require('express');
const routes    = express.Router();

//Routing to all the pages.
//Route to the landing page
routes.get('/', (request, response)=>{

    //Set up passport authentication
         
    response.redirect("/signin"); 
})



//Route to the login page
routes.get('/signin', (request, response)=>{
    response.render('login')

}) 


//Route to the signup page
routes.get('/signup', (request, response)=>{
    response.render('signup');

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