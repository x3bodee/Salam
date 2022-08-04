module.exports = (req, res, next) => {
    let errors = []

    console.log(req.body.price)
    if(!req.body.title) errors.push('missing field Title')
    if(!req.body.ar_title) errors.push('missing field Arabic Title')
    if(!req.body.description) errors.push('missing field Description')
    if(!req.body.ar_description) errors.push('missing field Arabic Description')
    if( req.body.price === undefined) errors.push('missing field Price')

    if (errors.length > 0) {
        return res.status(400).json({msg: "missing input", errorslog:errors})
    }
    
    let title = req.body.title;
    let ar_title = req.body.ar_title;
    let description = req.body.description;
    let ar_description = req.body.ar_description;
    let price = req.body.price;

    if (title.length < 2 || ar_title.length < 2 ) errors.push('title length must be >= 3')
    if (description.length < 10 || ar_description.length < 10) errors.push('description length must be >= 10')
    if ( req.body.price < 0 ) errors.push('price must be >= 0')

    // errors.push('price must be >= 0000')
    // created_at always == date.now


    if (errors.length > 0) {
        return res.status(400).json({msg: "validation error", errorslog:errors})
    } else {

        res.locals.validatedData = {
            title,ar_title,description,ar_description,price
        }
        next()

    }

}