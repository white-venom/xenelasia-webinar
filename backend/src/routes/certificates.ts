import { Router, Response } from 'express';
import prisma from '../config/db';
import { authenticateJWT, isAdmin, AuthenticatedRequest } from '../middlewares/auth';

const router = Router();

// @route   GET /api/certificates/my
// @desc    Get all certificates for the current logged-in user
router.get('/my', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  const user_id = req.user?.id;

  try {
    const certificates = await prisma.certificate.findMany({
      where: { user_id },
      include: {
        webinar: true
      },
      orderBy: { issued_at: 'desc' }
    });

    res.json(certificates);
  } catch (error) {
    console.error('Fetch my certificates error:', error);
    res.status(500).json({ error: 'Failed to retrieve certificates' });
  }
});

// @route   GET /api/certificates/:id
// @desc    Get certificate by ID (Public for verification / download)
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const certificate = await prisma.certificate.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            full_name: true,
            organization: true
          }
        },
        webinar: {
          select: {
            title: true,
            date: true,
            speaker: true
          }
        }
      }
    });

    if (!certificate) {
      res.status(404).json({ error: 'Certificate not found' });
      return;
    }

    res.json(certificate);
  } catch (error) {
    console.error('Fetch certificate error:', error);
    res.status(500).json({ error: 'Failed to retrieve certificate details' });
  }
});

// @route   POST /api/certificates/issue
// @desc    Manually issue a certificate (Admin only)
router.post('/issue', authenticateJWT, isAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const { user_id, webinar_id } = req.body;

  if (!user_id || !webinar_id) {
    res.status(400).json({ error: 'User ID and Webinar ID are required' });
    return;
  }

  try {
    const existing = await prisma.certificate.findUnique({
      where: {
        user_id_webinar_id: { user_id, webinar_id }
      }
    });

    if (existing) {
      res.status(400).json({ error: 'Certificate has already been issued to this user' });
      return;
    }

    const certificate = await prisma.certificate.create({
      data: {
        user_id,
        webinar_id,
        certificate_url: `/certificates/${user_id}-${webinar_id}`
      },
      include: {
        webinar: true
      }
    });

    await prisma.notification.create({
      data: {
        user_id,
        message: `Congratulations! Your certificate for "${certificate.webinar.title}" has been issued.`,
        type: 'announcement'
      }
    });

    res.status(201).json(certificate);
  } catch (error) {
    console.error('Issue certificate error:', error);
    res.status(500).json({ error: 'Failed to issue certificate' });
  }
});

export default router;
