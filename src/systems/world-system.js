// World, area, route-status, and route-prep helpers for the top-down RPG map layer.
// These keep shared map/route lookups out of job-specific dispatch orchestration.
function enterScene(sceneId, playerPosition = null) {
  state.sceneId = sceneId;
  const area = getWorldAreaByScene(sceneId);
  if (area) state.flags.currentAreaId = area.id;
  state.player = playerPosition && !overlapsSolidObject(playerPosition.x, playerPosition.y)
    ? { ...playerPosition }
    : { ...content.scenes[sceneId].playerStart };
  render();
  elements.scene.focus();
}

function getWorldAreaByScene(sceneId) {
  return Object.values(content.world?.areas || {}).find((area) => area.sceneId === sceneId);
}

function getWorldRoute(routeId) {
  return content.world?.routes?.[routeId] || null;
}

function getWorldPortal(portalId) {
  return content.world?.portals?.[portalId] || null;
}

function getWorldArea(areaId) {
  return content.world?.areas?.[areaId] || null;
}

function getWorldRegion(regionId) {
  return content.world?.regions?.[regionId] || null;
}

function getWorldRoutes() {
  return Object.values(content.world?.routes || {});
}

function getCurrentWorldArea() {
  return getWorldArea(state.flags.currentAreaId)
    || getWorldAreaByScene(state.sceneId)
    || getWorldArea(content.world?.homeAreaId);
}

function getRouteTravelCount(routeId) {
  return state.flags.routeHistory?.[routeId] || 0;
}

function getFastTravelCount(routeId) {
  return state.flags.fastTravelHistory?.[routeId] || 0;
}

function getFastTravelEnergyCost(route) {
  return route.fastTravelEnergyCost ?? 1;
}

function isTutorialRouteReady() {
  return hasLoadedItems(content.tutorial.shopLoad)
    && state.flags.shopBrief
    && !state.flags.finished
    && !state.flags.endShiftPending;
}

function canLaunchRouteFromRegionalMap(routeId) {
  return routeId === "centerCityTutorial" && isTutorialRouteReady();
}

// Route history gates fast travel and gives the map its driven-before state.
function isFastTravelUnlocked(route) {
  return Boolean(route?.fastTravelEligible) && getRouteTravelCount(route.id) > 0;
}

function canFastTravelRoute(route) {
  const currentArea = getCurrentWorldArea();
  return isFastTravelUnlocked(route)
    && currentArea?.id === route.fromAreaId
    && getCurrentDispatchRouteId() === route.id;
}

function getDispatchReference(dispatchId) {
  return dispatchId ? content[dispatchId] || null : null;
}

function getRouteJobVariant(routeId, routeJob) {
  if (routeId === "conshohockenService" && isConshohockenFollowupAvailable()) return routeJob.followup || null;
  if (
    routeId === "burlingtonRetrofitWalkdown"
    && state.flags.retrofitWalkdownComplete
    && !state.flags.retrofitInstallComplete
  ) return routeJob.install || null;
  return null;
}

// Routes define travel; routeJobs define the player-facing job card for that travel.
function getRouteJobData(routeId) {
  const defaults = content.routeJobDefaults || {};
  const routeJob = content.routeJobs?.[routeId] || {};
  const variant = getRouteJobVariant(routeId, routeJob) || {};
  const dispatch = getDispatchReference(variant.dispatchId || routeJob.dispatchId);
  return {
    title: variant.title || routeJob.title || dispatch?.title || defaults.title || "Mapped route",
    familyId: variant.familyId || routeJob.familyId || defaults.familyId || "logistics",
    purpose: variant.purpose || routeJob.purpose || defaults.purpose || "Move from the shop to a mapped work area.",
    summary: variant.summary || routeJob.summary || dispatch?.summary || defaults.summary || "",
    unlockCondition: variant.unlockCondition || routeJob.unlockCondition || defaults.unlockCondition || "Unlocked by dispatch-board progression.",
    rewards: variant.rewards || routeJob.rewards || defaults.rewards || "Job pay, XP, reputation, and route history if the work closes cleanly.",
    riskTags: variant.riskTags || routeJob.riskTags || defaults.riskTags || [],
  };
}

function getRouteStatus(route) {
  const travelCount = getRouteTravelCount(route.id);
  const pressure = routeHasConsequencePressure(route);
  if (route.planned) return "Future candidate";
  if (getCurrentDispatchRouteId() === route.id) {
    if (canFastTravelRoute(route)) return pressure ? "Active / fast travel / consequence pressure" : "Active / fast travel available";
    return pressure ? "Active / consequence pressure" : "Active";
  }
  if (canLaunchRouteFromRegionalMap(route.id)) return pressure ? "Available / consequence pressure" : "Available";
  if (isFastTravelUnlocked(route)) return pressure ? "Driven before / fast travel / consequence pressure" : "Driven before / fast travel unlocked";
  if (travelCount > 0) return pressure ? `Completed / consequence pressure (${travelCount})` : `Completed / driven before (${travelCount})`;
  if (getRouteLockReason(route)) return pressure ? "Locked / consequence pressure" : "Locked";
  return pressure ? "Consequence pressure" : "Story route";
}

function getRouteDrivenText(route) {
  const travelCount = getRouteTravelCount(route.id);
  return travelCount > 0 ? `Yes (${travelCount} drive${travelCount === 1 ? "" : "s"})` : "No";
}

function getRouteFastTravelText(route) {
  if (!route.fastTravelEligible) return "Not available for this story route.";
  if (canFastTravelRoute(route)) return `Available now with ${getEnergyEffortText(getFastTravelEnergyCost(route))}.`;
  if (isFastTravelUnlocked(route)) return `Unlocked, but only from ${route.fromLabel} while this route is active on the board.`;
  return "Locked until this route has been driven once; then it becomes a low-friction shortcut.";
}

function getRouteLockReason(route) {
  if (route.planned) return "Future candidate; mapped for preview but not launchable yet.";
  if (canLaunchRouteFromRegionalMap(route.id) || getCurrentDispatchRouteId() === route.id || canFastTravelRoute(route)) return "";
  if (state.flags.endShiftPending) return "End-shift closeout is pending.";
  if (route.id === "centerCityTutorial") {
    if (state.flags.finished) return "First-day Center City route is already complete.";
    if (!state.flags.shopBrief) return "Talk to the supervisor before loading the van.";
    if (!hasLoadedItems(content.tutorial.shopLoad)) return "Load all staged cargo into Van #3.";
  }
  if (!state.flags.finished) return "Complete the first Center City job before later board routes unlock.";
  const activeRoute = getWorldRoute(getCurrentDispatchRouteId());
  if (activeRoute && activeRoute.id !== route.id) return `Current board route is ${activeRoute.toLabel}.`;
  const currentArea = getCurrentWorldArea();
  if (currentArea?.id && route.fromAreaId !== currentArea.id) return `Starts from ${route.fromLabel}; current area is ${currentArea.label || currentArea.id}.`;
  if (route.fastTravelEligible && !isFastTravelUnlocked(route)) return "Drive this route once from the dispatch board to unlock fast travel.";
  return "Not active on the current dispatch board.";
}

function getScenePortalInteractions(sceneId = state.sceneId) {
  const area = getWorldAreaByScene(sceneId);
  if (!area) return [];
  return Object.values(content.world?.portals || {})
    .filter((portal) => portal.fromAreaId === area.id
      && isPortalVisibleForState(portal)
      && typeof portal.x === "number"
      && typeof portal.y === "number")
    .map((portal) => ({
      x: portal.x,
      y: portal.y,
      label: portal.label,
      detail: getPortalDetailText(portal),
      portalId: portal.id,
      portalKind: portal.kind,
      markerKind: portal.kind === "returnRoute" ? "return" : "door",
      markerText: portal.kind === "returnRoute" ? "RETURN" : "DOOR",
      action: () => usePortal(portal.id),
    }));
}

function getRouteSummaryLaunchPreview(route, { fastTravel = false } = {}) {
  if (!route) return "This route is not mapped yet.";
  if (fastTravel) {
    return "Review the known-route shortcut, then take the low-friction drive to arrive.";
  }
  return `Review the ${route.toLabel} drive summary before leaving.`;
}

function getRouteLaunchFlow(routeId, { fastTravel = false } = {}) {
  const route = getWorldRoute(routeId);
  const routeSummary = getRouteSummaryLaunchPreview(route, { fastTravel });
  const flow = (preview, launch) => ({ preview, launch });
  if (routeId === "centerCityTutorial") {
    const preview = !fastTravel && getRouteChoices(route).length
      ? "Choose a route approach, then review the drive summary."
      : routeSummary;
    return flow(preview, () => promptTravel());
  }
  if (routeId === "conshohockenService") {
    if (isConshohockenFollowupAvailable()) {
      return flow(
        fastTravel ? routeSummary : "Review the Conshohocken follow-up drive summary before leaving.",
        () => promptConshohockenFollowupTravel({ fastTravel }),
      );
    }
    if (!state.flags.servicePreparation) return flow("Review service prep before travel.", showServicePreparation);
    return flow(
      fastTravel ? routeSummary : "Review the Conshohocken service drive summary before leaving.",
      () => promptServiceTravel({ fastTravel }),
    );
  }
  if (routeId === "universitySurvey") {
    if (!state.flags.surveyPreparation) return flow("Review site-survey prep before travel.", showSurveyPreparation);
    return flow(
      fastTravel ? routeSummary : "Review the University City survey drive summary before leaving.",
      () => promptSurveyTravel({ fastTravel }),
    );
  }
  if (routeId === "navyYardAccess") {
    if (!state.flags.secureAccessPreparation) return flow("Review secure-access prep before travel.", showSecureAccessPreparation);
    return flow(
      fastTravel ? routeSummary : "Review the Navy Yard drive summary before leaving.",
      () => promptSecureAccessTravel({ fastTravel }),
    );
  }
  if (routeId === "systemsService") {
    if (!state.flags.systemsPreparation) return flow("Review systems-service prep before travel.", showSystemsPreparation);
    return flow(
      fastTravel ? routeSummary : "Review the King of Prussia systems drive summary before leaving.",
      () => promptSystemsTravel({ fastTravel }),
    );
  }
  if (routeId === "burlingtonRetrofitWalkdown") {
    if (state.flags.retrofitWalkdownComplete && !state.flags.retrofitInstallComplete) {
      if (!state.flags.retrofitInstallPackageReviewed) return flow("Review the saved walkdown package before the install drive.", showRetrofitInstallPackage);
      return flow(
        fastTravel ? routeSummary : "Review the Burlington install drive summary before leaving.",
        () => promptRetrofitInstallTravel({ fastTravel }),
      );
    }
    if (!state.flags.retrofitWalkdownPreparation) return flow("Review retrofit walkdown prep before travel.", showRetrofitWalkdownPreparation);
    return flow(
      fastTravel ? routeSummary : "Review the Burlington walkdown drive summary before leaving.",
      () => promptRetrofitWalkdownTravel({ fastTravel }),
    );
  }
  if (routeId === "southPhillyCommissioning") return flow(routeSummary, () => promptCommissioningTravel({ fastTravel }));
  if (routeId === "warrantyReturn") return flow(routeSummary, () => promptCallbackCleanupTravel({ fastTravel }));
  if (routeId === "executiveHandoff") return flow(routeSummary, () => promptHandoffTravel({ fastTravel }));
  return flow("That route is not connected to the dispatch board yet.", () => notify("That route is not connected to the dispatch board yet."));
}

function getRouteLaunchPreviewText(route, { fastTravel = false } = {}) {
  if (!route) return "Route is not mapped yet.";
  const lockReason = getRouteLockReason(route);
  if (lockReason) return `Locked: ${lockReason}`;
  return getRouteLaunchFlow(route.id, { fastTravel }).preview;
}

function getRoutePrepRows(route, { fastTravel = false } = {}) {
  const job = getRouteJobData(route.id);
  const destination = getWorldArea(route.toAreaId);
  const region = getWorldRegion(destination?.regionId);
  const toolPlan = getDispatchToolPlan(job.familyId, route.id);
  const lockReason = getRouteLockReason(route);
  const differenceText = getDispatchDifferenceText({ routeId: route.id });
  return [
    { label: "Job", detail: job.title },
    { label: "Destination", detail: `${destination?.label || route.toLabel}${region?.name ? `, ${region.name}` : ""}` },
    { label: "Job family", detail: getJobFamilyName(job.familyId) },
    { label: "Purpose", detail: job.purpose },
    ...getRouteBranchRows(route),
    { label: "Route", detail: `${route.fromLabel} -> ${route.toLabel}` },
    { label: "Route status", detail: getRouteStatus(route) },
    { label: "What happens next", detail: getRouteLaunchPreviewText(route, { fastTravel }) },
    { label: fastTravel ? "Fast-travel pressure" : "Travel cost / risk", detail: fastTravel ? `Known route shortcut with ${getEnergyEffortText(getFastTravelEnergyCost(route))}.` : getRouteTravelCostRisk(route) },
    differenceText ? { label: "Why this is different today", detail: differenceText } : null,
    { label: "Today's condition", detail: getDailyConditionPrepText({ includeClean: true }) },
    { label: "Required prep", detail: getToolPlanText(toolPlan.required, { required: true }) },
    { label: "Recommended prep", detail: getToolPlanText(toolPlan.recommended) },
    { label: "Risk tags", detail: (job.riskTags || []).join(", ") || "ordinary field pressure" },
    { label: "Callback / return-trip risk", detail: getRouteConsequenceText(route) },
    getRouteConsequencePressureText(route) ? { label: "Mapped consequence pressure", detail: getRouteConsequencePressureText(route) } : null,
    getRouteCloseoutHistoryText(route) ? { label: "Recent closeout history", detail: getRouteCloseoutHistoryText(route) } : null,
    { label: "Fast travel", detail: getRouteFastTravelText(route) },
    lockReason ? { label: "Locked reason", detail: lockReason } : null,
  ].filter(Boolean);
}

function getRoutePrepMarkup(route, options = {}) {
  return `
    <ul class="modal-list">
      ${getModalListRowsMarkup(getRoutePrepRows(route, options))}
    </ul>
  `;
}

function canUseRoutePrepRecovery() {
  const homeAreaId = content.world?.homeAreaId || "shop";
  const atHomeBase = state.sceneId === "shop" && getCurrentWorldArea()?.id === homeAreaId;
  const hasConditionPressure = state.flags.energyExhaustedThisShift
    || getExhaustionSkillPenalty() > 0
    || (state.energy > 0 && state.energy <= Math.ceil(getMaxEnergy() * LOW_ENERGY_SPEED_THRESHOLD))
    || state.burnout >= HIGH_BURNOUT_SPEED_THRESHOLD;
  return atHomeBase && hasConditionPressure && !state.flags.endShiftPending;
}

function takeRoutePrepShortBreak(routeId, options = {}) {
  const route = getWorldRoute(routeId);
  const destination = route?.toLabel || "the route";
  if (!applyShortBreak(`Took a 15-minute break before leaving for ${destination}. Energy improved, and the clock moved.`)) return;
  render();
  showRoutePrepModal(routeId, options);
}

function getRoutePrepRecoveryActions(route, options = {}) {
  if (!canUseRoutePrepRecovery()) return [];
  const actions = [];
  if (state.energy < getMaxEnergy()) {
    actions.push({
      label: "Take 15-Minute Break Before Driving",
      className: "secondary-button",
      onClick: () => takeRoutePrepShortBreak(route.id, options),
    });
  }
  actions.push({
    label: "Open Break Area / Recovery Options",
    className: "secondary-button",
    onClick: () => showBreakArea({
      backAction: () => showRoutePrepModal(route.id, options),
      backLabel: "Back To Route Prep",
    }),
  });
  return actions;
}

function showRoutePrepModal(routeId, { fastTravel = false, backAction = showVehicleMenu, backLabel = "Back To Van" } = {}) {
  const route = getWorldRoute(routeId);
  if (!route) return notify(`Route ${routeId} is not mapped yet.`);
  if (fastTravel && !canFastTravelRoute(route)) return notify("That fast travel route is not available for the current board route.");
  const lockReason = getRouteLockReason(route);
  const launchLabel = fastTravel ? `Fast Travel to ${route.toLabel}` : route.actionLabel || `Drive to ${route.toLabel}`;
  const routePrepOptions = { fastTravel, backAction, backLabel };
  showModal({
    kicker: fastTravel ? "Fast Travel Prep" : "Route Prep",
    title: getRouteJobData(route.id).title,
    body: `
      ${getRoutePrepMarkup(route, { fastTravel })}
      <p class="muted">Prep is informational for now: missing recommended tools do not block the route, but they can change energy pressure, checks, or closeout quality.</p>
    `,
    actions: [
      ...(!lockReason ? [{
        label: launchLabel,
        primary: true,
        onClick: () => launchRouteFromBoard(route.id, { fastTravel }),
      }] : []),
      ...getRoutePrepRecoveryActions(route, routePrepOptions),
      { label: backLabel, className: "secondary-button", onClick: backAction },
      { label: "Close", className: "text-button", onClick: render },
    ],
  });
}

function showDispatchRoutePrep(routeId, backAction = showDispatchPreview) {
  return showRoutePrepModal(routeId, {
    backAction,
    backLabel: "Back To Job Card",
  });
}

function getDispatchRoutePrepAction(routeId, backAction, options = {}) {
  return {
    label: options.label || "Review Route & Prep",
    className: options.className,
    primary: options.primary ?? !options.className,
    onClick: () => showDispatchRoutePrep(routeId, backAction),
  };
}

function launchRouteFromBoard(routeId, { fastTravel = false } = {}) {
  return getRouteLaunchFlow(routeId, { fastTravel }).launch();
}

function promptFastTravelRoute(routeId) {
  const route = getWorldRoute(routeId);
  if (!canFastTravelRoute(route)) return notify("That fast travel route is not available for the current board route.");
  return launchRouteFromBoard(routeId, { fastTravel: true });
}
