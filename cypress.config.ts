import { defineConfig } from "cypress";

export default defineConfig({
  projectId: 'gq63fp',
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },

  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
    },
  },
});
