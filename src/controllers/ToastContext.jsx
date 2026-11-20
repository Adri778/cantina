// CONTROLLER · Avisos rápidos na parte de baixo da tela, com ação opcional ("Desfazer").
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timer = useRef(null);

  const fechar = useCallback(() => {
    clearTimeout(timer.current);
    setToast(null);
  }, []);

  const mostrar = useCallback((novo) => {
    clearTimeout(timer.current);
    setToast({ ...novo, chave: Date.now() });
    timer.current = setTimeout(() => setToast(null), novo.duracao || 5000);
  }, []);

  const valor = useMemo(() => ({ toast, mostrar, fechar }), [toast, mostrar, fechar]);
  return <ToastCtx.Provider value={valor}>{children}</ToastCtx.Provider>;
}

export const useToast = () => useContext(ToastCtx);
