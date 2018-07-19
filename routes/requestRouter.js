const express = require("express");
const router = express.Router();

const Request = require("../models/Request");
const Trip = require("../models/Trip");
const nodemailer = require("nodemailer");
const {sendMail, sendMailRequest} = require("../mailing");
const { ifLogged } = require("../middleware/logged");
router.use(ifLogged);

// New request
router.get("/new/:id", (req, res, next) => {
  const newReq = new Request({
		trip: req.params.id,
    user: req.user._id,
	});

	Trip.findById(req.params.id)
	.populate("creator")
	.then(trip=>{
	
		newReq.save()
    .then(data =>{ 
			sendMailRequest(trip.creator,trip)
      res.redirect("/trips")
    })
	.catch(err => next(err));	



	})
  
});

// List request that a user made
router.get("/", (req, res, next) => {
  Request.find({ user: req.user._id })
	.populate("trip")
	.then(arrayRequest => {
	  res.render("requests/list-request", { arrayRequest });
	})
	.catch(err => next(err));
});

// Eval request for a trip
router.get("/eval/:id", (req, res, next) => {
  Request.find({trip: req.params.id, status: "Pending"})
  .populate('user trip')
  .then(arrayRequest => {
	let acceptedRequests = 1;
	for(e of arrayRequest) e.status ? acceptedRequests++ : null
	
	res.render('requests/list-request', { arrayRequest, acceptedRequests })
  })
  .catch(err => next(err));
})

// Accept request
router.get('/accept/:userID/:tripID', (req, res, next) => {
  Request.findOne({user: req.params.userID, trip: req.params.tripID})
  .populate('trip')
  .then(request => {
	if(request.trip.creator.toString() == req.user._id){
		request.status = "Accepted";
	}
	return request.save()
  })
  .then(() => res.redirect(`/requests/eval/${req.params.tripID}`))
  .catch(err => next(err));
})

// Decline request
router.get('/decline/:userID/:tripID', (req, res, next) => {
	Request.findOne({user: req.params.userID, trip: req.params.tripID})
	.populate('trip')
	.then(request => {
	  if(request.trip.creator.toString() == req.user._id){
		  request.status = "Decline";
	  }
	  return request.save()
	})
	.then(() => res.redirect(`/requests/eval/${req.params.tripID}`))
	.catch(err => next(err));
  })

module.exports = router;
