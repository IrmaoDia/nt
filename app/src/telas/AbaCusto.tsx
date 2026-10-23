import { useMemo, useState } from 'react';
import { CampoPreco } from '../components/CampoPreco';
import { IconeImpressora, IconeLixeira, IconeMais, IconeMensagem } from '../components/Icones';
import { ALTURA_NAV } from '../components/NavInferior';
import { TROCAS_QUE_ECONOMIZAM } from '../data/trocas';
import { textoPessoas, type Mesa } from '../estado';
import {
  UNIDADES_LIVRES,
  agruparPorCategoria,
  calcularCusto,
  entradaDeIngrediente,
  entradaLivre,
  entradasDaMesa,
  linkWhatsapp,
  montarLista,
  textoListaWhatsapp,
  type ItemLista,
  type ItemLivre,
  type ReceitaNaLista,
  type UnidadeLivre,
} from '../lib/custo';
import { formatarReais } from '../lib/formato';
import type { ResultadoPrato } from '../lib/mesa';
import { lerQuantidade, novoId } from '../lib/receita';

interface Props {
  mesa: Mesa;
  resultados: ResultadoPrato[];
  receitas: ReceitaNaLista[];
  setReceitas: (atualizar: (r: ReceitaNaLista[]) => ReceitaNaLista[]) => void;
  livres: ItemLivre[];
  setLivres: (atualizar: (l: ItemLivre[]) => ItemLivre[]) => void;
  precos: Record<string, number>;
  setPrecos: (atualizar: (p: Record<string, number>) => Record<string, number>) => void;
  comprados: string[];
  setComprados: (atualizar: (c: string[]) => string[]) => void;
  irParaMesa: () => void;
}

export function AbaCusto(props: Props) {
  const { mesa, resultados, receitas, setReceitas, livres, setLivres, precos, setPrecos, comprados, setComprados } = props;
  const pessoas = mesa.adultos + mesa.criancas;

  const itens = useMemo(() => {
    const substituidos = new Set(receitas.map((r) => r.pratoMesaId).filter((id): id is string => Boolean(id)));
    return montarLista([
      ...entradasDaMesa(resultados, substituidos),
      ...receitas.flatMap((r) => r.itens.map((i) => entradaDeIngrediente(i, r.nome || 'Receita'))),
      ...livres.map(entradaLivre),
    ]);
  }, [resultados, receitas, livres]);

  const custo = calcularCusto(itens, precos, pessoas);
  const grupos = agruparPorCategoria(itens);
  const resumo = `Ceia para ${textoPessoas(pessoas)} • ${resultados.length} ${resultados.length === 1 ? 'prato' : 'pratos'} na mesa`;

  function mudarPreco(chave: string, valor: number | undefined) {
    setPrecos((p) => {
      const novo = { ...p };
      if (valor === undefined) delete novo[chave];
      else novo[chave] = valor;
      return novo;
    });
  }

  function limparPrecos() {
    if (window.confirm('Apagar todos os preços anotados?')) setPrecos(() => ({}));
  }

  function limparAdicionados() {
    if (window.confirm('Tirar da lista as receitas e os itens que você adicionou? Os pratos da Mesa continuam.')) {
      setReceitas(() => []);
      setLivres(() => []);
      setComprados(() => []);
    }
  }

  return (
    <>
      <div className="space-y-5 print:hidden">
        <section className="rounded-2xl bg-oliva-claro px-5 py-4">
          <p className="font-titulo text-[22px] font-bold leading-snug text-oliva-escuro">{resumo}</p>
          <p className="mt-1 text-base text-oliva-escuro">
            {itens.length} {itens.length === 1 ? 'item' : 'itens'} na lista
            {receitas.length > 0 && ` • ${receitas.length} ${receitas.length === 1 ? 'receita' : 'receitas'}`}
          </p>
        </section>

        {receitas.length > 0 && (
          <section className="cartao p-4">
            <h2 className="font-corpo text-lg font-bold">Receitas na lista</h2>
            <p className="text-base text-stone-600">Os ingredientes delas entram no lugar do prato da Mesa.</p>
            <ul className="mt-2 space-y-2">
              {receitas.map((r) => (
                <li key={r.id} className="flex items-center gap-2 rounded-xl bg-creme py-1 pl-3 pr-1">
                  <span className="flex-1 text-base">
                    <strong>{r.nome || 'Receita'}</strong> • para {r.pessoas}
                  </span>
                  <button
                    type="button"
                    aria-label={`Tirar ${r.nome} da lista`}
                    onClick={() => setReceitas((rs) => rs.filter((x) => x.id !== r.id))}
                    className="grid h-11 w-11 place-items-center rounded-lg text-vermelho"
                  >
                    <IconeLixeira className="h-5 w-5" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {itens.length === 0 ? (
          <div className="cartao text-center">
            <h2 className="titulo-secao">Sua lista está vazia</h2>
            <p className="mt-3 text-lg">Monte sua mesa, adicione os ingredientes de uma receita ou um item abaixo.</p>
            <button type="button" className="botao-principal mt-5" onClick={props.irParaMesa}>
              Montar minha mesa →
            </button>
          </div>
        ) : (
          <>
            <p className="px-1 text-base text-stone-700">
              Toque em <strong>Comprei</strong> para riscar o item. Anote o preço do seu mercado para ver o total da ceia.
            </p>
            {grupos.map((g) => (
              <section key={g.categoria}>
                <h2 className="mb-1 px-1 text-2xl font-bold text-oliva-escuro">{g.categoria}</h2>
                {g.categoria === 'Pratos da mesa' && (
                  <p className="mb-3 px-1 text-base text-stone-600">
                    Pratos para fazer ou comprar prontos. Em “Ajustar a receita deste prato”, você troca o prato pelos ingredientes.
                  </p>
                )}
                <ul className="mt-2 space-y-3">
                  {g.itens.map((i) => (
                    <CartaoItem
                      key={i.chave}
                      item={i}
                      preco={precos[i.chave]}
                      subtotal={custo.subtotais[i.chave]}
                      comprado={comprados.includes(i.chave)}
                      onComprado={() => setComprados((c) => (c.includes(i.chave) ? c.filter((x) => x !== i.chave) : [...c, i.chave]))}
                      onPreco={(v) => mudarPreco(i.chave, v)}
                      onRemover={i.soLivre ? () => setLivres((l) => l.filter((x) => !i.idsLivres.includes(x.id))) : undefined}
                    />
                  ))}
                </ul>
              </section>
            ))}
          </>
        )}

        <NovoItem onAdicionar={(item) => setLivres((l) => [...l, item])} />

        <section className="rounded-2xl border-2 border-dourado bg-[#FFF8E1] p-5">
          <h2 className="titulo-secao text-[#5A4507]">Trocas que economizam</h2>
          <ul className="mt-3 space-y-2">
            {TROCAS_QUE_ECONOMIZAM.map((t) => (
              <li key={t.caro} className="text-base leading-snug text-[#3F3006]">
                <strong>{t.caro}</strong> → {t.troca}
              </li>
            ))}
          </ul>
        </section>

        {itens.length > 0 && (
          <section className="space-y-3 pt-1">
            <a
              className="botao-secundario bg-cta text-white shadow-[0_4px_0_#1F7438]"
              href={linkWhatsapp(textoListaWhatsapp(itens, custo, resumo))}
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconeMensagem className="h-7 w-7" /> Enviar lista no WhatsApp
            </a>
            <button type="button" className="botao-secundario bg-oliva text-white" onClick={() => window.print()}>
              <IconeImpressora className="h-7 w-7" /> Imprimir
            </button>
            <button type="button" className="botao-secundario border-2 border-vermelho bg-white text-vermelho" onClick={limparPrecos}>
              <IconeLixeira className="h-6 w-6" /> Limpar preços
            </button>
            {(receitas.length > 0 || livres.length > 0) && (
              <button type="button" className="botao-secundario border-2 border-vermelho bg-white text-vermelho" onClick={limparAdicionados}>
                <IconeLixeira className="h-6 w-6" /> Limpar receitas e itens adicionados
              </button>
            )}
          </section>
        )}
      </div>

      {itens.length > 0 && <BarraTotal total={custo.total} porPessoa={custo.porPessoa} semPreco={custo.semPreco} />}
      <Impressao resumo={resumo} itens={itens} subtotais={custo.subtotais} total={custo.total} />
    </>
  );
}

/* ------------------------------ Item ------------------------------ */

interface ItemProps {
  item: ItemLista;
  preco: number | undefined;
  subtotal: number | undefined;
  comprado: boolean;
  onComprado: () => void;
  onPreco: (v: number | undefined) => void;
  onRemover?: () => void;
}

function CartaoItem({ item, preco, subtotal, comprado, onComprado, onPreco, onRemover }: ItemProps) {
  const id = item.chave.replace(/[^a-z0-9]+/gi, '-');
  return (
    <li className={`rounded-2xl border-2 bg-white p-4 shadow-cartao ${comprado ? 'border-cta/60 bg-[#F3FAF5]' : 'border-transparent'}`}>
      <div className="flex items-start gap-3">
        <label htmlFor={`comprei-${id}`} className="flex min-h-[56px] w-16 shrink-0 cursor-pointer flex-col items-center gap-1">
          <input id={`comprei-${id}`} type="checkbox" checked={comprado} onChange={onComprado} className="h-8 w-8 cursor-pointer accent-cta" />
          <span className="text-base font-semibold text-stone-700">Comprei</span>
        </label>
        <div className="min-w-0 flex-1">
          <p className={`text-lg font-bold leading-snug ${comprado ? 'text-stone-500 line-through' : 'text-grafite'}`}>{item.nome}</p>
          {item.texto && <p className={`text-xl font-extrabold ${comprado ? 'text-stone-500 line-through' : 'text-oliva'}`}>{item.texto}</p>}
          <p className="mt-0.5 text-base leading-snug text-stone-600">Para: {item.origens.join(', ')}</p>
        </div>
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <CampoPreco id={`preco-${id}`} rotulo={item.rotuloPreco} valor={preco} onChange={onPreco} />
        <div className="text-right">
          <span className="block text-base text-stone-600">Subtotal</span>
          <strong className="text-xl text-grafite">{subtotal ? formatarReais(subtotal) : '—'}</strong>
        </div>
      </div>
      {onRemover && (
        <button type="button" onClick={onRemover} className="mt-3 flex min-h-[44px] items-center gap-2 text-base font-bold text-vermelho">
          <IconeLixeira className="h-5 w-5" /> Remover item
        </button>
      )}
    </li>
  );
}

/* ------------------------------ Item livre ------------------------------ */

function NovoItem({ onAdicionar }: { onAdicionar: (i: ItemLivre) => void }) {
  const [nome, setNome] = useState('');
  const [qtd, setQtd] = useState('1');
  const [unidade, setUnidade] = useState<UnidadeLivre>('unidade');
  const quantidade = lerQuantidade(qtd);
  const valido = nome.trim() !== '' && quantidade !== null && !quantidade.resto && quantidade.valor > 0;

  return (
    <section className="cartao">
      <h2 className="titulo-secao">Adicionar um item</h2>
      <p className="mt-1 text-base text-stone-600">Para o que não está na mesa, como guardanapos ou gelo.</p>
      <form
        className="mt-4 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!valido || !quantidade) return;
          onAdicionar({ id: novoId(), nome: nome.trim(), quantidade: quantidade.valor, unidade });
          setNome('');
          setQtd('1');
        }}
      >
        <div>
          <label htmlFor="item-nome" className="block text-lg font-bold">
            Nome do item
          </label>
          <input
            id="item-nome"
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex.: Guardanapos"
            className="mt-1 h-14 w-full rounded-xl border-2 border-creme-escuro bg-creme px-4 text-lg placeholder:text-stone-500 focus:border-oliva focus:outline-none"
          />
        </div>
        <div className="flex gap-3">
          <div className="w-28">
            <label htmlFor="item-qtd" className="block text-lg font-bold">
              Quantidade
            </label>
            <input
              id="item-qtd"
              type="text"
              inputMode="decimal"
              value={qtd}
              onChange={(e) => setQtd(e.target.value)}
              className="mt-1 h-14 w-full rounded-xl border-2 border-creme-escuro bg-creme px-3 text-center text-lg font-bold focus:border-oliva focus:outline-none"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="item-unidade" className="block text-lg font-bold">
              Unidade
            </label>
            <select
              id="item-unidade"
              value={unidade}
              onChange={(e) => setUnidade(e.target.value as UnidadeLivre)}
              className="mt-1 h-14 w-full rounded-xl border-2 border-creme-escuro bg-creme px-3 text-lg focus:border-oliva focus:outline-none"
            >
              {UNIDADES_LIVRES.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.rotulo}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button type="submit" disabled={!valido} className="botao-secundario bg-oliva text-white disabled:opacity-50">
          <IconeMais className="h-6 w-6" /> Adicionar à lista
        </button>
      </form>
    </section>
  );
}

/* ------------------------------ Rodapé e impressão ------------------------------ */

function BarraTotal({ total, porPessoa, semPreco }: { total: number; porPessoa: number; semPreco: number }) {
  return (
    <div
      className="fixed inset-x-0 z-20 mx-auto max-w-[480px] bg-oliva-escuro px-4 py-3 text-white shadow-[0_-6px_16px_rgba(0,0,0,.18)] print:hidden"
      style={{ bottom: `calc(${ALTURA_NAV}px + env(safe-area-inset-bottom))` }}
      aria-live="polite"
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-lg font-bold">
          Total da ceia: <span className="whitespace-nowrap text-2xl font-extrabold">{formatarReais(total)}</span>
        </p>
        <p className="whitespace-nowrap text-base">
          por pessoa: <strong>{formatarReais(porPessoa)}</strong>
        </p>
      </div>
      {semPreco > 0 && (
        <p className="text-base text-dourado-claro">
          {semPreco} {semPreco === 1 ? 'item sem preço' : 'itens sem preço'}
        </p>
      )}
    </div>
  );
}

function Impressao({ resumo, itens, subtotais, total }: { resumo: string; itens: ItemLista[]; subtotais: Record<string, number>; total: number }) {
  const celula = 'border border-black px-2 py-1.5 text-left align-top';
  return (
    <div className="hidden text-black print:block">
      <h1 className="font-corpo text-2xl font-extrabold">Lista de compras – Ceia Sem Erro</h1>
      <p className="mb-4 text-[12pt]">{resumo}</p>
      <table className="w-full border-collapse text-[12pt]">
        <thead>
          <tr>
            <th className={`${celula} w-[46%]`}>Item</th>
            <th className={`${celula} w-[28%]`}>Quantidade</th>
            <th className={`${celula} w-[18%]`}>Preço</th>
            <th className={`${celula} w-[8%] text-center`}>✓</th>
          </tr>
        </thead>
        <tbody>
          {agruparPorCategoria(itens).map((g) => [
            <tr key={g.categoria} className="break-inside-avoid">
              <td colSpan={4} className={`${celula} font-extrabold uppercase`}>
                {g.categoria}
              </td>
            </tr>,
            ...g.itens.map((i) => (
              <tr key={i.chave} className="break-inside-avoid">
                <td className={celula}>{i.nome}</td>
                <td className={celula}>{i.texto}</td>
                <td className={celula}>{subtotais[i.chave] ? formatarReais(subtotais[i.chave]) : ''}</td>
                <td className={`${celula} text-center`}>☐</td>
              </tr>
            )),
          ])}
          <tr>
            <td colSpan={2} className={`${celula} font-extrabold`}>
              Total da ceia
            </td>
            <td colSpan={2} className={`${celula} font-extrabold`}>
              {total > 0 ? formatarReais(total) : ''}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
