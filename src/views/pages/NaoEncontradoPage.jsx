// VIEW · Endereço inexistente.
import { Link } from 'react-router-dom';
import Cabecalho from '../components/Cabecalho.jsx';
import Rodape from '../components/Rodape.jsx';
import { useTitulo } from '../../controllers/useTitulo.js';

export default function NaoEncontradoPage() {
  useTitulo('Página não encontrada');
  return (
    <main className="tela">
      <Cabecalho titulo="Página não encontrada" subtitulo="Este endereço não existe na cantina." ajuda={false} />
      <Link className="btn btn-principal acao-final" to="/">Ir para o cardápio</Link>
      <Rodape />
    </main>
  );
}
