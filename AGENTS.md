# GitHub Copilot Instructions for Madlibs Generator

## Project Overview

The Madlibs Generator is an interactive web application built with React and TypeScript that allows users to create and collaboratively edit Madlibs stories in real-time. The application enables both solo and multiplayer experiences using peer-to-peer connections.

## Technology Stack

- **React 18.3+**: UI framework with functional components and hooks
- **TypeScript 5.9+**: Type-safe JavaScript with strict mode enabled
- **Vite 5.3+**: Build tool and development server
- **PeerJS 1.5+**: Real-time peer-to-peer collaboration via WebRTC
- **Firebase**: Hosting and deployment
- **Cypress 13+**: End-to-end and component testing
- **ESLint 9+**: Code linting with TypeScript support

## Build and Development Commands

### Installing Dependencies
```bash
npm install --legacy-peer-deps
```
Note: Use `--legacy-peer-deps` due to peer dependency conflicts with TypeScript ESLint packages.

For environments with network restrictions, skip Cypress binary download:
```bash
CYPRESS_INSTALL_BINARY=0 npm install --legacy-peer-deps
```

### Development
```bash
npm run dev          # Start Vite dev server on http://localhost:5173
```

### Building
```bash
npm run build        # TypeScript compilation + Vite production build
```
Build output is created in the `dist/` directory.

### Linting
```bash
npm run lint         # Run ESLint on src files
```
Note: There may be warnings about TypeScript version compatibility with ESLint, but these can be ignored if the build succeeds.

### Testing
```bash
npx cypress run      # Run all Cypress tests
npx cypress open     # Open Cypress interactive UI
```

Component tests are located alongside source files with `.cy.tsx` extension.
E2E tests are in the `cypress/e2e/` directory.

### Previewing Production Build
```bash
npm run preview      # Preview production build locally
```

## Code Style and Conventions

### TypeScript Guidelines
- Use strict TypeScript mode (all strict checks enabled)
- Avoid using `any` type when possible; use proper typing
- Use React functional components with TypeScript types
- Export types using `type` keyword for type-only exports
- Use `interface` for object shapes and `type` for unions/intersections

### React Conventions
- Use functional components with hooks (no class components)
- Use React.useState for local state management
- Use React.useEffect for side effects
- Component files use `.tsx` extension
- Export one main component per file
- Use named exports for utility functions

### File Organization
- Component files: `src/ComponentName.tsx`
- Component tests: `src/ComponentName.cy.tsx`
- Utility modules: `src/utility_name/` directories with `.ts` files
- Styles: Component-specific CSS files alongside components

### Naming Conventions
- Components: PascalCase (e.g., `InputFields`, `SessionDisplay`)
- Files: PascalCase for components, camelCase for utilities
- Variables and functions: camelCase
- Constants: camelCase (not UPPER_CASE)
- CSS classes: kebab-case

### Import Order
1. React imports
2. External library imports
3. Internal component imports
4. Utility/helper imports
5. CSS imports

Example:
```typescript
import { useEffect, useState, type ReactElement } from 'react'
import './App.css'
import InputFields from './InputFields'
import PeerManager from './PeerManager'
```

## Component Testing with Cypress

- Component tests use Cypress Component Testing framework
- Test files are co-located with components: `ComponentName.cy.tsx`
- Tests should mount the component and verify behavior
- Use descriptive test names that explain what is being tested
- Test user interactions, state changes, and visual rendering

Example pattern:
```typescript
import ComponentName from './ComponentName'

describe('ComponentName', () => {
    it('should render correctly', () => {
        cy.mount(<ComponentName />)
        cy.get('[data-cy="selector"]').should('exist')
    })
})
```

## Project-Specific Context

### Real-Time Collaboration
- PeerJS is used for WebRTC peer-to-peer connections
- The `PeerManager` class is a singleton that manages connections
- Session IDs are passed via URL query parameters (`?sessionId=xxx`)
- Messages are sent between peers to synchronize state

### Template Processing
- Templates use placeholders like `{noun}`, `{adjective}`, etc.
- The `file_processing/txt_files.ts` module handles template parsing
- Templates can be uploaded as `.txt` files or entered directly
- Input fields are dynamically generated from template placeholders

### State Management
- App uses React hooks for state (no Redux or external state management)
- Peer manager handles synchronization between collaborators
- Session state includes: template, inputs, story, sessionId, peerId, collaborators

## Common Tasks

### Adding a New Component
1. Create `ComponentName.tsx` in `src/`
2. Create corresponding test file `ComponentName.cy.tsx`
3. Write component logic with TypeScript types
4. Add component tests covering key functionality
5. Import and use in parent component

### Modifying Template Processing
- Edit `src/file_processing/txt_files.ts`
- Add tests in `src/file_processing/txt_files.cy.tsx`
- Ensure regex patterns handle edge cases

### Updating Peer Communication
- Edit `src/PeerManager.ts`
- Update message types in the enum
- Handle new message types in message handlers
- Test peer synchronization manually with multiple browser windows

## Deployment

The application is deployed to Firebase Hosting:
- Production URL: https://madlibs.2ajoyce.com
- Deployment is automated via GitHub Actions on merge to main branch
- Configuration files: `firebase.json`, `.firebaserc`

## Known Issues and Workarounds

- TypeScript version (5.9.3) is newer than officially supported by @typescript-eslint (supports <5.6.0)
  - Workaround: Continue using current version; build works despite warning
- Peer dependency conflicts with ESLint TypeScript packages
  - Workaround: Use `--legacy-peer-deps` flag when installing
- Cypress binary may fail to download in restricted networks
  - Workaround: Set `CYPRESS_INSTALL_BINARY=0` environment variable

## Additional Notes

- The `.vscode/` directory contains editor-specific settings
- The `example/` directory contains sample Madlib templates
- The `demos/` directory contains demonstration GIFs
- Keep dependencies up to date using `npm run update` (uses npm-check-updates)
