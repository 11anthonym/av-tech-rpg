const content = window.GAME_CONTENT;
const keys = new Set();
const PLAYER_SPEED = 8;
const SAVE_KEY = "av-tech-rpg-save-v1";

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
    + (savedGame.flags?.warehouseComplete ? (savedGame.flags.warehouseApproach === "label" ? 50 : 35) : 0);
}

function inferSavedReputation(savedGame) {
  if (savedGame.reputation) return savedGame.reputation;
  const reputation = { clients: 0, coworkers: 0, management: 0 };
  if (savedGame.flags?.finished) {
    if (savedGame.flags.finishChoice === "tidy") {
      reputation.clients += 2;
      reputation.coworkers += 1;
      reputation.management -= 1;
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
  };
  if (savedGame.stats) return { ...stats, ...savedGame.stats };
  if (savedGame.flags?.finished) {
    stats.overtimeDays += 1;
    if (savedGame.flags.finishChoice === "tidy") stats.carefulFinishes += 1;
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

function getSaveSummary(savedGame) {
  if (!savedGame) return "No saved career yet.";
  const technician = content.technicians.find((item) => item.id === savedGame.technicianId);
  const scene = content.scenes[savedGame.sceneId];
  const reward = savedGame.flags?.reward ? content.tools[savedGame.flags.reward]?.name : null;
  const detail = reward ? ` | Tutorial reward: ${reward}` : "";
  const level = getCareerLevel(inferSavedXp(savedGame));
  return `${technician?.name || "Technician"} | Level ${level} | ${scene?.name || "First day"} | Energy ${savedGame.energy} | Cash $${inferSavedCash(savedGame)}${detail}`;
}

function refreshTitleScreen() {
  const savedGame = getSavedGame();
  elements.continueButton.disabled = !savedGame;
  elements.clearSaveButton.disabled = !savedGame;
  elements.saveSummary.textContent = getSaveSummary(savedGame);
}

function serializeGame() {
  return {
    version: 9,
    technicianId: state.technician.id,
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

function getCarryCapacity(sceneId = state.sceneId) {
  return ["garage", "serviceOffice"].includes(sceneId) ? 1 + getToolModifier("garageCarryCapacityBonus") : 1;
}

function getEquipmentEnergyCost(baseCost) {
  return Math.max(0, baseCost - getToolModifier("pickupEnergyReduction"));
}

function getAssemblyEnergyCost(baseCost) {
  return Math.max(0, baseCost - getToolModifier("assemblyEnergyReduction"));
}

function getVerificationEnergyCost(baseCost) {
  return Math.max(0, baseCost - getToolModifier("verificationEnergyReduction"));
}

function getServiceDiagnosisEnergyCost(baseCost) {
  return Math.max(0, baseCost - (state.flags.servicePreparation === "review" ? 1 : 0));
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
  const technician = content.technicians.find((item) => item.id === savedGame.technicianId);
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
    cash: migratedCash,
    xp: migratedXp,
    jobsCompleted: savedGame.jobsCompleted ?? (flags.finished ? 1 : 0) + (flags.serviceComplete ? 1 : 0) + (flags.surveyComplete ? 1 : 0) + (flags.commissioningComplete ? 1 : 0) + (flags.warehouseComplete ? 1 : 0),
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
    return showCommissioningChoice();
  }
  if (state.sceneId === "shop" && state.flags.warehouseStarted && state.warehouseChecks.length === content.warehouseDispatch.checks.length && !state.flags.warehouseComplete) {
    return showWarehouseChoice();
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
  state.energy = Math.max(0, Math.min(getMaxEnergy(), state.energy + amount));
}

function setClock(clock) {
  state.clock = clock;
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

function startGame(technicianId) {
  resetRuntimeState();
  state.technician = content.technicians.find((item) => item.id === technicianId);
  state.tools = [...state.technician.startingTools];
  state.energy = state.technician.stats.energy;
  state.burnout = state.technician.stats.burnout;
  addLog("First day started. Nobody mentioned an onboarding packet.");
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
    title: "Broomall -> Center City East",
    body: `
      <p><strong>Dispatch estimate:</strong> Simple two-cart build. Supervisor onsite.</p>
      <p>Today's drive is scripted for the tutorial. Future jobs can offer route, toll, and parking choices.</p>
      <div class="route-line"><span>BROOMALL</span><i></i><span>CENTER CITY EAST</span></div>
    `,
    actions: [{
      label: "Drive to Center City",
      onClick: () => {
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

function showFinishChoice() {
  setClock("MON 5:46 PM");
  showModal({
    kicker: "Last Decision",
    title: "Cart 2 Works. The Cables Do Not Look Happy.",
    body: `
      <p>Dispatch expected you to be done hours ago. You can clean up the cable routing or leave before traffic gets worse.</p>
      <p><strong>Energy:</strong> ${state.energy}/${getMaxEnergy()}</p>
    `,
    actions: [
      { label: "Dress the cables properly (+35 min)", onClick: () => finishJob("tidy") },
      { label: "Use three zip ties and leave", className: "secondary-button", onClick: () => finishJob("rush") },
    ],
  });
}

function finishJob(choice) {
  state.flags.finished = true;
  state.flags.finishChoice = choice;
  if (choice === "tidy") {
    changeEnergy(-13);
    state.burnout += 1;
    setClock("MON 6:21 PM");
    addLog("Cable routing cleaned up. Client is happy. Management notices the clock.");
  } else {
    changeEnergy(-4);
    setClock("MON 5:54 PM");
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
        <span>Cash balance</span><strong>$${state.cash}</strong>
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
      label: "Return to Broomall Shop",
      onClick: () => {
        state.flags.reward = "starter-kit";
        state.carry = [];
        addLog("Starter kit already included the current upgrade choices.");
        enterScene("shop");
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
      <p class="muted">${content.tools[toolId].effect}</p>
    `,
    actions: [{
      label: "Return to Broomall Shop",
      onClick: () => {
        state.carry = [];
        addLog(`${content.tools[toolId].name} added to your personal kit.`);
        addLog("Returned to the Broomall shop. More dispatches will be added next.");
        enterScene("shop");
      },
    }],
  });
}

function showPersonalKit() {
  const ownedTools = state.tools.map((toolId) => content.tools[toolId]);
  showModal({
    kicker: "Personal Kit",
    title: "Your Tools",
    body: `
      <ul class="modal-list">
        ${ownedTools.map((tool) => `<li><strong>${tool.name}</strong><span>${tool.effect}</span></li>`).join("")}
      </ul>
      <p class="muted">Garage carry capacity: ${getCarryCapacity("garage")} equipment group${getCarryCapacity("garage") === 1 ? "" : "s"}</p>
      <p class="muted">Assembly energy cost: ${getAssemblyEnergyCost(7)} per cart component</p>
      <p class="muted">Signal-path verification energy cost: ${getVerificationEnergyCost(4)}</p>
    `,
    actions: [{ label: "Close Tool Bag" }],
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
    kicker: "Broomall Career Clipboard",
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
      ${selectedTraining.length ? `
        <p><strong>Training completed:</strong></p>
        <ul class="modal-list">
          ${selectedTraining.map((choice) => `<li><strong>${choice.name}</strong><span>${choice.effect}</span></li>`).join("")}
        </ul>
      ` : ""}
      <p><strong>Milestone preview:</strong></p>
      <ul class="modal-list">
        ${getCareerMilestones().map((milestone) => `<li><strong>${milestone.status} ${milestone.name}</strong><span>${milestone.description}</span></li>`).join("")}
      </ul>
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
        label: `${choice.name}: ${choice.effect}`,
        className: "secondary-button",
        onClick: () => chooseTraining(choice.id),
      })) : []),
      { label: "Return Clipboard" },
    ],
  });
}

function getCareerLedgerMarkup() {
  return `
    <div class="results-grid">
      <span>Careful finishes</span><strong>${state.stats.carefulFinishes}</strong>
      <span>Callbacks generated</span><strong>${state.stats.callbacks}</strong>
      <span>Callback notes rebuilt</span><strong>${state.stats.callbacksResolved}</strong>
      <span>Overtime days</span><strong>${state.stats.overtimeDays}</strong>
      <span>Recovery days taken</span><strong>${state.stats.recoveryDays}</strong>
      <span>Work orders reviewed</span><strong>${state.stats.workOrdersReviewed}</strong>
      <span>Lunches packed</span><strong>${state.stats.lunchesPacked}</strong>
      <span>Coffee jar contributions</span><strong>${state.stats.coffeesBought}</strong>
      <span>Site surveys completed</span><strong>${state.stats.surveysCompleted}</strong>
      <span>Access risks documented</span><strong>${state.stats.accessRisksDocumented}</strong>
      <span>Quotes trusted anyway</span><strong>${state.stats.quotesTrustedAnyway}</strong>
      <span>Rooms commissioned</span><strong>${state.stats.commissioningRoomsCompleted}</strong>
      <span>Incomplete rooms documented</span><strong>${state.stats.incompleteRoomsDocumented}</strong>
      <span>Rooms passed anyway</span><strong>${state.stats.roomsPassedAnyway}</strong>
      <span>Warehouse runs completed</span><strong>${state.stats.warehouseRunsCompleted}</strong>
      <span>Stockroom labels corrected</span><strong>${state.stats.stockroomLabelsFixed}</strong>
      <span>Mystery boxes left alone</span><strong>${state.stats.mysteryBoxesLeft}</strong>
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
    body: `<p>${choice.description}</p><p class="muted">${choice.effect}</p>`,
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
    body: `<p>${content.tools.labeler.description}</p><p class="muted">${content.tools.labeler.effect}</p>`,
    actions: [{ label: "Return to Shop", onClick: render }],
  });
}

function showSupplyCounter() {
  const availableTools = Object.values(content.tools).filter((tool) => tool.price > 0 && !ownsTool(tool.id));
  showModal({
    kicker: "Broomall Supply Counter",
    title: "Personal Tool Purchases",
    body: availableTools.length ? `
      <p>Company reimbursement policy: optimistic.</p>
      <ul class="modal-list">
        ${availableTools.map((tool) => `<li><strong>${tool.name} - $${tool.price}</strong><span>${tool.effect}</span></li>`).join("")}
      </ul>
      <p class="muted">Cash available: $${state.cash}</p>
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
    body: `<p>${tool.description}</p><p class="muted">${tool.effect}</p><p class="muted">Cash remaining: $${state.cash}</p>`,
    actions: [{ label: "Return to Shop", onClick: render }],
  });
}

function takeBreak() {
  if (state.energy >= getMaxEnergy() && state.burnout === 0) return notify("You are already rested enough for the next dispatch.");
  state.energy = Math.min(getMaxEnergy(), state.energy + 24);
  state.burnout = Math.max(0, state.burnout - 1);
  state.stats.recoveryDays += 1;
  const weekdays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const dayIndex = weekdays.indexOf(state.clock.slice(0, 3));
  setClock(`${weekdays[(dayIndex + 1) % weekdays.length]} 7:22 AM`);
  addLog("Took an unpaid recovery day. Energy improved and burnout eased.");
  render();
}

function showDispatchPreview() {
  if (state.flags.warehouseComplete) {
    return showPrototypeSummary();
  }
  if (state.flags.commissioningComplete) {
    if (hasPendingTraining()) return notify("Mark your new field-training focus on the clipboard before closing out the prototype.");
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
    body: `
      <p><strong>Service Call:</strong> Conference-room display issue in Conshohocken.</p>
      <p>Sales says the replacement display is already onsite. The client says the room is booked again this afternoon.</p>
      ${state.flags.servicePreparation ? `<p class="muted">Preparation selected: ${getServicePreparationLabel()}</p>` : ""}
      <p class="muted">Use the supply counter, inspect your kit, or take an unpaid recovery day before leaving.</p>
    `,
    actions: [
      { label: "Accept Service Call", onClick: () => state.flags.servicePreparation ? promptServiceTravel() : showServicePreparation() },
      { label: "Return to Shop", className: "secondary-button" },
    ],
  });
}

function showPrototypeSummary() {
  const rank = getCareerRank();
  state.flags.prototypeSummaryViewed = true;
  render();
  showModal({
    kicker: "Current Prototype Complete",
    title: `Level ${rank.level} ${rank.name}`,
    body: `
      <p>You completed the currently playable dispatches. The Broomall board already has more work written in erasable marker.</p>
      <div class="results-grid">
        <span>Experience</span><strong>${state.xp} XP</strong>
        <span>Cash balance</span><strong>$${state.cash}</strong>
        <span>Client reputation</span><strong>${formatReputation(state.reputation.clients)}</strong>
        <span>Coworker reputation</span><strong>${formatReputation(state.reputation.coworkers)}</strong>
        <span>Management reputation</span><strong>${formatReputation(state.reputation.management)}</strong>
      </div>
      <p><strong>Career ledger:</strong></p>
      ${getCareerLedgerMarkup()}
      <p><strong>Upcoming dispatches:</strong></p>
      <ul class="modal-list">
        ${content.upcomingDispatches.map((dispatch) => `<li><strong>[LOCKED] ${dispatch.title}</strong><span>${dispatch.summary}</span></li>`).join("")}
      </ul>
      <p><strong>Prototype playtest questions:</strong></p>
      <ul class="modal-list">
        <li><strong>Did the walking stay purposeful?</strong><span>Loading and carrying should explain the job without becoming repetitive.</span></li>
        <li><strong>Did your choices feel visible?</strong><span>Your tools, preparation, diagnosis, survey report, commissioning notes, and stockroom decision should change how the workday plays.</span></li>
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
    body: `
      <p><strong>Warehouse Run:</strong> Find a replacement power supply before another technician leaves for a service call.</p>
      <p>Dispatch says it was stored in one of the vans. Van #2 is already offsite, and the key board says its key is with SALES.</p>
      <blockquote>Management note: "This should only take a minute. Please check the obvious places before escalating."</blockquote>
    `,
    actions: [
      { label: "Start Looking", onClick: startWarehouseRun },
      { label: "Return to Shop", className: "secondary-button" },
    ],
  });
}

function startWarehouseRun() {
  state.flags.warehouseStarted = true;
  state.flags.prototypeSummaryViewed = false;
  setClock(`${state.clock.slice(0, 3)} 4:18 PM`);
  addLog("Started looking for a replacement power supply reportedly stored in one of the vans.");
  render();
  showModal({
    kicker: "Broomall Warehouse Run",
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
  return ownsTool("labeler") ? 1 : 2;
}

function inspectWarehouseLocation(checkId) {
  const check = content.warehouseDispatch.checks.find((item) => item.id === checkId);
  if (!check || state.warehouseChecks.includes(checkId)) return notify(`${check?.label || "That location"} is already checked.`);
  state.warehouseChecks.push(checkId);
  changeEnergy(-getWarehouseSearchEnergyCost());
  addLog(`${check.label} checked: ${check.log}`);
  render();
  const allChecked = state.warehouseChecks.length === content.warehouseDispatch.checks.length;
  showModal({
    kicker: "Warehouse Note",
    title: check.label,
    body: `
      <p>${check.detail}</p>
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
        <span>Cash balance</span><strong>$${state.cash}</strong>
        <span>Experience</span><strong>+${correctedLabel ? 50 : 35} XP</strong>
        <span>Stockroom</span><strong>${correctedLabel ? "Bin label corrected" : "Mystery pile preserved"}</strong>
      </div>
      ${correctedLabel
        ? `<blockquote>Management note: "Please avoid spending excessive time reorganizing stock during urgent dispatch support."</blockquote>`
        : `<blockquote>Management note: "Thanks for keeping the warehouse run efficient."</blockquote>`}
    `,
    actions: [{ label: "Return To Shop", onClick: render }],
  });
}

function showCommissioningDispatchPreview() {
  showModal({
    kicker: "Dispatch Board",
    title: content.commissioningDispatch.title,
    body: `
      <p><strong>Commissioning:</strong> Verify a small South Philadelphia training room before client handoff.</p>
      <p>The installation ticket is closed. The client says one side of the room sounds quieter than the other.</p>
      <blockquote>Project note: "Room complete except final commissioning. Please avoid creating a punch list unless necessary."</blockquote>
    `,
    actions: [
      { label: "Accept Commissioning Visit", onClick: promptCommissioningTravel },
      { label: "Return to Shop", className: "secondary-button" },
    ],
  });
}

function promptCommissioningTravel() {
  showModal({
    kicker: "Route Summary",
    title: "Broomall -> South Philadelphia",
    body: `
      <p><strong>Dispatch estimate:</strong> Confirm room operation and collect client signoff.</p>
      <p class="muted">The completion sheet has already been signed internally.</p>
      <div class="route-line"><span>BROOMALL</span><i></i><span>SOUTH PHILADELPHIA</span></div>
    `,
    actions: [{
      label: "Drive To Training Room",
      onClick: () => {
        state.flags.commissioningStarted = true;
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
  return getVerificationEnergyCost(baseCost);
}

function inspectCommissioningCondition(checkId) {
  const check = content.commissioningDispatch.checks.find((item) => item.id === checkId);
  if (!check || state.commissioningChecks.includes(checkId)) return notify(`${check?.label || "That condition"} is already in your notes.`);
  state.commissioningChecks.push(checkId);
  changeEnergy(-getCommissioningCheckEnergyCost());
  addLog(`${check.label} checked: ${check.log}`);
  render();
  const allChecked = state.commissioningChecks.length === content.commissioningDispatch.checks.length;
  showModal({
    kicker: "Commissioning Note",
    title: check.label,
    body: `
      <p>${check.detail}</p>
      ${ownsTool("labeler") ? `<p class="muted">Josh's rebuilt labeler makes it easier to leave the suspect path readable.</p>` : ""}
      ${allChecked ? `<p class="muted">You found the room issue. Return to the client contact and close out the visit.</p>` : ""}
    `,
    actions: [{ label: allChecked ? "Return To Client Contact" : "Keep Testing", onClick: render }],
  });
}

function showCommissioningChoice() {
  showModal({
    kicker: "Commissioning Decision",
    title: "The Room Is Complete On Paper",
    body: `
      <p>The third ceiling speaker is silent because its termination is loose. The drawing is for a mirrored room across the hall, which explains why the closed ticket was so confident.</p>
      <p>The client would like the room working. Project management would like the completion sheet to remain emotionally undisturbed.</p>
    `,
    actions: [
      { label: `Repair termination and document discrepancy (-${getCommissioningRepairEnergyCost(6)} energy)`, onClick: () => finishCommissioning("repair") },
      ...(getCraftsmanship() >= 3 ? [{
        label: `Redress termination and issue clean punch list (-${getCommissioningRepairEnergyCost(5)} energy)`,
        className: "secondary-button",
        onClick: () => finishCommissioning("craft"),
      }] : []),
      { label: "Patch around it and mark room passed", className: "secondary-button", onClick: () => finishCommissioning("pass") },
    ],
  });
}

function finishCommissioning(approach) {
  const careful = approach !== "pass";
  const xp = approach === "craft" ? 65 : approach === "repair" ? 60 : 40;
  if (careful) changeEnergy(-getCommissioningRepairEnergyCost(approach === "craft" ? 5 : 6));
  state.flags.commissioningComplete = true;
  state.flags.commissioningApproach = approach;
  state.flags.prototypeSummaryViewed = false;
  setClock(`${state.clock.slice(0, 3)} ${approach === "pass" ? "3:39" : "4:06"} PM`);
  if (!state.flags.commissioningPaid) {
    state.cash += 84;
    state.flags.commissioningPaid = true;
  }
  if (!state.flags.commissioningProgressAwarded) {
    awardCareerProgress({
      xp,
      reputation: careful
        ? { clients: 2, coworkers: approach === "craft" ? 2 : 1, management: -1 }
        : { clients: 0, coworkers: 0, management: 1 },
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
      state.stats.callbacks += 1;
    }
    state.flags.commissioningStatsRecorded = true;
  }
  addLog(careful
    ? "Repaired the South Philadelphia speaker termination and documented the mirrored drawing."
    : "Marked the South Philadelphia room passed. The silent speaker remains a future service call.");
  render();
  showModal({
    kicker: "Commissioning Visit Complete",
    title: approach === "craft" ? "The Room Works And The Notes Do Too" : approach === "repair" ? "The Room Works Despite The Ticket" : "The Completion Sheet Remains Complete",
    body: `
      <div class="results-grid">
        <span>Commissioning wages</span><strong>+$84</strong>
        <span>Cash balance</span><strong>$${state.cash}</strong>
        <span>Experience</span><strong>+${xp} XP</strong>
        <span>Closeout</span><strong>${approach === "craft" ? "Clean punch list issued" : approach === "repair" ? "Issue repaired and documented" : "Room marked passed"}</strong>
      </div>
      ${careful
        ? `<blockquote>Management note: "Please distinguish between commissioning and reopening completed installation work."</blockquote>`
        : `<blockquote>Management note: "Thanks for keeping closeout moving. Service can address any user-reported concerns."</blockquote>`}
    `,
    actions: [{
      label: "Return To Broomall Shop",
      onClick: () => {
        addLog("Returned to the Broomall shop after the South Philadelphia commissioning visit.");
        enterScene("shop");
      },
    }],
  });
}

function showSurveyDispatchPreview() {
  showModal({
    kicker: "Dispatch Board",
    title: content.surveyDispatch.title,
    body: `
      <p><strong>Site Survey:</strong> Confirm access and mounting conditions for a University City classroom display.</p>
      <p>Sales already measured the wall. The facilities contact asked whether the quoted display will fit through the building.</p>
      ${state.flags.surveyPreparation ? `<p class="muted">Preparation selected: ${getSurveyPreparationLabel()}</p>` : ""}
      <blockquote>Sales note: "Should be straightforward. Same basic idea as a display we installed somewhere else."</blockquote>
    `,
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
    title: "Broomall -> University City",
    body: `
      <p><strong>Dispatch estimate:</strong> Measure one wall. Confirm install conditions. Do not overcomplicate the quote.</p>
      <div class="route-line"><span>BROOMALL</span><i></i><span>UNIVERSITY CITY</span></div>
    `,
    actions: [{
      label: "Drive To Campus",
      onClick: () => {
        state.flags.surveyStarted = true;
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
  return Math.max(0, baseCost - (state.flags.surveyPreparation === "sketch" ? 1 : 0));
}

function inspectSurveyConstraint(inspectionId) {
  const inspection = content.surveyDispatch.inspections.find((item) => item.id === inspectionId);
  if (!inspection || state.surveyInspections.includes(inspectionId)) return notify(`${inspection?.label || "That condition"} is already in your notes.`);
  state.surveyInspections.push(inspectionId);
  changeEnergy(-getSurveyInspectionEnergyCost());
  addLog(`${inspection.label} checked: ${inspection.log}`);
  render();
  const allChecked = state.surveyInspections.length === content.surveyDispatch.inspections.length;
  showModal({
    kicker: "Survey Note",
    title: inspection.label,
    body: `
      <p>${inspection.detail}</p>
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
    `,
    actions: [
      { label: `Document the access constraint (-${getSurveyReportEnergyCost(3)} energy)`, onClick: () => finishSurvey("document") },
      ...(getConfidence() >= 2 ? [{
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
  const xp = approach === "pushback" ? 60 : approach === "document" ? 55 : 35;
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
        ? { clients: 2, coworkers: 1, management: -1 }
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
        <span>Cash balance</span><strong>$${state.cash}</strong>
        <span>Experience</span><strong>+${xp} XP</strong>
        <span>Preparation</span><strong>${getSurveyPreparationLabel()}</strong>
        <span>Report</span><strong>${approach === "pushback" ? "Sales called directly" : approach === "document" ? "Access risk documented" : "Quoted plan accepted"}</strong>
      </div>
      ${approach === "trust"
        ? `<blockquote>Management note: "Thanks for keeping the survey efficient. Installation can confirm final access conditions onsite."</blockquote>`
        : `<blockquote>Management note: "Please avoid introducing unnecessary complexity after sales has aligned the client around a solution."</blockquote>`}
    `,
    actions: [{
      label: "Return To Broomall Shop",
      onClick: () => {
        addLog("Returned to the Broomall shop after the University City survey.");
        enterScene("shop");
      },
    }],
  });
}

function getServicePreparationLabel() {
  return {
    review: "Reviewed work order",
    lunch: "Packed lunch",
    coffee: "Shop coffee",
    josh: "Asked Josh for advice",
    none: "No extra preparation",
  }[state.flags.servicePreparation] || "None";
}

function showServicePreparation() {
  showModal({
    kicker: "Before You Leave",
    title: "Prepare For The Service Call",
    body: `
      <p>Dispatch called this a quick display issue. You have time for one small preparation step before taking Van #3 to Conshohocken.</p>
      <p class="muted">Cash available: $${state.cash}</p>
    `,
    actions: [
      { label: "Review the work order", onClick: () => chooseServicePreparation("review") },
      { label: "Pack lunch from the break area", className: "secondary-button", onClick: () => chooseServicePreparation("lunch") },
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
    addLog("Packed lunch before leaving the Broomall shop.");
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
    title: "Broomall -> Conshohocken",
    body: `
      <p><strong>Dispatch estimate:</strong> Diagnose the display issue and swap the screen if needed.</p>
      ${reviewedTicket ? `<p class="expense"><strong>Work-order note:</strong> Inline coupler reported behind the credenza.</p>` : ""}
      <div class="route-line"><span>BROOMALL</span><i></i><span>CONSHOHOCKEN</span></div>
    `,
    actions: [{
      label: "Drive to Client Office",
      onClick: () => {
        state.flags.serviceStarted = true;
        state.carry = [];
        if (state.flags.servicePreparation === "lunch" && !state.flags.serviceLunchUsed) {
          changeEnergy(8);
          state.flags.serviceLunchUsed = true;
          addLog("Ate the packed lunch before heading inside. Energy improved.");
        }
        setClock(`${state.clock.slice(0, 3)} 9:14 AM`);
        addLog("Arrived in Conshohocken for a display service call.");
        enterScene("serviceOffice");
      },
    }],
  });
}

function showServiceResults() {
  const checkedSignalPath = state.flags.serviceApproach === "verify";
  state.flags.serviceComplete = true;
  state.carry = [];
  setClock(`${state.clock.slice(0, 3)} ${checkedSignalPath ? "11:26" : "11:44"} AM`);
  if (!state.flags.servicePaid) {
    state.cash += 96;
    state.flags.servicePaid = true;
  }
  if (!state.flags.serviceProgressAwarded) {
    awardCareerProgress({
      xp: checkedSignalPath ? 50 : 40,
      reputation: checkedSignalPath
        ? { clients: 2, coworkers: 1, management: 0 }
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
        <span>Cash balance</span><strong>$${state.cash}</strong>
        <span>Energy remaining</span><strong>${state.energy}/${getMaxEnergy()}</strong>
        <span>Burnout</span><strong>${state.burnout}</strong>
        <span>Experience</span><strong>+${checkedSignalPath ? 50 : 40} XP</strong>
        <span>Preparation</span><strong>${getServicePreparationLabel()}</strong>
        <span>Diagnosis</span><strong>${checkedSignalPath ? "Signal path verified" : "Rework required"}</strong>
      </div>
      <blockquote>Client note: "Thank you for fixing the display before the afternoon meeting.${checkedSignalPath ? " The cable notes are helpful." : ""}"</blockquote>
    `,
    actions: [{
      label: "Return to Broomall Shop",
      onClick: () => {
        if (!checkedSignalPath) {
          state.flags.serviceCallbackPending = true;
          addLog("A Conshohocken callback note appeared before you made it back to Broomall.");
        }
        addLog("Returned to the Broomall shop after the Conshohocken service call.");
        enterScene("shop");
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
          if (state.flags.serviceComplete && hasPendingTraining()) return notify('Supervisor: "You leveled up fast. Mark a training focus on the clipboard before dispatch adds anything else."');
          if (state.flags.finished) return notify('Supervisor: "Good work today. Dispatch will have more tomorrow."');
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
        action: () => state.flags.finished
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
        x: 350, y: 185, label: "Take unpaid recovery day",
        action: takeBreak,
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
          if (state.flags.finished) return notify("Van #3 is parked. Future dispatches will start here.");
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
                ${state.flags.servicePreparation === "review" ? `<p class="muted">Reviewing the forwarded email chain saved time during diagnosis.</p>` : ""}
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
    return [
      {
        x: 300, y: 185, label: allChecked ? "Close out commissioning visit" : "Talk to client contact", npc: "CLIENT",
        action: () => {
          if (allChecked) return showCommissioningChoice();
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
        x: 760, y: 300, label: "Inspect credenza termination",
        action: () => {
          if (!state.flags.commissioningBrief) return notify("Check in with the client contact first.");
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
    changeEnergy(-getServiceVerificationEnergyCost(4));
    addLog("Verified the signal path and marked the unlabeled coupler before the swap.");
  } else {
    addLog("Trusted the service ticket and started the display swap immediately.");
  }
  render();
}

function installServicePart() {
  if (!hasCarriedItems()) return notify("Pick up replacement gear from the boxes.");
  const items = [...state.carry];
  state.serviceDelivered.push(...items);
  state.serviceInstalled.push(...items);
  state.carry = [];
  changeEnergy(-getAssemblyEnergyCost(10));
  addLog(`${getServiceItemLabels(items).join(" and ")} installed ${ownsTool("drill") ? "with your drill" : "with your screwdriver"}.`);
  if (state.serviceInstalled.length === content.serviceDispatch.swapItems.length) {
    if (state.flags.serviceApproach !== "verify") {
      changeEnergy(-6);
      addLog("Reopened the connection panel after the unlabeled coupler caused a dropout.");
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
  state.assembled.push(part.id);
  state.carry = [];
  changeEnergy(-getAssemblyEnergyCost(7));
  addLog(`${part.label} installed ${ownsTool("drill") ? "with your drill" : "with your screwdriver"}.`);
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
    if (state.flags.serviceComplete && !state.flags.joshServiceDebriefed) return "Check in with Josh at the workbench.";
    if (state.flags.serviceComplete && hasPendingTraining()) return "Choose a field-training focus from the career clipboard.";
    if (state.flags.serviceComplete && !state.flags.surveyComplete) return "Review the University City site survey on the dispatch board.";
    if (state.flags.surveyComplete && !state.flags.commissioningComplete) return "Review the South Philadelphia commissioning visit on the dispatch board.";
    if (state.flags.warehouseStarted && !state.flags.warehouseComplete) {
      if (state.warehouseChecks.length === content.warehouseDispatch.checks.length) return "Review the found power supply.";
      return `Search the shop for the replacement power supply (${state.warehouseChecks.length}/${content.warehouseDispatch.checks.length}).`;
    }
    if (state.flags.commissioningComplete && !state.flags.warehouseComplete) return "Review the warehouse run on the dispatch board.";
    if (state.flags.warehouseComplete && !state.flags.prototypeSummaryViewed) return "Review your career snapshot on the dispatch board.";
    if (state.flags.warehouseComplete) return "Current prototype complete. Explore the shop.";
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
    if (state.commissioningChecks.length < content.commissioningDispatch.checks.length) {
      return `Commission the training room (${state.commissioningChecks.length}/${content.commissioningDispatch.checks.length}).`;
    }
    return "Return to the client contact and close out the commissioning visit.";
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

function renderSelection() {
  elements.technicianGrid.replaceChildren(
    ...content.technicians.map((technician) => {
      const card = document.createElement("article");
      card.className = "technician-card";
      card.innerHTML = `
        <p class="eyebrow">Technician Profile</p>
        <h3>${technician.name}</h3>
        <p>${technician.tagline}</p>
        <div class="tech-stats">
          <span>Energy <strong>${technician.stats.energy}</strong></span>
          <span>Craft <strong>${technician.stats.craftsmanship}</strong></span>
          <span>Confidence <strong>${technician.stats.confidence}</strong></span>
        </div>
        <p class="starting-kit"><strong>Starting kit:</strong> ${technician.startingTools.map((toolId) => content.tools[toolId]?.name || toolId).join(", ")}</p>
      `;
      card.append(makeButton("Start First Day", () => startGame(technician.id)));
      return card;
    }),
  );
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
  elements.cashValue.textContent = `$${state.cash}`;
  elements.craftValue.textContent = getCraftsmanship();
  elements.confidenceValue.textContent = getConfidence();
  elements.rankValue.textContent = rank.name;
  elements.levelValue.textContent = rank.level;
  elements.xpValue.textContent = `${state.xp} XP`;
  elements.clientRepValue.textContent = formatReputation(state.reputation.clients);
  elements.coworkerRepValue.textContent = formatReputation(state.reputation.coworkers);
  elements.managementRepValue.textContent = formatReputation(state.reputation.management);
  elements.carryCard.textContent = hasCarriedItems()
    ? `${getCarriedLabels().join(" + ")} (${state.carry.length}/${getCarryCapacity()})`
    : `Nothing (0/${getCarryCapacity()})`;
  elements.toolList.replaceChildren(...state.tools.map((toolId) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${content.tools[toolId].name}</strong><small>${content.tools[toolId].effect}</small>`;
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
  const warehouseActive = state.flags.warehouseStarted && !state.flags.warehouseComplete;
  const activeDispatch = state.flags.warehouseStarted || state.flags.warehouseComplete
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
    : commissioningActive
      ? "COMMISSIONING"
      : surveyActive
      ? "SITE SURVEY"
      : serviceActive
      ? "SERVICE CALL"
      : state.flags.warehouseComplete
        ? "DISPATCH COMPLETE"
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
