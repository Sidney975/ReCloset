import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5055,
    proxy: {
      '/user': {
        target: 'http://localhost:5055', // Ensure HTTP is used
        changeOrigin: true,
        secure: false,
      },
      '/admin': {
        target: 'http://localhost:5055',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});

