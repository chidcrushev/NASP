module.exports.isLoggedIn = (req, res, next) => {
    // check if the user is logged in 
    if (!req.isAuthenticated()) {
        return res.redirect('/login');
    }
    next();
}