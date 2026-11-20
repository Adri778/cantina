// VIEW · Painel da atendente (tela 04 do wireframe), atualizado a cada 3 s.
import { useState } from 'react';
import Cabecalho from '../components/Cabecalho.jsx';
import PedidoCard from '../components/PedidoCard.jsx';
import AvisoErro from '../components/AvisoErro.jsx';
import Rodape from '../components/Rodape.jsx';
import { usePainel } from '../../controllers/usePainel.js';
import { useTitulo } from '../../controllers/useTitulo.js';
import { brl, hora, senha } from '../../models/formato.js';
import { emAndamento } from '../../models/pedido.js';

const FILTROS = [
  { id: 'andamento', nome: 'Em andamento', mostra: emAndamento },
  { id: 'entregue', nome: 'Entregues', mostra: (s) => s === 'entregue' },
  { id: 'todos', nome: 'Todos', mostra: () => true },
];

// Pedidos em andamento primeiro (o mais antigo no topo); os finalizados depois (o mais recente no topo).
function ordenar(a, b) {
  const ativoA = emAndamento(a.status);
  const ativoB = emAndamento(b.status);
  if (ativoA !== ativoB) return ativoA ? -1 : 1;
  return ativoA ? a.numero - b.numero : b.numero - a.numero;
}

function resumoDoDia(pedidos) {
  const ativos = pedidos.filter((p) => emAndamento(p.status));
  if (pedidos.length === 0) {
    return { titulo: 'Nenhum pedido novo', texto: 'Pedidos confirmados pelos alunos aparecem aqui na hora.', texto2: 'Aguardando pedidos…', ativo: false };
  }
  if (ativos.length === 0) {
    const entregues = pedidos.filter((p) => p.status === 'entregue').length;
    return {
      titulo: 'Nenhum pedido pendente',
      texto: 'Todos os pedidos de hoje já foram atendidos.',
      texto2: `${entregues} ${entregues === 1 ? 'pedido entregue' : 'pedidos entregues'} hoje`,
      ativo: false,
    };
  }
  const conta = (s) => ativos.filter((p) => p.status === s).length;
  const ultimo = pedidos.reduce((a, b) => (b.numero > a.numero ? b : a));
  return {
    titulo: `${ativos.length} ${ativos.length === 1 ? 'pedido em andamento' : 'pedidos em andamento'}`,
    texto: `Aguardando: ${conta('recebido')} · Em preparo: ${conta('preparo')} · Prontos: ${conta('pronto')}`,
    texto2: `Último pedido: ${senha(ultimo.numero)} às ${hora(ultimo.criadoEm)}`,
    ativo: true,
  };
}

export default function PainelAtendente({ pin, onSair }) {
  useTitulo('Painel da atendente');
  const painel = usePainel(pin, () => onSair('Sua sessão expirou ou o PIN mudou. Entre de novo.'));
  const { pedidos, produtos, carregando, erro, ocupado, armazenamento } = painel;
  const [filtro, setFiltro] = useState('andamento');

  const resumo = resumoDoDia(pedidos);
  const regra = FILTROS.find((f) => f.id === filtro);
  const lista = pedidos.filter((p) => regra.mostra(p.status)).sort(ordenar);

  return (
    <main className="tela tela-larga">
      <Cabecalho
        titulo="Painel da atendente"
        subtitulo="Pedidos em tempo real"
        acao={<button type="button" className="btn btn-contorno" onClick={() => onSair()}>Sair</button>}
      />

      {armazenamento === 'memoria' && !import.meta.env.DEV && (
        <AvisoErro mensagem="Sem banco de dados conectado: os pedidos podem sumir quando o servidor reiniciar. Configure o MySQL (DATABASE_URL) no projeto da Vercel." />
      )}
      {erro && <AvisoErro mensagem={erro} onTentar={painel.recarregar} />}

      <section className={`estado${resumo.ativo ? ' ativo' : ''}`} aria-live="polite">
        <h2>{resumo.titulo}</h2>
        <p className="estado-texto">{resumo.texto}</p>
        <p className="estado-texto2">{resumo.texto2}</p>
      </section>

      <section className="area">
        <h2>Fila de pedidos</h2>
        <p className="area-info">Toque no botão do pedido para avançar a etapa. Errou? Use “Desfazer” no aviso que aparece.</p>
        <div className="filtros" role="group" aria-label="Filtrar pedidos">
          {FILTROS.map((f) => (
            <button key={f.id} type="button" className="filtro" aria-pressed={filtro === f.id} onClick={() => setFiltro(f.id)}>
              {f.nome} <span>{pedidos.filter((p) => f.mostra(p.status)).length}</span>
            </button>
          ))}
        </div>
        <div className="fila">
          {carregando && <div className="pedido esqueleto" aria-hidden="true" />}
          {!carregando && lista.length === 0 && (
            <p className="vazio">{filtro === 'andamento' ? 'Nenhum pedido aguardando. A fila está em dia.' : 'Nenhum pedido aqui ainda.'}</p>
          )}
          {lista.map((p) => (
            <PedidoCard key={p.id} pedido={p} ocupado={ocupado === p.id} onAvancar={() => painel.avancar(p)} />
          ))}
        </div>
      </section>

      <section className="cardapio-dia">
        <h2>Cardápio de hoje</h2>
        <p className="area-info">Marque um item como esgotado e ele fica indisponível na hora para os alunos.</p>
        <ul>
          {produtos.map((p) => (
            <li key={p.id}>
              <span className="cd-nome">{p.nome} <small>{brl(p.preco)}</small></span>
              <span className={`chip ${p.disponivel ? 'chip-pronto' : 'chip-esgotado'}`}>{p.disponivel ? 'Disponível' : 'Esgotado'}</span>
              <button
                type="button"
                className={`btn ${p.disponivel ? 'btn-perigo' : 'btn-contorno'}`}
                disabled={ocupado === p.id}
                onClick={() => painel.alternarDisponibilidade(p)}
              >
                {p.disponivel ? 'Marcar esgotado' : 'Voltar ao cardápio'}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="orientacao">
        <h2>Orientação</h2>
        <p>O aluno acompanha cada etapa pelo celular</p>
        <p>Chame pela senha (e pelo nome, se houver) quando o pedido estiver pronto</p>
      </section>

      <Rodape atendente />
    </main>
  );
}
