const content = window.GAME_CONTENT;
const keys = new Set();
const PLAYER_SPEED = 8;
const MIN_PLAYER_SPEED = 4;
const LOW_ENERGY_SPEED_THRESHOLD = 0.25;
const HIGH_BURNOUT_SPEED_THRESHOLD = 4;
const SAVE_KEY = "av-tech-rpg-save-v1";
const SAVE_VERSION = 24;
const WEEKDAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const STAY_LATE_PREP_ENERGY_COST = 32;
const HELP_JOSH_ENERGY_COST = 30;
const STAY_LATE_BURNOUT_GAIN = 1;
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
const SHIFT_HISTORY_LIMIT = 5;

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

function notify(message) {
  addLog(message);
  render();
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
