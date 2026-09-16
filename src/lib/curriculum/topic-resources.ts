import { GCSE_TOPICS, GCSE_SUBJECTS } from './gcse-data';

export type ResourceProvider =
  | 'Physics & Maths Tutor (PMT)'
  | 'Corbettmaths'
  | 'Maths Genie'
  | 'Save My Exams'
  | 'FreeScienceLessons'
  | 'Cognito'
  | 'BBC Bitesize'
  | 'Mr Bruff'
  | 'Craig \'n\' Dave'
  | 'Tutor2u';

export interface RevisionResource {
  id: string;
  provider: ResourceProvider;
  title: string;
  type: 'notes' | 'video' | 'questions' | 'walkthrough';
  url: string;
  description: string;
  badge: string;
  badgeColor: string;
  isRecommended?: boolean;
}

export interface VideoTutorial {
  id: string;
  title: string;
  creator: string;
  channelName: string;
  url: string;
  youtubeQuery: string;
  durationEstimate?: string;
  description: string;
  type: 'concept' | 'walkthrough' | 'summary';
}

export interface TopicRevisionBundle {
  topicId: string;
  topicName: string;
  subjectId: string;
  subjectName: string;
  tier?: string;
  quickActionPrompt: string;
  readingResources: RevisionResource[];
  videoTutorials: VideoTutorial[];
  externalSearchUrl: string;
}

/**
 * Returns structured, curated topic revision resources and video tutorials
 * based on the student's question topic and subject.
 */
export function getTopicRevisionBundle(
  topicId: string,
  overrideSubjectId?: string,
  overrideTopicName?: string
): TopicRevisionBundle {
  const topic = GCSE_TOPICS.find((t) => t.id === topicId);
  const subjectId = overrideSubjectId || topic?.subjectId || 'maths';
  const topicName = overrideTopicName || topic?.topicName || 'GCSE Topic Revision';
  const subjectObj = GCSE_SUBJECTS.find((s) => s.id === subjectId);
  const subjectName = subjectObj?.name || 'GCSE Subject';

  const cleanSearch = topicName.replace(/[&/\\#,+()$~%.'":*?<>{}]/g, ' ').replace(/\s+/g, '+');

  const readingResources: RevisionResource[] = [];
  const videoTutorials: VideoTutorial[] = [];

  if (subjectId === 'maths') {
    // 1. Physics & Maths Tutor
    readingResources.push({
      id: 'pmt-maths',
      provider: 'Physics & Maths Tutor (PMT)',
      title: `${topicName} — PMT Revision & Questions`,
      type: 'questions',
      url: `https://www.physicsandmathstutor.com/?s=GCSE+Maths+${cleanSearch}`,
      description: 'Authentic past paper questions, topic worksheets & mark schemes categorized by difficulty.',
      badge: 'Exam Papers & MS',
      badgeColor: 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      isRecommended: true,
    });

    // 2. Corbettmaths
    readingResources.push({
      id: 'corbett-maths',
      provider: 'Corbettmaths',
      title: `${topicName} — Corbettmaths Videos & Worksheets`,
      type: 'walkthrough',
      url: `https://corbettmaths.com/?s=${cleanSearch}`,
      description: 'Clear step-by-step video tutorials, 5-a-day practice, textbook exercises and solution keys.',
      badge: 'Worksheets & 5-a-day',
      badgeColor: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      isRecommended: true,
    });

    // 3. Maths Genie
    readingResources.push({
      id: 'maths-genie',
      provider: 'Maths Genie',
      title: `${topicName} — Maths Genie Grade Tests`,
      type: 'questions',
      url: `https://www.mathsgenie.co.uk/gcse.html`,
      description: 'Targeted GCSE practice questions, grade-specific tests and full video exam walkthroughs.',
      badge: 'Grade 1–9 Solutions',
      badgeColor: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      isRecommended: true,
    });

    // 4. Save My Exams
    readingResources.push({
      id: 'sme-maths',
      provider: 'Save My Exams',
      title: `${topicName} — Save My Exams Revision Notes`,
      type: 'notes',
      url: `https://www.savemyexams.com/search/?query=GCSE+Maths+${cleanSearch}`,
      description: 'Concise specification-aligned revision notes, downloadable formula sheets and examiner tips.',
      badge: 'Revision Notes',
      badgeColor: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    });

    // Maths Videos
    videoTutorials.push({
      id: 'vid-maths-genie',
      title: `${topicName} — Exam Question Walkthrough`,
      creator: 'Maths Genie',
      channelName: 'Maths Genie',
      url: `https://www.youtube.com/results?search_query=Maths+Genie+GCSE+${cleanSearch}`,
      youtubeQuery: `Maths Genie GCSE ${cleanSearch}`,
      durationEstimate: '8–12 mins',
      description: 'Worked exam paper solutions with step-by-step method and accuracy mark coaching.',
      type: 'walkthrough',
    });

    videoTutorials.push({
      id: 'vid-corbett',
      title: `${topicName} — Concept & Worked Examples`,
      creator: 'Corbettmaths',
      channelName: 'Corbettmaths',
      url: `https://www.youtube.com/results?search_query=Corbettmaths+${cleanSearch}`,
      youtubeQuery: `Corbettmaths ${cleanSearch}`,
      durationEstimate: '6–10 mins',
      description: 'Visual breakdown of mathematical techniques from foundation to higher grades.',
      type: 'concept',
    });

    videoTutorials.push({
      id: 'vid-cognito-maths',
      title: `${topicName} — Animated Visual Explanation`,
      creator: 'Cognito',
      channelName: 'Cognito Edu',
      url: `https://www.youtube.com/results?search_query=Cognito+GCSE+Maths+${cleanSearch}`,
      youtubeQuery: `Cognito GCSE Maths ${cleanSearch}`,
      durationEstimate: '5–8 mins',
      description: 'Clean animations illustrating difficult mathematical concepts and real-world applications.',
      type: 'summary',
    });

  } else if (subjectId === 'physics' || subjectId === 'chemistry' || subjectId === 'biology') {
    const scienceSubj = subjectId === 'physics' ? 'Physics' : subjectId === 'chemistry' ? 'Chemistry' : 'Biology';

    // 1. Physics & Maths Tutor
    readingResources.push({
      id: `pmt-${subjectId}`,
      provider: 'Physics & Maths Tutor (PMT)',
      title: `${topicName} — PMT Flashcards, Notes & Questions`,
      type: 'notes',
      url: `https://www.physicsandmathstutor.com/${subjectId}-revision/gcse-aqa/`,
      description: 'Summary revision notes, flashcards, mind maps and past exam questions with mark schemes.',
      badge: 'PMT Revision Pack',
      badgeColor: 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      isRecommended: true,
    });

    // 2. Save My Exams
    readingResources.push({
      id: `sme-${subjectId}`,
      provider: 'Save My Exams',
      title: `${topicName} — Save My Exams Concise Notes`,
      type: 'notes',
      url: `https://www.savemyexams.com/search/?query=GCSE+${scienceSubj}+${cleanSearch}`,
      description: 'Illustrated topic notes, required practical guides, model answers and common student traps.',
      badge: 'Illustrated Notes & Traps',
      badgeColor: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      isRecommended: true,
    });

    // 3. BBC Bitesize
    readingResources.push({
      id: `bbc-${subjectId}`,
      provider: 'BBC Bitesize',
      title: `${topicName} — BBC Bitesize Guide & Quiz`,
      type: 'notes',
      url: `https://www.bbc.co.uk/bitesize/search?q=GCSE+${scienceSubj}+${cleanSearch}`,
      description: 'Interactive revision pages, animations and rapid checkpoint quizzes aligned with UK boards.',
      badge: 'Curriculum Specification',
      badgeColor: 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    });

    // Science Videos
    videoTutorials.push({
      id: `vid-freescience-${subjectId}`,
      title: `${topicName} — Complete Lesson`,
      creator: 'FreeScienceLessons',
      channelName: 'Freesciencelessons',
      url: `https://www.youtube.com/results?search_query=Freesciencelessons+GCSE+${scienceSubj}+${cleanSearch}`,
      youtubeQuery: `Freesciencelessons GCSE ${scienceSubj} ${cleanSearch}`,
      durationEstimate: '4–7 mins',
      description: 'Shaun Donnelly\'s high-yield video lesson covering exact exam board marking points.',
      type: 'concept',
    });

    videoTutorials.push({
      id: `vid-cognito-${subjectId}`,
      title: `${topicName} — Animated Deep Dive`,
      creator: 'Cognito',
      channelName: 'Cognito Edu',
      url: `https://www.youtube.com/results?search_query=Cognito+GCSE+${scienceSubj}+${cleanSearch}`,
      youtubeQuery: `Cognito GCSE ${scienceSubj} ${cleanSearch}`,
      durationEstimate: '6–9 mins',
      description: 'Engaging 3D animations and diagrams covering required practicals and equations.',
      type: 'walkthrough',
    });

  } else if (subjectId === 'cs') {
    // Computer Science
    readingResources.push({
      id: 'sme-cs',
      provider: 'Save My Exams',
      title: `${topicName} — Save My Exams CS Notes`,
      type: 'notes',
      url: `https://www.savemyexams.com/search/?query=GCSE+Computer+Science+${cleanSearch}`,
      description: 'Hardware, software, logic gates, algorithms, and cybersecurity revision notes.',
      badge: 'Specification Guide',
      badgeColor: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      isRecommended: true,
    });

    readingResources.push({
      id: 'pmt-cs',
      provider: 'Physics & Maths Tutor (PMT)',
      title: `${topicName} — PMT Topic Worksheets`,
      type: 'questions',
      url: `https://www.physicsandmathstutor.com/?s=GCSE+Computer+Science+${cleanSearch}`,
      description: 'Past exam paper questions, pseudocode traces, and binary/logic exercises.',
      badge: 'Questions & Mark Schemes',
      badgeColor: 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    });

    videoTutorials.push({
      id: 'vid-craig-dave',
      title: `${topicName} — Craig 'n' Dave Video Lesson`,
      creator: 'Craig \'n\' Dave',
      channelName: 'Craig \'n\' Dave',
      url: `https://www.youtube.com/results?search_query=Craig+and+Dave+GCSE+Computer+Science+${cleanSearch}`,
      youtubeQuery: `Craig and Dave GCSE Computer Science ${cleanSearch}`,
      durationEstimate: '6–10 mins',
      description: 'Authoritative OCR and AQA GCSE Computer Science video walkthroughs.',
      type: 'concept',
    });

  } else if (subjectId === 'english-lit' || subjectId === 'english-lang') {
    // English
    readingResources.push({
      id: 'sme-english',
      provider: 'Save My Exams',
      title: `${topicName} — Save My Exams Model Essays`,
      type: 'notes',
      url: `https://www.savemyexams.com/search/?query=GCSE+English+${cleanSearch}`,
      description: 'Theme analyses, character profiles, quote banks and Grade 9 model responses.',
      badge: 'Quote Banks & Model Essays',
      badgeColor: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      isRecommended: true,
    });

    readingResources.push({
      id: 'pmt-english',
      provider: 'Physics & Maths Tutor (PMT)',
      title: `${topicName} — PMT English Revision Packs`,
      type: 'notes',
      url: `https://www.physicsandmathstutor.com/?s=GCSE+English+${cleanSearch}`,
      description: 'Comprehensive character analyses, context guides, and high-scoring essay plans.',
      badge: 'Context & Essay Plans',
      badgeColor: 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    });

    videoTutorials.push({
      id: 'vid-mr-bruff',
      title: `${topicName} — Mr Bruff Analysis Video`,
      creator: 'Mr Bruff',
      channelName: 'Mr Bruff',
      url: `https://www.youtube.com/results?search_query=Mr+Bruff+GCSE+${cleanSearch}`,
      youtubeQuery: `Mr Bruff GCSE ${cleanSearch}`,
      durationEstimate: '7–12 mins',
      description: 'Examiner-grade breakdown of quotes, poetic methods, and high-scoring essay structures.',
      type: 'walkthrough',
    });

  } else {
    // Economics, Business, History, Geography
    readingResources.push({
      id: 'sme-humanities',
      provider: 'Save My Exams',
      title: `${topicName} — Save My Exams Revision Guide`,
      type: 'notes',
      url: `https://www.savemyexams.com/search/?query=GCSE+${cleanSearch}`,
      description: 'Case studies, key terms, 9-mark/12-mark essay structure guides and model answers.',
      badge: 'Case Studies & Guides',
      badgeColor: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      isRecommended: true,
    });

    readingResources.push({
      id: 'pmt-humanities',
      provider: 'Physics & Maths Tutor (PMT)',
      title: `${topicName} — PMT Topic Worksheets`,
      type: 'questions',
      url: `https://www.physicsandmathstutor.com/?s=GCSE+${cleanSearch}`,
      description: 'Exam questions, definition glossaries and marking grids.',
      badge: 'Exam Practice & Mark Schemes',
      badgeColor: 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    });

    readingResources.push({
      id: 'bbc-humanities',
      provider: 'BBC Bitesize',
      title: `${topicName} — BBC Bitesize Overview`,
      type: 'notes',
      url: `https://www.bbc.co.uk/bitesize/search?q=GCSE+${cleanSearch}`,
      description: 'Historical timelines, geographical maps and business case studies.',
      badge: 'Overview & Quiz',
      badgeColor: 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    });

    videoTutorials.push({
      id: 'vid-tutor2u',
      title: `${topicName} — Masterclass Lesson`,
      creator: 'Tutor2u / YouTube',
      channelName: 'Tutor2u',
      url: `https://www.youtube.com/results?search_query=GCSE+${cleanSearch}+Revision`,
      youtubeQuery: `GCSE ${cleanSearch} Revision`,
      durationEstimate: '8–15 mins',
      description: 'Top teacher walkthrough breaking down key syllabus content and exam technique.',
      type: 'concept',
    });
  }

  return {
    topicId,
    topicName,
    subjectId,
    subjectName,
    tier: topic?.tier,
    quickActionPrompt: `Revise ${topicName} with official notes and videos from PMT, Save My Exams, Corbettmaths & Maths Genie:`,
    readingResources,
    videoTutorials,
    externalSearchUrl: `https://www.google.com/search?q=GCSE+${encodeURIComponent(subjectName)}+${cleanSearch}+revision+notes+past+papers`,
  };
}
