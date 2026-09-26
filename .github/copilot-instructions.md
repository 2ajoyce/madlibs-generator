# GitHub Copilot Instructions for Madlibs Generator

This repository contains custom instructions for GitHub Copilot. For comprehensive project documentation, coding standards, and development guidelines, refer to the [AGENTS.md](../AGENTS.md) file in the root directory.

## Quick Reference

### Technology Stack
- React 18.3+ with TypeScript 5.9+
- Vite for build tooling
- PeerJS for real-time collaboration
- Cypress for testing
- Firebase for hosting

### Key Commands
```bash
npm install --legacy-peer-deps  # Install dependencies
npm run dev                     # Start dev server
npm run build                   # Build for production
npm run lint                    # Run ESLint
npx cypress run                 # Run tests
```

### Code Style Guidelines
- Use TypeScript strict mode
- Functional components with hooks (no class components)
- Use useState for state, useEffect for side effects
- PascalCase for components, camelCase for variables/functions
- Co-locate tests with components (`.cy.tsx` files)
- Follow import order: React → External → Internal → CSS

### Important Notes
- Use `--legacy-peer-deps` when installing packages
- TypeScript 5.9.3 is newer than officially supported by ESLint but works fine
- Real-time collaboration uses PeerJS with WebRTC
- Session IDs passed via URL query parameters
- Templates use placeholders like `{noun}`, `{adjective}`

For detailed information on:
- Build and development workflows
- Component testing patterns
- Template processing
- Peer communication
- Deployment process
- Known issues and workarounds

Please refer to [AGENTS.md](../AGENTS.md) in the root directory.
