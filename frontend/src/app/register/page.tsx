'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Shield, Key, Mail, User, Phone, Briefcase, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { authApi } from '../../utils/api';
const ThreeBackground = dynamic(() => import('../../components/ThreeBackground'), { ssr: false });

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectAction = searchParams.get('redirect');
  const webinarId = searchParams.get('webinar');

  // Fields state
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    organization: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await authApi.register(formData);
      setSuccessMsg('Registration successful! Welcome email has been dispatched. Redirecting to login...');
      
      // Redirect to login after 3 seconds, carrying redirect queries
      setTimeout(() => {
        let path = '/login';
        if (redirectAction === 'register' && webinarId) {
          path += `?redirect=register&webinar=${webinarId}`;
        }
        router.push(path);
      }, 3000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to create account. Please check inputs and try again.');
      setIsLoading(false);
    }
  };

  return (
    <>
      <ThreeBackground />
      
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-md">
          
          {/* Back link */}
          <Link 
            href="/" 
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-6 no-print"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          {/* Form Card */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="glass-card rounded-3xl p-8 border border-white/10 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 h-40 w-40 bg-purple-500/5 blur-3xl rounded-full"></div>
            
            {/* Header */}
            <div className="text-center mb-6">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/30 mb-4">
                <Shield className="h-6 w-6 text-neon-purple animate-pulse" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Create Professional Account</h1>
              <p className="text-xs text-slate-400 mt-1">Register to join webinars and receive completion certs</p>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="mb-4 p-3 bg-red-950/40 border border-red-500/20 rounded-xl flex items-start gap-2 text-xs text-red-400 animate-shake">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Success Message */}
            {successMsg && (
              <div className="mb-4 p-3 bg-emerald-950/40 border border-emerald-500/20 rounded-xl flex items-start gap-2 text-xs text-emerald-400">
                <Shield className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Form */}
            {!successMsg && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Full Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full bg-slate-900/80 border border-white/10 text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-purple-500 text-white placeholder-slate-600"
                      placeholder="Jane Doe"
                    />
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-900/80 border border-white/10 text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-purple-500 text-white placeholder-slate-600"
                      placeholder="jane@organization.com"
                    />
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Mobile Number</label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-slate-900/80 border border-white/10 text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-purple-500 text-white placeholder-slate-600"
                      placeholder="+91 98765 43210"
                    />
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Organization Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      className="w-full bg-slate-900/80 border border-white/10 text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-purple-500 text-white placeholder-slate-600"
                      placeholder="TechDefend Corp"
                    />
                    <Briefcase className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Secure Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-slate-900/80 border border-white/10 text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-purple-500 text-white placeholder-slate-600"
                      placeholder="Minimum 8 characters"
                      minLength={8}
                    />
                    <Key className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-3.5 text-xs font-semibold text-white hover:from-blue-500 hover:to-purple-500 transition-all shadow-md shadow-blue-600/10 cursor-pointer flex items-center justify-center gap-2 h-11"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating Identity...
                    </>
                  ) : (
                    'Register Account'
                  )}
                </button>
              </form>
            )}

            {/* Footer Links */}
            <div className="text-center mt-6 pt-6 border-t border-white/5 text-xs text-slate-400">
              Already have an account?{' '}
              <Link 
                href={webinarId ? `/login?redirect=register&webinar=${webinarId}` : '/login'}
                className="text-neon-purple hover:underline font-medium"
              >
                Sign In Instead
              </Link>
            </div>

          </motion.div>
        </div>
      </div>
    </>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}
