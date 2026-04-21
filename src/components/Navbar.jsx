import React from 'react';

const TABS = ['Dashboard', 'Alex', 'Aurélie', 'Commun'];

const P = {
  bg:     '#FAFAF7',
  ink:    '#1A1A1A',
  muted:  '#6B6B6B',
  border: '#E8E8E3',
  violet: 'oklch(0.58 0.24 295)',
};

export default function Navbar({ active, onNavigate }) {
  return (
    <nav style={S.nav}>
      <div style={S.top}>
        <span style={S.brand}>Budget</span>
        <div style={S.avatar}>A&A</div>
      </div>
      <div style={S.tabs}>
        {TABS.map((tab) => {
          const isActive = active === tab;
          return (
            <button
              key={tab}
              onClick={() => onNavigate(tab)}
              style={{ ...S.tab, ...(isActive ? S.tabActive : {}) }}
            >
              {tab}
              {isActive && <div style={S.underline} />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

const S = {
  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: P.bg,
    borderBottom: `0.5px solid ${P.border}`,
  },
  top: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 20px 4px',
  },
  brand: {
    fontFamily: 'Poppins, sans-serif',
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: '0.14em',
    color: P.ink,
    textTransform: 'uppercase',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: '50%',
    background: 'oklch(0.95 0.05 295)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Poppins, sans-serif',
    fontSize: 10,
    fontWeight: 600,
    color: P.violet,
    letterSpacing: '0.02em',
  },
  tabs: {
    display: 'flex',
    padding: '0 12px',
  },
  tab: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    padding: '12px 4px 14px',
    fontFamily: 'Poppins, sans-serif',
    fontSize: 13,
    fontWeight: 400,
    color: P.muted,
    cursor: 'pointer',
    position: 'relative',
    textAlign: 'center',
  },
  tabActive: {
    fontWeight: 600,
    color: P.ink,
  },
  underline: {
    position: 'absolute',
    left: '50%',
    bottom: 0,
    transform: 'translateX(-50%)',
    width: 24,
    height: 2,
    borderRadius: 2,
    background: P.ink,
  },
};
