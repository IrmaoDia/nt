import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement>;

const linha = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function IconeCalculadora(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...linha} {...p}>
      <rect x="4" y="2.5" width="16" height="19" rx="2.5" />
      <rect x="7" y="5.5" width="10" height="4" rx="1" />
      <path d="M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01M16 17h.01" strokeWidth="2.6" />
    </svg>
  );
}

export function IconeLista(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...linha} {...p}>
      <path d="M3 4h2l2.4 11.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.1L21 8H6.2" />
      <circle cx="9.5" cy="20" r="1.3" />
      <circle cx="17" cy="20" r="1.3" />
    </svg>
  );
}

export function IconeForno(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...linha} {...p}>
      <rect x="3" y="3" width="18" height="18" rx="2.5" />
      <path d="M3 8h18" />
      <rect x="6.5" y="11" width="11" height="7" rx="1.2" />
      <path d="M7 5.5h.01M10 5.5h.01M13 5.5h.01" strokeWidth="2.6" />
    </svg>
  );
}

export function IconeMesa(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...linha} {...p}>
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="3" />
      <path d="M3 4v5a1.5 1.5 0 0 0 1.5 1.5v9.5M3 4v4M6 4v5a1.5 1.5 0 0 1-1.5 1.5M21 4c-1.5 1-2 3-2 6h2v10" />
    </svg>
  );
}

export function IconeReceita(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...linha} {...p}>
      <path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5z" />
      <path d="M5 19.5A1.5 1.5 0 0 0 6.5 21H19v-3" />
      <path d="M9 7.5h6M9 11h6" />
    </svg>
  );
}

export function IconeMais(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...linha} strokeWidth={3} {...p}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconeMenos(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...linha} strokeWidth={3} {...p}>
      <path d="M5 12h14" />
    </svg>
  );
}

export function IconeCheck(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...linha} strokeWidth={3} {...p}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

export function IconeMensagem(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...linha} {...p}>
      <path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.6-5.2A8.5 8.5 0 1 1 21 11.5z" />
      <path d="M8.5 11.5h.01M12.5 11.5h.01M16.5 11.5h.01" strokeWidth="2.6" />
    </svg>
  );
}

export function IconeImpressora(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...linha} {...p}>
      <path d="M6 9V3h12v6" />
      <rect x="3" y="9" width="18" height="8" rx="2" />
      <path d="M6 14h12v7H6z" />
    </svg>
  );
}

export function IconeLixeira(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...linha} {...p}>
      <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
    </svg>
  );
}

export function IconeTermometro(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...linha} {...p}>
      <path d="M14 14.8V5a2 2 0 0 0-4 0v9.8a4 4 0 1 0 4 0z" />
      <path d="M12 9v8" />
    </svg>
  );
}

export function IconeAlerta(p: P) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...linha} {...p}>
      <path d="M12 3l9.5 17h-19z" />
      <path d="M12 10v4.5M12 17.5h.01" strokeWidth="2.6" />
    </svg>
  );
}

/* ---------- Ilustrações coloridas (cardápios e carnes) ---------- */

export function IlustracaoEconomico(p: P) {
  // Cofrinho com moeda
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" {...p}>
      <circle cx="30" cy="9" r="6" fill="#C9A227" stroke="#8C6C10" strokeWidth="1.5" />
      <path d="M30 6.5v5" stroke="#8C6C10" strokeWidth="1.6" strokeLinecap="round" />
      <ellipse cx="23" cy="28" rx="15" ry="11" fill="#E8838A" />
      <path d="M36 25l6-3-1 7z" fill="#E8838A" />
      <rect x="13" y="35" width="4" height="7" rx="1.5" fill="#D06A72" />
      <rect x="27" y="35" width="4" height="7" rx="1.5" fill="#D06A72" />
      <rect x="18" y="17.5" width="9" height="2.4" rx="1.2" fill="#B3261E" />
      <circle cx="32" cy="26" r="1.6" fill="#2B2B2B" />
      <ellipse cx="9" cy="29" rx="3" ry="2.6" fill="#D06A72" />
    </svg>
  );
}

export function IlustracaoTradicional(p: P) {
  // Pernil na travessa
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" {...p}>
      <ellipse cx="24" cy="36" rx="21" ry="6.5" fill="#C9A227" />
      <ellipse cx="24" cy="35" rx="17" ry="4.5" fill="#FBF6EE" />
      <path d="M8 32c0-10 7-17 16-17 7 0 12 4.5 12 9.5 0 5-4.5 8-11 8z" fill="#A0522D" />
      <path d="M13 26c2-4.5 6-7 10.5-7" fill="none" stroke="#D98A4E" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M34 18l6-4.5" stroke="#EDE3D0" strokeWidth="3.6" strokeLinecap="round" />
      <circle cx="41.5" cy="12.5" r="2.6" fill="#EDE3D0" />
      <path d="M30 13.5l-2-4.5M33 14l1.5-4.5" stroke="#2F4F3A" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="31.5" cy="15" r="1.8" fill="#B3261E" />
    </svg>
  );
}

export function IlustracaoCaprichado(p: P) {
  // Estrela dourada com laço
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" {...p}>
      <path
        d="M24 4l5.6 11.4 12.6 1.8-9.1 8.9 2.1 12.5L24 32.7l-11.2 5.9 2.1-12.5-9.1-8.9 12.6-1.8z"
        fill="#C9A227"
        stroke="#8C6C10"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M24 38c-3-3.5-8-4-9 0s5 4 9 0zM24 38c3-3.5 8-4 9 0s-5 4-9 0z" fill="#B3261E" />
      <path d="M22.5 39l-3 6M25.5 39l3 6" stroke="#B3261E" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="24" cy="38" r="2.2" fill="#8E1C16" />
    </svg>
  );
}

export function IlustracaoFrango(p: P) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" {...p}>
      <ellipse cx="24" cy="38" rx="20" ry="5.5" fill="#C9A227" />
      <path d="M8 33c-1-9 6-17 16-17s17 7 16 16c-.3 2.5-2.5 3-5 3H13c-2.5 0-4.8-.5-5-2z" fill="#C8792F" />
      <path d="M14 25c2-3.5 5.5-5.5 9.5-5.5" fill="none" stroke="#E9A75E" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M36 21l5-6M12 21l-5-6" stroke="#EDE3D0" strokeWidth="3.2" strokeLinecap="round" />
      <circle cx="41.5" cy="14" r="2.3" fill="#EDE3D0" />
      <circle cx="6.5" cy="14" r="2.3" fill="#EDE3D0" />
    </svg>
  );
}

export function IlustracaoTender(p: P) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" {...p}>
      <ellipse cx="24" cy="38" rx="20" ry="5.5" fill="#C9A227" />
      <path d="M7 32c0-11 8-19 17-19s17 8 17 19c0 2-1.5 3-3.5 3h-27C8.5 35 7 34 7 32z" fill="#C0602A" />
      <path d="M13 22l14 12M20 17l15 13M12 30l12-13M20 33l13-14M30 34l8-8" stroke="#E9A75E" strokeWidth="1.6" />
      <circle cx="18" cy="24" r="1.5" fill="#5B2A12" />
      <circle cx="27" cy="21" r="1.5" fill="#5B2A12" />
      <circle cx="31" cy="28" r="1.5" fill="#5B2A12" />
      <circle cx="21" cy="30" r="1.5" fill="#5B2A12" />
    </svg>
  );
}

export function IlustracaoLombo(p: P) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" {...p}>
      <ellipse cx="24" cy="38" rx="20" ry="5.5" fill="#C9A227" />
      <rect x="6" y="18" width="34" height="16" rx="8" fill="#B5652E" />
      <ellipse cx="38" cy="26" rx="5" ry="8" fill="#F2C9A8" stroke="#B5652E" strokeWidth="2" />
      <path d="M13 18v16M20 18v16M27 18v16" stroke="#7A3B14" strokeWidth="1.8" />
      <path d="M11 23c3-2 7-2.5 11-2" stroke="#D98A4E" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}
