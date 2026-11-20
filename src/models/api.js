// MODEL · Comunicação com o back-end. Toda falha vira uma mensagem clara em português.
export class ErroApi extends Error {
  constructor(mensagem, status) {
    super(mensagem);
    this.status = status;
  }
}

async function requisitar(caminho, { metodo = 'GET', corpo, pin } = {}) {
  const cabecalhos = {};
  if (corpo) cabecalhos['Content-Type'] = 'application/json';
  if (pin) cabecalhos['x-atendente-pin'] = pin;

  let resposta;
  try {
    resposta = await fetch(`/api${caminho}`, {
      method: metodo,
      headers: cabecalhos,
      body: corpo ? JSON.stringify(corpo) : undefined,
    });
  } catch {
    throw new ErroApi('Sem conexão com a cantina. Verifique a internet e tente de novo.', 0);
  }

  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) throw new ErroApi(dados.erro || 'Algo deu errado. Tente de novo.', resposta.status);
  return dados;
}

export const api = {
  saude: () => requisitar('/saude'),
  produtos: () => requisitar('/produtos'),
  criarPedido: (dados) => requisitar('/pedidos', { metodo: 'POST', corpo: dados }),
  pedido: (id) => requisitar(`/pedidos/${id}`),
  cancelarPedido: (id) => requisitar(`/pedidos/${id}/cancelar`, { metodo: 'PATCH' }),

  entrar: (pin) => requisitar('/atendente/entrar', { metodo: 'POST', pin }),
  pedidosDoDia: (pin) => requisitar('/atendente/pedidos', { pin }),
  // "de" = etapa que a tela mostrava; o servidor recusa se o pedido já mudou.
  avancar: (id, de, pin) => requisitar(`/atendente/pedidos/${id}/avancar`, { metodo: 'PATCH', corpo: { de }, pin }),
  voltar: (id, de, pin) => requisitar(`/atendente/pedidos/${id}/voltar`, { metodo: 'PATCH', corpo: { de }, pin }),
  disponibilidade: (id, disponivel, pin) =>
    requisitar(`/atendente/produtos/${id}`, { metodo: 'PATCH', corpo: { disponivel }, pin }),
};
