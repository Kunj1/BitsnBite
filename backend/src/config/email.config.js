const formData = require('form-data');
const Mailgun = require('mailgun.js');
const config = require('./index.js');
const logger = require('./logger.config.js');

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: config.mailgun.apiKey,
});

const emailConfig = {
  send: async ({ to, subject, text, html }) => {
    try {
      const msg = {
        from: config.mailgun.fromEmail,
        to,
        subject,
        text,
        html
      };

      const response = await mg.messages.create(config.mailgun.domain, msg);
      logger.info('Email sent successfully', { to, subject });
      return response;
    } catch (error) {
      logger.error('Error sending email:', error);
      throw error;
    }
  }
};

module.exports= emailConfig;