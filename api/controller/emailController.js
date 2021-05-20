var nodemailer = require("nodemailer");

var transporter = nodemailer.createTransport({
  name: "madqueenrock.com",
  host: "mail.madqueenrock.com",
  port: 465,
  secure: true,
  auth: {
    user: "site@madqueenrock.com",
    pass: "M@dqueen",
  },
});

function sendMail(to, subject, message, attachment) {
  var mailOptions = {
    from: "site@madqueenrock.com",
    to: to,
    envelope: {
      from: "site <site@madqueenrock.com>",
      to: to,
    },
    subject: subject,
    text: message,
    attachments: [attachment],
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log(`E-mail enviado para ${mailOptions.to}`);
    }
  });
}

module.exports.sendMail = sendMail;
