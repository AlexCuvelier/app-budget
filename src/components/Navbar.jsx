import React from 'react';

const TABS = ['Dashboard', 'Alex', 'Aurélie', 'Commun'];

export default function Navbar({ active, onNavigate }) {
  return (
    <nav style={S.nav}>
      {TABS.map((tab) => (
        <button
          key={tab}
          onClick={() => onNavigate(tab)}
          style={{ ...S.tab, ...(active === tab ? S.tabActive : {}) }}
        >
          {tab}
        </button>
      ))}
    </nav>
  );
}

const S = {
  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: '#fff',
    borderBottom: '1px solid #E5E7EB',
    display: 'flex',
    justifyContent: 'center',
  },
  tab: {
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    padding: '18px 32px',
    fontFamily: 'Poppins, sans-serif',
    fontSize: 15,
    fontWeight: 400,
    color: '#6B7280',
    cursor: 'pointer',
    transition: 'color 0.15s, border-color 0.15s',
  },
  tabActive: {
    borderBottom: '2px solid #4F46E5',
    color: '#4F46E5',
    fontWeight: 600,
  },
};
