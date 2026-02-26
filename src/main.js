import './styles/variables.css';
import { workspaceManager } from './lib/WorkspaceManager.js';

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js').then(
        (registration) => {
          console.log('ServiceWorker registration successful:', registration.scope);
        },
        (error) => {
          console.log('ServiceWorker registration failed:', error);
        }
      );
    });

    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'CACHE_UPDATED') {
        console.log('PWA cache updated successfully');
      }
    });
  }
}

function updatePWACache() {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'UPDATE_CACHE',
    });
    console.log('PWA cache update requested');
  }
}

function updateThemeColor() {
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const color = isDark ? '#0c0d0d' : '#f3f4f4';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', color);
}

function initKeyboardShortcuts() {
  document.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'r') {
      event.preventDefault();
      updatePWACache();
    }

    if ((event.altKey || event.metaKey) && /^[1-9]$/.test(event.key)) {
      event.preventDefault();
      const tabIndex = parseInt(event.key) - 1;
      if (tabIndex < workspaceManager.workspaces.length) {
        const workspaceId = workspaceManager.workspaces[tabIndex].id;
        workspaceManager.switchTo(workspaceId);
      }
    }
  });
}

function initThemeListener() {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateThemeColor);
  updateThemeColor();
}

function initPWAInstall() {
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('PWA install available');
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    console.log('PWA installed');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  import('./components/Clock.js');
  import('./components/Tabs.js');
  import('./components/Commands.js');
  import('./components/Search.js');
  import('./components/NewsFeed.js');

  registerServiceWorker();
  initKeyboardShortcuts();
  initThemeListener();
  initPWAInstall();
});
