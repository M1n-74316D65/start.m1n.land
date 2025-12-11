# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**M1n Startpage** is a minimal browser homepage for power users, built as a single-page web application. The project is based on the "Tilde" homepage concept and provides a keyboard-driven interface for quick navigation to frequently used websites.

## Common Development Commands

```bash
# Local development
python -m http.server 8000          # Serve on port 8000
docker-compose up                    # Serve on port 8181 (nginx)

# Code formatting
npx prettier --write .               # Format all files (see .prettierrc)
```

## Architecture

### Core Structure

The entire application is contained in `index.html` with vanilla JavaScript Web Components. No build process or external dependencies are required.

**Key components:**
- `<commands-component>`: Renders the grid of keyboard shortcuts
- `<search-component>`: Handles search dialog, input processing, command parsing, and DuckDuckGo autocomplete
- `<news-feed-component>`: Displays Hacker News top stories with 30-minute caching
- `service-worker.js`: PWA service worker for offline caching (cache-first strategy)

### Command System

Commands are defined in the `COMMANDS` Map in index.html:1124-186. Each command can have:
- `name`: Display name for the shortcut
- `url`: Target URL
- `searchTemplate`: Optional search path (e.g., `/results?search_query={}`)
- `suggestions`: Optional array of sub-commands

**Command types supported:**
1. **Direct navigation**: Single key (e.g., `G` → GitHub)
2. **Site search**: Key + space + query (e.g., `Y kittens` → YouTube search)
3. **Path navigation**: Key + `/` + path (e.g., `G/issues` → GitHub issues)
4. **URL detection**: Direct URLs work with or without protocol

### Configuration

The `CONFIG` object in index.html:114-122 controls:
- `commandPathDelimiter`: Character for path navigation (`/`)
- `commandSearchDelimiter`: Character for search queries (space)
- `commandCaseSensitive`: Whether commands are case-sensitive
- `defaultSearchTemplate`: Fallback search engine (currently Google)
- `openLinksInNewTab`: Link behavior (currently `false`)
- `suggestionLimit`: Max autocomplete suggestions to show

### Styling System

All styles use CSS custom properties defined in `:root` (index.html:25-44) for theming:
- Color scheme automatically adapts to `prefers-color-scheme`
- Design uses CSS Grid, Flexbox, and radial gradients
- Font: Space Grotesk (loaded from Google Fonts)
- Responsive breakpoints at 700px and 900px

### Service Worker

`service-worker.js` implements:
- Cache-first strategy for local resources
- Manual cache refresh via `Ctrl+Shift+R` keyboard shortcut
- Passthrough for DuckDuckGo autocomplete and external sites
- Cache version: `v3` (update `CACHE_NAME` when assets change)

## Code Style

- **Formatting**: Prettier with single quotes, ES5 trailing commas (see `.prettierrc`)
- **JavaScript**: ES6+ with classes, async/await, private fields (`#field`)
- **Templates**: Use `<template>` tags with Shadow DOM for component encapsulation
- **Event handling**: Bound methods for event listeners to preserve `this` context

## Deployment

Automated deployment to Vercel via `.build.yml` configuration. The build script:
1. Installs Bun and Vercel CLI
2. Links to the `start.m1n.land` project
3. Deploys to production with the `VERCEL_TOKEN` secret

For manual deployment, the site is entirely static and can be served from any web server.