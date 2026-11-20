// CONTROLLER · Cardápio: carrega os produtos e confere a disponibilidade a cada 20 s.
import { useCallback, useState } from 'react';
import { api } from '../models/api.js';
import { usePolling } from './usePolling.js';

export function useProdutos() {
  const [estado, setEstado] = useState({ produtos: [], carregando: true, erro: '' });

  const carregar = useCallback(async () => {
    try {
      const produtos = await api.produtos();
      setEstado({ produtos, carregando: false, erro: '' });
    } catch (e) {
      setEstado((s) => ({ ...s, carregando: false, erro: e.message }));
    }
  }, []);

  usePolling(carregar, 20000);
  return { ...estado, recarregar: carregar };
}
