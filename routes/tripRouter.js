const express = require("express");
const router = express.Router();
const axios = require("axios");
const { ifLogged } = require("../middleware/logged");

const uploadCloud = require('../config/cloudinary');
const flash = require("connect-flash")
const Trip = require("../models/Trip");
const Request = require("../models/Request");
const FroalaEditor = require("../node_modules/wysiwyg-editor-node-sdk/lib/froalaEditor.js");
const ObjectId = require("mongoose").Types.ObjectId;
router.use(ifLogged);

// List of all trips (except the ones created by user)
router.get("/", (req, res, next) => {
  Trip.find({ creator: { $ne: req.user._id } })
    .sort({ created_at: -1 })
    .lean()
    .then(trips => {
      for (trip of trips) {
        trip.startDate = trip.startDate.toDateString();
        trip.endDate = trip.endDate.toDateString();
      }
      res.render("trips/index", { trips });
    })
    .catch(error => next(error));
});

// Create trip form
router.get("/create", (req, res, next) => {
  const countries = require('../config/countries');
  res.render("trips/create", { operation: "Create", countries});
});

// Create trip
router.post("/Create", (req, res, next) => {
  const {title,destination,price,description,maxTravelers,startDate,endDate} = req.body;

  

  const countries = require('../config/countries');

  if(price.match(/[^0-9]/g)!=null){
    res.render("trips/create", { message:"Price must be a valid number!", operation: "Create",countries });
    return;
  }


  const newTrip = new Trip({
    creator: req.user._id,
    title,
    destination,
    price,
    description,
    maxTravelers,
    startDate,
    endDate
  });

  newTrip
    .save()
    .then(data => res.redirect("/profile"))
    .catch(err => next(err));
});

// Upload images froala
router.post("/upload_image", uploadCloud.single('file'), (req, res, next) => {
  res.send({"link": req.file.url});
});

// Show specific trip
router.get("/:id", (req, res, next) => {
  Trip.findById(req.params.id)
    .populate("creator")
    .lean()
    .then(trip => {
      let canRequest = true;
      trip.startDate = trip.startDate.toDateString();
      trip.endDate = trip.endDate.toDateString();

      if (trip.creator._id.toString() == req.user._id) canRequest = false;

      Request.find({ trip: req.params.id }).then(request => {
        for (r of request) {
          if (r.user.toString() == req.user._id) canRequest = false;
        }
        res.render("trips/show", { trip, canRequest });
      });
    })
    .catch(error => next(error));
});

// Remove Trip
router.get("/delete/:id", (req, res, next) => {
  Trip.findById(req.params.id)
    .then(trip => {
      if (trip.creator.toString() == req.user._id) return trip.remove();
    })
    .then(trip => res.redirect("/profile"))
    .catch(error => next(error));
});

// Edit Trip Form
router.get("/edit/:id", (req, res, next) => {
  Trip.findById(req.params.id)
    .lean()
    .then(trip => {
      if(trip.creator.toString() != req.user._id) throw new Error("You Aren't the creator");

      trip.startDate = trip.startDate.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      });
      trip.endDate = trip.endDate.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      });

      res.render("trips/create", { trip, operation: "Edit" });
    })
    .catch(error => next(error));
});

// Edit Trip
router.post("/Edit/:id", (req, res, next) => {
  const {title,price,description,maxTravelers,startDate,endDate} = req.body;

  Trip.findByIdAndUpdate(req.params.id, {title,price,description,maxTravelers,startDate,endDate})
    .then(trip => {
      res.redirect("/profile");
    })
    .catch(error => next(error));
});

// Travel companions
router.get('/travelers/:id', (req, res, next) => {
  Request.find({status: "Accepted", trip: req.params.id})
  .populate('trip user')
  .lean()
  .then(requests => {
    if(requests.length == 0) return Trip.findById(req.params.id).lean()

    let trip = requests[0].trip;
    trip.startDate = trip.startDate.toDateString();
    trip.endDate = trip.endDate.toDateString();
    res.render('trips/show', {requests, trip})
  })
  .then(trip => {
    var requests = "No Travelers";

    trip.startDate = trip.startDate.toDateString();
    trip.endDate = trip.endDate.toDateString();

    res.render('trips/show', {requests, trip})
  })
});

// Info Country
router.get("/info/:codeCountry", (req, res, next) => {
  axios.get(`https://restcountries.eu/rest/v2/alpha/${req.params.codeCountry}`)
    .then(response => {
      const languages = [],
        timezones = [],
        currencies = [];
      const country = response.data.name;
      const capital = response.data.capital;
      const region = response.data.region;
      const population = response.data.population;
      const flag = response.data.flag;

      for (var i = 0; i < response.data.languages.length; i++)
        languages.push(response.data.languages[i].name);

      for (var i = 0; i < response.data.timezones.length; i++)
        timezones.push(response.data.timezones[i]);

      for (var i = 0; i < response.data.currencies.length; i++)
        currencies.push({
          name: response.data.currencies[i].name,
          symbol: response.data.currencies[i].symbol
        });

      const information = {
        country,
        capital,
        region,
        population,
        currencies,
        languages,
        timezones,
        flag
      };
      res.render("trips/info", information);
    })
    .catch(err => next(err));
});

module.exports = router;
