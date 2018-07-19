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
  const {username,password,passwordConfirm,email,name,surname,sex,age} = req.body;

  if (username === "" || password === "" || email === "" || name === "" || surname === "" || age === "" || passwordConfirm ==="") {
    res.render("auth/signup", { message: "Fill all the information!!" });
    return;
  }

  if (password!=passwordConfirm){
    res.render("auth/signup", { message: "Password confirm must be the same!" });
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
      res.redirect("/")
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


// To Profile
authRoutes.post('/edit-user', ifLogged,uploadCloud.single('photo'), (req, res,next ) =>{  
    const {name, surname, sex, age, telephone, bio} = req.body;
    const profilePic = req.file.url;
    const update = {name, surname, sex, age, telephone, bio,profilePic};
    if (name==="") delete update.name;
    if (surname==="") delete update.surname;
    if (sex==="") delete update.sex;
    if (age==="") delete update.age;
    if (telephone==="") delete update.telephone;
    if (bio==="") delete update.bio;
    if (profilePic==="") delete update.profilePic;

    User.findByIdAndUpdate(req.user._id, update)
    .then(user => res.render("auth/edit-user", { message: "User edited" })) 
    .catch(error=>console.log(error));
})

authRoutes.get('/edit-user', ifLogged, (req,res,next)=>{
  res.render("auth/edit-user");
})


authRoutes.get('/edit-password', ifLogged, (req,res,next)=>{
  res.render("auth/edit-password")
})

authRoutes.post('/edit-password', ifLogged, (req,res,next)=>{  
      if (bcrypt.compareSync(req.body.currentPassword,req.user.password)){
        if (req.body.password!=req.body.passwordConfirm){
           res.render("auth/edit-password", { message: "Password confirm is not equal" })
        } else {
        const salt = bcrypt.genSaltSync(bcryptSalt);
        const hashPass = bcrypt.hashSync(req.body.password, salt);  
        
        User.findByIdAndUpdate(req.user._id,{password:hashPass})
        .then(user => res.redirect('/profile'))
        .catch(error => console.log(error));
      }
    }
})

module.exports = authRoutes;
