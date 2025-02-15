import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5055,
    proxy: {
      '/user': {
        target: 'https://localhost:53827', // Ensure HTTPS is used
        changeOrigin: true,
        secure: false, // Accept self-signed SSL in local development
      },
      '/admin': {
        target: 'https://localhost:53827',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
