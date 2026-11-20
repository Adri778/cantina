// Configurações do servidor, lidas das variáveis de ambiente (arquivo .env no computador).

// Banco MySQL: no computador use DB_HOST/DB_USER/...; na nuvem (Vercel) use DATABASE_URL.
// Sem nenhum dos dois, o sistema guarda os dados em memória.
function lerBanco() {
  const ssl = process.env.DB_SSL === 'true' ? { minVersion: 'TLSv1.2', rejectUnauthorized: true } : undefined;

  if (process.env.DATABASE_URL) return { uri: process.env.DATABASE_URL, ssl };
  if (!process.env.DB_HOST) return null;

  return {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'cantina_escola',
    ssl,
  };
}

export const config = {
  // PIN do painel da atendente (troque em produção).
  pinAtendente: process.env.ATENDENTE_PIN || '1234',

  banco: lerBanco(),

  // As senhas recomeçam a cada dia, no horário da escola.
  fusoHorario: 'America/Sao_Paulo',

  // Quantidade máxima de um mesmo item por pedido.
  limitePorItem: 10,
};
