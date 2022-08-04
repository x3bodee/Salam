const express = require('express')
const router = express.Router();

require('dotenv').config({ path: `${__dirname}/../.env` });
const db = require('../config/db');
const db2 = require('../config/db2');

// validations middelware
const subscriptionValidation = require('../middelware/validation/subscription.middelware');

// authentications middelware
const isLoggedin = require('../middelware/authentication/isLoggedin.middelware');
const isAdmin = require('../middelware/authentication/isAdmin.middelware');
const isTeacher = require('../middelware/authentication/isTeacher.middelware');
const isStudent = require('../middelware/authentication/isStudent.middelware');

router.use(express.urlencoded({ extended: true }));
router.use(express.json());


///// TODO: create subscription
// ! need more work and check
router.post('/createSubscription', isLoggedin, isAdmin, subscriptionValidation, async (req, res) => {

    // console.log(1)

    // in case there is error in the middelware data check then send a validation error
    if (!res.locals.validatedData) res.status(400).json({ success: false, msg: "validation error"})
    
    
    // console.log(2)
    // console.log("data: ",res.locals.validatedData)

    // basic date for this request
    let data = res.locals.validatedData
    
    try{
        
        // insert into subscription table the information that coming from the middelware
        let sql = ' INSERT INTO subscription (subscription_title, ar_title, subscription_description, ar_description, price) VALUES(?,?,?,?,?)'
        let submit = await db.query(sql, [ data.title, data.ar_title, data.description, data.ar_description, data.price ])
        
        // console.log(submit)
        // console.log(3)

        // return success with the msg and the new item id
        return res.status(200).json({ success: true, msg : "subscription has been created successfuly" , data,id:submit[0].insertId})
        
    }catch (err) {

        // in case the error is duplicate entry then send this already exist
        if (err.errno == 1062) return res.status(400).json({ success: false, msg:"this record already exist try again with another title" })
        
        // in case the error from db then this is a general error msg for it
        if (err.code) return res.status(404).json({ success: false, msg: err.message, code: err.code, err_no: err.errno, sql_msg: err.sqlMessage })
                
        // this to captrue any error and try to send the error msg if it's applicable.
        return res.status(400).json({ success: false, msg: "Someting went wrong", error: err })
        }

});

// TODO: get all subscription
router.get('/getSubscriptions', async(req,res) => {

    try{
        // get all subscriptions where there status is 1(active)
        let sql = 'SELECT * FROM subscription WHERE status = 1'
        let submit = await db.query(sql)

        // if the result array length is 0 then return false because there is no subscription found.
        if( submit[0].length <= 0 ) return res.status(400).json({ success: false, msg:"there is no subscription found in database"})

        // return success treu with the result list
        return res.status(200).json({ success: true, msg:"success", data: submit[0]})
    }catch (err) {

        // in case the error from db then this is a general error msg for it
        if (err.code) return res.status(404).json({ success: false, msg: err.message, code: err.code, err_no: err.errno, sql_msg: err.sqlMessage })
                
        // this to captrue any error and try to send the error msg if it's applicable.
        return res.status(400).json({ success: false, msg: "Someting went wrong", error: err })
    }

})

// TODO: get all subscription
router.get('/getAllSubscriptions',isLoggedin,isAdmin, async(req,res) => {

    try{
        // get all subscriptions where there status is 1(active)
        let sql = 'SELECT * FROM subscription'
        let submit = await db.query(sql)

        // if the result array length is 0 then return false because there is no subscription found.
        if( submit[0].length <= 0 ) return res.status(400).json({ success: false, msg:"there is no subscription found in database"})

        // return success treu with the result list
        return res.status(200).json({ success: true, msg:"success", data: submit[0]})
    }catch (err) {

        // in case the error from db then this is a general error msg for it
        if (err.code) return res.status(404).json({ success: false, msg: err.message, code: err.code, err_no: err.errno, sql_msg: err.sqlMessage })
                
        // this to captrue any error and try to send the error msg if it's applicable.
        return res.status(400).json({ success: false, msg: "Someting went wrong", error: err })
    }

})

// TODO: delete subscription
router.delete('/subscription', isLoggedin, isAdmin, async(req,res) => {
    
    // basic data
    let title = req.body.title
    let id = req.body.id

    // in case there is no id or title sended with this request return false
    if(!title && !id) res.status(400).json({ success: false, msg:"missing data, id or title"})

    // in case there is id and title in the same request then send false
    if(title && id) res.status(400).json({ success: false, msg:"wrong specifications, use ether id or title not both"})


    try{
        // update the subscription to 0 if the title = title or id = id
        let sql = 'UPDATE subscription SET status = 0 WHERE subscription_title = ?'
        let sql2 = 'UPDATE subscription SET status = 0 WHERE subscription_id = ?'

        // in case the title is available then select sql1 other wise select sql2 by the id
        let submit = await db.query((title)? sql:sql2,(title)? title:id)

        // console.log(submit)

        // if the changedrows is less than 1 then this means this there is no change wich mean there is no record with this id or title.
        // or in this case this record is already not available
        if(submit[0].changedRows < 1) return res.status(400).json({ success: false, msg:"there is no subscription with this title or id"})
        
        // in case this was update by title or id change the format of the msg
        return res.status(200).json({ success: true, msg:(title)? title+" subscription has been deleted":"subscription with "+id+" id has been deleted"})
    }catch (err) {

        // in case the error from db then this is a general error msg for it
        if (err.code) return res.status(404).json({ success: false, msg: err.message, code: err.code, err_no: err.errno, sql_msg: err.sqlMessage })
                
        // this to captrue any error and try to send the error msg if it's applicable.
        return res.status(400).json({ success: false, msg: "Someting went wrong", error: err })
    }

})

// TODO: activate subscription
router.put('/activateSubscription', isLoggedin, isAdmin, async(req,res) => {
    
    // basic data
    let title = req.body.title
    let id = req.body.id

    // in case there is no id or title sended with this request return false
    if(!title && !id) res.status(400).json({ success: false, msg:"missing data, id or title"})

    // in case there is id and title in the same request then send false
    if(title && id) res.status(400).json({ success: false, msg:"wrong specifications, use ether id or title not both"})


    try{
        // update the subscription to 0 if the title = title or id = id
        let sql = 'UPDATE subscription SET status = 1 WHERE subscription_title = ?'
        let sql2 = 'UPDATE subscription SET status = 1 WHERE subscription_id = ?'

        // in case the title is available then select sql1 other wise select sql2 by the id
        let submit = await db.query((title)? sql:sql2,(title)? title:id)

        // console.log(submit)

        // if the changedrows is less than 1 then this means this there is no change wich mean there is no record with this id or title.
        // or in this case this record is already not available
        if(submit[0].changedRows < 1) return res.status(400).json({ success: false, msg:"there is no subscription with this title or id"})
        
        // in case this was update by title or id change the format of the msg
        return res.status(200).json({ success: true, msg:(title)? title+" subscription has been activated":"subscription with "+id+" id has been activated"})
    }catch (err) {

        // in case the error from db then this is a general error msg for it
        if (err.code) return res.status(404).json({ success: false, msg: err.message, code: err.code, err_no: err.errno, sql_msg: err.sqlMessage })
                
        // this to captrue any error and try to send the error msg if it's applicable.
        return res.status(400).json({ success: false, msg: "Someting went wrong", error: err })
    }

})

// TODO: edit subscription
// ! needs more check
router.post('/editSubscription', isLoggedin, isAdmin, subscriptionValidation, async(req,res)=>{
    
    //check if the id is in the body or not, in case it's not there send error
    if (!req.body.id) res.status(400).json({ success: false, msg: "error ID is missing"})
    
    console.log(req.body.id)
    
    // in case there is error in the middelware data check then send a validation error
    if (!res.locals.validatedData) res.status(400).json({ success: false, msg: "validation error"})
    console.log(res.locals.validatedData)
    
    console.log(1)
    try{
        
        // update subscription info whrer the subscription_id == id
        let sql = "UPDATE subscription SET subscription_title = ? , ar_title = ? , subscription_description = ? , ar_description = ? , price = ?  WHERE subscription_id = ?"
        
        let submit = await db.query(sql,[res.locals.validatedData.title, res.locals.validatedData.ar_title, res.locals.validatedData.description,
            res.locals.validatedData.ar_description, res.locals.validatedData.price, req.body.id])
            
         console.log(2)
        // if the changedrows is less than 1 then this means this there is no change wich mean there is no record with this id.
        if(submit[0].changedRows < 1) return res.status(400).json({ success: false, msg:"there is no subscription with your speicification or there is no diffrence in the data"})

        console.log(3)
        // return true in case of success
        return res.status(200).json({ success: true, msg:req.body.title+" subscription has been updated"})
    }catch (err) {

        // in case the error from db then this is a general error msg for it
        if (err.code) return res.status(404).json({ success: false, msg: err.message, code: err.code, err_no: err.errno, sql_msg: err.sqlMessage })
                
        // this to captrue any error and try to send the error msg if it's applicable.
        return res.status(400).json({ success: false, msg: "Someting went wrong", error: err })
    }
})
module.exports=router