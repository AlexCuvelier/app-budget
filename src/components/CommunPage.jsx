import React, { useState, useEffect } from 'react';
import { saveCommun, genId } from '../utils/storage';
import {
  FIXED_EXPENSE_CATEGORIES_COMMUN,
  PROJECT_CATEGORIES,
} from '../utils/categories';
import { communSummary, resolveAllocation } from '../utils/calculations';

const fmt = (n) =>
  (parseFloat(n) || 0).toLocaleString('fr-CA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + ' $';

export default function CommunPage({ data, alexSalary, aurelieSalary, onChange }) {
  const [commun, setCommun] = useState(data);

  useEffect(() => { setCommun(data); }, [data]);

  function update(next) {
    setCommun(next);
    saveCommun(next);
    onChange(next);
  }

  function setContrib(key, val) {
    update({ ...commun, contributions: { ...commun.contributions, [key]: val } });
  }

  function addExpense() {
    update({
      ...commun,
      fixedExpenses: [
        ...commun.fixedExpenses,
        { id: genId(), category: FIXED_EXPENSE_CATEGORIES_COMMUN[0], amount: '' },
      ],
    });
  }
  function updateExpense(id, field, val) {
    update({
      ...commun,
      fixedExpenses: commun.fixedExpenses.map((e) => (e.id === id ? { ...e, [field]: val } : e)),
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
        { id: genId(), category: PROJECT_CATEGORIES[0], type: 'fixed', value: '' },
      ],
    });
  }
  function updateProject(id, field, val) {
    update({
      ...commun,
      projects: commun.projects.map((p) => (p.id === id ? { ...p, [field]: val } : p)),
    });
  }
  function removeProject(id) {
    update({ ...commun, projects: commun.projects.filter((p) => p.id !== id) });
  }

  const sum = communSummary(commun);
  const c = commun.contributions || {};

  const alexPct =
    alexSalary > 0
      ? ((parseFloat(c.alex) || 0) / alexSalary * 100).toFixed(1)
      : null;
  const aureliePct =
    aurelieSalary > 0
      ? ((parseFloat(c.aurelie) || 0) / aurelieSalary * 100).toFixed(1)
      : null;

  return (
    <div style={S.page}>
      <h1 style={S.h1}>Commun</h1>

      <div style={S.cards}>
        <Card label="Total apports" value={sum.totalContributions} color="#4F46E5" />
        <Card label="Charges fixes" value={sum.charges} color="#EF4444" />
        <Card label="Projets / Épargne" value={sum.savings} color="#10B981" />
        <Card
          label="Disponible"
          value={sum.available}
          color={sum.available >= 0 ? '#10B981' : '#EF4444'}
        />
      </div>

      {/* Apports mensuels */}
      <div style={S.section}>
        <h2 style={{ ...S.h2, marginBottom: 20 }}>Apports mensuels</h2>
        <div style={S.contribGrid}>
          <ContribBox
            label="Alex"
            value={c.alex}
            pct={alexPct}
            onChange={(v) => setContrib('alex', v)}
          />
          <ContribBox
            label="Aurélie"
            value={c.aurelie}
            pct={aureliePct}
            onChange={(v) => setContrib('aurelie', v)}
          />
          <ContribBox
            label="So We Left"
            value={c.soWeLeft}
            onChange={(v) => setContrib('soWeLeft', v)}
          />
        </div>
        <div style={S.totalBar}>
          <span style={S.totalLabel}>Total commun</span>
          <span style={S.totalValue}>{fmt(sum.totalContributions)}</span>
        </div>
      </div>

      {/* Charges fixes communes */}
      <div style={S.section}>
        <div style={S.sectionHead}>
          <h2 style={S.h2}>Charges fixes communes</h2>
          <Btn onClick={addExpense}>+ Ajouter</Btn>
        </div>
        {commun.fixedExpenses.length === 0 && <p style={S.empty}>Aucune charge commune</p>}
        {commun.fixedExpenses.map((e) => (
          <div key={e.id} style={S.row}>
            <select
              value={e.category}
              onChange={(v) => updateExpense(e.id, 'category', v.target.value)}
              style={{ ...S.select, flex: 2 }}
            >
              {FIXED_EXPENSE_CATEGORIES_COMMUN.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="0"
              value={e.amount}
              onChange={(v) => updateExpense(e.id, 'amount', v.target.value)}
              style={{ ...S.input, flex: 1 }}
            />
            <span style={S.unit}>$</span>
            <Del onClick={() => removeExpense(e.id)} />
          </div>
        ))}
        {commun.fixedExpenses.length > 0 && (
          <div style={S.subtotal}>
            <span>Total charges</span>
            <strong>{fmt(sum.charges)}</strong>
          </div>
        )}
      </div>

      {/* Allocations budgétaires */}
      <div style={S.section}>
        <div style={S.sectionHead}>
          <div>
            <h2 style={S.h2}>Allocations budgétaires</h2>
            <p style={S.sub}>Base : {fmt(sum.base)} (apports − charges)</p>
          </div>
          <Btn onClick={addProject}>+ Ajouter</Btn>
        </div>
        {commun.projects.length === 0 && <p style={S.empty}>Aucun projet</p>}
        {commun.projects.map((p) => (
          <div key={p.id} style={S.row}>
            <select
              value={p.category}
              onChange={(v) => updateProject(p.id, 'category', v.target.value)}
              style={{ ...S.select, flex: 2 }}
            >
              {PROJECT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="0"
              value={p.value}
              onChange={(v) => updateProject(p.id, 'value', v.target.value)}
              style={{ ...S.input, flex: 1 }}
            />
            <select
              value={p.type}
              onChange={(v) => updateProject(p.id, 'type', v.target.value)}
              style={S.typeSelect}
            >
              <option value="fixed">$</option>
              <option value="percent">%</option>
            </select>
            {p.type === 'percent' && p.value && (
              <span style={S.computed}>
                = {fmt(resolveAllocation(p, Math.max(0, sum.base)))}
              </span>
            )}
            <Del onClick={() => removeProject(p.id)} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ContribBox({ label, value, pct, onChange }) {
  return (
    <div style={S.contribBox}>
      <p style={S.contribLabel}>{label}</p>
      <div style={S.contribRow}>
        <input
          type="number"
          placeholder="0"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          style={S.contribInput}
        />
        <span style={S.unit}>$</span>
      </div>
      {pct !== null && pct !== undefined && (
        <p style={S.contribPct}>{pct} % du salaire</p>
      )}
    </div>
  );
}

function Card({ label, value, color }) {
  return (
    <div style={{ ...S.card, borderTop: `3px solid ${color}` }}>
      <p style={S.cardLabel}>{label}</p>
      <p style={{ ...S.cardValue, color }}>{fmt(value)}</p>
    </div>
  );
}

function Btn({ onClick, children }) {
  return <button onClick={onClick} style={S.btn}>{children}</button>;
}

function Del({ onClick }) {
  return <button onClick={onClick} style={S.del}>×</button>;
}

const S = {
  page: { maxWidth: 800, margin: '0 auto', padding: '32px 24px 64px' },
  h1: { fontSize: 28, fontWeight: 700, marginBottom: 24, color: '#111827' },
  h2: { fontSize: 16, fontWeight: 600, color: '#111827' },
  sub: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  cards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: 16,
    marginBottom: 28,
  },
  card: {
    background: '#fff',
    borderRadius: 12,
    padding: '16px 20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  cardLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: 6,
  },
  cardValue: { fontSize: 20, fontWeight: 700 },
  section: {
    background: '#fff',
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  sectionHead: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  contribGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: 16,
    marginBottom: 16,
  },
  contribBox: { background: '#F9FAFB', borderRadius: 10, padding: 16 },
  contribLabel: { fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 10 },
  contribRow: { display: 'flex', alignItems: 'center', gap: 8 },
  contribInput: {
    border: '1px solid #E5E7EB',
    borderRadius: 8,
    padding: '10px 12px',
    fontSize: 18,
    fontWeight: 600,
    flex: 1,
    minWidth: 0,
    outline: 'none',
    background: '#fff',
    fontFamily: 'Poppins, sans-serif',
    color: '#111827',
  },
  contribPct: { fontSize: 12, color: '#4F46E5', fontWeight: 600, marginTop: 6 },
  totalBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#EEF2FF',
    borderRadius: 8,
    padding: '10px 16px',
  },
  totalLabel: { fontSize: 14, fontWeight: 600, color: '#4F46E5' },
  totalValue: { fontSize: 18, fontWeight: 700, color: '#4F46E5' },
  row: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 },
  input: {
    border: '1px solid #E5E7EB',
    borderRadius: 8,
    padding: '8px 12px',
    fontSize: 14,
    outline: 'none',
    minWidth: 0,
    fontFamily: 'Poppins, sans-serif',
    color: '#111827',
  },
  select: {
    border: '1px solid #E5E7EB',
    borderRadius: 8,
    padding: '8px 10px',
    fontSize: 13,
    background: '#fff',
    outline: 'none',
    minWidth: 0,
    fontFamily: 'Poppins, sans-serif',
    color: '#111827',
  },
  typeSelect: {
    border: '1px solid #E5E7EB',
    borderRadius: 8,
    padding: '8px 6px',
    fontSize: 13,
    background: '#fff',
    outline: 'none',
    fontFamily: 'Poppins, sans-serif',
    width: 56,
    color: '#111827',
  },
  unit: { fontSize: 14, color: '#6B7280', fontWeight: 500, flexShrink: 0 },
  computed: { fontSize: 12, color: '#4F46E5', fontWeight: 600, whiteSpace: 'nowrap' },
  subtotal: {
    display: 'flex',
    justifyContent: 'space-between',
    borderTop: '1px solid #F3F4F6',
    paddingTop: 10,
    marginTop: 4,
    fontSize: 14,
    color: '#6B7280',
  },
  btn: {
    background: '#EEF2FF',
    color: '#4F46E5',
    border: 'none',
    borderRadius: 8,
    padding: '7px 14px',
    fontSize: 13,
    fontWeight: 600,
    flexShrink: 0,
    fontFamily: 'Poppins, sans-serif',
    cursor: 'pointer',
  },
  del: {
    background: 'none',
    border: '1px solid #E5E7EB',
    borderRadius: 6,
    width: 28,
    height: 28,
    fontSize: 18,
    color: '#9CA3AF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    lineHeight: 1,
    cursor: 'pointer',
    fontFamily: 'Poppins, sans-serif',
    padding: 0,
  },
  empty: { fontSize: 13, color: '#9CA3AF', fontStyle: 'italic' },
};
