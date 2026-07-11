// Conshohocken diagnostic presentation and appointment pressure.
// Findings unlock repair methods; the visible workday clock determines room pressure.
function getServiceRepairApproachDefinitions() {
  return content.serviceDispatch.repairApproaches || [];
}

function getServiceRepairApproachById(approachId) {
  return getServiceRepairApproachDefinitions().find((approach) => approach.id === approachId) || null;
}

function getServiceRepairMethodLabel() {
  return getServiceRepairApproachById(state.flags.serviceRepairMethod)?.label
    || (state.flags.serviceApproach === "verify" ? "Verify the signal path" : state.flags.serviceApproach === "rush" ? "Trust the ticket and swap" : "Not selected");
}

function getServiceTraitRequirementLabel(traitId) {
  const creator = content.characterCreator || {};
  const pieces = [
    ...(creator.backgrounds || []),
    ...(creator.workStyles || []),
    ...(creator.traits || []),
  ];
  return pieces.find((piece) => piece.traits?.includes(traitId))?.name
    || traitId.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (letter) => letter.toUpperCase());
}

function getServiceBuildRequirementLabel(requirement = {}) {
  if (requirement.skillId) return `${getSkillDefinition(requirement.skillId)?.name || requirement.skillId} ${requirement.minimum || 1}`;
  if (requirement.toolId) return getToolDisplayName(requirement.toolId);
  if (requirement.traitId) return getServiceTraitRequirementLabel(requirement.traitId);
  return "Unknown build requirement";
}

function meetsServiceBuildRequirement(requirement = {}) {
  if (requirement.skillId) return getSkillValue(requirement.skillId) >= (requirement.minimum || 1);
  if (requirement.toolId) return ownsTool(requirement.toolId);
  if (requirement.traitId) return hasCharacterTrait(requirement.traitId);
  return false;
}

function getServiceRepairApproachStatus(approach) {
  if (!approach) return null;
  const missingEvidence = (approach.requiredEvidenceIds || [])
    .filter((evidenceId) => !hasServiceDiagnosticEvidence(evidenceId))
    .map(getServiceDiagnosticEvidenceById)
    .filter(Boolean);
  const requirements = approach.unlockAny || [];
  const matchedRequirement = requirements.find(meetsServiceBuildRequirement) || null;
  const buildUnlocked = !requirements.length || Boolean(matchedRequirement);
  const lockedReasons = [
    missingEvidence.length ? `Find: ${missingEvidence.map((evidence) => evidence.label).join(" and ")}` : "",
    !buildUnlocked ? `Build: ${requirements.map(getServiceBuildRequirementLabel).join(" or ")}` : "",
  ].filter(Boolean);
  return {
    approach,
    available: !missingEvidence.length && buildUnlocked,
    missingEvidence,
    buildUnlocked,
    matchedRequirement,
    unlockText: matchedRequirement
      ? `Unlocked by ${getServiceBuildRequirementLabel(matchedRequirement)}.`
      : requirements.length
      ? `Requires ${requirements.map(getServiceBuildRequirementLabel).join(" or ")}.`
      : "Available to every technician.",
    lockedReason: lockedReasons.join(" "),
  };
}

function getServiceRepairApproachStatuses() {
  return getServiceRepairApproachDefinitions().map(getServiceRepairApproachStatus);
}

function getServiceRepairApproachMarkup(statuses = getServiceRepairApproachStatuses()) {
  return `
    <h3>Repair Approaches</h3>
    <ul class="modal-list">
      ${statuses.map((status) => `
        <li class="${status.available ? "emphasis-next" : "emphasis-locked"}">
          <strong>${status.available ? "AVAILABLE" : "LOCKED"} - ${escapeHtml(status.approach.label)} (${escapeHtml(status.approach.branchLabel)})</strong>
          <span>${escapeHtml(status.approach.summary)}</span>
          <span>${escapeHtml(status.available ? status.unlockText : status.lockedReason)}</span>
        </li>
      `).join("")}
    </ul>
  `;
}

function getServiceRepairMethodCheckModifiers(check) {
  const method = getServiceRepairApproachById(state.flags.serviceRepairMethod);
  const modifier = method?.checkModifiers?.[check?.id] || method?.checkModifiers?.[check?.contextId];
  if (!modifier) return [];
  return [normalizeTaskModifier({
    id: `service-repair-${method.id}`,
    label: method.label,
    source: `${method.branchLabel} approach: ${method.summary}`,
    statDelta: modifier.statDelta || 0,
    energyDelta: modifier.energyDelta || 0,
    consumesOnUse: false,
    resultText: modifier.resultText || `${method.label} changed this field check.`,
  })];
}

function getServiceAppointmentConfig() {
  return content.serviceDispatch.appointment || {};
}

function getServiceClockMinutes(clock = state.clock) {
  const parts = getClockParts(clock);
  let hour = parts.hour % 12;
  if (parts.period === "PM") hour += 12;
  return hour * 60 + parts.minute;
}

function getServiceAppointmentDeadlineMinutes() {
  const appointment = getServiceAppointmentConfig();
  return (appointment.deadlineMinutes || 13 * 60) + (state.flags.serviceAppointmentExtensionMinutes || 0);
}

function getServiceAppointmentPhase(clock = state.clock) {
  const appointment = getServiceAppointmentConfig();
  const remaining = getServiceAppointmentDeadlineMinutes() - getServiceClockMinutes(clock);
  const phaseId = remaining <= 0 ? "late" : remaining <= (appointment.tightWindowMinutes || 90) ? "tight" : "calm";
  const phase = (appointment.phases || []).find((entry) => entry.id === phaseId) || {};
  return {
    id: phaseId,
    label: phase.label || (phaseId === "late" ? "Meeting In Progress" : phaseId === "tight" ? "Schedule Tightening" : "Room Available"),
    summary: phase.summary || "The room schedule is still readable.",
    remaining,
  };
}

function getServiceAppointmentMarkup() {
  const phase = getServiceAppointmentPhase();
  return `
    <h3>Client Schedule</h3>
    <ul class="modal-list">
      <li class="route-card ${phase.id === "calm" ? "" : "route-card-pressure"}">
        <strong>${escapeHtml(phase.label)}</strong>
        <span>${escapeHtml(phase.summary)}</span>
      </li>
    </ul>
  `;
}

function getServiceTimedActionEntries() {
  state.flags.serviceTimedActions ||= [];
  return state.flags.serviceTimedActions;
}

function spendServiceActionTime(actionId, minutes, label = "Service work") {
  if (!actionId || !minutes) return null;
  const entries = getServiceTimedActionEntries();
  const existing = entries.find((entry) => entry.id === actionId);
  if (existing) return existing;
  const beforePhase = getServiceAppointmentPhase();
  const clockBefore = state.clock;
  advanceClockMinutes(minutes);
  const afterPhase = getServiceAppointmentPhase();
  const entry = { id: actionId, minutes, label, clockBefore, clockAfter: state.clock };
  entries.push(entry);
  addLog(`${label} moved the service call from ${clockBefore} to ${state.clock}.`);
  if (beforePhase.id !== afterPhase.id) {
    addLog(`Client schedule changed: ${afterPhase.label}. ${afterPhase.summary}`);
  }
  return entry;
}

function getServiceActionMinutes(actionId) {
  return getServiceAppointmentConfig().actionMinutes?.[actionId] || 0;
}

function getServiceRepairMinutes(methodId) {
  return getServiceAppointmentConfig().repairMinutes?.[methodId] || 0;
}

function getServiceAppointmentTaskModifiers(check) {
  const phase = getServiceAppointmentPhase();
  const modifier = getServiceAppointmentConfig().taskModifiers?.[phase.id];
  if (!modifier || !check) return [];
  return [normalizeTaskModifier({
    id: `service-appointment-${phase.id}`,
    label: phase.label,
    source: phase.summary,
    statDelta: modifier.statDelta || 0,
    energyDelta: modifier.energyDelta || 0,
    consumesOnUse: false,
    resultText: modifier.resultText || `${phase.label} affected the work in the room.`,
  })];
}

function getServiceRiskyRepairIncident(method, rollOverride = null) {
  if (!method || method.canonicalApproach !== "rush") return null;
  const phase = getServiceAppointmentPhase();
  const incident = getServiceAppointmentConfig().riskyRepairIncident || {};
  const chance = incident.chanceByPhase?.[phase.id] || 0;
  if (!chance) return null;
  const roll = Number.isFinite(rollOverride)
    ? rollOverride
    : getSeededUnit(getServiceRoomSeed(), `appointment:${method.id}:${phase.id}`);
  const rollResult = rollImmediatePressureIncident({ incidentChance: chance }, roll);
  if (!rollResult?.happened) return { phase, rollResult, happened: false };
  const condition = { id: "appointment-pressure", label: phase.label };
  const option = {
    id: method.id,
    label: method.label,
    incidentResult: incident.resultByPhase?.[phase.id] || "The quick repair collides with the client schedule, and the room reacts before closeout.",
    incidentLog: incident.log || "Immediate service pressure: a rushed repair collided with the client meeting window.",
    incidentFlags: { serviceClientAngry: true, serviceInstallStrained: true },
  };
  Object.assign(state.flags, Object.fromEntries(Object.keys(option.incidentFlags).map((key) => [key, true])));
  applyReputationDelta({ clients: -1 });
  const detail = recordServiceRoomIncident(condition, option, rollResult);
  return { phase, rollResult, happened: true, detail };
}
