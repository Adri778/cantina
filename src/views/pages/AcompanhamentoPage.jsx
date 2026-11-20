// VIEW · Acompanhamento do pedido (tela 03 do wireframe), atualizado a cada 3 s.
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Cabecalho from '../components/Cabecalho.jsx';
import Etapas from '../components/Etapas.jsx';
import AvisoErro from '../components/AvisoErro.jsx';
import Rodape from '../components/Rodape.jsx';
import { usePedido } from '../../controllers/usePedido.js';
import { useCarrinho } from '../../controllers/CarrinhoContext.jsx';
import { useTitulo } from '../../controllers/useTitulo.js';
import { brl, descreverItens, horaComSegundos, senha } from '../../models/formato.js';
import { SUBTITULO, finalizado, textoRetirada } from '../../models/pedido.js';

export default function AcompanhamentoPage() {
  const { id } = useParams();
  const { pedido, carregando, erro, naoExiste, atualizadoEm, cancelar, recarregar } = usePedido(id);
  const { preencher } = useCarrinho();
  const navegar = useNavigate();
  const [confirmando, setConfirmando] = useState(false);
  const [erroAcao, setErroAcao] = useState('');
  const status = pedido?.status;
  useTitulo(status === 'pronto' ? 'Pedido pronto!' : 'Acompanhe seu pedido');

  // Vibra o celular quando o pedido fica pronto (o navegador só permite após um toque na página).
  const anterior = useRef(status);
  useEffect(() => {
    const ficouPronto = anterior.current && anterior.current !== 'pronto' && status === 'pronto';
    if (ficouPronto && navigator.userActivation?.hasBeenActive) navigator.vibrate?.([200, 100, 200]);
    anterior.current = status;
  }, [status]);

  if (naoExiste) {
    return (
      <main className="tela">
        <Cabecalho titulo="Pedido não encontrado" subtitulo="Confira se o link está correto" />
        <AvisoErro mensagem={erro} />
        <Link className="btn btn-principal acao-final" to="/">Ir para o cardápio</Link>
        <Rodape />
      </main>
    );
  }

  if (!pedido) {
    return (
      <main className="tela">
        <Cabecalho titulo="Acompanhe seu pedido" subtitulo={carregando ? 'Carregando…' : ''} />
        {erro ? <AvisoErro mensagem={erro} onTentar={recarregar} /> : <div className="senha esqueleto" aria-hidden="true" />}
      </main>
    );
  }

  async function confirmarCancelamento() {
    setErroAcao('');
    try {
      await cancelar();
    } catch (e) {
      setErroAcao(e.message);
      recarregar();
    }
    setConfirmando(false);
  }

  function repetirPedido() {
    preencher(pedido.itens);
    navegar('/revisao');
  }

  const classesRetirada = ['retirada', status === 'pronto' && 'pronto', status === 'cancelado' && 'cancelado']
    .filter(Boolean)
    .join(' ');

  return (
    <main className="tela">
      <Cabecalho titulo="Acompanhe seu pedido" subtitulo={SUBTITULO[status]} />

      <section className={`senha${status === 'cancelado' ? ' senha-cancelada' : ''}`} aria-label="Senha do pedido">
        <p className="senha-rotulo">SENHA</p>
        <p className="senha-numero">{senha(pedido.numero)}</p>
        <p className="senha-orientacao">Apresente esta senha na retirada</p>
        {pedido.nome && <p className="senha-nome">Para: {pedido.nome}</p>}
      </section>

      <h2 className="secao">Situação</h2>
      <Etapas pedido={pedido} />

      <section className={classesRetirada}>
        <h2>Retirada</h2>
        <p>Retire no balcão da cantina da escola</p>
        <p className="retirada-status">{textoRetirada(pedido)}</p>
        <p className="retirada-itens">{descreverItens(pedido.itens)} · {brl(pedido.total)}</p>
      </section>

      {atualizadoEm && (
        <p className="atualizacao">
          {!finalizado(status) && <span className="ao-vivo" aria-hidden="true" />}
          {finalizado(status) ? 'Atualizado' : 'Atualizando sozinho'} · {horaComSegundos(atualizadoEm)}
        </p>
      )}
      {erro && <AvisoErro mensagem={erro} onTentar={recarregar} />}
      {erroAcao && <AvisoErro mensagem={erroAcao} />}

      <div className="acoes">
        {status === 'recebido' && !confirmando && (
          <button type="button" className="btn btn-secundario btn-secundario-perigo" onClick={() => setConfirmando(true)}>
            Cancelar pedido
          </button>
        )}
        {status === 'recebido' && confirmando && (
          <div className="confirmar" role="group" aria-label="Confirmar cancelamento">
            <p>Cancelar o pedido {senha(pedido.numero)}? Ele não será preparado.</p>
            <div className="confirmar-botoes">
              <button type="button" className="btn btn-perigo-cheio" onClick={confirmarCancelamento}>Sim, cancelar</button>
              <button type="button" className="btn btn-contorno" onClick={() => setConfirmando(false)}>Manter pedido</button>
            </div>
          </div>
        )}
        {finalizado(status) ? (
          <>
            <Link className="btn btn-principal" to="/">Fazer novo pedido</Link>
            {status === 'entregue' && (
              <button type="button" className="btn btn-secundario" onClick={repetirPedido}>Repetir este pedido</button>
            )}
          </>
        ) : (
          <Link className="btn btn-secundario" to="/">Voltar ao cardápio</Link>
        )}
      </div>

      <Rodape />
    </main>
  );
}
