const express = require('express')
const app = express()
require('dotenv').config();
const PORT = process.env.PORT || 5000
const cors = require('cors');


// to use the body
// app.use(express.urlencoded({ extended: false }))
app.use(express.json());
// app.use(cors());

// TODO: database conniction


// TODO: remove this for cors to work
// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
//   });


// Routes
// use this as example
// app.use('/api/v1/session',require('./routes/session.route'))
// app.use('/api/v1/review' ,require('./routes/review.route'))

app.use('/api/v1/user',require('./routes/user.route'))



app.listen(PORT,function(req,res){
    console.log("teeest");
});