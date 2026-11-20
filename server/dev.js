// Sobe só a API, sem o front-end (útil para testar com curl ou Insomnia).
// Carrega o .env antes de importar o app, para o banco já estar configurado.
try {
  process.loadEnvFile();
} catch {
  /* sem .env: os dados ficam em memória */
}

const { default: app } = await import('./app.js');

const porta = process.env.PORT || 3001;
app.listen(porta, () => console.log(`API da cantina em http://localhost:${porta}/api`));
