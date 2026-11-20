// CONTROLLER · Painel da atendente: fila do dia, cardápio e ações sobre os pedidos.
import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../models/api.js';
import { descreverItens, senha } from '../models/formato.js';
import { ROTULO } from '../models/pedido.js';
import { usePolling } from './usePolling.js';
import { useToast } from './ToastContext.jsx';

export function usePainel(pin, aoPerderAcesso) {
  const { mostrar } = useToast();
  const [estado, setEstado] = useState({ pedidos: [], produtos: [], carregando: true, erro: '', armazenamento: '' });
  const [ocupado, setOcupado] = useState(null);
  const conhecidos = useRef(null);
  const sair = useRef(aoPerderAcesso);
  sair.current = aoPerderAcesso;

  // Avisa a atendente quando chega pedido novo.
  const avisarNovos = useCallback((pedidos) => {
    if (conhecidos.current) {
      const novos = pedidos.filter((p) => !conhecidos.current.has(p.id));
      if (novos.length === 1) mostrar({ mensagem: `Novo pedido ${senha(novos[0].numero)}: ${descreverItens(novos[0].itens)}` });
      if (novos.length > 1) mostrar({ mensagem: `${novos.length} novos pedidos na fila` });
    }
    conhecidos.current = new Set(pedidos.map((p) => p.id));
  }, [mostrar]);

  const carregar = useCallback(async () => {
    try {
      const [pedidos, produtos] = await Promise.all([api.pedidosDoDia(pin), api.produtos()]);
      avisarNovos(pedidos);
      setEstado((s) => ({ ...s, pedidos, produtos, carregando: false, erro: '' }));
    } catch (e) {
      if (e.status === 401) return sair.current();
      setEstado((s) => ({ ...s, carregando: false, erro: e.message }));
    }
  }, [pin, avisarNovos]);

  usePolling(carregar, 3000, Boolean(pin));

  useEffect(() => {
    api.saude().then((s) => setEstado((e) => ({ ...e, armazenamento: s.armazenamento }))).catch(() => {});
  }, []);

  async function executar(id, acao) {
    setOcupado(id);
    try {
      return await acao();
    } catch (e) {
      if (e.status === 401) sair.current();
      else mostrar({ mensagem: e.message, tipo: 'erro' });
      return null;
    } finally {
      setOcupado(null);
    }
  }

  const trocarPedido = (pedido) =>
    setEstado((s) => ({ ...s, pedidos: s.pedidos.map((p) => (p.id === pedido.id ? pedido : p)) }));

  async function voltar(pedido) {
    const atualizado = await executar(pedido.id, () => api.voltar(pedido.id, pedido.status, pin));
    if (atualizado) trocarPedido(atualizado);
  }

  async function avancar(pedido) {
    const atualizado = await executar(pedido.id, () => api.avancar(pedido.id, pedido.status, pin));
    if (!atualizado) return;
    trocarPedido(atualizado);
    mostrar({
      mensagem: `${senha(atualizado.numero)}: ${ROTULO[atualizado.status]}`,
      acao: { rotulo: 'Desfazer', onClick: () => voltar(atualizado) },
    });
  }

  async function alternarDisponibilidade(produto) {
    const atualizado = await executar(produto.id, () => api.disponibilidade(produto.id, !produto.disponivel, pin));
    if (!atualizado) return;
    setEstado((s) => ({ ...s, produtos: s.produtos.map((p) => (p.id === atualizado.id ? atualizado : p)) }));
    mostrar({ mensagem: atualizado.disponivel ? `${atualizado.nome} voltou ao cardápio` : `${atualizado.nome} marcado como esgotado` });
  }

  return { ...estado, ocupado, avancar, alternarDisponibilidade, recarregar: carregar };
}
