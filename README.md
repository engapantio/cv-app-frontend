# CV App Frontend

A CV management web application built with **Next.js (App Router)** and a **GraphQL backend via Apollo Client**. It provides authentication, user and CV management, CV preview with PDF export, and reference-data administration, with full internationalization (EN/RU/PL/DE) and light/dark appearance settings.

## Features

- **Authentication** — login, signup, forgot/reset password, email verification, and access-token rotation (automatic refresh with retry on auth errors). The refresh token is stored in an HTTP-only cookie and rotated via `/api/auth/refresh`; the access token is held in memory and attached to requests by a custom Apollo auth link.
- **User management** — user list with search/sort, user profile with avatar upload, and per-user skills and languages (add / update / remove).
- **CV management** — CV list (`/cvs`, `/users/:userId/cvs`), CV details, CV skills, CV projects, and CV preview.
- **CV preview & PDF export** — print-friendly CV preview and PDF download (exported via the backend `exportPdf` mutation and saved as a Blob).
- **Reference-data admin** — departments, positions, skills, languages, and projects pages, each with create/update/delete and search/sort.
- **Settings** — language selection and appearance (light / dark / system).

The GraphQL layer is typed from the **cv-graphql** backend schema (generated via GraphQL Codegen) and served through a same-origin `/api/graphql` proxy, so the refresh token is never exposed to the browser. The browser client uses Apollo Client with an `InMemoryCache` (custom `typePolicies`), an auth link (Bearer token + refresh/retry), and `HttpLink`.

## Dependencies

Install with `pnpm install` (this is a pnpm project — see `packageManager` in `package.json`). Versions as of `package.json`:

| Category       | Package                                                                                  | Version                                        |
| -------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------- |
| Framework      | `next`                                                                                   | 16.3.0                                         |
| Framework      | `react` / `react-dom`                                                                    | 19.2.4                                         |
| Framework      | `typescript` (dev)                                                                       | ^6.0.3                                         |
| Data           | `@apollo/client`                                                                         | ^4.2.7                                         |
| Data           | `@apollo/client-integration-nextjs`                                                      | ^0.14.5                                        |
| Data           | `graphql`                                                                                | ^16.14.2                                       |
| Data (dev)     | `@graphql-codegen/cli`, `typescript`, `typescript-operations`, `typescript-react-apollo` | ^7.2.0 / ^6.1.0 / ^6.1.0 / ^4.4.2              |
| Data (dev)     | `@graphql-typed-document-node/core`                                                      | ^3.2.0                                         |
| UI             | shadcn/ui + Tailwind CSS (Tailwind v4, `@tailwindcss/postcss`)                           | ^4                                             |
| UI             | `@base-ui/react`                                                                         | ^1.6.0                                         |
| UI             | `@tanstack/react-table`                                                                  | ^8.21.3                                        |
| UI             | `class-variance-authority`, `clsx`, `tailwind-merge`                                     | ^0.7.1 / ^2.1.1 / ^3.6.0                       |
| UI             | `cmdk`, `lucide-react`, `react-day-picker`, `sonner`, `tw-animate-css`                   | ^1.1.1 / ^1.24.0 / ^10.0.1 / ^2.0.7 / ^1.4.0   |
| Forms          | `react-hook-form`, `zod`, `@hookform/resolvers`                                          | ^7.81.0 / ^4.4.3 / ^5.4.0                      |
| i18n / theming | `next-intl`, `next-themes`                                                               | ^4.13.4 / ^0.4.6                               |
| Utils          | `date-fns`, `rxjs`                                                                       | ^4.4.0 / ^7.8.2                                |
| Testing (dev)  | `jest`, `jest-environment-jsdom`                                                         | ^30.4.2 / ^30.4.1                              |
| Testing (dev)  | `@testing-library/react`, `jest-dom`, `user-event`, `dom`, `@types/jest`                 | ^16.3.2 / ~6.9.1 / ^14.6.1 / ^10.4.1 / ^30.0.0 |
| Testing (dev)  | `identity-obj-proxy`                                                                     | ^3.0.0                                         |
| Tooling (dev)  | `eslint` + `eslint-config-next`                                                          | ^9 / 16.3.0                                    |
| Tooling (dev)  | `prettier`, `husky`, `shadcn` (CLI)                                                      | ^3.9.5 / ^9.1.7 / ^4.13.0                      |

No E2E test framework (Cypress/Playwright) is present — unit testing only.

## Getting Started

### Prerequisites

- **Node.js 20+** (required by Next.js 16).
- **pnpm 11** (the project pins `pnpm@11.21.0`; use [Corepack](https://nodejs.org/api/corepack.html) or install pnpm directly).

### Install

```bash
pnpm install
```

### Environment variables

Copy the example file and adjust if needed:

```bash
cp .env.example .env.local
```

Required variables:

| Variable          | Description                                                                                                                                             |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GRAPHQL_API_URL` | Backend GraphQL endpoint (server-side only). Browser requests go through the same-origin `/api/graphql` proxy, so no `NEXT_PUBLIC_*` variant is needed. |

The example file defaults to `http://localhost:3001/api/graphql` for a locally running backend. The deployed cv-project backend can be used instead: `https://cv-project-js.inno.ws/api/graphql`.

### Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The app is a Next.js App Router app — no locale prefix is used in URLs; language is a user preference applied client-side.

### Build & production start

```bash
pnpm build
pnpm start   # serves the production build, default http://localhost:3000
```

### Regenerating GraphQL types (optional)

```bash
pnpm codegen   # regenerates src/gql/generated from the schema at GRAPHQL_API_URL
```

Only needed after the backend schema or `src/gql/**/*.gql` operations change.

## Running Tests

The project uses **Jest + React Testing Library** (`jest-environment-jsdom`). Tests are colocated with source files as `*.test.ts` / `*.test.tsx` under `src/app`, `src/components`, `src/features`, and `src/lib`.

Run the full test suite:

```bash
pnpm test
```

Watch mode (re-run on change):

```bash
pnpm test:watch
```

Coverage (CI mode, runs in-band with coverage enabled):

```bash
pnpm test:ci
```

Coverage is collected by default and written to `coverage/`; thresholds are enforced in `jest.config.ts` (≥80% statements/lines). Jest setup lives in `jest.setup.ts` (jest-dom matchers, `next/navigation` and `matchMedia`/`ResizeObserver` mocks).
