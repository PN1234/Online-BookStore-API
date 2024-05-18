const express = require('express');
const app = express();
const bodyparser = require('body-parser');
const Userroute = require('./routes/userroute');
const Bookroute = require('./routes/Bookroute');
app.use(bodyparser.json());
const db = require('./db');

const port = process.env.PORT || 3000;

app.use('/person',Userroute);
app.use('/book',Bookroute);



app.listen(port,function(){
	console.log("Server is listening on port 3000");
});