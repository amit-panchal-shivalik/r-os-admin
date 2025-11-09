# Repository Guidelines

## Project Structure & Module Organization
- Root: Vite + React + TypeScript app. Entry at `index.html`, config in `vite.config.ts`.
- Source: `src/` contains `apis/`, `components/`, `pages/`, `routing/`, `store/`, `types/`, `utils/`, `hooks/`, `context/`, `lib/`.
- Aliases: Use `@/` for imports (maps to `src/`) per `vite.config.ts` and `tsconfig.json`.
- Assets: Public files in `public/`; global styles in `src/index.css` and Tailwind with `postcss.config.js` and `tailwind.config.ts`.
- API Spec: `swagger.yaml` documents backend endpoints.

## Build, Test, and Development Commands
- `npm run dev`: Start Vite dev server on `http://localhost:8080` with HMR.
- `npm run build`: Production build (drops `console`/`debugger`).
- `npm run build:dev` / `build:staging`: Build for alternate modes using Vite envs.
- `npm run preview`: Serve the production build locally.
- `npm run lint`: Run ESLint over the project.

## Coding Style & Naming Conventions
- Language: TypeScript. Prefer explicit types for APIs and shared models in `src/types/`.
- Indentation: 2 spaces; single quotes; semicolons allowed; keep imports sorted (group libs → `@/` → relative).
- Components: `PascalCase` files (`UserCard.tsx`); hooks: `useX.ts`; Redux slices in `store/slices/`.
- Styling: Tailwind utility-first; colocate minimal CSS modules only when necessary.
- Imports: Prefer `@/feature/...` over deep relative paths.

## Testing Guidelines
- This repo does not include a test runner yet. If adding logic-heavy code, include unit tests (suggested: Vitest + Testing Library) under `src/**/__tests__` or `*.test.ts(x)`.
- Mock network calls (Axios) and keep tests deterministic. Aim for >80% coverage on pure utilities.

## Commit & Pull Request Guidelines
- Branching: branch from `development` (protected); open PRs into `development`. Protected branches: `main`, `production`, `staging`, `development` (no direct pushes).
- Commits: Prefer Conventional Commits, e.g. `feat(territory): add selector`, `fix(build): include api services`.
- PRs: include a clear description, linked issues, before/after screenshots for UI, and notes on state/API changes. Ensure `npm run lint` and `npm run build` pass. Update `swagger.yaml` and docs when endpoints or contracts change.

## Security & Configuration Tips
- Env: Use `.env.local` for secrets; prefix variables with `VITE_` (e.g., `VITE_API_BASE_URL=https://...`). Never commit secrets.
- Keys: Services like Google Maps require keys via env. Verify with `npm run preview` before merging.
