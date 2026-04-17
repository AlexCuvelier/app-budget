import React from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { personSummary, communSummary, healthScore } from '../utils/calculations';
import { CHART_COLORS } from '../utils/categories';

export default function Dashboard({ alex, aurelie, commun }) {
  const alexSum = personSummary(alex);
  const aurelieSum = personSummary(aurelie);
  const comSum = communSummary(commun);
  const health = healthScore(alex, aurelie, commun);

  const donutData = buildDonutData(alex, aurelie, commun);
  const barData = [
    {
      name: 'Alex',
      Revenus: alexSum.revenue,
      Charges: alexSum.charges,
      Épargne: alexSum.savings,
    },
    {
      name: 'Aurélie',
      Revenus: aurelieSum.revenue,
      Charges: aurelieSum.charges,
      Épargne: aurelieSum.savings,
    },
    {
      name: 'Commun',
      Revenus: comSum.total,
      Charges: comSum.charges,
      Épargne: comSum.savings,
    },
  ];

  const hasData = alexSum.revenue > 0 || aurelieSum.revenue > 0 || comSum.total > 0;

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Dashboard</h1>

      {!hasData && (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>Renseignez vos données dans les onglets Alex, Aurélie et Commun pour voir vos graphiques.</p>
        </div>
      )}

      {hasData && (
        <>
          {/* Health score */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Santé financière</h2>
            <div style={styles.healthContainer}>
              <HealthGauge score={health.score} color={health.color} label={health.label} />
              <div style={styles.healthComment}>
                <p style={{ ...styles.healthLabel, color: health.color }}>{health.label}</p>
                <p style={styles.healthText}>{health.comment}</p>
                <div style={styles.healthStats}>
                  <Stat label="Taux d'épargne" value={`${(health.savingsRate * 100).toFixed(1)}%`} />
                  <Stat label="Taux de charges" value={`${(health.chargesRate * 100).toFixed(1)}%`} />
                </div>
              </div>
            </div>
          </div>

          {/* Bar chart */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Revenus / Charges / Épargne</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" />
                <XAxis dataKey="name" tick={{ fontFamily: 'Poppins', fontSize: 13 }} />
                <YAxis tick={{ fontFamily: 'Poppins', fontSize: 12 }} tickFormatter={(v) => `${v}€`} />
                <Tooltip
                  formatter={(value) => [`${value.toLocaleString('fr-FR')} €`]}
                  contentStyle={{ fontFamily: 'Poppins', borderRadius: 8, border: '1px solid #e5e7eb' }}
                />
                <Legend wrapperStyle={{ fontFamily: 'Poppins', fontSize: 13 }} />
                <Bar dataKey="Revenus" fill="#6c63ff" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Charges" fill="#ef476f" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Épargne" fill="#43d9ad" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Donut chart */}
          {donutData.length > 0 && (
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Répartition des dépenses par catégorie</h2>
              <ResponsiveContainer width="100%" height={340}>
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={130}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) =>
                      percent > 0.04 ? `${name} ${(percent * 100).toFixed(0)}%` : ''
                    }
                    labelLine={false}
                  >
                    {donutData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value.toLocaleString('fr-FR')} €`]}
                    contentStyle={{ fontFamily: 'Poppins', borderRadius: 8, border: '1px solid #e5e7eb' }}
                  />
                  <Legend
                    wrapperStyle={{ fontFamily: 'Poppins', fontSize: 12 }}
                    formatter={(value) => value}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function HealthGauge({ score, color, label }) {
  const radius = 70;
  const circumference = Math.PI * radius;
  const arc = (score / 100) * circumference;

  return (
    <div style={styles.gaugeContainer}>
      <svg width={200} height={120} viewBox="0 0 200 120">
        <path
          d={`M 20 100 A ${radius} ${radius} 0 0 1 180 100`}
          fill="none"
          stroke="#f0f0f5"
          strokeWidth={16}
          strokeLinecap="round"
        />
        <path
          d={`M 20 100 A ${radius} ${radius} 0 0 1 180 100`}
          fill="none"
          stroke={color}
          strokeWidth={16}
          strokeLinecap="round"
          strokeDasharray={`${arc} ${circumference}`}
        />
        <text x="100" y="88" textAnchor="middle" fontFamily="Poppins" fontWeight="700" fontSize="28" fill={color}>
          {score}
        </text>
        <text x="100" y="108" textAnchor="middle" fontFamily="Poppins" fontSize="12" fill="#9ca3af">
          / 100
        </text>
      </svg>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={styles.stat}>
      <p style={styles.statLabel}>{label}</p>
      <p style={styles.statValue}>{value}</p>
    </div>
  );
}

function buildDonutData(alex, aurelie, commun) {
  const map = {};

  function addExpenses(expenses) {
    expenses.forEach((e) => {
      const val = parseFloat(e.amount) || 0;
      if (val <= 0) return;
      const key = e.category || 'Autre';
      map[key] = (map[key] || 0) + val;
    });
  }

  addExpenses(alex.fixedExpenses || []);
  addExpenses(aurelie.fixedExpenses || []);
  addExpenses(commun.fixedExpenses || []);

  return Object.entries(map)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

const styles = {
  page: { maxWidth: 900, margin: '0 auto', padding: '32px 24px 64px' },
  title: { fontSize: 28, fontWeight: 700, marginBottom: 24, color: '#1a1a2e' },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: '24px',
    marginBottom: 24,
    boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
  },
  sectionTitle: { fontSize: 16, fontWeight: 600, color: '#1a1a2e', marginBottom: 20 },
  healthContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 32,
    flexWrap: 'wrap',
  },
  gaugeContainer: { flexShrink: 0 },
  healthComment: { flex: 1, minWidth: 200 },
  healthLabel: { fontSize: 22, fontWeight: 700, marginBottom: 8 },
  healthText: { fontSize: 14, color: '#4b5563', lineHeight: 1.6, marginBottom: 16 },
  healthStats: { display: 'flex', gap: 24 },
  stat: {},
  statLabel: { fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 },
  statValue: { fontSize: 18, fontWeight: 700, color: '#1a1a2e' },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: '48px 24px',
    textAlign: 'center',
    boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
  },
  emptyText: { fontSize: 15, color: '#9ca3af', lineHeight: 1.6 },
};
