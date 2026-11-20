// VIEW · Título e subtítulo da tela, com botão de ajuda ou outra ação (ex.: "Sair").
import { useState } from 'react';
import Ajuda from './Ajuda.jsx';

export default function Cabecalho({ titulo, subtitulo, acao, ajuda = true }) {
  const [ajudaAberta, setAjudaAberta] = useState(false);

  return (
    <header className="cabecalho">
      <div>
        <h1 className="titulo">{titulo}</h1>
        {subtitulo && <p className="subtitulo" aria-live="polite">{subtitulo}</p>}
      </div>
      {acao}
      {!acao && ajuda && (
        <button type="button" className="btn-icone" onClick={() => setAjudaAberta(true)} aria-label="Como funciona">
          ?
        </button>
      )}
      {ajudaAberta && <Ajuda onFechar={() => setAjudaAberta(false)} />}
    </header>
  );
}
