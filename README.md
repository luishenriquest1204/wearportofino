# wearportofino

PORTOFINO — site da maison de 100% linho (React + Vite + TypeScript + Tailwind).

O site está em **modo pré-lançamento**: coleção, preços e marca públicos; compras desativadas.

## Comandos

```bash
npm install
npm run dev              # site público em desenvolvimento
npm run dev:admin        # inclui o painel PORTOFINO Creator (#/admin)
npm run build            # build público  → dist/
npm run build:admin      # build privado  → dist-admin/ (nunca publicar)
npm run test:prelaunch   # 80 testes: navegação, bloqueio de compras, integridade, segurança
```

## Documentação

- Estado comercial e lançamento oficial: [docs/OFFICIAL-LAUNCH-PROTOCOL.md](docs/OFFICIAL-LAUNCH-PROTOCOL.md)
- Chave central: `src/config/store.ts` (`VITE_STORE_MODE=prelaunch | live`)
- Checklist de lançamento: `src/config/launch.ts`
