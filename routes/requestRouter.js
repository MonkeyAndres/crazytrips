const express = require('express');
const router = express.Router();

const Request = require("../models/Request");
const Trip = require("../models/Trip");

const { ifLogged } = require('../middleware/logged');
router.use(ifLogged);


router.get('/new/:id', (req, res, next) => {
    const newReq = new Request({
        trip: req.params.id,
        user: req.user._id,
    })
    newReq.save()
    .then(data => res.redirect('/trips'))
    .catch(err => next(err))
})

module.exports = router;