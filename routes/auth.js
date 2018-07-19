const express = require("express");
const passport = require("passport");
const { ifLogged } = require("../middleware/logged");
const authRoutes = express.Router();
const uploadCloud = require('../config/cloudinary.js');

const User = require("../models/User");
const Trip = require("../models/Trip");
const Request = require("../models/Request");

const nodemailer = require("nodemailer");
const sendMail = require("../mailing");


// Bcrypt to encrypt passwords
const bcrypt = require("bcrypt");
const bcryptSalt = 10;

authRoutes.get("/login", (req, res, next) => {
  res.render("auth/login", { message: req.flash("error") });
});

authRoutes.post("/login", passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/auth/login",
    failureFlash: true,
    passReqToCallback: true
  })
);

authRoutes.get("/signup", (req, res, next) => {
  res.render("auth/signup");
});

authRoutes.post("/signup", (req, res, next) => {
  const {username,password,email,name,surname,sex,age} = req.body;

  if (username === "" || password === "" || email === "" || name === "" || surname === "" || age === "") {
    res.render("auth/signup", { message: "Fill all the information!!" });
    return;
  }

  const salt = bcrypt.genSaltSync(bcryptSalt);
  const hashPass = bcrypt.hashSync(password, salt);

  const newUser = new User({
    username,
    password: hashPass,
    email,
    name,
    surname,
    sex,
    age,
  });

  newUser.save()
    .then(data => {
      return sendMail(newUser)
    })
    .then(() => {
      res.render("auth/signup", { message: "Check your email and confirm your account!" })
    })
    .catch(err => {
      console.log(err);
      res.render("auth/signup", { message: "User/email already exists!!" })
    });
});

authRoutes.get("/logout", ifLogged, (req, res) => {
  req.logout();
  res.redirect("/");
});

authRoutes.get('/confirm/:id', (req, res, next) => {
  User.findByIdAndUpdate(req.params.id, {status: true})
  .then(user => {
    res.render('auth/login', {message: "User Confirmed! Please Log in!"})
  })
  .catch(err => next(err))
})

module.exports = authRoutes;
