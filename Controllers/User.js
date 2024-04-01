const User = require('../Models/User');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
require('dotenv').config();
const sendConfirmationEmail = require('../Utils/mail.js');
const generateuserToken = require('../Utils/tokengenerator.js');
const { generateRandomPassword } = require('../Utils/randompassword.js');
const { generateOTP, sendOTPEmail } = require('../Utils/otp.js');






const add_user = async(req, res) => {
    try {
        const { name, email, mobile, address, plan, caller } = req.body;

        if (!name || !email || !mobile || !address || !plan || !caller) {
            return res.status(400).json({ message: 'All fields are required.' });
        }
        const existsUser = await User.findOne({
            email: email
        });
        if (existsUser) {
            return res.status(400).json({ message: 'Email Already Exists...' });
        }

        const password = generateRandomPassword();

        const newUser = new User({
            name,
            email,
            mobile,
            address,
            plan,
            caller,

            status: 'Registered',
            password,
            totalAssignment: 520,
            pendingAssignment: 520,
        });

        const savedUser = await newUser.save();

        await sendConfirmationEmail(email, password);
        res.status(201).json({ message: 'User added successfully', user: savedUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


const userlogin = async(req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email, password });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const currentDate = new Date();
        const userEndDate = new Date(user.endDate);
        const isWithin12Hours = new Date(userEndDate.getTime() + 12 * 60 * 60 * 1000);

        if (userEndDate > currentDate) {
            const timeDifference = userEndDate.getTime() - currentDate.getTime();
            const days = Math.floor(timeDifference / (1000 * 3600 * 24));
            const role = user.role;
            const id = user._id;
            console.log(id);
            return res.status(200).json({ message: 'Login success..', role, days, token: generateuserToken(user), id });
        } else {
            if (isWithin12Hours > currentDate) {
                user.status = 'Freeze';
                await user.save();
                const status = user.status;
                return res.status(200).json({ message: 'User status updated to Freeze', status });

            } else {
                return res.status(404).json({ message: 'QUC Failed' });
            }

        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server error' });
    }
};


const forgot_password = async(req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user) {
            const otp = generateOTP();
            user.passwordResetOTP = otp;
            try {
                const updatedUser = await user.save();
                // Send OTP to user's email
                await sendOTPEmail(user.email, otp);
                res.json({ message: 'User verified successfully, and OTP sent via mail.', user_id: user._id });
            } catch (saveError) {
                console.error('Error saving user:', saveError);
                res.status(500).json({ error: 'Error saving user data.' });
            }
        } else {
            res.status(401).json({ error: 'Invalid credentials.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const verify_otp = async(req, res) => {
    const { passwordResetOTP } = req.body; // Destructure the passwordResetOTP from req.body
    try {
        const user = await User.findOne({ passwordResetOTP }); // Corrected the query
        if (user) {
            const id = user._id;
            res.status(200).json({ message: 'OTP verified successfully', id });
        } else {
            res.status(401).json({ message: 'Invalid OTP' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}



const submit_password = async(req, res) => {
    const { newPassword, confirmPassword } = req.body;
    const userId = req.params.id; // Assuming you have the correct parameter name
    console.log(userId);
    try {
        // Find the user by ID
        const user = await User.findById(userId);
        // Check if the user exists
        console.log(user);
        if (newPassword == "" || confirmPassword == "") {
            return res.status(400).json({ error: 'Please Enter Any Values' });
        }
        if (user) {
            // Check if newPassword and confirmPassword match
            if (newPassword !== confirmPassword) {
                return res.status(400).json({ error: 'Password and Confirm Password do not match.' });
            }
            // Update password and reset OTP
            user.password = newPassword;
            user.passwordResetOTP = undefined;
            // Save changes to the database
            await user.save();
            // Respond with success message
            return res.status(200).json({ message: 'Password Reset Successfully.' });
        } else {
            // If user is not found, respond with an error
            return res.status(401).json({ error: 'Invalid credentials.' });
        }
    } catch (error) {
        // Handle unexpected errors
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};


const get_all_user = async(req, res) => {
    try {
        const defaultPage = 1;
        const defaultLimit = 10;
        // Get page number and limit from query parameters (use default values if not provided)
        const { page = defaultPage, limit = defaultLimit } = req.query;
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        if (isNaN(pageNumber) || isNaN(limitNumber) || pageNumber < 1 || limitNumber < 1) {
            return res.status(400).json({ message: 'Invalid page or limit values.' });
        }
        // Get the total number of users
        const totalUsers = await User.countDocuments();
        // Calculate the total number of pages
        const totalPages = Math.ceil(totalUsers / limitNumber);
        // Ensure the requested page is within bounds
        if (pageNumber > totalPages) {
            return res.status(400).json({ message: 'Invalid page number.' });
        }
        // Calculate the skip value based on the page number and limit
        const skip = (pageNumber - 1) * limitNumber;
        const allUser = await User.find().sort({ _id: -1 }).skip(skip).limit(limitNumber);
        res.status(200).json({
            allUser,
            currentPage: pageNumber,
            totalPages,
            totalUsers,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


const getuser_by_status = async(req, res) => {
    try {
        const status = req.body.status;
        const users = await User.find({ status });
        res.status(200).json({ User: users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}



const update_user_status = async(req, res) => {
    try {
        const userId = req.params.id; // Extract user ID from the URL parameter
        const { status } = req.body; // Destructure the 'status' from req.body
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required.' });
        }
        const updatedUser = await User.findByIdAndUpdate(
            userId, { status }, { new: true }
        );
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.status(200).json({ message: 'Status updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


const delete_user = async(req, res) => {
    try {
        const userId = req.params.id;
        // Check if userId is provided
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required.' });
        }
        const result = await User.deleteOne({ _id: userId });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


const edit_user = async(req, res) => {
    try {
        const userId = req.params.id; // Extract user ID from the URL parameter
        const { name, email, mobile, address, plan, caller } = req.body;
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required.' });
        }
        const updatedUser = await User.findByIdAndUpdate(
            userId, {
                name,
                email,
                mobile,
                address,
                plan,
                caller,
            }, { new: true }
        );
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.status(200).json({ message: 'User updated successfully', user: updatedUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


const search_users = async(req, res) => {
    try {
        const { startDate, endDate } = req.body;
        // Check if both startDate and endDate are provided
        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'Both startDate and endDate are required for searching.' });
        }
        // Convert startDate and endDate to Date objects
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        // Add 1 day to the endDate to include the whole day
        endDateObj.setDate(endDateObj.getDate() + 1);
        // Search for users between startDate and endDate
        const users = await User.find({
            startDate: { $gte: startDateObj, $lt: endDateObj },
        });
        res.status(200).json({ users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


const getuser_by_id = async(req, res) => {
    try {
        const getid = req.params.id;
        const user = await User.findById(getid); // Corrected this line by using findById
        res.status(200).json({ User: user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const search_user_by_name = async(req, res) => {
    try {
        const { status } = req.query;
        const { name } = req.body;
        // Check if name is provided
        if (name == "") {
            return res.status(404).json({ message: 'Please Enter Any Values for Search.' });
        }
        if (!name) {
            return res.status(400).json({ message: 'Name is required for searching.' });
        }
        // Search for users by name and optional status
        const query = { name: { $regex: new RegExp(name, 'i') } };
        if (status) {
            query.status = status;
        }
        const users = await User.find(query);
        res.status(200).json({ users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


const user_pagination = async(req, res) => {
    try {
        const { status } = req.query;
        // Set default values for page and limit
        const defaultPage = 1;
        const defaultLimit = 10;
        // Get page number and limit from query parameters (use default values if not provided)
        const { page = defaultPage, limit = defaultLimit } = req.query;
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        if (isNaN(pageNumber) || isNaN(limitNumber) || pageNumber < 1 || limitNumber < 1) {
            return res.status(400).json({ message: 'Invalid page or limit values.' });
        }
        // Build the query object with the condition based on the status parameter
        const query = status ? { status: status } : {};
        // Get the total number of users based on the condition
        const totalUsers = await User.countDocuments(query);
        // Calculate the total number of pages
        const totalPages = Math.ceil(totalUsers / limitNumber);
        // Ensure the requested page is within bounds
        if (pageNumber > totalPages) {
            return res.status(400).json({ message: 'Invalid page number.' });
        }
        // Calculate the skip value based on the page number and limit
        const skip = (pageNumber - 1) * limitNumber;
        // Fetch users with pagination and condition
        const users = await User.find(query).sort({ _id: -1 }).skip(skip).limit(limitNumber);
        res.status(200).json({
            users,
            currentPage: pageNumber,
            totalPages,
            totalUsers,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


const sendUserInfo = async(req, res) => {
    try {
        const { userId } = req.params;
        console.log(userId, "userId");
        const user = await User.findById({ _id: userId });
        const aggrUserId = await Agreement.findOne({ email: user.email });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        user.status = "Success";
        await user.save();
        const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'login',
                user: process.env.EMAIL, // Replace with your email
                pass: process.env.PASSWORD, // Replace with your email password
            },
        });

        const mailOptions = {
            from: process.env.EMAIL,
            to: user.email,
            subject: 'Welcome to Zemex Service',
            html: `
            <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; background-color: #f4f4f4; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
              <h2 style="color: #007bff; text-align: center;">Welcome to Zemex Service</h2>
              <p style="font-size: 16px; text-align: justify;">Dear ${user.name},</p>
              <p style="font-size: 16px; text-align: justify;">Thank you for choosing Zemex Service. You have been successfully registered for the work of Data Entry Services.</p>
              <p style="font-size: 16px; text-align: justify;">We're excited to provide you with our uninterrupted services.</p>
              <hr style="border: 1px solid #ddd; margin: 15px 0;">

              <p style="font-size: 16px;"><strong>Registration Details:</strong></p>
              <ul style="list-style: none; padding: 0; margin: 0;">
                <li style="font-size: 16px;"><strong>Name of the Employee:</strong> ${user.name}</li>
                <li style="font-size: 16px;"><strong>Email:</strong> ${user.email}</li>
                <li style="font-size: 16px;"><strong>Phone:</strong> ${user.mobile}</li>
              </ul>
              <p style="font-size: 16px; text-align: justify;">Here's what you need to do next:</p>
              <p style="font-size: 16px;"><a href="${process.env.FRONTEND_URL}/userlogin" style="color: #007bff; text-decoration: none; display: inline-block; margin-top: 10px; padding: 10px 20px; background-color: #007bff; color: #fff; border-radius: 5px; text-align: center;">Click here to get started</a></p>
              <p style="font-size: 16px;"><strong>Username:</strong> ${user.email}</p>
              <p style="font-size: 16px;"><strong>Password:</strong> ${user.password}</p>
              <p style="font-size: 16px;"><strong>Initial Starting Date:</strong> ${formatDate(user.startDate)} | <strong>Account Expiry Date:</strong> ${formatDate(user.endDate)}</p>
              <hr style="border: 1px solid #ddd; margin: 15px 0;">

              <p style="font-size: 16px; text-align: justify;">Stay in touch with our customer service for more support.</p>
              <p style="font-size: 16px;"><strong>Customer Care:</strong> 123 (10 AM - 5 PM, Mon - Sat)</p>
              <p style="font-size: 16px;">Mail us anytime: <a href="mailto:helplinezxservicewww@gmail.com" style="color: #007bff; text-decoration: none;">helplinezxservicewww@gmail.com</a></p>
              <p style="font-size: 16px;">You can download your signed agreement <a href="https://zemixservices.netlify.app/employmentformdetails/${aggrUserId ._id}" style="color: #007bff; text-decoration: none;">here</a></p>
              <p style="font-size: 16px;"><strong>Company Information:</strong><br>
              <strong>Helpline mail id:</strong> helplinezxservicewww@gmail.com<br>
              </p>
            </div>
          `,
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            console.log(`Email sent: ${info.response}`);
            res.status(200).json({ message: 'Email sent successfully' });
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


const update_endDate = async(req, res) => {
    try {
        const userId = req.params.id;
        const amount = req.body.amount;
        if (!amount || isNaN(amount)) {
            return res.status(400).json({ error: 'Invalid amount provided.' });
        }
        // Find the user by ID
        const user = await User.findById(userId);
        // Check if the user exists
        if (!user) {
            c
            return res.status(404).json({ error: 'User not found.' });
        }
        const today = new Date().toLocaleDateString('en-CA'); // Adjust locale if necessary
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 5);
        const endDateFormatted = endDate.toLocaleDateString('en-CA'); // Adjust locale if necessary
        // Update user fields
        user.startDate = today;
        user.endDate = endDateFormatted;
        user.status = 'Success';
        user.amount.push(amount);
        // Save user
        await user.save();
        res.status(200).json({ message: 'User details updated successfully.', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error.' });
    }
};

const recovery_user = async(req, res) => {
    try {
        const defaultPage = 1;
        const defaultLimit = 10;
        // Get page number and limit from query parameters
        const { page = defaultPage, limit = defaultLimit } = req.query;
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        if (isNaN(pageNumber) || isNaN(limitNumber) || pageNumber < 1 || limitNumber < 1) {
            return res.status(400).json({ message: 'Invalid page or limit values.' });
        }
        // Get the total number of users
        const totalUsers = await User.countDocuments({ 'amount': { $exists: true, $ne: [] }, });
        // Calculate the total number of pages
        const totalPages = Math.ceil(totalUsers / limitNumber);
        // Ensure the requested page is within bounds
        if (pageNumber > totalPages) {
            return res.status(400).json({ message: 'Invalid page number.' });
        }
        // Calculate the skip value based on the page number and limit
        const skip = (pageNumber - 1) * limitNumber;
        const users = await User.find({
            'amount': { $exists: true, $ne: [] },
        }).sort({ _id: -1 }).skip(skip).limit(limitNumber);

        res.status(200).json({
            users,
            currentPage: pageNumber,
            totalPages,
            totalUsers,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error.' });
    }
};


const search_user_recovery = async(req, res) => {
    try {
        const { name } = req.body;
        // Check if name is provided
        if (name == "") {
            return res.status(404).json({ message: 'Please Enter Any Values for Search.' });
        }
        if (!name) {
            return res.status(400).json({ message: 'Name is required for searching.' });
        }
        // Search for users by name and optional status
        const query = { name: { $regex: new RegExp(name, 'i') }, 'amount': { $exists: true, $ne: [] } };
        const users = await User.find(query);
        res.status(200).json({ users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


const generateRandomNumber = () => {
    return Math.floor(Math.random() * (400 - 360 + 1)) + 360;
};


module.exports = {
    add_user,
    userlogin,
    forgot_password,
    verify_otp,
    submit_password,
    get_all_user,
    getuser_by_status,
    update_user_status,
    delete_user,
    edit_user,
    search_users,
    getuser_by_id,
    search_user_by_name,
    user_pagination,
    sendUserInfo,
    update_endDate,
    recovery_user,
    search_user_recovery


};