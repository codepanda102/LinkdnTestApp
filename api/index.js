require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const routes = require('./routes/authRoutes');

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(routes);

const dburi = process.env.DBURI;
const connectToDB=async()=>{
    try{
        await mongoose.connect(dburi, {}).then(()=>{
            console.log('Successfully connected to DB');
        }).catch(err=>{
            console.log('Failed connected To DB', err);
        })
    }catch(err){
        console.log(err);
        process.exit(1);
    }
}
//...
connectToDB();


// testing route..
app.get('/home', (req, res) => {
    res.status(200).send({
        success: true,
        message: "Welcome Nassir"
    });
});

// test script to verify email configuration:
// const nodemailer = require('nodemailer');
// async function testEmail(){
//     try{
//         const transporter = nodemailer.createTransport({
//             service:'gmail',
//             auth:{
//                 user: process.env.EMAIL_USER,
//                 pass: process.env.EMAIL_PASS
//             }
//         });

//         await transporter.verify();
//         console.log('Email configuration is valid');

//         // Try send a test email..
//         await transporter.sendMail({
//             from: process.env.EMAIL_US,
//             to: process.env.EMAIL_USER, // send it to yourself
//             subject:'Test Email',
//             text:'If your receive this, your email configuration is working!'
//         })
//         console.log('Test email sent successfully');
//     }catch(error){
//         console.error('Email configuration error', error)
//     }
// }
// // ..
// testEmail();


const port = process.env.PORT || 3000;
app.listen(port, () => {
    // testing environment variables if loaded correctly..    
    console.log(`Server is running on port ${port}`);
    console.log('Email configuration:', {
        user: process.env.EMAIL_USER ? 'Set' : 'Not set',
        pass: process.env.EMAIL_PASS ? 'Set' : 'Not set'
    });
});
