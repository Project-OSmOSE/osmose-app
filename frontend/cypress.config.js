import {defineConfig} from "cypress";

export default defineConfig({
    env: {
        aploseURL: 'http://localhost:5173/'
    },
    e2e: {
        setupNodeEvents(on, config) {
            // implement node event listeners here
        },
    },
});