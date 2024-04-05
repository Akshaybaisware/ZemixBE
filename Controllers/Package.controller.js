const package = require('../Models/Package');

const add_package = async(req, res) => {
    try {

        const { packagename, noofFroms, days } = req.body;

        // Check if all required fields are provided
        if (!packagename || !noofFroms || !days) {
            return res.status(400).json({ message: "All fields are required." });
        }
        const newPackage = new package({
            packagename,
            noofFroms,
            date
        });
        const savedPackage = await newPackage.save();
        res.status(201).json({
            isAdded: true,
            message: "Package added successfully",
            package: savedPackage,
        });


    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });

    }
};

module.exports = {
    add_package
};