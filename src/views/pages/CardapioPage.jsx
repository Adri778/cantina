// VIEW · Cardápio (telas C00–C21 do wireframe).
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cabecalho from '../components/Cabecalho.jsx';
import ProdutoCard from '../components/ProdutoCard.jsx';
import ResumoPedido from '../components/ResumoPedido.jsx';
import AvisoErro from '../components/AvisoErro.jsx';
import Rodape from '../components/Rodape.jsx';
import { useProdutos } from '../../controllers/useProdutos.js';
import { useCarrinho } from '../../controllers/CarrinhoContext.jsx';
import { useTitulo } from '../../controllers/useTitulo.js';
import { linhasDoCarrinho } from '../../models/carrinho.js';
import { armazenamento } from '../../models/armazenamento.js';
import { hojeNaEscola, semAcento, senha } from '../../models/formato.js';

export default function CardapioPage() {
  useTitulo('Cardápio');
  const { produtos, carregando, erro, recarregar } = useProdutos();
  const { carrinho, adicionar, diminuir } = useCarrinho();
  const [busca, setBusca] = useState('');
  const navegar = useNavigate();

  const termo = semAcento(busca.trim());
  const visiveis = produtos.filter((p) => semAcento(p.nome).includes(termo));
  const itens = linhasDoCarrinho(carrinho, produtos);
  const ultimo = armazenamento.meusPedidos()[0];
  const pedidoDeHoje = ultimo && ultimo.dia === hojeNaEscola() ? ultimo : null;

  return (
    <main className="tela">
      <Cabecalho titulo="Cantina da Escola" subtitulo="Monte seu pedido" />

      {pedidoDeHoje && (
        <Link className="faixa-pedido" to={`/pedido/${pedidoDeHoje.id}`}>
          <span>Seu último pedido: <b>{senha(pedidoDeHoje.numero)}</b></span>
          <span>Acompanhar →</span>
        </Link>
      )}

      <div className="busca">
        <label htmlFor="busca" className="sr">Buscar produto</label>
        <input
          id="busca"
          type="search"
          placeholder="Buscar produto"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          autoComplete="off"
        />
      </div>

      <h2 className="secao">Lanches</h2>
      {erro && <AvisoErro mensagem={erro} onTentar={recarregar} />}

      <div className="lista">
        {carregando && [1, 2, 3].map((n) => <div key={n} className="produto esqueleto" aria-hidden="true" />)}
        {!carregando && visiveis.map((produto) => (
          <ProdutoCard
            key={produto.id}
            produto={produto}
            qtd={carrinho[produto.id] || 0}
            onAdicionar={() => adicionar(produto.id)}
            onDiminuir={() => diminuir(produto.id)}
          />
        ))}
        {!carregando && !erro && visiveis.length === 0 && (
          <p className="vazio">
            Nenhum produto encontrado para “{busca.trim()}”.{' '}
            <button type="button" className="link-botao" onClick={() => setBusca('')}>Limpar busca</button>
          </p>
        )}
      </div>

      <ResumoPedido itens={itens} />
      <button
        type="button"
        className="btn btn-principal acao-final"
        disabled={itens.length === 0}
        onClick={() => navegar('/revisao')}
      >
        Revisar pedido
      </button>
      {itens.length === 0 && <p className="dica">Adicione pelo menos um item para revisar o pedido.</p>}

      <Rodape />
    </main>
  );
}
