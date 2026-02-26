import { HackerNewsAPI } from '../lib/HackerNewsAPI.js';

const newsTemplate = document.createElement('template');
newsTemplate.innerHTML = `
  <style>
    .news-container {
      margin-top: 0;
      max-width: 48rem;
      width: 100%;
    }

    .news-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: calc(var(--space) * 0.6);
      padding: 0 calc(var(--space) * 0.3);
    }

    .news-title {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      color: var(--color-text-subtle);
      text-decoration: none;
      font-size: 0.7rem;
      font-weight: var(--font-weight-bold);
      letter-spacing: 0.12em;
      text-transform: uppercase;
      transition: color var(--transition-speed) var(--transition-easing);
    }

    .news-title:hover {
      color: var(--color-text);
    }

    .news-title svg {
      width: 12px;
      height: 12px;
      fill: currentColor;
      opacity: 0.7;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .cache-time {
      color: var(--color-text-subtle);
      font-size: 0.65rem;
      opacity: 0.6;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .refresh-btn {
      background: transparent;
      border: 1px solid var(--color-border);
      color: var(--color-text-subtle);
      padding: 0.35rem;
      border-radius: var(--border-radius);
      cursor: pointer;
      transition: 
        all var(--transition-speed) var(--transition-easing),
        box-shadow var(--transition-speed) var(--transition-easing);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .refresh-btn svg {
      width: 12px;
      height: 12px;
      fill: currentColor;
      transition: transform 0.5s var(--transition-easing);
    }

    .refresh-btn:hover {
      border-color: var(--color-accent);
      color: var(--color-accent);
      box-shadow: 0 0 12px var(--color-accent-glow);
    }

    .refresh-btn:hover svg {
      transform: rotate(180deg);
    }

    .refresh-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .refresh-btn:disabled svg {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .news-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 0;
      background: transparent;
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius);
      overflow: hidden;
    }

    .news-item {
      display: grid;
      grid-template-columns: 2.5rem 1fr auto;
      align-items: center;
      gap: calc(var(--space) * 0.6);
      padding: calc(var(--space) * 0.6) calc(var(--space) * 0.85);
      background: transparent;
      transition: 
        all var(--transition-speed) var(--transition-easing),
        background var(--transition-speed) var(--transition-easing);
      text-decoration: none;
      color: inherit;
      outline: 0;
      border-bottom: 1px solid var(--color-border);
      opacity: 0;
      transform: translateY(8px);
      animation: itemIn 0.3s var(--transition-easing) forwards;
    }

    .news-item:nth-child(1) { animation-delay: 0.02s; }
    .news-item:nth-child(2) { animation-delay: 0.04s; }
    .news-item:nth-child(3) { animation-delay: 0.06s; }
    .news-item:nth-child(4) { animation-delay: 0.08s; }
    .news-item:nth-child(5) { animation-delay: 0.10s; }
    .news-item:nth-child(6) { animation-delay: 0.12s; }
    .news-item:nth-child(7) { animation-delay: 0.14s; }
    .news-item:nth-child(8) { animation-delay: 0.16s; }
    .news-item:nth-child(9) { animation-delay: 0.18s; }
    .news-item:nth-child(10) { animation-delay: 0.20s; }

    @keyframes itemIn {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .news-item:hover {
      color: var(--color-text);
      background: var(--color-focus);
      border-color: var(--color-text-muted);
    }

    .news-item:focus {
      outline: none;
      background: var(--color-accent-subtle);
      border-color: var(--color-accent);
    }

    .news-item:focus .news-item-title {
      color: var(--color-text);
    }

    .news-item:active {
      transform: scale(0.99);
    }

    .news-item:last-child {
      border-bottom: none;
    }

    .news-item-rank {
      color: var(--color-text-muted);
      font-size: 0.75rem;
      font-weight: var(--font-weight-bold);
      font-variant-numeric: tabular-nums;
      text-align: center;
      opacity: 0.5;
    }

    .news-item-content {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      min-width: 0;
    }

    .news-item-title {
      color: var(--color-text);
      font-size: 0.82rem;
      font-weight: var(--font-weight-normal);
      line-height: 1.4;
      margin: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      transition: color var(--transition-speed) var(--transition-easing);
    }

    .news-item-meta {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      color: var(--color-text-subtle);
      font-size: 0.65rem;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .news-item-domain {
      opacity: 0.7;
      max-width: 150px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .meta-separator {
      opacity: 0.3;
    }

    .news-item-stats {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.2rem;
      flex-shrink: 0;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .score-badge {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      color: var(--color-accent);
      font-size: 0.7rem;
      font-weight: var(--font-weight-bold);
      font-variant-numeric: tabular-nums;
    }

    .score-badge svg {
      width: 9px;
      height: 9px;
      fill: currentColor;
    }

    .time-badge {
      color: var(--color-text-subtle);
      font-size: 0.65rem;
      opacity: 0.7;
    }

    .comments-link {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      color: var(--color-text-subtle);
      font-size: 0.65rem;
      opacity: 0.7;
    }

    .comments-link svg {
      width: 9px;
      height: 9px;
      fill: currentColor;
    }

    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: calc(var(--space) * 2);
      background: transparent;
      border-radius: var(--border-radius);
      border: 1px solid var(--color-border);
    }

    .loading-spinner {
      width: 24px;
      height: 24px;
      border: 2px solid var(--color-border);
      border-top-color: var(--color-accent);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .loading-text {
      color: var(--color-text-subtle);
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .skeleton {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .skeleton-row {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .skeleton-rank {
      width: 1.5rem;
      height: 1rem;
      background: var(--color-focus);
      border-radius: 2px;
    }

    .skeleton-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }

    .skeleton-title {
      height: 0.9rem;
      background: var(--color-focus);
      border-radius: 2px;
      width: 80%;
    }

    .skeleton-meta {
      height: 0.6rem;
      background: var(--color-focus);
      border-radius: 2px;
      width: 40%;
    }

    .skeleton-score {
      width: 2rem;
      height: 0.7rem;
      background: var(--color-focus);
      border-radius: 2px;
    }

    @keyframes skeletonPulse {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 0.7; }
    }

    .skeleton-rank,
    .skeleton-title,
    .skeleton-meta,
    .skeleton-score {
      animation: skeletonPulse 1.5s ease-in-out infinite;
    }

    .error {
      text-align: center;
      color: var(--color-text-subtle);
      padding: calc(var(--space) * 1.5);
      font-size: 0.75rem;
      background: transparent;
      border-radius: var(--border-radius);
      border: 1px solid var(--color-border);
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .retry-btn {
      background: transparent;
      border: 1px solid var(--color-border);
      color: var(--color-text-subtle);
      padding: 0.3rem 0.75rem;
      border-radius: var(--border-radius);
      margin-left: 0.5rem;
      cursor: pointer;
      font-size: 0.7rem;
      transition: 
        all var(--transition-speed) var(--transition-easing),
        box-shadow var(--transition-speed) var(--transition-easing);
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .retry-btn:hover {
      border-color: var(--color-accent);
      color: var(--color-accent);
      box-shadow: 0 0 12px var(--color-accent-glow);
    }

    @media (min-width: 700px) {
      .news-item {
        grid-template-columns: 2.5rem 1fr auto;
        padding: calc(var(--space) * 0.7) calc(var(--space) * 1);
      }

      .news-item-title {
        font-size: 0.85rem;
        -webkit-line-clamp: 1;
      }

      .news-item-stats {
        flex-direction: row;
        gap: var(--space);
      }
    }
  </style>
  <div class="news-container">
    <div class="news-header">
      <a
        href="https://news.ycombinator.com"
        target="_blank"
        rel="noopener noreferrer"
        class="news-title"
      >
        <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 0v16h16V0H0zm8.8 9.6V14H7.2V9.6L3.6 2h1.8l3.6 6 3.6-6h1.8L8.8 9.6z" />
        </svg>
        Hacker News
      </a>
      <div class="header-actions">
        <span class="cache-time"></span>
        <button class="refresh-btn" type="button" title="Refresh stories">
          <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.65 2.35A8 8 0 1 0 16 8h-2a6 6 0 1 1-1.76-4.24L10 6h6V0l-2.35 2.35z" />
          </svg>
        </button>
      </div>
    </div>
    <ul class="news-list"></ul>
    <div class="loading">
      <div class="loading-spinner"></div>
      <span class="loading-text">Loading stories...</span>
    </div>
  </div>
`;

const newsItemTemplate = document.createElement('template');
newsItemTemplate.innerHTML = `
  <li>
    <a class="news-item" target="_blank" rel="noopener noreferrer">
      <span class="news-item-rank"></span>
      <div class="news-item-content">
        <h3 class="news-item-title"></h3>
        <div class="news-item-meta">
          <span class="news-item-domain"></span>
          <span class="meta-separator">·</span>
          <span class="comments-link">
            <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 1H2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3l3 3 3-3h3a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2z" />
            </svg>
            <span class="comments-count"></span>
          </span>
        </div>
      </div>
      <div class="news-item-stats">
        <div class="score-badge">
          <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 0l2.5 5 5.5.8-4 3.9.9 5.5L8 12.5l-4.9 2.7.9-5.5-4-3.9L5.5 5z" />
          </svg>
          <span class="score"></span>
        </div>
        <span class="time-badge"></span>
      </div>
    </a>
  </li>
`;

export class NewsFeed extends HTMLElement {
  #container;
  #newsList;
  #loading;
  #refreshBtn;
  #cacheTime;
  #stories = [];
  #CACHE_KEY = 'hacker-news-stories';
  #CACHE_DURATION = 30 * 60 * 1000;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(newsTemplate.content.cloneNode(true));
    this.#container = this.shadowRoot.querySelector('.news-container');
    this.#newsList = this.shadowRoot.querySelector('.news-list');
    this.#loading = this.shadowRoot.querySelector('.loading');
    this.#refreshBtn = this.shadowRoot.querySelector('.refresh-btn');
    this.#cacheTime = this.shadowRoot.querySelector('.cache-time');
    this.#initializeEventListeners();
    this.#loadStories();
  }

  #initializeEventListeners() {
    this.#refreshBtn.addEventListener('click', () => {
      this.#loadStories(true);
    });
  }

  #isCacheValid() {
    try {
      const cached = localStorage.getItem(this.#CACHE_KEY);
      if (!cached) return false;

      const { timestamp } = JSON.parse(cached);
      return Date.now() - timestamp < this.#CACHE_DURATION;
    } catch {
      return false;
    }
  }

  #getCachedStories() {
    try {
      const cached = localStorage.getItem(this.#CACHE_KEY);
      return JSON.parse(cached);
    } catch {
      return null;
    }
  }

  #updateCacheTimeDisplay() {
    try {
      const cached = localStorage.getItem(this.#CACHE_KEY);
      if (cached) {
        const { timestamp } = JSON.parse(cached);
        const minutes = Math.floor((Date.now() - timestamp) / 60000);
        if (minutes < 1) {
          this.#cacheTime.textContent = 'just now';
        } else if (minutes === 1) {
          this.#cacheTime.textContent = '1m ago';
        } else {
          this.#cacheTime.textContent = `${minutes}m ago`;
        }
      }
    } catch {
      this.#cacheTime.textContent = '';
    }
  }

  #setCachedStories(stories) {
    try {
      const cacheData = {
        stories,
        timestamp: Date.now(),
      };
      localStorage.setItem(this.#CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to cache stories:', error);
    }
  }

  async #loadStories(forceRefresh = false) {
    this.#refreshBtn.disabled = true;
    this.#loading.style.display = 'flex';
    this.#newsList.style.display = 'none';

    try {
      if (!forceRefresh && this.#isCacheValid()) {
        const cached = this.#getCachedStories();
        if (cached && cached.stories && cached.stories.length > 0) {
          this.#stories = cached.stories;
          this.#renderStories();
          this.#updateCacheTimeDisplay();
          this.#loading.style.display = 'none';
          this.#newsList.style.display = 'flex';
          this.#refreshBtn.disabled = false;
          return;
        }
      }

      this.#stories = await HackerNewsAPI.fetchTopStories(10);
      this.#setCachedStories(this.#stories);
      this.#renderStories();
      this.#updateCacheTimeDisplay();
      this.#loading.style.display = 'none';
      this.#newsList.style.display = 'flex';
    } catch (error) {
      console.error('Failed to load stories:', error);

      const cached = this.#getCachedStories();
      if (cached && cached.stories && cached.stories.length > 0) {
        this.#stories = cached.stories;
        this.#renderStories();
        this.#loading.innerHTML = '<span class="error">Showing cached stories (offline)</span>';
      } else {
        this.#loading.innerHTML = `
          <span class="error">
            Failed to load stories
            <button class="retry-btn">Retry</button>
          </span>
        `;
        const retryBtn = this.#loading.querySelector('.retry-btn');
        if (retryBtn) {
          retryBtn.addEventListener('click', () => {
            this.#loadStories(true);
          });
        }
      }
    } finally {
      this.#refreshBtn.disabled = false;
    }
  }

  #renderStories() {
    const fragment = document.createDocumentFragment();

    this.#stories.forEach((story, index) => {
      const clone = newsItemTemplate.content.cloneNode(true);
      const newsItem = clone.querySelector('.news-item');
      const rank = clone.querySelector('.news-item-rank');
      const title = clone.querySelector('.news-item-title');
      const domain = clone.querySelector('.news-item-domain');
      const score = clone.querySelector('.score');
      const time = clone.querySelector('.time-badge');
      const commentsCount = clone.querySelector('.comments-count');

      newsItem.href =
        story.url || `https://news.ycombinator.com/item?id=${story.id}`;
      rank.textContent = `${index + 1}`;
      title.textContent = story.title;

      if (story.url) {
        try {
          const url = new URL(story.url);
          domain.textContent = url.hostname.replace(/^www\./, '');
        } catch {
          domain.textContent = '';
        }
      } else {
        domain.textContent = 'news.ycombinator.com';
      }

      score.textContent = HackerNewsAPI.formatScore(story.score || 0);
      time.textContent = HackerNewsAPI.formatTime(story.time || 0);
      commentsCount.textContent = story.descendants || 0;

      fragment.appendChild(clone);
    });

    this.#newsList.replaceChildren(fragment);
  }
}

customElements.define('news-feed-component', NewsFeed);
