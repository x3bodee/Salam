module.exports = ( req, res, next ) => {
    const user = res.locals.user
    if (!user) return res.status(400).json({msg:"try to loggin again"})
    // console.log(user)

    if(user.data.userType === 3) {
        console.log("user is teacher")
        next()
    }else{
        return res.status(400).json({msg:"Access Is Denied"})
    }
    
}