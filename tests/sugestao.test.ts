import { describe, expect, it } from 'vitest';
import { MAX_SUGESTAO, MIN_SUGESTAO, validarSugestao } from '../src/motor/sugestao.ts';

describe('validarSugestao', () => {
  it('aceita texto normal e tira espaços das pontas', () => {
    expect(validarSugestao('  Letras maiores, por favor.  ')).toEqual({ ok: true, texto: 'Letras maiores, por favor.' });
  });
  it('recusa texto curto demais ou só com espaços', () => {
    expect(validarSugestao('oi')).toEqual({ ok: false, motivo: 'curta' });
    expect(validarSugestao('        ')).toEqual({ ok: false, motivo: 'curta' });
  });
  it('limites: o menor e o maior valem, um a mais não', () => {
    expect(validarSugestao('a'.repeat(MIN_SUGESTAO)).ok).toBe(true);
    expect(validarSugestao('a'.repeat(MAX_SUGESTAO)).ok).toBe(true);
    expect(validarSugestao('a'.repeat(MAX_SUGESTAO + 1))).toEqual({ ok: false, motivo: 'longa' });
  });
});
