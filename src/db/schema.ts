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
  tier: text('tier').notNull().default('Higher'), // Foundation, Higher, Both
  minGrade: integer('min_grade').notNull().default(4),
  maxGrade: integer('max_grade').notNull().default(9),
});

export const questions = sqliteTable('questions', {
  id: text('id').primaryKey(),
  topicId: text('topic_id').notNull().references(() => topics.id),
  gradeLevel: integer('grade_level').notNull().default(6),
  questionText: text('question_text').notNull(),
  questionType: text('question_type').notNull().default('multiple_choice'), // multiple_choice, numerical, free_text
  optionsJson: text('options_json'), // JSON array of strings
  correctAnswer: text('correct_answer').notNull(),
  explanation: text('explanation').notNull(),
  markScheme: text('mark_scheme'),
  seedSource: text('seed_source').default('ai_generated'), // ai_generated, past_paper, web_crawled
  createdAt: text('created_at').notNull(),
});

export const userProgress = sqliteTable('user_progress', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  topicId: text('topic_id').notNull().references(() => topics.id),
  masteryScore: real('mastery_score').notNull().default(0.0), // 0 to 100
  totalAttempted: integer('total_attempted').notNull().default(0),
  totalCorrect: integer('total_correct').notNull().default(0),
  lastAttemptAt: text('last_attempt_at'),
});

export const questionAttempts = sqliteTable('question_attempts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  questionId: text('question_id').notNull().references(() => questions.id),
  userAnswer: text('user_answer').notNull(),
  isCorrect: integer('is_correct', { mode: 'boolean' }).notNull(),
  timeSpentSeconds: integer('time_spent_seconds').default(0),
  detectedKnowledgeGap: text('detected_knowledge_gap'),
  requestedExplanation: integer('requested_explanation', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').notNull(),
});

export const studyCalendar = sqliteTable('study_calendar', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  date: text('date').notNull(), // YYYY-MM-DD
  plannedTopicIdsJson: text('planned_topic_ids_json'),
  completedTopicIdsJson: text('completed_topic_ids_json'),
  dailyTargetQuestions: integer('daily_target_questions').default(15),
  questionsCompleted: integer('questions_completed').default(0),
});
