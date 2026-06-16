import { Router, Response } from 'express';
import prisma from '../config/db';
import { authenticateJWT, isAdmin, AuthenticatedRequest } from '../middlewares/auth';

const router = Router();

// @route   GET /api/webinars
// @desc    Get all webinars (Public)
router.get('/', async (req, res) => {
  const search = req.query.search as string;
  const category = req.query.category as string;

  try {
    const webinars = await prisma.webinar.findMany({
      where: {
        AND: [
          search ? {
            OR: [
              { title: { contains: search } },
              { description: { contains: search } },
              { speaker: { contains: search } }
            ]
          } : {},
          category ? { category: { equals: category } } : {}
        ]
      },
      include: {
        _count: {
          select: { registrations: true }
        }
      },
      orderBy: { date: 'asc' }
    });

    const formattedWebinars = webinars.map(webinar => ({
      ...webinar,
      remainingSeats: Math.max(0, webinar.seats - webinar._count.registrations)
    }));

    res.json(formattedWebinars);
  } catch (error) {
    console.error('Fetch webinars error:', error);
    res.status(500).json({ error: 'Failed to retrieve webinars' });
  }
});

// @route   GET /api/webinars/:id
// @desc    Get webinar by ID (Public)
router.get('/:id', async (req, res) => {
  const id = req.params.id as string;

  try {
    const webinar = await prisma.webinar.findUnique({
      where: { id },
      include: {
        _count: {
          select: { registrations: true }
        }
      }
    });

    if (!webinar) {
      res.status(404).json({ error: 'Webinar not found' });
      return;
    }

    res.json({
      ...webinar,
      remainingSeats: Math.max(0, webinar.seats - webinar._count.registrations)
    });
  } catch (error) {
    console.error('Fetch webinar error:', error);
    res.status(500).json({ error: 'Failed to retrieve webinar' });
  }
});

// @route   POST /api/webinars
// @desc    Create a new webinar (Admin only)
router.post('/', authenticateJWT, isAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const { title, description, speaker, date, time, duration, seats, category, image } = req.body;

  if (!title || !description || !speaker || !date || !time || !duration || !seats || !category) {
    res.status(400).json({ error: 'All fields except image are required' });
    return;
  }

  try {
    const webinar = await prisma.webinar.create({
      data: {
        title,
        description,
        speaker,
        date: new Date(date),
        time,
        duration,
        seats: parseInt(seats),
        category,
        image: image || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=600',
      }
    });

    res.status(201).json(webinar);
  } catch (error) {
    console.error('Create webinar error:', error);
    res.status(500).json({ error: 'Failed to create webinar' });
  }
});

// @route   PUT /api/webinars/:id
// @desc    Update a webinar (Admin only)
router.put('/:id', authenticateJWT, isAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const { title, description, speaker, date, time, duration, seats, category, image } = req.body;

  try {
    const updateData: any = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (speaker) updateData.speaker = speaker;
    if (date) updateData.date = new Date(date);
    if (time) updateData.time = time;
    if (duration) updateData.duration = duration;
    if (seats) updateData.seats = parseInt(seats);
    if (category) updateData.category = category;
    if (image) updateData.image = image;

    const webinar = await prisma.webinar.update({
      where: { id },
      data: updateData
    });

    res.json(webinar);
  } catch (error) {
    console.error('Update webinar error:', error);
    res.status(500).json({ error: 'Failed to update webinar' });
  }
});

// @route   DELETE /api/webinars/:id
// @desc    Delete a webinar (Admin only)
router.delete('/:id', authenticateJWT, isAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;

  try {
    await prisma.webinar.delete({ where: { id } });
    res.json({ message: 'Webinar deleted successfully' });
  } catch (error) {
    console.error('Delete webinar error:', error);
    res.status(500).json({ error: 'Failed to delete webinar' });
  }
});

export default router;
