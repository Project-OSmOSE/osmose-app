import { ConfigEnv, UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import { execSync } from 'child_process';


// https://vitejs.dev/config/
export default (_: ConfigEnv): UserConfig => {
  process.env.VITE_GIT_TAG = execSync("git describe --tags").toString();

  return {
    base: './',
    server: {
      proxy: {
        "/api": "http://localhost:8000",
        "/backend": "http://localhost:8000",
      },
    },
    plugins: [react()],
  }
}

// export default defineConfig({
//   base: './',
//   server: {
//     proxy: {
//       "/api": "http://localhost:8000",
//       "/backend": "http://localhost:8000",
//     },
//   },
//   plugins: [react()],
// });
