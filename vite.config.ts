import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
    const isProduction = mode === 'production';
    return {
        plugins: [
            tailwindcss(),
        ],
        build: {
            outDir: './dist',
            minify: isProduction,
        }
    }
})