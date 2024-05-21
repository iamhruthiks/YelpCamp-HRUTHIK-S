const express = require("express")
const router = express.Router()

const campgrounds = require("../controllers/campgrounds.js")

const catchAysnc = require("../utils/catchAsync")
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware.js")


const Campground = require("../models/campground")
const review = require("../models/review.js")

const multer = require('multer')
const { storage } = require("../cloudinary")
const upload = multer({ storage })

// refactoring to campgrounds controller
// a fancy way to restructure routes
router.route("/")
    .get(catchAysnc(campgrounds.index))
    .post(isLoggedIn, upload.array("image"), validateCampground, catchAysnc(campgrounds.createCampground))
// .post(upload.array("image"), (req, res) => {
//     console.log(req.body, req.files)
//     res.send("it worked!")
// })

router.get("/new", isLoggedIn, campgrounds.renderNewForm)

router.route("/:id")
    .get(catchAysnc(campgrounds.showCampgrounds))
    .put(isLoggedIn, isAuthor, upload.array("image"), validateCampground, catchAysnc(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAysnc(campgrounds.deleteCampground))

router.get("/:id/edit", isLoggedIn, isAuthor, catchAysnc(campgrounds.renderEditForm))

module.exports = router