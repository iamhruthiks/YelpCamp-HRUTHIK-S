const Campground = require("../models/campground")
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN
const geocoder = mbxGeocoding({ accessToken: mapBoxToken })
const { cloudinary } = require("../cloudinary")

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render("campgrounds/index.ejs", { campgrounds, ga4_id: process.env.GA4 })
}

module.exports.renderNewForm = (req, res) => {
    res.render("campgrounds/new.ejs", { ga4_id: process.env.GA4 })
}

module.exports.createCampground = async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError("Invalid Campground Data", 400)
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    //res.send(geoData.body.features[0].geometry)
    const campground = new Campground(req.body.campground)
    campground.geometry = geoData.body.features[0].geometry
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.author = req.user._id
    await campground.save()
    // console.log(campground)
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
    res.render("campgrounds/show.ejs", { campground, ga4_id: process.env.GA4 })
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    if (!campground) {
        req.flash("error", "Cannot find that campground")
        return res.redirect("/campgrounds")
    }
    res.render("campgrounds/edit.ejs", { campground, ga4_id: process.env.GA4 })
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params
    //console.log(req.body)
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }) //note: ... -> is an objcet and its a spread operator
    const img = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.images.push(...img)
    await campground.save()
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename)
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })

    }
    // console.log("after deletion")
    // console.log(campground.images)
    req.flash("success", "Successfully updated the campground!")
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async (req, res) => {

    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    req.flash("success", "Successfully deleted a campground!")
    res.redirect("/campgrounds")
}