-- =============================================================================
-- Cantina da Escola — banco de dados (MySQL 8)
-- Como usar no MySQL Workbench: File > Open SQL Script > este arquivo > ⚡ (Execute).
-- Ou pelo terminal, na pasta do projeto: npm run db:criar
-- Pode rodar mais de uma vez: nada é apagado nem duplicado.
-- Horários gravados em UTC (horário de Brasília = UTC - 3h).
-- Compatível com MySQL 8 e TiDB Cloud.
-- =============================================================================

CREATE DATABASE IF NOT EXISTS cantina_escola
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE cantina_escola;

-- Cardápio. A atendente muda "disponivel" pelo painel.
CREATE TABLE IF NOT EXISTS produtos (
  id            VARCHAR(30)   NOT NULL,
  nome          VARCHAR(60)   NOT NULL,
  preco         DECIMAL(8,2)  NOT NULL,
  disponivel    BOOLEAN       NOT NULL DEFAULT TRUE,
  singular      VARCHAR(30)   NOT NULL,           -- "suco"  (usado em "1 suco")
  plural        VARCHAR(30)   NOT NULL,           -- "sucos" (usado em "2 sucos")
  ordem         INT           NOT NULL DEFAULT 0, -- ordem no cardápio
  atualizado_em TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT ck_produto_preco CHECK (preco >= 0)
);

-- Pedido feito pelo aluno. A senha (numero) recomeça a cada dia.
CREATE TABLE IF NOT EXISTS pedidos (
  id         CHAR(36)       NOT NULL,             -- UUID: o link do acompanhamento não é adivinhável
  dia        DATE           NOT NULL,
  numero     INT            NOT NULL,             -- senha do dia: 1, 2, 3...
  nome       VARCHAR(40)    NOT NULL DEFAULT '',  -- nome para chamar na retirada (opcional)
  total      DECIMAL(10,2)  NOT NULL,
  status     ENUM('recebido','preparo','pronto','entregue','cancelado') NOT NULL DEFAULT 'recebido',
  criado_em  DATETIME(3)    NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_pedido_senha_do_dia (dia, numero),
  KEY idx_pedidos_dia_status (dia, status)
);

-- Itens de cada pedido. Nome e preço são copiados do momento da compra,
-- para o pedido antigo não mudar se o preço do cardápio mudar depois.
CREATE TABLE IF NOT EXISTS itens_pedido (
  id          INT           NOT NULL AUTO_INCREMENT,
  pedido_id   CHAR(36)      NOT NULL,
  produto_id  VARCHAR(30)   NOT NULL,
  nome        VARCHAR(60)   NOT NULL,
  preco       DECIMAL(8,2)  NOT NULL,
  qtd         INT           NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_item_pedido  FOREIGN KEY (pedido_id)  REFERENCES pedidos (id) ON DELETE CASCADE,
  CONSTRAINT fk_item_produto FOREIGN KEY (produto_id) REFERENCES produtos (id),
  CONSTRAINT ck_item_qtd CHECK (qtd BETWEEN 1 AND 10)
);

-- Linha do tempo: cada mudança de etapa vira um registro (permite "Desfazer" e mostrar horários).
CREATE TABLE IF NOT EXISTS historico_pedido (
  id         INT       NOT NULL AUTO_INCREMENT,
  pedido_id  CHAR(36)  NOT NULL,
  status     ENUM('recebido','preparo','pronto','entregue','cancelado') NOT NULL,
  em         DATETIME(3) NOT NULL,              -- com milissegundos: define a ordem das etapas
  PRIMARY KEY (id),
  CONSTRAINT fk_historico_pedido FOREIGN KEY (pedido_id) REFERENCES pedidos (id) ON DELETE CASCADE
);

-- Controle da senha do dia (gera 1, 2, 3... sem repetir, mesmo com pedidos simultâneos).
CREATE TABLE IF NOT EXISTS senhas_do_dia (
  dia     DATE  NOT NULL,
  ultimo  INT   NOT NULL,
  PRIMARY KEY (dia)
);

-- Cardápio inicial, igual ao wireframe (INSERT IGNORE não sobrescreve o que a atendente mudou).
INSERT IGNORE INTO produtos (id, nome, preco, disponivel, singular, plural, ordem) VALUES
  ('suco',      'Suco de laranja',   5.00, TRUE,  'suco',      'sucos',      1),
  ('sanduiche', 'Sanduíche natural', 8.00, TRUE,  'sanduíche', 'sanduíches', 2),
  ('salgado',   'Salgado assado',    6.00, FALSE, 'salgado',   'salgados',   3);

-- Visão pronta para consultar no Workbench: SELECT * FROM vw_pedidos_do_dia;
CREATE OR REPLACE VIEW vw_pedidos_do_dia AS
SELECT
  p.dia,
  LPAD(p.numero, 3, '0')                                                   AS senha,
  p.nome,
  p.status,
  GROUP_CONCAT(CONCAT(i.qtd, 'x ', i.nome) ORDER BY i.id SEPARATOR ', ')   AS itens,
  p.total,
  DATE_FORMAT(DATE_SUB(p.criado_em, INTERVAL 3 HOUR), '%H:%i')             AS hora_brasilia
FROM pedidos p
JOIN itens_pedido i ON i.pedido_id = p.id
GROUP BY p.id, p.dia, p.numero, p.nome, p.status, p.total, p.criado_em;

-- -----------------------------------------------------------------------------
-- Consultas úteis (selecione uma linha e execute no Workbench):
--   SELECT * FROM vw_pedidos_do_dia WHERE dia = CURDATE() ORDER BY senha;
--   SELECT status, COUNT(*) FROM pedidos WHERE dia = CURDATE() GROUP BY status;
--   SELECT i.nome, SUM(i.qtd) AS vendidos FROM itens_pedido i
--     JOIN pedidos p ON p.id = i.pedido_id WHERE p.status <> 'cancelado'
--     GROUP BY i.nome ORDER BY vendidos DESC;
--   SELECT SUM(total) AS faturamento FROM pedidos WHERE dia = CURDATE() AND status = 'entregue';
-- -----------------------------------------------------------------------------
