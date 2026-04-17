const DEFAULT_PERSON = {
  salary: 0,
  otherRevenues: [],
  fixedExpenses: [],
  allocations: [],
};

const DEFAULT_COMMUN = {
  alexContribution: 0,
  aurelieContribution: 0,
  fixedExpenses: [],
  projects: [],
};

export function loadData(key, defaultValue) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

export function saveData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('localStorage save error', e);
  }
}

export function loadPerson(name) {
  return loadData(`budget_${name}`, DEFAULT_PERSON);
}

export function savePerson(name, data) {
  saveData(`budget_${name}`, data);
}

export function loadCommun() {
  return loadData('budget_commun', DEFAULT_COMMUN);
}

export function saveCommun(data) {
  saveData('budget_commun', data);
}

export function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
