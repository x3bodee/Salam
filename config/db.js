const mysql = require('mysql2')
require('dotenv').config({ path: `${__dirname}/../.env` })
let host = process.env.DB_HOST
let user = process.env.DB_USER
let database = process.env.DB_NAME
let password = process.env.DB_PASSWORD

// console.log({host , user , database , password})
const pool = mysql.createPool({
    host: host,
    user: user,
    database: database,
    password: password,
})

// conn.execute('SELECT * FROM userType',(err, results, fields)=>{
//     console.log(results); // results contains rows returned by server
//     // console.log(fields);
//     // console.log(err)
// })

module.exports = pool.promise();