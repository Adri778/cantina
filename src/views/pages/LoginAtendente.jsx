// VIEW · Entrada da atendente com PIN.
import { useState } from 'react';
import Cabecalho from '../components/Cabecalho.jsx';
import AvisoErro from '../components/AvisoErro.jsx';
import Rodape from '../components/Rodape.jsx';
import { useTitulo } from '../../controllers/useTitulo.js';
import { api } from '../../models/api.js';

export default function LoginAtendente({ onEntrar, aviso }) {
  useTitulo('Entrar no painel');
  const [pin, setPin] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento) {
    evento.preventDefault();
    setEnviando(true);
    setErro('');
    try {
      await api.entrar(pin);
      onEntrar(pin);
    } catch (e) {
      setErro(e.message);
      setEnviando(false);
    }
  }

  return (
    <main className="tela">
      <Cabecalho titulo="Painel da atendente" subtitulo="Acesso da equipe da cantina" ajuda={false} />
      {aviso && <AvisoErro mensagem={aviso} />}

      <form className="form-login" onSubmit={enviar}>
        <div className="campo">
          <label htmlFor="pin">PIN da cantina</label>
          <input
            id="pin"
            type="password"
            inputMode="numeric"
            autoComplete="current-password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            maxLength={12}
            autoFocus
            aria-invalid={Boolean(erro)}
            aria-describedby={erro ? 'pin-erro' : undefined}
          />
        </div>
        {erro && <p id="pin-erro" className="erro-campo" role="alert">{erro}</p>}
        <button type="submit" className="btn btn-principal" disabled={!pin || enviando}>
          {enviando ? 'Conferindo…' : 'Entrar'}
        </button>
      </form>
      {import.meta.env.DEV && <p className="dica">Em desenvolvimento, o PIN padrão é 1234.</p>}

      <Rodape atendente />
    </main>
  );
}
