const mysql = require('mysql2')
require('dotenv').config();

const pool = mysql.createPool({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    database:process.env.DB_NAME,
    password:process.env.DB_PASSWORD,
})

let querey = "SELECT * FROM user"

pool.execute(querey,(err,result)=>{
    if (err) throw err;

    console.log(result)
})

module.exports = pool.promise();