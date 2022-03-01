
const express = require('express');
const router = express.Router();
const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");

require('dotenv').config({ path: `${__dirname}/../.env` });
const db = require('../config/db');
const signupValidation = require('../middelware/validation/signup.middelware');

const salt = process.env.SALT || 10

router.use(express.urlencoded({ extended: true }));
router.use(express.json());



// router.get('/',(req,res)=>{
//     res.send("hi from user route ")
// })



router.post('/signup',signupValidation,async(req,res) => {

    // console.log("1")
    
    if ( res.locals.erorrslog ) { res.status(400).json({msg:"validation error", errors:res.locals.erorrslog}) }

    else { 

        if(!res.locals.validatedData) res.status(500).json({msg:"validation internal error"});
        
        // console.log("2")
        // console.log(res.locals.validatedData.password)
        
        try{
            // console.log(salt)

            let hashedPassword =  await bcrypt.hash(res.locals.validatedData.password,parseInt(salt))
            
            // console.log("3")
            // console.log(hashedPassword)

            res.locals.validatedData.password=hashedPassword

            // console.log(res.locals.validatedData)

            let Fname      =  res.locals.validatedData.Fname
            let Lname      =  res.locals.validatedData.Lname
            let password   = res.locals.validatedData.password
            let gender   = res.locals.validatedData.gender
            let email      = res.locals.validatedData.email
            let country    = res.locals.validatedData.country
            let birth_date = res.locals.validatedData.birth_date
            let language   = res.locals.validatedData.language

            let sql= ' INSERT INTO user (Fname,Lname,email,password,gender,country,birth_date,language) VALUES(?,?,?,?,?,?,?,?)'
            let submit = await db.query( sql, [Fname=Fname, Lname=Lname, email=email, password=password, gender, country=country, birth_date=birth_date, language=language] )
            console.log(submit)
            res.status(200).json({msg:"user has been created successfuly", data:res.locals.validatedData})

        }catch(e){

            if(e.code == "ER_DUP_ENTRY") res.status(404).json({msg:e.message, code:e.code, err_no:e.errno, sql_msg:e.sqlMessage})

            res.status(404).json(e)
        }
    }
})



// TODO: signin
// TODO: sginout

// TODO: ask for teacher account (user)
// TODO: teacher account request (admin)

// TODO: find user
// TODO: edit user info
// TODO: delete user ****



module.exports = router;