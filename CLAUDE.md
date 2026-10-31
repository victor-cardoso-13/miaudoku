# Miaudoku — instruções para o Claude

Quebra-cabeça de gatos (linha, coluna e cor; gatos não encostam), feito para o Victor e a família.
**Esta pasta é só do Miaudoku**: é o repositório https://github.com/victor-cardoso-13/miaudoku,
publicado em https://victor-cardoso-13.github.io/miaudoku/ .
O Mexe-Mexe e os outros jogos ficam em outras pastas/repositórios: **não mexa neles daqui.**

## Como falar com o usuário
- Português, linguagem simples, passo a passo (ele não programa).
- **Mudança visual: primeiro um mock** (HTML em `scripts/mock-*.html` ou prints do jogo de verdade),
  só depois mexer no jogo. Publicar (PR + merge) **só depois do "ok" dele**.

## Organização
- `src/motor/` regras puras (fase, dica, gerador, jogo) — `src/motor/regras.ts` tem as regras da casa.
- `src/ui/` telas (desenho, tutorial, gatinhos, salvar); `src/nuvem/` conta e progresso no Firebase.
- `src/fases/N.json` 1.000 fases por tamanho, **congeladas** (não gerar de novo sem trocar a chave
  `miaudoku:v1` em `src/ui/salvar.ts`). Gerador: `npm run gerar -- 9 10`.
- `tests/` Vitest (inclui a conferência de todas as 6.000 fases).

## Antes de publicar
1. `npm test` e `npx tsc --noEmit -p .` (tudo passando).
2. Prints com Playwright (`node_modules/playwright`) em: iPhone em pé (390×844, 440×800),
   iPhone deitado (956×360), iPad (1180×820 e 820×1180). **Nunca iPhone SE.**
3. Se mexer em conta/nuvem: teste ponta a ponta com 2 contas de mentira no Firebase de verdade
   (criar, jogar, sair, entrar no outro "aparelho", conferir que não misturam) e **apagar as contas no fim**.

## Publicar
- `gh` fica em `~/.local/bin/gh` (use `export PATH="$HOME/.local/bin:$PATH"`), logado como victor-cardoso-13.
- Ramo novo → commit → `gh pr create` → `gh pr merge --merge --delete-branch` → acompanhar `gh run watch`.
  O GitHub roda os testes e publica sozinho; se falhar, o site continua na versão anterior.
- Commits terminam com: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Firebase (compartilhado por todos os jogos)
- Projeto `jogos-sem-anuncio`; config em `src/nuvem/config.ts`; progresso em `jogadores/{uid}/jogos/miaudoku`.
- As **regras de segurança** (`firestore.rules`, `firebase.json`) ficam em `/Users/victor/Desktop/Jogos/Computador/`,
  porque valem para todos os jogos. Deploy das regras é feito de lá: `firebase deploy --only firestore`.

## Para testar no celular sem publicar
`npx vite --host --port 5180` e abrir no celular (mesmo Wi-Fi) o endereço "Network" que aparece.
Ou dois cliques em `Jogar no computador.command`.

Anotações gerais sobre como fazemos jogos: `/Users/victor/Desktop/Jogos/Computador/APRENDIZADOS.md`.
