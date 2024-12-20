const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs');
import transport from '@src/modules/mailer';

function sendMail(html: string, from: string, subject: string, body: any) {
  try {
    const source = fs.readFileSync(`./src/resources/mail/${html}`, 'utf8');
    const template = handlebars.compile(source);

    const htmlToSend = template(body);

    transport.sendMail(
      {
        to: body.email,
        from: `Softspace BR <${from}@softspace.com.br>`,
        subject: subject, // assunto do email
        html: htmlToSend,
      },
      (err) => {
        if (err) console.error('Email not sent:', err);
        transport.close();
      }
    );
  } catch (error) {
    console.error(error);
  }
}

export default sendMail;

