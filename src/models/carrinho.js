// MODEL · Regras do carrinho. O carrinho é um objeto { idDoProduto: quantidade }.
export const LIMITE_POR_ITEM = 10;

export function comQuantidade(carrinho, id, qtd) {
  const novo = { ...carrinho };
  if (qtd <= 0) delete novo[id];
  else novo[id] = Math.min(qtd, LIMITE_POR_ITEM);
  return novo;
}

// Junta o carrinho com os dados do cardápio: [{ ...produto, qtd }]
export function linhasDoCarrinho(carrinho, produtos) {
  return produtos.filter((p) => carrinho[p.id] > 0).map((p) => ({ ...p, qtd: carrinho[p.id] }));
}

export const totalDe = (linhas) => linhas.reduce((soma, l) => soma + l.preco * l.qtd, 0);

export const quantidadeDe = (carrinho) => Object.values(carrinho).reduce((soma, q) => soma + q, 0);
