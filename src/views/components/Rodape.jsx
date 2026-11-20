// VIEW · Rodapé com o atalho entre a área do aluno e a da atendente.
import { Link } from 'react-router-dom';

export default function Rodape({ atendente = false }) {
  return (
    <footer className="rodape">
      {atendente ? <Link to="/">Ver cardápio dos alunos</Link> : <Link to="/atendente">Área da atendente</Link>}
    </footer>
  );
}
