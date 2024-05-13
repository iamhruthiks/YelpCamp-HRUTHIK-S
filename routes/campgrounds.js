const express = require("express")
const router = express.Router()
const catchAysnc = require("../utils/catchAsync")
const { campgroundSchema } = require("../schemas.js")

const ExpressError = require("../utils/ExpressError")
const Campground = require("../models/campground")

const validateCampground = (req, res, next) => {

    const { error } = campgroundSchema.validate(req.body)
    //console.log(error)
    if (error) {
        const msg = error.details.map(el => el.message).join(",")
        throw new ExpressError(msg, 400)
    } else {
        next()
    }
}


router.get("/", catchAysnc(async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render("campgrounds/index.ejs", { campgrounds })
}))

router.get("/new", (req, res) => {
    res.render("campgrounds/new.ejs")
})

router.post("/", validateCampground, catchAysnc(async (req, res, next) => {
    req.flash("success", "Successfully created a new campground!")
    // if (!req.body.campground) throw new ExpressError("Invalid Campground Data", 400)

    const campground = new Campground(req.body.campground)
    await campground.save()
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.get("/:id", catchAysnc(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate("reviews")
    //console.log(campground)
    if (!campground) {
        req.flash("error", "Cannot find that campground")
        return res.redirect("/campgrounds")
    }
    res.render("campgrounds/show.ejs", { campground })
}))

router.get("/:id/edit", catchAysnc(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    if (!campground) {
        req.flash("error", "Cannot find that campground")
        return res.redirect("/campgrounds")
    }
    res.render("campgrounds/edit.ejs", { campground })
}))

router.put("/:id", validateCampground, catchAysnc(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }) //note: ... -> is an objcet and its a spread operator
    req.flash("success", "Successfully updated the campground!")
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.delete("/:id", catchAysnc(async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    req.flash("success", "Successfully deleted a campground!")
    res.redirect("/campgrounds")
}))

module.exports = router