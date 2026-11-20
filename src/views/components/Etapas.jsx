// VIEW · Linha do tempo do pedido (Pedido recebido → Em preparo → Pronto → Entregue).
import { ETAPAS, horaDaEtapa, indiceEtapa } from '../../models/pedido.js';
import { hora } from '../../models/formato.js';

const Check = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function Etapas({ pedido }) {
  const atual = indiceEtapa(pedido.status);
  const entregue = pedido.status === 'entregue';

  return (
    <ol className="etapas">
      {ETAPAS.map((etapa, i) => {
        const feita = entregue || (atual >= 0 && i < atual);
        const corrente = !entregue && i === atual;
        const quando = (feita || corrente) && horaDaEtapa(pedido, etapa.id);
        const classes = ['etapa', feita && 'feita', corrente && 'atual', corrente && etapa.id === 'pronto' && 'verde']
          .filter(Boolean)
          .join(' ');
        return (
          <li key={etapa.id} className={classes} aria-current={corrente ? 'step' : undefined}>
            <span className="bolinha" aria-hidden="true">
              {feita ? <Check /> : corrente ? <span className="ponto" /> : null}
            </span>
            <span className="etapa-nome">{etapa.nome}</span>
            {quando && <span className="etapa-hora">{hora(quando)}</span>}
          </li>
        );
      })}
    </ol>
  );
}
