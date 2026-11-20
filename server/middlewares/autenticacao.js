// Confere o PIN da atendente enviado no cabeçalho "x-atendente-pin".
import crypto from 'node:crypto';
import { config } from '../config.js';

export function exigirAtendente(req, res, next) {
  const enviado = Buffer.from(String(req.get('x-atendente-pin') || ''));
  const correto = Buffer.from(config.pinAtendente);
  const valido = enviado.length === correto.length && crypto.timingSafeEqual(enviado, correto);

  if (!valido) {
    return res.status(401).json({ erro: 'PIN incorreto. Confira o PIN com a coordenação da cantina e tente de novo.' });
  }
  next();
}
