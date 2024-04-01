const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const dbConnect = require('./Utils/dbconnect');
const cors = require('cors');
const bodyParser = require('body-parser');


dbConnect();


const PORT = process.env.PORT || 5000;



app.use(express.static('public'));
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



app.use('/api/user', require('./Routes/user'));
app.use('/api/employee', require('./Routes/employees'));
app.use('/api/assignment', require('./Routes/assignment'));




app.get("/", (req, res) => {
    res.send("Hello World");
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});