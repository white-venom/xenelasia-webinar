import { Router, Response } from 'express';
import prisma from '../config/db';
import { authenticateJWT, isAdmin, AuthenticatedRequest } from '../middlewares/auth';

const router = Router();

// In-memory cache for online blogs
let cachedBlogs: any[] = [];
let lastFetchTime: number = 0;
const THREE_HOURS = 3 * 60 * 60 * 1000;

async function fetchOnlineBlogs() {
  try {
    // Fetch 12 articles from dev.to tag cybersecurity
    const response = await fetch('https://dev.to/api/articles?tag=cybersecurity&per_page=12');
    if (!response.ok) {
      throw new Error(`Dev.to API responded with status ${response.status}`);
    }
    const articles = await response.json() as any[];
    
    cachedBlogs = articles.map((art: any) => ({
      id: String(art.id),
      title: art.title,
      content: art.description || 'No description available.',
      category: art.tag_list && art.tag_list[0] ? art.tag_list[0].toUpperCase() : 'CYBERSECURITY',
      author: art.user?.name || 'Dev.to Contributor',
      image: art.cover_image || art.social_image || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=600',
      created_at: art.published_at || new Date().toISOString()
    }));
    
    lastFetchTime = Date.now();
    console.log(`[Blogs] Successfully fetched ${cachedBlogs.length} articles from dev.to at ${new Date().toISOString()}`);
  } catch (error) {
    console.error('[Blogs] Error fetching online blogs:', error);
  }
}

// @route   GET /api/blogs
// @desc    Get all blogs (Public)
router.get('/', async (req, res) => {
  const search = req.query.search as string;
  const category = req.query.category as string;

  try {
    // Refresh cache if empty or 3 hours have passed
    if (cachedBlogs.length === 0 || Date.now() - lastFetchTime > THREE_HOURS) {
      await fetchOnlineBlogs();
    }

    // Fall back to database blogs if online fetch returned nothing
    let result = cachedBlogs.length > 0 ? [...cachedBlogs] : [];
    if (result.length === 0) {
      result = await prisma.blog.findMany({
        orderBy: { created_at: 'desc' }
      });
    }

    // Apply in-memory search filter
    if (search) {
      const query = search.toLowerCase();
      result = result.filter(blog => 
        blog.title.toLowerCase().includes(query) || 
        blog.content.toLowerCase().includes(query) || 
        blog.author.toLowerCase().includes(query)
      );
    }

    // Apply in-memory category filter
    if (category && category !== 'All') {
      const cat = category.toLowerCase();
      result = result.filter(blog => blog.category.toLowerCase() === cat);
    }

    res.json(result);
  } catch (error) {
    console.error('Fetch blogs error:', error);
    res.status(500).json({ error: 'Failed to retrieve blogs' });
  }
});

// @route   GET /api/blogs/:id
// @desc    Get blog by ID (Public)
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  // First, check in-memory cache
  const cachedBlog = cachedBlogs.find((b) => b.id === id);
  if (cachedBlog) {
    res.json(cachedBlog);
    return;
  }

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
