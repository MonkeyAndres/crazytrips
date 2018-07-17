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
            res.render('profile/index', {user, createdTrips, yourProfile: false});
        })
    })
    .catch(err => next(err));
})

module.exports=profileRoutes;