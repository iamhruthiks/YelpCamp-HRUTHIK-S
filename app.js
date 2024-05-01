//creating the basic express app
const express = require("express")
const app = express()
const path = require("path")
const mongoose = require('mongoose')
const ejsMate = require("ejs-mate")
const methodOverride = require("method-override")
const Campground = require("./models/campground")
const catchAysnc = require("./utils/catchAsync")
const ExpressError = require("./utils/ExpressError")
const { campgroundSchema } = require("./schemas.js")




mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp-hruthik-s')
    .then(() => {
        console.log("connection to mongoose db is sucesssfull")
    })
    .catch(err => {
        console.log("connection to mongoooe db has failed")
        console.log(err)
    })

app.engine("ejs", ejsMate)
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))


app.use(express.urlencoded({ extended: true }))
app.use(methodOverride("_method"))

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

app.get("/", (req, res) => {
    res.send("home")
})

// app.get("/makecampground", async (req, res) => {
//     const camp = new Campground({ title: "first campground" })
//     await camp.save()
//     res.send(camp)
// })

app.get("/campgrounds", catchAysnc(async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render("campgrounds/index.ejs", { campgrounds })
}))

app.get("/campgrounds/new", (req, res) => {
    res.render("campgrounds/new.ejs")
})

app.post("/campgrounds", validateCampground, catchAysnc(async (req, res, next) => {

    // if (!req.body.campground) throw new ExpressError("Invalid Campground Data", 400)

    const campground = new Campground(req.body.campground)
    await campground.save()
    res.redirect(`/campgrounds/${campground._id}`)
}))

app.get("/campgrounds/:id", catchAysnc(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render("campgrounds/show.ejs", { campground })
}))

app.get("/campgrounds/:id/edit", catchAysnc(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render("campgrounds/edit.ejs", { campground })
}))

app.put("/campgrounds/:id", validateCampground, catchAysnc(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }) //note: ... -> is an objcet and its a spread operator
    res.redirect(`/campgrounds/${campground._id}`)
}))

app.delete("/campgrounds/:id", catchAysnc(async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    res.redirect("/campgrounds")
}))

app.all("*", (req, res, next) => {
    next(new ExpressError("Page Not Found", 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err; //this err will be ExpressError
    if (!err.message) err.message = "opps, something went wrong"
    res.status(statusCode).render("error", { err })

})

app.listen(3000, () => {
    console.log("serving on port 3000")
})