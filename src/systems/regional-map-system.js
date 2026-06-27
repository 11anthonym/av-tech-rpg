// Regional-map helpers group active routes, known destinations, fast travel, locks, and route history.
// Route prep and travel execution stay in route/app systems; this layer owns map readability.
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
      ${getCurrentStepGuidanceMarkup()}
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
