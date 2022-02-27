const express = require('express')
const signup = require('../controller/user/signup.contorller')
const router = express.Router();

// require('dotenv').config();
// const pool = require('../config/db')
// const bcrypt = require('bcryptjs');
// const jwt = require("jsonwebtoken");

router.route('/signup').get(signup.signup).post(signup.signup2);

// router.get('/',(req,res)=>{
//     res.send("hi from user route ")
// })

// TODO: signup
// router.post('/signup',(req,res)=>{
//     res.send("hi from user route ")
// })

// TODO: signin
// TODO: sginout

// TODO: ask for teacher account (user)
// TODO: teacher account request (admin)

// TODO: find user
// TODO: edit user info
// TODO: delete user ****



module.exports = router;