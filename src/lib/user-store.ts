'use client';

import { SeedQuestion, INITIAL_SEED_QUESTIONS } from './curriculum/gcse-data';

export type UserRole = 'guest' | 'student' | 'parent';

export interface UserSession {
  role: UserRole;
  name: string;
  email: string;
  studentName?: string;
  parentEmail?: string;
  targetGrade: number;
  schoolYear?: number; // e.g. 8, 9, 10, 11
  emailReminders?: boolean;
  parentProgressReports?: boolean;
  dailyStudyGoalMinutes?: number; // Target daily study time (default: 30)
  examDate?: string; // Target GCSE exam date (YYYY-MM-DD, default: 2027-05-10)
}

export interface DailyStats {
  date: string; // YYYY-MM-DD
  questionsAttemptedToday: number;
  questionsCorrectToday: number;
  studyMinutesToday?: number; // Time spent studying today in minutes
  streakDays: number;
  lastActiveDate?: string; // YYYY-MM-DD
}

export interface ScheduledReview {
  id: string;
  topicId: string;
  topicTitle: string;
  subject: string;
  scheduledDate: string; // YYYY-MM-DD
  status: 'pending' | 'completed';
  priority?: 'high' | 'medium' | 'low';
  notes?: string;
  targetQuestions?: number;
}

export interface TopicMasteryRecord {
  topicId: string;
  masteryScore: number; // 0 to 100
  consecutiveCorrect: number;
  totalAttempted: number;
  totalCorrect: number;
  currentGradeLevel: number; // 4 to 9
  isMastered?: boolean; // 100% Mastery Awarded
}

const SESSION_COOKIE_KEY = 'gcse_user_session';
const STATS_COOKIE_KEY = 'gcse_daily_stats';
const MASTERY_COOKIE_KEY = 'gcse_topic_masteries';
const ANSWERED_QUESTIONS_KEY = 'gcse_answered_questions';
const SCHEDULED_REVIEWS_KEY = 'gcse_scheduled_reviews';

const getTodayString = () => new Date().toISOString().split('T')[0];

const getYesterdayString = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
};

const inMemoryCookies: Record<string, string> = {};

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    return inMemoryCookies[name] || null;
  }
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : (inMemoryCookies[name] || null);
}

function setCookie(name: string, value: string, days = 365) {
  inMemoryCookies[name] = value;
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
        const parsed = JSON.parse(raw);
        return {
          dailyStudyGoalMinutes: 30,
          examDate: '2027-05-10',
          ...parsed,
        };
      } catch (e) {
        // ignore parse error
      }
    }
    return {
      role: 'guest',
      name: 'Guest Student',
      email: 'guest@primerllm.com',
      schoolYear: 10,
      targetGrade: 6,
      emailReminders: true,
      parentProgressReports: true,
      dailyStudyGoalMinutes: 30,
      examDate: '2027-05-10',
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
          return {
            studyMinutesToday: 0,
            ...stats,
          };
        } else {
          // New day check
          let newStreak = stats.streakDays;
          if (stats.lastActiveDate !== yesterday && stats.lastActiveDate !== today) {
            newStreak = 0;
          }
          
          const newStats: DailyStats = {
            date: today,
            questionsAttemptedToday: 0,
            questionsCorrectToday: 0,
            studyMinutesToday: 0,
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

    const defaultStats: DailyStats = {
      date: today,
      questionsAttemptedToday: 0,
      questionsCorrectToday: 0,
      studyMinutesToday: 0,
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

  static addStudyMinutes(minutes: number): DailyStats {
    const current = UserStore.getDailyStats();
    const updated: DailyStats = {
      ...current,
      studyMinutesToday: Math.max(0, (current.studyMinutesToday || 0) + minutes),
    };
    UserStore.saveDailyStats(updated);
    return updated;
  }

  static setDailyStudyGoal(minutes: number) {
    const session = UserStore.getSession();
    UserStore.saveSession({ ...session, dailyStudyGoalMinutes: Math.max(5, minutes) });
  }

  static setExamDate(dateStr: string) {
    const session = UserStore.getSession();
    UserStore.saveSession({ ...session, examDate: dateStr });
  }

  static getDaysUntilExam(): number {
    const session = UserStore.getSession();
    const targetDateStr = session.examDate || '2027-05-10';
    const target = new Date(targetDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    const diffMs = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  static getScheduledReviews(): ScheduledReview[] {
    const raw = getCookie(SCHEDULED_REVIEWS_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        // ignore
      }
    }
    // Default initial timetable aligned with current date
    const today = getTodayString();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const in3Days = new Date();
    in3Days.setDate(in3Days.getDate() + 3);
    const in3DaysStr = in3Days.toISOString().split('T')[0];

    const in5Days = new Date();
    in5Days.setDate(in5Days.getDate() + 5);
    const in5DaysStr = in5Days.toISOString().split('T')[0];

    const defaults: ScheduledReview[] = [
      {
        id: 'rev-today-1',
        topicId: 'm-alg-1',
        topicTitle: 'Quadratic Equations & Factoring',
        subject: 'Mathematics',
        scheduledDate: today,
        status: 'pending',
        priority: 'high',
        targetQuestions: 15,
        notes: 'Reinforce quadratic formula and factoring techniques'
      },
      {
        id: 'rev-tom-1',
        topicId: 'p-1',
        topicTitle: 'Energy Conservation & Efficiency',
        subject: 'Physics',
        scheduledDate: tomorrowStr,
        status: 'pending',
        priority: 'medium',
        targetQuestions: 15,
        notes: 'Review kinetic and gravitational potential energy calculations'
      },
      {
        id: 'rev-3d-1',
        topicId: 'ch-1',
        topicTitle: 'Atomic Structure & Periodic Trends',
        subject: 'Chemistry',
        scheduledDate: in3DaysStr,
        status: 'pending',
        priority: 'medium',
        targetQuestions: 15,
        notes: 'Check electron configurations and ion formation'
      },
      {
        id: 'rev-5d-1',
        topicId: 'eng-lit-1',
        topicTitle: 'Macbeth: Ambition & Guilt',
        subject: 'English Literature',
        scheduledDate: in5DaysStr,
        status: 'pending',
        priority: 'high',
        targetQuestions: 10,
        notes: 'Memorize key quotes for Act 1 and Act 3'
      }
    ];
    UserStore.saveScheduledReviews(defaults);
    return defaults;
  }

  static saveScheduledReviews(reviews: ScheduledReview[]) {
    setCookie(SCHEDULED_REVIEWS_KEY, JSON.stringify(reviews));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('gcse_reviews_updated'));
    }
  }

  static addScheduledReview(review: Omit<ScheduledReview, 'id'>): ScheduledReview {
    const existing = UserStore.getScheduledReviews();
    const newReview: ScheduledReview = {
      ...review,
      id: `rev-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    const updated = [newReview, ...existing];
    UserStore.saveScheduledReviews(updated);
    return newReview;
  }

  static toggleReviewCompleted(id: string) {
    const existing = UserStore.getScheduledReviews();
    const updated: ScheduledReview[] = existing.map(r => {
      if (r.id === id) {
        const nextStatus: 'pending' | 'completed' = r.status === 'completed' ? 'pending' : 'completed';
        return { ...r, status: nextStatus };
      }
      return r;
    });
    UserStore.saveScheduledReviews(updated);
  }

  static deleteScheduledReview(id: string) {
    const existing = UserStore.getScheduledReviews();
    const updated = existing.filter(r => r.id !== id);
    UserStore.saveScheduledReviews(updated);
  }

  static getReviewsDueToday(): ScheduledReview[] {
    const today = getTodayString();
    return UserStore.getScheduledReviews().filter(r => r.scheduledDate === today && r.status !== 'completed');
  }

  static recordQuestionAttempt(isCorrect: boolean, questionId?: string): DailyStats {
    if (questionId) {
      UserStore.markQuestionAnswered(questionId);
    }
    const current = UserStore.getDailyStats();
    const today = getTodayString();
    const yesterday = getYesterdayString();

    let newStreak = current.streakDays;
    
    if (current.lastActiveDate === yesterday) {
      newStreak = current.streakDays + 1;
    } else if (current.lastActiveDate === today) {
      newStreak = current.streakDays > 0 ? current.streakDays : 1;
    } else {
      newStreak = 1;
    }

    const newAttempted = current.questionsAttemptedToday + 1;
    // Auto-credit ~1.5 - 2 minutes study time per question attempted if not already higher
    const autoMinutes = Math.max(current.studyMinutesToday || 0, Math.round(newAttempted * 1.5));

    const updated: DailyStats = {
      ...current,
      date: today,
      lastActiveDate: today,
      streakDays: newStreak,
      questionsAttemptedToday: newAttempted,
      questionsCorrectToday: isCorrect ? current.questionsCorrectToday + 1 : current.questionsCorrectToday,
      studyMinutesToday: autoMinutes,
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
    const session = UserStore.getSession();
    const defaultGrade = session.targetGrade || 6;
    const current = masteries[topicId] || {
      topicId,
      masteryScore: 30, // Base starting mastery (30%)
      consecutiveCorrect: 0,
      totalAttempted: 0,
      totalCorrect: 0,
      currentGradeLevel: defaultGrade, // Calibrated by student targetGrade / school year
      isMastered: false,
    };

    const newAttempted = current.totalAttempted + 1;
    const newCorrect = isCorrect ? current.totalCorrect + 1 : current.totalCorrect;
    const newConsecutive = isCorrect ? current.consecutiveCorrect + 1 : 0;

    let newMastery = current.masteryScore;
    let newGradeLevel = current.currentGradeLevel;

    if (isCorrect) {
      newMastery = Math.min(100, newMastery + 20 * (questionGrade / 9));
      if (newConsecutive >= 2 && newGradeLevel < 9) {
        if (newGradeLevel < 6) newGradeLevel = 6;
        else if (newConsecutive >= 3 && newGradeLevel < 8) newGradeLevel = 8;
        else if (newConsecutive >= 4 && newGradeLevel < 9) newGradeLevel = 9;
      }
    } else {
      newMastery = Math.max(10, newMastery - 12);
      if (newConsecutive === 0 && newGradeLevel > 4) {
        newGradeLevel = Math.max(4, newGradeLevel - 1);
      }
    }

    const wasMasteredBefore = current.isMastered || current.masteryScore >= 100;
    const isNowMastered = newMastery >= 100;

    const updated: TopicMasteryRecord = {
      topicId,
      masteryScore: Math.round(newMastery),
      consecutiveCorrect: newConsecutive,
      totalAttempted: newAttempted,
      totalCorrect: newCorrect,
      currentGradeLevel: newGradeLevel,
      isMastered: isNowMastered,
    };

    masteries[topicId] = updated;
    setCookie(MASTERY_COOKIE_KEY, JSON.stringify(masteries));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('gcse_masteries_updated'));

      // If student reached 100% Mastery for the first time, trigger 100% Mastery Event & Email!
      if (isNowMastered && !wasMasteredBefore) {
        const detailObj = { topicId, gradeLevel: newGradeLevel, topicRecord: updated };
        window.dispatchEvent(new CustomEvent('gcse_topic_mastered', { detail: detailObj }));

        // Dispatch Email to Parent if configured
        const session = UserStore.getSession();
        const pEmail = session.parentEmail || (session.role === 'parent' ? session.email : null);
        if (pEmail && session.parentProgressReports !== false) {
          import('./email-service').then(({ EmailService }) => {
            EmailService.sendParentMasteryNotification(
              pEmail,
              session.name || 'Student',
              topicId,
              newGradeLevel
            );
          });
        }
      }
    }

    return updated;
  }

  static getAnsweredQuestionIds(): string[] {
    const raw = getCookie(ANSWERED_QUESTIONS_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        // ignore
      }
    }
    return [];
  }

  static markQuestionAnswered(questionId: string) {
    if (!questionId) return;
    const current = UserStore.getAnsweredQuestionIds();
    if (!current.includes(questionId)) {
      const updated = [...current, questionId];
      if (updated.length > 200) updated.shift();
      setCookie(ANSWERED_QUESTIONS_KEY, JSON.stringify(updated));
    }
  }

  static setTargetGrade(targetGrade: number) {
    const session = UserStore.getSession();
    UserStore.saveSession({ ...session, targetGrade });
  }

  static setSchoolYear(schoolYear: number) {
    const yearGradeMap: Record<number, number> = { 8: 4, 9: 5, 10: 6, 11: 8 };
    const targetGrade = yearGradeMap[schoolYear] || 6;
    const session = UserStore.getSession();
    UserStore.saveSession({ ...session, schoolYear, targetGrade });
  }

  static loginAsStudent(
    name: string,
    email: string,
    emailReminders = true,
    parentEmail = ''
  ) {
    const session = UserStore.getSession();
    UserStore.saveSession({
      ...session,
      role: 'student',
      name: name || 'Student User',
      email: email || 'student@primerllm.com',
      parentEmail: parentEmail || session.parentEmail,
      emailReminders,
      parentProgressReports: true,
    });
  }

  static loginAsParent(
    parentName: string,
    parentEmail: string,
    studentName: string,
    parentProgressReports = true
  ) {
    const session = UserStore.getSession();
    UserStore.saveSession({
      ...session,
      role: 'parent',
      name: parentName || 'Parent User',
      email: parentEmail || 'parent@primerllm.com',
      parentEmail: parentEmail || 'parent@primerllm.com',
      studentName: studentName || 'Alex (Student)',
      parentProgressReports,
      emailReminders: true,
    });
  }

  private static CURRENT_CACHE_VERSION = 'v6_authentic_gcse_exam_rubric';

  static getStoredQuestions(): SeedQuestion[] {
    const raw = getCookie('gcse_stored_questions');
    const cacheVer = getCookie('gcse_cache_ver');

    // Purge stale question cookies if version changed
    if (cacheVer !== UserStore.CURRENT_CACHE_VERSION) {
      if (typeof document !== 'undefined') {
        document.cookie = 'gcse_stored_questions=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'gcse_answered_questions=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        setCookie('gcse_cache_ver', UserStore.CURRENT_CACHE_VERSION);
      }
      return [];
    }

    if (raw) {
      try {
        const parsed: SeedQuestion[] = JSON.parse(raw);
        // Verify each stored question: if question ID exists in INITIAL_SEED_QUESTIONS, ensure topicId & text match!
        return parsed.filter(q => {
          const match = INITIAL_SEED_QUESTIONS.find(sq => sq.id === q.id);
          if (match) {
            return q.topicId === match.topicId && q.questionText === match.questionText;
          }
          return true; // Retain valid custom AI-generated questions
        });
      } catch (e) {
        // ignore
      }
    }
    return [];
  }

  static saveGeneratedQuestion(question: SeedQuestion) {
    const existing = UserStore.getStoredQuestions();
    if (!existing.some(q => q.id === question.id)) {
      const updated = [question, ...existing].slice(0, 100);
      setCookie('gcse_stored_questions', JSON.stringify(updated));
      setCookie('gcse_cache_ver', UserStore.CURRENT_CACHE_VERSION);
    }
  }

  static logout() {
    UserStore.saveSession({
      role: 'guest',
      name: 'Guest Student',
      email: 'guest@primerllm.com',
      targetGrade: 9,
      emailReminders: true,
      parentProgressReports: true,
    });
  }
}
