import { ConfigEnv, type UserConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default (_: ConfigEnv): UserConfig => {

    return {
        base: '/app/',
        server: {
            proxy: {
                '/api': 'http://localhost:8000',
                '/backend': 'http://localhost:8000',
                '/doc': 'http://localhost:5174',
            },
            cors: false,
        },
        plugins: [
            devtools(),
            tanstackRouter({
                target: 'react',
                autoCodeSplitting: true,
                routesDirectory: './src/routes',
                generatedRouteTree: './src/routeTree.gen.ts',
                routeFileIgnorePrefix: '-',
                quoteStyle: 'single'
            }),
            react(),
            dts({
                tsconfigPath: 'tsconfig.json',
                exclude: [
                    'node_modules',
                ],
            })
        ],
        resolve: {
            alias: [
                { find: '@', replacement: resolve(__dirname, './src') },
            ],
        },
        css: {
            preprocessorOptions: {
                scss: {
                    api: 'modern-compiler', // or "modern"
                },
            },
        },
    }
};
