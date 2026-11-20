// Armazenamento em memória: usado quando o banco MySQL não está configurado.
// Os dados somem quando o servidor reinicia.
import { PRODUTOS_INICIAIS } from '../dadosIniciais.js';

const produtos = new Map(PRODUTOS_INICIAIS.map((p) => [p.id, { ...p }]));
const pedidos = new Map();
const sequencias = new Map();

export const memoriaStore = {
  tipo: 'memoria',

  async verificar() {},

  async listarProdutos() {
    return [...produtos.values()];
  },
  async salvarProduto(produto) {
    produtos.set(produto.id, produto);
    return produto;
  },

  async proximoNumero(dia) {
    const numero = (sequencias.get(dia) || 0) + 1;
    sequencias.set(dia, numero);
    return numero;
  },
  async inserirPedido(pedido) {
    pedidos.set(pedido.id, pedido);
    return pedido;
  },
  // Muda a etapa só se o pedido ainda estiver na etapa esperada.
  async registrarStatus(id, statusAtual, novoStatus, em) {
    const pedido = pedidos.get(id);
    if (!pedido || pedido.status !== statusAtual) return null;
    const atualizado = { ...pedido, status: novoStatus, historico: [...pedido.historico, { status: novoStatus, em }] };
    pedidos.set(id, atualizado);
    return atualizado;
  },
  async buscarPedido(id) {
    return pedidos.get(id) || null;
  },
  async listarPedidosDoDia(dia) {
    return [...pedidos.values()].filter((p) => p.dia === dia);
  },
};
