const nodemailer = require("nodemailer");
require("dotenv").config();
const router = require("express").Router();

// Mail sending function
let mailsend = async (req, res) => {
    try {
        const { APP_EMAIL, APP_PASS, HOST_NO } = process.env;

        const transporter = nodemailer.createTransport({
            host: HOST_NO,
            port: 465,
            secure: true, // Use `true` for port 465, `false` for other ports
            auth: {
                user: APP_EMAIL,
                pass: APP_PASS,
            },
        });

        // Send mail with defined transport object
        const info = await transporter.sendMail({
            from: req.body.email, // Sender's email from the request body
            to: "tusharbansal3366@gmail.com", // Recipient's email address
            subject: `Contact Us: Message from ${req.body.name}`, // Subject line
            text: req.body.message, // Plain text message
            html: `<p><b>Name:</b> ${req.body.name}</p>
                   <p><b>Email:</b> ${req.body.email}</p>
                   <p><b>Message:</b> ${req.body.message}</p>`, // HTML formatted message
        });

        console.log("Message sent: %s", info.messageId);
        return res.status(200).json({
            mailsended: true,
        });
    } catch (err) {
        console.error("Error sending email:", err);
        return res.status(500).json({
            mailsended: false,
            error: err.message,
        });
    }
};

// Define Contact Us route
router.post('/contact', mailsend);

module.exports = router;
