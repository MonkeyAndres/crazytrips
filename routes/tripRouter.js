const express = require("express");
const router = express.Router();
const { ifLogged } = require('../middleware/logged');

const Trip = require("../models/Trip");
const Request = require("../models/Request");
const FroalaEditor = require("../node_modules/wysiwyg-editor-node-sdk/lib/froalaEditor.js");
const ObjectId = require('mongoose').Types.ObjectId; 
router.use(ifLogged);

// List of all trips (except the ones created by user)
router.get("/", (req, res, next) => {
  Trip.find({creator: {$ne: req.user._id}})
    .sort({created_at: -1})
    .lean()
    .then(trips => {
      for(trip of trips) {
        trip.startDate = trip.startDate.toDateString();
        trip.endDate = trip.endDate.toDateString();
      }
      res.render("trips/index", { trips });
    })
    .catch(error => next(error))
});

// Create trip form
router.get("/create", (req, res, next) => {
  res.render("trips/create", {operation: "Create"});
});

// Create trip
router.post("/Create", (req, res, next) => {
    const {title, destination, price, description, maxTravelers, startDate, endDate} = req.body;

    const newTrip = new Trip({
        creator: req.user._id,
        title,
        destination,
        price,
        description,
        maxTravelers,
        startDate,
        endDate
    })

    newTrip.save()
    .then(data => res.redirect('/profile'))
    .catch(err => next(err))
});

// Upload images froala
router.post("/upload_image", (req, res, next) => {
  FroalaEditor.Image.upload(req, "../public/uploads/", (err, data) => {
    // Return data.
    if (err) {
      return res.send(JSON.stringify(err));
    }

    data.link = data.link.replace('/public', '');
    res.send(data);
  });
});

// Show specific trip
router.get('/:id',(req,res,next)=>{
  Trip.findById(req.params.id)
  .populate('creator')
  .lean()
  .then(trip=>{
    let canRequest = true;
    trip.startDate = trip.startDate.toDateString();
    trip.endDate = trip.endDate.toDateString();

    if(trip.creator._id.toString() == req.user._id) canRequest = false

    Request.find({trip: req.params.id})
    .then(request => {
      for(r of request){
        if(r.user.toString() == req.user._id) canRequest = false;
      }
      res.render('trips/show',{trip, canRequest})
    })
  })
  .catch(error => next(error))
})

// Remove Trip
router.get('/delete/:id', (req, res, next) => {
  Trip.findById(req.params.id)
  .then(trip => {
    if(trip.creator.toString() == req.user._id) return trip.remove()
  })
  .then(trip => res.redirect('/profile'))
  .catch(error => next(error))
})

// Edit Trip Form
router.get('/edit/:id', (req, res, next) => {
  Trip.findById(req.params.id)
  .lean()
  .then(trip => {
    trip.startDate = trip.startDate.toLocaleDateString('es-ES', {year: 'numeric', month: "2-digit", day: "2-digit"});
    trip.endDate = trip.endDate.toLocaleDateString('es-ES', {year: 'numeric', month: "2-digit", day: "2-digit"});

    res.render("trips/create", {trip, operation: "Edit"});
  })
  .catch(error => next(error))
})

// Edit Trip
router.post('/Edit/:id', (req, res, next) => {
  const {title, price, description, maxTravelers, startDate, endDate} = req.body;
  
  Trip.findByIdAndUpdate(req.params.id, {title, price, description, maxTravelers, startDate, endDate})
  .then(trip => {
    res.redirect('/profile');
  })
  .catch(error => next(error))
})

module.exports = router;
