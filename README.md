# wearportofino

Site da **PORTOFINO**, uma maison de 100% linho: luxo silencioso, unissex, de inspiração mediterrânea.

Feito em React 19, Vite 8, TypeScript e Tailwind CSS 4. As animações usam GSAP e Lenis. Funciona em inglês e português.

> **Estado atual: pré-lançamento.** O site é público e navegável: produtos, fotos, preços e categorias aparecem para todos. **Compras estão desativadas** até o lançamento oficial.

---

## Requisitos

- Node.js 20 ou mais recente
- npm

## Comandos

```bash
npm install              # instala as dependências
npm run dev              # site público em desenvolvimento (http://localhost:5173)
npm run dev:admin        # o mesmo, com o painel PORTOFINO Creator em #/admin
npm run build            # build público → dist/
npm run build:admin      # build privado com o painel → dist-admin/ (nunca publicar)
npm run preview          # serve o dist/ em http://localhost:4173
npm run test:prelaunch   # testes de navegação, bloqueio de compras, integridade e segurança
```

Para rodar os testes, os dois builds precisam estar servidos:

```bash
npm run build && npm run build:admin
npx vite preview --port 4173 &
npx vite preview --outDir dist-admin --port 4174 &
npm run test:prelaunch
```

O resultado fica em `tests/results/prelaunch.json` e também aparece no painel, em Creator → Launch.

---

## Publicação

1. Rode `npm run build`.
2. Publique **todo o conteúdo** da pasta `dist/` (`index.html`, `assets/`, `img/`, `brand/` e `robots.txt`), mantendo a estrutura de pastas.
3. Na hospedagem (recomendação: Vercel), use `npm run build` como comando de build e `dist` como pasta de saída. O HTTPS vem automático ao conectar o domínio.

O `index.html` sozinho não funciona: ele carrega o restante do site a partir das outras pastas. Abrir o arquivo com dois cliques também não funciona, porque o site precisa ser servido por um servidor (por exemplo `npx serve dist`).

**Nunca publique a pasta `dist-admin/`.** Ela contém o painel administrativo, que ainda não tem login.

---

## Configuração (`.env`)

Todas as variáveis `VITE_` são **públicas**: elas entram no JavaScript do site. **Nunca coloque chaves, tokens ou senhas aqui.**

| Variável | Padrão | Função |
|---|---|---|
| `VITE_STORE_MODE` | `prelaunch` | `prelaunch` = sem vendas · `live` = operação oficial. Qualquer outro valor equivale a `prelaunch`. |
| `VITE_INCLUDE_ADMIN` | `false` | Inclui o painel no build. Fica `true` só no build privado, definido em `.env.admin`. |
| `VITE_ROUTER` | `hash` | `hash` funciona em qualquer hospedagem. Use `browser` (URLs limpas e melhor SEO) quando a hospedagem redirecionar todas as rotas para `index.html`. |
| `VITE_SITE_URL` | vazio | Domínio oficial. |
| `VITE_INSTAGRAM_URL` | vazio | Perfil real do Instagram. Enquanto estiver vazio, os links de Instagram ficam ocultos. |
| `VITE_CONTACT_EMAIL` | vazio | E-mail de atendimento exibido na página de contato. |
| `VITE_NEWSLETTER_ENDPOINT` | vazio | URL da lista de e-mails. Enquanto estiver vazio, o site não exibe o formulário de inscrição. |

---

## Pré-lançamento e lançamento oficial

O estado comercial é decidido num único lugar, **`src/config/store.ts`**:

| Estado | `PRELAUNCH` | `COMMERCE_ENABLED` |
|---|---|---|
| Pré-lançamento (atual) | `true` | `false` |
| Operação oficial | `false` | `true` |

O que muda no pré-lançamento:

- **Na página do produto:** o botão de compra e a quantidade dão lugar ao aviso "Official launch soon". O preço continua visível.
- **Rotas comerciais:** sacola, checkout, confirmação e conta mostram o aviso de lançamento, inclusive quando abertas direto pelo endereço.
- **Ações:** a sacola recusa itens, e a criação de pedidos e o login de cliente não fazem nada.
- **Painel:** o PORTOFINO Creator não é incluído no build público.

O procedimento completo de ativação, com testes, autorização e reversão, está em **[docs/OFFICIAL-LAUNCH-PROTOCOL.md](docs/OFFICIAL-LAUNCH-PROTOCOL.md)**. O checklist de prontidão fica em `src/config/launch.ts` e aparece em Creator → Launch.

> O projeto ainda **não tem backend** (servidor, banco de dados, pagamentos). Antes de ativar as vendas, é preciso construí-lo, e ele deve recusar pedidos e pagamentos enquanto `STORE_MODE` não for `live`. Veja o protocolo.

---

## Estrutura

```
src/
  config/      store.ts (chave comercial), launch.ts (checklist de lançamento)
  pages/       Home, Shop, Product, About, Search, Bag, Checkout, Account, Info, 404
  components/  Header, Footer, menu do celular, sacola, cards de produto, avisos de pré-lançamento
  admin/       PORTOFINO Creator (dashboard, produtos, estoque, pedidos, clientes,
               financeiro, conteúdo, analytics, lançamento). Usa dados fictícios.
  data/        catálogo, conteúdo da homepage e dados fictícios do painel
  i18n/        tradução para o português (pt.ts) e seletor EN/PT
  store/       estado da sacola, do catálogo e do conteúdo (no navegador)
  styles.css   tokens do design (cores, tipografia, botões, animações)
public/        fotos (img/), favicon, robots.txt
docs/          OFFICIAL-LAUNCH-PROTOCOL.md
tests/         prelaunch.test.cjs
```

## Identidade

- **Cores:** navy `#0F1E3F`, off-white `#F7F5F0`, bege `#D9CCBA`, areia `#C8B79F`, marrom `#796653`, preto suave `#191919`.
- **Fontes:** Ponomar (títulos), Poppins 200/300 (texto), Luxurious Script (assinaturas) e Bodoni Moda (serifa de contraste). Todas são servidas pelo próprio site, sem depender do Google Fonts.
- **Logotipos:** arquivos oficiais em `src/brand/`, sem alterações.

## Pendências antes de vender

Domínio e hospedagem · backend com o bloqueio no servidor · gateway de pagamento (Pix e cartão) · confirmações de pagamento · pedidos e estoque em banco de dados · e-mails de pedido · login do painel · painel ligado às vendas reais · revisão dos textos legais · confirmação da tabela de frete · Instagram, e-mail de contato e lista de newsletter.
