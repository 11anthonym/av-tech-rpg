// Portal helpers keep area transitions, lock messaging, and return-marker behavior together.
// They depend on app.js globals and are loaded before bootstrap starts the game.
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

function getPortalCardRows(portal) {
  return [
    { label: "Label", detail: portal?.label || "Unmapped transition" },
    { label: "Origin", detail: getPortalOriginLabel(portal) },
    { label: "Destination", detail: getPortalDestinationLabel(portal) },
    { label: "Status", detail: getPortalStatusText(portal) },
    { label: "Requirement", detail: getPortalRequirementText(portal) },
    { label: portal?.kind === "returnRoute" ? "Return effect" : "Travel effect", detail: getPortalTravelEffectText(portal) },
    { label: "Now", detail: getCurrentStepStage(getObjective()) },
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

function getTimeOnCurrentDay(time) {
  if (!time) return null;
  if (/^[A-Z]{3} /.test(time)) return time;
  return `${state.clock.slice(0, 3)} ${time}`;
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
