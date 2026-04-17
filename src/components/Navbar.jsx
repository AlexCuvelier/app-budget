import React from 'react';

const TABS = ['Dashboard', 'Alex', 'Aurélie', 'Commun'];

export default function Navbar({ active, onNavigate }) {
  return (
    <nav style={styles.nav}>
      <div style={styles.brand}>Budget</div>
      <div style={styles.links}>
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => onNavigate(tab)}
            style={{
              ...styles.link,
              ...(active === tab ? styles.linkActive : {}),
            }}
          >
            {tab}
          </button>
        ))}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backgroundColor: '#fff',
    borderBottom: '1px solid #e8e8f0',
    display: 'flex',
    alignItems: 'center',
    padding: '0 32px',
    height: 60,
    gap: 32,
    boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
  },
  brand: {
    fontWeight: 700,
    fontSize: 18,
    color: '#6c63ff',
    letterSpacing: '-0.5px',
    marginRight: 16,
  },
  links: {
    display: 'flex',
    gap: 4,
  },
  link: {
    background: 'none',
    border: 'none',
    padding: '6px 16px',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    color: '#6b7280',
    transition: 'all 0.15s',
    cursor: 'pointer',
  },
  linkActive: {
    backgroundColor: '#f0eeff',
    color: '#6c63ff',
    fontWeight: 600,
  },
};
