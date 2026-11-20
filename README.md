# Cantina da Escola

Sistema de pedidos da cantina, feito a partir do wireframe e do protótipo de IHC.
O aluno monta o pedido pelo celular, recebe uma **senha** e acompanha cada etapa.
A atendente recebe os pedidos em tempo real num **painel**, avança as etapas e controla o cardápio do dia.

- **Front-end:** React 18 + Vite + React Router
- **Back-end:** Node.js + Express 5
- **Banco de dados:** MySQL 8 (o mesmo do MySQL Workbench)
- **Padrão:** MVC nos dois lados
- **Publicação:** Vercel (front-end estático + API como função serverless)

---

## 1. Como rodar no computador

```bash
npm install
cp .env.example .env      # no Windows: copy .env.example .env
```

Preencha o `.env` com os dados do banco. O projeto usa o **TiDB Cloud** (compatível com MySQL), que serve tanto no computador quanto na Vercel:
os dados ficam em *TiDB Cloud → seu cluster → Connect* (`DB_HOST`, `DB_USER` no formato `prefixo.root`, `DB_PASSWORD`, porta `4000` e `DB_SSL=true`).
Também funciona com o MySQL do computador (`localhost`, porta `3306`, sem `DB_SSL`).

Depois crie o banco (escolha um jeito):

- **Pelo MySQL Workbench:** abra a conexão do TiDB → File → Open SQL Script → `database/cantina.sql` → ⚡ Execute.
- **Pelo terminal:** `npm run db:criar`

E suba o sistema:

```bash
npm run dev
```

Abra **http://localhost:5173**. A API roda junto, no mesmo endereço (`/api`).
Para conferir a conexão com o banco, abra `http://localhost:5173/api/saude`: deve aparecer `"armazenamento":"mysql"`.

| Tela | Endereço |
|---|---|
| Cardápio do aluno | `/` |
| Revisão do pedido | `/revisao` |
| Acompanhamento | `/pedido/:id` |
| Painel da atendente | `/atendente` (PIN padrão em desenvolvimento: **1234**) |

| Comando | O que faz |
|---|---|
| `npm run dev` | Sistema completo (front-end + API) em `http://localhost:5173` |
| `npm run db:criar` | Cria o banco `cantina_escola` a partir de `database/cantina.sql` |
| `npm run api` | Sobe só a API em `http://localhost:3001/api` (para testar com curl/Insomnia) |
| `npm run build` | Gera a versão de produção em `dist/` |
| `npm run preview` | Serve o `dist/` com a API, para conferir antes de publicar |

Sem banco configurado no `.env`, o sistema funciona com os dados **em memória** (somem ao reiniciar).

---

## 2. Banco de dados (MySQL)

Script completo em [`database/cantina.sql`](database/cantina.sql). Pode rodar mais de uma vez: nada é apagado nem duplicado.

```mermaid
erDiagram
    produtos ||--o{ itens_pedido : "aparece em"
    pedidos  ||--|{ itens_pedido : "tem"
    pedidos  ||--|{ historico_pedido : "registra"

    produtos {
        varchar id PK
        varchar nome
        decimal preco
        boolean disponivel
        varchar singular
        varchar plural
        int ordem
    }
    pedidos {
        char id PK "UUID"
        date dia "UK com numero"
        int numero "senha do dia"
        varchar nome
        decimal total
        enum status
        datetime criado_em
    }
    itens_pedido {
        int id PK
        char pedido_id FK
        varchar produto_id FK
        varchar nome "copiado na compra"
        decimal preco "copiado na compra"
        int qtd "1 a 10"
    }
    historico_pedido {
        int id PK
        char pedido_id FK
        enum status
        datetime em
    }
    senhas_do_dia {
        date dia PK
        int ultimo
    }
```

| Tabela | Para que serve |
|---|---|
| `produtos` | Cardápio. A atendente muda `disponivel` pelo painel. |
| `pedidos` | Cada pedido, com a senha do dia (`dia` + `numero` são únicos) e a etapa atual. |
| `itens_pedido` | Itens de cada pedido. Nome e preço são **copiados no momento da compra**: se o preço mudar depois, o pedido antigo continua certo. |
| `historico_pedido` | Uma linha para cada mudança de etapa. Mostra os horários ao aluno e permite "Desfazer". |
| `senhas_do_dia` | Gera a senha 1, 2, 3… de forma atômica (dois pedidos simultâneos nunca recebem a mesma). |
| `vw_pedidos_do_dia` | *View* para consultar no Workbench: `SELECT * FROM vw_pedidos_do_dia;` |

Regras garantidas pelo banco: chaves estrangeiras com `ON DELETE CASCADE`, `CHECK` de preço e quantidade, `ENUM` das etapas e senha única por dia.
Regras garantidas pelo back-end: o total é calculado com os preços do banco; criar o pedido grava pedido, itens e histórico numa **transação**; avançar etapa só funciona se o pedido ainda estiver na etapa esperada (evita duas telas avançarem juntas).
Horários ficam em **UTC** (Brasília = UTC − 3h); a view já mostra a hora de Brasília.

---

## 3. Arquitetura MVC

```
cantina-da-escola/
├── api/index.js                 Entrada da Vercel (usa o mesmo app Express)
├── database/
│   ├── cantina.sql              Script do banco (tabelas, chaves, cardápio, view)
│   └── criar-banco.js           Executa o script (npm run db:criar)
├── server/                      ── BACK-END (Node + Express) ──
│   ├── app.js                   Monta o Express: JSON, rotas e erros
│   ├── config.js                PIN e conexão do banco (variáveis de ambiente)
│   ├── models/                  MODEL: regras de negócio e dados
│   │   ├── Pedido.js            Criar, validar, avançar, desfazer, cancelar
│   │   ├── Produto.js           Cardápio e disponibilidade
│   │   ├── dadosIniciais.js     Cardápio para o modo sem banco
│   │   ├── erros.js             Erro com status HTTP e mensagem amigável
│   │   └── store/               Onde os dados ficam: mysqlStore (banco) ou memoriaStore
│   ├── controllers/             CONTROLLER: recebe a requisição e responde JSON
│   ├── routes/index.js          Liga cada endereço ao controller
│   └── middlewares/             PIN da atendente e tratamento de erros
└── src/                         ── FRONT-END (React) ──
    ├── models/                  MODEL: API, regras do carrinho/pedido, formatação, armazenamento local
    ├── controllers/             CONTROLLER: hooks e contextos (carrinho, avisos, atualização automática)
    └── views/                   VIEW: páginas (uma por tela do wireframe) e componentes
```

**Fluxo de uma ação:** a *view* chama um *controller* (hook) → o hook usa o *model* (`api.js`) → a rota da API chama o *controller* do servidor → que usa o *model* (`Pedido.js`) → que grava no MySQL pelo *store*.

**Atualização em tempo real:** o acompanhamento consulta o pedido a cada 3 s, e o painel consulta a fila a cada 3 s. A consulta pausa com a aba em segundo plano e para sozinha quando o pedido termina. Funciona na Vercel, que não mantém conexões abertas (WebSocket).

### API

| Método | Endereço | Quem usa | O que faz |
|---|---|---|---|
| GET | `/api/produtos` | aluno | Cardápio com disponibilidade |
| POST | `/api/pedidos` | aluno | Cria o pedido `{ itens: [{ produtoId, qtd }], nome }` |
| GET | `/api/pedidos/:id` | aluno | Situação do pedido |
| PATCH | `/api/pedidos/:id/cancelar` | aluno | Cancela (só antes do preparo) |
| POST | `/api/atendente/entrar` | atendente | Confere o PIN |
| GET | `/api/atendente/pedidos` | atendente | Pedidos de hoje |
| PATCH | `/api/atendente/pedidos/:id/avancar` | atendente | Próxima etapa |
| PATCH | `/api/atendente/pedidos/:id/voltar` | atendente | Desfaz a última etapa |
| PATCH | `/api/atendente/produtos/:id` | atendente | Marca disponível/esgotado `{ disponivel }` |
| GET | `/api/saude` | todos | Mostra se usa `mysql` ou `memoria` e se o banco responde |

Rotas da atendente exigem o cabeçalho `x-atendente-pin`.

---

## 4. As 10 heurísticas de Nielsen aplicadas

São **10** heurísticas (Jakob Nielsen, 1994). Quando aparece uma "11ª", em geral é **acessibilidade**, que também foi tratada (item 11).

| # | Heurística | Onde aparece no sistema |
|---|---|---|
| 1 | **Visibilidade do status do sistema** | Acompanhamento atualiza sozinho com "Atualizando sozinho · 11:08:28" e a hora de cada etapa. Resumo do pedido sempre visível e destacado quando muda. Botões mostram "Enviando pedido…", "Salvando…", "Conferindo…". A aba vira "Pedido pronto!" e o celular vibra. A atendente recebe aviso de "Novo pedido" e vê há quanto tempo cada pedido espera. |
| 2 | **Correspondência com o mundo real** | Vocabulário da cantina: senha, balcão, retirada, "Pronto para retirar". Preço em R$, horário local, senhas que recomeçam todo dia, ilustração de cada lanche, nome para chamar na retirada. |
| 3 | **Controle e liberdade do usuário** | "Desfazer" ao remover item (aluno) e ao avançar etapa (atendente). Cancelar o pedido enquanto não entrou em preparo. "Voltar ao cardápio" em todas as telas. |
| 4 | **Consistência e padrões** | Mesma estrutura do wireframe em todas as telas. Ação principal sempre embaixo, em laranja; secundária com contorno. Cores com significado fixo: verde = disponível/pronto, vermelho = esgotado/remover, laranja = ação. Mesmos termos do início ao fim. |
| 5 | **Prevenção de erros** | "Revisar pedido" desabilitado sem itens. Produto esgotado não pode ser adicionado. Limite de 10 por item. Cancelamento pede confirmação. Botão trava durante o envio (evita pedido duplicado). Servidor e banco validam preço, quantidade e estoque; se um item esgota durante a revisão, ele é marcado e a confirmação fica bloqueada. |
| 6 | **Reconhecer em vez de memorizar** | Resumo com itens e total sempre à vista. Quantidade no próprio card do cardápio. Faixa "Seu último pedido #003 · Acompanhar". Senha em destaque e itens repetidos no card de retirada. |
| 7 | **Flexibilidade e eficiência de uso** | Seletor − / + direto no cardápio. Busca que ignora acentos. "Repetir este pedido". Filtros da fila (em andamento, entregues, todos). Marcar esgotado em um toque. Carrinho salvo no celular. |
| 8 | **Estética e design minimalista** | Layout enxuto do wireframe, só com o essencial; cor usada para comunicar estado, não para enfeitar. |
| 9 | **Ajudar a reconhecer, diagnosticar e recuperar erros** | Mensagens em português dizendo o que houve e o que fazer: "Salgado assado acabou agora. Remova o item para continuar.", "Sem conexão com a cantina. Verifique a internet e tente de novo." (com botão "Tentar de novo"), "Este pedido acabou de ser atualizado em outra tela. Confira a situação atual." |
| 10 | **Ajuda e documentação** | Botão "?" com "Como funciona" em 3 passos. Dicas sob botões desabilitados. Card "Orientação" e instruções no painel da atendente. Este README. |
| 11 | **Acessibilidade (extra)** | Rótulos para leitores de tela, avisos com `aria-live`, foco visível, navegação por teclado, janela de ajuda com `<dialog>` nativo, contraste adequado e respeito a "reduzir movimento". |

---

## 5. Melhorias em relação ao protótipo

- Pedidos reais, gravados no MySQL e compartilhados entre aluno e atendente.
- Seletor de quantidade no cardápio, busca sem acento e carrinho salvo.
- Nome opcional para a atendente chamar na retirada.
- Cancelamento pelo aluno (antes do preparo) e "Desfazer" em ações importantes.
- Hora de cada etapa, aviso de pedido pronto e "Repetir este pedido".
- Painel com PIN, filtros, tempo de espera, alerta de pedido atrasado e controle do cardápio do dia.

---

## 6. Publicar na Vercel

A Vercel não enxerga o MySQL do seu computador, por isso o banco fica no **TiDB Cloud** (nuvem, compatível com MySQL, plano gratuito). Se o banco `cantina_escola` já foi criado no TiDB (seção 1), a Vercel usa o mesmo.

1. Envie o projeto para um repositório no GitHub.
2. Em [vercel.com](https://vercel.com), clique em **Add New → Project** e importe o repositório. Se ele tiver outras pastas, defina **Root Directory** = `cantina-da-escola`. O framework **Vite** é detectado sozinho.
3. Em **Settings → Environment Variables**, copie as mesmas linhas do seu `.env`: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SSL=true` e `ATENDENTE_PIN` (com um PIN novo, não `1234`).
4. Clique em **Deploy** e abra `https://SEU-PROJETO.vercel.app/api/saude`: deve aparecer `"armazenamento":"mysql"`.

No lugar das variáveis `DB_*`, também dá para usar uma só: `DATABASE_URL=mysql://usuario:senha@endereco:4000/cantina_escola` (mais `DB_SSL=true`).

O `vercel.json` manda todas as rotas `/api/*` para `api/index.js` e as demais para o React (assim, recarregar `/pedido/...` não dá 404).

---

## 7. Próximos passos possíveis

- Cadastro de produtos pela atendente (hoje ela só muda a disponibilidade).
- Pagamento (Pix) e histórico de pedidos por aluno.
- Notificação push quando o pedido ficar pronto.
- Testes automatizados das regras de `Pedido.js`.
