import { SAVINGS_CATEGORY_SET } from './categories';

export function totalFixedExpenses(items) {
  return (items || []).reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
}

export function resolveAllocation(alloc, base) {
  const val = parseFloat(alloc.value) || 0;
  return alloc.type === 'percent' ? (base * val) / 100 : val;
}

export function totalAllocations(allocations, base) {
  return (allocations || []).reduce((sum, a) => sum + resolveAllocation(a, base), 0);
}

export function splitAllocations(allocations, base) {
  let savings = 0, alloc = 0;
  (allocations || []).forEach((a) => {
    const val = resolveAllocation(a, base);
    if (SAVINGS_CATEGORY_SET.has(a.category)) savings += val;
    else alloc += val;
  });
  return { savings, allocations: alloc };
}

export function personSummary(person) {
  const revenue = parseFloat(person.salary) || 0;
  const charges = totalFixedExpenses(person.fixedExpenses);
  const { savings, allocations } = splitAllocations(person.allocations, revenue);
  const available = revenue - charges - savings - allocations;
  return { revenue, charges, savings, allocations, available };
}

export function communSummary(commun) {
  const c = commun.contributions || {};
  const totalContributions =
    (parseFloat(c.alex) || 0) +
    (parseFloat(c.aurelie) || 0) +
    (parseFloat(c.soWeLeft) || 0);
  const charges = totalFixedExpenses(commun.fixedExpenses);
  const base = totalContributions - charges;
  const { savings, allocations } = splitAllocations(commun.projects, Math.max(0, base));
  const available = base - savings - allocations;
  return { totalContributions, charges, savings, allocations, available, base };
}

export function healthScore(alexData, aurelieData, communData) {
  const alex = personSummary(alexData);
  const aurelie = personSummary(aurelieData);
  const com = communSummary(communData);

  const totalRevenue = alex.revenue + aurelie.revenue;
  if (totalRevenue === 0) return null;

  const totalCharges = alex.charges + aurelie.charges + com.charges;
  const totalSavings = alex.savings + aurelie.savings + com.savings;
  const totalAlloc = alex.allocations + aurelie.allocations + com.allocations;
  const totalAvailable = alex.available + aurelie.available + com.available;

  const chargesRate = totalCharges / totalRevenue;
  const savingsRate = totalSavings / totalRevenue;
  const allocRate = totalAlloc / totalRevenue;
  const availableRate = totalAvailable / totalRevenue;

  // Charges component (0–25)
  let chargesScore;
  if (chargesRate <= 0.35) chargesScore = 25;
  else if (chargesRate <= 0.50) chargesScore = 18;
  else if (chargesRate <= 0.65) chargesScore = 10;
  else if (chargesRate <= 0.80) chargesScore = 4;
  else chargesScore = 0;

  // Savings component (0–30)
  let savingsScore;
  if (savingsRate >= 0.20) savingsScore = 30;
  else if (savingsRate >= 0.10) savingsScore = 20;
  else if (savingsRate >= 0.05) savingsScore = 10;
  else if (savingsRate >= 0) savingsScore = 3;
  else savingsScore = 0;

  // Allocations component (0–20) — reasonable day-to-day budget
  let allocScore;
  if (allocRate >= 0.05 && allocRate <= 0.25) allocScore = 20;
  else if (allocRate > 0.25 && allocRate <= 0.35) allocScore = 12;
  else if (allocRate < 0.05) allocScore = 8;
  else allocScore = 4;

  // Available component (0–25) — remaining buffer
  let availScore;
  if (availableRate >= 0.10) availScore = 25;
  else if (availableRate >= 0.05) availScore = 18;
  else if (availableRate >= 0) availScore = 10;
  else if (availableRate >= -0.05) availScore = 3;
  else availScore = 0;

  const score = Math.max(0, Math.min(100, chargesScore + savingsScore + allocScore + availScore));

  const color = 'oklch(0.58 0.24 295)';
  let label, comment;
  if (score >= 80) {
    label = 'Situation saine';
    comment = `Excellent ! Vous épargnez ${(savingsRate * 100).toFixed(0)} % de vos revenus, vos charges sont maîtrisées (${(chargesRate * 100).toFixed(0)} %) et il reste ${(availableRate * 100).toFixed(0)} % de marge disponible.`;
  } else if (score >= 60) {
    label = 'Bonne situation';
    comment = `Bonne situation. Épargne : ${(savingsRate * 100).toFixed(0)} %, charges : ${(chargesRate * 100).toFixed(0)} %. Augmenter l'épargne ou réduire les allocations variables renforcerait votre sécurité.`;
  } else if (score >= 40) {
    label = 'Correct';
    comment = `Situation acceptable. Charges : ${(chargesRate * 100).toFixed(0)} %, épargne : ${(savingsRate * 100).toFixed(0)} %, allocations : ${(allocRate * 100).toFixed(0)} %. Cherchez à rééquilibrer.`;
  } else if (score >= 20) {
    label = 'Fragile';
    comment = `Attention : charges élevées (${(chargesRate * 100).toFixed(0)} %) et épargne faible (${(savingsRate * 100).toFixed(0)} %). La marge disponible est insuffisante.`;
  } else {
    label = 'Critique';
    comment = 'Situation budgétaire tendue. Les dépenses consomment la quasi-totalité des revenus. Un rééquilibrage urgent est nécessaire.';
  }

  return { score, label, color, comment, savingsRate, chargesRate, allocRate, availableRate };
}
