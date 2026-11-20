// CONTROLLER · Painel da atendente (rotas protegidas por PIN).
import { Pedido } from '../models/Pedido.js';

export const atendenteController = {
  // O middleware já conferiu o PIN; chegar aqui significa acesso liberado.
  entrar(req, res) {
    res.json({ ok: true });
  },

  async listarPedidos(req, res) {
    res.json(await Pedido.listarDeHoje());
  },

  // O corpo traz { de: 'etapa que a tela mostrava' } para evitar pular etapas.
  async avancar(req, res) {
    res.json(await Pedido.avancar(req.params.id, req.body?.de));
  },

  async voltar(req, res) {
    res.json(await Pedido.voltar(req.params.id, req.body?.de));
  },
};
