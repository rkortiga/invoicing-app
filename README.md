## Requirements

- Node.js 22 LTS
- npm 10.x

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file in the project root:
   ```env
   VITE_API_BASE_URL=https://localhost:7263/api/v1
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev` starts Vite in development mode.
- `npm run build` runs TypeScript build checks and creates a production bundle in `dist/`.
- `npm run preview` serves the production build locally.
- `npm run lint` runs ESLint across the project.
- `npm run kill-dev` frees port `5173` when a local Vite process is still running.
