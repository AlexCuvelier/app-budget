import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { personSummary, communSummary, healthScore } from '../utils/calculations';
import { CHART_COLORS } from '../utils/categories';

const fmtTick = (n) =>
  n.toLocaleString('fr-CA', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' $';

const fmtTooltip = (v) => [
  v.toLocaleString('fr-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' $',
];

export default function Dashboard({ alex, aurelie, commun }) {
  const alexSum = personSummary(alex);
  const aurelieSum = personSummary(aurelie);
  const comSum = communSummary(commun);
  const health = healthScore(alex, aurelie, commun);

  const hasData =
    alexSum.revenue > 0 || aurelieSum.revenue > 0 || comSum.totalContributions > 0;

  const barData = [
    { name: 'Alex', Revenus: alexSum.revenue, Charges: alexSum.charges, Épargne: alexSum.savings },
    { name: 'Aurélie', Revenus: aurelieSum.revenue, Charges: aurelieSum.charges, Épargne: aurelieSum.savings },
    { name: 'Commun', Revenus: comSum.totalContributions, Charges: comSum.charges, Épargne: comSum.savings },
  ];

  const donutData = buildDonutData(alex, aurelie, commun);

  return (
    <div style={S.page}>
      <h1 style={S.h1}>Dashboard</h1>

      {!hasData && (
        <div style={S.emptyBox}>
          <p style={S.emptyText}>
            Renseignez vos données dans les onglets Alex, Aurélie et Commun pour voir vos graphiques.
          </p>
        </div>
      )}

      {hasData && (
        <>
          {/* Santé financière */}
          <div style={S.section}>
            <h2 style={S.h2}>Santé financière</h2>
            <div style={S.healthRow}>
              <HealthGauge score={health.score} color={health.color} />
              <div style={S.healthInfo}>
                <p style={{ ...S.healthLabel, color: health.color }}>{health.label}</p>
                <p style={S.healthText}>{health.comment}</p>
                <div style={S.statsRow}>
                  <Stat
                    label="Taux d'épargne"
                    value={`${(health.savingsRate * 100).toFixed(1)} %`}
                  />
                  <Stat
                    label="Taux de charges"
                    value={`${(health.chargesRate * 100).toFixed(1)} %`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Barres */}
          <div style={S.section}>
            <h2 style={S.h2}>Revenus / Charges / Épargne</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="name" tick={{ fontFamily: 'Poppins', fontSize: 13 }} />
                <YAxis
                  tick={{ fontFamily: 'Poppins', fontSize: 11 }}
                  tickFormatter={fmtTick}
                  width={90}
                />
                <Tooltip
                  formatter={fmtTooltip}
                  contentStyle={{
                    fontFamily: 'Poppins',
                    borderRadius: 8,
                    border: '1px solid #E5E7EB',
                    fontSize: 13,
                  }}
                />
                <Legend wrapperStyle={{ fontFamily: 'Poppins', fontSize: 13 }} />
                <Bar dataKey="Revenus" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Charges" fill="#EF4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Épargne" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Donut */}
          {donutData.length > 0 && (
            <div style={S.section}>
              <h2 style={S.h2}>Répartition des dépenses par catégorie</h2>
              <ResponsiveContainer width="100%" height={360}>
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
                      percent > 0.04 ? `${name} ${(percent * 100).toFixed(0)} %` : ''
                    }
                    labelLine={false}
                  >
                    {donutData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={fmtTooltip}
                    contentStyle={{
                      fontFamily: 'Poppins',
                      borderRadius: 8,
                      border: '1px solid #E5E7EB',
                      fontSize: 13,
                    }}
                  />
                  <Legend wrapperStyle={{ fontFamily: 'Poppins', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function HealthGauge({ score, color }) {
  const r = 80;
  const cx = 110;
  const cy = 100;
  const circumference = Math.PI * r;
  const arc = (score / 100) * circumference;
  const path = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;

  return (
    <svg
      width={220}
      height={120}
      viewBox="0 0 220 120"
      style={{ flexShrink: 0 }}
    >
      <path
        d={path}
        fill="none"
        stroke="#F3F4F6"
        strokeWidth={16}
        strokeLinecap="round"
      />
      {score > 0 && (
        <path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth={16}
          strokeLinecap="round"
          strokeDasharray={`${arc} ${circumference}`}
        />
      )}
      <text
        x={cx}
        y={cy - 6}
        textAnchor="middle"
        fontFamily="Poppins"
        fontWeight="700"
        fontSize="30"
        fill={color}
      >
        {score}
      </text>
      <text
        x={cx}
        y={cy + 16}
        textAnchor="middle"
        fontFamily="Poppins"
        fontSize="13"
        fill="#9CA3AF"
      >
        / 100
      </text>
    </svg>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p style={S.statLabel}>{label}</p>
      <p style={S.statValue}>{value}</p>
    </div>
  );
}

function buildDonutData(alex, aurelie, commun) {
  const map = {};
  function add(expenses) {
    (expenses || []).forEach((e) => {
      const val = parseFloat(e.amount) || 0;
      if (val <= 0) return;
      const key = e.category || 'Autre';
      map[key] = (map[key] || 0) + val;
    });
  }
  add(alex.fixedExpenses);
  add(aurelie.fixedExpenses);
  add(commun.fixedExpenses);
  return Object.entries(map)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

const S = {
  page: { maxWidth: 900, margin: '0 auto', padding: '32px 24px 64px' },
  h1: { fontSize: 28, fontWeight: 700, marginBottom: 24, color: '#111827' },
  h2: { fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 20 },
  section: {
    background: '#fff',
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  healthRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 32,
    flexWrap: 'wrap',
  },
  healthInfo: { flex: 1, minWidth: 200 },
  healthLabel: { fontSize: 22, fontWeight: 700, marginBottom: 8 },
  healthText: { fontSize: 14, color: '#4B5563', lineHeight: 1.6, marginBottom: 16 },
  statsRow: { display: 'flex', gap: 24 },
  statLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: 2,
  },
  statValue: { fontSize: 18, fontWeight: 700, color: '#111827' },
  emptyBox: {
    background: '#fff',
    borderRadius: 12,
    padding: '48px 24px',
    textAlign: 'center',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  emptyText: { fontSize: 15, color: '#9CA3AF', lineHeight: 1.6 },
};
