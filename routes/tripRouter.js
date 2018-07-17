const express = require("express");
const router = express.Router();
const { ifLogged } = require('../middleware/logged');

const Trip = require("../models/Trip");
const FroalaEditor = require("../node_modules/wysiwyg-editor-node-sdk/lib/froalaEditor.js");

router.use(ifLogged);

router.get("/", (req, res, next) => {
  Trip.find()
    .populate("creator")
    .then(trips => {
      res.render("trips/index", { trips });
    });
});

router.get("/create", (req, res, next) => {
  res.render("trips/create");
});

router.post("/create", (req, res, next) => {
    const {title, destination, price, description, maxTravelers, startDate, endDate} = req.body;

    const newTrip = new Trip({
        title,
        destination,
        price,
        description,
        maxTravelers,
        startDate,
        endDate
    })

    newTrip.save()
    .then(data => res.redirect('/'))
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

module.exports = router;
