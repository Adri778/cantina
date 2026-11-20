// VIEW · Caixa "Seu pedido" / "Resumo": itens e total, sempre à vista.
import { useEffect, useRef, useState } from 'react';
import { brl, descreverItens } from '../../models/formato.js';
import { totalDe } from '../../models/carrinho.js';

export default function ResumoPedido({ titulo = 'Seu pedido', itens }) {
  const vazio = itens.length === 0;
  const quantidade = itens.reduce((s, i) => s + i.qtd, 0);
  const [destaque, setDestaque] = useState(false);
  const anterior = useRef(quantidade);

  // Pisca levemente quando a quantidade muda, para o aluno perceber a atualização.
  useEffect(() => {
    if (anterior.current === quantidade) return undefined;
    anterior.current = quantidade;
    setDestaque(true);
    const id = setTimeout(() => setDestaque(false), 450);
    return () => clearTimeout(id);
  }, [quantidade]);

  return (
    <section className={`resumo${vazio ? ' vazio' : ''}${destaque ? ' destaque' : ''}`} aria-live="polite">
      <h2>{titulo}</h2>
      {vazio ? (
        <>
          <p className="resumo-linha">Nenhum item adicionado</p>
          <p className="resumo-ajuda">Adicione itens do cardápio para continuar</p>
        </>
      ) : (
        <>
          <p className="resumo-linha">{descreverItens(itens)}</p>
          <p className="resumo-total">Total: {brl(totalDe(itens))}</p>
        </>
      )}
    </section>
  );
}
