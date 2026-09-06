'use client';

import { SeedQuestion } from './curriculum/gcse-data';

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
  lastActiveDate?: string; // YYYY-MM-DD
}

export interface TopicMasteryRecord {
  topicId: string;
  masteryScore: number; // 0 to 100
  consecutiveCorrect: number;
  totalAttempted: number;
  totalCorrect: number;
  currentGradeLevel: number; // 4 to 9
}

const SESSION_COOKIE_KEY = 'gcse_user_session';
const STATS_COOKIE_KEY = 'gcse_daily_stats';
const MASTERY_COOKIE_KEY = 'gcse_topic_masteries';

const getTodayString = () => new Date().toISOString().split('T')[0];

const getYesterdayString = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
};

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
    const yesterday = getYesterdayString();
    const raw = getCookie(STATS_COOKIE_KEY);
    
    if (raw) {
      try {
        const stats: DailyStats = JSON.parse(raw);
        if (stats.date === today) {
          return stats;
        } else {
          // New day check
          let newStreak = stats.streakDays;
          // If last active date was not yesterday, reset streak to 0 until first question today
          if (stats.lastActiveDate !== yesterday && stats.lastActiveDate !== today) {
            newStreak = 0;
          }
          
          const newStats: DailyStats = {
            date: today,
            questionsAttemptedToday: 0,
            questionsCorrectToday: 0,
            streakDays: newStreak,
            lastActiveDate: stats.lastActiveDate,
          };
          UserStore.saveDailyStats(newStats);
          return newStats;
        }
      } catch (e) {
        // ignore
      }
    }

    // Brand new user defaults: 0 streak, 0 questions attempted
    const defaultStats: DailyStats = {
      date: today,
      questionsAttemptedToday: 0,
      questionsCorrectToday: 0,
      streakDays: 0,
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
    const today = getTodayString();
    const yesterday = getYesterdayString();

    let newStreak = current.streakDays;
    
    // Calculate streak logic accurately:
    if (current.lastActiveDate === yesterday) {
      newStreak = current.streakDays + 1;
    } else if (current.lastActiveDate === today) {
      newStreak = current.streakDays > 0 ? current.streakDays : 1;
    } else {
      // First active day after a gap
      newStreak = 1;
    }

    const updated: DailyStats = {
      ...current,
      date: today,
      lastActiveDate: today,
      streakDays: newStreak,
      questionsAttemptedToday: current.questionsAttemptedToday + 1,
      questionsCorrectToday: isCorrect ? current.questionsCorrectToday + 1 : current.questionsCorrectToday,
    };
    UserStore.saveDailyStats(updated);
    return updated;
  }

  static getTopicMasteries(): Record<string, TopicMasteryRecord> {
    const raw = getCookie(MASTERY_COOKIE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        // ignore
      }
    }
    return {};
  }

  static updateTopicMastery(topicId: string, isCorrect: boolean, questionGrade: number): TopicMasteryRecord {
    const masteries = UserStore.getTopicMasteries();
    const current = masteries[topicId] || {
      topicId,
      masteryScore: 30, // Base starting mastery (30%)
      consecutiveCorrect: 0,
      totalAttempted: 0,
      totalCorrect: 0,
      currentGradeLevel: 4, // Starts at Foundation Grade 4
    };

    const newAttempted = current.totalAttempted + 1;
    const newCorrect = isCorrect ? current.totalCorrect + 1 : current.totalCorrect;
    const newConsecutive = isCorrect ? current.consecutiveCorrect + 1 : 0;

    let newMastery = current.masteryScore;
    let newGradeLevel = current.currentGradeLevel;

    if (isCorrect) {
      newMastery = Math.min(100, newMastery + 15 * (questionGrade / 9));
      // Adaptive Promotion Rule: Must get at least 2 in a row correct to promote grade!
      if (newConsecutive >= 2 && newGradeLevel < 9) {
        if (newGradeLevel < 6) newGradeLevel = 6;
        else if (newConsecutive >= 3 && newGradeLevel < 8) newGradeLevel = 8;
        else if (newConsecutive >= 4 && newGradeLevel < 9) newGradeLevel = 9;
      }
    } else {
      newMastery = Math.max(10, newMastery - 12);
      // Demote grade if incorrect and struggling
      if (newConsecutive === 0 && newGradeLevel > 4) {
        newGradeLevel = Math.max(4, newGradeLevel - 1);
      }
    }

    const updated: TopicMasteryRecord = {
      topicId,
      masteryScore: Math.round(newMastery),
      consecutiveCorrect: newConsecutive,
      totalAttempted: newAttempted,
      totalCorrect: newCorrect,
      currentGradeLevel: newGradeLevel,
    };

    masteries[topicId] = updated;
    setCookie(MASTERY_COOKIE_KEY, JSON.stringify(masteries));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('gcse_masteries_updated'));
    }

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

  static getStoredQuestions(): SeedQuestion[] {
    const raw = getCookie('gcse_stored_questions');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        // ignore
      }
    }
    return [];
  }

  static saveGeneratedQuestion(question: SeedQuestion) {
    const existing = UserStore.getStoredQuestions();
    // Avoid duplicate IDs
    if (!existing.some(q => q.id === question.id)) {
      const updated = [question, ...existing].slice(0, 100); // Keep top 100 recent AI generated questions
      setCookie('gcse_stored_questions', JSON.stringify(updated));
    }
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
