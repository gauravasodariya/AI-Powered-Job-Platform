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
    throw new Error('AWS_SES_FROM_EMAIL is not defined');
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
      throw new Error(`AWS SES Access Denied: Ensure ${fromEmail} is verified and IAM user has ses:SendEmail permission.`);
    } else if (err.name === 'MessageRejected') {
      throw new Error(`AWS SES Message Rejected: Identity ${fromEmail} or ${to} might not be verified (Sandbox mode).`);
    }

    throw new Error(err.message || 'Error sending email');
  }
};
