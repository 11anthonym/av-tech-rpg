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

function formatChance(chance = 0) {
  return `${Math.round(chance * 100)}%`;
}

function formatServiceIncidentChance(chance = 0) {
  return formatChance(chance);
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
