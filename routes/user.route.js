
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
const passwordValidation = require('../middelware/validation/changePassword.middelware');
const editUserInfoValidation = require('../middelware/validation/editUserInfo.middelware');


// authentications middelware
const isLoggedin = require('../middelware/authentication/isLoggedin.middelware');
const isAdmin = require('../middelware/authentication/isAdmin.middelware');
const isTeacher = require('../middelware/authentication/isTeacher.middelware');
const isStudent = require('../middelware/authentication/isStudent.middelware');



const salt = process.env.SALT || 10
const SECRET = process.env.SECRET
const EXPIRESIN = process.env.EXPIRESIN || 604800

router.use(express.urlencoded({ extended: true }));
router.use(express.json());


// * this route for testing the authentications
router.get('/test', isLoggedin, (req, res) => {
    res.send("hi from user route ")
})



router.post('/signup', signupValidation, async (req, res) => {

    // console.log("1")

    if (res.locals.erorrslog) { return res.status(400).json({ msg: "validation error", errors: res.locals.erorrslog }) }

    else {

        if (!res.locals.validatedData) return res.status(500).json({ msg: "validation internal error" });

        try {

            let hashedPassword = await bcrypt.hash(res.locals.validatedData.password, parseInt(salt))
            res.locals.validatedData.password = hashedPassword

            let Fname = res.locals.validatedData.Fname
            let Lname = res.locals.validatedData.Lname
            let password = res.locals.validatedData.password
            let gender = res.locals.validatedData.gender
            let email = res.locals.validatedData.email
            let country = res.locals.validatedData.country
            let birth_date = res.locals.validatedData.birth_date
            let language = res.locals.validatedData.language

            console.log(222)
            db2.beginTransaction(function (err) {
                //
                console.log(1)
                if (err) { return res.status(400).json({ msg: "error starting change student to teacher" }) }
                let sql = ' INSERT INTO user (Fname,Lname,email,password,gender,country,birth_date,language) VALUES(?,?,?,?,?,?,?,?)'
                db2.query(sql, [Fname = Fname, Lname = Lname, email = email, password = password, gender, country = country, birth_date = birth_date, language = language], async (err, result, fields) => {
                    // console.log(result[0] != 2)
                    if (err) {
                        return db2.rollback(function () {
                            if (err.code == "ER_DUP_ENTRY") return res.status(404).json({ msg: err.message, code: err.code, err_no: err.errno, sql_msg: err.sqlMessage })
                            if (err) return res.status(400).json({ msg: "Someting went wrong", error: err })
                        });// end of rollback #1
                    }
                    console.log("test")
                    console.log(result.insertId)
                    let data = {
                        user_id: result.insertId,
                        userType: 2,
                        teach_status: 0,
                        Fname: Fname,
                        Lname: Lname,
                    }

                    const token = await jwt.sign({ data }, SECRET, { expiresIn: EXPIRESIN })
                    let user = await jwt.verify(token, SECRET)

                    console.log(user.exp)
                    let expiresIn = new Date(user.exp * 1000)

                    // submit = await db.query( sql, [ user_id = data.user_id, token = token, expire_date = expiresIn ] )

                    console.log(2)
                    sql = 'INSERT INTO logs (user_id,token,expire_date) VALUES(?,?,?)'
                    db2.query(sql, [data.user_id, token, expiresIn], (err, result, fields) => {

                        if (err) {
                            return db2.rollback(function () {
                                if (err.code == "ER_DUP_ENTRY") return res.status(404).json({ msg: err.message, code: err.code, err_no: err.errno, sql_msg: err.sqlMessage })
                                return res.status(400).json({ msg: "error user ID or request ID is wrong" })
                            });// end of rollback #1
                        }
                        console.log(3)

                        db2.commit(function (err) {
                            if (err) {
                                return db2.rollback(function () {
                                    // return "Erorr commit query"
                                    return res.status(400).json({ msg: "error in commitng the data" })
                                });
                            }
                            console.log('success!');

                            return res.status(200).json({ msg: "user has been created successfuly", token: token })

                        });// end of commit        

                    })// end of query 2
                })// end of query 1
            })// end of beginTransaction function

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


            console.log(222)
            db2.beginTransaction(function (err) {
                //
                console.log(1)
                if (err) { return res.status(400).json({ msg: "error starting change student to teacher" }) }
                let sql = ' SELECT * FROM user WHERE email = ? '
                db2.query(sql, email, async (err, result, fields) => {
                    // console.log(result[0] != 2)
                    if (err || result.length <= 0) {
                        return db2.rollback(function () {

                            if (result.length <= 0) return res.status(400).json({ msg: "Wrong email or password" })
                            if (err.code == "ER_DUP_ENTRY") return res.status(404).json({ msg: err.message, code: err.code, err_no: err.errno, sql_msg: err.sqlMessage })
                            if (err) return res.status(400).json({ msg: "Someting went wrong", error: err })
                        });// end of rollback #1
                    }
                    console.log(result)
                    console.log(result[0].password)
                    let passIsValid = await bcrypt.compare(password, result[0].password)

                    if (passIsValid) {

                        
                        let data = {
                            user_id: result[0].user_id,
                            userType: result[0].userType,
                            teach_status: result[0].teach_status,
                            Fname: result[0].Fname,
                            Lname: result[0].Lname,
                        }

                        const token = await jwt.sign({ data }, SECRET, { expiresIn: EXPIRESIN })
                        let user = await jwt.verify(token, SECRET)
                        console.log(user.exp)
                        let expiresIn = new Date(user.exp * 1000)
                        
                        console.log(2)
                        
                        sql = 'UPDATE logs SET token = ?, expire_date = ?, status = ? WHERE user_id = ?'
                        db2.query(sql, [token, expiresIn, 1, data.user_id], (err, result, fields) => {

                            if (err) {
                                return db2.rollback(function () {

                                    if (e.code == "ER_BAD_NULL_ERROR") return res.status(404).json({ msg: e.message, code: e.code, err_no: e.errno, sql_msg: e.sqlMessage })
                                    if (err.code == "ER_DUP_ENTRY") return res.status(404).json({ msg: err.message, code: err.code, err_no: err.errno, sql_msg: err.sqlMessage })
                                    return res.status(400).json({ msg: "error user ID or request ID is wrong" })

                                });// end of rollback #1
                            }
                            console.log(3)

                            db2.commit(function (err) {
                                if (err) {
                                    return db2.rollback(function () {
                                        // return "Erorr commit query"
                                        return res.status(400).json({ msg: "error in commitng the data" })
                                    });
                                }
                                console.log('success!');
                                return res.status(200).json({ msg: "user has been logged in successfuly", token })

                            });// end of commit        

                        })// end of query 2
                    }// end of if
                    else return res.status(404).json({ msg: "Wrong email or password" })
                })// end of query 1
            })// end of beginTransaction function

        } catch (e) {

            if (e.code == "ER_BAD_NULL_ERROR") return res.status(404).json({ msg: e.message, code: e.code, err_no: e.errno, sql_msg: e.sqlMessage })
            if (err.code == "ER_DUP_ENTRY") return res.status(404).json({ msg: err.message, code: err.code, err_no: err.errno, sql_msg: err.sqlMessage })

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

    if (!(req.body.status > -1 && req.body.status < 2)) errors.push('Status input is invalid')

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

            let sql = 'UPDATE request SET status = ' + reject + ', status_txt = ? WHERE request_id = ? && userID = ?'
            let submit = await db.query(sql, [status_txt, request_id, userID])
            console.log(submit)
            return res.status(200).json({ msg: "user request teacher account has been rejected successfuly" })

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
                            if (result[0] != 2) return res.status(400).json({ msg: "user ether a teacher or admin" })
                            if (err) return res.status(400).json({ msg: "Someting went wrong", error: err })

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

        } catch (e) {
            return res.status(400).json({ msg: "error in trying to change student to teacher permisson", error: e })
        }


    }


})

// TODO: get all user user
router.get('/getAllUsers', isLoggedin, isAdmin, async (req, res) => {
    // lol
    let sql = 'SELECT * FROM user RIGHT JOIN usertype ON usertype_id = userType ;'

    let submit = 0
    console.log(1)
    try { submit = await db.query(sql) }
    catch (e) {
        if (e.code == "ER_BAD_NULL_ERROR") return res.status(400).json({ msg: e.message, code: e.code, err_no: e.errno, sql_msg: e.sqlMessage })
        return res.status(400).json({ msg: e.message, code: e.code, err_no: e.errno, sql_msg: e.sqlMessage })
    }
    if (!submit) return res.status(400).json({ msg: 'error' })
    let d = submit[0].map((e) => {
        return { user_id: e.user_id, Fname: e.Fname, Lname: e.Lname, gender: e.gender, email: e.email, country: e.country, birth_date: e.birth_date, language: e.language, UserType: e.userTitle, usertype_id: e.userType_id }
    })
    console.log(d)
    return res.status(200).json({ data: d })

})
// TODO: find user (teacher)
router.get('/getTeacher/', isLoggedin, (req, res) => {
    console.log('inside get teacher by id or email , or full name')
    let id = undefined
    let name = undefined
    let email = undefined

    if (req.query.id) id = req.query.id
    if (req.query.name) name = req.query.name.split(' ')[0]
    if (req.query.email) email = req.query.email

    if (id === undefined && name === undefined && email === undefined) return res.status(400).json({ msg: 'you need to send email or id or first name' })

    let sql = " SELECT * FROM user INNER JOIN usertype ON usertype_id = userType WHERE userType = 3 AND ( Fname LIKE ? OR  email LIKE ? OR user_id LIKE ? ) ";
    db.query(sql, [name + "%", email + "%", id + "%"]).then((ele) => {
        console.log(ele[0])

        if (ele[0].length < 1) return res.status(200).json({ msg: "no item with your speicification has been found" })

        return res.status(200).json({
            data: ele[0].map((e) => {
                return { user_id: e.user_id, Fname: e.Fname, Lname: e.Lname, gender: e.gender, email: e.email, country: e.country, birth_date: e.birth_date, language: e.language, UserType: e.userTitle, usertype_id: e.userType_id }
            })
        })

    }).catch(err => {
        console.log(err)
    })

})

router.get('/getUser/', isLoggedin, isAdmin, (req, res) => {
    console.log('inside get teacher by id or email , or full name')
    let id = undefined
    let name = undefined
    let email = undefined

    if (req.query.id) id = req.query.id
    if (req.query.name) name = req.query.name.split(' ')[0]
    if (req.query.email) email = req.query.email

    if (id === undefined && name === undefined && email === undefined) return res.status(400).json({ msg: 'you need to send email or id or first name' })

    let sql = " SELECT * FROM user INNER JOIN usertype ON usertype_id = userType WHERE Fname LIKE ? OR  email LIKE ? OR user_id LIKE ? ";
    db.query(sql, [name + "%", email + "%", id + "%"]).then((ele) => {
        console.log(ele[0])

        if (ele[0].length < 1) return res.status(200).json({ msg: "no item with your speicification has been found" })

        return res.status(200).json({
            data: ele[0].map((e) => {
                return { user_id: e.user_id, Fname: e.Fname, Lname: e.Lname, gender: e.gender, email: e.email, country: e.country, birth_date: e.birth_date, language: e.language, UserType: e.userTitle, usertype_id: e.userType_id }
            })
        })

    }).catch(err => {
        console.log(err)
    })

})


// TODO: change password
// // include password validation
router.post('/changePassword', isLoggedin, passwordValidation, async (req, res) => {

    if (!res.locals.validatedData) return res.status(400).json({ msg: "validation error" })
    if (!res.locals.user) return res.status(400).json({ msg: "user data not found" })

    console.log(res.locals.user)




    console.log(222)
    db2.beginTransaction(function (err) {
        //
        console.log(1)
        if (err) { return res.status(400).json({ msg: "error starting change student to teacher" }) }
        let sql = 'SELECT user_id,password FROM user WHERE user_id = ?'
        db2.query(sql, [res.locals.user.data.user_id], async (err, result, fields) => {


            if (err) {
                return db2.rollback(function () {
                    // return "Erorr in update request query"
                    if (err) return res.status(400).json({ msg: "user not found", error: err })

                });// end of rollback #1
            }

            try {
                let passIsValid = await bcrypt.compare(req.body.originalPassword, result[0].password)
                if (!passIsValid) return res.status(400).json({ msg: "password dont match the original password" })

            } catch (e) {
                res.status(400).json({ msg: 'something went wrong in compare', err: e })
            }

            console.log(2)
            console.log(result[0])
            let hashedPassword = "ss"

            try {
                hashedPassword = await bcrypt.hash(req.body.newPassword, parseInt(salt))
            } catch (e) {
                res.status(400).json({ msg: 'something went wrong in hash', err: e })
            }

            if (hashedPassword === "ss") res.status(400).json({ msg: 'something went wrong after hash' })

            sql = 'UPDATE user SET password = ? WHERE user_id = ?'
            db2.query(sql, [hashedPassword, result[0].user_id], (err, result, fields) => {
                console.log(result.affectedRows)
                if (err || result.affectedRows === 0) {
                    return db2.rollback(function () {
                        // return "Erorr in update request query"
                        return res.status(400).json({ msg: "something went wrong in update" })
                    });// end of rollback #2
                }
                console.log(3)

                db2.commit(function (err) {
                    if (err) {
                        return db2.rollback(function () {
                            // return "Erorr commit query"
                            return res.status(400).json({ msg: "error in commitng the data" })
                        });
                    }
                    console.log('success!');
                    return res.status(200).json({ msg: "change password request has been done successfuly" })

                });// end of commit        

            })// end of query 2
        })// end of query 1
    })// end of beginTransaction function




})

// TODO: edit user info
router.post('/editUserInfo', isLoggedin, editUserInfoValidation, async (req, res) => {

    if (res.locals.erorrslog) { return res.status(400).json({ msg: "validation error", errors: res.locals.erorrslog }) }

    else {

        if (!res.locals.validatedData) return res.status(500).json({ msg: "validation internal error" });
        let Fname = res.locals.validatedData.Fname
        let Lname = res.locals.validatedData.Lname
        let gender = res.locals.validatedData.gender
        let email = res.locals.validatedData.email
        let country = res.locals.validatedData.country
        let birth_date = res.locals.validatedData.birth_date
        let language = res.locals.validatedData.language

        try {
            console.log(res.locals.user.data.user_id)
            let sql = ' UPDATE user SET Fname = ?, Lname = ?, gender = ?, email = ?, country = ?, birth_date = ?, language = ? WHERE user_id = ? '
            let submit = await db.query(sql, [Fname, Lname, gender, email, country, birth_date, language, parseInt(res.locals.user.data.user_id)])
            console.log(submit)

            if (submit[0].changedRows > 0) return res.status(200).json({ msg: 'user personal data has been changed successfuly' })
            else return res.status(200).json({ msg: 'same data is submitted' })
        } catch (e) {
            if (e.code == "ER_DUP_ENTRY") return res.status(404).json({ msg: 'Duplicate entry', errorrmsg: e.message, code: e.code, err_no: e.errno, sql_msg: e.sqlMessage })
            if (e.code == "ER_BAD_NULL_ERROR") return res.status(404).json({ msg: e.message, code: e.code, err_no: e.errno, sql_msg: e.sqlMessage })
            return res.status(400).json(e)
        }// end of catch


    } // end of general else if there hs no errorslog



})

// ? TODO: delete user ****
router.post('/deleteUser', isLoggedin, isAdmin, async (req, res) => {
    // just change the account_status to false

    if (!req.body.user_id) return res.status(400).json({ msg: 'you need to send the user ID' })

    try {
        console.log(req.body.user_id)
        let sql = ' UPDATE user SET account_status = 0 WHERE user_id = ? '
        let submit = await db.query(sql, [req.body.user_id])
        console.log(submit)

        if (submit[0].changedRows > 0) return res.status(200).json({ msg: 'user has been deactivated successfuly' })
        else return res.status(200).json({ msg: 'user already deactivated' })
    } catch (e) {
        if (e.code == "ER_BAD_NULL_ERROR") return res.status(404).json({ msg: e.message, code: e.code, err_no: e.errno, sql_msg: e.sqlMessage })
        return res.status(400).json(e)
    }// end of catch

})

router.post('/activateUser', isLoggedin, isAdmin, async (req, res) => {
    // just change the account_status to false

    if (!req.body.user_id) return res.status(400).json({ msg: 'you need to send the user ID' })

    try {
        console.log(req.body.user_id)
        let sql = ' UPDATE user SET account_status = 1 WHERE user_id = ? '
        let submit = await db.query(sql, [parseInt(req.body.user_id)])
        console.log(submit)

        if (submit[0].changedRows > 0) return res.status(200).json({ msg: 'user has been activated successfuly' })
        else return res.status(200).json({ msg: 'user already active' })
    } catch (e) {
        if (e.code == "ER_BAD_NULL_ERROR") return res.status(404).json({ msg: e.message, code: e.code, err_no: e.errno, sql_msg: e.sqlMessage })
        return res.status(400).json(e)
    }// end of catch

})


module.exports = router;