'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { 
  Shield, Cpu, Network, Calendar, Clock, User, Users, Search, 
  Send, ChevronRight, ChevronLeft, Award, Server, MessageSquare, BookOpen, AlertCircle, Mail, Globe
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
const ThreeBackground = dynamic(() => import('../components/ThreeBackground'), { ssr: false });
import AIChatbot from '../components/AIChatbot';
import { webinarApi, blogApi, registrationApi } from '../utils/api';

const MOCK_WEBINARS = [
  {
    id: '1',
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
    id: '2',
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
    id: '3',
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

const MOCK_BLOGS = [
  {
    id: '1',
    title: 'The Rise of Ransomware-as-a-Service (RaaS) in 2026',
    content: 'Ransomware-as-a-Service has democratized cybercrime. In this article, we outline the structural mechanisms of modern RaaS affiliates and defensive measures.',
    category: 'Cybersecurity',
    author: 'Xenelasia Threat Intel',
    created_at: new Date().toISOString(),
    image: 'https://images.unsplash.com/photo-1601597111158-2fceff270190?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: '2',
    title: 'Demystifying the OWASP Top 10 for LLM Applications',
    content: 'As Generative AI models are integrated into enterprise pipelines, new threat models arise. From Prompt Injection to Insecure Output Handling.',
    category: 'Artificial Intelligence',
    author: 'David Miller',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: '3',
    title: 'Why Zero Trust is the Only Viable Path Forward',
    content: 'Traditional VPNs are failing under the weight of hybrid work requirements. Zero Trust Network Architecture operates on a simple principle: "Never Trust, Always Verify".',
    category: 'Consulting',
    author: 'Marcus Vance',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    image: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&q=80&w=600',
  }
];

const SERVICES = [
  {
    id: '01',
    category: 'Finance & Strategy',
    title: 'Virtual CFO & Financial Strategy',
    description: 'On-demand financial leadership forecasting, cash flow management, investor reporting, and strategic planning without full-time overhead.',
    benefits: [
      'Cash Flow Optimization & Forecasting',
      'Strategic Fundraising & Pitch Deck Support',
      'KPI Dashboards & Financial Reporting',
      'Mergers & Acquisitions Advisory'
    ],
    cta: 'Learn Strategy',
    color: 'var(--neon-blue)',
    borderColor: 'neon-border-blue',
    iconColor: 'text-neon-blue'
  },
  {
    id: '02',
    category: 'AI & Automation',
    title: 'AI Automation & Custom LLMs',
    description: 'End-to-end AI workflows, autonomous agents, and custom LLMs built to eliminate repetitive tasks and unlock operational efficiency.',
    benefits: [
      'Custom LLM Integration & Fine-Tuning',
      'Autonomous Agent Workflows (LangChain/Flowise)',
      'Legacy System API Automations',
      'Process Bottleneck Audits & AI Roadmap'
    ],
    cta: 'Explore Automation',
    color: 'var(--neon-purple)',
    borderColor: 'neon-border-purple',
    iconColor: 'text-neon-purple'
  },
  {
    id: '03',
    category: 'Security & GRC',
    title: 'Cyber Security & Risk Management',
    description: 'ISO 27001 and NIST-aligned GRC advisory, vulnerability assessments, and continuous monitoring to protect your digital assets.',
    benefits: [
      'ISO 27001 & NIST Compliance Advisory',
      'Penetration Testing & Vulnerability Assessment',
      'Zero-Trust Network Architecture Design',
      'Incident Response & 24/7 Threat Monitoring'
    ],
    cta: 'Audit Assets',
    color: 'var(--neon-cyan)',
    borderColor: 'neon-border-cyan',
    iconColor: 'text-neon-cyan'
  },
  {
    id: '04',
    category: 'Marketing & Growth',
    title: 'Digital Marketing & Growth',
    description: 'Organic-first growth, SEO, content marketing, and performance campaigns designed to build pipeline and expand your market presence.',
    benefits: [
      'Organic Search Engine Optimization (SEO)',
      'Performance Paid Advertising (Meta/Google)',
      'B2B Outbound Campaigns & Lead Sourcing',
      'High-Conversion Landing Page Copywriting'
    ],
    cta: 'Accelerate Growth',
    color: 'var(--neon-blue)',
    borderColor: 'neon-border-blue',
    iconColor: 'text-neon-blue'
  },
  {
    id: '05',
    category: 'Dev & Design',
    title: 'Website & App Development',
    description: 'Product-grade websites and mobile apps from UX design through deployment, built to convert visitors and support business goals.',
    benefits: [
      'Next.js, React, & Node.js Custom Web Apps',
      'Cross-Platform Mobile Apps (React Native/Flutter)',
      'SaaS Product Architecture & Cloud Deployments',
      'Interactive UI/UX Prototypes & Brand Identity'
    ],
    cta: 'Build Products',
    color: 'var(--neon-purple)',
    borderColor: 'neon-border-purple',
    iconColor: 'text-neon-purple'
  },
  {
    id: '06',
    category: 'HR & Operations',
    title: 'Payroll & HR Outsourcing',
    description: 'Compliant payroll processing, HR operations, and talent management so your team stays focused on growth, not admin overhead.',
    benefits: [
      'End-to-End Payroll Management & Tax Filings',
      'Compliant Employee Onboarding & Contracts',
      'Talent Acquisition & Technical Recruiting',
      'Operational Efficiency Audits'
    ],
    cta: 'Streamline Operations',
    color: 'var(--neon-cyan)',
    borderColor: 'neon-border-cyan',
    iconColor: 'text-neon-cyan'
  }
];

export default function LandingPage() {
  const router = useRouter();
  
  // Data State
  const [webinars, setWebinars] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [activeService, setActiveService] = useState(0);
  const [blogSearch, setBlogSearch] = useState('');
  const [selectedBlogCat, setSelectedBlogCat] = useState('All');
  
  // Forms & State
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [contactSuccess, setContactSuccess] = useState(false);
  const [regStatus, setRegStatus] = useState<{ [key: string]: 'idle' | 'loading' | 'success' | 'error' }>({});
  const [regErrorMsg, setRegErrorMsg] = useState<{ [key: string]: string }>({});

  // Fetch webinars and blogs
  useEffect(() => {
    const loadData = async () => {
      try {
        const webinarData = await webinarApi.getAll();
        setWebinars(webinarData.length > 0 ? webinarData : MOCK_WEBINARS);
      } catch (err) {
        setWebinars(MOCK_WEBINARS);
      }

      try {
        const blogData = await blogApi.getAll();
        setBlogs(blogData.length > 0 ? blogData : MOCK_BLOGS);
      } catch (err) {
        setBlogs(MOCK_BLOGS);
      }
    };
    loadData();
  }, []);

  const handleRegister = async (webinarId: string) => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!user || !token) {
      router.push('/login?redirect=register&webinar=' + webinarId);
      return;
    }

    setRegStatus((prev) => ({ ...prev, [webinarId]: 'loading' }));
    
    try {
      await registrationApi.register(webinarId);
      setRegStatus((prev) => ({ ...prev, [webinarId]: 'success' }));
      // Reload webinars to update seats
      const updated = await webinarApi.getAll();
      if (updated.length > 0) setWebinars(updated);
    } catch (err: any) {
      setRegStatus((prev) => ({ ...prev, [webinarId]: 'error' }));
      setRegErrorMsg((prev) => ({ ...prev, [webinarId]: err.message || 'Registration failed' }));
      setTimeout(() => {
        setRegStatus((prev) => ({ ...prev, [webinarId]: 'idle' }));
      }, 4000);
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;
    setContactSuccess(true);
    setContactForm({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setContactSuccess(false), 5000);
  };

  // Blog filtering
  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch = blog.title.toLowerCase().includes(blogSearch.toLowerCase()) || 
                          blog.content.toLowerCase().includes(blogSearch.toLowerCase());
    const matchesCategory = selectedBlogCat === 'All' || blog.category === selectedBlogCat;
    return matchesSearch && matchesCategory;
  });

  const blogCategories = ['All', 'Cybersecurity', 'Cloud Security', 'Artificial Intelligence', 'Consulting'];

  // Slideshow State for Blogs
  const [currentBlogIndex, setCurrentBlogIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2);
      } else {
        setItemsPerView(3);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxBlogIndex = Math.max(0, filteredBlogs.length - itemsPerView);

  // Clamp slide index to prevent out-of-bounds on filter changes
  useEffect(() => {
    if (currentBlogIndex > maxBlogIndex) {
      setCurrentBlogIndex(maxBlogIndex);
    }
  }, [filteredBlogs.length, itemsPerView, currentBlogIndex, maxBlogIndex]);

  // Autoplay blogs slideshow (circular shifts every 2 seconds)
  useEffect(() => {
    if (maxBlogIndex <= 0 || isPaused) return;
    
    const interval = setInterval(() => {
      setCurrentBlogIndex((prev) => (prev >= maxBlogIndex ? 0 : prev + 1));
    }, 2000); // changes every 2 seconds
    
    return () => clearInterval(interval);
  }, [maxBlogIndex, isPaused]);

  const handlePrevBlog = () => {
    setCurrentBlogIndex((prev) => (prev === 0 ? maxBlogIndex : prev - 1));
  };

  const handleNextBlog = () => {
    setCurrentBlogIndex((prev) => (prev >= maxBlogIndex ? 0 : prev + 1));
  };

  return (
    <>
      <ThreeBackground />
      <Navbar />

      {/* Hero Section */}
      <section id="home" className="relative min-h-[92vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20">
        <div className="mx-auto max-w-5xl text-center flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 mb-6 border border-neon-blue/20 bg-neon-blue/5 px-4 py-1.5 rounded-full"
          >
            <Shield className="h-4 w-4 text-neon-blue" />
            <span className="text-[11px] font-mono tracking-widest text-neon-blue uppercase">
              Global Strategic Consulting
            </span>
          </motion.div>
          
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl"
          >
            Where <span className="bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent neon-glow-blue">Strategy Meets Execution</span>
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mt-6 text-base sm:text-lg text-slate-300 max-w-3xl leading-relaxed"
          >
            Xenelasia Group is a global multi-service firm delivering high-impact Virtual CFO services, AI-driven automation, and enterprise-grade consulting purpose-built for ambitious SMBs ready to scale without limits.
          </motion.p>


        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="relative py-24 px-4 sm:px-6 lg:px-8 border-t border-white/5 bg-slate-950/40">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Our Key Strengths
            </h2>
            <div className="h-1 w-20 bg-neon-blue mx-auto mt-4 rounded-full"></div>
            <p className="mt-4 text-slate-400 text-sm sm:text-base leading-relaxed">
              Xenelasia Group is built upon four pillars that dictate our strategic execution and client success.
            </p>
          </div>

          <div className="relative mt-20">
            {/* Horizontal timeline bar (desktop) */}
            <div className="absolute top-7 left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-neon-blue via-neon-purple to-neon-cyan opacity-20 hidden lg:block" />
            
            {/* Vertical timeline bar (mobile/tablet) */}
            <div className="absolute left-7 top-4 bottom-4 w-[2px] bg-gradient-to-b from-neon-blue via-neon-purple to-neon-cyan opacity-20 lg:hidden" />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-8 relative z-10">
              
              {/* Strength 1 */}
              <div className="flex lg:flex-col items-start lg:items-center text-left lg:text-center group gap-6 lg:gap-0">
                <div className="h-14 w-14 rounded-full bg-slate-950 border-2 border-neon-blue flex items-center justify-center text-neon-blue shadow-[0_0_15px_rgba(197,160,89,0.15)] group-hover:scale-110 group-hover:shadow-[0_0_25px_rgba(197,160,89,0.45)] group-hover:border-neon-blue transition-all duration-300 shrink-0">
                  <Globe className="h-6 w-6" />
                </div>
                <div className="lg:mt-6">
                  <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">Pillar 01</span>
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider mt-1 group-hover:text-neon-blue transition-colors">Global Reach</h3>
                  <p className="mt-3 text-slate-400 text-xs sm:text-sm leading-relaxed max-w-xs">
                    Worldwide client base. Serving ambitious businesses globally with virtual leadership and custom growth frameworks.
                  </p>
                </div>
              </div>

              {/* Strength 2 */}
              <div className="flex lg:flex-col items-start lg:items-center text-left lg:text-center group gap-6 lg:gap-0">
                <div className="h-14 w-14 rounded-full bg-slate-950 border-2 border-neon-purple flex items-center justify-center text-neon-purple shadow-[0_0_15px_rgba(225,29,72,0.15)] group-hover:scale-110 group-hover:shadow-[0_0_25px_rgba(225,29,72,0.45)] group-hover:border-neon-purple transition-all duration-300 shrink-0">
                  <Shield className="h-6 w-6" />
                </div>
                <div className="lg:mt-6">
                  <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">Pillar 02</span>
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider mt-1 group-hover:text-neon-purple transition-colors">Enterprise Grade</h3>
                  <p className="mt-3 text-slate-400 text-xs sm:text-sm leading-relaxed max-w-xs">
                    Industry-standard delivery. Standardized procedures aligning with ISO 27001, GRC advisories, and elite software engineering.
                  </p>
                </div>
              </div>

              {/* Strength 3 */}
              <div className="flex lg:flex-col items-start lg:items-center text-left lg:text-center group gap-6 lg:gap-0">
                <div className="h-14 w-14 rounded-full bg-slate-950 border-2 border-neon-cyan flex items-center justify-center text-neon-cyan shadow-[0_0_15px_rgba(244,239,234,0.15)] group-hover:scale-110 group-hover:shadow-[0_0_25px_rgba(244,239,234,0.45)] group-hover:border-neon-cyan transition-all duration-300 shrink-0">
                  <Network className="h-6 w-6" />
                </div>
                <div className="lg:mt-6">
                  <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">Pillar 03</span>
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider mt-1 group-hover:text-neon-cyan transition-colors">End-to-End Ownership</h3>
                  <p className="mt-3 text-slate-400 text-xs sm:text-sm leading-relaxed max-w-xs">
                    Full accountability. Taking comprehensive charge of financial pipelines, AI automation roadmaps, and growth channels.
                  </p>
                </div>
              </div>

              {/* Strength 4 */}
              <div className="flex lg:flex-col items-start lg:items-center text-left lg:text-center group gap-6 lg:gap-0">
                <div className="h-14 w-14 rounded-full bg-slate-950 border-2 border-neon-blue flex items-center justify-center text-neon-blue shadow-[0_0_15px_rgba(197,160,89,0.15)] group-hover:scale-110 group-hover:shadow-[0_0_25px_rgba(197,160,89,0.45)] group-hover:border-neon-blue transition-all duration-300 shrink-0">
                  <Cpu className="h-6 w-6" />
                </div>
                <div className="lg:mt-6">
                  <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">Pillar 04</span>
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider mt-1 group-hover:text-neon-blue transition-colors">Fast Execution</h3>
                  <p className="mt-3 text-slate-400 text-xs sm:text-sm leading-relaxed max-w-xs">
                    Agile, results first. Removing bureaucracy to deploy rapid custom integrations, high-performance campaigns, and compliance mappings.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Core Services Section */}
      <section id="services" className="relative py-24 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-neon-blue">What We Do</span>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mt-2">
              Our Core Services
            </h2>
            <div className="h-1 w-20 bg-neon-blue mx-auto mt-4 rounded-full"></div>
            <p className="mt-4 text-slate-400 text-sm">
              We deliver elite fractional management, cutting-edge software integrations, and enterprise-level risk mappings.
            </p>
          </div>

          {/* Desktop/Laptop Layout (Split Typography & Sticky Panel) */}
          <div className="hidden lg:grid lg:grid-cols-12 gap-12 items-start mt-16">
            {/* Left Typography List */}
            <div className="lg:col-span-5 space-y-2">
              {SERVICES.map((service, index) => {
                const isActive = activeService === index;
                return (
                  <div 
                    key={service.id}
                    onMouseEnter={() => setActiveService(index)}
                    className="group py-6 border-b border-white/5 cursor-pointer transition-all duration-300 relative flex items-center justify-between"
                  >
                    <div className="flex items-baseline gap-6">
                      <span className={`font-mono text-xs transition-colors duration-300 ${isActive ? service.iconColor : 'text-slate-600 group-hover:text-slate-400'}`}>
                        {service.id}
                      </span>
                      <h3 className={`text-xl font-bold tracking-tight transition-colors duration-300 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                        {service.title}
                      </h3>
                    </div>
                    <div className={`transition-all duration-300 transform ${isActive ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0 group-hover:opacity-50 group-hover:translate-x-0'} ${service.iconColor}`}>
                      <ChevronRight className="h-5 w-5" />
                    </div>
                    {/* Glowing highlight indicator */}
                    <div 
                      className="absolute left-0 bottom-0 h-[1.5px] transition-all duration-300"
                      style={{ 
                        width: isActive ? '100%' : '0%',
                        backgroundColor: service.color,
                        opacity: isActive ? 0.35 : 0
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Right Sticky Immersive Panel */}
            <div className="lg:col-span-7 lg:sticky lg:top-24">
              <div className={`glass-card rounded-3xl p-8 border border-white/10 ${SERVICES[activeService].borderColor} transition-all duration-500 relative overflow-hidden min-h-[440px] flex flex-col justify-between`}>
                
                {/* Huge backdrop outlined indicator */}
                <div className="absolute -right-8 -bottom-16 font-extrabold font-mono text-[16rem] text-slate-800/10 pointer-events-none select-none">
                  {SERVICES[activeService].id}
                </div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
                      {SERVICES[activeService].category}
                    </span>
                    <div className={`h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center ${SERVICES[activeService].iconColor}`}>
                      {activeService === 0 && <Award className="h-6 w-6" />}
                      {activeService === 1 && <Cpu className="h-6 w-6" />}
                      {activeService === 2 && <Shield className="h-6 w-6" />}
                      {activeService === 3 && <Globe className="h-6 w-6" />}
                      {activeService === 4 && <Server className="h-6 w-6" />}
                      {activeService === 5 && <Users className="h-6 w-6" />}
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    {SERVICES[activeService].title}
                  </h3>
                  
                  <p className="mt-4 text-sm text-slate-300 leading-relaxed">
                    {SERVICES[activeService].description}
                  </p>

                  <div className="mt-8">
                    <h4 className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-4">Key Deliverables &amp; Benefits</h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                      {SERVICES[activeService].benefits.map((benefit, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                          <span className={`mt-1 text-sm ${SERVICES[activeService].iconColor}`}>&bull;</span>
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="relative z-10 mt-10 pt-6 border-t border-white/5">
                  <a 
                    href="#contact"
                    className="inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-5 py-3 text-xs font-semibold text-white hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer group/btn"
                  >
                    <span>{SERVICES[activeService].cta}</span>
                    <ChevronRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </a>
                </div>

              </div>
            </div>
          </div>

          {/* Mobile / Tablet Accordion Layout (Visible below lg) */}
          <div className="lg:hidden mt-8 space-y-4">
            {SERVICES.map((service, index) => {
              const isActive = activeService === index;
              return (
                <div 
                  key={service.id}
                  className={`glass-card rounded-2xl border border-white/10 transition-all duration-300 overflow-hidden ${isActive ? service.borderColor : ''}`}
                >
                  <button
                    onClick={() => setActiveService(isActive ? -1 : index)}
                    className="w-full text-left px-6 py-5 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <span className={`font-mono text-xs ${isActive ? service.iconColor : 'text-slate-500'}`}>
                        {service.id}
                      </span>
                      <span className="text-base font-bold text-white tracking-tight">
                        {service.title}
                      </span>
                    </div>
                    <ChevronRight className={`h-5 w-5 transition-transform duration-300 ${isActive ? 'rotate-90 ' + service.iconColor : 'text-slate-500'}`} />
                  </button>

                  {isActive && (
                    <div className="px-6 pb-6 pt-2 border-t border-white/5 bg-slate-950/20">
                      <span className="text-[9px] font-mono tracking-widest text-slate-500 uppercase block mb-3">
                        {service.category}
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {service.description}
                      </p>
                      <div className="mt-6">
                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block mb-2">Key Deliverables</span>
                        <div className="grid grid-cols-1 gap-2">
                          {service.benefits.map((benefit, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                              <span className={`mt-0.5 ${service.iconColor}`}>&bull;</span>
                              <span>{benefit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="mt-6 pt-4 border-t border-white/5">
                        <a 
                          href="#contact"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-white"
                        >
                          <span>{service.cta}</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Upcoming Webinars Section */}
      <section id="webinars" className="relative py-24 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Upcoming Security Webinars
            </h2>
            <div className="h-1 w-20 bg-neon-blue mx-auto mt-4 rounded-full"></div>
            <p className="mt-4 text-slate-400 text-sm">
              Register to save your seat. Receive a unique entry QR pass and download your completion certificate after attending.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {webinars.map((webinar) => {
              const status = regStatus[webinar.id] || 'idle';
              const dateObj = new Date(webinar.date);
              
              return (
                <div key={webinar.id} className="glass-card rounded-2xl overflow-hidden flex flex-col border border-white/10 hover:border-blue-500/40 transition-all group hover:scale-[1.01]">
                  
                  {/* Banner Image */}
                  <div className="h-48 w-full overflow-hidden relative bg-slate-900">
                    <img 
                      src={webinar.image} 
                      alt={webinar.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 rounded-md bg-blue-600 px-2.5 py-1 text-[10px] font-mono text-white tracking-widest uppercase">
                      {webinar.category}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-white leading-snug group-hover:text-blue-300 transition-colors">
                      {webinar.title}
                    </h3>
                    <p className="mt-2 text-xs text-slate-400 leading-relaxed flex-1 line-clamp-3">
                      {webinar.description}
                    </p>

                    <div className="mt-4 pt-4 border-t border-white/5 space-y-2 text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-neon-blue" />
                        <span>{webinar.speaker}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-neon-purple" />
                        <span>{dateObj.toDateString()} at {webinar.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-neon-cyan" />
                        <span>Duration: {webinar.duration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-3.5 w-3.5 text-slate-400" />
                        <span className="flex items-center gap-1.5">
                          Remaining seats:{' '}
                          <span className={`font-bold ${webinar.remainingSeats <= 5 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
                            {webinar.remainingSeats} / {webinar.seats}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Registration Error */}
                    {status === 'error' && (
                      <div className="mt-3 p-2 bg-red-950/40 border border-red-500/20 rounded-lg flex items-center gap-1.5 text-[10px] text-red-400">
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span>{regErrorMsg[webinar.id] || 'Failed'}</span>
                      </div>
                    )}

                    {/* Button */}
                    <div className="mt-6">
                      {status === 'success' ? (
                        <div className="w-full rounded-xl bg-emerald-600/25 border border-emerald-500/30 text-emerald-400 text-center py-2.5 text-xs font-semibold">
                          Registered Successfully! Check Dashboard
                        </div>
                      ) : (
                        <button
                          onClick={() => handleRegister(webinar.id)}
                          disabled={status === 'loading' || webinar.remainingSeats === 0}
                          className="w-full rounded-xl bg-slate-900 border border-white/10 hover:border-blue-500/40 py-2.5 text-xs font-semibold text-white hover:bg-blue-600 hover:text-white transition-all cursor-pointer disabled:bg-slate-950 disabled:text-slate-600 disabled:border-slate-800"
                        >
                          {status === 'loading' ? 'Processing...' : webinar.remainingSeats === 0 ? 'Fully Booked' : 'Register Now'}
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Blogs Section */}
      <section id="blogs" className="relative py-24 px-4 sm:px-6 lg:px-8 border-t border-white/5 bg-slate-950/40">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Cybersecurity Intel & Blogs
            </h2>
            <div className="h-1 w-20 bg-neon-purple mx-auto mt-4 rounded-full"></div>
            <p className="mt-4 text-slate-400 text-sm">
              Discover active threat intelligence articles, compliance insights, and zero-day threat analysis.
            </p>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-10">
            {/* Category tabs */}
            <div className="flex flex-wrap gap-2 justify-center">
              {blogCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedBlogCat(cat)}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                    selectedBlogCat === cat 
                      ? 'bg-neon-purple text-white shadow-md shadow-neon-purple/10' 
                      : 'bg-slate-900 border border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={blogSearch}
                onChange={(e) => setBlogSearch(e.target.value)}
                placeholder="Search articles..."
                className="w-full bg-slate-900 border border-white/10 text-xs rounded-xl pl-8 pr-3 py-2.5 focus:outline-none focus:border-neon-purple focus:ring-1 focus:ring-neon-purple text-white placeholder-slate-500"
              />
              <Search className="absolute left-2.5 top-3 h-3.5 w-3.5 text-slate-500" />
            </div>
          </div>

          {/* Blogs Grid (Slideshow) */}
          {filteredBlogs.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-500 font-mono">
              No matching intelligence articles found. Try another search.
            </div>
          ) : (
            <div className="relative px-0 sm:px-12">
              {/* Slideshow Viewport */}
              <div 
                className="overflow-hidden w-full py-4"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              >
                <div 
                  className="flex transition-transform duration-500 ease-in-out -mx-4"
                  style={{ transform: `translateX(-${currentBlogIndex * (100 / itemsPerView)}%)` }}
                >
                  {filteredBlogs.map((blog) => (
                    <div key={blog.id} className="w-full sm:w-1/2 lg:w-1/3 shrink-0 px-4">
                      <div className="glass-card rounded-2xl overflow-hidden flex flex-col border border-white/10 hover:border-neon-purple/60 shadow-lg hover:shadow-neon-purple/25 hover:scale-[1.06] transition-all duration-300 group h-full">
                        
                        {/* Image */}
                        <div className="h-44 w-full bg-slate-900 overflow-hidden relative">
                          <img 
                            src={blog.image} 
                            alt={blog.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>

                        {/* Content */}
                        <div className="p-6 flex-1 flex flex-col">
                          <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                            <span>By {blog.author}</span>
                            <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                          </div>

                          <h3 className="mt-3 text-base font-bold text-white leading-snug group-hover:text-neon-purple transition-colors">
                            {blog.title}
                          </h3>
                          <p className="mt-2 text-xs text-slate-400 leading-relaxed line-clamp-3 flex-1">
                            {blog.content}
                          </p>

                          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs">
                            <span className="text-neon-purple font-medium">#{blog.category}</span>
                            <button className="text-slate-400 hover:text-white flex items-center gap-1 font-semibold group-hover:translate-x-0.5 transition-transform cursor-pointer">
                              Read Intel <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Slide Navigation Buttons */}
              {filteredBlogs.length > itemsPerView && (
                <>
                  <button
                    onClick={handlePrevBlog}
                    className="absolute left-0 top-1/2 -translate-y-1/2 hidden sm:flex h-10 w-10 rounded-full border border-white/10 bg-slate-950/80 hover:bg-slate-900 hover:border-white/20 text-slate-300 hover:text-white items-center justify-center transition-all cursor-pointer backdrop-blur-sm z-10"
                    aria-label="Previous blog post"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleNextBlog}
                    className="absolute right-0 top-1/2 -translate-y-1/2 hidden sm:flex h-10 w-10 rounded-full border border-white/10 bg-slate-950/80 hover:bg-slate-900 hover:border-white/20 text-slate-300 hover:text-white items-center justify-center transition-all cursor-pointer backdrop-blur-sm z-10"
                    aria-label="Next blog post"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* Mobile Slide indicators */}
              {filteredBlogs.length > itemsPerView && (
                <div className="flex justify-center gap-1.5 mt-6 sm:hidden">
                  {Array.from({ length: maxBlogIndex + 1 }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentBlogIndex(i)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        currentBlogIndex === i ? 'w-6 bg-neon-purple' : 'w-1.5 bg-white/20'
                      }`}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Client & Attendee Feedback
            </h2>
            <div className="h-1 w-20 bg-neon-blue mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card rounded-2xl p-6 border border-white/10 flex flex-col justify-between">
              <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">
                "The Threat Hunting webinar was world class. The instructor went deep into memory injection audits and actual Sysmon logs. Generating a secure QR pass made check-in extremely tech-focused!"
              </p>
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center font-bold text-blue-300">AM</div>
                <div>
                  <h4 className="text-xs font-bold text-white">Alex Mercer</h4>
                  <p className="text-[10px] text-slate-500">Security Engineer, NetDefense</p>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 border border-white/10 flex flex-col justify-between">
              <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">
                "We transitioned our cloud clusters to zero-trust based on structural webinars by Xenelasia. Verified certificates are easily shareable on LinkedIn. Super premium dashboard design."
              </p>
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center font-bold text-purple-300">KP</div>
                <div>
                  <h4 className="text-xs font-bold text-white">Karla P.</h4>
                  <p className="text-[10px] text-slate-500">CISO, CloudWave Solutions</p>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 border border-white/10 flex flex-col justify-between">
              <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">
                "Xenelasia sets the benchmark in IT security consulting. The LLM security webinar clarified crucial prompt validation guidelines. AI Chatbot helper was highly responsive!"
              </p>
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center font-bold text-cyan-300">RN</div>
                <div>
                  <h4 className="text-xs font-bold text-white">Ravi Nair</h4>
                  <p className="text-[10px] text-slate-500">VP Engineering, FinTech Secure</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="relative py-24 px-4 sm:px-6 lg:px-8 border-t border-white/5 bg-slate-950/40">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Details */}
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Get In Touch With Our Cyber Experts
              </h2>
              <p className="mt-4 text-slate-400 text-sm leading-relaxed">
                Have specific security consulting needs, ISO compliance audits, or custom corporate webinar requests? Drop us a line. Our team responds within 24 business hours.
              </p>

              <div className="mt-8 space-y-4 text-sm text-slate-300">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-neon-blue" />
                  <span>Xenelasia Consultancy LLP</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-neon-purple" />
                  <a href="mailto:contact@xenelasia.com" className="hover:underline">contact@xenelasia.com</a>
                </div>
                <div className="flex items-center gap-3">
                  <Server className="h-5 w-5 text-neon-cyan" />
                  <span>Secure Sandbox Connection Enabled (HTTPS)</span>
                </div>
              </div>
            </div>

            {/* Form Card */}
            <div className="glass-card rounded-3xl p-8 border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 h-40 w-40 bg-blue-500/5 blur-3xl rounded-full"></div>
              
              <h3 className="text-lg font-bold text-white mb-6">Send Security Inquiry</h3>

              {contactSuccess ? (
                <div className="p-4 rounded-xl bg-emerald-600/15 border border-emerald-500/20 text-emerald-400 text-xs font-semibold text-center leading-relaxed">
                  Inquiry submitted successfully! A Xenelasia cybersecurity advisor will contact you soon.
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        className="w-full bg-slate-900/80 border border-white/10 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 text-white placeholder-slate-600"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Business Email</label>
                      <input
                        type="email"
                        required
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        className="w-full bg-slate-900/80 border border-white/10 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 text-white placeholder-slate-600"
                        placeholder="john@company.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Subject</label>
                    <input
                      type="text"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                      className="w-full bg-slate-900/80 border border-white/10 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 text-white placeholder-slate-600"
                      placeholder="Consulting / Audits / Custom Training"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Message Details</label>
                    <textarea
                      required
                      rows={4}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      className="w-full bg-slate-900/80 border border-white/10 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 text-white placeholder-slate-600 resize-none"
                      placeholder="Outline your inquiry context..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-3 text-xs font-semibold text-white hover:from-blue-500 hover:to-purple-500 transition-all shadow-md shadow-blue-600/10 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Submit Secure Form
                  </button>
                </form>
              )}

            </div>

          </div>
        </div>
      </section>

      <Footer />
      <AIChatbot />
    </>
  );
}
