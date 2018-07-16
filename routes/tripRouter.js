const express = require("express");
const router = express.Router();

const Trip = require("../models/Trip");
const FroalaEditor = require("../node_modules/wysiwyg-editor-node-sdk/lib/froalaEditor.js");

router.get("/", (req, res, next) => {
  Trip.find()
    .populate("creator")
    .then(trips => {
      res.render("trip/index", { trips });
    });
});

router.get("/create", (req, res, next) => {
  res.render("trips/create");
});

router.post("/create", (req, res, next) => {
  res.send(req.body.description);
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
