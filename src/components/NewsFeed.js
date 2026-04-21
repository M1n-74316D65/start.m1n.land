import { HackerNewsAPI } from '../lib/HackerNewsAPI.js';

const STORY_TYPES = ['top', 'new', 'best', 'ask', 'show'];

const newsTemplate = document.createElement('template');
newsTemplate.innerHTML = `
  <style>
    .news-container {
      margin-top: 0;
      max-width: 48rem;
      width: 100%;
      outline: none;
    }

    .news-container:focus {
      outline: none;
    }

    .news-container:focus-visible {
      box-shadow: 0 0 0 1px var(--color-accent);
      border-radius: calc(var(--border-radius) + 0.2rem);
    }

    .news-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: calc(var(--space) * 0.6);
      padding: 0 calc(var(--space) * 0.3);
      flex-wrap: wrap;
      gap: calc(var(--space) * 0.5);
    }

    .news-title-section {
      display: flex;
      align-items: center;
      gap: calc(var(--space) * 0.75);
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

    .story-type-tabs {
      display: flex;
      align-items: center;
      gap: 0.15rem;
    }

    .story-type-tab {
      background: transparent;
      border: none;
      color: var(--color-text-muted);
      font-family: inherit;
      font-size: 0.65rem;
      font-weight: var(--font-weight-normal);
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 0.25rem 0.5rem;
      border-radius: var(--border-radius);
      cursor: pointer;
      transition: all var(--transition-speed) var(--transition-easing);
      position: relative;
    }

    .story-type-tab:hover {
      color: var(--color-text);
      background: var(--color-focus);
    }

    .story-type-tab.active {
      color: var(--color-accent);
      background: var(--color-accent-subtle);
    }

    .story-type-tab:focus-visible {
      outline: none;
      box-shadow: 0 0 0 1px var(--color-accent);
    }

    .story-type-tab .tab-key {
      opacity: 0.5;
      margin-left: 0.15rem;
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

    .refresh-btn:hover,
    .refresh-btn:focus-visible {
      border-color: var(--color-accent);
      color: var(--color-accent);
      box-shadow: 0 0 12px var(--color-accent-glow);
      outline: none;
    }

    .refresh-btn:hover svg,
    .refresh-btn:focus-visible svg {
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

    .news-item-wrapper {
      border-bottom: 1px solid var(--color-border);
      opacity: 0;
      transform: translateY(8px);
      animation: itemIn 0.3s var(--transition-easing) forwards;
    }

    .news-item-wrapper:nth-child(1) { animation-delay: 0.02s; }
    .news-item-wrapper:nth-child(2) { animation-delay: 0.04s; }
    .news-item-wrapper:nth-child(3) { animation-delay: 0.06s; }
    .news-item-wrapper:nth-child(4) { animation-delay: 0.08s; }
    .news-item-wrapper:nth-child(5) { animation-delay: 0.10s; }
    .news-item-wrapper:nth-child(6) { animation-delay: 0.12s; }
    .news-item-wrapper:nth-child(7) { animation-delay: 0.14s; }
    .news-item-wrapper:nth-child(8) { animation-delay: 0.16s; }
    .news-item-wrapper:nth-child(9) { animation-delay: 0.18s; }
    .news-item-wrapper:nth-child(10) { animation-delay: 0.20s; }

    @keyframes itemIn {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .news-item-wrapper:last-child {
      border-bottom: none;
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
      color: inherit;
      outline: 0;
    }

    .news-item:hover {
      color: var(--color-text);
      background: var(--color-focus);
    }

    .news-item.keyboard-focus {
      background: var(--color-accent-subtle);
    }

    .news-item.keyboard-focus .news-item-title-link {
      color: var(--color-text);
    }

    .news-item.keyboard-focus .comments-link,
    .news-item.keyboard-focus .time-badge,
    .news-item.keyboard-focus .news-item-domain {
      opacity: 1;
      color: var(--color-text);
    }

    .news-item-rank {
      color: var(--color-text-muted);
      font-size: 0.75rem;
      font-weight: var(--font-weight-bold);
      font-variant-numeric: tabular-nums;
      text-align: center;
      opacity: 0.5;
    }

    .news-item-wrapper.hot .news-item-rank {
      color: var(--color-accent);
      opacity: 0.8;
    }

    .news-item-wrapper.hot .score-badge {
      color: var(--color-accent);
    }

    .hot-indicator {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 6px;
      height: 6px;
      background: var(--color-accent);
      border-radius: 50%;
      margin-left: 0.4rem;
      box-shadow: 0 0 6px var(--color-accent-glow);
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 0.6; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.1); }
    }

    .keyboard-hint {
      position: fixed;
      bottom: calc(var(--space) * 1);
      right: calc(var(--space) * 1);
      background: var(--color-surface-elevated);
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius);
      padding: calc(var(--space) * 0.5) calc(var(--space) * 0.75);
      color: var(--color-text-subtle);
      font-size: 0.65rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      opacity: 0;
      transform: translateY(10px);
      transition: all var(--transition-speed) var(--transition-easing);
      pointer-events: none;
      z-index: 100;
    }

    .keyboard-hint.visible {
      opacity: 1;
      transform: translateY(0);
    }

    .keyboard-hint kbd {
      background: var(--color-focus);
      border: 1px solid var(--color-border);
      border-radius: 3px;
      padding: 0.1rem 0.35rem;
      font-family: inherit;
      font-size: 0.6rem;
      color: var(--color-text);
      margin: 0 0.1rem;
    }

    .news-item-content {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      min-width: 0;
    }

    .news-item-title-link {
      text-decoration: none;
      color: inherit;
      display: block;
    }

    .news-item-title-link:hover .news-item-title {
      color: var(--color-accent);
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
      text-decoration: none;
      cursor: pointer;
      transition: color var(--transition-speed) var(--transition-easing);
    }

    .comments-link:hover {
      color: var(--color-accent);
      opacity: 1;
    }

    .comments-link svg {
      width: 9px;
      height: 9px;
      fill: currentColor;
    }

    .news-item {
      user-select: none;
    }

    .news-item-title-link {
      user-select: text;
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

    @media (max-width: 699px) {
      .news-item {
        grid-template-columns: 2.25rem 1fr;
        align-items: start;
      }

      .news-item-stats {
        grid-column: 2;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        gap: calc(var(--space) * 0.75);
      }

      .news-item-title {
        -webkit-line-clamp: 3;
      }

      .news-item-domain {
        max-width: 10rem;
      }
    }

    @media (hover: none), (pointer: coarse) {
      .keyboard-hint {
        display: none;
      }
    }

    @media (max-height: 600px) {
      .keyboard-hint {
        position: static;
        margin-top: calc(var(--space) * 0.5);
        opacity: 1;
        transform: none;
      }
    }
  </style>
  <div class="news-container" tabindex="0" role="region" aria-label="Hacker News feed">
    <div class="news-header">
      <div class="news-title-section">
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
        <div class="story-type-tabs">
          <button class="story-type-tab active" data-type="top" data-key="1">
            Top<span class="tab-key">1</span>
          </button>
          <button class="story-type-tab" data-type="new" data-key="2">
            New<span class="tab-key">2</span>
          </button>
          <button class="story-type-tab" data-type="best" data-key="3">
            Best<span class="tab-key">3</span>
          </button>
          <button class="story-type-tab" data-type="ask" data-key="4">
            Ask<span class="tab-key">4</span>
          </button>
          <button class="story-type-tab" data-type="show" data-key="5">
            Show<span class="tab-key">5</span>
          </button>
        </div>
      </div>
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
    <div class="keyboard-hint">
      <kbd>↑</kbd><kbd>↓</kbd> navigate <kbd>↵</kbd> open <kbd>c</kbd> comments <kbd>1-5</kbd> switch
    </div>
  </div>
`;

const newsItemTemplate = document.createElement('template');
newsItemTemplate.innerHTML = `
  <li class="news-item-wrapper">
    <div class="news-item" tabindex="-1">
      <span class="news-item-rank"></span>
      <div class="news-item-content">
        <a class="news-item-title-link" target="_blank" rel="noopener noreferrer">
          <h3 class="news-item-title"></h3>
        </a>
        <div class="news-item-meta">
          <span class="news-item-domain"></span>
          <span class="meta-separator">·</span>
          <a class="comments-link" target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 1H2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3l3 3 3-3h3a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2z" />
            </svg>
            <span class="comments-count"></span>
          </a>
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
    </div>
  </li>
`;

export class NewsFeed extends HTMLElement {
  #container;
  #newsList;
  #loading;
  #refreshBtn;
  #cacheTime;
  #tabs;
  #keyboardHint;
  #stories = [];
  #currentType = 'top';
  #focusedIndex = -1;
  #CACHE_KEY_PREFIX = 'hacker-news-';
  #CACHE_DURATION = 30 * 60 * 1000;
  #HOT_SCORE_PER_HOUR = 30;
  #HOT_MIN_SCORE = 50;
  #keyboardListeners = [];
  #isFeedFocused = false;
  #hideHintTimeout;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(newsTemplate.content.cloneNode(true));
    this.#container = this.shadowRoot.querySelector('.news-container');
    this.#newsList = this.shadowRoot.querySelector('.news-list');
    this.#loading = this.shadowRoot.querySelector('.loading');
    this.#refreshBtn = this.shadowRoot.querySelector('.refresh-btn');
    this.#cacheTime = this.shadowRoot.querySelector('.cache-time');
    this.#tabs = this.shadowRoot.querySelectorAll('.story-type-tab');
    this.#keyboardHint = this.shadowRoot.querySelector('.keyboard-hint');
    this.#initializeEventListeners();
    this.#loadStories();
  }

  connectedCallback() {
    this.#setupKeyboardListeners();
  }

  disconnectedCallback() {
    this.#cleanupKeyboardListeners();
    clearTimeout(this.#hideHintTimeout);
  }

  #setupKeyboardListeners() {
    const handleKeyDown = (e) => {
      if (!this.isConnected) return;

      if (!this.#isFeedFocused && e.target !== this.#container) return;

      if (e.key >= '1' && e.key <= '5') {
        const typeIndex = parseInt(e.key) - 1;
        if (typeIndex < STORY_TYPES.length) {
          e.preventDefault();
          e.stopPropagation();
          this.#switchStoryType(STORY_TYPES[typeIndex]);
        }
      } else if (e.key === 'ArrowDown' || e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        e.stopPropagation();
        this.#navigateStory(1);
        this.#showKeyboardHint();
      } else if (e.key === 'ArrowUp' || e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        e.stopPropagation();
        this.#navigateStory(-1);
        this.#showKeyboardHint();
      } else if (e.key === 'Enter' && this.#focusedIndex >= 0) {
        e.preventDefault();
        e.stopPropagation();
        this.#openCurrentStory();
      } else if ((e.key === 'c' || e.key === 'C') && this.#focusedIndex >= 0) {
        e.preventDefault();
        e.stopPropagation();
        this.#openCurrentComments();
      } else if (e.key === 'Escape') {
        this.#clearFocus();
      }
    };

    const handleFocusIn = () => {
      this.#isFeedFocused = true;
      this.#showKeyboardHint();
    };

    const handleFocusOut = () => {
      requestAnimationFrame(() => {
        this.#isFeedFocused = Boolean(this.shadowRoot.activeElement);
      });
    };

    this.shadowRoot.addEventListener('keydown', handleKeyDown);
    this.shadowRoot.addEventListener('focusin', handleFocusIn);
    this.shadowRoot.addEventListener('focusout', handleFocusOut);
    this.#keyboardListeners.push(() => {
      this.shadowRoot.removeEventListener('keydown', handleKeyDown);
      this.shadowRoot.removeEventListener('focusin', handleFocusIn);
      this.shadowRoot.removeEventListener('focusout', handleFocusOut);
    });
  }

  #cleanupKeyboardListeners() {
    this.#keyboardListeners.forEach((remove) => remove());
    this.#keyboardListeners = [];
  }

  #navigateStory(direction) {
    const wrappers = this.shadowRoot.querySelectorAll('.news-item-wrapper');
    if (wrappers.length === 0) return;

    this.#focusedIndex += direction;
    if (this.#focusedIndex < 0) this.#focusedIndex = wrappers.length - 1;
    if (this.#focusedIndex >= wrappers.length) this.#focusedIndex = 0;

    wrappers.forEach((wrapper, index) => {
      const item = wrapper.querySelector('.news-item');
      if (item) {
        item.classList.toggle('keyboard-focus', index === this.#focusedIndex);
      }
    });

    const focusedWrapper = wrappers[this.#focusedIndex];
    if (focusedWrapper) {
      const item = focusedWrapper.querySelector('.news-item');
      if (item) {
        item.focus();
        item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }

  #clearFocus() {
    this.#focusedIndex = -1;
    const wrappers = this.shadowRoot.querySelectorAll('.news-item-wrapper');
    wrappers.forEach((wrapper) => {
      const item = wrapper.querySelector('.news-item');
      if (item) item.classList.remove('keyboard-focus');
    });
    this.#container.focus();
  }

  #openCurrentStory() {
    const wrappers = this.shadowRoot.querySelectorAll('.news-item-wrapper');
    if (this.#focusedIndex >= 0 && this.#focusedIndex < wrappers.length) {
      const titleLink = wrappers[this.#focusedIndex].querySelector(
        '.news-item-title-link'
      );
      if (titleLink && titleLink.href) window.open(titleLink.href, '_blank');
    }
  }

  #openCurrentComments() {
    const wrappers = this.shadowRoot.querySelectorAll('.news-item-wrapper');
    if (this.#focusedIndex >= 0 && this.#focusedIndex < wrappers.length) {
      const commentsLink =
        wrappers[this.#focusedIndex].querySelector('.comments-link');
      if (commentsLink && commentsLink.href) {
        window.open(commentsLink.href, '_blank');
      }
    }
  }

  #switchStoryType(type) {
    if (type === this.#currentType) return;
    this.#currentType = type;
    this.#focusedIndex = -1;

    this.#tabs.forEach((tab) => {
      tab.classList.toggle('active', tab.dataset.type === type);
    });

    this.#loadStories();
  }

  #showKeyboardHint() {
    this.#keyboardHint.classList.add('visible');
    this.#hideHintTimeout = setTimeout(() => {
      this.#keyboardHint.classList.remove('visible');
    }, 3000);
  }

  #isHotStory(story) {
    const ageHours = (Date.now() / 1000 - story.time) / 3600;
    const scorePerHour = story.score / Math.max(ageHours, 0.5);
    return (
      scorePerHour > this.#HOT_SCORE_PER_HOUR &&
      story.score > this.#HOT_MIN_SCORE
    );
  }

  #getCacheKey() {
    return `${this.#CACHE_KEY_PREFIX}${this.#currentType}`;
  }

  #initializeEventListeners() {
    this.#refreshBtn.addEventListener('click', () => {
      this.#loadStories(true);
    });

    this.#tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        this.#switchStoryType(tab.dataset.type);
      });
    });

    this.#container.addEventListener('mouseenter', () => {
      if (window.matchMedia('(hover: hover)').matches) {
        this.#showKeyboardHint();
      }
    });

    this.#container.addEventListener('click', () => {
      this.#container.focus();
    });
  }

  #isCacheValid() {
    try {
      const cached = localStorage.getItem(this.#getCacheKey());
      if (!cached) return false;

      const { timestamp } = JSON.parse(cached);
      return Date.now() - timestamp < this.#CACHE_DURATION;
    } catch {
      return false;
    }
  }

  #getCachedStories() {
    try {
      const cached = localStorage.getItem(this.#getCacheKey());
      return JSON.parse(cached);
    } catch {
      return null;
    }
  }

  #updateCacheTimeDisplay() {
    try {
      const cached = localStorage.getItem(this.#getCacheKey());
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
        type: this.#currentType,
      };
      localStorage.setItem(this.#getCacheKey(), JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to cache stories:', error);
    }
  }

  async #loadStories(forceRefresh = false) {
    this.#refreshBtn.disabled = true;
    this.#loading.style.display = 'flex';
    this.#newsList.style.display = 'none';
    this.#focusedIndex = -1;

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

      this.#stories = await HackerNewsAPI.fetchStories(this.#currentType, 10);
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
        this.#loading.innerHTML =
          '<span class="error">Showing cached stories (offline)</span>';
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
      const wrapper = clone.querySelector('.news-item-wrapper');
      const newsItem = clone.querySelector('.news-item');
      const titleLink = clone.querySelector('.news-item-title-link');
      const rank = clone.querySelector('.news-item-rank');
      const title = clone.querySelector('.news-item-title');
      const domain = clone.querySelector('.news-item-domain');
      const score = clone.querySelector('.score');
      const time = clone.querySelector('.time-badge');
      const commentsCount = clone.querySelector('.comments-count');

      const storyUrl =
        story.url || `https://news.ycombinator.com/item?id=${story.id}`;
      titleLink.href = storyUrl;
      newsItem.dataset.index = index;
      rank.textContent = `${index + 1}`;
      title.textContent = story.title;

      if (this.#isHotStory(story)) {
        wrapper.classList.add('hot');
        const hotIndicator = document.createElement('span');
        hotIndicator.className = 'hot-indicator';
        hotIndicator.title = 'Hot story';
        title.appendChild(hotIndicator);
      }

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
      commentsCount.textContent = `${story.descendants || 0}`;

      const commentsLink = clone.querySelector('.comments-link');
      if (commentsLink) {
        commentsLink.href = `https://news.ycombinator.com/item?id=${story.id}`;
        commentsLink.target = '_blank';
        commentsLink.rel = 'noopener noreferrer';
      }

      fragment.appendChild(clone);
    });

    this.#newsList.replaceChildren(fragment);
  }
}

customElements.define('news-feed-component', NewsFeed);
