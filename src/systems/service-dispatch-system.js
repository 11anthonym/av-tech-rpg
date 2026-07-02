// Conshohocken service-call flow: prep, randomized room pressure, mid-job incidents, recovery, and closeout.
// This is the current proof case for RPG-style field consequences, so its helpers stay together.
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
      <p class="muted">Diagnosis should feel a little less blind.</p>`;
    addLog("Reviewed the Conshohocken work order and found a buried note about an inline coupler.");
    state.stats.workOrdersReviewed += 1;
  }
  if (preparation === "lunch") {
    title = "Lunch Acquired";
    body = `<p>You pack something from the break area before anybody can schedule through lunch.</p>
      <p class="muted">You will have a small recovery bump when you arrive in Conshohocken.</p>`;
    state.flags.packedLunchReady = true;
    addLog("Packed lunch before leaving Radnor Rack & Wire.");
    state.stats.lunchesPacked += 1;
  }
  if (preparation === "coffee") {
    title = "Shop Coffee";
    body = `<p>The coffee is hot and technically belongs to the company. The five-dollar jar beside it suggests otherwise.</p>
      <p class="muted">It helps now, though nobody should ask what is in it.</p>`;
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
      <p class="muted">Signal-path verification should feel less like guesswork.</p>`;
    if (!state.flags.metJosh) addLog("Asked Josh for advice while management investigated the Van #2 remote collection.");
    state.flags.metJosh = true;
  }
  if (preparation === "contact") {
    title = "Somebody Has Seen This Room";
    body = `<p>You text a former coworker who remembers this client. They reply with a blurry photo, a warning about the credenza, and the phrase "check the coupler before blaming the display."</p>
      <p class="muted">Diagnosis should feel less blind. Management will never understand why this helped.</p>`;
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

function getRolledServiceRoomConditionIds(seed = getServiceRoomSeed()) {
  return getRolledPressureConditionIds(getServiceRoomConditionDefinitions(), seed, { limit: 2 });
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
    modifiers: [],
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
    effects.modifiers.push({
      id: `service-room-${condition.id}`,
      label: known ? `Known room pressure: ${condition.label}` : "Hidden room pressure",
      source: known
        ? condition.revealedSummary || condition.summary || condition.label
        : condition.hiddenSummary || "The room has an unresolved condition affecting this check.",
      statDelta: (known ? modifier.knownBonus || 0 : 0) - (modifier.difficulty || 0),
      energyDelta: modifier.energy || 0,
      consumesOnUse: false,
      resultText: known
        ? `${condition.label} was accounted for during the check.`
        : `${condition.label} affected the check before it was fully understood.`,
    });
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
    taskModifiers: [...(check.taskModifiers || []), ...effects.modifiers],
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
  return formatChance(chance);
}

function recordServiceRoomIncident(condition, option, rollResult) {
  const entries = getServiceRoomIncidentEntries();
  const incidentId = getPressureIncidentId({ conditionId: condition.id, actionId: option.id }, entries.length, "service-incident");
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
  return getPressureIncidentId(incident, index, "service-incident");
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
    label: config.label,
    detail: `${config.detail} This is a risky shortcut: if the room pushes back, the client sees it immediately and the closeout inherits pressure.`,
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
        label: "Document signal-path discrepancy",
        detail: "Spend steady effort making the signal-path problem visible before closeout. Coworkers benefit from the note; management dislikes the delay.",
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
        label: "Stabilize replacement input board",
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
        label: "Square the mount hardware",
        detail: "Spend extra effort now, but prevent a shaky install from becoming the next tech's problem.",
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
        label: "Set client expectation",
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

function resolveServiceConditionResponse(conditionId, optionId, rollOverride = null) {
  const condition = getServiceRoomConditionById(conditionId);
  const option = getServiceConditionResponseOptions(condition).find((item) => item.id === optionId);
  if (!condition || !option) return notify("That room-pressure response is not available.");
  if (!isServiceRoomConditionKnown(conditionId)) return notify("That room pressure is not in your notes yet.");
  if (state.flags.serviceComplete) return notify("The service call is already closed out.");
  if (getServiceConditionResolution(conditionId)) return notify("That room pressure already has a response.");

  const { rollResult, incidentHappened, controlled } = resolvePressureResponseOutcome(option, rollOverride);
  const resultDetail = incidentHappened
    ? recordServiceRoomIncident(condition, option, rollResult)
    : option.result;
  if (incidentHappened) {
    // The shared pressure resolver applies stats; service records a richer incident entry above.
  } else {
    addLog(option.log || resultDetail);
  }
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
      label: "Stabilize room and own the delay",
      detail: "Spend steady effort to fix the visible problem, explain the delay, and protect the next visit. Coworkers and clients respect it; management dislikes the time.",
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
      label: "Calm the client and keep moving",
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
      contextBonus: (state.flags.servicePreparation === "review" ? 1 : 0) + (state.flags.servicePreparation === "josh" ? 1 : 0) + (state.flags.servicePreparation === "contact" ? 1 : 0),
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
