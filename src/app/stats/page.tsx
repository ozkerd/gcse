'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Lock,
  Unlock,
  ShieldCheck,
  Users,
  Eye,
  Calendar,
  Smartphone,
  Monitor,
  Tablet,
  RefreshCw,
  Clock,
  Globe,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Activity,
} from 'lucide-react';
import Link from 'next/link';

interface MetricItem {
  label: string;
  count: number;
  percentage: number;
}

interface PageStatItem {
  path: string;
  views: number;
  uniqueVisitors: number;
  percentage: number;
}

interface AnalyticsData {
  today: {
    uniqueVisitors: number;
    pageviews: number;
  };
  thisWeek: {
    uniqueVisitors: number;
    pageviews: number;
  };
  allTime: {
    uniqueVisitors: number;
    pageviews: number;
  };
  deviceBreakdown: MetricItem[];
  osBreakdown: MetricItem[];
  browserBreakdown: MetricItem[];
  combinationBreakdown: MetricItem[];
  topPages: PageStatItem[];
  recentEvents: Array<{
    id: string;
    visitorId: string;
    path: string;
    combination: string;
    device: string;
    browser: string;
    os: string;
    country: string;
    timestamp: string;
  }>;
}

export default function StatsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  // Check saved session on mount
  useEffect(() => {
    const savedToken = sessionStorage.getItem('gcse_stats_token');
    if (savedToken) {
      setIsAuthenticated(true);
      fetchStats(savedToken);
    }
  }, []);

  // Fetch stats from API
  const fetchStats = useCallback(async (token?: string) => {
    const authToken = token || sessionStorage.getItem('gcse_stats_token');
    if (!authToken) return;

    setIsLoadingStats(true);
    try {
      const res = await fetch('/api/analytics/stats', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (res.status === 401) {
        // Token expired or invalid
        sessionStorage.removeItem('gcse_stats_token');
        setIsAuthenticated(false);
        setAuthError('Oturum süresi doldu. Lütfen tekrar şifre giriniz.');
        return;
      }

      const json = await res.json();
      if (json.success && json.data) {
        setAnalytics(json.data);
        setLastRefreshed(new Date());
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  // Auto-refresh interval (every 15 seconds)
  useEffect(() => {
    if (!isAuthenticated || !autoRefresh) return;
    const interval = setInterval(() => {
      fetchStats();
    }, 15000);
    return () => clearInterval(interval);
  }, [isAuthenticated, autoRefresh, fetchStats]);

  // Handle password submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) return;

    setIsAuthenticating(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/analytics/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput.trim() }),
      });

      const json = await res.json();
      if (res.ok && json.success && json.token) {
        sessionStorage.setItem('gcse_stats_token', json.token);
        setIsAuthenticated(true);
        setPasswordInput('');
        fetchStats(json.token);
      } else {
        setAuthError(json.error || 'Geçersiz şifre! Lütfen tekrar deneyiniz.');
      }
    } catch {
      setAuthError('Bağlantı hatası oluştu.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('gcse_stats_token');
    setIsAuthenticated(false);
    setAnalytics(null);
  };

  // 1. Password Protected Gate Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-xl">
          <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-indigo-100 dark:border-indigo-800/60 shadow-inner">
            <Lock className="w-7 h-7" />
          </div>

          <h1 className="text-2xl font-bold text-center text-slate-900 dark:text-slate-100">
            gcse mate İstatistikleri
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-2 mb-6">
            Bu ekran platform yöneticilerine özeldir. Devam etmek için şifrenizi giriniz.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Erişim Şifresi
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Şifreyi giriniz..."
                autoFocus
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            {authError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-600 dark:text-rose-400 font-medium">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isAuthenticating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Doğrulanıyor...
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  Giriş Yap
                </>
              )}
            </button>
          </form>

          <p className="text-[11px] text-center text-slate-400 dark:text-slate-500 mt-5">
            Varsayılan yönetici şifresi: <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-indigo-600 dark:text-indigo-400 font-mono">gcse2026</code>
          </p>
        </div>
      </div>
    );
  }

  // 2. Authenticated Analytics Dashboard
  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Canlı Ziyaretçi & Platform Analizi
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Canlı Takip Aktif
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            gcse mate platformuna giriş yapan tekil kullanıcılar, cihaz türleri ve User-Agent dağılımı.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              autoRefresh
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            {autoRefresh ? 'Otomatik (15sn)' : 'Manuel'}
          </button>

          <button
            onClick={() => fetchStats()}
            disabled={isLoadingStats}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStats ? 'animate-spin text-indigo-600' : ''}`} />
            Yenile
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-all"
            title="Oturumu kapat ve sayfayı kilitle"
          >
            <Lock className="w-3.5 h-3.5" />
            Kilitle
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Today Unique */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Bugün Tekil Kişi
            </span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-slate-100">
              {analytics ? analytics.today.uniqueVisitors.toLocaleString() : '—'}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">farklı kişi</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Sayfa Görüntüleme: <span className="font-semibold text-slate-700 dark:text-slate-300">{analytics ? analytics.today.pageviews : 0}</span>
          </div>
        </div>

        {/* This Week Unique */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Bu Hafta (Son 7 Gün)
            </span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-slate-100">
              {analytics ? analytics.thisWeek.uniqueVisitors.toLocaleString() : '—'}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">farklı kişi</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Haftalık Görüntüleme: <span className="font-semibold text-slate-700 dark:text-slate-300">{analytics ? analytics.thisWeek.pageviews : 0}</span>
          </div>
        </div>

        {/* All Time Unique */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Tüm Zamanlar Tekil
            </span>
            <div className="p-2 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl">
              <Globe className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-slate-100">
              {analytics ? analytics.allTime.uniqueVisitors.toLocaleString() : '—'}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">farklı kişi</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Toplam Ziyaretçi Havuzu
          </div>
        </div>

        {/* All Time Pageviews */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Toplam Görüntüleme
            </span>
            <div className="p-2 bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 rounded-xl">
              <Eye className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-slate-100">
              {analytics ? analytics.allTime.pageviews.toLocaleString() : '—'}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">gösterim</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Son senkron: <span className="font-semibold">{lastRefreshed.toLocaleTimeString('tr-TR')}</span>
          </div>
        </div>
      </div>

      {/* Main Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Device & User-Agent Combinations (%65 iPhone Safari vb.) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Cihaz & User-Agent Kombinasyonu Dağılımı
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Kullanıcıların kullandığı donanım ve tarayıcı bileşimi (örn. iPhone Safari, Windows Chrome)
              </p>
            </div>
          </div>

          {analytics?.combinationBreakdown && analytics.combinationBreakdown.length > 0 ? (
            <div className="space-y-4">
              {analytics.combinationBreakdown.map((item, idx) => (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {item.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {item.count} ziyaret
                      </span>
                      <span className="font-bold text-slate-900 dark:text-slate-100 w-12 text-right">
                        %{item.percentage}
                      </span>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        idx === 0
                          ? 'bg-indigo-600 dark:bg-indigo-500'
                          : idx === 1
                          ? 'bg-blue-500 dark:bg-blue-400'
                          : idx === 2
                          ? 'bg-emerald-500 dark:bg-emerald-400'
                          : 'bg-slate-400 dark:bg-slate-500'
                      }`}
                      style={{ width: `${Math.max(item.percentage, 4)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-sm text-slate-400">
              Henüz User-Agent kaydı bulunamadı. Kullanıcılar siteye girdikçe otomatik listelenecektir.
            </div>
          )}
        </div>

        {/* Device Category Summary (Mobile / Desktop / Tablet) */}
        <div className="space-y-6">
          {/* Device Type Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-4">
              <Monitor className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Cihaz Türü
            </h2>

            {analytics?.deviceBreakdown && analytics.deviceBreakdown.length > 0 ? (
              <div className="space-y-3">
                {analytics.deviceBreakdown.map((item) => {
                  const Icon =
                    item.label === 'Mobile'
                      ? Smartphone
                      : item.label === 'Tablet'
                      ? Tablet
                      : Monitor;
                  return (
                    <div
                      key={item.label}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-xs">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                          {item.label === 'Mobile' ? 'Mobil' : item.label === 'Desktop' ? 'Masaüstü' : 'Tablet'}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                          %{item.percentage}
                        </div>
                        <div className="text-[11px] text-slate-400">{item.count} kişi</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-slate-400 py-4 text-center">Veri bekleniyor...</div>
            )}
          </div>

          {/* OS Breakdown */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-3">
              İşletim Sistemleri (OS)
            </h2>
            <div className="space-y-2">
              {analytics?.osBreakdown?.slice(0, 5).map((os) => (
                <div key={os.label} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800 last:border-none">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">{os.label}</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">%{os.percentage}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Pages Visited Ranking */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              En Çok Ziyaret Edilen Sayfalar & Soru Alanları
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Kullanıcıların platformda en çok vakit geçirdiği modüller ve sayfalar
            </p>
          </div>
        </div>

        {analytics?.topPages && analytics.topPages.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-3">Sayfa Yolu</th>
                  <th className="py-3 px-3 text-right">Görüntüleme</th>
                  <th className="py-3 px-3 text-right">Tekil Ziyaretçi</th>
                  <th className="py-3 px-3 text-right">Trafik Oranı</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {analytics.topPages.map((page) => (
                  <tr key={page.path} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3 font-mono text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                      <Link href={page.path} className="hover:underline flex items-center gap-1.5">
                        {page.path}
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </Link>
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-slate-800 dark:text-slate-200">
                      {page.views}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-600 dark:text-slate-400">
                      {page.uniqueVisitors}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                        %{page.percentage}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-sm text-slate-400">Henüz sayfa ziyareti kaydedilmedi.</div>
        )}
      </div>

      {/* Live Activity Stream (Recent Visits) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Canlı Ziyaretçi Akışı (Son Girişler)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Siteye anlık giren ziyaretçilerin donanım ve sayfa bilgileri
            </p>
          </div>
        </div>

        {analytics?.recentEvents && analytics.recentEvents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Zaman</th>
                  <th className="py-2.5 px-3">Tekil ID</th>
                  <th className="py-2.5 px-3">Cihaz & Tarayıcı</th>
                  <th className="py-2.5 px-3">Ziyaret Edilen Sayfa</th>
                  <th className="py-2.5 px-3">Konum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {analytics.recentEvents.map((evt) => {
                  const date = new Date(evt.timestamp);
                  return (
                    <tr key={evt.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                        {date.toLocaleTimeString('tr-TR')}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300 font-semibold">
                        {evt.visitorId}
                      </td>
                      <td className="py-2.5 px-3 font-sans font-medium text-slate-800 dark:text-slate-200">
                        {evt.combination}
                      </td>
                      <td className="py-2.5 px-3 text-indigo-600 dark:text-indigo-400">
                        {evt.path}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 font-sans">
                        🇬🇧 {evt.country}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-sm text-slate-400">Henüz ziyaret akışı oluşmadı.</div>
        )}
      </div>
    </div>
  );
}
