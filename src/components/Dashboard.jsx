import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { personSummary, communSummary, healthScore } from '../utils/calculations';
import { CHART_COLORS } from '../utils/categories';

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

const fmt = (n) =>
  (parseFloat(n) || 0).toLocaleString('fr-CA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }) + ' $';

const fmtTooltip = (v) => [
  (parseFloat(v) || 0).toLocaleString('fr-CA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + ' $',
];

export default function Dashboard({ alex, aurelie, commun }) {
  const alexSum   = personSummary(alex);
  const aurelieSum = personSummary(aurelie);
  const comSum    = communSummary(commun);
  const health    = healthScore(alex, aurelie, commun);

  const hasData =
    alexSum.revenue > 0 || aurelieSum.revenue > 0 || comSum.totalContributions > 0;

  const barData = [
    { name: 'Alex',    Revenus: alexSum.revenue,   Charges: alexSum.charges,   Épargne: alexSum.savings },
    { name: 'Aurélie', Revenus: aurelieSum.revenue, Charges: aurelieSum.charges, Épargne: aurelieSum.savings },
    { name: 'Commun',  Revenus: comSum.totalContributions, Charges: comSum.charges, Épargne: comSum.savings },
  ];

  const donutData = buildDonutData(alex, aurelie, commun);

  return (
    <div style={S.page}>
      <div style={S.titleWrap}>
        <div style={S.eyebrow}>Avril 2026 · Vue globale</div>
        <h1 style={S.h1}>Dashboard</h1>
      </div>

      {!hasData && (
        <div style={S.card}>
          <p style={S.emptyText}>
            Renseignez vos données dans les onglets Alex, Aurélie et Commun pour voir vos graphiques.
          </p>
        </div>
      )}

      {hasData && health && (
        <>
          {/* Health gauge */}
          <div style={S.card}>
            <div style={S.healthWrap}>
              <HealthGauge score={health.score} color={health.color} />
              <div style={S.healthInfo}>
                <div style={S.eyebrow}>Santé financière</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: health.color }} />
                  <span style={{ ...S.healthLabel, color: health.color }}>{health.label}</span>
                </div>
                <p style={S.healthText}>{health.comment}</p>
                <div style={S.statsRow}>
                  <div>
                    <div style={S.statLabel}>Taux d'épargne</div>
                    <div style={{ ...S.statValue, color: P.violet }}>
                      {(health.savingsRate * 100).toFixed(1)} %
                    </div>
                  </div>
                  <div>
                    <div style={S.statLabel}>Charges / Rev.</div>
                    <div style={{ ...S.statValue, color: P.ink }}>
                      {(health.chargesRate * 100).toFixed(1)} %
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bar chart */}
          <div style={S.card}>
            <div style={S.cardHead}>
              <div>
                <div style={S.eyebrow}>Flux mensuels</div>
                <div style={S.cardTitle}>Revenus · Charges · Épargne</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData} margin={{ top: 18, right: 16, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="0" stroke={P.divider} vertical={false} />
                <XAxis dataKey="name" tick={{ fontFamily: 'Poppins', fontSize: 13, fill: P.ink }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontFamily: 'Poppins', fontSize: 11, fill: P.faint }}
                  tickFormatter={(n) => n === 0 ? '0' : `${(n/1000).toFixed(0)}k`}
                  width={36}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={fmtTooltip}
                  contentStyle={{
                    fontFamily: 'Poppins',
                    borderRadius: 10,
                    border: `0.5px solid ${P.border}`,
                    fontSize: 13,
                    background: P.surface,
                    color: P.ink,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                  cursor={{ fill: P.divider }}
                />
                <Legend
                  wrapperStyle={{ fontFamily: 'Poppins', fontSize: 12, color: P.muted }}
                  iconType="square"
                  iconSize={8}
                />
                <Bar dataKey="Revenus" fill={P.ink}   radius={[4, 4, 0, 0]} />
                <Bar dataKey="Charges" fill={P.red}   radius={[4, 4, 0, 0]} />
                <Bar dataKey="Épargne" fill={P.violet} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Donut */}
          {donutData.length > 0 && (
            <div style={S.card}>
              <div style={S.cardHead}>
                <div>
                  <div style={S.eyebrow}>Dépenses du mois</div>
                  <div style={S.cardTitle}>Par catégorie</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                  >
                    {donutData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={fmtTooltip}
                    contentStyle={{
                      fontFamily: 'Poppins',
                      borderRadius: 10,
                      border: `0.5px solid ${P.border}`,
                      fontSize: 13,
                      background: P.surface,
                      color: P.ink,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontFamily: 'Poppins', fontSize: 12, color: P.muted }}
                    iconType="square"
                    iconSize={8}
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

function HealthGauge({ score, color }) {
  const R = 70;
  const C = 2 * Math.PI * R;
  const offset = C * (1 - score / 100);
  return (
    <div style={{ position: 'relative', width: 160, height: 160, flexShrink: 0 }}>
      <svg width="160" height="160" viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="80" cy="80" r={R} stroke="#F0F0EB" strokeWidth="10" fill="none" />
        <circle
          cx="80" cy="80" r={R}
          stroke={color} strokeWidth="10" fill="none"
          strokeDasharray={C}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          fontFamily: 'Poppins, sans-serif',
          fontSize: 44, fontWeight: 600,
          color: '#1A1A1A', lineHeight: 1,
          letterSpacing: '-1.5px',
          fontVariantNumeric: 'tabular-nums',
        }}>{score}</div>
        <div style={{
          fontFamily: 'Poppins, sans-serif',
          fontSize: 10, fontWeight: 500,
          color: '#A8A8A3', letterSpacing: '0.08em',
          marginTop: 4, textTransform: 'uppercase',
        }}>sur 100</div>
      </div>
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
  card: {
    background: '#FFFFFF',
    borderRadius: 18,
    border: '0.5px solid #E8E8E3',
    padding: '20px 20px 22px',
    marginBottom: 14,
  },
  cardHead: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardTitle: {
    fontFamily: 'Poppins, sans-serif',
    fontSize: 16, fontWeight: 600,
    color: '#1A1A1A', letterSpacing: '-0.3px',
  },
  healthWrap: {
    display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
  },
  healthInfo: { flex: 1, minWidth: 180 },
  healthLabel: {
    fontFamily: 'Poppins, sans-serif',
    fontSize: 17, fontWeight: 600,
    letterSpacing: '-0.3px',
  },
  healthText: {
    fontFamily: 'Poppins, sans-serif',
    fontSize: 13, color: '#6B6B6B',
    lineHeight: 1.6, marginBottom: 16,
  },
  statsRow: { display: 'flex', gap: 24 },
  statLabel: {
    fontFamily: 'Poppins, sans-serif',
    fontSize: 10, color: '#A8A8A3',
    textTransform: 'uppercase', letterSpacing: '0.06em',
    marginBottom: 2,
  },
  statValue: {
    fontFamily: 'Poppins, sans-serif',
    fontSize: 18, fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
  },
  emptyText: {
    fontFamily: 'Poppins, sans-serif',
    fontSize: 14, color: '#A8A8A3',
    lineHeight: 1.6, textAlign: 'center',
    padding: '24px 0',
  },
};
