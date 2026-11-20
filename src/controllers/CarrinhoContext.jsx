// CONTROLLER · Carrinho compartilhado entre Cardápio e Revisão (salvo no navegador).
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { armazenamento } from '../models/armazenamento.js';
import { comQuantidade } from '../models/carrinho.js';

const CarrinhoCtx = createContext(null);

export function CarrinhoProvider({ children }) {
  const [carrinho, setCarrinho] = useState(armazenamento.carrinho);
  const [nome, setNome] = useState('');

  useEffect(() => {
    armazenamento.salvarCarrinho(carrinho);
  }, [carrinho]);

  const valor = useMemo(() => ({
    carrinho,
    nome,
    setNome,
    adicionar: (id) => setCarrinho((c) => comQuantidade(c, id, (c[id] || 0) + 1)),
    diminuir: (id) => setCarrinho((c) => comQuantidade(c, id, (c[id] || 0) - 1)),
    definir: (id, qtd) => setCarrinho((c) => comQuantidade(c, id, qtd)),
    remover: (id) => setCarrinho((c) => comQuantidade(c, id, 0)),
    preencher: (itens) => setCarrinho(Object.fromEntries(itens.map((i) => [i.produtoId, i.qtd]))),
    limpar: () => setCarrinho({}),
  }), [carrinho, nome]);

  return <CarrinhoCtx.Provider value={valor}>{children}</CarrinhoCtx.Provider>;
}

export const useCarrinho = () => useContext(CarrinhoCtx);
