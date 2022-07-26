const express = require('express')
const router = express.Router();

require('dotenv').config({ path: `${__dirname}/../.env` });
const db = require('../config/db');
const db2 = require('../config/db2');

// validations middelware
const sessionValidation = require('../middelware/validation/session.middelware');
const submitSessionEndValidation = require('../middelware/validation/submitSessionEnd.middelware');

// authentications middelware
const isLoggedin = require('../middelware/authentication/isLoggedin.middelware');
const isAdmin = require('../middelware/authentication/isAdmin.middelware');
const isTeacher = require('../middelware/authentication/isTeacher.middelware');
const isStudent = require('../middelware/authentication/isStudent.middelware');
const { BD } = require('../additional_recurce/countryCodes');

router.use(express.urlencoded({ extended: true }));
router.use(express.json());


// TODO: create session
// ! needs more validation + need to check the durration and start time, end time
// ! also need to check if there is already a session for this teacher with this time
router.post('/', isLoggedin, isTeacher, sessionValidation, async (req, res) => {
    let user_id = res.locals.user.data.user_id
    let validatedData = res.locals.validatedData
    console.log(user_id)
    try{
        db2.beginTransaction(function (err) {
            console.log(1)
            if (err) { return res.status(400).json({ msg: "error starting transaction for session creation" }) }

            let sql = 'SELECT duration,subscription_title FROM subscription WHERE subscription_id = ?'
            db2.query(sql, validatedData.subscriptionID, async (err, result, fields) => {
                if (err || result.length <= 0) {
                    return db2.rollback(function () {
                        console.log(result)
                        if (result.length <= 0) return res.status(400).json({ msg: "Wrong subscription ID" })
                        if (err.code == "ER_DUP_ENTRY") return res.status(404).json({ msg: err.message, code: err.code, err_no: err.errno, sql_msg: err.sqlMessage })
                        if (err) return res.status(400).json({ msg: "Someting went wrong", error: err })
                    });// end of rollback #1
                }// end of first if
                console.log(result)
                console.log(2)
                let subscription = result

                sql = "INSERT INTO session (subscriptionID,session_url,start_time,end_time,day_date,teacher_id) VALUES(?,?,?,?,?,?)"
                db2.query(sql, [validatedData.subscriptionID,validatedData.session_url,validatedData.start_time,validatedData.end_time,new Date(validatedData.day_date),user_id], async (err, result, fields) => {

                    if (err || result.length <= 0) {
                        return db2.rollback(function () {
    
                            // if (result.length <= 0) return res.status(400).json({ msg: "something went wrong trying to inser session" })
                            if (err.code) return res.status(404).json({ msg: err.message, code: err.code, err_no: err.errno, sql_msg: err.sqlMessage })
                            if (err) return res.status(400).json({ msg: "Someting went wrong trying to insert session", error: err })
                        });// end of rollback #1
                    }// end of second if

                    console.log(result)
                    let session = result

                    db2.commit(function (err) {
                        if (err) {
                            return db2.rollback(function () {
                                // return "Erorr commit query"
                                return res.status(400).json({ msg: "error in commitng the data" })
                            });
                        }
                        console.log('success!');

                        return res.status(200).json({ msg: "session has been created successfuly" })

                    });// end of commit

                }) // end of query 2

            })// end of query 1

        })// end of transaction

    }catch(err){
        res.status(400).json({mssg:"something went wrong"})
    }
    
})

// TODO: find session by teacher ID
router.get('/byTeacherid',isLoggedin, async (req,res) => {
    if ( !req.query.teacher_id ) return res.status(400).json({msg: "teacher id is missing"})
    console.log(req.query.teacher_id)
    let teacher_id = req.query.teacher_id

    try {
        let sql = "SELECT * FROM session WHERE teacher_id = ? AND session_status = 1"
        let submit = await db.query(sql,teacher_id)

        if ( submit[0].length < 1) return res.status(404).json({msg: "there is no session available"})
        console.log(submit)
        return res.status(404).json({data:submit[0]})

    }catch(err){
        if (err.code) return res.status(404).json({ msg: err.message, code: err.code, err_no: err.errno, sql_msg: err.sqlMessage })
        return res.status(400).json({msg: "something went wrong", err})
    }

})

// TODO: find session
router.get('/',isLoggedin, isAdmin, async (req,res) => {

    try {
        let sql = "SELECT * FROM session WHERE session_status = 1"
        let submit = await db.query(sql)

        if ( submit[0].length < 1) return res.status(404).json({msg: "there is no session available"})
        console.log(submit)
        return res.status(404).json({data:submit[0]})

    }catch(err){
        if (err.code) return res.status(404).json({ msg: err.message, code: err.code, err_no: err.errno, sql_msg: err.sqlMessage })
        return res.status(400).json({msg: "something went wrong", err})
    }

})

// TODO: get teacher by subscription and sessions
router.get('/selectTeacher', isLoggedin, async (req,res) => {
    if(!req.query.subscriptionID) return res.status(400).json({msg:"missing subscription ID"})
    console.log("start")
    try{
        
        let sql = 'SELECT session_id,teacher_id,Fname,Lname FROM session JOIN user ON teacher_id = user_id WHERE subscriptionID = ? AND session_status =1'
        let submit = await db.query(sql,req.query.subscriptionID)
        if (submit[0].length < 1) return res.status(404).json({msg: "not found"})
        console.log(submit[0])
        return res.status(200).json({msg: "success", result: submit[0]})
    }catch(err){
        if (err.code) return res.status(404).json({ msg: err.message, code: err.code, err_no: err.errno, sql_msg: err.sqlMessage })
        return res.status(400).json({msg: "something went wrong", err})
    }
})

// TODO: delete session
router.delete('/',isLoggedin, isTeacher, async (req,res) => {
    if ( !req.body.session_id ) return res.status(400).json({msg: "session id is missing"})
    console.log(req.body.session_id)
    let session_id = req.body.session_id

    try {
        let sql = "DELETE FROM session WHERE session_status = 1 AND session_id = ?"
        let submit = await db.query(sql,session_id)

        if ( !submit[0].affectedRows) return res.status(404).json({msg: "there is no session with your specification"})
        console.log(submit)
        return res.status(404).json({msg:"session has been deleted successfuly"})

    }catch(err){
        if (err.code) return res.status(404).json({ msg: err.message, code: err.code, err_no: err.errno, sql_msg: err.sqlMessage })
        return res.status(400).json({msg: "something went wrong", err})
    }
    
})

// // TODO: edit session


// TODO: submit sesstion end (teacher)
router.post('/endSession',isLoggedin, isTeacher, submitSessionEndValidation, async (req,res) => {
    let data = res.locals.validatedData
    try{
        
        db2.beginTransaction((err)=>{
            if (err) return res.status(404).json({msg:"error in starting transaction"})

            console.log(1)
            let sql = 'SELECT teacher_id FROM session WHERE session_id = ? AND session_status = 0'
            db2.query(sql,[data.sessionID], (err, result, fields) => {
                if (err){
                    return db2.rollback(()=>{
                        if (err.code) return res.status(404).json({ msg: err.message, code: err.code, err_no: err.errno, sql_msg: err.sqlMessage })
                        return res.status(404).json({ msg: "error in first query" })
                    })// end of rollback
                }// end of if err
                
                if(!result.length) return db2.rollback(()=>{ 
                    return res.status(404).json({ msg:"not found" }) 
                })// end of rollback
                
                if(result[0].teacher_id !== data.teacher_id) return db2.rollback(()=>{
                    return res.status(400).json({ msg:"only the user that created the session can end it" })
                })// end of rollback
                 


                console.log(2)
                sql = 'INSERT INTO sessionconfirmation (sessionID,teacher_review,teacher_id) VALUES(?,?,?)'
                db2.query(sql,[ data.sessionID, data.teacher_review, data.teacher_id ] , (err, result, fields) =>{
                    if (err || result.length <= 0){
                        return db2.rollback(()=>{
                            if (err.code) return res.status(404).json({ msg: err.message, code: err.code, err_no: err.errno, sql_msg: err.sqlMessage })
                            return res.status(404).json({ msg: "error in trying to insert" })
                        })// end of rollback
                    }// end of if err

                    console.log(3)
                    db2.commit((err) => {
                        if (err){
                            return db2.rollback(()=>{
                                if (err.code) return res.status(404).json({ msg: err.message, code: err.code, err_no: err.errno, sql_msg: err.sqlMessage })
                                return res.status(404).json({ msg: "error in trying to insert" })
                            })// end of rollback
                        }// end of if err
                        
                        console.log("submission end")
                        return res.status(200).json({msg: "success"})
                        
                    })// end of commit

                })// end of the second query
            })// end of first query
        })// end of transaction


    }catch(err){
        if (err.code) return res.status(404).json({ msg: err.message, code: err.code, err_no: err.errno, sql_msg: err.sqlMessage })
        return res.status(400).json({msg: "something went wrong", err})
    }
})


// TODO: get all the confirmed session end under revision (admin)
router.get('/confirmedSessionEnd', isLoggedin, isAdmin, async (req,res) =>{
    console.log(1)
    
    try {
        
        let sql = "select confirmation_id, sessionID, teacher_id, teacher_review, status FROM sessionconfirmation WHERE status = 0 "
        let result = await db.query(sql)
        console.log(result[0])
        if ( result[0].length < 1 ) return res.status(404).json( { msg:"not found" } )
        
        return res.status(200).json( { msg: "success", result:result[0] } )

    } catch (err) {
        if (err.code) return res.status(404).json( { msg: err.message, code: err.code, err_no: err.errno, sql_msg: err.sqlMessage } )
        return res.status(400).json({ msg: "something went wrong", err })
    }
})

// TODO: confirm sesstion end (admin)
router.put('/confirmSessionEnd',isLoggedin, isAdmin, async (req,res) => {
    let errors = []
    if ( !req.body.confirmation_id ) errors.push("Confirmation ID")
    if ( !req.body.admin_review || req.body.admin_review.length < 1 ) errors.push("Admin Review")
    // console.log (req.body.status === undefined)
    if ( req.body.status === undefined || ( req.body.status > 1 || req.body.status < 0)) errors.push("status")
    // console.log(res.locals.user.data.user_id)
    if ( !res.locals.user.data.user_id ) errors.push("user")
    console.log(errors.length)
    console.log(req.body)
    if ( errors.length ) return res.status(400).json({ msg: "missing inputs", input:errors })

    let admin_id = res.locals.user.data.user_id

    let confirmation_id = req.body.confirmation_id
    let admin_review = req.body.admin_review
    let status = req.body.status

    try {
       
        let sql = "UPDATE sessionconfirmation set admin_id = ?, admin_review = ?, status = ?  WHERE confirmation_id = ? AND status = 0"
        let submit = await db.query(sql,[ admin_id, admin_review, status, confirmation_id ])
        console.log(submit)
        if (submit[0].affectedRows === 0) return res.status(400).json({msg:"err in affected rows"})

        return res.status(200).json({msg:"respond has been send", result: submit[0]})

    } catch (err) {
        if (err.code) return res.status(404).json( { msg: err.message, code: err.code, err_no: err.errno, sql_msg: err.sqlMessage } )
        return res.status(400).json({ msg: "something went wrong", err })
    }
    
})






module.exports = router 