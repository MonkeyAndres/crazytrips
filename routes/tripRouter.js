const express = require("express");
const router = express.Router();
const { ifLogged } = require('../middleware/logged');

const Trip = require("../models/Trip");
const Request = require("../models/Request");
const FroalaEditor = require("../node_modules/wysiwyg-editor-node-sdk/lib/froalaEditor.js");
const ObjectId = require('mongoose').Types.ObjectId; 
router.use(ifLogged);

router.get("/", (req, res, next) => {
  Trip.find()
    .populate("creator")
    .sort({created_at: -1})
    .lean()
    .then(trips => {
      for(trip of trips) {
        trip.startDate = trip.startDate.toDateString();
        trip.endDate = trip.endDate.toDateString();
      }
      res.render("trips/index", { trips });
    });
});

router.get("/create", (req, res, next) => {
  res.render("trips/create");
});

router.post("/create", (req, res, next) => {
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


router.get('/:id',(req,res,next)=>{

  Trip.findById(req.params.id)
  .populate('creator')
  .lean()
  .then(trip=>{
    trip.startDate = trip.startDate.toDateString();
    trip.endDate = trip.endDate.toDateString();

    Request.find({trip: req.params.id})
    .then(request => {
      let canRequest = true;
      for(r of request){
        if(r.user.toString() == req.user._id){
          canRequest = false;
        }
      }
      res.render('trips/show',{trip, canRequest})
    })
  })
  .catch(error=>console.log(error))
})
module.exports = router;
