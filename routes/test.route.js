const express = require('express')
const router = express.Router();

require('dotenv').config({ path: `${__dirname}/../.env` });
const db = require('../config/db');
const db2 = require('../config/db2');
const db_tran = require('../config/db_tran');

// authentications middelware
const isLoggedin = require('../middelware/authentication/isLoggedin.middelware');
const isAdmin = require('../middelware/authentication/isAdmin.middelware');
const isTeacher = require('../middelware/authentication/isTeacher.middelware');
const isStudent = require('../middelware/authentication/isStudent.middelware');
const pool = require('../config/db');



router.use(express.urlencoded({ extended: true }));
router.use(express.json());


// // TODO: find booking by id
router.get('/getAll/:id', async (req, res) => {

    let id = req.params.id;
    console.log(id)
    let conn = null;
    try {
        
        await db2.query("START TRANSACTION");
        let [response,meta] = await db2.query("select * from booking where booking_id = ?",id);
        console.log(response)
        await db2.query("COMMIT");
    } catch (err) {
        if (conn) await db2.query("ROLLBACK");
        throw err;
    }finally {
        if (conn) await db2.release();
      }
    
});

module.exports = router;