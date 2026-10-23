import { useState, type ComponentType, type SVGProps } from 'react';
import { Contador } from '../components/Contador';
import { IconeLixeira, IconeMais, IlustracaoCaprichado, IlustracaoEconomico, IlustracaoTradicional } from '../components/Icones';
import { CARDAPIOS_PRONTOS, type CardapioPronto } from '../data/cardapios';
import { ORDEM_GRUPOS, TIPOS_DE_PRATO, buscarTipo } from '../data/tiposDePrato';
import type { Apetite, IdCardapio } from '../data/tipos';
import type { Mesa } from '../estado';
import { formatarNumero } from '../lib/formato';
import { MAX_PESSOAS, pessoasEquivalentes, type ResultadoPrato } from '../lib/mesa';
import { novoId } from '../lib/receita';

const APETITES: { id: Apetite; nome: string; detalhe: string }[] = [
  { id: 'leve', nome: 'Leve', detalhe: 'come pouco' },
  { id: 'normal', nome: 'Normal', detalhe: 'o padrão' },
  { id: 'bem-servido', nome: 'Bem servido', detalhe: 'repete o prato' },
];

const ILUSTRACOES: Record<IdCardapio, ComponentType<SVGProps<SVGSVGElement>>> = {
  economico: IlustracaoEconomico,
  tradicional: IlustracaoTradicional,
  caprichado: IlustracaoCaprichado,
};

interface Props {
  mesa: Mesa;
  setMesa: (atualizar: (m: Mesa) => Mesa) => void;
  resultados: ResultadoPrato[];
  ajustarReceita: (r: ResultadoPrato) => void;
  verCusto: () => void;
}

export function AbaMesa({ mesa, setMesa, resultados, ajustarReceita, verCusto }: Props) {
  const [mostrarGuia, setMostrarGuia] = useState(false);
  const [editando, setEditando] = useState<string | null>(null);
  const porcoes = pessoasEquivalentes(mesa.adultos, mesa.criancas, mesa.apetite);
  const semNinguem = mesa.adultos + mesa.criancas === 0;

  function usarCardapio(c: CardapioPronto) {
    if (mesa.pratos.length > 0 && !window.confirm(`Os pratos da sua mesa serão trocados pelos do cardápio ${c.nome}. Continuar?`)) return;
    setMesa((m) => ({ ...m, pratos: c.pratos.map((p) => ({ id: novoId(), tipo: p.tipo, nome: p.nome, guia: p.id })) }));
    setMostrarGuia(false);
  }

  function mudarPrato(id: string, mudanca: { tipo?: string; nome?: string }) {
    setMesa((m) => ({ ...m, pratos: m.pratos.map((p) => (p.id === id ? { ...p, ...mudanca } : p)) }));
  }

  function removerPrato(id: string) {
    setMesa((m) => ({ ...m, pratos: m.pratos.filter((p) => p.id !== id) }));
  }

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={() => setMostrarGuia((v) => !v)}
        aria-expanded={mostrarGuia}
        className="flex min-h-[60px] w-full items-center justify-center gap-2 rounded-2xl border-2 border-dourado bg-[#FFF8E1] px-3 text-base font-bold text-[#6B5208]"
      >
        <span aria-hidden="true">★</span> Usar um cardápio pronto do guia
      </button>

      {mostrarGuia && (
        <section className="cartao" aria-label="Cardápios prontos do guia">
          <h2 className="titulo-secao">Cardápios prontos do guia</h2>
          <p className="mt-2 text-base text-stone-700">
            Escolha um cardápio para preencher a mesa. Depois você pode mudar, tirar ou acrescentar pratos.
          </p>
          <div className="mt-4 space-y-3">
            {CARDAPIOS_PRONTOS.map((c) => {
              const Ilustracao = ILUSTRACOES[c.id];
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => usarCardapio(c)}
                  className="flex w-full items-start gap-4 rounded-2xl border-[3px] border-creme-escuro bg-creme p-4 text-left active:border-oliva"
                >
                  <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-white shadow-cartao">
                    <Ilustracao className="h-11 w-11" />
                  </span>
                  <span className="flex-1">
                    <span className="block font-titulo text-[22px] font-bold text-oliva-escuro">{c.nome}</span>
                    <span className="mt-1 block text-base leading-snug text-stone-700">{c.resumo}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <section className="cartao space-y-6">
        <h2 className="titulo-secao">Quem vem para a ceia?</h2>
        <Contador
          id="adultos"
          rotulo="Quantos adultos?"
          valor={mesa.adultos}
          min={0}
          max={MAX_PESSOAS}
          onChange={(adultos) => setMesa((m) => ({ ...m, adultos }))}
        />
        <Contador
          id="criancas"
          rotulo="Quantas crianças?"
          ajuda="Até 10 anos. Cada criança conta como meia porção."
          valor={mesa.criancas}
          min={0}
          max={MAX_PESSOAS}
          onChange={(criancas) => setMesa((m) => ({ ...m, criancas }))}
        />
      </section>

      <section className="cartao">
        <h2 className="titulo-secao">Apetite da turma</h2>
        <div className="mt-4 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Apetite da turma">
          {APETITES.map((a) => {
            const ativo = mesa.apetite === a.id;
            return (
              <button
                key={a.id}
                type="button"
                role="radio"
                aria-checked={ativo}
                onClick={() => setMesa((m) => ({ ...m, apetite: a.id }))}
                className={`flex min-h-[76px] flex-col items-center justify-center rounded-xl border-2 px-1 py-2 text-center leading-tight transition ${
                  ativo ? 'border-oliva bg-oliva text-white' : 'border-creme-escuro bg-creme text-grafite'
                }`}
              >
                <span className="text-base font-extrabold">{a.nome}</span>
                <span className={`mt-1 text-base ${ativo ? 'text-white' : 'text-stone-600'}`}>{a.detalhe}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-4 rounded-xl bg-oliva-claro px-4 py-3 text-base text-oliva-escuro">
          {semNinguem ? (
            'Informe quantas pessoas vão à ceia.'
          ) : (
            <>
              Vamos calcular comida para <strong>{formatarNumero(Math.round(porcoes * 10) / 10)} porções</strong> de adulto.
            </>
          )}
        </p>
      </section>

      <NovoPrato onAdicionar={(tipo, nome) => setMesa((m) => ({ ...m, pratos: [...m.pratos, { id: novoId(), tipo, nome }] }))} />

      <section>
        <h2 className="mb-3 px-1 text-2xl font-bold text-oliva-escuro">
          Sua mesa {resultados.length > 0 && <span className="font-corpo text-lg font-semibold text-stone-600">({resultados.length} {resultados.length === 1 ? 'prato' : 'pratos'})</span>}
        </h2>
        {resultados.length === 0 ? (
          <p className="cartao text-lg">
            Sua mesa ainda está vazia. Adicione os pratos que vão estar na ceia ou use um cardápio pronto do guia.
          </p>
        ) : (
          <ul className="space-y-3">
            {resultados.map((r, i) => (
              <li key={r.prato.id}>
                {(i === 0 || resultados[i - 1].tipo.grupo !== r.tipo.grupo) && (
                  <p className="mb-2 mt-4 px-1 text-base font-extrabold uppercase tracking-wide text-vermelho first:mt-0">{r.tipo.grupo}</p>
                )}
                <CartaoPrato
                  r={r}
                  semNinguem={semNinguem}
                  editando={editando === r.prato.id}
                  onEditar={() => setEditando(editando === r.prato.id ? null : r.prato.id)}
                  onMudar={(m) => mudarPrato(r.prato.id, m)}
                  onRemover={() => removerPrato(r.prato.id)}
                  onAjustar={() => ajustarReceita(r)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {resultados.length > 0 && (
        <button type="button" className="botao-principal" onClick={verCusto} disabled={semNinguem}>
          Ver lista de compras e custo →
        </button>
      )}

      <p className="px-2 pb-2 text-center text-base text-stone-600">
        As quantidades são referências de consumo e podem variar conforme o apetite da sua família.
      </p>
    </div>
  );
}

/* ------------------------------ Adicionar prato ------------------------------ */

function SeletorTipo({ id, valor, onChange }: { id: string; valor: string; onChange: (tipo: string) => void }) {
  return (
    <select
      id={id}
      value={valor}
      onChange={(e) => onChange(e.target.value)}
      className="h-14 w-full rounded-xl border-2 border-creme-escuro bg-creme px-3 text-lg font-semibold text-grafite focus:border-oliva focus:outline-none"
    >
      {ORDEM_GRUPOS.map((g) => (
        <optgroup key={g} label={g}>
          {TIPOS_DE_PRATO.filter((t) => t.grupo === g).map((t) => (
            <option key={t.id} value={t.id}>
              {t.icone} {t.nome}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}

function NovoPrato({ onAdicionar }: { onAdicionar: (tipo: string, nome: string) => void }) {
  const [tipo, setTipo] = useState(TIPOS_DE_PRATO[0].id);
  const [nome, setNome] = useState('');
  const t = buscarTipo(tipo);

  return (
    <section className="cartao">
      <h2 className="titulo-secao">Monte sua mesa</h2>
      <p className="mt-2 text-base text-stone-700">
        Escolha o tipo de cada prato. A quantidade depende do tipo, então vale para qualquer receita.
      </p>
      <form
        className="mt-4 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          onAdicionar(tipo, nome.trim());
          setNome('');
        }}
      >
        <div>
          <label htmlFor="novo-tipo" className="block text-lg font-bold">
            Tipo do prato
          </label>
          <div className="mt-2">
            <SeletorTipo id="novo-tipo" valor={tipo} onChange={setTipo} />
          </div>
          {t && <p className="mt-1 text-base text-stone-600">Ex.: {t.exemplos}</p>}
        </div>
        <div>
          <label htmlFor="novo-nome" className="block text-lg font-bold">
            Nome do prato <span className="font-normal text-stone-600">(opcional)</span>
          </label>
          <input
            id="novo-nome"
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex.: Pernil da minha mãe"
            className="mt-2 h-14 w-full rounded-xl border-2 border-creme-escuro bg-creme px-4 text-lg placeholder:text-stone-500 focus:border-oliva focus:outline-none"
          />
        </div>
        <button type="submit" className="botao-secundario bg-oliva text-white">
          <IconeMais className="h-6 w-6" /> Adicionar à mesa
        </button>
      </form>
    </section>
  );
}

/* ------------------------------ Card do prato ------------------------------ */

interface CartaoProps {
  r: ResultadoPrato;
  semNinguem: boolean;
  editando: boolean;
  onEditar: () => void;
  onMudar: (m: { tipo?: string; nome?: string }) => void;
  onRemover: () => void;
  onAjustar: () => void;
}

function CartaoPrato({ r, semNinguem, editando, onEditar, onMudar, onRemover, onAjustar }: CartaoProps) {
  const { tipo } = r;
  const outros = r.pratosNoGrupo - 1;
  const porPessoa =
    tipo.unidade === 'g' || tipo.unidade === 'ml'
      ? `cerca de ${formatarNumero(Math.round(r.porPessoaEfetivo))} ${tipo.unidade} por pessoa`
      : null;

  return (
    <article className="cartao p-4">
      <div className="flex items-center gap-3">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-creme text-3xl" aria-hidden="true">
          {tipo.icone}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-corpo text-lg font-bold leading-snug text-grafite">{r.nome}</h3>
          {r.nome !== tipo.nome && <p className="text-base text-stone-600">{tipo.nome}</p>}
        </div>
      </div>

      {editando && (
        <div className="mt-4 space-y-3 rounded-xl border-2 border-dashed border-creme-escuro p-3">
          <div>
            <label htmlFor={`nome-${r.prato.id}`} className="block text-base font-bold">
              Nome do prato
            </label>
            <input
              id={`nome-${r.prato.id}`}
              type="text"
              value={r.prato.nome}
              onChange={(e) => onMudar({ nome: e.target.value })}
              placeholder={tipo.nome}
              className="mt-1 h-12 w-full rounded-xl border-2 border-creme-escuro bg-creme px-3 text-lg focus:border-oliva focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor={`tipo-${r.prato.id}`} className="block text-base font-bold">
              Tipo do prato
            </label>
            <div className="mt-1">
              <SeletorTipo id={`tipo-${r.prato.id}`} valor={r.prato.tipo} onChange={(t) => onMudar({ tipo: t })} />
            </div>
          </div>
        </div>
      )}

      <div className="mt-3 rounded-xl bg-oliva-claro px-4 py-3">
        {semNinguem ? (
          <p className="text-lg">Informe quantas pessoas vão à ceia.</p>
        ) : r.quantidade > 0 ? (
          <>
            <p className="text-oliva-escuro">
              <span className="text-3xl font-extrabold">{r.texto}</span>
              {tipo.exibicao && <span className="text-lg font-semibold"> {tipo.exibicao}</span>}
            </p>
            {r.textoEmbalagem && <p className="mt-1 text-lg font-bold text-grafite">Compre: {r.textoEmbalagem}</p>}
            {porPessoa && <p className="mt-1 text-base text-stone-700">{porPessoa}</p>}
          </>
        ) : (
          <p className="text-lg">Só adultos entram nesta conta.</p>
        )}
      </div>

      {outros > 0 && (
        <p className="mt-2 text-base text-stone-700">
          Divide o consumo de {tipo.grupo.toLocaleLowerCase('pt-BR')} com mais {outros} {outros === 1 ? 'prato' : 'pratos'} da mesa.
        </p>
      )}

      <button type="button" onClick={onAjustar} className="botao-secundario mt-3 border-2 border-oliva bg-white px-3 text-base text-oliva">
        Ajustar a receita deste prato →
      </button>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <button type="button" onClick={onEditar} className="min-h-[48px] rounded-xl bg-creme text-base font-bold text-grafite">
          {editando ? 'Pronto' : 'Editar'}
        </button>
        <button
          type="button"
          onClick={onRemover}
          className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#FDECEA] text-base font-bold text-vermelho"
        >
          <IconeLixeira className="h-5 w-5" /> Remover
        </button>
      </div>
    </article>
  );
}
