import { ConfigEnv, UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import { execSync } from 'child_process';
import { resolve } from 'node:path'

// https://vitejs.dev/config/
export default (_: ConfigEnv): UserConfig => {
  try {
    process.env.VITE_GIT_TAG = execSync("git describe --tags").toString();
  } catch (e) {
    console.info('Could not get GIT version')
  }

  return {
    base: '/app/',
    server: {
      proxy: {
        "/api": "http://localhost:8000",
        "/backend": "http://localhost:8000",
      },
    },
    plugins: [react()],
    resolve: {
      alias: [{ find: '@', replacement: resolve(__dirname, "./src") }]
    }
  }
};
