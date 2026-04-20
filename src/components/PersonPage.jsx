import React, { useState, useEffect } from 'react';
import { savePerson, genId } from '../utils/storage';
import {
  FIXED_EXPENSE_CATEGORIES_ALEX,
  FIXED_EXPENSE_CATEGORIES_AURELIE,
  ALLOCATION_CATEGORIES,
} from '../utils/categories';
import { personSummary, resolveAllocation } from '../utils/calculations';

const fmt = (n) =>
  (parseFloat(n) || 0).toLocaleString('fr-CA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + ' $';

export default function PersonPage({ name, data, onChange }) {
  const [person, setPerson] = useState(data);

  useEffect(() => { setPerson(data); }, [data]);

  const cats =
    name === 'alex' ? FIXED_EXPENSE_CATEGORIES_ALEX : FIXED_EXPENSE_CATEGORIES_AURELIE;
  const title = name === 'alex' ? 'Alex' : 'Aurélie';

  function update(next) {
    setPerson(next);
    savePerson(name, next);
    onChange(next);
  }

  function addExpense() {
    update({
      ...person,
      fixedExpenses: [...person.fixedExpenses, { id: genId(), category: cats[0], amount: '' }],
    });
  }
  function updateExpense(id, field, val) {
    update({
      ...person,
      fixedExpenses: person.fixedExpenses.map((e) => (e.id === id ? { ...e, [field]: val } : e)),
    });
  }
  function removeExpense(id) {
    update({ ...person, fixedExpenses: person.fixedExpenses.filter((e) => e.id !== id) });
  }

  function addAllocation() {
    update({
      ...person,
      allocations: [
        ...person.allocations,
        { id: genId(), category: ALLOCATION_CATEGORIES[0], type: 'fixed', value: '' },
      ],
    });
  }
  function updateAllocation(id, field, val) {
    update({
      ...person,
      allocations: person.allocations.map((a) => (a.id === id ? { ...a, [field]: val } : a)),
    });
  }
  function removeAllocation(id) {
    update({ ...person, allocations: person.allocations.filter((a) => a.id !== id) });
  }

  const sum = personSummary(person);

  return (
    <div style={S.page}>
      <h1 style={S.h1}>{title}</h1>

      <div style={S.cards}>
        <Card label="Salaire net" value={sum.revenue} color="#4F46E5" />
        <Card label="Charges fixes" value={sum.charges} color="#EF4444" />
        <Card label="Allocations" value={sum.savings} color="#10B981" />
        <Card
          label="Disponible"
          value={sum.available}
          color={sum.available >= 0 ? '#10B981' : '#EF4444'}
        />
      </div>

      {/* Salaire */}
      <div style={S.section}>
        <h2 style={{ ...S.h2, marginBottom: 16 }}>Salaire net mensuel</h2>
        <div style={S.inlineRow}>
          <input
            type="number"
            placeholder="0"
            value={person.salary || ''}
            onChange={(e) => update({ ...person, salary: e.target.value })}
            style={S.inputLarge}
          />
          <span style={S.unit}>$</span>
        </div>
      </div>

      {/* Charges fixes */}
      <div style={S.section}>
        <div style={S.sectionHead}>
          <h2 style={S.h2}>Charges fixes</h2>
          <Btn onClick={addExpense}>+ Ajouter</Btn>
        </div>
        {person.fixedExpenses.length === 0 && <p style={S.empty}>Aucune charge</p>}
        {person.fixedExpenses.map((e) => (
          <div key={e.id} style={S.row}>
            <select
              value={e.category}
              onChange={(v) => updateExpense(e.id, 'category', v.target.value)}
              style={{ ...S.select, flex: 2 }}
            >
              {cats.map((c) => (
                <option key={c} value={c}>{c}</option>
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
      </div>

      {/* Allocations */}
      <div style={S.section}>
        <div style={S.sectionHead}>
          <div>
            <h2 style={S.h2}>Allocations budgétaires</h2>
            <p style={S.sub}>Base : {fmt(sum.revenue)} (revenu mensuel net)</p>
          </div>
          <Btn onClick={addAllocation}>+ Ajouter</Btn>
        </div>
        {person.allocations.length === 0 && <p style={S.empty}>Aucune allocation</p>}
        {person.allocations.map((a) => (
          <div key={a.id} style={S.row}>
            <select
              value={a.category}
              onChange={(v) => updateAllocation(a.id, 'category', v.target.value)}
              style={{ ...S.select, flex: 2 }}
            >
              {ALLOCATION_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="0"
              value={a.value}
              onChange={(v) => updateAllocation(a.id, 'value', v.target.value)}
              style={{ ...S.input, flex: 1 }}
            />
            <select
              value={a.type}
              onChange={(v) => updateAllocation(a.id, 'type', v.target.value)}
              style={S.typeSelect}
            >
              <option value="fixed">$</option>
              <option value="percent">%</option>
            </select>
            {a.type === 'percent' && a.value && (
              <span style={S.computed}>= {fmt(resolveAllocation(a, sum.revenue))}</span>
            )}
            <Del onClick={() => removeAllocation(a.id)} />
          </div>
        ))}
      </div>
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
  inlineRow: { display: 'flex', alignItems: 'center', gap: 10 },
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
  inputLarge: {
    border: '1px solid #E5E7EB',
    borderRadius: 8,
    padding: '10px 16px',
    fontSize: 20,
    fontWeight: 600,
    width: 200,
    outline: 'none',
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
