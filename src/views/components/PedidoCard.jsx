// VIEW · Pedido na fila da atendente.
import { brl, descreverItens, hora, minutosDesde, senha } from '../../models/formato.js';
import { ACAO_ATENDENTE, ROTULO, horaDaEtapa } from '../../models/pedido.js';

const ESPERA_LONGA = 10; // minutos

export default function PedidoCard({ pedido, ocupado, onAvancar }) {
  const { status } = pedido;
  const acao = ACAO_ATENDENTE[status];
  const espera = minutosDesde(pedido.criadoEm);
  const atrasado = (status === 'recebido' || status === 'preparo') && espera >= ESPERA_LONGA;
  const classes = ['pedido', `pedido-${status}`, atrasado && 'atrasado'].filter(Boolean).join(' ');

  return (
    <article className={classes}>
      <div className="pedido-topo">
        <p className="pedido-num">
          {senha(pedido.numero)}
          <small>{hora(pedido.criadoEm)}{acao ? ` · há ${espera} min` : ''}</small>
        </p>
        <span className={`chip chip-${status}`}>{ROTULO[status]}</span>
      </div>
      {pedido.nome && <p className="pedido-nome">Para: {pedido.nome}</p>}
      <p className="pedido-itens"><b>{descreverItens(pedido.itens)}</b> · {brl(pedido.total)}</p>
      {atrasado && <p className="pedido-alerta">Aguardando há {espera} min. Priorize este pedido.</p>}
      {acao && (
        <button
          type="button"
          className={`btn btn-bloco ${status === 'pronto' ? 'btn-ok' : 'btn-contorno'}`}
          onClick={onAvancar}
          disabled={ocupado}
        >
          {ocupado ? 'Salvando…' : acao}
        </button>
      )}
      {status === 'entregue' && <p className="pedido-fim">Entregue às {hora(horaDaEtapa(pedido, 'entregue'))}</p>}
      {status === 'cancelado' && <p className="pedido-fim">Cancelado pelo aluno às {hora(horaDaEtapa(pedido, 'cancelado'))}</p>}
    </article>
  );
}
