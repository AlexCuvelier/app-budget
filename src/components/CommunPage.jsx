import React, { useState, useEffect } from 'react';
import { saveCommun, genId } from '../utils/storage';
import {
  FIXED_EXPENSE_CATEGORIES_COMMUN,
  PROJECT_CATEGORIES,
  getCategoryColor,
} from '../utils/categories';
import { communSummary, resolveAllocation } from '../utils/calculations';

const P = {
  bg:      '#FAFAF7',
  surface: '#FFFFFF',
  ink:     '#1A1A1A',
  muted:   '#6B6B6B',
  faint:   '#A8A8A3',
  border:  '#E8E8E3',
  divider: '#F0F0EB',
  violet:  'oklch(0.58 0.24 295)',
  red:     'oklch(0.62 0.25 25)',
};

const CONTRIB_TONES = {
  alex:     'oklch(0.58 0.24 295)',
  aurelie:  'oklch(0.60 0.24 340)',
  soWeLeft: 'oklch(0.82 0.19 85)',
};

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

  const alexAmt    = parseFloat(c.alex)     || 0;
  const aurelieAmt = parseFloat(c.aurelie)  || 0;
  const soWeLeftAmt = parseFloat(c.soWeLeft) || 0;

  const alexPct    = alexSalary > 0    ? ((alexAmt / alexSalary) * 100).toFixed(1)    : null;
  const aureliePct = aurelieSalary > 0 ? ((aurelieAmt / aurelieSalary) * 100).toFixed(1) : null;

  return (
    <div style={S.page}>
      <div style={S.titleWrap}>
        <div style={S.eyebrow}>Avril 2026 · Pot commun du couple</div>
        <h1 style={S.h1}>Commun</h1>
      </div>

      {/* KPI cards */}
      <div style={S.kpiGrid}>
        <KpiCard label="Total apports"   value={fmt(sum.totalContributions)} tone={P.ink} />
        <KpiCard label="Charges communes" value={fmt(sum.charges)}           tone={P.red} />
        <KpiCard label="Allocations"     value={fmt(sum.savings)}            tone={P.violet} />
        <KpiCard label="Disponible"      value={fmt(sum.available)} tone={sum.available >= 0 ? P.ink : P.red} />
      </div>

      {/* Apports mensuels */}
      <SectionCard title="Apports mensuels">
        <ContribRow
          label="Alex"
          initials="A"
          tone={CONTRIB_TONES.alex}
          value={c.alex}
          pct={alexPct}
          salary={alexSalary}
          onChange={(v) => setContrib('alex', v)}
        />
        <ContribRow
          label="Aurélie"
          initials="Au"
          tone={CONTRIB_TONES.aurelie}
          value={c.aurelie}
          pct={aureliePct}
          salary={aurelieSalary}
          onChange={(v) => setContrib('aurelie', v)}
          isLast
        />
        <div style={S.totalBar}>
          <span style={S.totalLabel}>Total commun</span>
          <span style={S.totalValue}>{fmt(sum.totalContributions)}</span>
        </div>
        {/* So We Left */}
        <div style={{ paddingTop: 12, borderTop: `0.5px solid ${P.divider}`, marginTop: 4 }}>
          <div style={S.sowLabel}>So We Left</div>
          <div style={S.contribInputRow}>
            <div style={{ ...S.avatar, background: CONTRIB_TONES.soWeLeft }}>SWL</div>
            <input
              type="number"
              placeholder="0"
              value={c.soWeLeft || ''}
              onChange={(e) => setContrib('soWeLeft', e.target.value)}
              style={S.contribInput}
            />
            <span style={S.unit}>$</span>
          </div>
        </div>
      </SectionCard>

      {/* Charges fixes communes */}
      <SectionCard
        title="Charges fixes communes"
        action="Ajouter"
        onAction={addExpense}
      >
        {commun.fixedExpenses.length === 0 && <p style={S.empty}>Aucune charge commune</p>}
        {commun.fixedExpenses.map((e, i) => (
          <div key={e.id} style={{
            ...S.row,
            borderBottom: i < commun.fixedExpenses.length - 1 ? `0.5px solid ${P.divider}` : 'none',
          }}>
            <div style={{ ...S.bar, background: getCategoryColor(e.category) }} />
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
      </SectionCard>

      {/* Allocations budgétaires */}
      <SectionCard
        title="Allocations budgétaires"
        action="Ajouter"
        onAction={addProject}
        sub={`Base : ${fmt(sum.base)} (apports − charges)`}
      >
        {commun.projects.length === 0 && <p style={S.empty}>Aucun projet</p>}
        {commun.projects.map((p, i) => (
          <div key={p.id} style={{
            ...S.row,
            borderBottom: i < commun.projects.length - 1 ? `0.5px solid ${P.divider}` : 'none',
          }}>
            <div style={{ ...S.bar, background: getCategoryColor(p.category) }} />
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
      </SectionCard>
    </div>
  );
}

function ContribRow({ label, initials, tone, value, pct, salary, onChange, isLast }) {
  const amt = parseFloat(value) || 0;
  const barPct = salary > 0 ? Math.min(100, (amt / salary) * 100) : 0;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 0',
      borderBottom: isLast ? 'none' : `0.5px solid ${P.divider}`,
      marginBottom: isLast ? 0 : 0,
    }}>
      <div style={{ ...S.avatar, background: tone }}>{initials}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: 'Poppins, sans-serif', fontSize: 13,
          fontWeight: 600, color: P.ink, marginBottom: 4,
        }}>{label}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 60, height: 4, borderRadius: 2,
            background: P.divider, overflow: 'hidden',
          }}>
            <div style={{ width: `${barPct}%`, height: '100%', background: tone }} />
          </div>
          {pct !== null && pct !== undefined && salary > 0 && (
            <span style={{
              fontFamily: 'Poppins, sans-serif', fontSize: 10,
              fontWeight: 500, color: tone,
            }}>{pct} % du salaire</span>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <input
          type="number"
          placeholder="0"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          style={S.contribInput}
        />
        <span style={S.unit}>$</span>
      </div>
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
    borderBottom: '0.5px solid #F0F0EB',
    marginBottom: 4,
  },
  sectionTitle: {
    fontFamily: 'Poppins, sans-serif',
    fontSize: 10, fontWeight: 500,
    letterSpacing: '0.12em', color: '#A8A8A3',
    textTransform: 'uppercase',
  },
  sub: {
    fontFamily: 'Poppins, sans-serif',
    fontSize: 11, color: '#A8A8A3', marginTop: 3,
  },
  addBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'Poppins, sans-serif',
    fontSize: 11, fontWeight: 500,
    color: 'oklch(0.58 0.24 295)',
    letterSpacing: '0.03em', padding: 0,
    display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0,
  },
  avatar: {
    width: 36, height: 36, borderRadius: '50%',
    flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'Poppins, sans-serif', fontSize: 11, fontWeight: 600,
    color: '#fff', letterSpacing: '0.02em',
  },
  contribInputRow: {
    display: 'flex', alignItems: 'center', gap: 8,
    marginTop: 8, paddingBottom: 14,
  },
  contribInput: {
    border: '1px solid #E8E8E3',
    borderRadius: 8,
    padding: '8px 10px',
    fontSize: 15, fontWeight: 600,
    width: 120, minWidth: 0,
    outline: 'none',
    background: '#FAFAF7',
    fontFamily: 'Poppins, sans-serif',
    color: '#1A1A1A',
    fontVariantNumeric: 'tabular-nums',
  },
  sowLabel: {
    fontFamily: 'Poppins, sans-serif',
    fontSize: 13, fontWeight: 600, color: '#1A1A1A',
    marginBottom: 2,
  },
  totalBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'oklch(0.95 0.05 295)',
    borderRadius: 8,
    padding: '9px 14px',
    marginTop: 12, marginBottom: 14,
  },
  totalLabel: {
    fontFamily: 'Poppins, sans-serif',
    fontSize: 13, fontWeight: 600,
    color: 'oklch(0.58 0.24 295)',
  },
  totalValue: {
    fontFamily: 'Poppins, sans-serif',
    fontSize: 16, fontWeight: 700,
    color: 'oklch(0.58 0.24 295)',
    fontVariantNumeric: 'tabular-nums',
  },
  row: {
    display: 'flex', alignItems: 'center',
    padding: '10px 0', gap: 10,
  },
  bar: {
    width: 4, height: 32, borderRadius: 4, flexShrink: 0,
  },
  input: {
    border: '1px solid #E8E8E3',
    borderRadius: 8, padding: '7px 10px',
    fontSize: 13, outline: 'none',
    minWidth: 0,
    fontFamily: 'Poppins, sans-serif', color: '#1A1A1A',
    background: '#FAFAF7', fontVariantNumeric: 'tabular-nums',
  },
  select: {
    border: '1px solid #E8E8E3',
    borderRadius: 8, padding: '7px 8px',
    fontSize: 12, background: '#FAFAF7', outline: 'none',
    minWidth: 0,
    fontFamily: 'Poppins, sans-serif', color: '#1A1A1A',
  },
  typeSelect: {
    border: '1px solid #E8E8E3',
    borderRadius: 8, padding: '7px 6px',
    fontSize: 12, background: '#FAFAF7', outline: 'none',
    fontFamily: 'Poppins, sans-serif', width: 52, color: '#1A1A1A',
  },
  unit: { fontSize: 13, color: '#6B6B6B', fontWeight: 500, flexShrink: 0 },
  computed: {
    fontSize: 11, color: 'oklch(0.58 0.24 295)',
    fontWeight: 600, whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
  },
  subtotal: {
    display: 'flex',
    justifyContent: 'space-between',
    borderTop: '0.5px solid #F0F0EB',
    paddingTop: 10, paddingBottom: 14,
    marginTop: 4, fontSize: 13, color: '#6B6B6B',
  },
  del: {
    background: 'none',
    border: '1px solid #E8E8E3',
    borderRadius: 6, width: 26, height: 26,
    fontSize: 16, color: '#A8A8A3',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', flexShrink: 0,
    lineHeight: 1, cursor: 'pointer',
    fontFamily: 'Poppins, sans-serif', padding: 0,
  },
  empty: {
    fontFamily: 'Poppins, sans-serif',
    fontSize: 12, color: '#A8A8A3',
    fontStyle: 'italic', paddingBottom: 14,
  },
};
