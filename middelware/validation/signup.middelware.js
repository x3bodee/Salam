const countryCodes = require('../../additional_recurce/countryCodes')
const languages = require('../../additional_recurce/languages')
const moment = require('moment');

const isValidDate = require('../../additional_recurce/helperFunctions/isValidDate')



module.exports = (req, res, next) => {


    // console.log("inside middelware")
    // console.log(req.body)

    let errors = []

    if(!req.body.Fname) errors.push('missing field First Name')
    if(!req.body.Lname) errors.push('missing field Last Name')
    if(!req.body.email) errors.push('missing field Email')
    if(!req.body.password) errors.push('missing field Password')
    if(!req.body.password2) errors.push('missing field Password2')
    // if(!req.body.gender || !req.body.gender === 0) errors.push('missing field Gender')
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


    // password - Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character
    const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    regex = new RegExp(passRegex);
    let password = req.body.password;
    let password2 = req.body.password2;
    
    if (password !== password2) errors.push("passwords not matched")
    if (!regex.test(password)) errors.push("password")


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

    // created_at always == date.now
    let created_at = new Date().toLocaleDateString();


    // language	
    let language = req.body.language;
    if (languages.filter((e) => e.code.toLocaleLowerCase() === language.toLocaleLowerCase()).length <= 0) errors.push("language")

    // phone
    // let phone = req.body.name;

    // teach_status	always == false
    let teach_status = false;

    // userType	always == 2
    let userType = 2;

    if (errors.length > 0) {
        res.locals.erorrslog = errors
        next();

    } else {

        res.locals.validatedData = {
            Fname: Fname, Lname: Lname,
            email: email, password: password,
            gender: gender, country: country,
            birth_date: birth_date, language: language,
            created_at: created_at, teach_status: teach_status,
            userType: userType
        }
        next()

    }

}