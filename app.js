const content = window.GAME_CONTENT;
const keys = new Set();
const PLAYER_SPEED = 8;
const SAVE_KEY = "av-tech-rpg-save-v1";
const WEEKDAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const STAY_LATE_PREP_ENERGY_COST = 32;
const HELP_JOSH_ENERGY_COST = 30;
const STAY_LATE_BURNOUT_GAIN = 1;
const CHERRY_HILL_TOLL_COST = 6;
const EXHAUSTION_DEBT_PER_BURNOUT = 10;
const MIN_OVERNIGHT_RECOVERY = 28;
const MIN_STAYED_LATE_RECOVERY = 16;
const STAY_LATE_NEXT_MORNING_CAP_LOSS = 20;
const CONSECUTIVE_LATE_NIGHT_CAP_LOSS = 10;
const MIN_STAY_LATE_NEXT_MORNING_ENERGY = 30;

function createInitialState() {
  return {
    technician: null,
    sceneId: null,
    player: { x: 0, y: 0 },
    tools: [],
    carry: [],
    loaded: [],
    delivered: [],
    assembled: [],
    serviceDelivered: [],
    serviceInstalled: [],
    surveyInspections: [],
    commissioningChecks: [],
    warehouseChecks: [],
    secureAccessChecks: [],
    callbackCleanupChecks: [],
    handoffChecks: [],
    systemsChecks: [],
    energy: 100,
    burnout: 0,
    cash: 0,
    xp: 0,
    jobsCompleted: 0,
    reputation: { clients: 0, coworkers: 0, management: 0 },
    training: [],
    stats: {
      carefulFinishes: 0,
      callbacks: 0,
      callbacksResolved: 0,
      overtimeDays: 0,
      recoveryDays: 0,
      workOrdersReviewed: 0,
      lunchesPacked: 0,
      coffeesBought: 0,
      surveysCompleted: 0,
      accessRisksDocumented: 0,
      quotesTrustedAnyway: 0,
      commissioningRoomsCompleted: 0,
      incompleteRoomsDocumented: 0,
      roomsPassedAnyway: 0,
      warehouseRunsCompleted: 0,
      stockroomLabelsFixed: 0,
      mysteryBoxesLeft: 0,
      secureAccessJobsCompleted: 0,
      accessDelaysDocumented: 0,
      unpaidDelaysAbsorbed: 0,
      warrantyReturnsCompleted: 0,
      warrantyBandagesApplied: 0,
      clientHandoffsCompleted: 0,
      systemsJobsCompleted: 0,
      systemMismatchesDocumented: 0,
      quickRebootsClosed: 0,
      travelCostsDocumented: 0,
      unreimbursedTravelCosts: 0,
      trainingGapsLeft: 0,
      skillChecksPassed: 0,
      skillChecksStrained: 0,
      fieldTaskChoicesMade: 0,
      cleanTerminations: 0,
      documentedTaskRisks: 0,
      shiftsCompleted: 0,
      overnightRests: 0,
      sameDayBreaks: 0,
      coffeeBreaks: 0,
      stayLatePrepDays: 0,
      shopHelpDays: 0,
      energyCrashes: 0,
      exhaustionBurnout: 0,
    },
    clock: "MON 7:11 AM",
    flags: {},
    log: [],
    modalOpen: false,
  };
}

const state = createInitialState();

const elements = {
  titleScreen: document.querySelector("#title-screen"),
  continueButton: document.querySelector("#continue-button"),
  newGameButton: document.querySelector("#new-game-button"),
  clearSaveButton: document.querySelector("#clear-save-button"),
  saveSummary: document.querySelector("#save-summary"),
  saveStatus: document.querySelector("#save-status"),
  menuButton: document.querySelector("#menu-button"),
  selection: document.querySelector("#selection-screen"),
  selectionBackButton: document.querySelector("#selection-back-button"),
  technicianGrid: document.querySelector("#technician-grid"),
  gameLayout: document.querySelector("#game-layout"),
  locationTitle: document.querySelector("#location-title"),
  jobStatus: document.querySelector("#job-status"),
  clock: document.querySelector("#clock"),
  techName: document.querySelector("#tech-name"),
  energyValue: document.querySelector("#energy-value"),
  energyMeter: document.querySelector("#energy-meter"),
  burnoutValue: document.querySelector("#burnout-value"),
  cashValue: document.querySelector("#cash-value"),
  craftValue: document.querySelector("#craft-value"),
  confidenceValue: document.querySelector("#confidence-value"),
  rankValue: document.querySelector("#rank-value"),
  levelValue: document.querySelector("#level-value"),
  xpValue: document.querySelector("#xp-value"),
  clientRepValue: document.querySelector("#client-rep-value"),
  coworkerRepValue: document.querySelector("#coworker-rep-value"),
  managementRepValue: document.querySelector("#management-rep-value"),
  skillList: document.querySelector("#skill-list"),
  carryCard: document.querySelector("#carry-card"),
  carryBubble: document.querySelector("#carry-bubble"),
  toolList: document.querySelector("#tool-list"),
  vehicleCard: document.querySelector("#vehicle-card"),
  sceneKicker: document.querySelector("#scene-kicker"),
  sceneName: document.querySelector("#scene-name"),
  objective: document.querySelector("#objective"),
  taskCopy: document.querySelector("#task-copy"),
  nearbyCard: document.querySelector("#nearby-card"),
  scene: document.querySelector("#scene"),
  sceneLayer: document.querySelector("#scene-layer"),
  player: document.querySelector("#player"),
  interactButton: document.querySelector("#interact-button"),
  fieldLog: document.querySelector("#field-log"),
  dispatchTitle: document.querySelector("#dispatch-title"),
  dispatchSummary: document.querySelector("#dispatch-summary"),
  modalBackdrop: document.querySelector("#modal-backdrop"),
  modalKicker: document.querySelector("#modal-kicker"),
  modalTitle: document.querySelector("#modal-title"),
  modalBody: document.querySelector("#modal-body"),
  modalActions: document.querySelector("#modal-actions"),
};

function getSavedGame() {
  try {
    return JSON.parse(localStorage.getItem(SAVE_KEY));
  } catch {
    return null;
  }
}

function inferSavedCash(savedGame) {
  if (typeof savedGame.cash === "number") return savedGame.cash;
  if (!savedGame.flags?.finished) return 0;
  return savedGame.flags.finishChoice === "tidy" ? 152 : 141;
}

function inferSavedXp(savedGame) {
  if (typeof savedGame.xp === "number") return savedGame.xp;
  return (savedGame.flags?.finished ? 40 : 0)
    + (savedGame.flags?.serviceComplete ? (savedGame.flags.serviceApproach === "verify" ? 50 : 40) : 0)
    + (savedGame.flags?.surveyComplete ? (savedGame.flags.surveyApproach === "pushback" ? 60 : savedGame.flags.surveyApproach === "document" ? 55 : 35) : 0)
    + (savedGame.flags?.commissioningComplete ? (savedGame.flags.commissioningApproach === "craft" ? 65 : savedGame.flags.commissioningApproach === "repair" ? 60 : 40) : 0)
    + (savedGame.flags?.warehouseComplete ? (savedGame.flags.warehouseApproach === "label" ? 50 : 35) : 0)
    + (savedGame.flags?.secureAccessComplete ? (savedGame.flags.secureAccessApproach === "pushback" ? 60 : savedGame.flags.secureAccessApproach === "document" ? 55 : 35) : 0)
    + (savedGame.flags?.callbackCleanupComplete ? (savedGame.flags.callbackCleanupApproach === "craft" ? 65 : savedGame.flags.callbackCleanupApproach === "root" ? 55 : 35) : 0)
    + (savedGame.flags?.handoffComplete ? (savedGame.flags.handoffApproach === "cheat" ? 60 : savedGame.flags.handoffApproach === "patient" ? 50 : 30) : 0)
    + (savedGame.flags?.systemsComplete ? (savedGame.flags.systemsApproach === "scope" ? 65 : savedGame.flags.systemsApproach === "document" ? 55 : 35) : 0)
    + (savedGame.flags?.travelComplete ? (savedGame.flags.travelApproach === "pushback" ? 45 : savedGame.flags.travelApproach === "receipt" ? 35 : 25) : 0);
}

function inferSavedReputation(savedGame) {
  if (savedGame.reputation) return savedGame.reputation;
  const reputation = { clients: 0, coworkers: 0, management: 0 };
  if (savedGame.flags?.finished) {
    if (savedGame.flags.finishChoice === "tidy") {
      reputation.clients += 2;
      reputation.coworkers += 1;
      reputation.management -= 1;
    } else if (savedGame.flags.finishChoice === "wiley-workaround") {
      reputation.clients += 1;
      reputation.coworkers -= 1;
      reputation.management += 1;
    } else {
      reputation.management += 1;
    }
  }
  if (savedGame.flags?.serviceComplete) {
    if (savedGame.flags.serviceApproach === "verify") {
      reputation.clients += 2;
      reputation.coworkers += 1;
    } else {
      reputation.management += 1;
    }
  }
  if (savedGame.flags?.surveyComplete) {
    if (savedGame.flags.surveyApproach === "trust") {
      reputation.management += 1;
    } else {
      reputation.clients += 2;
      reputation.coworkers += 1;
      reputation.management -= 1;
    }
  }
  if (savedGame.flags?.commissioningComplete) {
    if (savedGame.flags.commissioningApproach === "pass") {
      reputation.management += 1;
    } else {
      reputation.clients += 2;
      reputation.coworkers += savedGame.flags.commissioningApproach === "craft" ? 2 : 1;
      reputation.management -= 1;
    }
  }
  if (savedGame.flags?.warehouseComplete) {
    if (savedGame.flags.warehouseApproach === "label") {
      reputation.coworkers += 1;
      reputation.management -= 1;
    } else {
      reputation.management += 1;
    }
  }
  if (savedGame.flags?.secureAccessComplete) {
    if (savedGame.flags.secureAccessApproach === "absorb") {
      reputation.management += 1;
    } else {
      reputation.clients += 1;
      reputation.coworkers += 1;
      reputation.management += savedGame.flags.secureAccessApproach === "pushback" ? -2 : -1;
    }
  }
  if (savedGame.flags?.callbackCleanupComplete) {
    if (savedGame.flags.callbackCleanupApproach === "bandage") {
      reputation.management += 1;
    } else {
      reputation.clients += 2;
      reputation.coworkers += savedGame.flags.callbackCleanupApproach === "craft" ? 2 : 1;
      reputation.management -= 1;
    }
  }
  if (savedGame.flags?.handoffComplete) {
    if (savedGame.flags.handoffApproach === "quick") {
      reputation.management += 1;
    } else {
      reputation.clients += savedGame.flags.handoffApproach === "cheat" ? 3 : 2;
      reputation.coworkers += 1;
      reputation.management -= 1;
    }
  }
  if (savedGame.flags?.systemsComplete) {
    if (savedGame.flags.systemsApproach === "reboot") {
      reputation.clients -= 1;
      reputation.management += 1;
    } else {
      reputation.clients += savedGame.flags.systemsApproach === "scope" ? 2 : 1;
      reputation.coworkers += 1;
      reputation.management += savedGame.flags.systemsApproach === "scope" ? -2 : -1;
    }
  }
  if (savedGame.flags?.travelComplete) {
    if (savedGame.flags.travelApproach === "absorb") {
      reputation.management += 1;
    } else {
      reputation.coworkers += 1;
      reputation.management += savedGame.flags.travelApproach === "pushback" ? -2 : -1;
    }
  }
  return reputation;
}

function inferSavedStats(savedGame) {
  const stats = {
    carefulFinishes: 0,
    callbacks: 0,
    callbacksResolved: 0,
    overtimeDays: 0,
    recoveryDays: 0,
    workOrdersReviewed: 0,
    lunchesPacked: 0,
    coffeesBought: 0,
    surveysCompleted: 0,
    accessRisksDocumented: 0,
    quotesTrustedAnyway: 0,
    commissioningRoomsCompleted: 0,
    incompleteRoomsDocumented: 0,
    roomsPassedAnyway: 0,
    warehouseRunsCompleted: 0,
    stockroomLabelsFixed: 0,
    mysteryBoxesLeft: 0,
    secureAccessJobsCompleted: 0,
    accessDelaysDocumented: 0,
    unpaidDelaysAbsorbed: 0,
    warrantyReturnsCompleted: 0,
    warrantyBandagesApplied: 0,
    clientHandoffsCompleted: 0,
    systemsJobsCompleted: 0,
    systemMismatchesDocumented: 0,
    quickRebootsClosed: 0,
    trainingGapsLeft: 0,
    travelCostsDocumented: 0,
    unreimbursedTravelCosts: 0,
    skillChecksPassed: 0,
    skillChecksStrained: 0,
    fieldTaskChoicesMade: 0,
    cleanTerminations: 0,
    documentedTaskRisks: 0,
    shiftsCompleted: 0,
    overnightRests: 0,
    sameDayBreaks: 0,
    coffeeBreaks: 0,
    stayLatePrepDays: 0,
    shopHelpDays: 0,
    energyCrashes: 0,
    exhaustionBurnout: 0,
  };
  if (savedGame.stats) return { ...stats, ...savedGame.stats };
  if (savedGame.flags?.finished) {
    stats.overtimeDays += 1;
    if (savedGame.flags.finishChoice === "tidy") stats.carefulFinishes += 1;
    if (savedGame.flags.finishChoice === "wiley-workaround") stats.callbacks += 1;
  }
  if (savedGame.flags?.serviceComplete) {
    if (savedGame.flags.serviceApproach === "verify") stats.carefulFinishes += 1;
    else stats.callbacks += 1;
  }
  if (savedGame.flags?.serviceCallbackResolved) stats.callbacksResolved += 1;
  if (savedGame.flags?.servicePreparation === "review") stats.workOrdersReviewed += 1;
  if (savedGame.flags?.servicePreparation === "lunch") stats.lunchesPacked += 1;
  if (savedGame.flags?.servicePreparation === "coffee") stats.coffeesBought += 1;
  if (savedGame.flags?.surveyComplete) {
    stats.surveysCompleted += 1;
    if (savedGame.flags.surveyApproach === "trust") stats.quotesTrustedAnyway += 1;
    else stats.accessRisksDocumented += 1;
  }
  if (savedGame.flags?.commissioningComplete) {
    stats.commissioningRoomsCompleted += 1;
    if (savedGame.flags.commissioningApproach === "pass") {
      stats.roomsPassedAnyway += 1;
      stats.callbacks += 1;
    } else {
      stats.incompleteRoomsDocumented += 1;
      stats.carefulFinishes += 1;
    }
  }
  if (savedGame.flags?.warehouseComplete) {
    stats.warehouseRunsCompleted += 1;
    if (savedGame.flags.warehouseApproach === "label") stats.stockroomLabelsFixed += 1;
    else stats.mysteryBoxesLeft += 1;
  }
  if (savedGame.flags?.secureAccessComplete) {
    stats.secureAccessJobsCompleted += 1;
    if (savedGame.flags.secureAccessApproach === "absorb") stats.unpaidDelaysAbsorbed += 1;
    else stats.accessDelaysDocumented += 1;
  }
  if (savedGame.flags?.callbackCleanupComplete) {
    stats.warrantyReturnsCompleted += 1;
    if (savedGame.flags.callbackCleanupApproach === "bandage") stats.warrantyBandagesApplied += 1;
    else stats.callbacksResolved += 1;
  }
  if (savedGame.flags?.handoffComplete) {
    stats.clientHandoffsCompleted += 1;
    if (savedGame.flags.handoffApproach === "quick") stats.trainingGapsLeft += 1;
    else stats.carefulFinishes += 1;
  }
  if (savedGame.flags?.systemsComplete) {
    stats.systemsJobsCompleted += 1;
    if (savedGame.flags.systemsApproach === "reboot") stats.quickRebootsClosed += 1;
    else stats.systemMismatchesDocumented += 1;
  }
  if (savedGame.flags?.travelComplete) {
    if (savedGame.flags.travelApproach === "absorb") stats.unreimbursedTravelCosts += 1;
    else stats.travelCostsDocumented += 1;
  }
  return stats;
}

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

function getSavedTechnician(savedGame) {
  if (!savedGame) return null;
  if (savedGame.customTechnician) return savedGame.customTechnician;
  return content.technicians.find((item) => item.id === savedGame.technicianId);
}

function getSaveSummary(savedGame) {
  if (!savedGame) return "No saved career yet.";
  const technician = getSavedTechnician(savedGame);
  const scene = content.scenes[savedGame.sceneId];
  const reward = savedGame.flags?.reward ? content.tools[savedGame.flags.reward]?.name : null;
  const detail = reward ? ` | Tutorial reward: ${reward}` : "";
  const level = getCareerLevel(inferSavedXp(savedGame));
  return `${technician?.name || "Technician"} | Level ${level} | ${scene?.name || "First day"} | Energy ${savedGame.energy} | Cash ${formatCash(inferSavedCash(savedGame))}${detail}`;
}

function refreshTitleScreen() {
  const savedGame = getSavedGame();
  elements.continueButton.disabled = !savedGame;
  elements.clearSaveButton.disabled = !savedGame;
  elements.saveSummary.textContent = getSaveSummary(savedGame);
}

function serializeGame() {
  return {
    version: 16,
    technicianId: state.technician.id,
    customTechnician: state.technician.custom ? state.technician : null,
    sceneId: state.sceneId,
    player: state.player,
    tools: state.tools,
    carry: state.carry,
    loaded: state.loaded,
    delivered: state.delivered,
    assembled: state.assembled,
    serviceDelivered: state.serviceDelivered,
    serviceInstalled: state.serviceInstalled,
    surveyInspections: state.surveyInspections,
    commissioningChecks: state.commissioningChecks,
    warehouseChecks: state.warehouseChecks,
    secureAccessChecks: state.secureAccessChecks,
    callbackCleanupChecks: state.callbackCleanupChecks,
    handoffChecks: state.handoffChecks,
    systemsChecks: state.systemsChecks,
    energy: state.energy,
    burnout: state.burnout,
    cash: state.cash,
    xp: state.xp,
    jobsCompleted: state.jobsCompleted,
    reputation: state.reputation,
    training: state.training,
    stats: state.stats,
    clock: state.clock,
    flags: state.flags,
    log: state.log,
  };
}

function normalizeCarry(carry) {
  if (Array.isArray(carry)) return carry;
  return carry ? [carry] : [];
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

function getSkillCheckResult({ skillId, difficulty, contextBonus = 0, contextId = "" }) {
  const score = getSkillValue(skillId) + contextBonus + getTraitContextBonus(skillId, contextId);
  const margin = score - difficulty;
  const tier = margin >= 2 ? "clean" : margin >= 0 ? "solid" : margin === -1 ? "strained" : "miss";
  return {
    skillId,
    difficulty,
    score,
    margin,
    tier,
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
  return `${skill?.name || result.skillId} ${result.score}/${result.difficulty} (${status})`;
}

function getSkillCheckMarkup(result) {
  return `<p class="muted">Skill check: ${getSkillCheckLabel(result)}.</p>`;
}

function getChoicePressureMarkup(hints = []) {
  if (!hints.length) return "";
  return `
    <p><strong>Choice pressure:</strong></p>
    <ul class="modal-list">
      ${hints.map((hint) => `<li><strong>${escapeHtml(hint.label)}</strong><span>${escapeHtml(hint.detail)}</span></li>`).join("")}
    </ul>
  `;
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

function recordReturnTripRisk(riskId, detail) {
  state.flags.returnTripRisks ||= {};
  state.flags.returnTripRisks[riskId] = detail;
}

function getReturnTripRiskEntries() {
  return Object.values(state.flags.returnTripRisks || {});
}

function getOpenReturnTripRiskSummary() {
  const risks = getReturnTripRiskEntries();
  if (!risks.length) return "";
  return risks.map((risk) => `${risk.source}: ${risk.detail}`).join(" ");
}

function getActiveCareerSummaryMarkup() {
  const openCallbacks = getUnresolvedCallbackCount();
  const items = [];
  if (openCallbacks > 0) {
    items.push({
      label: "Open callback pressure",
      detail: `${openCallbacks} unresolved callback${openCallbacks === 1 ? "" : "s"} can make later access and board choices heavier.`,
    });
  }
  const returnTripSummary = getOpenReturnTripRiskSummary();
  if (returnTripSummary) {
    items.push({ label: "Return-trip risks remembered", detail: returnTripSummary });
  }
  if (state.flags.energyExhaustedThisShift || state.flags.exhaustionDebt) {
    items.push({
      label: "Exhaustion debt",
      detail: "Energy hit zero this shift. Further unpaid effort can turn into burnout until you get a real reset.",
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
  if (state.flags.shiftPrepActive) {
    items.push({ label: "Next-shift prep active", detail: "Stayed-late prep is boosting Fieldcraft and Documentation until this dispatch closes." });
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

function getCurrentDispatchKey() {
  if (state.sceneId === "executiveHandoff" || state.flags.handoffStarted || state.flags.handoffComplete) return "handoff";
  if (state.sceneId === "warrantyReturn" || state.flags.callbackCleanupStarted || state.flags.callbackCleanupComplete) return "warranty";
  if (state.sceneId === "navyYardAccess" || state.flags.secureAccessStarted || state.flags.secureAccessComplete || (state.flags.warehouseComplete && !state.flags.secureAccessComplete)) return "secureAccess";
  if (state.flags.warehouseStarted || state.flags.warehouseComplete) return "warehouse";
  if (state.sceneId === "southPhillyCommissioning" || state.flags.commissioningStarted || state.flags.commissioningComplete) return "commissioning";
  if (state.sceneId === "universitySurvey" || state.flags.surveyStarted || state.flags.surveyComplete) return "survey";
  if (state.sceneId === "serviceOffice" || state.flags.serviceStarted || state.flags.serviceComplete || state.flags.finished) return "service";
  return "tutorial";
}

function getUsedPartsBrainDispatches() {
  state.flags.partsBrainDispatches ||= {};
  return state.flags.partsBrainDispatches;
}

function getPartsBrainFind() {
  const finds = content.tools.circuitHutOrganizer.finds;
  const index = getCurrentDispatchKey()
    .split("")
    .reduce((total, char) => total + char.charCodeAt(0), 0) % finds.length;
  return finds[index];
}

function hasActivePartsBrainFind() {
  return ownsTool("circuitHutOrganizer") && Boolean(getUsedPartsBrainDispatches()[getCurrentDispatchKey()]);
}

function canUsePartsBrain() {
  return hasCharacterTrait("circuitHutPartsBrain") && ownsTool("circuitHutOrganizer") && !hasActivePartsBrainFind();
}

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

function getOpenCallbackPenalty() {
  return Math.min(1, Math.max(0, state.stats.callbacks - state.stats.callbacksResolved));
}

function getUnresolvedCallbackCount() {
  return Math.max(0, state.stats.callbacks - state.stats.callbacksResolved);
}

function getCarryCapacity(sceneId = state.sceneId) {
  return ["garage", "serviceOffice"].includes(sceneId) ? 1 + getToolModifier("garageCarryCapacityBonus") : 1;
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

function hasCarriedItems() {
  return state.carry.length > 0;
}

function getCarriedLabels() {
  return state.carry.map((itemId) => (
    content.tutorial.assembly.find((item) => item.id === itemId)?.label
    || content.serviceDispatch.swapItems.find((item) => item.id === itemId)?.label
    || itemId
  ));
}

function saveGame() {
  if (!state.technician || !state.sceneId) return;
  localStorage.setItem(SAVE_KEY, JSON.stringify(serializeGame()));
  elements.saveStatus.classList.remove("hidden");
  elements.saveStatus.textContent = "AUTOSAVED";
}

function resetRuntimeState() {
  Object.assign(state, createInitialState());
}

function showTitleScreen() {
  closeModal();
  keys.clear();
  window.scrollTo({ left: 0, top: 0 });
  elements.locationTitle.textContent = "AV Tech RPG";
  elements.clock.textContent = "MON 7:11 AM";
  elements.jobStatus.textContent = "CAREER MODE";
  elements.gameLayout.classList.add("hidden");
  elements.selection.classList.add("hidden");
  elements.menuButton.classList.add("hidden");
  elements.saveStatus.classList.add("hidden");
  elements.titleScreen.classList.remove("hidden");
  refreshTitleScreen();
}

function showTechnicianSelection() {
  window.scrollTo({ left: 0, top: 0 });
  elements.titleScreen.classList.add("hidden");
  elements.selection.classList.remove("hidden");
  elements.locationTitle.textContent = "Technician Selection";
}

function promptNewCareer() {
  if (!getSavedGame()) return showTechnicianSelection();
  showModal({
    kicker: "New Career",
    title: "Start Over?",
    body: `<p>Starting a new technician will overwrite the current saved career after you choose a profile.</p>`,
    actions: [
      { label: "Choose New Technician", onClick: showTechnicianSelection },
      { label: "Keep Current Career", className: "secondary-button" },
    ],
  });
}

function promptClearSavedGame() {
  if (!getSavedGame()) return;
  showModal({
    kicker: "Saved Career",
    title: "Clear Saved Career?",
    body: `<p>This removes the local career save from this browser. It cannot be undone.</p>`,
    actions: [
      { label: "Clear Saved Career", className: "secondary-button", onClick: clearSavedGame },
      { label: "Keep Current Career" },
    ],
  });
}

function clearSavedGame() {
  localStorage.removeItem(SAVE_KEY);
  resetRuntimeState();
  refreshTitleScreen();
}

function continueGame() {
  const savedGame = getSavedGame();
  if (!savedGame) return;
  const technician = getSavedTechnician(savedGame);
  if (!technician || !content.scenes[savedGame.sceneId]) return clearSavedGame();
  const flags = { ...savedGame.flags };
  const migratedCash = inferSavedCash(savedGame);
  const migratedXp = inferSavedXp(savedGame);
  const migratedReputation = inferSavedReputation(savedGame);
  const migratedStats = inferSavedStats(savedGame);
  if (flags.finished) flags.tutorialPaid = true;
  if (flags.finished) flags.tutorialProgressAwarded = true;
  if (flags.serviceComplete) flags.serviceProgressAwarded = true;
  if (flags.surveyComplete) flags.surveyProgressAwarded = true;
  if (flags.commissioningComplete) flags.commissioningProgressAwarded = true;
  if (flags.warehouseComplete) flags.warehouseProgressAwarded = true;
  if (flags.secureAccessComplete) flags.secureAccessProgressAwarded = true;
  if (flags.callbackCleanupComplete) flags.callbackCleanupProgressAwarded = true;
  if (flags.handoffComplete) flags.handoffProgressAwarded = true;
  if (flags.systemsComplete) flags.systemsProgressAwarded = true;
  if (flags.travelComplete) flags.travelProgressAwarded = true;
  if (flags.serviceComplete && flags.serviceApproach !== "verify" && flags.serviceCallbackResolved === undefined) {
    flags.serviceCallbackPending = true;
  }
  resetRuntimeState();
  Object.assign(state, savedGame, {
    technician,
    carry: normalizeCarry(savedGame.carry),
    serviceDelivered: savedGame.serviceDelivered || [],
    serviceInstalled: savedGame.serviceInstalled || [],
    surveyInspections: savedGame.surveyInspections || [],
    commissioningChecks: savedGame.commissioningChecks || [],
    warehouseChecks: savedGame.warehouseChecks || [],
    secureAccessChecks: savedGame.secureAccessChecks || [],
    callbackCleanupChecks: savedGame.callbackCleanupChecks || [],
    handoffChecks: savedGame.handoffChecks || [],
    systemsChecks: savedGame.systemsChecks || [],
    cash: migratedCash,
    xp: migratedXp,
    jobsCompleted: savedGame.jobsCompleted ?? (flags.finished ? 1 : 0) + (flags.serviceComplete ? 1 : 0) + (flags.surveyComplete ? 1 : 0) + (flags.commissioningComplete ? 1 : 0) + (flags.warehouseComplete ? 1 : 0) + (flags.secureAccessComplete ? 1 : 0) + (flags.callbackCleanupComplete ? 1 : 0) + (flags.handoffComplete ? 1 : 0) + (flags.systemsComplete ? 1 : 0) + (flags.travelComplete ? 1 : 0),
    reputation: migratedReputation,
    training: savedGame.training || [],
    stats: migratedStats,
    flags,
    modalOpen: false,
  });
  elements.titleScreen.classList.add("hidden");
  elements.selection.classList.add("hidden");
  elements.gameLayout.classList.remove("hidden");
  elements.menuButton.classList.remove("hidden");
  enterScene(state.sceneId, state.player);
  resumeRequiredPrompt();
}

function resumeRequiredPrompt() {
  if (state.flags.endShiftPending) return showEndShiftModal();
  if (state.flags.finished && !state.flags.reward) return showResults();
  if (state.sceneId === "garage" && state.delivered.length === content.tutorial.garageUnload.length) {
    return showLobbyTransition();
  }
  if (state.sceneId === "client" && state.assembled.length === content.tutorial.assembly.length && !state.flags.finished) {
    return showFinishChoice();
  }
  if (state.sceneId === "serviceOffice" && state.serviceInstalled.length === content.serviceDispatch.swapItems.length && !state.flags.serviceComplete) {
    return showServiceResults();
  }
  if (state.sceneId === "universitySurvey" && state.surveyInspections.length === content.surveyDispatch.inspections.length && !state.flags.surveyComplete) {
    return showSurveyReportChoice();
  }
  if (state.sceneId === "southPhillyCommissioning" && state.commissioningChecks.length === content.commissioningDispatch.checks.length && !state.flags.commissioningComplete) {
    if (!state.flags.commissioningTerminationAction) return showCommissioningTerminationChoice();
    return showCommissioningChoice();
  }
  if (state.sceneId === "shop" && state.flags.warehouseStarted && state.warehouseChecks.length === content.warehouseDispatch.checks.length && !state.flags.warehouseComplete) {
    return showWarehouseChoice();
  }
  if (state.sceneId === "navyYardAccess" && state.secureAccessChecks.length === content.secureAccessDispatch.checks.length && !state.flags.secureAccessComplete) {
    return showSecureAccessChoice();
  }
  if (state.sceneId === "warrantyReturn" && state.callbackCleanupChecks.length === content.callbackCleanupDispatch.checks.length && !state.flags.callbackCleanupComplete) {
    return showCallbackCleanupChoice();
  }
  if (state.sceneId === "executiveHandoff" && state.handoffChecks.length === content.handoffDispatch.checks.length && !state.flags.handoffComplete) {
    return showHandoffChoice();
  }
  if (state.sceneId === "systemsService" && state.systemsChecks.length === content.systemsDispatch.checks.length && !state.flags.systemsComplete) {
    return showSystemsChoice();
  }
}

function makeButton(label, onClick, className = "primary-button") {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = label;
  button.addEventListener("click", onClick);
  return button;
}

function showModal({ kicker = "Dispatch Update", title, body, actions }) {
  state.modalOpen = true;
  elements.modalKicker.textContent = kicker;
  elements.modalTitle.textContent = title;
  elements.modalBody.innerHTML = body;
  elements.modalActions.replaceChildren(
    ...actions.map((action) => makeButton(action.label, () => {
      if (action.close !== false) closeModal();
      action.onClick?.();
    }, action.className)),
  );
  elements.modalBackdrop.classList.remove("hidden");
  saveGame();
}

function closeModal() {
  state.modalOpen = false;
  elements.modalBackdrop.classList.add("hidden");
  elements.scene.focus();
}

function addLog(message) {
  state.log.unshift(message);
  state.log = state.log.slice(0, 10);
}

function changeEnergy(amount) {
  const beforeEnergy = state.energy;
  const maxEnergy = getMaxEnergy();
  state.energy = Math.max(0, Math.min(maxEnergy, state.energy + amount));
  if (amount >= 0) return;

  if (state.energy === 0 && !state.flags.energyExhaustedThisShift) {
    state.flags.energyExhaustedThisShift = true;
    state.stats.energyCrashes = (state.stats.energyCrashes || 0) + 1;
    addLog("Energy hit zero. Further effort starts borrowing from tomorrow.");
  }

  const unpaidEnergy = Math.max(0, Math.abs(amount) - beforeEnergy);
  if (!unpaidEnergy) return;
  state.flags.exhaustionDebt = (state.flags.exhaustionDebt || 0) + unpaidEnergy;
  const burnoutGain = Math.floor(state.flags.exhaustionDebt / EXHAUSTION_DEBT_PER_BURNOUT);
  if (!burnoutGain) return;
  state.flags.exhaustionDebt %= EXHAUSTION_DEBT_PER_BURNOUT;
  state.burnout += burnoutGain;
  state.stats.exhaustionBurnout = (state.stats.exhaustionBurnout || 0) + burnoutGain;
  addLog(`Overexertion added ${burnoutGain} burnout.`);
}

function setClock(clock) {
  state.clock = clock;
}

function getClockParts(clock = state.clock) {
  const match = clock.match(/^([A-Z]{3}) (\d{1,2}):(\d{2}) (AM|PM)$/);
  if (!match) return { day: clock.slice(0, 3), hour: 7, minute: 22, period: "AM" };
  return {
    day: match[1],
    hour: Number(match[2]),
    minute: Number(match[3]),
    period: match[4],
  };
}

function formatClockParts({ day, hour, minute, period }) {
  return `${day} ${hour}:${String(minute).padStart(2, "0")} ${period}`;
}

function getNextWeekday(day = state.clock.slice(0, 3), days = 1) {
  const index = WEEKDAYS.indexOf(day);
  return WEEKDAYS[((index >= 0 ? index : 0) + days) % WEEKDAYS.length];
}

function advanceClockMinutes(minutes) {
  const parts = getClockParts();
  let hour24 = parts.hour % 12;
  if (parts.period === "PM") hour24 += 12;
  let total = hour24 * 60 + parts.minute + minutes;
  let dayOffset = 0;
  while (total >= 24 * 60) {
    total -= 24 * 60;
    dayOffset += 1;
  }
  while (total < 0) {
    total += 24 * 60;
    dayOffset -= 1;
  }
  const nextHour24 = Math.floor(total / 60);
  const hour = nextHour24 % 12 || 12;
  setClock(formatClockParts({
    day: getNextWeekday(parts.day, dayOffset),
    hour,
    minute: total % 60,
    period: nextHour24 >= 12 ? "PM" : "AM",
  }));
}

function advanceToNextMorning(days = 1) {
  const day = getNextWeekday(state.clock.slice(0, 3), days);
  setClock(`${day} 7:18 AM`);
}

function getOvernightRecovery({ stayedLate = false, burnout = state.burnout } = {}) {
  const enduranceBonus = state.training.includes("endurance") ? 10 : 0;
  const burnoutPenalty = burnout * 10;
  const latePenalty = stayedLate ? 10 : 0;
  const recoveryFloor = stayedLate ? MIN_STAYED_LATE_RECOVERY : MIN_OVERNIGHT_RECOVERY;
  return Math.max(recoveryFloor, 65 + enduranceBonus - burnoutPenalty - latePenalty);
}

function getStayedLateEnergyCap(lateNightStreak = state.flags.consecutiveLateNights || 1) {
  const streakPenalty = STAY_LATE_NEXT_MORNING_CAP_LOSS
    + Math.max(0, lateNightStreak - 1) * CONSECUTIVE_LATE_NIGHT_CAP_LOSS;
  return Math.max(MIN_STAY_LATE_NEXT_MORNING_ENERGY, getMaxEnergy() - streakPenalty);
}

function applyOvernightRecovery({ stayedLate = false, recoveryDay = false } = {}) {
  const beforeEnergy = state.energy;
  const beforeBurnout = state.burnout;
  const recovery = recoveryDay ? getMaxEnergy() : getOvernightRecovery({ stayedLate });
  const recoveredEnergy = recoveryDay ? getMaxEnergy() : Math.min(getMaxEnergy(), state.energy + recovery);
  state.energy = stayedLate && !recoveryDay
    ? Math.min(recoveredEnergy, getStayedLateEnergyCap())
    : recoveredEnergy;
  if (recoveryDay) {
    state.burnout = Math.max(0, state.burnout - 2);
  } else if (!stayedLate && state.energy >= Math.ceil(getMaxEnergy() * 0.75)) {
    state.burnout = Math.max(0, state.burnout - 1);
  }
  return {
    energyRecovered: state.energy - beforeEnergy,
    burnoutRecovered: beforeBurnout - state.burnout,
    recovery,
  };
}

function previewShiftChoice(choice) {
  const maxEnergy = getMaxEnergy();
  const energyCost = choice === "prep" ? STAY_LATE_PREP_ENERGY_COST : choice === "help-josh" ? HELP_JOSH_ENERGY_COST : 0;
  const stayedLate = ["prep", "help-josh"].includes(choice);
  const recoveryDay = choice === "recovery-day";
  const lateNightStreak = stayedLate ? (state.flags.consecutiveLateNights || 0) + 1 : 0;
  const unpaidEnergy = Math.max(0, energyCost - state.energy);
  const exhaustionBurnoutGain = Math.floor(((state.flags.exhaustionDebt || 0) + unpaidEnergy) / EXHAUSTION_DEBT_PER_BURNOUT);
  const burnoutAfterChoice = Math.max(0, state.burnout + exhaustionBurnoutGain + (stayedLate ? STAY_LATE_BURNOUT_GAIN : 0));
  const recovery = recoveryDay ? maxEnergy : getOvernightRecovery({ stayedLate, burnout: burnoutAfterChoice });
  const energyAfterChoice = Math.max(0, state.energy - energyCost);
  const rawNextEnergy = recoveryDay ? maxEnergy : Math.min(maxEnergy, energyAfterChoice + recovery);
  const lateEnergyCap = stayedLate ? getStayedLateEnergyCap(lateNightStreak) : maxEnergy;
  const nextEnergy = Math.min(rawNextEnergy, lateEnergyCap);
  const cappedRecovery = recoveryDay ? 0 : Math.max(0, energyAfterChoice + recovery - maxEnergy);
  const lateCapNote = stayedLate && rawNextEnergy > lateEnergyCap
    ? ` Stayed-late fatigue caps tomorrow at ${lateEnergyCap} energy${lateNightStreak > 1 ? ` after ${lateNightStreak} late nights` : ""}.`
    : "";
  const nextBurnout = recoveryDay
    ? Math.max(0, burnoutAfterChoice - 2)
    : !stayedLate && nextEnergy >= Math.ceil(maxEnergy * 0.75)
      ? Math.max(0, burnoutAfterChoice - 1)
      : burnoutAfterChoice;
  return {
    nextEnergy,
    nextBurnout,
    recovery,
    pressure: choice === "prep"
      ? "Management may notice the extra time."
      : choice === "help-josh"
        ? "Josh and the crew remember the help."
        : choice === "recovery-day"
          ? "Management may notice the schedule gap."
          : "No obvious reputation pressure.",
    benefit: choice === "prep" ? "+1 Fieldcraft/Documentation next dispatch" : choice === "help-josh" ? "Josh relationship progress" : choice === "recovery-day" ? "Skips next workday pressure" : "Clean rest",
    capNote: lateCapNote || (cappedRecovery ? ` ${cappedRecovery} recovery would be capped at max energy.` : ""),
  };
}

function getEndShiftChoicePreviewMarkup() {
  const choices = [
    { id: "clock-out", label: "Clock out" },
    { id: "prep", label: "Stay late prep" },
    { id: "help-josh", label: "Help Josh" },
    { id: "recovery-day", label: "Recovery day" },
  ];
  return `
    <ul class="modal-list">
      ${choices.map((choice) => {
        const preview = previewShiftChoice(choice.id);
        return `<li><strong>${choice.label}: ${preview.nextEnergy}/${getMaxEnergy()} energy, burnout ${preview.nextBurnout}</strong><span>${preview.benefit}. ${preview.pressure} Recovery: +${preview.recovery} energy.${preview.capNote}</span></li>`;
      }).join("")}
    </ul>
  `;
}

function clearEndShiftState() {
  state.flags.endShiftPending = false;
  state.flags.endShiftSource = null;
  state.flags.endShiftSummaryShown = false;
  state.flags.energyExhaustedThisShift = false;
  state.flags.exhaustionDebt = 0;
}

function startEndShift(source) {
  state.flags.endShiftPending = true;
  state.flags.endShiftSource = source;
  state.flags.shiftPrepActive = false;
  state.flags.endShiftSummaryShown = false;
}

function returnToShopAfterDispatch(source, message) {
  state.carry = [];
  startEndShift(source);
  if (message) addLog(message);
  enterScene("shop");
  showEndShiftModal();
}

function finishWarehouseShift(source) {
  startEndShift(source);
  render();
  showEndShiftModal();
}

function showEndShiftModal() {
  const source = state.flags.endShiftSource || "today's dispatch";
  const ordinaryRecovery = getOvernightRecovery();
  const lateRecovery = getOvernightRecovery({ stayedLate: true, burnout: state.burnout + STAY_LATE_BURNOUT_GAIN });
  const lateEnergyCap = getStayedLateEnergyCap((state.flags.consecutiveLateNights || 0) + 1);
  showModal({
    kicker: "End Of Shift",
    title: "Close Out The Workday",
    body: `
      <p>${source} is wrapped. Dispatch has more work, but the next job should start after an actual shift reset.</p>
      <div class="results-grid">
        <span>Current time</span><strong>${state.clock}</strong>
        <span>Energy</span><strong>${state.energy}/${getMaxEnergy()}</strong>
        <span>Burnout</span><strong>${state.burnout}</strong>
        <span>Overnight recovery</span><strong>+${ordinaryRecovery} energy${state.burnout ? " after burnout penalty" : ""}</strong>
        <span>Stayed-late recovery</span><strong>+${lateRecovery} energy after new burnout</strong>
        <span>Stayed-late cap</span><strong>${lateEnergyCap}/${getMaxEnergy()} energy tomorrow</strong>
      </div>
      <p class="muted">Burnout reduces ordinary overnight recovery. Staying late helps the work, but it caps tomorrow's energy; consecutive late nights tighten that cap. Recovery days restore more, but management notices the schedule gap.</p>
      <p><strong>Next-morning preview:</strong></p>
      ${getEndShiftChoicePreviewMarkup()}
    `,
    actions: [
      { label: `Clock out and go home (+${ordinaryRecovery} energy overnight)`, onClick: () => completeShift("clock-out") },
      { label: `Stay late to prep tomorrow (-${STAY_LATE_PREP_ENERGY_COST} energy, +${STAY_LATE_BURNOUT_GAIN} burnout, prep advantage)`, className: "secondary-button", onClick: () => completeShift("prep") },
      { label: `Help Josh clean up notes (-${HELP_JOSH_ENERGY_COST} energy, +${STAY_LATE_BURNOUT_GAIN} burnout, crew remembers)`, className: "secondary-button", onClick: () => completeShift("help-josh") },
      { label: "Take a recovery day (full energy, management may notice)", className: "secondary-button", onClick: () => completeShift("recovery-day") },
      { label: "Not Yet", className: "text-button", onClick: render },
    ],
  });
}

function completeShift(choice) {
  const source = state.flags.endShiftSource || "Shift";
  let stayedLate = false;
  let days = 1;
  if (choice === "prep") {
    changeEnergy(-STAY_LATE_PREP_ENERGY_COST);
    state.burnout += STAY_LATE_BURNOUT_GAIN;
    stayedLate = true;
    state.flags.consecutiveLateNights = (state.flags.consecutiveLateNights || 0) + 1;
    state.flags.shiftPrepActive = true;
    state.reputation.management -= 1;
    state.stats.stayLatePrepDays += 1;
    addLog("Stayed late to prep tomorrow's first dispatch. Fieldcraft and documentation get a next-shift boost, but the extra unpaid time landed hard.");
  } else if (choice === "help-josh") {
    changeEnergy(-HELP_JOSH_ENERGY_COST);
    state.burnout += STAY_LATE_BURNOUT_GAIN;
    stayedLate = true;
    state.flags.consecutiveLateNights = (state.flags.consecutiveLateNights || 0) + 1;
    state.reputation.coworkers += 1;
    state.stats.shopHelpDays += 1;
    addLog("Helped Josh clean up notes and labels before clocking out. Coworker reputation improved, and the longer day still took something out of you.");
  } else if (choice === "recovery-day") {
    days = 2;
    state.flags.consecutiveLateNights = 0;
    state.reputation.management -= 1;
    state.stats.recoveryDays += 1;
    addLog("Took a recovery day instead of accepting the next dispatch. Management reputation took a small hit.");
  } else {
    state.flags.shiftPrepActive = false;
    state.flags.consecutiveLateNights = 0;
    addLog("Clocked out and went home instead of turning the next dispatch into the same tired day.");
  }
  const recovery = applyOvernightRecovery({ stayedLate, recoveryDay: choice === "recovery-day" });
  state.stats.shiftsCompleted += 1;
  if (choice !== "recovery-day") state.stats.overnightRests += 1;
  clearEndShiftState();
  advanceToNextMorning(days);
  addLog(`${source} closed out. Recovered ${recovery.energyRecovered} energy${recovery.burnoutRecovered ? ` and reduced burnout by ${recovery.burnoutRecovered}` : ""}.`);
  render();
}

function getShiftPrepSkillBonus(skillId) {
  if (!state.flags.shiftPrepActive) return 0;
  return ["fieldcraft", "documentation"].includes(skillId) ? 1 : 0;
}

function showBreakArea() {
  if (state.flags.endShiftPending) return showEndShiftModal();
  showModal({
    kicker: "Break Area",
    title: "Use The Quiet Corner Before Dispatch Finds You",
    body: `
      <p>The break area is now same-day recovery and preparation, not a free time machine.</p>
      <div class="results-grid">
        <span>Energy</span><strong>${state.energy}/${getMaxEnergy()}</strong>
        <span>Burnout</span><strong>${state.burnout}</strong>
        <span>Lunch packed</span><strong>${state.flags.packedLunchReady ? "Yes" : "No"}</strong>
        <span>Cash</span><strong>${formatCash(state.cash)}</strong>
      </div>
    `,
    actions: [
      { label: "Take 15-minute break (+10 energy)", onClick: takeShortBreak },
      ...(!state.flags.packedLunchReady ? [{ label: "Pack lunch for next dispatch", className: "secondary-button", onClick: packLunchForNextDispatch }] : []),
      ...(state.cash >= 5 ? [{ label: "Buy bad shop coffee - $5 (+12 energy, +1 burnout)", className: "secondary-button", onClick: buyBreakCoffee }] : []),
      { label: "Take unpaid recovery day (full energy, management may notice)", className: "secondary-button", onClick: takeRecoveryDayFromShop },
      { label: "Leave Break Area", className: "text-button" },
    ],
  });
}

function takeShortBreak() {
  if (state.energy >= getMaxEnergy()) return notify("You are already at full energy. The chair is still bad.");
  changeEnergy(10);
  advanceClockMinutes(15);
  state.stats.sameDayBreaks += 1;
  addLog("Took a short break. Energy improved, and the clock moved instead of the calendar.");
  render();
}

function packLunchForNextDispatch() {
  state.flags.packedLunchReady = true;
  state.stats.lunchesPacked += 1;
  addLog("Packed lunch for the next dispatch. It will restore energy when you head out.");
  render();
}

function buyBreakCoffee() {
  state.cash -= 5;
  changeEnergy(12);
  state.burnout += 1;
  state.stats.coffeeBreaks += 1;
  state.stats.coffeesBought += 1;
  addLog("Bought bad shop coffee. Energy improved, but burnout ticked up.");
  render();
}

function takeRecoveryDayFromShop() {
  state.reputation.management -= 1;
  state.stats.recoveryDays += 1;
  const recovery = applyOvernightRecovery({ recoveryDay: true });
  state.flags.energyExhaustedThisShift = false;
  state.flags.exhaustionDebt = 0;
  state.flags.consecutiveLateNights = 0;
  advanceToNextMorning(1);
  addLog(`Took an unpaid recovery day. Recovered ${recovery.energyRecovered} energy${recovery.burnoutRecovered ? ` and reduced burnout by ${recovery.burnoutRecovered}` : ""}. Management noticed.`);
  render();
}

function consumePackedLunch(context) {
  if (!state.flags.packedLunchReady) return;
  state.flags.packedLunchReady = false;
  changeEnergy(8);
  addLog(`Ate the packed lunch before ${context}. Energy improved.`);
}

function awardCareerProgress({ xp, reputation, source }) {
  const previousLevel = getCareerLevel();
  state.xp += xp;
  state.jobsCompleted += 1;
  Object.entries(reputation).forEach(([group, amount]) => {
    state.reputation[group] += amount;
  });
  addLog(`${source}: +${xp} XP.`);
  const currentLevel = getCareerLevel();
  if (currentLevel > previousLevel) {
    addLog(`Career level increased. You are now a Level ${currentLevel} ${getCareerRank(currentLevel).name}.`);
  }
}

function startGame(technicianOrId) {
  const technician = typeof technicianOrId === "string"
    ? content.technicians.find((item) => item.id === technicianOrId)
    : technicianOrId;
  if (!technician) return;
  resetRuntimeState();
  state.technician = technician;
  state.tools = uniqueValues(["screwdriver", ...(state.technician.startingTools || [])]);
  state.energy = state.technician.stats.energy;
  state.burnout = state.technician.stats.burnout;
  state.cash = state.technician.startingCash || 0;
  addLog(`${state.technician.name}'s first day started${state.technician.custom ? " from a custom build" : ""}. Nobody mentioned an onboarding packet.`);
  elements.selection.classList.add("hidden");
  elements.gameLayout.classList.remove("hidden");
  elements.menuButton.classList.remove("hidden");
  enterScene("shop");
}

function enterScene(sceneId, playerPosition = null) {
  state.sceneId = sceneId;
  state.player = playerPosition && !overlapsSolidObject(playerPosition.x, playerPosition.y)
    ? { ...playerPosition }
    : { ...content.scenes[sceneId].playerStart };
  render();
  elements.scene.focus();
}

function getNextShopLoad() {
  return content.tutorial.shopLoad.find((item) => !state.loaded.includes(item));
}

function getNextAssemblyItem() {
  return content.tutorial.assembly.find((item) => !state.assembled.includes(item.id));
}

function promptTravel() {
  showModal({
    kicker: "Route Summary",
    title: "Wayne Area -> Center City East",
    body: `
      <p><strong>Dispatch estimate:</strong> Simple two-cart build. Supervisor onsite.</p>
      <p>Today's drive is scripted for the tutorial. Future jobs can offer route, toll, and parking choices.</p>
      <div class="route-line"><span>WAYNE AREA</span><i></i><span>CENTER CITY EAST</span></div>
    `,
    actions: [{
      label: "Drive to Center City",
      onClick: () => {
        consumePackedLunch("the Center City build");
        setClock("MON 8:03 AM");
        addLog("Arrived in Center City East. Curb unloading was not arranged.");
        showParkingModal();
      },
    }],
  });
}

function showParkingModal() {
  showModal({
    kicker: "Parking Complication",
    title: "Garage First, Apparently",
    body: `
      <p>The client building has no arranged curb access. Park in a nearby fictional garage and meet your supervisor at the van.</p>
      <p class="expense">Garage parking: <strong>-$18</strong> pending reimbursement</p>
    `,
    actions: [{ label: "Park on Level B2", onClick: () => enterScene("garage") }],
  });
}

function showLobbyTransition() {
  showModal({
    kicker: "Client Entrance",
    title: "Everything Is Inside",
    body: `<p>You made the garage trips manually. A folding hand truck is beginning to sound appealing.</p>`,
    actions: [{ label: "Enter Lobby", onClick: () => enterScene("lobby") }],
  });
}

function showSupervisorDeparture() {
  state.flags.supervisorLeft = true;
  setClock("MON 11:38 AM");
  showModal({
    kicker: "Supervisor Update",
    title: "You Should Be Fine. Probably.",
    body: `
      <p><strong>Supervisor:</strong> "I'm sorry. They need me at another site for meetings. Finish the second cart the same way and text me if anything gets weird."</p>
      <p>Your supervisor leaves apologetically. They appear to be having a worse day than you.</p>
    `,
    actions: [{
      label: "Finish Cart 2 Alone",
      onClick: () => {
        addLog("Supervisor pulled into meetings at another site. You are finishing alone.");
        render();
      },
    }],
  });
}

function getCableDressEnergyCost() {
  return Math.max(0, 13 - getCarefulTaskReduction());
}

function showFinishChoice() {
  setClock("MON 5:46 PM");
  showModal({
    kicker: "Last Decision",
    title: "Cart 2 Works. The Cables Do Not Look Happy.",
    body: `
      <p>Dispatch expected you to be done hours ago. You can clean up the cable routing or leave before traffic gets worse.</p>
      ${canUseMakeThatWorkShortcut() ? `<p class="muted">${getCharacterLine("finishChoice", "You can make the awkward path work for now. The question is whether it deserves to become the install.")}</p>` : ""}
      ${state.flags.cartAssemblyStrained ? `<p class="muted">Some assembly checks were strained. Dressing the cables properly also gives you time to catch the shaky details.</p>` : ""}
      <p><strong>Energy:</strong> ${state.energy}/${getMaxEnergy()}</p>
      ${getChoicePressureMarkup([
        {
          label: "Dress properly",
          detail: "Careful install closeout. Costs time and energy now; likely protects the client and next tech while making management impatient.",
        },
        ...(canUseMakeThatWorkShortcut() ? [{
          label: "Use the workaround",
          detail: "Fast improvisation. Saves energy now, but may turn today's temporary fix into tomorrow's return trip.",
        }] : []),
        {
          label: "Zip ties and leave",
          detail: "Management-friendly speed. Lower effort now; future risk depends on how clean the build really was.",
        },
      ])}
    `,
    actions: [
      { label: `Dress the cables properly (+35 min, -${getCableDressEnergyCost()} energy)`, onClick: () => finishJob("tidy") },
      ...(canUseMakeThatWorkShortcut() ? [{
        label: "Use the adapter workaround and leave",
        className: "secondary-button",
        onClick: () => finishJob("wiley-workaround"),
      }] : []),
      { label: "Use three zip ties and leave", className: "secondary-button", onClick: () => finishJob("rush") },
    ],
  });
}

function finishJob(choice) {
  state.flags.finished = true;
  state.flags.finishChoice = choice;
  if (choice === "tidy") {
    changeEnergy(-getCableDressEnergyCost());
    state.burnout += 1;
    setClock("MON 6:21 PM");
    addLog("Cable routing cleaned up. Client is happy. Management notices the clock.");
  } else if (choice === "wiley-workaround") {
    changeEnergy(-2);
    setClock("MON 5:49 PM");
    state.stats.callbacks += 1;
    state.flags.wileyUsedTemporaryFix = true;
    recordReturnTripRisk("usedTemporaryAdapterPermanently", {
      source: "Two Quick Carts",
      detail: "Adapter workaround used as final install path.",
    });
    addLog(getCharacterLine("workaroundLog", "Made the adapter path work for now. The closeout notes did not get smarter."));
  } else {
    changeEnergy(-4);
    setClock("MON 5:54 PM");
    if (state.flags.cartAssemblyStrained) {
      state.stats.callbacks += 1;
      state.flags.tutorialAssemblyCallbackRisk = true;
    }
    addLog("You left before traffic got worse. The second cart may become a callback.");
  }
  if (!state.flags.tutorialPaid) {
    state.cash += choice === "tidy" ? 152 : 141;
    state.flags.tutorialPaid = true;
  }
  if (!state.flags.tutorialProgressAwarded) {
    awardCareerProgress({
      xp: 40,
      reputation: choice === "tidy"
        ? { clients: 2, coworkers: 1, management: -1 }
        : choice === "wiley-workaround"
        ? { clients: 1, coworkers: -1, management: 1 }
        : { clients: 0, coworkers: 0, management: 1 },
      source: "Two Quick Carts",
    });
    state.flags.tutorialProgressAwarded = true;
  }
  if (!state.flags.tutorialStatsRecorded) {
    state.stats.overtimeDays += 1;
    if (choice === "tidy") state.stats.carefulFinishes += 1;
    state.flags.tutorialStatsRecorded = true;
  }
  showResults();
}

function showResults() {
  const tidy = state.flags.finishChoice === "tidy";
  const netPay = tidy ? 152 : 141;
  const rewardTools = content.tutorial.rewardTools.filter((toolId) => !ownsTool(toolId));
  showModal({
    kicker: "End of Day",
    title: "Two Quick Carts: Complete",
    body: `
      <div class="results-grid">
        <span>Base wages</span><strong>+$128</strong>
        <span>Overtime</span><strong>+${tidy ? "$42" : "$31"}</strong>
        <span>Garage parking</span><strong>-$18</strong>
        <span>Net take-home</span><strong>+$${netPay}</strong>
        <span>Cash balance</span><strong>${formatCash(state.cash)}</strong>
        <span>Expense status</span><strong>Receipt under review</strong>
        <span>Energy remaining</span><strong>${state.energy}/${getMaxEnergy()}</strong>
        <span>Burnout</span><strong>${state.burnout}</strong>
        <span>Experience</span><strong>+40 XP</strong>
      </div>
      <blockquote>Management note: "Please improve time management and plan parking more efficiently."</blockquote>
      <p>You survived your first week early. ${rewardTools.length ? "Choose one starter upgrade." : "Your starter kit already covers the current upgrade choices."}</p>
    `,
    actions: rewardTools.length ? rewardTools.map((toolId) => ({
      label: content.tools[toolId].name,
      className: "secondary-button",
      onClick: () => chooseReward(toolId),
    })) : [{
      label: "Return to Radnor Rack & Wire",
      onClick: () => {
        state.flags.reward = "starter-kit";
        addLog("Starter kit already included the current upgrade choices.");
        returnToShopAfterDispatch("Two Quick Carts", "Returned to Radnor Rack & Wire after the Center City cart build.");
      },
    }],
  });
}

function chooseReward(toolId) {
  if (!ownsTool(toolId)) state.tools.push(toolId);
  state.flags.reward = toolId;
  showModal({
    kicker: "Personal Tool Added",
    title: content.tools[toolId].name,
    body: `
      <p>${content.tools[toolId].description}</p>
      <p class="muted">${getToolEffectText(content.tools[toolId])}</p>
    `,
    actions: [{
      label: "Return to Radnor Rack & Wire",
      onClick: () => {
        addLog(`${content.tools[toolId].name} added to your personal kit.`);
        returnToShopAfterDispatch("Two Quick Carts", "Returned to Radnor Rack & Wire after the Center City cart build.");
      },
    }],
  });
}

function showPersonalKit() {
  const ownedTools = state.tools.map((toolId) => content.tools[toolId]);
  const partsBrainActive = hasActivePartsBrainFind();
  showModal({
    kicker: "Personal Kit",
    title: "Your Tools",
    body: `
      <ul class="modal-list">
        ${ownedTools.map((tool) => `<li><strong>${tool.name}</strong><span>${getToolEffectText(tool)}</span></li>`).join("")}
      </ul>
      <p class="muted">Garage carry capacity: ${getCarryCapacity("garage")} equipment group${getCarryCapacity("garage") === 1 ? "" : "s"}</p>
      <p class="muted">Assembly energy cost: ${getAssemblyEnergyCost(7)} per cart component</p>
      <p class="muted">Signal-path verification energy cost: ${getVerificationEnergyCost(4)}</p>
      ${ownsTool("circuitHutOrganizer") ? `<p class="muted">Circuit Hut Parts Brain: ${partsBrainActive ? `active this dispatch (${getUsedPartsBrainDispatches()[getCurrentDispatchKey()]})` : "unused for this dispatch"}</p>` : ""}
    `,
    actions: [
      ...(canUsePartsBrain() ? [{
        label: "Check Circuit Hut Organizer",
        className: "secondary-button",
        onClick: useCircuitHutPartsBrain,
      }] : []),
      { label: "Close Tool Bag" },
    ],
  });
}

function useCircuitHutPartsBrain() {
  if (!canUsePartsBrain()) return showPersonalKit();
  const dispatchKey = getCurrentDispatchKey();
  const find = getPartsBrainFind();
  getUsedPartsBrainDispatches()[dispatchKey] = find;
  addLog(`${state.technician.name} checked the Circuit Hut organizer and found a ${find}.`);
  showModal({
    kicker: "Circuit Hut Parts Brain",
    title: "Small Part, Big Judgment Call",
    body: `
      <p>${state.technician.name} digs through the old parts organizer and finds a <strong>${find}</strong>.</p>
      <p>This can help with testing during the current dispatch. It does not automatically make the workaround acceptable for final closeout.</p>
      <blockquote>${state.technician.name}: "${getCharacterLine("partsBrainQuote", "This is fine for testing. Permanent is where the paperwork starts.")}"</blockquote>
    `,
    actions: [{ label: "Pocket It For Testing", onClick: render }],
  });
}

function showCareerClipboard() {
  const rank = getCareerRank();
  const nextRank = getNextCareerRank();
  const pendingTraining = hasPendingTraining();
  const selectedTraining = state.training.map((trainingId) => (
    content.career.trainingChoices.find((choice) => choice.id === trainingId)
  ));
  showModal({
    kicker: "Radnor Rack & Wire Career Clipboard",
    title: `Level ${rank.level} ${rank.name}`,
    body: `
      <div class="results-grid">
        <span>Experience</span><strong>${state.xp} XP</strong>
        <span>Next rank</span><strong>${nextRank ? `${nextRank.name} at ${nextRank.xpRequired} XP` : "More ranks coming soon"}</strong>
        <span>Jobs completed</span><strong>${state.jobsCompleted}</strong>
        <span>Client reputation</span><strong>${formatReputation(state.reputation.clients)}</strong>
        <span>Coworker reputation</span><strong>${formatReputation(state.reputation.coworkers)}</strong>
        <span>Management reputation</span><strong>${formatReputation(state.reputation.management)}</strong>
      </div>
      <p><strong>Active consequences:</strong></p>
      ${getActiveCareerSummaryMarkup()}
      <p><strong>Build identity:</strong></p>
      ${getBuildIdentityMarkup()}
      <p><strong>Skill tree details:</strong></p>
      ${getSkillSummaryMarkup()}
      <p><strong>Current company:</strong></p>
      ${getCompanyProfileMarkup()}
      ${selectedTraining.length ? `
        <p><strong>Training completed:</strong></p>
        <ul class="modal-list">
          ${selectedTraining.map((choice) => `<li><strong>${choice.branch || "Training"}: ${choice.name}</strong><span>${choice.effect}</span></li>`).join("")}
        </ul>
      ` : ""}
      <p><strong>Milestone preview:</strong></p>
      <ul class="modal-list">
        ${getCareerMilestones().map((milestone) => `<li><strong>${milestone.status} ${milestone.name}</strong><span>${milestone.description}</span></li>`).join("")}
      </ul>
      <p><strong>Career goals:</strong></p>
      ${getCareerGoalsMarkup()}
      <p><strong>Active career effects:</strong></p>
      ${getCareerEffectsMarkup()}
      <p><strong>Career ledger:</strong></p>
      ${getCareerLedgerMarkup()}
      <p class="muted">${pendingTraining
        ? "You earned a new field-training focus. Pick the habit you want to develop next."
        : "Complete more dispatches to unlock another field-training focus."}</p>
    `,
    actions: [
      ...(pendingTraining ? content.career.trainingChoices
        .filter((choice) => !state.training.includes(choice.id))
        .map((choice) => ({
        label: `${choice.branch || "Training"} - ${choice.name}`,
        className: "secondary-button",
        onClick: () => chooseTraining(choice.id),
      })) : []),
      { label: "Return Clipboard" },
    ],
  });
}

function getCareerEffectsMarkup() {
  const effects = [
    {
      active: getDocumentationTraitReduction() > 0,
      name: "Character documentation habit",
      description: "Notebook Habit or By The Book reduces report, access-delay, and handoff paperwork by 1 energy from the start.",
    },
    {
      active: getCarefulTraitReduction() > 0,
      name: "Measure Twice tendency",
      description: "Careful closeout and repair choices cost 1 less energy before the career-wide rhythm is built.",
    },
    {
      active: getDocumentationHabitReduction() > 0,
      name: "Documentation habit",
      description: "Documenting access problems twice reduces future report and access-delay paperwork by 1 energy.",
    },
    {
      active: getCarefulWorkReduction() > 0,
      name: "Careful-work rhythm",
      description: "Two careful finishes reduce future repair and punch-list energy by 1.",
    },
    {
      active: getOpenCallbackPenalty() > 0,
      name: "Open callback drag",
      description: "Unresolved callbacks add 1 energy to access checks until the career ledger catches up.",
    },
    {
      active: Boolean(state.flags.shiftPrepActive),
      name: "Next-shift prep",
      description: "Staying late adds +1 Fieldcraft and +1 Documentation until the next dispatch closes.",
    },
  ];
  return `
    <ul class="modal-list">
      ${effects.map((effect) => `<li><strong>${effect.active ? "[ACTIVE]" : "[LOCKED]"} ${effect.name}</strong><span>${effect.description}</span></li>`).join("")}
    </ul>
  `;
}

function getCareerLedgerMarkup() {
  return `
    <div class="results-grid">
      <span>Careful finishes</span><strong>${state.stats.carefulFinishes}</strong>
      <span>Callbacks generated</span><strong>${state.stats.callbacks}</strong>
      <span>Callback notes rebuilt</span><strong>${state.stats.callbacksResolved}</strong>
      <span>Overtime days</span><strong>${state.stats.overtimeDays}</strong>
      <span>Shifts closed</span><strong>${state.stats.shiftsCompleted}</strong>
      <span>Overnight rests</span><strong>${state.stats.overnightRests}</strong>
      <span>Recovery days taken</span><strong>${state.stats.recoveryDays}</strong>
      <span>Same-day breaks</span><strong>${state.stats.sameDayBreaks}</strong>
      <span>Work orders reviewed</span><strong>${state.stats.workOrdersReviewed}</strong>
      <span>Lunches packed</span><strong>${state.stats.lunchesPacked}</strong>
      <span>Coffee jar contributions</span><strong>${state.stats.coffeesBought}</strong>
      <span>Bad coffee breaks</span><strong>${state.stats.coffeeBreaks}</strong>
      <span>Energy crashes</span><strong>${state.stats.energyCrashes || 0}</strong>
      <span>Overexertion burnout</span><strong>${state.stats.exhaustionBurnout || 0}</strong>
      <span>Late prep nights</span><strong>${state.stats.stayLatePrepDays}</strong>
      <span>Shop help nights</span><strong>${state.stats.shopHelpDays}</strong>
      <span>Site surveys completed</span><strong>${state.stats.surveysCompleted}</strong>
      <span>Access risks documented</span><strong>${state.stats.accessRisksDocumented}</strong>
      <span>Quotes trusted anyway</span><strong>${state.stats.quotesTrustedAnyway}</strong>
      <span>Rooms commissioned</span><strong>${state.stats.commissioningRoomsCompleted}</strong>
      <span>Incomplete rooms documented</span><strong>${state.stats.incompleteRoomsDocumented}</strong>
      <span>Rooms passed anyway</span><strong>${state.stats.roomsPassedAnyway}</strong>
      <span>Warehouse runs completed</span><strong>${state.stats.warehouseRunsCompleted}</strong>
      <span>Stockroom labels corrected</span><strong>${state.stats.stockroomLabelsFixed}</strong>
      <span>Mystery boxes left alone</span><strong>${state.stats.mysteryBoxesLeft}</strong>
      <span>Secure-access jobs completed</span><strong>${state.stats.secureAccessJobsCompleted}</strong>
      <span>Access delays documented</span><strong>${state.stats.accessDelaysDocumented}</strong>
      <span>Unpaid delays absorbed</span><strong>${state.stats.unpaidDelaysAbsorbed}</strong>
      <span>Warranty returns completed</span><strong>${state.stats.warrantyReturnsCompleted}</strong>
      <span>Warranty bandages applied</span><strong>${state.stats.warrantyBandagesApplied}</strong>
      <span>Client handoffs completed</span><strong>${state.stats.clientHandoffsCompleted}</strong>
      <span>Systems jobs completed</span><strong>${state.stats.systemsJobsCompleted}</strong>
      <span>Systems mismatches documented</span><strong>${state.stats.systemMismatchesDocumented}</strong>
      <span>Quick reboots closed</span><strong>${state.stats.quickRebootsClosed}</strong>
      <span>Travel costs documented</span><strong>${state.stats.travelCostsDocumented}</strong>
      <span>Unreimbursed travel costs</span><strong>${state.stats.unreimbursedTravelCosts}</strong>
      <span>Training gaps left</span><strong>${state.stats.trainingGapsLeft}</strong>
      <span>Passed skill checks</span><strong>${state.stats.skillChecksPassed}</strong>
      <span>Strained skill checks</span><strong>${state.stats.skillChecksStrained}</strong>
      <span>Field task choices</span><strong>${state.stats.fieldTaskChoicesMade}</strong>
      <span>Clean terminations</span><strong>${state.stats.cleanTerminations}</strong>
      <span>Documented task risks</span><strong>${state.stats.documentedTaskRisks}</strong>
    </div>
  `;
}

function getCareerMilestones() {
  const josh = content.coworkers.josh;
  return [
    {
      status: state.training.length ? "[COMPLETE]" : getCareerLevel() >= 2 ? "[AVAILABLE]" : "[LOCKED]",
      name: "Junior Tech field-training focus",
      description: "Reach Level 2, then choose one practical habit from the career clipboard.",
    },
    {
      status: ownsTool("labeler") ? "[COMPLETE]" : state.reputation.coworkers >= josh.labelerTrustRequired ? "[AVAILABLE]" : "[LOCKED]",
      name: `${josh.name}'s rebuilt labeler`,
      description: `Earn ${josh.labelerTrustRequired} coworker reputation and check in with ${josh.name} at the shop.`,
    },
    {
      status: getCareerLevel() >= 3 ? "[COMPLETE]" : "[LOCKED]",
      name: "Field Tech rank",
      description: "Reach 180 XP. Certification choices will build on this milestone later.",
    },
  ];
}

function formatReputation(value) {
  return value > 0 ? `+${value}` : `${value}`;
}

function formatReputationDelta(reputation) {
  return `Client ${formatReputation(reputation.clients || 0)} / Team ${formatReputation(reputation.coworkers || 0)} / Mgmt ${formatReputation(reputation.management || 0)}`;
}

function chooseTraining(trainingId) {
  if (!hasPendingTraining()) return showCareerClipboard();
  const choice = content.career.trainingChoices.find((item) => item.id === trainingId);
  if (!choice || state.training.includes(trainingId)) return showCareerClipboard();
  const previousMaxEnergy = getMaxEnergy();
  state.training.push(trainingId);
  if (getMaxEnergy() > previousMaxEnergy) changeEnergy(getMaxEnergy() - previousMaxEnergy);
  addLog(`${choice.name} selected as your next field-training focus.`);
  showModal({
    kicker: "Field Training Added",
    title: choice.name,
    body: `<p>${choice.description}</p><p class="muted">${choice.effect}</p><p><strong>Current skill tree:</strong></p>${getSkillSummaryMarkup()}`,
    actions: [{ label: "Return to Shop", onClick: render }],
  });
}

function showJoshConversation() {
  const josh = content.coworkers.josh;
  if (!state.flags.metJosh) {
    state.flags.metJosh = true;
    addLog("Met Josh, the lead technician. Management interrupted to blame him for an inventory problem.");
    return showModal({
      kicker: `${josh.name} / ${josh.role}`,
      title: "The Person Keeping This Place Running",
      body: `
        <p>Josh is sorting a pile of adapters into bins with labels that look newer than the shelves.</p>
        <p><strong>Manager, from the sales office:</strong> "Josh, why are we missing two HDMI couplers? This inventory situation is becoming a pattern."</p>
        <p><strong>Josh:</strong> "Morning. Ignore that. They zip-tied both couplers behind a display yesterday and called it spare inventory. If you get stuck onsite, slow down and trace the path before you start swapping things."</p>
      `,
      actions: [{ label: "Thank Josh", onClick: render }],
    });
  }
  if (state.flags.serviceCallbackPending && !state.flags.serviceCallbackResolved) return showJoshCallback();
  if (state.flags.serviceComplete && !state.flags.joshServiceDebriefed) {
    const checkedSignalPath = state.flags.serviceApproach === "verify";
    state.flags.joshServiceDebriefed = true;
    addLog(checkedSignalPath
      ? "Josh noticed the Conshohocken room notes and the labeled coupler."
      : "Josh reviewed the Conshohocken callback and the missing room notes.");
    return showModal({
      kicker: `${josh.name} / ${josh.role}`,
      title: checkedSignalPath ? "Good Notes Save The Next Person" : "Now The Ticket Is Better Than It Was",
      body: `
        <p>Josh looks over the Conshohocken notes while management asks whether he can also swing by a warehouse to find a power supply that was last seen in "one of the vans."</p>
        <p><strong>Josh:</strong> "${checkedSignalPath
          ? "You traced it, marked the odd coupler, and left enough detail that the next person will know what happened. That is the job."
          : "You know what bit you now. Put it in the notes, label the weird part, and the next person gets to start one step ahead."}"</p>
      `,
      actions: [{
        label: canReceiveJoshLabeler() ? "Talk Tools" : "Keep That In Mind",
        onClick: () => canReceiveJoshLabeler() ? showJoshLabelerOffer() : render(),
      }],
    });
  }
  if (canReceiveJoshLabeler()) return showJoshLabelerOffer();
  notify(`Josh: "Label both ends. Future you is also a technician, and future you is already annoyed."`);
}

function showJoshCallback() {
  showModal({
    kicker: "Callback Note",
    title: "Management Found A Way To Blame Josh",
    body: `
      <p>The Conshohocken room dropped signal again after you left. Josh found the callback note clipped to his bench underneath a handwritten work order for "TV issue."</p>
      <p><strong>Manager:</strong> "Josh, can you clean this up? We need better oversight on these service calls."</p>
      <p><strong>Josh:</strong> "The weird coupler should have been in the ticket. I can close it out. If you have a minute, help me reconstruct the room notes so the next call is cleaner."</p>
    `,
    actions: [
      { label: "Help Josh reconstruct the notes (-3 energy)", onClick: () => resolveJoshCallback(true) },
      { label: "Leave Josh to close the callback", className: "secondary-button", onClick: () => resolveJoshCallback(false) },
    ],
  });
}

function resolveJoshCallback(helpJosh) {
  state.flags.serviceCallbackResolved = true;
  if (helpJosh) {
    changeEnergy(-3);
    state.reputation.coworkers += 1;
    addLog("Helped Josh reconstruct the callback notes. Coworker reputation improved.");
  } else {
    state.reputation.management += 1;
    addLog("Josh handled the callback while management praised the team's responsiveness.");
  }
  state.stats.callbacksResolved += 1;
  render();
  if (canReceiveJoshLabeler()) showJoshLabelerOffer();
}

function canReceiveJoshLabeler() {
  return state.flags.metJosh
    && !ownsTool("labeler")
    && state.reputation.coworkers >= content.coworkers.josh.labelerTrustRequired;
}

function showJoshLabelerOffer() {
  const tool = content.tools.labeler;
  showModal({
    kicker: "Coworker Hand-Me-Down",
    title: tool.name,
    body: `
      <p><strong>Josh:</strong> "I rebuilt the feed roller on this one. It is not fancy, but it is dependable. Put your name in it before somebody decides it belongs in Van #2."</p>
      <p>${tool.description}</p>
      <p class="muted">${tool.effect}</p>
    `,
    actions: [{ label: "Add Labeler To Personal Kit", onClick: receiveJoshLabeler }],
  });
}

function receiveJoshLabeler() {
  if (!ownsTool("labeler")) state.tools.push("labeler");
  state.flags.joshLabelerGift = true;
  addLog("Josh handed down his rebuilt labeler.");
  showModal({
    kicker: "Personal Tool Added",
    title: content.tools.labeler.name,
    body: `<p>${content.tools.labeler.description}</p><p class="muted">${getToolEffectText(content.tools.labeler)}</p>`,
    actions: [{ label: "Return to Shop", onClick: render }],
  });
}

function showSupplyCounter() {
  const availableTools = Object.values(content.tools).filter((tool) => tool.price > 0 && !ownsTool(tool.id));
  showModal({
    kicker: "Radnor Rack & Wire Supply Counter",
    title: "Personal Tool Purchases",
    body: availableTools.length ? `
      <p>Company reimbursement policy: optimistic.</p>
      <ul class="modal-list">
        ${availableTools.map((tool) => `<li><strong>${tool.name} - $${tool.price}</strong><span>${getToolEffectText(tool)}</span></li>`).join("")}
      </ul>
      <p class="muted">Cash available: ${formatCash(state.cash)}</p>
    ` : `<p>You already own every tool currently stocked here.</p>`,
    actions: [
      ...availableTools.map((tool) => ({
        label: `Buy ${tool.name} - $${tool.price}`,
        className: "secondary-button",
        onClick: () => buyTool(tool.id),
      })),
      { label: "Leave Supply Counter" },
    ],
  });
}

function buyTool(toolId) {
  const tool = content.tools[toolId];
  if (!tool || ownsTool(toolId)) return showSupplyCounter();
  if (state.cash < tool.price) {
    addLog(`Not enough cash for ${tool.name}.`);
    return showSupplyCounter();
  }
  state.cash -= tool.price;
  state.tools.push(toolId);
  addLog(`${tool.name} purchased for $${tool.price}.`);
  showModal({
    kicker: "Personal Tool Added",
    title: tool.name,
    body: `<p>${tool.description}</p><p class="muted">${getToolEffectText(tool)}</p><p class="muted">Cash remaining: ${formatCash(state.cash)}</p>`,
    actions: [{ label: "Return to Shop", onClick: render }],
  });
}

function takeBreak() {
  showBreakArea();
}

function showDispatchPreview() {
  if (state.flags.endShiftPending) return showEndShiftModal();
  if (state.flags.handoffComplete && !state.flags.systemsComplete) {
    return showSystemsDispatchPreview();
  }
  if (state.flags.systemsComplete && !state.flags.travelComplete) {
    return showTravelDispatchPreview();
  }
  if (state.flags.secureAccessComplete) {
    if (!state.flags.callbackCleanupComplete && getUnresolvedCallbackCount() > 0) return showCallbackCleanupDispatchPreview();
    if (!state.flags.handoffComplete) return showHandoffDispatchPreview();
    return showPrototypeSummary();
  }
  if (state.flags.warehouseComplete) {
    return showSecureAccessDispatchPreview();
  }
  if (state.flags.commissioningComplete) {
    if (hasPendingTraining()) return notify("Mark your new field-training focus on the clipboard before taking another dispatch.");
    return showWarehouseDispatchPreview();
  }
  if (state.flags.surveyComplete) {
    return showCommissioningDispatchPreview();
  }
  if (state.flags.serviceComplete) {
    if (state.flags.serviceCallbackPending && !state.flags.serviceCallbackResolved) {
      return notify("The Conshohocken callback note is still clipped to Josh's bench.");
    }
    if (!state.flags.joshServiceDebriefed) return notify("Check in with Josh before dispatch adds another stop.");
    if (hasPendingTraining()) return notify("Mark your field-training focus on the clipboard before taking another dispatch.");
    return showSurveyDispatchPreview();
  }
  showModal({
    kicker: "Dispatch Board",
    title: "One Quick Display Swap",
    body: getDispatchBoardMarkup({
      type: "Service Call",
      familyId: "service",
      setup: "Conference-room display issue in Conshohocken. Sales says the replacement display is already onsite. The client says the room is booked again this afternoon.",
      why: "Unlocked after your first install day. The shop wants to see whether you can handle a small service call without turning it into a meeting.",
      stakes: [
        "Preparation changes diagnosis, energy, or arrival stamina.",
        "Verifying the signal path can lower return-trip risk.",
        "Rushing can help management now and cost you later.",
      ],
      note: "Use the supply counter, inspect your kit, or use the break area before leaving.",
      managementNote: "Please keep this quick. The client has another meeting, and the quote says replacement.",
      prep: state.flags.servicePreparation ? `Preparation selected: ${getServicePreparationLabel()}` : "",
    }),
    actions: [
      { label: "Accept Service Call", onClick: () => state.flags.servicePreparation ? promptServiceTravel() : showServicePreparation() },
      { label: "Return to Shop", className: "secondary-button" },
    ],
  });
}

function getDispatchTaskCardsMarkup(taskCards = []) {
  if (!taskCards.length) return "";
  return `
    <div class="dispatch-task-grid">
      ${taskCards.map((card) => `
        <div class="dispatch-task-card">
          <strong>${card.title}</strong>
          <span>${card.skill}</span>
          <small>${card.outcome}</small>
        </div>
      `).join("")}
    </div>
  `;
}

function getJobFamilyMarkup(familyId) {
  const family = content.jobFamilies?.[familyId];
  if (!family) return "";
  const skillNames = family.coreSkills
    .map((skillId) => getSkillDefinition(skillId)?.name || skillId)
    .join(", ");
  return `
    <li><strong>Job family</strong><span>${family.name}: ${family.loop}</span></li>
    <li><strong>Core RPG skills</strong><span>${skillNames}</span></li>
  `;
}

function getDispatchBoardMarkup({ type, setup, why, stakes, note, managementNote, prep = "", taskCards = [], familyId = "" }) {
  return `
    <p><strong>${type}:</strong> ${setup}</p>
    <ul class="modal-list">
      <li><strong>Why this is on the board</strong><span>${why}</span></li>
      ${getJobFamilyMarkup(familyId)}
      ${getCompanyDispatchPressureMarkup()}
      <li><strong>Stakes</strong><span>${stakes.join(" ")}</span></li>
      ${getOpenCallbackBoardMarkup()}
      ${prep ? `<li><strong>Prep</strong><span>${prep}</span></li>` : ""}
      ${state.flags.shiftPrepActive ? `<li><strong>Next-shift prep</strong><span>Stayed late last shift: +1 Fieldcraft and +1 Documentation until this dispatch closes.</span></li>` : ""}
      <li><strong>Later work</strong><span>${getUpcomingDispatchText()}</span></li>
    </ul>
    ${getDispatchTaskCardsMarkup(taskCards)}
    ${note ? `<p class="muted">${note}</p>` : ""}
    <blockquote>Management note: "${managementNote}"</blockquote>
  `;
}

function getOpenCallbackBoardMarkup() {
  const openCallbacks = getUnresolvedCallbackCount();
  if (!openCallbacks) return "";
  const returnTripSummary = getOpenReturnTripRiskSummary();
  return `<li><strong>Because of your choices</strong><span>${openCallbacks} unresolved callback${openCallbacks === 1 ? "" : "s"} on the ledger. ${returnTripSummary || "Future work may feel heavier until the callback ledger catches up."}</span></li>`;
}

function getUpcomingDispatchText() {
  return content.upcomingDispatches.length
    ? content.upcomingDispatches.map((dispatch) => `[PLANNED] ${dispatch.title}: ${dispatch.summary}`).join(" ")
    : "More erasable-marker work will be added after this board clears.";
}

function showPrototypeSummary() {
  const rank = getCareerRank();
  state.flags.prototypeSummaryViewed = true;
  render();
  showModal({
    kicker: "Current Board Complete",
    title: `Level ${rank.level} ${rank.name}`,
    body: `
      <p>You cleared the current Radnor Rack & Wire dispatch board. More work is already written in erasable marker.</p>
      <div class="results-grid">
        <span>Experience</span><strong>${state.xp} XP</strong>
        <span>Cash balance</span><strong>${formatCash(state.cash)}</strong>
        <span>Client reputation</span><strong>${formatReputation(state.reputation.clients)}</strong>
        <span>Coworker reputation</span><strong>${formatReputation(state.reputation.coworkers)}</strong>
        <span>Management reputation</span><strong>${formatReputation(state.reputation.management)}</strong>
      </div>
      <p><strong>Career ledger:</strong></p>
      ${getCareerLedgerMarkup()}
      <p><strong>Upcoming dispatch:</strong></p>
      <ul class="modal-list">
        ${content.upcomingDispatches.map((dispatch) => `<li><strong>[LOCKED] ${dispatch.title}</strong><span>${dispatch.summary}</span></li>`).join("")}
      </ul>
      <p><strong>Career check-in:</strong></p>
      <ul class="modal-list">
        <li><strong>Did the walking stay purposeful?</strong><span>Loading and carrying should explain the job without becoming repetitive.</span></li>
        <li><strong>Did your choices feel visible?</strong><span>Your tools, preparation, diagnosis, survey report, commissioning notes, stockroom decision, access-delay report, systems closeout, and travel-cost choice should change how the workday plays.</span></li>
        <li><strong>Did progression make you curious?</strong><span>The shop, clipboard, and locked dispatches should make one more workday sound appealing.</span></li>
      </ul>
      <blockquote>Dispatch note: "Please remain flexible. Several schedules are currently being finalized retroactively."</blockquote>
    `,
    actions: [
      { label: "Review Career Clipboard", onClick: showCareerClipboard },
      { label: "Return To Shop", className: "secondary-button", onClick: render },
      { label: "Return To Title Screen", className: "secondary-button", onClick: showTitleScreen },
    ],
  });
}

function showWarehouseDispatchPreview() {
  showModal({
    kicker: "Dispatch Board",
    title: content.warehouseDispatch.title,
    body: getDispatchBoardMarkup({
      type: "Warehouse Run",
      familyId: "logistics",
      setup: "Find a replacement power supply before another technician leaves for a service call. Dispatch says it was stored in one of the vans.",
      why: "Unlocked after commissioning. The shop needs a quick change of pace that tests whether messy inventory can become gameplay.",
      stakes: [
        "Searching costs energy.",
        "Fixing the bin label helps coworkers and annoys management.",
        "Leaving the pile alone keeps the task efficient and the next search worse.",
      ],
      note: "Van #2 is already offsite, and the key board says its key is with SALES.",
      managementNote: "This should only take a minute. Please check the obvious places before escalating.",
    }),
    actions: [
      { label: "Start Looking", onClick: startWarehouseRun },
      { label: "Return to Shop", className: "secondary-button" },
    ],
  });
}

function startWarehouseRun() {
  state.flags.warehouseStarted = true;
  state.flags.prototypeSummaryViewed = false;
  consumePackedLunch("the warehouse run");
  setClock(`${state.clock.slice(0, 3)} 4:18 PM`);
  addLog("Started looking for a replacement power supply reportedly stored in one of the vans.");
  render();
  showModal({
    kicker: "Radnor Rack & Wire Warehouse Run",
    title: "Check The Obvious Places",
    body: `
      <p>Search Van #3, the staging shelf, and the mystery-return pile. Dispatch has already asked whether you found it.</p>
      <p class="muted">${ownsTool("toolBag") ? "Your tool bag makes it easier to work through the loose stock." : "Loose adapters have achieved a stable ecosystem."}</p>
    `,
    actions: [{ label: "Start Searching", onClick: render }],
  });
}

function getWarehouseSearchEnergyCost() {
  return getEquipmentEnergyCost(2);
}

function getWarehouseLabelEnergyCost() {
  return ownsTool("labeler") ? 2 : 4;
}

function inspectWarehouseLocation(checkId) {
  const check = content.warehouseDispatch.checks.find((item) => item.id === checkId);
  if (!check || state.warehouseChecks.includes(checkId)) return notify(`${check?.label || "That location"} is already checked.`);
  state.warehouseChecks.push(checkId);
  const skillCheck = resolveSkillCheck(`warehouse-${checkId}`, {
    skillId: "fieldcraft",
    difficulty: checkId === "returns" ? 4 : 3,
    contextBonus: state.flags.warehouseStarted ? 0 : -1,
    contextId: "warehouse-search",
  });
  const energyCost = Math.max(0, getWarehouseSearchEnergyCost() + (skillCheck.successful ? 0 : 1) - (skillCheck.tier === "clean" ? 1 : 0));
  changeEnergy(-energyCost);
  addLog(`${check.label} checked: ${check.log}`);
  if (!skillCheck.successful) addLog(`Fieldcraft check strained on ${check.label}; the search took extra energy.`);
  render();
  const allChecked = state.warehouseChecks.length === content.warehouseDispatch.checks.length;
  showModal({
    kicker: "Warehouse Note",
    title: check.label,
    body: `
      <p>${check.detail}</p>
      ${getSkillCheckMarkup(skillCheck)}
      ${allChecked ? `<p class="muted">The matching power supply is in the mystery-return pile beneath a handwritten question mark. Decide how much cleanup dispatch is willing to survive.</p>` : ""}
    `,
    actions: [{ label: allChecked ? "Review Found Power Supply" : "Keep Looking", onClick: allChecked ? showWarehouseChoice : render }],
  });
}

function showWarehouseChoice() {
  showModal({
    kicker: "Warehouse Run",
    title: "Power Supply Located Technically",
    body: `
      <p>The correct power supply was placed in mystery returns beneath a box labeled <strong>HDMI EXTENDERS / DO NOT STOCK / RETURN?</strong></p>
      <p>Dispatch wants the part immediately. Correcting the bin label would save the next search, but it would extend a task estimated at one minute.</p>
      ${getChoicePressureMarkup([
        {
          label: "Correct the label",
          detail: "Costs energy and probably annoys management; protects coworkers from repeating the same search.",
        },
        {
          label: "Leave the pile",
          detail: "Fastest shop outcome. Management sees speed, but the stockroom problem stays hidden.",
        },
      ])}
    `,
    actions: [
      { label: `Hand off part and correct the bin label (-${getWarehouseLabelEnergyCost()} energy)`, onClick: () => finishWarehouseRun("label") },
      { label: "Hand off part and leave the pile alone", className: "secondary-button", onClick: () => finishWarehouseRun("handoff") },
    ],
  });
}

function finishWarehouseRun(approach) {
  const correctedLabel = approach === "label";
  if (correctedLabel) changeEnergy(-getWarehouseLabelEnergyCost());
  state.flags.warehouseComplete = true;
  state.flags.warehouseApproach = approach;
  state.flags.prototypeSummaryViewed = false;
  setClock(`${state.clock.slice(0, 3)} ${correctedLabel ? "4:43" : "4:35"} PM`);
  if (!state.flags.warehousePaid) {
    state.cash += 48;
    state.flags.warehousePaid = true;
  }
  if (!state.flags.warehouseProgressAwarded) {
    awardCareerProgress({
      xp: correctedLabel ? 50 : 35,
      reputation: correctedLabel
        ? { clients: 0, coworkers: 1, management: -1 }
        : { clients: 0, coworkers: 0, management: 1 },
      source: content.warehouseDispatch.title,
    });
    state.flags.warehouseProgressAwarded = true;
  }
  if (!state.flags.warehouseStatsRecorded) {
    state.stats.warehouseRunsCompleted += 1;
    if (correctedLabel) state.stats.stockroomLabelsFixed += 1;
    else state.stats.mysteryBoxesLeft += 1;
    state.flags.warehouseStatsRecorded = true;
  }
  addLog(correctedLabel
    ? "Handed off the replacement power supply and corrected the mystery-return bin label."
    : "Handed off the replacement power supply. The mystery-return pile remains self-governing.");
  render();
  showModal({
    kicker: "Warehouse Run Complete",
    title: correctedLabel ? "The Next Search Might Be Shorter" : "The Part Left The Building",
    body: `
      <div class="results-grid">
        <span>Warehouse wages</span><strong>+$48</strong>
        <span>Cash balance</span><strong>${formatCash(state.cash)}</strong>
        <span>Experience</span><strong>+${correctedLabel ? 50 : 35} XP</strong>
        <span>Stockroom</span><strong>${correctedLabel ? "Bin label corrected" : "Mystery pile preserved"}</strong>
      </div>
      ${correctedLabel
        ? `<blockquote>Management note: "Please avoid spending excessive time reorganizing stock during urgent dispatch support."</blockquote>`
        : `<blockquote>Management note: "Thanks for keeping the warehouse run efficient."</blockquote>`}
    `,
    actions: [{ label: "Return To Shop", onClick: () => finishWarehouseShift(content.warehouseDispatch.title) }],
  });
}

function showSecureAccessDispatchPreview() {
  showModal({
    kicker: "Dispatch Board",
    title: content.secureAccessDispatch.title,
    body: getDispatchBoardMarkup({
      type: "Access Quest",
      familyId: "logistics",
      setup: "Drop off a small rack update at a Navy Yard building with secure access. The ticket says Building 12. The forwarded email subject says Building 13.",
      why: "Unlocked after the warehouse run. Dispatch has moved from missing parts to missing access details.",
      stakes: [
        "Preparation can reduce access-check or report costs.",
        "Documenting the delay builds the documentation habit.",
        "Absorbing the delay protects the ticket and adds burnout.",
      ],
      note: "Dispatch says the building mismatch is probably campus language.",
      managementNote: "Please do not let access delays affect today's schedule.",
      prep: state.flags.secureAccessPreparation ? `Preparation selected: ${getSecureAccessPreparationLabel()}` : "",
    }),
    actions: [
      { label: "Accept Navy Yard Job", onClick: () => state.flags.secureAccessPreparation ? promptSecureAccessTravel() : showSecureAccessPreparation() },
      { label: "Return to Shop", className: "secondary-button" },
    ],
  });
}

function getSecureAccessPreparationLabel() {
  return {
    review: "Reviewed access email",
    contact: "Called listed site contact",
    none: "Trusted dispatch notes",
  }[state.flags.secureAccessPreparation] || "None";
}

function showSecureAccessPreparation() {
  showModal({
    kicker: "Before You Leave",
    title: "Prepare For Secure Access",
    body: `
      <p>The work order has a building number, a badge note, and a forwarded email chain where everyone spells the client acronym differently.</p>
      <p class="muted">Take one small preparation step before leaving Radnor Rack & Wire.</p>
    `,
    actions: [
      { label: "Review the access email", onClick: () => chooseSecureAccessPreparation("review") },
      { label: "Call the listed site contact", className: "secondary-button", onClick: () => chooseSecureAccessPreparation("contact") },
      { label: "Trust dispatch notes", className: "secondary-button", onClick: () => chooseSecureAccessPreparation("none") },
    ],
  });
}

function chooseSecureAccessPreparation(preparation) {
  state.flags.secureAccessPreparation = preparation;
  let title = "The Ticket Will Have To Do";
  let body = `<p>The dispatch note says "security aware," which is doing a heroic amount of work for two words.</p>`;
  if (preparation === "review") {
    title = "Access Email Reviewed";
    body = `
      <p>The email chain confirms the secure escort requirement. It also confirms nobody put your name in the visitor portal.</p>
      <p class="muted">Each access check will cost 1 less energy.</p>
    `;
    addLog("Reviewed the Navy Yard access email and found the missing visitor-portal step.");
  }
  if (preparation === "contact") {
    title = "Site Contact Reached";
    body = `
      <p>The site contact answers between meetings and confirms Building 13. They cannot add you to the visitor list until security sees the work order.</p>
      <p class="muted">Documenting the access delay will cost 1 less energy.</p>
    `;
    addLog("Called the Navy Yard site contact and confirmed the building mismatch.");
  }
  if (preparation === "none") addLog("Left for Navy Yard trusting the dispatch notes.");
  render();
  showModal({
    kicker: "Preparation Selected",
    title,
    body,
    actions: [{ label: "Head To Navy Yard", onClick: promptSecureAccessTravel }],
  });
}

function promptSecureAccessTravel() {
  showModal({
    kicker: "Route Summary",
    title: "Wayne Area -> Navy Yard",
    body: `
      <p><strong>Dispatch estimate:</strong> Quick rack update. Security already knows you are coming.</p>
      <p class="muted">Security may have received that information in a different timeline.</p>
      <div class="route-line"><span>WAYNE AREA</span><i></i><span>NAVY YARD</span></div>
    `,
    actions: [{
      label: "Drive To Security Gate",
      onClick: () => {
        state.flags.secureAccessStarted = true;
        state.flags.prototypeSummaryViewed = false;
        consumePackedLunch("the Navy Yard access job");
        setClock(`${state.clock.slice(0, 3)} 5:08 PM`);
        addLog("Arrived at Navy Yard security with a building number and a bad feeling.");
        enterScene("navyYardAccess");
      },
    }],
  });
}

function getSecureAccessCheckEnergyCost() {
  return Math.max(0, 3 - (state.flags.secureAccessPreparation === "review" ? 1 : 0) + getOpenCallbackPenalty());
}

function getSecureAccessReportEnergyCost(baseCost) {
  return Math.max(2, baseCost - (state.flags.secureAccessPreparation === "contact" ? 1 : 0) - getDocumentationSupportReduction());
}

function inspectSecureAccessCondition(checkId) {
  const check = content.secureAccessDispatch.checks.find((item) => item.id === checkId);
  if (!check || state.secureAccessChecks.includes(checkId)) return notify(`${check?.label || "That access issue"} is already in your notes.`);
  state.secureAccessChecks.push(checkId);
  const skillCheck = resolveSkillCheck(`secure-access-${checkId}`, {
    skillId: checkId === "escort" ? "clientCommunication" : "documentation",
    difficulty: checkId === "escort" ? 4 : 3,
    contextBonus: state.flags.secureAccessPreparation === "review" ? 1 : 0,
    contextId: checkId === "escort" ? "secure-access-pressure" : "secure-access-documentation",
  });
  const energyCost = Math.max(0, getSecureAccessCheckEnergyCost() + (skillCheck.successful ? 0 : 1) - (skillCheck.tier === "clean" ? 1 : 0));
  changeEnergy(-energyCost);
  if (!skillCheck.successful) state.flags.secureAccessNotesStrained = true;
  addLog(`${check.label} checked: ${check.log}`);
  if (!skillCheck.successful) addLog(`Access skill check strained on ${check.label}; the note will be easier for management to downplay.`);
  render();
  const allChecked = state.secureAccessChecks.length === content.secureAccessDispatch.checks.length;
  showModal({
    kicker: "Access Note",
    title: check.label,
    body: `
      <p>${check.detail}</p>
      ${getSkillCheckMarkup(skillCheck)}
      ${allChecked ? `<p class="muted">You have enough facts to explain why the quick rack update is no longer quick.</p>` : ""}
    `,
    actions: [{ label: allChecked ? "Review Access Delay" : "Keep Sorting Access", onClick: allChecked ? showSecureAccessChoice : render }],
  });
}

function showSecureAccessChoice() {
  showModal({
    kicker: "Access Decision",
    title: "The Delay Is Real, The Schedule Is Fiction",
    body: `
      <p>Security, the building number, and the escort policy all disagree with the dispatch estimate. The rack update itself is small; getting permission to reach it is the job.</p>
      <p>Management wants the ticket kept clean. The client would prefer an honest ETA over another vague "tech onsite" update.</p>
      ${getDocumentationSupportReduction() ? `<p class="muted">Your documentation habits make the access-delay note faster to write.</p>` : ""}
      ${getOpenCallbackPenalty() ? `<p class="muted">The open callback still on the ledger made today's access shuffle feel heavier.</p>` : ""}
      ${getChoicePressureMarkup([
        {
          label: "Document the delay",
          detail: "Costs energy to protect the ETA trail. Likely helps clients and coworkers, with management friction possible.",
        },
        ...(canUsePressureChoice() ? [{
          label: "Push dispatch",
          detail: "Stronger accountability if you can carry the conversation. Best process pressure, but management may not enjoy owning it.",
        }] : []),
        {
          label: "Eat the delay",
          detail: "Clean-ticket path. Saves the schedule story now, but hides the access problem and adds personal strain.",
        },
      ])}
    `,
    actions: [
      { label: `Document access delay and update ETA (-${getSecureAccessReportEnergyCost(4)} energy)`, onClick: () => finishSecureAccess("document") },
      ...(canUsePressureChoice() ? [{
        label: `Push dispatch to own the access miss (-${getSecureAccessReportEnergyCost(3)} energy)`,
        className: "secondary-button",
        onClick: () => finishSecureAccess("pushback"),
      }] : []),
      { label: "Eat the delay and mark arrival on time", className: "secondary-button", onClick: () => finishSecureAccess("absorb") },
    ],
  });
}

function finishSecureAccess(approach) {
  const honest = approach !== "absorb";
  const strainedNotes = Boolean(state.flags.secureAccessNotesStrained) && approach === "document";
  const xp = (approach === "pushback" ? 60 : approach === "document" ? 55 : 35) - (strainedNotes ? 5 : 0);
  if (honest) changeEnergy(-getSecureAccessReportEnergyCost(approach === "pushback" ? 3 : 4));
  else state.burnout += 1;
  state.flags.secureAccessComplete = true;
  state.flags.secureAccessApproach = approach;
  state.flags.prototypeSummaryViewed = false;
  setClock(`${state.clock.slice(0, 3)} ${approach === "absorb" ? "6:02" : "6:18"} PM`);
  if (!state.flags.secureAccessPaid) {
    state.cash += honest ? 92 : 76;
    state.flags.secureAccessPaid = true;
  }
  if (!state.flags.secureAccessProgressAwarded) {
    awardCareerProgress({
      xp,
      reputation: honest
        ? { clients: strainedNotes ? 0 : 1, coworkers: 1, management: approach === "pushback" ? -2 : -1 }
        : { clients: 0, coworkers: 0, management: 1 },
      source: content.secureAccessDispatch.title,
    });
    state.flags.secureAccessProgressAwarded = true;
  }
  if (!state.flags.secureAccessStatsRecorded) {
    state.stats.secureAccessJobsCompleted += 1;
    if (honest) state.stats.accessDelaysDocumented += 1;
    else state.stats.unpaidDelaysAbsorbed += 1;
    state.flags.secureAccessStatsRecorded = true;
  }
  addLog(honest
    ? "Documented the Navy Yard access delay before the schedule could pretend it never happened."
    : "Absorbed the Navy Yard access delay and marked the arrival time clean.");
  render();
  showModal({
    kicker: "Secure Access Complete",
    title: approach === "pushback" ? "The Access Miss Has An Owner" : approach === "document" ? "The Delay Has A Paper Trail" : "The Schedule Looks Fine If Nobody Asks",
    body: `
      <div class="results-grid">
        <span>Access job wages</span><strong>+$${honest ? 92 : 76}</strong>
        <span>Cash balance</span><strong>${formatCash(state.cash)}</strong>
        <span>Experience</span><strong>+${xp} XP</strong>
        <span>Preparation</span><strong>${getSecureAccessPreparationLabel()}</strong>
        <span>Closeout</span><strong>${approach === "pushback" ? "Dispatch access miss escalated" : approach === "document" ? "Delay documented" : "Delay absorbed"}</strong>
        ${strainedNotes ? `<span>Skill consequence</span><strong>Thin access notes limited client trust</strong>` : ""}
      </div>
      ${honest
        ? `<blockquote>Management note: "Please avoid creating client-facing narratives around internal scheduling friction."</blockquote>`
        : `<blockquote>Management note: "Thanks for keeping the ticket clean. Please improve onsite arrival efficiency."</blockquote>`}
    `,
    actions: [{
      label: "Return To Radnor Rack & Wire",
      onClick: () => returnToShopAfterDispatch(content.secureAccessDispatch.title, "Returned to Radnor Rack & Wire after the Navy Yard access job."),
    }],
  });
}

function showCallbackCleanupDispatchPreview() {
  const returnTripSummary = getOpenReturnTripRiskSummary();
  showModal({
    kicker: "Dispatch Board",
    title: content.callbackCleanupDispatch.title,
    body: getDispatchBoardMarkup({
      type: "Return Trip",
      familyId: "service",
      setup: "A callback is still sitting in the career ledger, and dispatch wants it cleaned up before anyone says warranty hours out loud.",
      why: `Triggered by unresolved callback pressure. Current unresolved callbacks: ${getUnresolvedCallbackCount()}.${returnTripSummary ? ` ${returnTripSummary}` : ""}`,
      stakes: [
        "A real fix resolves ledger pressure and helps client trust.",
        "A quick bandage keeps warranty hours contained.",
        "Craftsmanship can turn the cleanup into a better handoff.",
      ],
      note: "The client says the room was marked complete, then immediately started acting like it read the closeout note.",
      managementNote: "Please determine whether this is truly a callback or simply extended closeout support.",
      taskCards: returnTripSummary ? [{
        title: "Open Return-Trip Risk",
        skill: "Troubleshooting 4",
        outcome: returnTripSummary,
      }] : [],
    }),
    actions: [
      { label: "Accept Warranty Return", onClick: promptCallbackCleanupTravel },
      { label: "Return to Shop", className: "secondary-button" },
    ],
  });
}

function promptCallbackCleanupTravel() {
  showModal({
    kicker: "Route Summary",
    title: "Wayne Area -> Callback Site",
    body: `
      <p><strong>Dispatch estimate:</strong> Confirm user concern, restore confidence, avoid assigning blame in writing.</p>
      <p class="muted">The previous closeout note is short enough to remember accidentally.</p>
      <div class="route-line"><span>WAYNE AREA</span><i></i><span>CALLBACK SITE</span></div>
    `,
    actions: [{
      label: "Drive To Warranty Return",
      onClick: () => {
        state.flags.callbackCleanupStarted = true;
        state.flags.prototypeSummaryViewed = false;
        consumePackedLunch("the warranty return");
        setClock(`${state.clock.slice(0, 3)} 9:34 AM`);
        addLog("Arrived for a warranty return created by the career ledger, not the marketing brochure.");
        enterScene("warrantyReturn");
      },
    }],
  });
}

function getCallbackCleanupCheckEnergyCost() {
  return getVerificationEnergyCost(3);
}

function getCallbackCleanupRepairEnergyCost(baseCost) {
  return Math.max(0, getVerificationEnergyCost(baseCost) - getCarefulTaskReduction());
}

function inspectCallbackCleanupCondition(checkId) {
  const check = content.callbackCleanupDispatch.checks.find((item) => item.id === checkId);
  if (!check || state.callbackCleanupChecks.includes(checkId)) return notify(`${check?.label || "That callback note"} is already checked.`);
  state.callbackCleanupChecks.push(checkId);
  const skillCheck = resolveSkillCheck(`callback-${checkId}`, {
    skillId: checkId === "actual-fault" ? "troubleshooting" : "documentation",
    difficulty: checkId === "actual-fault" ? 4 : 3,
    contextId: checkId === "actual-fault" ? "callback-troubleshooting" : "callback-documentation",
  });
  const energyCost = Math.max(0, getCallbackCleanupCheckEnergyCost() + (skillCheck.successful ? 0 : 1) - (skillCheck.tier === "clean" ? 1 : 0));
  changeEnergy(-energyCost);
  if (!skillCheck.successful) state.flags.callbackTroubleshootingStrained = true;
  addLog(`${check.label} checked: ${check.log}`);
  if (!skillCheck.successful) addLog(`Callback skill check strained on ${check.label}; the fix will take more discipline to close cleanly.`);
  render();
  const allChecked = state.callbackCleanupChecks.length === content.callbackCleanupDispatch.checks.length;
  showModal({
    kicker: "Callback Note",
    title: check.label,
    body: `
      <p>${check.detail}</p>
      ${getSkillCheckMarkup(skillCheck)}
      ${allChecked ? `<p class="muted">You found enough to decide whether this becomes a real fix or another quiet bandage.</p>` : ""}
    `,
    actions: [{ label: allChecked ? "Review Warranty Fix" : "Keep Troubleshooting", onClick: allChecked ? showCallbackCleanupChoice : render }],
  });
}

function showCallbackCleanupChoice() {
  showModal({
    kicker: "Warranty Decision",
    title: "The Callback Has A Cause",
    body: `
      <p>The issue came back because the previous closeout skipped the boring verification. The room can be fixed, documented, and removed from the callback ledger, or it can be made quiet enough for the ticket to close again.</p>
      ${getCarefulTaskReduction() ? `<p class="muted">Your careful-work habits reduce the proper fix cost by 1 energy.</p>` : ""}
      ${getChoicePressureMarkup([
        {
          label: "Fix the root cause",
          detail: "Costs energy and exposes the weak closeout; likely protects the client and reduces return-trip pressure.",
        },
        ...(getCraftsmanship() >= 3 ? [{
          label: "Clean repair",
          detail: "Higher-quality field work with stronger client handoff; management may question why the warranty visit took longer.",
        }] : []),
        {
          label: "Bandage it",
          detail: "Fastest ticket close. Management may like the clean-looking update, but the room can still punish someone later.",
        },
      ])}
    `,
    actions: [
      { label: `Fix root cause and update notes (-${getCallbackCleanupRepairEnergyCost(6)} energy)`, onClick: () => finishCallbackCleanup("root") },
      ...(getCraftsmanship() >= 3 ? [{
        label: `Clean repair and teach the client what changed (-${getCallbackCleanupRepairEnergyCost(5)} energy)`,
        className: "secondary-button",
        onClick: () => finishCallbackCleanup("craft"),
      }] : []),
      { label: "Bandage it and close the warranty ticket", className: "secondary-button", onClick: () => finishCallbackCleanup("bandage") },
    ],
  });
}

function finishCallbackCleanup(approach) {
  const resolved = approach !== "bandage";
  const strainedFix = Boolean(state.flags.callbackTroubleshootingStrained) && approach === "root";
  const xp = (approach === "craft" ? 65 : approach === "root" ? 55 : 35) - (strainedFix ? 5 : 0);
  if (resolved) changeEnergy(-(getCallbackCleanupRepairEnergyCost(approach === "craft" ? 5 : 6) + (strainedFix ? 2 : 0)));
  else state.burnout += 1;
  state.flags.callbackCleanupComplete = true;
  state.flags.callbackCleanupApproach = approach;
  state.flags.prototypeSummaryViewed = false;
  setClock(`${state.clock.slice(0, 3)} ${resolved ? "11:16" : "10:38"} AM`);
  if (!state.flags.callbackCleanupPaid) {
    state.cash += resolved ? 68 : 54;
    state.flags.callbackCleanupPaid = true;
  }
  if (!state.flags.callbackCleanupProgressAwarded) {
    awardCareerProgress({
      xp,
      reputation: resolved
        ? { clients: strainedFix ? 1 : 2, coworkers: approach === "craft" ? 2 : 1, management: -1 }
        : { clients: 0, coworkers: 0, management: 1 },
      source: content.callbackCleanupDispatch.title,
    });
    state.flags.callbackCleanupProgressAwarded = true;
  }
  if (!state.flags.callbackCleanupStatsRecorded) {
    state.stats.warrantyReturnsCompleted += 1;
    if (resolved) {
      state.stats.callbacksResolved += 1;
      state.stats.carefulFinishes += 1;
    } else {
      state.stats.warrantyBandagesApplied += 1;
    }
    state.flags.callbackCleanupStatsRecorded = true;
  }
  addLog(resolved
    ? "Resolved the warranty return and wrote notes the next tech can actually use."
    : "Closed the warranty ticket with a bandage. The callback ledger remains spiritually aware.");
  render();
  showModal({
    kicker: "Warranty Return Complete",
    title: approach === "craft" ? "The Room And The Client Are Both Calmer" : approach === "root" ? "The Callback Has Real Notes Now" : "The Ticket Is Quiet For Now",
    body: `
      <div class="results-grid">
        <span>Warranty wages</span><strong>+$${resolved ? 68 : 54}</strong>
        <span>Cash balance</span><strong>${formatCash(state.cash)}</strong>
        <span>Experience</span><strong>+${xp} XP</strong>
        <span>Callback ledger</span><strong>${resolved ? "Callback resolved" : "Callback debt remains"}</strong>
        <span>Unresolved callbacks</span><strong>${getUnresolvedCallbackCount()}</strong>
        ${strainedFix ? `<span>Skill consequence</span><strong>Root cause fixed, notes needed extra cleanup</strong>` : ""}
      </div>
      ${resolved
        ? `<blockquote>Management note: "Please avoid implying previous closeout was incomplete when documenting warranty support."</blockquote>`
        : `<blockquote>Management note: "Thanks for keeping warranty hours contained."</blockquote>`}
    `,
    actions: [{
      label: "Return To Radnor Rack & Wire",
      onClick: () => returnToShopAfterDispatch(content.callbackCleanupDispatch.title, "Returned to Radnor Rack & Wire after the warranty return."),
    }],
  });
}

function showHandoffDispatchPreview() {
  showModal({
    kicker: "Dispatch Board",
    title: content.handoffDispatch.title,
    body: getDispatchBoardMarkup({
      type: "Client Handoff",
      familyId: "handoff",
      setup: "The room works, but the client needs to run the same meeting without becoming an unpaid AV tech.",
      why: state.flags.callbackCleanupComplete
        ? "Unlocked after the warranty return. The room is quieter now; the client still needs the human version."
        : "Clean callback ledger skipped the warranty return, so dispatch moved you to a handoff.",
      stakes: [
        "Confidence can unlock a better cheat-sheet option.",
        "Documentation habit reduces handoff prep costs.",
        "A quick demo keeps management happy and leaves a training gap.",
      ],
      note: "Dispatch says this is just a quick demo. The client says the executive assistant has actual questions.",
      managementNote: "Please keep training concise. The system is designed to be intuitive.",
    }),
    actions: [
      { label: "Accept Handoff", onClick: promptHandoffTravel },
      { label: "Return to Shop", className: "secondary-button" },
    ],
  });
}

function promptHandoffTravel() {
  showModal({
    kicker: "Route Summary",
    title: "Wayne Area -> Executive Boardroom",
    body: `
      <p><strong>Dispatch estimate:</strong> Five-minute walkthrough. No technical work expected.</p>
      <p class="muted">No technical work expected is also what they said about the warranty return.</p>
      <div class="route-line"><span>WAYNE AREA</span><i></i><span>BOARDROOM</span></div>
    `,
    actions: [{
      label: "Drive To Handoff",
      onClick: () => {
        state.flags.handoffStarted = true;
        state.flags.prototypeSummaryViewed = false;
        consumePackedLunch("the executive handoff");
        setClock(`${state.clock.slice(0, 3)} 1:42 PM`);
        addLog("Arrived for a client handoff where the room works and the labels do not.");
        enterScene("executiveHandoff");
      },
    }],
  });
}

function getHandoffCheckEnergyCost() {
  return Math.max(0, 2 - getDocumentationSupportReduction());
}

function getHandoffEnergyCost(baseCost) {
  return Math.max(0, baseCost - getDocumentationSupportReduction());
}

function inspectHandoffCondition(checkId) {
  const check = content.handoffDispatch.checks.find((item) => item.id === checkId);
  if (!check || state.handoffChecks.includes(checkId)) return notify(`${check?.label || "That handoff note"} is already checked.`);
  state.handoffChecks.push(checkId);
  const skillCheck = resolveSkillCheck(`handoff-${checkId}`, {
    skillId: checkId === "client-need" ? "clientCommunication" : "documentation",
    difficulty: checkId === "client-need" ? 4 : 3,
    contextBonus: getDocumentationSupportReduction(),
    contextId: checkId === "client-need" ? "handoff-pressure" : "handoff-documentation",
  });
  const energyCost = Math.max(0, getHandoffCheckEnergyCost() + (skillCheck.successful ? 0 : 1) - (skillCheck.tier === "clean" ? 1 : 0));
  changeEnergy(-energyCost);
  if (!skillCheck.successful) state.flags.handoffPrepStrained = true;
  addLog(`${check.label} checked: ${check.log}`);
  if (!skillCheck.successful) addLog(`Handoff skill check strained on ${check.label}; the walkthrough risks sounding like button labels.`);
  render();
  const allChecked = state.handoffChecks.length === content.handoffDispatch.checks.length;
  showModal({
    kicker: "Handoff Note",
    title: check.label,
    body: `
      <p>${check.detail}</p>
      ${getSkillCheckMarkup(skillCheck)}
      ${allChecked ? `<p class="muted">You know enough to decide whether this is a real handoff or a fast button tour.</p>` : ""}
    `,
    actions: [{ label: allChecked ? "Review Handoff Plan" : "Keep Preparing Handoff", onClick: allChecked ? showHandoffChoice : render }],
  });
}

function showHandoffChoice() {
  showModal({
    kicker: "Client Handoff",
    title: "The Room Works If Someone Explains It",
    body: `
      <p>The client does not need every feature. They need the morning meeting to start without a group of executives silently watching a laptop search for audio.</p>
      ${getDocumentationSupportReduction() ? `<p class="muted">Your documentation habits make the walkthrough notes and cheat sheet faster to prepare.</p>` : ""}
      ${getChoicePressureMarkup([
        {
          label: "Patient walkthrough",
          detail: "Costs energy now; likely improves client confidence while management may see extra training time.",
        },
        ...(canUsePressureChoice() ? [{
          label: "Client-language cheat sheet",
          detail: "Turns technical labels into a usable daily path. Strong client upside, still slower than leaving.",
        }] : []),
        {
          label: "Quick demo",
          detail: "Fastest closeout. The room works, but usage questions may come back through someone else.",
        },
      ])}
    `,
    actions: [
      { label: `Patient walkthrough of the daily path (-${getHandoffEnergyCost(5)} energy)`, onClick: () => finishHandoff("patient") },
      ...(canUsePressureChoice() ? [{
        label: `Rewrite the cheat sheet in client language (-${getHandoffEnergyCost(4)} energy)`,
        className: "secondary-button",
        onClick: () => finishHandoff("cheat"),
      }] : []),
      { label: "Quick demo and leave before questions", className: "secondary-button", onClick: () => finishHandoff("quick") },
    ],
  });
}

function finishHandoff(approach) {
  const helpful = approach !== "quick";
  const strainedPrep = Boolean(state.flags.handoffPrepStrained) && approach === "patient";
  const xp = (approach === "cheat" ? 60 : approach === "patient" ? 50 : 30) - (strainedPrep ? 5 : 0);
  if (helpful) changeEnergy(-getHandoffEnergyCost(approach === "cheat" ? 4 : 5));
  state.flags.handoffComplete = true;
  state.flags.handoffApproach = approach;
  state.flags.prototypeSummaryViewed = false;
  setClock(`${state.clock.slice(0, 3)} ${helpful ? "2:28" : "2:03"} PM`);
  if (!state.flags.handoffPaid) {
    state.cash += helpful ? 64 : 48;
    state.flags.handoffPaid = true;
  }
  if (!state.flags.handoffProgressAwarded) {
    awardCareerProgress({
      xp,
      reputation: helpful
        ? { clients: approach === "cheat" ? 3 : strainedPrep ? 1 : 2, coworkers: 1, management: -1 }
        : { clients: 0, coworkers: 0, management: 1 },
      source: content.handoffDispatch.title,
    });
    state.flags.handoffProgressAwarded = true;
  }
  if (!state.flags.handoffStatsRecorded) {
    state.stats.clientHandoffsCompleted += 1;
    if (helpful) state.stats.carefulFinishes += 1;
    else state.stats.trainingGapsLeft += 1;
    state.flags.handoffStatsRecorded = true;
  }
  addLog(helpful
    ? "Completed the handoff in client language instead of button-label language."
    : "Completed a quick demo. The client now knows enough to ask better questions later.");
  render();
  showModal({
    kicker: "Handoff Complete",
    title: approach === "cheat" ? "The Cheat Sheet Makes Sense To Humans" : approach === "patient" ? "The Client Can Start The Meeting" : "The Demo Was Technically A Demo",
    body: `
      <div class="results-grid">
        <span>Handoff wages</span><strong>+$${helpful ? 64 : 48}</strong>
        <span>Cash balance</span><strong>${formatCash(state.cash)}</strong>
        <span>Experience</span><strong>+${xp} XP</strong>
        <span>Client outcome</span><strong>${approach === "cheat" ? "Cheat sheet rewritten" : approach === "patient" ? "Daily path practiced" : "Training gap left"}</strong>
      </div>
      ${helpful
        ? `<blockquote>Management note: "Please avoid expanding simple handoffs into undocumented training sessions."</blockquote>`
        : `<blockquote>Management note: "Thanks for keeping the handoff efficient."</blockquote>`}
    `,
    actions: [{
      label: "Return To Radnor Rack & Wire",
      onClick: () => returnToShopAfterDispatch(content.handoffDispatch.title, "Returned to Radnor Rack & Wire after the executive handoff."),
    }],
  });
}

function showSystemsDispatchPreview() {
  showModal({
    kicker: "Dispatch Board",
    title: content.systemsDispatch.title,
    body: getDispatchBoardMarkup({
      type: "Systems Service",
      familyId: "service",
      setup: "A King of Prussia conference room is reporting offline. Dispatch says the client already rebooted once, so maybe reboot it professionally.",
      why: "Unlocked after the executive handoff. The prototype is testing whether advanced systems skills can matter in one readable service job.",
      stakes: [
        "Networking and Control Systems can change how cleanly you identify the fault.",
        "Documentation can turn a weird room note into future-proof closeout.",
        "A quick reboot keeps management happy and may leave return-trip risk.",
      ],
      note: "This is still a field-tech service call, not a subnet worksheet.",
      managementNote: "Please avoid turning a simple offline room into a network investigation.",
      prep: state.flags.systemsPreparation ? `Preparation selected: ${getSystemsPreparationLabel()}` : "",
      taskCards: content.systemsDispatch.taskCards,
    }),
    actions: [
      { label: "Accept Systems Service", onClick: () => state.flags.systemsPreparation ? promptSystemsTravel() : showSystemsPreparation() },
      { label: "Return to Shop", className: "secondary-button" },
    ],
  });
}

function getSystemsPreparationLabel() {
  return {
    review: "Reviewed room/network notes",
    josh: "Asked Josh what changed",
    leave: "Left with dispatch notes as written",
  }[state.flags.systemsPreparation] || "None";
}

function showSystemsPreparation() {
  showModal({
    kicker: "Systems Prep",
    title: "Before The Reboot Request",
    body: `
      <p>Dispatch wants this treated like a quick room reboot. The ticket also says "network maybe?" which is not a diagnosis so much as a shrug with punctuation.</p>
      ${getChoicePressureMarkup([
        { label: "Review notes", detail: "Costs a little time now, but improves network and documentation checks." },
        { label: "Ask Josh", detail: "Improves the control-room read and keeps the joke aimed at bad process." },
        { label: "Leave now", detail: "Protects management optics, but the ticket stays vague." },
      ])}
    `,
    actions: [
      { label: "Review room and network notes", onClick: () => chooseSystemsPreparation("review") },
      { label: "Ask Josh what changed", className: "secondary-button", onClick: () => chooseSystemsPreparation("josh") },
      { label: "Leave with the dispatch notes", className: "secondary-button", onClick: () => chooseSystemsPreparation("leave") },
    ],
  });
}

function chooseSystemsPreparation(preparation) {
  state.flags.systemsPreparation = preparation;
  if (preparation === "review") {
    changeEnergy(-2);
    state.stats.workOrdersReviewed += 1;
    addLog("Reviewed the room and network notes before leaving. The old VLAN note immediately looked suspicious.");
  } else if (preparation === "josh") {
    state.flags.metJosh = true;
    addLog("Asked Josh about the offline room. Management asked why he was explaining work during work hours.");
  } else {
    state.reputation.management += 1;
    addLog("Left with the dispatch notes as written. Management appreciated the velocity of not knowing more yet.");
  }
  render();
  promptSystemsTravel();
}

function promptSystemsTravel() {
  showModal({
    kicker: "Route Summary",
    title: "Wayne Area -> King of Prussia",
    body: `
      <p><strong>Dispatch estimate:</strong> Quick reboot, confirm room online, close ticket.</p>
      <p class="muted">The client says the room has been rebooted twice. The room, bravely, remains offline.</p>
      <div class="route-line"><span>WAYNE AREA</span><i></i><span>KING OF PRUSSIA</span></div>
    `,
    actions: [{
      label: "Drive To Systems Service",
      onClick: () => {
        state.flags.systemsStarted = true;
        state.flags.prototypeSummaryViewed = false;
        consumePackedLunch("the King of Prussia systems service");
        setClock(`${state.clock.slice(0, 3)} 3:18 PM`);
        addLog("Arrived for a room-offline service call where the reboot has already enjoyed several chances.");
        enterScene("systemsService");
      },
    }],
  });
}

function getSystemsCheckContextBonus(checkId) {
  if (state.flags.systemsPreparation === "review" && ["network-path", "rack-note"].includes(checkId)) return 1;
  if (state.flags.systemsPreparation === "josh" && checkId === "panel-status") return 1;
  return 0;
}

function getSystemsCheckEnergyCost(checkId) {
  const preparationHelps = (state.flags.systemsPreparation === "review" && ["network-path", "rack-note"].includes(checkId))
    || (state.flags.systemsPreparation === "josh" && checkId === "panel-status");
  return Math.max(0, 3 - (preparationHelps ? 1 : 0));
}

function inspectSystemsCondition(checkId) {
  const check = content.systemsDispatch.checks.find((item) => item.id === checkId);
  if (!check || state.systemsChecks.includes(checkId)) return notify(`${check?.label || "That systems note"} is already checked.`);
  state.systemsChecks.push(checkId);
  const skillId = checkId === "panel-status" ? "controlSystems" : checkId === "network-path" ? "networking" : "documentation";
  const contextId = checkId === "panel-status" ? "systems-control" : checkId === "network-path" ? "systems-networking" : "systems-documentation";
  const skillCheck = resolveSkillCheck(`systems-${checkId}`, {
    skillId,
    difficulty: 3,
    contextBonus: getSystemsCheckContextBonus(checkId),
    contextId,
  });
  const energyCost = Math.max(0, getSystemsCheckEnergyCost(checkId) + (skillCheck.successful ? 0 : 1) - (skillCheck.tier === "clean" ? 1 : 0));
  changeEnergy(-energyCost);
  if (!skillCheck.successful) state.flags.systemsChecksStrained = true;
  addLog(`${check.label} checked: ${check.log}`);
  if (!skillCheck.successful) addLog(`Systems check strained on ${check.label}; the room is still more confident than the ticket.`);
  render();
  const allChecked = state.systemsChecks.length === content.systemsDispatch.checks.length;
  showModal({
    kicker: "Systems Note",
    title: check.label,
    body: `
      <p>${check.detail}</p>
      ${getSkillCheckMarkup(skillCheck)}
      ${allChecked ? `<p class="muted">You know enough to choose between a useful closeout and a clean-looking ticket.</p>` : ""}
    `,
    actions: [{ label: allChecked ? "Review Systems Closeout" : "Keep Troubleshooting", onClick: allChecked ? showSystemsChoice : render }],
  });
}

function showSystemsChoice() {
  showModal({
    kicker: "Systems Closeout",
    title: "The Room Is Not Just Offline",
    body: `
      <p>The room can be rebooted into a temporarily less embarrassing state, but the real issue is the mismatch between the control path, network note, and what the ticket claims is true.</p>
      ${state.flags.systemsChecksStrained ? `<p class="muted">One of the systems checks was strained, so the careful closeout has less upside.</p>` : ""}
      ${getChoicePressureMarkup([
        { label: "Document mismatch", detail: "Costs energy and likely bothers management, but gives the next tech a usable trail and lowers return-trip risk." },
        { label: "Call out scope miss", detail: "Requires process confidence. Strong client/coworker upside, with sharper management friction possible." },
        { label: "Quick reboot", detail: "Fastest and management-friendly. The room may behave today, but the real mismatch stays loose." },
      ])}
    `,
    actions: [
      { label: "Document mismatch and reopen notes (-4 energy)", onClick: () => finishSystemsService("document") },
      ...(getSkillValue("commercialProcess") >= 3 || canUsePressureChoice() ? [{
        label: "Call out scope miss before closing (-3 energy)",
        className: "secondary-button",
        onClick: () => finishSystemsService("scope"),
      }] : []),
      { label: "Quick reboot and close ticket", className: "secondary-button", onClick: () => finishSystemsService("reboot") },
    ],
  });
}

function getSystemsReputationSummary(approach, strained = false) {
  if (approach === "reboot") return "Client trust drops; management likes the clean ticket";
  if (approach === "scope") return "Client and crew trust rise; management friction sharpens";
  if (strained) return "Client trust rises; the crew gets partial help; management grumbles";
  return "Client and crew trust rise; management grumbles about the paper trail";
}

function finishSystemsService(approach) {
  const documented = approach !== "reboot";
  const strained = Boolean(state.flags.systemsChecksStrained) && documented;
  const xp = (approach === "scope" ? 65 : approach === "document" ? 55 : 35) - (strained ? 5 : 0);
  if (documented) changeEnergy(-(approach === "scope" ? 3 : 4));
  state.flags.systemsComplete = true;
  state.flags.systemsApproach = approach;
  state.flags.prototypeSummaryViewed = false;
  setClock(`${state.clock.slice(0, 3)} ${documented ? "4:24" : "3:47"} PM`);
  if (!state.flags.systemsPaid) {
    state.cash += documented ? 68 : 52;
    state.flags.systemsPaid = true;
  }
  if (!state.flags.systemsProgressAwarded) {
    awardCareerProgress({
      xp,
      reputation: documented
        ? { clients: approach === "scope" ? 2 : 1, coworkers: strained ? 1 : 2, management: approach === "scope" ? -2 : -1 }
        : { clients: -1, coworkers: 0, management: 1 },
      source: content.systemsDispatch.title,
    });
    state.flags.systemsProgressAwarded = true;
  }
  if (!state.flags.systemsStatsRecorded) {
    state.stats.systemsJobsCompleted += 1;
    if (documented) {
      state.stats.systemMismatchesDocumented += 1;
      state.stats.documentedTaskRisks += 1;
    } else {
      state.stats.quickRebootsClosed += 1;
      state.stats.callbacks += 1;
    }
    state.flags.systemsStatsRecorded = true;
  }
  addLog(documented
    ? "Closed the systems service with a usable mismatch note instead of pretending the reboot explained itself."
    : "Closed the systems service with a reboot. The room came online, and the callback ledger quietly found a chair.");
  render();
  showModal({
    kicker: "Systems Service Complete",
    title: approach === "scope" ? "Scope Miss Written In Human" : approach === "document" ? "The Next Tech Gets A Map" : "The Room Rebooted, Technically",
    body: `
      <div class="results-grid">
        <span>Systems wages</span><strong>+$${documented ? 68 : 52}</strong>
        <span>Cash balance</span><strong>${formatCash(state.cash)}</strong>
        <span>Experience</span><strong>+${xp} XP</strong>
        <span>Relationship result</span><strong>${getSystemsReputationSummary(approach, strained)}</strong>
        <span>Return-trip risk</span><strong>${documented ? "Lowered by documenting the mismatch" : "Increased by leaving the mismatch loose"}</strong>
        <span>Career record</span><strong>${documented ? "Systems mismatch documented" : "Quick reboot closed"}</strong>
      </div>
      ${documented
        ? `<blockquote>Management note: "Please keep technical closeout proportionate to the original ticket."</blockquote>`
        : `<blockquote>Management note: "Thanks for resolving this quickly."</blockquote>`}
    `,
    actions: [{
      label: "Return To Radnor Rack & Wire",
      onClick: () => returnToShopAfterDispatch(content.systemsDispatch.title, "Returned to Radnor Rack & Wire after the King of Prussia systems service."),
    }],
  });
}

function showTravelDispatchPreview() {
  showModal({
    kicker: "Dispatch Board",
    title: content.travelDispatch.title,
    body: getDispatchBoardMarkup({
      type: "Travel Cost",
      familyId: "logistics",
      setup: "Dispatch added a quick Cherry Hill return stop after the King of Prussia service call. The work is tiny. The bridge toll and paperwork are somehow yours.",
      why: "Unlocked after the systems service job. This tests whether travel friction can be a readable RPG choice without adding a route simulator.",
      stakes: [
        `The current DRPA passenger toll is $${content.travelDispatch.tollCost || CHERRY_HILL_TOLL_COST}.`,
        "Documenting the cost protects reimbursement and annoys management.",
        "Eating the toll keeps the ticket clean and quietly costs you cash.",
      ],
      note: "This is a single travel decision: no new map, no toll booth minigame, no heroic spreadsheet.",
      managementNote: "Please keep this return stop efficient. Travel expenses should be reasonable and pre-approved.",
      taskCards: content.travelDispatch.taskCards,
    }),
    actions: [
      { label: "Review Travel Choices", onClick: showTravelChoice },
      { label: "Return to Shop", className: "secondary-button" },
    ],
  });
}

function showTravelChoice() {
  const tollCost = content.travelDispatch.tollCost || CHERRY_HILL_TOLL_COST;
  showModal({
    kicker: "Cherry Hill Return",
    title: "The Toll Exists Both Ways",
    body: `
      <p>The return stop itself is small. The problem is that dispatch treated the bridge like a rumor and the van like it runs on optimism.</p>
      ${getChoicePressureMarkup([
        { label: "File receipt", detail: "Costs a little energy and protects your cash. Management may grumble about the paper trail." },
        { label: "Push dispatch", detail: "Best process outcome if you can handle the pressure, but it asks management to notice its own travel planning." },
        { label: "Eat the toll", detail: `Fastest option. You pay $${tollCost}, and the bad process stays invisible for now.` },
      ])}
    `,
    actions: [
      { label: `File toll receipt and ETA note (-2 energy, $${tollCost} reimbursed)`, onClick: () => finishTravelDispatch("receipt") },
      ...(getSkillValue("commercialProcess") >= 3 || canUsePressureChoice() ? [{
        label: "Push dispatch to own the return toll (-2 energy)",
        className: "secondary-button",
        onClick: () => finishTravelDispatch("pushback"),
      }] : []),
      { label: `Eat the toll and keep moving (-$${tollCost})`, className: "secondary-button", onClick: () => finishTravelDispatch("absorb") },
    ],
  });
}

function getTravelReputationSummary(approach) {
  if (approach === "absorb") return "Management likes the clean ticket";
  if (approach === "pushback") return "Crew trust rises; management friction sharpens";
  return "Crew trust rises; management grumbles about the receipt trail";
}

function finishTravelDispatch(approach) {
  const tollCost = content.travelDispatch.tollCost || CHERRY_HILL_TOLL_COST;
  const documented = approach !== "absorb";
  const xp = approach === "pushback" ? 45 : approach === "receipt" ? 35 : 25;
  const basePay = 42;
  const netPay = documented ? basePay : basePay - tollCost;
  if (documented) changeEnergy(-2);
  state.flags.travelComplete = true;
  state.flags.travelApproach = approach;
  state.flags.prototypeSummaryViewed = false;
  setClock(`${state.clock.slice(0, 3)} ${documented ? "5:18" : "4:58"} PM`);
  if (!state.flags.travelPaid) {
    state.cash += netPay;
    state.flags.travelPaid = true;
  }
  if (!state.flags.travelProgressAwarded) {
    awardCareerProgress({
      xp,
      reputation: documented
        ? { clients: 0, coworkers: 1, management: approach === "pushback" ? -2 : -1 }
        : { clients: 0, coworkers: 0, management: 1 },
      source: content.travelDispatch.title,
    });
    state.flags.travelProgressAwarded = true;
  }
  if (!state.flags.travelStatsRecorded) {
    if (documented) {
      state.stats.travelCostsDocumented += 1;
      state.stats.documentedTaskRisks += 1;
    } else {
      state.stats.unreimbursedTravelCosts += 1;
    }
    state.flags.travelStatsRecorded = true;
  }
  addLog(documented
    ? "Documented the Cherry Hill return toll instead of letting the van become a charity with ladder racks."
    : "Ate the Cherry Hill toll to keep the ticket moving. The receipt disappeared into the same place as accurate dispatch estimates.");
  render();
  showModal({
    kicker: "Travel Cost Complete",
    title: approach === "pushback" ? "Dispatch Owns The Bridge Now" : approach === "receipt" ? "Receipt Filed Before It Became Folklore" : "The Toll Came Out Of Your Pocket",
    body: `
      <div class="results-grid">
        <span>Base travel pay</span><strong>+$${basePay}</strong>
        <span>Bridge toll</span><strong>${documented ? `$${tollCost} reimbursed` : `-$${tollCost} absorbed`}</strong>
        <span>Net cash</span><strong>+${formatCash(netPay)}</strong>
        <span>Cash balance</span><strong>${formatCash(state.cash)}</strong>
        <span>Experience</span><strong>+${xp} XP</strong>
        <span>Relationship result</span><strong>${getTravelReputationSummary(approach)}</strong>
        <span>Career record</span><strong>${documented ? "Travel cost documented" : "Unreimbursed travel cost"}</strong>
      </div>
      ${documented
        ? `<blockquote>Management note: "Please avoid over-documenting routine travel expenses."</blockquote>`
        : `<blockquote>Management note: "Thanks for keeping the return stop simple."</blockquote>`}
    `,
    actions: [{
      label: "Return To Radnor Rack & Wire",
      onClick: () => returnToShopAfterDispatch(content.travelDispatch.title, "Returned to Radnor Rack & Wire after the Cherry Hill return stop."),
    }],
  });
}

function showCommissioningDispatchPreview() {
  showModal({
    kicker: "Dispatch Board",
    title: content.commissioningDispatch.title,
    body: getDispatchBoardMarkup({
      type: "Commissioning",
      familyId: "commissioning",
      setup: "Verify a small South Philadelphia training room before client handoff. The installation ticket is closed, but the client says one side of the room sounds quieter.",
      why: "Unlocked after the University City survey. This job tests whether incomplete-site troubleshooting can become a clean closeout.",
      stakes: [
        "Craftsmanship can unlock a cleaner punch-list option.",
        "Passing the room protects management's schedule.",
        "Documenting the fault improves client and coworker trust.",
      ],
      note: "The completion sheet has already been signed internally.",
      managementNote: "Room complete except final commissioning. Please avoid creating a punch list unless necessary.",
      taskCards: content.commissioningDispatch.taskCards,
    }),
    actions: [
      { label: "Accept Commissioning Visit", onClick: promptCommissioningTravel },
      { label: "Return to Shop", className: "secondary-button" },
    ],
  });
}

function promptCommissioningTravel() {
  showModal({
    kicker: "Route Summary",
    title: "Wayne Area -> South Philadelphia",
    body: `
      <p><strong>Dispatch estimate:</strong> Confirm room operation and collect client signoff.</p>
      <p class="muted">The completion sheet has already been signed internally.</p>
      <div class="route-line"><span>WAYNE AREA</span><i></i><span>SOUTH PHILADELPHIA</span></div>
    `,
    actions: [{
      label: "Drive To Training Room",
      onClick: () => {
        state.flags.commissioningStarted = true;
        consumePackedLunch("the South Philadelphia commissioning visit");
        setClock(`${state.clock.slice(0, 3)} 3:04 PM`);
        addLog("Arrived in South Philadelphia to commission a room already marked complete.");
        enterScene("southPhillyCommissioning");
      },
    }],
  });
}

function getCommissioningCheckEnergyCost() {
  return getVerificationEnergyCost(3);
}

function getCommissioningRepairEnergyCost(baseCost) {
  return Math.max(0, getVerificationEnergyCost(baseCost) - getCarefulTaskReduction());
}

function getCommissioningTerminationTaskEnergyCost(action) {
  const baseCosts = { quick: 2, clean: 5, label: 4, document: 3 };
  const carefulDiscount = action === "quick" ? 0 : getCarefulTaskReduction();
  return Math.max(0, getVerificationEnergyCost(baseCosts[action] || 3) - carefulDiscount);
}

function getCommissioningCloseoutEnergyCost(approach) {
  if (approach === "pass") return 0;
  const hasTaskAction = Boolean(state.flags.commissioningTerminationAction);
  const baseCost = hasTaskAction ? (approach === "craft" ? 4 : 3) : (approach === "craft" ? 5 : 6);
  const riskPenalty = state.flags.commissioningTerminationCallbackRisk && approach === "repair" ? 1 : 0;
  return getCommissioningRepairEnergyCost(baseCost) + riskPenalty;
}

function getCommissioningTerminationTaskLabel(action = state.flags.commissioningTerminationAction) {
  const labels = {
    quick: "Re-landed fast",
    clean: "Re-terminated cleanly",
    label: "Traced and labeled",
    document: "Documented before touching",
  };
  return labels[action] || "No termination task selected";
}

function getCommissioningTerminationQualityLabel(quality = state.flags.commissioningTerminationQuality) {
  const labels = {
    temporary: "Works now, weak strain relief",
    functional: "Functional termination",
    clean: "Clean termination",
    strained: "Functional under strain",
    documented: "Readable path documented",
    "documented-clean": "Labeled cleanly",
    "thin-notes": "Notes are thin",
    "reopen-documented": "Mismatch documented",
    "reopen-thin": "Mismatch noted thinly",
  };
  return labels[quality] || "No task outcome yet";
}

function isCommissioningTerminationClean() {
  return ["clean", "documented-clean"].includes(state.flags.commissioningTerminationQuality);
}

function isCommissioningTerminationStable() {
  return ["functional", "clean", "documented", "documented-clean", "reopen-documented"].includes(state.flags.commissioningTerminationQuality);
}

function isCommissioningRiskDocumented(approach) {
  return approach === "craft" || ["label", "document"].includes(state.flags.commissioningTerminationAction);
}

function shouldAddCommissioningCallback(approach) {
  if (approach === "pass") return !isCommissioningTerminationStable();
  if (approach === "craft") return false;
  if (state.flags.commissioningTerminationCallbackRisk) return true;
  return Boolean(state.flags.terminationSkillStrained) && !state.flags.commissioningTerminationAction;
}

function getCommissioningCallbackDetail(approach) {
  if (approach === "pass") return "Silent speaker was passed as complete.";
  if (state.flags.commissioningTerminationAction === "quick") return "Loose speaker line was re-landed quickly without enough strain relief.";
  if (state.flags.commissioningTerminationCallbackRisk) return `Termination task outcome: ${getCommissioningTerminationQualityLabel()}.`;
  return "Commissioning closeout left a known speaker-path risk.";
}

function getCommissioningTerminationTaskSummaryMarkup() {
  if (!state.flags.commissioningTerminationAction) return "";
  return `
    <div class="results-grid">
      <span>Termination task</span><strong>${getCommissioningTerminationTaskLabel()}</strong>
      <span>Task outcome</span><strong>${getCommissioningTerminationQualityLabel()}</strong>
      <span>Return-trip risk</span><strong>${state.flags.commissioningTerminationCallbackRisk ? "Possible unless documented cleanly" : "Controlled"}</strong>
    </div>
  `;
}

function getCommissioningTerminationSkillCheck(action) {
  if (action === "quick") return null;
  if (action === "clean") {
    return resolveSkillCheck("commissioning-termination-action-clean", {
      skillId: "install",
      difficulty: state.flags.terminationSkillStrained ? 5 : 4,
      contextBonus: getCarefulWorkReduction(),
      contextId: "commissioning-termination",
    });
  }
  if (action === "label") {
    return resolveSkillCheck("commissioning-termination-action-label", {
      skillId: "documentation",
      difficulty: 4,
      contextBonus: ownsTool("labeler") ? 2 : 0,
      contextId: "commissioning-documentation",
    });
  }
  return resolveSkillCheck("commissioning-termination-action-document", {
    skillId: "clientCommunication",
    difficulty: 3,
    contextBonus: getDocumentationSupportReduction(),
    contextId: "commissioning-pressure",
  });
}

function resolveCommissioningTerminationTask(action) {
  if (state.flags.commissioningTerminationAction) return notify("The termination task is already in your closeout notes.");
  const energyCost = getCommissioningTerminationTaskEnergyCost(action);
  const skillCheck = getCommissioningTerminationSkillCheck(action);
  let quality = "temporary";
  let callbackRisk = false;
  let outcome = "The speaker plays again, but the path still deserves a better closeout.";

  changeEnergy(-energyCost);
  if (action === "quick") {
    quality = "temporary";
    callbackRisk = true;
    outcome = "The test tone comes back immediately. The cable has not become more trustworthy.";
  } else if (action === "clean") {
    quality = skillCheck.successful ? (skillCheck.tier === "clean" ? "clean" : "functional") : "strained";
    callbackRisk = !skillCheck.successful;
    outcome = skillCheck.successful
      ? "The conductor is landed cleanly enough that the room can be trusted."
      : "The speaker works, but the termination fought you and deserves an honest closeout.";
  } else if (action === "label") {
    quality = skillCheck.successful ? (skillCheck.tier === "clean" ? "documented-clean" : "documented") : "thin-notes";
    callbackRisk = !skillCheck.successful && Boolean(state.flags.terminationSkillStrained);
    outcome = skillCheck.successful
      ? "The signal path is readable now. The next tech will not have to rediscover the room."
      : "The path is less mysterious, but the notes are not strong enough to protect a sloppy closeout.";
  } else {
    quality = skillCheck.successful ? "reopen-documented" : "reopen-thin";
    callbackRisk = false;
    outcome = skillCheck.successful
      ? "The mismatch is documented before the room gets another confident status update."
      : "The concern is on paper, but the explanation is thin enough for management to argue with.";
  }

  state.flags.commissioningTerminationAction = action;
  state.flags.commissioningTerminationQuality = quality;
  state.flags.commissioningTerminationCallbackRisk = callbackRisk;
  state.flags.commissioningTerminationTaskOutcome = outcome;
  state.stats.fieldTaskChoicesMade += 1;
  addLog(`${getCommissioningTerminationTaskLabel(action)}: ${outcome}`);
  render();
  showModal({
    kicker: "Field Task Result",
    title: getCommissioningTerminationTaskLabel(action),
    body: `
      <p>${outcome}</p>
      ${skillCheck ? getSkillCheckMarkup(skillCheck) : `<p class="muted">Skill check: none. Fast work creates a return-trip risk instead.</p>`}
      <div class="results-grid">
        <span>Energy spent</span><strong>${energyCost}</strong>
        <span>Task outcome</span><strong>${getCommissioningTerminationQualityLabel(quality)}</strong>
        <span>Return-trip risk</span><strong>${callbackRisk ? "Possible" : "Controlled"}</strong>
      </div>
    `,
    actions: [{ label: "Return To Commissioning", onClick: render }],
  });
}

function showCommissioningTerminationChoice() {
  showModal({
    kicker: "Field Task",
    title: "The Loose Speaker Line Needs A Choice",
    body: `
      <p>The third speaker line is loose at the output block. This is the moment where skill matters: a fast re-land can make the room quiet enough to pass, but the next person may inherit the same fault.</p>
      <ul class="modal-list">
        <li><strong>Install ${getSkillValue("install")}</strong><span>Clean re-termination tests your physical install skill.</span></li>
        <li><strong>Documentation ${getSkillValue("documentation")}</strong><span>Readable labels and notes protect the next tech from the mirrored drawing.</span></li>
        <li><strong>Client Communication ${getSkillValue("clientCommunication")}</strong><span>Explaining the mismatch can protect trust while hurting schedule optics.</span></li>
      </ul>
      ${ownsTool("labeler") ? `<p class="muted">Josh's rebuilt labeler unlocks a stronger trace-and-label path.</p>` : `<p class="muted">A labeler would make the documentation path stronger here.</p>`}
      ${getChoicePressureMarkup([
        {
          label: "Re-land fast",
          detail: "Lowest-effort technical answer. It may get audio back, but the underlying workmanship risk is less controlled.",
        },
        {
          label: "Re-terminate cleanly",
          detail: "Costs more energy and tests install skill. Stronger chance the room stays fixed after you leave.",
        },
        ...(ownsTool("labeler") ? [{
          label: "Trace and label",
          detail: "Uses Josh's labeler to protect the next tech and make the weird path readable.",
        }] : []),
        {
          label: "Document first",
          detail: "Slower process choice. Helps explain the mismatch before touching something the paperwork says is already fine.",
        },
      ])}
    `,
    actions: [
      { label: `Re-land it fast (-${getCommissioningTerminationTaskEnergyCost("quick")} energy)`, onClick: () => resolveCommissioningTerminationTask("quick") },
      { label: `Re-terminate it cleanly (-${getCommissioningTerminationTaskEnergyCost("clean")} energy)`, onClick: () => resolveCommissioningTerminationTask("clean") },
      ...(ownsTool("labeler") ? [{
        label: `Trace and label both ends (-${getCommissioningTerminationTaskEnergyCost("label")} energy)`,
        className: "secondary-button",
        onClick: () => resolveCommissioningTerminationTask("label"),
      }] : []),
      { label: `Document mismatch before touching it (-${getCommissioningTerminationTaskEnergyCost("document")} energy)`, className: "secondary-button", onClick: () => resolveCommissioningTerminationTask("document") },
    ],
  });
}

function inspectCommissioningCondition(checkId) {
  const check = content.commissioningDispatch.checks.find((item) => item.id === checkId);
  if (!check || state.commissioningChecks.includes(checkId)) return notify(`${check?.label || "That condition"} is already in your notes.`);
  state.commissioningChecks.push(checkId);
  const skillCheck = resolveSkillCheck(`commissioning-${checkId}`, {
    skillId: checkId === "termination" ? "install" : checkId === "drawing" ? "documentation" : "troubleshooting",
    difficulty: checkId === "termination" ? 4 : 3,
    contextBonus: checkId === "termination" && ownsTool("labeler") ? 1 : 0,
    contextId: checkId === "termination" ? "commissioning-termination" : checkId === "drawing" ? "commissioning-documentation" : "commissioning-troubleshooting",
  });
  const energyCost = Math.max(0, getCommissioningCheckEnergyCost() + (skillCheck.successful ? 0 : 1) - (skillCheck.tier === "clean" ? 1 : 0));
  changeEnergy(-energyCost);
  if (checkId === "termination" && !skillCheck.successful) state.flags.terminationSkillStrained = true;
  if (checkId === "drawing" && !skillCheck.successful) state.flags.commissioningNotesStrained = true;
  addLog(`${check.label} checked: ${check.log}`);
  if (!skillCheck.successful) addLog(`Commissioning skill check strained on ${check.label}; the closeout will need a stronger choice to stay clean.`);
  render();
  const allChecked = state.commissioningChecks.length === content.commissioningDispatch.checks.length;
  const needsTerminationTask = state.commissioningChecks.includes("termination") && !state.flags.commissioningTerminationAction;
  showModal({
    kicker: "Commissioning Note",
    title: check.label,
    body: `
      <p>${check.detail}</p>
      ${getSkillCheckMarkup(skillCheck)}
      ${ownsTool("labeler") ? `<p class="muted">Josh's rebuilt labeler makes it easier to leave the suspect path readable.</p>` : ""}
      ${checkId === "termination" ? `<p class="muted">The loose line now needs a field-task choice before the closeout can be trusted.</p>` : ""}
      ${allChecked ? `<p class="muted">You found the room issue. Return to the client contact and close out the visit.</p>` : ""}
    `,
    actions: [{
      label: needsTerminationTask ? "Choose Termination Task" : allChecked ? "Return To Client Contact" : "Keep Testing",
      onClick: needsTerminationTask ? showCommissioningTerminationChoice : allChecked ? showCommissioningChoice : render,
    }],
  });
}

function showCommissioningChoice() {
  if (!state.flags.commissioningTerminationAction && state.commissioningChecks.includes("termination")) return showCommissioningTerminationChoice();
  const canCleanTerminate = isCommissioningTerminationClean()
    || ["label", "document"].includes(state.flags.commissioningTerminationAction)
    || getSkillValue("install") >= 4
    || getCraftsmanship() >= 3;
  showModal({
    kicker: "Commissioning Decision",
    title: "The Room Is Complete On Paper",
    body: `
      <p>The third ceiling speaker is silent because its termination is loose. The drawing is for a mirrored room across the hall, which explains why the closed ticket was so confident.</p>
      <p>The client would like the room working. Project management would like the completion sheet to remain emotionally undisturbed.</p>
      ${getCommissioningTerminationTaskSummaryMarkup()}
      ${getCarefulTaskReduction() ? `<p class="muted">Your careful-work habits are paying off: repair and punch-list work costs 1 less energy.</p>` : ""}
      ${state.flags.commissioningTerminationCallbackRisk ? `<p class="muted">The field task left a return-trip risk. A clean punch-list closeout can expose it before it becomes a surprise callback.</p>` : ""}
      ${getChoicePressureMarkup([
        {
          label: "Repair and document",
          detail: "Costs energy and protects the client with a usable discrepancy note. Management may dislike the extra paper trail.",
        },
        ...(canCleanTerminate ? [{
          label: "Clean punch list",
          detail: "Strongest field-quality stance. It owns the mismatch now, with possible schedule pressure later.",
        }] : []),
        {
          label: "Pass the room",
          detail: "Fastest closeout. The current notes may be enough, or they may hand the next problem to someone else.",
        },
      ])}
    `,
    actions: [
      { label: `Tell client it is repaired and document discrepancy (-${getCommissioningCloseoutEnergyCost("repair")} energy)`, onClick: () => finishCommissioning("repair") },
      ...(canCleanTerminate ? [{
        label: `Issue clean punch list and own the mismatch (-${getCommissioningCloseoutEnergyCost("craft")} energy)`,
        className: "secondary-button",
        onClick: () => finishCommissioning("craft"),
      }] : []),
      { label: "Mark room passed with current task notes", className: "secondary-button", onClick: () => finishCommissioning("pass") },
    ],
  });
}

function finishCommissioning(approach) {
  if (!state.flags.commissioningTerminationAction && state.commissioningChecks.includes("termination")) return showCommissioningTerminationChoice();
  const careful = approach !== "pass";
  const cleanTask = isCommissioningTerminationClean();
  const stableTask = isCommissioningTerminationStable();
  const callbackRiskAdded = shouldAddCommissioningCallback(approach);
  const documentedRisk = isCommissioningRiskDocumented(approach);
  const strainedRepair = Boolean(state.flags.terminationSkillStrained) && approach === "repair" && !state.flags.commissioningTerminationAction;
  const taskBonus = cleanTask && careful ? 5 : approach === "pass" && cleanTask ? 3 : 0;
  const taskPenalty = callbackRiskAdded && careful ? 5 : 0;
  const xp = Math.max(25, (approach === "craft" ? 65 : approach === "repair" ? 58 : 40) + taskBonus - taskPenalty - (strainedRepair ? 5 : 0));
  const reputation = careful
    ? {
      clients: Math.max(0, (approach === "craft" ? 2 : 1) + (cleanTask && !callbackRiskAdded ? 1 : 0) - (callbackRiskAdded ? 1 : 0)),
      coworkers: approach === "craft" || documentedRisk ? 2 : 1,
      management: approach === "craft" ? -2 : -1,
    }
    : {
      clients: stableTask ? 1 : 0,
      coworkers: stableTask ? 0 : -1,
      management: 1,
    };
  const callbackDetail = callbackRiskAdded ? getCommissioningCallbackDetail(approach) : "";

  if (careful) changeEnergy(-getCommissioningCloseoutEnergyCost(approach));
  state.flags.commissioningComplete = true;
  state.flags.commissioningApproach = approach;
  state.flags.commissioningCallbackRiskAdded = callbackRiskAdded;
  state.flags.commissioningRiskDocumented = documentedRisk;
  state.flags.prototypeSummaryViewed = false;
  setClock(`${state.clock.slice(0, 3)} ${approach === "pass" ? (cleanTask ? "3:47" : "3:39") : approach === "craft" ? "4:12" : "4:03"} PM`);
  if (!state.flags.commissioningPaid) {
    state.cash += 84;
    state.flags.commissioningPaid = true;
  }
  if (!state.flags.commissioningProgressAwarded) {
    awardCareerProgress({
      xp,
      reputation,
      source: content.commissioningDispatch.title,
    });
    state.flags.commissioningProgressAwarded = true;
  }
  if (!state.flags.commissioningStatsRecorded) {
    state.stats.commissioningRoomsCompleted += 1;
    if (careful) {
      state.stats.incompleteRoomsDocumented += 1;
      state.stats.carefulFinishes += 1;
    } else {
      state.stats.roomsPassedAnyway += 1;
    }
    if (cleanTask) state.stats.cleanTerminations += 1;
    if (documentedRisk) state.stats.documentedTaskRisks += 1;
    if (callbackRiskAdded) {
      state.stats.callbacks += 1;
      recordReturnTripRisk("southPhillySpeakerTermination", {
        source: content.commissioningDispatch.title,
        detail: callbackDetail,
      });
    }
    state.flags.commissioningStatsRecorded = true;
  }
  addLog(careful
    ? `${getCommissioningTerminationTaskLabel()} and closed the South Philadelphia room with ${approach === "craft" ? "a clean punch list" : "a documented repair"}.`
    : `Marked the South Philadelphia room passed after: ${getCommissioningTerminationTaskLabel()}.`);
  if (callbackRiskAdded) addLog(`Return-trip risk recorded: ${callbackDetail}`);
  render();
  showModal({
    kicker: "Commissioning Visit Complete",
    title: approach === "craft" ? "The Room Works And The Notes Do Too" : approach === "repair" ? "The Room Works Despite The Ticket" : stableTask ? "The Room Passes Because The Work Actually Did" : "The Completion Sheet Remains Complete",
    body: `
      <div class="results-grid">
        <span>Commissioning wages</span><strong>+$84</strong>
        <span>Cash balance</span><strong>${formatCash(state.cash)}</strong>
        <span>Experience</span><strong>+${xp} XP</strong>
        <span>Closeout</span><strong>${approach === "craft" ? "Clean punch list issued" : approach === "repair" ? "Issue repaired and documented" : "Room marked passed"}</strong>
        <span>Technical task</span><strong>${getCommissioningTerminationTaskLabel()}</strong>
        <span>Task outcome</span><strong>${getCommissioningTerminationQualityLabel()}</strong>
        <span>Reputation</span><strong>${formatReputationDelta(reputation)}</strong>
        <span>Callback ledger</span><strong>${callbackRiskAdded ? callbackDetail : stableTask ? "No speaker callback created" : "Risk documented before callback"}</strong>
      </div>
      ${careful
        ? `<blockquote>Management note: "Please distinguish between commissioning and reopening completed installation work."</blockquote>`
        : callbackRiskAdded
          ? `<blockquote>Management note: "Thanks for keeping closeout moving. Service can address any user-reported concerns."</blockquote>`
          : `<blockquote>Management note: "Thanks for protecting the schedule. Please update drawings when time allows."</blockquote>`}
    `,
    actions: [{
      label: "Return To Radnor Rack & Wire",
      onClick: () => returnToShopAfterDispatch(content.commissioningDispatch.title, "Returned to Radnor Rack & Wire after the South Philadelphia commissioning visit."),
    }],
  });
}

function showSurveyDispatchPreview() {
  showModal({
    kicker: "Dispatch Board",
    title: content.surveyDispatch.title,
    body: getDispatchBoardMarkup({
      type: "Site Survey",
      familyId: "survey",
      setup: "Confirm access and mounting conditions for a University City classroom display. Sales already measured the wall.",
      why: "Unlocked after the service call and Josh debrief. The game is testing whether field judgment matters before install day.",
      stakes: [
        "Preparation lowers inspection or report costs.",
        "Confidence can unlock a direct sales pushback.",
        "Trusting the quote helps management and may create future pain.",
      ],
      note: "The facilities contact asked whether the quoted display will fit through the building.",
      managementNote: "Should be straightforward. Same basic idea as a display we installed somewhere else.",
      prep: state.flags.surveyPreparation ? `Preparation selected: ${getSurveyPreparationLabel()}` : "",
    }),
    actions: [
      { label: "Accept Site Survey", onClick: () => state.flags.surveyPreparation ? promptSurveyTravel() : showSurveyPreparation() },
      { label: "Return to Shop", className: "secondary-button" },
    ],
  });
}

function getSurveyPreparationLabel() {
  return {
    sketch: "Reviewed sales sketch",
    measure: "Found shop tape measure",
    none: "Left with the forwarded email",
  }[state.flags.surveyPreparation] || "None";
}

function showSurveyPreparation() {
  showModal({
    kicker: "Before You Leave",
    title: "Prepare For The Site Survey",
    body: `
      <p>The forwarded work order says to confirm the wall dimensions. Facilities also asked about the delivery path, which is not mentioned in the quote.</p>
      <p class="muted">Take one small preparation step before heading to University City.</p>
    `,
    actions: [
      { label: "Review the sales sketch", onClick: () => chooseSurveyPreparation("sketch") },
      { label: "Find the shop tape measure", className: "secondary-button", onClick: () => chooseSurveyPreparation("measure") },
      { label: "Leave with the forwarded email", className: "secondary-button", onClick: () => chooseSurveyPreparation("none") },
    ],
  });
}

function chooseSurveyPreparation(preparation) {
  state.flags.surveyPreparation = preparation;
  let title = "The Email Will Have To Do";
  let body = `<p>The forwarded email contains a room number and the phrase "standard display." Nobody defined standard.</p>`;
  if (preparation === "sketch") {
    title = "Sales Sketch Located";
    body = `
      <p>The sketch shows a 98-inch display on the classroom wall. The delivery path is represented by an arrow entering from the edge of the page.</p>
      <p class="muted">Filing a careful report will cost 1 less energy.</p>
    `;
    addLog("Reviewed the sales sketch. The proposed 98-inch display arrives by way of a confident arrow.");
  }
  if (preparation === "measure") {
    title = "Tape Measure Located";
    body = `
      <p>You find the shop tape measure in a box labeled AUDIO. Somebody scratched out another technician's initials and wrote COMPANY.</p>
      <p class="muted">Each survey inspection will cost 1 less energy.</p>
    `;
    addLog("Found the company tape measure in a box labeled AUDIO.");
  }
  if (preparation === "none") addLog("Left for University City with the forwarded sales email.");
  render();
  showModal({
    kicker: "Preparation Selected",
    title,
    body,
    actions: [{ label: "Head To University City", onClick: promptSurveyTravel }],
  });
}

function promptSurveyTravel() {
  showModal({
    kicker: "Route Summary",
    title: "Wayne Area -> University City",
    body: `
      <p><strong>Dispatch estimate:</strong> Measure one wall. Confirm install conditions. Do not overcomplicate the quote.</p>
      <div class="route-line"><span>WAYNE AREA</span><i></i><span>UNIVERSITY CITY</span></div>
    `,
    actions: [{
      label: "Drive To Campus",
      onClick: () => {
        state.flags.surveyStarted = true;
        consumePackedLunch("the University City site survey");
        setClock(`${state.clock.slice(0, 3)} 1:18 PM`);
        addLog("Arrived in University City for a classroom display site survey.");
        enterScene("universitySurvey");
      },
    }],
  });
}

function getSurveyInspectionEnergyCost() {
  return Math.max(0, 2 - (state.flags.surveyPreparation === "measure" ? 1 : 0));
}

function getSurveyReportEnergyCost(baseCost) {
  return Math.max(2, baseCost - (state.flags.surveyPreparation === "sketch" ? 1 : 0) - getDocumentationSupportReduction());
}

function inspectSurveyConstraint(inspectionId) {
  const inspection = content.surveyDispatch.inspections.find((item) => item.id === inspectionId);
  if (!inspection || state.surveyInspections.includes(inspectionId)) return notify(`${inspection?.label || "That condition"} is already in your notes.`);
  state.surveyInspections.push(inspectionId);
  const skillCheck = resolveSkillCheck(`survey-${inspectionId}`, {
    skillId: inspectionId === "wall" ? "install" : "documentation",
    difficulty: inspectionId === "wall" ? 3 : 4,
    contextBonus: state.flags.surveyPreparation === "measure" ? 1 : 0,
    contextId: inspectionId === "wall" ? "survey-wall" : "survey-documentation",
  });
  const energyCost = Math.max(0, getSurveyInspectionEnergyCost() + (skillCheck.successful ? 0 : 1) - (skillCheck.tier === "clean" ? 1 : 0));
  changeEnergy(-energyCost);
  if (!skillCheck.successful && inspectionId !== "wall") state.flags.surveyDocumentationStrained = true;
  addLog(`${inspection.label} checked: ${inspection.log}`);
  if (!skillCheck.successful) addLog(`Survey skill check strained on ${inspection.label}; the report will need a clearer closeout choice.`);
  render();
  const allChecked = state.surveyInspections.length === content.surveyDispatch.inspections.length;
  showModal({
    kicker: "Survey Note",
    title: inspection.label,
    body: `
      <p>${inspection.detail}</p>
      ${getSkillCheckMarkup(skillCheck)}
      ${inspection.id === "wall" && getCharacterLine("surveyWall") ? `<p class="muted">${getCharacterLine("surveyWall")}</p>` : ""}
      ${allChecked ? `<p class="muted">You have enough information. Return to the facilities contact and file the survey report.</p>` : ""}
    `,
    actions: [{ label: allChecked ? "Return To Facilities Contact" : "Keep Surveying", onClick: render }],
  });
}

function showSurveyReportChoice() {
  showModal({
    kicker: "Survey Report",
    title: "The Wall Is Not The Only Dimension",
    body: `
      <p>The 98-inch display fits on the classroom wall. It does not fit through the elevator opening, and the hallway turn offers no useful miracle.</p>
      <p>Sales wants the survey closed today because the quote is "basically approved."</p>
      ${getDocumentationSupportReduction() ? `<p class="muted">Your documentation habits make this report cost 1 less energy.</p>` : ""}
      ${state.flags.surveyDocumentationStrained ? `<p class="muted">Your access notes are thin. Documenting still helps, but calling sales directly prevents the weak notes from being buried.</p>` : ""}
      ${getChoicePressureMarkup([
        {
          label: "Document the constraint",
          detail: "Costs energy to make the access problem real on paper. Likely protects install day, but management may call it complexity.",
        },
        ...(canUsePressureChoice() ? [{
          label: "Call sales calmly",
          detail: "Uses pressure handling to challenge the quote before install day. Outcome depends on how well the conversation lands.",
        }] : []),
        {
          label: "Trust the quote",
          detail: "Fast management-friendly closeout. Keeps the schedule clean while leaving the access risk unresolved.",
        },
      ])}
    `,
    actions: [
      { label: `Document the access constraint (-${getSurveyReportEnergyCost(3)} energy)`, onClick: () => finishSurvey("document") },
      ...(canUsePressureChoice() ? [{
        label: `Call sales and push back calmly (-${getSurveyReportEnergyCost(2)} energy)`,
        className: "secondary-button",
        onClick: () => finishSurvey("pushback"),
      }] : []),
      { label: "Trust the quote and mark survey complete", className: "secondary-button", onClick: () => finishSurvey("trust") },
    ],
  });
}

function finishSurvey(approach) {
  const careful = approach !== "trust";
  const strainedDocument = Boolean(state.flags.surveyDocumentationStrained) && approach === "document";
  const xp = (approach === "pushback" ? 60 : approach === "document" ? 55 : 35) - (strainedDocument ? 5 : 0);
  if (careful) changeEnergy(-getSurveyReportEnergyCost(approach === "pushback" ? 2 : 3));
  state.flags.surveyComplete = true;
  state.flags.surveyApproach = approach;
  state.flags.prototypeSummaryViewed = false;
  setClock(`${state.clock.slice(0, 3)} ${approach === "trust" ? "2:06" : "2:21"} PM`);
  if (!state.flags.surveyPaid) {
    state.cash += 72;
    state.flags.surveyPaid = true;
  }
  if (!state.flags.surveyProgressAwarded) {
    awardCareerProgress({
      xp,
      reputation: careful
        ? { clients: strainedDocument ? 1 : 2, coworkers: strainedDocument ? 0 : 1, management: -1 }
        : { clients: 0, coworkers: 0, management: 1 },
      source: content.surveyDispatch.title,
    });
    state.flags.surveyProgressAwarded = true;
  }
  if (!state.flags.surveyStatsRecorded) {
    state.stats.surveysCompleted += 1;
    if (careful) state.stats.accessRisksDocumented += 1;
    else state.stats.quotesTrustedAnyway += 1;
    state.flags.surveyStatsRecorded = true;
  }
  addLog(careful
    ? "Documented the University City access problem before it became an install-day problem."
    : "Marked the University City survey complete without adding the access problem to the quote.");
  render();
  showModal({
    kicker: "Site Survey Complete",
    title: approach === "pushback" ? "The Quote Is Paused Before The Damage" : approach === "document" ? "The Constraint Is Now Somebody's Email" : "The Quote Remains Basically Approved",
    body: `
      <div class="results-grid">
        <span>Survey wages</span><strong>+$72</strong>
        <span>Cash balance</span><strong>${formatCash(state.cash)}</strong>
        <span>Experience</span><strong>+${xp} XP</strong>
        <span>Preparation</span><strong>${getSurveyPreparationLabel()}</strong>
        <span>Report</span><strong>${approach === "pushback" ? "Sales called directly" : approach === "document" ? "Access risk documented" : "Quoted plan accepted"}</strong>
        ${strainedDocument ? `<span>Skill consequence</span><strong>Thin notes softened the coworker/client gain</strong>` : ""}
      </div>
      ${approach === "trust"
        ? `<blockquote>Management note: "Thanks for keeping the survey efficient. Installation can confirm final access conditions onsite."</blockquote>`
        : `<blockquote>Management note: "Please avoid introducing unnecessary complexity after sales has aligned the client around a solution."</blockquote>`}
    `,
    actions: [{
      label: "Return To Radnor Rack & Wire",
      onClick: () => returnToShopAfterDispatch(content.surveyDispatch.title, "Returned to Radnor Rack & Wire after the University City survey."),
    }],
  });
}

function getServicePreparationLabel() {
  return {
    review: "Reviewed work order",
    lunch: "Packed lunch",
    coffee: "Shop coffee",
    josh: "Asked Josh for advice",
    contact: "Texted a site contact",
    none: "No extra preparation",
  }[state.flags.servicePreparation] || "None";
}

function showServicePreparation() {
  showModal({
    kicker: "Before You Leave",
    title: "Prepare For The Service Call",
    body: `
      <p>Dispatch called this a quick display issue. You have time for one small preparation step before taking Van #3 to Conshohocken.</p>
      <p class="muted">Cash available: ${formatCash(state.cash)}</p>
    `,
    actions: [
      { label: "Review the work order", onClick: () => chooseServicePreparation("review") },
      ...(hasCharacterTrait("knowsAGuy") ? [{
        label: "Text someone who has worked this site",
        className: "secondary-button",
        onClick: () => chooseServicePreparation("contact"),
      }] : []),
      ...(!state.flags.packedLunchReady ? [{ label: "Pack lunch from the break area", className: "secondary-button", onClick: () => chooseServicePreparation("lunch") }] : []),
      ...(state.cash >= 5 ? [{
        label: "Buy shop coffee - $5",
        className: "secondary-button",
        onClick: () => chooseServicePreparation("coffee"),
      }] : []),
      { label: "Ask Josh what to watch for", className: "secondary-button", onClick: () => chooseServicePreparation("josh") },
      { label: "Leave now without extra prep", className: "secondary-button", onClick: () => chooseServicePreparation("none") },
    ],
  });
}

function chooseServicePreparation(preparation) {
  state.flags.servicePreparation = preparation;
  let title = "Van #3 Is Ready";
  let body = "<p>You decide not to spend more time preparing. Dispatch already used the word quick twice.</p>";
  if (preparation === "review") {
    title = "Read The Small Print";
    body = `<p>The work order is mostly a forwarded email chain. One buried note mentions an inline coupler behind the credenza.</p>
      <p class="muted">Diagnosis will cost 1 less energy.</p>`;
    addLog("Reviewed the Conshohocken work order and found a buried note about an inline coupler.");
    state.stats.workOrdersReviewed += 1;
  }
  if (preparation === "lunch") {
    title = "Lunch Acquired";
    body = `<p>You pack something from the break area before anybody can schedule through lunch.</p>
      <p class="muted">Recover 8 energy when you arrive in Conshohocken.</p>`;
    state.flags.packedLunchReady = true;
    addLog("Packed lunch before leaving Radnor Rack & Wire.");
    state.stats.lunchesPacked += 1;
  }
  if (preparation === "coffee") {
    title = "Shop Coffee";
    body = `<p>The coffee is hot and technically belongs to the company. The five-dollar jar beside it suggests otherwise.</p>
      <p class="muted">Recover 12 energy now.</p>`;
    state.cash -= 5;
    changeEnergy(12);
    addLog("Bought shop coffee for $5. Energy improved.");
    state.stats.coffeesBought += 1;
  }
  if (preparation === "josh") {
    title = "Josh Has Seen This Movie Before";
    body = `<p>Josh pauses while sorting adapters into bins.</p>
      <p><strong>Josh:</strong> "If the display is flickering, verify the whole path before you swap anything. Half the mystery boxes in this shop are just couplers nobody documented."</p>
      <p><strong>Manager, from the sales office:</strong> "Josh, do you know why Van #2 has three remotes for displays we do not own?"</p>
      <p class="muted">Signal-path verification will cost 1 less energy.</p>`;
    if (!state.flags.metJosh) addLog("Asked Josh for advice while management investigated the Van #2 remote collection.");
    state.flags.metJosh = true;
  }
  if (preparation === "contact") {
    title = "Somebody Has Seen This Room";
    body = `<p>You text a former coworker who remembers this client. They reply with a blurry photo, a warning about the credenza, and the phrase "check the coupler before blaming the display."</p>
      <p class="muted">Diagnosis will cost 1 less energy. Management will never understand why this helped.</p>`;
    addLog("Texted someone who had worked the Conshohocken room before. The coupler warning was oddly specific.");
  }
  render();
  showModal({
    kicker: "Preparation Selected",
    title,
    body,
    actions: [{ label: "Head To Conshohocken", onClick: promptServiceTravel }],
  });
}

function promptServiceTravel() {
  const reviewedTicket = state.flags.servicePreparation === "review";
  showModal({
    kicker: "Route Summary",
    title: "Wayne Area -> Conshohocken",
    body: `
      <p><strong>Dispatch estimate:</strong> Diagnose the display issue and swap the screen if needed.</p>
      ${reviewedTicket ? `<p class="expense"><strong>Work-order note:</strong> Inline coupler reported behind the credenza.</p>` : ""}
      <div class="route-line"><span>WAYNE AREA</span><i></i><span>CONSHOHOCKEN</span></div>
    `,
    actions: [{
      label: "Drive to Client Office",
      onClick: () => {
        state.flags.serviceStarted = true;
        state.carry = [];
        const hadPackedLunch = state.flags.packedLunchReady;
        consumePackedLunch("the Conshohocken service call");
        if (state.flags.servicePreparation === "lunch" && !state.flags.serviceLunchUsed) {
          state.flags.serviceLunchUsed = true;
          if (!hadPackedLunch) {
            changeEnergy(8);
            addLog("Ate the packed lunch before heading inside. Energy improved.");
          }
        }
        setClock(`${state.clock.slice(0, 3)} 9:14 AM`);
        addLog("Arrived in Conshohocken for a display service call.");
        enterScene("serviceOffice");
      },
    }],
  });
}

function showServiceResults() {
  const verifiedSignalPath = state.flags.serviceApproach === "verify";
  const checkedSignalPath = verifiedSignalPath && !state.flags.serviceVerificationStrained;
  const strainedVerification = verifiedSignalPath && state.flags.serviceVerificationStrained;
  const xp = checkedSignalPath ? 50 : strainedVerification ? 45 : 40;
  const serviceReturnRisk = !checkedSignalPath;
  const diagnosisLabel = checkedSignalPath ? "Signal path verified" : strainedVerification ? "Verification strained" : "Rework required";
  const serviceRiskDetail = checkedSignalPath
    ? "Signal path notes are clean enough to protect the room."
    : strainedVerification
      ? "You chose the right process, but the notes stayed thin enough that a return trip can still happen."
      : "Skipping verification saved time, but the unlabeled path can still send someone back.";
  state.flags.serviceComplete = true;
  state.carry = [];
  setClock(`${state.clock.slice(0, 3)} ${checkedSignalPath ? "11:26" : "11:44"} AM`);
  if (!state.flags.servicePaid) {
    state.cash += 96;
    state.flags.servicePaid = true;
  }
  if (!state.flags.serviceProgressAwarded) {
    awardCareerProgress({
      xp,
      reputation: checkedSignalPath
        ? { clients: 2, coworkers: 1, management: 0 }
        : strainedVerification
        ? { clients: 1, coworkers: 0, management: 0 }
        : { clients: 0, coworkers: 0, management: 1 },
      source: "One Quick Display Swap",
    });
    state.flags.serviceProgressAwarded = true;
  }
  if (!state.flags.serviceStatsRecorded) {
    if (checkedSignalPath) state.stats.carefulFinishes += 1;
    else state.stats.callbacks += 1;
    state.flags.serviceStatsRecorded = true;
  }
  addLog("Replacement display installed. The quick service call is complete.");
  render();
  showModal({
    kicker: "Service Call Complete",
    title: "One Quick Display Swap: Complete",
    body: `
      <div class="results-grid">
        <span>Service wages</span><strong>+$96</strong>
        <span>Cash balance</span><strong>${formatCash(state.cash)}</strong>
        <span>Energy remaining</span><strong>${state.energy}/${getMaxEnergy()}</strong>
        <span>Burnout</span><strong>${state.burnout}</strong>
        <span>Experience</span><strong>+${xp} XP</strong>
        <span>Preparation</span><strong>${getServicePreparationLabel()}</strong>
        <span>Diagnosis</span><strong>${diagnosisLabel}</strong>
        <span>Return-trip risk</span><strong>${serviceReturnRisk ? "Possible" : "Controlled"}</strong>
      </div>
      <p class="muted">${serviceRiskDetail}</p>
      <blockquote>Client note: "Thank you for fixing the display before the afternoon meeting.${checkedSignalPath ? " The cable notes are helpful." : strainedVerification ? " The room is working, though the notes are light." : ""}"</blockquote>
    `,
    actions: [{
      label: "Return to Radnor Rack & Wire",
      onClick: () => {
        if (!checkedSignalPath) {
          state.flags.serviceCallbackPending = true;
          addLog("A Conshohocken callback note appeared before you made it back to Radnor Rack & Wire.");
        }
        returnToShopAfterDispatch(content.serviceDispatch.title, "Returned to Radnor Rack & Wire after the Conshohocken service call.");
      },
    }],
  });
}

function getInteractions() {
  if (state.sceneId === "shop") {
    const warehouseActive = state.flags.warehouseStarted && !state.flags.warehouseComplete;
    return [
      {
        x: 330, y: 330, label: "Talk to supervisor", npc: "SUP",
        action: () => {
          if (state.flags.endShiftPending) return showEndShiftModal();
          if (state.flags.serviceComplete && hasPendingTraining()) return notify('Supervisor: "You leveled up fast. Mark a training focus on the clipboard before dispatch adds anything else."');
          if (state.flags.finished) return notify('Supervisor: "Check the board when you are ready. It will still say quick, because dispatch never learns."');
          if (!state.flags.shopBrief) {
            state.flags.shopBrief = true;
            addLog("Supervisor asked you to load the staged cart boxes into Van #3.");
            showModal({
              kicker: "Supervisor",
              title: "We're Already Late",
              body: `<p>"You must be the new tech. Grab those cart boxes and load Van #3. We have a simple two-cart build downtown. I'll show you everything onsite."</p>`,
              actions: [{ label: "Start Loading", onClick: render }],
            });
          } else {
            notify('Supervisor: "Load the staged boxes into Van #3 and we can go."');
          }
        },
      },
      ...(state.flags.finished ? [{
        x: 690, y: 245, label: state.flags.serviceCallbackPending && !state.flags.serviceCallbackResolved
          ? "Talk to Josh about callback"
          : "Talk to Josh",
        npc: "JOSH",
        action: showJoshConversation,
      }] : []),
      {
        x: 150, y: 270, label: "Read dispatch board",
        action: () => state.flags.endShiftPending
          ? showEndShiftModal()
          : state.flags.finished
          ? showDispatchPreview()
          : notify("Dispatch board: TWO QUICK CARTS. Estimated labor: unclear."),
      },
      {
        x: 590, y: 180, label: warehouseActive ? "Search staging shelf" : "Pick up staged equipment",
        action: () => {
          if (warehouseActive) return inspectWarehouseLocation("staging");
          if (!state.flags.shopBrief) return notify("You should ask the supervisor what is happening.");
          if (hasCarriedItems()) return notify("Your hands are already full.");
          const next = getNextShopLoad();
          if (!next) return notify("The staged equipment is loaded.");
          state.carry = [next];
          changeEnergy(-getEquipmentEnergyCost(2));
          addLog(`Picked up ${next}.`);
          if (getCharacterLine("accessoryTote") && next === "Accessory tote" && !hasSeenCharacterLine("accessoryTote")) {
            markCharacterLineSeen("accessoryTote");
            addLog(getCharacterLine("accessoryTote"));
          }
          render();
        },
      },
      {
        x: 580, y: 400, label: warehouseActive ? "Search mystery-return pile" : "Inspect shop loaner drill",
        action: () => {
          if (warehouseActive) return inspectWarehouseLocation("returns");
          showModal({
            kicker: "Company Loaner",
            title: "Shop Loaner Drill",
            body: `<p><strong>Battery:</strong> 18%</p><p><strong>Charger:</strong> Reportedly in another van</p>`,
            actions: [{ label: "Leave It Here" }],
          });
        },
      },
      ...(state.flags.finished ? [{
        x: 355, y: 400, label: "Inspect personal kit",
        action: showPersonalKit,
      }, {
        x: 500, y: 270, label: hasPendingTraining() ? "Choose field-training focus" : "Review career clipboard",
        action: showCareerClipboard,
      }, {
        x: 145, y: 400, label: "Browse personal tools",
        action: showSupplyCounter,
      }, {
        x: 350, y: 185, label: state.flags.endShiftPending ? "Close out shift" : "Use break area",
        action: showBreakArea,
      }] : []),
      {
        x: 830, y: 380, label: warehouseActive ? "Search Van #3" : hasCarriedItems() ? "Load item into Van #3" : "Inspect Van #3",
        action: () => {
          if (warehouseActive) return inspectWarehouseLocation("van3");
          if (hasCarriedItems()) {
            state.loaded.push(...state.carry);
            addLog(`${getCarriedLabels().join(" and ")} loaded into Van #3.`);
            state.carry = [];
            if (state.loaded.length === content.tutorial.shopLoad.length) {
              addLog("Van loaded. Supervisor is ready to leave for Center City East.");
            }
            return render();
          }
          if (state.flags.finished) return notify(getCharacterLine("inspectVan", "Van #3 is parked. Future dispatches will start here."));
          if (state.loaded.length === content.tutorial.shopLoad.length && state.flags.shopBrief) return promptTravel();
          notify("Company Van #3: limited cargo, poor organization, questionable reliability.");
        },
      },
    ];
  }

  if (state.sceneId === "garage") {
    return [
      ...(!state.flags.garageBrief ? [{
        x: 665, y: 360, label: "Talk to supervisor", npc: "SUP",
        action: () => {
          state.flags.garageBrief = true;
          addLog("Supervisor confirmed the garage carry was not included in dispatch's estimate.");
          showModal({
            kicker: "Supervisor",
            title: "About the Loading Dock",
            body: `<p>"Nobody booked one. We'll carry the boxes from here. It's not that far."</p><p>It is farther than dispatch estimated.</p>`,
            actions: [{ label: "Start Unloading", onClick: render }],
          });
        },
      }] : []),
      {
        x: 800, y: 375, label: "Unload next box group",
        action: () => {
          if (!state.flags.garageBrief) return notify("Your supervisor is waiting beside the van.");
          if (hasCarriedItems()) return notify("Your hands are already full.");
          const nextItems = content.tutorial.garageUnload
            .filter((item) => !state.delivered.includes(item))
            .slice(0, getCarryCapacity("garage"));
          if (!nextItems.length) return notify("Everything has been carried to the client entrance.");
          state.carry = nextItems;
          changeEnergy(-getEquipmentEnergyCost(3));
          addLog(`Unloaded ${nextItems.join(" and ")} from the van.`);
          render();
        },
      },
      {
        x: 116, y: 185, label: hasCarriedItems() ? "Carry equipment to client entrance" : "Walk to client entrance",
        action: () => {
          if (hasCarriedItems()) {
            const carriedLabels = getCarriedLabels();
            state.delivered.push(...state.carry);
            addLog(`${carriedLabels.join(" and ")} carried from garage to the client entrance.`);
            state.carry = [];
            changeEnergy(-getEquipmentEnergyCost(4));
            if (state.delivered.length === content.tutorial.garageUnload.length) {
              setClock("MON 8:39 AM");
              addLog("Equipment delivered to lobby. Utility cart would have helped.");
              return showLobbyTransition();
            }
            return render();
          }
          notify("The equipment still needs to be carried from the van.");
        },
      },
    ];
  }

  if (state.sceneId === "lobby") {
    return [
      {
        x: 405, y: 225, label: "Check in with security", npc: "SEC",
        action: () => {
          state.flags.securityChecked = true;
          changeEnergy(-2);
          setClock("MON 8:52 AM");
          addLog("Security printed a visitor badge after locating the work order.");
          showModal({
            kicker: "Security Desk",
            title: "Visitor Badge Located Eventually",
            body: `<p>The client contact used a different company abbreviation. Security finds the work order after a short wait.</p>`,
            actions: [{ label: "Take Badge", onClick: render }],
          });
        },
      },
      {
        x: 795, y: 205, label: "Take elevator to client floor",
        action: () => {
          if (!state.flags.securityChecked) return notify("Security wants you to check in first.");
          setClock("MON 9:06 AM");
          addLog("Reached the client floor with the delivered equipment.");
          enterScene("client");
        },
      },
    ];
  }

  if (state.sceneId === "serviceOffice") {
    if (state.flags.serviceComplete) return [];
    return [
      {
        x: 300, y: 185, label: "Talk to client contact", npc: "CLIENT",
        action: () => {
          if (state.flags.serviceBrief) return notify('Client: "The afternoon meeting starts at one. No pressure."');
          state.flags.serviceBrief = true;
          addLog("Client confirmed the display failed during the morning meeting.");
          showModal({
            kicker: "Client Contact",
            title: "It Worked Yesterday",
            body: `<p>"The display powers on, but it flickers and drops out. Sales said you would swap it before the one o'clock meeting."</p>`,
            actions: [{ label: "Inspect Display", onClick: render }],
          });
        },
      },
      {
        x: 760, y: 305, label: state.flags.serviceInspected ? "Install replacement parts" : "Inspect failed display",
        action: () => {
          if (!state.flags.serviceBrief) return notify("Check in with the client contact first.");
          if (!state.flags.serviceInspected) {
            state.flags.serviceInspected = true;
            changeEnergy(-getServiceDiagnosisEnergyCost(3));
            addLog("Confirmed the display needs replacement. The signal path still has an unlabeled coupler.");
            render();
            return showModal({
              kicker: "Diagnosis",
              title: "The Quick Fix Is a Display Swap",
              body: `
                <p>The display itself is failing. The replacement screen and hardware tote are onsite.</p>
                <p>There is also an unlabeled coupler behind the credenza. You can verify the signal path now or trust the service ticket and start swapping equipment.</p>
                ${getCharacterLine("serviceInspect") ? `<p class="muted">${getCharacterLine("serviceInspect")}</p>` : ""}
                ${state.flags.servicePreparation === "review" ? `<p class="muted">Reviewing the forwarded email chain saved time during diagnosis.</p>` : ""}
                ${getChoicePressureMarkup([
                  {
                    label: "Verify signal path",
                    detail: "Troubleshooting check. Costs energy now, but lowers the chance that the quick swap becomes someone else's return trip.",
                  },
                  {
                    label: "Trust the ticket",
                    detail: "Fast management-friendly path. Saves time, but weak notes can turn the quick swap into a return trip.",
                  },
                ])}
              `,
              actions: [
                { label: `Verify signal path (-${getServiceVerificationEnergyCost(4)} energy)`, onClick: () => chooseServiceApproach("verify") },
                { label: "Trust the ticket and swap", className: "secondary-button", onClick: () => chooseServiceApproach("rush") },
              ],
            });
          }
          installServicePart();
        },
      },
      {
        x: 178, y: 350, label: "Pick up replacement gear",
        action: () => {
          if (!state.flags.serviceInspected) return notify("Inspect the failed display before opening replacement gear.");
          if (hasCarriedItems()) return notify("Your hands are already full.");
          const nextItems = content.serviceDispatch.swapItems
            .filter((item) => !state.serviceDelivered.includes(item.id) && !state.serviceInstalled.includes(item.id))
            .slice(0, getCarryCapacity("serviceOffice"));
          if (!nextItems.length) return notify("All replacement gear is beside the failed display.");
          state.carry = nextItems.map((item) => item.id);
          changeEnergy(-getEquipmentEnergyCost(3));
          addLog(`Picked up ${nextItems.map((item) => item.label).join(" and ")}.`);
          render();
        },
      },
    ];
  }

  if (state.sceneId === "universitySurvey") {
    const allChecked = state.surveyInspections.length === content.surveyDispatch.inspections.length;
    return [
      {
        x: 310, y: 185, label: allChecked ? "File survey report" : "Talk to facilities contact", npc: "CLIENT",
        action: () => {
          if (allChecked) return showSurveyReportChoice();
          if (state.flags.surveyBrief) return notify('Facilities contact: "The wall is upstairs. The elevator is the reason I called twice."');
          state.flags.surveyBrief = true;
          addLog("Facilities asked whether the quoted display can actually reach the classroom.");
          showModal({
            kicker: "Facilities Contact",
            title: "The Wall Was Measured",
            body: `
              <p>"Sales sent us a sketch for a new classroom display. The wall is fine. I asked whether anybody checked the elevator and they said your survey would confirm final conditions."</p>
              <p class="muted">Inspect the freight elevator opening, hallway turn, and intended display wall.</p>
            `,
            actions: [{ label: "Start Site Survey", onClick: render }],
          });
        },
      },
      {
        x: 700, y: 235, label: "Inspect freight elevator opening",
        action: () => {
          if (!state.flags.surveyBrief) return notify("Check in with the facilities contact first.");
          inspectSurveyConstraint("elevator");
        },
      },
      {
        x: 475, y: 275, label: "Inspect hallway turn",
        action: () => {
          if (!state.flags.surveyBrief) return notify("Check in with the facilities contact first.");
          inspectSurveyConstraint("hallway");
        },
      },
      {
        x: 750, y: 465, label: "Inspect classroom display wall",
        action: () => {
          if (!state.flags.surveyBrief) return notify("Check in with the facilities contact first.");
          inspectSurveyConstraint("wall");
        },
      },
    ];
  }

  if (state.sceneId === "southPhillyCommissioning") {
    const allChecked = state.commissioningChecks.length === content.commissioningDispatch.checks.length;
    const terminationChecked = state.commissioningChecks.includes("termination");
    const needsTerminationTask = terminationChecked && !state.flags.commissioningTerminationAction;
    const readyForCloseout = allChecked && !needsTerminationTask;
    return [
      {
        x: 300, y: 185, label: readyForCloseout ? "Close out commissioning visit" : needsTerminationTask ? "Client waiting on technical answer" : "Talk to client contact", npc: "CLIENT",
        action: () => {
          if (readyForCloseout) return showCommissioningChoice();
          if (needsTerminationTask) return notify("Handle the loose termination at the credenza before closeout.");
          if (state.flags.commissioningBrief) return notify('Client: "The back of the room is still quieter. The installer said commissioning would tune it."');
          state.flags.commissioningBrief = true;
          addLog("Client reported that one side of the completed room still sounds quieter.");
          showModal({
            kicker: "Client Contact",
            title: "The Room Is Ready For Final Final",
            body: `
              <p>"The install team said the room was complete. The back speaker never sounded right, but they said commissioning would tune it."</p>
              <p class="muted">Test the ceiling speakers, inspect the credenza termination, and review the closeout drawing.</p>
            `,
            actions: [{ label: "Start Commissioning", onClick: render }],
          });
        },
      },
      {
        x: 485, y: 220, label: "Test ceiling speaker zone",
        action: () => {
          if (!state.flags.commissioningBrief) return notify("Check in with the client contact first.");
          inspectCommissioningCondition("speaker-zone");
        },
      },
      {
        x: 760, y: 300, label: terminationChecked ? state.flags.commissioningTerminationAction ? "Review termination task" : "Choose termination task" : "Inspect credenza termination",
        action: () => {
          if (!state.flags.commissioningBrief) return notify("Check in with the client contact first.");
          if (terminationChecked && !state.flags.commissioningTerminationAction) return showCommissioningTerminationChoice();
          if (state.flags.commissioningTerminationAction) return notify(`${getCommissioningTerminationTaskLabel()}: ${getCommissioningTerminationQualityLabel()}.`);
          inspectCommissioningCondition("termination");
        },
      },
      {
        x: 410, y: 375, label: "Review closeout drawing",
        action: () => {
          if (!state.flags.commissioningBrief) return notify("Check in with the client contact first.");
          inspectCommissioningCondition("drawing");
        },
      },
    ];
  }

  if (state.sceneId === "warrantyReturn") {
    const allChecked = state.callbackCleanupChecks.length === content.callbackCleanupDispatch.checks.length;
    return [
      {
        x: 300, y: 185, label: allChecked ? "Close out warranty return" : "Talk to client contact", npc: "CLIENT",
        action: () => {
          if (allChecked) return showCallbackCleanupChoice();
          if (state.flags.callbackCleanupBrief) return notify('Client: "It worked after the last visit, then stopped working when people started using the room."');
          state.flags.callbackCleanupBrief = true;
          addLog("Client explained that the issue survived the previous closeout note.");
          showModal({
            kicker: "Client Contact",
            title: "The Problem Came Back",
            body: `
              <p>"The last ticket says tested good. It did work for a bit. Then the same issue came back during the next meeting."</p>
              <p class="muted">Review the complaint notes, ticket history, and actual fault before deciding how honest the fix gets to be.</p>
            `,
            actions: [{ label: "Start Warranty Troubleshooting", onClick: render }],
          });
        },
      },
      {
        x: 420, y: 375, label: "Review ticket history",
        action: () => {
          if (!state.flags.callbackCleanupBrief) return notify("Check in with the client contact first.");
          inspectCallbackCleanupCondition("ticket-history");
        },
      },
      {
        x: 485, y: 220, label: "Test actual fault",
        action: () => {
          if (!state.flags.callbackCleanupBrief) return notify("Check in with the client contact first.");
          inspectCallbackCleanupCondition("actual-fault");
        },
      },
      {
        x: 760, y: 300, label: "Read client complaint notes",
        action: () => {
          if (!state.flags.callbackCleanupBrief) return notify("Check in with the client contact first.");
          inspectCallbackCleanupCondition("client-notes");
        },
      },
    ];
  }

  if (state.sceneId === "executiveHandoff") {
    const allChecked = state.handoffChecks.length === content.handoffDispatch.checks.length;
    return [
      {
        x: 300, y: 185, label: allChecked ? "Close out client handoff" : "Talk to client contact", npc: "CLIENT",
        action: () => {
          if (allChecked) return showHandoffChoice();
          if (state.flags.handoffBrief) return notify('Client: "I mostly need to know what to press when the CEO is already looking at me."');
          state.flags.handoffBrief = true;
          addLog("Client asked for the version of the system explanation that works during an actual meeting.");
          showModal({
            kicker: "Client Contact",
            title: "Show Me The Normal Way",
            body: `
              <p>"Everyone says the room is simple. I just need to start the weekly meeting without guessing whether PRESENT means present my laptop or present my resignation."</p>
              <p class="muted">Review the control panel labels, daily user path, and what the client actually needs.</p>
            `,
            actions: [{ label: "Start Handoff Prep", onClick: render }],
          });
        },
      },
      {
        x: 480, y: 260, label: "Review control panel labels",
        action: () => {
          if (!state.flags.handoffBrief) return notify("Check in with the client contact first.");
          inspectHandoffCondition("control-panel");
        },
      },
      {
        x: 760, y: 300, label: "Practice daily user path",
        action: () => {
          if (!state.flags.handoffBrief) return notify("Check in with the client contact first.");
          inspectHandoffCondition("daily-use");
        },
      },
      {
        x: 760, y: 180, label: "Ask what the client actually needs",
        action: () => {
          if (!state.flags.handoffBrief) return notify("Check in with the client contact first.");
          inspectHandoffCondition("client-need");
        },
      },
    ];
  }

  if (state.sceneId === "systemsService") {
    const allChecked = state.systemsChecks.length === content.systemsDispatch.checks.length;
    return [
      {
        x: 300, y: 185, label: allChecked ? "Close out systems service" : "Talk to client contact", npc: "CLIENT",
        action: () => {
          if (allChecked) return showSystemsChoice();
          if (state.flags.systemsBrief) return notify('Client: "It says offline. We have rebooted it twice, which I am told is both step one and step two."');
          state.flags.systemsBrief = true;
          addLog("Client confirmed the room rebooted twice and returned to being offline with impressive consistency.");
          showModal({
            kicker: "Client Contact",
            title: "Offline Means Offline",
            body: `
              <p>"The panel says offline, the display sometimes wakes up, and the ticket says reboot. We did that. Twice. It seemed rude to do it a third time before you got here."</p>
              <p class="muted">Check the panel status, device network path, and rack note before choosing a closeout.</p>
            `,
            actions: [{ label: "Start Systems Check", onClick: render }],
          });
        },
      },
      {
        x: 500, y: 260, label: "Check touch panel status",
        action: () => {
          if (!state.flags.systemsBrief) return notify("Check in with the client contact first.");
          inspectSystemsCondition("panel-status");
        },
      },
      {
        x: 760, y: 180, label: "Verify device network path",
        action: () => {
          if (!state.flags.systemsBrief) return notify("Check in with the client contact first.");
          inspectSystemsCondition("network-path");
        },
      },
      {
        x: 760, y: 380, label: "Compare rack note",
        action: () => {
          if (!state.flags.systemsBrief) return notify("Check in with the client contact first.");
          inspectSystemsCondition("rack-note");
        },
      },
    ];
  }

  if (state.sceneId === "navyYardAccess") {
    const allChecked = state.secureAccessChecks.length === content.secureAccessDispatch.checks.length;
    return [
      {
        x: 300, y: 185, label: allChecked ? "Close out access delay" : "Check in with security", npc: "SEC",
        action: () => {
          if (allChecked) return showSecureAccessChoice();
          if (state.flags.secureAccessBrief) return notify('Security: "I can see the company in the system. I cannot see you in the system."');
          state.flags.secureAccessBrief = true;
          addLog("Security confirmed the company is expected and you personally are not.");
          showModal({
            kicker: "Security Booth",
            title: "Expected Adjacent",
            body: `<p>"I have the company name, but not your visitor entry. Also this says Building 12. The work order I have says 13."</p>`,
            actions: [{ label: "Start Sorting Access", onClick: render }],
          });
        },
      },
      {
        x: 430, y: 255, label: "Check building number",
        action: () => {
          if (!state.flags.secureAccessBrief) return notify("Check in with security first.");
          inspectSecureAccessCondition("building");
        },
      },
      {
        x: 785, y: 205, label: "Check loading dock",
        action: () => {
          if (!state.flags.secureAccessBrief) return notify("Check in with security first.");
          inspectSecureAccessCondition("gate");
        },
      },
      {
        x: 745, y: 385, label: "Check telecom room escort",
        action: () => {
          if (!state.flags.secureAccessBrief) return notify("Check in with security first.");
          inspectSecureAccessCondition("escort");
        },
      },
    ];
  }

  return [
    ...(!state.flags.roomBrief && !state.flags.supervisorLeft ? [{
      x: 320, y: 185, label: "Talk to supervisor", npc: "SUP",
      action: () => {
        state.flags.roomBrief = true;
        addLog("Supervisor explained cart assembly in a hurry.");
        showModal({
          kicker: "Supervisor",
          title: "First Cart Together",
          body: `<p>"Frame first, then display. We'll build the first one together. The second is the same thing twice."</p>`,
          actions: [{ label: "Open the Boxes", onClick: render }],
        });
      },
    }] : []),
    {
      x: 178, y: 345, label: "Pick up next cart component",
      action: () => {
        if (!state.flags.roomBrief) return notify("Your supervisor is ready to explain the first cart.");
        if (hasCarriedItems()) return notify("Your hands are already full.");
        const next = getNextAssemblyItem();
        if (!next) return notify("Both carts are assembled.");
        state.carry = [next.id];
        changeEnergy(-getEquipmentEnergyCost(2));
        addLog(`Picked up ${next.label}.`);
        render();
      },
    },
    { x: 530, y: 220, label: "Install component on Cart 1", action: () => installCartPart("cart1") },
    { x: 755, y: 390, label: "Install component on Cart 2", action: () => installCartPart("cart2") },
  ];
}

function chooseServiceApproach(approach) {
  state.flags.serviceApproach = approach;
  if (approach === "verify") {
    const skillCheck = resolveSkillCheck("service-signal-path", {
      skillId: "troubleshooting",
      difficulty: 4,
      contextBonus: (state.flags.servicePreparation === "review" ? 1 : 0) + (state.flags.servicePreparation === "josh" ? 1 : 0) + (state.flags.servicePreparation === "contact" ? 1 : 0),
      contextId: "service-diagnosis",
    });
    const energyCost = Math.max(0, getServiceVerificationEnergyCost(4) + (skillCheck.successful ? 0 : 2) - (skillCheck.tier === "clean" ? 1 : 0));
    changeEnergy(-energyCost);
    if (!skillCheck.successful) state.flags.serviceVerificationStrained = true;
    addLog(skillCheck.successful
      ? `Verified the signal path and marked the unlabeled coupler. ${getSkillCheckLabel(skillCheck)}.`
      : `Tried to verify the signal path, but the diagnosis stayed thin. ${getSkillCheckLabel(skillCheck)}.`);
  } else {
    addLog("Trusted the service ticket and started the display swap immediately.");
  }
  render();
}

function installServicePart() {
  if (!hasCarriedItems()) return notify("Pick up replacement gear from the boxes.");
  const items = [...state.carry];
  const skillCheck = resolveSkillCheck(`service-install-${items.join("-")}`, {
    skillId: "install",
    difficulty: items.includes("replacement-display") ? 4 : 3,
    contextId: "service-install",
  });
  state.serviceDelivered.push(...items);
  state.serviceInstalled.push(...items);
  state.carry = [];
  const energyCost = Math.max(0, getAssemblyEnergyCost(10) + (skillCheck.successful ? 0 : 2) - (skillCheck.tier === "clean" ? 1 : 0));
  changeEnergy(-energyCost);
  if (!skillCheck.successful) state.flags.serviceInstallStrained = true;
  addLog(`${getServiceItemLabels(items).join(" and ")} installed ${ownsTool("drill") ? "with your drill" : "with your screwdriver"}. ${getSkillCheckLabel(skillCheck)}.`);
  if (state.serviceInstalled.length === content.serviceDispatch.swapItems.length) {
    if (state.flags.serviceApproach !== "verify" || state.flags.serviceInstallStrained) {
      changeEnergy(-6);
      addLog(state.flags.serviceInstallStrained
        ? "Reopened the connection panel after the display install tested flaky under load."
        : "Reopened the connection panel after the unlabeled coupler caused a dropout.");
    }
    return showServiceResults();
  }
  render();
}

function getServiceItemLabels(itemIds) {
  return itemIds.map((itemId) => content.serviceDispatch.swapItems.find((item) => item.id === itemId)?.label || itemId);
}

function installCartPart(destination) {
  if (!hasCarriedItems()) return notify("Pick up the next cart component from the delivered boxes.");
  const part = content.tutorial.assembly.find((item) => item.id === state.carry[0]);
  if (!part || part.destination !== destination) return notify(`${part?.label || "That component"} belongs on the other cart.`);
  const skillCheck = resolveSkillCheck(`cart-${part.id}`, {
    skillId: "install",
    difficulty: part.id.includes("display") ? 4 : 3,
    contextId: "cart-assembly",
  });
  state.assembled.push(part.id);
  state.carry = [];
  const energyCost = Math.max(0, getAssemblyEnergyCost(7) + (skillCheck.successful ? 0 : 1) - (skillCheck.tier === "clean" ? 1 : 0));
  changeEnergy(-energyCost);
  if (!skillCheck.successful) state.flags.cartAssemblyStrained = true;
  addLog(`${part.label} installed ${ownsTool("drill") ? "with your drill" : "with your screwdriver"}. ${getSkillCheckLabel(skillCheck)}.`);
  const cart1Done = state.assembled.filter((id) => id.startsWith("cart-1")).length === 2;
  const cart2Done = state.assembled.filter((id) => id.startsWith("cart-2")).length === 2;
  if (cart1Done && !state.flags.supervisorLeft) return showSupervisorDeparture();
  if (cart2Done && !state.flags.finished) return showFinishChoice();
  render();
}

function notify(message) {
  addLog(message);
  render();
}

function getObjective() {
  if (state.sceneId === "shop") {
    if (state.flags.serviceCallbackPending && !state.flags.serviceCallbackResolved) return "Talk to Josh about the Conshohocken callback.";
    if (state.flags.endShiftPending) return "Close out the shift before taking another dispatch.";
    if (state.flags.serviceComplete && !state.flags.joshServiceDebriefed) return "Check in with Josh at the workbench.";
    if (state.flags.serviceComplete && hasPendingTraining()) return "Choose a field-training focus from the career clipboard.";
    if (state.flags.serviceComplete && !state.flags.surveyComplete) return "Review the University City site survey on the dispatch board.";
    if (state.flags.surveyComplete && !state.flags.commissioningComplete) return "Review the South Philadelphia commissioning visit on the dispatch board.";
    if (state.flags.warehouseStarted && !state.flags.warehouseComplete) {
      if (state.warehouseChecks.length === content.warehouseDispatch.checks.length) return "Review the found power supply.";
      return `Search the shop for the replacement power supply (${state.warehouseChecks.length}/${content.warehouseDispatch.checks.length}).`;
    }
    if (state.flags.commissioningComplete && !state.flags.warehouseComplete) return "Review the warehouse run on the dispatch board.";
    if (state.flags.warehouseComplete && !state.flags.secureAccessComplete) return "Review the Navy Yard secure-access job on the dispatch board.";
    if (state.flags.secureAccessComplete && !state.flags.callbackCleanupComplete && getUnresolvedCallbackCount() > 0) return "Review the warranty return on the dispatch board.";
    if (state.flags.secureAccessComplete && !state.flags.handoffComplete) return "Review the executive handoff on the dispatch board.";
    if (state.flags.handoffComplete && !state.flags.systemsComplete) return "Review the King of Prussia systems service on the dispatch board.";
    if (state.flags.systemsComplete && !state.flags.travelComplete) return "Review the Cherry Hill return toll on the dispatch board.";
    if (state.flags.travelComplete && !state.flags.prototypeSummaryViewed) return "Review your career snapshot on the dispatch board.";
    if (state.flags.secureAccessComplete) return "Current dispatch board complete. Explore the shop.";
    if (state.flags.finished) return "Prepare for the Conshohocken service call.";
    if (!state.flags.shopBrief) return "Find your supervisor.";
    if (state.loaded.length < content.tutorial.shopLoad.length) return `Load staged equipment into Van #3 (${state.loaded.length}/3).`;
    return "Inspect Van #3 and leave for Center City East.";
  }
  if (state.sceneId === "garage") {
    if (!state.flags.garageBrief) return "Meet your supervisor beside Van #3.";
    return `Carry equipment from the garage to the client entrance (${state.delivered.length}/3).`;
  }
  if (state.sceneId === "lobby") {
    if (!state.flags.securityChecked) return "Check in with security.";
    return "Take the elevator to the client floor.";
  }
  if (state.sceneId === "serviceOffice") {
    if (!state.flags.serviceBrief) return "Check in with the client contact.";
    if (!state.flags.serviceInspected) return "Inspect the failed display.";
    if (state.flags.serviceComplete) return "Review the completed service call.";
    return `Install replacement gear (${state.serviceInstalled.length}/${content.serviceDispatch.swapItems.length}).`;
  }
  if (state.sceneId === "universitySurvey") {
    if (!state.flags.surveyBrief) return "Check in with the facilities contact.";
    if (state.surveyInspections.length < content.surveyDispatch.inspections.length) {
      return `Inspect the campus access path (${state.surveyInspections.length}/${content.surveyDispatch.inspections.length}).`;
    }
    return "Return to the facilities contact and file the survey report.";
  }
  if (state.sceneId === "southPhillyCommissioning") {
    if (!state.flags.commissioningBrief) return "Check in with the client contact.";
    if (state.commissioningChecks.includes("termination") && !state.flags.commissioningTerminationAction) {
      return "Choose how to handle the loose credenza termination.";
    }
    if (state.commissioningChecks.length < content.commissioningDispatch.checks.length) {
      return `Commission the training room (${state.commissioningChecks.length}/${content.commissioningDispatch.checks.length}).`;
    }
    return "Return to the client contact and close out the commissioning visit.";
  }
  if (state.sceneId === "warrantyReturn") {
    if (!state.flags.callbackCleanupBrief) return "Check in with the client contact.";
    if (state.callbackCleanupChecks.length < content.callbackCleanupDispatch.checks.length) {
      return `Troubleshoot the warranty return (${state.callbackCleanupChecks.length}/${content.callbackCleanupDispatch.checks.length}).`;
    }
    return "Return to the client contact and close out the warranty return.";
  }
  if (state.sceneId === "executiveHandoff") {
    if (!state.flags.handoffBrief) return "Check in with the client contact.";
    if (state.handoffChecks.length < content.handoffDispatch.checks.length) {
      return `Prepare the client handoff (${state.handoffChecks.length}/${content.handoffDispatch.checks.length}).`;
    }
    return "Return to the client contact and choose the handoff style.";
  }
  if (state.sceneId === "systemsService") {
    if (!state.flags.systemsBrief) return "Check in with the client contact.";
    if (state.systemsChecks.length < content.systemsDispatch.checks.length) {
      return `Troubleshoot the offline room (${state.systemsChecks.length}/${content.systemsDispatch.checks.length}).`;
    }
    return "Return to the client contact and choose the systems closeout.";
  }
  if (state.sceneId === "navyYardAccess") {
    if (!state.flags.secureAccessBrief) return "Check in with security.";
    if (state.secureAccessChecks.length < content.secureAccessDispatch.checks.length) {
      return `Sort out secure access (${state.secureAccessChecks.length}/${content.secureAccessDispatch.checks.length}).`;
    }
    return "Return to security and close out the access delay.";
  }
  if (!state.flags.roomBrief) return "Ask the supervisor how to start the cart build.";
  if (state.assembled.length < 2) return `Assemble Cart 1 with your supervisor (${state.assembled.length}/2).`;
  if (state.assembled.length < 4) return `Finish Cart 2 alone (${state.assembled.length - 2}/2).`;
  return "Review the result of your first day.";
}

function distanceTo(interaction) {
  return Math.hypot(state.player.x - interaction.x, state.player.y - interaction.y);
}

function getNearestInteraction() {
  if (!state.sceneId) return null;
  return getInteractions()
    .map((interaction) => ({ ...interaction, distance: distanceTo(interaction) }))
    .filter((interaction) => interaction.distance < 105)
    .sort((a, b) => a.distance - b.distance)[0] || null;
}

function interact() {
  if (state.modalOpen || !state.sceneId) return;
  const nearest = getNearestInteraction();
  if (!nearest) return notify("Nothing nearby needs your attention.");
  nearest.action();
}

function overlapsSolidObject(x, y) {
  const playerBounds = { left: x - 11, right: x + 11, top: y - 13, bottom: y + 13 };
  return content.scenes[state.sceneId].decor
    .filter((item) => item.solid)
    .some((item) => (
      playerBounds.right > item.x
      && playerBounds.left < item.x + item.w
      && playerBounds.bottom > item.y
      && playerBounds.top < item.y + item.h
    ));
}

function moveOnAxis(axis, amount) {
  const next = { ...state.player, [axis]: state.player[axis] + amount };
  next.x = Math.max(28, Math.min(912, next.x));
  next.y = Math.max(48, Math.min(500, next.y));
  if (!overlapsSolidObject(next.x, next.y)) state.player = next;
}

function movePlayer() {
  if (state.modalOpen || !state.sceneId) return;
  let dx = 0;
  let dy = 0;
  if (keys.has("arrowleft") || keys.has("a")) dx -= 1;
  if (keys.has("arrowright") || keys.has("d")) dx += 1;
  if (keys.has("arrowup") || keys.has("w")) dy -= 1;
  if (keys.has("arrowdown") || keys.has("s")) dy += 1;
  if (!dx && !dy) return;
  const length = Math.hypot(dx, dy);
  moveOnAxis("x", (dx / length) * PLAYER_SPEED);
  moveOnAxis("y", (dy / length) * PLAYER_SPEED);
  renderPlayer();
  renderNearby();
}

function escapeHtml(value) {
  return `${value}`.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;",
  }[char]));
}

function sanitizeCreatorName(value) {
  const clean = `${value || ""}`.replace(/[<>]/g, "").replace(/\s+/g, " ").trim();
  return clean.slice(0, 32) || "Custom Tech";
}

function addNumericMap(target, source = {}) {
  Object.entries(source).forEach(([key, value]) => {
    target[key] = (target[key] || 0) + value;
  });
}

function getCreatorConfig() {
  return content.characterCreation;
}

function getCreatorChoice(collection, choiceId) {
  return collection.find((item) => item.id === choiceId);
}

function getCreatorSelectionsFromForm() {
  return {
    name: sanitizeCreatorName(document.querySelector("#creator-name")?.value),
    backgroundId: document.querySelector("#creator-background")?.value,
    workStyleId: document.querySelector("#creator-work-style")?.value,
    traitIds: [
      document.querySelector("#creator-trait-1")?.value,
      document.querySelector("#creator-trait-2")?.value,
    ].filter(Boolean),
    primarySkillIds: [
      document.querySelector("#creator-primary-1")?.value,
      document.querySelector("#creator-primary-2")?.value,
    ].filter(Boolean),
    secondarySkillIds: [
      document.querySelector("#creator-secondary-1")?.value,
      document.querySelector("#creator-secondary-2")?.value,
    ].filter(Boolean),
  };
}

function validateCreatorSelections(selections) {
  const skillIds = [...selections.primarySkillIds, ...selections.secondarySkillIds];
  if (new Set(skillIds).size !== skillIds.length) return "Pick four different major skills. Primary and secondary skills cannot overlap.";
  if (new Set(selections.traitIds).size !== selections.traitIds.length) return "Pick two different traits.";
  if (!selections.backgroundId || !selections.workStyleId || selections.traitIds.length !== 2) return "Pick a background, work style, and two traits.";
  return "";
}

function buildCustomTechnician(selections) {
  const creator = getCreatorConfig();
  const background = getCreatorChoice(creator.backgrounds, selections.backgroundId);
  const workStyle = getCreatorChoice(creator.workStyles, selections.workStyleId);
  const traits = selections.traitIds.map((traitId) => getCreatorChoice(creator.traits, traitId)).filter(Boolean);
  const stats = { ...creator.baseStats };
  const characterStats = { ...creator.baseSkills };
  const mechanicalTraits = ["customTechnician"];
  const startingTools = ["screwdriver"];
  let startingCash = 0;

  [background, workStyle, ...traits].forEach((piece) => {
    addNumericMap(stats, piece.statModifiers);
    addNumericMap(characterStats, piece.skillBonuses);
    addNumericMap(characterStats, piece.characterStats);
    startingTools.push(...(piece.startingTools || []));
    mechanicalTraits.push(...(piece.traits || []));
    startingCash += piece.cashModifier || 0;
  });

  selections.primarySkillIds.forEach((skillId) => {
    characterStats[skillId] = (characterStats[skillId] || 0) + creator.primarySkillBonus;
  });
  selections.secondarySkillIds.forEach((skillId) => {
    characterStats[skillId] = (characterStats[skillId] || 0) + creator.secondarySkillBonus;
  });

  Object.keys(stats).forEach((key) => {
    stats[key] = Math.max(key === "burnout" ? 0 : 1, stats[key]);
  });
  getSkillDefinitions().forEach((skill) => {
    characterStats[skill.id] = Math.max(1, characterStats[skill.id] || 1);
  });

  const rankedSkills = getSkillDefinitions()
    .map((skill) => ({ ...skill, value: characterStats[skill.id] || 0 }))
    .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name));

  return {
    id: "custom-tech",
    custom: true,
    name: selections.name,
    role: `${background.name} / ${workStyle.name}`,
    tagline: `Custom build: ${background.name}, ${workStyle.name}.`,
    description: `${background.tradeoff} ${workStyle.tradeoff}`,
    strengths: rankedSkills.slice(0, 2).map((skill) => `${skill.name} ${skill.value}`),
    weaknesses: rankedSkills.slice(-2).map((skill) => `${skill.name} ${skill.value}`),
    playstyle: workStyle.effect,
    difficulty: "Custom",
    trait: workStyle.name,
    tendency: traits.map((trait) => trait.name).join(", "),
    stats,
    characterStats,
    traits: uniqueValues(mechanicalTraits),
    startingTools: uniqueValues(startingTools),
    startingCash,
    creatorBuild: {
      backgroundId: background.id,
      workStyleId: workStyle.id,
      traitIds: traits.map((trait) => trait.id),
      primarySkillIds: selections.primarySkillIds,
      secondarySkillIds: selections.secondarySkillIds,
      formula: `${background.name} + ${workStyle.name} + ${traits.map((trait) => trait.name).join(" + ")}`,
    },
  };
}

function getCreatorBuildFromForm() {
  const selections = getCreatorSelectionsFromForm();
  const error = validateCreatorSelections(selections);
  if (error) return { error, technician: null };
  return { error: "", technician: buildCustomTechnician(selections) };
}

function getCreatorSelectMarkup(id, options, selectedId) {
  return `
    <select id="${id}">
      ${options.map((option) => `<option value="${option.id}"${option.id === selectedId ? " selected" : ""}>${option.name}</option>`).join("")}
    </select>
  `;
}

function getSkillSelectMarkup(id, selectedId) {
  return getCreatorSelectMarkup(id, getSkillDefinitions(), selectedId);
}

function syncCreatorExclusiveSelects(selectIds) {
  const selects = selectIds
    .map((id) => document.querySelector(`#${id}`))
    .filter(Boolean);
  const selectedValues = selects.map((select) => select.value).filter(Boolean);
  selects.forEach((select) => {
    Array.from(select.options).forEach((option) => {
      option.disabled = option.value !== select.value && selectedValues.includes(option.value);
    });
  });
}

function syncCreatorChoiceAvailability() {
  syncCreatorExclusiveSelects(["creator-trait-1", "creator-trait-2"]);
  syncCreatorExclusiveSelects([
    "creator-primary-1",
    "creator-primary-2",
    "creator-secondary-1",
    "creator-secondary-2",
  ]);
}

function getCreatorPreviewMarkup(technician) {
  return `
    <div class="results-grid">
      <span>Name</span><strong>${escapeHtml(technician.name)}</strong>
      <span>Formula</span><strong>${escapeHtml(technician.creatorBuild.formula)}</strong>
      <span>Energy</span><strong>${technician.stats.energy}</strong>
      <span>Craftsmanship</span><strong>${technician.stats.craftsmanship}</strong>
      <span>Confidence</span><strong>${technician.stats.confidence}</strong>
      <span>Starting cash</span><strong>${formatCash(technician.startingCash)}</strong>
      <span>Starting kit</span><strong>${technician.startingTools.map((toolId) => content.tools[toolId]?.name || toolId).join(", ")}</strong>
      <span>Key skills</span><strong>${getTechnicianSkillPreview(technician)}</strong>
    </div>
    <p class="muted"><strong>Tradeoff:</strong> ${escapeHtml(technician.description)}</p>
  `;
}

function renderCreatorPreviewFromForm() {
  const preview = document.querySelector("#creator-preview");
  const errorNode = document.querySelector("#creator-error");
  if (!preview || !errorNode) return;
  syncCreatorChoiceAvailability();
  const { error, technician } = getCreatorBuildFromForm();
  errorNode.textContent = error;
  preview.innerHTML = technician ? getCreatorPreviewMarkup(technician) : "";
}

function showCharacterCreator() {
  const creator = getCreatorConfig();
  const skills = getSkillDefinitions();
  showModal({
    kicker: "Custom Technician",
    title: "Build Your First Tech",
    body: `
      <p>Pick a work background, work style, two traits, and four major skill focuses. The creator stays compact, but the resulting technician is playable and saved like a premade.</p>
      <div class="creator-form">
        <label>Name <input id="creator-name" maxlength="32" value="Custom Tech" /></label>
        <label>Background ${getCreatorSelectMarkup("creator-background", creator.backgrounds, "green-apprentice")}</label>
        <label>Work style ${getCreatorSelectMarkup("creator-work-style", creator.workStyles, "calm-under-fire")}</label>
        <label>Trait 1 ${getCreatorSelectMarkup("creator-trait-1", creator.traits, "steady-hands")}</label>
        <label>Trait 2 ${getCreatorSelectMarkup("creator-trait-2", creator.traits, "notebook-habit")}</label>
        <label>Primary skill 1 ${getSkillSelectMarkup("creator-primary-1", skills[0]?.id)}</label>
        <label>Primary skill 2 ${getSkillSelectMarkup("creator-primary-2", skills[1]?.id)}</label>
        <label>Secondary skill 1 ${getSkillSelectMarkup("creator-secondary-1", skills[2]?.id)}</label>
        <label>Secondary skill 2 ${getSkillSelectMarkup("creator-secondary-2", skills[4]?.id || skills[3]?.id)}</label>
      </div>
      <p class="creator-error" id="creator-error"></p>
      <p><strong>Build preview:</strong></p>
      <div id="creator-preview"></div>
    `,
    actions: [
      { label: "Start Custom Career", close: false, onClick: () => {
        const { error, technician } = getCreatorBuildFromForm();
        const errorNode = document.querySelector("#creator-error");
        if (error) {
          if (errorNode) errorNode.textContent = error;
          return;
        }
        closeModal();
        startGame(technician);
      } },
      { label: "Update Preview", className: "secondary-button", close: false, onClick: renderCreatorPreviewFromForm },
      { label: "Back to Profiles", className: "secondary-button" },
    ],
  });
  document.querySelectorAll(".creator-form input, .creator-form select").forEach((input) => {
    input.addEventListener("input", renderCreatorPreviewFromForm);
    input.addEventListener("change", renderCreatorPreviewFromForm);
  });
  renderCreatorPreviewFromForm();
}

function renderSelection() {
  elements.technicianGrid.replaceChildren(
    ...content.technicians.map((technician) => {
      const card = document.createElement("article");
      card.className = "technician-card";
      const template = content.characterCreation?.premadeTemplates?.find((item) => item.technicianId === technician.id);
      card.innerHTML = `
        <p class="eyebrow">Technician Profile</p>
        <h3>${technician.name}</h3>
        ${technician.role ? `<p class="muted">${technician.role}</p>` : ""}
        <p>${technician.tagline}</p>
        ${technician.description ? `<p>${technician.description}</p>` : ""}
        <div class="tech-stats">
          <span>Energy <strong>${technician.stats.energy}</strong></span>
          <span>Craft <strong>${technician.stats.craftsmanship}</strong></span>
          <span>Confidence <strong>${technician.stats.confidence}</strong></span>
        </div>
        <p class="starting-kit"><strong>Key skills:</strong> ${getTechnicianSkillPreview(technician)}</p>
        ${technician.strengths ? `<p class="starting-kit"><strong>Strengths:</strong> ${technician.strengths.join(", ")}</p>` : ""}
        ${technician.weaknesses ? `<p class="starting-kit"><strong>Growth areas:</strong> ${technician.weaknesses.join(", ")}</p>` : ""}
        ${technician.playstyle ? `<p class="starting-kit"><strong>Playstyle:</strong> ${technician.playstyle}</p>` : ""}
        ${technician.difficulty ? `<p class="starting-kit"><strong>Difficulty:</strong> ${technician.difficulty}</p>` : ""}
        ${technician.trait ? `<p class="starting-kit"><strong>Trait:</strong> ${technician.trait}</p>` : ""}
        ${technician.tendency ? `<p class="starting-kit"><strong>Tendency:</strong> ${technician.tendency}</p>` : ""}
        ${template ? `<p class="starting-kit"><strong>Creator formula:</strong> ${template.formula}</p>` : ""}
        <p class="starting-kit"><strong>Starting kit:</strong> ${technician.startingTools.map((toolId) => content.tools[toolId]?.name || toolId).join(", ")}</p>
      `;
      card.append(makeButton("Start First Day", () => startGame(technician.id)));
      return card;
    }),
    renderCharacterCreatorCard(),
  );
}

function renderCharacterCreatorCard() {
  const creator = content.characterCreation;
  const card = document.createElement("article");
  card.className = "technician-card creator-preview-card";
  if (!creator) {
    card.innerHTML = `
      <p class="eyebrow">Custom Build</p>
      <h3>Custom Technician</h3>
      <p>Character creation planning has not been configured yet.</p>
    `;
    return card;
  }
  card.innerHTML = `
    <p class="eyebrow">Custom Build</p>
    <h3>Custom Technician Creator</h3>
    <p>${creator.summary}</p>
    <p class="starting-kit"><strong>Backgrounds:</strong> ${creator.backgrounds.map((item) => item.name).join(", ")}</p>
    <p class="starting-kit"><strong>Work styles:</strong> ${creator.workStyles.map((item) => item.name).join(", ")}</p>
    <p class="starting-kit"><strong>Traits:</strong> ${creator.traits.map((item) => item.name).join(", ")}</p>
    <p class="starting-kit"><strong>Creator release:</strong> pick one background, one work style, two traits, and four major skill focuses, then preview the final build before starting.</p>
  `;
  const button = makeButton("Create Custom Technician", showCharacterCreator, "primary-button");
  card.append(button);
  return card;
}

function getTechnicianSkillPreview(technician, { limit = 5 } = {}) {
  const skillValues = getSkillDefinitions().map((skill) => {
    const value = technician.characterStats?.[skill.id]
      || (skill.id === "install" ? Math.max(1, technician.stats.craftsmanship || 0)
      : skill.id === "troubleshooting" ? Math.max(1, (technician.stats.confidence || 0) + 1)
      : skill.id === "documentation" ? Math.max(1, technician.stats.confidence || 0)
      : skill.id === "clientCommunication" ? Math.max(1, (technician.stats.confidence || 0) + 1)
      : skill.id === "fieldcraft" ? Math.max(1, Math.floor((technician.stats.energy || 100) / 45))
      : 0);
    return { ...skill, value };
  });
  return skillValues
    .filter((skill) => skill.value > 0)
    .sort((a, b) => b.value - a.value || a.branch.localeCompare(b.branch) || a.name.localeCompare(b.name))
    .slice(0, limit)
    .map((skill) => `${skill.name} ${skill.value}`)
    .join(", ");
}

function renderDecor() {
  const scene = content.scenes[state.sceneId];
  const decor = scene.decor.map((item) => {
    const node = document.createElement("div");
    node.className = `decor ${item.type}`;
    node.style.left = `${item.x}px`;
    node.style.top = `${item.y}px`;
    node.style.width = `${item.w}px`;
    node.style.height = `${item.h}px`;
    node.textContent = item.text;
    return node;
  });
  const interactions = getInteractions().map((item) => {
    const marker = document.createElement("div");
    marker.className = item.npc ? "interaction-marker npc-marker" : "interaction-marker";
    marker.style.left = `${item.x - 11}px`;
    marker.style.top = `${item.y - 11}px`;
    marker.title = item.label;
    marker.textContent = item.npc || "";
    return marker;
  });
  elements.sceneLayer.replaceChildren(...decor, ...interactions);
}

function renderPlayer() {
  elements.player.style.left = `${state.player.x - 15}px`;
  elements.player.style.top = `${state.player.y - 19}px`;
  const carried = hasCarriedItems() ? getCarriedLabels().join(" + ") : null;
  elements.carryBubble.textContent = carried || "";
  elements.carryBubble.classList.toggle("hidden", !carried);
}

function renderNearby() {
  const nearest = getNearestInteraction();
  elements.nearbyCard.textContent = nearest ? nearest.label : "Walk toward an object or person.";
  elements.interactButton.disabled = !nearest;
  elements.interactButton.textContent = nearest ? `Interact: ${nearest.label}` : "Interact";
}

function renderHud() {
  const vehicle = content.vehicles.van3;
  const rank = getCareerRank();
  elements.techName.textContent = state.technician.name;
  elements.energyValue.textContent = state.energy;
  elements.energyMeter.style.width = `${(state.energy / getMaxEnergy()) * 100}%`;
  elements.burnoutValue.textContent = state.burnout;
  elements.cashValue.textContent = formatCash(state.cash);
  elements.craftValue.textContent = getCraftsmanship();
  elements.confidenceValue.textContent = getConfidence();
  elements.rankValue.textContent = rank.name;
  elements.levelValue.textContent = rank.level;
  elements.xpValue.textContent = `${state.xp} XP`;
  elements.clientRepValue.textContent = formatReputation(state.reputation.clients);
  elements.coworkerRepValue.textContent = formatReputation(state.reputation.coworkers);
  elements.managementRepValue.textContent = formatReputation(state.reputation.management);
  elements.skillList.replaceChildren(...getSkillDefinitions().map((skill) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${skill.name} ${getSkillValue(skill.id)}</strong><small>${skill.branch}</small>`;
    return li;
  }));
  elements.carryCard.textContent = hasCarriedItems()
    ? `${getCarriedLabels().join(" + ")} (${state.carry.length}/${getCarryCapacity()})`
    : `Nothing (0/${getCarryCapacity()})`;
  elements.toolList.replaceChildren(...state.tools.map((toolId) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${content.tools[toolId].name}</strong><small>${getToolEffectText(content.tools[toolId])}</small>`;
    return li;
  }));
  elements.vehicleCard.innerHTML = `
    <strong>${vehicle.name}</strong>
    <span>Cargo: ${state.loaded.length}/${vehicle.cargoCapacity}</span>
    <span>Organization: ${vehicle.organization}</span>
    <small>${vehicle.comfort}</small>
  `;
}

function renderLog() {
  elements.fieldLog.replaceChildren(...state.log.map((message) => {
    const li = document.createElement("li");
    li.textContent = message;
    return li;
  }));
}

function render() {
  if (!state.sceneId) return;
  const scene = content.scenes[state.sceneId];
  elements.locationTitle.textContent = scene.name;
  elements.sceneKicker.textContent = scene.kicker;
  elements.sceneName.textContent = scene.name;
  elements.clock.textContent = state.clock;
  const serviceActive = state.sceneId === "serviceOffice";
  const surveyActive = state.sceneId === "universitySurvey";
  const commissioningActive = state.sceneId === "southPhillyCommissioning";
  const secureAccessActive = state.sceneId === "navyYardAccess";
  const callbackCleanupActive = state.sceneId === "warrantyReturn";
  const handoffActive = state.sceneId === "executiveHandoff";
  const systemsActive = state.sceneId === "systemsService";
  const travelActive = state.flags.systemsComplete && !state.flags.travelComplete;
  const travelSummaryPending = state.flags.travelComplete && !state.flags.prototypeSummaryViewed;
  const warehouseActive = state.flags.warehouseStarted && !state.flags.warehouseComplete;
  const activeDispatch = travelActive || travelSummaryPending
    ? content.travelDispatch
    : systemsActive || (state.flags.systemsStarted && !state.flags.systemsComplete) || (state.flags.handoffComplete && !state.flags.systemsComplete)
    ? content.systemsDispatch
    : handoffActive || (state.flags.handoffStarted && !state.flags.handoffComplete) || (state.flags.secureAccessComplete && (state.flags.callbackCleanupComplete || getUnresolvedCallbackCount() === 0) && !state.flags.handoffComplete)
    ? content.handoffDispatch
    : callbackCleanupActive || state.flags.callbackCleanupStarted || state.flags.callbackCleanupComplete || (state.flags.secureAccessComplete && !state.flags.callbackCleanupComplete && getUnresolvedCallbackCount() > 0)
    ? content.callbackCleanupDispatch
    : secureAccessActive || state.flags.secureAccessStarted || state.flags.secureAccessComplete || (state.flags.warehouseComplete && !state.flags.secureAccessComplete)
    ? content.secureAccessDispatch
    : state.flags.warehouseStarted || state.flags.warehouseComplete
    ? content.warehouseDispatch
    : commissioningActive || state.flags.commissioningStarted || state.flags.commissioningComplete
      ? content.commissioningDispatch
      : surveyActive || state.flags.surveyStarted || state.flags.surveyComplete
      ? content.surveyDispatch
      : serviceActive || state.flags.serviceStarted || state.flags.serviceComplete
      ? content.serviceDispatch
      : { title: "Two Quick Carts", summary: "Build two mobile video conferencing carts at a Center City East office." };
  elements.jobStatus.textContent = warehouseActive
    ? "WAREHOUSE RUN"
    : travelActive
      ? "TRAVEL COST"
    : systemsActive
      ? "SYSTEMS SERVICE"
    : handoffActive
      ? "CLIENT HANDOFF"
    : callbackCleanupActive
      ? "WARRANTY RETURN"
    : secureAccessActive
      ? "SECURE ACCESS"
      : commissioningActive
      ? "COMMISSIONING"
      : surveyActive
      ? "SITE SURVEY"
      : serviceActive
      ? "SERVICE CALL"
      : state.flags.secureAccessComplete
        ? "DISPATCH COMPLETE"
        : state.flags.warehouseComplete
          ? "SHOP HUB"
        : state.flags.commissioningComplete
          ? "SHOP HUB"
      : state.flags.finished
        ? "SHOP HUB"
        : "FIRST DAY";
  elements.dispatchTitle.textContent = activeDispatch.title;
  elements.dispatchSummary.textContent = activeDispatch.summary;
  elements.objective.textContent = getObjective();
  elements.taskCopy.textContent = getObjective();
  renderDecor();
  renderPlayer();
  renderNearby();
  renderHud();
  renderLog();
  saveGame();
}

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (["arrowleft", "arrowright", "arrowup", "arrowdown", "w", "a", "s", "d", "e", " "].includes(key)) {
    event.preventDefault();
  }
  keys.add(key);
  if ((key === "e" || key === " ") && !event.repeat) interact();
  if (!event.repeat && ["arrowleft", "arrowright", "arrowup", "arrowdown", "w", "a", "s", "d"].includes(key)) {
    movePlayer();
  }
});

document.addEventListener("keyup", (event) => keys.delete(event.key.toLowerCase()));
elements.interactButton.addEventListener("click", interact);
elements.continueButton.addEventListener("click", continueGame);
elements.newGameButton.addEventListener("click", promptNewCareer);
elements.clearSaveButton.addEventListener("click", promptClearSavedGame);
elements.selectionBackButton.addEventListener("click", showTitleScreen);
elements.menuButton.addEventListener("click", showTitleScreen);
setInterval(movePlayer, 16);

renderSelection();
showTitleScreen();
