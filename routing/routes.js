const express = require('express');
const routes = express.Router();
const User = require("../models/user");
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn } = require('../src/middleware');
const Auction = require("../models/auction");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const passport = require("passport");

//Routing to all the pages.
//Route to the landing page
routes.get('/', (request, response) => {
    //Set up passport authentication         
    response.redirect("/register");
})


// start register 
routes.get("/register", (req, res) => {
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
            res.redirect('/auctions');
        })
    } catch (e) {
        //req.flash('error', e.message);
        res.redirect('register');
    }
}));

// end register

//Route to the login page
routes.get('/login', (request, response) => {
    response.render('users/login')

})


routes.post('/login', passport.authenticate('local', { failureRedirect: '/login' }), (req, res) => {
    //req.flash('success', 'welcome back!');    
    res.redirect("/auctions");
});

//Route to the logout page
routes.get("/logout", (req, res) => {
    req.logout();
    //req.flash("success","Goodbye!");
    res.redirect("/register");
});

//Route to the dashboard page
routes.get('/auctions', async (request, response) => {
    //If using mongoose, this issue can be solved by using
    //.lean() to get a json object (instead of a mongoose one):
    const auctions = await Auction.find({}).lean();
    response.render('auctions/index', { auctions });
})

//Route to the create an auction
routes.get('/auctions/new', async (request, response) => {
    response.render('auctions/new');
})

// create new auction form 
routes.post("/auctions", async (req, res) => {
    const auction = new Auction(req.body.auction);
    await auction.save();
    res.redirect(`/auctions/${auction._id}`)
});

// not working 
// edit auction in database and redirect to the same auction
routes.put("/auctions/:id", async (req, res) => {
    const { id } = req.params;
    console.log((id));
    console.log("one");
    const auction = await Auction.findByIdAndUpdate(id, { ...req.body.auction });
    console.log(auction);
    res.redirect(`/auctions/${auction._id}`)
});

// delete
routes.delete("/auctions/:id", async (req, res) => {
    const { id } = req.params;
    await Auction.findByIdAndDelete(id);
    res.redirect("/auctions");
})

// route to specific auction page
routes.get('/auctions/:id', async (request, response) => {
    const auction = await Auction.findById(request.params.id).lean();
    response.render('auctions/show', { id: auction._id, name: auction.name, price: auction.price, image: auction.image, description: auction.description });
})

// route to edit specific auction page
routes.get('/auctions/:id/edit', async (request, response) => {
    //const auction = await Auction.findById(request.params.id).lean();
    const auction = await Auction.findById(request.params.id);
    response.render('auctions/edit', { id: auction._id, name: auction.name, price: auction.price, image: auction.image, description: auction.description });
})



//Route to the dashboard page
routes.get('/dashboard', (request, response) => {
    response.send("Hello, from the dashboard page");
})


//Route to the sell product page
routes.get('/sell-product', (request, response) => {
    response.send("Hello, from the sell product page");
})


//Route for the logout page- This redirects to the signin page
routes.get('/logout', (request, response) => {
    response.redirect('/signin');
})


//exporting the router module.
module.exports = routes;