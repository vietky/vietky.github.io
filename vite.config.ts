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
                    games: resolve(__dirname, 'games.html'),
                    tetris: resolve(__dirname, 'tetris.html'),
                    tank: resolve(__dirname, 'tank.html'),
                    blog: resolve(__dirname, 'blog.html'),
                    privacy: resolve(__dirname, 'privacy.html'),
                    terms: resolve(__dirname, 'terms.html'),
                    contact: resolve(__dirname, 'contact.html'),
                    article_architecture: resolve(__dirname, 'article-architecture.html'),
                    article_gamedev: resolve(__dirname, 'article-gamedev.html'),
                    article_ai: resolve(__dirname, 'article-ai.html'),
                    article_automation: resolve(__dirname, 'article-automation.html')
                }
            }
        }
    }
})