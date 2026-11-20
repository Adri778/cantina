// MODEL · Pedido: criação, validação e mudança de etapas.
import crypto from 'node:crypto';
import { store } from './store/index.js';
import { Produto } from './Produto.js';
import { ErroDeNegocio } from './erros.js';
import { config } from '../config.js';

export const ETAPAS = ['recebido', 'preparo', 'pronto', 'entregue'];

// Data de hoje no fuso da escola, no formato AAAA-MM-DD.
function hoje() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: config.fusoHorario }).format(new Date());
}

const AVISO_CONFLITO = 'Este pedido acabou de ser atualizado em outra tela. Confira a situação atual.';

function conferirEtapa(pedido, de) {
  if (de && pedido.status !== de) throw new ErroDeNegocio(409, AVISO_CONFLITO);
}

// Grava a nova etapa. Se outra tela mudou o pedido no meio do caminho, avisa em vez de sobrescrever.
async function registrar(pedido, novoStatus) {
  const atualizado = await store.registrarStatus(pedido.id, pedido.status, novoStatus, new Date().toISOString());
  if (!atualizado) throw new ErroDeNegocio(409, AVISO_CONFLITO);
  return atualizado;
}

export const Pedido = {
  // O total é calculado aqui, com os preços do servidor: o navegador não decide valores.
  async criar({ itens, nome }) {
    if (!Array.isArray(itens) || itens.length === 0) {
      throw new ErroDeNegocio(400, 'Adicione pelo menos um item ao pedido.');
    }
    const produtos = await Produto.listar();
    const linhas = itens.map((item) => {
      const produto = produtos.find((p) => p.id === item.produtoId);
      const qtd = Number(item.qtd);
      if (!produto) {
        throw new ErroDeNegocio(400, 'Um dos itens saiu do cardápio. Volte ao cardápio e monte o pedido de novo.');
      }
      if (!produto.disponivel) {
        throw new ErroDeNegocio(409, `${produto.nome} acabou agora. Remova o item para continuar.`);
      }
      if (!Number.isInteger(qtd) || qtd < 1 || qtd > config.limitePorItem) {
        throw new ErroDeNegocio(400, `Escolha de 1 a ${config.limitePorItem} unidades de ${produto.nome}.`);
      }
      const { id, nome: nomeProduto, preco, singular, plural } = produto;
      return { produtoId: id, nome: nomeProduto, preco, singular, plural, qtd };
    });

    const dia = hoje();
    const agora = new Date().toISOString();
    const pedido = {
      id: crypto.randomUUID(),
      numero: await store.proximoNumero(dia),
      dia,
      nome: String(nome || '').trim().slice(0, 40),
      itens: linhas,
      total: linhas.reduce((soma, l) => soma + l.preco * l.qtd, 0),
      status: 'recebido',
      historico: [{ status: 'recebido', em: agora }],
      criadoEm: agora,
    };
    return store.inserirPedido(pedido);
  },

  async buscar(id) {
    const pedido = await store.buscarPedido(id);
    if (!pedido) throw new ErroDeNegocio(404, 'Pedido não encontrado. As senhas valem só no dia do pedido.');
    return pedido;
  },

  listarDeHoje() {
    return store.listarPedidosDoDia(hoje());
  },

  // "de" é a etapa que a tela da atendente estava mostrando. Se o pedido já mudou
  // (outra tela, clique duplo), recusa em vez de pular uma etapa sem querer.
  async avancar(id, de) {
    const pedido = await Pedido.buscar(id);
    conferirEtapa(pedido, de);
    const indice = ETAPAS.indexOf(pedido.status);
    if (indice < 0 || indice === ETAPAS.length - 1) {
      throw new ErroDeNegocio(409, 'Este pedido já foi finalizado.');
    }
    return registrar(pedido, ETAPAS[indice + 1]);
  },

  // Desfaz o último avanço da atendente.
  async voltar(id, de) {
    const pedido = await Pedido.buscar(id);
    conferirEtapa(pedido, de);
    const indice = ETAPAS.indexOf(pedido.status);
    if (indice <= 0) throw new ErroDeNegocio(409, 'Este pedido já está na primeira etapa.');
    return registrar(pedido, ETAPAS[indice - 1]);
  },

  // O aluno só cancela antes de o preparo começar.
  async cancelar(id) {
    const pedido = await Pedido.buscar(id);
    if (pedido.status !== 'recebido') {
      throw new ErroDeNegocio(409, 'O preparo já começou e o pedido não pode mais ser cancelado. Fale com a atendente no balcão.');
    }
    return registrar(pedido, 'cancelado');
  },
};
