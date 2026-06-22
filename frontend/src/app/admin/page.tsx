'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Cpu, Network, Calendar, Clock, User, Users, 
  Lock, LogIn, Plus, Trash2, ArrowLeft, CheckCircle2, AlertCircle, Sparkles, Image as ImageIcon
} from 'lucide-react';

const PRESET_IMAGES: Record<string, string> = {
  'Cybersecurity': 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=600',
  'Cloud Security': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=600',
  'Artificial Intelligence': 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=600',
  'Consulting': 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&q=80&w=600'
};

export default function AdminPage() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');

  // Dashboard Data State
  const [webinars, setWebinars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form State
  const [form, setForm] = useState({
    title: '',
    description: '',
    speaker: '',
    date: '',
    time: '',
    duration: '90 mins',
    seats: 100,
    category: 'Cybersecurity',
    image: PRESET_IMAGES['Cybersecurity']
  });
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Expansion state for registration lists
  const [expandedWebinars, setExpandedWebinars] = useState<Record<string, boolean>>({});

  const toggleWebinarExpansion = (id: string) => {
    setExpandedWebinars(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Authenticate using Session Storage to avoid re-logging on page refresh in same session
  useEffect(() => {
    const sessionAuth = sessionStorage.getItem('admin_authenticated');
    if (sessionAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch Webinars once authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchWebinars();
    }
  }, [isAuthenticated]);

  const fetchWebinars = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/webinars');
      if (res.ok) {
        const data = await res.json();
        setWebinars(data);
        setError('');
      } else {
        setError('Failed to fetch webinars from server.');
      }
    } catch (err) {
      console.error(err);
      setError('Could not connect to the backend server. Make sure server is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === 'admin123') {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_authenticated', 'true');
      setAuthError('');
    } else {
      setAuthError('Access Denied. Incorrect passcode.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_authenticated');
    setPasscode('');
  };

  const handleCategoryChange = (cat: string) => {
    setForm(prev => ({
      ...prev,
      category: cat,
      // Auto-set the preset image matching the category to make it simple
      image: PRESET_IMAGES[cat] || prev.image
    }));
  };

  const handleCreateWebinar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    setFormSuccess(false);

    try {
      const res = await fetch('http://localhost:5000/api/webinars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          seats: Number(form.seats),
          remainingSeats: Number(form.seats)
        })
      });

      if (res.ok) {
        setFormSuccess(true);
        setForm({
          title: '',
          description: '',
          speaker: '',
          date: '',
          time: '',
          duration: '90 mins',
          seats: 100,
          category: 'Cybersecurity',
          image: PRESET_IMAGES['Cybersecurity']
        });
        fetchWebinars();
        setTimeout(() => setFormSuccess(false), 5000);
      } else {
        const data = await res.json();
        setFormError(data.error || 'Failed to create webinar.');
      }
    } catch (err) {
      console.error(err);
      setFormError('Failed to send request. Server might be offline.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteWebinar = async (id: string) => {
    if (!confirm('Are you sure you want to delete this webinar?')) return;

    try {
      const res = await fetch(`http://localhost:5000/api/webinars/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setWebinars(prev => prev.filter(w => w.id !== id));
      } else {
        alert('Failed to delete webinar from server.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete. Check backend connection.');
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white font-sans selection:bg-neon-blue/30 relative overflow-hidden flex flex-col justify-between">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[350px] bg-gradient-to-b from-blue-600/10 via-transparent to-transparent blur-[120px] pointer-events-none" />

      {/* HEADER BAR */}
      <header className="border-b border-white/5 bg-slate-950/60 backdrop-blur-md relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-neon-blue animate-pulse" />
            <span className="font-bold text-white tracking-wider font-mono text-sm uppercase">Xenelasia Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 py-1 px-3 rounded-lg hover:bg-white/5">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Landing Page
            </Link>
            {isAuthenticated && (
              <button 
                onClick={handleLogout}
                className="text-xs bg-white/5 hover:bg-red-500/10 text-slate-300 hover:text-red-400 border border-white/10 hover:border-red-500/20 py-1 px-3 rounded-lg transition-all cursor-pointer"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full relative z-10 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {!isAuthenticated ? (
            /* LOCK SCREEN GATE */
            <motion.div
              key="lockscreen"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-md"
            >
              <div className="glass-card rounded-3xl p-8 border border-white/10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-neon-blue via-neon-purple to-neon-cyan" />
                
                <div className="flex flex-col items-center text-center">
                  <div className="h-16 w-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-neon-blue mb-6 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                    <Lock className="h-8 w-8" />
                  </div>
                  
                  <h1 className="text-xl font-bold text-white tracking-tight uppercase">Admin Authentication</h1>
                  <p className="mt-2 text-xs text-slate-400 max-w-xs leading-relaxed">
                    Access requires the administrator passcode. Webinars are securely stored in the SQL database.
                  </p>
                </div>

                <form onSubmit={handleLogin} className="mt-8 space-y-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-2">Passcode</label>
                    <input 
                      type="password"
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-900/60 border border-white/10 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue text-white placeholder-slate-600 text-center tracking-widest"
                      required
                    />
                  </div>

                  {authError && (
                    <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/5 border border-red-500/10 rounded-xl p-3">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{authError}</span>
                    </div>
                  )}

                  <button 
                    type="submit"
                    className="w-full rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple py-3 text-xs font-bold text-white hover:opacity-90 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] cursor-pointer"
                  >
                    <LogIn className="h-4 w-4" /> Verify &amp; Unlock
                  </button>
                </form>
              </div>
            </motion.div>
          ) : (
            /* ADMIN DASHBOARD */
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start align-top"
            >
              
              {/* LEFT COLUMN: CREATE WEBINAR */}
              <div className="lg:col-span-5">
                <div className="glass-card rounded-3xl p-6 border border-white/10 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-neon-blue to-neon-purple" />
                  
                  <div className="flex items-center gap-2 mb-6">
                    <Sparkles className="h-5 w-5 text-neon-blue" />
                    <h2 className="text-lg font-bold text-white tracking-tight uppercase">Schedule Webinar</h2>
                  </div>

                  <form onSubmit={handleCreateWebinar} className="space-y-4 text-xs">
                    {/* Title */}
                    <div>
                      <label className="block font-mono uppercase tracking-widest text-slate-400 mb-1.5">Webinar Title</label>
                      <input 
                        type="text"
                        value={form.title}
                        onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g. Memory Forensics &amp; Malware Audits"
                        className="w-full bg-slate-900 border border-white/5 rounded-xl px-4.5 py-2.5 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue text-white"
                        required
                      />
                    </div>

                    {/* Speaker */}
                    <div>
                      <label className="block font-mono uppercase tracking-widest text-slate-400 mb-1.5">Speaker / Expert</label>
                      <input 
                        type="text"
                        value={form.speaker}
                        onChange={(e) => setForm(prev => ({ ...prev, speaker: e.target.value }))}
                        placeholder="e.g. Dr. Aris Thorne"
                        className="w-full bg-slate-900 border border-white/5 rounded-xl px-4.5 py-2.5 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue text-white"
                        required
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block font-mono uppercase tracking-widest text-slate-400 mb-1.5">Category</label>
                      <select 
                        value={form.category}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className="w-full bg-slate-900 border border-white/5 rounded-xl px-4.5 py-2.5 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue text-white cursor-pointer"
                      >
                        <option value="Cybersecurity">Cybersecurity</option>
                        <option value="Cloud Security">Cloud Security</option>
                        <option value="Artificial Intelligence">Artificial Intelligence</option>
                        <option value="Consulting">Consulting</option>
                      </select>
                    </div>

                    {/* Grid of DateTime */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-mono uppercase tracking-widest text-slate-400 mb-1.5">Date</label>
                        <input 
                          type="date"
                          value={form.date}
                          onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
                          className="w-full bg-slate-900 border border-white/5 rounded-xl px-4.5 py-2.5 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue text-white cursor-pointer"
                          required
                        />
                      </div>
                      <div>
                        <label className="block font-mono uppercase tracking-widest text-slate-400 mb-1.5">Start Time</label>
                        <input 
                          type="time"
                          value={form.time}
                          onChange={(e) => setForm(prev => ({ ...prev, time: e.target.value }))}
                          className="w-full bg-slate-900 border border-white/5 rounded-xl px-4.5 py-2.5 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue text-white cursor-pointer"
                          required
                        />
                      </div>
                    </div>

                    {/* Duration & Seats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-mono uppercase tracking-widest text-slate-400 mb-1.5">Duration</label>
                        <input 
                          type="text"
                          value={form.duration}
                          onChange={(e) => setForm(prev => ({ ...prev, duration: e.target.value }))}
                          placeholder="e.g. 120 mins"
                          className="w-full bg-slate-900 border border-white/5 rounded-xl px-4.5 py-2.5 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue text-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block font-mono uppercase tracking-widest text-slate-400 mb-1.5">Seats Limit</label>
                        <input 
                          type="number"
                          value={form.seats}
                          onChange={(e) => setForm(prev => ({ ...prev, seats: Number(e.target.value) }))}
                          min="1"
                          className="w-full bg-slate-900 border border-white/5 rounded-xl px-4.5 py-2.5 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue text-white"
                          required
                        />
                      </div>
                    </div>

                    {/* Image URL */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block font-mono uppercase tracking-widest text-slate-400">Cover Image URL</label>
                        <span className="text-[10px] text-neon-blue flex items-center gap-1"><ImageIcon className="h-3 w-3" /> Auto-assigned preset</span>
                      </div>
                      <input 
                        type="url"
                        value={form.image}
                        onChange={(e) => setForm(prev => ({ ...prev, image: e.target.value }))}
                        className="w-full bg-slate-900 border border-white/5 rounded-xl px-4.5 py-2.5 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue text-white"
                        required
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block font-mono uppercase tracking-widest text-slate-400 mb-1.5">Description</label>
                      <textarea 
                        value={form.description}
                        onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Provide a description of the topics covered in the webinar..."
                        rows={3}
                        className="w-full bg-slate-900 border border-white/5 rounded-xl px-4.5 py-2.5 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue text-white leading-relaxed resize-none"
                        required
                      />
                    </div>

                    {formError && (
                      <div className="flex items-center gap-2 text-red-400 bg-red-500/5 border border-red-500/10 rounded-xl p-3">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{formError}</span>
                      </div>
                    )}

                    {formSuccess && (
                      <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span>Webinar saved to SQL Database successfully!</span>
                      </div>
                    )}

                    <button 
                      type="submit"
                      disabled={submitting}
                      className="w-full rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple py-3 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Plus className="h-4 w-4" /> {submitting ? 'Connecting...' : 'Save to SQL Database'}
                    </button>
                  </form>
                </div>
              </div>

              {/* RIGHT COLUMN: LIST & MANAGE WEBINARS */}
              <div className="lg:col-span-7 flex flex-col h-full self-stretch justify-start">
                <div className="glass-card rounded-3xl p-6 border border-white/10 shadow-xl flex-1 flex flex-col relative overflow-hidden min-h-[500px]">
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-neon-purple to-neon-cyan" />
                  
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-neon-purple" />
                      <h2 className="text-lg font-bold text-white tracking-tight uppercase">SQL Webinars Database</h2>
                    </div>
                    <span className="text-[10px] font-mono bg-slate-900 border border-white/5 px-2.5 py-1 rounded-full text-slate-400">
                      Total: {webinars.length}
                    </span>
                  </div>

                  {loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs font-mono">
                      <div className="h-6 w-6 border-2 border-neon-purple border-t-transparent rounded-full animate-spin mb-2" />
                      Loading from database...
                    </div>
                  ) : error ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-red-500/10 bg-red-500/5 rounded-2xl">
                      <AlertCircle className="h-8 w-8 text-red-400 mb-2 animate-bounce" />
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Database Connection Error</h3>
                      <p className="mt-2 text-xs text-slate-400 max-w-xs leading-relaxed">
                        {error}
                      </p>
                      <button 
                        onClick={fetchWebinars}
                        className="mt-4 text-xs font-semibold bg-white/5 border border-white/10 hover:bg-white/10 px-4 py-2 rounded-xl transition-all cursor-pointer"
                      >
                        Try Reconnecting
                      </button>
                    </div>
                  ) : webinars.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-white/5 bg-slate-950/20 rounded-2xl text-slate-500">
                      <Calendar className="h-8 w-8 text-slate-600 mb-2" />
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">No Webinars Found</h3>
                      <p className="mt-2 text-[10px] text-slate-500 max-w-xs leading-relaxed">
                        The SQL database is currently empty. Use the scheduler on the left to add upcoming security webinars.
                      </p>
                    </div>
                  ) : (
                    /* LIST WEBINARS */
                    <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1">
                      {webinars.map((webinar) => {
                        const dateObj = new Date(webinar.date);
                        const hasRegistrations = webinar.registrations && webinar.registrations.length > 0;
                        return (
                          <div 
                            key={webinar.id} 
                            className="bg-slate-900/60 border border-white/5 hover:border-white/10 rounded-2xl p-4 flex flex-col gap-4 transition-all animate-fadeIn"
                          >
                            <div className="flex gap-4 items-center justify-between">
                              <img 
                                src={webinar.image} 
                                alt={webinar.title} 
                                className="h-16 w-24 rounded-lg object-cover bg-slate-950 border border-white/5 shrink-0"
                              />
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-neon-blue uppercase border border-blue-500/10">
                                    {webinar.category}
                                  </span>
                                  <span className="text-[9px] text-slate-500 font-mono">
                                    {webinar.id.slice(0, 8)}...
                                  </span>
                                </div>
                                
                                <h3 className="mt-1 text-sm font-bold text-white truncate">
                                  {webinar.title}
                                </h3>
                                
                                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-400">
                                  <span className="flex items-center gap-1">
                                    <User className="h-3 w-3 text-neon-blue" /> {webinar.speaker}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3 text-neon-purple" /> {dateObj.toDateString()} at {webinar.time}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Users className="h-3 w-3 text-slate-500" /> Seats: {webinar.remainingSeats} / {webinar.seats}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => toggleWebinarExpansion(webinar.id)}
                                  className={`text-[10px] font-semibold border px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                                    hasRegistrations
                                      ? 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20 text-neon-blue'
                                      : 'bg-white/5 border-white/10 text-slate-500 cursor-not-allowed'
                                  }`}
                                  disabled={!hasRegistrations}
                                >
                                  {webinar.registrations ? webinar.registrations.length : 0} Registrations
                                </button>
                                
                                <button
                                  onClick={() => handleDeleteWebinar(webinar.id)}
                                  className="h-9 w-9 rounded-lg hover:bg-red-500/10 border border-transparent hover:border-red-500/20 text-slate-500 hover:text-red-400 flex items-center justify-center transition-all cursor-pointer shrink-0"
                                  title="Delete from SQL"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            {/* EXPANDABLE REGISTRATIONS LIST */}
                            {expandedWebinars[webinar.id] && hasRegistrations && (
                              <div className="pt-2 border-t border-white/5 space-y-2">
                                <div className="text-[9px] font-mono uppercase tracking-widest text-slate-500 mb-1">
                                  Registered Attendees List
                                </div>
                                <div className="overflow-hidden border border-white/5 rounded-xl bg-slate-950/40">
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse text-[10px]">
                                      <thead>
                                        <tr className="border-b border-white/5 text-slate-500 font-mono uppercase text-[8px]">
                                          <th className="p-2">Attendee</th>
                                          <th className="p-2">Email</th>
                                          <th className="p-2">Contact No</th>
                                          <th className="p-2 text-right">Date</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-white/5 font-mono text-slate-300">
                                        {webinar.registrations.map((reg: any) => (
                                          <tr key={reg.id} className="hover:bg-white/5 transition-colors">
                                            <td className="p-2 font-sans font-semibold text-white">{reg.name}</td>
                                            <td className="p-2">{reg.email}</td>
                                            <td className="p-2">{reg.phone}</td>
                                            <td className="p-2 text-slate-500 text-right">
                                              {new Date(reg.createdAt).toLocaleDateString()}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FOOTER BAR */}
      <footer className="border-t border-white/5 py-4 text-center text-[10px] text-slate-600">
        <div>Xenelasia Executive Systems &copy; 2026. SQL Database (SQLite) Managed via Prisma ORM.</div>
      </footer>
    </main>
  );
}
