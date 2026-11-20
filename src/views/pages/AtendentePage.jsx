// VIEW · Área da atendente: pede o PIN e depois mostra o painel.
import { useState } from 'react';
import LoginAtendente from './LoginAtendente.jsx';
import PainelAtendente from './PainelAtendente.jsx';
import { armazenamento } from '../../models/armazenamento.js';

export default function AtendentePage() {
  const [pin, setPin] = useState(armazenamento.pin);
  const [aviso, setAviso] = useState('');

  function entrar(novoPin) {
    armazenamento.salvarPin(novoPin);
    setAviso('');
    setPin(novoPin);
  }

  function sair(motivo = '') {
    armazenamento.salvarPin('');
    setAviso(motivo);
    setPin('');
  }

  return pin ? <PainelAtendente pin={pin} onSair={sair} /> : <LoginAtendente onEntrar={entrar} aviso={aviso} />;
}
