// ROTAS da API: ligam cada endereço HTTP ao controller correspondente.
import { Router } from 'express';
import { produtoController } from '../controllers/produtoController.js';
import { pedidoController } from '../controllers/pedidoController.js';
import { atendenteController } from '../controllers/atendenteController.js';
import { exigirAtendente } from '../middlewares/autenticacao.js';
import { store } from '../models/store/index.js';

const rotas = Router();

// Mostra onde os dados ficam e se o banco está respondendo.
rotas.get('/saude', async (req, res) => {
  try {
    await store.verificar();
    res.json({ ok: true, armazenamento: store.tipo });
  } catch (erro) {
    res.status(503).json({ ok: false, armazenamento: store.tipo, erro: 'Não foi possível conectar ao banco de dados.', detalhe: erro.code });
  }
});

// Aluno
rotas.get('/produtos', produtoController.listar);
rotas.post('/pedidos', pedidoController.criar);
rotas.get('/pedidos/:id', pedidoController.buscar);
rotas.patch('/pedidos/:id/cancelar', pedidoController.cancelar);

// Atendente
rotas.post('/atendente/entrar', exigirAtendente, atendenteController.entrar);
rotas.get('/atendente/pedidos', exigirAtendente, atendenteController.listarPedidos);
rotas.patch('/atendente/pedidos/:id/avancar', exigirAtendente, atendenteController.avancar);
rotas.patch('/atendente/pedidos/:id/voltar', exigirAtendente, atendenteController.voltar);
rotas.patch('/atendente/produtos/:id', exigirAtendente, produtoController.alterarDisponibilidade);

export default rotas;
