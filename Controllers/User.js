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



module.exports = { add_user, userlogin, forgot_password };