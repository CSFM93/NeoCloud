const express = require('express')
const fileUpload = require('express-fileupload');
const PORT = 3021;
var cors = require('cors')

var app = express()

app.use(cors()) 
app.use(fileUpload())


app.use(express.json())
app.use(express.urlencoded({ extended: true }))

let neoFS = require('./routes/neoFS')

app.use('/', neoFS);

app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));
