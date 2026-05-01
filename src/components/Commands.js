import { workspaceManager } from '../lib/WorkspaceManager.js';
import { UsageTracker } from '../lib/UsageTracker.js';
import { CONFIG } from '../config.js';

const commandsTemplate = document.createElement('template');
commandsTemplate.innerHTML = `
  <style>
    .commands-shell {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
      width: 100%;
    }

    .quick-access {
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
      width: 100%;
      opacity: 0;
      transform: translateY(-4px);
      animation: fadeInUp var(--duration-normal) var(--ease-spring) forwards;
    }

    @keyframes fadeInUp {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .quick-access-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-sm);
      color: var(--color-text-subtle);
      font-size: 0.65rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      padding: 0 var(--space-xs);
    }

    .quick-access-list {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-sm);
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .quick-access-item {
      margin: 0;
    }

    .quick-link {
      display: inline-flex;
      align-items: center;
      gap: var(--space-xs);
      padding: var(--space-xs) var(--space-sm);
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius-full);
      background: color-mix(in srgb, var(--color-surface-elevated) 70%, transparent);
      color: var(--color-text-subtle);
      text-decoration: none;
      transition:
        border-color var(--duration-normal) var(--ease-spring),
        color var(--duration-normal) var(--ease-spring),
        background var(--duration-normal) var(--ease-spring),
        transform var(--duration-fast) var(--ease-spring);
    }

    .quick-link:hover,
    .quick-link:focus-visible {
      color: var(--color-text);
      border-color: var(--color-accent);
      background: var(--color-accent-subtle);
      transform: translateY(-1px);
      outline: none;
    }

    .quick-link:focus-visible {
      box-shadow: 0 0 0 1px var(--color-accent-glow);
    }

    .quick-key {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1.3rem;
      height: 1.3rem;
      border-radius: var(--border-radius-full);
      border: 1px solid var(--color-accent);
      color: var(--color-accent);
      font-size: 0.62rem;
      font-weight: var(--font-weight-bold);
      line-height: 1;
      flex-shrink: 0;
    }

    .quick-name {
      font-size: 0.68rem;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .commands {
      display: grid;
      gap: 1px;
      list-style: none;
      margin: 0 auto;
      padding: 0;
      width: 100%;
      background: var(--color-border);
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius);
      overflow: hidden;
      opacity: 0;
      transform: translateY(4px);
      animation: gridFadeIn var(--duration-slow) var(--ease-spring) forwards;
    }

    @keyframes gridFadeIn {
      from { 
        opacity: 0; 
        transform: translateY(4px); 
      }
      to { 
        opacity: 1; 
        transform: translateY(0); 
      }
    }

    .command {
      display: flex;
      gap: var(--space-sm);
      outline: 0;
      padding: var(--space-md);
      position: relative;
      text-decoration: none;
      min-height: 44px;
      align-items: center;
      background: var(--color-background);
      transition: 
        background var(--duration-normal) var(--ease-spring),
        transform var(--duration-fast) var(--ease-spring),
        box-shadow var(--duration-normal) var(--ease-spring);
    }

    .command:hover {
      color: var(--color-text);
      background: var(--color-focus);
    }

    .command:focus-visible {
      outline: none;
      background: var(--color-accent-subtle);
      z-index: 1;
    }

    .command:focus-visible::before {
      content: '';
      position: absolute;
      inset: 0;
      border: 1px solid var(--color-accent);
      border-radius: var(--border-radius);
      pointer-events: none;
    }

    .command:active {
      transform: scale(0.98);
      transition: transform var(--duration-fast) var(--ease-spring);
      background: var(--color-accent-subtle);
    }

    .command:hover .key {
      background: var(--color-accent-glow);
      border-color: var(--color-accent);
      box-shadow: 0 0 12px var(--color-accent-glow);
    }

    .command:focus-visible .key {
      background: var(--color-accent);
      color: var(--color-background);
      border-color: var(--color-accent);
      box-shadow: 0 0 16px var(--color-accent-glow);
    }

    .key {
      color: var(--color-accent);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1.7rem;
      height: 1.7rem;
      font-weight: var(--font-weight-bold);
      font-size: 0.75rem;
      letter-spacing: 0.04em;
      background: transparent;
      border: 1px solid var(--color-accent);
      border-radius: var(--border-radius);
      flex-shrink: 0;
      transition: 
        all var(--duration-normal) var(--ease-spring),
        box-shadow var(--duration-normal) var(--ease-spring);
    }

    .name {
      color: var(--color-text-subtle);
      transition: 
        color var(--duration-normal) var(--ease-spring),
        transform var(--duration-normal) var(--ease-spring);
      letter-spacing: 0.03em;
      font-size: 0.82rem;
      text-transform: uppercase;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .command:hover .name {
      color: var(--color-text);
      transform: translateX(2px);
    }

    .command:focus-visible .name {
      color: var(--color-text);
    }

    @media (min-width: 900px) {
      .command {
        padding: var(--space-md) var(--space-lg);
      }
    }
  </style>
  <div class="commands-shell">
    <section class="quick-access" hidden>
      <div class="quick-access-header">
        <span class="quick-access-title">Recent</span>
      </div>
      <ul class="quick-access-list"></ul>
    </section>
    <nav aria-label="Workspace shortcuts">
      <menu class="commands"></menu>
    </nav>
  </div>
`;

const commandTemplate = document.createElement('template');
commandTemplate.innerHTML = `
  <li>
    <a class="command" rel="noopener noreferrer">
      <span class="key"></span>
      <span class="name"></span>
    </a>
  </li>
`;

export class Commands extends HTMLElement {
  #activeWorkspaceId;
  #dynamicStyle;
  #boundWorkspaceChange;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.#dynamicStyle = document.createElement('style');
    this.shadowRoot.appendChild(this.#dynamicStyle);
    this.shadowRoot.appendChild(commandsTemplate.content.cloneNode(true));
    this.#activeWorkspaceId = workspaceManager.activeWorkspaceId;
    this.#initializeEventListeners();
  }

  connectedCallback() {
    this.render();
  }

  #calculateOptimalColumns(count, maxCols) {
    if (count <= 1) return 1;

    const minCols = 2;
    const effectiveMax = Math.min(maxCols, count);

    let bestCols = minCols;
    let minEmpty = Infinity;

    for (let c = minCols; c <= effectiveMax; c++) {
      const rows = Math.ceil(count / c);
      const empty = rows * c - count;

      if (empty < minEmpty) {
        minEmpty = empty;
        bestCols = c;
      } else if (empty === minEmpty) {
        bestCols = c;
      }
    }

    return bestCols;
  }

  #generateGridCSS(cols) {
    return `
      .commands {
        grid-template-columns: repeat(${cols}, 1fr);
        max-width: ${cols * 12}rem;
      }
    `;
  }

  #updateGridStyles(count) {
    const colsMobile = this.#calculateOptimalColumns(count, 3);
    const colsTablet = this.#calculateOptimalColumns(count, 4);
    const colsDesktop = this.#calculateOptimalColumns(count, 6);

    this.#dynamicStyle.textContent = `
      @media (max-width: 599px) {
        ${this.#generateGridCSS(colsMobile)}
      }
      @media (min-width: 600px) and (max-width: 899px) {
        ${this.#generateGridCSS(colsTablet)}
      }
      @media (min-width: 900px) {
        ${this.#generateGridCSS(colsDesktop)}
      }
    `;
  }

  #initializeEventListeners() {
    this.#boundWorkspaceChange = (e) => {
      this.#activeWorkspaceId = e.detail.workspaceId;
      this.rerender();
    };
    window.addEventListener('workspacechange', this.#boundWorkspaceChange);
  }

  disconnectedCallback() {
    if (this.#boundWorkspaceChange) {
      window.removeEventListener('workspacechange', this.#boundWorkspaceChange);
    }
  }

  render() {
    const commandsContainer = this.shadowRoot.querySelector('.commands');
    const quickAccess = this.shadowRoot.querySelector('.quick-access');
    const fragment = this.createCommandsFragment();
    const count = fragment.children.length;

    if (count === 0) {
      commandsContainer.style.display = 'none';
      quickAccess.style.display = 'none';
      return;
    }

    this.#renderQuickAccess();
    this.#updateGridStyles(count);
    commandsContainer.appendChild(fragment);
  }

  rerender() {
    const commandsContainer = this.shadowRoot.querySelector('.commands');
    const quickAccess = this.shadowRoot.querySelector('.quick-access');
    if (!commandsContainer) return;

    const fragment = this.createCommandsFragment();
    const count = fragment.children.length;

    if (count === 0) {
      commandsContainer.style.display = 'none';
      quickAccess.style.display = 'none';
      return;
    }

    this.#renderQuickAccess();
    commandsContainer.replaceChildren(fragment);
    this.#updateGridStyles(count);
    commandsContainer.style.display = 'grid';

    // Retrigger animations
    commandsContainer.style.animation = 'none';
    quickAccess.style.animation = 'none';
    commandsContainer.offsetHeight; /* trigger reflow */
    commandsContainer.style.animation = '';
    quickAccess.style.animation = '';
  }

  #renderQuickAccess() {
    const quickAccess = this.shadowRoot.querySelector('.quick-access');
    const quickAccessTitle = this.shadowRoot.querySelector(
      '.quick-access-title'
    );
    const quickAccessList = this.shadowRoot.querySelector('.quick-access-list');
    const workspaceCommands = workspaceManager.getCommandsForWorkspace(
      this.#activeWorkspaceId
    );
    const commandKeys = Array.from(workspaceCommands.keys());

    const recent = UsageTracker.getRecentCommands(commandKeys, 4);
    const frequent = UsageTracker.getFrequentCommands(commandKeys, 4);
    const items = recent.length > 0 ? recent : frequent;

    quickAccessList.replaceChildren();

    if (items.length === 0) {
      quickAccess.style.display = 'none';
      return;
    }

    quickAccess.style.display = 'flex';
    quickAccessTitle.textContent = recent.length > 0 ? 'Recent' : 'Popular';

    const fragment = document.createDocumentFragment();
    items.forEach(({ commandKey }) => {
      const command = workspaceCommands.get(commandKey);
      if (!command) return;

      const item = document.createElement('li');
      item.className = 'quick-access-item';

      const link = document.createElement('a');
      link.className = 'quick-link';
      link.href = command.url;
      link.rel = 'noopener noreferrer';
      link.innerHTML = `
        <span class="quick-key">${commandKey}</span>
        <span class="quick-name">${command.name}</span>
      `;

      if (CONFIG.openLinksInNewTab) link.target = '_blank';
      link.addEventListener('click', () => {
        UsageTracker.recordUsage(commandKey);
      });

      item.appendChild(link);
      fragment.appendChild(item);
    });

    quickAccessList.appendChild(fragment);
    quickAccess.hidden = false;
  }

  createCommandsFragment() {
    const fragment = document.createDocumentFragment();
    const workspaceCommands = workspaceManager.getCommandsForWorkspace(
      this.#activeWorkspaceId
    );

    for (const [key, { name, url }] of workspaceCommands.entries()) {
      if (!name || !url) continue;
      const commandClone = this.createCommandElement(key, name, url);
      fragment.appendChild(commandClone);
    }
    return fragment;
  }

  createCommandElement(key, name, url) {
    const clone = commandTemplate.content.cloneNode(true);
    const command = clone.querySelector('.command');
    command.href = url;
    if (CONFIG.openLinksInNewTab) command.target = '_blank';
    command.addEventListener('click', () => {
      UsageTracker.recordUsage(key);
    });
    clone.querySelector('.key').innerText = key;
    clone.querySelector('.name').innerText = name;
    return clone;
  }
}

customElements.define('commands-component', Commands);
