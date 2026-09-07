'use client';

import React, { useState } from 'react';
import { X, User, Users, Shield, CheckCircle2, Mail, Bell } from 'lucide-react';
import { UserStore, UserSession } from '@/lib/user-store';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSession: UserSession;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, currentSession }) => {
  const [activeTab, setActiveTab] = useState<'student' | 'parent'>('student');
  const [studentName, setStudentName] = useState(currentSession.role === 'student' ? currentSession.name : '');
  const [studentEmail, setStudentEmail] = useState(currentSession.role === 'student' ? currentSession.email : '');
  const [studentParentEmail, setStudentParentEmail] = useState(currentSession.parentEmail || '');
  const [studentReminders, setStudentReminders] = useState(currentSession.emailReminders !== false);

  const [parentName, setParentName] = useState(currentSession.role === 'parent' ? currentSession.name : '');
  const [parentEmail, setParentEmail] = useState(currentSession.role === 'parent' ? currentSession.email : '');
  const [childName, setChildName] = useState(currentSession.studentName || '');
  const [parentReports, setParentReports] = useState(currentSession.parentProgressReports !== false);

  if (!isOpen) return null;

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    UserStore.loginAsStudent(studentName, studentEmail, studentReminders, studentParentEmail);
    onClose();
  };

  const handleParentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    UserStore.loginAsParent(parentName, parentEmail, childName, parentReports);
    onClose();
  };

  const handleContinueAsGuest = () => {
    UserStore.logout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-3">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Portal Account Sign In</h2>
          <p className="text-xs text-slate-500">Sign in to save your learning progress or continue seamlessly as a Guest.</p>
        </div>

        {/* Account Role Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('student')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'student' ? 'bg-white text-indigo-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Student Portal</span>
          </button>

          <button
            onClick={() => setActiveTab('parent')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'parent' ? 'bg-white text-indigo-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Parent Portal</span>
          </button>
        </div>

        {/* Student Login Form */}
        {activeTab === 'student' && (
          <form onSubmit={handleStudentLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Student Full Name</label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="e.g. Alex Morgan"
                required
                className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address</label>
              <input
                type="email"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                placeholder="student@example.com"
                required
                className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Parent Email (Optional for Progress Reports)</label>
              <input
                type="email"
                value={studentParentEmail}
                onChange={(e) => setStudentParentEmail(e.target.value)}
                placeholder="parent@example.com"
                className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Email Preferences Checkbox */}
            <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-indigo-950 font-semibold">
                <input
                  type="checkbox"
                  checked={studentReminders}
                  onChange={(e) => setStudentReminders(e.target.checked)}
                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span>
                  Receive daily revision reminders, streak alerts, and 100% topic mastery awards via email from <strong className="text-indigo-700">noreply@btpsec.com</strong>
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-500/20 transition-all"
            >
              Sign In as Student
            </button>
          </form>
        )}

        {/* Parent Login Form */}
        {activeTab === 'parent' && (
          <form onSubmit={handleParentLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Parent Full Name</label>
              <input
                type="text"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="e.g. Sarah Morgan"
                required
                className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Parent Email Address</label>
              <input
                type="email"
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
                placeholder="parent@example.com"
                required
                className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Student's Name</label>
              <input
                type="text"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder="e.g. Alex Morgan"
                required
                className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Parent Email Preferences Checkbox */}
            <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-xl space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-purple-950 font-semibold">
                <input
                  type="checkbox"
                  checked={parentReports}
                  onChange={(e) => setParentReports(e.target.checked)}
                  className="mt-0.5 rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                />
                <span>
                  Receive weekly progress analysis, topic 100% mastery alerts, and achievements for my child from <strong className="text-purple-700">noreply@btpsec.com</strong>
                </span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-500/20 transition-all"
            >
              Sign In as Parent
            </button>
          </form>
        )}

        {/* Guest Fallback Action */}
        <div className="pt-3 border-t border-slate-100 text-center">
          <button
            onClick={handleContinueAsGuest}
            className="text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors inline-flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Continue as Guest (No login required - progress saved via cookies)</span>
          </button>
        </div>

      </div>
    </div>
  );
};

