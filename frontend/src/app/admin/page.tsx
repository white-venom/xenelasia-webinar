'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { 
  Shield, Users, Calendar, BookOpen, Mail, LayoutDashboard, 
  BarChart3, Plus, Edit, Trash2, Send, Clock, UserCheck, 
  Search, CheckCircle, AlertCircle, Loader2, Download, Bell, FileText, X
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
const ThreeBackground = dynamic(() => import('../../components/ThreeBackground'), { ssr: false });
import { 
  analyticsApi, authApi, webinarApi, blogApi, 
  registrationApi, emailApi 
} from '../../utils/api';

export default function AdminDashboard() {
  const router = useRouter();

  // Navigation state
  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'webinars' | 'blogs' | 'emails'>('analytics');
  const [adminUser, setAdminUser] = useState<any>(null);

  // States for Analytics
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalRegistrations: 0,
    activeWebinars: 0,
    totalWebinars: 0,
    blogStatistics: 0
  });
  const [webinarWiseRegs, setWebinarWiseRegs] = useState<any[]>([]);
  const [monthlyRegs, setMonthlyRegs] = useState<any[]>([]);
  const [attendanceReport, setAttendanceReport] = useState({ attended: 0, registered: 0, cancelled: 0, total: 0 });

  // States for lists
  const [usersList, setUsersList] = useState<any[]>([]);
  const [webinarsList, setWebinarsList] = useState<any[]>([]);
  const [blogsList, setBlogsList] = useState<any[]>([]);
  const [registrationsList, setRegistrationsList] = useState<any[]>([]);
  
  // Search states
  const [userSearch, setUserSearch] = useState('');
  const [webinarSearch, setWebinarSearch] = useState('');
  
  // Form states
  const [webinarForm, setWebinarForm] = useState({
    id: '', // for edit mode
    title: '',
    description: '',
    speaker: '',
    date: '',
    time: '',
    duration: '',
    seats: 50,
    category: 'Cybersecurity',
    image: ''
  });
  const [isWebinarEditMode, setIsWebinarEditMode] = useState(false);
  const [showWebinarForm, setShowWebinarForm] = useState(false);

  const [blogForm, setBlogForm] = useState({
    id: '', // for edit mode
    title: '',
    content: '',
    category: 'Cybersecurity',
    author: '',
    image: ''
  });
  const [isBlogEditMode, setIsBlogEditMode] = useState(false);
  const [showBlogForm, setShowBlogForm] = useState(false);

  const [announcementForm, setAnnouncementForm] = useState({ subject: '', message: '' });
  
  // Feedback indicators
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');
  const [emailBroadcastLoading, setEmailBroadcastLoading] = useState(false);
  const [emailReminderLoading, setEmailReminderLoading] = useState<{ [key: string]: boolean }>({});

  // Security Gate
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      router.push('/login');
      return;
    }

    try {
      const parsed = JSON.parse(storedUser);
      if (parsed.role !== 'ADMIN') {
        router.push('/dashboard');
        return;
      }
      setAdminUser(parsed);
      setBlogForm(prev => ({ ...prev, author: parsed.full_name }));
    } catch (e) {
      router.push('/login');
    }
  }, []);

  // Fetch Admin Data
  const loadAdminData = async () => {
    if (!adminUser) return;

    try {
      const data = await analyticsApi.getDashboard();
      setMetrics(data);
    } catch (e) {
      // Setup mock metrics for sandbox preview
      setMetrics({
        totalUsers: 140,
        totalRegistrations: 382,
        activeWebinars: 4,
        totalWebinars: 8,
        blogStatistics: 12
      });
    }

    try {
      const regAnalytics = await analyticsApi.getRegistrations();
      setWebinarWiseRegs(regAnalytics.webinarWise || []);
      setMonthlyRegs(regAnalytics.monthlyRegistrations || []);
      setAttendanceReport(regAnalytics.attendanceReport || { attended: 0, registered: 0, cancelled: 0, total: 0 });
    } catch (e) {
      // Mock analytics
      setWebinarWiseRegs([
        { id: '1', title: 'Advanced Threat Hunting', count: 38, seats: 50 },
        { id: '2', title: 'Securing Cloud Architectures', count: 52, seats: 100 },
        { id: '3', title: 'AI in Cyber Defense', count: 70, seats: 75 },
      ]);
      setMonthlyRegs([
        { month: 'Apr 2026', count: 85 },
        { month: 'May 2026', count: 120 },
        { month: 'Jun 2026', count: 177 }
      ]);
      setAttendanceReport({ attended: 120, registered: 240, cancelled: 22, total: 382 });
    }

    try {
      const users = await authApi.getUsers();
      setUsersList(users);
    } catch (e) {
      setUsersList([
        { id: 'u1', full_name: 'John Doe', email: 'john.doe@example.com', phone: '+9876543210', organization: 'CyberDefend', created_at: new Date().toISOString(), _count: { registrations: 2 } },
        { id: 'u2', full_name: 'Jane Smith', email: 'jane.smith@example.com', phone: '+123456789', organization: 'CloudSolutions', created_at: new Date().toISOString(), _count: { registrations: 1 } }
      ]);
    }

    try {
      const webinars = await webinarApi.getAll();
      setWebinarsList(webinars);
    } catch (e) {
      setWebinarsList([
        { id: '1', title: 'Advanced Threat Hunting and Incident Response', speaker: 'Dr. Aris Thorne', date: new Date().toISOString(), time: '15:00', duration: '120 mins', seats: 50, category: 'Cybersecurity' }
      ]);
    }

    try {
      const blogs = await blogApi.getAll();
      setBlogsList(blogs);
    } catch (e) {
      setBlogsList([
        { id: 'b1', title: 'The Rise of Ransomware in 2026', category: 'Cybersecurity', author: 'Xenelasia Intel', created_at: new Date().toISOString() }
      ]);
    }

    try {
      const regs = await registrationApi.getAll();
      setRegistrationsList(regs);
    } catch (e) {
      setRegistrationsList([
        { id: 'r1', registration_id: 'REG-TH-382', webinar_pass: 'PASS-TH-1234', user: { full_name: 'John Doe', email: 'john.doe@example.com' }, webinar: { title: 'Advanced Threat Hunting' }, status: 'REGISTERED', created_at: new Date().toISOString() }
      ]);
    }
  };

  useEffect(() => {
    if (adminUser) {
      loadAdminData();
    }
  }, [adminUser]);

  // Webinar CRUD Handler
  const handleWebinarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    try {
      if (isWebinarEditMode) {
        await webinarApi.update(webinarForm.id, webinarForm);
        setFormSuccess('Webinar updated successfully!');
      } else {
        await webinarApi.create(webinarForm);
        setFormSuccess('Webinar created successfully!');
      }
      
      // Reset form
      setWebinarForm({
        id: '',
        title: '',
        description: '',
        speaker: '',
        date: '',
        time: '',
        duration: '',
        seats: 50,
        category: 'Cybersecurity',
        image: ''
      });
      setIsWebinarEditMode(false);
      setShowWebinarForm(false);
      loadAdminData();
      
      setTimeout(() => setFormSuccess(''), 5000);
    } catch (err: any) {
      setFormError(err.message || 'Webinar operation failed');
    }
  };

  const handleEditWebinarClick = (webinar: any) => {
    setWebinarForm({
      id: webinar.id,
      title: webinar.title,
      description: webinar.description,
      speaker: webinar.speaker,
      date: webinar.date.split('T')[0],
      time: webinar.time,
      duration: webinar.duration,
      seats: webinar.seats,
      category: webinar.category,
      image: webinar.image || ''
    });
    setIsWebinarEditMode(true);
    setShowWebinarForm(true);
  };

  const handleDeleteWebinar = async (id: string) => {
    if (!confirm('Are you sure you want to delete this webinar? This will also remove all associated registrations.')) return;
    try {
      await webinarApi.delete(id);
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete webinar');
    }
  };

  // Blog CRUD Handler
  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    try {
      if (isBlogEditMode) {
        await blogApi.update(blogForm.id, blogForm);
        setFormSuccess('Blog post updated successfully!');
      } else {
        await blogApi.create(blogForm);
        setFormSuccess('Blog post created successfully!');
      }
      
      setBlogForm({
        id: '',
        title: '',
        content: '',
        category: 'Cybersecurity',
        author: adminUser?.full_name || 'Xenelasia Advisor',
        image: ''
      });
      setIsBlogEditMode(false);
      setShowBlogForm(false);
      loadAdminData();

      setTimeout(() => setFormSuccess(''), 5000);
    } catch (err: any) {
      setFormError(err.message || 'Blog operation failed');
    }
  };

  const handleEditBlogClick = (blog: any) => {
    setBlogForm({
      id: blog.id,
      title: blog.title,
      content: blog.content,
      category: blog.category,
      author: blog.author,
      image: blog.image || ''
    });
    setIsBlogEditMode(true);
    setShowBlogForm(true);
  };

  const handleDeleteBlog = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    try {
      await blogApi.delete(id);
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete blog post');
    }
  };

  // Check-In Attendee QR status
  const handleCheckIn = async (registrationId: string, currentStatus: string) => {
    // If not ATTENDED, change to ATTENDED, else change to REGISTERED
    const targetStatus = currentStatus === 'ATTENDED' ? 'REGISTERED' : 'ATTENDED';
    try {
      await registrationApi.updateStatus(registrationId, targetStatus);
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Status update failed');
    }
  };

  // Email Announcements
  const handleBroadcastAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementForm.subject || !announcementForm.message || emailBroadcastLoading) return;
    
    setEmailBroadcastLoading(true);
    setFormError('');
    setFormSuccess('');

    try {
      const response = await emailApi.broadcast(announcementForm);
      setFormSuccess(response.message || 'Announcement broadcast completed successfully!');
      setAnnouncementForm({ subject: '', message: '' });
      setTimeout(() => setFormSuccess(''), 5000);
    } catch (err: any) {
      setFormError(err.message || 'Announcement broadcast failed');
    } finally {
      setEmailBroadcastLoading(false);
    }
  };

  // Email Reminders
  const handleSendReminder = async (webinarId: string) => {
    setEmailReminderLoading(prev => ({ ...prev, [webinarId]: true }));
    setFormError('');
    setFormSuccess('');

    try {
      const response = await emailApi.sendReminder(webinarId);
      setFormSuccess(response.message || 'Reminders sent successfully!');
      setTimeout(() => setFormSuccess(''), 5000);
    } catch (err: any) {
      setFormError(err.message || 'Failed to send reminders');
    } finally {
      setEmailReminderLoading(prev => ({ ...prev, [webinarId]: false }));
    }
  };

  const filteredUsers = usersList.filter(user => 
    user.full_name.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.organization.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredRegistrations = registrationsList.filter(reg => 
    reg.user.full_name.toLowerCase().includes(webinarSearch.toLowerCase()) ||
    reg.webinar.title.toLowerCase().includes(webinarSearch.toLowerCase()) ||
    reg.registration_id.toLowerCase().includes(webinarSearch.toLowerCase())
  );

  if (!adminUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-neon-blue animate-spin" />
      </div>
    );
  }

  return (
    <>
      <ThreeBackground />
      <Navbar />

      <div className="min-h-[85vh] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <Shield className="text-neon-purple h-6 w-6 animate-pulse" />
              Secure Admin Control Board
            </h1>
            <p className="text-xs text-slate-400 mt-1">Configure webinars, monitor attendance check-ins, send email triggers, and audit registrations</p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowWebinarForm(true);
                setIsWebinarEditMode(false);
                setWebinarForm({
                  id: '',
                  title: '',
                  description: '',
                  speaker: '',
                  date: '',
                  time: '',
                  duration: '',
                  seats: 50,
                  category: 'Cybersecurity',
                  image: ''
                });
              }}
              className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-4 py-2.5 text-xs font-semibold shadow-md shadow-blue-600/10 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              New Webinar
            </button>
            <button
              onClick={() => {
                setShowBlogForm(true);
                setIsBlogEditMode(false);
                setBlogForm({
                  id: '',
                  title: '',
                  content: '',
                  category: 'Cybersecurity',
                  author: adminUser?.full_name || 'Xenelasia Advisor',
                  image: ''
                });
              }}
              className="flex items-center gap-1 border border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10 text-purple-300 rounded-xl px-4 py-2.5 text-xs font-semibold cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              New Blog Intel
            </button>
          </div>
        </div>

        {/* Global form feedbacks */}
        {formSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-600/15 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            <span>{formSuccess}</span>
          </div>
        )}
        {formError && (
          <div className="mb-6 p-4 rounded-xl bg-red-600/15 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>{formError}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 mb-8 overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'analytics' 
                ? 'border-blue-500 text-white bg-blue-500/5' 
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            Analytics Graphs
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'users' 
                ? 'border-blue-500 text-white bg-blue-500/5' 
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Users className="h-4 w-4" />
            User Management
          </button>
          <button
            onClick={() => setActiveTab('webinars')}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'webinars' 
                ? 'border-blue-500 text-white bg-blue-500/5' 
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="h-4 w-4" />
            Webinar CRUD
          </button>
          <button
            onClick={() => setActiveTab('blogs')}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'blogs' 
                ? 'border-blue-500 text-white bg-blue-500/5' 
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            Blog CRUD
          </button>
          <button
            onClick={() => setActiveTab('emails')}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'emails' 
                ? 'border-blue-500 text-white bg-blue-500/5' 
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Mail className="h-4 w-4" />
            Email Management
          </button>
        </div>

        {/* Tab Body */}
        <div className="glass-card rounded-3xl p-6 border border-white/10 min-h-[450px]">
          
          {/* Analytics tab */}
          {activeTab === 'analytics' && (
            <div>
              {/* Metrics row */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                <div className="bg-slate-900/60 border border-white/5 p-4 rounded-2xl">
                  <span className="block text-[10px] uppercase text-slate-500 font-mono">Total Users</span>
                  <span className="text-xl sm:text-2xl font-bold text-white mt-1 block">{metrics.totalUsers}</span>
                </div>
                <div className="bg-slate-900/60 border border-white/5 p-4 rounded-2xl">
                  <span className="block text-[10px] uppercase text-slate-500 font-mono">Registrations</span>
                  <span className="text-xl sm:text-2xl font-bold text-white mt-1 block text-blue-400">{metrics.totalRegistrations}</span>
                </div>
                <div className="bg-slate-900/60 border border-white/5 p-4 rounded-2xl">
                  <span className="block text-[10px] uppercase text-slate-500 font-mono">Active webinars</span>
                  <span className="text-xl sm:text-2xl font-bold text-white mt-1 block text-emerald-400">{metrics.activeWebinars}</span>
                </div>
                <div className="bg-slate-900/60 border border-white/5 p-4 rounded-2xl">
                  <span className="block text-[10px] uppercase text-slate-500 font-mono">Total Webinars</span>
                  <span className="text-xl sm:text-2xl font-bold text-white mt-1 block">{metrics.totalWebinars}</span>
                </div>
                <div className="bg-slate-900/60 border border-white/5 p-4 rounded-2xl col-span-2 md:col-span-1">
                  <span className="block text-[10px] uppercase text-slate-500 font-mono">Blog Statistics</span>
                  <span className="text-xl sm:text-2xl font-bold text-white mt-1 block text-purple-400">{metrics.blogStatistics}</span>
                </div>
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Seat occupancies */}
                <div className="bg-slate-900/30 border border-white/5 p-6 rounded-2xl">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-300">Webinar Registration stats</h3>
                    <button className="flex items-center gap-1 text-[10px] text-blue-400 hover:underline"><Download className="h-3 w-3" /> Export PDF</button>
                  </div>
                  <div className="space-y-4">
                    {webinarWiseRegs.map(w => {
                      const pct = Math.min(100, Math.round((w.count / w.seats) * 100));
                      return (
                        <div key={w.id} className="text-xs">
                          <div className="flex justify-between text-slate-300 mb-1">
                            <span className="font-semibold truncate max-w-[70%]">{w.title}</span>
                            <span>{w.count} / {w.seats} seats ({pct}%)</span>
                          </div>
                          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-white/5">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full" 
                              style={{ width: `${pct}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Attendance ratios */}
                <div className="bg-slate-900/30 border border-white/5 p-6 rounded-2xl flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-300 mb-6">Attendance & Check-in Report</h3>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs mt-4">
                      <div className="bg-emerald-950/20 border border-emerald-500/20 p-3 rounded-xl">
                        <span className="text-emerald-400 font-bold block text-lg">{attendanceReport.attended}</span>
                        <span className="text-[9px] text-slate-500">Attended</span>
                      </div>
                      <div className="bg-blue-950/20 border border-blue-500/20 p-3 rounded-xl">
                        <span className="text-blue-400 font-bold block text-lg">{attendanceReport.registered}</span>
                        <span className="text-[9px] text-slate-500">Registered</span>
                      </div>
                      <div className="bg-red-950/20 border border-red-500/20 p-3 rounded-xl">
                        <span className="text-red-400 font-bold block text-lg">{attendanceReport.cancelled}</span>
                        <span className="text-[9px] text-slate-500">Cancelled</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-[10px] text-slate-500 mt-6 pt-4 border-t border-white/5 flex justify-between items-center font-mono">
                    <span>TOTAL RECORDED: {attendanceReport.total} registrations</span>
                    <span>Active Audit Mode</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div>
              <div className="flex justify-between items-center mb-6 gap-4">
                <h3 className="text-sm font-bold text-white">Registered Users</h3>
                <div className="relative w-64 shrink-0">
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search users..."
                    className="w-full bg-slate-900 border border-white/10 text-xs rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:border-blue-500 text-white placeholder-slate-500"
                  />
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 font-mono uppercase text-[9px] tracking-wider bg-slate-900/40">
                      <th className="py-3 px-4">User Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Phone</th>
                      <th className="py-3 px-4">Organization</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Joined Webinars</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user.id} className="border-b border-white/5 hover:bg-slate-900/20">
                        <td className="py-3.5 px-4 font-semibold text-white">{user.full_name}</td>
                        <td className="py-3.5 px-4 text-slate-300">{user.email}</td>
                        <td className="py-3.5 px-4 text-slate-300">{user.phone}</td>
                        <td className="py-3.5 px-4 text-slate-400 font-mono text-[10px]">{user.organization}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            user.role === 'ADMIN' ? 'bg-purple-500/15 text-purple-400 border border-purple-500/20' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center text-blue-400 font-bold">{user._count?.registrations || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Webinars CRUD Tab */}
          {activeTab === 'webinars' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold text-white">Manage Webinars & Check-ins</h3>
                <div className="relative w-64 shrink-0">
                  <input
                    type="text"
                    value={webinarSearch}
                    onChange={(e) => setWebinarSearch(e.target.value)}
                    placeholder="Search registrations..."
                    className="w-full bg-slate-900 border border-white/10 text-xs rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:border-blue-500 text-white placeholder-slate-500"
                  />
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
                </div>
              </div>

              {/* Registered Webinars List */}
              <div className="mb-10">
                <h4 className="text-xs uppercase font-mono tracking-widest text-slate-400 mb-4 border-l-2 border-blue-500 pl-2">Active Webinars</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {webinarsList.map(webinar => (
                    <div key={webinar.id} className="rounded-xl border border-white/5 bg-slate-900/30 p-4 flex justify-between items-start gap-4">
                      <div>
                        <span className="text-[9px] font-mono text-blue-400 uppercase tracking-widest">{webinar.category}</span>
                        <h5 className="text-sm font-bold text-white mt-1 leading-snug">{webinar.title}</h5>
                        <p className="text-[10px] text-slate-400 mt-1">Speaker: {webinar.speaker}</p>
                        <span className="text-[9px] font-mono text-slate-500 block mt-2">
                          Scheduled: {new Date(webinar.date).toLocaleDateString()} @ {webinar.time}
                        </span>
                      </div>
                      
                      <div className="flex gap-1.5 shrink-0">
                        <button
                          onClick={() => handleEditWebinarClick(webinar)}
                          className="h-8 w-8 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-center text-slate-400 hover:text-blue-400 transition-colors cursor-pointer"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteWebinar(webinar.id)}
                          className="h-8 w-8 rounded-lg bg-slate-900 border border-red-500/10 flex items-center justify-center text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Attendee Registrations Tracker */}
              <div>
                <h4 className="text-xs uppercase font-mono tracking-widest text-slate-400 mb-4 border-l-2 border-purple-500 pl-2">
                  Attendee Entry & Status Updates
                </h4>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-400 font-mono uppercase text-[9px] tracking-wider bg-slate-900/40">
                        <th className="py-3 px-4">Attendee</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Webinar Target</th>
                        <th className="py-3 px-4">Registration ID</th>
                        <th className="py-3 px-4">Pass Code</th>
                        <th className="py-3 px-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRegistrations.map(reg => (
                        <tr key={reg.id} className="border-b border-white/5 hover:bg-slate-900/20">
                          <td className="py-3.5 px-4 font-semibold text-white">{reg.user.full_name}</td>
                          <td className="py-3.5 px-4 text-slate-300">{reg.user.email}</td>
                          <td className="py-3.5 px-4 text-slate-300 font-medium truncate max-w-[180px]">{reg.webinar.title}</td>
                          <td className="py-3.5 px-4 text-red-400 font-mono">{reg.registration_id}</td>
                          <td className="py-3.5 px-4 text-cyan-400 font-mono">{reg.webinar_pass}</td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => handleCheckIn(reg.id, reg.status)}
                              className={`rounded-lg px-2.5 py-1 text-[9px] font-bold border transition-colors cursor-pointer ${
                                reg.status === 'ATTENDED'
                                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                                  : reg.status === 'CANCELLED'
                                    ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
                                    : 'bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20'
                              }`}
                            >
                              {reg.status === 'ATTENDED' ? 'Attended (Cert Issued)' : 'Registered (Check In)'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* Blogs CRUD Tab */}
          {activeTab === 'blogs' && (
            <div>
              <h3 className="text-sm font-bold text-white mb-6">Manage Threat Intelligence Blogs</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {blogsList.map(blog => (
                  <div key={blog.id} className="rounded-xl border border-white/5 bg-slate-900/30 p-4 flex justify-between items-start gap-4">
                    <div>
                      <span className="text-[9px] font-mono text-purple-400 uppercase tracking-widest">{blog.category}</span>
                      <h5 className="text-sm font-bold text-white mt-1 leading-snug">{blog.title}</h5>
                      <span className="text-[9px] font-mono text-slate-500 block mt-2">
                        Published by {blog.author} on {new Date(blog.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => handleEditBlogClick(blog)}
                        className="h-8 w-8 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-center text-slate-400 hover:text-blue-400 transition-colors cursor-pointer"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteBlog(blog.id)}
                        className="h-8 w-8 rounded-lg bg-slate-900 border border-red-500/10 flex items-center justify-center text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Emails Tab */}
          {activeTab === 'emails' && (
            <div>
              <h3 className="text-sm font-bold text-white mb-6">Automated Broadcasts & Reminders</h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Announcement broadcaster */}
                <div className="bg-slate-900/30 border border-white/5 p-6 rounded-2xl relative">
                  <div className="absolute top-0 right-0 h-32 w-32 bg-blue-500/5 blur-2xl rounded-full"></div>
                  <h4 className="text-xs font-bold font-mono uppercase text-slate-300 mb-4 flex items-center gap-1.5">
                    <Send className="h-4 w-4 text-neon-blue" />
                    General Broadcast (All Users)
                  </h4>
                  <form onSubmit={handleBroadcastAnnouncement} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Email Subject</label>
                      <input
                        type="text"
                        required
                        value={announcementForm.subject}
                        onChange={(e) => setAnnouncementForm({ ...announcementForm, subject: e.target.value })}
                        className="w-full bg-slate-900 border border-white/10 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 text-white placeholder-slate-600"
                        placeholder="Welcome announcements / System schedules"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Message Body</label>
                      <textarea
                        required
                        rows={6}
                        value={announcementForm.message}
                        onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
                        className="w-full bg-slate-900 border border-white/10 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 text-white placeholder-slate-600 resize-none"
                        placeholder="Write announcement body here..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={emailBroadcastLoading}
                      className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-2.5 text-xs font-semibold text-white hover:from-blue-500 hover:to-purple-500 transition-all shadow-md shadow-blue-600/10 cursor-pointer flex items-center justify-center gap-1.5 h-10"
                    >
                      {emailBroadcastLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending emails...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Send Announcement
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Webinar reminders */}
                <div className="bg-slate-900/30 border border-white/5 p-6 rounded-2xl">
                  <h4 className="text-xs font-bold font-mono uppercase text-slate-300 mb-4 flex items-center gap-1.5">
                    <Bell className="h-4 w-4 text-neon-purple" />
                    Webinar Reminders (Targeted)
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-normal mb-4">
                    Select an upcoming webinar below to dispatch automated joining instruction reminders to all registered participants of that session.
                  </p>

                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {webinarsList.map(webinar => {
                      const isReminderLoading = emailReminderLoading[webinar.id] || false;
                      return (
                        <div key={webinar.id} className="rounded-xl border border-white/5 bg-slate-950 p-4 flex justify-between items-center gap-4">
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-white truncate">{webinar.title}</h5>
                            <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">
                              Date: {new Date(webinar.date).toLocaleDateString()}
                            </span>
                          </div>

                          <button
                            onClick={() => handleSendReminder(webinar.id)}
                            disabled={isReminderLoading}
                            className="shrink-0 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:bg-slate-900 disabled:text-slate-600 py-1.5 px-3 text-[10px] font-semibold text-white transition-all cursor-pointer flex items-center gap-1"
                          >
                            {isReminderLoading ? (
                              <>
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Triggering...
                              </>
                            ) : (
                              <>
                                <Bell className="h-3.5 w-3.5" />
                                Send Reminder
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

      </div>

      {/* Webinar Form Modal */}
      {showWebinarForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-950 p-6 flex flex-col shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowWebinarForm(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="absolute top-0 right-0 h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-6">
              {isWebinarEditMode ? 'Modify Webinar Settings' : 'Create Cybersecurity Webinar'}
            </h3>

            <form onSubmit={handleWebinarSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Webinar Title</label>
                <input
                  type="text"
                  required
                  value={webinarForm.title}
                  onChange={(e) => setWebinarForm({ ...webinarForm, title: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 text-white"
                  placeholder="e.g. Advanced Threat Hunting"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Description Details</label>
                <textarea
                  required
                  rows={3}
                  value={webinarForm.description}
                  onChange={(e) => setWebinarForm({ ...webinarForm, description: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 text-white resize-none"
                  placeholder="Outline topics covered..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Speaker / Host Name</label>
                  <input
                    type="text"
                    required
                    value={webinarForm.speaker}
                    onChange={(e) => setWebinarForm({ ...webinarForm, speaker: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 text-white"
                    placeholder="Dr. Aris Thorne"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Category Domain</label>
                  <select
                    value={webinarForm.category}
                    onChange={(e) => setWebinarForm({ ...webinarForm, category: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 text-white"
                  >
                    <option value="Cybersecurity">Cybersecurity</option>
                    <option value="Cloud Security">Cloud Security</option>
                    <option value="Artificial Intelligence">Artificial Intelligence</option>
                    <option value="Consulting">Consulting</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Date Scheduled</label>
                  <input
                    type="date"
                    required
                    value={webinarForm.date}
                    onChange={(e) => setWebinarForm({ ...webinarForm, date: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 text-white h-10"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Time (24h format)</label>
                  <input
                    type="text"
                    required
                    value={webinarForm.time}
                    onChange={(e) => setWebinarForm({ ...webinarForm, time: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 text-white"
                    placeholder="15:00"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Duration text</label>
                  <input
                    type="text"
                    required
                    value={webinarForm.duration}
                    onChange={(e) => setWebinarForm({ ...webinarForm, duration: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 text-white"
                    placeholder="90 mins"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Seat Capacity limit</label>
                  <input
                    type="number"
                    required
                    value={webinarForm.seats}
                    onChange={(e) => setWebinarForm({ ...webinarForm, seats: parseInt(e.target.value) })}
                    className="w-full bg-slate-900 border border-white/10 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Image Banner URL</label>
                  <input
                    type="text"
                    value={webinarForm.image}
                    onChange={(e) => setWebinarForm({ ...webinarForm, image: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 text-white"
                    placeholder="https://unsplash.com/..."
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 py-3 text-xs font-semibold text-white transition-all shadow-md shadow-blue-600/10 cursor-pointer mt-4"
              >
                {isWebinarEditMode ? 'Apply Updates' : 'Publish Webinar'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Blog Form Modal */}
      {showBlogForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-950 p-6 flex flex-col shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowBlogForm(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="absolute top-0 right-0 h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-6">
              {isBlogEditMode ? 'Modify Blog settings' : 'Write Threat Intel Blog'}
            </h3>

            <form onSubmit={handleBlogSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Blog Title</label>
                <input
                  type="text"
                  required
                  value={blogForm.title}
                  onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 text-white"
                  placeholder="e.g. The RaaS affiliate networks of 2026"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Category Domain</label>
                <select
                  value={blogForm.category}
                  onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 text-white"
                >
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="Cloud Security">Cloud Security</option>
                  <option value="Artificial Intelligence">Artificial Intelligence</option>
                  <option value="Consulting">Consulting</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Header Image URL</label>
                <input
                  type="text"
                  value={blogForm.image}
                  onChange={(e) => setBlogForm({ ...blogForm, image: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 text-white"
                  placeholder="https://unsplash.com/..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Intel Content (Full markdown/text)</label>
                <textarea
                  required
                  rows={8}
                  value={blogForm.content}
                  onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 text-white resize-none font-mono text-[11px]"
                  placeholder="Draft intel article content here..."
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-purple-600 hover:bg-purple-500 py-3 text-xs font-semibold text-white transition-all shadow-md shadow-purple-600/10 cursor-pointer mt-4"
              >
                {isBlogEditMode ? 'Apply Updates' : 'Publish Intel Article'}
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
