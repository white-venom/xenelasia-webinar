import { Router, Response } from 'express';
import prisma from '../config/db';
import { authenticateJWT, AuthenticatedRequest } from '../middlewares/auth';

const router = Router();

// @route   GET /api/notifications
// @desc    Get all notifications for logged-in user
router.get('/', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  const user_id = req.user?.id;

  try {
    const notifications = await prisma.notification.findMany({
      where: { user_id },
      orderBy: { created_at: 'desc' }
    });

    res.json(notifications);
  } catch (error) {
    console.error('Fetch notifications error:', error);
    res.status(500).json({ error: 'Failed to retrieve notifications' });
  }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete a notification
router.delete('/:id', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const user_id = req.user?.id;

  try {
    const notif = await prisma.notification.findFirst({
      where: { id, user_id }
    });

    if (!notif) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }

    await prisma.notification.delete({ where: { id } });
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

export default router;
