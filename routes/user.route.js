
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
    res.status(200).json({msg:"success"})
})

// TODO: check signupValidation if it's null
router.post('/signup', signupValidation, async (req, res) => {

    if (res.locals.erorrslog) { return res.status(400).json({ msg: "validation error", errors: res.locals.erorrslog }) }
    else{

        if (!res.locals.validatedData) return res.status(500).json({ msg: "validation internal error" });

        try {
            
            // hash the password
            let hashedPassword = await bcrypt.hash(res.locals.validatedData.password, parseInt(salt))
            res.locals.validatedData.password = hashedPassword 
            
            // basic information.
            let Fname = res.locals.validatedData.Fname
            let Lname = res.locals.validatedData.Lname
            let password = res.locals.validatedData.password
            let gender = res.locals.validatedData.gender
            let email = res.locals.validatedData.email
            let country = res.locals.validatedData.country
            let birth_date = res.locals.validatedData.birth_date
            let language = res.locals.validatedData.language

            await db2.beginTransaction();

            console.log("phase 1 done");
            // first: insert to insert the user information
            let sql = ' INSERT INTO user (Fname,Lname,email,password,gender,country,birth_date,language) VALUES(?,?,?,?,?,?,?,?)'
            const [result, meta] = await db2.query(sql, [Fname = Fname, Lname = Lname, email = email, password = password, gender, country = country, birth_date = birth_date, language = language])
            await db2.commit();
            
            
            console.log("phase 2 done");
            // second: handel the token information
            console.log(result.insertId)
            // this is the defult user after signin it's will be signed as normal user that is why there is user_type 2 and teach_status 0 
            let data = {
                user_id: result.insertId, // this is came from the database user table for user_id incrementer
                userType: 2,
                teach_status: 0,
                Fname: Fname,
                Lname: Lname,
            }

            const token = await jwt.sign({ data }, SECRET, { expiresIn: parseInt(EXPIRESIN) })
            let user = await jwt.verify(token, SECRET)
            let expiresIn = new Date(user.exp * 1000)
            console.log(user.exp)
            console.log(expiresIn)
            console.log("-------------")
            console.log("token and expiresIn ara set")

            console.log("phase 3 done")
            // third: insert the log 
            sql = 'INSERT INTO logs (user_id,token,expire_date) VALUES(?,?,?)'
            const [result2, meta2] = await db2.query(sql, [data.user_id, token, expiresIn]);
            await db2.commit();

            console.log('success!');
            return res.status(200).json({ msg: "user has been created successfuly", token: token })
        } catch (err) {
            
            await db2.rollback();
            // if (err.code == "ER_DUP_ENTRY") return res.status(404).json({ msg: err.message, code: err.code, err_no: err.errno, sql_msg: err.sqlMessage })
            if (err.code) return res.status(404).json({ msg: err.message, code: err.code, err_no: err.errno, sql_msg: err.sqlMessage })
            
            if (err) return res.status(400).json({ msg: "Someting went wrong", error: err })
            
        }finally {
            if (db2) await db2.destroy();
        }
    }

});

// this method is archived 
// deprecated
/*

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
                    console.log(EXPIRESIN)
                    const token = await jwt.sign({ data }, SECRET, { expiresIn: parseInt(EXPIRESIN) })
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
*/


///// TODO: signin 
router.post('/signin', signinValidation, async (req, res) => {
    
    // console.log('inside signin post request')
    if (res.locals.erorrslog) { return res.status(400).json({ msg: "validation error", errors: res.locals.erorrslog }) }
    else {
        if (!res.locals.validatedSigninData) return res.status(500).json({ msg: "validation internal error" });
        
        console.log("phase 1 done")

        console.log(res.locals.validatedSigninData)
        try {

            // basic information for the request
            let email = res.locals.validatedSigninData.email
            let password = res.locals.validatedSigninData.password

            // get user information
            let sql = ' SELECT * FROM user WHERE email = ? ';
            const [result,meta] = await db2.query(sql, email);
            // console.log("user: ",result)

            if(result.length == 0) return res.status(401).json({ msg: "wrong user information"});

            // console.log(result)
            // console.log(result[0].password)
            
            // compare user password with db password
            let passIsValid = await bcrypt.compare(password, result[0].password)

            // if the password == then create the token then update the logs
            if (passIsValid) {

                let date = new Date().toLocaleDateString();
                let data = {
                    user_id: result[0].user_id,
                    userType: result[0].userType,
                    teach_status: result[0].teach_status,
                    Fname: result[0].Fname,
                    Lname: result[0].Lname,
                    createdAt:date
                };

                // creating the token
                const token = await jwt.sign({ data }, SECRET, { expiresIn: parseInt(EXPIRESIN) });
                let user = await jwt.verify(token, SECRET);
                let expiresIn = new Date(user.exp * 1000);
                // console.log(user.exp);

                console.log("phase 2 done");

                // update the log record
                sql = 'UPDATE logs SET token = ?, expire_date = ?, status = ? WHERE user_id = ?';
                const [result2,meta2] = await db2.query(sql, [token, expiresIn, 1, data.user_id]);
                
                // console.log("update result: ",result2)

                // in case there is no log record just give this error
                // TODO: decide what will happen in this case ??
                if(result2.affectedRows == 0) return res.status(500).json({ msg: "something went wrong!!" })

                // log this msg and send the response
                console.log('success!');
                return res.status(200).json({ msg: "logged in successfully", token })


            }// end of passIsValid
            // in case the password do not match then send this error
            else return res.status(401).json({ msg: "wrong user information"});

        } catch (err) {
            // in case the error from db then this is a general error msg for it
            if (err.code) return res.status(404).json({ msg: err.message, code: err.code, err_no: err.errno, sql_msg: err.sqlMessage })
            
            // this to captrue any error and try to send the error msg if it's applicable.
            return res.status(400).json({ msg: "Someting went wrong", error: err })
            
        }
    }// end of else
});

// this method is archived 
// deprecated
/*

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

                        let date = new Date().toLocaleDateString();
                        let data = {
                            user_id: result[0].user_id,
                            userType: result[0].userType,
                            teach_status: result[0].teach_status,
                            Fname: result[0].Fname,
                            Lname: result[0].Lname,
                            createdAt:date
                        }
                        console.log("ssss:"+EXPIRESIN)
                        const token = await jwt.sign({ data }, SECRET, { expiresIn: parseInt(EXPIRESIN) })
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

*/


// TODO: sginout -- 
// ! this from front end just delete the token and set the token as false

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
        // get the user requests
        let sql = 'SELECT userID,status,status_txt FROM request WHERE userID = ? AND (status = 2 OR status = 1 )'
        let [submit,meta] = await db2.query(sql, [userID = userID])
        
        // console.log(submit)

        // if the length > 0 this mean for this user there is a request under revision or the user is a teacher
        if (submit.length > 0) return res.status(400).json({ msg: "your already have an order under revision, or you already a teacher" })

        // in case the user is student and there is no old under revision request then create this request.
        sql = ' INSERT INTO request (userID,description,CV_url,yearsOfExperience,status,status_txt) VALUES(?,?,?,?,?,?)'
        let [submit2,meta2] = await db2.query(sql, [userID = userID, description = description, CV_url = CV_url, yearsOfExperience = yearsOfExperience, status = status, status_txt = status_txt])
        // console.log(submit2)

        // TODO!: just double check if I need this or not.
        // this is a double check if the user has request under revision or he is a teacher.
        if(submit2.affectedRows == 0) return res.status(400).json({ msg: "your already have an order under revision, or you already a teacher" })
        
        // return response
        return res.status(200).json({ msg: "your create request has been send successfuly" })
    
    } catch (err) {
        // in case the error from db then this is a general error msg for it
        if (err.code) return res.status(404).json({ success: false, msg: err.message, code: err.code, err_no: err.errno, sql_msg: err.sqlMessage })
            
        // this to captrue any error and try to send the error msg if it's applicable.
        return res.status(400).json({ success: false, msg: "Someting went wrong", error: err })
    }



})

// TODO: edit request for teacher account (user)
router.post('/editTeachReq', isLoggedin, isStudent, teacherAccountRequestValidation, async (req, res) => {

    if (!res.locals.validatedData) return res.status(400).json({ msg: "Invalid request" })

    // basic information
    let userID = res.locals.user.data.user_id
    let description = res.locals.validatedData.description
    let CV_url = res.locals.validatedData.CV_url
    let yearsOfExperience = res.locals.validatedData.yearsOfExperience
    let request_id = null

    if (req.body.request_id) request_id = req.body.request_id
    
    if(!request_id) return res.status(400).json({ msg: "Invalid request" })

    console.log("phase 1 done")

    try {
        // update when and only when this request is for this user.
        // change only the basick information
        let sql = ' UPDATE request SET description = ?, CV_url = ?, yearsOfExperience = ? WHERE request_id = ? && userID = ?'
        let [submit,meta] = await db2.query(sql, [description, CV_url, yearsOfExperience, request_id, userID])
        

        // in case the affcted rows are 0 then this mean ether the request_id or user_id is wrong.
        if (submit.affectedRows == 0) return res.status(400).json({ msg: "there is no such a request" })

        console.log("success")
        return res.status(200).json({ msg: "your update request has been send successfuly" })

    } catch (err) {
        // in case the error from db then this is a general error msg for it
        if (err.code) return res.status(404).json({ success: false, msg: err.message, code: err.code, err_no: err.errno, sql_msg: err.sqlMessage })
            
        // this to captrue any error and try to send the error msg if it's applicable.
        return res.status(400).json({ success: false, msg: "Someting went wrong", error: err })
    }


})

// TODO: get all user requests for teacher account (user)
///// ! may need to remove teacher permision
router.get('/getMyTeachReq', isLoggedin, async (req, res) => {

    // basic information
    let userID = res.locals.user.data.user_id

    try {

        // get all requests for this user by his id.
        let sql = 'SELECT * FROM request WHERE userID = ?'
        let submit = await db2.query(sql, [userID])

        // in case there is no request by this user 
        if (submit[0].length <= 0) return res.status(503).json({ msg: "not found"})


        return res.status(200).json({ msg: "success", data: submit[0] })

    } catch (err) {
        // in case the error from db then this is a general error msg for it
        if (err.code) return res.status(404).json({ success: false, msg: err.message, code: err.code, err_no: err.errno, sql_msg: err.sqlMessage })
            
        // this to captrue any error and try to send the error msg if it's applicable.
        return res.status(400).json({ success: false, msg: "Someting went wrong", error: err })
    }


})

// TODO: get all unrevisioned requests for teacher account (admin)
router.get('/getAllNewTeachReq', isLoggedin, isAdmin, async (req, res) => {

    try {
        // get all request where there status is unrevisioned
        let sql = 'SELECT * FROM request WHERE status = 2'
        let submit = await db2.query(sql)
        
        // in case there is no request by this user 
        if (submit[0].length <= 0) return res.status(503).json({ success: true, msg: "not found"})

        return res.status(200).json({ success: true, msg: "success", data: submit[0] })

    } catch (err) {
        // in case the error from db then this is a general error msg for it
        if (err.code) return res.status(404).json({ success: false, msg: err.message, code: err.code, err_no: err.errno, sql_msg: err.sqlMessage })
            
        // this to captrue any error and try to send the error msg if it's applicable.
        return res.status(400).json({ success: false, msg: "Someting went wrong", error: err })
    }


})

// TODO: approve or disapprove teacher account request (admin)

// TODO: teach_ status check if it's need change after accepts
// // not done need to check if its work fine or not
// ! need to check if I need to just change the requests where the status is only 2 or I leave it as a genral case
router.post('/processTechReq', isLoggedin, isAdmin, async (req, res) => {


    // basic variable I need
    let errors = []
    let request_id = undefined
    let status = undefined
    let status_txt = undefined
    let userID = undefined

    // get the accept code and reject code from the env
    let accept = process.env.ACCEPT || 1
    let reject = process.env.REJECT || 0

    // in case there is not request_id or user_id then push these errors to the errors array
    if (!req.body.request_id) errors.push('missing field Request ID')
    if (!req.body.userID) errors.push('missing field User ID')

    // if (!req.body.status) errors.push('missing field Status')

    // if the status is not 0,1,2 and there is no status_txt then push these errors to the errors array
    if (!(req.body.status > -1 && req.body.status < 2)) errors.push('Status input is invalid')
    if (!req.body.status_txt) errors.push('missing field Text')

    // if the errors array length is > 0 then send response with bad request
    if (errors.length > 0) return res.status(400).json({success:false, msg: "Invalid input", erorrslog: errors })

    // set the basic information
    request_id = req.body.request_id
    userID = req.body.userID
    status = (req.body.status) ? 1 : 0;
    status_txt = req.body.status_txt
    console.log(11111111)
    // for rejection
    if (status === 0) {
        try {

            let sql = 'UPDATE request SET status = ' + reject + ', status_txt = ? WHERE request_id = ? && userID = ?'
            let submit = await db2.query(sql, [status_txt, request_id, userID])
            console.log(submit)
            return res.status(200).json({ msg: "user request teacher account has been rejected successfuly" })

        } catch (err) {
            // in case the error from db then this is a general error msg for it
            if (err.code) return res.status(404).json({ success: false, msg: err.message, code: err.code, err_no: err.errno, sql_msg: err.sqlMessage })
                
            // this to captrue any error and try to send the error msg if it's applicable.
            return res.status(400).json({ success: false, msg: "Someting went wrong", error: err })
        }

        // for accepting
    } else if (status === 1) {

        try {

            // console.log(222)
            // start transaction
            await db2.beginTransaction();
            console.log("phase 1 done");
            
            // get the user type by his id just to check if the user is not admin or teacher
            let sql = 'SELECT userType FROM user WHERE user_id = ?';
            const [submit,meta] = await db2.query(sql, [userID]);
            
            // if the submit length is 0 then the request is wrong
            if (submit.length <= 0) return res.status(400).json({ success:false, msg: "ether this user or request in not available" }); 
            // if the user type is not 2 then this user is eather admin or a teacher
            if (submit[0].userType != 2) return res.status(400).json({ success:false, msg: "user ether a teacher or admin" }); 
            // console.log(333)
            
            await db2.commit();
            console.log("phase 2 done");
            
            // update the request information
            sql = 'UPDATE request SET status = ' + accept + ', status_txt = ? WHERE request_id = ? && userID = ?';
            const [submit2,meta2] = await db2.query(sql, [status_txt, request_id, userID]);
            // in case there is no affected rows then this mean the user id or request id is wrong
            if (submit2.affectedRows === 0) return res.status(400).json({ success:false, msg: "error user ID or request ID is wrong" });
            
            await db2.commit();
            console.log("phase 3 done");
            // console.log(444)
            
            // update user type information in user table
            sql = "UPDATE user SET userType = 3 WHERE user_id = ?";
            const [submit3,meta3] = await db2.query(sql, [userID]);
            // in case there is no affected rows then this means there is no such a user with this id
            if (submit3.affectedRows === 0) return res.status(400).json({ success:false, msg: "error in updating the user data" });
            await db2.commit();
            
            console.log('success!');
            return res.status(200).json({ msg: "user request teacher account has been accepted successfuly" })


            }// END OF THE TRY FOR THE TRY FOR THE TRANSACTION 
            catch (err) {
                await db2.rollback();
                // in case the error from db then this is a general error msg for it
                if (err.code) return res.status(404).json({ success: false, msg: err.message, code: err.code, err_no: err.errno, sql_msg: err.sqlMessage })
                
                // this to captrue any error and try to send the error msg if it's applicable.
                return res.status(400).json({ success: false, msg: "Someting went wrong", error: err })
            }// END OF THE CATCH


    }// END OF THE ELSE


})

// TODO: get all user user (admin)
router.get('/getAllUsers', isLoggedin, isAdmin, async (req, res) => { 
    
    try {

        // get all users information with the user type sorted by their ids
        let sql = 'SELECT user_id,Fname,Lname,gender,email,country,birth_date,created_at,phone,account_status,teach_status,language,userTitle,userType FROM user RIGHT JOIN usertype ON usertype_id = userType order by user_id ASC  ;'
        const submit = await db2.query(sql) 

        // in case there is no users just return this
        if( submit[0].length <= 0) return res.status(503).json({ success: true, msg: "not found"})


        return res.status(200).json({ success: true, msg: "success", data: submit[0].map((e) => {
            return { user_id: e.user_id, Fname: e.Fname, Lname: e.Lname, gender: e.gender,
            email: e.email, country: e.country, birth_date: e.birth_date, language: e.language,
            UserType: e.userTitle, usertype_id: e.userType_id, teach_status: e.teach_status,
            account_status: e.account_status, phone: e.phone,joined_at: e.created_at }
            })// end of map func
        })// end of json

    } catch (err) {
        // in case the error from db then this is a general error msg for it
        if (err.code) return res.status(404).json({ success: false, msg: err.message, code: err.code, err_no: err.errno, sql_msg: err.sqlMessage })
            
        // this to captrue any error and try to send the error msg if it's applicable.
        return res.status(400).json({ success: false, msg: "Someting went wrong", error: err })
    }


})


// TODO: find user (teacher)
router.get('/getTeacher/', isLoggedin, async(req, res) => {
    // console.log('inside get teacher by id or email , or full name')
    
    // basic data preperations
    let id = undefined
    let name = undefined
    let email = undefined

    // setting the data if it's available
    if (req.query.id) id = req.query.id
    if (req.query.name) name = req.query.name.split(' ')[0]
    if (req.query.email) email = req.query.email

    // if all the data is undefinded then return erorr
    if (id === undefined && name === undefined && email === undefined) return res.status(400).json({ success: false, msg: 'you need to send email or id or first name' })
    // if the id is availabe and it's length <= 4 digit then it's short
    // if the name is availabe and it's length < 2 chars then it's short
    if ( ( id != undefined  && id.length < 5) || ( name != undefined  && name.length < 2) ) return res.status(400).json({ success: false, msg: 'id or name is short' })

    // get all information form the user if its teacher and the search filter is write
    let sql = " SELECT user_id,Fname,Lname,gender,email,country,birth_date,created_at,phone,account_status,teach_status,language,userTitle,userType FROM user INNER JOIN usertype ON usertype_id = userType WHERE userType = 3 AND ( Fname LIKE ? OR  email LIKE ? OR user_id LIKE ? ) ";
    try {

        const [submit,meta] = await db2.query(sql, [name + "%", email + "%", id + "%"])
        // console.log("submit: ",submit)
        // if the array it's empty return there is no result found
        if (submit.length <= 0) return res.status(503).json({success: true,  msg: "no item with your speicification has been found" })
        // console.log("passed the if submit.length")

        // if it's passed then return the result
        return res.status(200).json({  success: true, msg:"success",
            data: submit.map((e) => {
                return { user_id: e.user_id, Fname: e.Fname, Lname: e.Lname, gender: e.gender,
                email: e.email, country: e.country, birth_date: e.birth_date, language: e.language,
                UserType: e.userTitle, usertype_id: e.userType_id, teach_status: e.teach_status,
                account_status: e.account_status, phone: e.phone,joined_at: e.created_at }
                })// end of map func
        })
    } catch (err) {
        // in case the error from db then this is a general error msg for it
        if (err.code) return res.status(404).json({ success: false, msg: err.message, code: err.code, err_no: err.errno, sql_msg: err.sqlMessage })
            
        // this to captrue any error and try to send the error msg if it's applicable.
        return res.status(400).json({ success: false, msg: "Someting went wrong", error: err })
    }

})

router.get('/getUser/', isLoggedin, isAdmin, async(req, res) => {
    // console.log('inside get teacher by id or email , or full name')
    
    // basic data preperations
    let id = undefined
    let name = undefined
    let email = undefined

    // setting the data if it's available
    if (req.query.id) id = req.query.id
    if (req.query.name) name = req.query.name.split(' ')[0]
    if (req.query.email) email = req.query.email

    // if all the data is undefinded then return erorr
    if (id === undefined && name === undefined && email === undefined) return res.status(400).json({ success: false, msg: 'you need to send email or id or first name' })
    
    // if the id is availabe and it's length <= 4 digit then it's short
    // if the name is availabe and it's length < 2 chars then it's short
    if ( ( id != undefined  && id.length < 5) || ( name != undefined  && name.length < 2) ) return res.status(400).json({ success: false, msg: 'id or name is short' })

    // console.log
    let sql = " SELECT user_id,Fname,Lname,gender,email,country,birth_date,created_at,phone,account_status,teach_status,language,userTitle,userType FROM user INNER JOIN usertype ON usertype_id = userType WHERE Fname LIKE ? OR  email LIKE ? OR user_id LIKE ? order by user_id ASC";
    try{

        const [submit,meta] = await db2.query(sql, [name + "%", email + "%", id + "%"])
        // console.log("submit: ",submit)
        // if the array it's empty return there is no result found
        if (submit.length <= 0) return res.status(503).json({success: true,  msg: "no item with your speicification has been found" })
        
        // console.log("passed the if submit.length")

        // if it's passed then return the result
        return res.status(200).json({  success: true, msg:"success",
            data: submit.map((e) => {
                return { user_id: e.user_id, Fname: e.Fname, Lname: e.Lname, gender: e.gender,
                email: e.email, country: e.country, birth_date: e.birth_date, language: e.language,
                UserType: e.userTitle, usertype_id: e.userType_id, teach_status: e.teach_status,
                account_status: e.account_status, phone: e.phone,joined_at: e.created_at }
                })// end of map func
        })
    }catch(err) {
         // in case the error from db then this is a general error msg for it
         if (err.code) return res.status(500).json({ success: false, msg: err.message, code: err.code, err_no: err.errno, sql_msg: err.sqlMessage })
            
         // this to captrue any error and try to send the error msg if it's applicable.
         return res.status(400).json({ success: false, msg: "Someting went wrong", error: err })
    }

})


// TODO: change password
// // include password validation
router.post('/changePassword', isLoggedin, passwordValidation, async (req, res) => {

    // check if there is error is errors from the middelware
    if (!res.locals.validatedData) return res.status(400).json({success: false, msg: "validation error" })
    if (!res.locals.user) return res.status(404).json({success: false, msg: "user data not found" })

    try {
        // console.log(1)

        // get current user_id and password
        let sql = 'SELECT user_id,password FROM user WHERE user_id = ?'
        const [submit,meta] = await db2.query(sql, [res.locals.user.data.user_id]);

        // console.log(submit[0])
        // console.log(2)
        
        // check if the passwords are matched new and old
        let passIsValid = await bcrypt.compare(req.body.originalPassword, submit[0].password)
        if (!passIsValid) return res.status(400).json({success: false, msg: "password dont match the original password" })
        
        // let hashedPassword = "ss"
        
        // console.log(3)
        // in case they dont match then hash the new password
        const hashedPassword = await bcrypt.hash(req.body.newPassword, parseInt(salt))
        if (!hashedPassword) res.status(400).json({ msg: 'something went wrong after hash' })
        
        // console.log(4)

        // update the password for the user
        sql = 'UPDATE user SET password = ? WHERE user_id = ?'
        const [submit2,meta2] = await db2.query(sql, [hashedPassword, submit[0].user_id])
        // console.log(submit2)

        // in case no rows affected then there is problem in update querey
        if (submit2.affectedRows === 0) return res.status(400).json({ success:false, msg: "error in updating the user data" });

        // return the success msg
        return res.status(200).json({ success: true, msg:"user password has been updated successfully" })


    } catch (err) {
        // in case the error from db then this is a general error msg for it
        if (err.code) return res.status(404).json({ success: false, msg: err.message, code: err.code, err_no: err.errno, sql_msg: err.sqlMessage })
            
        // this to captrue any error and try to send the error msg if it's applicable.
        return res.status(400).json({ success: false, msg: "Someting went wrong", error: err })
    }

})

// TODO: edit user info
router.post('/editUserInfo', isLoggedin, editUserInfoValidation, async (req, res) => {

    // in case there is errors from the middelware check then return the errors log
    if (res.locals.erorrslog) { return res.status(400).json({ success: false, msg: "validation error", errors: res.locals.erorrslog }) }
    else {

        // in case there is validation error send the error
        if (!res.locals.validatedData) return res.status(500).json({ success: false, msg: "validation internal error" });

        // basic data
        let Fname = res.locals.validatedData.Fname
        let Lname = res.locals.validatedData.Lname
        let gender = res.locals.validatedData.gender
        let email = res.locals.validatedData.email
        let country = res.locals.validatedData.country
        let birth_date = res.locals.validatedData.birth_date
        let language = res.locals.validatedData.language

        try {
            console.log(res.locals.user.data.user_id)
            // update the user information where is the user_id = user_id
            let sql = ' UPDATE user SET Fname = ?, Lname = ?, gender = ?, email = ?, country = ?, birth_date = ?, language = ? WHERE user_id = ? '
            let submit = await db2.query(sql, [Fname, Lname, gender, email, country, birth_date, language, parseInt(res.locals.user.data.user_id)])
            console.log(submit)
            // if the changed rows > 0 this mean there is change in the data then send success response
            if (submit[0].changedRows > 0) return res.status(200).json({success: true, msg: 'user personal data has been changed successfuly' })
            // there is no change in the data so send this response
            else return res.status(200).json({success: false, msg: 'same data is submitted' })
        } catch (err) {
            // in case the error from db then this is a general error msg for it
            if (err.code) return res.status(404).json({ success: false, msg: err.message, code: err.code, err_no: err.errno, sql_msg: err.sqlMessage })
                
            // this to captrue any error and try to send the error msg if it's applicable.
            return res.status(400).json({ success: false, msg: "Someting went wrong", error: err })
        }// end of catch


    } // end of general else if there hs no errorslog



})

// ? TODO: delete user **** 
router.post('/deleteUser', isLoggedin, isAdmin, async (req, res) => {

    // just change the account_status to false

    // in case the admin did not send the user id then send this msg
    if (!req.body.user_id) return res.status(400).json({ success: false, msg: 'you need to send the user ID' })

    try {
        console.log(req.body.user_id)

        // update the account status of a user to 0 if the user_id = user_id
        let sql = ' UPDATE user SET account_status = 0 WHERE user_id = ? '
        let submit = await db2.query(sql, [req.body.user_id])
        console.log(submit)

        // if the changed rows > 0 then there is somthing changed return success true
        if (submit[0].changedRows > 0 && submit[0].affectedRows > 0) return res.status(200).json({ success: true, msg: 'user has been deactivated successfuly' })

        // if the changed rows ==0 then that means there is no change so it's mean it's already deactivated
        else if (submit[0].affectedRows > 0) return res.status(200).json({ success: false, msg: 'user already deactivated' })
        else return res.status(200).json({ success: false, msg: 'user don\'t exist ' })

    } catch (err) {
        // in case the error from db then this is a general error msg for it
        if (err.code) return res.status(404).json({ success: false, msg: err.message, code: err.code, err_no: err.errno, sql_msg: err.sqlMessage })
            
        // this to captrue any error and try to send the error msg if it's applicable.
        return res.status(400).json({ success: false, msg: "Someting went wrong", error: err })
    }

})

router.post('/activateUser', isLoggedin, isAdmin, async (req, res) => {
    // just change the account_status to false

    if (!req.body.user_id) return res.status(400).json({ success: false, msg: 'you need to send the user ID' })

    try {
        console.log(req.body.user_id)

        // update the account status of a user to 1 if the user_id = user_id
        let sql = ' UPDATE user SET account_status = 1 WHERE user_id = ? '
        let submit = await db2.query(sql, [parseInt(req.body.user_id)])
        console.log(submit)

        // if the changed rows > 0 and affectedRows > 0 then there is somthing changed return success true
        if (submit[0].changedRows > 0 && submit[0].affectedRows > 0) return res.status(200).json({ success: true, msg: 'user has been activated successfuly' })
         
        // if the affectedRows > 0 then that means there is no change so it's mean it's already deactivated
        else if (submit[0].affectedRows > 0) return res.status(200).json({ success: false, msg: 'user already deactivated' })
        // if the changed rows ==0 then that means there is no change so it's mean it's already active
        else return res.status(200).json({ success: false, msg: 'user don\'t exist ' })

    } catch (err) {
        // in case the error from db then this is a general error msg for it
        if (err.code) return res.status(404).json({ success: false, msg: err.message, code: err.code, err_no: err.errno, sql_msg: err.sqlMessage })
            
        // this to captrue any error and try to send the error msg if it's applicable.
        return res.status(400).json({ success: false, msg: "Someting went wrong", error: err })
    }// end of catch

})

// TODO: get teacher by subscription and sessions
router.get('/selectTeacher', isLoggedin, async (req,res) => {

    // incase there is no id in the url
    if(!req.query.subscriptionID) return res.status(400).json({ success: false, msg:"missing subscription ID"})
    
    try{
        
        // get all the sessions for this teacher where the session status is open and subscription_id = subscription_id
        let sql = 'SELECT session_id,teacher_id,Fname,Lname FROM session JOIN user ON teacher_id = user_id WHERE subscriptionID = ? AND session_status =1'
        let submit = await db2.query(sql,req.query.subscriptionID)
        
        // in case the length is == 0 then there is no result found
        if (submit[0].length < 1) return res.status(404).json({ success: false, msg: "not found"})
        console.log(submit[0])
        return res.status(200).json({ success: true, msg: "success", result: submit[0]})
    }catch (err) {
        // in case the error from db then this is a general error msg for it
        if (err.code) return res.status(404).json({ success: false, msg: err.message, code: err.code, err_no: err.errno, sql_msg: err.sqlMessage })
            
        // this to captrue any error and try to send the error msg if it's applicable.
        return res.status(400).json({ success: false, msg: "Someting went wrong", error: err })
    }// end of catch
})


module.exports = router;