import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Em desenvolvimento a API Express roda dentro do próprio servidor do Vite,
// então front-end e back-end ficam no mesmo endereço (http://localhost:5173).
function apiExpress() {
  const montar = async (server) => {
    const { default: app } = await import('./server/app.js');
    server.middlewares.use((req, res, next) => (req.url.startsWith('/api') ? app(req, res, next) : next()));
  };
  return { name: 'api-express', configureServer: montar, configurePreviewServer: montar };
}

export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''));
  return { plugins: [react(), apiExpress()] };
});
