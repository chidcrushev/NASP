const express = require('express');
const routes = express.Router();
const User = require("../models/user");
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn } = require('../src/middleware');
const Auction = require("../models/Auction");
const Review = require("../models/review");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const hbs = require('express-handlebars');
const passport = require("../models/passport-auth");


//Routing to all the pages.
//Route to the landing page
routes.get('/', (request, response) => {
    //Set up passport authentication         
    response.redirect("/register");
})

// start register 
routes.get("/register", (req, res) => {
    res.render("users/register1");
});

routes.post('/register', catchAsync(async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username, password });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            res.redirect('/auctions');
        })
    } catch (e) {

        //Throw the error messages - Username taken already, Email already exists, Invalid password.

        //Retrieve the form details.
        const email = req.body.email;


        let query = { email: email };


        User.findOne(query, (err, user) => {

            if (err) {
                console.log("DataBase connection Error or Invalid Query")
            }


            //If User found- send a flash message stating "Email-id already exists"
            if (user) {
                res.render('users/register1', {
                    message: "Email already exists. Try another!",
                    error: true

                })
            }

            if (user == null) {
                res.render('users/register1', {
                    message: "Username taken already!",
                    error: true

                })
            }
        })

    }
}));


//Route to the login page
routes.get('/login', (request, response) => {
    response.render('users/login1')

});

// // login form 
// routes.post('/login', passport.authenticate('local', { 
//   failureRedirect: '/login',
//   failureMsg: "Invalid Password/username",
//   failure: true
// }), 
//     (req, res) => {
//     res.redirect("/auctions");
// });



routes.post('/login', (req, res, next) => {

    passport.authenticate('signin', (err, user, info) => {

        if (!user) {
            return res.render('users/login1', {
                failureMsg: info.errorSignInMsg,
                failure: true
            })
        }

        req.logIn(user, (err) => {
            res.redirect('/auctions');
        });

    })(req, res, next);

}, (err, req, res, next) => {
    // failure in login route
    // res.statusMessage = err.message;
    // return res.status(400).send();


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
    auction.highestBidderName = "----"
    auction.status = "open"
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
    if (!(owner_id == user_id)) {
        return res.redirect(`/auctions/${id}`);
    }
    const auction = await Auction.findByIdAndUpdate(id, { ...req.body.auction });
    res.redirect(`/auctions/${auction._id}`)
});


//Submit the bid price and redirect to the same auction
routes.put("/auctions/:id/updateBid", isLoggedIn, async (req, res) => {
    const { id } = req.params;
    const highestBid = req.body.auction;
    console.log(req.user);
    const auction = await Auction.findByIdAndUpdate(id, { highestBidderName: req.user.email, highestBid: highestBid.highestBid });
    res.redirect(`/auctions/${auction._id}`)
});

// search bar  // depends on title only 
routes.get("/search", isLoggedIn, async (req, res) => {
    const searchField = req.query.search;
    Auction.find({ title: { $regex: searchField, $options: '$i' } }).lean()
        .then(data => {
            auctions = data;
            res.render('auctions/index', { auctions, username: req.user.username });
        })
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

// sell auction
routes.get('/auctions/:id/sell', isLoggedIn, async (request, response) => {
    const auction = await Auction.findById(request.params.id).lean().populate({
        path: "reviews", populate: {
            path: "owner"
        }
    }).populate("owner");
    var user_id = JSON.stringify(request.user._id);
    var owner_id = JSON.stringify(auction.owner._id);
    response.render('auctions/show', { auction: auction, ownerid: owner_id, username: request.user.username, id: user_id });
});

// end auction
routes.get('/auctions/:id/end', isLoggedIn, async (request, response) => {
    const auction = await Auction.findById(request.params.id).lean().populate({
        path: "reviews", populate: {
            path: "owner"
        }
    }).populate("owner");
    var user_id = JSON.stringify(request.user._id);
    var owner_id = JSON.stringify(auction.owner._id);
    response.render('auctions/show', { auction: auction, ownerid: owner_id, username: request.user.username, id: user_id });
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