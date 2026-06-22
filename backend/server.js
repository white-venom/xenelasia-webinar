const express = require('express');
const cors = require('cors');
const Parser = require('rss-parser');
const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');

const app = express();
const parser = new Parser();
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Mapping our domains to Google News search queries
const CATEGORY_MAP = {
  'Cybersecurity': 'Cybersecurity',
  'Cloud Security': 'Cloud Security',
  'Artificial Intelligence': 'Artificial Intelligence Tech',
  'Consulting': 'Tech Consulting'
};

// Seed default webinars if the database is empty
async function seedDefaultWebinars() {
  try {
    const count = await prisma.webinar.count();
    if (count === 0) {
      console.log('No webinars found in database. Seeding default webinars...');
      const defaultWebinars = [
        {
          title: 'Advanced Threat Hunting and Incident Response',
          description: 'Learn the latest methodologies for active threat hunting, memory forensics, and rapid incident response in enterprise hybrid cloud networks.',
          speaker: 'Dr. Aris Thorne, Cybersecurity Specialist',
          date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          time: '15:00',
          duration: '120 mins',
          seats: 50,
          remainingSeats: 12,
          category: 'Cybersecurity',
          image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=600',
        },
        {
          title: 'Securing Next-Gen Cloud Architectures',
          description: 'A comprehensive deep-dive into AWS, Azure, and Google Cloud security structures, zero-trust implementations, and IAM hardening.',
          speaker: 'Sarah Jenkins, Principal Cloud Architect',
          date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
          time: '18:00',
          duration: '90 mins',
          seats: 100,
          remainingSeats: 48,
          category: 'Cloud Security',
          image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=600',
        },
        {
          title: 'AI and Machine Learning in Defending Enterprise Assets',
          description: 'Explores the double-edged sword of Artificial Intelligence. Understand how LLMs help identify zero-day exploits.',
          speaker: 'David Miller, Head of AI Research at Xenelasia',
          date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          time: '14:00',
          duration: '90 mins',
          seats: 75,
          remainingSeats: 5,
          category: 'Artificial Intelligence',
          image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=600',
        }
      ];

      for (const webinar of defaultWebinars) {
        await prisma.webinar.create({ data: webinar });
      }
      console.log('Seeding completed successfully!');
    }
  } catch (error) {
    console.error('Error seeding default webinars:', error);
  }
}

// Blogs API Endpoint
app.get('/api/blogs', async (req, res) => {
  try {
    const categoryQuery = req.query.category || 'Technology';
    const searchQuery = CATEGORY_MAP[categoryQuery] || categoryQuery;
    
    // Google News RSS URL
    const feedUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(searchQuery)}&hl=en-US&gl=US&ceid=US:en`;
    
    const feed = await parser.parseURL(feedUrl);
    
    // Map and limit to 6 blogs
    const blogs = feed.items.slice(0, 6).map((item, index) => {
      let imageUrl = 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=600';
      let finalCategory = categoryQuery;
      
      return {
        id: `news-${Date.now()}-${index}`,
        title: item.title,
        content: item.contentSnippet || item.content || 'Click to read the full article on Google News.',
        category: finalCategory,
        author: item.creator || item.source || 'Google News',
        image: imageUrl,
        created_at: item.pubDate || new Date().toISOString(),
        link: item.link
      };
    });

    res.json(blogs);
  } catch (error) {
    console.error('Error fetching RSS:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// Webinars API Endpoints
app.get('/api/webinars', async (req, res) => {
  try {
    const webinars = await prisma.webinar.findMany({
      include: {
        registrations: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(webinars);
  } catch (error) {
    console.error('Error fetching webinars:', error);
    res.status(500).json({ error: 'Failed to fetch webinars' });
  }
});

app.post('/api/webinars', async (req, res) => {
  try {
    const { title, description, speaker, date, time, duration, seats, remainingSeats, category, image } = req.body;
    
    if (!title || !description || !speaker || !date || !time || !duration || !seats || !category) {
      return res.status(400).json({ error: 'Required fields are missing' });
    }

    const seatsNum = parseInt(seats, 10);
    const remSeatsNum = remainingSeats !== undefined ? parseInt(remainingSeats, 10) : seatsNum;

    const newWebinar = await prisma.webinar.create({
      data: {
        title,
        description,
        speaker,
        date,
        time,
        duration,
        seats: seatsNum,
        remainingSeats: remSeatsNum,
        category,
        image: image || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=600',
      }
    });

    res.status(201).json(newWebinar);
  } catch (error) {
    console.error('Error creating webinar:', error);
    res.status(500).json({ error: 'Failed to create webinar' });
  }
});

app.delete('/api/webinars/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.webinar.delete({
      where: { id }
    });
    res.json({ message: 'Webinar deleted successfully' });
  } catch (error) {
    console.error('Error deleting webinar:', error);
    res.status(500).json({ error: 'Failed to delete webinar' });
  }
});

// Lazy transporter configuration or Ethereal fallback
let transporter = null;
async function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    console.log('Configuring SMTP transporter with provided credentials.');
    transporter = nodemailer.createTransport({
      host,
      port: parseInt(port, 10),
      secure: parseInt(port, 10) === 465,
      auth: { user, pass }
    });
  } else {
    console.log('No SMTP credentials found. Creating Ethereal Test Account...');
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      transporter.defaultFrom = testAccount.user;
      console.log(`Ethereal Test Account created! User: ${testAccount.user}`);
    } catch (err) {
      console.error('Failed to create Ethereal SMTP transporter. Using console fallback.', err);
      transporter = {
        sendMail: async (mailOptions) => {
          console.log('--- CONSOLE MAIL FALLBACK ---');
          console.log(`To: ${mailOptions.to}`);
          console.log(`Subject: ${mailOptions.subject}`);
          console.log(`Body:\n${mailOptions.text}`);
          console.log('------------------------------');
          return { messageId: 'console-mock-id' };
        }
      };
    }
  }
  return transporter;
}

// Send automated confirmation email
async function sendConfirmationEmail(email, name, webinar) {
  try {
    const tx = await getTransporter();
    const fromAddress = process.env.SMTP_FROM || tx.defaultFrom || 'no-reply@xenelasia.com';
    const dateStr = new Date(webinar.date).toDateString();
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Registration Confirmed - Xenelasia Webinars</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #020617;
            color: #f8fafc;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #0b1329;
            border: 1px solid #1e293b;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          }
          .header {
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            padding: 30px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 800;
            letter-spacing: 1px;
            color: #ffffff;
            text-transform: uppercase;
          }
          .content {
            padding: 40px 30px;
          }
          .greeting {
            font-size: 18px;
            font-weight: 600;
            color: #60a5fa;
            margin-bottom: 20px;
          }
          .message {
            font-size: 15px;
            line-height: 1.6;
            color: #cbd5e1;
            margin-bottom: 30px;
          }
          .card {
            background-color: #0f172a;
            border: 1px solid #334155;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 30px;
          }
          .card-title {
            font-size: 16px;
            font-weight: 700;
            color: #ffffff;
            margin-top: 0;
            margin-bottom: 15px;
            border-bottom: 1px solid #1e293b;
            padding-bottom: 10px;
          }
          .detail-row {
            display: flex;
            margin-bottom: 10px;
            font-size: 14px;
          }
          .detail-label {
            width: 100px;
            color: #64748b;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.5px;
          }
          .detail-value {
            flex: 1;
            color: #e2e8f0;
          }
          .footer {
            background-color: #020617;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #1e293b;
            font-size: 11px;
            color: #64748b;
          }
          .footer a {
            color: #3b82f6;
            text-decoration: none;
          }
          .btn {
            display: inline-block;
            background: linear-gradient(90deg, #3b82f6, #8b5cf6);
            color: #ffffff !important;
            font-weight: 700;
            font-size: 13px;
            text-transform: uppercase;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 8px;
            margin-top: 15px;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>XENELASIA GROUP</h1>
          </div>
          <div class="content">
            <div class="greeting">Congratulations, ${name}!</div>
            <div class="message">
              You have successfully registered for our upcoming technology webinar. Below you will find your details and the schedule for the session. Please make sure to save the date.
            </div>
            
            <div class="card">
              <div class="card-title">${webinar.title}</div>
              <div class="detail-row">
                <div class="detail-label">Speaker</div>
                <div class="detail-value">${webinar.speaker}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Date</div>
                <div class="detail-value">${dateStr}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Time</div>
                <div class="detail-value">${webinar.time}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Duration</div>
                <div class="detail-value">${webinar.duration}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Category</div>
                <div class="detail-value">${webinar.category}</div>
              </div>
            </div>
            
            <div style="text-align: center;">
              <a href="http://localhost:3000" class="btn">Visit Portal</a>
            </div>
          </div>
          <div class="footer">
            Xenelasia Group &copy; 2026. Global Strategic Consulting & Tech Solutions.<br>
            For support, contact <a href="mailto:support@xenelasia.com">support@xenelasia.com</a>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"Xenelasia Webinars" <${fromAddress}>`,
      to: email,
      subject: `🎉 Registration Confirmed: ${webinar.title}`,
      text: `Congratulations ${name}! You have successfully registered for the webinar: "${webinar.title}" by ${webinar.speaker} scheduled on ${dateStr} at ${webinar.time}.`,
      html: htmlContent
    };

    const info = await tx.sendMail(mailOptions);
    console.log(`Email successfully sent: ${info.messageId}`);
    if (nodemailer.getTestMessageUrl(info)) {
      console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
  } catch (error) {
    console.error('Error sending confirmation email:', error);
  }
}

// Endpoint to register for a webinar
app.post('/api/registrations', async (req, res) => {
  try {
    const { name, email, phone, webinarId } = req.body;

    if (!name || !email || !phone || !webinarId) {
      return res.status(400).json({ error: 'All fields (name, email, phone, webinarId) are required.' });
    }

    // Verify the webinar exists
    const webinar = await prisma.webinar.findUnique({
      where: { id: webinarId }
    });

    if (!webinar) {
      return res.status(404).json({ error: 'Selected webinar does not exist.' });
    }

    // Check if seats are available
    if (webinar.remainingSeats <= 0) {
      return res.status(400).json({ error: 'No remaining seats available for this webinar.' });
    }

    // Save registration in SQL database
    const newRegistration = await prisma.registration.create({
      data: {
        name,
        email,
        phone,
        webinarId
      }
    });

    // Decrement remaining seats of the webinar
    const updatedWebinar = await prisma.webinar.update({
      where: { id: webinarId },
      data: {
        remainingSeats: {
          decrement: 1
        }
      }
    });

    // Send confirmation email asynchronously (does not block client response)
    sendConfirmationEmail(email, name, updatedWebinar).catch(console.error);

    res.status(201).json({
      message: 'Successfully registered for the webinar!',
      registration: newRegistration,
      webinar: updatedWebinar
    });

  } catch (error) {
    console.error('Error registering for webinar:', error);
    res.status(500).json({ error: 'Failed to complete registration.' });
  }
});

app.listen(PORT, async () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  await seedDefaultWebinars();
});

