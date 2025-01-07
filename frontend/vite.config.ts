import { ConfigEnv, UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import { execSync } from 'child_process';
import { resolve } from 'node:path'
import { ClientRequest, IncomingMessage } from "node:http";

// https://vitejs.dev/config/
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        "/doc": {
          target: "http://localhost:5174/",
          prependPath: false,
          rewrite: (path: string) => {
            console.debug(path);
            return ''
          },
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (proxyReq: ClientRequest, req, _res) => {
              console.log('Sending Request to the Target:', proxyReq.path, req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes: IncomingMessage, req, _res) => {
              console.log('Received Response from the Target:', proxyRes.readableLength, proxyRes.statusCode, req.url);
            });
          },
        },
      },
      cors: false
    },
    plugins: [ react() ],
    resolve: {
      alias: [ { find: '@', replacement: resolve(__dirname, "./src") } ]
    },
  }
};
