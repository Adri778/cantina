// MODEL · Produto: cardápio e disponibilidade.
import { store } from './store/index.js';
import { ErroDeNegocio } from './erros.js';

export const Produto = {
  listar() {
    return store.listarProdutos();
  },

  async buscar(id) {
    const produtos = await store.listarProdutos();
    return produtos.find((p) => p.id === id) || null;
  },

  async definirDisponibilidade(id, disponivel) {
    const produto = await Produto.buscar(id);
    if (!produto) throw new ErroDeNegocio(404, 'Produto não encontrado.');
    return store.salvarProduto({ ...produto, disponivel: Boolean(disponivel) });
  },
};
