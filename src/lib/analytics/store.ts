import { parseUserAgent, ParsedUserAgent } from './ua-parser';

export interface AnalyticsEvent {
  id: string;
  visitorId: string;
  sessionId?: string;
  path: string;
  referrer?: string;
  userAgent: string;
  browser: string;
  os: string;
  device: 'Mobile' | 'Tablet' | 'Desktop';
  deviceModel: string;
  combination: string;
  country?: string;
  ipHash?: string;
  timestamp: string; // ISO String
}

export interface MetricItem {
  label: string;
  count: number;
  percentage: number;
}

export interface PageStatItem {
  path: string;
  views: number;
  uniqueVisitors: number;
  percentage: number;
}

export interface AnalyticsSummary {
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

// Global In-Memory Store for Edge / Node resilience
const globalStore = globalThis as unknown as {
  __GCSE_ANALYTICS_EVENTS__?: AnalyticsEvent[];
};

if (!globalStore.__GCSE_ANALYTICS_EVENTS__) {
  globalStore.__GCSE_ANALYTICS_EVENTS__ = [];
}

const MAX_IN_MEMORY_EVENTS = 10000;

export async function recordAnalyticsEvent(params: {
  visitorId: string;
  sessionId?: string;
  path: string;
  referrer?: string;
  userAgent: string;
  country?: string;
  ipHash?: string;
}): Promise<AnalyticsEvent> {
  const parsedUa: ParsedUserAgent = parseUserAgent(params.userAgent);
  const now = new Date();
  const timestamp = now.toISOString();
  const id = `evt_${now.getTime()}_${Math.random().toString(36).slice(2, 8)}`;

  const event: AnalyticsEvent = {
    id,
    visitorId: params.visitorId,
    sessionId: params.sessionId,
    path: params.path || '/',
    referrer: params.referrer,
    userAgent: params.userAgent,
    browser: parsedUa.browser,
    os: parsedUa.os,
    device: parsedUa.device,
    deviceModel: parsedUa.deviceModel,
    combination: parsedUa.combination,
    country: params.country || 'GB',
    ipHash: params.ipHash,
    timestamp,
  };

  // Add to in-memory store
  const events = globalStore.__GCSE_ANALYTICS_EVENTS__!;
  events.push(event);
  if (events.length > MAX_IN_MEMORY_EVENTS) {
    events.splice(0, events.length - MAX_IN_MEMORY_EVENTS);
  }

  // Try D1 async insertion if available
  try {
    const d1 = (globalThis as any).DB;
    if (d1 && typeof d1.prepare === 'function') {
      d1.prepare(`
        INSERT INTO analytics_events (id, visitor_id, session_id, path, referrer, user_agent, browser, os, device, country, ip_hash, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        event.id,
        event.visitorId,
        event.sessionId || null,
        event.path,
        event.referrer || null,
        event.userAgent,
        event.browser,
        event.os,
        event.device,
        event.country || null,
        event.ipHash || null,
        event.timestamp
      ).run().catch(() => {});
    }
  } catch {
    // Non-blocking fallback
  }

  return event;
}

export function getAnalyticsSummary(): AnalyticsSummary {
  const events = globalStore.__GCSE_ANALYTICS_EVENTS__ || [];
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weekAgoStr = weekAgo.toISOString();

  // 1. Group events by time window
  const todayEvents = events.filter((e) => e.timestamp.startsWith(todayStr));
  const weekEvents = events.filter((e) => e.timestamp >= weekAgoStr);
  const allEvents = events;

  const todayVisitors = new Set(todayEvents.map((e) => e.visitorId)).size;
  const weekVisitors = new Set(weekEvents.map((e) => e.visitorId)).size;
  const allVisitors = new Set(allEvents.map((e) => e.visitorId)).size;

  const totalPageviews = allEvents.length;

  // Helper for breakdown calculation
  const calculateBreakdown = (
    keyFn: (e: AnalyticsEvent) => string,
    sourceEvents: AnalyticsEvent[] = allEvents
  ): MetricItem[] => {
    if (sourceEvents.length === 0) return [];
    const counts: Record<string, number> = {};
    for (const e of sourceEvents) {
      const key = keyFn(e) || 'Unknown';
      counts[key] = (counts[key] || 0) + 1;
    }

    return Object.entries(counts)
      .map(([label, count]) => ({
        label,
        count,
        percentage: Math.round((count / sourceEvents.length) * 1000) / 10,
      }))
      .sort((a, b) => b.count - a.count);
  };

  const deviceBreakdown = calculateBreakdown((e) => e.device);
  const osBreakdown = calculateBreakdown((e) => e.os);
  const browserBreakdown = calculateBreakdown((e) => e.browser);
  const combinationBreakdown = calculateBreakdown((e) => e.combination);

  // Top Pages
  const pageMap: Record<string, { views: number; visitors: Set<string> }> = {};
  for (const e of allEvents) {
    const p = e.path || '/';
    if (!pageMap[p]) {
      pageMap[p] = { views: 0, visitors: new Set() };
    }
    pageMap[p].views += 1;
    pageMap[p].visitors.add(e.visitorId);
  }

  const topPages: PageStatItem[] = Object.entries(pageMap)
    .map(([path, data]) => ({
      path,
      views: data.views,
      uniqueVisitors: data.visitors.size,
      percentage: totalPageviews > 0 ? Math.round((data.views / totalPageviews) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 15);

  // Recent 50 events
  const recentEvents = [...allEvents]
    .reverse()
    .slice(0, 50)
    .map((e) => ({
      id: e.id,
      visitorId: e.visitorId.length > 8 ? `${e.visitorId.slice(0, 8)}...` : e.visitorId,
      path: e.path,
      combination: e.combination,
      device: e.device,
      browser: e.browser,
      os: e.os,
      country: e.country || 'GB',
      timestamp: e.timestamp,
    }));

  return {
    today: {
      uniqueVisitors: todayVisitors,
      pageviews: todayEvents.length,
    },
    thisWeek: {
      uniqueVisitors: weekVisitors,
      pageviews: weekEvents.length,
    },
    allTime: {
      uniqueVisitors: allVisitors,
      pageviews: allEvents.length,
    },
    deviceBreakdown,
    osBreakdown,
    browserBreakdown,
    combinationBreakdown,
    topPages,
    recentEvents,
  };
}
