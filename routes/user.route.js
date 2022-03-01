
const express = require('express');
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

require('dotenv').config({ path: `${__dirname}/../.env` });
const db = require('../config/db');
const signupValidation = require('../middelware/validation/signup.middelware');
const signinValidation = require('../middelware/validation/signin.middelware');
const isLoggedin = require('../middelware/authintication/isLoggedin.middelware');
const isAdmin = require('../middelware/authintication/isAdmin.middelware');
const isTeacher = require('../middelware/authintication/isTeacher.middelware');

const salt = process.env.SALT || 10
const SECRET = process.env.SECRET 
router.use(express.urlencoded({ extended: true }));
router.use(express.json());


// this route for testing the authentications
router.get('/test',isLoggedin, isAdmin,(req,res)=>{
    res.send("hi from user route ")
})



router.post('/signup',signupValidation,async(req,res) => {

    // console.log("1")
    
    if ( res.locals.erorrslog ) { return res.status(400).json({msg:"validation error", errors:res.locals.erorrslog}) }

    else { 

        if(!res.locals.validatedData) return res.status(500).json({msg:"validation internal error"});
        
        // console.log("2")
        // console.log(res.locals.validatedData.password)
        
        try{
            // console.log(salt)

            let hashedPassword =  await bcrypt.hash(res.locals.validatedData.password,parseInt(salt))
            
            // console.log("3")
            // console.log(hashedPassword)

            res.locals.validatedData.password=hashedPassword

            // console.log(res.locals.validatedData)
            // let { Fname, Lname, password, gender, email, country, birth_date, language } = req.locals.validatedData
            // console.log(Fname)
            // console.log("4")

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
            // console.log(submit)
            return res.status(200).json({msg:"user has been created successfuly", data:res.locals.validatedData})

        }catch(e){

            if(e.code == "ER_DUP_ENTRY") return res.status(404).json({msg:e.message, code:e.code, err_no:e.errno, sql_msg:e.sqlMessage})

            return res.status(404).json(e)
        }
    }
})



// TODO: signin
router.post('/signin',signinValidation, async(req,res) => {
    console.log('inside signin post request')   
    if ( res.locals.erorrslog ) { return res.status(400).json({msg:"validation error", errors:res.locals.erorrslog}) }
    else { 
        if(!res.locals.validatedSigninData) return res.status(500).json({msg:"validation internal error"});
        console.log("1")
        console.log(res.locals.validatedSigninData)

        try{
            let email = res.locals.validatedSigninData.email
            let password   = res.locals.validatedSigninData.password
            // let hashedPassword =  await bcrypt.hash(password,parseInt(salt))
            let sql= 'SELECT * FROM user WHERE email = ?'
            let submit = await db.query( sql, email )
            
            // console.log(submit[0].length)

            if ( submit[0].length === 0 ) return res.status(404).json({msg:"Wrong email or password"})
            else{
                
                let passIsValid = await bcrypt.compare(password,submit[0][0].password)
                // console.log(passIsValid)
                
                let data = {
                    user_id: submit[0][0].user_id,
                    userType: submit[0][0].userType,
                    teach_status: submit[0][0].teach_status,
                    Fname: submit[0][0].Fname,
                    Lname: submit[0][0].Lname,
                }

                const token = await jwt.sign({data},SECRET,{expiresIn:604800})

                if (passIsValid) return res.status(200).json({msg:"user has been logged in successfuly", token})
                else return res.status(404).json({msg:"Wrong email or password"})
            
            }
        
        }catch(e){
            console.log(e)
            return res.status(404).json(e)
        }

    }

})


// TODO: sginout -- **this from front end just delete the token

// TODO: ask for teacher account (user)
// TODO: teacher account request (admin)

// TODO: find user
// TODO: edit user info
// TODO: delete user ****



module.exports = router;