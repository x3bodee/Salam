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


router.use(express.urlencoded({ extended: true }));
router.use(express.json());


// router.post('/signup', async (req, res) => {});

// TODO: find booking by id
router.get('/getbooking/:id', isLoggedin, async (req, res) => {

    let id= req.params.id;

    console.log(id)
    
    try {
        
        let sql = "select * FROM booking WHERE booking_id = ? "
        let result = await db.query(sql,[id])
        console.log(result[0])
        if ( result[0].length < 1 ) return res.status(404).json( { msg:"not found" } )
        
        return res.status(200).json( { msg: "success", result:result[0] } )

    } catch (err) {
        if (err.code) return res.status(404).json( { msg: err.message, code: err.code, err_no: err.errno, sql_msg: err.sqlMessage } )
        return res.status(400).json({ msg: "something went wrong", err })
    }

});

// TODO: find all booking sorted by date from futrue to past
// TODO: create booking
// TODO: confirm booking

// TODO: edit booking ******
// TODO: delete booking ******

// TODO: show teacher to select from it
// TODO: show teacher session to select from it


// TODO: payment ******

module.exports=router