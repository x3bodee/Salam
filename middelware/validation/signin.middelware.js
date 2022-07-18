module.exports = (req, res, next) => {

    let errors = []

    // console.log(req.body)
    if(!req.body.email) errors.push('missing field Email')
    if(!req.body.password) errors.push('missing field Password')

    // email
    const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    regex = new RegExp(emailRegex);

    let email = req.body.email;

    if (!regex.test(email)) errors.push("email")

    let password = req.body.password;

    if (errors.length > 0) {
        res.locals.erorrslog = errors
        next();

    } else {

        res.locals.validatedSigninData = { email: email, password: password }
        next()

    }

}