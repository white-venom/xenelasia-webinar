import { Router, Response } from 'express';
import prisma from '../config/db';
import { authenticateJWT, isAdmin, AuthenticatedRequest } from '../middlewares/auth';

const router = Router();

// @route   GET /api/blogs
// @desc    Get all blogs (Public)
router.get('/', async (req, res) => {
  const search = req.query.search as string;
  const category = req.query.category as string;

  try {
    const blogs = await prisma.blog.findMany({
      where: {
        AND: [
          search ? {
            OR: [
              { title: { contains: search } },
              { content: { contains: search } },
              { author: { contains: search } }
            ]
          } : {},
          category ? { category: { equals: category } } : {}
        ]
      },
      orderBy: { created_at: 'desc' }
    });

    res.json(blogs);
  } catch (error) {
    console.error('Fetch blogs error:', error);
    res.status(500).json({ error: 'Failed to retrieve blogs' });
  }
});

// @route   GET /api/blogs/:id
// @desc    Get blog by ID (Public)
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const blog = await prisma.blog.findUnique({ where: { id } });
    if (!blog) {
      res.status(404).json({ error: 'Blog post not found' });
      return;
    }

    res.json(blog);
  } catch (error) {
    console.error('Fetch blog error:', error);
    res.status(500).json({ error: 'Failed to retrieve blog' });
  }
});

// @route   POST /api/blogs
// @desc    Create a new blog (Admin only)
router.post('/', authenticateJWT, isAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const { title, content, category, author, image } = req.body;

  if (!title || !content || !category || !author) {
    res.status(400).json({ error: 'Title, content, category, and author are required' });
    return;
  }

  try {
    const blog = await prisma.blog.create({
      data: {
        title,
        content,
        category,
        author,
        image: image || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=600',
      }
    });

    res.status(201).json(blog);
  } catch (error) {
    console.error('Create blog error:', error);
    res.status(500).json({ error: 'Failed to create blog' });
  }
});

// @route   PUT /api/blogs/:id
// @desc    Update a blog (Admin only)
router.put('/:id', authenticateJWT, isAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const { title, content, category, author, image } = req.body;

  try {
    const updateData: any = {};
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (category) updateData.category = category;
    if (author) updateData.author = author;
    if (image) updateData.image = image;

    const blog = await prisma.blog.update({
      where: { id },
      data: updateData
    });

    res.json(blog);
  } catch (error) {
    console.error('Update blog error:', error);
    res.status(500).json({ error: 'Failed to update blog' });
  }
});

// @route   DELETE /api/blogs/:id
// @desc    Delete a blog (Admin only)
router.delete('/:id', authenticateJWT, isAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;

  try {
    await prisma.blog.delete({ where: { id } });
    res.json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({ error: 'Failed to delete blog post' });
  }
});

export default router;
