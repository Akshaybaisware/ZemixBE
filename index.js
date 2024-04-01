const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const dbConnect = require('./Utils/dbconnect');
const cors = require('cors');

dbConnect();


const PORT = process.env.PORT || 5000;



app.use(express.static('public'));
app.use(express.json());
app.use(cors());

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});