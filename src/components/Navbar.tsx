'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Brain, LayoutDashboard, Target, Calendar, BookOpen, Sparkles, Award, Users, FileText, UserCheck, LogIn } from 'lucide-react';
import { UserStore, UserSession } from '@/lib/user-store';
import { AuthModal } from '@/components/AuthModal';

export const Navbar = () => {
  const pathname = usePathname();
  const [session, setSession] = useState<UserSession>({
    role: 'guest',
    name: 'Guest Student',
    email: 'guest@primerllm.com',
    targetGrade: 9,
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    setSession(UserStore.getSession());

    const handleUpdate = () => {
      setSession(UserStore.getSession());
    };

    window.addEventListener('gcse_user_updated', handleUpdate);
    return () => window.removeEventListener('gcse_user_updated', handleUpdate);
  }, []);

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/diagnostic', label: 'Diagnostic Test', icon: Target },
    { href: '/practice', label: 'AI Question Engine', icon: Sparkles },
    { href: '/mock-exam', label: 'Mock Exams', icon: FileText },
    { href: '/topics', label: 'Topic Matrix', icon: BookOpen },
    { href: '/calendar', label: 'Study Schedule', icon: Calendar },
    { href: '/parent', label: 'Parent Portal', icon: Users },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-slate-900 text-lg leading-none">
                <span>gcse</span>
                <span className="text-indigo-600 font-extrabold">.primerllm.com</span>
              </div>
              <span className="text-[11px] font-medium text-slate-500 tracking-wide uppercase">AI Adaptive GCSE Platform</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-bold shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Account & Target Grade Badge */}
          <div className="flex items-center gap-3">
            {/* Target Grade Badge */}
            <div className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 px-3 py-1.5 rounded-full">
              <Award className="w-4 h-4 text-purple-600" />
              <div className="text-xs">
                <span className="text-slate-500 font-medium">Target: </span>
                <span className="font-extrabold text-purple-700">Grade {session.targetGrade}</span>
              </div>
            </div>

            {/* Auth / Account Switcher Button */}
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              {session.role === 'guest' ? (
                <>
                  <LogIn className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Guest Mode</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="max-w-[100px] truncate">{session.name}</span>
                </>
              )}
            </button>
          </div>

        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentSession={session}
      />
    </>
  );
};

