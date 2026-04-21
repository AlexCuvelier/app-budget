import React, { useState, useEffect } from 'react';
import { savePerson, genId } from '../utils/storage';
import {
  FIXED_EXPENSE_CATEGORIES,
  ALLOCATION_CATEGORIES,
  getCategoryColor,
} from '../utils/categories';
import { totalFixedExpenses, splitAllocations, resolveAllocation } from '../utils/calculations';

const P = {
  bg:      '#FAFAF7',
  surface: '#FFFFFF',
  ink:     '#1A1A1A',
  muted:   '#6B6B6B',
  faint:   '#A8A8A3',
  border:  '#E8E8E3',
  divider: '#F0F0EB',
  violet:  'oklch(0.58 0.24 295)',
  violetBg:'oklch(0.95 0.05 295)',
  red:     'oklch(0.62 0.25 25)',
};

const fmt = (n) =>
  (parseFloat(n) || 0).toLocaleString('fr-CA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + ' $';

export default function PersonPage({ name, data, onChange, apportCommun = 0 }) {
  const [person, setPerson] = useState(data);

  useEffect(() => { setPerson(data); }, [data]);

  const cats = FIXED_EXPENSE_CATEGORIES;
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

  const salary = parseFloat(person.salary) || 0;
  const baseAfterCommun = salary - apportCommun;
  const charges = totalFixedExpenses(person.fixedExpenses);
  const baseForAlloc = baseAfterCommun - charges;
  const { savings: épargnes, allocations: allocationsAmt } = splitAllocations(person.allocations, baseForAlloc);
  const available = baseForAlloc - épargnes - allocationsAmt;

  return (
    <div style={S.page}>
      <div style={S.titleWrap}>
        <div style={S.eyebrow}>Avril 2026 · Budget individuel</div>
        <h1 style={S.h1}>{title}</h1>
      </div>

      {/* KPI cards */}
      <div style={S.kpiGrid}>
        <KpiCard label="Disponible"  value={fmt(available)}     tone={available >= 0 ? P.ink : P.red} />
        <KpiCard label="Charges"     value={fmt(charges)}       tone={P.red} />
        <KpiCard label="Épargnes"    value={fmt(épargnes)}      tone={P.violet} />
        <KpiCard label="Allocations" value={fmt(allocationsAmt)} tone='oklch(0.82 0.19 85)' />
      </div>

      {/* Salary */}
      <SectionCard title="Salaire net mensuel">
        <div style={S.salaryWrap}>
          <input
            type="number"
            placeholder="0"
            value={person.salary || ''}
            onChange={(e) => update({ ...person, salary: e.target.value })}
            style={S.salaryInput}
          />
          <span style={S.salaryUnit}>$</span>
          <span style={S.salaryMeta}>/ mois</span>
        </div>
      </SectionCard>

      {/* Fixed charges */}
      <SectionCard
        title="Charges fixes"
        action="Ajouter"
        onAction={addExpense}
        sub={`Base : ${fmt(baseAfterCommun)} (salaire − apport commun)`}
      >
        {person.fixedExpenses.length === 0 && <p style={S.empty}>Aucune charge</p>}
        {person.fixedExpenses.map((e, i) => (
          <div key={e.id} style={{
            ...S.row,
            borderBottom: i < person.fixedExpenses.length - 1 ? `0.5px solid ${P.divider}` : 'none',
          }}>
            <div style={{ ...S.bar, background: getCategoryColor(e.category) }} />
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
        {person.fixedExpenses.length > 0 && (
          <div style={S.subtotal}>
            <span>Total charges</span>
            <strong>{fmt(charges)}</strong>
          </div>
        )}
      </SectionCard>

      {/* Allocations */}
      <SectionCard
        title="Allocations budgétaires"
        action="Ajouter"
        onAction={addAllocation}
        sub={`Base : ${fmt(baseForAlloc)} (salaire − apport commun − charges)`}
      >
        {person.allocations.length === 0 && <p style={S.empty}>Aucune allocation</p>}
        {person.allocations.map((a, i) => (
          <div key={a.id} style={{
            ...S.row,
            borderBottom: i < person.allocations.length - 1 ? `0.5px solid ${P.divider}` : 'none',
          }}>
            <div style={{ ...S.bar, background: getCategoryColor(a.category) }} />
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
              <span style={S.computed}>= {fmt(resolveAllocation(a, baseForAlloc))}</span>
            )}
            <Del onClick={() => removeAllocation(a.id)} />
          </div>
        ))}
      </SectionCard>
    </div>
  );
}

function KpiCard({ label, value, tone }) {
  return (
    <div style={S.kpiCard}>
      <div style={S.kpiLabel}>{label}</div>
      <div style={{ ...S.kpiValue, color: tone }}>{value}</div>
    </div>
  );
}

function SectionCard({ title, action, onAction, sub, children }) {
  return (
    <div style={S.card}>
      <div style={S.cardHead}>
        <div>
          <div style={S.sectionTitle}>{title}</div>
          {sub && <div style={S.sub}>{sub}</div>}
        </div>
        {action && (
          <button onClick={onAction} style={S.addBtn}>
            <span style={{ fontSize: 14, lineHeight: 1 }}>+</span> {action}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function Del({ onClick }) {
  return <button onClick={onClick} style={S.del}>×</button>;
}

const S = {
  page: { maxWidth: 720, margin: '0 auto', padding: '0 16px 64px' },
  titleWrap: { padding: '24px 4px 20px' },
  eyebrow: {
    fontFamily: 'Poppins, sans-serif',
    fontSize: 10, fontWeight: 500,
    letterSpacing: '0.12em', color: '#A8A8A3',
    textTransform: 'uppercase', marginBottom: 6,
  },
  h1: {
    fontFamily: 'Poppins, sans-serif',
    fontSize: 30, fontWeight: 600,
    letterSpacing: '-0.8px', color: '#1A1A1A',
    lineHeight: 1, margin: 0,
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 8, marginBottom: 14,
  },
  kpiCard: {
    background: '#FFFFFF',
    borderRadius: 14,
    border: '0.5px solid #E8E8E3',
    padding: '12px 10px',
    minHeight: 78,
    display: 'flex', flexDirection: 'column',
    justifyContent: 'space-between',
  },
  kpiLabel: {
    fontFamily: 'Poppins, sans-serif',
    fontSize: 9, fontWeight: 500,
    letterSpacing: '0.06em', color: '#A8A8A3',
    textTransform: 'uppercase', lineHeight: 1.2,
  },
  kpiValue: {
    fontFamily: 'Poppins, sans-serif',
    fontSize: 14, fontWeight: 600,
    letterSpacing: '-0.3px',
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1.1, marginTop: 4,
  },
  card: {
    background: '#FFFFFF',
    borderRadius: 18,
    border: '0.5px solid #E8E8E3',
    padding: '18px 18px 0',
    marginBottom: 14,
    overflow: 'hidden',
  },
  cardHead: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: 14,
  },
  sectionTitle: {
    fontFamily: 'Poppins, sans-serif',
    fontSize: 10, fontWeight: 500,
    letterSpacing: '0.12em', color: '#A8A8A3',
    textTransform: 'uppercase',
  },
  sub: {
    fontFamily: 'Poppins, sans-serif',
    fontSize: 11, color: '#A8A8A3',
    marginTop: 3,
  },
  addBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'Poppins, sans-serif',
    fontSize: 11, fontWeight: 500,
    color: 'oklch(0.58 0.24 295)',
    letterSpacing: '0.03em',
    padding: 0,
    display: 'flex', alignItems: 'center', gap: 4,
    flexShrink: 0,
  },
  salaryWrap: {
    display: 'flex', alignItems: 'baseline', gap: 8,
    padding: '10px 0 18px',
  },
  salaryInput: {
    border: 'none',
    background: 'transparent',
    fontFamily: 'Poppins, sans-serif',
    fontSize: 32, fontWeight: 600,
    color: '#1A1A1A', letterSpacing: '-1px',
    fontVariantNumeric: 'tabular-nums',
    outline: 'none',
    width: 180, minWidth: 0,
  },
  salaryUnit: {
    fontFamily: 'Poppins, sans-serif',
    fontSize: 18, fontWeight: 500, color: '#6B6B6B',
  },
  salaryMeta: {
    fontFamily: 'Poppins, sans-serif',
    fontSize: 11, fontWeight: 500, color: '#A8A8A3',
    letterSpacing: '0.03em',
  },
  row: {
    display: 'flex', alignItems: 'center',
    padding: '10px 0', gap: 10,
  },
  bar: {
    width: 4, height: 32, borderRadius: 4, flexShrink: 0,
  },
  input: {
    border: `1px solid #E8E8E3`,
    borderRadius: 8,
    padding: '7px 10px',
    fontSize: 13,
    outline: 'none',
    minWidth: 0,
    fontFamily: 'Poppins, sans-serif',
    color: '#1A1A1A',
    background: '#FAFAF7',
    fontVariantNumeric: 'tabular-nums',
  },
  select: {
    border: `1px solid #E8E8E3`,
    borderRadius: 8,
    padding: '7px 8px',
    fontSize: 12,
    background: '#FAFAF7',
    outline: 'none',
    minWidth: 0,
    fontFamily: 'Poppins, sans-serif',
    color: '#1A1A1A',
  },
  typeSelect: {
    border: `1px solid #E8E8E3`,
    borderRadius: 8,
    padding: '7px 6px',
    fontSize: 12,
    background: '#FAFAF7',
    outline: 'none',
    fontFamily: 'Poppins, sans-serif',
    width: 52,
    color: '#1A1A1A',
  },
  unit: { fontSize: 13, color: '#6B6B6B', fontWeight: 500, flexShrink: 0 },
  computed: {
    fontSize: 11,
    color: 'oklch(0.58 0.24 295)',
    fontWeight: 600,
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
  },
  subtotal: {
    display: 'flex',
    justifyContent: 'space-between',
    borderTop: '0.5px solid #F0F0EB',
    paddingTop: 10,
    paddingBottom: 14,
    marginTop: 4,
    fontSize: 13,
    color: '#6B6B6B',
  },
  del: {
    background: 'none',
    border: `1px solid #E8E8E3`,
    borderRadius: 6,
    width: 26, height: 26,
    fontSize: 16, color: '#A8A8A3',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0, lineHeight: 1,
    cursor: 'pointer',
    fontFamily: 'Poppins, sans-serif',
    padding: 0,
  },
  empty: {
    fontFamily: 'Poppins, sans-serif',
    fontSize: 12, color: '#A8A8A3',
    fontStyle: 'italic', paddingBottom: 14,
  },
};
