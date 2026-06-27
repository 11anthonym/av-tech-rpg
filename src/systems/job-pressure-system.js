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

function resolvePressureResponseOutcome(option = {}, rollOverride = null) {
  state.flags = state.flags || {};
  state.stats = state.stats || {};
  if (option.energyCost) changeEnergy(-option.energyCost);
  const rollResult = rollImmediatePressureIncident(option, rollOverride);
  const incidentHappened = Boolean(rollResult?.happened);
  const controlled = option.controlled !== false && !incidentHappened;
  const detail = incidentHappened
    ? option.incidentResult || option.result || "The quick response created immediate pressure."
    : option.result || "The response is recorded.";

  if (incidentHappened) {
    applyReputationDelta(option.incidentReputation || {});
    if (option.incidentBurnout) state.burnout = Math.max(0, state.burnout + option.incidentBurnout);
    Object.assign(state.flags, option.incidentFlags || {});
  } else {
    applyReputationDelta(option.reputation || {});
    if (option.stat) state.stats[option.stat] = (state.stats[option.stat] || 0) + 1;
  }

  state.stats.fieldTaskChoicesMade = (state.stats.fieldTaskChoicesMade || 0) + 1;
  return {
    rollResult,
    incidentHappened,
    controlled,
    detail,
  };
}
