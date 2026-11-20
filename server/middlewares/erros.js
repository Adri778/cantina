// Respostas de erro sempre em JSON e com mensagem que o usuário entende.
import { ErroDeNegocio } from '../models/erros.js';

export function rotaNaoEncontrada(req, res) {
  res.status(404).json({ erro: 'Endereço da API não encontrado.' });
}

// O Express 5 encaminha para cá os erros lançados nos controllers (inclusive async).
export function tratarErros(erro, req, res, next) {
  if (erro instanceof ErroDeNegocio) {
    return res.status(erro.status).json({ erro: erro.message });
  }
  if (erro.status === 400 || erro.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'Não foi possível ler os dados enviados. Tente de novo.' });
  }
  console.error(erro);
  res.status(500).json({ erro: 'A cantina está com um problema no sistema. Tente de novo em instantes.' });
}
