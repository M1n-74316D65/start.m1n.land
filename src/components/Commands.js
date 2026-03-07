import { workspaceManager } from '../lib/WorkspaceManager.js';
import { UsageTracker } from '../lib/UsageTracker.js';
import { CONFIG } from '../config.js';

const commandsTemplate = document.createElement('template');
commandsTemplate.innerHTML = `
  <style>
    .commands {
      display: grid;
      gap: 0;
      list-style: none;
      margin: 0 auto;
      padding: 0;
      width: 100%;
      background: transparent;
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius);
      overflow: hidden;
    }

    .command {
      display: flex;
      gap: calc(var(--space) * 0.6);
      outline: 0;
      padding: calc(var(--space) * 0.8) calc(var(--space) * 1);
      position: relative;
      text-decoration: none;
      min-height: 48px;
      align-items: center;
      background: transparent;
      transition: 
        background var(--transition-speed) var(--transition-easing),
        transform var(--transition-speed-fast) var(--transition-easing),
        box-shadow var(--transition-speed) var(--transition-easing),
        border-color var(--transition-speed) var(--transition-easing);
      border-right: 1px solid var(--color-border);
      border-bottom: 1px solid var(--color-border);
    }

    .command:hover {
      color: var(--color-text);
      background: var(--color-focus);
      border-color: var(--color-text-muted);
    }

    .command:focus {
      outline: none;
      background: var(--color-accent-subtle);
      border-color: var(--color-accent);
      z-index: 1;
    }

    .command:focus::before {
      content: '';
      position: absolute;
      inset: 0;
      border: 1px solid var(--color-accent);
      border-radius: var(--border-radius);
      pointer-events: none;
    }

    .command:active {
      transform: scale(0.985);
      transition: transform 80ms var(--transition-easing);
    }

    .command:hover .key {
      background: var(--color-accent-glow);
      border-color: var(--color-accent);
      box-shadow: 0 0 12px var(--color-accent-glow);
    }

    .command:focus .key {
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
      width: 1.8rem;
      height: 1.8rem;
      font-weight: var(--font-weight-bold);
      font-size: 0.8rem;
      letter-spacing: 0.04em;
      background: transparent;
      border: 1px solid var(--color-accent);
      border-radius: var(--border-radius);
      flex-shrink: 0;
      transition: 
        all var(--transition-speed) var(--transition-easing),
        box-shadow var(--transition-speed) var(--transition-easing);
    }

    .name {
      color: var(--color-text-subtle);
      transition: 
        color var(--transition-speed) var(--transition-easing),
        transform var(--transition-speed) var(--transition-easing);
      letter-spacing: 0.03em;
      font-size: 0.85rem;
      text-transform: uppercase;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .command:hover .name {
      color: var(--color-text);
      transform: translateX(2px);
    }

    .command:focus .name {
      color: var(--color-text);
    }

    @media (min-width: 900px) {
      .command {
        padding: calc(var(--space) * 0.9) calc(var(--space) * 1.1);
      }
    }
  </style>
  <nav>
    <menu class="commands"></menu>
  </nav>
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
  #sortedCommandsCache = null;
  #cachedWorkspaceId = null;
  #boundWorkspaceChange;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.#dynamicStyle = document.createElement('style');
    this.shadowRoot.appendChild(this.#dynamicStyle);
    this.shadowRoot.appendChild(commandsTemplate.content.cloneNode(true));
    this.#activeWorkspaceId = workspaceManager.activeWorkspaceId;
    this.render();
    this.#initializeEventListeners();
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
      .command:nth-child(${cols}n) {
        border-right: none;
      }
      .command:nth-last-child(-n + ${cols}) {
        border-bottom: none;
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
      this.#sortedCommandsCache = null;
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
    const fragment = this.createCommandsFragment();
    const count = fragment.children.length;

    if (count === 0) {
      commandsContainer.style.display = 'none';
      return;
    }

    this.#updateGridStyles(count);
    commandsContainer.appendChild(fragment);
  }

  rerender() {
    const commandsContainer = this.shadowRoot.querySelector('.commands');
    if (!commandsContainer) return;

    const fragment = this.createCommandsFragment();
    const count = fragment.children.length;

    if (count === 0) {
      commandsContainer.style.display = 'none';
      return;
    }

    commandsContainer.replaceChildren(fragment);
    this.#updateGridStyles(count);
    commandsContainer.style.display = 'grid';
  }

  #getSortedCommands(workspaceCommands) {
    if (
      this.#sortedCommandsCache &&
      this.#cachedWorkspaceId === this.#activeWorkspaceId
    ) {
      return this.#sortedCommandsCache;
    }

    const sorted = Array.from(workspaceCommands.entries()).sort((a, b) => {
      const usageA = UsageTracker.getUsageCount(a[0]);
      const usageB = UsageTracker.getUsageCount(b[0]);
      return usageB - usageA;
    });

    this.#sortedCommandsCache = sorted;
    this.#cachedWorkspaceId = this.#activeWorkspaceId;

    return sorted;
  }

  createCommandsFragment() {
    const fragment = document.createDocumentFragment();
    const workspaceCommands = workspaceManager.getCommandsForWorkspace(
      this.#activeWorkspaceId
    );
    const sortedCommands = this.#getSortedCommands(workspaceCommands);

    for (const [key, { name, url }] of sortedCommands) {
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
