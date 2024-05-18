const express = require("express")
const router = express.Router()
const User = require("../models/user")
const catchAsync = require("../utils/catchAsync")
const { storeReturnTo } = require('../middleware');
const passport = require("passport")

router.get("/register", (req, res) => {
    res.render("users/register.ejs")
})

router.post("/register", catchAsync(async (req, res) => {
    //res.send(req.body)
    try {
        const { email, username, password } = req.body
        const user = new User({ email, username })
        const registerUser = await User.register(user, password) // register is a helper method provided by passport local mongoose
        //console.log(registerUser)
        req.login(registerUser, err => { // this login() is a helper method provided by passport
            if (err) return next(err)
            req.flash("success", "Welcome to Yelp Camp!")
            res.redirect("/campgrounds")
        })
    } catch (e) {
        req.flash("error", e.message)
        res.redirect("/register")
    }
}))

router.get("/login", (req, res) => {
    res.render("users/login.ejs")
})

router.post("/login", storeReturnTo, passport.authenticate("local", { failureFlash: true, failureRedirect: "/login" }), (req, res) => { // passport.authenticate() is a middleware provided by passport
    req.flash("success", "Welcome back!")
    const redirectUrl = res.locals.returnTo || "/campgrounds"
    delete req.session.returnTo
    res.redirect(redirectUrl)
})

router.get("/logout", (req, res, next) => { //logout is a helper method provided by passport
    req.logout(function (err) {
        if (err) {
            return next(err)
        }
        req.flash("success", "Successfully logged out!")
        res.redirect("/campgrounds")
    })
})

module.exports = router