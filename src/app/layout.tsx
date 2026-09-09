import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { MasteryBadgeModal } from '@/components/MasteryBadgeModal';
import { AnalyticsTracker } from '@/components/AnalyticsTracker';

export const metadata: Metadata = {
  title: 'gcse mate - AI Adaptive GCSE Learning Platform',
  description: 'Intelligent GCSE Revision, Diagnostic Testing, Target Grade Tracking & Adaptive Question Engine',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col min-h-screen antialiased transition-colors">
        <AnalyticsTracker />
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <MasteryBadgeModal />
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 mt-12 transition-colors">
          <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500 dark:text-slate-400">
            <p>© 2026 <span className="font-semibold text-slate-700 dark:text-slate-300">gcse mate</span> — AI Adaptive Learning Platform</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
