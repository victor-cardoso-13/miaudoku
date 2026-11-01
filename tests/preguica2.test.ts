/**
 * Modo preguiça 2: conta todos os ✕ (à mão, da dica e automáticos).
 * As casas "só cabe um gato" precisam SEMPRE ser casas que têm gato;
 * com ✕ errados, o jogo avisa ("tem um ✕ errado aqui") em vez de acender casa errada.
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { deTexto, ehResposta } from '../src/motor/fase.ts';
import { casasSoCabeUm, definirX, novoJogo, porGato, preguica2 } from '../src/motor/jogo.ts';
import { criarSorteio } from '../src/motor/gerador.ts';
import { TAMANHOS } from '../src/motor/regras.ts';

describe('preguiça 2: casas onde só cabe um gato', () => {
  it('o exemplo do mock: 7×7 depois de 3 gatos acende exatamente 2 casas', () => {
    const f = deTexto('abaacddaaaccddeaaaccfeaaaccfcggccffcccccffccccfff|1530246');
    const j = novoJogo(f);
    [1, 12, 17].forEach(c => porGato(j, f, c, true));
    expect(casasSoCabeUm(f, j.marcas)).toEqual([21, 30]);
  });

  it('não acende nada sem gatos postos numa fase de verdade', () => {
    const f = deTexto(JSON.parse(readFileSync(new URL('../src/fases/10.json', import.meta.url), 'utf8'))[0]);
    expect(casasSoCabeUm(f, novoJogo(f).marcas)).toEqual([]);
  });

  it('o print de 31/10: fase 2 do 10×10, linha 2 só tem a 1ª casa sem ✕ e ela acende', () => {
    const textos: string[] = JSON.parse(readFileSync(new URL('../src/fases/10.json', import.meta.url), 'utf8'));
    const f = deTexto(textos[1]);
    const j = novoJogo(f);
    // os 2 gatos do print (linha 5, coluna 8 e linha 7, coluna 5), com preguiça ligada
    expect(porGato(j, f, 4 * 10 + 7, true)).toBe('certo');
    expect(porGato(j, f, 6 * 10 + 4, true)).toBe('certo');
    // os ✕ do print, linha por linha (colunas de 0 a 9)
    const xs = [[4, 7, 8, 9], [1, 2, 3, 4, 5, 6, 7, 8, 9], [1, 2, 3, 4, 7], [2, 3, 4, 6, 7, 8], [0, 1, 2, 3, 4, 5, 6, 8, 9],
      [3, 4, 5, 6, 7, 8], [0, 1, 2, 3, 5, 6, 7, 8, 9], [3, 4, 5, 6, 7], [3, 4, 5, 6, 7], [4, 5, 6, 7]];
    xs.forEach((cols, l) => cols.forEach(c => definirX(j, l * 10 + c, 'x')));
    const r = preguica2(f, j.marcas);
    expect(r.casas).toContain(10); // linha 2, coluna 1
    expect(r.xErrado).toEqual([]);
    for (const s of r.casas) expect(ehResposta(f, s)).toBe(true);
  });

  it('✕ errado: não acende a casa errada e avisa a linha, a coluna ou a cor', () => {
    const f = deTexto('abaacddaaaccddeaaaccfeaaaccfcggccffcccccffccccfff|1530246');
    const j = novoJogo(f);
    // ✕ em toda a 1ª linha menos a casa 0 (o gato dela está na casa 1: ✕ errado)
    for (let c = 1; c < 7; c++) definirX(j, c, 'x');
    const r = preguica2(f, j.marcas);
    expect(r.casas).not.toContain(0);
    expect(r.xErrado.some(u => u.tipo === 'linha' && u.id === 0)).toBe(true);
    // e se a casa 0 também ganha ✕: linha sem casa livre, continua o aviso
    definirX(j, 0, 'x');
    expect(preguica2(f, j.marcas).xErrado.some(u => u.tipo === 'linha' && u.id === 0)).toBe(true);
  });

  for (const { n } of TAMANHOS) {
    it(`${n}×${n}: em 200 partidas com ✕ certos à mão, acende só casas com gato e nunca avisa`, () => {
      const textos: string[] = JSON.parse(readFileSync(new URL(`../src/fases/${n}.json`, import.meta.url), 'utf8'));
      const rnd = criarSorteio(n * 13);
      let acesas = 0;
      for (let i = 0; i < 200; i++) {
        const f = deTexto(textos[Math.floor(rnd() * textos.length)]);
        const j = novoJogo(f);
        // o jogador marca ✕ certos ao acaso (casas sem gato)
        for (let k = 0; k < n * 3; k++) {
          const s = Math.floor(rnd() * n * n);
          if (!ehResposta(f, s)) definirX(j, s, 'x');
        }
        const ordem = f.resposta.map((c, l) => l * n + c).sort(() => rnd() - 0.5);
        for (const casa of ordem) {
          porGato(j, f, casa, rnd() < 0.5);
          const r = preguica2(f, j.marcas);
          expect(r.xErrado, `fase ${i}: aviso sem ✕ errado`).toEqual([]);
          for (const s of r.casas) {
            acesas++;
            expect(ehResposta(f, s), `fase ${i}: casa ${s} acesa sem ter gato`).toBe(true);
          }
        }
      }
      expect(acesas).toBeGreaterThan(0);
    });

    it(`${n}×${n}: em 200 partidas (com ✕ errados à mão), só acende casas que têm gato`, () => {
      const textos: string[] = JSON.parse(readFileSync(new URL(`../src/fases/${n}.json`, import.meta.url), 'utf8'));
      const rnd = criarSorteio(n * 7);
      let acesas = 0, avisos = 0, comErro = 0;
      for (let i = 0; i < 200; i++) {
        const f = deTexto(textos[Math.floor(rnd() * textos.length)]);
        const j = novoJogo(f);
        j.coracoes = 99;
        // o jogador marca alguns ✕ ao acaso, inclusive em casas que têm gato (erro dele)
        for (let k = 0; k < n; k++) definirX(j, Math.floor(rnd() * n * n), 'x');
        const errados = f.resposta.filter((c, l) => j.marcas[l * n + c] === 'x').length;
        const ordem = f.resposta.map((c, l) => l * n + c).sort(() => rnd() - 0.5);
        for (const casa of ordem) {
          const r = preguica2(f, j.marcas);
          for (const s of r.casas) {
            acesas++;
            expect(ehResposta(f, s), `fase ${i}: casa ${s} acesa sem ter gato`).toBe(true);
          }
          // cada aviso aponta uma linha/coluna/cor onde o ✕ está mesmo na casa do gato
          for (const u of r.xErrado) {
            avisos++;
            expect(u.casas.some(s => ehResposta(f, s) && j.marcas[s] === 'x'), `fase ${i}: aviso sem ✕ errado`).toBe(true);
          }
          if (j.marcas[casa] === 'x') definirX(j, casa, '');
          porGato(j, f, casa, rnd() < 0.5);
        }
        if (errados) comErro++;
      }
      expect(acesas).toBeGreaterThan(0);
      expect(comErro).toBeGreaterThan(0);
      expect(avisos).toBeGreaterThan(0);
    });
  }
});
