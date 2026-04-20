const DEFAULT_PERSON = {
  salary: '',
  fixedExpenses: [],
  allocations: [],
};

const DEFAULT_COMMUN = {
  contributions: { alex: '', aurelie: '', soWeLeft: '' },
  fixedExpenses: [],
  projects: [],
};

export function loadPerson(name) {
  try {
    const raw = localStorage.getItem(`budget_${name}`);
    if (!raw) return { ...DEFAULT_PERSON, fixedExpenses: [], allocations: [] };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PERSON, ...parsed };
  } catch {
    return { ...DEFAULT_PERSON, fixedExpenses: [], allocations: [] };
  }
}

export function savePerson(name, data) {
  try {
    localStorage.setItem(`budget_${name}`, JSON.stringify(data));
  } catch (e) {
    console.error('localStorage save error', e);
  }
}

export function loadCommun() {
  try {
    const raw = localStorage.getItem('budget_commun');
    if (!raw) return { ...DEFAULT_COMMUN, contributions: { ...DEFAULT_COMMUN.contributions }, fixedExpenses: [], projects: [] };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_COMMUN,
      ...parsed,
      contributions: { ...DEFAULT_COMMUN.contributions, ...(parsed.contributions || {}) },
    };
  } catch {
    return { ...DEFAULT_COMMUN, contributions: { ...DEFAULT_COMMUN.contributions }, fixedExpenses: [], projects: [] };
  }
}

export function saveCommun(data) {
  try {
    localStorage.setItem('budget_commun', JSON.stringify(data));
  } catch (e) {
    console.error('localStorage save error', e);
  }
}

export function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
