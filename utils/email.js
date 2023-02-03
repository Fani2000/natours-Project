const nodemailer = require("nodemailer");
const pug = require('pug')
const {htmlToText} = require('html-to-text')

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.url = url;
    this.from = `Fani Keorapetse <${process.env.EMAIL_FROM}>`;
  }

   createTransport() {
    if (process.env.NODE_ENV === "production") {
      // Send grid transporter
      return 1;
    }

    const transporter =  nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    return transporter;
  }

  async send(template, subject) {

    const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject
    })

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      text: htmlToText(html),
      html: html
    };

    await this.createTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send("welcome", "Welcome to the Natours Family!");
  }
  async sendPasswordRest() {
    await this.send('passwordReset', 'Your password reset token (valid for only 10 minutes)')
  }
};
