if (process.env.NODE_ENV !== "production") {
    require("dotenv").config()
}
// require("dotenv").config()

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
const helmet = require("helmet")
const MongoStore = require('connect-mongo')(session);

const mongoSanitize = require('express-mongo-sanitize');

const userRoutes = require("./routes/users.js")
const campgroundRoutes = require("./routes/campgrounds.js")
const reviewRoutes = require("./routes/reviews.js")

const dbURL = process.env.DB_URL;
const secret = process.env.SECRET;
//const db_URL = 'mongodb://127.0.0.1:27017/yelp-camp-hruthik-s';
// 'mongodb://127.0.0.1:27017/yelp-camp-hruthik-s'

mongoose.connect(dbURL)
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
app.use(mongoSanitize({
    replaceWith: '_'
}));

const store = new MongoStore({
    url: dbURL,
    secret,
    touchAfter: 24 * 3600
});

store.on("error", function (e) {
    console.log("session store error", e)
})

const sessionConfig = {     // configuring session
    store,
    name: "session",
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        //secure: true,
        expries: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1000 milli seconds in a second, 60 seconds in a minute, 60 minutes in an hour, 24 hours in a day and 7 days in a week 
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash())
app.use(helmet())

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dkl32ao2n/",
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", "data:", ...fontSrcUrls],
        },
    })
);

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate())) // telling the to use LocalStrategy and it has method authenticate located in the User model

passport.serializeUser(User.serializeUser()) //using these two methods we add and remove user from session
passport.deserializeUser(User.deserializeUser())

//setting up flash
app.use((req, res, next) => {
    //console.log(req.session)
    //console.log(req.query)
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
    res.render("home.ejs")
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

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`server is running on port ${port}`)
})