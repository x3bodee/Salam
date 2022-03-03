module.exports = (req, res, next) => {
    let errors = []

    if ( !req.body.originalPassword) errors.push("user need to enter original password")
    if ( !req.body.newPassword) errors.push("user need to enter new password")
    if ( !req.body.newPassword2) errors.push("user need to enter repeted password")

    if(errors.length > 0 ) return res.status(400).json({msg:"missing inputs", errorslog:errors})

    // password - Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character
    const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    regex = new RegExp(passRegex);

    let originalPassword = req.body.originalPassword;
    let newPassword = req.body.newPassword;
    let newPassword2 = req.body.newPassword2;
    
    if (newPassword !== newPassword2) errors.push("passwords not matched")

    if (!regex.test(password)) errors.push("password")

    if(errors.length > 0 ) return res.status(400).json({msg:"validation error", errorslog:errors})

    res.locals.validatedData = true;
    next()

}