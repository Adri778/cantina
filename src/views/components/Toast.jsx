// VIEW · Aviso rápido na parte de baixo da tela.
import { useToast } from '../../controllers/ToastContext.jsx';

export default function Toast() {
  const { toast, fechar } = useToast();
  if (!toast) return null;

  return (
    <div key={toast.chave} className={`toast${toast.tipo === 'erro' ? ' toast-erro' : ''}`} role="status">
      <p>{toast.mensagem}</p>
      {toast.acao && (
        <button
          type="button"
          onClick={() => {
            toast.acao.onClick();
            fechar();
          }}
        >
          {toast.acao.rotulo}
        </button>
      )}
      <button type="button" className="toast-fechar" onClick={fechar} aria-label="Fechar aviso">×</button>
    </div>
  );
}
