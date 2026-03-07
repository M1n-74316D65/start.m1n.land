import { workspaceManager } from '../lib/WorkspaceManager.js';

const clockTemplate = document.createElement('template');
clockTemplate.innerHTML = `
  <style>
    .clock-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: calc(var(--space) * 0.35);
      margin-bottom: calc(var(--space) * 2.5);
    }

    .greeting {
      color: var(--color-text-subtle);
      font-size: 0.75rem;
      font-weight: var(--font-weight-normal);
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .time {
      color: var(--color-text);
      font-size: clamp(2.5rem, 7vw, 4rem);
      font-weight: 600;
      letter-spacing: 0.02em;
      line-height: 1;
      font-variant-numeric: tabular-nums;
      transition: opacity var(--transition-speed-fast) var(--transition-easing);
    }

    .date {
      color: var(--color-text-subtle);
      font-size: 0.75rem;
      font-weight: var(--font-weight-normal);
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .keyboard-hint {
      color: var(--color-text-subtle);
      font-size: 0.7rem;
      margin-top: calc(var(--space) * 1.25);
      opacity: 0.6;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
      justify-content: center;
    }

    .keyboard-hint kbd {
      background: transparent;
      padding: 0.2rem 0.45rem;
      border-radius: 0;
      border: 1px solid var(--color-text-subtle);
      font-family: inherit;
      font-size: 0.7rem;
    }

    .hint-group {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .hint-separator {
      margin: 0 0.5rem;
    }
  </style>
  <div class="clock-container">
    <span class="greeting"></span>
    <time class="time"></time>
    <span class="date"></span>
    <div class="keyboard-hint">
      <span class="hint-group">
        <kbd>⌘</kbd>
        <kbd class="workspace-hint"></kbd>
        <span>switch workspace</span>
      </span>
      <span class="hint-separator">·</span>
      <span class="hint-group">
        <kbd>type</kbd>
        <span>search</span>
      </span>
    </div>
  </div>
`;

export class Clock extends HTMLElement {
  #greeting;
  #time;
  #date;
  #interval;
  #lastHours = -1;
  #lastMinutes = -1;
  #lastDate = '';
  #workspaceHint;
  #boundWorkspaceChange;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(clockTemplate.content.cloneNode(true));
    this.#greeting = this.shadowRoot.querySelector('.greeting');
    this.#time = this.shadowRoot.querySelector('.time');
    this.#date = this.shadowRoot.querySelector('.date');
    this.#workspaceHint = this.shadowRoot.querySelector('.workspace-hint');
    this.#updateWorkspaceHint();
    this.#updateClock();
    this.#interval = setInterval(() => this.#updateClock(), 1000);
    this.#boundWorkspaceChange = this.#updateWorkspaceHint.bind(this);
    window.addEventListener('workspacechange', this.#boundWorkspaceChange);
  }

  disconnectedCallback() {
    if (this.#interval) clearInterval(this.#interval);
    if (this.#boundWorkspaceChange) {
      window.removeEventListener('workspacechange', this.#boundWorkspaceChange);
    }
  }

  #updateWorkspaceHint() {
    if (this.#workspaceHint) {
      const count = workspaceManager.workspaces.length;
      if (count === 1) {
        this.#workspaceHint.textContent = '1';
      } else {
        this.#workspaceHint.textContent = `1-${count}`;
      }
    }
  }

  #updateClock() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;
    const greeting = this.#getGreeting(hours);
    const dateStr = now.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });

    if (this.#lastHours !== hours || this.#lastMinutes !== minutes) {
      this.#time.textContent = timeStr;
      this.#greeting.textContent = greeting;
      this.#lastHours = hours;
      this.#lastMinutes = minutes;
    }

    if (this.#lastDate !== dateStr) {
      this.#date.textContent = dateStr;
      this.#lastDate = dateStr;
    }
  }

  #getGreeting(hours) {
    if (hours >= 5 && hours < 12) return 'Good morning';
    if (hours >= 12 && hours < 17) return 'Good afternoon';
    if (hours >= 17 && hours < 21) return 'Good evening';
    return 'Good night';
  }
}

customElements.define('clock-component', Clock);
