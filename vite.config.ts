import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

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
            minify: isProduction
        }
    }
})