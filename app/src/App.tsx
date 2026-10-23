import { useEffect, useMemo, useState } from 'react';
import { Cabecalho } from './components/Cabecalho';
import { ALTURA_NAV, NavInferior } from './components/NavInferior';
import { buscarPratoDoGuia } from './data/cardapios';
import {
  FORNO_PADRAO,
  MESA_PADRAO,
  ajustarForno,
  ajustarItensLivres,
  ajustarMesa,
  ajustarRascunho,
  ajustarReceitasNaLista,
  ajustarReceitasSalvas,
  receitaVazia,
  type Aba,
  type RascunhoReceita,
  type Receita,
} from './estado';
import { soNumeros, soTextos, usePersistente } from './lib/armazenamento';
import type { ItemLivre, ReceitaNaLista } from './lib/custo';
import { normalizar } from './lib/formato';
import { calcularMesa, pessoasEquivalentes, type ResultadoPrato } from './lib/mesa';
import { fatorDaReceita, interpretarLinha, novoId, recalcularLinha, type LinhaReceita } from './lib/receita';
import { AbaCusto } from './telas/AbaCusto';
import { AbaForno } from './telas/AbaForno';
import { AbaMesa } from './telas/AbaMesa';
import { AbaReceita } from './telas/AbaReceita';

export default function App() {
  const [aba, setAba] = useState<Aba>('mesa');
  const [mesa, setMesa] = usePersistente('mesa', MESA_PADRAO, ajustarMesa);
  const porcoesMesa = Math.max(1, Math.ceil(pessoasEquivalentes(mesa.adultos, mesa.criancas, mesa.apetite) - 1e-9));
  const [rascunho, setRascunho] = usePersistente<RascunhoReceita>('receita-atual', receitaVazia(porcoesMesa), ajustarRascunho);
  const [salvas, setSalvas] = usePersistente<Receita[]>('receitas-salvas', [], ajustarReceitasSalvas);
  const [naLista, setNaLista] = usePersistente<ReceitaNaLista[]>('lista-receitas', [], ajustarReceitasNaLista);
  const [livres, setLivres] = usePersistente<ItemLivre[]>('itens-livres', [], ajustarItensLivres);
  const [precos, setPrecos] = usePersistente<Record<string, number>>('precos-v2', {}, soNumeros);
  const [comprados, setComprados] = usePersistente<string[]>('comprados-v2', [], soTextos);
  const [forno, setForno] = usePersistente('forno', FORNO_PADRAO, ajustarForno);
  const [toast, setToast] = useState<string | null>(null);

  const resultados = useMemo(
    () => calcularMesa(mesa.pratos, mesa.adultos, mesa.criancas, mesa.apetite),
    [mesa],
  );

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(t);
  }, [toast]);

  function irPara(nova: Aba) {
    setAba(nova);
    setToast(null);
    window.scrollTo({ top: 0 });
  }

  /** "Ajustar a receita deste prato": abre a aba 2 com o nome e as porções do prato. */
  function ajustarReceitaDoPrato(r: ResultadoPrato) {
    const fazerPara = Math.max(1, Math.ceil(r.porcoes - 1e-9));
    setRascunho((atual) => {
      // 1. Continua de onde parou, se já estava ajustando este prato.
      if (atual.pratoMesaId === r.prato.id && atual.linhas.length > 0) return { ...atual, fazerPara };
      // 2. Uma receita salva com o mesmo nome.
      const salva = salvas.find((s) => normalizar(s.nome) === normalizar(r.nome));
      if (salva) return { ...salva, fazerPara, pratoMesaId: r.prato.id };
      // 3. A receita-base do guia.
      const guia = r.prato.guia ? buscarPratoDoGuia(r.prato.guia) : undefined;
      const linhas = (guia?.ingredientes ?? []).map(interpretarLinha).filter((l): l is LinhaReceita => l !== null);
      return { id: novoId(), nome: r.nome, serve: guia?.serve ?? 4, fazerPara, pratoMesaId: r.prato.id, linhas };
    });
    irPara('receita');
  }

  function adicionarReceitaNaLista() {
    const fator = fatorDaReceita(rascunho.serve, rascunho.fazerPara);
    const receita: ReceitaNaLista = {
      id: rascunho.pratoMesaId ?? rascunho.id,
      nome: rascunho.nome.trim() || 'Receita',
      pessoas: rascunho.fazerPara,
      itens: rascunho.linhas.map((l) => {
        const r = recalcularLinha(l, fator);
        return { quantidade: r.quantidade, unidade: r.unidade, ingrediente: r.ingrediente };
      }),
    };
    if (rascunho.pratoMesaId) receita.pratoMesaId = rascunho.pratoMesaId;
    setNaLista((lista) => [...lista.filter((x) => x.id !== receita.id), receita]);
    setToast('Ingredientes adicionados à lista de compras.');
  }

  function novaReceita() {
    if (rascunho.linhas.length > 0 && !window.confirm('Começar uma receita nova? A receita atual sai da tela (as salvas continuam guardadas).')) return;
    setRascunho(() => receitaVazia(porcoesMesa));
    window.scrollTo({ top: 0 });
  }

  return (
    <div className="mx-auto min-h-screen max-w-[480px] bg-creme shadow-[0_0_40px_rgba(36,28,16,.12)] print:max-w-none print:bg-white print:shadow-none">
      <Cabecalho />
      <main className={`px-4 pt-5 print:p-0 ${aba === 'custo' ? 'pb-[200px]' : 'pb-28'}`}>
        {aba === 'mesa' && (
          <AbaMesa mesa={mesa} setMesa={setMesa} resultados={resultados} ajustarReceita={ajustarReceitaDoPrato} verCusto={() => irPara('custo')} />
        )}
        {aba === 'receita' && (
          <AbaReceita
            rascunho={rascunho}
            setRascunho={setRascunho}
            salvas={salvas}
            setSalvas={setSalvas}
            porcoesMesa={porcoesMesa}
            novaReceita={novaReceita}
            adicionarALista={adicionarReceitaNaLista}
          />
        )}
        {aba === 'custo' && (
          <AbaCusto
            mesa={mesa}
            resultados={resultados}
            receitas={naLista}
            setReceitas={setNaLista}
            livres={livres}
            setLivres={setLivres}
            precos={precos}
            setPrecos={setPrecos}
            comprados={comprados}
            setComprados={setComprados}
            irParaMesa={() => irPara('mesa')}
          />
        )}
        {aba === 'forno' && <AbaForno forno={forno} setForno={setForno} />}
      </main>

      {toast && (
        <div
          role="status"
          className="fixed inset-x-0 z-40 mx-auto flex max-w-[448px] items-center gap-3 rounded-2xl bg-grafite px-4 py-3 text-base text-white shadow-lg print:hidden"
          style={{ bottom: `calc(${ALTURA_NAV + 12}px + env(safe-area-inset-bottom))` }}
        >
          <span className="flex-1">{toast}</span>
          <button type="button" onClick={() => irPara('custo')} className="min-h-[44px] shrink-0 rounded-xl bg-cta px-3 font-bold">
            Ver lista
          </button>
        </div>
      )}

      <NavInferior aba={aba} onChange={irPara} />
    </div>
  );
}
