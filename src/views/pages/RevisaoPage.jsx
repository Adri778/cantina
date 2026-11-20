// VIEW · Revisão do pedido (telas R10–R21 do wireframe).
import { useRef, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Cabecalho from '../components/Cabecalho.jsx';
import ResumoPedido from '../components/ResumoPedido.jsx';
import AvisoErro from '../components/AvisoErro.jsx';
import Rodape from '../components/Rodape.jsx';
import { useProdutos } from '../../controllers/useProdutos.js';
import { useCarrinho } from '../../controllers/CarrinhoContext.jsx';
import { useToast } from '../../controllers/ToastContext.jsx';
import { useTitulo } from '../../controllers/useTitulo.js';
import { api } from '../../models/api.js';
import { armazenamento } from '../../models/armazenamento.js';
import { linhasDoCarrinho } from '../../models/carrinho.js';
import { brl } from '../../models/formato.js';

export default function RevisaoPage() {
  useTitulo('Revisão do pedido');
  const { produtos, carregando, recarregar } = useProdutos();
  const { carrinho, nome, setNome, diminuir, remover, definir, limpar } = useCarrinho();
  const { mostrar } = useToast();
  const navegar = useNavigate();
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const enviado = useRef(false);

  const itens = linhasDoCarrinho(carrinho, produtos);
  const temEsgotado = itens.some((i) => !i.disponivel);

  // Sem itens não há o que revisar: volta ao cardápio.
  if (!carregando && itens.length === 0 && !enviado.current) return <Navigate to="/" replace />;

  function removerComDesfazer(item) {
    remover(item.id);
    mostrar({
      mensagem: `${item.nome} removido do pedido`,
      acao: { rotulo: 'Desfazer', onClick: () => definir(item.id, item.qtd) },
    });
  }

  async function confirmar() {
    setEnviando(true);
    setErro('');
    try {
      const pedido = await api.criarPedido({
        itens: itens.map((i) => ({ produtoId: i.id, qtd: i.qtd })),
        nome,
      });
      armazenamento.lembrarPedido(pedido);
      enviado.current = true;
      limpar();
      setNome('');
      navegar(`/pedido/${pedido.id}`, { replace: true });
    } catch (e) {
      setErro(e.message);
      setEnviando(false);
      recarregar();
    }
  }

  return (
    <main className="tela">
      <Cabecalho titulo="Revisão do pedido" subtitulo="Confira e altere antes de confirmar" />

      <div className="itens">
        {carregando && <div className="item esqueleto" aria-hidden="true" />}
        {itens.map((item) => (
          <article key={item.id} className={`item${item.disponivel ? '' : ' item-esgotado'}`}>
            <h3>{item.nome}</h3>
            <p className="item-preco">{brl(item.preco)}</p>
            {!item.disponivel && <p className="item-alerta">Este item acabou agora. Remova para continuar.</p>}
            <div className="item-rodape">
              <p className="item-qtd">Quantidade: {item.qtd}</p>
              <div className="item-acoes">
                {item.qtd >= 2 && (
                  <button type="button" className="btn btn-contorno" onClick={() => diminuir(item.id)} aria-label={`Diminuir ${item.nome}`}>
                    Diminuir
                  </button>
                )}
                <button type="button" className="btn btn-perigo" onClick={() => removerComDesfazer(item)} aria-label={`Remover ${item.nome}`}>
                  Remover item
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="campo">
        <label htmlFor="nome">Nome para chamar na retirada <span>(opcional)</span></label>
        <input
          id="nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          maxLength={40}
          placeholder="Ex.: Ana, 7º ano"
          autoComplete="given-name"
        />
      </div>

      <ResumoPedido titulo="Resumo" itens={itens} />
      {erro && <AvisoErro mensagem={erro} />}

      <button
        type="button"
        className="btn btn-principal acao-final"
        onClick={confirmar}
        disabled={enviando || temEsgotado || itens.length === 0}
      >
        {enviando ? 'Enviando pedido…' : 'Confirmar pedido'}
      </button>
      {temEsgotado && <p className="dica">Remova os itens esgotados para confirmar.</p>}
      <Link className="btn btn-secundario" to="/">Voltar ao cardápio</Link>

      <Rodape />
    </main>
  );
}
