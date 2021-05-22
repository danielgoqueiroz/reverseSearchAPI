var nodemailer = require("nodemailer");

var transporter = nodemailer.createTransport({
  name: "email@reversesearch.danielqueiroz.com",
  host: "reversesearch.danielqueiroz.com",
  port: 465,
  secure: true,
  auth: {
    user: "email@reversesearch.danielqueiroz.com",
    pass: "CK3gN8iTtyPdSRJ",
  },
});

function sendMail(to, subject, message, attachment) {
  var mailOptions = {
    from: "email@reversesearch.danielqueiroz.com",
    to: to,
    envelope: {
      from: "site <email@reversesearch.danielqueiroz.com>",
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
