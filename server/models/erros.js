// Erro de regra de negócio: carrega o status HTTP e uma mensagem pronta para o usuário.
export class ErroDeNegocio extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.status = status;
  }
}
