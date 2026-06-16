import { Router } from 'express';

const router = Router();

const getHeuristicResponse = (message: string): string => {
  const msg = message.toLowerCase();
  
  if (msg.includes('xenelasia') || msg.includes('who are you') || msg.includes('what is this company')) {
    return 'Xenelasia Consultancy LLP is a leading cybersecurity and technology consulting firm. We empower professionals and enterprises through advanced advisory services, risk audits, penetration testing, and tech webinars.';
  }
  if (msg.includes('webinar') || msg.includes('register') || msg.includes('join') || msg.includes('how to')) {
    return 'To join our webinars, simply register a free account, browse upcoming sessions on the landing page, and click "Register Now". Your unique QR entry pass will be emailed to you and listed on your user dashboard!';
  }
  if (msg.includes('certificate') || msg.includes('completion')) {
    return 'Yes, we provide official Certificates of Completion. Once the admin marks your status as "Attended" for a webinar, the certificate download button will unlock under the Certificates section of your dashboard.';
  }
  if (msg.includes('cybersecurity') || msg.includes('hacking') || msg.includes('security') || msg.includes('vapt')) {
    return 'Cybersecurity is critical in modern digital infrastructures. Xenelasia specializes in Vulnerability Assessment, Penetration Testing (VAPT), compliance mapping, cloud security architecture, and defensive cybersecurity drills.';
  }
  if (msg.includes('contact') || msg.includes('email') || msg.includes('office') || msg.includes('phone')) {
    return 'You can contact Xenelasia Consultancy LLP via email at contact@xenelasia.com or submit the query form on our website. Our physical offices and active community channels are listed in the footer.';
  }
  if (msg.includes('hello') || msg.includes('hi ') || msg.includes('hey')) {
    return 'Hello! I am Xenelasia\'s AI assistant. I can guide you through our tech webinars, registration passes, certificate generation, or consulting services. How can I help you today?';
  }
  
  return 'Thank you for your question. I am Xenelasia\'s virtual assistant. I can explain our technical webinars, QR passes, and certificates. For specific consulting projects, please reach out to us directly at contact@xenelasia.com.';
};

// @route   POST /api/chatbot
// @desc    Get chatbot response (AI with Heuristic Fallback)
router.post('/', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    res.status(400).json({ error: 'Message content is required' });
    return;
  }

  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (geminiApiKey) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are Xenelasia's Cybersecurity & Technology Chatbot Assistant. Respond concisely, in maximum 3 sentences. Keep a premium, professional, helpful tone. Context: Xenelasia Consultancy LLP hosts tech/cybersecurity webinars, issues digital passes with QR codes, generates completion certificates on attendance, and provides expert IT security consulting. Question from user: "${message}"`
            }]
          }]
        })
      });

      const data = (await response.json()) as any;
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (aiText) {
        res.json({ reply: aiText.trim() });
        return;
      }
    } catch (error) {
      console.error('Gemini API call failed, falling back to heuristics:', error);
    }
  }

  const reply = getHeuristicResponse(message);
  res.json({ reply });
});

export default router;
