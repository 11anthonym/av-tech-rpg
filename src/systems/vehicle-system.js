// Vehicle helpers own the van/loadout surface: carried items, cargo, vehicle lookup, and van menu UI.
// Scene code still owns site-specific pickup, unload, install, and movement-pressure details.
function getCarryCapacity(sceneId = state.sceneId) {
  return ["garage", "serviceOffice"].includes(sceneId) ? 1 + getToolModifier("garageCarryCapacityBonus") : 1;
}

function hasCarriedItems() {
  return state.carry.length > 0;
}

function getCarriedLabels() {
  return state.carry.map((itemId) => (
    getItemLabel(itemId)
  ));
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
      detail: getConsequenceReviewMenuText(),
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
      ${getCurrentStepGuidanceMarkup()}
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
      ...(hasConsequenceReviewInfo() ? [{
        label: "Review Consequence Ledger",
        className: "secondary-button",
        onClick: showConsequenceReview,
      }] : []),
      { label: "Open Regional Map", className: "secondary-button", onClick: showRegionalMap },
      { label: "Close", className: "text-button", onClick: render },
    ],
  });
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

function hasLoadedItems(itemIds) {
  return itemIds.every((itemId) => state.loaded.includes(itemId));
}

function getNextShopLoad() {
  return content.tutorial.shopLoad.find((item) => !state.loaded.includes(item));
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
