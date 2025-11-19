# Agent Guidelines

## Commands
- **Run Local:** `python -m http.server 8000` or `docker-compose up` (port 8181)
- **Format:** `npx prettier --write .` (Config in .prettierrc)
- **Deploy:** Automated via Vercel (see .build.yml)

## Code Style & Conventions
- **Architecture:** Vanilla JS Web Components in `index.html`. No bundlers.
- **Formatting:** Prettier with `singleQuote: true`, `trailingComma: "es5"`.
- **CSS:** Use CSS custom properties (`--color-text`) for theming (dark/light).
- **JS:** ES6+ modules/classes. Keep logic within `<script>` tags in `index.html`.
- **Components:** `commands-component` (grid), `search-component` (dialog).
- **Config:** Edit `CONFIG` object or `COMMANDS` Map in `index.html`.
- **Offline:** `service-worker.js` handles caching. Update if assets change.

## Testing
- **Manual:** Verify shortcuts/search in browser. No automated test suite.
