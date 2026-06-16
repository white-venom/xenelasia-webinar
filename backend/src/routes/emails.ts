import { Router, Response } from 'express';
import prisma from '../config/db';
import { authenticateJWT, isAdmin, AuthenticatedRequest } from '../middlewares/auth';
import { sendMail } from '../utils/mailer';

const router = Router();

// @route   POST /api/emails/announcement
// @desc    Broadcast an announcement to all users (Admin only)
router.post('/announcement', authenticateJWT, isAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const { subject, message } = req.body;

  if (!subject || !message) {
    res.status(400).json({ error: 'Subject and message are required' });
    return;
  }

  try {
    const users = await prisma.user.findMany({
      where: { role: 'USER' },
      select: { email: true, full_name: true }
    });

    if (users.length === 0) {
      res.status(200).json({ message: 'No registered users to send email to' });
      return;
    }

    let successCount = 0;
    let failCount = 0;

    for (const user of users) {
      const formattedHtml = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #0b0f19; color: #e2e8f0; padding: 25px; border-radius: 8px; border: 1px solid #1e293b; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #38bdf8; text-align: center; font-size: 24px; letter-spacing: 1px;">Xenelasia Consultancy LLP</h1>
          <p style="color: #cbd5e1; font-size: 16px;">Dear ${user.full_name},</p>
          <div style="color: #cbd5e1; font-size: 15px; line-height: 1.6; margin: 20px 0; border-left: 3px solid #38bdf8; padding-left: 15px;">
            ${message.replace(/\n/g, '<br/>')}
          </div>
          <hr style="border: 0; border-top: 1px solid #1e293b; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748b; text-align: center;">
            You received this email because you are registered at Xenelasia Consultancy LLP.<br/>
            Technology | Cybersecurity | Professional Consulting
          </p>
        </div>
      `;

      const result = await sendMail({
        to: user.email,
        subject: subject,
        html: formattedHtml
      });

      if (result.success) {
        successCount++;
      } else {
        failCount++;
      }
    }

    res.json({
      message: `Broadcast complete. Sent: ${successCount}, Failed: ${failCount}`,
      total: users.length
    });
  } catch (error) {
    console.error('Email announcement broadcast error:', error);
    res.status(500).json({ error: 'Failed to broadcast announcement emails' });
  }
});

// @route   POST /api/emails/reminder/:webinarId
// @desc    Send webinar reminder to all registrants of a webinar (Admin only)
router.post('/reminder/:webinarId', authenticateJWT, isAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const webinarId = req.params.webinarId as string;

  try {
    const webinar = await prisma.webinar.findUnique({
      where: { id: webinarId }
    });

    if (!webinar) {
      res.status(404).json({ error: 'Webinar not found' });
      return;
    }

    const registrations = await prisma.registration.findMany({
      where: { webinar_id: webinarId, status: 'REGISTERED' },
      include: {
        user: true
      }
    });

    if (registrations.length === 0) {
      res.json({ message: 'No registrants found for this webinar to send reminders to' });
      return;
    }

    let successCount = 0;
    let failCount = 0;

    for (const reg of registrations as any[]) {
      const user = reg.user;
      const formattedHtml = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #0b0f19; color: #e2e8f0; padding: 25px; border-radius: 8px; border: 1px solid #1e293b; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #38bdf8; text-align: center; font-size: 24px;">Webinar Reminder</h1>
          <p style="color: #cbd5e1; font-size: 16px;">Dear ${user.full_name},</p>
          <p style="color: #cbd5e1; font-size: 15px; line-height: 1.6;">
            This is a reminder that the webinar you registered for, <strong>"${webinar.title}"</strong>, is scheduled soon.
          </p>
          <div style="background-color: #0f172a; padding: 15px; border-radius: 6px; border: 1px solid #1e293b; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Date:</strong> ${webinar.date.toDateString()}</p>
            <p style="margin: 5px 0;"><strong>Time:</strong> ${webinar.time}</p>
            <p style="margin: 5px 0;"><strong>Speaker:</strong> ${webinar.speaker}</p>
            <p style="margin: 5px 0;"><strong>Registration ID:</strong> <code>${reg.registration_id}</code></p>
            <p style="margin: 5px 0;"><strong>Pass ID:</strong> <code>${reg.webinar_pass}</code></p>
          </div>
          <p style="color: #cbd5e1; font-size: 15px; line-height: 1.6;">
            To join, please log in to your dashboard on the scheduled date and time.
          </p>
          <hr style="border: 0; border-top: 1px solid #1e293b; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748b; text-align: center;">
            Regards,<br/>
            <strong>Xenelasia Consultancy LLP Team</strong>
          </p>
        </div>
      `;

      const result = await sendMail({
        to: user.email,
        subject: `REMINDER: "${webinar.title}" is starting soon!`,
        html: formattedHtml
      });

      if (result.success) {
        successCount++;
      } else {
        failCount++;
      }
    }

    res.json({
      message: `Reminders sent. Success: ${successCount}, Failed: ${failCount}`,
      total: registrations.length
    });
  } catch (error) {
    console.error('Email webinar reminder error:', error);
    res.status(500).json({ error: 'Failed to send webinar reminders' });
  }
});

export default router;
