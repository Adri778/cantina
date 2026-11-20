// VIEW · Janela "Como funciona" (fecha com Esc, clique fora ou no botão).
import { useEffect, useRef } from 'react';

export default function Ajuda({ onFechar }) {
  const dialogo = useRef(null);

  useEffect(() => {
    if (!dialogo.current.open) dialogo.current.showModal();
  }, []);

  return (
    <dialog
      ref={dialogo}
      className="ajuda"
      aria-labelledby="ajuda-titulo"
      onClose={onFechar}
      onClick={(e) => e.target === dialogo.current && onFechar()}
    >
      <h2 id="ajuda-titulo">Como funciona</h2>
      <ol>
        <li><b>Escolha os lanches</b> tocando em “Adicionar”. Use − e + para mudar a quantidade.</li>
        <li><b>Revise e confirme</b> o pedido. Você recebe uma senha.</li>
        <li><b>Acompanhe pelo celular.</b> Quando a etapa “Pronto para retirar” ficar verde, vá ao balcão com a senha.</li>
      </ol>
      <p className="ajuda-nota">Dá para cancelar o pedido enquanto ele ainda não entrou em preparo.</p>
      <button type="button" className="btn btn-principal" onClick={onFechar}>Entendi</button>
    </dialog>
  );
}
