require('dotenv').config();
const express = require('express');
const authController = require('../controllers/authController');
const nodemailer = require('nodemailer');

const router = express.Router();

router.post('/register', authController.register);
router.get('/verify/:token', authController.verify);
router.post('/login', authController.login);
router.get('/profile/:userId', authController.profile);
router.get('/users/:userId', authController.users);
router.get('connection_request/', authController.connection_request);
router.get('connection_requests/:userId', authController.connection_requests);

router.post('/test-email', async(req, res)=>{
    try{
        const testEmail = req.body.email || process.env.EMAIL_USER;
        console.log('Testing email configuration with:', testEmail);
        //..
        const transporter = nodemailer.createTransport({
            service:'gmail',
            auth:{
                user:'autumntanzania@gmail.com',
                pass:process.env.EMAIL_PASS
            }
        });

        const testResult = await transporter.sendMail({
            from:'autumntanzania@gmail.com',
            to:testEmail,
            subject:'Test Email',
            text:`This is a test email to verify the email configuration is working`
        });

        res.json({
            success: true,
            message: 'Test email sent successfully',
            messageId: testResult.messageId
        })

    }catch(error){
        console.error('Test email failed:', error);
        res.status(500).json({
            success:false,
            error: error.message,
            details:{
                name: error.name,
                code: error.code
            }
        })
    }
})

module.exports = router;