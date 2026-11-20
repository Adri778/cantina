// MODEL · Formatação de valores para a tela (moeda, hora, senha, itens).
export const brl = (valor) => Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const senha = (numero) => `#${String(numero).padStart(3, '0')}`;

export const hora = (iso) => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

export const horaComSegundos = (data) => data.toLocaleTimeString('pt-BR');

// [{ qtd: 2, singular: 'suco', plural: 'sucos' }, ...] -> "2 sucos + 1 sanduíche"
export const descreverItens = (itens) =>
  itens.map((i) => `${i.qtd} ${i.qtd === 1 ? i.singular : i.plural}`).join(' + ');

export const minutosDesde = (iso) => Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));

export const semAcento = (texto) => texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Data de hoje no fuso da escola (AAAA-MM-DD), igual à usada pelo servidor.
export const hojeNaEscola = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
