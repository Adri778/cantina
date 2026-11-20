// CONTROLLER · Produtos: recebe a requisição, chama o model e devolve JSON.
import { Produto } from '../models/Produto.js';

export const produtoController = {
  async listar(req, res) {
    res.json(await Produto.listar());
  },

  async alterarDisponibilidade(req, res) {
    const { disponivel } = req.body || {};
    res.json(await Produto.definirDisponibilidade(req.params.id, disponivel));
  },
};
