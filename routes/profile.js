const express = require("express");
const passport = require("passport");
const profileRoutes = express.Router();
const uploadCloud = require('../config/cloudinary.js');

const  { ifLogged } = require("../middleware/logged");
profileRoutes.use(ifLogged);

const User = require("../models/User");
const Request = require("../models/Request");
const Trip = require('../models/Trip');

profileRoutes.get('/', (req, res, next) => {
    // Profile Status, pending requests, tasks
    let completeTasks = [];
    let acceptedRequests = 0;
    let declinedRequests = 0;
    let pendingRequests = 0;
    let profileStatus = "Menu";

    User.findById(req.user._id)
    .then(user => {
        if(!user.bio) completeTasks.push("Add a biography");
        if(!user.profilePic) completeTasks.push("Add a profile photo");
        if(!user.telephone) completeTasks.push("Add your telephone");
        if(!user.socialLinks.facebook && !user.socialLinks.twitter && !user.socialLinks.instagram) completeTasks.push("Add a social link");

        sectionTitle = completeTasks.length > 0 ? "Complete your profile" : "Menu";

        return Request.find({user: req.user._id})
    })
    .then(requests => {
        for(r of requests){
            if(r.status == "Accepted") {acceptedRequests++}
            if(r.status == "Declined") {declinedRequests++}
            if(r.status == "Pending") {pendingRequests++}
        }

        res.render('profile/index', {
            completeTasks,
            yourProfile: true,
            sectionTitle,
            acceptedRequests,
            declinedRequests,
            pendingRequests
        })
    })
})

profileRoutes.get('/createdTrips', (req,res,next)=>{
    const resquestedTrips = [];
    Trip.find({creator: req.user._id}).lean()
    .sort({created_at: -1})
    .then(createdTrips => {
        console.log(createdTrips)
        for(trip of createdTrips){
            trip.startDate = trip.startDate.toDateString();
            trip.endDate = trip.endDate.toDateString();
        }
        if(createdTrips.length == 0) var createdTrips = "No trips"

        res.render('profile/index', {createdTrips, yourProfile: true})
    })
    .catch(err => next(err))
})

profileRoutes.get('/createdTrips/:id', (req,res,next)=>{
    const resquestedTrips = [];

    Trip.find({creator: req.params.id})
    .lean()
    .sort({created_at: -1})
    .then(createdTrips => {
        for(trip of createdTrips){
            trip.startDate = trip.startDate.toDateString();
            trip.endDate = trip.endDate.toDateString();
        }

        if(createdTrips.length == 0) var createdTrips = "No trips"

        User.findById(req.params.id)
        .then(user => {
            if(!user) throw new Error('No user')
            res.render('profile/index', {user, createdTrips, yourProfile: false})
        })
    })
    .catch(err => next(err))
})

profileRoutes.get('/rp/:id', (req, res, next) => {
    User.findById(req.params.id)
    .then(user => {
        if(!user) throw new Error('No user')

        if (user.rp.indexOf(req.user._id) < 0 && req.user._id != user._id.toString()) {
            user.rp.push(req.user._id);
        }
        
        user.save()
        .then(data => res.redirect(`/profile/${user.username}`))
    })
    .catch(err => next(err));
})

profileRoutes.get('/edit-user', (req,res,next)=>{
    res.render("profile/edit-user");
})

profileRoutes.post('/edit-user', uploadCloud.single('photo'), (req, res, next) =>{  
    if(req.file) var profilePic = req.file.url;
    
    const {name, surname, sex, age, telephone, bio,facebook,twitter,instagram} = req.body;
    const socialLinks={facebook,twitter,instagram}
    const update = {name, surname, sex, age, telephone, bio,profilePic,socialLinks};

    if (name==="") delete update.name;
    if (surname==="") delete update.surname;
    if (!sex) delete update.sex;
    if (age==="") delete update.age;
    if (telephone==="") delete update.telephone;
    if (bio==="") delete update.bio;
    if (facebook==="") delete update.socialLinks.facebook;
    if (instagram==="") delete update.socialLinks.instagram;
    if (twitter==="") delete update.socialLinks.twitter;
    if (!profilePic) delete update.profilePic;

    User.findByIdAndUpdate(req.user._id, update)
    .then(user => res.redirect('/profile')) 
    .catch(error => next(error));
})

profileRoutes.get('/edit-password', (req,res,next)=>{
  res.render("profile/edit-password");
})

profileRoutes.post('/edit-password', (req,res,next)=>{  
      if (bcrypt.compareSync(req.body.currentPassword,req.user.password)){
        if (req.body.password!=req.body.passwordConfirm){
           res.render("profile/edit-password", { message: "Password confirm is not equal" })
        } else {
        const salt = bcrypt.genSaltSync(bcryptSalt);
        const hashPass = bcrypt.hashSync(req.body.password, salt);  
        
        User.findByIdAndUpdate(req.user._id, {password:hashPass})
        .then(user => res.redirect('/profile'))
        .catch(error => next(error));
      }
    }
})
profileRoutes.get('/malanga', (req,res,next)=>{
    
    res.render('profile/crazy')

})

profileRoutes.get('/crazy2', (req,res,next)=>{
    
    res.render('profile/crazy2')

})
profileRoutes.get('/:username', (req,res,next)=>{
    User.findOne({username: req.params.username})
    .then(user => {
        if(!user) throw new Error('No user');

        Trip.find({creator: user._id})
        .sort({created_at: -1})
        .lean()
        .then(createdTrips => {
            for(trip of createdTrips){
                trip.startDate = trip.startDate.toDateString();
                trip.endDate = trip.endDate.toDateString();
            }

            if(user._id.toString() == req.user._id) var yourProfile = true;
            res.render('profile/index', {user, createdTrips, yourProfile});
        })
    })
    .catch(err => next(err));
})



module.exports=profileRoutes;