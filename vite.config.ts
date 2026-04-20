import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
    const isProduction = mode === 'production';
    return {
        plugins: [
            tailwindcss(),
            viteStaticCopy({
                targets: [
                    {
                        src: 'public/*',
                        dest: 'public/'
                    }
                ]
            })
        ],
        build: {
            outDir: './dist',
            minify: isProduction,
            rollupOptions: {
                input: {
                    main: resolve(__dirname, 'index.html'),
                    portfolio: resolve(__dirname, 'portfolio.html'),
                    tetris: resolve(__dirname, 'tetris.html'),
                    tank: resolve(__dirname, 'tank.html')
                }
            }
        }
    }
})