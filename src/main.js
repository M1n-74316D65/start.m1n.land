import './styles/variables.css';
import { workspaceManager } from './lib/WorkspaceManager.js';

function checkForSWUpdate() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistration().then((registration) => {
      if (registration?.waiting) {
        console.log('New version available');
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

function initOfflineDetection() {
  if ('onLine' in navigator) {
    window.addEventListener('offline', () => {
      document.body.classList.add('offline');
      console.log('Offline mode active');
    });
    window.addEventListener('online', () => {
      document.body.classList.remove('offline');
      console.log('Back online');
    });
  }
}

function updateThemeColor() {
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const color = isDark ? '#0c0d0d' : '#f3f4f4';
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', color);
}

function initKeyboardShortcuts() {
  document.addEventListener('keydown', (event) => {
    if (
      (event.ctrlKey || event.metaKey) &&
      event.shiftKey &&
      event.key === 'r'
    ) {
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
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', updateThemeColor);
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
  const components = [
    import('./components/Clock.js'),
    import('./components/Tabs.js'),
    import('./components/Commands.js'),
    import('./components/Search.js'),
    import('./components/NewsFeed.js'),
  ];

  Promise.allSettled(components).then((results) => {
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Failed to load component ${index}:`, result.reason);
      }
    });
  });

  checkForSWUpdate();
  initOfflineDetection();
  initKeyboardShortcuts();
  initThemeListener();
  initPWAInstall();
});
