const express = require("express");
const passport = require("passport");
const { ifLogged } = require("../middleware/logged");
const profileRoutes = express.Router();


profileRoutes.get('/', ifLogged, (req,res,next)=>{

res.render( 'profile/index'  , {user: req.user})


})


module.exports=profileRoutes;