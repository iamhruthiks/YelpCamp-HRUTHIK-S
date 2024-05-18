//creating the basic express app
const express = require("express")
const path = require("path")
const mongoose = require('mongoose')
const ejsMate = require("ejs-mate")
const methodOverride = require("method-override")
const ExpressError = require("./utils/ExpressError")
const session = require("express-session")
const flash = require("connect-flash")
const passport = require("passport")
const LocalStrategy = require("passport-local")
const User = require("./models/user.js")


const userRoutes = require("./routes/users.js")
const campgroundRoutes = require("./routes/campgrounds.js")
const reviewRoutes = require("./routes/reviews.js")



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

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate())) // telling the to use LocalStrategy and it has method authenticate located in the User model

passport.serializeUser(User.serializeUser()) //using these two methods we add and remove user from session
passport.deserializeUser(User.deserializeUser())

//setting up flash
app.use((req, res, next) => {
    //console.log(req.session)
    res.locals.currentUser = req.user
    res.locals.success = req.flash("success")
    res.locals.error = req.flash("error")
    next()
})

// app.get("/makeuser", async (req, res) => {
//     const user = new User({ email: "user@gmail.com", username: "hruthik" })
//     const newUser = await User.register(user, "hello") // register is a helper method provided by passport local mongoose, user -> instance of user model and hello -> password
//     res.send(newUser) // here pbkdf2 algorithm is used to hash the password
// })

app.use("/", userRoutes)
app.use("/campgrounds", campgroundRoutes)
app.use("/campgrounds/:id/reviews", reviewRoutes)

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