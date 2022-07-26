const express = require('express')
const router = express.Router();

require('dotenv').config({ path: `${__dirname}/../.env` });
const db = require('../config/db');
const db2 = require('../config/db2');

// authentications middelware
const isLoggedin = require('../middelware/authentication/isLoggedin.middelware');
const isAdmin = require('../middelware/authentication/isAdmin.middelware');
const isTeacher = require('../middelware/authentication/isTeacher.middelware');
const isStudent = require('../middelware/authentication/isStudent.middelware');

const createBooking = require('../middelware/validation/createBooking.middelware');


router.use(express.urlencoded({ extended: true }));
router.use(express.json());


// router.post('/signup', async (req, res) => {});

// // TODO: find booking by id
router.get('/getbooking/:id', isLoggedin, async (req, res) => {

    let id= req.params.id;

    console.log(id)
    
    try {
        
        let sql = "select * FROM booking WHERE booking_id = ? "
        let result = await db.query(sql,[id])
        console.log(result[0])
        if ( result[0].length < 1 ) return res.status(404).json( { msg:"not found", result:[] } )
        
        return res.status(200).json( { msg: "success", result:result[0] } )

    } catch (err) {
        if (err.code) return res.status(404).json( { msg: err.message, code: err.code, err_no: err.errno, sql_msg: err.sqlMessage } )
        return res.status(400).json({ msg: "something went wrong", err })
    }

});

// // TODO: find all booking sorted by date from futrue to past (admin)
router.get('/getbookings', isLoggedin, isAdmin, async (req, res) => {

    
    try {
        
        let sql = "select * from booking ORDER BY created_at DESC"
        let result = await db.query(sql)
        console.log("0001")
        if ( result[0].length < 1 ) return res.status(404).json( { msg:"nothing found", result:[] } )
        
        return res.status(200).json( { msg: "success", result:result[0] } )

    } catch (err) {
        if (err.code) return res.status(404).json( { msg: err.message, code: err.code, err_no: err.errno, sql_msg: err.sqlMessage } )
        return res.status(400).json({ msg: "something went wrong", err })
    }

});

// TODO: create booking
router.post('/createBooking', isLoggedin ,createBooking, async (req,res)=>{

    // //
    let user_id = res.locals.user.data.user_id
    let validatedData = res.locals.validatedData
    console.log(user_id,validatedData)
    
    try{
        db2.beginTransaction(function (err) {
            console.log(1)
            if (err) { return res.status(400).json({ msg: "error starting transaction for booking creation" }) }

            let sql = 'SELECT * FROM session WHERE session_id = ?'
            db2.query(sql, validatedData.sessionID, async (err, result, fields) => {
                if (err || result.length <= 0) {
                    return db2.rollback(function () {
                        console.log(result)
                        if (result.length <= 0) return res.status(400).json({ msg: "Wrong session ID" })
                        if (err.code == "ER_DUP_ENTRY") return res.status(404).json({ msg: err.message, code: err.code, err_no: err.errno, sql_msg: err.sqlMessage })
                        if (err) return res.status(400).json({ msg: "Someting went wrong", error: err })
                    });// end of rollback #1
                }// end of first if
                console.log("Queury 1 result :")
                console.log(result)
                console.log(2)
                let subscription = result

                sql = "INSERT INTO session (subscriptionID,session_url,start_time,end_time,day_date,teacher_id) VALUES(?,?,?,?,?,?)"
                // db2.query(sql, [validatedData.subscriptionID,validatedData.session_url,validatedData.start_time,validatedData.end_time,new Date(validatedData.day_date),user_id], async (err, result, fields) => {

                //     if (err || result.length <= 0) {
                //         return db2.rollback(function () {
    
                //             // if (result.length <= 0) return res.status(400).json({ msg: "something went wrong trying to inser session" })
                //             if (err.code) return res.status(404).json({ msg: err.message, code: err.code, err_no: err.errno, sql_msg: err.sqlMessage })
                //             if (err) return res.status(400).json({ msg: "Someting went wrong trying to insert session", error: err })
                //         });// end of rollback #1
                //     }// end of second if

                //     console.log(result)
                //     let session = result

                    // db2.commit(function (err) {
                    //     if (err) {
                    //         return db2.rollback(function () {
                    //             // return "Erorr commit query"
                    //             return res.status(400).json({ msg: "error in commitng the data" })
                    //         });
                    //     }
                    //     console.log('success!');

                    //     return res.status(200).json({ msg: "session has been created successfuly" })

                    // });// end of commit

                // }) // end of query 2

            })// end of query 1

        })// end of transaction

    }catch(err){
        res.status(400).json({mssg:"something went wrong"})
    }

    return res.status(200).json({ msg: "ddone", validatedData })

});
// TODO: confirm booking

// TODO: edit booking ******
// TODO: delete booking ******

// TODO: show teacher to select from it
// TODO: show teacher session to select from it


// TODO: payment ******

module.exports=router