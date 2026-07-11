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

function getServiceFinalVerificationConfig() {
  return content.serviceDispatch.finalVerification || {};
}

function getServiceFinalVerificationChoice(choiceId) {
  return (getServiceFinalVerificationConfig().choices || []).find((choice) => choice.id === choiceId) || null;
}

function getServiceFinalVerification() {
  const result = state.flags.serviceFinalVerification;
  return result && typeof result === "object" ? result : null;
}

function recordServiceFinalVerification(result) {
  if (getServiceFinalVerification()) return getServiceFinalVerification();
  state.flags.serviceFinalVerification = {
    id: result.id || "unknown",
    label: result.label || "Final room test",
    status: result.status || "weak",
    detail: result.detail || "Final verification was recorded.",
    clock: state.clock,
  };
  return state.flags.serviceFinalVerification;
}

function getServiceFinalVerificationLabel(result = getServiceFinalVerification()) {
  if (!result) return "Not completed";
  return {
    confirmed: "Repair confirmed",
    quick: "Quick test held",
    recovered: "Weak result recovered",
    documented: "Weak result documented",
    weak: "Weak diagnosis exposed",
    skipped: "Room handed back unverified",
  }[result.status] || result.label || "Final verification recorded";
}

function isServiceFinalVerificationSafe(result = getServiceFinalVerification()) {
  return ["confirmed", "quick", "recovered"].includes(result?.status);
}

function getServiceCloseoutPathResult() {
  const method = getServiceRepairMethodLabel();
  const verification = getServiceFinalVerificationLabel();
  return `Repair: ${method}. Final test: ${verification}.`;
}

function getServiceFinalVerificationMarkup() {
  const result = getServiceFinalVerification();
  if (!result) return `<p class="muted">The installed room has not been tested for client handoff yet.</p>`;
  return `
    <h3>Final Room Test</h3>
    <ul class="modal-list">
      <li class="route-card ${isServiceFinalVerificationSafe(result) ? "" : "route-card-pressure"}">
        <strong>${escapeHtml(getServiceFinalVerificationLabel(result))}</strong>
        <span>${escapeHtml(result.detail)}</span>
      </li>
    </ul>
  `;
}

function getServiceFinalVerificationTaskModifiers(check) {
  if (check?.id !== "final-verification") return [];
  const modifiers = [];
  const addModifier = (modifier) => modifiers.push(normalizeTaskModifier({ consumesOnUse: false, energyDelta: 0, ...modifier }));
  const findings = getDiscoveredServiceDiagnosticEvidenceIds();
  if (state.flags.serviceApproach === "verify" && !state.flags.serviceVerificationStrained) {
    addModifier({
      id: "service-final-signal-proof",
      label: "Signal path already proven",
      source: "The selected repair method established a usable signal-path baseline before hardware moved.",
      statDelta: 1,
      resultText: "Earlier signal-path work gave the final room test a reliable baseline.",
    });
  } else if (state.flags.serviceApproach === "rush") {
    addModifier({
      id: "service-final-unproven-path",
      label: "Signal path not proven",
      source: "The repair began from the ticket instead of a complete path diagnosis.",
      statDelta: -1,
      resultText: "The unproven signal path made the final room test less forgiving.",
    });
  }
  if (!state.flags.serviceInstallStrained) {
    addModifier({
      id: "service-final-clean-install",
      label: "Clean replacement install",
      source: "The replacement hardware landed without a named install problem.",
      statDelta: 1,
      resultText: "The clean hardware install kept final verification focused on diagnosis.",
    });
  } else {
    addModifier({
      id: "service-final-strained-install",
      label: "Strained replacement install",
      source: "The replacement hardware fought the install and still needs proof under load.",
      statDelta: -1,
      resultText: "The strained install added uncertainty to the final room test.",
    });
  }
  if (findings.length >= 3) {
    addModifier({
      id: "service-final-room-findings",
      label: "Room findings connected",
      source: `${findings.length} room findings give the final test a clearer failure pattern to watch for.`,
      statDelta: 1,
      resultText: "The accumulated room findings made the final test more diagnostic.",
    });
  }
  return modifiers;
}

function getServiceQuickVerificationChance() {
  const config = getServiceFinalVerificationConfig().quickIncident || {};
  const phase = getServiceAppointmentPhase();
  let chance = config.baseChance || 0;
  if (state.flags.serviceApproach === "rush") chance += config.rushedApproachPenalty || 0;
  if (state.flags.serviceInstallStrained) chance += config.strainedInstallPenalty || 0;
  if (phase.id === "tight") chance += config.tightSchedulePenalty || 0;
  if (phase.id === "late") chance += config.lateSchedulePenalty || 0;
  if (getDiscoveredServiceDiagnosticEvidenceIds().length >= 3) chance -= config.evidenceReduction || 0;
  return Math.max(0.05, Math.min(0.85, chance));
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
