const Campground = require("../models/campground")
const Review = require("../models/review.js")

//adding a review controller

module.exports.createReview = async (req, res) => {
    //res.send("review")
    const campground = await Campground.findById(req.params.id)
    const review = new Review(req.body.review) //->review, because we a storing all review form data under review
    review.author = req.user._id
    campground.reviews.push(review)
    await review.save()
    await campground.save()
    req.flash("success", "Successfully created a new review!")
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteReview = async (req, res) => {
    //res.send("review deleted")
    const { id, reviewId } = req.params
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(req.params.reviewId)
    req.flash("success", "Successfully deleted a review!")
    res.redirect(`/campgrounds/${id}`)
}