import {defineConfig} from "cypress";

export default defineConfig({
    env: {
        aploseURL: 'http://localhost:5173/',
        wholeFileCampaign: 'Whole file campaign',
        boxCampaign: 'Box campaign',
    },
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
