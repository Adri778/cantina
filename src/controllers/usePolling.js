// CONTROLLER · Executa uma tarefa agora e repete a cada intervalo.
// Pausa quando a aba está escondida e atualiza na hora quando o usuário volta.
import { useEffect, useRef } from 'react';

export function usePolling(tarefa, intervalo, ativo = true) {
  const tarefaAtual = useRef(tarefa);
  tarefaAtual.current = tarefa;

  useEffect(() => {
    if (!ativo) return undefined;
    const visivel = () => document.visibilityState === 'visible';
    const rodar = () => visivel() && tarefaAtual.current();

    tarefaAtual.current();
    const id = setInterval(rodar, intervalo);
    document.addEventListener('visibilitychange', rodar);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', rodar);
    };
  }, [intervalo, ativo]);
}
