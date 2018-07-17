const express = require("express");
const passport = require('passport');
const authRoutes = express.Router();
const User = require("../models/User");
const Trip = require("../models/Trip");
const Request = require("../models/Request");
const nodemailer = require("nodemailer");


// Bcrypt to encrypt passwords
const bcrypt = require("bcrypt");
const bcryptSalt = 10;


authRoutes.get("/login", (req, res, next) => {
  res.render("auth/login", { "message": req.flash("error") });
});

authRoutes.post("/login", passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/auth/login",
  failureFlash: true,
  passReqToCallback: true
}));

authRoutes.get("/signup", (req, res, next) => {
  res.render("auth/signup");
});

authRoutes.post("/signup", (req, res, next) => {
  
  const {username,password,email,name,surname,sex,age,telephone,bio}=req.body
  

  if (username === "" || password === "" || email==="" || name==="" || surname==="" || age==="" ||
  telephone==="" || bio ==="" ) {
    res.render("auth/signup", { message: "Fill all the information!!" });
    return;
  }


    const salt = bcrypt.genSaltSync(bcryptSalt);
    const hashPass = bcrypt.hashSync(password, salt);

    const newUser = new User({
      username, password: hashPass, email, name, surname, sex, age, telephone, bio
    
    });
   console.log(newUser)
    newUser.save((err) => {
      if (err) {
        res.render("auth/signup", { message: "User/email already exists!!" });
      } else {

        let email = req.body.email;
        let transporter = nodemailer.createTransport({
          service: 'Gmail',
          auth: {
            user: 'crazytrips@gmail.com',
            pass: '12345'
          }
        });
 //       transporter.sendMail({
       
 //       })

        res.redirect("/");
      }
    });

});

authRoutes.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

authRoutes.post('/send-email', (req, res, next) => {
  let { email, subject, message } = req.body;
  let transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'your email address',
      pass: 'your email password'
    }
  });
  transporter.sendMail({
    from: "Perro",
    to: email, 
    subject: subject, 
    text: message,
    html: `<b>${message}</b>`
  })
  .then(info => res.render('message', {email, subject, message, info}))
  .catch(error => console.log(error));
});






module.exports = authRoutes;
