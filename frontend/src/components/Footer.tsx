import Link from 'next/link';
import { Shield, Mail, MapPin, Globe, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-slate-950/80 backdrop-blur-md py-12 px-4 sm:px-6 lg:px-8 z-10 relative">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="md:col-span-1 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <img 
                src="/logo.png" 
                alt="Xenelasia Logo" 
                className="h-8 w-auto object-contain"
              />
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-wider text-white">XENELASIA</span>
                <span className="text-[8px] text-slate-400 tracking-widest uppercase -mt-1">GROUP</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Xenelasia Group is a global multi-service firm delivering high-impact Virtual CFO services, AI-driven automation, and enterprise-grade consulting purpose-built for ambitious SMBs ready to scale without limits.
            </p>
            <div className="flex gap-4 items-center mt-2">
              <a href="#" className="text-slate-400 hover:text-neon-blue transition-colors" aria-label="LinkedIn">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
              </a>
              <a href="#" className="text-slate-400 hover:text-neon-cyan transition-colors" aria-label="Twitter">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors" aria-label="GitHub">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg>
              </a>
              <a href="#" className="text-slate-400 hover:text-neon-purple transition-colors" aria-label="Website"><Globe className="h-4 w-4" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-white uppercase mb-4">Core Services</h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link href="/#services" className="hover:text-neon-blue transition-colors">Virtual CFO &amp; Strategy</Link></li>
              <li><Link href="/#services" className="hover:text-neon-blue transition-colors">AI Automation &amp; Custom LLMs</Link></li>
              <li><Link href="/#services" className="hover:text-neon-blue transition-colors">Cyber Security &amp; GRC Advisory</Link></li>
              <li><Link href="/#services" className="hover:text-neon-blue transition-colors">Digital Marketing &amp; Growth</Link></li>
              <li><Link href="/#services" className="hover:text-neon-blue transition-colors">Website &amp; App Development</Link></li>
              <li><Link href="/#services" className="hover:text-neon-blue transition-colors">Payroll &amp; HR Outsourcing</Link></li>
            </ul>
          </div>

          {/* Quick Nav */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-white uppercase mb-4">Navigation</h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link href="/#about" className="hover:text-neon-cyan transition-colors">About Our Agency</Link></li>
              <li><Link href="/#webinars" className="hover:text-neon-cyan transition-colors">Upcoming Webinars</Link></li>
              <li><Link href="/#blogs" className="hover:text-neon-cyan transition-colors">Industry Blogs</Link></li>
              <li><Link href="/login" className="hover:text-neon-cyan transition-colors">Secure Login Portal</Link></li>
              <li><Link href="/register" className="hover:text-neon-cyan transition-colors">Join Community</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold tracking-wider text-white uppercase">Contact & Offices</h3>
            <div className="flex flex-col gap-3 text-xs text-slate-400">
              <div className="flex gap-2 items-start">
                <MapPin className="h-4 w-4 text-neon-blue shrink-0 mt-0.5" />
                <span>
                  Xenelasia Group,<br/>
                  1908 Iconic Tower, Corenthum,<br/>
                  Sector 62, Noida, UP, India
                </span>
              </div>
              <div className="flex gap-2 items-center">
                <Mail className="h-4 w-4 text-neon-purple shrink-0" />
                <a href="mailto:info@xcplllp.com" className="hover:text-white transition-colors">
                  info@xcplllp.com
                </a>
              </div>
              <div className="flex gap-2 items-center">
                <Phone className="h-4 w-4 text-neon-blue shrink-0" />
                <a href="tel:+918010115618" className="hover:text-white transition-colors">
                  +91 80101 15618
                </a>
              </div>
              <div className="flex gap-2 items-center">
                <Globe className="h-4 w-4 text-neon-purple shrink-0" />
                <a href="https://www.xcplllp.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                  www.xcplllp.com
                </a>
              </div>
            </div>
          </div>

        </div>

        <div className="border-t border-white/10 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-500 gap-4">
          <div>
            &copy; {new Date().getFullYear()} Xenelasia Consultancy LLP. All rights reserved. Registered in India.
          </div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
            <span>&bull;</span>
            <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
            <span>&bull;</span>
            <a href="#" className="hover:text-slate-400 transition-colors">Secured by SSL</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
