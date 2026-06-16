import { Router, Response } from 'express';
import prisma from '../config/db';
import { authenticateJWT, isAdmin, AuthenticatedRequest } from '../middlewares/auth';
import { generateQRCodeDataURL } from '../utils/qrcode';
import { sendMail, getWebinarEmailTemplate } from '../utils/mailer';

const router = Router();

// @route   POST /api/registrations
// @desc    Register for a webinar
router.post('/', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  const { webinar_id } = req.body;
  const user_id = req.user?.id;

  if (!webinar_id || !user_id) {
    res.status(400).json({ error: 'Webinar ID is required' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: user_id } });
    const webinar = await prisma.webinar.findUnique({
      where: { id: webinar_id },
      include: {
        _count: {
          select: { registrations: true }
        }
      }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    if (!webinar) {
      res.status(404).json({ error: 'Webinar not found' });
      return;
    }

    const existingRegistration = await prisma.registration.findFirst({
      where: { user_id, webinar_id }
    });
    if (existingRegistration) {
      res.status(400).json({ error: 'You are already registered for this webinar' });
      return;
    }

    if (webinar.seats <= webinar._count.registrations) {
      res.status(400).json({ error: 'Sorry, this webinar is fully booked' });
      return;
    }

    const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
    const registration_id = `REG-${webinar.title.substring(0, 3).toUpperCase()}-${randomHex}`;
    const webinar_pass = `PASS-${user.full_name.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    const qrData = JSON.stringify({
      regId: registration_id,
      pass: webinar_pass,
      user: user.full_name,
      webinar: webinar.title,
      date: webinar.date.toISOString().split('T')[0],
      time: webinar.time
    });

    const qr_code = await generateQRCodeDataURL(qrData);

    const registration = await prisma.registration.create({
      data: {
        user_id,
        webinar_id,
        registration_id,
        webinar_pass,
        qr_code,
        status: 'REGISTERED'
      }
    });

    const webinarDateStr = `${webinar.date.toDateString()} at ${webinar.time}`;
    const emailHtml = getWebinarEmailTemplate({
      userName: user.full_name,
      webinarName: webinar.title,
      dateTime: webinarDateStr,
      registrationId: registration_id,
      webinarPass: webinar_pass
    });

    const qrBase64Data = qr_code.replace(/^data:image\/png;base64,/, '');

    await sendMail({
      to: user.email,
      subject: `Your Webinar Registration Confirmation: ${webinar.title}`,
      html: emailHtml,
      attachments: [
        {
          filename: 'qrcode.png',
          content: qrBase64Data,
          encoding: 'base64',
          cid: 'qrCode'
        }
      ]
    });

    await prisma.notification.create({
      data: {
        user_id,
        message: `Registered successfully for "${webinar.title}"! Your Pass ID is ${webinar_pass}. Check your email for details.`,
        type: 'confirmation'
      }
    });

    res.status(201).json({
      message: 'Registration successful',
      registration: {
        id: registration.id,
        registration_id: registration.registration_id,
        webinar_pass: registration.webinar_pass,
        qr_code: registration.qr_code,
        status: registration.status,
        created_at: registration.created_at,
        webinar: {
          id: webinar.id,
          title: webinar.title,
          date: webinar.date,
          time: webinar.time,
          duration: webinar.duration,
          speaker: webinar.speaker
        }
      }
    });
  } catch (error) {
    console.error('Registration workflow error:', error);
    res.status(500).json({ error: 'Webinar registration failed' });
  }
});

// @route   GET /api/registrations/my
// @desc    Get current user's registered webinars
router.get('/my', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  const user_id = req.user?.id;

  try {
    const registrations = await prisma.registration.findMany({
      where: { user_id },
      include: {
        webinar: true
      },
      orderBy: { created_at: 'desc' }
    });

    res.json(registrations);
  } catch (error) {
    console.error('Fetch my registrations error:', error);
    res.status(500).json({ error: 'Failed to retrieve registrations' });
  }
});

// @route   GET /api/registrations
// @desc    Get all registrations (Admin only)
router.get('/', authenticateJWT, isAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const registrations = await prisma.registration.findMany({
      include: {
        user: {
          select: {
            full_name: true,
            email: true,
            phone: true,
            organization: true
          }
        },
        webinar: {
          select: {
            title: true,
            date: true,
            time: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    res.json(registrations);
  } catch (error) {
    console.error('Fetch all registrations error:', error);
    res.status(500).json({ error: 'Failed to retrieve registrations' });
  }
});

// @route   PUT /api/registrations/:id/status
// @desc    Update registration status (e.g. check-in attendee)
router.put('/:id/status', authenticateJWT, isAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const { status } = req.body;

  if (!status || !['REGISTERED', 'ATTENDED', 'CANCELLED'].includes(status)) {
    res.status(400).json({ error: 'Invalid registration status' });
    return;
  }

  try {
    const updated = await prisma.registration.update({
      where: { id },
      data: { status },
      include: {
        user: true,
        webinar: true
      }
    });

    if (status === 'ATTENDED') {
      const existingCert = await prisma.certificate.findUnique({
        where: {
          user_id_webinar_id: {
            user_id: updated.user_id,
            webinar_id: updated.webinar_id
          }
        }
      });

      if (!existingCert) {
        await prisma.certificate.create({
          data: {
            user_id: updated.user_id,
            webinar_id: updated.webinar_id,
            certificate_url: `/certificates/${updated.id}`
          }
        });

        await prisma.notification.create({
          data: {
            user_id: updated.user_id,
            message: `Congratulations! Your certificate for "${(updated as any).webinar.title}" is now available.`,
            type: 'announcement'
          }
        });
      }
    }

    res.json(updated);
  } catch (error) {
    console.error('Update registration status error:', error);
    res.status(500).json({ error: 'Failed to update registration status' });
  }
});

export default router;
