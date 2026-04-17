import React, { useState, useEffect } from 'react';
import { saveCommun, genId } from '../utils/storage';
import { FIXED_EXPENSE_CATEGORIES } from '../utils/categories';
import { communSummary } from '../utils/calculations';

export default function CommunPage({ data, alexSalary, aurelieSalary, onChange }) {
  const [commun, setCommun] = useState(data);

  useEffect(() => {
    setCommun(data);
  }, [data]);

  function update(newCommun) {
    setCommun(newCommun);
    saveCommun(newCommun);
    onChange(newCommun);
  }

  function addExpense() {
    update({
      ...commun,
      fixedExpenses: [
        ...commun.fixedExpenses,
        { id: genId(), category: FIXED_EXPENSE_CATEGORIES[0], amount: '' },
      ],
    });
  }

  function updateExpense(id, field, val) {
    update({
      ...commun,
      fixedExpenses: commun.fixedExpenses.map((e) =>
        e.id === id ? { ...e, [field]: val } : e
      ),
    });
  }

  function removeExpense(id) {
    update({ ...commun, fixedExpenses: commun.fixedExpenses.filter((e) => e.id !== id) });
  }

  function addProject() {
    update({
      ...commun,
      projects: [
        ...commun.projects,
        { id: genId(), name: '', amount: '', isPercentage: false },
      ],
    });
  }

  function updateProject(id, field, val) {
    update({
      ...commun,
      projects: commun.projects.map((p) =>
        p.id === id ? { ...p, [field]: val } : p
      ),
    });
  }

  function removeProject(id) {
    update({ ...commun, projects: commun.projects.filter((p) => p.id !== id) });
  }

  const summary = communSummary(commun);
  const alexPct = alexSalary > 0
    ? ((parseFloat(commun.alexContribution) || 0) / alexSalary * 100).toFixed(1)
    : null;
  const aureliePct = aurelieSalary > 0
    ? ((parseFloat(commun.aurelieContribution) || 0) / aurelieSalary * 100).toFixed(1)
    : null;

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Commun</h1>

      <div style={styles.cards}>
        <SummaryCard label="Total disponible" value={summary.total} color="#6c63ff" />
        <SummaryCard label="Charges communes" value={summary.charges} color="#ef476f" />
        <SummaryCard label="Projets / Épargne" value={summary.savings} color="#43d9ad" />
        <SummaryCard label="Disponible" value={summary.available} color={summary.available >= 0 ? '#06d6a0' : '#ef476f'} />
      </div>

      {/* Contributions */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Contributions mensuelles</h2>
        <div style={styles.contributionsGrid}>
          <ContribInput
            label="Alex vire"
            value={commun.alexContribution}
            pct={alexPct}
            onChange={(v) => update({ ...commun, alexContribution: v })}
          />
          <ContribInput
            label="Aurélie vire"
            value={commun.aurelieContribution}
            pct={aureliePct}
            onChange={(v) => update({ ...commun, aurelieContribution: v })}
          />
        </div>
        <div style={styles.totalBar}>
          <span style={styles.totalLabel}>Total commun</span>
          <span style={styles.totalValue}>{formatEur(summary.total)}</span>
        </div>
      </div>

      {/* Fixed expenses */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Charges fixes communes</h2>
          <AddButton onClick={addExpense} />
        </div>
        {commun.fixedExpenses.length === 0 && (
          <p style={styles.empty}>Aucune charge commune</p>
        )}
        {commun.fixedExpenses.map((e) => (
          <div key={e.id} style={styles.itemRow}>
            <select
              value={e.category}
              onChange={(v) => updateExpense(e.id, 'category', v.target.value)}
              style={{ ...styles.select, flex: 2 }}
            >
              {FIXED_EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="0"
              value={e.amount}
              onChange={(v) => updateExpense(e.id, 'amount', v.target.value)}
              style={{ ...styles.input, flex: 1 }}
            />
            <span style={styles.currency}>€</span>
            <RemoveButton onClick={() => removeExpense(e.id)} />
          </div>
        ))}
        {commun.fixedExpenses.length > 0 && (
          <div style={styles.subtotal}>
            <span>Total charges</span>
            <strong>{formatEur(summary.charges)}</strong>
          </div>
        )}
      </div>

      {/* Projects */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionTitle}>Projets et épargne</h2>
            <p style={styles.sectionSubtitle}>
              Base : {formatEur(summary.afterCharges)} (après charges)
            </p>
          </div>
          <AddButton onClick={addProject} />
        </div>
        {commun.projects.length === 0 && (
          <p style={styles.empty}>Aucun projet</p>
        )}
        {commun.projects.map((p) => {
          const resolved = p.isPercentage
            ? (summary.afterCharges * (parseFloat(p.amount) || 0)) / 100
            : parseFloat(p.amount) || 0;
          return (
            <div key={p.id} style={styles.itemRow}>
              <input
                type="text"
                placeholder="Nom du projet"
                value={p.name}
                onChange={(v) => updateProject(p.id, 'name', v.target.value)}
                style={{ ...styles.input, flex: 2 }}
              />
              <input
                type="number"
                placeholder="0"
                value={p.amount}
                onChange={(v) => updateProject(p.id, 'amount', v.target.value)}
                style={{ ...styles.input, flex: 1 }}
              />
              <select
                value={p.isPercentage ? 'pct' : 'fixed'}
                onChange={(v) => updateProject(p.id, 'isPercentage', v.target.value === 'pct')}
                style={styles.select}
              >
                <option value="fixed">€</option>
                <option value="pct">%</option>
              </select>
              {p.isPercentage && p.amount && (
                <span style={styles.computed}>= {formatEur(resolved)}</span>
              )}
              <RemoveButton onClick={() => removeProject(p.id)} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ContribInput({ label, value, pct, onChange }) {
  return (
    <div style={styles.contribBox}>
      <p style={styles.contribLabel}>{label}</p>
      <div style={styles.contribRow}>
        <input
          type="number"
          placeholder="0"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          style={styles.contribInput}
        />
        <span style={styles.currency}>€</span>
      </div>
      {pct !== null && (
        <p style={styles.contribPct}>{pct}% du salaire</p>
      )}
    </div>
  );
}

function SummaryCard({ label, value, color }) {
  return (
    <div style={{ ...styles.card, borderTop: `3px solid ${color}` }}>
      <p style={styles.cardLabel}>{label}</p>
      <p style={{ ...styles.cardValue, color }}>{formatEur(value)}</p>
    </div>
  );
}

function AddButton({ onClick }) {
  return (
    <button onClick={onClick} style={styles.addBtn}>+ Ajouter</button>
  );
}

function RemoveButton({ onClick }) {
  return (
    <button onClick={onClick} style={styles.removeBtn}>×</button>
  );
}

function formatEur(val) {
  const n = parseFloat(val) || 0;
  return n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
}

const styles = {
  page: { maxWidth: 800, margin: '0 auto', padding: '32px 24px 64px' },
  title: { fontSize: 28, fontWeight: 700, marginBottom: 24, color: '#1a1a2e' },
  cards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: 16,
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: '16px 20px',
    boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
  },
  cardLabel: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: 6,
  },
  cardValue: { fontSize: 22, fontWeight: 700 },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: '24px',
    marginBottom: 20,
    boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: 600, color: '#1a1a2e', marginBottom: 16 },
  sectionSubtitle: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  contributionsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 },
  contribBox: {
    backgroundColor: '#f8f9fb',
    borderRadius: 10,
    padding: '16px',
  },
  contribLabel: { fontSize: 13, fontWeight: 600, color: '#6b7280', marginBottom: 8 },
  contribRow: { display: 'flex', alignItems: 'center', gap: 8 },
  contribInput: {
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: 18,
    fontWeight: 600,
    width: '100%',
    outline: 'none',
    backgroundColor: '#fff',
  },
  contribPct: { fontSize: 12, color: '#6c63ff', fontWeight: 600, marginTop: 6 },
  totalBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0eeff',
    borderRadius: 8,
    padding: '10px 16px',
  },
  totalLabel: { fontSize: 14, fontWeight: 600, color: '#6c63ff' },
  totalValue: { fontSize: 18, fontWeight: 700, color: '#6c63ff' },
  itemRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 },
  input: {
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: '8px 12px',
    fontSize: 14,
    outline: 'none',
    minWidth: 0,
  },
  select: {
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: '8px 10px',
    fontSize: 13,
    backgroundColor: '#fff',
    outline: 'none',
    minWidth: 0,
  },
  currency: { fontSize: 14, color: '#6b7280', fontWeight: 500, flexShrink: 0 },
  computed: { fontSize: 12, color: '#6c63ff', fontWeight: 600, whiteSpace: 'nowrap' },
  subtotal: {
    display: 'flex',
    justifyContent: 'space-between',
    borderTop: '1px solid #f0f0f5',
    paddingTop: 10,
    marginTop: 4,
    fontSize: 14,
    color: '#6b7280',
  },
  addBtn: {
    backgroundColor: '#f0eeff',
    color: '#6c63ff',
    border: 'none',
    borderRadius: 8,
    padding: '7px 14px',
    fontSize: 13,
    fontWeight: 600,
    flexShrink: 0,
  },
  removeBtn: {
    background: 'none',
    border: '1px solid #e5e7eb',
    borderRadius: 6,
    width: 28,
    height: 28,
    fontSize: 16,
    color: '#9ca3af',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    lineHeight: 1,
  },
  empty: { fontSize: 13, color: '#9ca3af', fontStyle: 'italic' },
};
