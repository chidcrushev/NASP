const express = require('express');
const routes = express.Router();
const User = require("../models/user");
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn } = require('../src/middleware');
const Auction = require("../models/Auction");
const Review = require("../models/review");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const passport = require("passport");
const hbs = require('express-handlebars');

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
            res.redirect('/auctions');
        })
    } catch (e) {
        res.redirect('register');
    }
}));

// end register

//Route to the login page
routes.get('/login', (request, response) => {
    response.render('users/login')

});

// login form 
routes.post('/login', passport.authenticate('local', { failureRedirect: '/login' }), (req, res) => {
    res.redirect("/auctions");
});


//Route to the dashboard page
routes.get('/auctions', isLoggedIn, async (request, response) => {
    //If using mongoose, this issue can be solved by using
    //.lean() to get a json object (instead of a mongoose one):
    const auctions = await Auction.find({}).lean();
    response.render('auctions/index', { auctions, username: request.user.username });
})

//Route to the create an auction
routes.get('/auctions/new', isLoggedIn, async (request, response) => {
    response.render('auctions/new');
})

// create new auction form 
routes.post("/auctions", async (req, res) => {
    const auction = new Auction(req.body.auction);
    auction.owner = req.user._id;

    //Store empty values initially.
    auction.highestBid = Number("0");
    auction.highestBidderName = "None"

    //Checks the days value.
    let now = new Date();
    now.setDate(now.getDate() + Number(auction.setTime));


    //Store the time
    auction.setTime = now;
    await auction.save();

    //Check whether the logged in user is the auctioneer- If so, the auctioneer can't participate in the auction.

    res.redirect(`/auctions/${auction._id}`)
});

// categories 

// route to specific books
routes.get('/auctions/car', isLoggedIn, async (request, response) => {
    const auctions = await Auction.find({ category: "car" }).lean();
    response.render('auctions/index', { auctions, username: request.user.username });
});

// route to electronics
routes.get('/auctions/electronic', isLoggedIn, async (request, response) => {
    const auctions = await Auction.find({ category: "electronic" }).lean();
    response.render('auctions/index', { auctions, username: request.user.username });
});

// route to specific books
routes.get('/auctions/fashion', isLoggedIn, async (request, response) => {
    const auctions = await Auction.find({ category: "fashion" }).lean();
    response.render('auctions/index', { auctions, username: request.user.username });
});

// route to electronics
routes.get('/auctions/hobbies', isLoggedIn, async (request, response) => {
    const auctions = await Auction.find({ category: "hobbies" }).lean();
    response.render('auctions/index', { auctions, username: request.user.username });
});

// route to specific books
routes.get('/auctions/home', isLoggedIn, async (request, response) => {
    const auctions = await Auction.find({ category: "home" }).lean();
    response.render('auctions/index', { auctions, username: request.user.username });
});

// route to electronics
routes.get('/auctions/kitchen', isLoggedIn, async (request, response) => {
    const auctions = await Auction.find({ category: "kitchen" }).lean();
    response.render('auctions/index', { auctions, username: request.user.username });
});

// done categories


// edit auction in database and redirect to the same auction
routes.put("/auctions/:id", isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const auct = await Auction.findById(id);
    var user_id = JSON.stringify(req.user._id);
    var owner_id = JSON.stringify(auct.owner._id);
    console.log("equal", (owner_id == user_id))
    if (!(owner_id == user_id)) {
        return res.redirect(`/auctions/${id}`);
    }
    const auction = await Auction.findByIdAndUpdate(id, { ...req.body.auction });
    console.log("Invoked")
    console.log(auction)
    res.redirect(`/auctions/${auction._id}`)
});


//Submit the bid price and redirect to the same auction
routes.put("/auctions/:id/updateBid", isLoggedIn, async (req, res) => {
    console.log("Involed");
    const { id } = req.params;
    const auct = await Auction.findById(id);
    var user_id = JSON.stringify(req.user._id);
    var owner_id = JSON.stringify(auct.owner._id);
    if ((owner_id == user_id)) {
        return res.redirect(`/auctions/${id}`);
    }
    const auction = await Auction.findByIdAndUpdate(id, { ...req.body.auction });
    console.log("Invoked")
    console.log(auct)
    res.redirect(`/auctions/${auction._id}`)
});



// delete auction
routes.delete("/auctions/:id", isLoggedIn, async (req, res) => {
    const { id } = req.params;
    await Auction.findByIdAndDelete(id);
    res.redirect("/auctions");
})

// delete auction
routes.delete("/auctions/:id/:reviewId", isLoggedIn, async (req, res) => {
    const { id, reviewId } = req.params;
    await Auction.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/auctions/${id}`);
});

// create a review 
routes.post("/auctions/:id/reviews", isLoggedIn, catchAsync(async (req, res) => {
    const auction = await Auction.findById(req.params.id);
    const review = new Review(req.body.review);
    review.owner = req.user._id;
    auction.reviews.push(review);
    await review.save();
    await auction.save();
    res.redirect(`/auctions/${auction._id}`);
}));



// route to specific auction page
routes.get('/auctions/:id', isLoggedIn, async (request, response) => {
    const auction = await Auction.findById(request.params.id).lean().populate({
        path: "reviews", populate: {
            path: "owner"
        }
    }).populate("owner");
    var user_id = JSON.stringify(request.user._id);
    var owner_id = JSON.stringify(auction.owner._id);
    response.render('auctions/show', { auction: auction, ownerid: owner_id, username: request.user.username, id: user_id });
});

// route to edit specific auction page
routes.get('/auctions/:id/edit', isLoggedIn, async (request, response) => {
    //const auction = await Auction.findById(request.params.id).lean();
    const auction = await Auction.findById(request.params.id);
    response.render('auctions/edit', { id: auction._id, name: auction.name, price: auction.price, image: auction.image, description: auction.description });
});





//Route to the logout page
routes.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/login");
});


var handel = hbs.create({});

handel.handlebars.registerHelper({
    eq: (v1, v2) => v1 == v2,
    ne: (v1, v2) => v1 !== v2,
    lt: (v1, v2) => v1 < v2,
    gt: (v1, v2) => v1 > v2,
    lte: (v1, v2) => v1 <= v2,
    gte: (v1, v2) => v1 >= v2,
    and() {
        return Array.prototype.every.call(arguments, Boolean);
    },
    or() {
        return Array.prototype.slice.call(arguments, 0, -1).some(Boolean);
    }
});

//exporting the router module.
module.exports = routes;