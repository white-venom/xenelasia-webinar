import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';
import { authenticateJWT, isAdmin, AuthenticatedRequest } from '../middlewares/auth';
import { sendMail, getWelcomeEmailTemplate } from '../utils/mailer';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'xenelasia_super_secret_cybersecurity_key_2026';

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
  const { full_name, email, phone, organization, password } = req.body;

  if (!full_name || !email || !phone || !organization || !password) {
    res.status(400).json({ error: 'All fields are required' });
    return;
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: 'User with this email already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        full_name,
        email,
        phone,
        organization,
        password_hash,
        role: 'USER',
      },
    });

    // Send Welcome Email
    const emailTemplate = getWelcomeEmailTemplate(full_name);
    await sendMail({
      to: email,
      subject: 'Welcome to Xenelasia Consultancy LLP',
      html: emailTemplate,
    });

    // Create Notification
    await prisma.notification.create({
      data: {
        user_id: user.id,
        message: 'Welcome to Xenelasia! Start exploring webinars and learning resources.',
        type: 'announcement',
      },
    });

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        organization: user.organization,
        role: user.role,
        created_at: user.created_at,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user and get token
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(400).json({ error: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(400).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        organization: user.organization,
        role: user.role,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server login error' });
  }
});

// @route   GET /api/auth/profile
// @desc    Get current user profile
router.get('/profile', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.id },
      select: {
        id: true,
        full_name: true,
        email: true,
        phone: true,
        organization: true,
        role: true,
        created_at: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Server error retrieving profile' });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
router.put('/profile', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  const { full_name, phone, organization, password } = req.body;

  try {
    const updateData: any = {};
    if (full_name) updateData.full_name = full_name;
    if (phone) updateData.phone = phone;
    if (organization) updateData.organization = organization;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password_hash = await bcrypt.hash(password, salt);
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user?.id },
      data: updateData,
      select: {
        id: true,
        full_name: true,
        email: true,
        phone: true,
        organization: true,
        role: true,
        created_at: true,
      },
    });

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Server error updating profile' });
  }
});

// @route   GET /api/auth/users
// @desc    Get all users (Admin only)
router.get('/users', authenticateJWT, isAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const search = req.query.search as string;

  try {
    const users = await prisma.user.findMany({
      where: search ? {
        OR: [
          { full_name: { contains: search } },
          { email: { contains: search } },
          { organization: { contains: search } }
        ]
      } : undefined,
      select: {
        id: true,
        full_name: true,
        email: true,
        phone: true,
        organization: true,
        role: true,
        created_at: true,
        _count: {
          select: { registrations: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    res.json(users);
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
});

export default router;
