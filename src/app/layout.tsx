import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'gcse.primerllm.com - AI Adaptive GCSE Learning Platform',
  description: 'Intelligent GCSE Revision, Diagnostic Testing, Target Grade Tracking & Adaptive Question Engine',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 flex flex-col min-h-screen antialiased">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="border-t border-slate-200 bg-white py-6 mt-12">
          <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
            <p>© 2026 primerllm.com — <span className="font-semibold text-slate-700">gcse.primerllm.com</span> AI Adaptive Learning Engine</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
