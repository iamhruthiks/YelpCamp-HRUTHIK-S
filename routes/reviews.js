const express = require("express")
const router = express.Router({ mergeParams: true })  // im using mergeParams here so that id inside app.use("/campgrounds/:id/reviews", reviews), becomes available in our reviews route

const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js")
const Campground = require("../models/campground")
const Review = require("../models/review.js")

const ExpressError = require("../utils/ExpressError")
const catchAysnc = require("../utils/catchAsync")


//cretaing review
router.post("/", isLoggedIn, validateReview, catchAysnc(async (req, res) => {
    //res.send("review")
    const campground = await Campground.findById(req.params.id)
    const review = new Review(req.body.review) //->review, because we a storing all review form data under review
    review.author = req.user._id
    campground.reviews.push(review)
    await review.save()
    await campground.save()
    req.flash("success", "Successfully created a new review!")
    res.redirect(`/campgrounds/${campground._id}`)
}))

//deleting review
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, catchAysnc(async (req, res) => {
    //res.send("review deleted")
    const { id, reviewId } = req.params
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(req.params.reviewId)
    req.flash("success", "Successfully deleted a review!")
    res.redirect(`/campgrounds/${id}`)
}))

module.exports = router