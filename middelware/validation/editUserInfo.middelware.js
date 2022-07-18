const countryCodes = require('../../additional_recurce/countryCodes')
const languages = require('../../additional_recurce/languages')
const moment = require('moment');

const isValidDate = require('../../additional_recurce/helperFunctions/isValidDate')



module.exports = (req, res, next) => {
    let errors = []

    if(!req.body.Fname) errors.push('missing field First Name')
    if(!req.body.Lname) errors.push('missing field Last Name')
    if(!req.body.email) errors.push('missing field Email')

    if(!req.body.country) errors.push('missing field Country')
    if(!req.body.birth_date) errors.push('missing field Birth Date')
    if(!req.body.language) errors.push('missing field Language')


    // Fname regex = ^[a-zA-Z]{3,20}
    const nameRegex = "^[a-zA-Z]{1,20}$"
    let regex = new RegExp(nameRegex);

    let Fname = req.body.Fname;
    if (!regex.test(Fname)) errors.push("Fname")


    // Lname regex = ^[a-zA-Z]{3,20}
    let Lname = req.body.Lname;

    if (!regex.test(Lname)) errors.push("Lname")


    // email
    const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    regex = new RegExp(emailRegex);
    let email = req.body.email;

    if (!regex.test(email)) errors.push("email")


    // gender
    let gender = true;
    if (!req.body.gender) gender = false

    // country
    if (!countryCodes.hasOwnProperty(req.body.country.toUpperCase())) errors.push("country")
    let country = req.body.country

    // birth_date
    let birth_date = new Date(req.body.birth_date);
    let string_birth_date = req.body.birth_date
    if (!moment(string_birth_date, 'MM/DD/YYYY', true).isValid() || !isValidDate(string_birth_date)) errors.push("birth_date")

    // language	
    let language = req.body.language;
    if (languages.filter((e) => e.code.toLocaleLowerCase() === language.toLocaleLowerCase()).length <= 0) errors.push("language")

    // phone
    // let phone = req.body.name;


    if (errors.length > 0) {
        res.locals.erorrslog = errors
        next();

    } else {

        res.locals.validatedData = {
            Fname: Fname, Lname: Lname,
            email: email,
            gender: gender, country: country,
            birth_date: birth_date, language: language
        }
        next()

    }


}