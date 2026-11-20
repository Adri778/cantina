// CONTROLLER · Acompanhamento: busca o pedido a cada 3 s até ele ser entregue ou cancelado.
import { useCallback, useState } from 'react';
import { api } from '../models/api.js';
import { finalizado } from '../models/pedido.js';
import { usePolling } from './usePolling.js';

export function usePedido(id) {
  const [estado, setEstado] = useState({ pedido: null, carregando: true, erro: '', naoExiste: false, atualizadoEm: null });

  const carregar = useCallback(async () => {
    try {
      const pedido = await api.pedido(id);
      setEstado({ pedido, carregando: false, erro: '', naoExiste: false, atualizadoEm: new Date() });
    } catch (e) {
      setEstado((s) => ({ ...s, carregando: false, erro: e.message, naoExiste: e.status === 404 }));
    }
  }, [id]);

  const ativo = !estado.naoExiste && !(estado.pedido && finalizado(estado.pedido.status));
  usePolling(carregar, 3000, ativo);

  async function cancelar() {
    const pedido = await api.cancelarPedido(id);
    setEstado((s) => ({ ...s, pedido, erro: '', atualizadoEm: new Date() }));
  }

  return { ...estado, cancelar, recarregar: carregar };
}
