// CONTROLLER · Atualiza o título da aba do navegador.
import { useEffect } from 'react';

export function useTitulo(titulo) {
  useEffect(() => {
    document.title = titulo ? `${titulo} · Cantina da Escola` : 'Cantina da Escola';
  }, [titulo]);
}
