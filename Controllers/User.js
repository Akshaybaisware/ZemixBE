const User = require('../Models/User');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
require('dotenv').config();
const sendConfirmationEmail = require('../Utils/mail.js');
const generateuserToken = require('../Utils/tokengenerator.js');
const { generateRandomPassword } = require('../Utils/randompassword.js');







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




module.exports = { add_user, userlogin };