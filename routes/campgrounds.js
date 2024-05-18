const express = require("express")
const router = express.Router()
const catchAysnc = require("../utils/catchAsync")
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware.js")


const Campground = require("../models/campground")
const review = require("../models/review.js")

router.get("/", catchAysnc(async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render("campgrounds/index.ejs", { campgrounds })
}))

router.get("/new", isLoggedIn, (req, res) => {
    res.render("campgrounds/new.ejs")
})

router.post("/", isLoggedIn, validateCampground, catchAysnc(async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError("Invalid Campground Data", 400)

    const campground = new Campground(req.body.campground)
    campground.author = req.user._id
    await campground.save()
    req.flash("success", "Successfully created a new campground!")
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.get("/:id", catchAysnc(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: "reviews",
        populate: {
            path: "author" // this author is for review
        }
    }).populate("author") // this author is for campground
    console.log(campground)
    if (!campground) {
        req.flash("error", "Cannot find that campground")
        return res.redirect("/campgrounds")
    }
    res.render("campgrounds/show.ejs", { campground })
}))

router.get("/:id/edit", isLoggedIn, isAuthor, catchAysnc(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    if (!campground) {
        req.flash("error", "Cannot find that campground")
        return res.redirect("/campgrounds")
    }
    res.render("campgrounds/edit.ejs", { campground })
}))

router.put("/:id", isLoggedIn, isAuthor, validateCampground, catchAysnc(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }) //note: ... -> is an objcet and its a spread operator
    req.flash("success", "Successfully updated the campground!")
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.delete("/:id", isLoggedIn, isAuthor, catchAysnc(async (req, res) => {

    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    req.flash("success", "Successfully deleted a campground!")
    res.redirect("/campgrounds")
}))

module.exports = router