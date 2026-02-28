import { workspaceManager } from '../lib/WorkspaceManager.js';
import { UsageTracker } from '../lib/UsageTracker.js';
import { CONFIG } from '../config.js';

const searchTemplate = document.createElement('template');
searchTemplate.innerHTML = `
  <style>
    input,
    button {
      appearance: none;
      background: transparent;
      border: 0;
      display: block;
      outline: 0;
    }

    .dialog {
      align-items: center;
      background: var(--color-background);
      border: none;
      display: none;
      flex-direction: column;
      height: 100%;
      justify-content: center;
      left: 0;
      padding: 0;
      top: 0;
      width: 100%;
      opacity: 0;
      transition: opacity 0.15s ease;
    }

    .dialog[open] {
      display: flex;
      opacity: 1;
      animation: dialogIn 0.25s var(--transition-easing) forwards;
    }

    @keyframes dialogIn {
      from {
        opacity: 0;
        transform: scale(0.96);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .dialog[open] {
        animation: none;
        opacity: 1;
      }
      .suggestion {
        animation: none;
        opacity: 1;
        transform: none;
      }
    }

    .form {
      width: 100%;
      max-width: 28rem;
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .input {
      color: var(--color-text);
      font-size: clamp(1.6rem, 5vw, 2.5rem);
      font-weight: var(--font-weight-bold);
      padding: 0.25em 0.5em;
      text-align: center;
      width: 100%;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      background: transparent;
      border: 2px solid transparent;
      border-bottom-color: var(--color-border);
      transition: 
        border-color 0.2s var(--transition-easing),
        text-shadow 0.2s var(--transition-easing);
    }

    .input:focus {
      border-bottom-color: var(--color-accent);
      text-shadow: 0 0 24px var(--color-accent-glow);
    }

    .input::placeholder {
      color: var(--color-text-subtle);
      opacity: 0.4;
    }

    .suggestions {
      align-items: center;
      display: flex;
      flex-direction: column;
      flex-wrap: wrap;
      justify-content: center;
      list-style: none;
      margin: calc(var(--space) * 1) 0 0;
      overflow: hidden;
      padding: 0;
      gap: 0.35rem;
      min-height: 2.5em;
    }

    .suggestion {
      color: var(--color-text-subtle);
      cursor: pointer;
      font-size: 0.75rem;
      padding: calc(var(--space) * 0.55) calc(var(--space) * 0.9);
      position: relative;
      transition: 
        all var(--transition-speed) var(--transition-easing),
        transform var(--transition-speed-fast) var(--transition-easing);
      white-space: nowrap;
      z-index: 1;
      border-radius: var(--border-radius);
      outline: 0;
      background: transparent;
      border: 1px solid var(--color-border);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      opacity: 0;
      transform: translateY(-4px);
      animation: suggestionIn 0.2s var(--transition-easing) forwards;
    }

    .suggestion:nth-child(1) { animation-delay: 0.02s; }
    .suggestion:nth-child(2) { animation-delay: 0.04s; }
    .suggestion:nth-child(3) { animation-delay: 0.06s; }
    .suggestion:nth-child(4) { animation-delay: 0.08s; }

    @keyframes suggestionIn {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .suggestion:focus,
    .suggestion:hover {
      color: var(--color-accent);
      border-color: var(--color-accent);
      background: var(--color-accent-subtle);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px var(--color-accent-glow);
    }

    .suggestion:focus {
      outline: none;
    }

    .suggestion:active {
      transform: scale(0.97);
      transition: transform 80ms var(--transition-easing);
    }

    .match {
      color: var(--color-accent);
      transition: color var(--transition-speed) var(--transition-easing);
      font-weight: var(--font-weight-bold);
    }

    .suggestion:focus .match,
    .suggestion:hover .match {
      color: var(--color-accent);
    }

    @media (min-width: 700px) {
      .suggestions {
        flex-direction: row;
      }
    }
  </style>
  <dialog class="dialog">
    <form autocomplete="off" class="form" method="dialog" spellcheck="false">
      <div class="input-wrapper">
        <input
          class="input"
          aria-label="Search"
          title="search"
          type="text"
          placeholder="Type to search..."
        />
      </div>
      <menu class="suggestions"></menu>
    </form>
  </dialog>
`;

const suggestionTemplate = document.createElement('template');
suggestionTemplate.innerHTML = `
  <li>
    <button class="suggestion" type="button"></button>
  </li>
`;

const matchTemplate = document.createElement('template');
matchTemplate.innerHTML = `<span class="match"></span>`;

export class Search extends HTMLElement {
  #dialog;
  #form;
  #input;
  #suggestions;
  #debounceTimeout;
  #activeWorkspaceId;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(searchTemplate.content.cloneNode(true));
    this.#dialog = this.shadowRoot.querySelector('.dialog');
    this.#form = this.shadowRoot.querySelector('.form');
    this.#input = this.shadowRoot.querySelector('.input');
    this.#suggestions = this.shadowRoot.querySelector('.suggestions');
    this.#activeWorkspaceId = workspaceManager.activeWorkspaceId;
    this.#initializeEventListeners();
  }

  disconnectedCallback() {
    clearTimeout(this.#debounceTimeout);
  }

  #initializeEventListeners() {
    this.#form.addEventListener('submit', this.#onSubmit.bind(this), false);
    this.#input.addEventListener(
      'input',
      Search.#debounce(this.#onInput.bind(this), 300)
    );
    this.#suggestions.addEventListener(
      'click',
      this.#onSuggestionClick.bind(this)
    );
    document.addEventListener('keydown', this.#onKeydown.bind(this));
    window.addEventListener('workspacechange', (e) => {
      this.#activeWorkspaceId = e.detail.workspaceId;
    });
  }

  static #debounce(fn, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  static async #fetchDuckDuckGoSuggestions(search) {
    return new Promise((resolve) => {
      const callbackName = `ac_${Date.now()}`;
      window[callbackName] = (res) => {
        const suggestions = res
          .filter((item) => item.phrase !== search.toLowerCase())
          .map((item) => item.phrase);
        delete window[callbackName];
        resolve(suggestions);
      };

      const script = document.createElement('script');
      script.src = `https://duckduckgo.com/ac/?callback=${callbackName}&q=${encodeURIComponent(search)}`;
      script.onerror = () => {
        delete window[callbackName];
        resolve([]);
      };
      document.head.appendChild(script);
      script.onload = () => script.remove();
    });
  }

  static #formatSearchUrl(template, search) {
    return template.replace(/{}/g, encodeURIComponent(search));
  }

  static #hasProtocol(s) {
    return /^[a-zA-Z]+:\/\//i.test(s);
  }

  static #isUrl(s) {
    return /^((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)$/i.test(s);
  }

  static #compareKey(key) {
    return CONFIG.commandCaseSensitive ? key : key.toLowerCase();
  }

  static #getCommandWithKey(key, workspaceCommands) {
    if (CONFIG.commandCaseSensitive) {
      const command = workspaceCommands.get(key);
      return command ? { command, key } : undefined;
    } else {
      const lowerKey = key.toLowerCase();
      for (const [cmdKey, value] of workspaceCommands) {
        if (cmdKey.toLowerCase() === lowerKey) {
          return { command: value, key: cmdKey };
        }
      }
      return undefined;
    }
  }

  #parseQuery(raw) {
    const workspaceCommands = workspaceManager.getCommandsForWorkspace(
      this.#activeWorkspaceId
    );
    const query = raw.trim();
    const compareQuery = Search.#compareKey(query);

    if (Search.#isUrl(query)) {
      const url = Search.#hasProtocol(query) ? query : `https://${query}`;
      return { query, url };
    }

    const result = Search.#getCommandWithKey(query, workspaceCommands);
    if (result) {
      return { key: result.key, query, url: result.command.url };
    }

    const [commandPart, searchPart] = query.split(
      new RegExp(`${CONFIG.commandSearchDelimiter}(.*)`)
    );
    const commandPartResult = Search.#getCommandWithKey(
      commandPart,
      workspaceCommands
    );
    if (commandPartResult) {
      const search = searchPart ? searchPart.trim() : '';
      const template = new URL(
        commandPartResult.command.searchTemplate ?? '',
        commandPartResult.command.url
      );
      const url = Search.#formatSearchUrl(decodeURI(template.href), search);
      return { key: commandPartResult.key, query, search, url };
    }

    const [pathKey, path] = query.split(
      new RegExp(`${CONFIG.commandPathDelimiter}(.*)`)
    );
    const pathKeyResult = Search.#getCommandWithKey(pathKey, workspaceCommands);
    if (pathKeyResult) {
      const url = `${new URL(pathKeyResult.command.url).origin}/${path || ''}`;
      return { key: pathKeyResult.key, path, query, url };
    }

    const url = Search.#formatSearchUrl(CONFIG.defaultSearchTemplate, query);
    return { query, search: query, url };
  }

  #close() {
    this.#input.value = '';
    this.#input.blur();

    setTimeout(() => {
      this.#dialog.close();
      this.#suggestions.replaceChildren();
    }, 80);
  }

  #execute(query) {
    const parsedQuery = this.#parseQuery(query);
    if (parsedQuery.key) {
      UsageTracker.recordUsage(parsedQuery.key);
    }
    const target = CONFIG.openLinksInNewTab ? '_blank' : '_self';
    window.open(parsedQuery.url, target, 'noopener noreferrer');
    this.#close();
  }

  #focusNextSuggestion(previous = false) {
    const active = this.shadowRoot.activeElement;
    let nextIndex;

    if (active.dataset.index) {
      const activeIndex = Number(active.dataset.index);
      nextIndex = previous ? activeIndex - 1 : activeIndex + 1;
    } else {
      nextIndex = previous ? this.#suggestions.childElementCount - 1 : 0;
    }

    const next = this.#suggestions.children[nextIndex];
    if (next) next.querySelector('.suggestion').focus();
    else this.#input.focus();
  }

  async #onInput() {
    const workspaceCommands = workspaceManager.getCommandsForWorkspace(
      this.#activeWorkspaceId
    );
    const parsedQuery = this.#parseQuery(this.#input.value);

    if (!parsedQuery.query) {
      this.#close();
      return;
    }

    const result = Search.#getCommandWithKey(
      parsedQuery.key || parsedQuery.query,
      workspaceCommands
    );
    let suggestions = result?.command?.suggestions ?? [];

    if (parsedQuery.search && suggestions.length < CONFIG.suggestionLimit) {
      const ddgSuggestions = await Search.#fetchDuckDuckGoSuggestions(
        parsedQuery.search
      );

      suggestions = suggestions.concat(
        parsedQuery.key
          ? ddgSuggestions.map(
              (s) => `${parsedQuery.key}${CONFIG.commandSearchDelimiter}${s}`
            )
          : ddgSuggestions
      );
    }

    const newParsedQuery = this.#parseQuery(this.#input.value);
    if (
      Search.#compareKey(newParsedQuery.query) !==
      Search.#compareKey(parsedQuery.query)
    )
      return;

    const filteredSuggestions = CONFIG.commandCaseSensitive
      ? suggestions
      : suggestions.filter((s) =>
          Search.#compareKey(s).startsWith(
            Search.#compareKey(parsedQuery.query)
          )
        );

    this.#renderSuggestions(filteredSuggestions, parsedQuery.query);
  }

  #onKeydown(e) {
    if (e.altKey && !/^[1-9]$/.test(e.key)) {
      return;
    }

    if (e.metaKey || e.ctrlKey || e.altKey) {
      return;
    }

    if (!this.#dialog.open) {
      this.#dialog.show();
      this.#input.focus();

      requestAnimationFrame(() => {
        if (!this.#input.value) this.#close();
      });

      return;
    }

    if (e.key === 'Escape') {
      this.#close();
      return;
    }

    const modifierPrefixedKey = this.#getModifierPrefixedKey(e);

    if (/^(ArrowDown|Tab|ctrl-n)$/.test(modifierPrefixedKey)) {
      e.preventDefault();
      this.#focusNextSuggestion();
      return;
    }

    if (/^(ArrowUp|ctrl-p|shift-Tab)$/.test(modifierPrefixedKey)) {
      e.preventDefault();
      this.#focusNextSuggestion(true);
    }
  }

  #getModifierPrefixedKey(e) {
    const alt = e.altKey ? 'alt-' : '';
    const ctrl = e.ctrlKey ? 'ctrl-' : '';
    const meta = e.metaKey ? 'meta-' : '';
    const shift = e.shiftKey ? 'shift-' : '';
    return `${alt}${ctrl}${meta}${shift}${e.key}`;
  }

  #onSubmit() {
    this.#execute(this.#input.value);
  }

  #onSuggestionClick(e) {
    const ref = e.target.closest('.suggestion');
    if (!ref) return;
    this.#execute(ref.dataset.suggestion);
  }

  #renderSuggestions(suggestions, query) {
    this.#suggestions.replaceChildren();

    const fragment = document.createDocumentFragment();
    suggestions
      .slice(0, CONFIG.suggestionLimit)
      .forEach((suggestion, index) => {
        const clone = suggestionTemplate.content.cloneNode(true);
        const ref = clone.querySelector('.suggestion');
        ref.dataset.index = index;
        ref.dataset.suggestion = suggestion;

        const compareQuery = Search.#compareKey(query);
        const compareSuggestion = Search.#compareKey(suggestion);
        const matchIndex = compareSuggestion.indexOf(compareQuery);

        if (matchIndex !== -1) {
          const pre = suggestion.slice(0, matchIndex);
          const match = suggestion.slice(matchIndex, matchIndex + query.length);
          const post = suggestion.slice(matchIndex + query.length);

          const matchClone = matchTemplate.content.cloneNode(true);
          const matchRef = matchClone.querySelector('.match');
          matchRef.textContent = match;

          ref.append(
            document.createTextNode(pre),
            matchClone,
            document.createTextNode(post)
          );
        } else {
          ref.textContent = suggestion;
        }

        fragment.appendChild(clone);
      });

    this.#suggestions.appendChild(fragment);
  }
}

customElements.define('search-component', Search);
