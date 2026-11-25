# PORTOFINO — Modo pré-lançamento e OFFICIAL LAUNCH PROTOCOL

## 1. Como o estado comercial funciona

O site tem um único ponto de controle: `src/config/store.ts`.

| Estado | `PRELAUNCH` | `COMMERCE_ENABLED` | Variável |
|---|---|---|---|
| Pré-lançamento (padrão) | `true` | `false` | `VITE_STORE_MODE=prelaunch` |
| Operação oficial | `false` | `true` | `VITE_STORE_MODE=live` |

- O valor é definido **no momento do build**, a partir das variáveis de ambiente do projeto de hospedagem, e fica compilado no JavaScript. O visitante não consegue alterá-lo pelo navegador.
- Só o valor exato `live` liga as vendas. Qualquer outro valor, inclusive vazio ou digitado errado, mantém o pré-lançamento. O sistema falha fechado.
- Quem pode mudar o estado: quem tem acesso ao projeto de hospedagem e ao repositório, ou seja, o administrador.

### O que o pré-lançamento bloqueia hoje (frontend)

| Camada | Bloqueio |
|---|---|
| Rotas | `/bag`, `/checkout`, `/checkout/confirmation` e `/account` mostram o aviso "Official launch soon", inclusive quando acessadas direto pela URL (`CommerceRoute` em `src/App.tsx`). |
| Ações | `useBag.add` e `useBag.setQty` não fazem nada; itens salvos no navegador são descartados ao carregar (`src/store/shop.ts`). |
| Pedido | `assertCommerce("place order")` interrompe a criação de pedido (`src/pages/Checkout.tsx`). |
| Conta | `useAccount.signIn` não faz nada. |
| Interface | O botão de compra e a barra fixa do celular dão lugar ao quadro "Coming soon". A sacola sai do topo e a gaveta da sacola não é montada. |
| Admin | O PORTOFINO Creator não entra no build público (o arquivo do admin nem é gerado). Ele existe só no build privado `npm run build:admin`. |

Preços, produtos, fotos, categorias e políticas continuam públicos.

### O que ainda NÃO existe (e por isso não pode ser burlado)

Este projeto ainda **não tem backend**: não há servidor, banco de dados, API de pedidos nem gateway de pagamento. Por isso não existe hoje nenhum endpoint capaz de criar pedido ou cobrança, e nenhum que possa ser atacado. Alterar o JavaScript no próprio navegador não leva a lugar nenhum, porque não há para onde enviar um pedido.

**Requisito obrigatório para o backend futuro:** toda função que crie pedido, inicie pagamento, gere cobrança ou receba webhook deve chamar `resolveStoreState(process.env.STORE_MODE)` (a mesma função de `src/config/store.ts`) e responder `403 commerce_disabled` enquanto `COMMERCE_ENABLED` for `false`. O servidor lê **a sua própria** variável `STORE_MODE`, que nunca é exposta ao navegador. O frontend apenas espelha esse estado.

## 2. Builds e variáveis

| Comando | Uso |
|---|---|
| `npm run build` | Site público, saída em `dist/`, sem o Creator. |
| `npm run build:admin` | Build privado com o Creator, saída em `dist-admin/`. **Nunca publicar em endereço público.** |
| `npm run test:prelaunch` | Roda os testes de navegação, bloqueio, integridade e segurança. Precisa de `npm run preview` rodando. |

Variáveis públicas (em `.env`; nunca coloque segredos em variáveis `VITE_`):

| Variável | Valor atual | Para que serve |
|---|---|---|
| `VITE_STORE_MODE` | `prelaunch` | Estado comercial |
| `VITE_ROUTER` | `hash` | Trocar para `browser` quando a hospedagem redirecionar todas as rotas para `index.html` (URLs limpas e melhor SEO) |
| `VITE_SITE_URL` | vazio | Domínio oficial (sitemap, links canônicos) |
| `VITE_INSTAGRAM_URL` | vazio | Perfil real; enquanto estiver vazio, os links de Instagram ficam ocultos |
| `VITE_CONTACT_EMAIL` | vazio | E-mail de atendimento na página de contato |
| `VITE_NEWSLETTER_ENDPOINT` | vazio | URL do formulário da lista de e-mails; enquanto estiver vazio, o site não exibe formulário que não salva nada |

Segredos (chaves do gateway, do banco e de e-mail) ficam apenas no servidor, como variáveis sem o prefixo `VITE_`.

## 3. Publicação no domínio oficial (pré-lançamento)

1. Escolher a hospedagem (recomendação: Vercel) e conectar o repositório.
2. Definir as variáveis da seção 2 no painel da hospedagem, com `VITE_STORE_MODE=prelaunch`.
3. Comando de build: `npm run build`; pasta publicada: `dist`.
4. Conectar o domínio; a hospedagem emite o certificado HTTPS automaticamente.
5. Opcional: configurar o redirecionamento de todas as rotas para `/index.html` e trocar `VITE_ROUTER` para `browser`.
6. Rodar `npm run test:prelaunch` apontando para a URL publicada (`BASE_URL=https://… npm run test:prelaunch`).

## 4. OFFICIAL LAUNCH PROTOCOL

Executar quando o administrador pedir: **"DESATIVAR MODO PRÉ-LANÇAMENTO E ATIVAR OPERAÇÃO OFICIAL"**.

1. **Verificar o estado atual.** O painel Creator → Launch mostra o modo atual e o checklist (`src/config/launch.ts`).
2. **Verificar as integrações comerciais.** Todos os itens críticos do checklist precisam estar `ready`: backend, gateway, webhooks, pedidos, estoque, frete, e-mails, login do admin, Creator ligado às vendas reais, textos legais e domínio.
3. **Verificar os pagamentos** na conta *sandbox* do gateway: Pix e cartão aprovados, recusados e estornados.
4. **Verificar se o checkout está operacional** de ponta a ponta no ambiente de testes.
5. **Verificar o processamento de pedidos:** o pedido é criado, o estoque baixa e o e-mail sai.
6. **Executar compras de teste** no ambiente de testes, com `STORE_MODE=live` apenas no *preview*/staging.
7. **Confirmar que não há erros críticos:** `npm run test:prelaunch` e os testes do backend passando.
8. **Preparar a alteração:** registrar a data/hora e o commit atual para permitir o rollback.
9. **Solicitar a autorização do administrador.** Sem confirmação explícita, não continuar. O Creator → Launch exige digitar `ATIVAR OPERAÇÃO OFICIAL`.
10. **Desativar o pré-lançamento:** no projeto de hospedagem, `VITE_STORE_MODE=live` (site) e `STORE_MODE=live` (servidor).
11. **Habilitar as operações comerciais:** novo deploy de produção.
12. **Testes finais em produção, sem cobranças indevidas:** navegação, sacola e checkout até a tela do gateway, sem concluir pagamento; ou um pedido real de valor mínimo, estornado em seguida.
13. **Confirmar e relatar:** apresentar o relatório com o resultado de cada etapa.

**Se qualquer etapa crítica estiver incompleta, NÃO ativar as vendas.** Apresentar as pendências e aguardar.

### Reversão (rollback)

Voltar as duas variáveis para `prelaunch` e fazer novo deploy. Produtos, preços, fotos, usuários e configurações não são apagados por nenhum dos estados: o modo só liga e desliga funções.

## 5. Pendências conhecidas (antes de vender)

Lista viva em `src/config/launch.ts`, exibida no Creator → Launch. Resumo atual:

- **Não construído:** backend de comércio com bloqueio no servidor, gateway de pagamento, webhooks de confirmação, pedidos em banco de dados, baixa de estoque, e-mails transacionais, login do administrador e Creator ligado às vendas reais.
- **Aguardando você:** domínio e hospedagem, e-mail de contato, perfil do Instagram, lista de newsletter, revisão dos textos legais e confirmação da tabela de frete.
