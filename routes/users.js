const express = require("express")
const router = express.Router()
const User = require("../models/user")
const catchAsync = require("../utils/catchAsync")
const { storeReturnTo } = require('../middleware');
const passport = require("passport")

const users = require("../controllers/users")

router.route("/register")
    .get(users.renderRegister)
    .post(catchAsync(users.Register))

router.route("/login")
    .get(users.renderLogin)
    .post(storeReturnTo, passport.authenticate("local", { failureFlash: true, failureRedirect: "/login" }), users.login) // passport.authenticate() is a middleware provided by passport

router.get("/logout", users.logout)

module.exports = router