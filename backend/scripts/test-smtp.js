const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const nodemailer = require('nodemailer');

async function main() {
  const recipient = process.argv[2];
  if (!recipient || !/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(recipient)) {
    throw new Error('Pass one recipient email address.');
  }
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, EMAIL_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD || !EMAIL_FROM) throw new Error('Missing SMTP settings.');
  const port = Number(SMTP_PORT || 465);
  const transport = nodemailer.createTransport({
    host: SMTP_HOST, port, secure: port === 465, requireTLS: port !== 465,
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD }, connectionTimeout: 10000,
    greetingTimeout: 10000, socketTimeout: 20000
  });
  const result = await transport.sendMail({
    from: EMAIL_FROM, to: recipient, subject: 'Adverse Event Reporting',
    text: 'This is a VIC notification delivery test. No safety report data is included.'
  });
  console.log('SMTP accepted:', EMAIL_FROM, '->', result.accepted.join(', '), result.messageId);
}

main().catch(error => {
  console.error('SMTP test failed:', error.code || error.message, error.command || '', error.responseCode || '');
  process.exitCode = 1;
});
