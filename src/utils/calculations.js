export function totalRevenue(person) {
  const recurring = person.otherRevenues
    .filter((r) => r.isRecurring)
    .reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
  return (parseFloat(person.salary) || 0) + recurring;
}

export function totalFixedExpenses(items) {
  return items.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
}

export function resolveAllocation(alloc, base) {
  const val = parseFloat(alloc.amount) || 0;
  if (alloc.isPercentage) return (base * val) / 100;
  return val;
}

export function totalAllocations(allocations, base) {
  return allocations.reduce((sum, a) => sum + resolveAllocation(a, base), 0);
}

export function personSummary(person) {
  const revenue = totalRevenue(person);
  const charges = totalFixedExpenses(person.fixedExpenses);
  const afterCharges = revenue - charges;
  const savings = totalAllocations(person.allocations, afterCharges);
  const available = afterCharges - savings;
  return { revenue, charges, savings, available, afterCharges };
}

export function communSummary(commun) {
  const total =
    (parseFloat(commun.alexContribution) || 0) +
    (parseFloat(commun.aurelieContribution) || 0);
  const charges = totalFixedExpenses(commun.fixedExpenses);
  const afterCharges = total - charges;
  const savings = commun.projects.reduce((sum, p) => {
    const val = parseFloat(p.amount) || 0;
    return sum + (p.isPercentage ? (afterCharges * val) / 100 : val);
  }, 0);
  const available = afterCharges - savings;
  return { total, charges, savings, available, afterCharges };
}

export function healthScore(alexPerson, aureliePerson, commun) {
  const alex = personSummary(alexPerson);
  const aurelie = personSummary(aureliePerson);
  const com = communSummary(commun);

  const totalRevenue = alex.revenue + aurelie.revenue + com.total;
  if (totalRevenue === 0) return { score: 0, label: 'Aucune donnée', color: '#ccc', comment: 'Renseignez vos revenus pour obtenir un score.' };

  const totalSavings = alex.savings + aurelie.savings + com.savings;
  const totalCharges = alex.charges + aurelie.charges + com.charges;

  const savingsRate = totalSavings / totalRevenue;
  const chargesRate = totalCharges / totalRevenue;

  let score = 50;
  if (savingsRate >= 0.2) score += 25;
  else if (savingsRate >= 0.1) score += 15;
  else if (savingsRate >= 0.05) score += 5;
  else score -= 10;

  if (chargesRate <= 0.4) score += 15;
  else if (chargesRate <= 0.6) score += 5;
  else score -= 15;

  const alexAvailRatio = alex.available / (alex.revenue || 1);
  const aurelieAvailRatio = aurelie.available / (aurelie.revenue || 1);
  if (alexAvailRatio > 0 && aurelieAvailRatio > 0) score += 10;
  else if (alexAvailRatio < 0 || aurelieAvailRatio < 0) score -= 15;

  score = Math.max(0, Math.min(100, score));

  let label, color, comment;
  if (score >= 80) {
    label = 'Excellent';
    color = '#06d6a0';
    comment = `Super ! Vous épargnez ${(savingsRate * 100).toFixed(0)}% de vos revenus et vos charges restent maîtrisées. Continuez ainsi !`;
  } else if (score >= 60) {
    label = 'Bon';
    color = '#43d9ad';
    comment = `Bonne situation globale. Vous pourriez augmenter votre épargne (actuellement ${(savingsRate * 100).toFixed(0)}%) pour sécuriser davantage votre avenir.`;
  } else if (score >= 40) {
    label = 'Correct';
    color = '#ffd166';
    comment = `Situation acceptable mais perfectible. Vos charges représentent ${(chargesRate * 100).toFixed(0)}% des revenus — essayez de les réduire ou d'augmenter vos économies.`;
  } else if (score >= 20) {
    label = 'Fragile';
    color = '#f77f00';
    comment = `Attention : vos charges sont élevées (${(chargesRate * 100).toFixed(0)}% des revenus) et votre épargne est faible. Il est temps de revoir certains postes.`;
  } else {
    label = 'Critique';
    color = '#ef476f';
    comment = `Situation budgétaire tendue. Vos dépenses dépassent ou consomment la quasi-totalité de vos revenus. Un rééquilibrage urgent est nécessaire.`;
  }

  return { score, label, color, comment, savingsRate, chargesRate };
}
