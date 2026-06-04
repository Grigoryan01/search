# Forms Application

React + TypeScript application demonstrating accessible modals (React Portals), uncontrolled forms, React Hook Form, Zod validation, and Zustand state management.

## Scripts

- `npm run dev` — start the development server
- `npm run build` — lint, type-check, and create a production build
- `npm run lint` — run ESLint (fails on warnings)
- `npm run test` — run Vitest tests
- `npm run test:coverage` — run tests with coverage report

## Branch

Implementation lives on the `forms` branch. Open a pull request from `forms` to `main` when ready for review.

## Features

- Reusable accessible modal (portal, focus trap, Escape, click outside)
- Uncontrolled form (validate on submit) and React Hook Form (live validation)
- Shared Zod schema for validation
- Submission history displayed as cards with temporary highlight for new entries
- Image upload validation and base64 storage
- Password strength indicator and country autocomplete backed by the store
