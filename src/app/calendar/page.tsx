'use client';

import React from 'react';
import { Calendar as CalendarIcon, Flame, ChevronRight } from 'lucide-react';

export default function CalendarPage() {
  const schedule = [
    { date: 'Bugün (6 Eylül)', topic: 'Simultaneous Equations (Linear & Non-Linear)', subject: 'GCSE Maths', status: 'In Progress', targetCount: 15, completedCount: 12 },
    { date: 'Yarın (7 Eylül)', topic: 'Specific Heat Capacity & Energy Transfers', subject: 'GCSE Physics', status: 'Scheduled', targetCount: 15, completedCount: 0 },
    { date: 'Pazartesi (8 Eylül)', topic: 'CPU Registers & Fetch-Decode-Execute', subject: 'GCSE Computer Science', status: 'Scheduled', targetCount: 15, completedCount: 0 },
    { date: 'Salı (9 Eylül)', topic: 'Atomic Structure & Periodic Table', subject: 'GCSE Chemistry', status: 'Scheduled', targetCount: 20, completedCount: 0 },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Günlük Çalışma & Tekrar Takvimi</h1>
          <p className="text-slate-500 text-sm">Disiplinli GCSE hazırlığı için kişiselleştirilmiş revizyon takviminiz.</p>
        </div>

        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl text-amber-900 font-bold text-sm">
          <Flame className="w-5 h-5 text-amber-500" />
          <span>4 Günlük Çalışma Serisi</span>
        </div>
      </div>

      {/* Calendar Timeline */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-indigo-600" />
          Gelecek 7 Günlük Revizyon Programı
        </h2>

        <div className="space-y-4">
          {schedule.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-indigo-300 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold text-xs">{item.subject}</span>
                  <span className="text-xs text-slate-400 font-medium">{item.date}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-base">{item.topic}</h3>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-700">{item.completedCount} / {item.targetCount} Soru</div>
                  <div className="text-[11px] text-slate-400">{item.status}</div>
                </div>

                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
