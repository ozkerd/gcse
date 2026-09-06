'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Award, Sparkles, TrendingUp, Calendar, AlertCircle, ArrowRight, CheckCircle, RefreshCw } from 'lucide-react';
import { AdaptiveEngine } from '@/lib/adaptive/engine';

export default function Dashboard() {
  const [targetGrade, setTargetGrade] = useState<number>(9);
  const [estimatedGrade, setEstimatedGrade] = useState<number>(6.5);
  const [streakDays, setStreakDays] = useState<number>(4);

  const mockMasteries = [
    { topicId: 'm-alg-1', masteryScore: 78.0, totalAttempted: 18, totalCorrect: 14, lastAttemptAt: '2026-09-05' },
    { topicId: 'm-alg-2', masteryScore: 42.0, totalAttempted: 10, totalCorrect: 4, lastAttemptAt: '2026-09-04' },
    { topicId: 'p-eng-1', masteryScore: 85.0, totalAttempted: 12, totalCorrect: 10, lastAttemptAt: '2026-09-06' },
    { topicId: 'cs-sys-1', masteryScore: 90.0, totalAttempted: 15, totalCorrect: 14, lastAttemptAt: '2026-09-06' },
  ];

  const recommendedTopics = AdaptiveEngine.getRecommendedTopics('maths', mockMasteries, targetGrade);

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Öğrenci Paneli & İlerleme Takibi</h1>
          <p className="text-slate-500 text-sm">Günlük hedeflerinizi görün, eksik konularınızı tespit edin ve Grade 9’a ulaşın.</p>
        </div>

        {/* Target Grade Selector */}
        <div className="flex items-center gap-4 bg-indigo-50/80 border border-indigo-100 p-3 rounded-xl">
          <Award className="w-6 h-6 text-indigo-600" />
          <div>
            <label className="block text-[11px] font-bold text-indigo-900 uppercase tracking-wider">Hedef GCSE Grade</label>
            <select
              value={targetGrade}
              onChange={(e) => setTargetGrade(Number(e.target.value))}
              className="bg-white border border-indigo-200 text-indigo-950 font-bold text-sm rounded-lg px-2.5 py-1 focus:ring-2 focus:ring-indigo-500"
            >
              {[4, 5, 6, 7, 8, 9].map(g => (
                <option key={g} value={g}>Grade {g} (A* Level)</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tahmini Mevcut Seviye</span>
            <TrendingUp className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">Grade {estimatedGrade}</div>
          <p className="text-xs text-indigo-600 font-semibold mt-2">Hedef Grade {targetGrade}'e 2.5 Grade kaldı</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Çalışma Seri (Streak)</span>
            <Sparkles className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{streakDays} Gün 🔥</div>
          <p className="text-xs text-slate-500 mt-2">Harika gidiyorsun! Seriyi bozma.</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bugün Çözülen Soru</span>
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">12 / 15</div>
          <p className="text-xs text-emerald-600 font-semibold mt-2">Günlük hedefin %80'i tamamlandı</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">GCSE Sınavına Kalan</span>
            <Calendar className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">248 Gün</div>
          <p className="text-xs text-slate-500 mt-2">Mayıs/Haziran 2027 Dönemi</p>
        </div>

      </div>

      {/* Recommended Focus Area & Weakness Alert */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Left: Recommended Practice */}
        <div className="lg:col-span-2 bg-gradient-to-br from-indigo-900 to-purple-950 text-white rounded-2xl p-6 shadow-lg border border-indigo-800">
          <div className="flex items-center gap-2 text-yellow-300 font-bold text-xs uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4" />
            AI Adaptif Öneri
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Bugün En Çok Odaklanmanız Gereken Konu</h2>
          <p className="text-slate-300 text-sm mb-6">
            Son çözdüğünüz sorulardaki hata analizi: <strong>Simultaneous Equations</strong> konusunda ustalık skorunuz %42. Bu konuyu Grade {targetGrade} seviyesine getirmek için özel soru seti oluşturuldu.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/practice?topic=m-alg-2"
              className="inline-flex items-center gap-2 bg-white text-indigo-900 hover:bg-slate-100 font-bold px-5 py-3 rounded-xl text-sm transition-all shadow-md"
            >
              <span>Odaklı Alıştırmayı Başlat</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/diagnostic"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-5 py-3 rounded-xl text-sm transition-all border border-white/20"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Yeniden Seviye Tesbiti Yap</span>
            </Link>
          </div>
        </div>

        {/* Right: Weakness Radar */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              Tespit Edilen Eksik Konular
            </h3>
            
            <div className="space-y-3">
              {recommendedTopics.map((rec, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-1">
                    <span>{rec.topicId === 'm-alg-2' ? 'Simultaneous Equations' : 'Surds & Indices'}</span>
                    <span className="text-amber-600">Öncelik High</span>
                  </div>
                  <p className="text-[11px] text-slate-500">{rec.reason}</p>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/topics"
            className="mt-4 text-center py-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            Tüm Konu Ağacını İncele →
          </Link>
        </div>

      </div>

    </div>
  );
}
