const User = require("../models/user")

module.exports.renderRegister = (req, res) => {
    res.render("users/register.ejs")
}

module.exports.Register = async (req, res) => {
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
}

module.exports.renderLogin = (req, res) => {
    res.render("users/login.ejs")
}

module.exports.login = (req, res) => {
    req.flash("success", "Welcome back!")
    const redirectUrl = res.locals.returnTo || "/campgrounds"
    delete req.session.returnTo
    res.redirect(redirectUrl)
}

module.exports.logout = (req, res, next) => { //logout is a helper method provided by passport
    req.logout(function (err) {
        if (err) {
            return next(err)
        }
        req.flash("success", "Successfully logged out!")
        res.redirect("/campgrounds")
    })
}