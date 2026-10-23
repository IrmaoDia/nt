/**
 * ============================================================================
 *  TABELA DE FORNO — referências por peso (as mesmas do ebook, páginas 29 e 30)
 * ============================================================================
 *  Para cada carne:
 *    temperatura ..... temperatura do forno, em °C
 *    tabela .......... minutos COBERTO com papel-alumínio e DESCOBERTO (para dourar)
 *                      para cada peso em kg. Para pesos entre duas linhas, o app
 *                      calcula o meio-termo; acima da última linha, continua no
 *                      mesmo ritmo das duas últimas.
 *    pontoSeguro ..... temperatura interna (°C) medida com termômetro no centro da peça
 *    sinais .......... como reconhecer o ponto sem termômetro
 *  Os tempos valem para peça descongelada e forno preaquecido.
 *  ⚠️ Revise com quem cozinha antes de publicar.
 * ============================================================================
 */

export type IdCarne = 'pernil' | 'frango' | 'tender' | 'lombo';

export interface LinhaForno {
  kg: number;
  coberto: number; // minutos com papel-alumínio
  descoberto: number; // minutos sem papel-alumínio
}

export interface CarneForno {
  id: IdCarne;
  nome: string;
  detalhe: string;
  temperatura: number;
  tabela: LinhaForno[];
  pontoSeguro: number;
  textoPonto: string;
  sinais: string[];
}

export const CARNES_FORNO: CarneForno[] = [
  {
    id: 'pernil',
    nome: 'Pernil',
    detalhe: 'cru, com osso',
    temperatura: 180,
    tabela: [
      { kg: 1, coberto: 80, descoberto: 30 },
      { kg: 2, coberto: 120, descoberto: 35 },
      { kg: 3, coberto: 160, descoberto: 40 },
      { kg: 4, coberto: 200, descoberto: 45 },
      { kg: 5, coberto: 240, descoberto: 50 },
      { kg: 6, coberto: 280, descoberto: 50 },
    ],
    pontoSeguro: 70,
    textoPonto: 'Meça na parte mais grossa, sem encostar no osso.',
    sinais: [
      'Espete um garfo na parte mais grossa: o caldo que sai deve ser claro, sem cor rosada.',
      'A carne fica macia e se solta do osso com facilidade.',
      'Ao cortar, o centro não pode estar vermelho nem com aspecto cru.',
    ],
  },
  {
    id: 'frango',
    nome: 'Frango inteiro',
    detalhe: 'cru, descongelado',
    temperatura: 200,
    tabela: [
      { kg: 1, coberto: 45, descoberto: 25 },
      { kg: 2, coberto: 75, descoberto: 30 },
      { kg: 3, coberto: 100, descoberto: 35 },
      { kg: 4, coberto: 125, descoberto: 40 },
      { kg: 5, coberto: 150, descoberto: 45 },
      { kg: 6, coberto: 175, descoberto: 50 },
    ],
    pontoSeguro: 74,
    textoPonto: 'Meça na parte mais grossa do peito e da coxa, sem encostar no osso.',
    sinais: [
      'Fure a junta da coxa com a sobrecoxa: o caldo deve sair claro, sem sangue.',
      'A coxa mexe com facilidade e quase se solta do corpo.',
      'A carne perto do osso não pode ter partes rosadas.',
    ],
  },
  {
    id: 'tender',
    nome: 'Tender',
    detalhe: 'já vem cozido',
    temperatura: 180,
    tabela: [
      { kg: 1, coberto: 20, descoberto: 20 },
      { kg: 2, coberto: 40, descoberto: 20 },
      { kg: 3, coberto: 60, descoberto: 25 },
      { kg: 4, coberto: 80, descoberto: 30 },
      { kg: 5, coberto: 100, descoberto: 30 },
      { kg: 6, coberto: 120, descoberto: 35 },
    ],
    pontoSeguro: 74,
    textoPonto: 'O tender já vem cozido: é só reaquecer até o centro chegar a 74 °C. Siga também a embalagem.',
    sinais: [
      'Espete uma faca no centro por 10 segundos: ela deve sair bem quente ao toque.',
      'A cobertura fica dourada, brilhante e borbulhando nas bordas.',
    ],
  },
  {
    id: 'lombo',
    nome: 'Lombo suíno',
    detalhe: 'cru',
    temperatura: 180,
    tabela: [
      { kg: 1, coberto: 40, descoberto: 20 },
      { kg: 2, coberto: 75, descoberto: 25 },
      { kg: 3, coberto: 110, descoberto: 30 },
      { kg: 4, coberto: 145, descoberto: 35 },
      { kg: 5, coberto: 180, descoberto: 40 },
      { kg: 6, coberto: 215, descoberto: 45 },
    ],
    pontoSeguro: 70,
    textoPonto: 'Meça no centro da peça, na parte mais grossa.',
    sinais: [
      'Espete um garfo no centro: o caldo que sai deve ser claro.',
      'A carne fica firme e macia, e o centro não pode estar rosado cru.',
    ],
  },
];

/** A partir de quantos kg o app sugere dividir a peça em duas assadeiras. */
export const PESO_PECA_GRANDE = 5;
