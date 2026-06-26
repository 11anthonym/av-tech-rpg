// Field-task helpers own reusable skill checks, task states, action pressure, and task-result ledgers.
// Scene code supplies task data; this layer keeps the RPG consequence/check pattern reusable.
function getConditionSkillPressureDetails() {
  if (!state.technician) return [];
  const details = [];
  if (state.energy > 0 && state.energy <= Math.ceil(getMaxEnergy() * LOW_ENERGY_SPEED_THRESHOLD)) {
    details.push({
      label: "Low energy",
      detail: `${state.energy}/${getMaxEnergy()} energy makes field checks less steady.`,
      skillPenalty: 1,
    });
  }
  if (state.burnout >= HIGH_BURNOUT_SPEED_THRESHOLD) {
    details.push({
      label: "High burnout",
      detail: `Burnout ${state.burnout} makes task focus less reliable.`,
      skillPenalty: 1,
    });
  }
  return details;
}

function getConditionSkillPenalty(details = getConditionSkillPressureDetails()) {
  return Math.min(2, details.reduce((total, detail) => total + detail.skillPenalty, 0));
}

function getConditionSkillPressureSummary(details = getConditionSkillPressureDetails()) {
  const penalty = getConditionSkillPenalty(details);
  if (!penalty) return "";
  return `${details.map((detail) => detail.label).join(", ")}: -${penalty} to skill checks.`;
}

function getSkillCheckResult({ skillId, difficulty, contextBonus = 0, contextId = "" }) {
  const exhaustionPenalty = getExhaustionSkillPenalty();
  const conditionPressure = getConditionSkillPressureDetails();
  const conditionPenalty = getConditionSkillPenalty(conditionPressure);
  const score = getSkillValue(skillId) + contextBonus + getTraitContextBonus(skillId, contextId) - exhaustionPenalty - conditionPenalty;
  const margin = score - difficulty;
  const tier = margin >= 2 ? "clean" : margin >= 0 ? "solid" : margin === -1 ? "strained" : "miss";
  return {
    skillId,
    difficulty,
    score,
    margin,
    tier,
    exhaustionPenalty,
    conditionPenalty,
    conditionPressure: conditionPressure.map((detail) => detail.label),
    conditionPressureText: getConditionSkillPressureSummary(conditionPressure),
    successful: margin >= 0,
  };
}

function resolveSkillCheck(flagKey, options) {
  state.flags.skillChecks ||= {};
  if (state.flags.skillChecks[flagKey]) return state.flags.skillChecks[flagKey];
  const result = getSkillCheckResult(options);
  state.flags.skillChecks[flagKey] = result;
  if (result.successful) state.stats.skillChecksPassed += 1;
  else state.stats.skillChecksStrained += 1;
  return result;
}

function getSkillCheckLabel(result) {
  const skill = getSkillDefinition(result.skillId);
  const status = result.tier === "clean" ? "clean" : result.tier === "solid" ? "solid" : result.tier === "strained" ? "strained" : "messy";
  return `${skill?.name || result.skillId} ${result.score}/${result.difficulty} (${status}${result.exhaustionPenalty ? `, exhaustion -${result.exhaustionPenalty}` : ""}${result.conditionPenalty ? `, condition -${result.conditionPenalty}` : ""})`;
}

function getSkillCheckMarkup(result) {
  return `<p class="muted">Skill check: ${getSkillCheckLabel(result)}.</p>`;
}

function getFieldTaskToolText(toolId) {
  if (!toolId) return "";
  return content.tools?.[toolId] ? getToolDisplayName(toolId) : toolId;
}

function getFieldTaskRiskText(check) {
  if (!check.riskFlag) return "No named risk";
  return check.riskLabel || check.riskFlag;
}

function getFieldTaskOutcomeText(check, skillCheck, successful = skillCheck?.successful ?? true) {
  if (successful) return check.successText || "Task completed cleanly enough to support closeout.";
  return check.strainedText || "Task completed under strain; closeout may inherit risk.";
}

function getFieldTaskResultMarkup({ check, skillCheck = null, energyCost, successful }) {
  const resolvedSuccessful = successful ?? skillCheck?.successful ?? true;
  const rows = [
    ["Task type", check.type || "field check"],
    ["Skill check", skillCheck ? getSkillCheckLabel(skillCheck) : "No skill roll"],
    ...(skillCheck?.conditionPenalty ? [["Condition pressure", skillCheck.conditionPressureText || `-${skillCheck.conditionPenalty} to skill checks`]] : []),
    ["Energy spent", energyCost ? `-${energyCost} energy` : "0 energy"],
    ...(check.requiredTool ? [["Required tool", getFieldTaskToolText(check.requiredTool)]] : []),
    ...(check.optionalTool ? [["Helpful tool", getFieldTaskToolText(check.optionalTool)]] : []),
    ["Risk tracked", getFieldTaskRiskText(check)],
  ];
  return `
    <div class="results-grid">
      ${rows.map(([label, value]) => `<span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong>`).join("")}
    </div>
    <p class="muted">${escapeHtml(getFieldTaskOutcomeText(check, skillCheck, resolvedSuccessful))}</p>
  `;
}

function recordFieldTaskResult({ flagKey, check, checkId = check?.id || flagKey, skillCheck = null, energyCost = 0, skillId = "", difficulty = 0, contextId = "", successful } = {}) {
  if (!flagKey || !check) return;
  const resolvedSuccessful = successful ?? skillCheck?.successful ?? true;
  const riskLabel = getFieldTaskRiskText(check);
  state.flags.fieldTaskResults ||= {};
  state.flags.fieldTaskResults[flagKey] = {
    id: checkId,
    label: check.label,
    type: check.type || "field check",
    skillId: skillId || skillCheck?.skillId || check.skillId || "",
    difficulty: difficulty ?? skillCheck?.difficulty ?? check.difficulty ?? 0,
    contextId: contextId || check.contextId || "",
    energyCost,
    tier: skillCheck?.tier || (resolvedSuccessful ? "resolved" : "risk"),
    successful: resolvedSuccessful,
    conditionPenalty: skillCheck?.conditionPenalty || 0,
    conditionPressure: skillCheck?.conditionPressure || [],
    conditionPressureText: skillCheck?.conditionPressureText || "",
    riskFlag: check.riskFlag || "",
    riskLabel,
    outcomeText: getFieldTaskOutcomeText(check, skillCheck, resolvedSuccessful),
    requiredTool: check.requiredTool || "",
    optionalTool: check.optionalTool || "",
  };
}

function getFieldTaskResultEntries() {
  return Object.entries(state.flags.fieldTaskResults || {})
    .map(([id, result]) => ({ id, ...result }));
}

function getFieldTaskResultForCheck(check) {
  if (!check) return null;
  return getFieldTaskResultEntries().find((entry) => (
    entry.id === check.id
    || entry.label === check.label
    || (check.riskFlag && entry.riskFlag === check.riskFlag)
  )) || null;
}

function getTaskState({
  stateId = "",
  lockedReason = "",
  completed = false,
  result = null,
  detail = "",
} = {}) {
  if (lockedReason) {
    return { id: "locked", label: "LOCKED", detail: lockedReason };
  }
  if (result) {
    if (!result.successful) {
      return {
        id: "strained",
        label: "STRAINED",
        detail: result.riskLabel
          ? `Resolved under strain; risk tracked: ${result.riskLabel}.`
          : "Resolved under strain; closeout may inherit risk.",
      };
    }
    return {
      id: "completed",
      label: "COMPLETED",
      detail: result.outcomeText || "Task resolved and recorded.",
    };
  }
  if (completed || stateId === "completed") {
    return { id: "completed", label: "COMPLETED", detail: detail || "Task is already complete." };
  }
  if (stateId === "strained") {
    return { id: "strained", label: "STRAINED", detail: detail || "Task is complete, but the result left visible risk." };
  }
  if (stateId === "riskInherited") {
    return { id: "risk-inherited", label: "RISK INHERITED", detail: detail || "A previous choice is making this task riskier." };
  }
  if (stateId === "inProgress") {
    return { id: "in-progress", label: "IN PROGRESS", detail: detail || "Task is already underway." };
  }
  return { id: "ready", label: "READY", detail: detail || "Task can be attempted now." };
}

function getFieldTaskState(check) {
  return getTaskState({ result: getFieldTaskResultForCheck(check) });
}

function getFieldCheckTaskState({
  check = null,
  completedChecks = [],
  lockedReason = "",
  readyDetail = "",
  completedDetail = "",
} = {}) {
  if (lockedReason) return getTaskState({ lockedReason });
  if (!check) return getTaskState({ lockedReason: "Task is not mapped." });
  const resultState = getFieldTaskState(check);
  if (resultState.id !== "ready") return resultState;
  if (completedChecks.includes(check.id)) {
    return getTaskState({
      completed: true,
      detail: completedDetail || `${check.label} is already complete.`,
    });
  }
  return getTaskState({
    stateId: "ready",
    detail: readyDetail || check.detail || "Task can be attempted now.",
  });
}

function getDispatchFieldCheckTaskState({
  checks = [],
  checkId = "",
  completedChecks = [],
  requiredFlag = "",
  lockedReason = "",
  readyDetail = "",
  completedDetail = "",
} = {}) {
  const isLocked = Boolean(lockedReason) && (!requiredFlag || !state.flags[requiredFlag]);
  return getFieldCheckTaskState({
    check: checks.find((item) => item.id === checkId),
    completedChecks,
    lockedReason: isLocked ? lockedReason : "",
    readyDetail,
    completedDetail,
  });
}

function getTaskStateText(taskState) {
  if (!taskState) return "";
  return `${taskState.label}: ${taskState.detail}`;
}

function getFieldTaskResultEntryMarkup(entry) {
  const skillName = getSkillDefinition(entry.skillId)?.name || entry.skillId || "No skill roll";
  const riskText = entry.riskLabel || entry.riskFlag || "No named risk";
  const toolText = [entry.requiredTool, entry.optionalTool].filter(Boolean).map(getFieldTaskToolText).join(" / ");
  const outcomeText = entry.outcomeText || (entry.successful ? "Task resolved." : "Task left visible risk.");
  const conditionText = entry.conditionPressureText ? ` | condition: ${entry.conditionPressureText}` : "";
  return `
    <li>
      <strong>${escapeHtml(`${entry.successful ? "Resolved" : "Risk"} - ${entry.label}`)}</strong>
      <span>${escapeHtml(`${entry.type || "field check"} | ${skillName}${entry.difficulty ? ` ${entry.difficulty}` : ""} | energy ${entry.energyCost || 0} | ${entry.tier || "recorded"}${conditionText} | risk: ${riskText}${toolText ? ` | tools: ${toolText}` : ""}. ${outcomeText}`)}</span>
    </li>
  `;
}

function getFieldTaskResultLedgerMarkup({ limit = 6 } = {}) {
  const entries = getFieldTaskResultEntries().slice(-limit).reverse();
  if (!entries.length) return `<p class="muted">No field-task results have been recorded yet.</p>`;
  return `
    <ul class="modal-list">
      ${entries.map(getFieldTaskResultEntryMarkup).join("")}
    </ul>
  `;
}

function resolveFieldTaskCheck({
  check,
  checkId,
  completedChecks,
  flagKey,
  skillId,
  difficulty,
  contextBonus = 0,
  contextId,
  baseEnergyCost,
  failedEnergyPenalty,
  cleanEnergyReduction,
  strainedFlag = "",
  logText = "",
  strainedLogText = "",
}) {
  const resolvedSkillId = skillId || check.skillId;
  const resolvedDifficulty = difficulty ?? check.difficulty ?? 0;
  const resolvedContextId = contextId ?? check.contextId ?? "";
  const resolvedBaseEnergyCost = baseEnergyCost ?? check.energyCost ?? 0;
  const resolvedFailedEnergyPenalty = failedEnergyPenalty ?? check.failedEnergyPenalty ?? 1;
  const resolvedCleanEnergyReduction = cleanEnergyReduction ?? check.cleanEnergyReduction ?? 1;
  const resolvedStrainedFlag = strainedFlag || check.strainedFlag || "";
  completedChecks.push(checkId);
  const skillCheck = resolveSkillCheck(flagKey, {
    skillId: resolvedSkillId,
    difficulty: resolvedDifficulty,
    contextBonus,
    contextId: resolvedContextId,
  });
  const energyCost = Math.max(0, resolvedBaseEnergyCost + (skillCheck.successful ? 0 : resolvedFailedEnergyPenalty) - (skillCheck.tier === "clean" ? resolvedCleanEnergyReduction : 0));
  changeEnergy(-energyCost);
  if (!skillCheck.successful && resolvedStrainedFlag) state.flags[resolvedStrainedFlag] = true;
  recordFieldTaskResult({
    flagKey,
    check,
    checkId,
    skillCheck,
    energyCost,
    skillId: resolvedSkillId,
    difficulty: resolvedDifficulty,
    contextId: resolvedContextId,
  });
  addLog(logText || check.logText || `${check.label} checked: ${check.log}`);
  const resolvedStrainedLogText = strainedLogText || check.strainedLogText || "";
  if (!skillCheck.successful && resolvedStrainedLogText) addLog(resolvedStrainedLogText);
  return { skillCheck, energyCost };
}

function getActionPressureDetails({
  check = null,
  baseEnergyCost = null,
  includeSkill = true,
  includeMovement = false,
  includeLedger = false,
  includeTools = true,
} = {}) {
  const details = [];
  if (typeof baseEnergyCost === "number" && baseEnergyCost > 0) {
    details.push({
      label: "Energy cost",
      detail: `Expected to spend about ${baseEnergyCost} energy before any strained-task penalty.`,
    });
  }
  if (includeSkill) {
    const conditionPressure = getConditionSkillPressureSummary();
    if (conditionPressure) {
      details.push({
        label: "Field condition",
        detail: conditionPressure,
      });
    }
    const exhaustionPenalty = getExhaustionSkillPenalty();
    if (exhaustionPenalty) {
      details.push({
        label: "Exhaustion",
        detail: `Zero-energy pressure is applying -${exhaustionPenalty} to skill checks.`,
      });
    }
    if (check?.skillId || check?.difficulty != null) {
      const skillName = getSkillDefinition(check.skillId)?.name || check.skill || check.skillId || "Field skill";
      const skillValue = check.skillId ? getSkillValue(check.skillId) : null;
      const difficulty = check.difficulty != null ? `difficulty ${check.difficulty}` : check.difficultyHint || "variable difficulty";
      details.push({
        label: "Skill fit",
        detail: `${skillName}${skillValue != null ? ` ${skillValue}` : ""} against ${difficulty}.`,
      });
    }
  }
  if (includeMovement) {
    const movementPressure = getConditionPressureSummary();
    if (movementPressure) {
      details.push({
        label: "Movement condition",
        detail: movementPressure,
      });
    }
  }
  if (includeTools && check) {
    if (check.requiredTool && !ownsTool(check.requiredTool)) {
      details.push({
        label: "Missing required tool",
        detail: `${getFieldTaskToolText(check.requiredTool)} is expected for this task.`,
      });
    }
    if (check.optionalTool) {
      details.push({
        label: ownsTool(check.optionalTool) ? "Helpful tool ready" : "Helpful tool missing",
        detail: `${getFieldTaskToolText(check.optionalTool)} ${ownsTool(check.optionalTool) ? "can reduce friction here." : "would make this less brittle."}`,
      });
    }
  }
  if (includeLedger) {
    const callbackCount = getUnresolvedCallbackCount();
    if (callbackCount) {
      details.push({
        label: "Callback debt",
        detail: `${callbackCount} unresolved callback${callbackCount === 1 ? "" : "s"} can make closeout and access work more fragile.`,
      });
    }
    const returnRiskCount = getReturnTripRiskEntries().length;
    if (returnRiskCount) {
      details.push({
        label: "Return-trip risk",
        detail: `${returnRiskCount} open return-trip risk${returnRiskCount === 1 ? "" : "s"} can echo into future jobs.`,
      });
    }
  }
  return details;
}

function getActionPressureSummary(options = {}) {
  const details = getActionPressureDetails(options);
  if (!details.length) return "";
  return details.map((detail) => `${detail.label}: ${detail.detail}`).join(" ");
}

function getActionPressureBrief(options = {}) {
  const details = getActionPressureDetails(options);
  if (!details.length) return "";
  return details.map((detail) => {
    if (detail.label === "Energy cost") {
      const match = detail.detail.match(/about (\d+) energy/);
      return `Energy: ~${match?.[1] || "?"}`;
    }
    if (detail.label === "Field condition") return `Condition: ${detail.detail.replace(" to skill checks.", " checks")}`;
    if (detail.label === "Exhaustion") return detail.detail.replace("Zero-energy pressure is applying ", "Exhaustion: ");
    if (detail.label === "Skill fit") return detail.detail.replace(" against ", " vs ").replace(/\.$/, "");
    if (detail.label === "Movement condition") return `Movement: ${detail.detail}`;
    if (detail.label === "Helpful tool missing") return `Missing tool: ${detail.detail.split(" would ")[0]}`;
    if (detail.label === "Helpful tool ready") return `Tool ready: ${detail.detail.split(" can ")[0]}`;
    if (detail.label === "Missing required tool") return `Missing required: ${detail.detail.split(" is ")[0]}`;
    if (detail.label === "Callback debt") return `Callback debt: ${detail.detail.split(" can ")[0]}`;
    if (detail.label === "Return-trip risk") return `Return risk: ${detail.detail.split(" can ")[0]}`;
    return `${detail.label}: ${detail.detail}`;
  }).join(" ");
}

function getActionPressureMarkup(options = {}) {
  const details = getActionPressureDetails(options);
  if (!details.length) return "";
  return `
    <p><strong>Pressure on this action:</strong></p>
    <ul class="modal-list">
      ${details.map((detail) => `<li><strong>${escapeHtml(detail.label)}</strong><span>${escapeHtml(detail.detail)}</span></li>`).join("")}
    </ul>
  `;
}

function getChoicePressureMarkup(hints = [], actionPressureOptions = { includeSkill: true, includeLedger: true }) {
  if (!hints.length) return "";
  return `
    ${getActionPressureMarkup(actionPressureOptions)}
    <p><strong>Choice pressure:</strong></p>
    <ul class="modal-list">
      ${hints.map((hint) => `<li><strong>${escapeHtml(hint.label)}</strong><span>${escapeHtml(hint.detail)}</span></li>`).join("")}
    </ul>
  `;
}
