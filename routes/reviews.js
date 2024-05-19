const express = require("express")
const router = express.Router({ mergeParams: true })  // im using mergeParams here so that id inside app.use("/campgrounds/:id/reviews", reviews), becomes available in our reviews route

const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js")
const Campground = require("../models/campground")
const Review = require("../models/review.js")

const reviews = require("../controllers/reviews.js")

const ExpressError = require("../utils/ExpressError")
const catchAysnc = require("../utils/catchAsync")


//cretaing review
router.post("/", isLoggedIn, validateReview, catchAysnc(reviews.createReview))

//deleting review
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, catchAysnc(reviews.deleteReview))

module.exports = router