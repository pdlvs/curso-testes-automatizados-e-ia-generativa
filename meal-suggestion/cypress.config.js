const { defineConfig } = require("cypress");

module.exports = defineConfig({
  allowCypressEnv: true,

  e2e: {
    env:{
      baseUrl: 'https://meal-suggestion.s3.eu-central-1.amazonaws.com/'
    },
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});