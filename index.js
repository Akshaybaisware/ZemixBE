const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const dbConnect = require('./Utils/dbconnect');

const PORT = process.env.PORT || 5000;
dbConnect();



app.use(express.static('public'));
app.use(express.json());

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});