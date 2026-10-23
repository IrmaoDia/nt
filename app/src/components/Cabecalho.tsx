const CORES = ['#E5392E', '#F2C94C', '#4CC46F', '#FFF4D6'];

/** Cabeçalho com um fio de pisca-pisca e estrelinhas douradas. */
export function Cabecalho() {
  const lampadas = Array.from({ length: 12 }, (_, i) => 20 + i * 40);
  return (
    <header className="relative overflow-hidden bg-oliva pb-5 text-center text-white print:hidden">
      <svg viewBox="0 0 480 34" className="block h-[34px] w-full" preserveAspectRatio="xMidYMin slice" aria-hidden="true">
        <path
          d="M0 4Q40 26 80 4Q120 26 160 4Q200 26 240 4Q280 26 320 4Q360 26 400 4Q440 26 480 4"
          fill="none"
          stroke="#1B2F22"
          strokeWidth="2"
        />
        {lampadas.map((x, i) => (
          <g key={x} className="lampada" style={{ color: CORES[i % CORES.length] }} transform={`translate(${x} 13)`}>
            <rect x="-2.2" y="0" width="4.4" height="4" rx="1" fill="#8A7A4A" />
            <path d="M0 3.5C4.2 5 5.2 11 0 17.5-5.2 11-4.2 5 0 3.5Z" fill="currentColor" />
          </g>
        ))}
      </svg>
      <Estrela className="absolute left-[9%] top-12 h-4 w-4" />
      <Estrela className="absolute right-[10%] top-14 h-5 w-5" />
      <Estrela className="absolute left-[4%] top-[96px] h-3 w-3" />
      <h1 className="mt-1 text-[34px] font-extrabold leading-tight">Ceia Sem Erro</h1>
      <p className="mt-0.5 text-lg font-semibold text-dourado-claro">Calculadora da sua ceia</p>
    </header>
  );
}

function Estrela({ className }: { className: string }) {
  return (
    <svg viewBox="-10 -10 20 20" className={className} aria-hidden="true">
      <path d="M0-10C1-2 2-1 10 0 2 1 1 2 0 10-1 2-2 1-10 0-2-1-1-2 0-10Z" fill="#E9C95A" />
    </svg>
  );
}
