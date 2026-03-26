# GEMINI.md - Project Context

## Project Overview
This project, **my-link**, is a workspace containing a Next.js application named **my-profile**. It is designed to be a personal profile or portfolio site.

### Core Technologies
- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Runtime:** Node.js (inferred from `package.json`)
- **UI Library:** React 19

### Architecture
The project follows a standard Next.js App Router structure:
- `my-profile/app/`: Contains the application's routes, layouts, and components.
- `my-profile/public/`: Static assets like images and SVG icons.
- `my-profile/next.config.ts`: Configuration for Next.js.
- `my-profile/tsconfig.json`: TypeScript configuration with path mapping (`@/*` -> `./*`).

## Building and Running
Commands should be executed within the `my-profile` directory.

| Task | Command |
| :--- | :--- |
| **Development** | `npm run dev` |
| **Build** | `npm run build` |
| **Production Start** | `npm run start` |
| **Linting** | `npm run lint` |

## Development Conventions
- **Routing:** Use the Next.js App Router conventions (e.g., `layout.tsx`, `page.tsx`).
- **Styling:** Utilize Tailwind CSS v4 classes for styling.
- **Components:** Favor functional components with React Hooks.
- **Type Safety:** Ensure all new components and functions are properly typed using TypeScript.
- **Imports:** Use the `@/*` alias for cleaner imports from the project root.
- **Icons:** Use `next/image` for optimized image and SVG rendering.
