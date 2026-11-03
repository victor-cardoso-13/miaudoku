/**
 * Tela "Dar sugestão": a pessoa escreve o que podemos melhorar e envia.
 * Só texto. Só para quem tem conta (quem chama decide se mostra o botão).
 *
 * Como usar (no menu da conta do jogo):
 *   import { mostrarSugestao } from './ui/sugestao.ts';
 *   const { enviarSugestao, mensagemDeErro } = await import('./nuvem/conta.ts');
 *   mostrarSugestao(app, { enviar: enviarSugestao, erro: mensagemDeErro, aoFechar: voltarAoMenu });
 *
 * A tela não conhece o Firebase (recebe `enviar`), então o jogo continua abrindo rápido e offline.
 * Cores e fontes vêm das variáveis do jogo (--tinta, --creme, --ambar…): cada jogo adapta em `.sug-*`.
 */
import { MAX_SUGESTAO, validarSugestao } from '../motor/sugestao.ts';

export interface OpcoesSugestao {
  /** Manda o texto (já validado) para a nuvem; deve falhar com erro se não conseguir. */
  enviar: (texto: string) => Promise<void>;
  /** Transforma o erro numa frase em português simples (use `mensagemDeErro`). */
  erro: (e: unknown) => string;
  /** Chamado ao tocar em "Voltar" ou "Voltar ao jogo". */
  aoFechar: () => void;
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, classe: string, texto?: string) {
  const e = document.createElement(tag);
  e.className = classe;
  if (texto !== undefined) e.textContent = texto; // textContent: nada do que a pessoa digita vira código
  return e;
}

/** Desenha a tela dentro de `destino` (troca o que estava lá). */
export function mostrarSugestao(destino: HTMLElement, o: OpcoesSugestao) {
  const tela = el('section', 'sug');
  const voltar = el('button', 'sug-voltar', '← Voltar');
  voltar.type = 'button';
  const caixa = el('textarea', 'sug-caixa');
  caixa.maxLength = MAX_SUGESTAO;
  caixa.placeholder = 'Toque aqui e escreva…';
  caixa.setAttribute('aria-label', 'Sua sugestão');
  const contador = el('div', 'sug-contador', `0/${MAX_SUGESTAO}`);
  const aviso = el('p', 'sug-aviso-erro');
  aviso.hidden = true;
  aviso.setAttribute('role', 'alert');
  const enviar = el('button', 'sug-enviar', 'Enviar');
  enviar.type = 'button';
  enviar.disabled = true;

  tela.append(
    voltar,
    el('h2', 'sug-titulo', 'O que podemos melhorar?'),
    el('p', 'sug-texto', 'Escreva do seu jeito. Pode ser uma ideia, um problema ou um elogio.'),
    caixa, contador, aviso, enviar,
    el('p', 'sug-aviso', 'Só a equipe do jogo lê. Vai junto o seu e-mail, para podermos responder.'),
  );
  destino.replaceChildren(tela);

  const atualizar = () => {
    contador.textContent = `${caixa.value.length}/${MAX_SUGESTAO}`;
    enviar.disabled = !validarSugestao(caixa.value).ok;
  };
  caixa.addEventListener('input', atualizar);
  voltar.onclick = o.aoFechar;

  let enviando = false;
  enviar.onclick = async () => {
    const v = validarSugestao(caixa.value);
    if (!v.ok || enviando) return;
    enviando = true;
    enviar.disabled = true;
    aviso.hidden = true;
    try {
      await o.enviar(v.texto);
      agradecer(destino, o.aoFechar);
    } catch (e) {
      // O texto continua na caixa: a pessoa só toca de novo.
      aviso.textContent = `${o.erro(e)} Seu texto continua aqui.`;
      aviso.hidden = false;
      enviar.textContent = 'Tentar de novo';
      enviando = false;
      atualizar();
    }
  };
}

function agradecer(destino: HTMLElement, aoFechar: () => void) {
  const tela = el('section', 'sug sug-obrigado');
  const fechar = el('button', 'sug-enviar', 'Voltar ao jogo');
  fechar.type = 'button';
  fechar.onclick = aoFechar;
  tela.append(
    el('div', 'sug-coracao', '🧡'),
    el('h2', 'sug-titulo', 'Obrigado!'),
    el('p', 'sug-texto', 'Recebemos a sua sugestão. Ela nos ajuda a deixar o jogo melhor.'),
    fechar,
  );
  destino.replaceChildren(tela);
}
