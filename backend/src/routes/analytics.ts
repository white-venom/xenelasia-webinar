import { Router, Response } from 'express';
import prisma from '../config/db';
import { authenticateJWT, isAdmin, AuthenticatedRequest } from '../middlewares/auth';

const router = Router();

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard metrics (Admin only)
router.get('/dashboard', authenticateJWT, isAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const totalUsers = await prisma.user.count({ where: { role: 'USER' } });
    const totalRegistrations = await prisma.registration.count();
    const totalWebinars = await prisma.webinar.count();
    const totalBlogs = await prisma.blog.count();

    const today = new Date();
    const activeWebinars = await prisma.webinar.count({
      where: {
        date: {
          gte: new Date(today.setHours(0,0,0,0))
        }
      }
    });

    res.json({
      totalUsers,
      totalRegistrations,
      activeWebinars,
      upcomingWebinars: activeWebinars,
      totalWebinars,
      blogStatistics: totalBlogs
    });
  } catch (error) {
    console.error('Fetch dashboard analytics error:', error);
    res.status(500).json({ error: 'Failed to retrieve dashboard metrics' });
  }
});

// @route   GET /api/analytics/registrations
// @desc    Get registrations analysis graphs & export data (Admin only)
router.get('/registrations', authenticateJWT, isAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const webinars = await prisma.webinar.findMany({
      include: {
        _count: {
          select: { registrations: true }
        }
      }
    });

    const webinarWise = webinars.map(w => ({
      id: w.id,
      title: w.title,
      date: w.date,
      count: w._count.registrations,
      seats: w.seats
    }));

    const registrations = await prisma.registration.findMany({
      select: { created_at: true }
    });

    const monthlyCounts: Record<string, number> = {};
    registrations.forEach(r => {
      const monthYear = r.created_at.toLocaleString('default', { month: 'short', year: 'numeric' });
      monthlyCounts[monthYear] = (monthlyCounts[monthYear] || 0) + 1;
    });

    const monthlyRegistrations = Object.entries(monthlyCounts).map(([month, count]) => ({
      month,
      count
    }));

    const attendedCount = await prisma.registration.count({ where: { status: 'ATTENDED' } });
    const registeredCount = await prisma.registration.count({ where: { status: 'REGISTERED' } });
    const cancelledCount = await prisma.registration.count({ where: { status: 'CANCELLED' } });

    res.json({
      webinarWise,
      monthlyRegistrations,
      attendanceReport: {
        attended: attendedCount,
        registered: registeredCount,
        cancelled: cancelledCount,
        total: attendedCount + registeredCount + cancelledCount
      }
    });
  } catch (error) {
    console.error('Fetch registrations analytics error:', error);
    res.status(500).json({ error: 'Failed to retrieve registrations analysis' });
  }
});

export default router;
