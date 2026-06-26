// Debug scenario helpers are kept out of the player-facing orchestration path.
// They only install when the page is opened with ?debug.
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
