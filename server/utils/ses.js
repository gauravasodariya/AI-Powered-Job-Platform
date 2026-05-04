const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

const sesClient = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

exports.sendEmail = async (to, subject, body) => {
  const fromEmail = process.env.AWS_SES_FROM_EMAIL;
  
  if (!fromEmail) {
    console.warn('AWS_SES_FROM_EMAIL is not defined. Skipping email.');
    return;
  }

  const params = {
    Source: fromEmail,
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Subject: {
        Data: subject,
      },
      Body: {
        Html: {
          Data: body,
        },
      },
    },
  };
  try {
    const command = new SendEmailCommand(params);
    await sesClient.send(command);
    console.log(`Email successfully sent to ${to} from ${fromEmail}`);
  } catch (err) {
    if (err.name === 'AccessDenied' || err.code === 'AccessDenied') {
      console.error(`AWS SES Access Denied: Ensure ${fromEmail} is verified and IAM user has ses:SendEmail permission.`);
    } else if (err.name === 'MessageRejected') {
      console.error(`AWS SES Message Rejected: Identity ${fromEmail} or ${to} might not be verified (Sandbox mode).`);
    } else {
      console.error('Error sending email:', err.message);
    }
  }
};
