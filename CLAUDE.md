# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**M1n Startpage** is a minimal browser homepage for power users, built as a single-page web application. The project is based on the "Tilde" homepage concept and provides a keyboard-driven interface for quick navigation to frequently used websites.

## Architecture

### Core Components

The application is built with vanilla JavaScript using Web Components:

- **Commands Component** (`<commands-component>`): Renders the visual grid of available shortcuts with their keys and names
- **Search Component** (`<search-component>`): Handles the search dialog, input processing, command parsing, and suggestion system
- **Service Worker**: Provides offline caching capabilities for core assets

### Key Files

- `index.html`: Single-page application containing all HTML, CSS, and JavaScript
- `service-worker.js`: PWA service worker for caching
- `manifest.json`: Web app manifest for PWA functionality
- `docker-compose.yml`: Simple nginx-based deployment setup

### Command System

Commands are defined in the `COMMANDS` Map in `index.html` with the following structure:
- Single-key shortcuts (e.g., `G` → Sourcehut)
- Path-based navigation (e.g., `G/github` → GitHub)
- Hierarchical suggestions (parent commands can suggest sub-commands)
- Custom search templates for site-specific searches

### Search Functionality

The search system supports:
- Direct URL navigation
- Command execution with optional search terms
- Path-based navigation within sites
- DuckDuckGo integration for autocomplete suggestions
- Fallback to default search engine (Perplexity.ai)

## Development

### Local Development

Since this is a static site, you can serve it locally using any HTTP server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js http-server
npx http-server

# Using Docker Compose
docker-compose up
```

The Docker setup serves the site on port 8181.

### Configuration

All configuration is contained within `index.html`:

- **CONFIG object**: Global settings for search behavior, delimiters, and UI preferences
- **COMMANDS Map**: Site shortcuts and their configurations
- **CSS custom properties**: Theming and responsive design variables

### Customization Points

- **Adding new commands**: Add entries to the `COMMANDS` Map
- **Changing search engine**: Modify `defaultSearchTemplate` in CONFIG
- **Styling**: Update CSS custom properties in the `:root` selector
- **Search behavior**: Adjust CONFIG object properties

### Architecture Notes

- Web Components provide encapsulation without build tools
- CSS custom properties enable dark/light mode switching
- Service Worker ensures offline functionality
- Responsive design uses CSS Grid and Flexbox
- No external dependencies or build process required

## Deployment

The project can be deployed as:
- Static files to any web server
- Docker container using the included docker-compose.yml
- PWA-enabled site (manifest.json included)

The service worker caches essential assets for offline use.