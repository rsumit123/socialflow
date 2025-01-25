import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  server: {
    host: '0.0.0.0', // Allows access from other devices on the same network
    port: 5173,      // Optional: specify the port
  },
  plugins: [react()],
});