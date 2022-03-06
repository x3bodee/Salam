const jwt = require("jsonwebtoken");
require('dotenv').config({ path: `${__dirname}/../.env` });
const SECRET = process.env.SECRET 

module.exports = async ( req, res, next ) => {
    console.log(req.originalUrl)
    const token = req.header('user-auth-token')

    if (!token) return res.status(400).json({msg:"no token found"})
    // console.log(1)
    try{
        let user =  await jwt.verify(token,SECRET)
        res.locals.user=user
        next()
    }catch(e){
        return res.status(400).json({msg:"Invalid Token",err:e})
    }
}