const express = require("express")
const router = express.Router()

const campgrounds = require("../controllers/campgrounds.js")

const catchAysnc = require("../utils/catchAsync")
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware.js")


const Campground = require("../models/campground")
const review = require("../models/review.js")


// refactoring to campgrounds controller
// a fancy way to restructure routes
router.route("/")
    .get(catchAysnc(campgrounds.index))
    .post(isLoggedIn, validateCampground, catchAysnc(campgrounds.createCampground))

router.get("/new", isLoggedIn, campgrounds.renderNewForm)

router.route("/:id")
    .get(catchAysnc(campgrounds.showCampgrounds))
    .put(isLoggedIn, isAuthor, validateCampground, catchAysnc(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAysnc(campgrounds.deleteCampground))

router.get("/:id/edit", isLoggedIn, isAuthor, catchAysnc(campgrounds.renderEditForm))

module.exports = router