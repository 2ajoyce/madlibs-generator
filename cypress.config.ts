import { defineConfig } from 'cypress'

export default defineConfig({
    e2e: {
        baseUrl: 'http://localhost:5173',
        setupNodeEvents(on, config) {
            console.debug('Impliment node event listeners here', on, config)
        },
        excludeSpecPattern: [
          '*/*/**/spec.cy.ts',
          '*/**cypress/e2e/1-getting-started',
          '*/**/cypress/e2e/2-advanced-examples'
      ],
    },

    component: {
        devServer: {
            framework: 'react',
            bundler: 'vite',
        },
    },
})
