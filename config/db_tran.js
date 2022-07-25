const mysql = require('mysql2')
const { rollback, commit } = require('./db')
require('dotenv').config({ path: `${__dirname}/../.env` })
let host = process.env.DB_HOST
let user = process.env.DB_USER
let database = process.env.DB_NAME
let password = process.env.DB_PASSWORD

const pool = mysql.createConnection({
    host: host,
    user: user,
    database: database,
    password: password,
    multipleStatements:true,
})

module.exports = pool