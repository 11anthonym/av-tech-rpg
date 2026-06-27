// Job-pressure helpers own small reusable pieces for RPG uncertainty.
// Dispatches still own their room-specific choices, copy, and consequences.
function formatChance(chance = 0) {
  return `${Math.round(chance * 100)}%`;
}

function getSeededUnit(seed, salt = "") {
  let hash = 2166136261;
  const input = `${seed}:${salt}`;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return ((hash >>> 0) % 1000000) / 1000000;
}

function getRolledPressureConditionIds(conditions = [], seed = 1, { limit = 2 } = {}) {
  return conditions
    .filter((condition) => condition?.id)
    .map((condition) => ({ id: condition.id, roll: getSeededUnit(seed, condition.id) }))
    .sort((a, b) => a.roll - b.roll || a.id.localeCompare(b.id))
    .slice(0, limit)
    .map((condition) => condition.id);
}

function rollImmediatePressureIncident(option = {}, rollOverride = null) {
  const chance = option.incidentChance || 0;
  if (!chance) return null;
  const roll = Number.isFinite(rollOverride) ? rollOverride : Math.random();
  return {
    roll,
    chance,
    happened: roll < chance,
  };
}

function getPressureIncidentId(incident = {}, index = 0, fallbackPrefix = "incident") {
  return incident.id || `${incident.conditionId || fallbackPrefix}-${incident.actionId || "action"}-${index + 1}`;
}
