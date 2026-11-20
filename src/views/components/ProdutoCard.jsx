// VIEW · Card de produto do cardápio. Depois do primeiro "Adicionar", vira um seletor − 1 +.
import IconeProduto from './IconeProduto.jsx';
import { brl } from '../../models/formato.js';
import { LIMITE_POR_ITEM } from '../../models/carrinho.js';

function Quantidade({ produto, qtd, onMais, onMenos }) {
  const noLimite = qtd >= LIMITE_POR_ITEM;
  return (
    <div className="qtd" role="group" aria-label={`Quantidade de ${produto.nome}`}>
      <button type="button" onClick={onMenos} aria-label={`Tirar um ${produto.singular}`}>−</button>
      <output aria-live="polite">{qtd}</output>
      <button
        type="button"
        onClick={onMais}
        disabled={noLimite}
        aria-label={`Adicionar mais um ${produto.singular}`}
        title={noLimite ? `Limite de ${LIMITE_POR_ITEM} por pedido` : undefined}
      >
        +
      </button>
    </div>
  );
}

export default function ProdutoCard({ produto, qtd, onAdicionar, onDiminuir }) {
  const esgotado = !produto.disponivel;

  return (
    <article className={`produto${esgotado ? ' esgotado' : ''}`}>
      <div className="produto-img"><IconeProduto id={produto.id} /></div>
      <div className="produto-info">
        <h3>{produto.nome}</h3>
        <p className="produto-preco">{brl(produto.preco)}</p>
        <p className="produto-disp">{esgotado ? 'ESGOTADO' : 'Disponível'}</p>
      </div>
      {esgotado && <button type="button" className="btn btn-contorno" disabled>Indisponível</button>}
      {!esgotado && qtd === 0 && (
        <button type="button" className="btn btn-contorno" onClick={onAdicionar} aria-label={`Adicionar ${produto.nome}`}>
          Adicionar
        </button>
      )}
      {!esgotado && qtd > 0 && <Quantidade produto={produto} qtd={qtd} onMais={onAdicionar} onMenos={onDiminuir} />}
    </article>
  );
}
