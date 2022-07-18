module.exports = (req, res, next) => {
    let errors = []
    console.log(1)

    // console.log(req.body)
    if(!req.body.subscriptionID) errors.push('missing field subscription ID')
    if(!req.body.session_url) errors.push('missing field session URL')
    if(!req.body.start_time) errors.push('missing field session start time')
    if(!req.body.end_time) errors.push('missing field session end time')
    if(!req.body.day_date) errors.push('missing field session day date')
    
    // if(!req.body.teacher_id) errors.push('missing field teacher ID')

    if (errors.length > 0) {
        return res.status(400).json({msg: "missing input", errorslog:errors})
    }
    
    console.log(1)
    let subscriptionID = req.body.subscriptionID;
    let session_url = req.body.session_url;
    let start_time = req.body.start_time;
    let end_time = req.body.end_time;
    let day_date = req.body.day_date;
    // let teacher_id = req.body.teacher_id;


    if (errors.length > 0) {
        return res.status(400).json({msg: "validation error", errorslog:errors})
    } else {

        res.locals.validatedData = {
            subscriptionID,session_url,start_time,end_time,day_date
        }
        next()

    }

}