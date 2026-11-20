// Armazenamento no MySQL (o mesmo banco que você abre no MySQL Workbench).
// Estrutura das tabelas: database/cantina.sql
import mysql from 'mysql2/promise';
import { config } from '../../config.js';

// O pool é criado só no primeiro uso e reaproveitado entre requisições.
let pool;
function banco() {
  pool ??= mysql.createPool({
    ...config.banco,
    waitForConnections: true,
    connectionLimit: 4,
    dateStrings: true, // datas chegam como texto e são convertidas aqui, sem surpresa de fuso
  });
  return pool;
}

// Datas: gravadas em UTC no formato do MySQL, com milissegundos ("2026-11-19 14:08:28.123").
const paraSql = (iso) => iso.slice(0, 23).replace('T', ' ');
const deSql = (texto) => `${texto.replace(' ', 'T')}Z`;

async function emTransacao(trabalho) {
  const conexao = await banco().getConnection();
  try {
    await conexao.beginTransaction();
    const resultado = await trabalho(conexao);
    await conexao.commit();
    return resultado;
  } catch (erro) {
    await conexao.rollback();
    throw erro;
  } finally {
    conexao.release();
  }
}

// Busca pedidos com seus itens e histórico e monta o mesmo formato usado pelo resto do sistema.
async function carregarPedidos(filtro, parametros) {
  const [pedidos] = await banco().query(`SELECT * FROM pedidos WHERE ${filtro} ORDER BY numero`, parametros);
  if (pedidos.length === 0) return [];

  const ids = pedidos.map((p) => p.id);
  const [itens] = await banco().query(
    `SELECT i.*, pr.singular, pr.plural
       FROM itens_pedido i
       JOIN produtos pr ON pr.id = i.produto_id
      WHERE i.pedido_id IN (?)
      ORDER BY i.id`,
    [ids],
  );
  // Ordena pelo horário: no TiDB o AUTO_INCREMENT não é garantidamente sequencial.
  const [historico] = await banco().query('SELECT * FROM historico_pedido WHERE pedido_id IN (?) ORDER BY em, id', [ids]);

  return pedidos.map((p) => ({
    id: p.id,
    numero: p.numero,
    dia: p.dia,
    nome: p.nome,
    total: Number(p.total),
    status: p.status,
    criadoEm: deSql(p.criado_em),
    itens: itens
      .filter((i) => i.pedido_id === p.id)
      .map((i) => ({ produtoId: i.produto_id, nome: i.nome, preco: Number(i.preco), singular: i.singular, plural: i.plural, qtd: i.qtd })),
    historico: historico
      .filter((h) => h.pedido_id === p.id)
      .map((h) => ({ status: h.status, em: deSql(h.em) })),
  }));
}

export const mysqlStore = {
  tipo: 'mysql',

  async verificar() {
    await banco().query('SELECT 1');
  },

  async listarProdutos() {
    const [linhas] = await banco().query(
      'SELECT id, nome, preco, disponivel, singular, plural FROM produtos ORDER BY ordem, nome',
    );
    return linhas.map((p) => ({ ...p, preco: Number(p.preco), disponivel: Boolean(p.disponivel) }));
  },

  async salvarProduto(produto) {
    await banco().query('UPDATE produtos SET disponivel = ? WHERE id = ?', [produto.disponivel, produto.id]);
    return produto;
  },

  // Próxima senha do dia. O UPDATE trava a linha do dia até o fim da transação,
  // então dois pedidos ao mesmo tempo nunca recebem a mesma senha (MySQL e TiDB).
  proximoNumero(dia) {
    return emTransacao(async (conexao) => {
      await conexao.query('INSERT IGNORE INTO senhas_do_dia (dia, ultimo) VALUES (?, 0)', [dia]);
      await conexao.query('UPDATE senhas_do_dia SET ultimo = ultimo + 1 WHERE dia = ?', [dia]);
      const [[linha]] = await conexao.query('SELECT ultimo FROM senhas_do_dia WHERE dia = ?', [dia]);
      return linha.ultimo;
    });
  },

  async inserirPedido(pedido) {
    await emTransacao(async (conexao) => {
      await conexao.query(
        'INSERT INTO pedidos (id, dia, numero, nome, total, status, criado_em) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [pedido.id, pedido.dia, pedido.numero, pedido.nome, pedido.total, pedido.status, paraSql(pedido.criadoEm)],
      );
      await conexao.query(
        'INSERT INTO itens_pedido (pedido_id, produto_id, nome, preco, qtd) VALUES ?',
        [pedido.itens.map((i) => [pedido.id, i.produtoId, i.nome, i.preco, i.qtd])],
      );
      await conexao.query(
        'INSERT INTO historico_pedido (pedido_id, status, em) VALUES ?',
        [pedido.historico.map((h) => [pedido.id, h.status, paraSql(h.em)])],
      );
    });
    return pedido;
  },

  // Muda a etapa só se o pedido ainda estiver na etapa esperada (evita duas telas avançarem juntas).
  async registrarStatus(id, statusAtual, novoStatus, em) {
    const mudou = await emTransacao(async (conexao) => {
      const [resultado] = await conexao.query(
        'UPDATE pedidos SET status = ? WHERE id = ? AND status = ?',
        [novoStatus, id, statusAtual],
      );
      if (resultado.affectedRows === 0) return false;
      await conexao.query('INSERT INTO historico_pedido (pedido_id, status, em) VALUES (?, ?, ?)', [id, novoStatus, paraSql(em)]);
      return true;
    });
    return mudou ? mysqlStore.buscarPedido(id) : null;
  },

  async buscarPedido(id) {
    const [pedido] = await carregarPedidos('id = ?', [id]);
    return pedido || null;
  },

  listarPedidosDoDia(dia) {
    return carregarPedidos('dia = ?', [dia]);
  },
};
