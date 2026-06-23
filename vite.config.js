import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig(({ mode }) => {

  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: "/Dazzling-ERP-Admin/",
    plugins: [
      react(),
      tailwindcss(),
    ],
    server: {
      proxy: {
        '/api/gs': {
          target: env.VITE_API_BASE_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/gs/, ''),
        },
      },
      watch: {
        ignored: [
          '**/.gemini/**',
          '**/.agents/**',
          '**/.antigravitycli/**',

        ]
      }
    }
  }
})

