module.exports = (req, res, next) => {
    let errors = []
    // console.log(0)

    // console.log(req.body)
    if(!req.body.sessionID) errors.push('missing field session ID')
    
    if (errors.length > 0) {
        return res.status(400).json({msg: "missing input", errorslog:errors})
    }
    
    // console.log(1)
    let sessionID = req.body.sessionID;
    
    if ( isNaN(sessionID) ) errors.push('wrong input format')

    if (errors.length > 0) {
        return res.status(400).json({msg: "validation error", errorslog:errors})
    } else {

        res.locals.validatedData = {
            sessionID
        }
        next()
    }

}