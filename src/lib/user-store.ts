'use client';

export type UserRole = 'guest' | 'student' | 'parent';

export interface UserSession {
  role: UserRole;
  name: string;
  email: string;
  studentName?: string;
  targetGrade: number;
}

export interface DailyStats {
  date: string; // YYYY-MM-DD
  questionsAttemptedToday: number;
  questionsCorrectToday: number;
  streakDays: number;
}

const SESSION_COOKIE_KEY = 'gcse_user_session';
const STATS_COOKIE_KEY = 'gcse_daily_stats';

const getTodayString = () => new Date().toISOString().split('T')[0];

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string, days = 365) {
  if (typeof document === 'undefined') return;
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${date.toUTCString()}; path=/; SameSite=Lax`;
}

export class UserStore {
  static getSession(): UserSession {
    const raw = getCookie(SESSION_COOKIE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        // ignore parse error
      }
    }
    return {
      role: 'guest',
      name: 'Guest Student',
      email: 'guest@primerllm.com',
      targetGrade: 9,
    };
  }

  static saveSession(session: UserSession) {
    setCookie(SESSION_COOKIE_KEY, JSON.stringify(session));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('gcse_user_updated'));
    }
  }

  static getDailyStats(): DailyStats {
    const today = getTodayString();
    const raw = getCookie(STATS_COOKIE_KEY);
    
    if (raw) {
      try {
        const stats: DailyStats = JSON.parse(raw);
        if (stats.date === today) {
          return stats;
        } else {
          // New day reset
          const newStats: DailyStats = {
            date: today,
            questionsAttemptedToday: 0,
            questionsCorrectToday: 0,
            streakDays: stats.streakDays > 0 ? stats.streakDays : 1,
          };
          UserStore.saveDailyStats(newStats);
          return newStats;
        }
      } catch (e) {
        // ignore
      }
    }

    const defaultStats: DailyStats = {
      date: today,
      questionsAttemptedToday: 0, // Starts at 0!
      questionsCorrectToday: 0,
      streakDays: 4,
    };
    UserStore.saveDailyStats(defaultStats);
    return defaultStats;
  }

  static saveDailyStats(stats: DailyStats) {
    setCookie(STATS_COOKIE_KEY, JSON.stringify(stats));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('gcse_stats_updated'));
    }
  }

  static recordQuestionAttempt(isCorrect: boolean): DailyStats {
    const current = UserStore.getDailyStats();
    const updated: DailyStats = {
      ...current,
      date: getTodayString(),
      questionsAttemptedToday: current.questionsAttemptedToday + 1,
      questionsCorrectToday: isCorrect ? current.questionsCorrectToday + 1 : current.questionsCorrectToday,
    };
    UserStore.saveDailyStats(updated);
    return updated;
  }

  static setTargetGrade(targetGrade: number) {
    const session = UserStore.getSession();
    UserStore.saveSession({ ...session, targetGrade });
  }

  static loginAsStudent(name: string, email: string) {
    const session = UserStore.getSession();
    UserStore.saveSession({
      ...session,
      role: 'student',
      name: name || 'Student User',
      email: email || 'student@primerllm.com',
    });
  }

  static loginAsParent(parentName: string, parentEmail: string, studentName: string) {
    const session = UserStore.getSession();
    UserStore.saveSession({
      ...session,
      role: 'parent',
      name: parentName || 'Parent User',
      email: parentEmail || 'parent@primerllm.com',
      studentName: studentName || 'Alex (Student)',
    });
  }

  static logout() {
    UserStore.saveSession({
      role: 'guest',
      name: 'Guest Student',
      email: 'guest@primerllm.com',
      targetGrade: 9,
    });
  }
}
