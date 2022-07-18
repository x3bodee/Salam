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

        let sql = ' INSERT INTO subscription (subscription_title, ar_title, subscription_description, ar_description, price) VALUES(?,?,?,?,?)'
        let submit = await db.query(sql, [ data.title, data.ar_title, 
            data.description, data.ar_description,
            data.price ])
            console.log(submit)

            return res.status(200).json({ msg : "subscription has been created successfuly" , data,id:submit[0].insertId})
        }catch(e){
            
            if (e.code == "ER_DUP_ENTRY") return res.status(404).json({ msg: e.message, code: e.code, err_no: e.errno, sql_msg: e.sqlMessage })

            return res.status(404).json(e)
        }

});

// TODO: get all subscription
router.get('/getSubscriptions', async(req,res) => {

    try{

        let sql = 'SELECT * FROM subscription WHERE status = 1'
        let submit = await db.query(sql)
        console.log(submit[0])
        
        if( submit[0].length <= 0 ) return res.status(400).json({msg:"there is no subscription found in database"})
        return res.status(200).json({ data: submit[0]})
    }catch(err){

        return res.status(400).json({err})
    }

})

// TODO: delete subscription
router.delete('/subscription', isLoggedin, isAdmin, async(req,res) => {
    if(!req.body.title) res.status(400).json({msg:"missing data"})

    try{

        let sql = 'UPDATE subscription SET status = 0 WHERE subscription_title = ?'
        let submit = await db.query(sql,req.body.title)
        console.log(submit)
        if(submit[0].changedRows < 1) return res.status(400).json({msg:"there is no subscription with your speicifications in the database"})
        return res.status(200).json({msg:req.body.title+" subscription has been deleted"})
    }catch(err){
        return res.status(400).json({err})
    }

})

// TODO: edit subscription
// ! needs more check
router.post('/editSubscription', isLoggedin, isAdmin, subscriptionValidation, async(req,res)=>{
    if (!req.body.id) res.status(400).json({msg: "error ID is missing"})
    console.log(req.body.id)
    // if (!req.body.status ) res.status(400).json({msg: "error status is missing"})
    if (!res.locals.validatedData) res.status(400).json({msg: "validation error"})
    console.log(res.locals.validatedData)
    try{
        let sql = "UPDATE subscription SET subscription_title = ? , ar_title = ? , subscription_description = ? , ar_description = ? , price = ?  WHERE subscription_id = ?"
        let submit = await db.query(sql,[res.locals.validatedData.title, res.locals.validatedData.ar_title, res.locals.validatedData.description, res.locals.validatedData.ar_description, res.locals.validatedData.price, req.body.id])
        console.log(1)
        if(submit[0].changedRows < 1) return res.status(400).json({msg:"there is no subscription with your speicifications in the database"})
        return res.status(200).json({msg:req.body.title+" subscription has been updated"})
    }catch(err){
        return res.status(400).json({msg:"something went wrong"})
    }
})
module.exports=router