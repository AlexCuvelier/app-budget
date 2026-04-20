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

export function personSummary(person) {
  const revenue = parseFloat(person.salary) || 0;
  const charges = totalFixedExpenses(person.fixedExpenses);
  const savings = totalAllocations(person.allocations, revenue);
  const available = revenue - charges - savings;
  return { revenue, charges, savings, available };
}

export function communSummary(commun) {
  const c = commun.contributions || {};
  const totalContributions =
    (parseFloat(c.alex) || 0) +
    (parseFloat(c.aurelie) || 0) +
    (parseFloat(c.soWeLeft) || 0);
  const charges = totalFixedExpenses(commun.fixedExpenses);
  const base = totalContributions - charges;
  const savings = totalAllocations(commun.projects, Math.max(0, base));
  const available = base - savings;
  return { totalContributions, charges, savings, available, base };
}

export function healthScore(alexData, aurelieData, communData) {
  const alex = personSummary(alexData);
  const aurelie = personSummary(aurelieData);
  const com = communSummary(communData);

  const totalRevenue = alex.revenue + aurelie.revenue;
  if (totalRevenue === 0) return null;

  const totalSavings = alex.savings + aurelie.savings + com.savings;
  const totalCharges = alex.charges + aurelie.charges + com.charges;

  const savingsRate = totalSavings / totalRevenue;
  const chargesRate = totalCharges / totalRevenue;

  let score = 50;

  if (savingsRate >= 0.2) score += 25;
  else if (savingsRate >= 0.1) score += 15;
  else if (savingsRate >= 0.05) score += 5;
  else if (savingsRate < 0) score -= 15;

  if (chargesRate <= 0.4) score += 15;
  else if (chargesRate <= 0.6) score += 5;
  else if (chargesRate <= 0.8) score -= 10;
  else score -= 20;

  if (alex.available >= 0 && aurelie.available >= 0) score += 10;
  else if (alex.available < 0 || aurelie.available < 0) score -= 10;

  score = Math.max(0, Math.min(100, Math.round(score)));

  let label, color, comment;
  if (score >= 80) {
    label = 'Excellent';
    color = '#10B981';
    comment = `Excellent ! Vous épargnez ${(savingsRate * 100).toFixed(0)} % de vos revenus et vos charges restent bien maîtrisées.`;
  } else if (score >= 60) {
    label = 'Bon';
    color = '#34D399';
    comment = `Bonne situation. Augmenter l'épargne (actuellement ${(savingsRate * 100).toFixed(0)} %) renforcerait davantage votre sécurité financière.`;
  } else if (score >= 40) {
    label = 'Correct';
    color = '#F59E0B';
    comment = `Situation acceptable mais perfectible. Les charges représentent ${(chargesRate * 100).toFixed(0)} % des revenus — cherchez à réduire ou à épargner davantage.`;
  } else if (score >= 20) {
    label = 'Fragile';
    color = '#F97316';
    comment = `Attention : charges élevées (${(chargesRate * 100).toFixed(0)} % des revenus) et épargne insuffisante. Certains postes méritent révision.`;
  } else {
    label = 'Critique';
    color = '#EF4444';
    comment = 'Situation budgétaire tendue. Les dépenses consomment la quasi-totalité des revenus. Un rééquilibrage urgent est nécessaire.';
  }

  return { score, label, color, comment, savingsRate, chargesRate };
}
