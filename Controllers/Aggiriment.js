const mongoose = require('mongoose');
const agreementSchema = require("../Models/Aggrement");

const getaggrimentdetails = async(req, res) => {
    try {
        const email = req.body.email;
        console.log(email);
        const response = await agreementSchema.findOne({ email: email });
        console.log(response);
        res.status(200).json({
            message: "Aggrement Details",
            data: response,
        });
    } catch (error) {

        res.status(500).json({
            message: "Internal Server Error",
        });

    }

}

module.exports = {
    getaggrimentdetails,
}