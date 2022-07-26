const jwt = require("jsonwebtoken");
require('dotenv').config({ path: `${__dirname}/../.env` });
const db = require('../../config/db2');
const SECRET = process.env.SECRET 

module.exports = async ( req, res, next ) => {
    console.log(req.originalUrl)
    const token = req.header('user-auth-token')

    if (!token) return res.status(400).json({msg:"no token found"})
    // console.log(1)
    try{
        let user =  await jwt.verify(token,SECRET)
        res.locals.user=user
        let sql = ' SELECT account_status FROM user WHERE user_id = ? '
        let submit = await db.query(sql,[res.locals.user.data.user_id])
        // console.log(submit[0])
        
        if (submit[0].length < 1) return res.status(400).json({msg:"wrong user"})

        if(submit[0][0].account_status){
            next()
        }else{
            return res.status(400).json({msg:"your account is deactivated call the admin"})
        }
    }catch(e){
        return res.status(400).json({msg:"Invalid Token",err:e})
    }
}