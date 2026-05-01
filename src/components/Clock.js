import { workspaceManager } from '../lib/WorkspaceManager.js';

const clockTemplate = document.createElement('template');
clockTemplate.innerHTML = `
  <style>
    .clock-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-xs);
      margin-bottom: var(--space-lg);
      text-align: center;
    }

    .greeting-line {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      color: var(--color-text-subtle);
      font-size: 0.72rem;
      font-weight: var(--font-weight-normal);
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .greeting {
      color: inherit;
    }

    .workspace-status {
      color: var(--color-accent);
      letter-spacing: 0.12em;
    }

    .time {
      color: var(--color-text);
      font-size: clamp(2.5rem, 7vw, 4rem);
      font-weight: var(--font-weight-bold);
      letter-spacing: 0.02em;
      line-height: 1;
      font-variant-numeric: tabular-nums;
    }

    .date {
      color: var(--color-text-subtle);
      font-size: 0.72rem;
      font-weight: var(--font-weight-normal);
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

  </style>
  <div class="clock-container">
    <div class="greeting-line">
      <span class="greeting"></span>
      <span class="workspace-status"></span>
    </div>
    <time class="time"></time>
    <span class="date"></span>
  </div>
`;

export class Clock extends HTMLElement {
  #greeting;
  #time;
  #date;
  #workspaceStatus;
  #interval;
  #lastHours = -1;
  #lastMinutes = -1;
  #lastDate = '';
  #boundWorkspaceChange;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(clockTemplate.content.cloneNode(true));
    this.#greeting = this.shadowRoot.querySelector('.greeting');
    this.#time = this.shadowRoot.querySelector('.time');
    this.#date = this.shadowRoot.querySelector('.date');
    this.#workspaceStatus = this.shadowRoot.querySelector('.workspace-status');
    this.#updateWorkspaceStatus();
    this.#updateClock();
    this.#interval = setInterval(() => this.#updateClock(), 1000);
    this.#boundWorkspaceChange = () => {
      this.#updateWorkspaceStatus();
    };
    window.addEventListener('workspacechange', this.#boundWorkspaceChange);
  }

  disconnectedCallback() {
    if (this.#interval) clearInterval(this.#interval);
    if (this.#boundWorkspaceChange) {
      window.removeEventListener('workspacechange', this.#boundWorkspaceChange);
    }
  }

  #updateWorkspaceStatus() {
    if (!this.#workspaceStatus) return;

    const workspaceName = workspaceManager.activeWorkspace?.name || 'Personal';
    this.#workspaceStatus.textContent = `${workspaceName} ready`;
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
