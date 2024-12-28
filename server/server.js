const express = require('express');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.post('/send-verification-email', (req, res) => {
    const { email, code } = req.body;

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com', 
        port: 587,             
        secure: false,   
        auth: {
            user: 'trishiah.rellon@gmail.com',
            pass: 'ipak xfss llyy urzw',
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Email Verification Code',
        text: `Your verification code is: ${code}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            res.status(500).send('Error sending email');
        } else {
            console.log('Email sent: ' + info.response);
            res.status(200).send('Email sent');
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
