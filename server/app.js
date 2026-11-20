// Aplicação Express: junta middlewares, rotas e tratamento de erros.
// É usada em três lugares: no Vite (dev), em server/dev.js e na Vercel (api/index.js).
import express from 'express';
import rotas from './routes/index.js';
import { rotaNaoEncontrada, tratarErros } from './middlewares/erros.js';

const app = express();

app.use(express.json({ limit: '20kb' }));
app.use('/api', rotas);
app.use('/api', rotaNaoEncontrada);
app.use(tratarErros);

export default app;
