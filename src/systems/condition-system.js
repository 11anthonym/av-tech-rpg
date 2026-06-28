// Condition, stat-modifier, movement-pressure, and energy-consequence helpers.
// This is the RPG pressure layer that makes tools, traits, fatigue, and overexertion matter.
function getTrainingModifier(modifier) {
  return state.training.reduce((total, trainingId) => (
    total + (content.career.trainingChoices.find((choice) => choice.id === trainingId)?.modifiers?.[modifier] || 0)
  ), 0);
}

function getMaxEnergy() {
  return state.technician.stats.energy + getTrainingModifier("maxEnergy");
}

function getCraftsmanship() {
  return state.technician.stats.craftsmanship + getTrainingModifier("craftsmanship");
}

function getConfidence() {
  return state.technician.stats.confidence + getTrainingModifier("confidence");
}

function canUseMakeThatWorkShortcut() {
  return hasCharacterTrait("makeThatWork") && getCharacterStat("improvisation") >= 4;
}

function canUsePressureChoice() {
  return getConfidence() >= 2 || hasCharacterTrait("calmUnderFire") || getSkillValue("clientCommunication") >= 4;
}

function getDocumentationHabitReduction() {
  return state.stats.accessRisksDocumented + state.stats.accessDelaysDocumented >= 2 ? 1 : 0;
}

function getDocumentationTraitReduction() {
  return hasAnyCharacterTrait(["notebookHabit", "byTheBook"]) ? 1 : 0;
}

function getDocumentationSupportReduction() {
  return Math.min(1, getDocumentationHabitReduction() + getDocumentationTraitReduction());
}

function getCarefulWorkReduction() {
  return state.stats.carefulFinishes >= 2 ? 1 : 0;
}

function getCarefulTraitReduction() {
  return hasCharacterTrait("measureTwice") ? 1 : 0;
}

function getCarefulTaskReduction() {
  return Math.min(1, getCarefulWorkReduction() + getCarefulTraitReduction());
}

function getLongCarryPenalty(baseCost) {
  return hasCharacterTrait("badKnees") && baseCost >= 3 ? 1 : 0;
}

function getEquipmentEnergyCost(baseCost) {
  return Math.max(0, baseCost - getToolModifier("pickupEnergyReduction") + getLongCarryPenalty(baseCost));
}

function getAssemblyEnergyCost(baseCost) {
  return Math.max(0, baseCost - getToolModifier("assemblyEnergyReduction"));
}

function getVerificationEnergyCost(baseCost) {
  const partsBrainReduction = hasActivePartsBrainFind() ? getToolModifier("partsBrainVerificationReduction") : 0;
  return Math.max(0, baseCost - getToolModifier("verificationEnergyReduction") - partsBrainReduction);
}

function getServiceDiagnosisEnergyCost(baseCost) {
  const preparationBonus = ["review", "contact"].includes(state.flags.servicePreparation) ? 1 : 0;
  return Math.max(0, baseCost - preparationBonus);
}

function getServiceVerificationEnergyCost(baseCost) {
  return Math.max(0, getVerificationEnergyCost(baseCost) - (state.flags.servicePreparation === "josh" ? 1 : 0));
}

function getMovementPressureDetails() {
  if (!state.technician) return [];
  const details = [];
  const carryCount = state.carry.length;
  if (carryCount) {
    details.push({
      id: "carry",
      label: "Carrying gear",
      detail: `${getCarriedLabels().join(" + ")} slows movement until it is loaded or placed.`,
      speedDelta: -Math.min(2, carryCount),
    });
  }
  if (state.energy <= 0 || state.flags.energyExhaustedThisShift) {
    details.push({
      id: "exhausted",
      label: "Exhausted",
      detail: "Energy hit zero this shift, so every walk takes more out of the tech.",
      speedDelta: -2,
    });
  } else if (state.energy <= Math.ceil(getMaxEnergy() * LOW_ENERGY_SPEED_THRESHOLD)) {
    details.push({
      id: "lowEnergy",
      label: "Low energy",
      detail: `${state.energy}/${getMaxEnergy()} energy makes the room feel slower.`,
      speedDelta: -1,
    });
  }
  if (state.burnout >= HIGH_BURNOUT_SPEED_THRESHOLD) {
    details.push({
      id: "burnout",
      label: "High burnout",
      detail: `Burnout ${state.burnout} makes repeated movement drag.`,
      speedDelta: -1,
    });
  }
  if (carryCount && hasCharacterTrait("badKnees")) {
    details.push({
      id: "badKneesCarry",
      label: "Bad knees carry",
      detail: "This build plans access well, but loaded walks hit harder.",
      speedDelta: -1,
    });
  }
  return details;
}

function getMovementPressureDelta(details = getMovementPressureDetails()) {
  return details.reduce((total, detail) => total + detail.speedDelta, 0);
}

function getMovementSpeed() {
  return Math.max(MIN_PLAYER_SPEED, PLAYER_SPEED + getMovementPressureDelta());
}

function getConditionPressureSummary() {
  const details = getMovementPressureDetails();
  if (!details.length) return "";
  const reasonText = details.map((detail) => detail.label).join(", ");
  return `${reasonText}. Walk speed ${getMovementSpeed()}/${PLAYER_SPEED} (${formatSignedNumber(getMovementPressureDelta(details))}).`;
}

function getDailyConditionPrepText({ includeClean = false } = {}) {
  if (!state.technician) return includeClean ? "No technician selected yet." : "";
  const notes = [];
  const conditionSkillPressure = typeof getConditionSkillPressureSummary === "function"
    ? getConditionSkillPressureSummary()
    : "";
  const exhaustionPenalty = getExhaustionSkillPenalty();
  const movementPressure = getConditionPressureSummary();
  if (conditionSkillPressure) notes.push(`Field checks: ${conditionSkillPressure}`);
  if (state.flags.energyExhaustedThisShift || exhaustionPenalty) {
    notes.push(`Zero-energy pressure: ${exhaustionPenalty ? `skill checks are at -${exhaustionPenalty}; ` : ""}ordinary rest is capped unless you take recovery.`);
  }
  if (movementPressure) notes.push(`Movement: ${movementPressure}`);
  if (state.flags.shiftPrepActive) {
    notes.push("Next-shift prep is active: Fieldcraft and Documentation get support until this job closes.");
  }
  if (!notes.length && includeClean) {
    return "Ready: no active low-energy, burnout, exhaustion, carry, or prep pressure is changing this route.";
  }
  return notes.join(" ");
}

function markEnergyCrash() {
  if (state.flags.energyExhaustedThisShift) return;
  state.flags.energyExhaustedThisShift = true;
  state.stats.energyCrashes = (state.stats.energyCrashes || 0) + 1;
  addLog("Energy hit zero. Further effort starts borrowing from tomorrow.");
}

function recordExhaustionMistake() {
  const riskId = `exhaustion-${getCurrentDispatchKey()}`;
  if (!state.flags.returnTripRisks?.[riskId]) {
    state.stats.callbacks += 1;
    state.stats.exhaustionMistakes = (state.stats.exhaustionMistakes || 0) + 1;
    recordReturnTripRisk(riskId, {
      source: "Zero-energy overrun",
      detail: "A tired closeout left enough uncertainty to create return-trip pressure.",
    });
    addLog("Exhaustion mistake: a tired closeout created return-trip risk.");
  } else {
    state.reputation.clients -= 1;
    addLog("Exhaustion mistake: the client noticed the closeout getting thin.");
  }
}

function recordExhaustionIncident() {
  const incidentNumber = (state.flags.exhaustionIncidentsThisShift || 0) + 1;
  state.flags.exhaustionIncidentsThisShift = incidentNumber;
  state.stats.exhaustionIncidents = (state.stats.exhaustionIncidents || 0) + 1;
  const consequence = (incidentNumber - 1) % 3;
  if (consequence === 0) {
    state.reputation.management -= 1;
    addLog("Exhaustion incident: coordination noticed the job getting messy.");
  } else if (consequence === 1) {
    recordExhaustionMistake();
  } else {
    state.reputation.coworkers -= 1;
    addLog("Exhaustion incident: the crew will need to untangle part of the handoff.");
  }
}

function applyExhaustionPressure(unpaidEnergy) {
  if (!unpaidEnergy) return;
  state.flags.exhaustionPressureDebt = (state.flags.exhaustionPressureDebt || 0) + unpaidEnergy;
  const incidentGain = Math.floor(state.flags.exhaustionPressureDebt / EXHAUSTION_PRESSURE_PER_INCIDENT);
  if (!incidentGain) return;
  state.flags.exhaustionPressureDebt %= EXHAUSTION_PRESSURE_PER_INCIDENT;
  for (let index = 0; index < incidentGain; index += 1) recordExhaustionIncident();
}

function changeEnergy(amount) {
  const beforeEnergy = state.energy;
  const maxEnergy = getMaxEnergy();
  state.energy = Math.max(0, Math.min(maxEnergy, state.energy + amount));
  if (amount >= 0) return;

  if (state.energy === 0) markEnergyCrash();

  const unpaidEnergy = Math.max(0, Math.abs(amount) - beforeEnergy);
  if (!unpaidEnergy) return;
  applyExhaustionPressure(unpaidEnergy);
  state.flags.exhaustionDebt = (state.flags.exhaustionDebt || 0) + unpaidEnergy;
  const burnoutGain = Math.floor(state.flags.exhaustionDebt / EXHAUSTION_DEBT_PER_BURNOUT);
  if (!burnoutGain) return;
  state.flags.exhaustionDebt %= EXHAUSTION_DEBT_PER_BURNOUT;
  state.burnout += burnoutGain;
  state.stats.exhaustionBurnout = (state.stats.exhaustionBurnout || 0) + burnoutGain;
  addLog(`Overexertion added ${burnoutGain} burnout.`);
}
