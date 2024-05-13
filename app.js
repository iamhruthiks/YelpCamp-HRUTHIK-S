//creating the basic express app
const express = require("express")
const path = require("path")
const mongoose = require('mongoose')
const ejsMate = require("ejs-mate")
const methodOverride = require("method-override")
const ExpressError = require("./utils/ExpressError")
const session = require("express-session")
const flash = require("connect-flash")


const campgrounds = require("./routes/campgrounds.js")
const reviews = require("./routes/reviews.js")


mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp-hruthik-s')
    .then(() => {
        console.log("connection to mongoose db is sucesssfull")
    })
    .catch(err => {
        console.log("connection to mongoooe db has failed")
        console.log(err)
    })

const app = express()

app.engine("ejs", ejsMate)
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))


app.use(express.urlencoded({ extended: true }))
app.use(methodOverride("_method"))
app.use(express.static(path.join(__dirname, "public"))) //serving static files
const sessionConfig = {     // configuring session
    secret: "thisisasecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expries: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1000 milli seconds in a second, 60 seconds in a minute, 60 minutes in an hour, 24 hours in a day and 7 days in a week 
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash())

//setting up flash
app.use((req, res, next) => {
    res.locals.success = req.flash("success")
    res.locals.error = req.flash("error")
    next()
})

app.use("/campgrounds", campgrounds)
app.use("/campgrounds/:id/reviews", reviews)

app.get("/", (req, res) => {
    res.send("home")
})

// app.get("/makecampground", async (req, res) => {
//     const camp = new Campground({ title: "first campground" })
//     await camp.save()
//     res.send(camp)
// })





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