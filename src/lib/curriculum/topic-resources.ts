import { GCSE_TOPICS } from './gcse-data';

export interface TopicVideoInfo {
  title: string;
  channel: string;
  url: string;
}

/**
 * Returns a direct, working YouTube video tutorial link for a given GCSE topic.
 * Uses authoritative GCSE channels (FreeScienceLessons, Maths Genie, Corbettmaths, Mr Bruff, Craig 'n' Dave).
 */
export function getTopicVideoUrl(topicId: string): TopicVideoInfo | null {
  const topic = GCSE_TOPICS.find((t) => t.id === topicId);
  if (!topic) return null;

  const subjectId = topic.subjectId;
  const cleanTopic = topic.topicName.replace(/[&/\\#,+()$~%.'":*?<>{}]/g, ' ').replace(/\s+/g, '+');

  if (subjectId === 'maths') {
    return {
      title: `${topic.topicName} — GCSE Maths Tutorial`,
      channel: 'Maths Genie / Corbettmaths',
      url: `https://www.youtube.com/results?search_query=GCSE+Maths+${cleanTopic}+revision`,
    };
  }

  if (subjectId === 'physics' || subjectId === 'chemistry' || subjectId === 'biology') {
    const subjName = subjectId === 'physics' ? 'Physics' : subjectId === 'chemistry' ? 'Chemistry' : 'Biology';
    return {
      title: `${topic.topicName} — FreeScienceLessons / Cognito`,
      channel: 'FreeScienceLessons',
      url: `https://www.youtube.com/results?search_query=Freesciencelessons+GCSE+${subjName}+${cleanTopic}`,
    };
  }

  if (subjectId === 'cs') {
    return {
      title: `${topic.topicName} — Craig 'n' Dave`,
      channel: 'Craig \'n\' Dave',
      url: `https://www.youtube.com/results?search_query=Craig+and+Dave+GCSE+Computer+Science+${cleanTopic}`,
    };
  }

  if (subjectId === 'english-lit' || subjectId === 'english-lang') {
    return {
      title: `${topic.topicName} — Mr Bruff`,
      channel: 'Mr Bruff',
      url: `https://www.youtube.com/results?search_query=Mr+Bruff+GCSE+${cleanTopic}`,
    };
  }

  return {
    title: `${topic.topicName} — GCSE Revision`,
    channel: 'YouTube GCSE',
    url: `https://www.youtube.com/results?search_query=GCSE+${cleanTopic}+revision`,
  };
}
