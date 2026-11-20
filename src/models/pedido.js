// MODEL · Etapas do pedido e textos de cada situação.
import { hora } from './formato.js';

export const ETAPAS = [
  { id: 'recebido', nome: 'Pedido recebido' },
  { id: 'preparo', nome: 'Em preparo' },
  { id: 'pronto', nome: 'Pronto para retirar' },
  { id: 'entregue', nome: 'Entregue' },
];

export const ROTULO = {
  recebido: 'Pedido recebido',
  preparo: 'Em preparo',
  pronto: 'Pronto para retirar',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
};

export const SUBTITULO = {
  recebido: 'Pedido confirmado!',
  preparo: 'Seu lanche está em preparo',
  pronto: 'Pronto! Pode retirar',
  entregue: 'Pedido entregue. Bom lanche!',
  cancelado: 'Pedido cancelado',
};

// Botão principal da atendente em cada etapa.
export const ACAO_ATENDENTE = {
  recebido: 'Iniciar preparo',
  preparo: 'Marcar como pronto',
  pronto: 'Entregar ao aluno',
};

export const indiceEtapa = (status) => ETAPAS.findIndex((e) => e.id === status);
export const finalizado = (status) => status === 'entregue' || status === 'cancelado';
export const emAndamento = (status) => ['recebido', 'preparo', 'pronto'].includes(status);

// Horário em que o pedido chegou a uma etapa (a última vez, caso tenha voltado).
export function horaDaEtapa(pedido, status) {
  const registro = [...pedido.historico].reverse().find((h) => h.status === status);
  return registro ? registro.em : null;
}

// Frase do card "Retirada" conforme a situação.
export function textoRetirada(pedido) {
  switch (pedido.status) {
    case 'pronto':
      return 'Seu pedido está pronto: vá ao balcão com a senha';
    case 'entregue':
      return `Pedido retirado às ${hora(horaDaEtapa(pedido, 'entregue'))}`;
    case 'cancelado':
      return 'Este pedido foi cancelado e não será preparado';
    default:
      return 'Você será avisado aqui quando o pedido estiver pronto';
  }
}
