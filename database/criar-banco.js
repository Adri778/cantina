// Cria o banco cantina_escola no MySQL usando o arquivo cantina.sql.
// Mesmo efeito de abrir cantina.sql no MySQL Workbench e executar.
// Uso: npm run db:criar   (lê as credenciais do arquivo .env)
import { readFile } from 'node:fs/promises';
import mysql from 'mysql2/promise';

try {
  process.loadEnvFile();
} catch {
  /* sem .env */
}
const { config } = await import('../server/config.js');

if (!config.banco) {
  console.error('Banco não configurado. Copie .env.example para .env e preencha DB_HOST, DB_USER e DB_PASSWORD.');
  process.exit(1);
}

// Conecta sem escolher o banco, porque o próprio script o cria.
const { database, ...semBanco } = config.banco;
const MENSAGENS = {
  ER_ACCESS_DENIED_ERROR: 'Usuário ou senha do MySQL incorretos. Confira DB_USER e DB_PASSWORD no arquivo .env.',
  ECONNREFUSED: 'O MySQL não respondeu. Verifique se o servidor MySQL está ligado (o mesmo que o Workbench usa).',
  ENOTFOUND: 'Endereço do banco não encontrado. Confira DB_HOST ou DATABASE_URL no arquivo .env.',
};

let conexao;
try {
  const sql = await readFile(new URL('./cantina.sql', import.meta.url), 'utf8');
  conexao = await mysql.createConnection({ ...semBanco, multipleStatements: true });
  await conexao.query(sql);

  const [[{ produtos }]] = await conexao.query('SELECT COUNT(*) AS produtos FROM cantina_escola.produtos');
  const [tabelas] = await conexao.query('SHOW TABLES FROM cantina_escola');
  console.log('Banco "cantina_escola" pronto.');
  console.log(`Tabelas: ${tabelas.map((t) => Object.values(t)[0]).join(', ')}`);
  console.log(`Produtos no cardápio: ${produtos}`);
} catch (erro) {
  console.error(MENSAGENS[erro.code] || `Não foi possível criar o banco: ${erro.message}`);
  process.exitCode = 1;
} finally {
  await conexao?.end();
}
