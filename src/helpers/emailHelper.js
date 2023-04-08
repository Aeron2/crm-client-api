const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: 'liam.marvin@ethereal.email',
    pass: '3uCgF8FSNbfn1J1f5U',
  },
});

const send = (info) => {
  return new Promise(async (resolve, reject) => {
    try {
      let result = await transporter.sendMail(info);
      console.log('Message sent: %s', result.messageId);
      // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

      // Preview only available when sending through an Ethereal account
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(result));
      // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...

      resolve(result);
    } catch (error) {
      console.log(error);
    }
  });
};

const emailProcessor = ({email, pin, type}) => {
  let info = '';
  switch (type) {
    case 'request-new-pass':
      info = {
        from: '"The Aeron Company" <liam.marvin@ethereal.email>', // sender address
        to: email, // list of receivers
        subject: 'CRM reset pin ', // Subject line
        text:
          'Here is your password rest pin' +
          pin +
          'This pin will expire in one day', // plain text body
        html: `<b>Hello</b>
    Here is Your Pin
    <b>${pin}</b>
    This will expire in one Day
    
      `, // html body
      };

      send(info);
      break;
    case 'password-update-succcess':
      info = {
        from: '"The Aeron Company" <liam.marvin@ethereal.email>', // sender address
        to: email, // list of receivers
        subject: 'CRM password updated', // Subject line
        text: 'Your new password has been updated', // plain text body
        html: `<b>Your new password has been updated</b>
    
      `, // html body
      };

      send(info);
      break;
    default:
      break;
  }
};

module.exports = {
  emailProcessor,
};
