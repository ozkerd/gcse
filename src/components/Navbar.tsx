'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Brain, LayoutDashboard, Target, Calendar, BookOpen, Sparkles, Award, Users, FileText } from 'lucide-react';

export const Navbar = () => {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/diagnostic', label: 'Seviye Tesbiti', icon: Target },
    { href: '/practice', label: 'Akıllı Soru Motoru', icon: Sparkles },
    { href: '/mock-exam', label: 'Mock Sınavlar', icon: FileText },
    { href: '/topics', label: 'Konu Matrisi', icon: BookOpen },
    { href: '/calendar', label: 'Çalışma Takvimi', icon: Calendar },
    { href: '/parent', label: 'Veli Portalı', icon: Users },
  ];

  return (
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
        <nav className="hidden md:flex items-center gap-1">
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

        {/* Target Grade Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 px-3 py-1.5 rounded-full">
            <Award className="w-4 h-4 text-purple-600" />
            <div className="text-xs">
              <span className="text-slate-500 font-medium">Target: </span>
              <span className="font-extrabold text-purple-700">Grade 9</span>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
};
