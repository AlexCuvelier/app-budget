import React, { useState, useEffect } from 'react';
import { savePerson, genId } from '../utils/storage';
import { FIXED_EXPENSE_CATEGORIES, ALLOCATION_CATEGORIES } from '../utils/categories';
import { personSummary, resolveAllocation } from '../utils/calculations';

export default function PersonPage({ name, data, onChange }) {
  const [person, setPerson] = useState(data);

  useEffect(() => {
    setPerson(data);
  }, [data]);

  function update(newPerson) {
    setPerson(newPerson);
    savePerson(name, newPerson);
    onChange(newPerson);
  }

  function setSalary(val) {
    update({ ...person, salary: val });
  }

  function addRevenue() {
    update({
      ...person,
      otherRevenues: [
        ...person.otherRevenues,
        { id: genId(), name: '', amount: '', isRecurring: true },
      ],
    });
  }

  function updateRevenue(id, field, val) {
    update({
      ...person,
      otherRevenues: person.otherRevenues.map((r) =>
        r.id === id ? { ...r, [field]: val } : r
      ),
    });
  }

  function removeRevenue(id) {
    update({ ...person, otherRevenues: person.otherRevenues.filter((r) => r.id !== id) });
  }

  function addExpense() {
    update({
      ...person,
      fixedExpenses: [
        ...person.fixedExpenses,
        { id: genId(), category: FIXED_EXPENSE_CATEGORIES[0], amount: '' },
      ],
    });
  }

  function updateExpense(id, field, val) {
    update({
      ...person,
      fixedExpenses: person.fixedExpenses.map((e) =>
        e.id === id ? { ...e, [field]: val } : e
      ),
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
        { id: genId(), category: ALLOCATION_CATEGORIES[0], amount: '', isPercentage: false },
      ],
    });
  }

  function updateAllocation(id, field, val) {
    update({
      ...person,
      allocations: person.allocations.map((a) =>
        a.id === id ? { ...a, [field]: val } : a
      ),
    });
  }

  function removeAllocation(id) {
    update({ ...person, allocations: person.allocations.filter((a) => a.id !== id) });
  }

  const summary = personSummary(person);
  const afterCharges = summary.afterCharges;

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>{name}</h1>

      {/* Summary cards */}
      <div style={styles.cards}>
        <SummaryCard label="Revenus" value={summary.revenue} color="#6c63ff" />
        <SummaryCard label="Charges" value={summary.charges} color="#ef476f" />
        <SummaryCard label="Épargne / Alloc." value={summary.savings} color="#43d9ad" />
        <SummaryCard label="Disponible" value={summary.available} color={summary.available >= 0 ? '#06d6a0' : '#ef476f'} />
      </div>

      {/* Salary */}
      <Section title="Salaire net mensuel">
        <div style={styles.row}>
          <input
            type="number"
            placeholder="0"
            value={person.salary || ''}
            onChange={(e) => setSalary(e.target.value)}
            style={styles.inputLarge}
          />
          <span style={styles.currency}>€</span>
        </div>
      </Section>

      {/* Other revenues */}
      <Section
        title="Autres revenus"
        action={<AddButton onClick={addRevenue} />}
      >
        {person.otherRevenues.length === 0 && (
          <p style={styles.empty}>Aucun autre revenu</p>
        )}
        {person.otherRevenues.map((r) => (
          <div key={r.id} style={styles.itemRow}>
            <input
              type="text"
              placeholder="Nom"
              value={r.name}
              onChange={(e) => updateRevenue(r.id, 'name', e.target.value)}
              style={{ ...styles.input, flex: 2 }}
            />
            <input
              type="number"
              placeholder="0"
              value={r.amount}
              onChange={(e) => updateRevenue(r.id, 'amount', e.target.value)}
              style={{ ...styles.input, flex: 1 }}
            />
            <span style={styles.currency}>€</span>
            <select
              value={r.isRecurring ? 'recurring' : 'once'}
              onChange={(e) => updateRevenue(r.id, 'isRecurring', e.target.value === 'recurring')}
              style={styles.select}
            >
              <option value="recurring">Récurrent</option>
              <option value="once">Unique</option>
            </select>
            <RemoveButton onClick={() => removeRevenue(r.id)} />
          </div>
        ))}
      </Section>

      {/* Fixed expenses */}
      <Section
        title="Charges fixes"
        action={<AddButton onClick={addExpense} />}
      >
        {person.fixedExpenses.length === 0 && (
          <p style={styles.empty}>Aucune charge fixe</p>
        )}
        {person.fixedExpenses.map((e) => (
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
      </Section>

      {/* Allocations */}
      <Section
        title="Allocations budgétaires"
        subtitle={`Base de calcul : ${formatEur(afterCharges)} (revenus − charges)`}
        action={<AddButton onClick={addAllocation} />}
      >
        {person.allocations.length === 0 && (
          <p style={styles.empty}>Aucune allocation</p>
        )}
        {person.allocations.map((a) => (
          <div key={a.id} style={styles.itemRow}>
            <select
              value={a.category}
              onChange={(v) => updateAllocation(a.id, 'category', v.target.value)}
              style={{ ...styles.select, flex: 2 }}
            >
              {ALLOCATION_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="0"
              value={a.amount}
              onChange={(v) => updateAllocation(a.id, 'amount', v.target.value)}
              style={{ ...styles.input, flex: 1 }}
            />
            <select
              value={a.isPercentage ? 'pct' : 'fixed'}
              onChange={(v) => updateAllocation(a.id, 'isPercentage', v.target.value === 'pct')}
              style={styles.select}
            >
              <option value="fixed">€</option>
              <option value="pct">%</option>
            </select>
            {a.isPercentage && a.amount && (
              <span style={styles.computed}>
                = {formatEur(resolveAllocation(a, afterCharges))}
              </span>
            )}
            <RemoveButton onClick={() => removeAllocation(a.id)} />
          </div>
        ))}
      </Section>
    </div>
  );
}

function Section({ title, subtitle, action, children }) {
  return (
    <div style={styles.section}>
      <div style={styles.sectionHeader}>
        <div>
          <h2 style={styles.sectionTitle}>{title}</h2>
          {subtitle && <p style={styles.sectionSubtitle}>{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
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
    <button onClick={onClick} style={styles.addBtn}>
      + Ajouter
    </button>
  );
}

function RemoveButton({ onClick }) {
  return (
    <button onClick={onClick} style={styles.removeBtn}>
      ×
    </button>
  );
}

function formatEur(val) {
  const n = parseFloat(val) || 0;
  return n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
}

const styles = {
  page: {
    maxWidth: 800,
    margin: '0 auto',
    padding: '32px 24px 64px',
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    marginBottom: 24,
    color: '#1a1a2e',
  },
  cards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: 16,
    marginBottom: 32,
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
  cardValue: {
    fontSize: 22,
    fontWeight: 700,
  },
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: '#1a1a2e',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  itemRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  input: {
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: '8px 12px',
    fontSize: 14,
    outline: 'none',
    minWidth: 0,
  },
  inputLarge: {
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    padding: '10px 16px',
    fontSize: 20,
    fontWeight: 600,
    width: 200,
    outline: 'none',
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
  currency: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: 500,
    flexShrink: 0,
  },
  computed: {
    fontSize: 12,
    color: '#6c63ff',
    fontWeight: 600,
    whiteSpace: 'nowrap',
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
  empty: {
    fontSize: 13,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
};
