export class HackerNewsAPI {
  static async fetchTopStories(limit = 10) {
    try {
      const response = await fetch(
        'https://hacker-news.firebaseio.com/v0/topstories.json'
      );
      const storyIds = await response.json();
      const topStoryIds = storyIds.slice(0, limit);

      const storyPromises = topStoryIds.map((id) => this.fetchStory(id));
      const stories = await Promise.all(storyPromises);

      return stories.filter((story) => story !== null);
    } catch (error) {
      console.error('Failed to fetch Hacker News stories:', error);
      return [];
    }
  }

  static async fetchStory(id) {
    try {
      const response = await fetch(
        `https://hacker-news.firebaseio.com/v0/item/${id}.json`
      );
      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch story ${id}:`, error);
      return null;
    }
  }

  static formatTime(timestamp) {
    const diffMs = Date.now() - timestamp * 1000;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  }

  static formatScore(score) {
    if (score >= 1000) {
      return `${(score / 1000).toFixed(1)}k`;
    }
    return score.toString();
  }
}
