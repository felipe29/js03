import nodemailer from 'nodemailer';
import { resolve } from 'path';
import exphbs from 'express-handlebars';
import nodemailerrhbs from 'nodemailer-express-handlebars';
import mailconfig from '../config/mail';

class Mail {
  constructor() {
    const { host, port, secure, auth } = mailconfig;

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth,
    });
    this.configureTemplates();
  }

  sendMail(message) {
    return this.transporter.sendMail({
      ...mailconfig.default,
      ...message,
    });
  }

  configureTemplates() {
    const viewPath = resolve(__dirname, '..', 'app', 'views', 'emails');
    this.transporter.use(
      'compile',
      nodemailerrhbs({
        viewEngine: exphbs.create({
          layoutsDir: resolve(viewPath, 'layouts'),
          partialsDir: resolve(viewPath, 'partials'),
          defaultLayout: 'default',
          extname: '.hbs',
        }),
        viewPath,
        extName: '.hbs',
      })
    );
  }
}

export default new Mail();
