const content = window.GAME_CONTENT;
const keys = new Set();
const PLAYER_SPEED = 8;
const MIN_PLAYER_SPEED = 4;
const LOW_ENERGY_SPEED_THRESHOLD = 0.25;
const HIGH_BURNOUT_SPEED_THRESHOLD = 4;
const SAVE_KEY = "av-tech-rpg-save-v1";
const SAVE_VERSION = 23;
const WEEKDAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const STAY_LATE_PREP_ENERGY_COST = 32;
const HELP_JOSH_ENERGY_COST = 30;
const STAY_LATE_BURNOUT_GAIN = 1;
const CHERRY_HILL_TOLL_COST = 6;
const DEBUG_MODE = new URLSearchParams(window.location.search).has("debug");
const EXHAUSTION_DEBT_PER_BURNOUT = 10;
const MIN_OVERNIGHT_RECOVERY = 28;
const MIN_STAYED_LATE_RECOVERY = 16;
const STAY_LATE_NEXT_MORNING_CAP_LOSS = 20;
const CONSECUTIVE_LATE_NIGHT_CAP_LOSS = 10;
const MIN_STAY_LATE_NEXT_MORNING_ENERGY = 30;
const EXHAUSTION_PRESSURE_PER_INCIDENT = 8;
const EXHAUSTION_NEXT_MORNING_CAP_LOSS = 40;
const EXHAUSTION_INCIDENT_CAP_LOSS = 8;
const MIN_EXHAUSTION_NEXT_MORNING_ENERGY = 20;
const MAX_EXHAUSTION_SKILL_PENALTY = 3;

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
    secureAccessTaskChecks: [],
    callbackCleanupChecks: [],
    handoffChecks: [],
    systemsChecks: [],
    retrofitWalkdownChecks: [],
    retrofitInstallChecks: [],
    energy: 100,
    burnout: 0,
    cash: 0,
    xp: 0,
    jobsCompleted: 0,
    vehicleId: "van3",
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
      retrofitWalkdownsCompleted: 0,
      retrofitRisksDocumented: 0,
      retrofitScopePushbacks: 0,
      retrofitRisksAccepted: 0,
      retrofitInstallsCompleted: 0,
      retrofitPathwaysInstalled: 0,
      retrofitInstallRisksResolved: 0,
      retrofitInstallRisksInherited: 0,
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
      exhaustionIncidents: 0,
      exhaustionMistakes: 0,
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
  if (flags.serviceComplete && flags.serviceApproach !== "verify" && flags.serviceCallbackResolved === undefined) {
    flags.serviceCallbackPending = true;
  }
  if (!flags.currentAreaId) {
    flags.currentAreaId = getWorldAreaByScene(savedGame.sceneId)?.id || content.world?.homeAreaId || "shop";
  }
  migrateSavedRouteHistory(migrated, flags);
  return migrated;
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
  state.flags.returnTripRisks[riskId] = { status: "open", ...detail };
  if (state.flags.resolvedReturnTripRisks?.[riskId]) delete state.flags.resolvedReturnTripRisks[riskId];
}

function resolveReturnTripRisk(riskId, resolution = {}) {
  const existing = state.flags.returnTripRisks?.[riskId];
  if (!existing) return;
  delete state.flags.returnTripRisks[riskId];
  state.flags.resolvedReturnTripRisks ||= {};
  state.flags.resolvedReturnTripRisks[riskId] = {
    source: resolution.source || existing.source || "Return-trip risk",
    detail: existing.detail || "A weak closeout was carried on the ledger.",
    resolution: resolution.resolution || "Resolved by later field work.",
    resolvedAt: state.clock,
    status: "resolved",
  };
}

function getReturnTripRiskEntries() {
  return Object.entries(state.flags.returnTripRisks || {})
    .map(([id, risk]) => ({ id, status: risk.status || "open", ...risk }));
}

function getResolvedReturnTripRiskEntries() {
  return Object.entries(state.flags.resolvedReturnTripRisks || {})
    .map(([id, risk]) => ({ id, status: "resolved", ...risk }));
}

function getReturnTripRiskAffectedWork(riskId) {
  if (riskId === "usedTemporaryAdapterPermanently") return "future Center City service or warranty work";
  if (riskId === "conshohockenServiceRoomPressure") return "future Conshohocken service and Josh callback cleanup";
  if (riskId === "navyYardRackUpdate") return "future Navy Yard support and warranty routing";
  if (riskId === "southPhillySpeakerTermination") return "commissioning follow-up and warranty return pressure";
  if (riskId === "systemsQuickReboot") return "future systems service or warranty return pressure";
  if (riskId === "burlington-retrofit-install") return "Burlington retrofit install and future service";
  if (riskId?.startsWith("exhaustion-")) return "the next return trip tied to this tired closeout";
  return "future dispatch-board routing";
}

function getConsequenceStatusLabel(status = "open") {
  if (status === "resolved") return "Resolved";
  if (status === "inherited") return "Inherited";
  if (status === "documented") return "Documented";
  if (status === "controlled") return "Controlled";
  if (status === "protected") return "Protected";
  return "Open";
}

function getConsequenceLedgerEntries({ includeResolved = false } = {}) {
  const entries = [];
  const openCallbacks = getUnresolvedCallbackCount();
  if (openCallbacks > 0) {
    entries.push({
      id: "callback-debt",
      source: "Callback ledger",
      cause: `${openCallbacks} unresolved callback${openCallbacks === 1 ? "" : "s"} remain after closeout choices.`,
      status: "open",
      affects: "dispatch routing, access friction, and warranty return pressure",
      detail: "Fast or strained closeouts can stay on the board until a later job resolves them.",
    });
  }
  getReturnTripRiskEntries().forEach((risk) => {
    entries.push({
      id: risk.id,
      source: risk.source || "Return-trip risk",
      cause: risk.cause || risk.detail || "A weak closeout is still on the ledger.",
      status: risk.status || "open",
      affects: risk.affects || getReturnTripRiskAffectedWork(risk.id),
      detail: risk.detail || "A weak closeout is still on the ledger.",
    });
  });
  if (includeResolved) {
    getResolvedReturnTripRiskEntries().forEach((risk) => {
      entries.push({
        id: risk.id,
        source: risk.source || "Resolved return-trip risk",
        cause: risk.detail || "A prior risk was cleared by later field work.",
        status: "resolved",
        affects: risk.affects || getReturnTripRiskAffectedWork(risk.id),
        detail: risk.resolution || "Resolved by later field work.",
      });
    });
    const hasResolvedBurlingtonRisk = Boolean(state.flags.resolvedReturnTripRisks?.["burlington-retrofit-install"]);
    if (state.flags.retrofitInstallRiskResolved && !hasResolvedBurlingtonRisk) {
      entries.push({
        id: "retrofit-install-risk-resolved",
        source: "Burlington County Retrofit Install",
        cause: "Inherited pathway risk from the walkdown was handled during install closeout.",
        status: "resolved",
        affects: "Burlington future service",
        detail: "Record/as-built notes cleared the inherited pathway risk.",
      });
    } else if (state.flags.retrofitInstallRiskInherited) {
      entries.push({
        id: "retrofit-install-risk-inherited",
        source: "Burlington County Retrofit Install",
        cause: "Install closeout left the pathway record weak.",
        status: "inherited",
        affects: "Burlington future service",
        detail: "Future service inherits a thinner record of the actual pathway.",
      });
    }
    if (state.flags.commissioningRiskDocumented && !state.flags.commissioningCallbackRiskAdded) {
      entries.push({
        id: "commissioning-risk-controlled",
        source: content.commissioningDispatch.title,
        cause: "Speaker-path risk was documented before it became a surprise callback.",
        status: "controlled",
        affects: "South Philadelphia commissioning follow-up",
        detail: "Closeout made the technical risk visible instead of hiding it.",
      });
    }
    if (state.flags.secureAccessComplete && state.flags.secureAccessTaskStrained && state.flags.secureAccessApproach !== "absorb") {
      entries.push({
        id: "secure-access-task-documented",
        source: content.secureAccessDispatch.title,
        cause: "A strained rack task was documented in closeout.",
        status: "documented",
        affects: getReturnTripRiskAffectedWork("navyYardRackUpdate"),
        detail: "Documentation keeps the rack strain from becoming hidden return-trip debt.",
      });
    }
    if (state.flags.systemsComplete && state.flags.systemsApproach !== "reboot") {
      entries.push({
        id: "systems-risk-documented",
        source: content.systemsDispatch.title,
        cause: "The room-offline cause was documented instead of flattened into a reboot.",
        status: "documented",
        affects: getReturnTripRiskAffectedWork("systemsQuickReboot"),
        detail: "Future service starts from the mismatch note instead of the old ticket.",
      });
    }
  }
  return entries;
}

function getConsequenceLedgerMarkup({ includeResolved = false, emptyMessage = "No consequence ledger entries are active right now." } = {}) {
  const entries = getConsequenceLedgerEntries({ includeResolved });
  if (!entries.length) return `<p class="muted">${emptyMessage}</p>`;
  return `
    <ul class="modal-list">
      ${entries.map((entry) => `
        <li>
          <strong>${escapeHtml(`${getConsequenceStatusLabel(entry.status)} - ${entry.source}`)}</strong>
          <span>${escapeHtml(`Cause: ${entry.cause} Affects: ${entry.affects}. Result: ${entry.detail}`)}</span>
        </li>
      `).join("")}
    </ul>
  `;
}

function getCloseoutConsequenceMarkup(entries = []) {
  if (!entries.length) return "";
  return `
    <p><strong>Closeout consequence:</strong></p>
    <ul class="modal-list">
      ${entries.map((entry) => `
        <li>
          <strong>${escapeHtml(`${getConsequenceStatusLabel(entry.status)} - ${entry.source}`)}</strong>
          <span>${escapeHtml(`Because: ${entry.cause} Future effect: ${entry.affects}. ${entry.detail}`)}</span>
        </li>
      `).join("")}
    </ul>
  `;
}

function normalizeCloseoutSummaryEntry(entry = {}) {
  return {
    id: entry.id || "",
    source: entry.source || "Closeout",
    status: entry.status || "documented",
    cause: entry.cause || entry.detail || "Closeout result saved.",
    affects: entry.affects || "future field work",
    detail: entry.detail || "The closeout result is saved.",
  };
}

function recordJobSiteCloseoutSummary({ source = "Current job", result = "", before = null, consequences = [] } = {}) {
  state.flags.lastJobSiteCloseoutSummary = {
    source,
    result,
    sceneId: state.sceneId,
    areaId: state.flags.currentAreaId || "",
    clock: state.clock,
    before: before || null,
    after: getTrackedStateSnapshot(),
    consequences: consequences.map(normalizeCloseoutSummaryEntry),
  };
}

function normalizeCloseoutSource(value = "") {
  return `${value}`.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function getReturnPortalSourceAliases(portal) {
  const aliases = [portal?.returnSource, portal?.label];
  const portalAliases = {
    centerCityConferenceRoomToShop: ["Two Quick Carts"],
    serviceOfficeToShop: [content.serviceDispatch?.title],
    conshohockenFollowupToShop: [content.followupDispatch?.title],
    universitySurveyToShop: [content.surveyDispatch?.title],
    southPhillyCommissioningToShop: [content.commissioningDispatch?.title],
    navyYardAccessToShop: [content.secureAccessDispatch?.title],
    warrantyReturnToShop: [content.callbackCleanupDispatch?.title],
    executiveHandoffToShop: [content.handoffDispatch?.title],
    systemsServiceToShop: [content.systemsDispatch?.title],
    burlingtonRetrofitWalkdownToShop: [content.retrofitWalkdownDispatch?.title],
    burlingtonRetrofitInstallToShop: ["Burlington County Retrofit Install"],
  };
  return [...aliases, ...(portalAliases[portal?.id] || [])]
    .filter(Boolean)
    .map(normalizeCloseoutSource)
    .filter(Boolean);
}

function isCloseoutSourceForPortal(source, portal) {
  const normalizedSource = normalizeCloseoutSource(source);
  if (!normalizedSource) return false;
  return getReturnPortalSourceAliases(portal).includes(normalizedSource);
}

function getLastJobSiteCloseoutSummaryForPortal(portal) {
  const summary = state.flags.lastJobSiteCloseoutSummary;
  if (!summary || !isCloseoutSourceForPortal(summary.source, portal)) return null;
  return summary;
}

function getReturnPortalResultFlagKey(portal) {
  return {
    centerCityConferenceRoomToShop: "finishChoice",
    serviceOfficeToShop: "serviceApproach",
    conshohockenFollowupToShop: "conshohockenFollowupApproach",
    universitySurveyToShop: "surveyApproach",
    southPhillyCommissioningToShop: "commissioningApproach",
    navyYardAccessToShop: "secureAccessApproach",
    warrantyReturnToShop: "callbackCleanupApproach",
    executiveHandoffToShop: "handoffApproach",
    systemsServiceToShop: "systemsApproach",
    burlingtonRetrofitWalkdownToShop: "retrofitWalkdownApproach",
    burlingtonRetrofitInstallToShop: "retrofitInstallApproach",
  }[portal?.id] || "";
}

function getReturnPortalSavedResultText(portal) {
  const flagKey = getReturnPortalResultFlagKey(portal);
  return flagKey ? getCompletedCloseoutPathResult(flagKey) : "";
}

function getConsequenceEntryKey(entry = {}) {
  return [
    entry.id || "",
    normalizeCloseoutSource(entry.source),
    entry.status || "",
    entry.detail || "",
  ].join("|");
}

function getReturnPortalCurrentConsequenceEntries(portal, summary) {
  const summaryEntries = (summary?.consequences || []).map(normalizeCloseoutSummaryEntry);
  if (summaryEntries.length) return summaryEntries;
  return getConsequenceLedgerEntries({ includeResolved: true })
    .filter((entry) => isCloseoutSourceForPortal(entry.source, portal))
    .map(normalizeCloseoutSummaryEntry);
}

function getReturnPortalOpenConsequenceEntries(currentEntries = []) {
  const currentKeys = new Set(currentEntries.map(getConsequenceEntryKey));
  return getConsequenceLedgerEntries()
    .map(normalizeCloseoutSummaryEntry)
    .filter((entry) => !currentKeys.has(getConsequenceEntryKey(entry)));
}

function getReturnPortalRiskSummaryText() {
  const callbackCount = getUnresolvedCallbackCount();
  const riskCount = getReturnTripRiskEntries().length;
  const parts = [
    callbackCount ? `${callbackCount} callback${callbackCount === 1 ? "" : "s"}` : "",
    riskCount ? `${riskCount} return-trip risk${riskCount === 1 ? "" : "s"}` : "",
  ].filter(Boolean);
  return parts.length ? `Carrying ${parts.join(" and ")} back to the shop` : "No open callback or return-trip risk";
}

function getReturnPortalNextStepText() {
  if (state.flags.serviceCallbackPending && !state.flags.serviceCallbackResolved) return "Return to the shop, close out the shift, then talk to Josh about the callback.";
  return "Return to the shop and close out the workday.";
}

function getDepartureConsequenceListMarkup(entries, emptyMessage) {
  if (!entries.length) return `<p class="muted">${escapeHtml(emptyMessage)}</p>`;
  return `
    <ul class="modal-list">
      ${entries.map((entry) => `
        <li>
          <strong>${escapeHtml(`${getConsequenceStatusLabel(entry.status)} - ${entry.source}`)}</strong>
          <span>${escapeHtml(`Because: ${entry.cause} Affects: ${entry.affects}. ${entry.detail}`)}</span>
        </li>
      `).join("")}
    </ul>
  `;
}

function getReturnPortalDepartureMarkup(portal) {
  if (portal?.kind !== "returnRoute") return "";
  const summary = getLastJobSiteCloseoutSummaryForPortal(portal);
  const currentEntries = getReturnPortalCurrentConsequenceEntries(portal, summary);
  const openEntries = getReturnPortalOpenConsequenceEntries(currentEntries);
  const resultText = summary?.result || getReturnPortalSavedResultText(portal) || "Closeout result saved";
  return `
    <h3>Before You Leave</h3>
    <div class="results-grid">
      <span>Closeout saved</span><strong>${escapeHtml(summary?.source || portal.returnSource || portal.label || "Current job")}</strong>
      <span>Result</span><strong>${escapeHtml(resultText)}</strong>
      <span>Risk remaining</span><strong>${escapeHtml(getReturnPortalRiskSummaryText())}</strong>
      <span>Next at shop</span><strong>${escapeHtml(getReturnPortalNextStepText())}</strong>
    </div>
    ${summary?.before ? `
      <h3>What Changed</h3>
      ${getTrackedStateDeltaMarkup(summary.before, summary.after || getTrackedStateSnapshot())}
    ` : ""}
    <h3>Current Closeout Effect</h3>
    ${getDepartureConsequenceListMarkup(currentEntries, "This closeout has no named callback or return-trip consequence recorded.")}
    <h3>Risk Carried Back</h3>
    ${getDepartureConsequenceListMarkup(openEntries, "No open callback or return-trip risk is leaving with you.")}
  `;
}

function getReturnTripRiskSummaryText(risk) {
  return `${risk.source || "Return-trip risk"}: ${risk.detail || "A weak closeout is still on the ledger."} Affects ${risk.affects || getReturnTripRiskAffectedWork(risk.id)}.`;
}

function getOpenReturnTripRiskSummary() {
  const risks = getReturnTripRiskEntries();
  if (!risks.length) return "";
  return risks.map(getReturnTripRiskSummaryText).join(" ");
}

function getReturnTripRiskRowsMarkup() {
  return getConsequenceLedgerEntries()
    .filter((entry) => entry.id !== "callback-debt")
    .map((entry) => `
      <li>
        <strong>${escapeHtml(`${getConsequenceStatusLabel(entry.status)} - ${entry.source}`)}</strong>
        <span>${escapeHtml(`Cause: ${entry.cause} Affects: ${entry.affects}. Result: ${entry.detail}`)}</span>
      </li>
    `).join("");
}

function getConsequenceRouteIds(entry) {
  if (!entry) return [];
  const routeMap = {
    "callback-debt": ["warrantyReturn", "conshohockenService"],
    usedTemporaryAdapterPermanently: ["centerCityTutorial"],
    conshohockenServiceRoomPressure: ["conshohockenService"],
    navyYardRackUpdate: ["navyYardAccess"],
    southPhillySpeakerTermination: ["southPhillyCommissioning", "warrantyReturn"],
    systemsQuickReboot: ["systemsService", "warrantyReturn"],
    "burlington-retrofit-install": ["burlingtonRetrofitWalkdown"],
    "retrofit-install-risk-inherited": ["burlingtonRetrofitWalkdown"],
    "retrofit-install-risk-resolved": ["burlingtonRetrofitWalkdown"],
  };
  if (routeMap[entry.id]) return routeMap[entry.id];
  if (entry.id?.startsWith("exhaustion-")) return [state.flags.lastRouteId || getCurrentDispatchRouteId()].filter(Boolean);
  return [];
}

function getConsequenceRouteImpactEntries({ includeResolved = false } = {}) {
  return getConsequenceLedgerEntries({ includeResolved })
    .flatMap((entry) => getConsequenceRouteIds(entry).map((routeId) => ({ ...entry, routeId })))
    .filter((entry) => getWorldRoute(entry.routeId));
}

function getRouteConsequenceImpactEntries(routeId, options = {}) {
  return getConsequenceRouteImpactEntries(options)
    .filter((entry) => entry.routeId === routeId);
}

function routeHasConsequencePressure(route) {
  return Boolean(route && getRouteConsequenceImpactEntries(route.id).length);
}

function getRouteConsequencePressureText(route) {
  const entries = route ? getRouteConsequenceImpactEntries(route.id) : [];
  if (!entries.length) return "";
  return entries.map((entry) => `${getConsequenceStatusLabel(entry.status)} ${entry.source}: ${entry.detail} Affects: ${entry.affects}.`).join(" ");
}

function getConsequenceRouteImpactMarkup() {
  const impacts = getConsequenceRouteImpactEntries();
  if (!impacts.length) return `<p class="muted">No open callback or return-trip pressure is attached to a mapped route right now.</p>`;
  return `
    <ul class="modal-list">
      ${impacts.map((entry) => {
        const route = getWorldRoute(entry.routeId);
        return `
          <li>
            <strong>${escapeHtml(`${route.toLabel} - ${entry.source}`)}</strong>
            <span>${escapeHtml(`${getConsequenceStatusLabel(entry.status)}. Cause: ${entry.cause} Affects: ${entry.affects}. Result: ${entry.detail}`)}</span>
          </li>
        `;
      }).join("")}
    </ul>
  `;
}

function showConsequenceReview() {
  showModal({
    kicker: "Consequence Ledger",
    title: "Callback And Return-Trip Pressure",
    body: `
      <h3>Active Consequences</h3>
      ${getConsequenceLedgerMarkup()}
      <h3>Affected Routes</h3>
      ${getConsequenceRouteImpactMarkup()}
      <p class="muted">These entries come from closeout choices, callback debt, exhaustion, and saved return-trip risks. They do not create new jobs by themselves, but they can change board routing, prep pressure, and future field work.</p>
    `,
    actions: [
      { label: "Open Regional Map", onClick: showRegionalMap },
      { label: "Back To Van", className: "secondary-button", onClick: showVehicleMenu },
      { label: "Close", className: "text-button", onClick: render },
    ],
  });
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

function getCurrentDispatchKey() {
  if (state.sceneId === "executiveHandoff") return "handoff";
  if (state.sceneId === "warrantyReturn") return "warranty";
  if (state.sceneId === "navyYardAccess") return "secureAccess";
  if (state.sceneId === "southPhillyCommissioning") return "commissioning";
  if (state.sceneId === "universitySurvey") return "survey";
  if (state.sceneId === "systemsService") return "systems";
  if (state.sceneId === "burlingtonRetrofitWalkdown") {
    return state.flags.retrofitInstallStarted ? "retrofitInstall" : "retrofitWalkdown";
  }
  if (state.sceneId === "serviceOffice") {
    return state.flags.conshohockenFollowupStarted ? "followup" : "service";
  }
  const entries = getDispatchBoardEntries();
  const boardEntry = getInProgressDispatchBoardEntry(entries)
    || getCurrentDispatchBoardEntry(entries)
    || getBlockedDispatchBoardEntry(entries)
    || getLastCompletedDispatchBoardEntry(entries);
  if (boardEntry) return getDispatchKeyForBoardEntry(boardEntry);
  if (state.flags.finished) return "service";
  return "tutorial";
}

function getDispatchKeyForBoardEntry(entry) {
  return {
    callbackCleanup: "warranty",
    travelCost: "travel",
    careerSnapshot: "retrofitInstall",
  }[entry?.id] || entry?.id || "tutorial";
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

function shouldOfferCallbackCleanupDispatch() {
  return state.flags.secureAccessComplete
    && !state.flags.handoffComplete
    && !state.flags.callbackCleanupComplete
    && getUnresolvedCallbackCount() > 0;
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
    getItemLabel(itemId)
  ));
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

function getItemLabel(itemId) {
  return content.tutorial.assembly.find((item) => item.id === itemId)?.label
    || content.serviceDispatch.swapItems.find((item) => item.id === itemId)?.label
    || itemId;
}

function getLoadedVehicleLabels() {
  return state.loaded.map(getItemLabel);
}

function getVehicleCargoSummary() {
  const labels = getLoadedVehicleLabels();
  return labels.length ? labels.join(", ") : "Nothing loaded";
}

function canLoadVehicleCargo() {
  return hasCarriedItems() && state.loaded.length + state.carry.length <= getVehicleCargoCapacity();
}

function loadCarriedItemsIntoVehicle() {
  if (!hasCarriedItems()) return notify("You are not carrying anything for the van.");
  if (!canLoadVehicleCargo()) return notify(`${getVehicleName()} does not have room for that load.`);
  const carriedLabels = getCarriedLabels();
  state.loaded.push(...state.carry);
  state.carry = [];
  state.flags.vehicleLoadHistory ||= {};
  state.flags.vehicleLoadHistory[getCurrentVehicleId()] = (state.flags.vehicleLoadHistory[getCurrentVehicleId()] || 0) + carriedLabels.length;
  addLog(`${carriedLabels.join(" and ")} loaded into ${getVehicleName()}.`);
  if (state.loaded.length === content.tutorial.shopLoad.length) {
    addLog(`${getVehicleName()} loaded. Supervisor is ready to leave for Center City East.`);
  }
  render();
}

function showVehicleCargo() {
  const vehicle = getCurrentVehicle();
  showModal({
    kicker: "Vehicle Cargo",
    title: vehicle.name,
    body: `
      <div class="results-grid">
        <span>Loaded</span><strong>${state.loaded.length}/${getVehicleCargoCapacity()}</strong>
        <span>Cargo</span><strong>${escapeHtml(getVehicleCargoSummary())}</strong>
        <span>Organization</span><strong>${escapeHtml(vehicle.organization)}</strong>
        <span>Reliability</span><strong>${escapeHtml(vehicle.reliability)}</strong>
      </div>
      <p class="muted">Van #3 ties cargo, route choices, storage, comfort, and fast travel into the same workday surface.</p>
    `,
    actions: [
      { label: "Back To Van", onClick: showVehicleMenu },
      { label: "Close", className: "text-button", onClick: render },
    ],
  });
}

function getVehicleMenuFlowMarkup() {
  const tutorialRoute = getWorldRoute("centerCityTutorial");
  const activeRoute = getWorldRoute(getCurrentDispatchRouteId()) || (isTutorialRouteReady() ? tutorialRoute : null);
  const canReviewBoard = state.flags.finished && !state.flags.endShiftPending;
  const consequenceCount = getConsequenceLedgerEntries().length;
  const rows = [
    {
      label: "Review cargo",
      detail: `${state.loaded.length}/${getVehicleCargoCapacity()} loaded: ${getVehicleCargoSummary()}.`,
    },
    {
      label: "Load carried items",
      detail: hasCarriedItems()
        ? `Ready to load: ${getCarriedLabels().join(", ")}.`
        : "Nothing is currently being carried to the van.",
    },
    {
      label: "Review dispatch board routes",
      detail: canReviewBoard
        ? "Open job cards, prep choices, route memory, risks, and upcoming work."
        : state.flags.endShiftPending
        ? "Close out the current shift before taking another board route."
        : "Unlocks after the first Center City route closes out.",
    },
    {
      label: "Open regional map",
      detail: "Shows active route, known destinations, fast-travel candidates, locks, and route history.",
    },
    {
      label: "Review consequence ledger",
      detail: consequenceCount
        ? `${consequenceCount} open callback or return-trip consequence${consequenceCount === 1 ? "" : "s"} affecting routes or prep.`
        : "No open callback or return-trip pressure is attached to the workday.",
    },
    {
      label: "Drive active route",
      detail: activeRoute
        ? `${activeRoute.fromLabel} to ${activeRoute.toLabel}. ${getRouteStatus(activeRoute)}.`
        : "No active route is launchable from the van right now.",
    },
    {
      label: "Prep",
      detail: activeRoute
        ? "Review required prep, recommended tools, risk tags, and route status before driving."
        : "Prep appears here once a route is active.",
    },
  ];
  return `
    <ul class="modal-list">
      ${rows.map((row) => `<li><strong>${escapeHtml(row.label)}</strong><span>${escapeHtml(row.detail)}</span></li>`).join("")}
    </ul>
  `;
}

function showVehicleMenu() {
  if (shouldIntroduceJoshBeforeNextDispatch()) return notifyJoshIntroRequired();
  if (state.flags.endShiftPending) return showEndShiftModal();
  const vehicle = getCurrentVehicle();
  const tutorialRoute = getWorldRoute("centerCityTutorial");
  const activeRoute = getWorldRoute(getCurrentDispatchRouteId()) || (isTutorialRouteReady() ? tutorialRoute : null);
  const canDriveCurrentRoute = Boolean(activeRoute) && !state.flags.endShiftPending;
  showModal({
    kicker: "Vehicle",
    title: vehicle.name,
    body: `
      <div class="results-grid">
        <span>Cargo</span><strong>${state.loaded.length}/${getVehicleCargoCapacity()}</strong>
        <span>Loaded</span><strong>${escapeHtml(getVehicleCargoSummary())}</strong>
        <span>Organization</span><strong>${escapeHtml(vehicle.organization)}</strong>
        <span>Reliability</span><strong>${escapeHtml(vehicle.reliability)}</strong>
        <span>Clearance</span><strong>${escapeHtml(vehicle.clearance)}</strong>
        <span>Comfort</span><strong>${escapeHtml(vehicle.comfort)}</strong>
      </div>
      <p class="muted">Use the van to check cargo, review prep, open the map, or drive when the job is ready.</p>
      <h3>Current Work</h3>
      ${getWorkdayLoopGuidanceMarkup()}
      ${getVehicleMenuFlowMarkup()}
    `,
    actions: [
      ...(hasCarriedItems() ? [{
        label: `Load Carried Items: ${getCarriedLabels().join(" and ")}`,
        onClick: loadCarriedItemsIntoVehicle,
      }] : []),
      ...(canDriveCurrentRoute ? [{
        label: `Drive Active Route: ${activeRoute.toLabel}`,
        onClick: () => showRoutePrepModal(activeRoute.id, { backAction: showVehicleMenu, backLabel: "Back To Van" }),
      }] : []),
      ...(activeRoute ? [{
        label: "Review Active Route / Prep",
        className: "secondary-button",
        onClick: () => showRoutePrepModal(activeRoute.id, { backAction: showVehicleMenu, backLabel: "Back To Van" }),
      }] : []),
      { label: "Review Cargo", className: "secondary-button", onClick: showVehicleCargo },
      ...(state.flags.finished && !state.flags.endShiftPending ? [{
        label: "Review Dispatch Board Routes",
        className: "secondary-button",
        onClick: showDispatchPreview,
      }] : []),
      ...(getConsequenceLedgerEntries().length ? [{
        label: "Review Consequence Ledger",
        className: "secondary-button",
        onClick: showConsequenceReview,
      }] : []),
      { label: "Open Regional Map", className: "secondary-button", onClick: showRegionalMap },
      { label: "Close", className: "text-button", onClick: render },
    ],
  });
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

function resumeRequiredPrompt() {
  if (shouldIntroduceJoshBeforeNextDispatch()) return render();
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
  if (state.flags.conshohockenFollowupStarted && !state.flags.conshohockenFollowupComplete) {
    return showConshohockenFollowupChoice();
  }
  if (state.sceneId === "universitySurvey" && isSurveyInspectionComplete() && !state.flags.surveyComplete) {
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
    if (state.secureAccessTaskChecks.length === content.secureAccessDispatch.taskChecks.length) return showSecureAccessChoice();
    if (!state.flags.secureAccessRoomReached) return showSecureAccessWorkStart();
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
  if (state.sceneId === "burlingtonRetrofitWalkdown" && state.retrofitWalkdownChecks.length === content.retrofitWalkdownDispatch.checks.length && !state.flags.retrofitWalkdownComplete) {
    return showRetrofitWalkdownChoice();
  }
  if (state.sceneId === "burlingtonRetrofitWalkdown" && state.retrofitInstallChecks.length === getRetrofitInstallChecks().length && state.flags.retrofitInstallStarted && !state.flags.retrofitInstallComplete) {
    return showRetrofitInstallChoice();
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

function showModal({ kicker = "Field Update", title, body, actions }) {
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

function getExhaustionEnergyCap(incidentCount = state.flags.exhaustionIncidentsThisShift || 0) {
  const capLoss = EXHAUSTION_NEXT_MORNING_CAP_LOSS
    + Math.max(0, incidentCount) * EXHAUSTION_INCIDENT_CAP_LOSS;
  return Math.max(MIN_EXHAUSTION_NEXT_MORNING_ENERGY, getMaxEnergy() - capLoss);
}

function applyOvernightRecovery({ stayedLate = false, recoveryDay = false } = {}) {
  const beforeEnergy = state.energy;
  const beforeBurnout = state.burnout;
  const recovery = recoveryDay ? getMaxEnergy() : getOvernightRecovery({ stayedLate });
  const recoveredEnergy = recoveryDay ? getMaxEnergy() : Math.min(getMaxEnergy(), state.energy + recovery);
  const stayedLateCap = stayedLate && !recoveryDay ? getStayedLateEnergyCap() : getMaxEnergy();
  const exhaustionCap = state.flags.energyExhaustedThisShift && !recoveryDay ? getExhaustionEnergyCap() : getMaxEnergy();
  state.energy = Math.min(recoveredEnergy, stayedLateCap, exhaustionCap);
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
  const exhaustionPressureDebt = (state.flags.exhaustionPressureDebt || 0) + unpaidEnergy;
  const exhaustionIncidentGain = Math.floor(exhaustionPressureDebt / EXHAUSTION_PRESSURE_PER_INCIDENT);
  const exhaustionIncidents = (state.flags.exhaustionIncidentsThisShift || 0) + exhaustionIncidentGain;
  const exhaustionBurnoutGain = Math.floor(((state.flags.exhaustionDebt || 0) + unpaidEnergy) / EXHAUSTION_DEBT_PER_BURNOUT);
  const burnoutAfterChoice = Math.max(0, state.burnout + exhaustionBurnoutGain + (stayedLate ? STAY_LATE_BURNOUT_GAIN : 0));
  const recovery = recoveryDay ? maxEnergy : getOvernightRecovery({ stayedLate, burnout: burnoutAfterChoice });
  const energyAfterChoice = Math.max(0, state.energy - energyCost);
  const rawNextEnergy = recoveryDay ? maxEnergy : Math.min(maxEnergy, energyAfterChoice + recovery);
  const lateEnergyCap = stayedLate ? getStayedLateEnergyCap(lateNightStreak) : maxEnergy;
  const willHitZero = state.flags.energyExhaustedThisShift || state.energy <= 0 || (energyCost > 0 && energyAfterChoice === 0);
  const exhaustionEnergyCap = willHitZero && !recoveryDay ? getExhaustionEnergyCap(exhaustionIncidents) : maxEnergy;
  const nextEnergy = Math.min(rawNextEnergy, lateEnergyCap, exhaustionEnergyCap);
  const cappedRecovery = recoveryDay ? 0 : Math.max(0, energyAfterChoice + recovery - maxEnergy);
  const lateCapNote = stayedLate && rawNextEnergy > lateEnergyCap
    ? ` Stayed-late fatigue caps tomorrow at ${lateEnergyCap} energy${lateNightStreak > 1 ? ` after ${lateNightStreak} late nights` : ""}.`
    : "";
  const exhaustionCapNote = willHitZero && !recoveryDay && rawNextEnergy > exhaustionEnergyCap
    ? ` Zero-energy crash caps tomorrow at ${exhaustionEnergyCap} energy${exhaustionIncidents ? ` after ${exhaustionIncidents} exhaustion incident${exhaustionIncidents === 1 ? "" : "s"}` : ""}.`
    : "";
  const exhaustionIncidentNote = exhaustionIncidentGain
    ? ` This overrun crosses ${exhaustionIncidentGain} exhaustion incident${exhaustionIncidentGain === 1 ? "" : "s"} before rest.`
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
    benefit: choice === "prep" ? "+1 Fieldcraft/Documentation next job" : choice === "help-josh" ? "Josh relationship progress" : choice === "recovery-day" ? "Skips next workday pressure" : "Clean rest",
    capNote: `${lateCapNote}${exhaustionCapNote}${exhaustionIncidentNote}` || (cappedRecovery ? ` ${cappedRecovery} recovery would be capped at max energy.` : ""),
  };
}

function canHelpJoshAfterShift() {
  if (!state.flags.metJosh) return false;
  if (state.flags.serviceCallbackPending && !state.flags.serviceCallbackResolved) return false;
  return !state.flags.joshIntroEndShiftSource
    || state.flags.joshIntroEndShiftSource !== state.flags.endShiftSource;
}

function getHelpJoshShiftCopy() {
  if (!canHelpJoshAfterShift()) return null;
  return {
    previewLabel: "Help Josh",
    actionLabel: `Help Josh clean up notes (-${HELP_JOSH_ENERGY_COST} energy, +${STAY_LATE_BURNOUT_GAIN} burnout, crew remembers)`,
    log: "Helped Josh clean up notes and labels before clocking out. Coworker reputation improved, and the longer day still took something out of you.",
  };
}

function getEndShiftChoicePreviewMarkup() {
  const helpJoshCopy = getHelpJoshShiftCopy();
  const choices = [
    { id: "clock-out", label: "Clock out" },
    { id: "prep", label: "Stay late prep" },
    ...(helpJoshCopy ? [{ id: "help-josh", label: helpJoshCopy.previewLabel }] : []),
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

function getTrackedStateSnapshot() {
  return {
    clock: state.clock,
    energy: state.energy,
    burnout: state.burnout,
    cash: state.cash,
    xp: state.xp,
    jobsCompleted: state.jobsCompleted,
    clientReputation: state.reputation.clients,
    coworkerReputation: state.reputation.coworkers,
    managementReputation: state.reputation.management,
    openCallbacks: getUnresolvedCallbackCount(),
    openReturnTripRisks: getReturnTripRiskEntries().length,
    shiftsCompleted: state.stats.shiftsCompleted || 0,
    overnightRests: state.stats.overnightRests || 0,
    recoveryDays: state.stats.recoveryDays || 0,
    stayLatePrepDays: state.stats.stayLatePrepDays || 0,
    shopHelpDays: state.stats.shopHelpDays || 0,
    lateNightStreak: state.flags.consecutiveLateNights || 0,
    nextShiftPrep: Boolean(state.flags.shiftPrepActive),
  };
}

function getTrackedStateLabel(key) {
  return {
    clock: "Clock",
    energy: "Energy",
    burnout: "Burnout",
    cash: "Cash",
    xp: "XP",
    jobsCompleted: "Jobs completed",
    clientReputation: "Client reputation",
    coworkerReputation: "Coworker reputation",
    managementReputation: "Management reputation",
    openCallbacks: "Open callbacks",
    openReturnTripRisks: "Open return-trip risks",
    shiftsCompleted: "Shifts completed",
    overnightRests: "Overnight rests",
    recoveryDays: "Recovery days",
    stayLatePrepDays: "Stay-late prep days",
    shopHelpDays: "Shop-help days",
    lateNightStreak: "Late-night streak",
    nextShiftPrep: "Next-shift prep",
  }[key] || key;
}

function formatTrackedStateValue(key, value) {
  if (key === "cash") return formatCash(value);
  if (key.includes("Reputation")) return formatReputation(value);
  if (key === "nextShiftPrep") return value ? "Active" : "Inactive";
  return `${value}`;
}

function formatTrackedStateChange(key, before, after) {
  if (before === after) return "";
  const beforeText = formatTrackedStateValue(key, before);
  const afterText = formatTrackedStateValue(key, after);
  if (typeof before === "number" && typeof after === "number") {
    const delta = after - before;
    const deltaText = key === "cash" ? formatCash(delta) : formatSignedNumber(delta);
    return `${beforeText} -> ${afterText} (${deltaText})`;
  }
  return `${beforeText} -> ${afterText}`;
}

function getTrackedStateDeltaRows(before, after = getTrackedStateSnapshot()) {
  return Object.keys(after)
    .map((key) => ({
      label: getTrackedStateLabel(key),
      detail: formatTrackedStateChange(key, before?.[key], after[key]),
    }))
    .filter((row) => row.detail);
}

function getTrackedStateDeltaMarkup(before, after = getTrackedStateSnapshot()) {
  const rows = getTrackedStateDeltaRows(before, after);
  if (!rows.length) return `<p class="muted">No tracked career state changed.</p>`;
  return `
    <ul class="modal-list">
      ${rows.map((row) => `<li><strong>${escapeHtml(row.label)}</strong><span>${escapeHtml(row.detail)}</span></li>`).join("")}
    </ul>
  `;
}

function getShiftChoiceResultText(choice, recovery) {
  if (choice === "prep") {
    return `Stayed late to prep the next job. The next shift starts with Fieldcraft and Documentation support, but the longer day still changed energy, burnout, and management pressure. Recovery restored ${recovery.energyRecovered} energy.`;
  }
  if (choice === "help-josh") {
    return `Helped Josh clean up notes. Crew trust improved, but the favor still cost energy and added late-night fatigue. Recovery restored ${recovery.energyRecovered} energy.`;
  }
  if (choice === "recovery-day") {
    return `Took a recovery day. Condition gets repaired more aggressively, but management sees the schedule gap. Recovery restored ${recovery.energyRecovered} energy.`;
  }
  return `Clocked out clean. You protected tomorrow's workday instead of borrowing more from the same shift. Recovery restored ${recovery.energyRecovered} energy.`;
}

function showShiftResultModal({ choice, source, before, recovery }) {
  const canReviewBoard = state.flags.finished && !state.flags.endShiftPending && !shouldIntroduceJoshBeforeNextDispatch();
  showModal({
    kicker: "Shift Result",
    title: `${source} Closed Out`,
    body: `
      <p>${escapeHtml(getShiftChoiceResultText(choice, recovery))}</p>
      <h3>What Changed</h3>
      ${getTrackedStateDeltaMarkup(before)}
      <h3>Next Step</h3>
      ${getCurrentStepListMarkup({ includeLoopPath: false })}
    `,
    actions: [
      ...(canReviewBoard ? [{ label: "Review Dispatch Board Routes", onClick: showDispatchPreview }] : []),
      { label: "Back To Shop", className: "secondary-button", onClick: render },
    ],
  });
}

function clearEndShiftState() {
  state.flags.endShiftPending = false;
  state.flags.endShiftSource = null;
  state.flags.endShiftSummaryShown = false;
  delete state.flags.joshIntroEndShiftSource;
  state.flags.energyExhaustedThisShift = false;
  state.flags.exhaustionDebt = 0;
  state.flags.exhaustionPressureDebt = 0;
  state.flags.exhaustionIncidentsThisShift = 0;
}

function startEndShift(source) {
  state.flags.endShiftPending = true;
  state.flags.endShiftSource = source;
  state.flags.shiftPrepActive = false;
  state.flags.endShiftSummaryShown = false;
}

function shouldIntroduceJoshBeforeNextDispatch() {
  return state.sceneId === "shop"
    && state.flags.finished
    && !state.flags.endShiftPending
    && !state.flags.metJosh
    && !state.flags.serviceStarted
    && !state.flags.serviceComplete;
}

function shouldHideJoshUntilNextMorning() {
  return state.sceneId === "shop"
    && state.flags.finished
    && state.flags.endShiftPending
    && !state.flags.metJosh
    && !state.flags.serviceStarted
    && !state.flags.serviceComplete;
}

function notifyJoshIntroRequired() {
  return notify("Find Josh at the workbench before taking the next route.");
}

function shouldShowRetrofitInstallDebrief() {
  return state.sceneId === "shop"
    && state.flags.retrofitInstallComplete
    && !state.flags.retrofitInstallDebriefed
    && !state.flags.endShiftPending;
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
  const source = state.flags.endShiftSource || "today's job";
  const helpJoshCopy = getHelpJoshShiftCopy();
  const ordinaryRecovery = getOvernightRecovery();
  const lateRecovery = getOvernightRecovery({ stayedLate: true, burnout: state.burnout + STAY_LATE_BURNOUT_GAIN });
  const lateEnergyCap = getStayedLateEnergyCap((state.flags.consecutiveLateNights || 0) + 1);
  const exhaustionCap = state.flags.energyExhaustedThisShift ? getExhaustionEnergyCap() : null;
  const exhaustionPenalty = getExhaustionSkillPenalty();
  const pendingServiceCallback = state.flags.serviceCallbackPending && !state.flags.serviceCallbackResolved;
  showModal({
    kicker: "End Of Shift",
    title: "Close Out The Workday",
    body: `
      <p>${source} is wrapped. The board has more work, but the next job should start after an actual shift reset.</p>
      ${pendingServiceCallback ? `<p class="muted">A Conshohocken callback note is waiting on Josh's bench. Close out the shift, then talk to Josh before coordination adds another stop.</p>` : ""}
      <div class="results-grid">
        <span>Current time</span><strong>${state.clock}</strong>
        <span>Energy</span><strong>${state.energy}/${getMaxEnergy()}</strong>
        <span>Burnout</span><strong>${state.burnout}</strong>
        <span>Overnight recovery</span><strong>+${ordinaryRecovery} energy${state.burnout ? " after burnout penalty" : ""}</strong>
        <span>Stayed-late recovery</span><strong>+${lateRecovery} energy after new burnout</strong>
        <span>Stayed-late cap</span><strong>${lateEnergyCap}/${getMaxEnergy()} energy tomorrow</strong>
        ${exhaustionCap ? `<span>Zero-energy cap</span><strong>${exhaustionCap}/${getMaxEnergy()} energy tomorrow unless recovery day</strong>` : ""}
        ${exhaustionPenalty ? `<span>Exhaustion penalty</span><strong>-${exhaustionPenalty} on skill checks this shift</strong>` : ""}
      </div>
      <p class="muted">Burnout reduces ordinary overnight recovery. Staying late helps the work, but it caps tomorrow's energy; consecutive late nights tighten that cap. Hitting zero energy is a push-your-luck state: work can continue, but incidents, weaker skill checks, and a lower next-morning cap can follow. Recovery days restore more, but management notices the schedule gap.</p>
      <p><strong>Next-morning preview:</strong></p>
      ${getEndShiftChoicePreviewMarkup()}
    `,
    actions: [
      { label: `Clock out and go home (+${ordinaryRecovery} energy overnight)`, onClick: () => completeShift("clock-out") },
      { label: `Stay late to prep tomorrow (-${STAY_LATE_PREP_ENERGY_COST} energy, +${STAY_LATE_BURNOUT_GAIN} burnout, prep advantage)`, className: "secondary-button", onClick: () => completeShift("prep") },
      ...(helpJoshCopy ? [{ label: helpJoshCopy.actionLabel, className: "secondary-button", onClick: () => completeShift("help-josh") }] : []),
      { label: "Take a recovery day (full energy, management may notice)", className: "secondary-button", onClick: () => completeShift("recovery-day") },
      { label: "Not Yet", className: "text-button", onClick: render },
    ],
  });
}

function completeShift(choice) {
  const source = state.flags.endShiftSource || "Shift";
  const before = getTrackedStateSnapshot();
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
    addLog("Stayed late to prep tomorrow's first job. Fieldcraft and documentation get a next-shift boost, but the extra unpaid time landed hard.");
  } else if (choice === "help-josh") {
    const helpJoshCopy = getHelpJoshShiftCopy();
    if (!helpJoshCopy) {
      return notify(state.flags.serviceCallbackPending && !state.flags.serviceCallbackResolved
        ? "Clear the callback note with Josh before making generic end-shift plans."
        : "Meet Josh before making him part of end-shift plans.");
    }
    changeEnergy(-HELP_JOSH_ENERGY_COST);
    state.burnout += STAY_LATE_BURNOUT_GAIN;
    stayedLate = true;
    state.flags.consecutiveLateNights = (state.flags.consecutiveLateNights || 0) + 1;
    state.flags.metJosh = true;
    state.reputation.coworkers += 1;
    state.stats.shopHelpDays += 1;
    addLog(helpJoshCopy.log);
  } else if (choice === "recovery-day") {
    days = 2;
    state.flags.consecutiveLateNights = 0;
    state.reputation.management -= 1;
    state.stats.recoveryDays += 1;
    addLog("Took a recovery day instead of accepting the next job. Management reputation took a small hit.");
  } else {
    state.flags.shiftPrepActive = false;
    state.flags.consecutiveLateNights = 0;
    addLog("Clocked out and went home instead of turning the next work order into the same tired day.");
  }
  const recovery = applyOvernightRecovery({ stayedLate, recoveryDay: choice === "recovery-day" });
  state.stats.shiftsCompleted += 1;
  if (choice !== "recovery-day") state.stats.overnightRests += 1;
  clearEndShiftState();
  advanceToNextMorning(days);
  addLog(`${source} closed out. Recovered ${recovery.energyRecovered} energy${recovery.burnoutRecovered ? ` and reduced burnout by ${recovery.burnoutRecovered}` : ""}.`);
  render();
  showShiftResultModal({ choice, source, before, recovery });
}

function getShiftPrepSkillBonus(skillId) {
  if (!state.flags.shiftPrepActive) return 0;
  return ["fieldcraft", "documentation"].includes(skillId) ? 1 : 0;
}

function showBreakArea() {
  if (shouldIntroduceJoshBeforeNextDispatch()) return notifyJoshIntroRequired();
  if (state.flags.endShiftPending) return showEndShiftModal();
  showModal({
    kicker: "Break Area",
    title: "Use The Quiet Corner Before Coordination Finds You",
    body: `
      <p>The break area is now same-day recovery and preparation, not a free time machine.</p>
      <div class="results-grid">
        <span>Energy</span><strong>${state.energy}/${getMaxEnergy()}</strong>
        <span>Burnout</span><strong>${state.burnout}</strong>
        <span>Lunch packed</span><strong>${state.flags.packedLunchReady ? "Yes" : "No"}</strong>
        <span>Cash</span><strong>${formatCash(state.cash)}</strong>
      </div>
      ${getExhaustionPressureMarkup()}
    `,
    actions: [
      { label: "Take 15-minute break (+10 energy)", onClick: takeShortBreak },
      ...(!state.flags.packedLunchReady ? [{ label: "Pack lunch for next job", className: "secondary-button", onClick: packLunchForNextDispatch }] : []),
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
  addLog("Packed lunch for the next job. It will restore energy when you head out.");
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
  state.flags.exhaustionPressureDebt = 0;
  state.flags.exhaustionIncidentsThisShift = 0;
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
  state.vehicleId = content.world?.defaultVehicleId || "van3";
  state.energy = state.technician.stats.energy;
  state.burnout = state.technician.stats.burnout;
  state.cash = state.technician.startingCash || 0;
  addLog(`${state.technician.name}'s first day started${state.technician.custom ? " from a custom build" : ""}. Nobody mentioned an onboarding packet.`);
  elements.titleScreen.classList.add("hidden");
  elements.selection.classList.add("hidden");
  elements.gameLayout.classList.remove("hidden");
  elements.menuButton.classList.remove("hidden");
  enterScene("shop");
}

function applyDebugCompletedFirstJob({ metJosh = true, endShiftPending = false } = {}) {
  startGame("prototype-tech");
  const rewardTool = "toolBag";
  state.tools = uniqueValues(["screwdriver", rewardTool]);
  state.loaded = [...content.tutorial.shopLoad];
  state.delivered = [...content.tutorial.garageUnload];
  state.assembled = content.tutorial.assembly.map((item) => item.id);
  state.carry = [];
  state.energy = 58;
  state.burnout = 1;
  state.cash = 152;
  state.xp = 40;
  state.jobsCompleted = 1;
  state.reputation = { clients: 2, coworkers: 1, management: -1 };
  state.stats.overtimeDays = 1;
  state.stats.carefulFinishes = 1;
  state.flags = {
    ...state.flags,
    shopBrief: true,
    garageBrief: true,
    centerCityEquipmentDelivered: true,
    securityChecked: true,
    roomBrief: true,
    supervisorLeft: true,
    finished: true,
    finishChoice: "tidy",
    reward: rewardTool,
    tutorialPaid: true,
    tutorialProgressAwarded: true,
    tutorialStatsRecorded: true,
    metJosh,
    endShiftPending,
    endShiftSource: endShiftPending ? "Two Quick Carts" : null,
    currentAreaId: "shop",
    routeHistory: { centerCityTutorial: 1 },
    routeChoiceHistory: { centerCityTutorial: "garageRoute" },
    portalHistory: {
      garageToLobby: 1,
      lobbyToConferenceRoom: 1,
      ...(endShiftPending ? { centerCityConferenceRoomToShop: 1 } : {}),
    },
    lastRouteId: "centerCityTutorial",
  };
  setClock(endShiftPending ? "MON 6:35 PM" : "TUE 7:35 AM");
  addLog(`Debug jump: first job complete${metJosh ? "" : ", Josh intro pending"}.`);
  enterScene("shop");
}

function applyDebugServiceReady() {
  applyDebugCompletedFirstJob({ metJosh: true, endShiftPending: false });
  state.energy = 86;
  state.burnout = 0;
  state.flags.consecutiveLateNights = 0;
  state.flags.shiftPrepActive = false;
  addLog("Debug jump: service dispatch ready.");
  render();
}

function applyDebugServiceComplete() {
  applyDebugServiceReady();
  state.energy = 64;
  state.cash = 248;
  state.xp = 90;
  state.jobsCompleted = 2;
  state.reputation = { clients: 4, coworkers: 2, management: -1 };
  state.stats.carefulFinishes = 2;
  state.flags = {
    ...state.flags,
    serviceStarted: true,
    serviceComplete: true,
    serviceApproach: "verify",
    servicePreparation: "josh",
    servicePaid: true,
    serviceProgressAwarded: true,
    serviceStatsRecorded: true,
    joshServiceDebriefed: false,
    routeHistory: { ...(state.flags.routeHistory || {}), conshohockenService: 1 },
    lastRouteId: "conshohockenService",
  };
  setClock("WED 7:35 AM");
  addLog("Debug jump: Conshohocken service complete; Josh debrief pending.");
  enterScene("shop");
}

function applyDebugLowEnergyEndShift() {
  applyDebugCompletedFirstJob({ metJosh: true, endShiftPending: true });
  state.energy = 8;
  state.burnout = 5;
  state.flags.endShiftSource = "Debug Low-Energy Shift";
  addLog("Debug jump: low-energy end-shift balance state.");
  enterScene("shop");
  showEndShiftModal();
}

function jumpDebugScenario(scenarioId) {
  if (!DEBUG_MODE) return null;
  closeModal();
  if (scenarioId === "post-first-job") {
    applyDebugCompletedFirstJob({ metJosh: false, endShiftPending: true });
    return render();
  }
  if (scenarioId === "service-ready") return applyDebugServiceReady();
  if (scenarioId === "service-complete") return applyDebugServiceComplete();
  if (scenarioId === "low-energy") return applyDebugLowEnergyEndShift();
  return notify(`Unknown debug scenario: ${scenarioId}`);
}

function installDebugTools() {
  if (!DEBUG_MODE) return;
  window.AV_TECH_RPG_DEBUG = {
    scenarios: ["post-first-job", "service-ready", "service-complete", "low-energy"],
    jump: jumpDebugScenario,
    state,
  };
  console.info("AV Tech RPG debug helper ready: AV_TECH_RPG_DEBUG.jump('post-first-job')");
}

function enterScene(sceneId, playerPosition = null) {
  state.sceneId = sceneId;
  const area = getWorldAreaByScene(sceneId);
  if (area) state.flags.currentAreaId = area.id;
  state.player = playerPosition && !overlapsSolidObject(playerPosition.x, playerPosition.y)
    ? { ...playerPosition }
    : { ...content.scenes[sceneId].playerStart };
  render();
  elements.scene.focus();
}

function getCurrentVehicleId() {
  return state.vehicleId || content.world?.defaultVehicleId || "van3";
}

function getCurrentVehicle() {
  return content.vehicles[getCurrentVehicleId()] || content.vehicles.van3;
}

function getVehicleName() {
  return getCurrentVehicle().name || "Current vehicle";
}

function getVehicleCargoCapacity() {
  return getCurrentVehicle().cargoCapacity || 0;
}

function getWorldAreaByScene(sceneId) {
  return Object.values(content.world?.areas || {}).find((area) => area.sceneId === sceneId);
}

function getWorldRoute(routeId) {
  return content.world?.routes?.[routeId] || null;
}

function getWorldPortal(portalId) {
  return content.world?.portals?.[portalId] || null;
}

function getWorldArea(areaId) {
  return content.world?.areas?.[areaId] || null;
}

function getWorldRegion(regionId) {
  return content.world?.regions?.[regionId] || null;
}

function getWorldRoutes() {
  return Object.values(content.world?.routes || {});
}

function getCurrentWorldArea() {
  return getWorldArea(state.flags.currentAreaId)
    || getWorldAreaByScene(state.sceneId)
    || getWorldArea(content.world?.homeAreaId);
}

function getRouteTravelCount(routeId) {
  return state.flags.routeHistory?.[routeId] || 0;
}

function getFastTravelCount(routeId) {
  return state.flags.fastTravelHistory?.[routeId] || 0;
}

function getFastTravelEnergyCost(route) {
  return route.fastTravelEnergyCost ?? 1;
}

function getRouteChoices(route) {
  return route?.choices || [];
}

function getRouteChoice(route, choiceId) {
  return getRouteChoices(route).find((choice) => choice.id === choiceId) || null;
}

function getLastRouteChoiceLabel(route) {
  const choiceId = state.flags.routeChoiceHistory?.[route.id];
  return getRouteChoice(route, choiceId)?.label || "";
}

function hasLoadedItems(itemIds) {
  return itemIds.every((itemId) => state.loaded.includes(itemId));
}

function isTutorialRouteReady() {
  return hasLoadedItems(content.tutorial.shopLoad)
    && state.flags.shopBrief
    && !state.flags.finished
    && !state.flags.endShiftPending;
}

function canLaunchRouteFromRegionalMap(routeId) {
  return routeId === "centerCityTutorial" && isTutorialRouteReady();
}

function getDispatchBoardEntryDefinitions() {
  return [
    {
      id: "service",
      contentKey: "serviceDispatch",
      routeId: "conshohockenService",
      statusLabel: "SERVICE CALL",
      objective: "Review the Conshohocken service call on the dispatch board.",
      availableReason: "First install day is complete and the shop has a small service call ready.",
      isAvailable: () => state.flags.finished && !state.flags.serviceComplete,
      isInProgress: () => (state.sceneId === "serviceOffice" && !state.flags.conshohockenFollowupStarted && !state.flags.serviceComplete)
        || (state.flags.serviceStarted && !state.flags.serviceComplete),
      isComplete: () => Boolean(state.flags.serviceComplete),
      previewAction: showServiceDispatchPreview,
    },
    {
      id: "followup",
      contentKey: "followupDispatch",
      routeId: "conshohockenService",
      statusLabel: "FOLLOW-UP",
      objective: "Review the Conshohocken label follow-up on the dispatch board.",
      availableReason: "Josh's service debrief unlocked a repeat-route label cleanup before the next new site.",
      isAvailable: () => isConshohockenFollowupAvailable()
        && !(state.flags.serviceCallbackPending && !state.flags.serviceCallbackResolved)
        && !hasPendingTraining(),
      isInProgress: () => state.flags.conshohockenFollowupStarted && !state.flags.conshohockenFollowupComplete,
      isComplete: () => Boolean(state.flags.conshohockenFollowupComplete),
      blockedReason: () => {
        if (!state.flags.serviceComplete || state.flags.conshohockenFollowupComplete) return "";
        if (state.flags.serviceCallbackPending && !state.flags.serviceCallbackResolved) {
          return "The Conshohocken callback note is still clipped to Josh's bench.";
        }
        if (!state.flags.joshServiceDebriefed) return "Check in with Josh before coordination adds another stop.";
        if (hasPendingTraining()) return "Mark your field-training focus on the clipboard before taking another job.";
        return "";
      },
      previewAction: showConshohockenFollowupPreview,
    },
    {
      id: "survey",
      contentKey: "surveyDispatch",
      routeId: "universitySurvey",
      statusLabel: "SITE SURVEY",
      objective: "Review the University City site survey on the dispatch board.",
      availableReason: "The Conshohocken sequence is closed and the board has moved to a site survey.",
      isAvailable: () => state.flags.serviceComplete
        && state.flags.joshServiceDebriefed
        && !(state.flags.serviceCallbackPending && !state.flags.serviceCallbackResolved)
        && state.flags.conshohockenFollowupComplete
        && !state.flags.surveyComplete
        && !hasPendingTraining(),
      isInProgress: () => state.sceneId === "universitySurvey" || (state.flags.surveyStarted && !state.flags.surveyComplete),
      isComplete: () => Boolean(state.flags.surveyComplete),
      previewAction: showSurveyDispatchPreview,
    },
    {
      id: "commissioning",
      contentKey: "commissioningDispatch",
      routeId: "southPhillyCommissioning",
      statusLabel: "COMMISSIONING",
      objective: "Review the South Philadelphia commissioning visit on the dispatch board.",
      availableReason: "The University City survey is complete and a closeout-quality commissioning visit is ready.",
      isAvailable: () => state.flags.surveyComplete && !state.flags.commissioningComplete,
      isInProgress: () => state.sceneId === "southPhillyCommissioning"
        || (state.flags.commissioningStarted && !state.flags.commissioningComplete),
      isComplete: () => Boolean(state.flags.commissioningComplete),
      previewAction: showCommissioningDispatchPreview,
    },
    {
      id: "warehouse",
      contentKey: "warehouseDispatch",
      routeId: "",
      statusLabel: "WAREHOUSE RUN",
      objective: "Review the warehouse run on the dispatch board.",
      availableReason: "Commissioning is complete and the shop needs an inventory problem resolved before the next site.",
      isAvailable: () => state.flags.commissioningComplete && !state.flags.warehouseComplete && !hasPendingTraining(),
      isInProgress: () => state.flags.warehouseStarted && !state.flags.warehouseComplete,
      isComplete: () => Boolean(state.flags.warehouseComplete),
      blockedReason: () => {
        if (state.flags.commissioningComplete && !state.flags.warehouseComplete && hasPendingTraining()) {
          return "Mark your new field-training focus on the clipboard before taking another job.";
        }
        return "";
      },
      previewAction: showWarehouseDispatchPreview,
    },
    {
      id: "secureAccess",
      contentKey: "secureAccessDispatch",
      routeId: "navyYardAccess",
      statusLabel: "SECURE ACCESS",
      objective: "Review the Navy Yard secure-access job on the dispatch board.",
      availableReason: "The warehouse run is closed and the board has a secure-site rack update ready.",
      isAvailable: () => state.flags.warehouseComplete && !state.flags.secureAccessComplete,
      isInProgress: () => state.sceneId === "navyYardAccess"
        || (state.flags.secureAccessStarted && !state.flags.secureAccessComplete),
      isComplete: () => Boolean(state.flags.secureAccessComplete),
      previewAction: showSecureAccessDispatchPreview,
    },
    {
      id: "callbackCleanup",
      contentKey: "callbackCleanupDispatch",
      routeId: "warrantyReturn",
      statusLabel: "WARRANTY RETURN",
      objective: "Review the warranty return on the dispatch board.",
      availableReason: "Callback pressure is still open, so the board is forcing a cleanup before handoff.",
      isAvailable: () => shouldOfferCallbackCleanupDispatch(),
      isInProgress: () => state.sceneId === "warrantyReturn"
        || (state.flags.callbackCleanupStarted && !state.flags.callbackCleanupComplete),
      isComplete: () => Boolean(state.flags.callbackCleanupComplete),
      previewAction: showCallbackCleanupDispatchPreview,
    },
    {
      id: "handoff",
      contentKey: "handoffDispatch",
      routeId: "executiveHandoff",
      statusLabel: "CLIENT HANDOFF",
      objective: "Review the executive handoff on the dispatch board.",
      availableReason: "Secure access is complete and callback pressure no longer blocks the client handoff.",
      isAvailable: () => state.flags.secureAccessComplete
        && !state.flags.handoffComplete
        && !shouldOfferCallbackCleanupDispatch(),
      isInProgress: () => state.sceneId === "executiveHandoff" || (state.flags.handoffStarted && !state.flags.handoffComplete),
      isComplete: () => Boolean(state.flags.handoffComplete),
      previewAction: showHandoffDispatchPreview,
    },
    {
      id: "systems",
      contentKey: "systemsDispatch",
      routeId: "systemsService",
      statusLabel: "SYSTEMS SERVICE",
      objective: "Review the King of Prussia systems service on the dispatch board.",
      availableReason: "The executive handoff is complete and the board has a systems service call ready.",
      isAvailable: () => state.flags.handoffComplete && !state.flags.systemsComplete,
      isInProgress: () => state.sceneId === "systemsService" || (state.flags.systemsStarted && !state.flags.systemsComplete),
      isComplete: () => Boolean(state.flags.systemsComplete),
      previewAction: showSystemsDispatchPreview,
    },
    {
      id: "travelCost",
      contentKey: "travelDispatch",
      routeId: "",
      statusLabel: "TRAVEL COST",
      objective: "Review the Cherry Hill return toll on the dispatch board.",
      availableReason: "The systems service closed, but coordination left a cross-river travel cost for the board.",
      isAvailable: () => state.flags.systemsComplete && !state.flags.travelComplete,
      isInProgress: () => state.flags.systemsComplete && !state.flags.travelComplete,
      isComplete: () => Boolean(state.flags.travelComplete),
      previewAction: showTravelDispatchPreview,
    },
    {
      id: "retrofitWalkdown",
      contentKey: "retrofitWalkdownDispatch",
      routeId: "burlingtonRetrofitWalkdown",
      statusLabel: "RETROFIT WALKDOWN",
      objective: "Review the Burlington County retrofit walkdown on the dispatch board.",
      availableReason: "The travel-cost beat is closed and the retrofit needs a protective walkdown before install day.",
      isAvailable: () => state.flags.travelComplete && !state.flags.retrofitWalkdownComplete,
      isInProgress: () => (state.sceneId === "burlingtonRetrofitWalkdown" && !state.flags.retrofitInstallStarted)
        || (state.flags.retrofitWalkdownStarted && !state.flags.retrofitWalkdownComplete),
      isComplete: () => Boolean(state.flags.retrofitWalkdownComplete),
      previewAction: showRetrofitWalkdownDispatchPreview,
    },
    {
      id: "retrofitInstall",
      contentGetter: getRetrofitInstallPreview,
      fallbackTitle: "Burlington County Retrofit Install",
      fallbackSummary: "Install the retrofit using the inherited walkdown result.",
      routeId: "burlingtonRetrofitWalkdown",
      statusLabel: "RETROFIT INSTALL",
      objective: "Review the Burlington County retrofit install on the dispatch board.",
      availableReason: "The walkdown closeout exists, so the install can inherit that saved branch.",
      isAvailable: () => state.flags.retrofitWalkdownComplete && !state.flags.retrofitInstallComplete,
      isInProgress: () => (state.sceneId === "burlingtonRetrofitWalkdown" && state.flags.retrofitInstallStarted && !state.flags.retrofitInstallComplete)
        || (state.flags.retrofitInstallStarted && !state.flags.retrofitInstallComplete),
      isComplete: () => Boolean(state.flags.retrofitInstallComplete),
      previewAction: showRetrofitInstallDispatchPreview,
    },
    {
      id: "careerSnapshot",
      fallbackTitle: "Career Snapshot",
      fallbackSummary: "Review the completed dispatch board, consequence ledger, and upcoming locked work.",
      routeId: "",
      statusLabel: "CAREER SNAPSHOT",
      blockedStatusLabel: "SHOP DEBRIEF",
      objective: "Review your career snapshot on the dispatch board.",
      availableReason: "The Burlington install is debriefed and the board is ready for a career snapshot.",
      isAvailable: () => state.flags.retrofitInstallComplete
        && state.flags.retrofitInstallDebriefed
        && !state.flags.prototypeSummaryViewed,
      isInProgress: () => false,
      isComplete: () => Boolean(state.flags.prototypeSummaryViewed),
      blockedReason: () => {
        if (state.flags.retrofitInstallComplete && !state.flags.prototypeSummaryViewed && !state.flags.retrofitInstallDebriefed) {
          return "Check in with Josh about the Burlington retrofit before reviewing the career snapshot.";
        }
        return "";
      },
      previewAction: showCareerSnapshot,
    },
  ];
}

function resolveDispatchBoardEntry(entry) {
  const contentData = typeof entry.contentGetter === "function" ? entry.contentGetter() || {} : content[entry.contentKey] || {};
  const routeId = typeof entry.routeId === "function" ? entry.routeId() : entry.routeId || "";
  const isAvailable = Boolean(entry.isAvailable?.());
  const isInProgress = Boolean(entry.isInProgress?.());
  const isComplete = Boolean(entry.isComplete?.());
  const blockedReason = !isAvailable && !isComplete ? entry.blockedReason?.() || "" : "";
  const route = routeId ? getWorldRoute(routeId) : null;
  const boardStatus = isInProgress
    ? "In progress"
    : isAvailable
    ? "Active board item"
    : blockedReason
    ? "Blocked"
    : isComplete
    ? "Complete"
    : "Locked";
  return {
    ...entry,
    title: contentData.title || entry.fallbackTitle || "Dispatch Board Item",
    summary: contentData.summary || contentData.setup || entry.fallbackSummary || "",
    routeId,
    route,
    routeLabel: route ? `${route.fromLabel} -> ${route.toLabel}` : "Shop / board task",
    isAvailable,
    isInProgress,
    isComplete,
    blockedReason,
    boardStatus,
  };
}

function getDispatchBoardEntries() {
  return getDispatchBoardEntryDefinitions().map(resolveDispatchBoardEntry);
}

function getCurrentDispatchBoardEntry(entries = getDispatchBoardEntries()) {
  if (state.flags.endShiftPending) return null;
  return entries.find((entry) => entry.isAvailable) || null;
}

function getBlockedDispatchBoardEntry(entries = getDispatchBoardEntries()) {
  return entries.find((entry) => entry.blockedReason) || null;
}

function getInProgressDispatchBoardEntry(entries = getDispatchBoardEntries()) {
  return entries.find((entry) => entry.isInProgress) || null;
}

function getLastCompletedDispatchBoardEntry(entries = getDispatchBoardEntries()) {
  const completed = entries.filter((entry) => entry.isComplete);
  return completed.length ? completed[completed.length - 1] : null;
}

function getCurrentDispatchBoardObjective() {
  return getCurrentDispatchBoardEntry()?.objective || "";
}

function getDispatchBoardStateMarkup({ showBlocked = true } = {}) {
  const entry = getCurrentDispatchBoardEntry() || (showBlocked ? getBlockedDispatchBoardEntry() : null);
  if (!entry) return "";
  const routeDetail = entry.route
    ? `Route: ${entry.routeLabel}.`
    : "Route: no drive route; this resolves from the board or shop.";
  const why = entry.blockedReason
    ? `Why blocked: ${entry.blockedReason}`
    : `Why active: ${entry.availableReason || "Unlocked by current board progression."}`;
  return `<li><strong>Board state</strong><span>${escapeHtml(`${entry.boardStatus}: ${entry.title}. ${routeDetail} ${why}`)}</span></li>`;
}

function getFallbackDispatchPresentation() {
  if (!state.flags.finished) {
    return {
      title: "Two Quick Carts",
      summary: "Build two mobile video conferencing carts at a Center City East office.",
      statusLabel: "FIRST DAY",
    };
  }
  if (state.flags.prototypeSummaryViewed) {
    return {
      title: "Current Board Complete",
      summary: "You cleared the current Radnor Rack & Wire dispatch board. Review the career clipboard or explore the shop.",
      statusLabel: "BOARD COMPLETE",
    };
  }
  return {
    title: "Shop Hub",
    summary: "Use the dispatch board, Van #3, career clipboard, or nearby shop interactions to choose the next step.",
    statusLabel: state.flags.endShiftPending ? "END SHIFT" : "SHOP HUB",
  };
}

function getHudDispatchPresentation() {
  if (state.flags.endShiftPending) return getFallbackDispatchPresentation();
  const entries = getDispatchBoardEntries();
  const entry = getInProgressDispatchBoardEntry(entries)
    || (state.sceneId === "shop" ? getCurrentDispatchBoardEntry(entries) || getBlockedDispatchBoardEntry(entries) : null)
    || getLastCompletedDispatchBoardEntry(entries);
  const fallback = getFallbackDispatchPresentation();
  if (!entry) return fallback;
  return {
    title: entry.title || fallback.title,
    summary: entry.summary || fallback.summary,
    statusLabel: entry.blockedReason ? entry.blockedStatusLabel || "SHOP BLOCKED" : entry.statusLabel || fallback.statusLabel,
  };
}

function getCurrentDispatchRouteId() {
  if (!state.flags.finished || state.flags.endShiftPending) return null;
  return getCurrentDispatchBoardEntry()?.routeId || null;
}

// Route history gates fast travel and gives the map its driven-before state.
function isFastTravelUnlocked(route) {
  return Boolean(route?.fastTravelEligible) && getRouteTravelCount(route.id) > 0;
}

function canFastTravelRoute(route) {
  const currentArea = getCurrentWorldArea();
  return isFastTravelUnlocked(route)
    && currentArea?.id === route.fromAreaId
    && getCurrentDispatchRouteId() === route.id;
}

function getDispatchReference(dispatchId) {
  return dispatchId ? content[dispatchId] || null : null;
}

function getRouteJobVariant(routeId, routeJob) {
  if (routeId === "conshohockenService" && isConshohockenFollowupAvailable()) return routeJob.followup || null;
  if (
    routeId === "burlingtonRetrofitWalkdown"
    && state.flags.retrofitWalkdownComplete
    && !state.flags.retrofitInstallComplete
  ) return routeJob.install || null;
  return null;
}

// Routes define travel; routeJobs define the player-facing job card for that travel.
function getRouteJobData(routeId) {
  const defaults = content.routeJobDefaults || {};
  const routeJob = content.routeJobs?.[routeId] || {};
  const variant = getRouteJobVariant(routeId, routeJob) || {};
  const dispatch = getDispatchReference(variant.dispatchId || routeJob.dispatchId);
  return {
    title: variant.title || routeJob.title || dispatch?.title || defaults.title || "Mapped route",
    familyId: variant.familyId || routeJob.familyId || defaults.familyId || "logistics",
    purpose: variant.purpose || routeJob.purpose || defaults.purpose || "Move from the shop to a mapped work area.",
    summary: variant.summary || routeJob.summary || dispatch?.summary || defaults.summary || "",
    unlockCondition: variant.unlockCondition || routeJob.unlockCondition || defaults.unlockCondition || "Unlocked by dispatch-board progression.",
    rewards: variant.rewards || routeJob.rewards || defaults.rewards || "Job pay, XP, reputation, and route history if the work closes cleanly.",
    riskTags: variant.riskTags || routeJob.riskTags || defaults.riskTags || [],
  };
}

function getRouteStatus(route) {
  const travelCount = getRouteTravelCount(route.id);
  const pressure = routeHasConsequencePressure(route);
  if (route.planned) return "Future candidate";
  if (getCurrentDispatchRouteId() === route.id) {
    if (canFastTravelRoute(route)) return pressure ? "Active / fast travel / consequence pressure" : "Active / fast travel available";
    return pressure ? "Active / consequence pressure" : "Active";
  }
  if (canLaunchRouteFromRegionalMap(route.id)) return pressure ? "Available / consequence pressure" : "Available";
  if (isFastTravelUnlocked(route)) return pressure ? "Driven before / fast travel / consequence pressure" : "Driven before / fast travel unlocked";
  if (travelCount > 0) return pressure ? `Completed / consequence pressure (${travelCount})` : `Completed / driven before (${travelCount})`;
  if (getRouteLockReason(route)) return pressure ? "Locked / consequence pressure" : "Locked";
  return pressure ? "Consequence pressure" : "Story route";
}

function getRouteDrivenText(route) {
  const travelCount = getRouteTravelCount(route.id);
  return travelCount > 0 ? `Yes (${travelCount} drive${travelCount === 1 ? "" : "s"})` : "No";
}

function getRouteFastTravelText(route) {
  if (!route.fastTravelEligible) return "Not available for this story route.";
  if (canFastTravelRoute(route)) return `Available now for ${getFastTravelEnergyCost(route)} energy.`;
  if (isFastTravelUnlocked(route)) return `Unlocked, but only from ${route.fromLabel} while this route is active on the board.`;
  return `Locked until this route has been driven once; then costs ${getFastTravelEnergyCost(route)} energy.`;
}

function getTravelResultDeltaText(result) {
  const deltas = [];
  if (result.energyDelta) deltas.push(`${formatSignedNumber(result.energyDelta)} energy`);
  if (result.cashDelta) deltas.push(`${result.cashDelta > 0 ? "+" : "-"}${formatCash(Math.abs(result.cashDelta))}`);
  if (result.burnoutDelta) deltas.push(`${formatSignedNumber(result.burnoutDelta)} burnout`);
  return deltas.length ? deltas.join(", ") : "no stat change";
}

function getTravelResultText(result) {
  if (!result) return "";
  const arrival = result.arrivalClock ? ` Arrived ${result.arrivalClock}.` : "";
  const count = result.travelCount ? ` Route driven ${result.travelCount} time${result.travelCount === 1 ? "" : "s"}.` : "";
  return `${result.mode || "Drive"}: ${getTravelResultDeltaText(result)}.${arrival}${count}`;
}

function getLastTravelResult(route) {
  return state.flags.travelResults?.[route.id] || null;
}

function getRouteTravelCostRisk(route) {
  const choices = getRouteChoices(route);
  const costs = [];
  if (route.arrivalTime) costs.push(`arrival ${route.arrivalTime}`);
  if (choices.length) {
    const choiceImpacts = choices.map((choice) => {
      const impacts = [];
      if (choice.energyDelta) impacts.push(`${choice.energyDelta > 0 ? "+" : ""}${choice.energyDelta} energy`);
      if (choice.cashDelta) impacts.push(`${choice.cashDelta > 0 ? "+" : "-"}$${Math.abs(choice.cashDelta)}`);
      if (choice.burnoutDelta) impacts.push(`${choice.burnoutDelta > 0 ? "+" : ""}${choice.burnoutDelta} burnout`);
      if (choice.arrivalTime && choice.arrivalTime !== route.arrivalTime) impacts.push(`arrival ${choice.arrivalTime}`);
      return `${choice.label}${impacts.length ? ` (${impacts.join(", ")})` : ""}`;
    });
    costs.push(`choices: ${choiceImpacts.join("; ")}`);
  } else {
    costs.push(route.fastTravelEligible ? "standard drive; fast travel can unlock after route history" : "standard drive");
  }
  if (route.fastTravelEligible) costs.push(`fast travel cost ${getFastTravelEnergyCost(route)} energy`);
  return costs.join("; ");
}

function getRouteLockReason(route) {
  if (route.planned) return "Future candidate; mapped for preview but not launchable yet.";
  if (canLaunchRouteFromRegionalMap(route.id) || getCurrentDispatchRouteId() === route.id || canFastTravelRoute(route)) return "";
  if (state.flags.endShiftPending) return "End-shift closeout is pending.";
  if (route.id === "centerCityTutorial") {
    if (state.flags.finished) return "First-day Center City route is already complete.";
    if (!state.flags.shopBrief) return "Talk to the supervisor before loading the van.";
    if (!hasLoadedItems(content.tutorial.shopLoad)) return "Load all staged cargo into Van #3.";
  }
  if (!state.flags.finished) return "Complete the first Center City job before later board routes unlock.";
  const activeRoute = getWorldRoute(getCurrentDispatchRouteId());
  if (activeRoute && activeRoute.id !== route.id) return `Current board route is ${activeRoute.toLabel}.`;
  const currentArea = getCurrentWorldArea();
  if (currentArea?.id && route.fromAreaId !== currentArea.id) return `Starts from ${route.fromLabel}; current area is ${currentArea.label || currentArea.id}.`;
  if (route.fastTravelEligible && !isFastTravelUnlocked(route)) return "Drive this route once from the dispatch board to unlock fast travel.";
  return "Not active on the current dispatch board.";
}

function getRouteCardMarkup(route) {
  const job = getRouteJobData(route.id);
  const details = getRouteJobCardRows(route)
    .map((row) => `${row.label}: ${row.detail}`);
  return `
    <li>
      <strong>${escapeHtml(`[${getRouteStatus(route)}] ${route.toLabel} - ${job.title}`)}</strong>
      <span>${escapeHtml(details.join(" "))}</span>
    </li>
  `;
}

function getRouteMapDetail(route) {
  const job = getRouteJobData(route.id);
  return `${getRouteStatus(route)} | ${job.title} | ${getRouteTravelCostRisk(route)} | fast travel: ${getRouteFastTravelText(route)}`;
}

function getFastTravelRoutes() {
  return getWorldRoutes().filter(canFastTravelRoute);
}

function isCurrentBoardRoute(route) {
  return getCurrentDispatchRouteId() === route.id;
}

function isRouteAvailableOnMap(route) {
  return !isCurrentBoardRoute(route) && canLaunchRouteFromRegionalMap(route.id);
}

function getRouteListMarkup(routes, emptyMessage) {
  if (!routes.length) return `<p class="muted">${emptyMessage}</p>`;
  return `
    <ul class="modal-list">
      ${routes.map((route) => getRouteCardMarkup(route)).join("")}
    </ul>
  `;
}

function getRegionalRouteMarkup() {
  const routes = getWorldRoutes();
  if (!routes.length) return "<p class=\"muted\">No routes mapped yet.</p>";
  const activeRoutes = routes.filter(isCurrentBoardRoute);
  const availableRoutes = routes.filter(isRouteAvailableOnMap);
  const pressureRoutes = routes.filter(routeHasConsequencePressure);
  const fastTravelRoutes = routes.filter((route) => !isCurrentBoardRoute(route)
    && !isRouteAvailableOnMap(route)
    && isFastTravelUnlocked(route));
  const completedRoutes = routes.filter((route) => !isCurrentBoardRoute(route)
    && !isRouteAvailableOnMap(route)
    && !isFastTravelUnlocked(route)
    && getRouteTravelCount(route.id) > 0);
  const lockedRoutes = routes.filter((route) => !isCurrentBoardRoute(route)
    && !isRouteAvailableOnMap(route)
    && !isFastTravelUnlocked(route)
    && getRouteTravelCount(route.id) === 0);
  return `
    <h3>Active Job Route</h3>
    ${getRouteListMarkup(activeRoutes, "No active route is ready from the map. Check the dispatch board.")}
    <h3>Available Routes</h3>
    ${getRouteListMarkup(availableRoutes, "No additional route is launchable from the current area.")}
    <h3>Callback / Return-Trip Pressure</h3>
    ${getRouteListMarkup(pressureRoutes, "No mapped routes are carrying callback or return-trip pressure.")}
    <h3>Unlocked Fast-Travel Routes</h3>
    ${getRouteListMarkup(fastTravelRoutes, "No repeat routes have unlocked fast travel yet.")}
    <h3>Completed Route History</h3>
    ${getRouteListMarkup(completedRoutes, "No completed non-repeat routes are on the history ledger yet.")}
    <h3>Locked Future Candidates</h3>
    ${getRouteListMarkup(lockedRoutes, "No locked route candidates remain.")}
  `;
}

function getKnownDestinationMarkup() {
  const routes = getWorldRoutes();
  const destinationIds = new Set([content.world?.homeAreaId, ...routes.map((route) => route.toAreaId)]);
  const currentArea = getCurrentWorldArea();
  const destinations = [...destinationIds].map((areaId) => getWorldArea(areaId)).filter(Boolean);
  if (!destinations.length) return "<p class=\"muted\">No destinations mapped yet.</p>";
  return `
    <ul class="modal-list">
      ${destinations.map((area) => {
        const region = getWorldRegion(area.regionId);
        const inboundRoutes = routes.filter((route) => route.toAreaId === area.id);
        const driven = inboundRoutes.some((route) => getRouteTravelCount(route.id) > 0);
        const active = inboundRoutes.some(isCurrentBoardRoute);
        const available = inboundRoutes.some((route) => canLaunchRouteFromRegionalMap(route.id));
        const destinationState = active ? "active route" : available ? "available route" : driven ? "visited" : "mapped candidate";
        return `
          <li>
            <strong>${escapeHtml(area.label)}${currentArea?.id === area.id ? " (current)" : ""}</strong>
            <span>${escapeHtml(`${region?.name || "Unmapped region"} | ${destinationState}`)}</span>
          </li>
        `;
      }).join("")}
    </ul>
  `;
}

function showRegionalMap() {
  if (shouldIntroduceJoshBeforeNextDispatch()) return notifyJoshIntroRequired();
  if (state.flags.endShiftPending) return showEndShiftModal();
  const currentArea = getCurrentWorldArea();
  const currentRegion = getWorldRegion(currentArea?.regionId);
  const fastTravelRoutes = getFastTravelRoutes();
  const activeRoute = getWorldRoute(getCurrentDispatchRouteId());
  const canDriveActiveRoute = Boolean(activeRoute && canLaunchRouteFromRegionalMap(activeRoute.id));
  const currentLocation = [
    currentRegion?.name,
    currentArea?.label,
  ].filter(Boolean).join(" - ") || "Unmapped";
  showModal({
    kicker: "Regional Map",
    title: "Greater Philadelphia Workday",
    body: `
      <div class="results-grid">
        <span>Current area</span><strong>${escapeHtml(currentLocation)}</strong>
        <span>Vehicle</span><strong>${escapeHtml(getVehicleName())}</strong>
        <span>Last route</span><strong>${escapeHtml(state.flags.lastRouteId || "None")}</strong>
      </div>
      <p class="muted">Fast travel unlocks after you have driven an eligible route once. It still respects active board prep and costs route energy.</p>
      <h3>Current Work</h3>
      ${getWorkdayLoopGuidanceMarkup()}
      <h3>Known Destinations</h3>
      ${getKnownDestinationMarkup()}
      <h3>Area Transitions</h3>
      ${getCurrentAreaPortalMarkup()}
      ${getRegionalRouteMarkup()}
    `,
    actions: [
      ...(canDriveActiveRoute ? [{
        label: `Review / Drive ${activeRoute.toLabel}`,
        onClick: () => showRoutePrepModal(activeRoute.id, { backAction: showRegionalMap, backLabel: "Back To Map" }),
      }] : []),
      ...(canLaunchRouteFromRegionalMap("centerCityTutorial") ? [{
        label: "Drive to Center City East",
        onClick: () => showRoutePrepModal("centerCityTutorial", { backAction: showRegionalMap, backLabel: "Back To Map" }),
      }] : []),
      ...(state.flags.finished && !state.flags.endShiftPending ? [{
        label: "Review Dispatch Board Routes",
        className: "secondary-button",
        onClick: showDispatchPreview,
      }] : []),
      ...(getConsequenceLedgerEntries().length ? [{
        label: "Review Consequence Ledger",
        className: "secondary-button",
        onClick: showConsequenceReview,
      }] : []),
      ...fastTravelRoutes.map((route) => ({
        label: `Fast Travel to ${route.toLabel}`,
        className: "secondary-button",
        onClick: () => showRoutePrepModal(route.id, { fastTravel: true, backAction: showRegionalMap, backLabel: "Back To Map" }),
      })),
      { label: "Back To Van", className: "secondary-button", onClick: showVehicleMenu },
      { label: "Close", className: "text-button", onClick: render },
    ],
  });
}

function getScenePortalInteractions(sceneId = state.sceneId) {
  const area = getWorldAreaByScene(sceneId);
  if (!area) return [];
  return Object.values(content.world?.portals || {})
    .filter((portal) => portal.fromAreaId === area.id
      && isPortalVisibleForState(portal)
      && typeof portal.x === "number"
      && typeof portal.y === "number")
    .map((portal) => ({
      x: portal.x,
      y: portal.y,
      label: portal.label,
      detail: getPortalDetailText(portal),
      portalId: portal.id,
      portalKind: portal.kind,
      markerKind: portal.kind === "returnRoute" ? "return" : "door",
      markerText: portal.kind === "returnRoute" ? "RETURN" : "DOOR",
      action: () => usePortal(portal.id),
    }));
}

function isPortalVisibleForState(portal) {
  if (portal.hiddenWhenFlag && state.flags[portal.hiddenWhenFlag]) return false;
  if (portal.showWhenFlag && !state.flags[portal.showWhenFlag]) return false;
  return true;
}

function getCurrentReturnPortal() {
  const area = getCurrentWorldArea();
  if (!area) return null;
  return Object.values(content.world?.portals || {}).find((portal) => (
    portal.kind === "returnRoute"
    && portal.fromAreaId === area.id
    && isPortalVisibleForState(portal)
    && (!portal.requiredFlag || state.flags[portal.requiredFlag])
  )) || null;
}

function isPortalReady(portal) {
  return Boolean(portal) && (!portal.requiredFlag || Boolean(state.flags[portal.requiredFlag]));
}

function getPortalDestinationLabel(portal) {
  const destination = getWorldArea(portal?.toAreaId);
  const region = getWorldRegion(destination?.regionId);
  if (!destination) return "Unmapped destination";
  return `${destination.label}${region?.name ? `, ${region.name}` : ""}`;
}

function getPortalOriginLabel(portal) {
  const origin = getWorldArea(portal?.fromAreaId);
  const region = getWorldRegion(origin?.regionId);
  if (!origin) return "Unmapped origin";
  return `${origin.label}${region?.name ? `, ${region.name}` : ""}`;
}

function getPortalStatusText(portal) {
  if (!portal) return "Unmapped";
  if (isPortalReady(portal)) return "Ready";
  return `Locked: ${portal.requiredMessage || `${portal.label} is not available yet.`}`;
}

function getPortalRequirementText(portal) {
  if (!portal) return "No transition data.";
  if (!portal.requiredFlag) return "No local blocker.";
  if (isPortalReady(portal)) return "Requirement met.";
  return portal.requiredMessage || `${portal.label} is not available yet.`;
}

function getPortalTravelEffectText(portal) {
  if (!portal) return "No travel effect mapped.";
  if (portal.kind === "returnRoute") {
    return `${portal.returnSource || portal.label || "Current job"} return. ${portal.returnLog || "Returns to Radnor Rack & Wire."}`;
  }
  const effects = [];
  if (portal.arrivalClock) effects.push(`Arrive ${portal.arrivalClock}.`);
  if (portal.arrivalLog) effects.push(portal.arrivalLog);
  if (portal.transition?.body) effects.push(portal.transition.body);
  return effects.join(" ") || "Moves to the destination area.";
}

function getPortalDetailText(portal) {
  if (!portal) return "Transition is not mapped.";
  const destination = getPortalDestinationLabel(portal);
  return `${getPortalStatusText(portal)} Destination: ${destination}.`;
}

// Portals are spatial transitions; route history and completion flags decide when they unlock.
function getPortalCardRows(portal) {
  return [
    { label: "Label", detail: portal?.label || "Unmapped transition" },
    { label: "Origin", detail: getPortalOriginLabel(portal) },
    { label: "Destination", detail: getPortalDestinationLabel(portal) },
    { label: "Status", detail: getPortalStatusText(portal) },
    { label: "Requirement", detail: getPortalRequirementText(portal) },
    { label: portal?.kind === "returnRoute" ? "Return effect" : "Travel effect", detail: getPortalTravelEffectText(portal) },
    { label: "Now", detail: getWorkdayLoopStage(getObjective()) },
  ];
}

function getPortalCardMarkup(portal) {
  const details = getPortalCardRows(portal)
    .map((row) => `${row.label}: ${row.detail}`)
    .join(" ");
  return `
    <li>
      <strong>${escapeHtml(`[${getPortalStatusText(portal)}] ${portal?.label || "Area transition"}`)}</strong>
      <span>${escapeHtml(details)}</span>
    </li>
  `;
}

function getCurrentAreaPortals() {
  const area = getCurrentWorldArea();
  if (!area) return [];
  return Object.values(content.world?.portals || {})
    .filter((portal) => portal.fromAreaId === area.id && isPortalVisibleForState(portal));
}

function getCurrentAreaPortalMarkup() {
  const portals = getCurrentAreaPortals();
  if (!portals.length) return "<p class=\"muted\">No mapped area transitions are visible from here yet.</p>";
  return `<ul class="modal-list">${portals.map((portal) => getPortalCardMarkup(portal)).join("")}</ul>`;
}

function getPortalBriefText(portal) {
  const destination = getPortalDestinationLabel(portal);
  if (isPortalReady(portal)) return `Ready: ${portal.label} -> ${destination}.`;
  return `Locked: ${portal.label} -> ${destination}. Requirement: ${getPortalRequirementText(portal)}`;
}

function getCurrentAreaTransitionBriefText() {
  const portals = getCurrentAreaPortals();
  if (!portals.length) return "";
  return portals.map(getPortalBriefText).join(" ");
}

function getPortalTransitionMarkup(portal) {
  return `
    <div class="results-grid">
      ${getPortalCardRows(portal).map((row) => `
        <span>${escapeHtml(row.label)}</span><strong>${escapeHtml(row.detail)}</strong>
      `).join("")}
    </div>
  `;
}

function getRouteArrivalClock(route, routeChoice = null) {
  const arrivalTime = routeChoice?.arrivalTime || route?.arrivalTime;
  if (!arrivalTime) return null;
  if (/^[A-Z]{3} /.test(arrivalTime)) return arrivalTime;
  return `${state.clock.slice(0, 3)} ${arrivalTime}`;
}

function getTimeOnCurrentDay(time) {
  if (!time) return null;
  if (/^[A-Z]{3} /.test(time)) return time;
  return `${state.clock.slice(0, 3)} ${time}`;
}

function getRouteLineMarkup(route) {
  return `<div class="route-line"><span>${escapeHtml(route.fromLabel)}</span><i></i><span>${escapeHtml(route.toLabel)}</span></div>`;
}

function recordRouteTravel(route, routeChoice = null) {
  state.flags.routeHistory ||= {};
  state.flags.routeHistory[route.id] = (state.flags.routeHistory[route.id] || 0) + 1;
  state.flags.lastRouteId = route.id;
  if (routeChoice?.id) {
    state.flags.routeChoiceHistory ||= {};
    state.flags.routeChoiceHistory[route.id] = routeChoice.id;
  }
  if (route.toAreaId) state.flags.currentAreaId = route.toAreaId;
}

function recordTravelResult(route, routeChoice = null, { fastTravel = false, before = {} } = {}) {
  const result = {
    routeId: route.id,
    destination: route.toLabel,
    mode: fastTravel ? "Fast travel" : routeChoice?.label || "Standard drive",
    choiceId: routeChoice?.id || "",
    energyDelta: state.energy - (before.energy ?? state.energy),
    cashDelta: state.cash - (before.cash ?? state.cash),
    burnoutDelta: state.burnout - (before.burnout ?? state.burnout),
    startClock: before.clock || "",
    arrivalClock: state.clock,
    travelCount: getRouteTravelCount(route.id),
  };
  state.flags.travelResults ||= {};
  state.flags.travelResults[route.id] = result;
  state.flags.travelResultLog ||= [];
  state.flags.travelResultLog.push(result);
  state.flags.travelResultLog = state.flags.travelResultLog.slice(-8);
  addLog(`Travel result recorded for ${route.toLabel}: ${getTravelResultDeltaText(result)}.`);
}

function applyRouteChoice(route, routeChoice) {
  if (!routeChoice) return;
  if (routeChoice.energyDelta) changeEnergy(routeChoice.energyDelta);
  if (routeChoice.cashDelta) state.cash += routeChoice.cashDelta;
  if (routeChoice.burnoutDelta) state.burnout = Math.max(0, state.burnout + routeChoice.burnoutDelta);
  addLog(routeChoice.log || `${routeChoice.label} selected for ${route.toLabel}.`);
}

function applyFastTravelRoute(route) {
  const energyCost = getFastTravelEnergyCost(route);
  changeEnergy(-energyCost);
  state.flags.fastTravelHistory ||= {};
  state.flags.fastTravelHistory[route.id] = (state.flags.fastTravelHistory[route.id] || 0) + 1;
  state.flags.lastFastTravelRouteId = route.id;
  addLog(`Used the known ${route.toLabel} route. Fast travel cost ${energyCost} energy.`);
}

function travelRoute(routeId, { beforeTravel, afterTravel, routeChoice, fastTravel = false } = {}) {
  const route = getWorldRoute(routeId);
  if (!route) return notify(`Route ${routeId} is not mapped yet.`);
  beforeTravel?.(route);
  const before = {
    energy: state.energy,
    cash: state.cash,
    burnout: state.burnout,
    clock: state.clock,
  };
  if (fastTravel) applyFastTravelRoute(route);
  applyRouteChoice(route, routeChoice);
  if (route.packedLunchContext) consumePackedLunch(route.packedLunchContext);
  const arrivalClock = getRouteArrivalClock(route, routeChoice);
  if (arrivalClock) setClock(arrivalClock);
  if (route.arrivalLog) addLog(route.arrivalLog);
  recordRouteTravel(route, routeChoice);
  recordTravelResult(route, routeChoice, { fastTravel, before });
  if (afterTravel) return afterTravel(route);
  if (route.destinationSceneId) return enterScene(route.destinationSceneId);
  return render();
}

function recordPortalUse(portal) {
  state.flags.portalHistory ||= {};
  state.flags.portalHistory[portal.id] = (state.flags.portalHistory[portal.id] || 0) + 1;
  state.flags.lastPortalId = portal.id;
  if (portal.toAreaId) state.flags.currentAreaId = portal.toAreaId;
}

function finishPortal(portal) {
  if (portal.kind === "returnRoute") return finishReturnPortal(portal);
  const destination = getWorldArea(portal.toAreaId);
  if (!destination?.sceneId) return notify(`${portal.label} is not connected to a scene yet.`);
  const arrivalClock = getTimeOnCurrentDay(portal.arrivalClock);
  if (arrivalClock) setClock(arrivalClock);
  if (portal.arrivalLog) addLog(portal.arrivalLog);
  recordPortalUse(portal);
  enterScene(destination.sceneId, portal.toPlayerStart || null);
}

function finishReturnPortal(portal) {
  recordPortalUse(portal);
  returnToShopAfterDispatch(
    portal.returnSource || portal.label || "Job",
    portal.returnLog || "Returned to Radnor Rack & Wire.",
  );
}

function getReturnMarkerInstruction(portal = getCurrentReturnPortal()) {
  if (!portal) return "";
  return `The ${portal.label} RETURN marker is active in this area. Leave this review, walk to that marker, and interact with it when you are ready to head back.`;
}

function getReturnPortalCloseoutNoteMarkup() {
  const instruction = getReturnMarkerInstruction();
  return instruction ? `<p class="muted">${escapeHtml(instruction)}</p>` : "";
}

function showReturnMarkerReady(portal) {
  addLog(`${portal.label} is ready. Walk to the marked RETURN point when you are ready to leave.`);
  closeModal();
  render();
}

function returnToShopViaCurrentExit(fallbackSource, fallbackMessage) {
  const portal = getCurrentReturnPortal();
  if (portal) return showReturnMarkerReady(portal);
  returnToShopAfterDispatch(fallbackSource, fallbackMessage);
}

function getCloseoutReturnAction(source, message, { beforeReturn = null } = {}) {
  const portal = getCurrentReturnPortal();
  return {
    label: portal ? "Back To Area" : "Return to Radnor Rack & Wire",
    onClick: () => {
      if (typeof beforeReturn === "function") beforeReturn();
      returnToShopViaCurrentExit(source, message);
    },
  };
}

function showCompletedDispatchReturnReview({ title = "Job Already Complete", source = "This job", result = "" } = {}) {
  const portal = getCurrentReturnPortal();
  showModal({
    kicker: "Job Review",
    title,
    body: `
      <p>${escapeHtml(source)} is already closed out. The consequence choice is locked in.</p>
      <div class="results-grid">
        ${result ? `<span>Result</span><strong>${escapeHtml(result)}</strong>` : ""}
        <span>Return route</span><strong>${portal ? `${escapeHtml(portal.label)} marker is ready` : "Already back at shop or no site exit is active"}</strong>
      </div>
      <p class="muted">Walk to the RETURN marker to leave the area. No more energy, wages, XP, or reputation changes can be taken from this closeout.</p>
    `,
    actions: [{ label: "Back To Area", onClick: render }],
  });
}

function getCompletedCloseoutPathResult(flagKey) {
  const approach = state.flags[flagKey];
  return approach ? `Closeout path: ${approach}` : "";
}

function usePortal(portalId) {
  const portal = getWorldPortal(portalId);
  if (!portal) return notify(`Portal ${portalId} is not mapped yet.`);
  if (portal.requiredFlag && !state.flags[portal.requiredFlag]) {
    return showModal({
      kicker: "Area Transition",
      title: `${portal.label} Locked`,
      body: `
        ${getPortalTransitionMarkup(portal)}
        <p class="muted">${escapeHtml(portal.requiredMessage || `${portal.label} is not available yet.`)}</p>
        <p class="muted">Current step: ${escapeHtml(getObjective())}</p>
      `,
      actions: [{ label: "Back To Area", onClick: render }],
    });
  }
  if (portal.transition) {
    return showModal({
      kicker: portal.transition.kicker || "Area Transition",
      title: portal.transition.title || portal.label,
      body: `
        ${getPortalTransitionMarkup(portal)}
        <p>${escapeHtml(portal.transition.body || portal.label)}</p>
        ${getReturnPortalDepartureMarkup(portal)}
      `,
      actions: [{ label: portal.transition.actionLabel || portal.label, onClick: () => finishPortal(portal) }],
    });
  }
  return finishPortal(portal);
}

function getRouteChoiceImpactMarkup(choice) {
  const impacts = [];
  if (choice.arrivalTime) impacts.push(`Arrive ${choice.arrivalTime}`);
  if (choice.energyDelta) impacts.push(`${choice.energyDelta > 0 ? "+" : ""}${choice.energyDelta} energy`);
  if (choice.cashDelta) impacts.push(`${choice.cashDelta > 0 ? "+" : "-"}$${Math.abs(choice.cashDelta)}`);
  if (choice.burnoutDelta) impacts.push(`${choice.burnoutDelta > 0 ? "+" : ""}${choice.burnoutDelta} burnout`);
  return impacts.length ? ` <em>${escapeHtml(impacts.join(" / "))}</em>` : "";
}

function showRouteChoiceModal({ routeId, dispatchEstimate, extraBody = "", actionLabel, beforeTravel, afterTravel }) {
  const route = getWorldRoute(routeId);
  if (!route) return notify(`Route ${routeId} is not mapped yet.`);
  const choices = getRouteChoices(route);
  if (!choices.length) {
    return showTravelRouteModal({ routeId, dispatchEstimate, extraBody, actionLabel, beforeTravel, afterTravel });
  }
  showModal({
    kicker: "Route Choice",
    title: `${route.fromLabel} -> ${route.toLabel}`,
    body: `
      ${dispatchEstimate ? `<p><strong>Work-order estimate:</strong> ${dispatchEstimate}</p>` : ""}
      ${extraBody}
      ${getRouteLineMarkup(route)}
      <ul class="modal-list">
        ${choices.map((choice) => `
          <li>
            <strong>${escapeHtml(choice.label)}${getRouteChoiceImpactMarkup(choice)}</strong>
            <span>${escapeHtml(choice.detail)}</span>
          </li>
        `).join("")}
      </ul>
    `,
    actions: choices.map((choice, index) => ({
      label: choice.label,
      className: index === 0 ? undefined : "secondary-button",
      onClick: () => showTravelRouteModal({
        routeId,
        dispatchEstimate,
        extraBody: `${extraBody}<p class="muted"><strong>Route approach:</strong> ${escapeHtml(choice.label)}. ${escapeHtml(choice.detail)}</p>`,
        actionLabel,
        beforeTravel,
        afterTravel,
        routeChoice: choice,
      }),
    })),
  });
}

function showTravelRouteModal({ routeId, dispatchEstimate, extraBody = "", actionLabel, beforeTravel, afterTravel, routeChoice = null, fastTravel = false }) {
  const route = getWorldRoute(routeId);
  if (!route) return notify(`Route ${routeId} is not mapped yet.`);
  const fastTravelCost = getFastTravelEnergyCost(route);
  showModal({
    kicker: fastTravel ? "Fast Travel" : "Route Summary",
    title: `${route.fromLabel} -> ${route.toLabel}`,
    body: `
      ${dispatchEstimate ? `<p><strong>Work-order estimate:</strong> ${dispatchEstimate}</p>` : ""}
      ${fastTravel ? `<p class="expense"><strong>Fast travel:</strong> Known route shortcut, -${fastTravelCost} energy.</p>` : ""}
      ${extraBody}
      ${getRouteLineMarkup(route)}
      <div class="results-grid">
        <span>Route status</span><strong>${escapeHtml(getRouteStatus(route))}</strong>
        <span>Travel cost / risk</span><strong>${escapeHtml(getRouteTravelCostRisk(route))}</strong>
        <span>Driven before</span><strong>${escapeHtml(getRouteDrivenText(route))}</strong>
        <span>Fast travel</span><strong>${escapeHtml(getRouteFastTravelText(route))}</strong>
      </div>
    `,
    actions: [{
      label: actionLabel || (fastTravel ? `Fast Travel to ${route.toLabel}` : route.actionLabel || `Drive to ${route.toLabel}`),
      onClick: () => travelRoute(routeId, { beforeTravel, afterTravel, routeChoice, fastTravel }),
    }],
  });
}

function getRouteSummaryLaunchPreview(route, { fastTravel = false } = {}) {
  if (!route) return "This route is not mapped yet.";
  if (fastTravel) {
    return `Review the known-route shortcut, then spend ${getFastTravelEnergyCost(route)} energy to arrive.`;
  }
  return `Review the ${route.toLabel} drive summary before leaving.`;
}

function getRouteLaunchFlow(routeId, { fastTravel = false } = {}) {
  const route = getWorldRoute(routeId);
  const routeSummary = getRouteSummaryLaunchPreview(route, { fastTravel });
  const flow = (preview, launch) => ({ preview, launch });
  if (routeId === "centerCityTutorial") {
    const preview = !fastTravel && getRouteChoices(route).length
      ? "Choose a route approach, then review the drive summary."
      : routeSummary;
    return flow(preview, () => promptTravel());
  }
  if (routeId === "conshohockenService") {
    if (isConshohockenFollowupAvailable()) {
      return flow(
        fastTravel ? routeSummary : "Review the Conshohocken follow-up drive summary before leaving.",
        () => promptConshohockenFollowupTravel({ fastTravel }),
      );
    }
    if (!state.flags.servicePreparation) return flow("Review service prep before travel.", showServicePreparation);
    return flow(
      fastTravel ? routeSummary : "Review the Conshohocken service drive summary before leaving.",
      () => promptServiceTravel({ fastTravel }),
    );
  }
  if (routeId === "universitySurvey") {
    if (!state.flags.surveyPreparation) return flow("Review site-survey prep before travel.", showSurveyPreparation);
    return flow(
      fastTravel ? routeSummary : "Review the University City survey drive summary before leaving.",
      () => promptSurveyTravel({ fastTravel }),
    );
  }
  if (routeId === "navyYardAccess") {
    if (!state.flags.secureAccessPreparation) return flow("Review secure-access prep before travel.", showSecureAccessPreparation);
    return flow(
      fastTravel ? routeSummary : "Review the Navy Yard drive summary before leaving.",
      () => promptSecureAccessTravel({ fastTravel }),
    );
  }
  if (routeId === "systemsService") {
    if (!state.flags.systemsPreparation) return flow("Review systems-service prep before travel.", showSystemsPreparation);
    return flow(
      fastTravel ? routeSummary : "Review the King of Prussia systems drive summary before leaving.",
      () => promptSystemsTravel({ fastTravel }),
    );
  }
  if (routeId === "burlingtonRetrofitWalkdown") {
    if (state.flags.retrofitWalkdownComplete && !state.flags.retrofitInstallComplete) {
      if (!state.flags.retrofitInstallPackageReviewed) return flow("Review the saved walkdown package before the install drive.", showRetrofitInstallPackage);
      return flow(
        fastTravel ? routeSummary : "Review the Burlington install drive summary before leaving.",
        () => promptRetrofitInstallTravel({ fastTravel }),
      );
    }
    if (!state.flags.retrofitWalkdownPreparation) return flow("Review retrofit walkdown prep before travel.", showRetrofitWalkdownPreparation);
    return flow(
      fastTravel ? routeSummary : "Review the Burlington walkdown drive summary before leaving.",
      () => promptRetrofitWalkdownTravel({ fastTravel }),
    );
  }
  if (routeId === "southPhillyCommissioning") return flow(routeSummary, () => promptCommissioningTravel({ fastTravel }));
  if (routeId === "warrantyReturn") return flow(routeSummary, () => promptCallbackCleanupTravel({ fastTravel }));
  if (routeId === "executiveHandoff") return flow(routeSummary, () => promptHandoffTravel({ fastTravel }));
  return flow("That route is not connected to the dispatch board yet.", () => notify("That route is not connected to the dispatch board yet."));
}

function getRouteLaunchPreviewText(route, { fastTravel = false } = {}) {
  if (!route) return "Route is not mapped yet.";
  const lockReason = getRouteLockReason(route);
  if (lockReason) return `Locked: ${lockReason}`;
  return getRouteLaunchFlow(route.id, { fastTravel }).preview;
}

function getRoutePrepRows(route, { fastTravel = false } = {}) {
  const job = getRouteJobData(route.id);
  const destination = getWorldArea(route.toAreaId);
  const region = getWorldRegion(destination?.regionId);
  const toolPlan = getDispatchToolPlan(job.familyId, route.id);
  const lockReason = getRouteLockReason(route);
  return [
    { label: "Job", detail: job.title },
    { label: "Destination", detail: `${destination?.label || route.toLabel}${region?.name ? `, ${region.name}` : ""}` },
    { label: "Job family", detail: getJobFamilyName(job.familyId) },
    { label: "Purpose", detail: job.purpose },
    ...getRouteBranchRows(route),
    { label: "Route", detail: `${route.fromLabel} -> ${route.toLabel}` },
    { label: "Route status", detail: getRouteStatus(route) },
    { label: "What happens next", detail: getRouteLaunchPreviewText(route, { fastTravel }) },
    { label: fastTravel ? "Fast-travel cost" : "Travel cost / risk", detail: fastTravel ? `Known route shortcut, -${getFastTravelEnergyCost(route)} energy.` : getRouteTravelCostRisk(route) },
    { label: "Required prep", detail: getToolPlanText(toolPlan.required, { required: true }) },
    { label: "Recommended prep", detail: getToolPlanText(toolPlan.recommended) },
    { label: "Risk tags", detail: (job.riskTags || []).join(", ") || "ordinary field pressure" },
    { label: "Callback / return-trip risk", detail: getRouteConsequenceText(route) },
    getRouteConsequencePressureText(route) ? { label: "Mapped consequence pressure", detail: getRouteConsequencePressureText(route) } : null,
    { label: "Fast travel", detail: getRouteFastTravelText(route) },
    lockReason ? { label: "Locked reason", detail: lockReason } : null,
  ].filter(Boolean);
}

function getRoutePrepMarkup(route, options = {}) {
  return `
    <ul class="modal-list">
      ${getRoutePrepRows(route, options).map((row) => `
        <li><strong>${escapeHtml(row.label)}</strong><span>${escapeHtml(row.detail)}</span></li>
      `).join("")}
    </ul>
  `;
}

function showRoutePrepModal(routeId, { fastTravel = false, backAction = showVehicleMenu, backLabel = "Back To Van" } = {}) {
  const route = getWorldRoute(routeId);
  if (!route) return notify(`Route ${routeId} is not mapped yet.`);
  if (fastTravel && !canFastTravelRoute(route)) return notify("That fast travel route is not available for the current board route.");
  const lockReason = getRouteLockReason(route);
  const launchLabel = fastTravel ? `Fast Travel to ${route.toLabel}` : route.actionLabel || `Drive to ${route.toLabel}`;
  showModal({
    kicker: fastTravel ? "Fast Travel Prep" : "Route Prep",
    title: getRouteJobData(route.id).title,
    body: `
      ${getRoutePrepMarkup(route, { fastTravel })}
      <p class="muted">Prep is informational for now: missing recommended tools do not block the route, but they can change energy pressure, checks, or closeout quality.</p>
    `,
    actions: [
      ...(!lockReason ? [{
        label: launchLabel,
        onClick: () => launchRouteFromBoard(route.id, { fastTravel }),
      }] : []),
      { label: backLabel, className: "secondary-button", onClick: backAction },
      { label: "Close", className: "text-button", onClick: render },
    ],
  });
}

function showDispatchRoutePrep(routeId, backAction = showDispatchPreview) {
  return showRoutePrepModal(routeId, {
    backAction,
    backLabel: "Back To Job Card",
  });
}

function getDispatchRoutePrepAction(routeId, backAction, options = {}) {
  return {
    label: options.label || "Review Route & Prep",
    className: options.className,
    onClick: () => showDispatchRoutePrep(routeId, backAction),
  };
}

function launchRouteFromBoard(routeId, { fastTravel = false } = {}) {
  return getRouteLaunchFlow(routeId, { fastTravel }).launch();
}

function promptFastTravelRoute(routeId) {
  const route = getWorldRoute(routeId);
  if (!canFastTravelRoute(route)) return notify("That fast travel route is not available for the current board route.");
  return launchRouteFromBoard(routeId, { fastTravel: true });
}

function getNextShopLoad() {
  return content.tutorial.shopLoad.find((item) => !state.loaded.includes(item));
}

function getNextAssemblyItem() {
  return content.tutorial.assembly.find((item) => !state.assembled.includes(item.id));
}

function getWarehouseLocationTaskState(checkId) {
  const check = content.warehouseDispatch.checks.find((item) => item.id === checkId);
  return getFieldCheckTaskState({
    check,
    completedChecks: state.warehouseChecks,
    readyDetail: "Search this shop location for the replacement power supply.",
    completedDetail: `${check?.label || "That location"} is already searched.`,
  });
}

function getShopStagingTaskState(warehouseActive = state.flags.warehouseStarted && !state.flags.warehouseComplete) {
  if (warehouseActive) return getWarehouseLocationTaskState("staging");
  if (!state.flags.shopBrief) return getTaskState({ lockedReason: "Ask the supervisor what needs loading." });
  if (hasCarriedItems()) return getTaskState({ stateId: "inProgress", detail: "Hands are full; load carried gear into the van first." });
  if (!getNextShopLoad()) return getTaskState({ completed: true, detail: "Staged equipment is loaded into the van." });
  return getTaskState({ stateId: "ready", detail: "Pick up the next staged equipment group." });
}

function getVehicleInteractionTaskState() {
  if (hasCarriedItems()) {
    if (!canLoadVehicleCargo()) return getTaskState({ lockedReason: `${getVehicleName()} does not have room for that load.` });
    return getTaskState({ stateId: "ready", detail: `Load ${getCarriedLabels().join(" and ")} into ${getVehicleName()}.` });
  }
  return getTaskState({ stateId: "ready", detail: "Open cargo review, dispatch routes, regional map, and drive options." });
}

function getVehicleInteractionLabel() {
  return hasCarriedItems() ? `Load carried items into ${getVehicleName()}` : `Use ${getVehicleName()}`;
}

function getGarageUnloadTaskState() {
  if (!state.flags.garageBrief) return getTaskState({ lockedReason: "Talk to the supervisor beside the van first." });
  if (hasCarriedItems()) return getTaskState({ stateId: "inProgress", detail: "Hands are full; deliver the carried gear before unloading more." });
  const nextItems = content.tutorial.garageUnload.filter((item) => !state.delivered.includes(item));
  if (!nextItems.length) return getTaskState({ completed: true, detail: "Everything has been carried to the client entrance." });
  return getTaskState({ stateId: "ready", detail: "Unload the next box group from the van." });
}

function getGarageEntranceTaskState() {
  if (hasCarriedItems()) return getTaskState({ stateId: "ready", detail: `Deliver ${getCarriedLabels().join(" and ")} to the client entrance.` });
  if (state.flags.centerCityEquipmentDelivered) return getTaskState({ completed: true, detail: "The client entrance is ready to use." });
  return getTaskState({ lockedReason: "Carry equipment from the van before walking to the client entrance." });
}

function getServiceSwapTaskState() {
  if (!state.flags.serviceBrief) return getTaskState({ lockedReason: "Check in with the client contact first." });
  if (state.flags.serviceComplete) return getTaskState({ completed: true, detail: "The service swap is complete." });
  if (!state.flags.serviceInspected) return getTaskState({ stateId: "ready", detail: "Diagnose the failed display before opening replacement gear." });
  if (!hasCarriedItems()) return getTaskState({ lockedReason: "Pick up replacement gear before installing." });
  const check = getServiceAdjustedCheck(getServiceInstallCheck(state.carry));
  const resultState = getFieldTaskState(check);
  if (resultState.id !== "ready") return resultState;
  return getTaskState({ stateId: "ready", detail: `Install ${getServiceItemLabels(state.carry).join(" and ")}.` });
}

function getServicePickupTaskState() {
  if (!state.flags.serviceInspected) return getTaskState({ lockedReason: "Inspect the failed display before opening replacement gear." });
  if (hasCarriedItems()) return getTaskState({ stateId: "inProgress", detail: "Hands are full; install the carried replacement gear first." });
  const nextItems = content.serviceDispatch.swapItems
    .filter((item) => !state.serviceDelivered.includes(item.id) && !state.serviceInstalled.includes(item.id));
  if (!nextItems.length) return getTaskState({ completed: true, detail: "All replacement gear has been installed." });
  return getTaskState({ stateId: "ready", detail: "Pick up the next replacement gear group." });
}

function getCartPickupTaskState() {
  if (!state.flags.roomBrief) return getTaskState({ lockedReason: "Ask the supervisor how to start the cart build." });
  if (hasCarriedItems()) return getTaskState({ stateId: "inProgress", detail: "Hands are full; install the carried cart component first." });
  const next = getNextAssemblyItem();
  if (!next) return getTaskState({ completed: true, detail: "Both carts are assembled." });
  return getTaskState({ stateId: "ready", detail: `Pick up ${next.label}.` });
}

function getCartInstallTaskState(destination) {
  if (!state.flags.roomBrief) return getTaskState({ lockedReason: "Ask the supervisor how to start the cart build." });
  if (!hasCarriedItems()) return getTaskState({ lockedReason: "Pick up the next cart component first." });
  const part = content.tutorial.assembly.find((item) => item.id === state.carry[0]);
  if (!part) return getTaskState({ lockedReason: "The carried item is not a cart component." });
  if (part.destination !== destination) return getTaskState({ lockedReason: `${part.label} belongs on the other cart.` });
  const resultState = getFieldTaskState(part);
  if (resultState.id !== "ready") return resultState;
  return getTaskState({ stateId: "ready", detail: `Install ${part.label} on ${destination === "cart1" ? "Cart 1" : "Cart 2"}.` });
}

function promptTravel() {
  showRouteChoiceModal({
    routeId: "centerCityTutorial",
    dispatchEstimate: "Simple two-cart build. Supervisor onsite.",
    extraBody: "<p>Today's drive is scripted for the tutorial. Future jobs can offer route, toll, and parking choices.</p>",
    afterTravel: showParkingModal,
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
  usePortal("garageToLobby");
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
  if (state.flags.finished) {
    return state.flags.reward
      ? showCompletedDispatchReturnReview({
        title: "First Install Already Complete",
        source: "Two Quick Carts",
        result: getCompletedCloseoutPathResult("finishChoice"),
      })
      : showResults();
  }
  setClock("MON 5:46 PM");
  showModal({
    kicker: "Last Decision",
    title: "Cart 2 Works. The Cables Do Not Look Happy.",
    body: `
      <p>The work order expected you to be done hours ago. You can clean up the cable routing or leave before traffic gets worse.</p>
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
  if (state.flags.finished) {
    return state.flags.reward
      ? showCompletedDispatchReturnReview({
        title: "First Install Already Complete",
        source: "Two Quick Carts",
        result: getCompletedCloseoutPathResult("finishChoice"),
      })
      : showResults();
  }
  const before = getTrackedStateSnapshot();
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
  showResults({ before });
}

function showResults({ before = null } = {}) {
  const tidy = state.flags.finishChoice === "tidy";
  const netPay = tidy ? 152 : 141;
  const rewardTools = content.tutorial.rewardTools.filter((toolId) => !ownsTool(toolId));
  if (before) {
    const riskyWorkaround = state.flags.finishChoice === "wiley-workaround";
    const rushedRisk = state.flags.finishChoice === "rush" && state.flags.tutorialAssemblyCallbackRisk;
    recordJobSiteCloseoutSummary({
      source: "Two Quick Carts",
      result: getCompletedCloseoutPathResult("finishChoice"),
      before,
      consequences: [{
        source: "Two Quick Carts",
        status: tidy ? "controlled" : riskyWorkaround || rushedRisk ? "open" : "inherited",
        cause: tidy
          ? "Cable routing was cleaned up before packing out."
          : riskyWorkaround
          ? "Adapter workaround was used as the final install path."
          : "The cart build was closed quickly with a thinner final check.",
        affects: getReturnTripRiskAffectedWork("usedTemporaryAdapterPermanently"),
        detail: tidy
          ? "The first install leaves no named callback risk."
          : riskyWorkaround || rushedRisk
          ? "The closeout can create callback pressure or future warranty work."
          : "The shortcut is saved on the closeout path even without a named risk.",
      }],
    });
  }
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
      ${before ? `
        <h3>What Changed</h3>
        ${getTrackedStateDeltaMarkup(before)}
      ` : ""}
      <blockquote>Management note: "Please improve time management and plan parking more efficiently."</blockquote>
      <p>You survived your first week early. ${rewardTools.length ? "Choose one starter upgrade." : "Your starter kit already covers the current upgrade choices."}</p>
      ${getReturnPortalCloseoutNoteMarkup()}
    `,
    actions: rewardTools.length ? rewardTools.map((toolId) => ({
      label: content.tools[toolId].name,
      className: "secondary-button",
      onClick: () => chooseReward(toolId),
    })) : [getCloseoutReturnAction("Two Quick Carts", "Returned to Radnor Rack & Wire after the Center City cart build.", {
      beforeReturn: () => {
        state.flags.reward = "starter-kit";
        addLog("Starter kit already included the current upgrade choices.");
      },
    })],
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
      ${getReturnPortalCloseoutNoteMarkup()}
    `,
    actions: [getCloseoutReturnAction("Two Quick Carts", "Returned to Radnor Rack & Wire after the Center City cart build.", {
      beforeReturn: () => {
        addLog(`${content.tools[toolId].name} added to your personal kit.`);
      },
    })],
  });
}

function showPersonalKit() {
  if (shouldIntroduceJoshBeforeNextDispatch()) return notifyJoshIntroRequired();
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
      ${ownsTool("circuitHutOrganizer") ? `<p class="muted">Circuit Hut Parts Brain: ${partsBrainActive ? `active this job (${getUsedPartsBrainDispatches()[getCurrentDispatchKey()]})` : "unused for this job"}</p>` : ""}
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
      <p>This can help with testing during the current job. It does not automatically make the workaround acceptable for final closeout.</p>
      <blockquote>${state.technician.name}: "${getCharacterLine("partsBrainQuote", "This is fine for testing. Permanent is where the paperwork starts.")}"</blockquote>
    `,
    actions: [{ label: "Pocket It For Testing", onClick: render }],
  });
}

function showCareerClipboard() {
  if (shouldIntroduceJoshBeforeNextDispatch()) return notifyJoshIntroRequired();
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
      <p><strong>Consequence ledger:</strong></p>
      ${getConsequenceLedgerMarkup({ includeResolved: true })}
      <p><strong>Field task history:</strong></p>
      ${getFieldTaskResultLedgerMarkup()}
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
        : "Complete more jobs to unlock another field-training focus."}</p>
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
      description: "Staying late adds +1 Fieldcraft and +1 Documentation until the next job closes.",
    },
    {
      active: Boolean(state.flags.energyExhaustedThisShift || state.flags.exhaustionIncidentsThisShift),
      name: "Zero-energy pressure",
      description: "Hitting zero energy can cap ordinary recovery, lower skill checks, and turn unpaid effort into incidents.",
    },
    {
      active: Boolean(getConditionSkillPressureSummary()),
      name: "Field condition pressure",
      description: "Low energy and high burnout can lower skill checks before a full exhaustion crash.",
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
      <span>Exhaustion incidents</span><strong>${state.stats.exhaustionIncidents || 0}</strong>
      <span>Exhaustion mistakes</span><strong>${state.stats.exhaustionMistakes || 0}</strong>
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
      <span>Retrofit walkdowns completed</span><strong>${state.stats.retrofitWalkdownsCompleted || 0}</strong>
      <span>Retrofit risks documented</span><strong>${state.stats.retrofitRisksDocumented || 0}</strong>
      <span>Retrofit scope pushbacks</span><strong>${state.stats.retrofitScopePushbacks || 0}</strong>
      <span>Retrofit risks accepted</span><strong>${state.stats.retrofitRisksAccepted || 0}</strong>
      <span>Retrofit installs completed</span><strong>${state.stats.retrofitInstallsCompleted || 0}</strong>
      <span>Retrofit pathways installed</span><strong>${state.stats.retrofitPathwaysInstalled || 0}</strong>
      <span>Retrofit install risks resolved</span><strong>${state.stats.retrofitInstallRisksResolved || 0}</strong>
      <span>Retrofit install risks inherited</span><strong>${state.stats.retrofitInstallRisksInherited || 0}</strong>
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
  if (shouldHideJoshUntilNextMorning()) return notify("Close out the first day before catching Josh tomorrow morning.");
  const josh = content.coworkers.josh;
  if (!state.flags.metJosh) {
    state.flags.metJosh = true;
    if (state.flags.endShiftPending) {
      state.flags.joshIntroEndShiftSource = state.flags.endShiftSource || "current shift";
    }
    addLog("Met Josh, the lead technician. Management interrupted to blame him for an inventory problem.");
    return showModal({
      kicker: `${josh.name} / ${josh.role}`,
      title: "The Person Keeping This Place Running",
      body: `
        <p>Josh is sorting a pile of adapters into bins with labels that look newer than the shelves.</p>
        <p><strong>Manager, from the sales office:</strong> "Josh, why are we missing two HDMI couplers? This inventory situation is becoming a pattern."</p>
        <p><strong>Josh:</strong> "Morning. Ignore that. They zip-tied both couplers behind a display yesterday and called it spare inventory. If you get stuck onsite, slow down and trace the path before you start swapping things."</p>
      `,
      actions: [{ label: state.flags.endShiftPending ? "Close Out Shift" : "Thank Josh", onClick: state.flags.endShiftPending ? showEndShiftModal : render }],
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
  if (shouldShowRetrofitInstallDebrief()) return showRetrofitInstallDebrief();
  if (canReceiveJoshLabeler()) return showJoshLabelerOffer();
  notify(`Josh: "Label both ends. Future you is also a technician, and future you is already annoyed."`);
}

function showRetrofitInstallDebrief() {
  const branchId = state.flags.retrofitInstallBranch || getRetrofitInstallBranchIdFromFlags(state.flags);
  const branchLabel = getRetrofitInstallPreview()?.branch?.label || branchId;
  const resultSummary = getRetrofitInstallResultSummary(
    state.flags.retrofitInstallApproach,
    branchId,
    Boolean(state.flags.retrofitInstallCheckStrained),
  );
  const riskCopy = state.flags.retrofitInstallRiskInherited
    ? "Still visible on the ledger"
    : state.flags.retrofitInstallRiskResolved
    ? "Resolved by record/as-built notes"
    : "Controlled for this install";
  state.flags.retrofitInstallDebriefed = true;
  addLog("Debriefed the Burlington retrofit install with Josh before reviewing the career snapshot.");
  render();
  showModal({
    kicker: "Josh / Lead Technician",
    title: "The Ceiling Finally Has A Paper Trail",
    body: `
      <p>Josh has the Burlington photos open beside a label cassette and the kind of coffee that has become a troubleshooting tool by accident.</p>
      <p><strong>Josh:</strong> "Walkdown, install, then notes that admit what the ceiling actually did. That is a real little project. The board will call it one line item because the board has never held a ladder."</p>
      <div class="results-grid">
        <span>Inherited branch</span><strong>${escapeHtml(branchLabel)}</strong>
        <span>Install closeout</span><strong>${escapeHtml(resultSummary)}</strong>
        <span>Return-trip risk</span><strong>${escapeHtml(riskCopy)}</strong>
        <span>Energy after recovery</span><strong>${state.energy}/${getMaxEnergy()}</strong>
        <span>Burnout</span><strong>${state.burnout}</strong>
      </div>
      <p class="muted">${state.flags.retrofitInstallRiskInherited
        ? "The install is done, but Josh flags the weak pathway record as the kind of thing that can become somebody else's first hour later."
        : "The install is done, and the record is strong enough that the next tech should not have to rediscover the route from ceiling dust."}</p>
    `,
    actions: [
      { label: "Review Career Snapshot", onClick: showCareerSnapshot },
      ...(canReceiveJoshLabeler() ? [{ label: "Talk Tools", className: "secondary-button", onClick: showJoshLabelerOffer }] : []),
      { label: "Return To Shop", className: "secondary-button", onClick: render },
    ],
  });
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
  if (state.flags.returnTripRisks?.conshohockenServiceRoomPressure) {
    resolveReturnTripRisk("conshohockenServiceRoomPressure", {
      source: content.serviceDispatch.title,
      resolution: helpJosh
        ? "Josh and the player rebuilt the room notes enough to resolve the Conshohocken service pressure."
        : "Josh closed the callback and removed the active Conshohocken service pressure.",
    });
  }
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
  if (shouldIntroduceJoshBeforeNextDispatch()) return notifyJoshIntroRequired();
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
  if (shouldIntroduceJoshBeforeNextDispatch()) return notifyJoshIntroRequired();
  if (state.flags.endShiftPending) return showEndShiftModal();
  const entry = getCurrentDispatchBoardEntry();
  if (entry?.previewAction) return entry.previewAction();
  const blockedEntry = getBlockedDispatchBoardEntry();
  if (blockedEntry?.blockedReason) return notify(blockedEntry.blockedReason);
  if (state.flags.secureAccessComplete) return showCareerSnapshot();
  return showServiceDispatchPreview();
}

function showServiceDispatchPreview() {
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
        "The room can roll different hidden conditions; prep and client context can expose them.",
        "Verifying the signal path can lower return-trip risk.",
        "Rushing can help management now and cost you later.",
      ],
      note: "Use the supply counter, inspect your kit, or use the break area before leaving.",
      managementNote: "Please keep this quick. The client has another meeting, and the quote says replacement.",
      prep: state.flags.servicePreparation ? `Preparation selected: ${getServicePreparationLabel()}` : "",
      taskCards: content.serviceDispatch.taskCards,
      fieldTasks: content.serviceDispatch.checks,
    }),
    actions: [
      getDispatchRoutePrepAction("conshohockenService", showServiceDispatchPreview),
      { label: "Return to Shop", className: "secondary-button" },
    ],
  });
}

function isConshohockenFollowupAvailable() {
  return state.flags.serviceComplete
    && state.flags.joshServiceDebriefed
    && !state.flags.conshohockenFollowupComplete;
}

function showConshohockenFollowupPreview() {
  const route = getWorldRoute("conshohockenService");
  const fastTravelReady = canFastTravelRoute(route);
  showModal({
    kicker: "Dispatch Board",
    title: content.followupDispatch.title,
    body: getDispatchBoardMarkup({
      type: "Repeat Route",
      familyId: "service",
      setup: "The Conshohocken client found the unlabeled coupler note useful, which means someone now wants the actual coupler labeled.",
      why: "This is a small repeat-route test: the route is already known, so the regional map can offer fast travel without skipping board prep.",
      stakes: [
        "The regional map should show Conshohocken as fast-travel ready.",
        "Fast travel still costs energy instead of becoming a free teleport.",
        "Careful labeling improves the next service visit; dropping labels keeps management happy.",
      ],
      note: fastTravelReady
        ? "Open the regional map from Van #3 to use the known Conshohocken shortcut."
        : "The route has to be driven once before fast travel appears.",
      managementNote: "Please avoid turning a label drop into a documentation project.",
      taskCards: content.followupDispatch.taskCards,
    }),
    actions: [
      ...(fastTravelReady ? [{ label: "Open Regional Map", onClick: showRegionalMap }] : []),
      getDispatchRoutePrepAction("conshohockenService", showConshohockenFollowupPreview, { className: fastTravelReady ? "secondary-button" : undefined }),
      { label: "Return to Shop", className: "secondary-button" },
    ],
  });
}

function promptConshohockenFollowupTravel({ fastTravel = false } = {}) {
  showTravelRouteModal({
    routeId: "conshohockenService",
    dispatchEstimate: "Drop labels, update the note, avoid creating a second service call.",
    extraBody: `<p class="muted">This is the same client route. The work is smaller; the bad note is not.</p>`,
    fastTravel,
    beforeTravel: () => {
      state.flags.conshohockenFollowupStarted = true;
      markCareerSnapshotStale();
    },
    afterTravel: (route) => {
      enterScene(route.destinationSceneId);
      showConshohockenFollowupChoice();
    },
  });
}

function showConshohockenFollowupChoice() {
  if (state.flags.conshohockenFollowupComplete) {
    return showCompletedDispatchReturnReview({
      title: "Follow-up Already Complete",
      source: content.followupDispatch.title,
      result: getCompletedCloseoutPathResult("conshohockenFollowupApproach"),
    });
  }
  showModal({
    kicker: "Repeat Route",
    title: "The Coupler Gets A Name",
    body: `
      <p>The room is working. The exposed problem is simpler and more durable: nobody labeled the inline coupler or updated the service note in a way the next tech can find.</p>
      ${getChoicePressureMarkup([
        { label: "Label and update", detail: "Costs energy and annoys management, but makes the next service visit cleaner." },
        { label: "Drop labels", detail: "Fast and management-friendly, but the route stays easier than the room notes." },
      ])}
    `,
    actions: [
      { label: "Label coupler and update note (-2 energy)", onClick: () => finishConshohockenFollowup("label") },
      { label: "Drop labels and leave", className: "secondary-button", onClick: () => finishConshohockenFollowup("drop") },
    ],
  });
}

function finishConshohockenFollowup(approach) {
  if (state.flags.conshohockenFollowupComplete) {
    return showCompletedDispatchReturnReview({
      title: "Follow-up Already Complete",
      source: content.followupDispatch.title,
      result: getCompletedCloseoutPathResult("conshohockenFollowupApproach"),
    });
  }
  const before = getTrackedStateSnapshot();
  const documented = approach === "label";
  const xp = documented ? 30 : 20;
  if (documented) changeEnergy(-2);
  state.flags.conshohockenFollowupComplete = true;
  state.flags.conshohockenFollowupApproach = approach;
  setClock(`${state.clock.slice(0, 3)} ${documented ? "10:02" : "9:46"} AM`);
  if (!state.flags.conshohockenFollowupPaid) {
    state.cash += documented ? 38 : 30;
    state.flags.conshohockenFollowupPaid = true;
  }
  if (!state.flags.conshohockenFollowupProgressAwarded) {
    awardCareerProgress({
      xp,
      reputation: documented
        ? { clients: 1, coworkers: 1, management: -1 }
        : { clients: 0, coworkers: 0, management: 1 },
      source: content.followupDispatch.title,
    });
    state.flags.conshohockenFollowupProgressAwarded = true;
  }
  if (documented && !state.flags.conshohockenFollowupStatsRecorded) {
    state.stats.documentedTaskRisks += 1;
    state.flags.conshohockenFollowupStatsRecorded = true;
  }
  addLog(documented
    ? "Returned to Conshohocken and labeled the coupler path for the next tech."
    : "Dropped labels at Conshohocken and left the note mostly as-found.");
  const closeoutConsequences = [{
    source: content.followupDispatch.title,
    status: documented ? "documented" : "inherited",
    cause: documented
      ? "The coupler was labeled and the room note was updated."
      : "Labels were dropped without fully rebuilding the room note.",
    affects: "future Conshohocken service notes",
    detail: documented
      ? "Future service starts from a clearer room path."
      : "Future service still has to interpret the room note.",
  }];
  recordJobSiteCloseoutSummary({
    source: content.followupDispatch.title,
    result: getCompletedCloseoutPathResult("conshohockenFollowupApproach"),
    before,
    consequences: closeoutConsequences,
  });
  render();
  showModal({
    kicker: "Follow-up Complete",
    title: documented ? "The Known Route Paid Off" : "Fast, Technically",
    body: `
      <div class="results-grid">
        <span>Follow-up wages</span><strong>+$${documented ? 38 : 30}</strong>
        <span>Cash balance</span><strong>${formatCash(state.cash)}</strong>
        <span>Experience</span><strong>+${xp} XP</strong>
        <span>Route memory</span><strong>${getFastTravelCount("conshohockenService") ? "Fast travel used" : "Repeat route driven"}</strong>
        <span>Closeout</span><strong>${documented ? "Coupler path labeled" : "Labels dropped only"}</strong>
      </div>
      <p class="muted">${documented
        ? "The next tech gets a route shortcut and a room note that finally points to the right thing."
        : "Management likes the speed. The next tech still has to interpret the room note."}</p>
      ${getReturnPortalCloseoutNoteMarkup()}
    `,
    actions: [getCloseoutReturnAction(content.followupDispatch.title, "Returned to Radnor Rack & Wire after the Conshohocken label follow-up.")],
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

function getFieldTaskPreviewSkillText(check) {
  if (!check.skillId && !check.skill && !check.difficulty && !check.difficultyHint) return "No skill check";
  const skillName = getSkillDefinition(check.skillId)?.name || check.skill || check.skillId || "Variable skill";
  const difficulty = check.difficulty != null
    ? `Difficulty ${check.difficulty}`
    : check.difficultyHint || "Difficulty varies";
  return `${skillName} | ${difficulty}`;
}

function getFieldTaskPreviewEnergyText(check) {
  if (check.energyHint) return check.energyHint;
  if (check.energyCost != null) return `Base energy ${check.energyCost}`;
  return "Energy varies by route, prep, or branch";
}

function getFieldTaskPreviewMarkup(fieldTasks = []) {
  if (!fieldTasks.length) return "";
  return `
    <h3>Field Task Checks</h3>
    <div class="dispatch-task-grid">
      ${fieldTasks.map((check) => {
        const taskState = getFieldTaskState(check);
        const toolText = [
          check.requiredTool ? `Required: ${getFieldTaskToolText(check.requiredTool)}` : "",
          check.optionalTool ? `Helpful: ${getFieldTaskToolText(check.optionalTool)}` : "",
          check.riskLabel ? `Risk: ${check.riskLabel}` : "",
        ].filter(Boolean).join(" | ");
        const pressureText = getActionPressureBrief({
          check,
          baseEnergyCost: check.energyCost ?? null,
          includeSkill: true,
          includeLedger: true,
          includeTools: true,
        });
        return `
          <div class="dispatch-task-card task-state-${taskState.id}">
            <strong>${escapeHtml(check.label)}</strong>
            <span>${escapeHtml(`${check.type || "field check"} | ${getFieldTaskPreviewSkillText(check)} | ${getFieldTaskPreviewEnergyText(check)}`)}</span>
            <small class="task-state-note task-state-${taskState.id}">${escapeHtml(`Task state: ${getTaskStateText(taskState)}`)}</small>
            <small>${escapeHtml(toolText || check.successText || check.detail || "Complete this task before closeout.")}</small>
            ${pressureText ? `<small class="pressure-note">${escapeHtml(`Pressure on this action: ${pressureText}`)}</small>` : ""}
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function getJobFamilyMarkup(familyId) {
  const family = content.jobFamilies?.[familyId];
  if (!family) return "";
  const workPattern = family.workPattern || family.loop || "Field steps vary by job.";
  const skillNames = family.coreSkills
    .map((skillId) => getSkillDefinition(skillId)?.name || skillId)
    .join(", ");
  return `
    <li><strong>Job family</strong><span>${family.name}</span></li>
    <li><strong>Work pattern</strong><span>${workPattern}</span></li>
    <li><strong>Core skills</strong><span>${skillNames}</span></li>
  `;
}

function getBoardBuildEdgeMarkup(familyId) {
  const family = content.jobFamilies?.[familyId];
  if (!family || !state.technician) return "";
  const rankedSkills = family.coreSkills
    .map((skillId) => ({
      id: skillId,
      name: getSkillDefinition(skillId)?.name || skillId,
      value: getSkillValue(skillId),
    }))
    .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name));
  const strongest = rankedSkills[0];
  const weakest = rankedSkills[rankedSkills.length - 1];
  const notes = [];
  if (strongest) notes.push(`Best fit: ${strongest.name} ${strongest.value}`);
  if (weakest && weakest.id !== strongest?.id && weakest.value <= 2) notes.push(`Watch: ${weakest.name} ${weakest.value}`);
  if (family.coreSkills.includes("documentation") && getDocumentationSupportReduction()) {
    notes.push("documentation support lowers some closeout costs");
  }
  if (family.coreSkills.includes("clientCommunication") || family.coreSkills.includes("commercialProcess")) {
    notes.push(canUsePressureChoice() ? "pressure choices are available" : "pressure pushback may stay locked");
  }
  if (ownsTool("circuitHutOrganizer")) {
    notes.push(hasActivePartsBrainFind() ? "parts organizer is active for this job" : canUsePartsBrain() ? "parts organizer can still be checked from the kit" : "");
  }
  if (familyId === "logistics" && hasCharacterTrait("badKnees")) notes.push("long carries and access moves hit harder");
  const detail = notes.filter(Boolean).join("; ");
  return detail ? `<li><strong>Current build</strong><span>${escapeHtml(detail)}.</span></li>` : "";
}

function getBoardRouteMemoryMarkup(routeId = getCurrentDispatchRouteId()) {
  if (!routeId) return "";
  const route = getWorldRoute(routeId);
  if (!route) return "";
  const travelCount = getRouteTravelCount(route.id);
  const lastRoute = getLastRouteChoiceLabel(route);
  let detail = "New route; travel choice still matters before the work starts.";
  if (route.planned) {
    detail = `Planned ${route.fromLabel} to ${route.toLabel} route; it is mapped for the work-order preview but not launchable yet.`;
  } else if (canFastTravelRoute(route)) {
    detail = `Known ${route.fromLabel} to ${route.toLabel} route; fast travel is ready from the regional map for ${getFastTravelEnergyCost(route)} energy.`;
  } else if (isFastTravelUnlocked(route)) {
    detail = `Known ${route.fromLabel} to ${route.toLabel} route; fast travel is unlocked when the active job starts from the right area.`;
  } else if (travelCount > 0) {
    detail = `Route has been driven ${travelCount} time${travelCount === 1 ? "" : "s"}; repeat-route memory can matter later.`;
  }
  if (lastRoute) detail += ` Last route choice: ${lastRoute}.`;
  return `<li><strong>Route memory</strong><span>${escapeHtml(detail)}</span></li>`;
}

function getBoardRoutingMarkup() {
  const notes = [];
  if (shouldOfferCallbackCleanupDispatch()) {
    notes.push("Warranty return is forced before handoff because unresolved callback pressure is still on the ledger.");
  } else if (state.flags.secureAccessComplete && !state.flags.handoffComplete && getUnresolvedCallbackCount() === 0) {
    notes.push("Clean callback ledger skips the warranty return and moves the board to client handoff.");
  }
  if (isConshohockenFollowupAvailable()) {
    notes.push("Josh debrief unlocked the Conshohocken label follow-up before the next new site.");
  }
  if (state.flags.systemsComplete && !state.flags.travelComplete) {
    notes.push("The next board item is a coordination-cost beat, not a full onsite service call.");
  }
  return notes.length ? `<li><strong>Board routing</strong><span>${escapeHtml(notes.join(" "))}</span></li>` : "";
}

function getBoardConsequenceHooksMarkup(consequenceHooks = []) {
  if (!consequenceHooks.length) return "";
  return `<li><strong>Consequence hooks</strong><span>${escapeHtml(consequenceHooks.join(" "))}</span></li>`;
}

function getJobFamilyName(familyId) {
  return content.jobFamilies?.[familyId]?.name || familyId || "Uncategorized work";
}

function getToolDisplayName(toolId) {
  const tool = content.tools?.[toolId];
  if (!tool) return toolId;
  return `${tool.name}${ownsTool(toolId) ? " (owned)" : ""}`;
}

// dispatchToolPlans define required and recommended prep shown on job/route cards.
function getDispatchToolPlan(familyId, routeId = "") {
  const plans = content.dispatchToolPlans || {};
  const basePlan = plans[familyId] || plans.default || { required: ["work-order notes"], recommended: ["toolBag"] };
  const routePlan = plans.routeOverrides?.[routeId] || {};
  return {
    required: uniqueValues([...(basePlan.required || []), ...(routePlan.required || [])]),
    recommended: uniqueValues([...(basePlan.recommended || []), ...(routePlan.recommended || [])]),
  };
}

function getToolPlanItemText(item, { required = false } = {}) {
  const tool = content.tools?.[item];
  if (!tool) return `${item} (${required ? "expected" : "recommended prep"})`;
  const status = ownsTool(item) ? "owned" : required ? "missing" : "not owned";
  const effect = getToolEffectText(tool);
  return `${tool.name} (${status})${effect ? ` - ${effect}` : ""}`;
}

function getToolPlanText(items = [], options = {}) {
  const uniqueItems = [...new Set(items)];
  if (!uniqueItems.length) return "None listed.";
  return uniqueItems
    .map((item) => getToolPlanItemText(item, options))
    .join(", ");
}

function getRouteBranchRows(route) {
  if (route?.id !== "burlingtonRetrofitWalkdown") return [];
  if (state.flags.retrofitWalkdownComplete && !state.flags.retrofitInstallComplete) {
    const preview = getRetrofitInstallPreview();
    const branchLabel = preview?.branch?.label || preview?.branchId || "walkdown result";
    const branchHint = preview?.branch?.stateHint || "The walkdown result has selected the install branch.";
    return [
      { label: "Saved walkdown result", detail: branchHint },
      { label: "Install branch", detail: branchLabel },
    ];
  }
  if (!state.flags.retrofitWalkdownComplete) {
    return [{ label: "Saved walkdown result", detail: "Pending. This walkdown closeout will decide the future install branch." }];
  }
  if (state.flags.retrofitInstallRiskInherited) {
    return [{ label: "Burlington consequence", detail: "Install closeout inherited pathway risk into future service." }];
  }
  if (state.flags.retrofitInstallRiskResolved) {
    return [{ label: "Burlington consequence", detail: "Install closeout resolved the pathway risk into record/as-built history." }];
  }
  if (state.flags.retrofitInstallComplete) {
    return [{ label: "Burlington consequence", detail: "Install is complete; future service starts from the saved closeout record." }];
  }
  return [];
}

function getRouteConsequenceText(route) {
  const notes = [];
  if (route?.id === "burlingtonRetrofitWalkdown") {
    if (state.flags.retrofitWalkdownComplete && !state.flags.retrofitInstallComplete) {
      const preview = getRetrofitInstallPreview();
      notes.push(`${preview?.branch?.stateHint || "Walkdown result saved; install branch is selected."} Install branch: ${preview?.branch?.label || preview?.branchId || "walkdown result"}.`);
    } else if (!state.flags.retrofitWalkdownComplete) {
      notes.push("Walkdown closeout will choose the future Burlington install branch.");
    } else if (state.flags.retrofitInstallRiskInherited) {
      notes.push("Install closeout inherited Burlington pathway risk into future service.");
    } else if (state.flags.retrofitInstallRiskResolved) {
      notes.push("Install closeout resolved the Burlington pathway risk into history.");
    }
  }
  const ledgerText = getDispatchCallbackEffectsText([]);
  if (ledgerText && !ledgerText.startsWith("No open")) notes.push(ledgerText);
  if (!notes.length) notes.push(ledgerText || "No open callback or return-trip effect is currently attached to this route.");
  return notes.join(" ");
}

function getRouteJobCardRows(route) {
  const job = getRouteJobData(route.id);
  const destination = getWorldArea(route.toAreaId);
  const region = getWorldRegion(destination?.regionId);
  const lastChoice = getLastRouteChoiceLabel(route);
  const fastTravelCount = getFastTravelCount(route.id);
  const lockReason = getRouteLockReason(route);
  const travelResult = getTravelResultText(getLastTravelResult(route));
  const toolPlan = getDispatchToolPlan(job.familyId, route.id);
  return [
    { label: "Destination", detail: `${destination?.label || route.toLabel}${region?.name ? `, ${region.name}` : ""}` },
    { label: "Job family", detail: getJobFamilyName(job.familyId) },
    { label: "Purpose", detail: job.purpose },
    { label: "Summary", detail: job.summary || "No summary listed." },
    ...getRouteBranchRows(route),
    { label: "Required tools", detail: getToolPlanText(toolPlan.required, { required: true }) },
    { label: "Recommended tools", detail: getToolPlanText(toolPlan.recommended) },
    { label: "Risk tags", detail: (job.riskTags || []).join(", ") || "ordinary field pressure" },
    { label: "Unlock condition", detail: job.unlockCondition },
    { label: "Route status", detail: getRouteStatus(route) },
    { label: "What happens next", detail: getRouteLaunchPreviewText(route) },
    { label: "Travel cost/risk", detail: getRouteTravelCostRisk(route) },
    { label: "Driven before", detail: getRouteDrivenText(route) },
    { label: "Fast travel", detail: `${getRouteFastTravelText(route)}${fastTravelCount ? ` Used ${fastTravelCount} time${fastTravelCount === 1 ? "" : "s"}.` : ""}` },
    { label: "Rewards", detail: job.rewards },
    { label: "Callback / return-trip risk", detail: getRouteConsequenceText(route) },
    getRouteConsequencePressureText(route) ? { label: "Mapped consequence pressure", detail: getRouteConsequencePressureText(route) } : null,
    lastChoice ? { label: "Last route choice", detail: lastChoice } : null,
    travelResult ? { label: "Last travel result", detail: travelResult } : null,
    lockReason ? { label: "Locked reason", detail: lockReason } : null,
  ].filter(Boolean);
}

function getDispatchLocationSummary(route) {
  if (!route) return "Radnor Rack & Wire shop / Wayne Area";
  const area = getWorldArea(route.toAreaId);
  const region = getWorldRegion(area?.regionId);
  return `${area?.label || route.toLabel}${region?.name ? `, ${region.name}` : ""}`;
}

function getDispatchRiskTags({ routeId = "", familyId = "", consequenceHooks = [] }) {
  const routeJob = routeId ? getRouteJobData(routeId) : null;
  const tags = [
    ...(routeJob?.riskTags || []),
    ...(consequenceHooks.length ? ["consequence hook"] : []),
    ...(getUnresolvedCallbackCount() ? ["callback debt"] : []),
    ...(state.flags.shiftPrepActive ? ["late-shift prep"] : []),
  ];
  if (familyId === "logistics") tags.push("process friction");
  if (familyId === "service") tags.push("return-trip risk");
  return [...new Set(tags)].join(", ") || "ordinary field pressure";
}

function getDispatchCallbackEffectsText(consequenceHooks = []) {
  const effects = [];
  if (consequenceHooks.length) effects.push(consequenceHooks.join(" "));
  if (getUnresolvedCallbackCount()) effects.push(`${getUnresolvedCallbackCount()} unresolved callback${getUnresolvedCallbackCount() === 1 ? "" : "s"} can affect routing and pressure.`);
  const risks = getOpenReturnTripRiskSummary();
  if (risks) effects.push(risks);
  return effects.join(" ") || "No open callback or return-trip effect is currently attached to this job.";
}

function getDispatchJobOverviewRowsMarkup({ type, setup, familyId = "", routeId = "", consequenceHooks = [] }) {
  const route = getWorldRoute(routeId || getCurrentDispatchRouteId());
  const routeJob = route ? getRouteJobData(route.id) : null;
  const resolvedFamilyId = familyId || routeJob?.familyId || "";
  const toolPlan = getDispatchToolPlan(resolvedFamilyId, route?.id || "");
  const routeDetail = route
    ? `${route.fromLabel} -> ${route.toLabel}. ${getRouteTravelCostRisk(route)} ${getRouteFastTravelText(route)}`
    : "Shop-based task; no drive route starts for this board item.";
  const unlockDetail = routeJob?.unlockCondition
    ? `${routeJob.unlockCondition}${route ? ` ${getRouteLockReason(route) || "Launchable when this card is accepted."}` : ""}`
    : "Unlocked by the current dispatch-board progression.";
  return `
    <li><strong>Title</strong><span>${escapeHtml(routeJob?.title || type)}</span></li>
    <li><strong>Location / region</strong><span>${escapeHtml(getDispatchLocationSummary(route))}</span></li>
    <li><strong>Summary</strong><span>${escapeHtml(routeJob?.summary || setup)}</span></li>
    <li><strong>Required / expected tools</strong><span>${escapeHtml(getToolPlanText(toolPlan.required, { required: true }))}</span></li>
    <li><strong>Recommended tools</strong><span>${escapeHtml(getToolPlanText(toolPlan.recommended))}</span></li>
    <li><strong>Risk tags</strong><span>${escapeHtml(getDispatchRiskTags({ routeId: route?.id || "", familyId: resolvedFamilyId, consequenceHooks }))}</span></li>
    <li><strong>Route</strong><span>${escapeHtml(routeDetail)}</span></li>
    <li><strong>Rewards</strong><span>${escapeHtml(routeJob?.rewards || "Cash, XP, reputation, and ledger changes on closeout.")}</span></li>
    <li><strong>Unlock condition</strong><span>${escapeHtml(unlockDetail)}</span></li>
    <li><strong>Callback / return-trip effects</strong><span>${escapeHtml(getDispatchCallbackEffectsText(consequenceHooks))}</span></li>
  `;
}

function getDispatchBoardMarkup({ type, setup, why, stakes = [], note, managementNote, prep = "", taskCards = [], fieldTasks = [], familyId = "", routeId = "", consequenceHooks = [], showBoardState = true }) {
  return `
    <p><strong>${type}:</strong> ${setup}</p>
    ${getWorkdayLoopGuidanceMarkup()}
    <ul class="modal-list">
      ${showBoardState ? getDispatchBoardStateMarkup() : ""}
      ${getDispatchJobOverviewRowsMarkup({ type, setup, familyId, routeId, consequenceHooks })}
      <li><strong>Why this is on the board</strong><span>${why}</span></li>
      ${getJobFamilyMarkup(familyId)}
      ${getCompanyDispatchPressureMarkup()}
      ${getBoardBuildEdgeMarkup(familyId)}
      ${getBoardRouteMemoryMarkup(routeId || getCurrentDispatchRouteId())}
      <li><strong>Stakes</strong><span>${stakes.join(" ")}</span></li>
      ${getBoardConsequenceHooksMarkup(consequenceHooks)}
      ${getOpenCallbackBoardMarkup()}
      ${getBoardRoutingMarkup()}
      ${prep ? `<li><strong>Prep</strong><span>${prep}</span></li>` : ""}
      ${state.flags.shiftPrepActive ? `<li><strong>Next-shift prep</strong><span>Stayed late last shift: +1 Fieldcraft and +1 Documentation until this job closes.</span></li>` : ""}
    </ul>
    ${getDispatchTaskCardsMarkup(taskCards)}
    ${getFieldTaskPreviewMarkup(fieldTasks)}
    ${note ? `<p class="muted">${note}</p>` : ""}
    <blockquote>Management note: "${managementNote}"</blockquote>
  `;
}

function getOpenCallbackBoardMarkup() {
  const openCallbacks = getUnresolvedCallbackCount();
  const ledgerEntries = getConsequenceLedgerEntries();
  if (!openCallbacks && !ledgerEntries.length) return "";
  const returnTripSummary = getOpenReturnTripRiskSummary();
  return `
    <li><strong>Open consequence ledger</strong><span>${openCallbacks} unresolved callback${openCallbacks === 1 ? "" : "s"} on the ledger. ${returnTripSummary || "Future work may feel heavier until the callback ledger catches up."}</span></li>
    ${getReturnTripRiskRowsMarkup()}
  `;
}

function getPlannedJobBranchId(job) {
  if (job.id !== "burlington-retrofit-install") return "";
  return getRetrofitInstallBranchIdFromFlags(state.flags);
}

function getPlannedJobBranch(job) {
  const branchId = getPlannedJobBranchId(job);
  if (!branchId) return null;
  return job.resultBranches?.[branchId] || null;
}

function getPlannedJobPresentation(job) {
  const branchId = getPlannedJobBranchId(job);
  const branch = getPlannedJobBranch(job);
  return {
    ...job,
    branchId,
    branch,
    summary: branch?.summary || job.summary,
    setup: branch?.setup || job.setup || job.summary,
    prep: branch?.prep || job.prep || "",
    stakes: branch?.stakes?.length ? branch.stakes : job.stakes || [],
    consequenceHooks: branch?.consequenceHooks?.length ? branch.consequenceHooks : job.consequenceHooks || [],
    taskCards: branch?.taskCards?.length ? branch.taskCards : job.taskCards || [],
    note: branch?.note || job.note,
    managementNote: branch?.managementNote || job.managementNote,
  };
}

function getPlannedJobBranchMarkup(preview) {
  if (!preview.branch) return "";
  const implementationHook = preview.branchId === "protected"
    ? "Install can start with fewer unknowns and a cleaner record-drawing closeout."
    : preview.branchId === "partial"
    ? "Install starts with one warned-but-unresolved pathway question."
    : preview.branchId === "risk"
    ? "Install starts by surfacing the missing pathway as field-change pressure."
    : "Keep the install locked until the walkdown chooses a branch.";
  return `
    <ul class="modal-list">
      <li><strong>Inherited walkdown result</strong><span>${escapeHtml(preview.branch.stateHint || preview.branch.label)}</span></li>
      <li><strong>Install impact</strong><span>${escapeHtml(implementationHook)}</span></li>
    </ul>
  `;
}

function getPlannedJob(jobId) {
  return (content.upcomingDispatches || []).find((job) => job.id === jobId) || null;
}

// Save compatibility keeps this flag name; new code should use career snapshot helpers.
function markCareerSnapshotReviewed() {
  state.flags.prototypeSummaryViewed = true;
}

function markCareerSnapshotStale() {
  state.flags.prototypeSummaryViewed = false;
}

function showCareerSnapshot() {
  const rank = getCareerRank();
  markCareerSnapshotReviewed();
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
      <p><strong>Active consequences:</strong></p>
      ${getActiveCareerSummaryMarkup()}
      <p><strong>Consequence ledger:</strong></p>
      ${getConsequenceLedgerMarkup({ includeResolved: true })}
      <p><strong>Field task history:</strong></p>
      ${getFieldTaskResultLedgerMarkup()}
      <p><strong>Career ledger:</strong></p>
      ${getCareerLedgerMarkup()}
      <p><strong>Next step:</strong></p>
      <ul class="modal-list">
        <li><strong>Shop reset</strong><span>Return to Radnor Rack & Wire, review the clipboard, and recover before the next board refresh.</span></li>
      </ul>
      <blockquote>Coordination note: "Please remain flexible. Several schedules are currently being finalized retroactively."</blockquote>
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
      setup: "Find a replacement power supply before another technician leaves for a service call. The work order says it was stored in one of the vans.",
      why: "Unlocked after commissioning. The shop needs a quick change of pace that tests whether messy inventory can become gameplay.",
      stakes: [
        "Searching costs energy.",
        "Fixing the bin label helps coworkers and annoys management.",
        "Leaving the pile alone keeps the task efficient and the next search worse.",
      ],
      note: "Van #2 is already offsite, and the key board says its key is with SALES.",
      managementNote: "This should only take a minute. Please check the obvious places before escalating.",
      fieldTasks: content.warehouseDispatch.checks,
    }),
    actions: [
      { label: "Start Looking", onClick: startWarehouseRun },
      { label: "Return to Shop", className: "secondary-button" },
    ],
  });
}

function startWarehouseRun() {
  state.flags.warehouseStarted = true;
  markCareerSnapshotStale();
  consumePackedLunch("the warehouse run");
  setClock(`${state.clock.slice(0, 3)} 4:18 PM`);
  addLog("Started looking for a replacement power supply reportedly stored in one of the vans.");
  render();
  showModal({
    kicker: "Radnor Rack & Wire Warehouse Run",
    title: "Check The Obvious Places",
    body: `
      <p>Search Van #3, the staging shelf, and the mystery-return pile. Coordination has already asked whether you found it.</p>
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
  const { skillCheck, energyCost } = resolveFieldTaskCheck({
    check,
    checkId,
    completedChecks: state.warehouseChecks,
    flagKey: `warehouse-${checkId}`,
    contextBonus: state.flags.warehouseStarted ? 0 : -1,
    baseEnergyCost: getWarehouseSearchEnergyCost(),
    strainedFlag: "warehouseSearchStrained",
    logText: `${check.label} checked: ${check.log}`,
    strainedLogText: `Fieldcraft check strained on ${check.label}; the search took extra energy.`,
  });
  render();
  const allChecked = state.warehouseChecks.length === content.warehouseDispatch.checks.length;
  showModal({
    kicker: "Warehouse Note",
    title: check.label,
    body: `
      <p>${check.detail}</p>
      ${getFieldTaskResultMarkup({ check, skillCheck, energyCost })}
      ${allChecked ? `<p class="muted">The matching power supply is in the mystery-return pile beneath a handwritten question mark. Decide how much stockroom cleanup the schedule is willing to survive.</p>` : ""}
    `,
    actions: [{ label: allChecked ? "Review Found Power Supply" : "Keep Looking", onClick: allChecked ? showWarehouseChoice : render }],
  });
}

function showWarehouseChoice() {
  if (state.flags.warehouseComplete) {
    return showCompletedDispatchReturnReview({
      title: "Warehouse Run Already Complete",
      source: content.warehouseDispatch.title,
      result: getCompletedCloseoutPathResult("warehouseApproach"),
    });
  }
  showModal({
    kicker: "Warehouse Run",
    title: "Power Supply Located Technically",
    body: `
      <p>The correct power supply was placed in mystery returns beneath a box labeled <strong>HDMI EXTENDERS / DO NOT STOCK / RETURN?</strong></p>
      <p>Coordination wants the part immediately. Correcting the bin label would save the next search, but it would extend a task estimated at one minute.</p>
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
  if (state.flags.warehouseComplete) {
    return showCompletedDispatchReturnReview({
      title: "Warehouse Run Already Complete",
      source: content.warehouseDispatch.title,
      result: getCompletedCloseoutPathResult("warehouseApproach"),
    });
  }
  const correctedLabel = approach === "label";
  if (correctedLabel) changeEnergy(-getWarehouseLabelEnergyCost());
  state.flags.warehouseComplete = true;
  state.flags.warehouseApproach = approach;
  markCareerSnapshotStale();
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
        ? `<blockquote>Management note: "Please avoid spending excessive time reorganizing stock during urgent field support."</blockquote>`
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
      why: "Unlocked after the warehouse run. The board has moved from missing parts to missing site-access details.",
      stakes: [
        "Preparation can reduce access-check or report costs.",
        "Once you reach the room, the rack update still has to be patched and verified.",
        "Documenting the delay builds the documentation habit.",
        "Absorbing the delay protects the ticket and adds burnout.",
      ],
      note: "The work order says the building mismatch is probably campus language.",
      managementNote: "Please do not let access delays affect today's schedule.",
      prep: state.flags.secureAccessPreparation ? `Preparation selected: ${getSecureAccessPreparationLabel()}` : "",
      taskCards: content.secureAccessDispatch.taskCards,
      fieldTasks: [
        ...content.secureAccessDispatch.checks,
        ...content.secureAccessDispatch.taskChecks,
      ],
    }),
    actions: [
      getDispatchRoutePrepAction("navyYardAccess", showSecureAccessDispatchPreview),
      { label: "Return to Shop", className: "secondary-button" },
    ],
  });
}

function getSecureAccessPreparationLabel() {
  return {
    review: "Reviewed access email",
    contact: "Called listed site contact",
    none: "Trusted work-order notes",
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
      { label: "Trust work-order notes", className: "secondary-button", onClick: () => chooseSecureAccessPreparation("none") },
    ],
  });
}

function chooseSecureAccessPreparation(preparation) {
  state.flags.secureAccessPreparation = preparation;
  let title = "The Ticket Will Have To Do";
  let body = `<p>The work-order note says "security aware," which is doing a heroic amount of work for two words.</p>`;
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
  if (preparation === "none") addLog("Left for Navy Yard trusting the work-order notes.");
  render();
  showModal({
    kicker: "Preparation Selected",
    title,
    body,
    actions: [{ label: "Head To Navy Yard", onClick: promptSecureAccessTravel }],
  });
}

function promptSecureAccessTravel({ fastTravel = false } = {}) {
  showTravelRouteModal({
    routeId: "navyYardAccess",
    dispatchEstimate: "Quick rack update. Security already knows you are coming.",
    extraBody: `<p class="muted">Security may have received that information in a different timeline.</p>`,
    fastTravel,
    beforeTravel: () => {
      state.flags.secureAccessStarted = true;
      markCareerSnapshotStale();
    },
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
  const { skillCheck, energyCost } = resolveFieldTaskCheck({
    check,
    checkId,
    completedChecks: state.secureAccessChecks,
    flagKey: `secure-access-${checkId}`,
    contextBonus: state.flags.secureAccessPreparation === "review" ? 1 : 0,
    baseEnergyCost: getSecureAccessCheckEnergyCost(),
    strainedFlag: "secureAccessNotesStrained",
    logText: `${check.label} checked: ${check.log}.`,
    strainedLogText: `Access skill check strained on ${check.label}; the note will be easier for management to downplay.`,
  });
  render();
  const allChecked = state.secureAccessChecks.length === content.secureAccessDispatch.checks.length;
  showModal({
    kicker: "Access Note",
    title: check.label,
    body: `
      <p>${check.detail}</p>
      ${getFieldTaskResultMarkup({ check, skillCheck, energyCost })}
      ${allChecked ? `<p class="muted">Access is finally sorted. Now the quick rack update still has to actually happen.</p>` : ""}
    `,
    actions: [{ label: allChecked ? "Enter Telecom Room" : "Keep Sorting Access", onClick: allChecked ? showSecureAccessWorkStart : render }],
  });
}

function showSecureAccessWorkStart() {
  state.flags.secureAccessRoomReached = true;
  showModal({
    kicker: "Telecom Room",
    title: "Now Do The Actual Job",
    body: `
      <p>The escort finally badges you into the telecom room. The rack update is small, but the rack does not know that.</p>
      <p class="muted">Find the correct rack unit, patch the encoder feed, and verify the room signal before closeout.</p>
    `,
    actions: [{ label: "Start Rack Update", onClick: render }],
  });
}

function getSecureAccessTaskEnergyCost(checkId) {
  const accessDrag = state.flags.secureAccessNotesStrained ? 1 : 0;
  const preparationHelp = state.flags.secureAccessPreparation === "contact" && checkId === "verify-signal" ? 1 : 0;
  return Math.max(1, 3 + accessDrag - preparationHelp);
}

function inspectSecureAccessTask(checkId) {
  const check = content.secureAccessDispatch.taskChecks.find((item) => item.id === checkId);
  if (!check || state.secureAccessTaskChecks.includes(checkId)) return notify(`${check?.label || "That rack task"} is already handled.`);
  const { skillCheck, energyCost } = resolveFieldTaskCheck({
    check,
    checkId,
    completedChecks: state.secureAccessTaskChecks,
    flagKey: `secure-access-task-${checkId}`,
    contextBonus: state.flags.secureAccessPreparation === "contact" && checkId === "verify-signal" ? 1 : 0,
    baseEnergyCost: getSecureAccessTaskEnergyCost(checkId),
    strainedFlag: "secureAccessTaskStrained",
    logText: `${check.label}: ${check.log}.`,
    strainedLogText: `Rack update check strained on ${check.label}; closeout will need clearer notes.`,
  });
  render();
  const allChecked = state.secureAccessTaskChecks.length === content.secureAccessDispatch.taskChecks.length;
  showModal({
    kicker: "Rack Update",
    title: check.label,
    body: `
      <p>${check.detail}</p>
      ${getFieldTaskResultMarkup({ check, skillCheck, energyCost })}
      ${allChecked ? `<p class="muted">The rack update is done. Now decide how honest the closeout gets about the access delay and the stale room label.</p>` : ""}
    `,
    actions: [{ label: allChecked ? "Close Out Navy Yard Job" : "Keep Working The Rack", onClick: allChecked ? showSecureAccessChoice : render }],
  });
}

function getSecureAccessTaskQualityLabel() {
  return state.flags.secureAccessTaskStrained
    ? "Rack update completed with strained verification"
    : "Rack update patched and verified";
}

function showSecureAccessChoice() {
  if (state.flags.secureAccessComplete) {
    return showCompletedDispatchReturnReview({
      title: "Secure Access Already Complete",
      source: content.secureAccessDispatch.title,
      result: getCompletedCloseoutPathResult("secureAccessApproach"),
    });
  }
  showModal({
    kicker: "Navy Yard Closeout",
    title: "The Work Is Done, The Story Is Not",
    body: `
      <p>The encoder feed is patched and the room signal verifies. Security, the building number, and the escort policy still disagree with the original work-order estimate.</p>
      <p>Management wants the ticket kept clean. The client would prefer an honest ETA and a note that the stale rack label changed.</p>
      ${state.flags.secureAccessTaskStrained ? `<p class="muted">One rack-update check was strained. Better closeout notes can keep that from becoming the next mystery.</p>` : ""}
      ${getDocumentationSupportReduction() ? `<p class="muted">Your documentation habits make the access-delay note faster to write.</p>` : ""}
      ${getOpenCallbackPenalty() ? `<p class="muted">The open callback still on the ledger made today's access shuffle feel heavier.</p>` : ""}
      ${getChoicePressureMarkup([
        {
          label: "Document access and rack change",
          detail: "Costs energy to protect the ETA trail and future support notes. Likely helps clients and coworkers, with management friction possible.",
        },
        ...(canUsePressureChoice() ? [{
          label: "Push coordination",
          detail: "Stronger accountability if you can carry the conversation. Best process pressure, but management may not enjoy owning the access miss.",
        }] : []),
        {
          label: "Eat the delay",
          detail: "Clean-ticket path. Saves the schedule story now, but hides the access problem and leaves the stale label easier to rediscover.",
        },
      ])}
    `,
    actions: [
      { label: `Document access delay and rack change (-${getSecureAccessReportEnergyCost(4)} energy)`, onClick: () => finishSecureAccess("document") },
      ...(canUsePressureChoice() ? [{
        label: `Push coordination to own the access miss and update notes (-${getSecureAccessReportEnergyCost(3)} energy)`,
        className: "secondary-button",
        onClick: () => finishSecureAccess("pushback"),
      }] : []),
      { label: "Mark rack update complete and eat the delay", className: "secondary-button", onClick: () => finishSecureAccess("absorb") },
    ],
  });
}

function finishSecureAccess(approach) {
  if (state.flags.secureAccessComplete) {
    return showCompletedDispatchReturnReview({
      title: "Secure Access Already Complete",
      source: content.secureAccessDispatch.title,
      result: getCompletedCloseoutPathResult("secureAccessApproach"),
    });
  }
  const before = getTrackedStateSnapshot();
  const honest = approach !== "absorb";
  const strainedNotes = Boolean(state.flags.secureAccessNotesStrained) && approach === "document";
  const strainedTask = Boolean(state.flags.secureAccessTaskStrained);
  const documentedTask = honest;
  const createsRackReturnRisk = strainedTask && !documentedTask;
  const xp = (approach === "pushback" ? 70 : approach === "document" ? 65 : 45) - (strainedNotes ? 5 : 0) - (strainedTask && !documentedTask ? 5 : 0);
  if (honest) changeEnergy(-getSecureAccessReportEnergyCost(approach === "pushback" ? 3 : 4));
  else state.burnout += 1;
  state.flags.secureAccessComplete = true;
  state.flags.secureAccessApproach = approach;
  markCareerSnapshotStale();
  setClock(`${state.clock.slice(0, 3)} ${approach === "absorb" ? "6:22" : "6:38"} PM`);
  if (!state.flags.secureAccessPaid) {
    state.cash += honest ? 112 : 96;
    state.flags.secureAccessPaid = true;
  }
  if (!state.flags.secureAccessProgressAwarded) {
    awardCareerProgress({
      xp,
      reputation: honest
        ? { clients: strainedNotes ? 0 : 1, coworkers: strainedTask ? 1 : 2, management: approach === "pushback" ? -2 : -1 }
        : { clients: strainedTask ? -1 : 0, coworkers: 0, management: 1 },
      source: content.secureAccessDispatch.title,
    });
    state.flags.secureAccessProgressAwarded = true;
  }
  if (!state.flags.secureAccessStatsRecorded) {
    state.stats.secureAccessJobsCompleted += 1;
    state.stats.fieldTaskChoicesMade += 1;
    if (honest) {
      state.stats.accessDelaysDocumented += 1;
      if (strainedTask) state.stats.documentedTaskRisks += 1;
    } else {
      state.stats.unpaidDelaysAbsorbed += 1;
    }
    if (createsRackReturnRisk) {
      state.stats.callbacks += 1;
      recordReturnTripRisk("navyYardRackUpdate", {
        source: content.secureAccessDispatch.title,
        detail: "A strained rack update was closed with the access delay hidden.",
      });
    }
    state.flags.secureAccessStatsRecorded = true;
  }
  addLog(honest
    ? "Documented the Navy Yard access delay and rack update before the schedule could pretend nothing happened."
    : "Completed the Navy Yard rack update while absorbing the access delay into a clean-looking ticket.");
  const closeoutConsequences = [{
    source: content.secureAccessDispatch.title,
    status: createsRackReturnRisk ? "open" : honest ? "documented" : "inherited",
    cause: createsRackReturnRisk
      ? "A strained rack update was closed while the access delay stayed hidden."
      : honest
      ? "The access delay and rack change were written into the closeout."
      : "The access delay was absorbed into a clean-looking ticket.",
    affects: getReturnTripRiskAffectedWork("navyYardRackUpdate"),
    detail: createsRackReturnRisk
      ? "Stale rack context stays on the return-trip ledger."
      : honest
      ? "Future support gets the rack/access context before guessing."
      : "The process problem remains hidden even though no named rack risk was recorded.",
  }];
  recordJobSiteCloseoutSummary({
    source: content.secureAccessDispatch.title,
    result: getCompletedCloseoutPathResult("secureAccessApproach"),
    before,
    consequences: closeoutConsequences,
  });
  render();
  showModal({
    kicker: "Secure Access Complete",
    title: approach === "pushback" ? "The Access Miss Has An Owner" : approach === "document" ? "The Delay And Rack Change Have A Trail" : "The Rack Works And The Ticket Looks Clean",
    body: `
      <div class="results-grid">
        <span>Access job wages</span><strong>+$${honest ? 112 : 96}</strong>
        <span>Cash balance</span><strong>${formatCash(state.cash)}</strong>
        <span>Experience</span><strong>+${xp} XP</strong>
        <span>Preparation</span><strong>${getSecureAccessPreparationLabel()}</strong>
        <span>Rack task</span><strong>${getSecureAccessTaskQualityLabel()}</strong>
        <span>Closeout</span><strong>${approach === "pushback" ? "Coordination access miss escalated" : approach === "document" ? "Delay and rack change documented" : "Delay absorbed"}</strong>
        ${strainedNotes ? `<span>Skill consequence</span><strong>Thin access notes limited client trust</strong>` : ""}
        ${createsRackReturnRisk ? `<span>Return-trip risk</span><strong>Stale rack note may send someone back</strong>` : ""}
      </div>
      ${getCloseoutConsequenceMarkup(closeoutConsequences)}
      ${honest
        ? `<blockquote>Management note: "Please avoid creating client-facing narratives around internal scheduling friction."</blockquote>`
        : `<blockquote>Management note: "Thanks for keeping the ticket clean. Please improve onsite arrival efficiency."</blockquote>`}
      ${getReturnPortalCloseoutNoteMarkup()}
    `,
    actions: [getCloseoutReturnAction(content.secureAccessDispatch.title, "Returned to Radnor Rack & Wire after the Navy Yard access job.")],
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
      setup: "A callback is still sitting in the career ledger, and coordination wants it cleaned up before anyone says warranty hours out loud.",
      why: `Triggered by unresolved callback pressure. Current unresolved callbacks: ${getUnresolvedCallbackCount()}.${returnTripSummary ? ` ${returnTripSummary}` : ""}`,
      stakes: [
        "A real fix resolves ledger pressure and helps client trust.",
        "A quick bandage keeps warranty hours contained.",
        "Craftsmanship can turn the cleanup into a better handoff.",
      ],
      note: "The client says the room was marked complete, then immediately started acting like it read the closeout note.",
      managementNote: "Please determine whether this is truly a callback or simply extended closeout support.",
      fieldTasks: content.callbackCleanupDispatch.checks,
      taskCards: returnTripSummary ? [{
        title: "Open Return-Trip Risk",
        skill: "Troubleshooting 4",
        outcome: returnTripSummary,
      }] : [],
    }),
    actions: [
      getDispatchRoutePrepAction("warrantyReturn", showCallbackCleanupDispatchPreview),
      { label: "Return to Shop", className: "secondary-button" },
    ],
  });
}

function promptCallbackCleanupTravel({ fastTravel = false } = {}) {
  showTravelRouteModal({
    routeId: "warrantyReturn",
    dispatchEstimate: "Confirm user concern, restore confidence, avoid assigning blame in writing.",
    extraBody: `<p class="muted">The previous closeout note is short enough to remember accidentally.</p>`,
    fastTravel,
    beforeTravel: () => {
      state.flags.callbackCleanupStarted = true;
      markCareerSnapshotStale();
    },
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
  const { skillCheck, energyCost } = resolveFieldTaskCheck({
    check,
    checkId,
    completedChecks: state.callbackCleanupChecks,
    flagKey: `callback-${checkId}`,
    baseEnergyCost: getCallbackCleanupCheckEnergyCost(),
    strainedFlag: "callbackTroubleshootingStrained",
    logText: `${check.label} checked: ${check.log}`,
    strainedLogText: `Callback skill check strained on ${check.label}; the fix will take more discipline to close cleanly.`,
  });
  render();
  const allChecked = state.callbackCleanupChecks.length === content.callbackCleanupDispatch.checks.length;
  showModal({
    kicker: "Callback Note",
    title: check.label,
    body: `
      <p>${check.detail}</p>
      ${getFieldTaskResultMarkup({ check, skillCheck, energyCost })}
      ${allChecked ? `<p class="muted">You found enough to decide whether this becomes a real fix or another quiet bandage.</p>` : ""}
    `,
    actions: [{ label: allChecked ? "Review Warranty Fix" : "Keep Troubleshooting", onClick: allChecked ? showCallbackCleanupChoice : render }],
  });
}

function showCallbackCleanupChoice() {
  if (state.flags.callbackCleanupComplete) {
    return showCompletedDispatchReturnReview({
      title: "Warranty Return Already Complete",
      source: content.callbackCleanupDispatch.title,
      result: state.flags.callbackCleanupApproach ? `Closeout path: ${state.flags.callbackCleanupApproach}` : "",
    });
  }
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
  if (state.flags.callbackCleanupComplete) {
    return showCompletedDispatchReturnReview({
      title: "Warranty Return Already Complete",
      source: content.callbackCleanupDispatch.title,
      result: state.flags.callbackCleanupApproach ? `Closeout path: ${state.flags.callbackCleanupApproach}` : "",
    });
  }
  const before = getTrackedStateSnapshot();
  const resolved = approach !== "bandage";
  const strainedFix = Boolean(state.flags.callbackTroubleshootingStrained) && approach === "root";
  const xp = (approach === "craft" ? 65 : approach === "root" ? 55 : 35) - (strainedFix ? 5 : 0);
  const callbackRiskIds = ["usedTemporaryAdapterPermanently", "navyYardRackUpdate", "southPhillySpeakerTermination", "systemsQuickReboot"];
  const resolvedRiskId = resolved ? callbackRiskIds.find((riskId) => state.flags.returnTripRisks?.[riskId]) : "";
  if (resolved) changeEnergy(-(getCallbackCleanupRepairEnergyCost(approach === "craft" ? 5 : 6) + (strainedFix ? 2 : 0)));
  else state.burnout += 1;
  state.flags.callbackCleanupComplete = true;
  state.flags.callbackCleanupApproach = approach;
  markCareerSnapshotStale();
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
  if (resolvedRiskId) {
    resolveReturnTripRisk(resolvedRiskId, {
      source: content.callbackCleanupDispatch.title,
      resolution: "Warranty return fixed the cause and rebuilt the notes enough to remove this return-trip risk.",
    });
  }
  addLog(resolved
    ? "Resolved the warranty return and wrote notes the next tech can actually use."
    : "Closed the warranty ticket with a bandage. The callback ledger remains spiritually aware.");
  const closeoutConsequences = [{
    source: content.callbackCleanupDispatch.title,
    status: resolved ? "resolved" : "inherited",
    cause: resolved
      ? "Warranty return fixed the root cause instead of hiding the callback."
      : "Warranty return was bandaged to protect the ticket.",
    affects: resolvedRiskId ? getReturnTripRiskAffectedWork(resolvedRiskId) : "callback ledger and future warranty pressure",
    detail: resolved
      ? "Callback pressure drops and any matched return-trip risk moves into resolved history."
      : "Callback debt remains visible for future routing and trust pressure.",
  }];
  recordJobSiteCloseoutSummary({
    source: content.callbackCleanupDispatch.title,
    result: state.flags.callbackCleanupApproach ? `Closeout path: ${state.flags.callbackCleanupApproach}` : "",
    before,
    consequences: closeoutConsequences,
  });
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
      ${getCloseoutConsequenceMarkup(closeoutConsequences)}
      ${resolved
        ? `<blockquote>Management note: "Please avoid implying previous closeout was incomplete when documenting warranty support."</blockquote>`
        : `<blockquote>Management note: "Thanks for keeping warranty hours contained."</blockquote>`}
      ${getReturnPortalCloseoutNoteMarkup()}
    `,
    actions: [getCloseoutReturnAction(content.callbackCleanupDispatch.title, "Returned to Radnor Rack & Wire after the warranty return.")],
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
        : "Clean callback ledger skipped the warranty return, so the board moved you to a handoff.",
      stakes: [
        "Confidence can unlock a better cheat-sheet option.",
        "Documentation habit reduces handoff prep costs.",
        "A quick demo keeps management happy and leaves a training gap.",
      ],
      note: "The service ticket says this is just a quick demo. The client says the executive assistant has actual questions.",
      managementNote: "Please keep training concise. The system is designed to be intuitive.",
      fieldTasks: content.handoffDispatch.checks,
    }),
    actions: [
      getDispatchRoutePrepAction("executiveHandoff", showHandoffDispatchPreview),
      { label: "Return to Shop", className: "secondary-button" },
    ],
  });
}

function promptHandoffTravel({ fastTravel = false } = {}) {
  showTravelRouteModal({
    routeId: "executiveHandoff",
    dispatchEstimate: "Five-minute walkthrough. No technical work expected.",
    extraBody: `<p class="muted">No technical work expected is also what they said about the warranty return.</p>`,
    fastTravel,
    beforeTravel: () => {
      state.flags.handoffStarted = true;
      markCareerSnapshotStale();
    },
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
  const { skillCheck, energyCost } = resolveFieldTaskCheck({
    check,
    checkId,
    completedChecks: state.handoffChecks,
    flagKey: `handoff-${checkId}`,
    contextBonus: getDocumentationSupportReduction(),
    baseEnergyCost: getHandoffCheckEnergyCost(),
    strainedFlag: "handoffPrepStrained",
    logText: `${check.label} checked: ${check.log}`,
    strainedLogText: `Handoff skill check strained on ${check.label}; the walkthrough risks sounding like button labels.`,
  });
  render();
  const allChecked = state.handoffChecks.length === content.handoffDispatch.checks.length;
  showModal({
    kicker: "Handoff Note",
    title: check.label,
    body: `
      <p>${check.detail}</p>
      ${getFieldTaskResultMarkup({ check, skillCheck, energyCost })}
      ${allChecked ? `<p class="muted">You know enough to decide whether this is a real handoff or a fast button tour.</p>` : ""}
    `,
    actions: [{ label: allChecked ? "Review Handoff Plan" : "Keep Preparing Handoff", onClick: allChecked ? showHandoffChoice : render }],
  });
}

function showHandoffChoice() {
  if (state.flags.handoffComplete) {
    return showCompletedDispatchReturnReview({
      title: "Client Handoff Already Complete",
      source: content.handoffDispatch.title,
      result: state.flags.handoffApproach ? `Closeout path: ${state.flags.handoffApproach}` : "",
    });
  }
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
  if (state.flags.handoffComplete) {
    return showCompletedDispatchReturnReview({
      title: "Client Handoff Already Complete",
      source: content.handoffDispatch.title,
      result: state.flags.handoffApproach ? `Closeout path: ${state.flags.handoffApproach}` : "",
    });
  }
  const before = getTrackedStateSnapshot();
  const helpful = approach !== "quick";
  const strainedPrep = Boolean(state.flags.handoffPrepStrained) && approach === "patient";
  const xp = (approach === "cheat" ? 60 : approach === "patient" ? 50 : 30) - (strainedPrep ? 5 : 0);
  if (helpful) changeEnergy(-getHandoffEnergyCost(approach === "cheat" ? 4 : 5));
  state.flags.handoffComplete = true;
  state.flags.handoffApproach = approach;
  markCareerSnapshotStale();
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
  const closeoutConsequences = [{
    source: content.handoffDispatch.title,
    status: helpful ? "controlled" : "inherited",
    cause: helpful
      ? "Client handoff translated the room into usable daily steps."
      : "The room was demoed quickly and the training gap stayed with the client.",
    affects: "future handoff support and client confidence",
    detail: helpful
      ? "Future questions start from a better client habit."
      : "Future support may inherit more user confusion.",
  }];
  recordJobSiteCloseoutSummary({
    source: content.handoffDispatch.title,
    result: state.flags.handoffApproach ? `Closeout path: ${state.flags.handoffApproach}` : "",
    before,
    consequences: closeoutConsequences,
  });
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
      ${getCloseoutConsequenceMarkup(closeoutConsequences)}
      ${helpful
        ? `<blockquote>Management note: "Please avoid expanding simple handoffs into undocumented training sessions."</blockquote>`
        : `<blockquote>Management note: "Thanks for keeping the handoff efficient."</blockquote>`}
      ${getReturnPortalCloseoutNoteMarkup()}
    `,
    actions: [getCloseoutReturnAction(content.handoffDispatch.title, "Returned to Radnor Rack & Wire after the executive handoff.")],
  });
}

function showSystemsDispatchPreview() {
  showModal({
    kicker: "Dispatch Board",
    title: content.systemsDispatch.title,
    body: getDispatchBoardMarkup({
      type: "Systems Service",
      familyId: "service",
      setup: "A King of Prussia conference room is reporting offline. The service ticket says the client already rebooted once, so maybe reboot it professionally.",
      why: "Unlocked after the executive handoff. This board is testing whether advanced systems skills can matter in one readable service job.",
      stakes: [
        "Networking and Control Systems can change how cleanly you identify the fault.",
        "Documentation can turn a weird room note into future-proof closeout.",
        "A quick reboot keeps management happy and may leave return-trip risk.",
      ],
      note: "This is still a field-tech service call, not a subnet worksheet.",
      managementNote: "Please avoid turning a simple offline room into a network investigation.",
      prep: state.flags.systemsPreparation ? `Preparation selected: ${getSystemsPreparationLabel()}` : "",
      taskCards: content.systemsDispatch.taskCards,
      fieldTasks: content.systemsDispatch.checks,
    }),
    actions: [
      getDispatchRoutePrepAction("systemsService", showSystemsDispatchPreview),
      { label: "Return to Shop", className: "secondary-button" },
    ],
  });
}

function getSystemsPreparationLabel() {
  return {
    review: "Reviewed room/network notes",
    josh: "Asked Josh what changed",
    leave: "Left with work-order notes as written",
  }[state.flags.systemsPreparation] || "None";
}

function showSystemsPreparation() {
  showModal({
    kicker: "Systems Prep",
    title: "Before The Reboot Request",
    body: `
      <p>Coordination wants this treated like a quick room reboot. The service ticket also says "network maybe?" which is not a diagnosis so much as a shrug with punctuation.</p>
      ${getChoicePressureMarkup([
        { label: "Review notes", detail: "Costs a little time now, but improves network and documentation checks." },
        { label: "Ask Josh", detail: "Improves the control-room read and keeps the joke aimed at bad process." },
        { label: "Leave now", detail: "Protects management optics, but the ticket stays vague." },
      ])}
    `,
    actions: [
      { label: "Review room and network notes", onClick: () => chooseSystemsPreparation("review") },
      { label: "Ask Josh what changed", className: "secondary-button", onClick: () => chooseSystemsPreparation("josh") },
      { label: "Leave with the work-order notes", className: "secondary-button", onClick: () => chooseSystemsPreparation("leave") },
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
    addLog("Left with the work-order notes as written. Management appreciated the velocity of not knowing more yet.");
  }
  render();
  promptSystemsTravel();
}

function promptSystemsTravel({ fastTravel = false } = {}) {
  showTravelRouteModal({
    routeId: "systemsService",
    dispatchEstimate: "Quick reboot, confirm room online, close ticket.",
    extraBody: `<p class="muted">The client says the room has been rebooted twice. The room, bravely, remains offline.</p>`,
    fastTravel,
    beforeTravel: () => {
      state.flags.systemsStarted = true;
      markCareerSnapshotStale();
    },
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
  const { skillCheck, energyCost } = resolveFieldTaskCheck({
    check,
    checkId,
    completedChecks: state.systemsChecks,
    flagKey: `systems-${checkId}`,
    contextBonus: getSystemsCheckContextBonus(checkId),
    baseEnergyCost: getSystemsCheckEnergyCost(checkId),
    strainedFlag: "systemsChecksStrained",
    logText: `${check.label} checked: ${check.log}`,
    strainedLogText: `Systems check strained on ${check.label}; the room is still more confident than the ticket.`,
  });
  render();
  const allChecked = state.systemsChecks.length === content.systemsDispatch.checks.length;
  showModal({
    kicker: "Systems Note",
    title: check.label,
    body: `
      <p>${check.detail}</p>
      ${getFieldTaskResultMarkup({ check, skillCheck, energyCost })}
      ${allChecked ? `<p class="muted">You know enough to choose between a useful closeout and a clean-looking ticket.</p>` : ""}
    `,
    actions: [{ label: allChecked ? "Review Systems Closeout" : "Keep Troubleshooting", onClick: allChecked ? showSystemsChoice : render }],
  });
}

function showSystemsChoice() {
  if (state.flags.systemsComplete) {
    return showCompletedDispatchReturnReview({
      title: "Systems Service Already Complete",
      source: content.systemsDispatch.title,
      result: state.flags.systemsApproach ? `Closeout path: ${state.flags.systemsApproach}` : "",
    });
  }
  showModal({
    kicker: "Systems Closeout",
    title: "The Room Is Not Just Offline",
    body: `
      <p>The room can be rebooted into a temporarily less embarrassing state, but the real issue is the mismatch between the control path, network note, and what the ticket claims is true.</p>
      ${state.flags.systemsChecksStrained ? `<p class="muted">One of the systems checks was strained. Documenting is still useful, but the closeout has less upside because one read needed extra interpretation.</p>` : ""}
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
  if (approach === "scope" && strained) return "Client trust rises; the crew gets a partial trail; management friction sharpens";
  if (approach === "scope") return "Client and crew trust rise; management friction sharpens";
  if (strained) return "Client trust rises; the crew gets partial help; management grumbles";
  return "Client and crew trust rise; management grumbles about the paper trail";
}

function getSystemsDiagnosticSummary(strained) {
  return strained
    ? "Strained read; useful closeout with reduced upside"
    : "Clean read; closeout is well supported";
}

function finishSystemsService(approach) {
  if (state.flags.systemsComplete) {
    return showCompletedDispatchReturnReview({
      title: "Systems Service Already Complete",
      source: content.systemsDispatch.title,
      result: state.flags.systemsApproach ? `Closeout path: ${state.flags.systemsApproach}` : "",
    });
  }
  const before = getTrackedStateSnapshot();
  const documented = approach !== "reboot";
  const strained = Boolean(state.flags.systemsChecksStrained) && documented;
  const xp = (approach === "scope" ? 65 : approach === "document" ? 55 : 35) - (strained ? 5 : 0);
  if (documented) changeEnergy(-(approach === "scope" ? 3 : 4));
  state.flags.systemsComplete = true;
  state.flags.systemsApproach = approach;
  markCareerSnapshotStale();
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
  if (!documented) {
    recordReturnTripRisk("systemsQuickReboot", {
      source: content.systemsDispatch.title,
      detail: "Room was closed with a quick reboot while the control/network mismatch stayed loose.",
    });
  } else if (state.flags.returnTripRisks?.systemsQuickReboot) {
    resolveReturnTripRisk("systemsQuickReboot", {
      source: content.systemsDispatch.title,
      resolution: "Systems closeout documented the mismatch instead of leaving the reboot as the explanation.",
    });
  }
  addLog(documented
    ? "Closed the systems service with a usable mismatch note instead of pretending the reboot explained itself."
    : "Closed the systems service with a reboot. The room came online, and the callback ledger quietly found a chair.");
  const closeoutConsequences = [{
    source: content.systemsDispatch.title,
    status: documented ? "documented" : "open",
    cause: documented
      ? "Control/network mismatch was written into the closeout."
      : "Quick reboot restored the room without explaining the mismatch.",
    affects: getReturnTripRiskAffectedWork("systemsQuickReboot"),
    detail: documented
      ? "Future service gets a usable mismatch trail."
      : "Systems quick-reboot debt is now visible on the return-trip ledger.",
  }];
  recordJobSiteCloseoutSummary({
    source: content.systemsDispatch.title,
    result: state.flags.systemsApproach ? `Closeout path: ${state.flags.systemsApproach}` : "",
    before,
    consequences: closeoutConsequences,
  });
  render();
  showModal({
    kicker: "Systems Service Complete",
    title: approach === "scope" ? "Scope Miss Written In Human" : approach === "document" ? "The Next Tech Gets A Map" : "The Room Rebooted, Technically",
    body: `
      <div class="results-grid">
        <span>Systems wages</span><strong>+$${documented ? 68 : 52}</strong>
        <span>Cash balance</span><strong>${formatCash(state.cash)}</strong>
        <span>Experience</span><strong>+${xp} XP</strong>
        <span>Diagnostic quality</span><strong>${getSystemsDiagnosticSummary(strained)}</strong>
        <span>Relationship result</span><strong>${getSystemsReputationSummary(approach, strained)}</strong>
        <span>Return-trip risk</span><strong>${documented ? "Lowered by documenting the mismatch" : "Increased by leaving the mismatch loose"}</strong>
        <span>Career record</span><strong>${documented ? "Systems mismatch documented" : "Quick reboot closed"}</strong>
      </div>
      ${getCloseoutConsequenceMarkup(closeoutConsequences)}
      ${documented
        ? `<blockquote>Management note: "Please keep technical closeout proportionate to the original ticket."</blockquote>`
        : `<blockquote>Management note: "Thanks for resolving this quickly."</blockquote>`}
      ${getReturnPortalCloseoutNoteMarkup()}
    `,
    actions: [getCloseoutReturnAction(content.systemsDispatch.title, "Returned to Radnor Rack & Wire after the King of Prussia systems service.")],
  });
}

function showTravelDispatchPreview() {
  showModal({
    kicker: "Dispatch Board",
    title: content.travelDispatch.title,
    body: getDispatchBoardMarkup({
      type: "Travel Cost",
      familyId: "logistics",
      setup: "Coordination added a quick Cherry Hill return stop after the King of Prussia service call. The work is tiny. The bridge toll and paperwork are somehow yours.",
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
  if (state.flags.travelComplete) {
    return showCompletedDispatchReturnReview({
      title: "Travel Cost Already Complete",
      source: content.travelDispatch.title,
      result: getCompletedCloseoutPathResult("travelApproach"),
    });
  }
  const tollCost = content.travelDispatch.tollCost || CHERRY_HILL_TOLL_COST;
  showModal({
    kicker: "Cherry Hill Return",
    title: "The Toll Exists Both Ways",
    body: `
      <p>The return stop itself is small. The problem is that coordination treated the bridge like a rumor and the van like it runs on optimism.</p>
      ${getChoicePressureMarkup([
        { label: "File receipt", detail: "Costs a little energy and protects your cash. Management may grumble about the paper trail." },
        { label: "Push coordination", detail: "Best process outcome if you can handle the pressure, but it asks management to notice its own travel planning." },
        { label: "Eat the toll", detail: `Fastest option. You pay $${tollCost}, and the bad process stays invisible for now.` },
      ])}
    `,
    actions: [
      { label: `File toll receipt and ETA note (-2 energy, $${tollCost} reimbursed)`, onClick: () => finishTravelDispatch("receipt") },
      ...(getSkillValue("commercialProcess") >= 3 || canUsePressureChoice() ? [{
        label: "Push coordination to own the return toll (-2 energy)",
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
  if (state.flags.travelComplete) {
    return showCompletedDispatchReturnReview({
      title: "Travel Cost Already Complete",
      source: content.travelDispatch.title,
      result: getCompletedCloseoutPathResult("travelApproach"),
    });
  }
  const before = getTrackedStateSnapshot();
  const tollCost = content.travelDispatch.tollCost || CHERRY_HILL_TOLL_COST;
  const documented = approach !== "absorb";
  const xp = approach === "pushback" ? 45 : approach === "receipt" ? 35 : 25;
  const basePay = 42;
  const netPay = documented ? basePay : basePay - tollCost;
  if (documented) changeEnergy(-2);
  state.flags.travelComplete = true;
  state.flags.travelApproach = approach;
  markCareerSnapshotStale();
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
    : "Ate the Cherry Hill toll to keep the ticket moving. The receipt disappeared into the same place as accurate route estimates.");
  const closeoutConsequences = [{
    source: content.travelDispatch.title,
    status: documented ? "documented" : "inherited",
    cause: documented
      ? "Return-route cost was filed before it disappeared into the workday."
      : "The toll was absorbed to keep the ticket simple.",
    affects: "future travel-cost expectations and shop trust",
    detail: documented
      ? "The route friction is visible to the shop."
      : "The route friction stays hidden and the tech eats the cost.",
  }];
  recordJobSiteCloseoutSummary({
    source: content.travelDispatch.title,
    result: getCompletedCloseoutPathResult("travelApproach"),
    before,
    consequences: closeoutConsequences,
  });
  render();
  showModal({
    kicker: "Travel Cost Complete",
    title: approach === "pushback" ? "Coordination Owns The Bridge Now" : approach === "receipt" ? "Receipt Filed Before It Became Folklore" : "The Toll Came Out Of Your Pocket",
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
      ${getCloseoutConsequenceMarkup(closeoutConsequences)}
      ${documented
        ? `<blockquote>Management note: "Please avoid over-documenting routine travel expenses."</blockquote>`
        : `<blockquote>Management note: "Thanks for keeping the return stop simple."</blockquote>`}
      ${getReturnPortalCloseoutNoteMarkup()}
    `,
    actions: [getCloseoutReturnAction(content.travelDispatch.title, "Returned to Radnor Rack & Wire after the Cherry Hill return stop.")],
  });
}

function showRetrofitWalkdownDispatchPreview() {
  showModal({
    kicker: "Dispatch Board",
    title: content.retrofitWalkdownDispatch.title,
    body: getDispatchBoardMarkup({
      type: "Retrofit Walkdown",
      familyId: "survey",
      routeId: "burlingtonRetrofitWalkdown",
      setup: "The drawings say existing conduit. The ceiling says several other things.",
      why: "Unlocked after the coordination-cost travel beat. This tests whether a site survey can protect a future install before the work becomes physical.",
      stakes: [
        "A real walkdown can protect the install crew from discovering pathway problems on install day.",
        "The quote pressure wants a clean yes/no instead of a useful scope note.",
        "Documentation and Commercial Process matter before any cable gets pulled.",
      ],
      consequenceHooks: [
        "Clean notes lower future retrofit install risk.",
        "Thin notes can create a field change or return-trip risk.",
        "Scope pushback may help coworkers while annoying management.",
      ],
      note: "This is a compact site survey: prep, walk the pathway, then decide how honest the closeout gets.",
      managementNote: "Please keep this quick. The quote already assumes the pathway is usable.",
      prep: state.flags.retrofitWalkdownPreparation ? `Preparation selected: ${getRetrofitWalkdownPreparationLabel()}` : "",
      taskCards: content.retrofitWalkdownDispatch.taskCards,
      fieldTasks: content.retrofitWalkdownDispatch.checks,
    }),
    actions: [
      getDispatchRoutePrepAction("burlingtonRetrofitWalkdown", showRetrofitWalkdownDispatchPreview),
      { label: "Return to Shop", className: "secondary-button" },
    ],
  });
}

function getRetrofitWalkdownPreparationLabel() {
  return {
    drawings: "Reviewed marked-up drawings",
    facilities: "Called facilities contact",
    none: "Trusted work-order notes",
  }[state.flags.retrofitWalkdownPreparation] || "None";
}

function showRetrofitWalkdownPreparation() {
  showModal({
    kicker: "Before You Leave",
    title: "Prepare For The Retrofit Walkdown",
    body: `
      <p>The work order says "existing pathway." The drawing shows one line, one wall, and no apparent fear of ceilings.</p>
      <p class="muted">Take one small preparation step before heading to Burlington County.</p>
    `,
    actions: [
      { label: "Review marked-up drawings", onClick: () => chooseRetrofitWalkdownPreparation("drawings") },
      { label: "Call the facilities contact", className: "secondary-button", onClick: () => chooseRetrofitWalkdownPreparation("facilities") },
      { label: "Trust work-order notes", className: "secondary-button", onClick: () => chooseRetrofitWalkdownPreparation("none") },
    ],
  });
}

function chooseRetrofitWalkdownPreparation(preparation) {
  state.flags.retrofitWalkdownPreparation = preparation;
  let title = "The Work Order Will Have To Do";
  let body = `<p>The notes say "existing conduit to display wall," which is a sentence with excellent confidence and no photos.</p>`;
  if (preparation === "drawings") {
    title = "Drawings Compared";
    body = `
      <p>The marked-up drawing shows the old projector location, the new display wall, and a gap where the word existing is supposed to become metal.</p>
      <p class="muted">Pathway and closeout checks get a small boost.</p>
    `;
    addLog("Compared the retrofit drawing against the work order before leaving for Burlington County.");
  }
  if (preparation === "facilities") {
    title = "Facilities Contact Reached";
    body = `
      <p>The facilities contact can meet you with a key and the ladder that actually clears the trophy case.</p>
      <p class="muted">Ceiling access costs 1 less energy and gets a small walkdown boost.</p>
    `;
    addLog("Called the Burlington facilities contact and arranged ceiling access before arrival.");
  }
  if (preparation === "none") addLog("Left for Burlington County trusting the work-order notes.");
  render();
  showModal({
    kicker: "Preparation Selected",
    title,
    body,
    actions: [{ label: "Head To Burlington County", onClick: promptRetrofitWalkdownTravel }],
  });
}

function promptRetrofitWalkdownTravel({ fastTravel = false } = {}) {
  showTravelRouteModal({
    routeId: "burlingtonRetrofitWalkdown",
    dispatchEstimate: "Confirm existing pathway and close the survey cleanly.",
    extraBody: `<p class="muted">This is a site walkdown, not the install. The useful work is deciding what the install crew should not have to discover live.</p>`,
    fastTravel,
    beforeTravel: () => {
      state.flags.retrofitWalkdownStarted = true;
      markCareerSnapshotStale();
    },
  });
}

function getRetrofitWalkdownCheckContextBonus(checkId) {
  if (state.flags.retrofitWalkdownPreparation === "facilities" && checkId === "ceiling-access") return 1;
  if (state.flags.retrofitWalkdownPreparation === "drawings" && ["pathway", "trade-conflict"].includes(checkId)) return 1;
  return 0;
}

function getRetrofitWalkdownCheckEnergyCost(checkId) {
  const preparationHelps = (state.flags.retrofitWalkdownPreparation === "facilities" && checkId === "ceiling-access")
    || (state.flags.retrofitWalkdownPreparation === "drawings" && checkId === "pathway");
  return Math.max(0, 3 - (preparationHelps ? 1 : 0));
}

function getRetrofitWalkdownCloseoutEnergyCost(baseCost) {
  return Math.max(2, baseCost - (state.flags.retrofitWalkdownPreparation === "drawings" ? 1 : 0) - getDocumentationSupportReduction());
}

function inspectRetrofitWalkdownCondition(checkId) {
  const check = content.retrofitWalkdownDispatch.checks.find((item) => item.id === checkId);
  if (!check || state.retrofitWalkdownChecks.includes(checkId)) return notify(`${check?.label || "That walkdown note"} is already checked.`);
  const { skillCheck, energyCost } = resolveFieldTaskCheck({
    check,
    checkId,
    completedChecks: state.retrofitWalkdownChecks,
    flagKey: `retrofit-walkdown-${checkId}`,
    contextBonus: getRetrofitWalkdownCheckContextBonus(checkId),
    baseEnergyCost: getRetrofitWalkdownCheckEnergyCost(checkId),
    failedEnergyPenalty: 1,
    cleanEnergyReduction: 1,
    strainedFlag: "retrofitWalkdownChecksStrained",
    logText: `${check.label} checked: ${check.log}.`,
    strainedLogText: `Walkdown check strained on ${check.label}; closeout will need a clearer scope call.`,
  });
  render();
  const allChecked = state.retrofitWalkdownChecks.length === content.retrofitWalkdownDispatch.checks.length;
  showModal({
    kicker: "Walkdown Note",
    title: check.label,
    body: `
      <p>${check.detail}</p>
      ${getFieldTaskResultMarkup({ check, skillCheck, energyCost })}
      ${allChecked ? `<p class="muted">You have enough to decide whether this becomes a clean install handoff, a field change, or another optimistic ticket.</p>` : ""}
    `,
    actions: [{ label: allChecked ? "Review Walkdown Closeout" : "Keep Walking The Site", onClick: allChecked ? showRetrofitWalkdownChoice : render }],
  });
}

function showRetrofitWalkdownChoice() {
  if (state.flags.retrofitWalkdownComplete) {
    return showCompletedDispatchReturnReview({
      title: "Retrofit Walkdown Already Complete",
      source: content.retrofitWalkdownDispatch.title,
      result: getCompletedCloseoutPathResult("retrofitWalkdownApproach"),
    });
  }
  showModal({
    kicker: "Retrofit Walkdown Closeout",
    title: "Existing Pathway, In The Theoretical Sense",
    body: `
      <p>The new display wall can work, but the existing pathway does not reach it cleanly. The install can be protected now, or the crew can discover the missing pathway while holding cable.</p>
      ${state.flags.retrofitWalkdownChecksStrained ? `<p class="muted">One walkdown check was strained. A scope pushback can keep the weak note from being buried.</p>` : ""}
      ${getDocumentationSupportReduction() ? `<p class="muted">Your documentation habits reduce the closeout cost by 1 energy.</p>` : ""}
      ${getChoicePressureMarkup([
        {
          label: "Document blockers",
          detail: "Costs energy to leave photos, pathway blockers, and install notes. Lowers future install risk, unless the strained check makes the note too soft.",
        },
        ...(getSkillValue("commercialProcess") >= 3 || canUsePressureChoice() ? [{
          label: "Push scope change",
          detail: "Turns the pathway miss into a field-change conversation. Best future-install protection, with sharper management friction.",
        }] : []),
        {
          label: "Accept pathway",
          detail: "Fast management-friendly closeout. The quote stays clean and the future install inherits the ceiling problem.",
        },
      ])}
    `,
    actions: [
      { label: `Document pathway blockers (-${getRetrofitWalkdownCloseoutEnergyCost(4)} energy)`, onClick: () => finishRetrofitWalkdown("document") },
      ...(getSkillValue("commercialProcess") >= 3 || canUsePressureChoice() ? [{
        label: `Push scope change with photos (-${getRetrofitWalkdownCloseoutEnergyCost(3)} energy)`,
        className: "secondary-button",
        onClick: () => finishRetrofitWalkdown("scope"),
      }] : []),
      { label: "Accept pathway as usable", className: "secondary-button", onClick: () => finishRetrofitWalkdown("accept") },
    ],
  });
}

function getRetrofitWalkdownReputationSummary(approach, strained = false) {
  if (approach === "accept") return "Management likes the clean quote; crew trust drops later";
  if (approach === "scope") return "Client and crew trust rise; management friction sharpens";
  if (strained) return "Client trust rises; crew gets partial help; management grumbles";
  return "Client and crew trust rise; management grumbles about the scope note";
}

function getRetrofitInstallHookSummary(approach, strained = false) {
  if (approach === "scope") return "Future install protected by field-change note";
  if (approach === "document" && !strained) return "Future install protected by walkdown photos";
  if (approach === "document") return "Future install gets a partial warning";
  return "Future install inherits pathway risk";
}

function finishRetrofitWalkdown(approach) {
  if (state.flags.retrofitWalkdownComplete) {
    return showCompletedDispatchReturnReview({
      title: "Retrofit Walkdown Already Complete",
      source: content.retrofitWalkdownDispatch.title,
      result: getCompletedCloseoutPathResult("retrofitWalkdownApproach"),
    });
  }
  const before = getTrackedStateSnapshot();
  const documented = approach !== "accept";
  const strained = Boolean(state.flags.retrofitWalkdownChecksStrained) && approach === "document";
  const xp = (approach === "scope" ? 65 : approach === "document" ? 55 : 35) - (strained ? 5 : 0);
  if (documented) changeEnergy(-getRetrofitWalkdownCloseoutEnergyCost(approach === "scope" ? 3 : 4));
  state.flags.retrofitWalkdownComplete = true;
  state.flags.retrofitWalkdownApproach = approach;
  markCareerSnapshotStale();
  const futureInstallPartialWarning = approach === "document" && strained;
  const futureInstallProtected = approach === "scope" || (approach === "document" && !futureInstallPartialWarning);
  const futureInstallRisk = approach === "accept" || futureInstallPartialWarning;
  const futureInstallBranch = futureInstallProtected ? "protected" : futureInstallPartialWarning ? "partial" : "risk";
  state.flags.retrofitInstallProtected = futureInstallProtected;
  state.flags.retrofitInstallRisk = futureInstallRisk;
  state.flags.retrofitInstallPartialWarning = futureInstallPartialWarning;
  state.flags.retrofitInstallBranch = futureInstallBranch;
  state.flags.retrofitScopeChangeLogged = approach === "scope";
  setClock(`${state.clock.slice(0, 3)} ${approach === "accept" ? "11:34" : "11:58"} AM`);
  if (!state.flags.retrofitWalkdownPaid) {
    state.cash += documented ? 76 : 58;
    state.flags.retrofitWalkdownPaid = true;
  }
  if (!state.flags.retrofitWalkdownProgressAwarded) {
    awardCareerProgress({
      xp,
      reputation: documented
        ? { clients: approach === "scope" ? 2 : 1, coworkers: strained ? 0 : 1, management: approach === "scope" ? -2 : -1 }
        : { clients: 0, coworkers: -1, management: 1 },
      source: content.retrofitWalkdownDispatch.title,
    });
    state.flags.retrofitWalkdownProgressAwarded = true;
  }
  if (!state.flags.retrofitWalkdownStatsRecorded) {
    state.stats.retrofitWalkdownsCompleted += 1;
    if (approach === "scope") {
      state.stats.retrofitScopePushbacks += 1;
      state.stats.documentedTaskRisks += 1;
    } else if (approach === "document") {
      state.stats.retrofitRisksDocumented += 1;
      state.stats.documentedTaskRisks += 1;
    } else {
      state.stats.retrofitRisksAccepted += 1;
    }
    state.flags.retrofitWalkdownStatsRecorded = true;
  }
  if (futureInstallRisk) {
    recordReturnTripRisk("burlington-retrofit-install", {
      source: content.retrofitWalkdownDispatch.title,
      detail: approach === "accept"
        ? "Pathway accepted without field-change note; future install may inherit ceiling risk."
        : "Walkdown documented blockers, but one strained read leaves partial install risk.",
    });
  } else if (state.flags.returnTripRisks?.["burlington-retrofit-install"]) {
    resolveReturnTripRisk("burlington-retrofit-install", {
      source: content.retrofitWalkdownDispatch.title,
      resolution: "Walkdown closeout protected the future install before the risk reached install day.",
    });
  }
  addLog(documented
    ? "Closed the Burlington walkdown with pathway blockers visible before install day."
    : "Accepted the Burlington pathway as usable. The future install now owns whatever the ceiling remembers.");
  const closeoutConsequences = [{
    source: content.retrofitWalkdownDispatch.title,
    status: futureInstallRisk ? "open" : "protected",
    cause: futureInstallRisk
      ? approach === "accept"
        ? "Pathway was accepted as usable without a field-change note."
        : "Blockers were documented, but a strained walkdown note left partial risk."
      : "Walkdown closeout protected the install with photos, scope language, or field-change ownership.",
    affects: getReturnTripRiskAffectedWork("burlington-retrofit-install"),
    detail: futureInstallRisk
      ? "The install branch inherits pathway risk."
      : "The install branch starts from a protected pathway note.",
  }];
  recordJobSiteCloseoutSummary({
    source: content.retrofitWalkdownDispatch.title,
    result: getCompletedCloseoutPathResult("retrofitWalkdownApproach"),
    before,
    consequences: closeoutConsequences,
  });
  render();
  showModal({
    kicker: "Retrofit Walkdown Complete",
    title: approach === "scope" ? "The Field Change Exists Before Install Day" : approach === "document" ? "The Install Crew Gets A Warning" : "The Quote Remains Unbothered",
    body: `
      <div class="results-grid">
        <span>Walkdown wages</span><strong>+$${documented ? 76 : 58}</strong>
        <span>Cash balance</span><strong>${formatCash(state.cash)}</strong>
        <span>Experience</span><strong>+${xp} XP</strong>
        <span>Preparation</span><strong>${getRetrofitWalkdownPreparationLabel()}</strong>
        <span>Relationship result</span><strong>${getRetrofitWalkdownReputationSummary(approach, strained)}</strong>
        <span>Future install hook</span><strong>${getRetrofitInstallHookSummary(approach, strained)}</strong>
        ${strained ? `<span>Skill consequence</span><strong>Strained walkdown note leaves partial install risk</strong>` : ""}
      </div>
      ${getCloseoutConsequenceMarkup(closeoutConsequences)}
      ${documented
        ? `<blockquote>Management note: "Please avoid creating field changes from preliminary walkdowns unless the pathway is truly unavailable."</blockquote>`
        : `<blockquote>Management note: "Thanks for confirming the quoted pathway."</blockquote>`}
      ${getReturnPortalCloseoutNoteMarkup()}
    `,
    actions: [getCloseoutReturnAction(content.retrofitWalkdownDispatch.title, "Returned to Radnor Rack & Wire after the Burlington County retrofit walkdown.")],
  });
}

function getRetrofitInstallJob() {
  return getPlannedJob("burlington-retrofit-install");
}

function getRetrofitInstallPreview() {
  const job = getRetrofitInstallJob();
  return job ? getPlannedJobPresentation(job) : null;
}

function getRetrofitInstallChecks() {
  return getRetrofitInstallJob()?.checks || [];
}

function getRetrofitInstallBranchLabel() {
  return getRetrofitInstallPreview()?.branch?.label || "Walkdown result";
}

function getRetrofitInstallLoadoutText(branchId = getRetrofitInstallPreview()?.branchId || "pending") {
  return {
    protected: "Load display hardware, pathway fittings that match the photo set, labels, pull string, and the marked-up walkdown notes.",
    partial: "Load display hardware, extra pathway hardware, pull string, labels, and the weak-note photos so the missing detail can be resolved onsite.",
    risk: "Load display hardware, extra pathway hardware, warning labels, pull string, and enough closeout discipline to keep the shortcut from becoming folklore.",
    pending: "Review the walkdown result before loading. The install should not leave as a blank work order.",
  }[branchId] || "Review the walkdown result before loading.";
}

function showRetrofitInstallDispatchPreview() {
  const preview = getRetrofitInstallPreview();
  if (!preview) return notify("The Burlington install is not on the board yet.");
  showModal({
    kicker: "Dispatch Board",
    title: preview.title,
    body: `
      ${getDispatchBoardMarkup({
        type: preview.type || "Retrofit Install",
        familyId: preview.familyId || "install",
        routeId: preview.routeId || "burlingtonRetrofitWalkdown",
        setup: preview.setup,
        why: "Unlocked after the Burlington walkdown. This install starts by inheriting that closeout instead of pretending the site is new.",
        stakes: preview.stakes,
        consequenceHooks: preview.consequenceHooks,
        note: preview.note,
        managementNote: preview.managementNote,
        prep: state.flags.retrofitInstallPackageReviewed ? `Walkdown package reviewed: ${getRetrofitInstallBranchLabel()}` : "Review the inherited walkdown package before loading the van.",
        taskCards: preview.taskCards,
        fieldTasks: getRetrofitInstallChecks(),
      })}
      ${getPlannedJobBranchMarkup(preview)}
    `,
    actions: [
      getDispatchRoutePrepAction("burlingtonRetrofitWalkdown", showRetrofitInstallDispatchPreview),
      { label: "Return to Shop", className: "secondary-button" },
    ],
  });
}

function showRetrofitInstallPackage() {
  const preview = getRetrofitInstallPreview();
  if (!preview) return notify("The Burlington install package is not ready.");
  state.flags.retrofitInstallPackageReviewed = true;
  state.flags.retrofitInstallBranch = preview.branchId;
  showModal({
    kicker: "Install Package",
    title: `Load For ${preview.branch?.label || "The Walkdown"}`,
    body: `
      <p>${preview.branch?.stateHint || "Walkdown result loaded."}</p>
      <p><strong>Loadout:</strong> ${escapeHtml(getRetrofitInstallLoadoutText(preview.branchId))}</p>
      <p class="muted">The install will use the same Burlington route. Fast travel is available after the first drive, but it still costs energy.</p>
    `,
    actions: [{ label: "Head To Burlington County", onClick: promptRetrofitInstallTravel }],
  });
}

function promptRetrofitInstallTravel({ fastTravel = false } = {}) {
  const preview = getRetrofitInstallPreview();
  showTravelRouteModal({
    routeId: "burlingtonRetrofitWalkdown",
    dispatchEstimate: "Install the retrofit using the inherited walkdown result.",
    actionLabel: fastTravel ? "Fast Travel To Retrofit Install" : "Drive To Retrofit Install",
    extraBody: `
      <p class="muted">Inherited result: ${escapeHtml(preview?.branch?.stateHint || "walkdown package reviewed")}.</p>
      <p class="muted">${escapeHtml(getRetrofitInstallLoadoutText(preview?.branchId))}</p>
    `,
    fastTravel,
    beforeTravel: () => {
      state.flags.retrofitInstallStarted = true;
      state.flags.retrofitInstallBranch = getRetrofitInstallBranchIdFromFlags(state.flags);
      markCareerSnapshotStale();
    },
  });
}

function getRetrofitInstallCheckDifficulty(branchId = getRetrofitInstallPreview()?.branchId || "pending") {
  return {
    protected: 3,
    partial: 4,
    risk: 5,
    pending: 4,
  }[branchId] || 4;
}

function getRetrofitInstallCheckEnergyCost(branchId = getRetrofitInstallPreview()?.branchId || "pending") {
  return {
    protected: 3,
    partial: 5,
    risk: 7,
    pending: 5,
  }[branchId] || 5;
}

function getRetrofitInstallCloseoutEnergyCost() {
  const branchId = getRetrofitInstallPreview()?.branchId || "pending";
  const baseCost = branchId === "protected" ? 3 : branchId === "partial" ? 4 : 5;
  return Math.max(2, baseCost - getDocumentationSupportReduction());
}

function getRetrofitInstallCheckContextBonus(branchId = getRetrofitInstallPreview()?.branchId || "pending") {
  if (branchId === "protected") return 1;
  if (branchId === "partial" && state.flags.retrofitInstallPackageReviewed) return 1;
  return 0;
}

function inspectRetrofitInstallCondition(checkId) {
  const check = getRetrofitInstallChecks().find((item) => item.id === checkId);
  if (!check || state.retrofitInstallChecks.includes(checkId)) return notify(`${check?.label || "That install task"} is already checked.`);
  const preview = getRetrofitInstallPreview();
  const branchId = preview?.branchId || "pending";
  const { skillCheck, energyCost } = resolveFieldTaskCheck({
    check,
    checkId,
    completedChecks: state.retrofitInstallChecks,
    flagKey: `retrofit-install-${checkId}-${branchId}`,
    skillId: check.skillId,
    difficulty: getRetrofitInstallCheckDifficulty(branchId),
    contextBonus: getRetrofitInstallCheckContextBonus(branchId),
    contextId: check.contextId,
    baseEnergyCost: getRetrofitInstallCheckEnergyCost(branchId),
    failedEnergyPenalty: 2,
    cleanEnergyReduction: 1,
    strainedFlag: "retrofitInstallCheckStrained",
    logText: `${check.label} complete: ${check.log}.`,
    strainedLogText: "Retrofit install check strained; the closeout needs stronger record/as-built notes.",
  });
  render();
  showModal({
    kicker: "Install Task",
    title: check.label,
    body: `
      <p>${check.detail}</p>
      <p class="muted">${preview?.branch?.stateHint || ""}</p>
      ${getFieldTaskResultMarkup({ check, skillCheck, energyCost })}
      <p class="muted">The pathway is in. Closeout decides whether the actual route becomes a usable record or another vague handoff.</p>
    `,
    actions: [{ label: "Review Install Closeout", onClick: showRetrofitInstallChoice }],
  });
}

function showRetrofitInstallChoice() {
  if (state.flags.retrofitInstallComplete) {
    return showCompletedDispatchReturnReview({
      title: "Retrofit Install Already Complete",
      source: getRetrofitInstallPreview()?.title || "Burlington County Retrofit Install",
      result: getCompletedCloseoutPathResult("retrofitInstallApproach"),
    });
  }
  const preview = getRetrofitInstallPreview();
  const branchId = preview?.branchId || "pending";
  const riskBranch = branchId === "partial" || branchId === "risk";
  showModal({
    kicker: "Retrofit Install Closeout",
    title: riskBranch ? "The Ceiling Is Finally In The Notes" : "Known Pathway, Actual Record",
    body: `
      <p>The display pathway is installed. The closeout can turn the real route into record/as-built notes, or it can leave the next person with a clean-looking install and a thinner map.</p>
      ${state.flags.retrofitInstallCheckStrained ? `<p class="muted">The install check was strained. A record/as-built closeout can still protect future service, but the upside is smaller.</p>` : ""}
      ${getDocumentationSupportReduction() ? `<p class="muted">Your documentation habits reduce the record/as-built closeout cost by 1 energy.</p>` : ""}
      ${getChoicePressureMarkup([
        {
          label: "Record actual pathway",
          detail: riskBranch ? "Costs energy, resolves the inherited pathway risk, and gives future service usable record/as-built notes." : "Costs energy and turns the protected pathway into useful closeout documentation.",
        },
        {
          label: "Quick install note",
          detail: riskBranch ? "Fast and management-friendly, but the weak pathway record stays on the ledger." : "Fast, but it wastes some of the walkdown's documentation value.",
        },
      ])}
    `,
    actions: [
      { label: `Record actual pathway (-${getRetrofitInstallCloseoutEnergyCost()} energy)`, onClick: () => finishRetrofitInstall("record") },
      { label: "Close with quick install note", className: "secondary-button", onClick: () => finishRetrofitInstall("quick") },
    ],
  });
}

function getRetrofitInstallReputationSummary(approach, riskResolved, riskInherited) {
  if (approach === "quick" && riskInherited) return "Management likes the fast closeout; crew trust drops because the pathway record stays weak";
  if (approach === "quick") return "Management likes the fast closeout; documentation value is left on the table";
  if (riskResolved) return "Client and crew trust rise; management grumbles about the record/as-built trail";
  return "Client trust rises; crew gets usable notes; management mostly tolerates it";
}

function getRetrofitInstallResultSummary(approach, branchId, strained) {
  if (approach === "quick") return branchId === "protected" ? "Installed with thin closeout" : "Installed with inherited pathway risk still loose";
  if (branchId === "protected") return strained ? "Protected route recorded with a strained install note" : "Protected route recorded cleanly";
  if (branchId === "partial") return strained ? "Partial warning improved, but not fully erased" : "Partial warning resolved into record notes";
  return strained ? "Risk documented after a strained install" : "Inherited risk resolved into record notes";
}

function finishRetrofitInstall(approach) {
  if (state.flags.retrofitInstallComplete) {
    return showCompletedDispatchReturnReview({
      title: "Retrofit Install Already Complete",
      source: getRetrofitInstallPreview()?.title || "Burlington County Retrofit Install",
      result: getCompletedCloseoutPathResult("retrofitInstallApproach"),
    });
  }
  const before = getTrackedStateSnapshot();
  const preview = getRetrofitInstallPreview();
  const branchId = preview?.branchId || "pending";
  const documented = approach === "record";
  const strained = Boolean(state.flags.retrofitInstallCheckStrained);
  const riskBranch = branchId === "partial" || branchId === "risk";
  const riskResolved = documented && riskBranch && !strained;
  const riskInherited = riskBranch && !riskResolved;
  const xp = Math.max(30, (documented ? (branchId === "risk" ? 70 : branchId === "partial" ? 65 : 60) : (branchId === "protected" ? 45 : 38)) - (strained ? 5 : 0));
  if (documented) changeEnergy(-getRetrofitInstallCloseoutEnergyCost());
  state.flags.retrofitInstallComplete = true;
  state.flags.retrofitInstallApproach = approach;
  state.flags.retrofitInstallRecordComplete = documented;
  state.flags.retrofitInstallRiskResolved = riskResolved;
  state.flags.retrofitInstallRiskInherited = riskInherited;
  markCareerSnapshotStale();
  setClock(`${state.clock.slice(0, 3)} ${documented ? "2:42" : "2:08"} PM`);
  if (!state.flags.retrofitInstallPaid) {
    state.cash += documented ? 94 : 76;
    state.flags.retrofitInstallPaid = true;
  }
  if (!state.flags.retrofitInstallProgressAwarded) {
    awardCareerProgress({
      xp,
      reputation: documented
        ? { clients: 1, coworkers: riskResolved ? 2 : 1, management: riskResolved ? -1 : 0 }
        : { clients: 0, coworkers: riskInherited ? -1 : 0, management: 1 },
      source: preview?.title || "Burlington County Retrofit Install",
    });
    state.flags.retrofitInstallProgressAwarded = true;
  }
  if (!state.flags.retrofitInstallStatsRecorded) {
    state.stats.retrofitInstallsCompleted += 1;
    state.stats.retrofitPathwaysInstalled += 1;
    if (riskResolved) {
      state.stats.retrofitInstallRisksResolved += 1;
      state.stats.documentedTaskRisks += 1;
    }
    if (riskInherited) state.stats.retrofitInstallRisksInherited += 1;
    state.flags.retrofitInstallStatsRecorded = true;
  }
  if (riskInherited) {
    recordReturnTripRisk("burlington-retrofit-install", {
      source: preview?.title || "Burlington County Retrofit Install",
      detail: documented
        ? "Retrofit pathway installed, but a strained note leaves partial future-service risk."
        : "Retrofit pathway installed with a quick note; weak pathway documentation remains.",
    });
  } else if (state.flags.returnTripRisks?.["burlington-retrofit-install"]) {
    resolveReturnTripRisk("burlington-retrofit-install", {
      source: preview?.title || "Burlington County Retrofit Install",
      resolution: riskResolved
        ? "Record/as-built closeout resolved the inherited pathway risk."
        : "Install closeout cleared the active Burlington risk.",
    });
  }
  addLog(documented
    ? "Closed the Burlington retrofit install with record/as-built pathway notes."
    : "Closed the Burlington retrofit install with a quick note. The ceiling knows what happened, at least.");
  const closeoutConsequences = [{
    source: preview?.title || "Burlington County Retrofit Install",
    status: riskInherited ? "inherited" : riskResolved ? "resolved" : documented ? "documented" : "controlled",
    cause: riskInherited
      ? "Install closeout left the inherited pathway record weak."
      : riskResolved
      ? "Record/as-built notes answered the inherited pathway risk."
      : documented
      ? "Protected route was turned into usable closeout documentation."
      : "Quick note left less documentation value, but no inherited pathway risk was active.",
    affects: getReturnTripRiskAffectedWork("burlington-retrofit-install"),
    detail: riskInherited
      ? "Future service inherits a thinner map of the actual pathway."
      : riskResolved
      ? "The prior Burlington risk is cleared into resolved history."
      : documented
      ? "Future service gets record/as-built context."
      : "The install is complete, but documentation value was left on the table.",
  }];
  recordJobSiteCloseoutSummary({
    source: preview?.title || "Burlington County Retrofit Install",
    result: getCompletedCloseoutPathResult("retrofitInstallApproach"),
    before,
    consequences: closeoutConsequences,
  });
  render();
  showModal({
    kicker: "Retrofit Install Complete",
    title: documented ? "The Actual Pathway Made It Into The Record" : "The Display Is Up, The Record Is Thin",
    body: `
      <div class="results-grid">
        <span>Install wages</span><strong>+$${documented ? 94 : 76}</strong>
        <span>Cash balance</span><strong>${formatCash(state.cash)}</strong>
        <span>Experience</span><strong>+${xp} XP</strong>
        <span>Inherited branch</span><strong>${preview?.branch?.label || branchId}</strong>
        <span>Install result</span><strong>${getRetrofitInstallResultSummary(approach, branchId, strained)}</strong>
        <span>Relationship result</span><strong>${getRetrofitInstallReputationSummary(approach, riskResolved, riskInherited)}</strong>
        <span>Return-trip risk</span><strong>${riskInherited ? "Still visible on the ledger" : "Cleared for this install"}</strong>
      </div>
      ${getCloseoutConsequenceMarkup(closeoutConsequences)}
      ${documented
        ? `<blockquote>Management note: "Please keep record drawing updates proportionate to the approved install."</blockquote>`
        : `<blockquote>Management note: "Thanks for keeping the install moving."</blockquote>`}
      ${getReturnPortalCloseoutNoteMarkup()}
    `,
    actions: [getCloseoutReturnAction(preview?.title || "Burlington County Retrofit Install", "Returned to Radnor Rack & Wire after the Burlington County retrofit install.")],
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
      fieldTasks: [
        ...content.commissioningDispatch.checks,
        ...content.commissioningDispatch.terminationTasks,
      ],
    }),
    actions: [
      getDispatchRoutePrepAction("southPhillyCommissioning", showCommissioningDispatchPreview),
      { label: "Return to Shop", className: "secondary-button" },
    ],
  });
}

function promptCommissioningTravel({ fastTravel = false } = {}) {
  showTravelRouteModal({
    routeId: "southPhillyCommissioning",
    dispatchEstimate: "Confirm room operation and collect client signoff.",
    extraBody: `<p class="muted">The completion sheet has already been signed internally.</p>`,
    fastTravel,
    beforeTravel: () => {
      state.flags.commissioningStarted = true;
    },
  });
}

function getCommissioningCheckEnergyCost() {
  return getVerificationEnergyCost(3);
}

function getCommissioningRepairEnergyCost(baseCost) {
  return Math.max(0, getVerificationEnergyCost(baseCost) - getCarefulTaskReduction());
}

function getCommissioningTerminationTask(action = state.flags.commissioningTerminationAction) {
  return content.commissioningDispatch.terminationTasks?.find((task) => task.id === action) || null;
}

function getCommissioningTerminationContextBonus(task) {
  if (!task) return 0;
  if (task.contextBonusSource === "carefulWork") return getCarefulWorkReduction();
  if (task.contextBonusSource === "documentationSupport") return getDocumentationSupportReduction();
  if (task.contextBonusSource === "ownedOptionalTool" && task.optionalTool && ownsTool(task.optionalTool)) {
    return task.optionalToolBonus || 1;
  }
  return task.contextBonus || 0;
}

function getCommissioningTerminationTaskDifficulty(action) {
  const task = getCommissioningTerminationTask(action);
  if (!task) return 0;
  if (action === "clean" && state.flags.terminationSkillStrained) return task.strainedDifficulty ?? task.difficulty ?? 0;
  return task.difficulty ?? 0;
}

function getCommissioningTerminationTaskEnergyCost(action) {
  const task = getCommissioningTerminationTask(action);
  const carefulDiscount = task?.carefulDiscount === false ? 0 : getCarefulTaskReduction();
  return Math.max(0, getVerificationEnergyCost(task?.energyCost ?? 3) - carefulDiscount);
}

function getCommissioningCloseoutEnergyCost(approach) {
  if (approach === "pass") return 0;
  const hasTaskAction = Boolean(state.flags.commissioningTerminationAction);
  const baseCost = hasTaskAction ? (approach === "craft" ? 4 : 3) : (approach === "craft" ? 5 : 6);
  const riskPenalty = state.flags.commissioningTerminationCallbackRisk && approach === "repair" ? 1 : 0;
  return getCommissioningRepairEnergyCost(baseCost) + riskPenalty;
}

function getCommissioningTerminationTaskLabel(action = state.flags.commissioningTerminationAction) {
  const task = getCommissioningTerminationTask(action);
  return task?.resultLabel || task?.label || "No termination task selected";
}

function getCommissioningTerminationActionLabel(action) {
  const task = getCommissioningTerminationTask(action);
  return `${task?.label || getCommissioningTerminationTaskLabel(action)} (-${getCommissioningTerminationTaskEnergyCost(action)} energy)`;
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

function getCommissioningTerminationTaskResult(action = state.flags.commissioningTerminationAction) {
  const task = getCommissioningTerminationTask(action);
  if (!task) return null;
  return state.flags.fieldTaskResults?.[`commissioning-termination-${action}`]
    || getFieldTaskResultForCheck(task);
}

function getCommissioningTerminationTaskState() {
  if (!state.flags.commissioningBrief) return getTaskState({ lockedReason: "Check in with the client contact first." });
  if (!state.commissioningChecks.includes("termination")) {
    return getDispatchFieldCheckTaskState({
      checks: content.commissioningDispatch.checks,
      checkId: "termination",
      completedChecks: state.commissioningChecks,
      readyDetail: "Inspect the credenza termination before deciding how to close out the room.",
    });
  }
  if (!state.flags.commissioningTerminationAction) {
    return getTaskState({
      stateId: "ready",
      detail: "Choose how to handle the loose speaker line before closeout.",
    });
  }
  const result = getCommissioningTerminationTaskResult();
  return result
    ? getTaskState({ result })
    : getTaskState({
      completed: true,
      detail: `${getCommissioningTerminationTaskLabel()}: ${getCommissioningTerminationQualityLabel()}.`,
    });
}

function showCommissioningTerminationTaskReview() {
  if (!state.flags.commissioningTerminationAction) return showCommissioningTerminationChoice();
  const result = getCommissioningTerminationTaskResult();
  showModal({
    kicker: "Field Task Review",
    title: getCommissioningTerminationTaskLabel(),
    body: `
      <p>${escapeHtml(state.flags.commissioningTerminationTaskOutcome || "The termination task is in your closeout notes.")}</p>
      ${getCommissioningTerminationTaskSummaryMarkup()}
      <p><strong>Saved task result:</strong></p>
      ${result ? `<ul class="modal-list">${getFieldTaskResultEntryMarkup(result)}</ul>` : `<p class="muted">No saved task result is attached to this action yet.</p>`}
      <p class="muted">This is the part of the room the closeout choice will inherit.</p>
    `,
    actions: [{ label: "Back To Commissioning", onClick: render }],
  });
}

function getCommissioningTerminationSkillCheck(action) {
  const task = getCommissioningTerminationTask(action);
  if (!task?.skillId) return null;
  return resolveSkillCheck(`commissioning-termination-action-${action}`, {
    skillId: task.skillId,
    difficulty: getCommissioningTerminationTaskDifficulty(action),
    contextBonus: getCommissioningTerminationContextBonus(task),
    contextId: task.contextId,
  });
}

function resolveCommissioningTerminationTask(action) {
  if (state.flags.commissioningTerminationAction) return notify("The termination task is already in your closeout notes.");
  const task = getCommissioningTerminationTask(action);
  if (!task) return notify("That termination task is not available.");
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
  recordFieldTaskResult({
    flagKey: `commissioning-termination-${action}`,
    check: task,
    checkId: action,
    skillCheck,
    energyCost,
    skillId: task.skillId || "",
    difficulty: getCommissioningTerminationTaskDifficulty(action),
    contextId: task.contextId || "",
    successful: skillCheck ? skillCheck.successful : !callbackRisk,
  });
  state.stats.fieldTaskChoicesMade += 1;
  addLog(`${getCommissioningTerminationTaskLabel(action)}: ${outcome}`);
  render();
  showModal({
    kicker: "Field Task Result",
    title: getCommissioningTerminationTaskLabel(action),
    body: `
      <p>${outcome}</p>
      ${getFieldTaskResultMarkup({ check: task, skillCheck, energyCost, successful: skillCheck ? skillCheck.successful : !callbackRisk })}
      <div class="results-grid">
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
      { label: getCommissioningTerminationActionLabel("quick"), onClick: () => resolveCommissioningTerminationTask("quick") },
      { label: getCommissioningTerminationActionLabel("clean"), onClick: () => resolveCommissioningTerminationTask("clean") },
      ...(ownsTool("labeler") ? [{
        label: getCommissioningTerminationActionLabel("label"),
        className: "secondary-button",
        onClick: () => resolveCommissioningTerminationTask("label"),
      }] : []),
      { label: getCommissioningTerminationActionLabel("document"), className: "secondary-button", onClick: () => resolveCommissioningTerminationTask("document") },
    ],
  });
}

function inspectCommissioningCondition(checkId) {
  const check = content.commissioningDispatch.checks.find((item) => item.id === checkId);
  if (!check || state.commissioningChecks.includes(checkId)) return notify(`${check?.label || "That condition"} is already in your notes.`);
  const { skillCheck, energyCost } = resolveFieldTaskCheck({
    check,
    checkId,
    completedChecks: state.commissioningChecks,
    flagKey: `commissioning-${checkId}`,
    contextBonus: checkId === "termination" && ownsTool("labeler") ? 1 : 0,
    baseEnergyCost: getCommissioningCheckEnergyCost(),
    strainedFlag: checkId === "termination" ? "terminationSkillStrained" : checkId === "drawing" ? "commissioningNotesStrained" : "",
    logText: `${check.label} checked: ${check.log}`,
    strainedLogText: `Commissioning skill check strained on ${check.label}; the closeout will need a stronger choice to stay clean.`,
  });
  render();
  const allChecked = state.commissioningChecks.length === content.commissioningDispatch.checks.length;
  const needsTerminationTask = state.commissioningChecks.includes("termination") && !state.flags.commissioningTerminationAction;
  showModal({
    kicker: "Commissioning Note",
    title: check.label,
    body: `
      <p>${check.detail}</p>
      ${getFieldTaskResultMarkup({ check, skillCheck, energyCost })}
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
  if (state.flags.commissioningComplete) {
    return showCompletedDispatchReturnReview({
      title: "Commissioning Visit Already Complete",
      source: content.commissioningDispatch.title,
      result: state.flags.commissioningApproach ? `Closeout path: ${state.flags.commissioningApproach}` : "",
    });
  }
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
  if (state.flags.commissioningComplete) {
    return showCompletedDispatchReturnReview({
      title: "Commissioning Visit Already Complete",
      source: content.commissioningDispatch.title,
      result: state.flags.commissioningApproach ? `Closeout path: ${state.flags.commissioningApproach}` : "",
    });
  }
  if (!state.flags.commissioningTerminationAction && state.commissioningChecks.includes("termination")) return showCommissioningTerminationChoice();
  const before = getTrackedStateSnapshot();
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
  markCareerSnapshotStale();
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
  const closeoutConsequences = [{
    source: content.commissioningDispatch.title,
    status: callbackRiskAdded ? "open" : documentedRisk ? "documented" : stableTask ? "controlled" : "inherited",
    cause: callbackRiskAdded
      ? callbackDetail
      : documentedRisk
      ? "Speaker-path risk was documented in closeout."
      : stableTask
      ? "Termination work was stable enough to avoid a callback."
      : "Room was passed with thin task notes.",
    affects: getReturnTripRiskAffectedWork("southPhillySpeakerTermination"),
    detail: callbackRiskAdded
      ? "Speaker-path risk is now visible on the return-trip ledger."
      : documentedRisk
      ? "Future work sees the discrepancy before it becomes a surprise."
      : stableTask
      ? "No speaker callback was created by this closeout."
      : "Future support inherits less clarity about the speaker path.",
  }];
  recordJobSiteCloseoutSummary({
    source: content.commissioningDispatch.title,
    result: state.flags.commissioningApproach ? `Closeout path: ${state.flags.commissioningApproach}` : "",
    before,
    consequences: closeoutConsequences,
  });
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
      ${getCloseoutConsequenceMarkup(closeoutConsequences)}
      ${careful
        ? `<blockquote>Management note: "Please distinguish between commissioning and reopening completed installation work."</blockquote>`
        : callbackRiskAdded
          ? `<blockquote>Management note: "Thanks for keeping closeout moving. Service can address any user-reported concerns."</blockquote>`
          : `<blockquote>Management note: "Thanks for protecting the schedule. Please update drawings when time allows."</blockquote>`}
      ${getReturnPortalCloseoutNoteMarkup()}
    `,
    actions: [getCloseoutReturnAction(content.commissioningDispatch.title, "Returned to Radnor Rack & Wire after the South Philadelphia commissioning visit.")],
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
      fieldTasks: content.surveyDispatch.inspections,
    }),
    actions: [
      getDispatchRoutePrepAction("universitySurvey", showSurveyDispatchPreview),
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

function promptSurveyTravel({ fastTravel = false } = {}) {
  showTravelRouteModal({
    routeId: "universitySurvey",
    dispatchEstimate: "Measure one wall. Confirm install conditions. Do not overcomplicate the quote.",
    fastTravel,
    beforeTravel: () => {
      state.flags.surveyStarted = true;
    },
  });
}

function getSurveyInspectionEnergyCost() {
  return Math.max(0, 2 - (state.flags.surveyPreparation === "measure" ? 1 : 0));
}

function getSurveyReportEnergyCost(baseCost) {
  return Math.max(2, baseCost - (state.flags.surveyPreparation === "sketch" ? 1 : 0) - getDocumentationSupportReduction());
}

function isSurveyInspectionComplete() {
  return content.surveyDispatch.inspections.every((item) => state.surveyInspections.includes(item.id));
}

function getSurveyReportTitle(approach = state.flags.surveyApproach) {
  return {
    pushback: "The Quote Is Paused Before The Damage",
    document: "The Constraint Is Now Somebody's Email",
    trust: "The Quote Remains Basically Approved",
  }[approach] || "The Survey Report Is Filed";
}

function getSurveyReportLabel(approach = state.flags.surveyApproach) {
  return {
    pushback: "Sales called directly",
    document: "Access risk documented",
    trust: "Quoted plan accepted",
  }[approach] || "Report filed";
}

function inspectSurveyConstraint(inspectionId) {
  if (state.flags.surveyComplete) return showSurveyCompleteReview();
  const inspection = content.surveyDispatch.inspections.find((item) => item.id === inspectionId);
  if (!inspection || state.surveyInspections.includes(inspectionId)) return notify(`${inspection?.label || "That condition"} is already in your notes.`);
  const { skillCheck, energyCost } = resolveFieldTaskCheck({
    check: inspection,
    checkId: inspectionId,
    completedChecks: state.surveyInspections,
    flagKey: `survey-${inspectionId}`,
    contextBonus: state.flags.surveyPreparation === "measure" ? 1 : 0,
    baseEnergyCost: getSurveyInspectionEnergyCost(),
    strainedFlag: inspectionId === "wall" ? "" : "surveyDocumentationStrained",
    logText: `${inspection.label} checked: ${inspection.log}`,
    strainedLogText: `Survey skill check strained on ${inspection.label}; the report will need a clearer closeout choice.`,
  });
  render();
  const allChecked = isSurveyInspectionComplete();
  showModal({
    kicker: "Survey Note",
    title: inspection.label,
    body: `
      <p>${inspection.detail}</p>
      ${getFieldTaskResultMarkup({ check: inspection, skillCheck, energyCost })}
      ${inspection.id === "wall" && getCharacterLine("surveyWall") ? `<p class="muted">${getCharacterLine("surveyWall")}</p>` : ""}
      ${allChecked ? `<p class="muted">You have enough information. Return to the facilities contact and file the survey report.</p>` : ""}
    `,
    actions: [{ label: allChecked ? "Return To Facilities Contact" : "Keep Surveying", onClick: render }],
  });
}

function showSurveyCompleteReview() {
  const returnPortal = getCurrentReturnPortal();
  showModal({
    kicker: "Site Survey Review",
    title: getSurveyReportTitle(),
    body: `
      <p>The University City site survey is already filed. The closeout choice is locked in.</p>
      <div class="results-grid">
        <span>Preparation</span><strong>${getSurveyPreparationLabel()}</strong>
        <span>Report</span><strong>${getSurveyReportLabel()}</strong>
        <span>Return route</span><strong>${returnPortal ? `${escapeHtml(returnPortal.label)} marker is ready` : "Use the site exit when available"}</strong>
      </div>
      <p class="muted">No more survey energy, XP, wages, or reputation changes can be taken from this contact. Walk to the marked return point to leave the site.</p>
    `,
    actions: [{ label: "Back To Survey Site", onClick: render }],
  });
}

function showSurveyReportChoice() {
  if (state.flags.surveyComplete) return showSurveyCompleteReview();
  if (!isSurveyInspectionComplete()) return notify("Finish the elevator, hallway, and wall observations before filing the survey report.");
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
  if (state.flags.surveyComplete) return showSurveyCompleteReview();
  const before = getTrackedStateSnapshot();
  const careful = approach !== "trust";
  const strainedDocument = Boolean(state.flags.surveyDocumentationStrained) && approach === "document";
  const xp = (approach === "pushback" ? 60 : approach === "document" ? 55 : 35) - (strainedDocument ? 5 : 0);
  if (careful) changeEnergy(-getSurveyReportEnergyCost(approach === "pushback" ? 2 : 3));
  state.flags.surveyComplete = true;
  state.flags.surveyApproach = approach;
  markCareerSnapshotStale();
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
  const closeoutConsequences = [{
    source: content.surveyDispatch.title,
    status: careful ? "documented" : "inherited",
    cause: careful
      ? "Access constraints were filed before the install quote could pretend they were simple."
      : "The quote was trusted even though the access path still looked constrained.",
    affects: "future install planning and access expectations",
    detail: careful
      ? "Future work starts with the access issue visible."
      : "Future work may inherit a cleaner-looking quote than the site deserves.",
  }];
  recordJobSiteCloseoutSummary({
    source: content.surveyDispatch.title,
    result: getCompletedCloseoutPathResult("surveyApproach"),
    before,
    consequences: closeoutConsequences,
  });
  render();
  showModal({
    kicker: "Site Survey Complete",
    title: getSurveyReportTitle(approach),
    body: `
      <div class="results-grid">
        <span>Survey wages</span><strong>+$72</strong>
        <span>Cash balance</span><strong>${formatCash(state.cash)}</strong>
        <span>Experience</span><strong>+${xp} XP</strong>
        <span>Preparation</span><strong>${getSurveyPreparationLabel()}</strong>
        <span>Report</span><strong>${getSurveyReportLabel(approach)}</strong>
        ${strainedDocument ? `<span>Skill consequence</span><strong>Thin notes softened the coworker/client gain</strong>` : ""}
      </div>
      ${approach === "trust"
        ? `<blockquote>Management note: "Thanks for keeping the survey efficient. Installation can confirm final access conditions onsite."</blockquote>`
        : `<blockquote>Management note: "Please avoid introducing unnecessary complexity after sales has aligned the client around a solution."</blockquote>`}
      ${getCloseoutConsequenceMarkup(closeoutConsequences)}
      ${getReturnPortalCloseoutNoteMarkup()}
    `,
    actions: [getCloseoutReturnAction(content.surveyDispatch.title, "Returned to Radnor Rack & Wire after the University City survey.")],
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
      <p>The service ticket called this a quick display issue. You have time for one small preparation step before taking Van #3 to Conshohocken.</p>
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
  let body = "<p>You decide not to spend more time preparing. The service ticket already used the word quick twice.</p>";
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

function promptServiceTravel({ fastTravel = false } = {}) {
  const reviewedTicket = state.flags.servicePreparation === "review";
  showTravelRouteModal({
    routeId: "conshohockenService",
    dispatchEstimate: "Diagnose the display issue and swap the screen if needed.",
    extraBody: reviewedTicket ? `<p class="expense"><strong>Work-order note:</strong> Inline coupler reported behind the credenza.</p>` : "",
    fastTravel,
    beforeTravel: () => {
      state.flags.serviceStarted = true;
      state.carry = [];
      state.flags.serviceHadPackedLunchBeforeRoute = Boolean(state.flags.packedLunchReady);
    },
    afterTravel: (route) => {
      if (state.flags.servicePreparation === "lunch" && !state.flags.serviceLunchUsed) {
        state.flags.serviceLunchUsed = true;
        if (!state.flags.serviceHadPackedLunchBeforeRoute) {
          changeEnergy(8);
          addLog("Ate the packed lunch before heading inside. Energy improved.");
        }
      }
      delete state.flags.serviceHadPackedLunchBeforeRoute;
      ensureServiceRoomConditions();
      enterScene(route.destinationSceneId);
    },
  });
}

function getServiceFieldCheckHistory() {
  state.flags.serviceFieldChecks ||= [];
  return state.flags.serviceFieldChecks;
}

function getServiceCheckById(checkId) {
  return content.serviceDispatch.checks.find((item) => item.id === checkId);
}

function getServiceRoomConditionDefinitions() {
  return content.serviceDispatch.roomConditions || [];
}

function getServiceRoomConditionById(conditionId) {
  return getServiceRoomConditionDefinitions().find((condition) => condition.id === conditionId) || null;
}

function getServiceRoomSeed() {
  if (!state.flags.serviceRoomSeed) {
    state.flags.serviceRoomSeed = Math.floor(Math.random() * 1000000000) + 1;
  }
  return state.flags.serviceRoomSeed;
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

function getRolledServiceRoomConditionIds(seed = getServiceRoomSeed()) {
  return getServiceRoomConditionDefinitions()
    .map((condition) => ({ id: condition.id, roll: getSeededUnit(seed, condition.id) }))
    .sort((a, b) => a.roll - b.roll || a.id.localeCompare(b.id))
    .slice(0, 2)
    .map((condition) => condition.id);
}

function ensureServiceRoomConditions({ applyPreparation = true } = {}) {
  const validIds = new Set(getServiceRoomConditionDefinitions().map((condition) => condition.id));
  const existing = Array.isArray(state.flags.serviceRoomConditions)
    ? uniqueValues(state.flags.serviceRoomConditions).filter((conditionId) => validIds.has(conditionId))
    : [];
  state.flags.serviceRoomConditions = existing.length ? existing.slice(0, 2) : getRolledServiceRoomConditionIds();
  state.flags.serviceKnownRoomConditions = Array.isArray(state.flags.serviceKnownRoomConditions)
    ? uniqueValues(state.flags.serviceKnownRoomConditions).filter((conditionId) => state.flags.serviceRoomConditions.includes(conditionId))
    : [];
  if (applyPreparation) revealServiceConditionsFromPreparation();
  return state.flags.serviceRoomConditions;
}

function getActiveServiceRoomConditions(options = {}) {
  return ensureServiceRoomConditions(options).map(getServiceRoomConditionById).filter(Boolean);
}

function getKnownServiceRoomConditionIds() {
  ensureServiceRoomConditions({ applyPreparation: false });
  return state.flags.serviceKnownRoomConditions || [];
}

function isServiceRoomConditionKnown(conditionId) {
  return getKnownServiceRoomConditionIds().includes(conditionId);
}

function revealServiceRoomCondition(conditionId, source = "") {
  const activeIds = ensureServiceRoomConditions({ applyPreparation: false });
  if (!activeIds.includes(conditionId)) return null;
  state.flags.serviceKnownRoomConditions ||= [];
  if (state.flags.serviceKnownRoomConditions.includes(conditionId)) return getServiceRoomConditionById(conditionId);
  state.flags.serviceKnownRoomConditions.push(conditionId);
  const condition = getServiceRoomConditionById(conditionId);
  if (condition && source) addLog(`${source}: ${condition.label} identified.`);
  return condition;
}

function revealNextServiceRoomCondition(source = "Room context") {
  const hiddenCondition = getActiveServiceRoomConditions({ applyPreparation: false })
    .find((condition) => !isServiceRoomConditionKnown(condition.id));
  return hiddenCondition ? revealServiceRoomCondition(hiddenCondition.id, source) : null;
}

function revealServiceConditionsFromPreparation() {
  const preparation = state.flags.servicePreparation;
  if (!preparation || ["none", "lunch", "coffee"].includes(preparation)) return [];
  state.flags.servicePreparationConditionRevealApplied ||= {};
  if (state.flags.servicePreparationConditionRevealApplied[preparation]) return [];
  const activeConditions = getActiveServiceRoomConditions({ applyPreparation: false });
  const directReveals = activeConditions
    .filter((condition) => condition.prepReveals?.includes(preparation))
    .map((condition) => revealServiceRoomCondition(condition.id, "Service prep"))
    .filter(Boolean);
  const reveals = directReveals.length ? directReveals : [revealNextServiceRoomCondition("Service prep")].filter(Boolean);
  state.flags.servicePreparationConditionRevealApplied[preparation] = true;
  return reveals;
}

function getServiceConditionCheckModifier(condition, check) {
  const modifiers = condition?.checkModifiers || {};
  const keys = uniqueValues([check?.id, check?.contextId]);
  return keys.map((key) => modifiers[key]).find(Boolean) || null;
}

function getServiceConditionCheckEffects(check) {
  const effects = {
    difficulty: 0,
    energy: 0,
    contextBonus: 0,
    knownLabels: [],
    hiddenCount: 0,
  };
  getActiveServiceRoomConditions().forEach((condition) => {
    if (isServiceConditionControlled(condition)) return;
    const modifier = getServiceConditionCheckModifier(condition, check);
    if (!modifier) return;
    const known = isServiceRoomConditionKnown(condition.id);
    effects.difficulty += modifier.difficulty || 0;
    effects.energy += modifier.energy || 0;
    if (known) effects.contextBonus += modifier.knownBonus || 0;
    if (known) effects.knownLabels.push(condition.label);
    else effects.hiddenCount += 1;
  });
  return effects;
}

function getServiceAdjustedCheck(check) {
  if (!check) return check;
  const effects = getServiceConditionCheckEffects(check);
  const conditionNotes = [
    ...effects.knownLabels.map((label) => `Known pressure: ${label}`),
    effects.hiddenCount ? `${effects.hiddenCount} hidden room pressure${effects.hiddenCount === 1 ? "" : "s"}` : "",
  ].filter(Boolean);
  return {
    ...check,
    difficulty: Math.max(0, (check.difficulty || 0) + effects.difficulty),
    energyCost: Math.max(0, (check.energyCost || 0) + effects.energy),
    detail: `${check.detail || ""}${conditionNotes.length ? ` Room condition: ${conditionNotes.join("; ")}.` : ""}`,
  };
}

function getServiceConditionContextBonus(check) {
  return getServiceConditionCheckEffects(check).contextBonus;
}

function revealServiceConditionsForCheck(check) {
  return getActiveServiceRoomConditions({ applyPreparation: false })
    .filter((condition) => getServiceConditionCheckModifier(condition, check))
    .map((condition) => revealServiceRoomCondition(condition.id, "Field check"))
    .filter(Boolean);
}

function getServiceRoomConditionMarkup({ revealAll = false } = {}) {
  const conditions = getActiveServiceRoomConditions();
  const visible = revealAll ? conditions : conditions.filter((condition) => isServiceRoomConditionKnown(condition.id));
  const hiddenCount = Math.max(0, conditions.length - visible.length);
  return `
    <h3>Room Conditions</h3>
    ${visible.length ? `
      <ul class="modal-list">
        ${visible.map((condition) => `
          <li>
            <strong>${escapeHtml(condition.label)}</strong>
            <span>${escapeHtml(condition.revealedSummary || condition.summary || condition.hiddenSummary || "")}</span>
            ${getServiceConditionResolution(condition.id) ? `<span>Response: ${escapeHtml(getServiceConditionResolution(condition.id).detail)}</span>` : ""}
          </li>
        `).join("")}
      </ul>
    ` : `<p class="muted">No room condition has been identified yet.</p>`}
    ${hiddenCount ? `<p class="muted">${hiddenCount} room pressure${hiddenCount === 1 ? " is" : "s are"} still unknown.</p>` : ""}
    ${getServiceRoomIncidentMarkup()}
  `;
}

function showServiceClientContext() {
  if (!state.flags.serviceBrief) return notify("Check in with the client contact first.");
  if (state.flags.serviceInspected) return notify('Client: "The afternoon meeting starts at one. No pressure."');
  if (state.flags.serviceClientContext) return notify("The client's symptom context is already in your notes.");
  state.flags.serviceClientContext = true;
  changeEnergy(-1);
  const revealed = revealNextServiceRoomCondition("Client context");
  showModal({
    kicker: "Client Context",
    title: revealed ? revealed.label : "No New Symptom",
    body: `
      <p>${escapeHtml(revealed?.revealedSummary || "The client repeats the same symptom: flicker, dropout, and a meeting getting closer.")}</p>
      ${getServiceRoomConditionMarkup()}
      <p class="muted">Asking costs a little time and energy, but known room conditions can offset service-check pressure.</p>
    `,
    actions: [{ label: "Inspect Display", onClick: render }],
  });
}

// Service room responses let one-off room pressure become a reusable mid-job RPG choice.
function getServiceConditionResolutionMap() {
  state.flags.serviceConditionResolutions ||= {};
  return state.flags.serviceConditionResolutions;
}

function getServiceConditionResolution(conditionId) {
  return getServiceConditionResolutionMap()[conditionId] || null;
}

function recordServiceConditionResolution(conditionId, resolution) {
  getServiceConditionResolutionMap()[conditionId] = {
    conditionId,
    clock: state.clock,
    ...resolution,
  };
}

function getServiceRoomIncidentEntries() {
  state.flags.serviceRoomIncidents ||= [];
  return state.flags.serviceRoomIncidents;
}

function formatServiceIncidentChance(chance = 0) {
  return `${Math.round(chance * 100)}%`;
}

function rollServiceImmediateIncident(option, rollOverride = null) {
  if (!option.incidentChance) return null;
  const roll = Number.isFinite(rollOverride) ? rollOverride : Math.random();
  return {
    roll,
    chance: option.incidentChance,
    happened: roll < option.incidentChance,
  };
}

function recordServiceRoomIncident(condition, option, rollResult) {
  const entries = getServiceRoomIncidentEntries();
  const incidentId = `${condition.id}-${option.id}-${entries.length + 1}`;
  const detail = option.incidentResult || `${condition.label} caused an immediate room issue.`;
  entries.push({
    id: incidentId,
    conditionId: condition.id,
    conditionLabel: condition.label,
    actionId: option.id,
    actionLabel: option.label,
    detail,
    chance: rollResult.chance,
    roll: rollResult.roll,
    clock: state.clock,
    incidentFlags: Object.keys(option.incidentFlags || {}),
    status: "open",
  });
  state.flags.serviceImmediatePressure = true;
  addLog(option.incidentLog || detail);
  return detail;
}

function getServiceRoomIncidentId(incident, index = 0) {
  return incident.id || `${incident.conditionId || "incident"}-${incident.actionId || "action"}-${index + 1}`;
}

function getOpenServiceRoomIncidents() {
  return getServiceRoomIncidentEntries().filter((incident) => !incident.recovered);
}

function getRecoverableServiceRoomIncidents() {
  if (state.flags.serviceComplete) return [];
  return getOpenServiceRoomIncidents();
}

function getServiceRoomIncidentById(incidentId) {
  return getServiceRoomIncidentEntries().find((incident, index) => getServiceRoomIncidentId(incident, index) === incidentId) || null;
}

function getServiceRoomIncidentMarkup() {
  const incidents = getServiceRoomIncidentEntries();
  if (!incidents.length) return "";
  return `
    <h3>Immediate Site Pressure</h3>
    <ul class="modal-list">
      ${incidents.map((incident) => `
        <li>
          <strong>${escapeHtml(incident.conditionLabel)}</strong>
          <span>${escapeHtml(incident.detail)}</span>
          <span>Status: ${escapeHtml(incident.recovered ? "Recovered" : incident.mitigated ? "Mitigated, technical risk remains" : "Open")}</span>
          ${incident.recoveryDetail ? `<span>Recovery: ${escapeHtml(incident.recoveryDetail)}</span>` : ""}
          <span>Risk roll: ${formatServiceIncidentChance(incident.chance)} chance, rolled ${Math.round((incident.roll || 0) * 100)}%.</span>
        </li>
      `).join("")}
    </ul>
  `;
}

function getServiceQuickResponseOption(condition, config) {
  return {
    id: config.id,
    label: `${config.label} (-1 energy, ${formatServiceIncidentChance(config.incidentChance)} incident risk)`,
    detail: `${config.detail} If the risk roll fails, the client sees the problem immediately and the closeout inherits pressure.`,
    result: config.successResult,
    log: config.successLog,
    energyCost: 1,
    reputation: config.successReputation || { management: 1 },
    stat: config.successStat || "",
    controlled: true,
    incidentChance: config.incidentChance,
    incidentResult: config.incidentResult,
    incidentLog: config.incidentLog,
    incidentReputation: config.incidentReputation || { clients: -2, management: -1 },
    incidentBurnout: config.incidentBurnout ?? 1,
    incidentFlags: config.incidentFlags || {},
  };
}

function getServiceConditionResponseOptions(condition) {
  if (!condition) return [];
  const leaveOption = {
    id: "leave",
    label: "Leave it for closeout",
    detail: "Saves energy now, but this pressure can still create callback debt.",
    result: `${condition.label} was left unresolved for closeout.`,
    log: `${condition.label} left unresolved during the Conshohocken service call.`,
    controlled: false,
  };

  if (["bad-ticket-notes", "mislabeled-input"].includes(condition.id)) {
    return [
      {
        id: "document",
        label: "Document signal-path discrepancy (-2 energy)",
        detail: "Costs energy and makes the signal-path problem visible before closeout. Coworkers benefit from the note; management dislikes the delay.",
        result: `${condition.label} is controlled by a clear signal-path note.`,
        log: `Documented ${condition.label.toLowerCase()} before closing the service call.`,
        energyCost: 2,
        reputation: { coworkers: 1, management: -1 },
        stat: "documentedTaskRisks",
        controlled: true,
      },
      getServiceQuickResponseOption(condition, {
        id: "quick-trace",
        label: "Quick-trace the path",
        detail: "Fast troubleshooting can preserve the schedule without doing a full signal-path proof.",
        successResult: `${condition.label} holds after a quick trace.`,
        successLog: `Quick-traced ${condition.label.toLowerCase()} without a visible dropout.`,
        incidentChance: 0.35,
        incidentResult: "The signal drops while the client is watching; the room is working again, but trust in the closeout is damaged.",
        incidentLog: "Immediate service pressure: the signal dropped in front of the client during a quick trace.",
        incidentFlags: { serviceVerificationStrained: true },
      }),
      leaveOption,
    ];
  }

  if (condition.id === "flaky-replacement-display") {
    return [
      {
        id: "stabilize",
        label: "Stabilize replacement input board (-3 energy)",
        detail: "Spend extra effort on the replacement path before the room gets booked again.",
        result: "Replacement input-board pressure is controlled before closeout.",
        log: "Stabilized the replacement display input board before closeout.",
        energyCost: 3,
        reputation: { coworkers: 1 },
        stat: "carefulFinishes",
        controlled: true,
      },
      getServiceQuickResponseOption(condition, {
        id: "force-board",
        label: "Force the replacement board",
        detail: "A quick board reseat might get the meeting moving without a careful bench check.",
        successResult: "The replacement input board settles after a quick reseat.",
        successLog: "Forced the replacement input board into service without an immediate failure.",
        incidentChance: 0.45,
        incidentResult: "The replacement display flickers hard after the quick reseat. The client sees the failure and the install now needs extra recovery.",
        incidentLog: "Immediate service pressure: the replacement display flickered hard after a rushed board reseat.",
        incidentFlags: { serviceInstallStrained: true },
      }),
      leaveOption,
    ];
  }

  if (condition.id === "loose-mount-hardware") {
    return [
      {
        id: "square",
        label: "Square the mount hardware (-3 energy)",
        detail: "Costs energy now, but prevents a shaky install from becoming the next tech's problem.",
        result: "Loose mount pressure is controlled by extra hardware cleanup.",
        log: "Squared the loose mount hardware before closing the service call.",
        energyCost: 3,
        reputation: { clients: 1 },
        stat: "carefulFinishes",
        controlled: true,
      },
      getServiceQuickResponseOption(condition, {
        id: "snug-mount-fast",
        label: "Snug the mount fast",
        detail: "A fast hardware pass can save energy if the mount is less loose than it looks.",
        successResult: "The mount holds after a fast hardware pass.",
        successLog: "Snugged the loose mount hardware quickly and it held under test.",
        incidentChance: 0.4,
        incidentResult: "The display sags during the fast hardware pass. Nothing breaks, but the client sees a shaky install and the room needs extra recovery.",
        incidentLog: "Immediate service pressure: the display sagged during a rushed mount pass.",
        incidentFlags: { serviceInstallStrained: true },
      }),
      leaveOption,
    ];
  }

  if (condition.id === "client-time-pressure") {
    return [
      {
        id: "expectation",
        label: "Set client expectation (-1 energy)",
        detail: "Tell the client the swap may need verification time. It protects the room, but slows the management-friendly path.",
        result: "Client time pressure is controlled by setting expectations before closeout.",
        log: "Set the client's expectation that verification could beat a rushed swap.",
        energyCost: 1,
        reputation: { clients: 1, management: -1 },
        controlled: true,
      },
      getServiceQuickResponseOption(condition, {
        id: "promise-fast",
        label: "Promise the room will be ready",
        detail: "A confident promise can keep the client calm if the swap really stays smooth.",
        successResult: "The client accepts the quick promise and gives you room to finish.",
        successLog: "Promised a fast room recovery and kept the client calm.",
        incidentChance: 0.3,
        incidentResult: "The room is not ready as promised. The client gets angry before closeout and future service trust drops.",
        incidentLog: "Immediate service pressure: the client got angry after a rushed room-ready promise slipped.",
        incidentFlags: { serviceClientAngry: true },
      }),
      leaveOption,
    ];
  }

  return [leaveOption];
}

function getActionableServiceRoomConditions() {
  if (!state.flags.serviceInspected || state.flags.serviceComplete) return [];
  return getActiveServiceRoomConditions()
    .filter((condition) => isServiceRoomConditionKnown(condition.id))
    .filter((condition) => !getServiceConditionResolution(condition.id))
    .filter((condition) => !isServiceConditionControlled(condition));
}

function getServiceConditionChoicePressureMarkup(condition, options) {
  return getChoicePressureMarkup(options.map((option) => ({
    label: option.label,
    detail: option.detail,
  })));
}

function showServiceRoomConditionChoice() {
  const conditions = getActionableServiceRoomConditions();
  if (!conditions.length) return notify("No known room pressure is waiting on a decision.");
  if (conditions.length === 1) return showServiceConditionResponseChoice(conditions[0].id);
  showModal({
    kicker: "Room Pressure",
    title: "Choose What To Handle",
    body: `
      <p>Known service-room pressure can be handled now or carried into closeout as callback risk.</p>
      ${getServiceRoomConditionMarkup()}
    `,
    actions: [
      ...conditions.map((condition) => ({
        label: `Handle ${condition.label}`,
        onClick: () => showServiceConditionResponseChoice(condition.id),
      })),
      { label: "Back To Room", className: "secondary-button", onClick: render },
    ],
  });
}

function showServiceConditionResponseChoice(conditionId) {
  const condition = getServiceRoomConditionById(conditionId);
  if (!condition || !isServiceRoomConditionKnown(conditionId)) return notify("That room pressure is not in your notes yet.");
  if (getServiceConditionResolution(conditionId)) return notify("That room pressure already has a response.");
  const options = getServiceConditionResponseOptions(condition);
  showModal({
    kicker: "Room Pressure",
    title: condition.label,
    body: `
      <p>${escapeHtml(condition.revealedSummary || condition.summary || condition.hiddenSummary || "")}</p>
      ${getServiceConditionChoicePressureMarkup(condition, options)}
      <p class="muted">Handling a room condition can prevent callback pressure. Leaving it saves energy but keeps the risk alive.</p>
    `,
    actions: options.map((option) => ({
      label: option.label,
      className: option.controlled ? undefined : "secondary-button",
      onClick: () => resolveServiceConditionResponse(condition.id, option.id),
    })),
  });
}

function applyReputationDelta(delta = {}) {
  Object.entries(delta).forEach(([key, value]) => {
    state.reputation[key] = (state.reputation[key] || 0) + value;
  });
}

function resolveServiceConditionResponse(conditionId, optionId, rollOverride = null) {
  const condition = getServiceRoomConditionById(conditionId);
  const option = getServiceConditionResponseOptions(condition).find((item) => item.id === optionId);
  if (!condition || !option) return notify("That room-pressure response is not available.");
  if (!isServiceRoomConditionKnown(conditionId)) return notify("That room pressure is not in your notes yet.");
  if (state.flags.serviceComplete) return notify("The service call is already closed out.");
  if (getServiceConditionResolution(conditionId)) return notify("That room pressure already has a response.");

  if (option.energyCost) changeEnergy(-option.energyCost);
  const rollResult = rollServiceImmediateIncident(option, rollOverride);
  const incidentHappened = Boolean(rollResult?.happened);
  const controlled = option.controlled !== false && !incidentHappened;
  const resultDetail = incidentHappened
    ? recordServiceRoomIncident(condition, option, rollResult)
    : option.result;
  if (incidentHappened) {
    applyReputationDelta(option.incidentReputation || {});
    if (option.incidentBurnout) state.burnout = Math.max(0, state.burnout + option.incidentBurnout);
    Object.assign(state.flags, option.incidentFlags || {});
  } else {
    applyReputationDelta(option.reputation || {});
    if (option.stat) state.stats[option.stat] = (state.stats[option.stat] || 0) + 1;
    addLog(option.log);
  }
  state.stats.fieldTaskChoicesMade = (state.stats.fieldTaskChoicesMade || 0) + 1;
  recordServiceConditionResolution(conditionId, {
    actionId: option.id,
    label: option.label,
    detail: resultDetail,
    controlled,
    incident: incidentHappened,
    incidentChance: rollResult?.chance || 0,
    incidentRoll: rollResult?.roll ?? null,
  });
  markCareerSnapshotStale();
  render();
  showModal({
    kicker: "Room Pressure Response",
    title: incidentHappened ? "Immediate Problem" : controlled ? "Pressure Controlled" : "Risk Carried Forward",
    body: `
      <p>${escapeHtml(resultDetail)}</p>
      ${rollResult ? `<p class="muted"><strong>Incident roll:</strong> ${formatServiceIncidentChance(rollResult.chance)} chance, rolled ${Math.round(rollResult.roll * 100)}%. ${incidentHappened ? "The risk happened in the room." : "The quick action held this time."}</p>` : ""}
      ${getServiceRoomConditionMarkup()}
      <p class="muted">${controlled ? "This condition will not add callback pressure at closeout unless another problem remains." : "This condition can still become a return-trip risk when the room is closed out."}</p>
    `,
    actions: [
      ...(incidentHappened ? [{ label: "Recover Incident", onClick: showServiceIncidentRecoveryChoice }] : []),
      ...(getActionableServiceRoomConditions().length ? [{ label: "Handle Another Condition", onClick: showServiceRoomConditionChoice }] : []),
      { label: "Back To Room", className: "secondary-button", onClick: render },
    ],
  });
}

function getServiceIncidentRecoveryOptions(incident) {
  if (!incident) return [];
  return [
    {
      id: "stabilize",
      label: "Stabilize room and own the delay (-3 energy)",
      detail: "Spend the energy to fix the visible problem, explain the delay, and protect the next visit. Coworkers and clients respect it; management dislikes the time.",
      result: `${incident.conditionLabel} is recovered before closeout. The immediate problem is no longer callback pressure by itself.`,
      log: `Recovered the ${incident.conditionLabel.toLowerCase()} incident before closeout.`,
      energyCost: 3,
      reputation: { clients: 1, coworkers: 1, management: -1 },
      stat: "documentedTaskRisks",
      recovered: true,
      controlled: true,
    },
    {
      id: "calm-client",
      label: "Calm the client and keep moving (-1 energy)",
      detail: "Recover some trust in the room, but leave the technical uncertainty for closeout.",
      result: `${incident.conditionLabel} is calmer in the moment, but the technical risk remains open.`,
      log: `Calmed the client after the ${incident.conditionLabel.toLowerCase()} incident, but the technical risk remained.`,
      energyCost: 1,
      reputation: { clients: 1 },
      mitigated: true,
      controlled: false,
    },
    {
      id: "carry",
      label: "Carry it into closeout",
      detail: "Spend nothing now. The incident stays open and will shape the return-trip risk.",
      result: `${incident.conditionLabel} stays open for closeout.`,
      log: `${incident.conditionLabel} incident carried into closeout.`,
      controlled: false,
    },
  ];
}

function showServiceIncidentRecoveryChoice() {
  const incidents = getRecoverableServiceRoomIncidents();
  if (!incidents.length) return notify("No open room incident needs recovery.");
  if (incidents.length === 1) return showServiceIncidentRecoveryOptions(getServiceRoomIncidentId(incidents[0], 0));
  showModal({
    kicker: "Incident Recovery",
    title: "Choose What To Recover",
    body: `
      <p>The room has visible pressure now. Recovering it can change closeout instead of only logging a future problem.</p>
      ${getServiceRoomIncidentMarkup()}
    `,
    actions: [
      ...incidents.map((incident, index) => ({
        label: `Recover ${incident.conditionLabel}`,
        onClick: () => showServiceIncidentRecoveryOptions(getServiceRoomIncidentId(incident, index)),
      })),
      { label: "Back To Room", className: "secondary-button", onClick: render },
    ],
  });
}

function showServiceIncidentRecoveryOptions(incidentId) {
  const incident = getServiceRoomIncidentById(incidentId);
  if (!incident || incident.recovered) return notify("That room incident is no longer open.");
  const options = getServiceIncidentRecoveryOptions(incident);
  showModal({
    kicker: "Incident Recovery",
    title: incident.conditionLabel,
    body: `
      <p>${escapeHtml(incident.detail)}</p>
      ${getChoicePressureMarkup(options.map((option) => ({ label: option.label, detail: option.detail })))}
      <p class="muted">A recovery choice changes the current room state before closeout.</p>
    `,
    actions: options.map((option) => ({
      label: option.label,
      className: option.recovered ? undefined : "secondary-button",
      onClick: () => resolveServiceIncidentRecovery(incidentId, option.id),
    })),
  });
}

function resolveServiceIncidentRecovery(incidentId, optionId) {
  const incident = getServiceRoomIncidentById(incidentId);
  const option = getServiceIncidentRecoveryOptions(incident).find((item) => item.id === optionId);
  if (!incident || !option) return notify("That incident recovery is not available.");
  if (state.flags.serviceComplete) return notify("The service call is already closed out.");
  if (incident.recovered) return notify("That room incident is already recovered.");

  if (option.energyCost) changeEnergy(-option.energyCost);
  applyReputationDelta(option.reputation || {});
  if (option.stat) state.stats[option.stat] = (state.stats[option.stat] || 0) + 1;
  state.stats.fieldTaskChoicesMade = (state.stats.fieldTaskChoicesMade || 0) + 1;

  incident.recoveryAction = option.id;
  incident.recoveryDetail = option.result;
  incident.status = option.recovered ? "recovered" : option.mitigated ? "mitigated" : "open";
  incident.mitigated = Boolean(option.mitigated);
  incident.recovered = Boolean(option.recovered);

  if (option.controlled) {
    const resolution = getServiceConditionResolution(incident.conditionId);
    if (resolution) {
      resolution.controlled = true;
      resolution.recoveredIncident = true;
      resolution.detail = `${resolution.detail} Recovery: ${option.result}`;
    } else {
      recordServiceConditionResolution(incident.conditionId, {
        actionId: option.id,
        label: option.label,
        detail: option.result,
        controlled: true,
        recoveredIncident: true,
      });
    }
    (incident.incidentFlags || []).forEach((flagKey) => {
      if (["serviceVerificationStrained", "serviceInstallStrained", "serviceClientAngry"].includes(flagKey)) {
        state.flags[flagKey] = false;
      }
    });
  }

  state.flags.serviceImmediatePressure = getOpenServiceRoomIncidents().length > 0;
  addLog(option.log);
  markCareerSnapshotStale();
  render();
  showModal({
    kicker: "Incident Recovery",
    title: option.recovered ? "Incident Recovered" : option.mitigated ? "Client Calmed" : "Pressure Carried",
    body: `
      <p>${escapeHtml(option.result)}</p>
      ${getServiceRoomIncidentMarkup()}
      <p class="muted">${option.recovered ? "This incident will not create return-trip pressure unless another service issue remains." : "The room still carries technical pressure into closeout."}</p>
    `,
    actions: [
      ...(getRecoverableServiceRoomIncidents().some((item) => !item.recoveryAction || !item.recovered) ? [{ label: "Review Open Incident", onClick: showServiceIncidentRecoveryChoice }] : []),
      { label: "Back To Room", className: "secondary-button", onClick: render },
    ],
  });
}

function isServiceConditionControlled(condition) {
  if (getServiceConditionResolution(condition.id)?.controlled) return true;
  const installComplete = state.serviceInstalled.length === content.serviceDispatch.swapItems.length;
  const verificationComplete = getServiceFieldCheckHistory().includes("signal-path");
  const verifiedClean = verificationComplete && state.flags.serviceApproach === "verify" && !state.flags.serviceVerificationStrained;
  const installClean = installComplete && !state.flags.serviceInstallStrained;
  if (["bad-ticket-notes", "mislabeled-input"].includes(condition.id)) return verifiedClean;
  if (["flaky-replacement-display", "loose-mount-hardware"].includes(condition.id)) return installClean;
  if (condition.id === "client-time-pressure") return verifiedClean || state.flags.serviceClientContext;
  return verifiedClean || installClean;
}

function getUnresolvedServiceRoomConditions() {
  if (!state.flags.serviceComplete && !state.flags.serviceApproach) return [];
  return getActiveServiceRoomConditions()
    .filter((condition) => !isServiceConditionControlled(condition));
}

function getServiceRoomConditionCloseoutEntry({ checkedSignalPath = false, strainedVerification = false } = {}) {
  const activeConditions = getActiveServiceRoomConditions();
  const unresolved = getUnresolvedServiceRoomConditions();
  const incidents = getOpenServiceRoomIncidents();
  const labels = activeConditions.map((condition) => condition.label).join(", ") || "ordinary service pressure";
  const unresolvedLabels = unresolved.map((condition) => condition.label).join(", ");
  const incidentLabels = incidents.map((incident) => incident.conditionLabel).join(", ");
  const openPressure = unresolved.length || incidents.length;
  const verifiedText = checkedSignalPath
    ? "Signal path and room pressure were controlled well enough to protect the next visit."
    : strainedVerification
    ? "Verification happened, but the room pressure still left thin notes."
    : openPressure
    ? "The room was closed without fully proving the pressure behind the ticket."
    : "Known room pressure was handled before closeout, even without a full signal-path verification.";
  return {
    source: content.serviceDispatch.title,
    status: openPressure ? "open" : "controlled",
    cause: unresolved.length
      ? `Unresolved room pressure: ${unresolvedLabels}.`
      : incidents.length
      ? `Immediate site pressure: ${incidentLabels}.`
      : `Room pressure controlled: ${labels}.`,
    affects: "Conshohocken callback routing and future display service",
    detail: openPressure
      ? `${verifiedText} ${unresolved.map((condition) => condition.closeoutRisk).filter(Boolean).join(" ")} ${incidents.map((incident) => incident.detail).join(" ")}`.trim()
      : verifiedText,
  };
}

function getServiceInstallCheck(itemIds) {
  const itemChecks = itemIds.map((itemId) => getServiceCheckById(itemId)).filter(Boolean);
  if (itemChecks.length === 1) return itemChecks[0];
  const labels = getServiceItemLabels(itemIds);
  return {
    id: itemIds.join("-"),
    label: `Install ${labels.join(" and ")}`,
    type: "display swap install",
    skillId: "install",
    difficulty: Math.max(...itemChecks.map((item) => item.difficulty || 3), 3),
    contextId: "service-install",
    energyCost: 10,
    requiredTool: "screwdriver",
    optionalTool: "drill",
    riskFlag: "serviceInstallStrained",
    riskLabel: "strained service install",
    successText: "Replacement gear is installed cleanly enough to keep closeout focused on diagnosis.",
    strainedText: "Replacement gear works after extra effort; closeout should not pretend the install was frictionless.",
    log: `${labels.join(" and ")} installed as a grouped service swap`,
    detail: "The display and hardware move as one replacement package. That helps the carry, but the install still has to be square.",
  };
}

function showServiceResults() {
  if (state.flags.serviceComplete) {
    return showCompletedDispatchReturnReview({
      title: "Service Call Already Complete",
      source: content.serviceDispatch.title,
      result: getCompletedCloseoutPathResult("serviceApproach"),
    });
  }
  const before = getTrackedStateSnapshot();
  ensureServiceRoomConditions();
  const verifiedSignalPath = state.flags.serviceApproach === "verify";
  const checkedSignalPath = verifiedSignalPath && !state.flags.serviceVerificationStrained;
  const strainedVerification = verifiedSignalPath && state.flags.serviceVerificationStrained;
  const unresolvedConditions = getUnresolvedServiceRoomConditions();
  const immediateIncidents = getOpenServiceRoomIncidents();
  const serviceReturnRisk = Boolean(state.flags.serviceInstallStrained) || unresolvedConditions.length > 0 || immediateIncidents.length > 0;
  const openPressureLabels = [
    ...unresolvedConditions.map((condition) => condition.label),
    ...immediateIncidents.map((incident) => incident.conditionLabel),
  ].filter(Boolean).join(", ");
  const xp = checkedSignalPath && !serviceReturnRisk ? 55 : !verifiedSignalPath && !serviceReturnRisk ? 48 : checkedSignalPath ? 50 : strainedVerification ? 45 : 40;
  const diagnosisLabel = checkedSignalPath && !serviceReturnRisk
    ? "Room pressure controlled"
    : !verifiedSignalPath && !serviceReturnRisk
    ? "Quick choices held"
    : immediateIncidents.length
    ? "Immediate room pressure"
    : checkedSignalPath
    ? "Signal verified; room pressure remains"
    : strainedVerification
    ? "Verification strained"
    : "Ticket trusted";
  const serviceRiskDetail = checkedSignalPath
    ? serviceReturnRisk
      ? `Signal path notes helped, but open room pressure remains: ${openPressureLabels || "site pressure"}.`
      : "Signal path notes and room conditions are clean enough to protect the room."
    : strainedVerification
      ? "You chose the right process, but the notes stayed thin enough that a return trip can still happen."
      : immediateIncidents.length
      ? `The quick path caused pressure in the room: ${immediateIncidents.map((incident) => incident.detail).join(" ")}`
      : serviceReturnRisk
      ? `Skipping verification saved time, but ${unresolvedConditions.length ? unresolvedConditions.map((condition) => condition.label).join(", ") : "the room pressure"} can still send someone back.`
      : "You skipped full verification, but the known room pressure was handled before closeout.";
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
      reputation: !serviceReturnRisk
        ? { clients: 2, coworkers: 1, management: 0 }
        : checkedSignalPath || strainedVerification
        ? { clients: 1, coworkers: 0, management: 0 }
        : { clients: 0, coworkers: 0, management: 1 },
      source: "One Quick Display Swap",
    });
    state.flags.serviceProgressAwarded = true;
  }
  if (!state.flags.serviceStatsRecorded) {
    if (!serviceReturnRisk) state.stats.carefulFinishes += 1;
    else state.stats.callbacks += 1;
    state.flags.serviceStatsRecorded = true;
  }
  if (serviceReturnRisk) {
    recordReturnTripRisk("conshohockenServiceRoomPressure", {
      source: content.serviceDispatch.title,
      cause: serviceRiskDetail,
      detail: `Unresolved service pressure: ${unresolvedConditions.map((condition) => condition.label).join(", ") || "thin signal-path closeout"}.`,
      affects: getReturnTripRiskAffectedWork("conshohockenServiceRoomPressure"),
    });
  } else if (state.flags.returnTripRisks?.conshohockenServiceRoomPressure) {
    resolveReturnTripRisk("conshohockenServiceRoomPressure", {
      source: content.serviceDispatch.title,
      resolution: "Signal path, install work, and room pressure were controlled before closeout.",
    });
  }
  addLog("Replacement display installed. The quick service call is complete.");
  const closeoutConsequences = [getServiceRoomConditionCloseoutEntry({ checkedSignalPath, strainedVerification })];
  recordJobSiteCloseoutSummary({
    source: content.serviceDispatch.title,
    result: getCompletedCloseoutPathResult("serviceApproach"),
    before,
    consequences: closeoutConsequences,
  });
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
      ${getServiceRoomConditionMarkup({ revealAll: true })}
      <p class="muted">${serviceRiskDetail}</p>
      ${getCloseoutConsequenceMarkup(closeoutConsequences)}
      <blockquote>Client note: "Thank you for fixing the display before the afternoon meeting.${checkedSignalPath ? " The cable notes are helpful." : strainedVerification ? " The room is working, though the notes are light." : ""}"</blockquote>
      ${getReturnPortalCloseoutNoteMarkup()}
    `,
    actions: [getCloseoutReturnAction(content.serviceDispatch.title, "Returned to Radnor Rack & Wire after the Conshohocken service call.", {
      beforeReturn: () => {
        if (serviceReturnRisk) {
          state.flags.serviceCallbackPending = true;
          addLog("A Conshohocken callback note appeared before you made it back to Radnor Rack & Wire.");
        }
      },
    })],
  });
}

function getEndShiftShopInteractions() {
  return [{
    x: 350,
    y: 185,
    label: "Close out shift",
    taskState: () => getTaskState({
      stateId: "ready",
      detail: state.flags.serviceCallbackPending && !state.flags.serviceCallbackResolved
        ? "Close the workday first. Josh's callback note waits for the next morning."
        : "End the current workday before taking another route.",
    }),
    pressure: () => getActionPressureBrief({
      includeLedger: true,
    }),
    action: showEndShiftModal,
  }];
}

function getInteractions() {
  if (state.sceneId === "shop") {
    const warehouseActive = state.flags.warehouseStarted && !state.flags.warehouseComplete;
    if (shouldIntroduceJoshBeforeNextDispatch()) {
      return [{
        x: 690, y: 245, label: "Talk to Josh at the workbench", npc: "JOSH",
        taskState: () => getTaskState({
          stateId: "ready",
          detail: "First stop after the Center City job. Find Josh before closing out or taking another route.",
        }),
        action: showJoshConversation,
      }];
    }
    if (state.flags.endShiftPending) return getEndShiftShopInteractions();
    return [
      {
        x: 330, y: 330, label: "Talk to supervisor", npc: "SUP",
        action: () => {
          if (shouldIntroduceJoshBeforeNextDispatch()) return notifyJoshIntroRequired();
          if (state.flags.endShiftPending) return showEndShiftModal();
          if (state.flags.serviceComplete && hasPendingTraining()) return notify('Supervisor: "You leveled up fast. Mark a training focus on the clipboard before coordination adds anything else."');
          if (state.flags.finished) return notify('Supervisor: "Check the board when you are ready. It will still say quick, because coordination never learns."');
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
      ...(state.flags.finished && !shouldHideJoshUntilNextMorning() ? [{
        x: 690, y: 245, label: state.flags.serviceCallbackPending && !state.flags.serviceCallbackResolved
          ? state.flags.endShiftPending ? "Callback note waiting with Josh" : "Talk to Josh about callback"
          : "Talk to Josh",
        npc: "JOSH",
        action: () => {
          if (state.flags.endShiftPending && state.flags.serviceCallbackPending && !state.flags.serviceCallbackResolved) {
            return showModal({
              kicker: "Callback Note",
              title: "Josh Has It On The Bench",
              body: `
                <p>The Conshohocken callback note is clipped to Josh's bench, but the shift is still open.</p>
                <p class="muted">Close out the workday first. Tomorrow's first shop stop will be Josh before coordination can add another route.</p>
              `,
              actions: [{ label: "Close Out Shift", onClick: showEndShiftModal }],
            });
          }
          return showJoshConversation();
        },
      }] : []),
      {
        x: 150, y: 270, label: "Read dispatch board",
        action: () => shouldIntroduceJoshBeforeNextDispatch()
          ? notifyJoshIntroRequired()
          : state.flags.endShiftPending
          ? showEndShiftModal()
          : state.flags.finished
          ? showDispatchPreview()
          : notify("Dispatch board: TWO QUICK CARTS. Estimated labor: unclear."),
      },
      {
        x: 590, y: 180, label: warehouseActive ? "Search staging shelf" : "Pick up staged equipment",
        pressure: () => warehouseActive
          ? getActionPressureBrief({
            check: content.warehouseDispatch.checks.find((item) => item.id === "staging"),
            baseEnergyCost: getWarehouseSearchEnergyCost(),
            includeSkill: true,
            includeLedger: true,
          })
          : getActionPressureBrief({
            baseEnergyCost: getEquipmentEnergyCost(2),
            includeSkill: false,
            includeMovement: true,
          }),
        taskState: () => getShopStagingTaskState(warehouseActive),
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
        pressure: () => warehouseActive
          ? getActionPressureBrief({
            check: content.warehouseDispatch.checks.find((item) => item.id === "returns"),
            baseEnergyCost: getWarehouseSearchEnergyCost(),
            includeSkill: true,
            includeLedger: true,
          })
          : "",
        taskState: () => warehouseActive ? getWarehouseLocationTaskState("returns") : null,
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
        x: 830, y: 380, label: warehouseActive ? "Search Van #3" : getVehicleInteractionLabel(),
        markerText: !warehouseActive && hasCarriedItems() ? "LOAD" : undefined,
        pressure: () => warehouseActive
          ? getActionPressureBrief({
            check: content.warehouseDispatch.checks.find((item) => item.id === "van3"),
            baseEnergyCost: getWarehouseSearchEnergyCost(),
            includeSkill: true,
            includeLedger: true,
          })
          : "",
        taskState: () => warehouseActive
          ? getWarehouseLocationTaskState("van3")
          : getVehicleInteractionTaskState(),
        action: () => {
          if (warehouseActive) return inspectWarehouseLocation("van3");
          if (hasCarriedItems()) return loadCarriedItemsIntoVehicle();
          showVehicleMenu();
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
          addLog("Supervisor confirmed the garage carry was not included in the work-order estimate.");
          showModal({
            kicker: "Supervisor",
            title: "About the Loading Dock",
            body: `<p>"Nobody booked one. We'll carry the boxes from here. It's not that far."</p><p>It is farther than the work order estimated.</p>`,
            actions: [{ label: "Start Unloading", onClick: render }],
          });
        },
      }] : []),
      {
        x: 800, y: 375, label: "Unload next box group",
        pressure: () => getActionPressureBrief({
          baseEnergyCost: getEquipmentEnergyCost(3),
          includeSkill: false,
          includeMovement: true,
        }),
        taskState: getGarageUnloadTaskState,
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
      ...(hasCarriedItems() || !state.flags.centerCityEquipmentDelivered ? [{
        x: 116, y: 185, label: hasCarriedItems() ? "Carry equipment to client entrance" : "Walk to client entrance",
        detail: hasCarriedItems()
          ? `Ready: deliver ${getCarriedLabels().join(" and ")} to the client entrance.`
          : "Locked: The equipment still needs to be carried from the van.",
        pressure: () => getActionPressureBrief({
          baseEnergyCost: hasCarriedItems() ? getEquipmentEnergyCost(4) : null,
          includeSkill: false,
          includeMovement: true,
        }),
        taskState: getGarageEntranceTaskState,
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
              state.flags.centerCityEquipmentDelivered = true;
              return showLobbyTransition();
            }
            return render();
          }
          if (state.flags.centerCityEquipmentDelivered) return usePortal("garageToLobby");
          notify("The equipment still needs to be carried from the van.");
        },
      }] : []),
      ...(!hasCarriedItems() && state.flags.centerCityEquipmentDelivered ? getScenePortalInteractions("garage") : []),
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
      ...getScenePortalInteractions("lobby"),
    ];
  }

  if (state.sceneId === "serviceOffice") {
    if (state.flags.conshohockenFollowupStarted && !state.flags.conshohockenFollowupComplete) {
      return [{
        x: 760, y: 300, label: "Review coupler label follow-up",
        action: showConshohockenFollowupChoice,
      }, ...getScenePortalInteractions("serviceOffice")];
    }
    if (state.flags.serviceComplete) return getScenePortalInteractions("serviceOffice");
    return [
      {
        x: 300, y: 185, label: state.flags.serviceBrief && !state.flags.serviceInspected && !state.flags.serviceClientContext ? "Ask client about symptoms" : "Talk to client contact", npc: "CLIENT",
        taskState: () => {
          if (!state.flags.serviceBrief) return getTaskState({ stateId: "ready", detail: "Ask what happened before touching the room." });
          if (!state.flags.serviceInspected && !state.flags.serviceClientContext) return getTaskState({ stateId: "ready", detail: "Spend a little energy to reveal one room condition before diagnosis." });
          return getTaskState({ completed: true, detail: "Client context is already in your notes." });
        },
        action: () => {
          if (state.flags.serviceBrief) return showServiceClientContext();
          state.flags.serviceBrief = true;
          ensureServiceRoomConditions();
          addLog("Client confirmed the display failed during the morning meeting.");
          showModal({
            kicker: "Client Contact",
            title: "It Worked Yesterday",
            body: `<p>"The display powers on, but it flickers and drops out. Sales said you would swap it before the one o'clock meeting."</p>`,
            actions: [{ label: "Inspect Display", onClick: render }],
          });
        },
      },
      ...(getRecoverableServiceRoomIncidents().length ? [{
        x: 610, y: 385, label: "Recover room incident",
        markerText: "FIX",
        taskState: () => getTaskState({
          stateId: "strained",
          detail: `${getRecoverableServiceRoomIncidents().length} visible room incident${getRecoverableServiceRoomIncidents().length === 1 ? "" : "s"} can still be recovered before closeout.`,
        }),
        pressure: () => getActionPressureBrief({
          baseEnergyCost: 3,
          includeSkill: false,
          includeLedger: true,
        }),
        action: showServiceIncidentRecoveryChoice,
      }] : []),
      ...(getActionableServiceRoomConditions().length ? [{
        x: 520, y: 342, label: "Handle room pressure",
        markerText: "RISK",
        taskState: () => getTaskState({
          stateId: state.flags.serviceImmediatePressure ? "strained" : "ready",
          detail: `${getActionableServiceRoomConditions().length} known room pressure decision${getActionableServiceRoomConditions().length === 1 ? "" : "s"} can change the service outcome now.`,
        }),
        pressure: () => getActionPressureBrief({
          baseEnergyCost: 1,
          includeSkill: false,
          includeLedger: true,
        }),
        action: showServiceRoomConditionChoice,
      }] : []),
      {
        x: 760, y: 305, label: state.flags.serviceInspected ? "Install replacement parts" : "Inspect failed display",
        pressure: () => {
          if (!state.flags.serviceBrief) return "";
          if (!state.flags.serviceInspected) {
            return getActionPressureBrief({
              baseEnergyCost: getServiceDiagnosisEnergyCost(3),
              includeSkill: true,
              includeLedger: true,
            });
          }
          if (!hasCarriedItems()) return "";
          const check = getServiceAdjustedCheck(getServiceInstallCheck(state.carry));
          return getActionPressureBrief({
            check,
            baseEnergyCost: getAssemblyEnergyCost(check.energyCost),
            includeSkill: true,
            includeMovement: true,
            includeLedger: true,
          });
        },
        taskState: getServiceSwapTaskState,
        action: () => {
          if (!state.flags.serviceBrief) return notify("Check in with the client contact first.");
          if (!state.flags.serviceInspected) {
            state.flags.serviceInspected = true;
            ensureServiceRoomConditions();
            revealNextServiceRoomCondition("Diagnosis");
            const diagnosisCost = getServiceDiagnosisEnergyCost(3);
            changeEnergy(-diagnosisCost);
            addLog("Confirmed the display needs replacement. The room pressure is now partly visible.");
            render();
            return showModal({
              kicker: "Diagnosis",
              title: "The Quick Fix Is a Display Swap",
              body: `
                <p>The display itself is failing. The replacement screen and hardware tote are onsite.</p>
                <p>The room now has a rolled service profile: some pressure is known, and some may still be hidden unless your prep exposed it.</p>
                ${getCharacterLine("serviceInspect") ? `<p class="muted">${getCharacterLine("serviceInspect")}</p>` : ""}
                ${state.flags.servicePreparation === "review" ? `<p class="muted">Reviewing the forwarded email chain saved time during diagnosis.</p>` : ""}
                ${getServiceRoomConditionMarkup()}
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
        pressure: () => getActionPressureBrief({
          baseEnergyCost: getEquipmentEnergyCost(3),
          includeSkill: false,
          includeMovement: true,
        }),
        taskState: getServicePickupTaskState,
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
      ...getScenePortalInteractions("serviceOffice"),
    ];
  }

  if (state.sceneId === "universitySurvey") {
    const surveyComplete = Boolean(state.flags.surveyComplete);
    const allChecked = isSurveyInspectionComplete();
    return [
      {
        x: 310, y: 185, label: surveyComplete ? "Review filed survey" : allChecked ? "File survey report" : "Talk to facilities contact", npc: "CLIENT",
        taskState: () => {
          if (surveyComplete) {
            return getTaskState({
              completed: true,
              detail: `${getSurveyReportLabel()} filed. Use the site exit to return to Radnor Rack & Wire.`,
            });
          }
          if (allChecked) return getTaskState({ stateId: "ready", detail: "File the survey report before returning to the shop." });
          if (state.flags.surveyBrief) {
            return getTaskState({
              stateId: "inProgress",
              detail: `Inspect the campus access path (${state.surveyInspections.length}/${content.surveyDispatch.inspections.length}).`,
            });
          }
          return getTaskState({ stateId: "ready", detail: "Check in with the facilities contact." });
        },
        action: () => {
          if (surveyComplete) return showSurveyCompleteReview();
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
      ...(!surveyComplete ? [{
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
      }] : []),
      ...getScenePortalInteractions("universitySurvey"),
    ];
  }

  if (state.sceneId === "burlingtonRetrofitWalkdown") {
    if (state.flags.retrofitInstallStarted && !state.flags.retrofitInstallComplete) {
      const allInstalled = state.retrofitInstallChecks.length === getRetrofitInstallChecks().length;
      return [
        {
          x: 300, y: 185, label: allInstalled ? "Close out retrofit install" : "Review walkdown package onsite", npc: "CLIENT",
          action: () => {
            if (allInstalled) return showRetrofitInstallChoice();
            if (state.flags.retrofitInstallBrief) return notify('Facilities contact: "I remember the walkdown. I was hoping the ceiling would improve before you came back, but it did not."');
            state.flags.retrofitInstallBrief = true;
            addLog("Reviewed the walkdown package onsite before starting the retrofit install.");
            showModal({
              kicker: "Facilities Contact",
              title: "Same Ceiling, Better Notes",
              body: `
                <p>"The display wall is ready. The ceiling access is exactly as charming as last time. Please tell me your notes say where the pathway actually goes."</p>
                <p class="muted">${escapeHtml(getRetrofitInstallPreview()?.branch?.stateHint || "The install is inheriting the walkdown result.")}</p>
              `,
              actions: [{ label: "Start Retrofit Install", onClick: render }],
            });
          },
        },
        {
          x: 690, y: 385, label: "Install display pathway",
          taskState: () => getDispatchFieldCheckTaskState({
            checks: getRetrofitInstallChecks(),
            checkId: "pathway-install",
            completedChecks: state.retrofitInstallChecks,
            requiredFlag: "retrofitInstallBrief",
            lockedReason: "Review the walkdown package onsite first.",
            readyDetail: "Install the display pathway using the inherited walkdown result.",
          }),
          action: () => {
            if (!state.flags.retrofitInstallBrief) return notify("Review the walkdown package onsite first.");
            inspectRetrofitInstallCondition("pathway-install");
          },
        },
        ...getScenePortalInteractions("burlingtonRetrofitWalkdown"),
      ];
    }
    if (state.flags.retrofitWalkdownComplete) return getScenePortalInteractions("burlingtonRetrofitWalkdown");
    const allChecked = state.retrofitWalkdownChecks.length === content.retrofitWalkdownDispatch.checks.length;
    return [
      {
        x: 300, y: 185, label: allChecked ? "Close out retrofit walkdown" : "Talk to facilities contact", npc: "CLIENT",
        action: () => {
          if (allChecked) return showRetrofitWalkdownChoice();
          if (state.flags.retrofitWalkdownBrief) return notify('Facilities contact: "The old projector path is above that ceiling. The new display wall is not, which is why I asked if anybody checked."');
          state.flags.retrofitWalkdownBrief = true;
          addLog("Facilities confirmed the old pathway and new display wall are not as close as the drawing suggests.");
          showModal({
            kicker: "Facilities Contact",
            title: "The Drawing Has A Very Short Memory",
            body: `
              <p>"The quote says existing pathway. The old projector had conduit, yes. The new display wall is across the room, and the ceiling above it got interesting after the renovation."</p>
              <p class="muted">Check ceiling access, existing pathway, and the above-ceiling conflict before choosing the walkdown closeout.</p>
            `,
            actions: [{ label: "Start Walkdown", onClick: render }],
          });
        },
      },
      {
        x: 790, y: 220, label: "Check ceiling access",
        taskState: () => getDispatchFieldCheckTaskState({
          checks: content.retrofitWalkdownDispatch.checks,
          checkId: "ceiling-access",
          completedChecks: state.retrofitWalkdownChecks,
          requiredFlag: "retrofitWalkdownBrief",
          lockedReason: "Check in with the facilities contact first.",
          readyDetail: "Inspect ceiling access before closeout.",
        }),
        action: () => {
          if (!state.flags.retrofitWalkdownBrief) return notify("Check in with the facilities contact first.");
          inspectRetrofitWalkdownCondition("ceiling-access");
        },
      },
      {
        x: 480, y: 275, label: "Trace existing pathway",
        taskState: () => getDispatchFieldCheckTaskState({
          checks: content.retrofitWalkdownDispatch.checks,
          checkId: "pathway",
          completedChecks: state.retrofitWalkdownChecks,
          requiredFlag: "retrofitWalkdownBrief",
          lockedReason: "Check in with the facilities contact first.",
          readyDetail: "Trace the existing pathway against the quoted route.",
        }),
        action: () => {
          if (!state.flags.retrofitWalkdownBrief) return notify("Check in with the facilities contact first.");
          inspectRetrofitWalkdownCondition("pathway");
        },
      },
      {
        x: 745, y: 385, label: "Document above-ceiling conflict",
        taskState: () => getDispatchFieldCheckTaskState({
          checks: content.retrofitWalkdownDispatch.checks,
          checkId: "trade-conflict",
          completedChecks: state.retrofitWalkdownChecks,
          requiredFlag: "retrofitWalkdownBrief",
          lockedReason: "Check in with the facilities contact first.",
          readyDetail: "Document the above-ceiling conflict before closeout.",
        }),
        action: () => {
          if (!state.flags.retrofitWalkdownBrief) return notify("Check in with the facilities contact first.");
          inspectRetrofitWalkdownCondition("trade-conflict");
        },
      },
      ...getScenePortalInteractions("burlingtonRetrofitWalkdown"),
    ];
  }

  if (state.sceneId === "southPhillyCommissioning") {
    if (state.flags.commissioningComplete) return getScenePortalInteractions("southPhillyCommissioning");
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
        taskState: getCommissioningTerminationTaskState,
        action: () => {
          if (!state.flags.commissioningBrief) return notify("Check in with the client contact first.");
          if (terminationChecked && !state.flags.commissioningTerminationAction) return showCommissioningTerminationChoice();
          if (state.flags.commissioningTerminationAction) return showCommissioningTerminationTaskReview();
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
      ...getScenePortalInteractions("southPhillyCommissioning"),
    ];
  }

  if (state.sceneId === "warrantyReturn") {
    if (state.flags.callbackCleanupComplete) return getScenePortalInteractions("warrantyReturn");
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
      ...getScenePortalInteractions("warrantyReturn"),
    ];
  }

  if (state.sceneId === "executiveHandoff") {
    if (state.flags.handoffComplete) return getScenePortalInteractions("executiveHandoff");
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
      ...getScenePortalInteractions("executiveHandoff"),
    ];
  }

  if (state.sceneId === "systemsService") {
    if (state.flags.systemsComplete) return getScenePortalInteractions("systemsService");
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
        taskState: () => getDispatchFieldCheckTaskState({
          checks: content.systemsDispatch.checks,
          checkId: "panel-status",
          completedChecks: state.systemsChecks,
          requiredFlag: "systemsBrief",
          lockedReason: "Check in with the client contact first.",
          readyDetail: "Check the touch panel status.",
        }),
        action: () => {
          if (!state.flags.systemsBrief) return notify("Check in with the client contact first.");
          inspectSystemsCondition("panel-status");
        },
      },
      {
        x: 760, y: 180, label: "Verify device network path",
        taskState: () => getDispatchFieldCheckTaskState({
          checks: content.systemsDispatch.checks,
          checkId: "network-path",
          completedChecks: state.systemsChecks,
          requiredFlag: "systemsBrief",
          lockedReason: "Check in with the client contact first.",
          readyDetail: "Verify the device network path.",
        }),
        action: () => {
          if (!state.flags.systemsBrief) return notify("Check in with the client contact first.");
          inspectSystemsCondition("network-path");
        },
      },
      {
        x: 760, y: 380, label: "Compare rack note",
        taskState: () => getDispatchFieldCheckTaskState({
          checks: content.systemsDispatch.checks,
          checkId: "rack-note",
          completedChecks: state.systemsChecks,
          requiredFlag: "systemsBrief",
          lockedReason: "Check in with the client contact first.",
          readyDetail: "Compare the rack note against the room behavior.",
        }),
        action: () => {
          if (!state.flags.systemsBrief) return notify("Check in with the client contact first.");
          inspectSystemsCondition("rack-note");
        },
      },
      ...getScenePortalInteractions("systemsService"),
    ];
  }

  if (state.sceneId === "navyYardAccess") {
    const accessChecked = state.secureAccessChecks.length === content.secureAccessDispatch.checks.length;
    const roomReached = Boolean(state.flags.secureAccessRoomReached);
    const taskDone = state.secureAccessTaskChecks.length === content.secureAccessDispatch.taskChecks.length;
    if (state.flags.secureAccessComplete) return getScenePortalInteractions("navyYardAccess");
    return [
      {
        x: 300, y: 185, label: taskDone ? "Close out Navy Yard job" : accessChecked ? "Meet escort at telecom room" : "Check in with security", npc: "SEC",
        action: () => {
          if (taskDone) return showSecureAccessChoice();
          if (accessChecked) return showSecureAccessWorkStart();
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
        x: 430, y: 255, label: roomReached ? "Review access notes" : "Check building number",
        taskState: () => accessChecked
          ? getTaskState({ completed: true, detail: "The building mismatch is already in your access notes." })
          : getDispatchFieldCheckTaskState({
            checks: content.secureAccessDispatch.checks,
            checkId: "building",
            completedChecks: state.secureAccessChecks,
            requiredFlag: "secureAccessBrief",
            lockedReason: "Check in with security first.",
            readyDetail: "Confirm the building-number mismatch.",
          }),
        action: () => {
          if (accessChecked) return notify("The building mismatch is already in your access notes.");
          if (!state.flags.secureAccessBrief) return notify("Check in with security first.");
          inspectSecureAccessCondition("building");
        },
      },
      {
        x: 785, y: 205, label: roomReached ? "Patch encoder feed" : "Check loading dock",
        taskState: () => accessChecked
          ? roomReached
            ? getDispatchFieldCheckTaskState({
              checks: content.secureAccessDispatch.taskChecks,
              checkId: "patch-update",
              completedChecks: state.secureAccessTaskChecks,
              requiredFlag: "secureAccessRoomReached",
              lockedReason: "Meet the escort and enter the telecom room first.",
              readyDetail: "Patch the encoder feed.",
            })
            : getTaskState({ completed: true, detail: "The loading dock issue is already in your access notes." })
          : getDispatchFieldCheckTaskState({
            checks: content.secureAccessDispatch.checks,
            checkId: "gate",
            completedChecks: state.secureAccessChecks,
            requiredFlag: "secureAccessBrief",
            lockedReason: "Check in with security first.",
            readyDetail: "Check how the loading dock affects access.",
          }),
        action: () => {
          if (accessChecked) return roomReached ? inspectSecureAccessTask("patch-update") : notify("The loading dock issue is already in your access notes.");
          if (!state.flags.secureAccessBrief) return notify("Check in with security first.");
          inspectSecureAccessCondition("gate");
        },
      },
      {
        x: 745, y: 385, label: roomReached ? "Verify room signal" : "Check telecom room escort",
        taskState: () => accessChecked
          ? roomReached
            ? getDispatchFieldCheckTaskState({
              checks: content.secureAccessDispatch.taskChecks,
              checkId: "verify-signal",
              completedChecks: state.secureAccessTaskChecks,
              requiredFlag: "secureAccessRoomReached",
              lockedReason: "Meet the escort and enter the telecom room first.",
              readyDetail: "Verify the room signal after the patch.",
            })
            : getTaskState({ stateId: "ready", detail: "Meet the escort and enter the telecom room." })
          : getDispatchFieldCheckTaskState({
            checks: content.secureAccessDispatch.checks,
            checkId: "escort",
            completedChecks: state.secureAccessChecks,
            requiredFlag: "secureAccessBrief",
            lockedReason: "Check in with security first.",
            readyDetail: "Confirm how the escort requirement affects the rack update.",
          }),
        action: () => {
          if (accessChecked) return roomReached ? inspectSecureAccessTask("verify-signal") : showSecureAccessWorkStart();
          if (!state.flags.secureAccessBrief) return notify("Check in with security first.");
          inspectSecureAccessCondition("escort");
        },
      },
      ...(roomReached && !taskDone ? [{
        x: 635, y: 350, label: "Find correct rack unit",
        taskState: () => getDispatchFieldCheckTaskState({
          checks: content.secureAccessDispatch.taskChecks,
          checkId: "rack-location",
          completedChecks: state.secureAccessTaskChecks,
          requiredFlag: "secureAccessRoomReached",
          lockedReason: "Meet the escort and enter the telecom room first.",
          readyDetail: "Find the correct rack unit before patching around it.",
        }),
        action: () => inspectSecureAccessTask("rack-location"),
      }] : []),
      ...getScenePortalInteractions("navyYardAccess"),
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
      taskState: getCartPickupTaskState,
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
    {
      x: 530, y: 220, label: "Install component on Cart 1",
      pressure: () => {
        const part = content.tutorial.assembly.find((item) => item.id === state.carry[0]);
        return getActionPressureBrief({
          check: part,
          baseEnergyCost: part ? getAssemblyEnergyCost(part.energyCost) : null,
          includeSkill: true,
          includeMovement: hasCarriedItems(),
          includeLedger: true,
        });
      },
      taskState: () => getCartInstallTaskState("cart1"),
      action: () => installCartPart("cart1"),
    },
    {
      x: 755, y: 390, label: "Install component on Cart 2",
      pressure: () => {
        const part = content.tutorial.assembly.find((item) => item.id === state.carry[0]);
        return getActionPressureBrief({
          check: part,
          baseEnergyCost: part ? getAssemblyEnergyCost(part.energyCost) : null,
          includeSkill: true,
          includeMovement: hasCarriedItems(),
          includeLedger: true,
        });
      },
      taskState: () => getCartInstallTaskState("cart2"),
      action: () => installCartPart("cart2"),
    },
    ...getScenePortalInteractions("client"),
  ];
}

function chooseServiceApproach(approach) {
  ensureServiceRoomConditions();
  state.flags.serviceApproach = approach;
  if (approach === "verify") {
    const check = getServiceAdjustedCheck(getServiceCheckById("signal-path"));
    const { skillCheck, energyCost } = resolveFieldTaskCheck({
      check,
      checkId: check.id,
      completedChecks: getServiceFieldCheckHistory(),
      flagKey: "service-signal-path",
      contextBonus: (state.flags.servicePreparation === "review" ? 1 : 0) + (state.flags.servicePreparation === "josh" ? 1 : 0) + (state.flags.servicePreparation === "contact" ? 1 : 0) + getServiceConditionContextBonus(check),
      baseEnergyCost: getServiceVerificationEnergyCost(check.energyCost),
      failedEnergyPenalty: 2,
      strainedFlag: "serviceVerificationStrained",
      logText: `${check.label}: ${check.log}.`,
      strainedLogText: "Signal-path verification strained; the coupler note may still leave return-trip risk.",
    });
    revealServiceConditionsForCheck(check);
    render();
    return showModal({
      kicker: "Signal Path",
      title: check.label,
      body: `
        <p>${check.detail}</p>
        ${getFieldTaskResultMarkup({ check, skillCheck, energyCost })}
        ${getServiceRoomConditionMarkup()}
        <p class="muted">The replacement display and hardware still need to be installed before closeout.</p>
      `,
      actions: [{ label: "Start Display Swap", onClick: render }],
    });
  } else {
    addLog("Trusted the service ticket and started the display swap immediately.");
  }
  render();
}

function installServicePart() {
  if (!hasCarriedItems()) return notify("Pick up replacement gear from the boxes.");
  ensureServiceRoomConditions();
  const items = [...state.carry];
  const check = getServiceAdjustedCheck(getServiceInstallCheck(items));
  const { skillCheck, energyCost } = resolveFieldTaskCheck({
    check,
    checkId: check.id,
    completedChecks: getServiceFieldCheckHistory(),
    flagKey: `service-install-${items.join("-")}`,
    contextBonus: getServiceConditionContextBonus(check),
    baseEnergyCost: getAssemblyEnergyCost(check.energyCost),
    failedEnergyPenalty: 2,
    strainedFlag: "serviceInstallStrained",
    logText: `${getServiceItemLabels(items).join(" and ")} installed ${ownsTool("drill") ? "with your drill" : "with your screwdriver"}.`,
    strainedLogText: "Service install check strained; the closeout should not hide the flaky replacement path.",
  });
  revealServiceConditionsForCheck(check);
  state.serviceDelivered.push(...items);
  state.serviceInstalled.push(...items);
  state.carry = [];
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
  showModal({
    kicker: "Replacement Install",
    title: check.label,
    body: `
      <p>${check.detail}</p>
      ${getFieldTaskResultMarkup({ check, skillCheck, energyCost })}
      ${getServiceRoomConditionMarkup()}
    `,
    actions: [{ label: "Keep Working", onClick: render }],
  });
}

function getServiceItemLabels(itemIds) {
  return itemIds.map((itemId) => content.serviceDispatch.swapItems.find((item) => item.id === itemId)?.label || itemId);
}

function installCartPart(destination) {
  if (!hasCarriedItems()) return notify("Pick up the next cart component from the delivered boxes.");
  const part = content.tutorial.assembly.find((item) => item.id === state.carry[0]);
  if (!part || part.destination !== destination) return notify(`${part?.label || "That component"} belongs on the other cart.`);
  const { skillCheck, energyCost } = resolveFieldTaskCheck({
    check: part,
    checkId: part.id,
    completedChecks: state.assembled,
    flagKey: `cart-${part.id}`,
    baseEnergyCost: getAssemblyEnergyCost(part.energyCost),
    failedEnergyPenalty: 1,
    strainedFlag: "cartAssemblyStrained",
    logText: `${part.label} installed ${ownsTool("drill") ? "with your drill" : "with your screwdriver"}.`,
    strainedLogText: "Cart assembly check strained; the first install day is teaching through resistance.",
  });
  state.carry = [];
  const cart1Done = state.assembled.filter((id) => id.startsWith("cart-1")).length === 2;
  const cart2Done = state.assembled.filter((id) => id.startsWith("cart-2")).length === 2;
  if (cart1Done && !state.flags.supervisorLeft) return showSupervisorDeparture();
  if (cart2Done && !state.flags.finished) return showFinishChoice();
  render();
  showModal({
    kicker: "Cart Assembly",
    title: part.label,
    body: `
      <p>${part.detail}</p>
      ${getFieldTaskResultMarkup({ check: part, skillCheck, energyCost })}
    `,
    actions: [{ label: "Keep Building", onClick: render }],
  });
}

function notify(message) {
  addLog(message);
  render();
}

function getWorkdayLoopStage(objective = "") {
  if (!state.sceneId) return "Workday";
  if (state.sceneId === "shop") {
    if (state.flags.endShiftPending) return "Return / End Shift";
    if (!state.flags.finished) {
      if (!state.flags.shopBrief) return "Shop";
      if (state.loaded.length < content.tutorial.shopLoad.length) return "Shop / Van Prep";
      return "Van / Route";
    }
    if (state.flags.serviceComplete && hasPendingTraining()) return "Shop / Career Growth";
    if (shouldIntroduceJoshBeforeNextDispatch()) return "Shop / Coworker Check-in";
    if (state.flags.retrofitInstallComplete && !state.flags.retrofitInstallDebriefed) return "Shop / Debrief";
    if (state.flags.retrofitInstallComplete && !state.flags.prototypeSummaryViewed) return "Shop / Career Snapshot";
    return "Shop / Dispatch Board";
  }
  if (["garage", "lobby"].includes(state.sceneId)) return "Route / Building Entry";
  if (/return to radnor|use .*exit/i.test(objective)) return "Closeout / Return";
  if (/close out|choose|review the result|file the survey|handoff style/i.test(objective)) return "Job Site / Closeout";
  return "Job Site / Field Tasks";
}

function getWorkdayLoopInterfaceHint(objective = "") {
  if (/dispatch board/i.test(objective)) return "Open the dispatch board or review the route from the van.";
  if (/van|load staged equipment|center city east/i.test(objective)) return "Use Van #3 for cargo, map, and route choices.";
  if (/exit|return to radnor/i.test(objective)) return "Use the marked exit or RETURN point.";
  if (/career clipboard|field-training focus|training focus|career snapshot/i.test(objective)) return "Open the career clipboard or dispatch board.";
  if (/josh|supervisor|client|facilities|security|escort/i.test(objective)) return "Talk to the nearby contact.";
  return "Use the nearest highlighted interaction.";
}

function getWorkdayLoopGuidance(objective = resolveCurrentObjective().text) {
  return {
    stage: getWorkdayLoopStage(objective),
    objective,
    interfaceHint: getWorkdayLoopInterfaceHint(objective),
  };
}

function getWorkdayLoopPath(stage) {
  const steps = [
    "Shop",
    "Van / Dispatch Board",
    "Regional Map / Route",
    "Travel Choice",
    "Job Site",
    "Field Tasks",
    "Closeout",
    "Return / End Shift",
    "Next Job",
  ];
  const stageMap = [
    [/shop/i, "Shop"],
    [/van|dispatch/i, "Van / Dispatch Board"],
    [/map|route/i, "Regional Map / Route"],
    [/travel/i, "Travel Choice"],
    [/job site/i, "Job Site"],
    [/field/i, "Field Tasks"],
    [/closeout/i, "Closeout"],
    [/return|end shift/i, "Return / End Shift"],
  ];
  const current = stageMap.find(([pattern]) => pattern.test(stage))?.[1] || "";
  return steps.map((step) => step === current ? `[${step}]` : step).join(" -> ");
}

function getCurrentLoopRoute() {
  const currentRoute = getWorldRoute(getCurrentDispatchRouteId());
  if (currentRoute) return currentRoute;
  const tutorialRoute = getWorldRoute("centerCityTutorial");
  if (tutorialRoute && (!state.flags.finished || isTutorialRouteReady())) return tutorialRoute;
  return getInProgressDispatchBoardEntry()?.route || getCurrentDispatchBoardEntry()?.route || null;
}

function getCurrentObjectiveContext() {
  const area = getCurrentWorldArea();
  const route = getCurrentLoopRoute();
  const returnPortal = getCurrentReturnPortal();
  const visiblePortals = getCurrentAreaPortals();
  const lockedPortals = visiblePortals.filter((portal) => !isPortalReady(portal));
  const readyPortals = visiblePortals.filter(isPortalReady);
  const firstLockedPortal = lockedPortals[0];
  return {
    sceneId: state.sceneId,
    areaId: area?.id || "",
    areaLabel: area?.label || content.scenes[state.sceneId]?.name || "Current area",
    activeRouteId: route?.id || "",
    activeRouteStatus: route ? getRouteStatus(route) : "",
    carriedItems: getCarriedLabels(),
    loadedCargo: getLoadedVehicleLabels(),
    vehicleId: getCurrentVehicleId(),
    returnPortalLabel: returnPortal?.label || "",
    returnPortalReady: Boolean(returnPortal && isPortalReady(returnPortal)),
    visiblePortalCount: visiblePortals.length,
    lockedPortalCount: lockedPortals.length,
    readyPortalCount: readyPortals.length,
    firstLockedPortalLabel: firstLockedPortal?.label || "",
    firstLockedPortalMessage: firstLockedPortal ? getPortalRequirementText(firstLockedPortal) : "",
    openCallbacks: getUnresolvedCallbackCount(),
    openReturnTripRisks: getReturnTripRiskEntries().length,
    retrofitBranch: state.flags.retrofitInstallBranch || getRetrofitInstallBranchIdFromFlags(state.flags),
  };
}

function resolveCurrentObjective() {
  const context = getCurrentObjectiveContext();
  const baseObjective = getObjective();
  if (context.returnPortalReady && /return to Radnor Rack & Wire/i.test(baseObjective)) {
    return {
      text: `Use the RETURN marker to leave ${context.areaLabel}.`,
      context,
    };
  }
  if (context.lockedPortalCount && /door|entrance|elevator|exit|lobby|client floor|return/i.test(baseObjective)) {
    return {
      text: `${context.firstLockedPortalMessage} (${context.firstLockedPortalLabel})`,
      context,
    };
  }
  return { text: baseObjective, context };
}

function getCurrentRouteBriefText() {
  if (state.flags.endShiftPending) return "Travel is paused until the shift closeout is complete.";
  const route = getCurrentLoopRoute();
  if (route) {
    const job = getRouteJobData(route.id);
    const lockReason = getRouteLockReason(route);
    return [
      `${route.fromLabel} -> ${route.toLabel}`,
      `${job.title}`,
      lockReason ? `Locked: ${lockReason}` : getRouteStatus(route),
      lockReason ? "" : `What happens next: ${getRouteLaunchPreviewText(route)}`,
      `Driven before: ${getRouteDrivenText(route)}`,
      `Fast travel: ${getRouteFastTravelText(route)}`,
    ].filter(Boolean).join(". ");
  }
  const boardEntry = getCurrentDispatchBoardEntry() || getBlockedDispatchBoardEntry();
  if (boardEntry) {
    return boardEntry.route
      ? `${boardEntry.routeLabel}. ${boardEntry.boardStatus}: ${boardEntry.title}.`
      : `${boardEntry.title}: ${boardEntry.boardStatus}. No drive route; resolve this from the dispatch board or shop.`;
  }
  if (state.sceneId !== "shop") {
    const area = getCurrentWorldArea();
    return `On site at ${area?.label || content.scenes[state.sceneId]?.name || "the current area"}. Finish the local work here, then use the marked return when it is ready.`;
  }
  return "No active route is launchable right now. Use the dispatch board or van map when the next route unlocks.";
}

function getCurrentConsequenceBriefText() {
  const openEntries = getConsequenceLedgerEntries();
  if (openEntries.length) {
    const callbackCount = openEntries.some((entry) => entry.id === "callback-debt") ? getUnresolvedCallbackCount() : 0;
    const riskCount = openEntries.filter((entry) => entry.id !== "callback-debt").length;
    const countText = [
      callbackCount ? `${callbackCount} callback${callbackCount === 1 ? "" : "s"}` : "",
      riskCount ? `${riskCount} return-trip risk${riskCount === 1 ? "" : "s"}` : "",
    ].filter(Boolean).join(", ");
    const first = openEntries[0];
    return `Open: ${countText}. Cause: ${first.cause} Future effect: ${first.affects}.`;
  }
  const resolvedEntries = getConsequenceLedgerEntries({ includeResolved: true })
    .filter((entry) => entry.status !== "open");
  const lastResolved = resolvedEntries[resolvedEntries.length - 1];
  if (lastResolved) return `No open callback debt. Last saved consequence: ${getConsequenceStatusLabel(lastResolved.status)} - ${lastResolved.source}. ${lastResolved.detail}`;
  return "No open callback debt or return-trip risk.";
}

function getCurrentStepBrief(objective = resolveCurrentObjective().text) {
  const guidance = getWorkdayLoopGuidance(objective);
  return {
    ...guidance,
    loopPath: getWorkdayLoopPath(guidance.stage),
    route: getCurrentRouteBriefText(),
    consequences: getCurrentConsequenceBriefText(),
    conditionPressure: getConditionPressureSummary(),
  };
}

function getCurrentStepRows({ includeLoopPath = true } = {}) {
  const brief = getCurrentStepBrief();
  const transitionBrief = getCurrentAreaTransitionBriefText();
  return [
    { label: "Now", detail: brief.stage },
    includeLoopPath ? { label: "Day plan", detail: brief.loopPath } : null,
    { label: "Next", detail: brief.objective },
    { label: "Nearby cue", detail: brief.interfaceHint },
    transitionBrief ? { label: "Area transitions", detail: transitionBrief } : null,
    { label: "Route", detail: brief.route },
    { label: "Consequences", detail: brief.consequences },
    brief.conditionPressure ? { label: "Condition pressure", detail: brief.conditionPressure } : null,
  ].filter(Boolean);
}

function getCurrentStepListMarkup({ className = "modal-list", includeLoopPath = true } = {}) {
  return `
    <ul class="${className}">
      ${getCurrentStepRows({ includeLoopPath }).map((row) => `<li><strong>${escapeHtml(row.label)}</strong><span>${escapeHtml(row.detail)}</span></li>`).join("")}
    </ul>
  `;
}

function getCurrentStepPanelMarkup() {
  return getCurrentStepListMarkup({ className: "current-step-list", includeLoopPath: false });
}

function getWorkdayLoopGuidanceText() {
  return getCurrentStepRows({ includeLoopPath: false })
    .map((row) => `${row.label}: ${row.detail}`)
    .join(" ");
}

function getWorkdayLoopGuidanceMarkup() {
  return getCurrentStepListMarkup();
}

function getObjective() {
  if (state.sceneId === "shop") {
    if (shouldIntroduceJoshBeforeNextDispatch()) return "Check in with Josh at the workbench before taking the next route.";
    if (state.flags.endShiftPending) {
      if (state.flags.serviceCallbackPending && !state.flags.serviceCallbackResolved) {
        return "Close out the shift; Josh has the Conshohocken callback note waiting.";
      }
      return "Close out the shift before taking another job.";
    }
    if (state.flags.serviceCallbackPending && !state.flags.serviceCallbackResolved) return "Talk to Josh about the Conshohocken callback.";
    if (state.flags.serviceComplete && !state.flags.joshServiceDebriefed) return "Check in with Josh at the workbench.";
    if (state.flags.serviceComplete && hasPendingTraining()) return "Choose a field-training focus from the career clipboard.";
    if (state.flags.warehouseStarted && !state.flags.warehouseComplete) {
      if (state.warehouseChecks.length === content.warehouseDispatch.checks.length) return "Review the found power supply.";
      return `Search the shop for the replacement power supply (${state.warehouseChecks.length}/${content.warehouseDispatch.checks.length}).`;
    }
    if (state.flags.retrofitInstallComplete && !state.flags.retrofitInstallDebriefed) return "Check in with Josh about the Burlington retrofit install.";
    const boardObjective = getCurrentDispatchBoardObjective();
    if (boardObjective) return boardObjective;
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
    if (state.flags.conshohockenFollowupComplete) return "Use the room exit to return to Radnor Rack & Wire.";
    if (state.flags.serviceComplete) return "Use the room exit to return to Radnor Rack & Wire.";
    if (state.flags.conshohockenFollowupStarted) return "Review the coupler label follow-up.";
    if (!state.flags.serviceBrief) return "Check in with the client contact.";
    if (!state.flags.serviceInspected) return "Inspect the failed display.";
    if (getRecoverableServiceRoomIncidents().length) return "Recover the visible room incident or carry it into closeout.";
    if (getActionableServiceRoomConditions().length) return "Decide how to handle the known room pressure or continue the display swap.";
    return `Install replacement gear (${state.serviceInstalled.length}/${content.serviceDispatch.swapItems.length}).`;
  }
  if (state.sceneId === "universitySurvey") {
    if (state.flags.surveyComplete) return "Use the site exit to return to Radnor Rack & Wire.";
    if (!state.flags.surveyBrief) return "Check in with the facilities contact.";
    if (state.surveyInspections.length < content.surveyDispatch.inspections.length) {
      return `Inspect the campus access path (${state.surveyInspections.length}/${content.surveyDispatch.inspections.length}).`;
    }
    return "Return to the facilities contact and file the survey report.";
  }
  if (state.sceneId === "southPhillyCommissioning") {
    if (state.flags.commissioningComplete) return "Use the room exit to return to Radnor Rack & Wire.";
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
    if (state.flags.callbackCleanupComplete) return "Use the room exit to return to Radnor Rack & Wire.";
    if (!state.flags.callbackCleanupBrief) return "Check in with the client contact.";
    if (state.callbackCleanupChecks.length < content.callbackCleanupDispatch.checks.length) {
      return `Troubleshoot the warranty return (${state.callbackCleanupChecks.length}/${content.callbackCleanupDispatch.checks.length}).`;
    }
    return "Return to the client contact and close out the warranty return.";
  }
  if (state.sceneId === "executiveHandoff") {
    if (state.flags.handoffComplete) return "Use the room exit to return to Radnor Rack & Wire.";
    if (!state.flags.handoffBrief) return "Check in with the client contact.";
    if (state.handoffChecks.length < content.handoffDispatch.checks.length) {
      return `Prepare the client handoff (${state.handoffChecks.length}/${content.handoffDispatch.checks.length}).`;
    }
    return "Return to the client contact and choose the handoff style.";
  }
  if (state.sceneId === "systemsService") {
    if (state.flags.systemsComplete) return "Use the room exit to return to Radnor Rack & Wire.";
    if (!state.flags.systemsBrief) return "Check in with the client contact.";
    if (state.systemsChecks.length < content.systemsDispatch.checks.length) {
      return `Troubleshoot the offline room (${state.systemsChecks.length}/${content.systemsDispatch.checks.length}).`;
    }
    return "Return to the client contact and choose the systems closeout.";
  }
  if (state.sceneId === "burlingtonRetrofitWalkdown") {
    if (state.flags.retrofitInstallStarted && !state.flags.retrofitInstallComplete) {
      if (!state.flags.retrofitInstallBrief) return "Review the walkdown package with the facilities contact.";
      if (state.retrofitInstallChecks.length < getRetrofitInstallChecks().length) {
        return `Install the retrofit pathway (${state.retrofitInstallChecks.length}/${getRetrofitInstallChecks().length}).`;
      }
      return "Choose the retrofit install closeout.";
    }
    if (state.flags.retrofitWalkdownComplete) return "Use the site exit to return to Radnor Rack & Wire.";
    if (!state.flags.retrofitWalkdownBrief) return "Check in with the facilities contact.";
    if (state.retrofitWalkdownChecks.length < content.retrofitWalkdownDispatch.checks.length) {
      return `Walk down the retrofit pathway (${state.retrofitWalkdownChecks.length}/${content.retrofitWalkdownDispatch.checks.length}).`;
    }
    return "Return to the facilities contact and choose the walkdown closeout.";
  }
  if (state.sceneId === "navyYardAccess") {
    if (state.flags.secureAccessComplete) return "Use the site exit to return to Radnor Rack & Wire.";
    if (!state.flags.secureAccessBrief) return "Check in with security.";
    if (state.secureAccessChecks.length < content.secureAccessDispatch.checks.length) {
      return `Sort out secure access (${state.secureAccessChecks.length}/${content.secureAccessDispatch.checks.length}).`;
    }
    if (!state.flags.secureAccessRoomReached) return "Meet the escort and enter the telecom room.";
    if (state.secureAccessTaskChecks.length < content.secureAccessDispatch.taskChecks.length) {
      return `Complete the rack update (${state.secureAccessTaskChecks.length}/${content.secureAccessDispatch.taskChecks.length}).`;
    }
    return "Return to security and close out the Navy Yard job.";
  }
  if (!state.flags.roomBrief) return "Ask the supervisor how to start the cart build.";
  if (state.flags.finished) return "Use the room exit to return to Radnor Rack & Wire.";
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

function getInteractionMarkerKind(interaction) {
  if (!interaction) return "task";
  if (interaction.markerKind) return interaction.markerKind;
  if (interaction.portalKind === "returnRoute") return "return";
  if (interaction.portalId) return "door";
  if (interaction.npc) return "contact";
  const label = interaction.label || "";
  if (/van|vehicle/i.test(label)) return "van";
  if (/carry|unload|pick up|install|search|inspect|file|review|close out|browse|read|choose|meet escort|ask what|practice/i.test(label)) return "task";
  if (/return|exit/i.test(label)) return "return";
  if (/door|entrance|elevator|lobby|room/i.test(label)) return "door";
  if (/talk|client|security|facilities|supervisor|josh|escort|contact/i.test(label)) return "contact";
  return "task";
}

function getInteractionMarkerText(interaction) {
  if (interaction?.markerText) return interaction.markerText;
  if (interaction?.npc) return String(interaction.npc).toUpperCase();
  const kind = getInteractionMarkerKind(interaction);
  if (kind === "task") return getTaskInteractionMarkerText(interaction);
  if (kind === "contact") return getContactInteractionMarkerText(interaction);
  const labels = {
    contact: "CONTACT",
    task: "TASK",
    van: "VAN",
    door: "DOOR",
    return: "RETURN",
  };
  return labels[kind] || "TASK";
}

function getContactInteractionMarkerText(interaction) {
  const label = interaction?.label || "";
  const patterns = [
    [/security|booth/i, "SEC"],
    [/facilities/i, "FAC"],
    [/escort/i, "ESCORT"],
    [/supervisor/i, "SUP"],
    [/josh/i, "JOSH"],
    [/client|contact/i, "CLIENT"],
  ];
  return patterns.find(([pattern]) => pattern.test(label))?.[1] || "TALK";
}

function getTaskInteractionMarkerText(interaction) {
  const label = interaction?.label || "";
  const patterns = [
    [/dispatch board/i, "BOARD"],
    [/career clipboard|field-training|training focus/i, "CAREER"],
    [/personal kit/i, "KIT"],
    [/personal tools|supply counter|browse/i, "TOOLS"],
    [/break area/i, "BREAK"],
    [/pick up/i, "PICKUP"],
    [/load carried|load .*van/i, "LOAD"],
    [/unload/i, "UNLOAD"],
    [/carry/i, "CARRY"],
    [/install/i, "INSTALL"],
    [/patch/i, "PATCH"],
    [/verify/i, "VERIFY"],
    [/test/i, "TEST"],
    [/search/i, "SEARCH"],
    [/inspect|check/i, "CHECK"],
    [/trace/i, "TRACE"],
    [/document/i, "DOCS"],
    [/review|compare/i, "REVIEW"],
    [/close out|file .*report/i, "CLOSE"],
    [/choose/i, "CHOOSE"],
    [/ask/i, "ASK"],
    [/practice|user path/i, "PATH"],
    [/find/i, "FIND"],
    [/read/i, "READ"],
  ];
  return patterns.find(([pattern]) => pattern.test(label))?.[1] || "TASK";
}

function getInteractionMarkerDimensions(kind) {
  const dimensions = {
    contact: { width: 76, height: 26 },
    task: { width: 70, height: 26 },
    van: { width: 56, height: 26 },
    door: { width: 58, height: 26 },
    return: { width: 76, height: 26 },
  };
  return dimensions[kind] || dimensions.task;
}

function getMarkerRect(position, dimensions) {
  return {
    left: position.x - (dimensions.width / 2),
    right: position.x + (dimensions.width / 2),
    top: position.y - (dimensions.height / 2),
    bottom: position.y + (dimensions.height / 2),
  };
}

function getDecorRect(item) {
  return {
    left: item.x,
    right: item.x + item.w,
    top: item.y,
    bottom: item.y + item.h,
  };
}

function doRectsOverlap(first, second) {
  return first.right > second.left
    && first.left < second.right
    && first.bottom > second.top
    && first.top < second.bottom;
}

function clampNumber(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function isPointInsideDecor(point, item) {
  return point.x >= item.x
    && point.x <= item.x + item.w
    && point.y >= item.y
    && point.y <= item.y + item.h;
}

function getInteractionMarkerPosition(interaction, kind) {
  const base = { x: interaction.x, y: interaction.y, placement: "center" };
  const scene = content.scenes[state.sceneId];
  const dimensions = getInteractionMarkerDimensions(kind);
  const baseRect = getMarkerRect(base, dimensions);
  const targetDecor = scene?.decor
    ?.filter((item) => item.text && (isPointInsideDecor(base, item) || doRectsOverlap(baseRect, getDecorRect(item))))
    .sort((a, b) => (
      Number(isPointInsideDecor(base, b)) - Number(isPointInsideDecor(base, a))
      || (a.w * a.h) - (b.w * b.h)
    ))[0];
  if (!targetDecor) return base;

  const padding = 8;
  const world = { width: 960, height: 540 };
  const minX = dimensions.width / 2 + padding;
  const maxX = world.width - dimensions.width / 2 - padding;
  const minY = dimensions.height / 2 + padding;
  const maxY = world.height - dimensions.height / 2 - padding;
  const candidates = [
    { x: base.x, y: targetDecor.y - dimensions.height / 2 - padding, edge: "top" },
    { x: base.x, y: targetDecor.y + targetDecor.h + dimensions.height / 2 + padding, edge: "bottom" },
    { x: targetDecor.x - dimensions.width / 2 - padding, y: base.y, edge: "left" },
    { x: targetDecor.x + targetDecor.w + dimensions.width / 2 + padding, y: base.y, edge: "right" },
  ].map((candidate) => ({
    x: clampNumber(candidate.x, minX, maxX),
    y: clampNumber(candidate.y, minY, maxY),
    placement: candidate.edge,
  }));
  const decorRects = (scene.decor || [])
    .filter((item) => item.text)
    .map(getDecorRect);
  return candidates
    .map((candidate) => {
      const rect = getMarkerRect(candidate, dimensions);
      const overlapCount = decorRects.filter((decorRect) => doRectsOverlap(rect, decorRect)).length;
      const distance = Math.hypot(candidate.x - base.x, candidate.y - base.y);
      return { ...candidate, overlapCount, distance };
    })
    .sort((a, b) => a.overlapCount - b.overlapCount || a.distance - b.distance)[0] || base;
}

function getInteractionMarkerClass(interaction) {
  const kind = getInteractionMarkerKind(interaction);
  return [
    "interaction-marker",
    `${kind}-marker`,
    interaction?.npc ? "npc-marker" : "",
    interaction?.portalId ? "portal-marker" : "",
    kind === "return" ? "return-portal-marker" : "",
  ].filter(Boolean).join(" ");
}

function getInteractionPressureText(interaction) {
  if (!interaction) return "";
  if (typeof interaction.pressure === "function") return interaction.pressure();
  if (interaction.pressure) return interaction.pressure;
  const label = interaction.label || "";
  const includeMovement = Boolean(interaction.portalId || /carry|unload|pick up|load|return|exit|entrance/i.test(label));
  const includeSkill = /install|inspect|search|check|file|review|close|patch|verify|document|report|handoff|warranty|diagnos/i.test(label);
  const includeLedger = /close|file|report|document|return|callback|handoff|warranty/i.test(label);
  if (!includeMovement && !includeSkill && !includeLedger) return "";
  return getActionPressureBrief({
    includeMovement,
    includeSkill,
    includeLedger,
  });
}

function getInteractionTaskState(interaction) {
  if (!interaction) return null;
  if (typeof interaction.taskState === "function") return interaction.taskState();
  if (interaction.taskState) return interaction.taskState;
  if (interaction.portalId) {
    const portal = getWorldPortal(interaction.portalId);
    if (!portal) return getTaskState({ lockedReason: "Transition is not mapped." });
    if (!isPortalReady(portal)) {
      return getTaskState({
        lockedReason: portal.requiredMessage || `${portal.label} is not available yet.`,
      });
    }
    return getTaskState({
      stateId: "ready",
      detail: `Destination: ${getPortalDestinationLabel(portal)}.`,
    });
  }
  return null;
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
  const speed = getMovementSpeed();
  moveOnAxis("x", (dx / length) * speed);
  moveOnAxis("y", (dy / length) * speed);
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

function validateCreatorSelections(selections = {}) {
  const creator = getCreatorConfig();
  const validSkillIds = new Set(getSkillDefinitions().map((skill) => skill.id));
  const traitSlots = creator.traitSlots || 2;
  const traitIds = selections.traitIds || [];
  const primarySkillIds = selections.primarySkillIds || [];
  const secondarySkillIds = selections.secondarySkillIds || [];
  const skillIds = [...primarySkillIds, ...secondarySkillIds];
  if (!getCreatorChoice(creator.backgrounds, selections.backgroundId)) return "Pick a valid background.";
  if (!getCreatorChoice(creator.workStyles, selections.workStyleId)) return "Pick a valid work style.";
  if (traitIds.length !== traitSlots) return `Pick ${traitSlots} different traits.`;
  if (traitIds.some((traitId) => !getCreatorChoice(creator.traits, traitId))) return "Pick valid traits.";
  if (primarySkillIds.length !== 2 || secondarySkillIds.length !== 2) return "Pick two primary and two secondary major skills.";
  if (skillIds.some((skillId) => !validSkillIds.has(skillId))) return "Pick valid major skills.";
  if (new Set(skillIds).size !== skillIds.length) return "Pick four different major skills. Primary and secondary skills cannot overlap.";
  if (new Set(traitIds).size !== traitIds.length) return "Pick two different traits.";
  return "";
}

function buildCustomTechnician(selections) {
  const validationError = validateCreatorSelections(selections);
  if (validationError) throw new Error(validationError);
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
    name: sanitizeCreatorName(selections.name),
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

function getTechnicianPreviewSkillValue(technician, skillId) {
  return technician.characterStats?.[skillId]
    || (skillId === "install" ? Math.max(1, technician.stats.craftsmanship || 0)
    : skillId === "troubleshooting" ? Math.max(1, (technician.stats.confidence || 0) + 1)
    : skillId === "documentation" ? Math.max(1, technician.stats.confidence || 0)
    : skillId === "clientCommunication" ? Math.max(1, (technician.stats.confidence || 0) + 1)
    : skillId === "fieldcraft" ? Math.max(1, Math.floor((technician.stats.energy || 100) / 45))
    : 0);
}

function hasPreviewTrait(technician, traitId) {
  return technician.traits?.includes(traitId) || false;
}

function hasAnyPreviewTrait(technician, traitIds) {
  return traitIds.some((traitId) => hasPreviewTrait(technician, traitId));
}

function getTechnicianStartingToolIds(technician) {
  return uniqueValues(["screwdriver", ...(technician.startingTools || [])]);
}

function getTechnicianStartingKitLabel(technician) {
  return getTechnicianStartingToolIds(technician)
    .map((toolId) => content.tools[toolId]?.name || toolId)
    .join(", ");
}

function canPreviewPressureChoice(technician) {
  return (technician.stats.confidence || 0) >= 2
    || hasPreviewTrait(technician, "calmUnderFire")
    || getTechnicianPreviewSkillValue(technician, "clientCommunication") >= 4;
}

function canPreviewMakeThatWorkShortcut(technician) {
  return hasPreviewTrait(technician, "makeThatWork")
    && (technician.characterStats?.improvisation || 0) >= 4;
}

function getTechnicianEarlyReadout(technician) {
  const toolIds = getTechnicianStartingToolIds(technician);
  const startingCash = technician.startingCash || 0;
  const install = getTechnicianPreviewSkillValue(technician, "install");
  const documentation = getTechnicianPreviewSkillValue(technician, "documentation");
  const commercialProcess = getTechnicianPreviewSkillValue(technician, "commercialProcess");
  const clientCommunication = getTechnicianPreviewSkillValue(technician, "clientCommunication");
  const networking = getTechnicianPreviewSkillValue(technician, "networking");
  const controlSystems = getTechnicianPreviewSkillValue(technician, "controlSystems");
  const earlyUnlocks = [];
  const firstJobFeel = [];
  const watchOuts = [];
  const cashDetail = startingCash < 0
    ? ` and ${formatCash(startingCash)} starting cash`
    : startingCash > 0
    ? ` and ${formatCash(startingCash)} extra cash`
    : "";

  if (hasPreviewTrait(technician, "circuitHutPartsBrain") && toolIds.includes("circuitHutOrganizer")) {
    earlyUnlocks.push("parts organizer testing aid once per job");
  }
  if (canPreviewMakeThatWorkShortcut(technician)) earlyUnlocks.push("adapter workaround at first closeout");
  if (canPreviewPressureChoice(technician)) earlyUnlocks.push("calmer pushback options");
  if (hasPreviewTrait(technician, "knowsAGuy")) earlyUnlocks.push("site-contact prep options");
  if (hasAnyPreviewTrait(technician, ["byTheBook", "notebookHabit"])) earlyUnlocks.push("faster documentation closeouts");

  if (toolIds.includes("toolBag")) firstJobFeel.push("tool bag trims pickup effort");
  if (toolIds.includes("drill")) firstJobFeel.push("drill cuts cart assembly cost");
  if (toolIds.includes("handTruck")) firstJobFeel.push("hand truck carries more in the garage");
  if (hasPreviewTrait(technician, "badKnees")) firstJobFeel.push("long carries bite harder");
  if (install >= 4) firstJobFeel.push("cart assembly checks are strong");
  else if (install <= 1) firstJobFeel.push("cart assembly checks are fragile");
  if (hasPreviewTrait(technician, "measureTwice")) firstJobFeel.push("careful work gets cheaper after habits build");

  if (documentation <= 1 && !hasAnyPreviewTrait(technician, ["byTheBook", "notebookHabit"])) watchOuts.push("paperwork-heavy surveys and handoffs");
  if (commercialProcess <= 1) watchOuts.push("commercial process and access rules");
  if (!canPreviewPressureChoice(technician) && clientCommunication < 4) watchOuts.push("pressure conversations stay locked early");
  if (install <= 1) watchOuts.push("physical install tasks");
  if (networking <= 1 && controlSystems <= 1) watchOuts.push("later systems service calls");
  if ((technician.stats.energy || 0) < 100 || (technician.stats.burnout || 0) > 0) watchOuts.push("stamina on long days");

  return [
    {
      label: "Shop start",
      detail: `Starts with ${getTechnicianStartingKitLabel(technician)}${cashDetail}.`,
    },
    {
      label: "Early unlocks",
      detail: earlyUnlocks.length ? earlyUnlocks.join("; ") : "Baseline choices; growth comes from tools, training, and careful closeout.",
    },
    {
      label: "First job feel",
      detail: firstJobFeel.length ? firstJobFeel.join("; ") : "No special tool edge on the cart build.",
    },
    {
      label: "Watch-outs",
      detail: watchOuts.length ? watchOuts.slice(0, 3).join("; ") : "No sharp early penalty; build identity will come from later choices.",
    },
  ];
}

function getTechnicianEarlyReadoutMarkup(technician) {
  return `
    <ul class="profile-readout">
      ${getTechnicianEarlyReadout(technician).map((item) => `
        <li><strong>${escapeHtml(item.label)}</strong><span>${escapeHtml(item.detail)}</span></li>
      `).join("")}
    </ul>
  `;
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
      <span>Starting kit</span><strong>${getTechnicianStartingKitLabel(technician)}</strong>
      <span>Key skills</span><strong>${getTechnicianSkillPreview(technician)}</strong>
    </div>
    <p><strong>Early read:</strong></p>
    ${getTechnicianEarlyReadoutMarkup(technician)}
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
        <p class="starting-kit"><strong>Starting kit:</strong> ${getTechnicianStartingKitLabel(technician)}</p>
        <p class="starting-kit"><strong>Early read:</strong></p>
        ${getTechnicianEarlyReadoutMarkup(technician)}
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
    const value = getTechnicianPreviewSkillValue(technician, skill.id);
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
    const kind = getInteractionMarkerKind(item);
    const markerText = getInteractionMarkerText(item);
    const taskState = getInteractionTaskState(item);
    const markerPosition = getInteractionMarkerPosition(item, kind);
    marker.className = [
      getInteractionMarkerClass(item),
      taskState ? `task-state-${taskState.id}` : "",
    ].filter(Boolean).join(" ");
    marker.dataset.markerKind = kind;
    marker.dataset.markerPlacement = markerPosition.placement;
    marker.dataset.taskState = taskState?.id || "";
    marker.style.left = `${markerPosition.x}px`;
    marker.style.top = `${markerPosition.y}px`;
    marker.title = `${markerText}: ${item.label}${taskState ? ` (${getTaskStateText(taskState)})` : ""}`;
    marker.textContent = markerText;
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
  const pressureText = nearest ? getInteractionPressureText(nearest) : "";
  const markerText = nearest ? getInteractionMarkerText(nearest) : "";
  const taskState = nearest ? getInteractionTaskState(nearest) : null;
  const stateText = taskState ? ` State: ${getTaskStateText(taskState)}` : "";
  const interactionText = nearest?.detail && !taskState
    ? `${nearest.label}: ${nearest.detail}`
    : nearest?.label;
  const nearbyText = nearest
    ? `${markerText} - ${interactionText}${stateText}${pressureText ? ` Pressure on this action: ${pressureText}` : ""}`
    : "Walk toward an object or person.";
  elements.nearbyCard.classList.toggle("pressure-active", Boolean(pressureText));
  elements.nearbyCard.classList.toggle("task-state-active", Boolean(taskState));
  elements.nearbyCard.dataset.taskState = taskState?.id || "";
  elements.nearbyCard.textContent = nearbyText;
  elements.interactButton.disabled = !nearest;
  elements.interactButton.textContent = nearest ? `Interact: ${markerText} - ${nearest.label}` : "Interact";
}

function renderHud() {
  const vehicle = getCurrentVehicle();
  const rank = getCareerRank();
  elements.techName.textContent = state.technician.name;
  elements.energyValue.textContent = state.energy;
  const energyRatio = state.energy / getMaxEnergy();
  elements.energyMeter.style.width = `${energyRatio * 100}%`;
  elements.energyMeter.classList.toggle("energy-low", energyRatio > 0 && energyRatio <= 0.25);
  elements.energyMeter.classList.toggle("energy-danger", Boolean(state.energy <= 0 || state.flags.energyExhaustedThisShift));
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
  const conditionPressure = getConditionPressureSummary();
  elements.carryCard.classList.toggle("pressure-active", Boolean(conditionPressure));
  elements.carryCard.innerHTML = `
    <strong>${escapeHtml(hasCarriedItems()
      ? `${getCarriedLabels().join(" + ")} (${state.carry.length}/${getCarryCapacity()})`
      : `Nothing (0/${getCarryCapacity()})`)}</strong>
    <small>${escapeHtml(conditionPressure ? `Condition pressure: ${conditionPressure}` : "No active condition pressure.")}</small>
  `;
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
  const activeDispatch = getHudDispatchPresentation();
  elements.jobStatus.textContent = activeDispatch.statusLabel;
  elements.dispatchTitle.textContent = activeDispatch.title;
  elements.dispatchSummary.textContent = activeDispatch.summary;
  elements.objective.textContent = resolveCurrentObjective().text;
  elements.taskCopy.innerHTML = getCurrentStepPanelMarkup();
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

installDebugTools();
renderSelection();
showTitleScreen();
