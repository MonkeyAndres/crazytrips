const express = require("express");
const router = express.Router();
const axios = require('axios');
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

  



router.get('/info/:codeCountry',(req,res,next)=>{


axios.get(`https://restcountries.eu/rest/v2/alpha/${req.params.codeCountry}`)
  .then(response=>{


    const languages=[],timezones=[],currencies=[];
    const country=response.data.name;
    const capital=response.data.capital;
    const region=response.data.region;
    const population=response.data.population;
    const flag=response.data.flag;
      
    for (var i=0;i<response.data.languages.length;i++)
      languages.push(response.data.languages[i].name)
    
    for (var i=0;i<response.data.timezones.length;i++)
      timezones.push(response.data.timezones[i])
    
    for (var i=0;i<response.data.currencies.length;i++)
      currencies.push({name:response.data.currencies[i].name, symbol:response.data.currencies[i].symbol})
      
      const information={country,capital,region,population,currencies,languages,timezones,flag} 
      res.render('trips/info',information)
     
    })
    .catch(err => next(err))

  })


module.exports = router;
