const { campgroundSchema, reviewSchema } = require("./schemas.js")
const ExpressError = require("./utils/ExpressError")
const Campground = require("./models/campground")
const Review = require("./models/review.js")


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

module.exports.validateCampground = (req, res, next) => {

    const { error } = campgroundSchema.validate(req.body)
    //console.log(error)
    if (error) {
        const msg = error.details.map(el => el.message).join(",")
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}

// authorization middleware
module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    if (!campground.author.equals(req.user._id)) { // campground permissions
        req.flash("error", "You do not have permission to update this campground")
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params
    const review = await Review.findById(reviewId)
    if (!review.author.equals(req.user._id)) {
        req.flash("error", "You do not have permission to delete this review")
        return res.redirect(`/campgrounds/${id}`)
    }
    next()
}

//validating reviews
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(",")
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}



