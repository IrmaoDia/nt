import { useMemo, useState } from 'react';
import { CampoQuantidade } from '../components/CampoQuantidade';
import { Contador } from '../components/Contador';
import { IconeAlerta, IconeImpressora, IconeLixeira, IconeMais, IconeMensagem } from '../components/Icones';
import type { RascunhoReceita, Receita } from '../estado';
import { linkWhatsapp } from '../lib/custo';
import { formatarNumero } from '../lib/formato';
import { MAX_PESSOAS } from '../lib/mesa';
import {
  SEM_RECALCULO,
  UNIDADES_RECEITA,
  avisosDaReceita,
  fatorDaReceita,
  interpretarTexto,
  novoId,
  recalcularLinha,
  textoReceitaWhatsapp,
  type LinhaReceita,
  type UnidadeReceita,
} from '../lib/receita';

interface Props {
  rascunho: RascunhoReceita;
  setRascunho: (atualizar: (r: RascunhoReceita) => RascunhoReceita) => void;
  salvas: Receita[];
  setSalvas: (atualizar: (s: Receita[]) => Receita[]) => void;
  porcoesMesa: number;
  novaReceita: () => void;
  adicionarALista: () => void;
}

const UNIDADES_FRACAO: UnidadeReceita[] = ['xicara', 'colher-sopa', 'colher-cha'];

export function AbaReceita({ rascunho, setRascunho, salvas, setSalvas, porcoesMesa, novaReceita, adicionarALista }: Props) {
  const [colado, setColado] = useState('');
  const [mensagem, setMensagem] = useState('');
  const fator = fatorDaReceita(rascunho.serve, rascunho.fazerPara);
  const resultados = useMemo(() => rascunho.linhas.map((l) => recalcularLinha(l, fator)), [rascunho.linhas, fator]);
  const avisos = avisosDaReceita(rascunho.linhas, fator);
  const salva = salvas.some((s) => s.id === rascunho.id);

  const mudar = (m: Partial<RascunhoReceita>) => setRascunho((r) => ({ ...r, ...m }));
  const mudarLinha = (id: string, m: Partial<LinhaReceita>) =>
    setRascunho((r) => ({ ...r, linhas: r.linhas.map((l) => (l.id === id ? { ...l, ...m } : l)) }));

  function interpretar() {
    const linhas = interpretarTexto(colado);
    if (linhas.length === 0) {
      setMensagem('Não encontrei ingredientes. Cole um ingrediente por linha, como "2 xícaras de farinha".');
      return;
    }
    if (rascunho.linhas.length > 0 && !window.confirm('Isso troca os ingredientes que já estão na lista abaixo. Continuar?')) return;
    mudar({ linhas });
    setColado('');
    setMensagem(`${linhas.length} ${linhas.length === 1 ? 'ingrediente encontrado' : 'ingredientes encontrados'}. Confira e corrija abaixo, se precisar.`);
  }

  function salvar() {
    const { id, nome, serve, linhas } = rascunho;
    const receita: Receita = { id, nome: nome.trim() || 'Receita sem nome', serve, linhas };
    setSalvas((s) => (s.some((x) => x.id === id) ? s.map((x) => (x.id === id ? receita : x)) : [receita, ...s]));
    setMensagem('Receita salva neste aparelho.');
  }

  function abrir(r: Receita) {
    setRascunho(() => ({ ...r, fazerPara: rascunho.fazerPara }));
    setMensagem(`Receita "${r.nome}" aberta.`);
    window.scrollTo({ top: 0 });
  }

  function apagar(r: Receita) {
    if (window.confirm(`Apagar a receita "${r.nome}"?`)) setSalvas((s) => s.filter((x) => x.id !== r.id));
  }

  const temIngredientes = rascunho.linhas.length > 0;
  const textoZap = textoReceitaWhatsapp(rascunho.nome, rascunho.serve, rascunho.fazerPara, resultados, avisos);

  return (
    <>
      <div className="space-y-5 print:hidden">
        <section className="cartao space-y-5">
          <div className="flex items-start justify-between gap-3">
            <h2 className="titulo-secao">Ajustar receita</h2>
            <button type="button" onClick={novaReceita} className="min-h-[44px] shrink-0 rounded-xl bg-creme px-3 text-base font-bold text-oliva">
              + Nova receita
            </button>
          </div>
          <p className="-mt-2 text-base text-stone-700">
            Use qualquer receita: o app multiplica os ingredientes para o número de pessoas que você quiser.
          </p>
          <div>
            <label htmlFor="nome-receita" className="block text-xl font-bold">
              Nome da receita
            </label>
            <input
              id="nome-receita"
              type="text"
              value={rascunho.nome}
              onChange={(e) => mudar({ nome: e.target.value })}
              placeholder="Ex.: Maionese da vó"
              className="mt-2 h-14 w-full rounded-xl border-2 border-creme-escuro bg-creme px-4 text-lg placeholder:text-stone-500 focus:border-oliva focus:outline-none"
            />
          </div>
          <Contador
            id="serve"
            rotulo="Esta receita serve quantas pessoas?"
            valor={rascunho.serve}
            min={1}
            max={MAX_PESSOAS}
            onChange={(serve) => mudar({ serve })}
          />
          <Contador
            id="fazer-para"
            rotulo="Quero fazer para quantas pessoas?"
            ajuda={`Sua mesa: ${porcoesMesa} ${porcoesMesa === 1 ? 'porção' : 'porções'} de adulto.`}
            valor={rascunho.fazerPara}
            min={1}
            max={MAX_PESSOAS}
            onChange={(fazerPara) => mudar({ fazerPara })}
          />
        </section>

        <section className="cartao">
          <h2 className="titulo-secao">Ingredientes</h2>
          <label htmlFor="colar" className="mt-3 block text-lg font-bold">
            Colar a receita
          </label>
          <p className="text-base text-stone-600">Cole a lista de ingredientes, um por linha.</p>
          <textarea
            id="colar"
            value={colado}
            onChange={(e) => setColado(e.target.value)}
            rows={5}
            placeholder={'1 kg de batata\n3 ovos\n1/2 xícara de ervilha\nsal a gosto'}
            className="mt-2 w-full rounded-xl border-2 border-creme-escuro bg-creme p-3 text-lg leading-relaxed placeholder:text-stone-500 focus:border-oliva focus:outline-none"
          />
          <button type="button" onClick={interpretar} disabled={!colado.trim()} className="botao-secundario mt-2 bg-oliva text-white disabled:opacity-50">
            Interpretar ingredientes
          </button>
          {mensagem && (
            <p role="status" className="mt-3 rounded-xl bg-oliva-claro px-4 py-3 text-base text-oliva-escuro">
              {mensagem}
            </p>
          )}

          <h3 className="mt-6 font-corpo text-lg font-bold">Ingredientes da receita original</h3>
          {!temIngredientes && <p className="mt-1 text-base text-stone-600">Nenhum ingrediente ainda. Cole a receita acima ou adicione linha a linha.</p>}
          <ul className="mt-3 space-y-3">
            {rascunho.linhas.map((l, i) => (
              <li key={l.id} className="rounded-xl border-2 border-creme-escuro p-3">
                <div className="flex items-center gap-2">
                  <CampoQuantidade
                    id={`qtd-${l.id}`}
                    valor={l.quantidade}
                    fracao={UNIDADES_FRACAO.includes(l.unidade)}
                    desativado={l.unidade === 'a-gosto' || l.unidade === 'sem'}
                    onChange={(quantidade) => mudarLinha(l.id, { quantidade })}
                  />
                  <select
                    aria-label={`Unidade do ingrediente ${i + 1}`}
                    value={l.unidade}
                    onChange={(e) => {
                      const unidade = e.target.value as UnidadeReceita;
                      const semQtd = unidade === 'a-gosto' || unidade === 'sem';
                      mudarLinha(l.id, { unidade, quantidade: semQtd ? null : (l.quantidade ?? 1) });
                    }}
                    className="h-12 min-w-0 flex-1 rounded-xl border-2 border-creme-escuro bg-creme px-2 text-lg focus:border-oliva focus:outline-none"
                  >
                    {UNIDADES_RECEITA.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.rotulo}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="text"
                    aria-label={`Ingrediente ${i + 1}`}
                    value={l.ingrediente}
                    onChange={(e) => mudarLinha(l.id, { ingrediente: e.target.value })}
                    placeholder="Ingrediente"
                    className="h-12 min-w-0 flex-1 rounded-xl border-2 border-creme-escuro bg-creme px-3 text-lg focus:border-oliva focus:outline-none"
                  />
                  <button
                    type="button"
                    aria-label={`Remover ingrediente ${l.ingrediente || i + 1}`}
                    onClick={() => setRascunho((r) => ({ ...r, linhas: r.linhas.filter((x) => x.id !== l.id) }))}
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#FDECEA] text-vermelho"
                  >
                    <IconeLixeira className="h-6 w-6" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() =>
              setRascunho((r) => ({ ...r, linhas: [...r.linhas, { id: novoId(), quantidade: 1, unidade: 'unidade', ingrediente: '' }] }))
            }
            className="botao-secundario mt-3 border-2 border-oliva bg-white text-oliva"
          >
            <IconeMais className="h-6 w-6" /> Adicionar ingrediente
          </button>
        </section>

        {temIngredientes && (
          <section className="overflow-hidden rounded-2xl bg-white shadow-cartao">
            <div className="bg-oliva px-5 py-4 text-white">
              <h2 className="text-2xl font-bold">
                Para {rascunho.fazerPara} {rascunho.fazerPara === 1 ? 'pessoa' : 'pessoas'}
              </h2>
              <p className="text-base text-white/90">
                {Math.abs(fator - 1) < 1e-9
                  ? 'Mesma quantidade da receita original.'
                  : `A receita serve ${rascunho.serve}: multiplicando por ${formatarNumero(Math.round(fator * 100) / 100)}.`}
              </p>
            </div>
            <ul className="divide-y divide-creme-escuro px-5">
              {resultados.map((r, i) => (
                <li key={rascunho.linhas[i].id} className="py-3">
                  <p className="text-lg font-bold leading-snug text-grafite">{r.texto || '—'}</p>
                  {!SEM_RECALCULO.includes(r.unidade) && r.original !== r.texto && (
                    <p className="text-base text-stone-600">Na receita: {r.original}</p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {temIngredientes && avisos.length > 0 && (
          <section className="space-y-3" aria-label="Avisos">
            {avisos.map((a) => (
              <div key={a.id} className="flex items-start gap-3 rounded-2xl border-2 border-dourado bg-[#FFF8E1] p-4 text-base text-[#5A4507]">
                <IconeAlerta className="mt-0.5 h-6 w-6 shrink-0" />
                <p>
                  {a.titulo && <strong className="block text-lg">{a.titulo}</strong>}
                  {a.texto}
                </p>
              </div>
            ))}
          </section>
        )}

        {temIngredientes && (
          <section className="space-y-3">
            <button type="button" className="botao-principal py-3 text-lg normal-case tracking-normal" onClick={adicionarALista}>
              Adicionar estes ingredientes à lista de compras
            </button>
            <button type="button" className="botao-secundario bg-oliva text-white" onClick={salvar}>
              {salva ? 'Salvar alterações da receita' : 'Salvar receita'}
            </button>
            <a className="botao-secundario bg-cta text-white shadow-[0_4px_0_#1F7438]" href={linkWhatsapp(textoZap)} target="_blank" rel="noopener noreferrer">
              <IconeMensagem className="h-7 w-7" /> Enviar no WhatsApp
            </a>
            <button type="button" className="botao-secundario border-2 border-oliva bg-white text-oliva" onClick={() => window.print()}>
              <IconeImpressora className="h-7 w-7" /> Imprimir
            </button>
          </section>
        )}

        <section className="cartao">
          <h2 className="titulo-secao">Receitas salvas</h2>
          {salvas.length === 0 ? (
            <p className="mt-2 text-base text-stone-600">Nenhuma receita salva ainda. Elas ficam guardadas neste aparelho.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {salvas.map((s) => (
                <li key={s.id} className="flex items-center gap-2 rounded-xl bg-creme p-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-bold leading-snug">{s.nome}</p>
                    <p className="text-base text-stone-600">
                      Serve {s.serve} • {s.linhas.length} ingredientes
                    </p>
                  </div>
                  <button type="button" onClick={() => abrir(s)} className="min-h-[48px] rounded-xl bg-oliva px-4 text-base font-bold text-white">
                    Abrir
                  </button>
                  <button
                    type="button"
                    onClick={() => apagar(s)}
                    aria-label={`Apagar ${s.nome}`}
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#FDECEA] text-vermelho"
                  >
                    <IconeLixeira className="h-6 w-6" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Versão para imprimir */}
      <div className="hidden text-black print:block">
        <h1 className="font-corpo text-2xl font-extrabold">{rascunho.nome || 'Receita'}</h1>
        <p className="mb-4 text-[12pt]">
          Para {rascunho.fazerPara} {rascunho.fazerPara === 1 ? 'pessoa' : 'pessoas'} (a receita original serve {rascunho.serve})
        </p>
        <ul className="space-y-1 text-[12pt]">
          {resultados.map((r, i) => (
            <li key={rascunho.linhas[i].id}>☐ {r.texto}</li>
          ))}
        </ul>
        {avisos.length > 0 && (
          <div className="mt-5 border-t border-black pt-3 text-[12pt]">
            {avisos.map((a) => (
              <p key={a.id}>• {a.titulo ? `${a.titulo}: ` : ''}{a.texto}</p>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
