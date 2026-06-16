'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { 
  User as UserIcon, Calendar, Award, Bell, Shield, Phone, 
  Briefcase, Mail, Key, Download, ExternalLink, Clock, Trash2, 
  CheckCircle, Loader2, LogOut, Ticket, X
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
const ThreeBackground = dynamic(() => import('../../components/ThreeBackground'), { ssr: false });
import { authApi, registrationApi, certificateApi, notificationApi } from '../../utils/api';

// Countdown Timer Component
function WebinarCountdown({ targetDate, targetTime }: { targetDate: string; targetTime: string }) {
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const calculateTime = () => {
      const targetStr = `${targetDate.split('T')[0]}T${targetTime}:00`;
      const difference = +new Date(targetStr) - +new Date();
      
      if (difference <= 0) {
        setTimeLeft(null);
        // If within 2 hours after start, count as live
        if (difference > -2 * 60 * 60 * 1000) {
          setIsLive(true);
        } else {
          setIsLive(false);
        }
        return;
      }

      setTimeLeft({
        d: Math.floor(difference / (1000 * 60 * 60 * 24)),
        h: Math.floor((difference / (1000 * 60 * 60)) % 24),
        m: Math.floor((difference / 1000 / 60) % 60),
        s: Math.floor((difference / 1000) % 60)
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate, targetTime]);

  if (isLive) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/30 animate-pulse">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
        Webinar is LIVE
      </span>
    );
  }

  if (!timeLeft) {
    return <span className="text-slate-500 text-xs font-mono">Ended / Past Session</span>;
  }

  return (
    <div className="flex gap-2 text-center text-xs font-mono bg-blue-500/5 border border-blue-500/20 rounded-lg p-2 max-w-xs justify-center text-blue-300">
      <div>
        <span className="block text-sm font-bold">{timeLeft.d}</span>
        <span className="text-[9px] uppercase text-slate-400">Days</span>
      </div>
      <span>:</span>
      <div>
        <span className="block text-sm font-bold">{timeLeft.h}</span>
        <span className="text-[9px] uppercase text-slate-400">Hrs</span>
      </div>
      <span>:</span>
      <div>
        <span className="block text-sm font-bold">{timeLeft.m}</span>
        <span className="text-[9px] uppercase text-slate-400">Mins</span>
      </div>
      <span>:</span>
      <div>
        <span className="block text-sm font-bold">{timeLeft.s}</span>
        <span className="text-[9px] uppercase text-slate-400">Secs</span>
      </div>
    </div>
  );
}

export default function UserDashboard() {
  const router = useRouter();

  // Navigation State
  const [activeTab, setActiveTab] = useState<'webinars' | 'profile' | 'certificates' | 'notifications'>('webinars');
  const [user, setUser] = useState<any>(null);
  
  // Data States
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  
  // Profile Update Form
  const [profileForm, setProfileForm] = useState({ full_name: '', phone: '', organization: '', password: '' });
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  
  // Selected Card for Modals
  const [selectedPass, setSelectedPass] = useState<any>(null);
  const [selectedCert, setSelectedCert] = useState<any>(null);

  // Authentication Lock
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      router.push('/login');
      return;
    }

    try {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      setProfileForm({
        full_name: parsed.full_name,
        phone: parsed.phone,
        organization: parsed.organization,
        password: ''
      });
    } catch (e) {
      router.push('/login');
    }
  }, []);

  // Fetch Dashboard Tab Data
  const loadDashboardData = async () => {
    if (!user) return;
    
    try {
      const regs = await registrationApi.getMy();
      setRegistrations(regs);
    } catch (e) {
      console.error('Failed to load registrations', e);
    }

    try {
      const certs = await certificateApi.getMy();
      setCertificates(certs);
    } catch (e) {
      console.error('Failed to load certificates', e);
    }

    try {
      const notifs = await notificationApi.getMy();
      setNotifications(notifs);
    } catch (e) {
      console.error('Failed to load notifications', e);
    }
  };

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  // Profile Update Submission
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileSuccess(false);

    try {
      const data: any = {
        full_name: profileForm.full_name,
        phone: profileForm.phone,
        organization: profileForm.organization
      };
      if (profileForm.password) data.password = profileForm.password;

      const response = await authApi.updateProfile(data);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
      
      setProfileForm(prev => ({ ...prev, password: '' }));
      setProfileSuccess(true);
      window.dispatchEvent(new Event('auth-state-change'));
      setTimeout(() => setProfileSuccess(false), 5000);
    } catch (err) {
      console.error('Profile update failed:', err);
    } finally {
      setProfileLoading(false);
    }
  };

  // Dismiss notification
  const handleDeleteNotification = async (id: string) => {
    try {
      await notificationApi.delete(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('auth-state-change'));
    router.push('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-neon-blue animate-spin" />
      </div>
    );
  }

  return (
    <>
      <ThreeBackground />
      
      {/* Hide elements when browser print executes */}
      <div className="no-print">
        <Navbar />
      </div>

      <div className="min-h-[85vh] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Navigation */}
        <div className="w-full lg:w-64 shrink-0 no-print">
          <div className="glass-card rounded-2xl p-6 border border-white/10 flex flex-col gap-6">
            
            {/* Short Profile */}
            <div className="text-center pb-6 border-b border-white/5">
              <div className="mx-auto h-16 w-16 rounded-full bg-blue-500/10 border border-blue-500/35 flex items-center justify-center mb-3">
                <UserIcon className="h-7 w-7 text-neon-blue" />
              </div>
              <h2 className="text-sm font-bold text-white leading-snug">{user.full_name}</h2>
              <p className="text-[10px] text-slate-500 mt-1 font-mono uppercase tracking-wider">{user.organization}</p>
            </div>

            {/* Menu Links */}
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => setActiveTab('webinars')}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'webinars' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <Calendar className="h-4 w-4" />
                My Webinars
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'profile' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <UserIcon className="h-4 w-4" />
                My Profile
              </button>
              <button
                onClick={() => setActiveTab('certificates')}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'certificates' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <Award className="h-4 w-4" />
                Certificates
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer relative ${
                  activeTab === 'notifications' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <Bell className="h-4 w-4" />
                Notifications
                {notifications.length > 0 && (
                  <span className="absolute right-4 top-3.5 h-2 w-2 rounded-full bg-red-400 animate-ping"></span>
                )}
              </button>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/5 transition-all cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>

          </div>
        </div>

        {/* Tab Body */}
        <div className="flex-1 min-w-0 no-print">
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 min-h-[500px]">
            
            {/* Webinars Tab */}
            {activeTab === 'webinars' && (
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  My Registered Sessions
                </h2>
                <p className="text-xs text-slate-400 mt-1">Browse passes, entry tickets, live countdowns, and join livestreams</p>
                <div className="h-px bg-white/5 my-6"></div>

                {registrations.length === 0 ? (
                  <div className="text-center py-16 text-xs text-slate-500 font-mono">
                    You haven't registered for any webinars yet. Navigate to the{' '}
                    <Link href="/#webinars" className="text-neon-blue hover:underline">
                      Landing Page
                    </Link>{' '}
                    to save a seat!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {registrations.map((reg) => {
                      const webinar = reg.webinar;
                      const dateObj = new Date(webinar.date);
                      return (
                        <div 
                          key={reg.id}
                          className="rounded-2xl border border-white/10 bg-slate-900/40 p-5 flex flex-col md:flex-row gap-5 justify-between items-start md:items-center hover:border-blue-500/30 transition-all"
                        >
                          <div className="flex-1">
                            <span className="rounded-md bg-blue-500/10 border border-blue-500/35 px-2 py-0.5 text-[9px] font-mono tracking-widest text-blue-300 uppercase">
                              {webinar.category}
                            </span>
                            <h3 className="text-base font-bold text-white mt-2 leading-snug">{webinar.title}</h3>
                            <p className="text-xs text-slate-400 mt-1">Presented by: {webinar.speaker}</p>
                            
                            <div className="flex flex-wrap gap-4 mt-4 text-[11px] text-slate-300">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5 text-slate-500" />
                                <span>{dateObj.toDateString()} at {webinar.time}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5 text-slate-500" />
                                <span>{webinar.duration}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-3 w-full md:w-auto shrink-0 md:items-end">
                            {/* Countdown component */}
                            <WebinarCountdown targetDate={webinar.date} targetTime={webinar.time} />

                            <div className="flex gap-2 w-full mt-2 md:mt-0">
                              <button
                                onClick={() => setSelectedPass(reg)}
                                className="flex-1 md:flex-none flex items-center justify-center gap-1.5 rounded-xl border border-white/10 hover:border-blue-500/40 bg-slate-900 py-2 px-3.5 text-xs font-semibold text-white hover:bg-slate-800 transition-all cursor-pointer"
                              >
                                <Ticket className="h-3.5 w-3.5" />
                                View Pass
                              </button>
                              
                              <button
                                disabled={reg.status !== 'REGISTERED'} // If Attended or Cancelled, lock join link
                                className="flex-1 md:flex-none flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-900 disabled:text-slate-600 py-2 px-3.5 text-xs font-semibold text-white transition-all cursor-pointer"
                              >
                                Join Webinar
                                <ExternalLink className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-xl font-bold text-white">My Security Profile</h2>
                <p className="text-xs text-slate-400 mt-1">Manage personal details, registered organization name, and password credentials</p>
                <div className="h-px bg-white/5 my-6"></div>

                {profileSuccess && (
                  <div className="mb-6 p-4 rounded-xl bg-emerald-600/15 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Profile settings updated successfully!</span>
                  </div>
                )}

                <form onSubmit={handleProfileUpdate} className="space-y-6 max-w-xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Full Name</label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={profileForm.full_name}
                          onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                          className="w-full bg-slate-900/60 border border-white/10 text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-blue-500 text-white"
                        />
                        <UserIcon className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Email Address</label>
                      <div className="relative">
                        <input
                          type="email"
                          disabled
                          value={user.email}
                          className="w-full bg-slate-950/60 border border-white/5 text-slate-500 text-xs rounded-xl pl-9 pr-3 py-2.5 cursor-not-allowed select-none"
                        />
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-600" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Mobile Number</label>
                      <div className="relative">
                        <input
                          type="tel"
                          required
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          className="w-full bg-slate-900/60 border border-white/10 text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-blue-500 text-white"
                        />
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Organization</label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={profileForm.organization}
                          onChange={(e) => setProfileForm({ ...profileForm, organization: e.target.value })}
                          className="w-full bg-slate-900/60 border border-white/10 text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-blue-500 text-white"
                        />
                        <Briefcase className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-white/5 my-4"></div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                      Update Password <span className="text-slate-500 lowercase">(leave blank to keep current)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={profileForm.password}
                        onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                        className="w-full bg-slate-900/60 border border-white/10 text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-blue-500 text-white placeholder-slate-600"
                        placeholder="Enter new 8+ character password"
                        minLength={8}
                      />
                      <Key className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2.5 text-xs font-semibold text-white hover:from-blue-500 hover:to-purple-500 transition-all shadow-md shadow-blue-600/10 cursor-pointer h-10 min-w-36 flex items-center justify-center gap-1.5"
                  >
                    {profileLoading ? (
                      <>
                        <Loader2 className="h-4.5 w-4.5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Certificates Tab */}
            {activeTab === 'certificates' && (
              <div>
                <h2 className="text-xl font-bold text-white">Certificates of Completion</h2>
                <p className="text-xs text-slate-400 mt-1">Unlock and download certified credentials once your attendance is confirmed by our administrators</p>
                <div className="h-px bg-white/5 my-6"></div>

                {certificates.length === 0 ? (
                  <div className="text-center py-16 text-xs text-slate-500 font-mono">
                    No completion certificates found. Attend registered webinars to unlock official certifications.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {certificates.map((cert) => (
                      <div 
                        key={cert.id}
                        className="rounded-2xl border border-white/10 bg-slate-900/40 p-5 flex items-center gap-4 hover:border-purple-500/30 transition-all"
                      >
                        <div className="h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-neon-purple shrink-0">
                          <Award className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xs font-bold text-white truncate leading-snug">{cert.webinar.title}</h3>
                          <p className="text-[10px] text-slate-400 mt-0.5">Speaker: {cert.webinar.speaker}</p>
                          <p className="text-[9px] text-slate-500 mt-1 font-mono">Issued: {new Date(cert.issued_at).toLocaleDateString()}</p>
                        </div>
                        <button
                          onClick={() => setSelectedCert(cert)}
                          className="shrink-0 h-9 w-9 rounded-lg border border-white/10 hover:border-purple-500/30 flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-xl font-bold text-white">Recent Security Logs & Notifications</h2>
                <p className="text-xs text-slate-400 mt-1">Alert logs including check-ins, registration confirmations, and admin announcements</p>
                <div className="h-px bg-white/5 my-6"></div>

                {notifications.length === 0 ? (
                  <div className="text-center py-16 text-xs text-slate-500 font-mono">
                    Clear database. No logs or notifications are currently pending.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notif) => (
                      <div 
                        key={notif.id}
                        className="rounded-xl border border-white/5 bg-slate-900/30 px-4 py-3.5 flex items-start gap-3 justify-between hover:bg-slate-900/50 transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <div className="h-7 w-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mt-0.5">
                            <Shield className="h-3.5 w-3.5 text-neon-blue" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-300 leading-normal">{notif.message}</p>
                            <span className="text-[9px] text-slate-500 mt-1 block font-mono">
                              {new Date(notif.created_at).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteNotification(notif.id)}
                          className="text-slate-500 hover:text-red-400 p-1 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

      </div>

      {/* Ticket Pass Modal */}
      {selectedPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-slate-950 p-6 flex flex-col items-center select-none shadow-2xl relative overflow-hidden print-card">
            
            {/* Holograph mesh lines */}
            <div className="absolute top-0 right-0 h-32 w-32 bg-blue-500/5 blur-2xl rounded-full"></div>
            
            <button
              onClick={() => setSelectedPass(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white no-print cursor-pointer"
            >
              <X className="absolute top-0 right-0 h-5 w-5" />
            </button>

            {/* Ticket Graphic Header */}
            <div className="text-center mb-6">
              <span className="text-[9px] font-mono tracking-widest text-slate-500 uppercase">
                Xenelasia Webinar Entry Pass
              </span>
              <h3 className="text-lg font-extrabold text-white mt-1">Secure Ticket</h3>
            </div>

            {/* QR Frame */}
            <div className="bg-white p-3 rounded-2xl shadow-xl shadow-blue-500/5 mb-6">
              <img 
                src={selectedPass.qr_code} 
                alt="Webinar Pass QR Code"
                className="w-44 h-44 object-contain select-none"
              />
            </div>

            {/* Pass Metadata details */}
            <div className="w-full space-y-3 text-[11px] text-slate-300 font-mono border-t border-b border-white/10 py-4 mb-6">
              <div>
                <span className="text-slate-500 block uppercase text-[9px] tracking-wide">Webinar Topic</span>
                <span className="text-white font-bold leading-tight line-clamp-2">{selectedPass.webinar.title}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 block uppercase text-[9px] tracking-wide">Date & Time</span>
                  <span className="text-white">{new Date(selectedPass.webinar.date).toLocaleDateString()} @ {selectedPass.webinar.time}</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase text-[9px] tracking-wide">Attendee</span>
                  <span className="text-white truncate block">{user.full_name}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 block uppercase text-[9px] tracking-wide">Registration ID</span>
                  <span className="text-red-400 font-semibold">{selectedPass.registration_id}</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase text-[9px] tracking-wide">Pass Code</span>
                  <span className="text-neon-blue font-semibold">{selectedPass.webinar_pass}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 py-2.5 text-xs font-semibold text-white transition-all shadow-md shadow-blue-600/10 no-print cursor-pointer"
            >
              Print / Save Pass (PDF)
            </button>
          </div>
        </div>
      )}

      {/* Completion Certificate Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-3xl border border-white/15 bg-slate-950 p-8 flex flex-col items-center shadow-2xl relative overflow-hidden print-card">
            
            {/* Header backdrop glowing blur */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent pointer-events-none"></div>

            <button
              onClick={() => setSelectedCert(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white no-print cursor-pointer"
            >
              <X className="absolute top-0 right-0 h-5 w-5" />
            </button>

            {/* Certificate Frame layout */}
            <div className="w-full border-2 border-double border-purple-500/30 p-8 rounded-2xl flex flex-col items-center text-center relative select-none">
              
              {/* Floating Shield Logo */}
              <div className="h-14 w-14 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-neon-purple mb-4">
                <Shield className="h-7 w-7" />
              </div>

              <span className="text-[10px] tracking-[4px] uppercase font-mono text-purple-300 font-bold mb-2">
                Xenelasia Consultancy LLP
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-semibold text-white italic tracking-wider">
                Certificate of Completion
              </h2>
              <p className="text-[10px] text-slate-400 font-mono mt-1">VERIFIED SECURITY CREDENTIAL</p>
              
              <div className="h-[1px] w-40 bg-gradient-to-r from-transparent via-purple-500/40 to-transparent my-6"></div>

              <span className="text-xs text-slate-400">This certifies that</span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight my-2 font-sans">
                {user.full_name}
              </h3>
              <span className="text-xs text-slate-400">representing <strong className="text-slate-300">{user.organization}</strong> has successfully completed</span>
              
              <h4 className="text-base sm:text-lg font-bold text-neon-blue leading-snug mt-3">
                "{selectedCert.webinar.title}"
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Instruction delivered by {selectedCert.webinar.speaker}
              </p>

              <div className="grid grid-cols-2 gap-8 w-full mt-10 pt-6 border-t border-white/5 text-[10px] text-slate-400 font-mono">
                <div className="text-left pl-6">
                  <span className="block text-[8px] uppercase text-slate-500">Date of Issue</span>
                  <span className="text-white font-bold">{new Date(selectedCert.issued_at).toLocaleDateString()}</span>
                </div>
                <div className="text-right pr-6">
                  <span className="block text-[8px] uppercase text-slate-500">Security Hash ID</span>
                  <span className="text-red-400 uppercase font-bold">{selectedCert.id.substring(0, 18)}</span>
                </div>
              </div>

            </div>

            <button
              onClick={() => window.print()}
              className="mt-6 rounded-xl bg-purple-600 hover:bg-purple-500 py-3 px-8 text-xs font-semibold text-white transition-all shadow-md shadow-purple-600/10 no-print cursor-pointer"
            >
              Print / Save Certificate
            </button>
          </div>
        </div>
      )}

      <div className="no-print">
        <Footer />
      </div>
    </>
  );
}
