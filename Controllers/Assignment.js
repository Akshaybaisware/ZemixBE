const Assignment = require("../Models/Assignment");
const User = require("../Models/User");



const add_assignment = async(req, res) => {
    try {
        const userId = req.params.id;
        const { name, address, pinCode, jobFunctional, phone, annualRevenue, cleanCode } = req.body;

        // Check if all required fields are provided
        if (!name || !address || !pinCode || !jobFunctional || !phone || !annualRevenue || !cleanCode) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Check if the name is unique (optional)
        const existingAssignment = await new_Assignment.findOne({ name });
        if (existingAssignment) {
            return res.status(400).json({ message: "Name already exists for an assignment." });
        }
        const globalId = getGlobalAssignmentDetailId();
        // Use the globalAssignmentDetailId directly
        const newAssignment = new new_Assignment({
            name,
            address,
            pinCode,
            jobFunctional,
            phone,
            annualRevenue,
            cleanCode,
            reference_assignment: globalId,
            userId: userId,
        });

        // Save the new assignment
        const savedAssignment = await newAssignment.save();

        // Update total assignments (if needed)
        const user = await User.findById(userId);
        if (user) {
            user.submitdAssingment += 1;
            user.pendingAssingment -= 1;
            await user.save();
        }

        res.status(201).json({
            message: "Assignment added successfully",
            assignment: savedAssignment,
        });
    } catch (error) {
        console.error("Error adding assignment:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
const get_assignments = async(req, res) => {
    try {
        const allAssignments = await new_Assignment.find();
        res.status(200).json({ assignments: allAssignments });
    } catch (error) {
        console.error("Error fetching assignments:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const get_totalAssignment = async(req, res) => {
    try {
        const userId = req.params.id;
        const totalAssignment = await User.findById(userId);
        if (totalAssignment) {
            res.status(200).json({
                total: totalAssignment.totalAssingment,
                submitted: totalAssignment.submitdAssingment,
                pending: totalAssignment.pendingAssingment,
            });
        } else {
            res.status(404).json({ message: "Total assignment statistics not found." });
        }
    } catch (error) {
        console.error("Error fetching total assignment statistics:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
const get_assignment_details = async(req, res) => {
    console.log("inside get assignments");
    try {
        // Find the user by email
        const user = await User.findOne({ email: req.body.email });
        // Check if the user exists
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        // Check if assignmentDetailIds is available
        const assignmentDetailIds = user.assignmentDetailIds || [];
        const availableAssignmentDetails = await AssingmentDetails.find({
            _id: {
                $nin: assignmentDetailIds,
            },
        });
        if (availableAssignmentDetails.length > 0) {
            // Choose a random assignment detail
            const randomIndex = Math.floor(Math.random() * availableAssignmentDetails.length);
            const randomAssignmentDetail = availableAssignmentDetails[randomIndex];
            // Set the global assignment detail ID
            setGlobalAssignmentDetailId(randomAssignmentDetail._id);
            // Send the response with the assignment detail
            return res.status(200).json({
                message: "Assignment Detail retrieved successfully",
                assignmentDetail: randomAssignmentDetail,
            });
        } else {
            return res.status(404).json({ message: "No available assignment details." });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
const refresh_get_assignment_details = async(req, res) => {
    try {
        await User.updateOne({ email: req.body.email }, {
            $push: { assignmentDetailIds: req.params.assignmentId },
        });

        return res.status(200).send({
            message: "Assignment Detail refreshed",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "Internal Server refreshed Error" });
    }
};

module.exports = {
    add_assignment,
    get_assignments,
    get_totalAssignment,
    get_assignment_details,
    refresh_get_assignment_details,
};