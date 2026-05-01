const clockTemplate = document.createElement('template');
clockTemplate.innerHTML = `
  <style>
    .clock-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-sm);
      margin-bottom: var(--space-lg);
      text-align: center;
    }

    .greeting {
      color: var(--color-text-subtle);
      font-size: 0.72rem;
      font-weight: var(--font-weight-normal);
      letter-spacing: 0.08em;
      text-transform: uppercase;
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
    <span class="greeting"></span>
    <time class="time"></time>
    <span class="date"></span>
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

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(clockTemplate.content.cloneNode(true));
    this.#greeting = this.shadowRoot.querySelector('.greeting');
    this.#time = this.shadowRoot.querySelector('.time');
    this.#date = this.shadowRoot.querySelector('.date');
    this.#updateClock();
    this.#interval = setInterval(() => this.#updateClock(), 1000);
  }

  disconnectedCallback() {
    if (this.#interval) clearInterval(this.#interval);
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
