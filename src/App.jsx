// Rotas do sistema: uma página (View) para cada tela do wireframe.
import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import CardapioPage from './views/pages/CardapioPage.jsx';
import RevisaoPage from './views/pages/RevisaoPage.jsx';
import AcompanhamentoPage from './views/pages/AcompanhamentoPage.jsx';
import AtendentePage from './views/pages/AtendentePage.jsx';
import NaoEncontradoPage from './views/pages/NaoEncontradoPage.jsx';
import Toast from './views/components/Toast.jsx';

function VoltarAoTopo() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <VoltarAoTopo />
      <Routes>
        <Route path="/" element={<CardapioPage />} />
        <Route path="/revisao" element={<RevisaoPage />} />
        <Route path="/pedido/:id" element={<AcompanhamentoPage />} />
        <Route path="/atendente" element={<AtendentePage />} />
        <Route path="*" element={<NaoEncontradoPage />} />
      </Routes>
      <Toast />
    </>
  );
}
