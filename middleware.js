module.exports.isLoggedIn = (req, res, next) => {

    // console.log(req.user) // this req.user(cantains user information that is stored in the session) is coming from passport
    // console.log(req.path, req.originalUrl)  // path->/new and originalUrl->/campgrounds/new

    if (!req.isAuthenticated()) { // isAuthenticated is a helper method provided by passport
        req.session.returnTo = req.originalUrl
        req.flash("error", "You must be signed in first!")
        return res.redirect("/login")
    }
    next()
}

module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
        //console.log(res.locals.returnTo)
    }
    next();
}
