# Repository Guidelines

## Project Structure & Module Organization
Keep runtime code inside `src/`, grouping WebGL scene logic under `src/scene/`, reusable helpers in `src/lib/`, and DOM glue in `src/ui/`. Static entry points belong in `public/index.html`, with production assets emitted to `dist/`. Store textures, fonts, and shader snippets inside `assets/` with subfolders such as `assets/textures/` and `assets/shaders/`. When you introduce a new directory or rename an existing one, update `README.md` and this guide so newcomers can navigate quickly.

## Build, Test, and Development Commands
Install dependencies with `npm install` using Node 20+. Start the hot-reload dev server via `npm run dev` (Vite default at `http://localhost:5173`). Generate the optimized bundle with `npm run build`, which writes to `dist/`. Keep linting clean by running `npm run lint` before every commit, and use `npm run format` if Prettier is configured. Verify the production output locally through `npm run preview` prior to publishing demos or screenshots.

## Coding Style & Naming Conventions
Use modern ES modules and TypeScript where practical, sticking to 2-space indentation and a 100-character soft wrap. Name WebGL helpers with `camelCase.ts`, scene classes with `PascalCase.ts`, and CSS modules as `glow-effect.module.css`; global CSS classes stay in `kebab-case`. Shader files end with `.glsl` and include `*.vert.glsl` or `*.frag.glsl` suffixes. Run the formatter (`npm run format`) and linter before committing so diffs stay stylistically consistent across contributors.

## Testing Guidelines
Write unit tests with Vitest inside `src/__tests__/`, mirroring the file structure (e.g., `src/scene/Camera.test.ts`). Capture rendering regressions using Playwright in `tests/e2e/`, saving fixture textures under `tests/fixtures/`. Target at least 80% branch coverage; explain any exceptions in the pull request. Always execute `npm run test` locally and include browser/OS details if you uncover visual discrepancies.

## Commit & Pull Request Guidelines
Adopt Conventional Commits (`feat:`, `fix:`, `chore:`) and keep each commit scoped to a single logical change. PRs must summarize the change set, attach before/after visuals for glow-effect tweaks, and link related issues (`Closes #123`). Tag reviewers who own the modified area (`scene`, `ui`, `docs`) and request feedback only after CI succeeds. Update documentation (`README.md`, `AGENTS.md`) whenever you alter build tooling, directory layout, or contributor workflows.

## Visual & Performance Checks
Profile new shader code with Spector.js or the browser devtools to avoid expensive fragment loops. Respect `prefers-reduced-motion` by offering CSS fallbacks and throttled animation timers. Confirm the glow effect degrades gracefully on systems lacking WebGL 2 by retaining a CSS-only fallback layer.
