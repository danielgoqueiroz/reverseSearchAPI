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

var mailOptions = {
  from: "site@madqueenrock.com",
  to: ["pubdaniel@gmail.com", "contato@danielqueiroz.com"],
  envelope: {
    from: "site <site@madqueenrock.com>", // used as MAIL FROM: address for SMTP
    to: "Daniel <pubdaniel@gmail.com>", // used as RCPT TO: address for SMTP
  },
  subject: "Assunto de email",
  text: "2Aqui vai um texto pára testar o texto",
};

transporter.sendMail(mailOptions, function (error, info) {
  if (error) {
    console.log(error);
  } else {
    console.log("Email sent: " + info.response);
    console.log(info);
  }
});
