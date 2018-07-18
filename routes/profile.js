const express = require("express");
const passport = require("passport");
const profileRoutes = express.Router();

const { ifLogged } = require("../middleware/logged");
profileRoutes.use(ifLogged);

const User = require("../models/User");
const Request = require("../models/Request");
const Trip = require('../models/Trip');

profileRoutes.get('/', ifLogged, (req,res,next)=>{
    const resquestedTrips = [];

    Trip.find({creator: req.user._id}).lean()
    .then(createdTrips => {
        for(trip of createdTrips){
            trip.startDate = trip.startDate.toDateString();
            trip.endDate = trip.endDate.toDateString();
        }
        res.render('profile/index', {createdTrips, yourProfile: true})
    })
    .catch(err => next(err))
})

profileRoutes.get('/rp/:id', ifLogged, (req, res, next) => {
    User.findById(req.params.id)
    .then(user => {
        if (user.rp.indexOf(req.user._id) < 0 && req.user._id != user._id.toString()) {
            user.rp.push(req.user._id);
        }
        
        user.save()
        .then(data => res.redirect(`/profile/${user.username}`))
    })
    .catch(err => next(err));
})

profileRoutes.get('/:username', ifLogged, (req,res,next)=>{
    User.findOne({username: req.params.username})
    .then(user => {
        Trip.find({creator: user._id})
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