import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    fixturesFolder: false,
    supportFile: false,
  },
  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
    },
    supportFile: "cypress/support/component.tsx",
    specPattern: "src/**/*.cy.{js,jsx,ts,tsx}",
    indexHtmlFile: "cypress/support/component-index.html",
  },
});
