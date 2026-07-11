// Current-step helpers turn scene, route, portal, and consequence state into player-facing guidance.
// They depend on app.js, route-system.js, and portal-system.js globals and load before bootstrap starts the game.
function getCurrentStepStage(objective = "") {
  if (!state.sceneId) return "Workday";
  if (state.sceneId === "shop") {
    if (state.flags.endShiftPending) return "Return / End Shift";
    if (!state.flags.finished) {
      if (!state.flags.shopBrief) return "Shop";
      if (state.loaded.length < content.tutorial.shopLoad.length) return "Shop / Van Prep";
      return "Van / Route";
    }
    if (state.flags.serviceComplete && hasPendingTraining()) return "Shop / Career Growth";
    if (shouldIntroduceJoshBeforeNextDispatch()) return "Shop / Coworker Check-in";
    if (state.flags.retrofitInstallComplete && !state.flags.retrofitInstallDebriefed) return "Shop / Debrief";
    if (state.flags.retrofitInstallComplete && !state.flags.prototypeSummaryViewed) return "Shop / Career Snapshot";
    return "Shop / Dispatch Board";
  }
  if (["garage", "lobby"].includes(state.sceneId)) return "Route / Building Entry";
  if (/return to radnor|use .*exit/i.test(objective)) return "Closeout / Return";
  if (/close out|choose|review the result|file the survey|handoff style/i.test(objective)) return "Job Site / Closeout";
  return "Job Site / Field Tasks";
}

function getCurrentStepCue(objective = "") {
  const primaryInteraction = typeof getPrimaryInteraction === "function" ? getPrimaryInteraction() : null;
  if (primaryInteraction) {
    return `Walk to ${getInteractionMarkerText(primaryInteraction)}: ${primaryInteraction.label}.`;
  }
  if (/dispatch board/i.test(objective)) return "Open the dispatch board or review the route from the van.";
  if (/van|load staged equipment|center city east/i.test(objective)) return "Use Van #3 for cargo, map, and route choices.";
  if (/exit|return to radnor/i.test(objective)) return "Use the marked exit or RETURN point.";
  if (/career clipboard|field-training focus|training focus|career snapshot/i.test(objective)) return "Open the career clipboard or dispatch board.";
  if (/josh|supervisor|client|facilities|security|escort/i.test(objective)) return "Talk to the nearby contact.";
  return "Use the nearest highlighted interaction.";
}

function getCurrentStepGuidance(objective = resolveCurrentObjective().text) {
  return {
    stage: getCurrentStepStage(objective),
    objective,
    interfaceHint: getCurrentStepCue(objective),
  };
}

function getDayPlanPath(stage) {
  const steps = [
    "Shop",
    "Van / Dispatch Board",
    "Regional Map / Route",
    "Travel Choice",
    "Job Site",
    "Field Tasks",
    "Closeout",
    "Return / End Shift",
    "Next Job",
  ];
  const stageMap = [
    [/shop/i, "Shop"],
    [/van|dispatch/i, "Van / Dispatch Board"],
    [/map|route/i, "Regional Map / Route"],
    [/travel/i, "Travel Choice"],
    [/job site/i, "Job Site"],
    [/field/i, "Field Tasks"],
    [/closeout/i, "Closeout"],
    [/return|end shift/i, "Return / End Shift"],
  ];
  const current = stageMap.find(([pattern]) => pattern.test(stage))?.[1] || "";
  return steps.map((step) => step === current ? `[${step}]` : step).join(" -> ");
}

function getCurrentStepRoute() {
  const currentRoute = getWorldRoute(getCurrentDispatchRouteId());
  if (currentRoute) return currentRoute;
  const tutorialRoute = getWorldRoute("centerCityTutorial");
  if (tutorialRoute && (!state.flags.finished || isTutorialRouteReady())) return tutorialRoute;
  return getInProgressDispatchBoardEntry()?.route || getCurrentDispatchBoardEntry()?.route || null;
}

function getCurrentObjectiveContext(primaryInteraction = typeof getPrimaryInteraction === "function" ? getPrimaryInteraction() : null) {
  const area = getCurrentWorldArea();
  const route = getCurrentStepRoute();
  const returnPortal = getCurrentReturnPortal();
  const visiblePortals = getCurrentAreaPortals();
  const lockedPortals = visiblePortals.filter((portal) => !isPortalReady(portal));
  const readyPortals = visiblePortals.filter(isPortalReady);
  const firstLockedPortal = lockedPortals[0];
  return {
    sceneId: state.sceneId,
    areaId: area?.id || "",
    areaLabel: area?.label || content.scenes[state.sceneId]?.name || "Current area",
    activeRouteId: route?.id || "",
    activeRouteStatus: route ? getRouteStatus(route) : "",
    carriedItems: getCarriedLabels(),
    loadedCargo: getLoadedVehicleLabels(),
    vehicleId: getCurrentVehicleId(),
    returnPortalLabel: returnPortal?.label || "",
    returnPortalReady: Boolean(returnPortal && isPortalReady(returnPortal)),
    visiblePortalCount: visiblePortals.length,
    lockedPortalCount: lockedPortals.length,
    readyPortalCount: readyPortals.length,
    firstLockedPortalLabel: firstLockedPortal?.label || "",
    firstLockedPortalMessage: firstLockedPortal ? getPortalRequirementText(firstLockedPortal) : "",
    openCallbacks: getUnresolvedCallbackCount(),
    openReturnTripRisks: getReturnTripRiskEntries().length,
    retrofitBranch: state.flags.retrofitInstallBranch || getRetrofitInstallBranchIdFromFlags(state.flags),
    primaryInteractionId: primaryInteraction ? getInteractionIdentity(primaryInteraction) : "",
    primaryInteractionLabel: primaryInteraction?.label || "",
    primaryInteractionMarker: primaryInteraction ? getInteractionMarkerText(primaryInteraction) : "",
  };
}

function resolveCurrentObjective() {
  const primaryInteraction = typeof getPrimaryInteraction === "function" ? getPrimaryInteraction() : null;
  const context = getCurrentObjectiveContext(primaryInteraction);
  const baseObjective = getObjective();
  const primaryObjective = primaryInteraction ? getPrimaryInteractionObjectiveText(primaryInteraction) : "";
  if (primaryObjective) {
    return {
      text: primaryObjective,
      context,
    };
  }
  if (context.returnPortalReady && /return to Radnor Rack & Wire/i.test(baseObjective)) {
    return {
      text: `Use the RETURN marker to leave ${context.areaLabel}.`,
      context,
    };
  }
  if (context.lockedPortalCount && /door|entrance|take .*elevator|exit|lobby|client floor|return to Radnor|use .*return/i.test(baseObjective)) {
    return {
      text: `${context.firstLockedPortalMessage} (${context.firstLockedPortalLabel})`,
      context,
    };
  }
  return { text: baseObjective, context };
}

function getCurrentRouteBriefText() {
  if (state.flags.endShiftPending) return "Travel is paused until the shift closeout is complete.";
  const route = getCurrentStepRoute();
  if (route) {
    const job = getRouteJobData(route.id);
    const lockReason = getRouteLockReason(route);
    return [
      `${route.fromLabel} -> ${route.toLabel}`,
      `${job.title}`,
      lockReason ? `Locked: ${lockReason}` : getRouteStatus(route),
      lockReason ? "" : `What happens next: ${getRouteLaunchPreviewText(route)}`,
      `Driven before: ${getRouteDrivenText(route)}`,
      `Fast travel: ${getRouteFastTravelText(route)}`,
    ].filter(Boolean).join(". ");
  }
  const boardEntry = getCurrentDispatchBoardEntry() || getBlockedDispatchBoardEntry();
  if (boardEntry) {
    return boardEntry.route
      ? `${boardEntry.routeLabel}. ${boardEntry.boardStatus}: ${boardEntry.title}.`
      : `${boardEntry.title}: ${boardEntry.boardStatus}. No drive route; resolve this from the dispatch board or shop.`;
  }
  if (state.sceneId !== "shop") {
    const area = getCurrentWorldArea();
    return `On site at ${area?.label || content.scenes[state.sceneId]?.name || "the current area"}. Finish the local work here, then use the marked return when it is ready.`;
  }
  return "No active route is launchable right now. Use the dispatch board or van map when the next route unlocks.";
}

function getCurrentConsequenceBriefText() {
  const openEntries = getConsequenceLedgerEntries();
  if (openEntries.length) {
    const callbackCount = openEntries.some((entry) => entry.id === "callback-debt") ? getUnresolvedCallbackCount() : 0;
    const riskCount = openEntries.filter((entry) => entry.id !== "callback-debt").length;
    const countText = [
      callbackCount ? `${callbackCount} callback${callbackCount === 1 ? "" : "s"}` : "",
      riskCount ? `${riskCount} return-trip risk${riskCount === 1 ? "" : "s"}` : "",
    ].filter(Boolean).join(", ");
    const first = openEntries[0];
    return `Open: ${countText}. Cause: ${first.cause} Future effect: ${first.affects}.`;
  }
  const latestCloseout = getLatestJobSiteCloseoutBriefText();
  if (latestCloseout) return latestCloseout;
  const resolvedEntries = getConsequenceLedgerEntries({ includeResolved: true })
    .filter((entry) => entry.status !== "open");
  const lastResolved = resolvedEntries[resolvedEntries.length - 1];
  if (lastResolved) return `No open callback debt. Last saved consequence: ${getConsequenceStatusLabel(lastResolved.status)} - ${lastResolved.source}. ${lastResolved.detail}`;
  return "No open callback debt or return-trip risk.";
}

function getCurrentStepBrief(objective = resolveCurrentObjective().text) {
  const guidance = getCurrentStepGuidance(objective);
  return {
    ...guidance,
    dayPlan: getDayPlanPath(guidance.stage),
    workday: getWorkdayRhythmBriefText(),
    route: getCurrentRouteBriefText(),
    consequences: getCurrentConsequenceBriefText(),
    conditionPressure: getConditionPressureSummary(),
  };
}

function getCurrentStepRows({ includeDayPlan = true } = {}) {
  const brief = getCurrentStepBrief();
  const transitionBrief = getCurrentAreaTransitionBriefText();
  return [
    { key: "now", label: "Now", detail: brief.stage },
    { key: "workday", label: "Workday", detail: brief.workday },
    includeDayPlan ? { key: "day-plan", label: "Day plan", detail: brief.dayPlan } : null,
    { key: "next", label: "Next task", detail: brief.objective },
    { key: "nearby", label: "Nearby cue", detail: brief.interfaceHint },
    transitionBrief ? { key: "area-transitions", label: "Area transitions", detail: transitionBrief } : null,
    { key: "route", label: "Route", detail: brief.route },
    { key: "consequences", label: "Consequences", detail: brief.consequences },
    brief.conditionPressure ? { key: "condition-pressure", label: "Condition pressure", detail: brief.conditionPressure } : null,
  ].filter(Boolean);
}

function getCurrentStepPanelRows() {
  const rows = getCurrentStepRows({ includeDayPlan: false });
  const nextRow = rows.find((row) => row.key === "next");
  return [
    nextRow,
    ...rows.filter((row) => row.key !== "next"),
  ].filter(Boolean);
}

function getCurrentStepListMarkup({ className = "modal-list", includeDayPlan = true, rows = null } = {}) {
  const resolvedRows = rows || getCurrentStepRows({ includeDayPlan });
  return `
    <ul class="${className}">
      ${resolvedRows.map((row) => `<li class="${getModalListRowClass(row.label, row.detail)} current-step-${row.key || "row"}"><strong>${escapeHtml(row.label)}</strong><span>${escapeHtml(row.detail)}</span></li>`).join("")}
    </ul>
  `;
}

function getCurrentStepPanelMarkup() {
  return getCurrentStepListMarkup({ className: "current-step-list", rows: getCurrentStepPanelRows() });
}

function getCurrentStepGuidanceText() {
  return getCurrentStepRows({ includeDayPlan: false })
    .map((row) => `${row.label}: ${row.detail}`)
    .join(" ");
}

function getCurrentStepGuidanceMarkup() {
  return getCurrentStepListMarkup();
}

function getObjective() {
  if (state.sceneId === "shop") {
    if (shouldIntroduceJoshBeforeNextDispatch()) return "Check in with Josh at the workbench before taking the next route.";
    if (state.flags.endShiftPending) {
      if (state.flags.serviceCallbackPending && !state.flags.serviceCallbackResolved) {
        if (typeof canHelpJoshAfterShift === "function" && canHelpJoshAfterShift()) {
          return "Close out the shift; you can help Josh clean up the Conshohocken callback after hours.";
        }
        return "Close out the shift; Josh has the Conshohocken callback note waiting.";
      }
      return "Close out the shift before taking another job.";
    }
    if (state.flags.serviceCallbackPending && !state.flags.serviceCallbackResolved) return "Talk to Josh about the Conshohocken callback.";
    if (state.flags.serviceComplete && !state.flags.joshServiceDebriefed) return "Check in with Josh at the workbench.";
    if (state.flags.serviceComplete && hasPendingTraining()) return "Choose a field-training focus from the career clipboard.";
    if (state.flags.warehouseStarted && !state.flags.warehouseComplete) {
      if (state.warehouseChecks.length === content.warehouseDispatch.checks.length) return "Review the found power supply.";
      return `Search the shop for the replacement power supply (${state.warehouseChecks.length}/${content.warehouseDispatch.checks.length}).`;
    }
    if (state.flags.retrofitInstallComplete && !state.flags.retrofitInstallDebriefed) return "Check in with Josh about the Burlington retrofit install.";
    const boardObjective = getCurrentDispatchBoardObjective();
    if (boardObjective) return boardObjective;
    if (state.flags.secureAccessComplete) return "Current dispatch board complete. Explore the shop.";
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
    if (state.flags.conshohockenFollowupComplete) return "Use the room exit to return to Radnor Rack & Wire.";
    if (state.flags.serviceComplete) return "Use the room exit to return to Radnor Rack & Wire.";
    if (state.flags.conshohockenFollowupStarted) return "Review the coupler label follow-up.";
    if (!state.flags.serviceBrief) return "Check in with the client contact.";
    if (!state.flags.serviceInspected) return "Inspect the failed display.";
    if (getRecoverableServiceRoomIncidents().length) return "Recover the visible room incident or carry it into closeout.";
    if (!state.flags.serviceApproach) return "Gather another room finding or return to CHOOSE and select a service approach.";
    if (getActionableServiceRoomConditions().length) return "Decide how to handle the known room pressure or continue the display swap.";
    if (isServiceInstallComplete()) return "Return to the client contact and close out the service call.";
    return `Install replacement gear (${state.serviceInstalled.length}/${content.serviceDispatch.swapItems.length}).`;
  }
  if (state.sceneId === "universitySurvey") {
    if (state.flags.surveyComplete) return "Use the site exit to return to Radnor Rack & Wire.";
    if (!state.flags.surveyBrief) return "Check in with the facilities contact.";
    if (state.flags.surveyWallCheckedBeforeAccessPath && !hasSurveyMeasuredAccessPath()) {
      return "Measure the elevator and hallway so the wall-first survey note can be cleaned up.";
    }
    if (state.surveyInspections.length < content.surveyDispatch.inspections.length) {
      return `Inspect the campus access path (${state.surveyInspections.length}/${content.surveyDispatch.inspections.length}).`;
    }
    return "Return to the facilities contact and file the survey report.";
  }
  if (state.sceneId === "southPhillyCommissioning") {
    if (state.flags.commissioningComplete) return "Use the room exit to return to Radnor Rack & Wire.";
    if (!state.flags.commissioningBrief) return "Check in with the client contact.";
    if (state.commissioningChecks.includes("termination") && !state.flags.commissioningTerminationAction) {
      return "Choose how to handle the loose credenza termination.";
    }
    if (state.commissioningChecks.length < content.commissioningDispatch.checks.length) {
      return `Commission the training room (${state.commissioningChecks.length}/${content.commissioningDispatch.checks.length}).`;
    }
    return "Return to the client contact and close out the commissioning visit.";
  }
  if (state.sceneId === "warrantyReturn") {
    if (state.flags.callbackCleanupComplete) return "Use the room exit to return to Radnor Rack & Wire.";
    if (!state.flags.callbackCleanupBrief) return "Check in with the client contact.";
    if (state.callbackCleanupChecks.length < content.callbackCleanupDispatch.checks.length) {
      return `Troubleshoot the warranty return (${state.callbackCleanupChecks.length}/${content.callbackCleanupDispatch.checks.length}).`;
    }
    return "Return to the client contact and close out the warranty return.";
  }
  if (state.sceneId === "executiveHandoff") {
    if (state.flags.handoffComplete) return "Use the room exit to return to Radnor Rack & Wire.";
    if (!state.flags.handoffBrief) return "Check in with the client contact.";
    if (state.handoffChecks.length < content.handoffDispatch.checks.length) {
      return `Prepare the client handoff (${state.handoffChecks.length}/${content.handoffDispatch.checks.length}).`;
    }
    return "Return to the client contact and choose the handoff style.";
  }
  if (state.sceneId === "systemsService") {
    if (state.flags.systemsComplete) return "Use the room exit to return to Radnor Rack & Wire.";
    if (!state.flags.systemsBrief) return "Check in with the client contact.";
    if (state.systemsChecks.length < content.systemsDispatch.checks.length) {
      return `Troubleshoot the offline room (${state.systemsChecks.length}/${content.systemsDispatch.checks.length}).`;
    }
    return "Return to the client contact and choose the systems closeout.";
  }
  if (state.sceneId === "burlingtonRetrofitWalkdown") {
    if (state.flags.retrofitInstallStarted && !state.flags.retrofitInstallComplete) {
      if (!state.flags.retrofitInstallBrief) return "Review the walkdown package with the facilities contact.";
      if (state.retrofitInstallChecks.length < getRetrofitInstallChecks().length) {
        return `Install the retrofit pathway (${state.retrofitInstallChecks.length}/${getRetrofitInstallChecks().length}).`;
      }
      return "Choose the retrofit install closeout.";
    }
    if (state.flags.retrofitWalkdownComplete) return "Use the site exit to return to Radnor Rack & Wire.";
    if (!state.flags.retrofitWalkdownBrief) return "Check in with the facilities contact.";
    if (state.retrofitWalkdownChecks.length < content.retrofitWalkdownDispatch.checks.length) {
      return `Walk down the retrofit pathway (${state.retrofitWalkdownChecks.length}/${content.retrofitWalkdownDispatch.checks.length}).`;
    }
    return "Return to the facilities contact and choose the walkdown closeout.";
  }
  if (state.sceneId === "navyYardAccess") {
    if (state.flags.secureAccessComplete) return "Use the site exit to return to Radnor Rack & Wire.";
    if (!state.flags.secureAccessBrief) return "Check in with security.";
    if (state.secureAccessChecks.length < content.secureAccessDispatch.checks.length) {
      return `Sort out secure access (${state.secureAccessChecks.length}/${content.secureAccessDispatch.checks.length}).`;
    }
    if (!state.flags.secureAccessRoomReached) return "Meet the escort and enter the telecom room.";
    if (state.secureAccessTaskChecks.length < content.secureAccessDispatch.taskChecks.length) {
      return `Complete the rack update (${state.secureAccessTaskChecks.length}/${content.secureAccessDispatch.taskChecks.length}).`;
    }
    return "Return to security and close out the Navy Yard job.";
  }
  if (!state.flags.roomBrief) return "Ask the supervisor how to start the cart build.";
  if (state.flags.finished) return "Use the room exit to return to Radnor Rack & Wire.";
  if (getActionableTutorialInstallPressure()) return "Decide how to handle the first-day cart pressure or continue the build.";
  if (state.assembled.length < 2) return `Assemble Cart 1 with your supervisor (${state.assembled.length}/2).`;
  if (state.assembled.length < 4) return `Finish Cart 2 alone (${state.assembled.length - 2}/2).`;
  return "Review the result of your first day.";
}
