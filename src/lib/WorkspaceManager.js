import { COMMANDS, CONFIG } from '../config.js';

export class WorkspaceManager {
  static #instance;
  #activeWorkspaceId;
  #workspaces;

  constructor() {
    if (WorkspaceManager.#instance) {
      return WorkspaceManager.#instance;
    }
    WorkspaceManager.#instance = this;
    this.#workspaces = this.#generateWorkspaces();
    this.#loadActiveWorkspace();
  }

  static get instance() {
    if (!WorkspaceManager.#instance) {
      WorkspaceManager.#instance = new WorkspaceManager();
    }
    return WorkspaceManager.#instance;
  }

  get workspaces() {
    return this.#workspaces;
  }

  get activeWorkspaceId() {
    return this.#activeWorkspaceId;
  }

  get activeWorkspace() {
    return this.#workspaces.find((w) => w.id === this.#activeWorkspaceId);
  }

  #generateWorkspaces() {
    const workspaceMap = new Map();

    for (const [key, command] of COMMANDS.entries()) {
      const workspaceId = command.workspace || 'default';

      if (!workspaceMap.has(workspaceId)) {
        workspaceMap.set(workspaceId, {
          id: workspaceId,
          name: workspaceId.charAt(0).toUpperCase() + workspaceId.slice(1),
          commands: [],
        });
      }

      workspaceMap.get(workspaceId).commands.push({ key, command });
    }

    const orderedWorkspaces = Array.from(workspaceMap.values());
    const order = ['personal', 'dev', 'work'];
    orderedWorkspaces.sort((a, b) => {
      const indexA = order.indexOf(a.id);
      const indexB = order.indexOf(b.id);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.id.localeCompare(b.id);
    });
    return orderedWorkspaces;
  }

  #loadActiveWorkspace() {
    try {
      const stored = localStorage.getItem(CONFIG.workspaceStorageKey);
      const exists = this.#workspaces.some((w) => w.id === stored);
      this.#activeWorkspaceId = exists ? stored : CONFIG.defaultWorkspace;
    } catch {
      this.#activeWorkspaceId = CONFIG.defaultWorkspace;
    }
  }

  switchTo(workspaceId) {
    if (this.#activeWorkspaceId === workspaceId) return;

    const exists = this.#workspaces.some((w) => w.id === workspaceId);
    if (!exists) return;

    this.#activeWorkspaceId = workspaceId;
    try {
      localStorage.setItem(CONFIG.workspaceStorageKey, workspaceId);
    } catch (error) {
      console.warn('Failed to save workspace:', error);
    }

    window.dispatchEvent(
      new CustomEvent('workspacechange', {
        detail: {
          workspace: this.activeWorkspace,
          workspaceId: this.#activeWorkspaceId,
        },
        bubbles: true,
      })
    );
  }

  getCommandsForWorkspace(workspaceId) {
    const workspace = this.#workspaces.find((w) => w.id === workspaceId);
    if (!workspace || !workspace.commands) return new Map();

    const workspaceCommands = new Map();
    workspace.commands.forEach(({ key, command }) => {
      workspaceCommands.set(key, command);
    });
    return workspaceCommands;
  }
}

export const workspaceManager = new WorkspaceManager();
