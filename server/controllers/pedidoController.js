// CONTROLLER · Pedidos do aluno.
import { Pedido } from '../models/Pedido.js';

export const pedidoController = {
  async criar(req, res) {
    const pedido = await Pedido.criar(req.body || {});
    res.status(201).json(pedido);
  },

  async buscar(req, res) {
    res.json(await Pedido.buscar(req.params.id));
  },

  async cancelar(req, res) {
    res.json(await Pedido.cancelar(req.params.id));
  },
};
