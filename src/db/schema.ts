import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  targetGrade: integer('target_grade').notNull().default(8),
  currentEstimatedGrade: real('current_estimated_grade').default(5.0),
  streakDays: integer('streak_days').default(0),
  createdAt: text('created_at').notNull(),
});

// Parent Accounts linked to Students
export const parents = sqliteTable('parents', {
  id: text('id').primaryKey(),
  studentId: text('student_id').notNull().references(() => users.id),
  parentName: text('parent_name').notNull(),
  parentEmail: text('parent_email').notNull().unique(),
  notificationFrequency: text('notification_frequency').default('daily'), // daily, weekly, off
  createdAt: text('created_at').notNull(),
});

export const subjects = sqliteTable('subjects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  code: text('code').notNull(),
  examBoard: text('exam_board').notNull().default('AQA'),
  icon: text('icon').notNull().default('book'),
});

export const topics = sqliteTable('topics', {
  id: text('id').primaryKey(),
  subjectId: text('subject_id').notNull().references(() => subjects.id),
  unitName: text('unit_name').notNull(),
  topicName: text('topic_name').notNull(),
  tier: text('tier').notNull().default('Higher'),
  minGrade: integer('min_grade').notNull().default(4),
  maxGrade: integer('max_grade').notNull().default(9),
});

// Granular Sub-topics for deep categorization
export const subtopics = sqliteTable('subtopics', {
  id: text('id').primaryKey(),
  topicId: text('topic_id').notNull().references(() => topics.id),
  subtopicCode: text('subtopic_code').notNull(), // e.g. M-ALG-1.2
  subtopicName: text('subtopic_name').notNull(),
  description: text('description'),
});

export const questions = sqliteTable('questions', {
  id: text('id').primaryKey(),
  topicId: text('topic_id').notNull().references(() => topics.id),
  subtopicId: text('subtopic_id').references(() => subtopics.id),
  subtopicCode: text('subtopic_code'),
  gradeLevel: integer('grade_level').notNull().default(6),
  examBoard: text('exam_board').default('AQA'),
  paperYear: integer('paper_year').default(2023),
  paperName: text('paper_name').default('Paper 1H'),
  examType: text('exam_type').default('practice'), // practice, mock_exam, topic_test, diagnostic
  questionText: text('question_text').notNull(),
  questionType: text('question_type').notNull().default('multiple_choice'),
  optionsJson: text('options_json'),
  correctAnswer: text('correct_answer').notNull(),
  explanation: text('explanation').notNull(),
  markScheme: text('mark_scheme'),
  seedSource: text('seed_source').default('ai_generated'),
  createdAt: text('created_at').notNull(),
});

export const userProgress = sqliteTable('user_progress', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  topicId: text('topic_id').notNull().references(() => topics.id),
  subtopicId: text('subtopic_id').references(() => subtopics.id),
  masteryPercentage: real('mastery_percentage').notNull().default(0.0), // 0.0 to 100.0%
  totalAttempted: integer('total_attempted').notNull().default(0),
  totalCorrect: integer('total_correct').notNull().default(0),
  lastAttemptAt: text('last_attempt_at'),
});

// Daily Study Stats for Parent Dashboard & Reports
export const dailyStudyStats = sqliteTable('daily_study_stats', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  date: text('date').notNull(), // YYYY-MM-DD
  studyTimeMinutes: integer('study_time_minutes').default(0),
  questionsAttempted: integer('questions_attempted').default(0),
  questionsCorrect: integer('questions_correct').default(0),
  accuracyPercentage: real('accuracy_percentage').default(0.0),
  masteryImprovementDelta: real('mastery_improvement_delta').default(0.0),
});

// Full GCSE Mock Exams
export const mockExams = sqliteTable('mock_exams', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  subjectId: text('subject_id').notNull().references(() => subjects.id),
  examBoard: text('exam_board').notNull(), // AQA, Edexcel, OCR
  tier: text('tier').default('Higher'),
  totalMarks: integer('total_marks').notNull().default(80),
  userMarks: integer('user_marks').notNull(),
  achievedGrade: integer('achieved_grade').notNull(), // 1 to 9
  timeTakenMinutes: integer('time_taken_minutes').notNull(),
  subtopicBreakdownJson: text('subtopic_breakdown_json'),
  createdAt: text('created_at').notNull(),
});
