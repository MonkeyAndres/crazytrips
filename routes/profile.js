const express = require("express");
const passport = require("passport");
const profileRoutes = express.Router();

const { ifLogged } = require("../middleware/logged");
profileRoutes.use(ifLogged);

const Request = require("../models/Request");
const Trip = require('../models/Trip');

profileRoutes.get('/', ifLogged, (req,res,next)=>{
    const resquestedTrips = [];

    Request.find({user: req.user._id})
    .populate('trip')
    .then(requests => {
        for(r of requests) resquestedTrips.push(r.trip);

        return Trip.find({creator: req.user._id})
    })
    .then(createdTrips => {
        res.render('profile/index', {resquestedTrips, createdTrips})
    })
    .catch(err => next(err))
})


module.exports=profileRoutes;