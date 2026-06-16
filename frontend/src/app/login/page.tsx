'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Shield, Key, Mail, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { authApi, registrationApi } from '../../utils/api';
const ThreeBackground = dynamic(() => import('../../components/ThreeBackground'), { ssr: false });

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const redirectAction = searchParams.get('redirect');
  const webinarId = searchParams.get('webinar');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || isLoading) return;

    setIsLoading(true);
    setErrorMsg('');

    try {
      const response = await authApi.login({ email, password });
      
      // Store token and user details in localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Broadcast state update to Navbar
      window.dispatchEvent(new Event('auth-state-change'));

      // If user came from webinar register click, auto-register them
      if (redirectAction === 'register' && webinarId) {
        try {
          await registrationApi.register(webinarId);
          router.push('/dashboard?message=registration-success');
          return;
        } catch (regErr) {
          // If auto registration fails, just send them to dashboard
          console.error('Auto webinar registration failed:', regErr);
        }
      }

      // Default redirect based on role
      if (response.user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Invalid email or password. Please try again.');
    } finally {
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
            <div className="absolute top-0 right-0 h-40 w-40 bg-blue-500/5 blur-3xl rounded-full"></div>
            
            {/* Header */}
            <div className="text-center mb-8">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/30 mb-4">
                <Shield className="h-6 w-6 text-neon-blue" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Access Secure Portal</h1>
              <p className="text-xs text-slate-400 mt-1">Sign in with your credentials to manage registrations</p>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="mb-4 p-3 bg-red-950/40 border border-red-500/20 rounded-xl flex items-start gap-2 text-xs text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900/80 border border-white/10 text-xs rounded-xl pl-9 pr-3 py-3 focus:outline-none focus:border-blue-500 text-white placeholder-slate-600"
                    placeholder="name@company.com"
                  />
                  <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">Password</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-900/80 border border-white/10 text-xs rounded-xl pl-9 pr-3 py-3 focus:outline-none focus:border-blue-500 text-white placeholder-slate-600"
                    placeholder="Enter security password"
                  />
                  <Key className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
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
                    Verifying Credentials...
                  </>
                ) : (
                  'Login to Account'
                )}
              </button>
            </form>

            {/* Footer Links */}
            <div className="text-center mt-6 pt-6 border-t border-white/5 text-xs text-slate-400">
              Don't have an account?{' '}
              <Link 
                href={webinarId ? `/register?redirect=register&webinar=${webinarId}` : '/register'}
                className="text-neon-cyan hover:underline font-medium"
              >
                Create Free Account
              </Link>
            </div>

          </motion.div>
        </div>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
