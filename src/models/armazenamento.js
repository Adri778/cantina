// MODEL · Dados guardados no navegador (carrinho, pedidos do aluno e PIN da sessão).
// O acesso pode falhar (aba anônima, bloqueio); nesse caso o sistema segue sem guardar.
function ler(chave, padrao) {
  try {
    const valor = JSON.parse(localStorage.getItem(chave));
    return valor ?? padrao;
  } catch {
    return padrao;
  }
}

function gravar(chave, valor) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    /* sem armazenamento disponível */
  }
}

export const armazenamento = {
  carrinho: () => ler('cantina:carrinho', {}),
  salvarCarrinho: (carrinho) => gravar('cantina:carrinho', carrinho),

  meusPedidos: () => ler('cantina:meus-pedidos', []),
  lembrarPedido(pedido) {
    const outros = ler('cantina:meus-pedidos', []).filter((p) => p.id !== pedido.id);
    gravar('cantina:meus-pedidos', [{ id: pedido.id, numero: pedido.numero, dia: pedido.dia }, ...outros].slice(0, 10));
  },

  // O PIN fica só na sessão: fechou a aba, precisa entrar de novo.
  pin() {
    try {
      return sessionStorage.getItem('cantina:pin') || '';
    } catch {
      return '';
    }
  },
  salvarPin(pin) {
    try {
      if (pin) sessionStorage.setItem('cantina:pin', pin);
      else sessionStorage.removeItem('cantina:pin');
    } catch {
      /* sem armazenamento disponível */
    }
  },
};
