const countryCodes = require('../../additional_recurce/countryCodes')
const languages = require('../../additional_recurce/languages')
const moment = require('moment');
function isValidDate(dateString) {
    // First check for the pattern
    if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString))
        return false;

    // Parse the date parts to integers
    var parts = dateString.split("/");
    var day = parseInt(parts[0], 10);
    var month = parseInt(parts[1], 10);
    var year = parseInt(parts[2], 10);

    // Check the ranges of month and year
    if (year < 1000 || year > 3000 || month == 0 || month > 12)
        return false;

    var monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    // Adjust for leap years
    if (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))
        monthLength[1] = 29;

    // Check the range of the day
    return day > 0 && day <= monthLength[month - 1];
};
module.exports = (req, res, next) => {


    // console.log("inside middelware")
    // console.log(req.body)

    let errors = []

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

    if (!regex.test(password)) errors.push("password")


    // gender
    let gender = true;
    if (!req.body.gender) gender = false

    // country
    if (!countryCodes.hasOwnProperty(req.body.country.toUpperCase())) errors.push("country")
    let country = req.body.country

    // birth_date
    let birth_date = req.body.birth_date;
    if (!moment(birth_date, 'DD/MM/YYYY', true).isValid() || !isValidDate(birth_date)) errors.push("birth_date")

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