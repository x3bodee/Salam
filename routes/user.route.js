
const express = require('express');
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

require('dotenv').config({ path: `${__dirname}/../.env` });
const db = require('../config/db');
const db2 = require('../config/db2');

// validations middelware
const signupValidation = require('../middelware/validation/signup.middelware');
const signinValidation = require('../middelware/validation/signin.middelware');
const teacherAccountRequestValidation = require('../middelware/validation/teacheraccount.middelware');


// authentications middelware
const isLoggedin = require('../middelware/authentication/isLoggedin.middelware');
const isAdmin = require('../middelware/authentication/isAdmin.middelware');
const isTeacher = require('../middelware/authentication/isTeacher.middelware');
const isStudent = require('../middelware/authentication/isStudent.middelware');
const { route } = require('express/lib/application');

const salt = process.env.SALT || 10
const SECRET = process.env.SECRET
router.use(express.urlencoded({ extended: true }));
router.use(express.json());


// * this route for testing the authentications
router.get('/test', isLoggedin, isAdmin, (req, res) => {
    res.send("hi from user route ")
})



router.post('/signup', signupValidation, async (req, res) => {

    // console.log("1")

    if (res.locals.erorrslog) { return res.status(400).json({ msg: "validation error", errors: res.locals.erorrslog }) }

    else {

        if (!res.locals.validatedData) return res.status(500).json({ msg: "validation internal error" });

        // console.log("2")
        // console.log(res.locals.validatedData.password)

        try {
            // console.log(salt)

            let hashedPassword = await bcrypt.hash(res.locals.validatedData.password, parseInt(salt))

            // console.log("3")
            // console.log(hashedPassword)

            res.locals.validatedData.password = hashedPassword

            // console.log(res.locals.validatedData)
            // let { Fname, Lname, password, gender, email, country, birth_date, language } = req.locals.validatedData
            // console.log(Fname)
            // console.log("4")

            let Fname = res.locals.validatedData.Fname
            let Lname = res.locals.validatedData.Lname
            let password = res.locals.validatedData.password
            let gender = res.locals.validatedData.gender
            let email = res.locals.validatedData.email
            let country = res.locals.validatedData.country
            let birth_date = res.locals.validatedData.birth_date
            let language = res.locals.validatedData.language

            let sql = ' INSERT INTO user (Fname,Lname,email,password,gender,country,birth_date,language) VALUES(?,?,?,?,?,?,?,?)'
            let submit = await db.query(sql, [Fname = Fname, Lname = Lname, email = email, password = password, gender, country = country, birth_date = birth_date, language = language])
            // console.log(submit)
            return res.status(200).json({ msg: "user has been created successfuly", data: res.locals.validatedData })

        } catch (e) {

            if (e.code == "ER_DUP_ENTRY") return res.status(404).json({ msg: e.message, code: e.code, err_no: e.errno, sql_msg: e.sqlMessage })

            return res.status(404).json(e)
        }
    }
})



// TODO: signin
router.post('/signin', signinValidation, async (req, res) => {
    console.log('inside signin post request')
    if (res.locals.erorrslog) { return res.status(400).json({ msg: "validation error", errors: res.locals.erorrslog }) }
    else {
        if (!res.locals.validatedSigninData) return res.status(500).json({ msg: "validation internal error" });
        console.log("1")
        console.log(res.locals.validatedSigninData)

        try {
            let email = res.locals.validatedSigninData.email
            let password = res.locals.validatedSigninData.password
            //// let hashedPassword =  await bcrypt.hash(password,parseInt(salt))
            let sql = 'SELECT * FROM user WHERE email = ?'
            let submit = await db.query(sql, email)

            //// console.log(submit[0].length)

            if (submit[0].length === 0) return res.status(404).json({ msg: "Wrong email or password" })
            else {

                let passIsValid = await bcrypt.compare(password, submit[0][0].password)
                //// console.log(passIsValid)

                let data = {
                    user_id: submit[0][0].user_id,
                    userType: submit[0][0].userType,
                    teach_status: submit[0][0].teach_status,
                    Fname: submit[0][0].Fname,
                    Lname: submit[0][0].Lname,
                }

                const token = await jwt.sign({ data }, SECRET, { expiresIn: 604800 })

                if (passIsValid) return res.status(200).json({ msg: "user has been logged in successfuly", token })
                else return res.status(404).json({ msg: "Wrong email or password" })

            }

        } catch (e) {
            console.log(e)
            return res.status(404).json(e)
        }

    }

})


// TODO: sginout -- 
// ! this from front end just delete the token

// TODO: create requestr for teacher account (user)
// ! teacherAccountRequestValidation middelware function needs more validation for CV-url
router.post('/createTeachReq', isLoggedin, isStudent, teacherAccountRequestValidation, async (req, res) => {

    if (!res.locals.validatedData) res.status(400).json({ msg: "Invalid request" })

    let userID = res.locals.user.data.user_id
    let description = res.locals.validatedData.description
    let CV_url = res.locals.validatedData.CV_url
    let yearsOfExperience = res.locals.validatedData.yearsOfExperience
    let status = res.locals.validatedData.status
    let status_txt = res.locals.validatedData.status_txt

    try {
        let sql = 'SELECT userID,status,status_txt FROM request WHERE userID = ? AND (status = 2 OR status = 1 )'
        let submit = await db.query(sql, [userID = userID])

        let records = submit[0]
        console.log(submit[0])

        if (records.length > 0) return res.status(400).json({ msg: "your already have an order under revision, or you already a teacher" })

        sql = ' INSERT INTO request (userID,description,CV_url,yearsOfExperience,status,status_txt) VALUES(?,?,?,?,?,?)'
        submit = await db.query(sql, [userID = userID, description = description, CV_url = CV_url, yearsOfExperience = yearsOfExperience, status = status, status_txt = status_txt])
        console.log(submit)
        return res.status(200).json({ msg: "your create request has been send successfuly" })
    } catch (e) {
        if (e.code == "ER_DUP_ENTRY") return res.status(404).json({ msg: e.message, code: e.code, err_no: e.errno, sql_msg: e.sqlMessage })
        if (e.code == "ER_BAD_NULL_ERROR") return res.status(404).json({ msg: e.message, code: e.code, err_no: e.errno, sql_msg: e.sqlMessage })
        return res.status(400).json(e)
    }



})

// TODO: edit request for teacher account (user)
router.post('/editTeachReq', isLoggedin, isStudent, teacherAccountRequestValidation, async (req, res) => {

    if (!res.locals.validatedData) res.status(400).json({ msg: "Invalid request" })

    let userID = res.locals.user.data.user_id
    let description = res.locals.validatedData.description
    let CV_url = res.locals.validatedData.CV_url
    let yearsOfExperience = res.locals.validatedData.yearsOfExperience
    let request_id = 1

    if (req.body.request_id) request_id = req.body.request_id
    console.log("sss")
    console.log(request_id)
    try {

        let sql = ' UPDATE request SET description = ?, CV_url = ?, yearsOfExperience = ? WHERE request_id = ? && userID = ?'
        let submit = await db.query(sql, [description, CV_url, yearsOfExperience, request_id, userID])
        console.log(submit)
        return res.status(200).json({ msg: "your update request has been send successfuly" })

    } catch (e) {
        if (e.code == "ER_DUP_ENTRY") return res.status(404).json({ msg: e.message, code: e.code, err_no: e.errno, sql_msg: e.sqlMessage })
        if (e.code == "ER_BAD_NULL_ERROR") return res.status(404).json({ msg: e.message, code: e.code, err_no: e.errno, sql_msg: e.sqlMessage })
        return res.status(400).json(e)
    }


})

// TODO: get all user requests for teacher account (user)
// ! may need to add teacher permision
router.get('/getMyTeachReq', isLoggedin, isStudent, async (req, res) => {

    let userID = res.locals.user.data.user_id

    try {

        let sql = 'SELECT * FROM request WHERE userID = ?'
        let submit = await db.query(sql, [userID])
        console.log(submit[0])
        return res.status(200).json({ msg: "success", data: submit[0] })

    } catch (e) {
        if (e.code == "ER_DUP_ENTRY") return res.status(404).json({ msg: e.message, code: e.code, err_no: e.errno, sql_msg: e.sqlMessage })
        if (e.code == "ER_BAD_NULL_ERROR") return res.status(404).json({ msg: e.message, code: e.code, err_no: e.errno, sql_msg: e.sqlMessage })
        return res.status(400).json(e)
    }


})

// TODO: get all unrevisioned requests for teacher account (admin)
router.get('/getAllNewTeachReq', isLoggedin, isAdmin, async (req, res) => {

    // let userID = res.locals.user.data.user_id

    try {

        let sql = 'SELECT * FROM request WHERE status = 2'
        let submit = await db.query(sql)
        console.log(submit[0])
        return res.status(200).json({ msg: "success", data: submit[0] })

    } catch (e) {
        if (e.code == "ER_DUP_ENTRY") return res.status(404).json({ msg: e.message, code: e.code, err_no: e.errno, sql_msg: e.sqlMessage })
        if (e.code == "ER_BAD_NULL_ERROR") return res.status(404).json({ msg: e.message, code: e.code, err_no: e.errno, sql_msg: e.sqlMessage })
        return res.status(400).json(e)
    }


})

// TODO: approve or disapprove teacher account request (admin)
// // not done need to check if its work fine or not
router.post('/processTechReq', isLoggedin, isAdmin, async (req, res) => {

    console.log("inside processTechReq")
    console.log(req.body)
    let errors = []

    let request_id = undefined
    let status = undefined
    let status_txt = undefined
    let userID = undefined

    let accept = process.env.ACCEPT || 1
    let reject = process.env.REJECT || 0

    if (!req.body.request_id) errors.push('missing field Request ID')
    if (!req.body.userID) errors.push('missing field User ID')
    
    // if (!req.body.status) errors.push('missing field Status')

    if ( !( req.body.status > -1 && req.body.status < 2 ) ) errors.push('Status input is invalid')
    
    if (!req.body.status_txt) errors.push('missing field Text')


    if (errors.length > 0) return res.status(400).json({ msg: "Invalid input", erorrslog: errors })

    request_id = req.body.request_id
    userID = req.body.userID
    status = (req.body.status) ? 1 : 0;
    status_txt = req.body.status_txt
    console.log(11111111)
    // for rejection
    if (status === 0) {
        try {

            let sql = 'UPDATE request SET status = '+reject+', status_txt = ? WHERE request_id = ? && userID = ?'
            let submit = await db.query(sql, [status_txt, request_id, userID])
            console.log(submit)
            return res.status(200).json({ msg: "user request teacher account has been rejected successfuly"})

        } catch (e) {

            if (e.code == "ER_DUP_ENTRY") return res.status(404).json({ msg: e.message, code: e.code, err_no: e.errno, sql_msg: e.sqlMessage })
            if (e.code == "ER_BAD_NULL_ERROR") return res.status(404).json({ msg: e.message, code: e.code, err_no: e.errno, sql_msg: e.sqlMessage })
            return res.status(400).json(e)

        }

        // for accepting
    } else if (status === 1) {

        try {

            console.log(222)
            db2.beginTransaction(function (err) {
                //
                console.log(1)
                if (err) { return res.status(400).json({ msg: "error starting change student to teacher" }) }
                let sql = 'SELECT userType FROM user WHERE user_id = ?'
                db2.query(sql, [userID], (err, result, fields) => {
                    // console.log(result[0] != 2)
                    if (err || result[0] != 2) {
                        return db2.rollback(function () {
                            // return "Erorr in update request query"
                            if( result[0] != 2 ) return res.status(400).json({ msg: "user ether a teacher or admin"})
                            if( err ) return res.status(400).json({ msg: "Someting went wrong", error:err })
                            
                        });// end of rollback #1
                    }
                    console.log(2)
                    sql = 'UPDATE request SET status = ' + accept + ', status_txt = ? WHERE request_id = ? && userID = ?'
                    db2.query(sql, [status_txt, request_id, userID], (err, result, fields) => {
                        console.log(result.affectedRows)
                        if (err || result.affectedRows === 0) {
                            return db2.rollback(function () {
                                // return "Erorr in update request query"
                                return res.status(400).json({ msg: "error user ID or request ID is wrong" })
                            });// end of rollback #1
                        }
                        console.log(3)
                        sql = "UPDATE user SET userType = 3 WHERE user_id = ?"
                        db2.query(sql, [userID], (err, result, fields) => {
                            if (err || result.affectedRows === 0) {
                                return db2.rollback(function () {
                                    // return "Erorr in update user query"
                                    return res.status(400).json({ msg: "error in updating user data" })
                                });
                            }

                            db2.commit(function (err) {
                                if (err) {
                                    return db2.rollback(function () {
                                        // return "Erorr commit query"
                                        return res.status(400).json({ msg: "error in commitng the data" })
                                    });
                                }
                                console.log('success!');
                                return res.status(200).json({ msg: "user request teacher account has been accepted successfuly" })

                            });// end of commit        
                        })// end of query 2
                    })// end of query 2
                })// end of query 1
            })// end of beginTransaction function

        }catch(e){
            return res.status(400).json({ msg: "error in trying to change student to teacher permisson" ,error:e}) 
        }

    //         await db.getConnection( async(err,conn) => {
    //             console.log(12)
    //         await conn.beginTransaction( async (err) =>{
    //             console.log(34)
    //             if (err) { throw err; }

    //             let sql = 'UPDATE request SET status = '+accept+', status_txt = ? WHERE request_id = ? && userID = ?'
    //             await conn.query(sql, [status_txt, request_id, userID], async (err,result,fields) =>{
    //                 if (err) {
    //                     return await conn.rollback(function() {
    //                         return "Erorr in update request query"
    //                         // throw err;
    //                     });}
                
    //             console.log(submit)
    //             console.log(56)
    //             sql = "UPDATE user SET userType = 3 WHERE userID = ?"
    //             await conn.query(sql, [ userID ], async (err,result,fields) =>{
    //                 if (err) {
    //                     return await conn.rollback(function() {
    //                         return "Erorr in update user query"
    //                         // throw err;
    //                     });}
                
    //             console.log(78)
    //             conn.commit( async function(err) {
    //                 if (err) {
    //                   return await conn.rollback(function() {
    //                     return "Erorr commit query"
    //                     // throw err;
    //                   });
    //                 }
    //                 console.log('success!');
    //                 return res.status(200).json({ msg: "user request teacher account has been accepted successfuly"})
    //             });// end of commit
    //         });// end of query 2
    //     })// end of query 1
    //             console.log(910)
    //         }); // end of transaction
           
    //         })// end of getconn
    //     } catch (e) {
    //         return await conn.rollback(function(err) {
    //             console.log(err)
    //             return "Erorr beginTransaction query"
    //             // throw error;
    //         });
    //     }
    // }
    // console.log(333)

    //// try {
    //     // * this for 
    // //    let sql = 'UPDATE request SET status = ?, status_txt = ? WHERE request_id = ?'
    // //    let submit = await db.query(sql, [status, status_txt, request_id])
    //  //   console.log(submit)
    //  //   return res.status(200).json({ msg: "your update request has been send successfuly" })

    //// } catch (e) {
    ////     if (e.code == "ER_DUP_ENTRY") return res.status(404).json({ msg: e.message, code: e.code, err_no: e.errno, sql_msg: e.sqlMessage })
    // //    if (e.code == "ER_BAD_NULL_ERROR") return res.status(404).json({ msg: e.message, code: e.code, err_no: e.errno, sql_msg: e.sqlMessage })
    // //    return res.status(400).json(e)
    
}


})

// TODO: find user
// TODO: edit user info
// ? TODO: delete user ****



module.exports = router;