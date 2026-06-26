// Progression, skill, company-pressure, and career-readout helpers for the RPG layer.
// They depend on app.js globals and are loaded before gameplay systems render cards or choices.
function getCareerLevel(xp = state.xp) {
  return content.career.ranks.reduce((level, rank) => xp >= rank.xpRequired ? rank.level : level, 1);
}

function getCareerRank(level = getCareerLevel()) {
  return content.career.ranks.find((rank) => rank.level === level) || content.career.ranks[0];
}

function getNextCareerRank() {
  return content.career.ranks.find((rank) => rank.level > getCareerLevel()) || null;
}

function hasPendingTraining() {
  return state.training.length < getCareerLevel() - 1;
}

function formatCash(amount) {
  return amount < 0 ? `-$${Math.abs(amount)}` : `$${amount}`;
}

function uniqueValues(values) {
  return [...new Set(values.filter(Boolean))];
}

function ownsTool(toolId) {
  return state.tools.includes(toolId);
}

function getToolModifier(modifier) {
  return state.tools.reduce((total, toolId) => total + (content.tools[toolId]?.modifiers?.[modifier] || 0), 0);
}

function getCharacterLine(lineId, fallback = "") {
  if (!state.technician) return fallback;
  return content.characterLines?.[state.technician.id]?.[lineId] || fallback;
}

function hasSeenCharacterLine(lineId) {
  state.flags.characterLinesSeen ||= {};
  return Boolean(state.flags.characterLinesSeen[lineId]);
}

function markCharacterLineSeen(lineId) {
  state.flags.characterLinesSeen ||= {};
  state.flags.characterLinesSeen[lineId] = true;
}

function hasCharacterTrait(traitId) {
  return state.technician?.traits?.includes(traitId) || false;
}

function hasAnyCharacterTrait(traitIds) {
  return traitIds.some((traitId) => hasCharacterTrait(traitId));
}

function getCharacterStat(statId) {
  return state.technician?.characterStats?.[statId] || 0;
}

function getSkillDefinitions() {
  return content.career.skills || [];
}

function getSkillDefinition(skillId) {
  return getSkillDefinitions().find((skill) => skill.id === skillId);
}

function getFallbackSkillValue(skillId) {
  if (!state.technician) return 0;
  if (skillId === "install") return Math.max(1, state.technician.stats.craftsmanship || 0);
  if (skillId === "troubleshooting") return Math.max(1, (state.technician.stats.confidence || 0) + 1);
  if (skillId === "documentation") return Math.max(1, state.technician.stats.confidence || 0);
  if (skillId === "clientCommunication") return Math.max(1, (state.technician.stats.confidence || 0) + 1);
  if (skillId === "fieldcraft") return Math.max(1, Math.floor((state.technician.stats.energy || 100) / 45));
  return 0;
}

function getTrainingSkillBonus(skillId) {
  return state.training.reduce((total, trainingId) => {
    const choice = content.career.trainingChoices.find((item) => item.id === trainingId);
    return total + (choice?.skillBonuses?.[skillId] || 0);
  }, 0);
}

function getToolSkillBonus(skillId) {
  const staticBonus = state.tools.reduce((total, toolId) => (
    total + (content.tools[toolId]?.skillBonuses?.[skillId] || 0)
  ), 0);
  const activeBonus = skillId === "troubleshooting" && hasActivePartsBrainFind() ? 1 : 0;
  return staticBonus + activeBonus;
}

function getSkillValue(skillId) {
  return (getCharacterStat(skillId) || getFallbackSkillValue(skillId))
    + getTrainingSkillBonus(skillId)
    + getToolSkillBonus(skillId)
    + getShiftPrepSkillBonus(skillId);
}

function getTraitContextBonus(skillId, contextId = "") {
  return (state.technician?.traits || []).reduce((total, traitId) => (
    total + (content.traitContextBonuses?.[traitId] || []).reduce((traitTotal, rule) => {
      if (rule.skillId !== skillId) return traitTotal;
      if (!rule.contextIds?.includes(contextId)) return traitTotal;
      return traitTotal + (rule.bonus || 0);
    }, 0)
  ), 0);
}

function getExhaustionSkillPenalty() {
  const zeroPenalty = state.energy <= 0 ? 1 : 0;
  const incidentPenalty = state.flags.exhaustionIncidentsThisShift || 0;
  return Math.min(MAX_EXHAUSTION_SKILL_PENALTY, zeroPenalty + incidentPenalty);
}

function getExhaustionPressureMarkup() {
  if (!state.flags.energyExhaustedThisShift && !state.flags.exhaustionIncidentsThisShift) return "";
  const penalty = getExhaustionSkillPenalty();
  const cap = getExhaustionEnergyCap();
  return `<p class="expense"><strong>Zero-energy pressure:</strong> ordinary rest is capped at ${cap}/${getMaxEnergy()} energy tomorrow${penalty ? `, and skill checks are at -${penalty}` : ""}. Recovery day clears the pressure.</p>`;
}

function getSkillSummaryMarkup() {
  return `
    <ul class="modal-list">
      ${getSkillDefinitions().map((skill) => `
        <li><strong>${skill.branch}: ${skill.name} ${getSkillValue(skill.id)}</strong><span>${skill.description}</span></li>
      `).join("")}
    </ul>
  `;
}

function formatSignedNumber(value) {
  return value > 0 ? `+${value}` : `${value}`;
}

function formatReputation(value) {
  return value > 0 ? `+${value}` : `${value}`;
}

function formatReputationDelta(reputation) {
  return `Client ${formatReputation(reputation.clients || 0)} / Team ${formatReputation(reputation.coworkers || 0)} / Mgmt ${formatReputation(reputation.management || 0)}`;
}

function getSkillBonusLabel(skillBonuses = {}) {
  const entries = Object.entries(skillBonuses).filter(([, bonus]) => bonus);
  if (!entries.length) return "";
  return ` Skill bonus: ${entries.map(([skillId, bonus]) => {
    const skill = getSkillDefinition(skillId);
    return `${skill?.name || skillId} ${formatSignedNumber(bonus)}`;
  }).join(", ")}.`;
}

function getToolEffectText(tool) {
  return `${tool.effect}${getSkillBonusLabel(tool.skillBonuses)}`;
}

function getDocumentedRiskCount() {
  return (state.stats.accessRisksDocumented || 0)
    + (state.stats.accessDelaysDocumented || 0)
    + (state.stats.documentedTaskRisks || 0);
}

function getCareerGoalValue(metric) {
  if (metric === "xp") return state.xp;
  if (metric === "jobsCompleted") return state.jobsCompleted;
  if (metric === "clientReputation") return state.reputation.clients;
  if (metric === "coworkerReputation") return state.reputation.coworkers;
  if (metric === "managementReputation") return state.reputation.management;
  if (metric === "documentedRisks") return getDocumentedRiskCount();
  if (metric === "ownedTools") return state.tools.length;
  if (metric === "ownedPaidTools") return state.tools.filter((toolId) => (content.tools[toolId]?.price || 0) > 0).length;
  return state.stats[metric] || 0;
}

function getCareerGoalStatus(goal) {
  return getCareerGoalValue(goal.metric) >= goal.target ? "[COMPLETE]" : "[ACTIVE]";
}

function getCareerGoalsMarkup() {
  const goals = content.career.goals || [];
  if (!goals.length) return `<p class="muted">No career goal tracks are configured yet.</p>`;
  return `
    <ul class="modal-list">
      ${goals.map((goal) => {
        const value = getCareerGoalValue(goal.metric);
        const displayValue = Math.max(0, value);
        const setbackNote = value < 0 ? " Current standing is below zero, so repair the relationship before this track can advance." : "";
        return `<li><strong>${getCareerGoalStatus(goal)} ${goal.name}: ${displayValue}/${goal.target}</strong><span>${goal.reward}${setbackNote}</span></li>`;
      }).join("")}
    </ul>
  `;
}

function getCurrentCompany() {
  return content.companies?.[content.currentCompanyId] || null;
}

function getCompanyPressureRules() {
  return getCurrentCompany()?.pressureRules || [];
}

function getCompanyPressureMarkup({ compact = false } = {}) {
  const rules = getCompanyPressureRules();
  if (!rules.length) return "";
  const visibleRules = compact ? rules.slice(0, 2) : rules;
  return `
    <ul class="modal-list">
      ${visibleRules.map((rule) => `
        <li><strong>${rule.name}</strong><span>${rule.trigger} ${rule.fieldReality}</span></li>
      `).join("")}
    </ul>
  `;
}

function getCompanyDispatchPressureMarkup() {
  const rules = getCompanyPressureRules().slice(0, 2);
  if (!rules.length) return "";
  return `
    <li><strong>Company pressure</strong><span>${rules.map((rule) => `${rule.name}: ${rule.trigger}`).join(" ")}</span></li>
  `;
}

function getCompanyProfileMarkup() {
  const company = getCurrentCompany();
  if (!company) return `<p class="muted">No current company profile configured.</p>`;
  return `
    <div class="results-grid">
      <span>Employer</span><strong>${company.name}</strong>
      <span>Culture</span><strong>${company.culture}</strong>
      <span>Home base</span><strong>${company.homeBase}</strong>
      <span>Pressure</span><strong>${company.reputationPressure}</strong>
    </div>
    <p class="muted">${company.summary}</p>
    ${getCompanyPressureRules().length ? `<p><strong>Company pressure rules:</strong></p>${getCompanyPressureMarkup()}` : ""}
  `;
}

function getBuildIdentityMarkup() {
  const rankedSkills = getSkillDefinitions()
    .map((skill) => ({ ...skill, value: getSkillValue(skill.id) }))
    .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name));
  const reputationLean = [
    { name: "Client", value: state.reputation.clients },
    { name: "Team", value: state.reputation.coworkers },
    { name: "Management", value: state.reputation.management },
  ].sort((a, b) => b.value - a.value || a.name.localeCompare(b.name))[0];
  const openCallbacks = getUnresolvedCallbackCount();
  const workStyle = openCallbacks > 0
    ? "Callback debt"
    : getDocumentedRiskCount() >= 2
    ? "Documentation-minded"
    : state.stats.carefulFinishes >= 2
    ? "Careful closer"
    : state.reputation.coworkers >= 2
    ? "Crew-trusted"
    : "Early-career generalist";
  return `
    <div class="results-grid">
      <span>Primary branch</span><strong>${rankedSkills[0]?.branch || "Unknown"}: ${rankedSkills[0]?.name || "Unformed"} ${rankedSkills[0]?.value || 0}</strong>
      <span>Secondary branch</span><strong>${rankedSkills[1]?.branch || "Unknown"}: ${rankedSkills[1]?.name || "Unformed"} ${rankedSkills[1]?.value || 0}</strong>
      <span>Reputation lean</span><strong>${reputationLean.name} ${formatReputation(reputationLean.value)}</strong>
      <span>Work style</span><strong>${workStyle}</strong>
      <span>Open callback debt</span><strong>${openCallbacks}</strong>
    </div>
  `;
}

function getActiveCareerSummaryMarkup() {
  const items = [];
  getConsequenceLedgerEntries().forEach((entry) => {
    items.push({
      label: `${getConsequenceStatusLabel(entry.status)} consequence: ${entry.source}`,
      detail: `Cause: ${entry.cause} Affects: ${entry.affects}. Result: ${entry.detail}`,
    });
  });
  if (state.flags.energyExhaustedThisShift || state.flags.exhaustionDebt) {
    const exhaustionPenalty = getExhaustionSkillPenalty();
    const exhaustionCap = getExhaustionEnergyCap();
    items.push({
      label: "Exhaustion debt",
      detail: `Energy hit zero this shift. Further unpaid effort can create incidents, burnout, and a ${exhaustionCap}-energy ordinary recovery cap.${exhaustionPenalty ? ` Skill checks are currently at -${exhaustionPenalty}.` : ""}`,
    });
  }
  const conditionSkillPressure = getConditionSkillPressureSummary();
  if (conditionSkillPressure) {
    items.push({
      label: "Field condition pressure",
      detail: conditionSkillPressure,
    });
  }
  if (state.reputation.coworkers < 0) {
    items.push({ label: "Crew trust damaged", detail: "Coworker reputation is below zero; crew-trust goals need repair before they can advance." });
  }
  if (getDocumentationSupportReduction()) {
    items.push({ label: "Documentation support", detail: "Documentation habits or traits reduce some report, access-delay, and handoff paperwork costs." });
  }
  if (getCarefulTaskReduction()) {
    items.push({ label: "Careful-work support", detail: "Careful habits or traits reduce some repair and punch-list energy costs." });
  }
  const retrofitInstallJob = getPlannedJob("burlington-retrofit-install");
  const retrofitInstallPreview = retrofitInstallJob ? getPlannedJobPresentation(retrofitInstallJob) : null;
  if (state.flags.retrofitInstallComplete) {
    items.push({
      label: "Retrofit install closeout",
      detail: state.flags.retrofitInstallRiskInherited
        ? "Burlington retrofit is installed, but weak pathway documentation is still visible on the return-trip ledger."
        : state.flags.retrofitInstallRecordComplete
        ? "Burlington retrofit is installed with record/as-built pathway notes."
        : "Burlington retrofit is installed with a quick closeout note.",
    });
  } else if (retrofitInstallPreview?.branch && retrofitInstallPreview.branchId !== "pending") {
    items.push({
      label: "Retrofit install setup",
      detail: retrofitInstallPreview.branch.stateHint || "Burlington walkdown notes will shape the future retrofit install.",
    });
  }
  if (state.flags.shiftPrepActive) {
    items.push({ label: "Next-shift prep active", detail: "Stayed-late prep is boosting Fieldcraft and Documentation until this job closes." });
  }
  if (state.flags.consecutiveLateNights) {
    items.push({
      label: "Late-night fatigue",
      detail: `${state.flags.consecutiveLateNights} consecutive late night${state.flags.consecutiveLateNights === 1 ? "" : "s"} will cap recovery until you clock out normally or take a recovery day.`,
    });
  }
  if (!items.length) {
    items.push({ label: "No active complications", detail: "Your current build is not carrying callback pressure, return-trip risk, or temporary shift prep." });
  }
  return `
    <ul class="modal-list">
      ${items.map((item) => `<li><strong>${item.label}</strong><span>${escapeHtml(item.detail)}</span></li>`).join("")}
    </ul>
  `;
}
