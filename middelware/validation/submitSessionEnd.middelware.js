module.exports = (req, res, next) => {
    let errors = []
    console.log("validation start")

    // console.log(req.body)
    console.log(req.body)
    console.log(res.locals.user.data.user_id)
    if(!req.body.sessionID) errors.push('missing field Session ID')
    if(!res.locals.user.data.user_id) errors.push('missing field Teacher ID')
    if(!req.body.teacher_review) errors.push('missing field Teacher Review')

    if (errors.length > 0) {
        return res.status(400).json({msg: "missing input", errorslog:errors})
    }
    
    // console.log(1)
    let sessionID = req.body.sessionID;
    let teacher_review = req.body.teacher_review;
    let teacher_id = res.locals.user.data.user_id;
    


    if (errors.length > 0) {
        return res.status(400).json({msg: "validation error", errorslog:errors})
    } else {

        res.locals.validatedData = {
            sessionID,teacher_review,teacher_id
        }
        console.log("validation end")
        next()

    }

}