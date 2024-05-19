const Campground = require("../models/campground")

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render("campgrounds/index.ejs", { campgrounds })
}

module.exports.renderNewForm = (req, res) => {
    res.render("campgrounds/new.ejs")
}

module.exports.createCampground = async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError("Invalid Campground Data", 400)

    const campground = new Campground(req.body.campground)
    campground.author = req.user._id
    await campground.save()
    req.flash("success", "Successfully created a new campground!")
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.showCampgrounds = async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: "reviews",
        populate: {
            path: "author" // this author is for review
        }
    }).populate("author") // this author is for campground
    //console.log(campground)
    if (!campground) {
        req.flash("error", "Cannot find that campground")
        return res.redirect("/campgrounds")
    }
    res.render("campgrounds/show.ejs", { campground })
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    if (!campground) {
        req.flash("error", "Cannot find that campground")
        return res.redirect("/campgrounds")
    }
    res.render("campgrounds/edit.ejs", { campground })
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }) //note: ... -> is an objcet and its a spread operator
    req.flash("success", "Successfully updated the campground!")
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async (req, res) => {

    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    req.flash("success", "Successfully deleted a campground!")
    res.redirect("/campgrounds")
}