// Regional-map helpers group active routes, known destinations, fast travel, locks, and route history.
// Route prep and travel execution stay in route/app systems; this layer owns map readability.
function getRouteCardMarkup(route) {
  const job = getRouteJobData(route.id);
  const details = getRouteJobCardRows(route)
    .map((row) => `${row.label}: ${row.detail}`);
  const classes = ["route-card"];
  if (isCurrentBoardRoute(route)) classes.push("route-card-active");
  if (isRouteAvailableOnMap(route)) classes.push("route-card-available");
  if (routeHasConsequencePressure(route)) classes.push("route-card-pressure");
  if (canFastTravelRoute(route)) classes.push("route-card-fast-travel");
  if (getRouteLockReason(route)) classes.push("route-card-locked");
  if (getRouteTravelCount(route.id) > 0) classes.push("route-card-driven");
  return `
    <li class="${classes.join(" ")}">
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

function getOtherAvailableBoardRouteEntries() {
  const currentEntry = getCurrentDispatchBoardEntry();
  return getAvailableDispatchBoardEntries()
    .filter((entry) => entry.route && entry.routeId !== currentEntry?.routeId);
}

function getAvailableBoardRouteCardMarkup(entry) {
  const route = entry.route;
  const job = getRouteJobData(route.id);
  return `
    <li class="route-card route-card-available">
      <strong>${escapeHtml(`[Available Work] ${route.toLabel} - ${entry.title}`)}</strong>
      <span>${escapeHtml(`${getDispatchBoardRoleLabel(entry)} | ${getJobFamilyName(job.familyId)} | ${route.fromLabel} -> ${route.toLabel}`)}</span>
      <span>${escapeHtml(`${getRouteTravelCostRisk(route)} Driven before: ${getRouteDrivenText(route)}. Fast travel: ${getRouteFastTravelText(route)}`)}</span>
      <span>${escapeHtml("Choose this job on the dispatch board before driving.")}</span>
    </li>
  `;
}

function getAvailableBoardRouteListMarkup(entries) {
  if (!entries.length) return '<p class="muted">No other board work is waiting for a plan.</p>';
  return `<ul class="modal-list">${entries.map(getAvailableBoardRouteCardMarkup).join("")}</ul>`;
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
  const otherAvailableEntries = getOtherAvailableBoardRouteEntries();
  const otherAvailableRouteIds = new Set(otherAvailableEntries.map((entry) => entry.routeId));
  const availableRoutes = routes.filter((route) => isRouteAvailableOnMap(route) && !otherAvailableRouteIds.has(route.id));
  const pressureRoutes = routes.filter(routeHasConsequencePressure);
  const fastTravelRoutes = routes.filter((route) => !isCurrentBoardRoute(route)
    && !isRouteAvailableOnMap(route)
    && !otherAvailableRouteIds.has(route.id)
    && isFastTravelUnlocked(route));
  const completedRoutes = routes.filter((route) => !isCurrentBoardRoute(route)
    && !isRouteAvailableOnMap(route)
    && !otherAvailableRouteIds.has(route.id)
    && !isFastTravelUnlocked(route)
    && getRouteTravelCount(route.id) > 0);
  const lockedRoutes = routes.filter((route) => !isCurrentBoardRoute(route)
    && !isRouteAvailableOnMap(route)
    && !otherAvailableRouteIds.has(route.id)
    && !isFastTravelUnlocked(route)
    && getRouteTravelCount(route.id) === 0);
  return `
    <h3>Active Job Route</h3>
    ${getRouteListMarkup(activeRoutes, "No active route is ready from the map. Check the dispatch board.")}
    <h3>Other Available Work</h3>
    ${getAvailableBoardRouteListMarkup(otherAvailableEntries)}
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
  const availableBoardRouteIds = new Set(getAvailableDispatchBoardEntries().map((entry) => entry.routeId).filter(Boolean));
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
        const availableWork = inboundRoutes.some((route) => availableBoardRouteIds.has(route.id));
        const destinationState = active ? "active route" : availableWork ? "available work" : available ? "available route" : driven ? "visited" : "mapped candidate";
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
  const currentEntry = state.flags.finished ? getCurrentDispatchBoardEntry() : null;
  const planningChoice = state.flags.finished && hasDispatchPlanningChoice();
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
        ${state.flags.finished ? `<span>Planned work</span><strong>${escapeHtml(currentEntry?.title || (planningChoice ? "Choose on dispatch board" : "No route job ready"))}</strong>` : ""}
        <span>Last route</span><strong>${escapeHtml(state.flags.lastRouteId || "None")}</strong>
      </div>
      <p class="muted">Fast travel unlocks after you have driven an eligible route once. It still respects active board prep and costs route energy.</p>
      <h3>Current Work</h3>
      ${getCurrentStepGuidanceMarkup()}
      <h3>Known Destinations</h3>
      ${getKnownDestinationMarkup()}
      <h3>Area Transitions</h3>
      ${getCurrentAreaPortalMarkup()}
      ${getRegionalRouteMarkup()}
    `,
    actions: [
      ...(!activeRoute && planningChoice ? [{
        label: "Choose Work On Dispatch Board",
        onClick: showDispatchBoardSelection,
      }] : []),
      ...(canDriveActiveRoute ? [{
        label: `Review / Drive ${activeRoute.toLabel}`,
        onClick: () => showRoutePrepModal(activeRoute.id, { backAction: showRegionalMap, backLabel: "Back To Map" }),
      }] : []),
      ...(canLaunchRouteFromRegionalMap("centerCityTutorial") ? [{
        label: "Drive to Center City East",
        onClick: () => showRoutePrepModal("centerCityTutorial", { backAction: showRegionalMap, backLabel: "Back To Map" }),
      }] : []),
      ...(state.flags.finished && !state.flags.endShiftPending && (activeRoute || !planningChoice) ? [{
        label: planningChoice
          ? currentEntry ? "Change Planned Job" : "Choose Work On Dispatch Board"
          : "Review Dispatch Board Routes",
        className: "secondary-button",
        onClick: planningChoice ? showDispatchBoardSelection : showDispatchPreview,
      }] : []),
      ...(hasConsequenceReviewInfo() ? [{
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
