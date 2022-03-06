const express = require('express')
const router = express.Router();

require('dotenv').config({ path: `${__dirname}/../.env` });
const db = require('../config/db');

// validations middelware
const subscriptionValidation = require('../middelware/validation/subscription.middelware');

// authentications middelware
const isLoggedin = require('../middelware/authentication/isLoggedin.middelware');
const isAdmin = require('../middelware/authentication/isAdmin.middelware');
const isTeacher = require('../middelware/authentication/isTeacher.middelware');
const isStudent = require('../middelware/authentication/isStudent.middelware');

router.use(express.urlencoded({ extended: true }));
router.use(express.json());


// TODO: create subscription
// ! need more work
router.post('/createSubscription', isLoggedin, isAdmin, subscriptionValidation, async (req, res) => {

    if (!res.locals.validatedData) res.status(400).json({msg: "validation error"})

    console.log(res.locals.validatedData)
    let data = res.locals.validatedData
    
    try{

        let sql = ' INSERT INTO subscription (subscription_title, ar_title, subscription_description, ar_description, price,created_at) VALUES(?,?,?,?,?,?)'
        let submit = await db.query(sql, [ data.title, data.ar_title, 
            data.description, data.ar_description,
            data.price, data.created_at ])
            console.log(submit)

            return res.status(200).json({ msg : "subscription has been created successfuly" , data,id:submit[0].insertId})
        }catch(e){
            
            if (e.code == "ER_DUP_ENTRY") return res.status(404).json({ msg: e.message, code: e.code, err_no: e.errno, sql_msg: e.sqlMessage })

            return res.status(404).json(e)
        }

});

// TODO: find subscription
// TODO: edit subscription
// TODO: delete subscription

module.exports=router