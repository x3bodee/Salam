const express = require('express');
require('dotenv').config();
const db = require('../config/db');
const router = express.Router();
const signupValidation = require('../middelware/validation/signup.middelware');
const bcrypt = require("bcryptjs");
const salt = 10

// router.use(express.urlencoded({ extended: true }));
// router.use(express.json());
// require('dotenv').config();
// const pool = require('../config/db')
// const bcrypt = require('bcryptjs');
// const jwt = require("jsonwebtoken");

// router.route('/signup').get(signup.signup).post(signup.signup2);

// router.get('/',(req,res)=>{
//     res.send("hi from user route ")
// })

// TODO: signup
// router.get('/signup',(req,res)=>{
    
//     res.send("hi from user route ")
// })


router.post('/signup',signupValidation,async(req,res) => {
    console.log("1")
    if ( res.locals.erorrslog ) { res.status(400).json({msg:"validation error", errors:res.locals.erorrslog}) }

    else { 
        // res.status(200).json({msg:"user has been created successfuly", data:res.locals.validatedData}) 

        if(!res.locals.validatedData) res.status(500).json({msg:"validation internal error"});
        console.log("2")
        console.log(res.locals.validatedData.password)
        try{
        
            let hashedPassword =  await bcrypt.hash(res.locals.validatedData.password,salt)
            console.log("3")
            console.log(hashedPassword)
            res.locals.validatedData.password=hashedPassword

            // let sql= ' INSERT INTO user (Fname,Lname,gender,email,password,country,birth_date,created_at,phone,teach_status,language,userType)'
            console.log(res.locals.validatedData)
            let Fname      =  res.locals.validatedData.Fname
            let Lname      =  res.locals.validatedData.Lname
            let passwprd   = res.locals.validatedData.passwprd
            let email      = res.locals.validatedData.email
            let country    = res.locals.validatedData.country
            let birth_date = res.locals.validatedData.birth_date
            let language   = res.locals.validatedData.language

            let sql= ' INSERT INTO user (Fname,Lname,email,password,country,birth_date,language) VALUES(?,?,?,?,?,?,?)'
            let submit = await db.query( sql, {Fname:Fname, Lname:Lname, email:email, password:password, country:country, birth_date:birth_date, language:language} )
            console.log(submit)
            res.status(200).json({msg:"user has been created successfuly", data:res.locals.validatedData})

        }catch(e){
            res.status(404).json(e)
        }
    }
    // console.log("123")
    // res.status(200).json({msg:"success"})
})



// TODO: signin
// TODO: sginout

// TODO: ask for teacher account (user)
// TODO: teacher account request (admin)

// TODO: find user
// TODO: edit user info
// TODO: delete user ****



module.exports = router;