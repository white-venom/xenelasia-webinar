import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST || 'smtp.ethereal.email';
  const port = parseInt(process.env.SMTP_PORT || '587');
  let user = process.env.SMTP_USER;
  let pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    console.log('No SMTP credentials found in environment. Creating Ethereal Test Account...');
    try {
      const testAccount = await nodemailer.createTestAccount();
      user = testAccount.user;
      pass = testAccount.pass;
      console.log(`Ethereal Test Account Created! User: ${user}`);
    } catch (err) {
      console.error('Failed to create Ethereal Mail test account:', err);
    }
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user: user || '',
      pass: pass || '',
    },
  });

  return transporter;
};

export const sendMail = async (options: { to: string; subject: string; html: string; attachments?: any[] }) => {
  try {
    const mailTransporter = await getTransporter();
    const mailOptions = {
      from: process.env.SMTP_FROM || '"Xenelasia Consultancy LLP" <no-reply@xenelasia.com>',
      to: options.to,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments,
    };

    const info = await mailTransporter.sendMail(mailOptions);
    console.log(`Email sent successfully: ${info.messageId}`);
    
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`Email Preview URL: ${previewUrl}`);
    }
    return { success: true, messageId: info.messageId, previewUrl };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
};

export const getWelcomeEmailTemplate = (fullName: string) => {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b0f19; color: #e2e8f0; padding: 30px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #1e293b;">
      <div style="text-align: center; margin-bottom: 25px;">
        <h1 style="color: #38bdf8; margin: 0; font-size: 28px; letter-spacing: 2px;">XENELASIA</h1>
        <p style="color: #94a3b8; font-size: 14px; margin-top: 5px; text-transform: uppercase; letter-spacing: 1px;">Consultancy LLP</p>
      </div>
      <hr style="border: 0; border-top: 1px solid #1e293b; margin: 20px 0;" />
      <div style="padding: 10px 0;">
        <h2 style="color: #a855f7; font-weight: 600;">Welcome to the Circle, ${fullName}!</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #cbd5e1;">Thank you for joining <strong>Xenelasia Consultancy LLP</strong>.</p>
        <p style="font-size: 16px; line-height: 1.6; color: #cbd5e1;">We are excited to have you as part of our technology and cybersecurity community.</p>
        <p style="font-size: 16px; line-height: 1.6; color: #cbd5e1;">You can now explore webinars, blogs, learning resources, and upcoming events on our responsive 3D portal.</p>
        <div style="text-align: center; margin: 35px 0;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}" style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);">Access Dashboard</a>
        </div>
      </div>
      <hr style="border: 0; border-top: 1px solid #1e293b; margin: 20px 0;" />
      <p style="font-size: 14px; color: #64748b; text-align: center; margin-top: 25px;">
        Regards,<br/>
        <strong style="color: #38bdf8;">Xenelasia Consultancy LLP Team</strong>
      </p>
    </div>
  `;
};

export const getWebinarEmailTemplate = (params: {
  userName: string;
  webinarName: string;
  dateTime: string;
  registrationId: string;
  webinarPass: string;
}) => {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b0f19; color: #e2e8f0; padding: 30px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #1e293b;">
      <div style="text-align: center; margin-bottom: 25px;">
        <h1 style="color: #38bdf8; margin: 0; font-size: 28px; letter-spacing: 2px;">XENELASIA</h1>
        <p style="color: #94a3b8; font-size: 14px; margin-top: 5px; text-transform: uppercase; letter-spacing: 1px;">Consultancy LLP</p>
      </div>
      <hr style="border: 0; border-top: 1px solid #1e293b; margin: 20px 0;" />
      <div style="padding: 10px 0;">
        <h2 style="color: #10b981; text-align: center; font-weight: 600;">Webinar Registration Confirmed!</h2>
        <p style="font-size: 16px; color: #cbd5e1;">Hi ${params.userName},</p>
        <p style="font-size: 16px; color: #cbd5e1;">Your registration for the webinar <strong>"${params.webinarName}"</strong> has been successfully processed.</p>
        
        <div style="background-color: #0f172a; border: 1px solid #1e293b; padding: 20px; border-radius: 8px; margin: 25px 0;">
          <h3 style="color: #38bdf8; margin-top: 0; border-bottom: 1px solid #1e293b; padding-bottom: 8px; font-size: 18px;">Ticket details</h3>
          <p style="margin: 8px 0; font-size: 15px;"><strong style="color: #94a3b8;">Date & Time:</strong> ${params.dateTime}</p>
          <p style="margin: 8px 0; font-size: 15px;"><strong style="color: #94a3b8;">Registration ID:</strong> <code style="color: #f43f5e; background-color: #1e1b4b; padding: 2px 6px; border-radius: 4px;">${params.registrationId}</code></p>
          <p style="margin: 8px 0; font-size: 15px;"><strong style="color: #94a3b8;">Webinar Pass:</strong> <code style="color: #38bdf8; background-color: #0c4a6e; padding: 2px 6px; border-radius: 4px;">${params.webinarPass}</code></p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <p style="margin-bottom: 12px; font-weight: bold; color: #e2e8f0; font-size: 16px;">Your Entry Pass QR Code:</p>
          <img src="cid:qrCode" alt="Webinar Pass QR Code" style="background-color: white; padding: 12px; border-radius: 10px; width: 180px; height: 180px; box-shadow: 0 0 20px rgba(56, 189, 248, 0.2);" />
        </div>

        <p style="font-size: 15px; color: #cbd5e1; line-height: 1.5;"><strong>Joining Instructions:</strong> Log into your dashboard on the Xenelasia Platform, navigate to your registered webinars, and click the "Join Webinar" link. Access will open 10 minutes prior to the start time.</p>
      </div>
      <hr style="border: 0; border-top: 1px solid #1e293b; margin: 20px 0;" />
      <p style="font-size: 14px; color: #64748b; text-align: center; margin-top: 25px;">
        Regards,<br/>
        <strong style="color: #38bdf8;">Xenelasia Consultancy LLP Team</strong>
      </p>
    </div>
  `;
};
