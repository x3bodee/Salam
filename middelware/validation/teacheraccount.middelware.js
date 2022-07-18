module.exports = (req, res, next) => {
    let errors = []

    // console.log(2)
    // console.log(req.body)
    
    console.log(req.originalUrl)
    let originalUrl = req.originalUrl.split('/') 
    
    if ( originalUrl[originalUrl.length-1] === "createTeachReq" ) {
        
        if(!req.body.description) errors.push('missing field Description')
        if(!req.body.CV_url) errors.push('missing field CV url')
        if(req.body.yearsOfExperience === undefined) errors.push('missing field Years Of Experience')
        // console.log("done")
    }
    

    
    let description = req.body.description;
    
    let CV_url = req.body.CV_url;
    
    if ( req.body.yearsOfExperience < 0 && req.body.yearsOfExperience > 99) errors.push('years of experience must be greater than or equal to 0')
    let yearsOfExperience = req.body.yearsOfExperience;
    
    // if status is 0 then its rejected
    // if status is 1 then its you account now is teacher account
    // if status is 2 then its underevaluating
    let status = 2;
    let status_txt = 'under revision';
    
    if (errors.length > 0) {
        res.locals.erorrslog = errors
        res.status(400).json({msg:"Invalid input",erorrslog:errors})

    } else {

        res.locals.validatedData = {
            description: description, CV_url: CV_url,
            status: status, status_txt: status_txt,
            yearsOfExperience: yearsOfExperience
        }
        next()

    }


}