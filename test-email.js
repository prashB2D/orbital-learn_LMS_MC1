const fs = require('fs');
const nodemailer = require('nodemailer');

const envFile = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)="?(.*?)"?$/);
  if (match) {
    envVars[match[1]] = match[2];
  }
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: envVars['GMAIL_USER'],
    pass: envVars['GMAIL_APP_PASSWORD']
  }
});

transporter.sendMail({
  from: envVars['GMAIL_USER'],
  to: envVars['GMAIL_USER'],
  subject: "Test Email from LMS Backend",
  text: "If you are reading this, your email connection works perfectly."
}).then(info => console.log('Sent:', info.messageId)).catch(console.error);
