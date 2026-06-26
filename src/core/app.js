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

function notify(message) {
  addLog(message);
  render();
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

let avTechRpgStarted = false;

function startAvTechRpg() {
  if (avTechRpgStarted) return;
  avTechRpgStarted = true;

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
}
