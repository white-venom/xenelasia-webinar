import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('admin123', salt);
  const userPasswordHash = await bcrypt.hash('user123', salt);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@xenelasia.com' },
    update: {},
    create: {
      email: 'admin@xenelasia.com',
      full_name: 'Xenelasia Administrator',
      phone: '+1234567890',
      organization: 'Xenelasia Consultancy LLP',
      password_hash: adminPasswordHash,
      role: 'ADMIN',
    },
  });

  const testUser = await prisma.user.upsert({
    where: { email: 'john.doe@example.com' },
    update: {},
    create: {
      email: 'john.doe@example.com',
      full_name: 'John Doe',
      phone: '+9876543210',
      organization: 'CyberDefend Solutions',
      password_hash: userPasswordHash,
      role: 'USER',
    },
  });

  console.log(`Created users: Admin (${admin.email}), Test User (${testUser.email})`);

  const webinars = [
    {
      title: 'Advanced Threat Hunting and Incident Response',
      description: 'Learn the latest methodologies for active threat hunting, memory forensics, and rapid incident response in enterprise hybrid cloud networks. Live demonstration of threat hunting using ELK and Sysmon.',
      speaker: 'Dr. Aris Thorne, Cybersecurity Specialist',
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      time: '15:00',
      duration: '120 mins',
      seats: 50,
      category: 'Cybersecurity',
      image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=600',
    },
    {
      title: 'Securing Next-Gen Cloud Architectures',
      description: 'A comprehensive deep-dive into AWS, Azure, and Google Cloud security structures, zero-trust implementations, Kubernetes security, and IAM policy hardening practices.',
      speaker: 'Sarah Jenkins, Principal Cloud Security Architect',
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      time: '18:00',
      duration: '90 mins',
      seats: 100,
      category: 'Cloud Security',
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=600',
    },
    {
      title: 'AI and Machine Learning in Defending Enterprise Assets',
      description: 'Explores the double-edged sword of Artificial Intelligence in cybersecurity. Understand how LLMs and anomaly detection help identify zero-day exploits and how attackers target AI models.',
      speaker: 'David Miller, Head of AI Research at Xenelasia',
      date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      time: '14:00',
      duration: '90 mins',
      seats: 75,
      category: 'Artificial Intelligence',
      image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=600',
    },
    {
      title: 'Zero Trust Network Architecture (ZTNA) Masterclass',
      description: 'Ditch the legacy perimeter mindset. This masterclass will provide structural frameworks for identity verification, micro-segmentation, and device health checks.',
      speaker: 'Marcus Vance, Enterprise Security Consultant',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago (Past webinar for certificate demonstration!)
      time: '16:00',
      duration: '100 mins',
      seats: 60,
      category: 'Cybersecurity',
      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=600',
    }
  ];

  for (const w of webinars) {
    await prisma.webinar.create({ data: w });
  }
  console.log('Created seed webinars.');

  const blogs = [
    {
      title: 'The Rise of Ransomware-as-a-Service (RaaS) in 2026',
      content: 'Ransomware-as-a-Service has democratized cybercrime. In this article, we outline the structural mechanisms of modern RaaS affiliates, common initial access vectors (like phishing and compromised VPNs), and defense measures including micro-segmentation and robust offline backups. Organizations must shift their strategies to defense-in-depth to survive these coordinated onslaughts.',
      category: 'Cybersecurity',
      author: 'Xenelasia Threat Intel Group',
      image: 'https://images.unsplash.com/photo-1601597111158-2fceff270190?auto=format&fit=crop&q=80&w=600',
    },
    {
      title: 'Demystifying the OWASP Top 10 for LLM Applications',
      content: 'As Generative AI models are integrated into enterprise pipelines, new threat models arise. From Prompt Injection to Insecure Output Handling, this article walks developers through the OWASP Top 10 vulnerabilities for Large Language Models. Learn how to implement strict validation boundaries, use system instructions effectively, and audit your model inputs and outputs.',
      category: 'Artificial Intelligence',
      author: 'David Miller',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600',
    },
    {
      title: 'Why Zero Trust is the Only Viable Path Forward',
      content: 'Traditional VPNs are failing under the weight of hybrid workforce requirements. Zero Trust Network Architecture operates on a simple principle: "Never Trust, Always Verify". This article reviews the steps required to transition an enterprise network from boundary-based security to authentication-based microsegmentation, reducing lateral movement risks by up to 90%.',
      category: 'Consulting',
      author: 'Marcus Vance',
      image: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&q=80&w=600',
    }
  ];

  for (const b of blogs) {
    await prisma.blog.create({ data: b });
  }
  console.log('Created seed blogs.');

  const pastWebinar = await prisma.webinar.findFirst({
    where: { title: { contains: 'Zero Trust' } }
  });

  if (pastWebinar) {
    const reg = await prisma.registration.create({
      data: {
        user_id: testUser.id,
        webinar_id: pastWebinar.id,
        registration_id: 'REG-ZTNA-SEED',
        webinar_pass: 'PASS-ZTNA-SEED',
        qr_code: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        status: 'ATTENDED'
      }
    });

    await prisma.certificate.create({
      data: {
        user_id: testUser.id,
        webinar_id: pastWebinar.id,
        certificate_url: `/certificates/${reg.id}`
      }
    });

    console.log('Created past registration and certificate seed for John Doe.');
  }

  console.log('Database seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
