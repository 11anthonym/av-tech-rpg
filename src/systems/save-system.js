// Save helpers own local-storage persistence, defensive migration, and continue/clear flows.
// They depend on app.js globals and load before route, portal, objective, and job-card helpers.
function getSavedGame() {
  try {
    return migrateSavedGame(JSON.parse(localStorage.getItem(SAVE_KEY)));
  } catch {
    return null;
  }
}

function markRouteHistory(flags, routeId, traveled = true) {
  if (!traveled) return;
  flags.routeHistory ||= {};
  flags.routeHistory[routeId] ||= 1;
}

function migrateSavedRouteHistory(savedGame, flags) {
  const centerCityAreaIds = new Set(["centerCityGarage", "centerCityLobby", "centerCityConferenceRoom"]);
  const currentArea = getWorldAreaByScene(savedGame.sceneId);
  const routeMilestones = [
    ["conshohockenService", flags.serviceStarted || flags.serviceComplete || savedGame.sceneId === "serviceOffice"],
    ["universitySurvey", flags.surveyStarted || flags.surveyComplete || savedGame.sceneId === "universitySurvey"],
    ["southPhillyCommissioning", flags.commissioningStarted || flags.commissioningComplete || savedGame.sceneId === "southPhillyCommissioning"],
    ["navyYardAccess", flags.secureAccessStarted || flags.secureAccessComplete || savedGame.sceneId === "navyYardAccess"],
    ["warrantyReturn", flags.callbackCleanupStarted || flags.callbackCleanupComplete || savedGame.sceneId === "warrantyReturn"],
    ["executiveHandoff", flags.handoffStarted || flags.handoffComplete || savedGame.sceneId === "executiveHandoff"],
    ["systemsService", flags.systemsStarted || flags.systemsComplete || savedGame.sceneId === "systemsService"],
    ["burlingtonRetrofitWalkdown", flags.retrofitWalkdownStarted || flags.retrofitWalkdownComplete || savedGame.sceneId === "burlingtonRetrofitWalkdown"],
  ];
  markRouteHistory(flags, "centerCityTutorial", flags.finished || flags.centerCityEquipmentDelivered || centerCityAreaIds.has(currentArea?.id));
  routeMilestones.forEach(([routeId, traveled]) => markRouteHistory(flags, routeId, traveled));
  flags.routeChoiceHistory ||= {};
}

function getRetrofitInstallBranchIdFromFlags(flags = {}) {
  if (!flags.retrofitWalkdownComplete) return "pending";
  const approach = flags.retrofitWalkdownApproach;
  const partialWarning = Boolean(flags.retrofitInstallPartialWarning
    || (approach === "document" && flags.retrofitWalkdownChecksStrained && !flags.retrofitInstallProtected));
  if (partialWarning) return "partial";
  if (flags.retrofitInstallProtected || approach === "scope" || approach === "document") return "protected";
  if (flags.retrofitInstallRisk || approach === "accept") return "risk";
  return "pending";
}

function normalizeRetrofitInstallFlags(flags = {}) {
  const branchId = getRetrofitInstallBranchIdFromFlags(flags);
  if (branchId === "pending") return;
  flags.retrofitInstallBranch = branchId;
  flags.retrofitInstallPartialWarning = branchId === "partial";
  flags.retrofitInstallProtected = branchId === "protected";
  flags.retrofitInstallRisk = branchId === "partial" || branchId === "risk";
}

function migrateSurveyConsequenceFlags(flags = {}) {
  if (!flags.surveyComplete || flags.surveyApproach !== "trust") return;
  flags.returnTripRisks ||= {};
  flags.resolvedReturnTripRisks ||= {};
  if (flags.returnTripRisks.universitySurveyAccessPressure || flags.resolvedReturnTripRisks.universitySurveyAccessPressure) return;
  flags.surveyAccessPressureInherited = true;
  flags.returnTripRisks.universitySurveyAccessPressure = {
    status: "open",
    source: content.surveyDispatch?.title || "University City Site Survey",
    cause: "The quote was trusted even though the elevator and hallway path did not match the display size.",
    detail: "University City access pressure is still open. Future install planning may inherit a cleaner-looking quote than the site deserves.",
    affects: "future University City install planning and classroom display delivery",
  };
}

function normalizeServiceDiagnosticEvidenceEntries(entries = []) {
  const validIds = new Set((content.serviceDispatch?.diagnosticEvidence || []).map((evidence) => evidence.id));
  const seen = new Set();
  return Array.isArray(entries)
    ? entries
      .map((entry) => typeof entry === "string" ? { id: entry, source: "Saved room finding", clock: "" } : entry)
      .filter((entry) => {
        if (!entry || !validIds.has(entry.id) || seen.has(entry.id)) return false;
        seen.add(entry.id);
        return true;
      })
      .map((entry) => ({
        id: entry.id,
        source: entry.source || "Saved room finding",
        clock: entry.clock || "",
      }))
    : [];
}

function normalizeServiceTimedActionEntries(entries = []) {
  const seen = new Set();
  return Array.isArray(entries)
    ? entries
      .filter((entry) => {
        if (!entry || typeof entry.id !== "string" || !entry.id || seen.has(entry.id)) return false;
        seen.add(entry.id);
        return true;
      })
      .map((entry) => ({
        id: entry.id,
        minutes: Math.max(0, Math.min(240, Number(entry.minutes) || 0)),
        label: entry.label || "Saved service work",
        clockBefore: entry.clockBefore || "",
        clockAfter: entry.clockAfter || "",
      }))
      .slice(0, 50)
    : [];
}

function migrateServiceDiagnosticEvidence(flags = {}) {
  const entries = normalizeServiceDiagnosticEvidenceEntries(flags.serviceDiagnosticEvidence);
  const validRepairMethodIds = new Set((content.serviceDispatch?.repairApproaches || []).map((approach) => approach.id));
  if (flags.serviceClientContext && !entries.some((entry) => entry.id === "client-symptom-timeline")) {
    entries.push({ id: "client-symptom-timeline", source: "Saved client context", clock: "" });
  }
  if (flags.serviceInspected && !entries.some((entry) => entry.id === "display-failure-pattern")) {
    entries.push({ id: "display-failure-pattern", source: "Saved display inspection", clock: "" });
  }
  if (flags.serviceApproach === "verify" && !entries.some((entry) => entry.id === "inline-coupler-path")) {
    entries.push({ id: "inline-coupler-path", source: "Saved signal-path verification", clock: "" });
  }
  if (flags.serviceRepairMethod && !validRepairMethodIds.has(flags.serviceRepairMethod)) delete flags.serviceRepairMethod;
  if (!flags.serviceRepairMethod && flags.serviceApproach === "verify") flags.serviceRepairMethod = "verify-path";
  if (!flags.serviceRepairMethod && flags.serviceApproach === "rush") flags.serviceRepairMethod = "ticket-swap";
  flags.serviceDiagnosticEvidence = entries;
  flags.serviceTimedActions = normalizeServiceTimedActionEntries(flags.serviceTimedActions);
  const extension = Number(flags.serviceAppointmentExtensionMinutes) || 0;
  if (flags.serviceRepairMethod === "negotiate-verification-window" && extension > 0) {
    flags.serviceAppointmentExtensionMinutes = Math.min(60, extension);
  } else delete flags.serviceAppointmentExtensionMinutes;
}

function migrateSavedGame(savedGame) {
  if (!savedGame || typeof savedGame !== "object") return null;
  const flags = { ...(savedGame.flags || {}) };
  const migrated = {
    ...savedGame,
    version: SAVE_VERSION,
    flags,
    tools: savedGame.tools || [],
    carry: normalizeCarry(savedGame.carry),
    loaded: savedGame.loaded || [],
    delivered: savedGame.delivered || [],
    assembled: savedGame.assembled || [],
    serviceDelivered: savedGame.serviceDelivered || [],
    serviceInstalled: savedGame.serviceInstalled || [],
    surveyInspections: savedGame.surveyInspections || [],
    commissioningChecks: savedGame.commissioningChecks || [],
    warehouseChecks: savedGame.warehouseChecks || [],
    secureAccessChecks: savedGame.secureAccessChecks || [],
    secureAccessTaskChecks: savedGame.secureAccessTaskChecks || [],
    callbackCleanupChecks: savedGame.callbackCleanupChecks || [],
    handoffChecks: savedGame.handoffChecks || [],
    systemsChecks: savedGame.systemsChecks || [],
    retrofitWalkdownChecks: savedGame.retrofitWalkdownChecks || [],
    retrofitInstallChecks: savedGame.retrofitInstallChecks || [],
    vehicleId: savedGame.vehicleId || content.world?.defaultVehicleId || "van3",
    training: savedGame.training || [],
    log: savedGame.log || [],
  };
  if (flags.finished) flags.tutorialPaid = true;
  if (flags.finished) flags.tutorialProgressAwarded = true;
  if ((migrated.delivered || []).length === content.tutorial.garageUnload.length) flags.centerCityEquipmentDelivered = true;
  if (flags.serviceComplete) flags.serviceProgressAwarded = true;
  if (flags.conshohockenFollowupComplete) flags.conshohockenFollowupProgressAwarded = true;
  if (flags.surveyComplete) flags.surveyProgressAwarded = true;
  if (flags.commissioningComplete) flags.commissioningProgressAwarded = true;
  if (flags.warehouseComplete) flags.warehouseProgressAwarded = true;
  if (flags.secureAccessComplete) flags.secureAccessProgressAwarded = true;
  if (flags.callbackCleanupComplete) flags.callbackCleanupProgressAwarded = true;
  if (flags.handoffComplete) flags.handoffProgressAwarded = true;
  if (flags.systemsComplete) flags.systemsProgressAwarded = true;
  if (flags.travelComplete) flags.travelProgressAwarded = true;
  if (flags.retrofitWalkdownComplete) flags.retrofitWalkdownProgressAwarded = true;
  if (flags.retrofitInstallComplete) flags.retrofitInstallProgressAwarded = true;
  if (flags.retrofitInstallComplete && flags.prototypeSummaryViewed && flags.retrofitInstallDebriefed === undefined) {
    flags.retrofitInstallDebriefed = true;
  }
  normalizeRetrofitInstallFlags(flags);
  migrateSurveyConsequenceFlags(flags);
  migrateServiceDiagnosticEvidence(flags);
  if (flags.serviceComplete && flags.serviceApproach !== "verify" && flags.serviceCallbackResolved === undefined) {
    flags.serviceCallbackPending = true;
  }
  flags.jobSiteCloseoutHistory = Array.isArray(flags.jobSiteCloseoutHistory)
    ? flags.jobSiteCloseoutHistory.slice(0, 5)
    : flags.lastJobSiteCloseoutSummary
    ? [flags.lastJobSiteCloseoutSummary]
    : [];
  if (!flags.lastJobSiteCloseoutSummary && flags.jobSiteCloseoutHistory[0]) {
    flags.lastJobSiteCloseoutSummary = flags.jobSiteCloseoutHistory[0];
  }
  flags.shiftHistory = Array.isArray(flags.shiftHistory)
    ? flags.shiftHistory.slice(0, SHIFT_HISTORY_LIMIT)
    : [];
  flags.joshHelpHistory = getMigratedJoshHelpHistory(flags);
  flags.joshCrewSupportAvailable = Boolean(flags.joshCrewSupportAvailable);
  flags.joshCrewSupportUsed = Boolean(flags.joshCrewSupportUsed);
  flags.joshCrewSupportSource = flags.joshCrewSupportSource || "";
  if (!flags.joshCrewSupportAvailable) delete flags.joshCrewSupportLastUsed;
  if (!flags.currentAreaId) {
    flags.currentAreaId = getWorldAreaByScene(savedGame.sceneId)?.id || content.world?.homeAreaId || "shop";
  }
  migrateSavedRouteHistory(migrated, flags);
  return migrated;
}

function getMigratedJoshHelpHistory(flags) {
  if (Array.isArray(flags.joshHelpHistory)) {
    return flags.joshHelpHistory.slice(0, JOSH_HELP_HISTORY_LIMIT);
  }
  const previousHelpShift = flags.shiftHistory.find((entry) => entry?.helpJoshTask);
  if (flags.lastHelpJoshScenario?.taskLabel) {
    return [{
      scenarioId: flags.lastHelpJoshScenario.id || "",
      taskLabel: flags.lastHelpJoshScenario.taskLabel,
      source: flags.lastHelpJoshScenario.source || previousHelpShift?.source || "Shift",
      shiftNumber: previousHelpShift?.shiftNumber || 0,
      clock: previousHelpShift?.clockBefore || "",
      resolvedCallback: Boolean(flags.lastHelpJoshScenario.resolvedCallback),
    }];
  }
  if (previousHelpShift) {
    return [{
      scenarioId: "",
      taskLabel: previousHelpShift.helpJoshTask,
      source: previousHelpShift.source || "Shift",
      shiftNumber: previousHelpShift.shiftNumber || 0,
      clock: previousHelpShift.clockBefore || "",
      resolvedCallback: false,
    }];
  }
  return [];
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
    + (savedGame.flags?.conshohockenFollowupComplete ? (savedGame.flags.conshohockenFollowupApproach === "label" ? 30 : 20) : 0)
    + (savedGame.flags?.surveyComplete ? (savedGame.flags.surveyApproach === "pushback" ? 60 : savedGame.flags.surveyApproach === "document" ? 55 : 35) : 0)
    + (savedGame.flags?.commissioningComplete ? (savedGame.flags.commissioningApproach === "craft" ? 65 : savedGame.flags.commissioningApproach === "repair" ? 60 : 40) : 0)
    + (savedGame.flags?.warehouseComplete ? (savedGame.flags.warehouseApproach === "label" ? 50 : 35) : 0)
    + (savedGame.flags?.secureAccessComplete ? (savedGame.flags.secureAccessApproach === "pushback" ? 60 : savedGame.flags.secureAccessApproach === "document" ? 55 : 35) : 0)
    + (savedGame.flags?.callbackCleanupComplete ? (savedGame.flags.callbackCleanupApproach === "craft" ? 65 : savedGame.flags.callbackCleanupApproach === "root" ? 55 : 35) : 0)
    + (savedGame.flags?.handoffComplete ? (savedGame.flags.handoffApproach === "cheat" ? 60 : savedGame.flags.handoffApproach === "patient" ? 50 : 30) : 0)
    + (savedGame.flags?.systemsComplete ? (savedGame.flags.systemsApproach === "scope" ? 65 : savedGame.flags.systemsApproach === "document" ? 55 : 35) : 0)
    + (savedGame.flags?.travelComplete ? (savedGame.flags.travelApproach === "pushback" ? 45 : savedGame.flags.travelApproach === "receipt" ? 35 : 25) : 0)
    + (savedGame.flags?.retrofitWalkdownComplete ? (savedGame.flags.retrofitWalkdownApproach === "scope" ? 65 : savedGame.flags.retrofitWalkdownApproach === "document" ? 55 : 35) : 0)
    + (savedGame.flags?.retrofitInstallComplete ? (savedGame.flags.retrofitInstallApproach === "record" ? 65 : 40) : 0);
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
  if (savedGame.flags?.conshohockenFollowupComplete) {
    if (savedGame.flags.conshohockenFollowupApproach === "label") {
      reputation.clients += 1;
      reputation.coworkers += 1;
      reputation.management -= 1;
    } else {
      reputation.management += 1;
    }
  }
  if (savedGame.flags?.retrofitWalkdownComplete) {
    if (savedGame.flags.retrofitWalkdownApproach === "accept") {
      reputation.management += 1;
    } else {
      reputation.clients += savedGame.flags.retrofitWalkdownApproach === "scope" ? 2 : 1;
      reputation.coworkers += 1;
      reputation.management += savedGame.flags.retrofitWalkdownApproach === "scope" ? -2 : -1;
    }
  }
  if (savedGame.flags?.retrofitInstallComplete) {
    if (savedGame.flags.retrofitInstallApproach === "record") {
      reputation.clients += 1;
      reputation.coworkers += savedGame.flags.retrofitInstallRiskResolved ? 2 : 1;
      reputation.management -= savedGame.flags.retrofitInstallRiskResolved ? 1 : 0;
    } else {
      reputation.management += 1;
      if (savedGame.flags.retrofitInstallRiskInherited) reputation.coworkers -= 1;
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
    retrofitWalkdownsCompleted: 0,
    retrofitRisksDocumented: 0,
    retrofitScopePushbacks: 0,
    retrofitRisksAccepted: 0,
    retrofitInstallsCompleted: 0,
    retrofitPathwaysInstalled: 0,
    retrofitInstallRisksResolved: 0,
    retrofitInstallRisksInherited: 0,
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
    exhaustionIncidents: 0,
    exhaustionMistakes: 0,
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
  if (savedGame.flags?.conshohockenFollowupComplete && savedGame.flags.conshohockenFollowupApproach === "label") {
    stats.documentedTaskRisks += 1;
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
  if (savedGame.flags?.retrofitWalkdownComplete) {
    stats.retrofitWalkdownsCompleted += 1;
    if (savedGame.flags.retrofitWalkdownApproach === "scope") stats.retrofitScopePushbacks += 1;
    else if (savedGame.flags.retrofitWalkdownApproach === "document") stats.retrofitRisksDocumented += 1;
    else stats.retrofitRisksAccepted += 1;
  }
  if (savedGame.flags?.retrofitInstallComplete) {
    stats.retrofitInstallsCompleted += 1;
    stats.retrofitPathwaysInstalled += 1;
    if (savedGame.flags.retrofitInstallRiskResolved) stats.retrofitInstallRisksResolved += 1;
    if (savedGame.flags.retrofitInstallRiskInherited) stats.retrofitInstallRisksInherited += 1;
  }
  return stats;
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
    version: SAVE_VERSION,
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
    secureAccessTaskChecks: state.secureAccessTaskChecks,
    callbackCleanupChecks: state.callbackCleanupChecks,
    handoffChecks: state.handoffChecks,
    systemsChecks: state.systemsChecks,
    retrofitWalkdownChecks: state.retrofitWalkdownChecks,
    retrofitInstallChecks: state.retrofitInstallChecks,
    energy: state.energy,
    burnout: state.burnout,
    cash: state.cash,
    xp: state.xp,
    jobsCompleted: state.jobsCompleted,
    vehicleId: state.vehicleId,
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

function saveGame() {
  if (!state.technician || !state.sceneId) return;
  localStorage.setItem(SAVE_KEY, JSON.stringify(serializeGame()));
  elements.saveStatus.classList.remove("hidden");
  elements.saveStatus.textContent = "AUTOSAVED";
}

function resetRuntimeState() {
  Object.assign(state, createInitialState());
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
  if ((savedGame.delivered || []).length === content.tutorial.garageUnload.length) flags.centerCityEquipmentDelivered = true;
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
    secureAccessTaskChecks: savedGame.secureAccessTaskChecks || [],
    callbackCleanupChecks: savedGame.callbackCleanupChecks || [],
    handoffChecks: savedGame.handoffChecks || [],
    systemsChecks: savedGame.systemsChecks || [],
    retrofitWalkdownChecks: savedGame.retrofitWalkdownChecks || [],
    retrofitInstallChecks: savedGame.retrofitInstallChecks || [],
    cash: migratedCash,
    xp: migratedXp,
    jobsCompleted: savedGame.jobsCompleted ?? (flags.finished ? 1 : 0) + (flags.serviceComplete ? 1 : 0) + (flags.conshohockenFollowupComplete ? 1 : 0) + (flags.surveyComplete ? 1 : 0) + (flags.commissioningComplete ? 1 : 0) + (flags.warehouseComplete ? 1 : 0) + (flags.secureAccessComplete ? 1 : 0) + (flags.callbackCleanupComplete ? 1 : 0) + (flags.handoffComplete ? 1 : 0) + (flags.systemsComplete ? 1 : 0) + (flags.travelComplete ? 1 : 0) + (flags.retrofitWalkdownComplete ? 1 : 0) + (flags.retrofitInstallComplete ? 1 : 0),
    vehicleId: savedGame.vehicleId || content.world?.defaultVehicleId || "van3",
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
  closeModal();
  enterScene(state.sceneId, state.player);
  resumeRequiredPrompt();
}
