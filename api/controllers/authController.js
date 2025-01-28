require('dotenv').config();
const express = require('express');
const User = require('../models/user');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const NodeCache = require('node-cache');


const cache = new NodeCache({ stdTTL: 600, checkperiod: 120});

const handleErrors = (err) => {
    console.log(err.message, err.code)
    let errors = { name: '', email: '', password: '' }

    if (err.message === 'Incorrect user name') {
        return errors.name = 'User is not registered to the database';
    }

    if (err.message === 'Incorrect Email') {
        return errors.email = 'Email is not registered!';
    }

    if (err.message === 'Incorrect password') {
        return errors.password = 'Password is not registered!';
    }

    // duplicate error code: 11000
    if (err.code === 11000) {
        errors.email = 'Email already taken';
        return errors;
    }

    if (err.message.includes('Failed user validation')) {
        Oject.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        })
    }
    return errors;
}

//..
const generateSecretKey = () => {
    const secretKey = crypto.randomBytes(30).toString("hex");
    return secretKey;
}
const secreteKey = generateSecretKey();
const maxAge = 3 * 24 * 60 * 60;

module.exports.register = async (req, res) => {

    try {
        // debug incoming data..
        console.log('Received registration data', req.body);
        const { name, email, password, profileImage } = req.body;
        // 
        // console.log(name, email, password);

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // check if there is an existing user..
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            console.log(`Duplicate registration attemp for email: ${email}`);
            res.status(400).json({ success: false, message: 'User with the same email address already exist in the db' });
        }
        if (password.length <= 6) {
            console.log('Password must contain more than 6 characters');
            res.status(401).json({ message: 'Login failure, password must contain more than 6 characters!' });
        }
        // register a new user..
        if (!existingUser) {
            const newUser = await User.create({
                name,
                email,
                password,
                profileImage,
                verificationToken: crypto.randomBytes(20).toString("hex") // remember to provide a verification token
            });
            console.log(`New User created successfully: ${email}`);
            // const jwt_token = jwt.sign({email}, secreteKey, {expiredIn: '1h'});
            await sendEmailVerificationToken(newUser.email, newUser.verificationToken);
            //..
            return res.status(201).json({
                success: true,
                message: 'User registration successfully, Please check your email for verification',
                userId: newUser._id
            });
        }
    } catch (error) {
        console.log('Registration error:', {
            message: error.message,
            code: error.code,
            email: req.body.email
        })
        const errors = handleErrors(error);
        res.status(500).json({
            success: false,
            message: 'Error registering user',
            error: errors
        })
    }
}

const sendEmailVerificationToken = async (email, verificationToken) => {

    try {
        // verify environment variables are loaded..
        console.log('Checking email configuration....');

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            throw new Error('Email credentials not configured');
        }

        const transporter = nodemailer.createTransport({
            // service: 'gmail',
            service: 'gmail',
            port: 587,
            // secure:false, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            // tls:{
            //     rejectUnauthorized: false
            // }
        });

        // test the connection 
        await transporter.verify();
        // console.log('Email connection verified');
        console.log('SMTP connection verified');

        const verificationUrl = `http://172.21.96.1:5000/verify/${verificationToken}`;

        const mailOptions = {
            // from: process.env.EMAIL_USER,
            from: `Your App Name <${process.env.EMAIL_USER}>`, // make this clear
            to: email,
            subject: 'Email Verification',
            // html:`
            //     <h1>Verify Your Email</h1>
            //     <p>Please click the link below to verify your email address:</p>
            //     <a href="http://172.21.96.1:5000/${verificationToken}">Verify Email</a>
            // `,
            text: `Please open the link to verify your email address: ${verificationUrl}`
        }

        const info = await transporter.sendMail(mailOptions);
        console.log('Email verification sent successfully', info.messageId);

    } catch (err) {
        console.log('Email verification failed', err);
        // throw error;
    }
}

// endpoint for email verification
module.exports.verify = async (req, res) => {
    try {
        const token = req.params.token;
        console.log('Attempting to verify token:', token);

        // get existing user by verification token..
        const user = await User.findOne({ verificationToken: token });

        if (!user) {
            console.log('Invalid verification token:', token);
            res.status(404).json({
                success: false,
                message: 'Invalid verification token'
            });
        }
        // if successfull, update user verification status..
        if (user){
            user.verified = true;
            user.verificationToken = undefined; // remove the token after verification
            await user.save();
            console.log('User verified successfully', user.email);
            res.status(200).json({ success: true, message: 'Email verification successfully' });
        }
    } catch (err) {
        console.log('Verification error:', err.message);
        res.status(500).json({ success: false, message: 'Email verification failed', error: err.message });
    }
}

module.exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // check for existing user..
        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found!');
            return res.status(401).json({ success: false, message: 'This user is not available! Please try to register' });
        }

        // use the compare method from user model to proper compare passwords..
        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            return res.json({
                success: false,
                message: 'Invalid email or password'
            })
        }

        const token = jwt.sign({ userId: user._id }, secreteKey, {expiresIn:'1h'});
        console.log('Successfully logged in');
        return res.status(200).json({ success: true, token, message: 'Successfully logged in' });
    } catch (err) {
        console.log('Error Login In', err.message);
        res.status(500).json({ success: false, message: 'Login Failed' });
    }
}

// verify token route..
module.exports.verify=async(req, res)=>{
    try{
        const token = req.params.token;
        const user = await User.findOne({verificationToken: token});
        if (!user){
            console.log('User not found!');
            return res.status(404).json({message:'User not found!'})
        }
        if (user){
            user.verified = true;
            user.verificationToken = undefined;
            await user.save();
            console.log('Token verification successful');
            return res.status(200).json({message:'Token verification was successful', user});
        }
    }catch(error){
        console.log('Error verifying token', err.message);
        res.status(500).json({message:'Error verifying token'});
    }
}

// fetching user profile endpoint..
module.exports.profile=async(req, res)=>{
    try{
        const userId = req.params.userId;
        const user = await User.findById(userId);
        if (!user){
            console.log('User not found!');
            return res.status(404).json({message:'User not found!'});
        }
        console.log('Users profile', user);
        res.status(200).json({message:'Successful fetching user profile:', user});
    }catch(error){
        console.log('Error retrieving user profile', error.message);
        res.status(500).json({message:'Failed retrieving user profile'})
    }
}

// fetching all users except the logged-in user..
module.exports.users = async(req, res)=>{
    try{
        const loggedInUserId = req.params.userId;
        const loggedInUser = await User.findById(loggedInUserId).populate("connections","_id");
        if (!loggedInUser){
            console.log('Error, user not found!');
            return res.status(404).json({success:false, message:'Error user not found!'});
        }
        // to get connected user IDs, we need to iterate through each of the logged-in user connection and get each of
        // their IDs..
        const connectedUserIds = loggedInUser.connections.map((connection)=> connection._id);
        // fetch users who are not connected to the user Id
        const users = await User.find({
            _id:{$ne:loggedInUserId, $nin:connectedUserIds}
        })
        console.log('Successful fetching users', users);
        res.status(200).json({message:'Users not connected to the user ID', users});
    }catch(error){
        console.log('Error retrieving users', error.message);
        res.status(500).json({message:'Error fetching users'});
    }
}

// endpoint to get all the connections right..
module.exports.connection_request=async(req, res)=>{
    const { currentUserId, selectedUserId } = req.body;

    try{
        if (!currentUserId || !selectedUserId){
            console.log(`User ID's Required!`);
            return res.status(400).json({message:'Invalid user IDs'});
        }
        const connectionRequest = await User.findByIdAndUpdate(selectedUserId, {
            $push: { connectionRequest: currentUserId }
        })
        if (!connectionRequest){
            console.log('Error! Failed receiving a connection request.');
            return res.status(400).json({message:'Failed receiving a connection request!'});
        }
        const sentConnectionRequest = await User.findByIdAndUpdate(currentUserId, {
            $push: { sentConnectionRequest: selectedUserId }
        })
        if (!sentConnectionRequest){
            console.log('Error! Failed sending a connection request.');
            return res.status(400).json({message:'Error! sending a connection request.'});
        }
        //..
        res.status(200).json({message:'Successful sending a connection request!'});
    }catch(error){
        console.error('Error creating a connection request!', error.message);
        res.status(500).json({success: false, message:'Error creating a connection request!'});
    }
}

module.exports.connection_requests=async(req, res)=>{
    try{
        const { userId } = req.params.userId;
        // verify
        if (!mongoose.Types.ObjectId.isValid(userId)){
            return res.status(404).json({message:'User not found!'});
        }

        // check if cache data exists return immeaditely without querying the database..
        // if not cached, the database query runs and data is saved in cache..
        const cachedData = cache.get(userId);

        // if data available use it, if not send
        if (cachedData){
            console.log('Cache Hit');
            return res.json(cachedData);
        }

        // if data not cached display this...
        console.log('Cache miss, fetching from DB');
        
        const user = await User.findByIdAndUpdate(userId).populate("connectionRequest", "name email profileImage").lean();

        if (!user){
            console.log('User not found!');
            return res.status(404).json({message:'Error user not found!'});
        }

        // send connection requests as response..
        res.json(user.connectionRequest);

    } catch(error){
        console.error('Error fetching user connection requests', error.message);
        res.status(500).json({success: false, message:'Internal Server Error! fetching user connection requests'});
    }
}

// endpoint to accept connection request:
// router.post('connection_requests/accept')
module.exports.acceptConnectionRequest=async(req, res)=>{
    try{
        const {senderId, recepientId} = req.body;
        
        //
        if (!senderId || !recepientId){
            console.log('Error! sender or recepient are not accessible');
            return res.status(400).json({message:'Error! sender or recepient are not accessible'});
        }

        // fetch sender and recepient
        const sender = await User.findById(senderId);
        const recepient = await User.findById(recepientId);
        
        // validate sender and recepient existance
        if (!sender || !recepient){
            console.log('sender or recepient are not found!');
            return res.status(404).json({message:'Error! sender or recepient are not found!'});
        }

        // remove connection request once it has been accepted..
        // if sender connectionRequest array each of its request contains the recepient request, 
        // then its going to be removed, if it does not match then it remains in the array of connectionRequests..
        // Remove the recepientId from the sender's connectionRequests (if applicable)
        sender.connectionRequest = sender.connectionRequest.filter((request)=> request.toString !== recepientId.toString());
        // remove the senderId from the recepient's connectionRequests if they match
        recepient.connectionRequest = recepient.connectionRequest.filter((request)=> request.toString !== senderId.toString());

        await sender.save();
        await recepient.save();

        res.status(200).json({message:'Connection request accepted successfully!'});

    }catch(error){
        conso.error('Error accepting connection request', error.message);
        res.status(500).json({success: false, message:'Error! accepting connection request'})
    }
}