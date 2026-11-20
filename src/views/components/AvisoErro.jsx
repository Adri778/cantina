// VIEW · Mensagem de erro com o que aconteceu e como resolver.
export default function AvisoErro({ mensagem, onTentar, rotulo = 'Tentar de novo' }) {
  return (
    <div className="aviso-erro" role="alert">
      <p>{mensagem}</p>
      {onTentar && (
        <button type="button" className="link-botao" onClick={onTentar}>{rotulo}</button>
      )}
    </div>
  );
}
