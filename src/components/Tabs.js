import { workspaceManager } from '../lib/WorkspaceManager.js';

const tabsTemplate = document.createElement('template');
tabsTemplate.innerHTML = `
  <style>
    .tabs-container {
      display: flex;
      gap: 0;
      margin-bottom: calc(var(--space) * 1.5);
      background: transparent;
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius);
      overflow: hidden;
      position: relative;
    }

    .tab {
      background: transparent;
      border: none;
      border-right: 1px solid var(--color-border);
      color: var(--color-text-subtle);
      cursor: pointer;
      font-family: var(--font-family);
      font-size: 0.7rem;
      font-weight: var(--font-weight-normal);
      letter-spacing: 0.08em;
      padding: calc(var(--space) * 0.6) calc(var(--space) * 0.95);
      position: relative;
      text-transform: uppercase;
      transition: 
        color var(--transition-speed) var(--transition-easing),
        background var(--transition-speed) var(--transition-easing);
      outline: 0;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      z-index: 1;
    }

    .tab:last-child {
      border-right: none;
    }

    .tab:hover {
      color: var(--color-text);
      background: var(--color-focus);
    }

    .tab:focus-visible {
      outline: none;
    }

    .tab:focus-visible::after {
      content: '';
      position: absolute;
      inset: 2px;
      border: 1px solid var(--color-accent);
      border-radius: 2px;
      pointer-events: none;
    }

    .tab:active {
      transform: scale(0.98);
      transition: transform 80ms var(--transition-easing);
    }

    .tab.active {
      color: var(--color-accent);
      background: var(--color-accent-subtle);
    }

    .tab-indicator {
      position: absolute;
      bottom: 0;
      height: 2px;
      background: var(--color-accent);
      transition: 
        left 0.25s var(--transition-easing),
        width 0.25s var(--transition-easing);
      pointer-events: none;
    }

    .tab-key {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1.2rem;
      height: 1.2rem;
      font-size: 0.6rem;
      font-weight: var(--font-weight-bold);
      background: transparent;
      border: 1px solid var(--color-text-muted);
      border-radius: var(--border-radius);
      opacity: 0.5;
      transition: 
        all var(--transition-speed) var(--transition-easing),
        border-color var(--transition-speed) var(--transition-easing),
        background var(--transition-speed) var(--transition-easing),
        box-shadow var(--transition-speed) var(--transition-easing);
    }

    .tab:hover .tab-key {
      opacity: 0.8;
      border-color: var(--color-text-subtle);
    }

    .tab.active .tab-key {
      opacity: 1;
      border-color: var(--color-accent);
      background: var(--color-accent);
      color: var(--color-background);
      box-shadow: 0 0 12px var(--color-accent-glow);
    }

    @media (min-width: 600px) {
      .tab {
        font-size: 0.75rem;
        padding: calc(var(--space) * 0.6) calc(var(--space) * 1);
      }
    }
  </style>
  <nav class="tabs-container" role="tablist" aria-label="Workspaces"></nav>
`;

const tabTemplate = document.createElement('template');
tabTemplate.innerHTML = `
  <button class="tab" type="button" role="tab">
    <span class="tab-key"></span>
    <span class="tab-name"></span>
  </button>
`;

export class Tabs extends HTMLElement {
  #tabsContainer;
  #indicator;
  #boundWorkspaceChange;
  #boundResize;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(tabsTemplate.content.cloneNode(true));
    this.#tabsContainer = this.shadowRoot.querySelector('.tabs-container');
    this.#indicator = document.createElement('div');
    this.#indicator.className = 'tab-indicator';
    this.#tabsContainer.appendChild(this.#indicator);
    this.#renderTabs();
    this.#initializeEventListeners();

    requestAnimationFrame(() => this.#updateIndicator());
  }

  #renderTabs() {
    const activeId = workspaceManager.activeWorkspaceId;

    workspaceManager.workspaces.forEach((workspace, index) => {
      const clone = tabTemplate.content.cloneNode(true);
      const tab = clone.querySelector('.tab');
      const tabKey = clone.querySelector('.tab-key');
      const tabName = clone.querySelector('.tab-name');

      tab.dataset.workspaceId = workspace.id;
      tabKey.textContent = index + 1;
      tabName.textContent = workspace.name;

      if (workspace.id === activeId) {
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
      } else {
        tab.setAttribute('aria-selected', 'false');
      }

      this.#tabsContainer.appendChild(clone);
    });
  }

  #initializeEventListeners() {
    this.#tabsContainer.addEventListener('click', (e) => {
      const tab = e.target.closest('.tab');
      if (!tab) return;

      const workspaceId = tab.dataset.workspaceId;
      this.switchToWorkspace(workspaceId);
    });

    this.#tabsContainer.addEventListener('keydown', (e) => {
      const tab = e.target.closest('.tab');
      if (!tab) return;

      const index = Array.from(
        this.#tabsContainer.querySelectorAll('.tab')
      ).indexOf(tab);
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const tabs = this.#tabsContainer.querySelectorAll('.tab');
        const prevTab = tabs[index - 1] || tabs[tabs.length - 1];
        if (prevTab) prevTab.focus();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const tabs = this.#tabsContainer.querySelectorAll('.tab');
        const nextTab = tabs[index + 1] || tabs[0];
        if (nextTab) nextTab.focus();
      }
    });

    this.#boundWorkspaceChange = (e) => {
      this.#updateActiveTab(e.detail.workspaceId);
    };
    window.addEventListener('workspacechange', this.#boundWorkspaceChange);

    this.#boundResize = () => {
      this.#updateIndicator();
    };
    window.addEventListener('resize', this.#boundResize);
  }

  disconnectedCallback() {
    if (this.#boundWorkspaceChange) {
      window.removeEventListener('workspacechange', this.#boundWorkspaceChange);
    }
    if (this.#boundResize) {
      window.removeEventListener('resize', this.#boundResize);
    }
  }

  #updateActiveTab(workspaceId) {
    this.#tabsContainer.querySelectorAll('.tab').forEach((tab) => {
      const isActive = tab.dataset.workspaceId === workspaceId;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    requestAnimationFrame(() => this.#updateIndicator());
  }

  #updateIndicator() {
    const activeTab = this.#tabsContainer.querySelector('.tab.active');
    if (activeTab) {
      const tabRect = activeTab.getBoundingClientRect();
      const containerRect = this.#tabsContainer.getBoundingClientRect();
      this.#indicator.style.left = `${tabRect.left - containerRect.left}px`;
      this.#indicator.style.width = `${tabRect.width}px`;
    }
  }

  switchToWorkspace(workspaceId) {
    workspaceManager.switchTo(workspaceId);
  }
}

customElements.define('tabs-component', Tabs);
