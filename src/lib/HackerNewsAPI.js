const STORY_TYPES = {
  top: 'topstories',
  new: 'newstories',
  best: 'beststories',
  ask: 'askstories',
  show: 'showstories',
  jobs: 'jobstories',
};

const STORY_TYPE_NAMES = {
  top: 'Top',
  new: 'New',
  best: 'Best',
  ask: 'Ask',
  show: 'Show',
  jobs: 'Jobs',
};

async function fetchStories(type = 'top', limit = 10) {
  const endpoint = STORY_TYPES[type];
  if (!endpoint) {
    throw new Error(`Unknown story type: ${type}`);
  }

  try {
    const response = await fetch(
      `https://hacker-news.firebaseio.com/v0/${endpoint}.json`
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const storyIds = await response.json();
    const topStoryIds = storyIds.slice(0, limit);

    const storyPromises = topStoryIds.map((id) => fetchStory(id));
    const stories = await Promise.all(storyPromises);

    return stories.filter((story) => story !== null);
  } catch (error) {
    console.error(`Failed to fetch Hacker News ${type} stories:`, error);
    return [];
  }
}

async function fetchTopStories(limit = 10) {
  return fetchStories('top', limit);
}

async function fetchStory(id) {
  try {
    const response = await fetch(
      `https://hacker-news.firebaseio.com/v0/item/${id}.json`
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch story ${id}:`, error);
    return null;
  }
}

function formatTime(timestamp) {
  const diffMs = Date.now() - timestamp * 1000;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

function formatScore(score) {
  if (score >= 1000) {
    return `${(score / 1000).toFixed(1)}k`;
  }
  return score.toString();
}

export const HackerNewsAPI = {
  STORY_TYPES,
  STORY_TYPE_NAMES,
  fetchStories,
  fetchTopStories,
  fetchStory,
  formatTime,
  formatScore,
};
