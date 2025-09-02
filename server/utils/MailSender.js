const nodemailer = require("nodemailer");
require("dotenv").config();

const mailSender = async (email, title, body) => {
  try {
    let transporter = nodemailer.createTransport({
      // host: process.env.MAIL_HOST,
      host: "smtp.gmail.com",
      auth: {
        
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      
      },
      tls: {
        rejectUnauthorized: false,
      },
      secure: false,
    });
    let info = await transporter.sendMail({
      from: `"StudyNotion" <${"fecttv135@gmail.com"}>`,
      to: `${email}`,
      subject: `${title}`,
      html: `${body}`,
    });
    return info;
  } catch (error) {
    console.log(error.message);
    return error.message;
  }
};

module.exports = mailSender;
