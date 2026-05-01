export default {
  registerType: 'autoUpdate',
  includeAssets: ['favicon.ico', 'images/**/*.png'],
  manifest: {
    id: '/',
    name: 'M1n Startpage',
    short_name: 'M1n',
    description: 'Minimal browser homepage for power users',
    version: '2.0.0',
    start_url: '.',
    scope: '.',
    display: 'standalone',
    display_override: ['window-controls-overlay', 'standalone', 'browser'],
    orientation: 'any',
    background_color: '#0c0d0d',
    theme_color: '#0c0d0d',
    categories: ['productivity', 'utilities'],
    launch_handler: {
      client_mode: ['navigate-existing', 'auto']
    },
    icons: [
      {
        src: '/favicon.ico',
        sizes: '16x16 32x32',
        type: 'image/x-icon'
      },
      {
        src: '/images/favicon-7.png',
        sizes: '128x128',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/images/favicon-8.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/images/favicon-8.png',
        sizes: '256x256',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/images/favicon-8.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      }
    ]
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,woff2}'],
    navigateFallback: '/offline.html',
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts-cache',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365
          }
        }
      },
      {
        urlPattern: /^https:\/\/fonts\.gstatic\.com/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'gstatic-fonts-cache',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365
          }
        }
      },
      {
        urlPattern: /^https:\/\/hacker-news\.firebaseio\.com/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'hn-api-cache',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 30
          },
          cacheableResponse: {
            statuses: [0, 200]
          }
        }
      },
      {
        urlPattern: /^https:\/\/duckduckgo\.com/,
        handler: 'NetworkOnly'
      }
    ]
  }
}
