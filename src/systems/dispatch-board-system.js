// Dispatch-board helpers resolve board progression, active routes, HUD dispatch copy, and board entry routing.
// Individual dispatch preview scenes stay in app.js; this layer decides which one the board opens.
function getDispatchBoardEntryDefinitions() {
  return [
    {
      id: "service",
      contentKey: "serviceDispatch",
      routeId: "conshohockenService",
      statusLabel: "SERVICE CALL",
      objective: "Review the Conshohocken service call on the dispatch board.",
      availableReason: "First install day is complete and the shop has a small service call ready.",
      isAvailable: () => state.flags.finished && !state.flags.serviceComplete,
      isInProgress: () => (state.sceneId === "serviceOffice" && !state.flags.conshohockenFollowupStarted && !state.flags.serviceComplete)
        || (state.flags.serviceStarted && !state.flags.serviceComplete),
      isComplete: () => Boolean(state.flags.serviceComplete),
      previewAction: showServiceDispatchPreview,
    },
    {
      id: "followup",
      boardRole: "optional",
      contentKey: "followupDispatch",
      routeId: "conshohockenService",
      statusLabel: "FOLLOW-UP",
      objective: "Review the Conshohocken label follow-up on the dispatch board.",
      availableReason: "Josh's service debrief unlocked a repeat-route label cleanup before the next new site.",
      isAvailable: () => isConshohockenFollowupAvailable()
        && !(state.flags.serviceCallbackPending && !state.flags.serviceCallbackResolved)
        && !hasPendingTraining(),
      isInProgress: () => state.flags.conshohockenFollowupStarted && !state.flags.conshohockenFollowupComplete,
      isComplete: () => Boolean(state.flags.conshohockenFollowupComplete),
      blockedReason: () => {
        if (!state.flags.serviceComplete || state.flags.conshohockenFollowupComplete) return "";
        if (state.flags.serviceCallbackPending && !state.flags.serviceCallbackResolved) {
          return "The Conshohocken callback note is still clipped to Josh's bench.";
        }
        if (!state.flags.joshServiceDebriefed) return "Check in with Josh before coordination adds another stop.";
        if (hasPendingTraining()) return "Mark your field-training focus on the clipboard before taking another job.";
        return "";
      },
      previewAction: showConshohockenFollowupPreview,
    },
    {
      id: "survey",
      contentKey: "surveyDispatch",
      routeId: "universitySurvey",
      statusLabel: "SITE SURVEY",
      objective: "Review the University City site survey on the dispatch board.",
      availableReason: "The Conshohocken sequence is closed and the board has moved to a site survey.",
      isAvailable: () => state.flags.serviceComplete
        && state.flags.joshServiceDebriefed
        && !(state.flags.serviceCallbackPending && !state.flags.serviceCallbackResolved)
        && state.flags.conshohockenFollowupComplete
        && !state.flags.surveyComplete
        && !hasPendingTraining(),
      isInProgress: () => state.sceneId === "universitySurvey" || (state.flags.surveyStarted && !state.flags.surveyComplete),
      isComplete: () => Boolean(state.flags.surveyComplete),
      previewAction: showSurveyDispatchPreview,
    },
    {
      id: "commissioning",
      contentKey: "commissioningDispatch",
      routeId: "southPhillyCommissioning",
      statusLabel: "COMMISSIONING",
      objective: "Review the South Philadelphia commissioning visit on the dispatch board.",
      availableReason: "The University City survey is complete and a closeout-quality commissioning visit is ready.",
      isAvailable: () => state.flags.surveyComplete && !state.flags.commissioningComplete,
      isInProgress: () => state.sceneId === "southPhillyCommissioning"
        || (state.flags.commissioningStarted && !state.flags.commissioningComplete),
      isComplete: () => Boolean(state.flags.commissioningComplete),
      previewAction: showCommissioningDispatchPreview,
    },
    {
      id: "warehouse",
      contentKey: "warehouseDispatch",
      routeId: "",
      statusLabel: "WAREHOUSE RUN",
      objective: "Review the warehouse run on the dispatch board.",
      availableReason: "Commissioning is complete and the shop needs an inventory problem resolved before the next site.",
      isAvailable: () => state.flags.commissioningComplete && !state.flags.warehouseComplete && !hasPendingTraining(),
      isInProgress: () => state.flags.warehouseStarted && !state.flags.warehouseComplete,
      isComplete: () => Boolean(state.flags.warehouseComplete),
      blockedReason: () => {
        if (state.flags.commissioningComplete && !state.flags.warehouseComplete && hasPendingTraining()) {
          return "Mark your new field-training focus on the clipboard before taking another job.";
        }
        return "";
      },
      previewAction: showWarehouseDispatchPreview,
    },
    {
      id: "secureAccess",
      contentKey: "secureAccessDispatch",
      routeId: "navyYardAccess",
      statusLabel: "SECURE ACCESS",
      objective: "Review the Navy Yard secure-access job on the dispatch board.",
      availableReason: "The warehouse run is closed and the board has a secure-site rack update ready.",
      isAvailable: () => state.flags.warehouseComplete && !state.flags.secureAccessComplete,
      isInProgress: () => state.sceneId === "navyYardAccess"
        || (state.flags.secureAccessStarted && !state.flags.secureAccessComplete),
      isComplete: () => Boolean(state.flags.secureAccessComplete),
      previewAction: showSecureAccessDispatchPreview,
    },
    {
      id: "callbackCleanup",
      contentKey: "callbackCleanupDispatch",
      routeId: "warrantyReturn",
      statusLabel: "WARRANTY RETURN",
      objective: "Review the warranty return on the dispatch board.",
      availableReason: "Callback pressure is still open, so the board is forcing a cleanup before handoff.",
      isAvailable: () => shouldOfferCallbackCleanupDispatch(),
      isInProgress: () => state.sceneId === "warrantyReturn"
        || (state.flags.callbackCleanupStarted && !state.flags.callbackCleanupComplete),
      isComplete: () => Boolean(state.flags.callbackCleanupComplete),
      previewAction: showCallbackCleanupDispatchPreview,
    },
    {
      id: "handoff",
      contentKey: "handoffDispatch",
      routeId: "executiveHandoff",
      statusLabel: "CLIENT HANDOFF",
      objective: "Review the executive handoff on the dispatch board.",
      availableReason: "Secure access is complete and callback pressure no longer blocks the client handoff.",
      isAvailable: () => state.flags.secureAccessComplete
        && !state.flags.handoffComplete
        && !shouldOfferCallbackCleanupDispatch(),
      isInProgress: () => state.sceneId === "executiveHandoff" || (state.flags.handoffStarted && !state.flags.handoffComplete),
      isComplete: () => Boolean(state.flags.handoffComplete),
      previewAction: showHandoffDispatchPreview,
    },
    {
      id: "systems",
      contentKey: "systemsDispatch",
      routeId: "systemsService",
      statusLabel: "SYSTEMS SERVICE",
      objective: "Review the King of Prussia systems service on the dispatch board.",
      availableReason: "The executive handoff is complete and the board has a systems service call ready.",
      isAvailable: () => state.flags.handoffComplete && !state.flags.systemsComplete,
      isInProgress: () => state.sceneId === "systemsService" || (state.flags.systemsStarted && !state.flags.systemsComplete),
      isComplete: () => Boolean(state.flags.systemsComplete),
      previewAction: showSystemsDispatchPreview,
    },
    {
      id: "travelCost",
      contentKey: "travelDispatch",
      routeId: "",
      statusLabel: "TRAVEL COST",
      objective: "Review the Cherry Hill return toll on the dispatch board.",
      availableReason: "The systems service closed, but coordination left a cross-river travel cost for the board.",
      isAvailable: () => state.flags.systemsComplete && !state.flags.travelComplete,
      isInProgress: () => state.flags.systemsComplete && !state.flags.travelComplete,
      isComplete: () => Boolean(state.flags.travelComplete),
      previewAction: showTravelDispatchPreview,
    },
    {
      id: "retrofitWalkdown",
      contentKey: "retrofitWalkdownDispatch",
      routeId: "burlingtonRetrofitWalkdown",
      statusLabel: "RETROFIT WALKDOWN",
      objective: "Review the Burlington County retrofit walkdown on the dispatch board.",
      availableReason: "The travel-cost beat is closed and the retrofit needs a protective walkdown before install day.",
      isAvailable: () => state.flags.travelComplete && !state.flags.retrofitWalkdownComplete,
      isInProgress: () => (state.sceneId === "burlingtonRetrofitWalkdown" && !state.flags.retrofitInstallStarted)
        || (state.flags.retrofitWalkdownStarted && !state.flags.retrofitWalkdownComplete),
      isComplete: () => Boolean(state.flags.retrofitWalkdownComplete),
      previewAction: showRetrofitWalkdownDispatchPreview,
    },
    {
      id: "retrofitInstall",
      contentGetter: getRetrofitInstallPreview,
      fallbackTitle: "Burlington County Retrofit Install",
      fallbackSummary: "Install the retrofit using the inherited walkdown result.",
      routeId: "burlingtonRetrofitWalkdown",
      statusLabel: "RETROFIT INSTALL",
      objective: "Review the Burlington County retrofit install on the dispatch board.",
      availableReason: "The walkdown closeout exists, so the install can inherit that saved branch.",
      isAvailable: () => state.flags.retrofitWalkdownComplete && !state.flags.retrofitInstallComplete,
      isInProgress: () => (state.sceneId === "burlingtonRetrofitWalkdown" && state.flags.retrofitInstallStarted && !state.flags.retrofitInstallComplete)
        || (state.flags.retrofitInstallStarted && !state.flags.retrofitInstallComplete),
      isComplete: () => Boolean(state.flags.retrofitInstallComplete),
      previewAction: showRetrofitInstallDispatchPreview,
    },
    {
      id: "careerSnapshot",
      fallbackTitle: "Career Snapshot",
      fallbackSummary: "Review the completed dispatch board, consequence ledger, and upcoming locked work.",
      routeId: "",
      statusLabel: "CAREER SNAPSHOT",
      blockedStatusLabel: "SHOP DEBRIEF",
      objective: "Review your career snapshot on the dispatch board.",
      availableReason: "The Burlington install is debriefed and the board is ready for a career snapshot.",
      isAvailable: () => state.flags.retrofitInstallComplete
        && state.flags.retrofitInstallDebriefed
        && !state.flags.prototypeSummaryViewed,
      isInProgress: () => false,
      isComplete: () => Boolean(state.flags.prototypeSummaryViewed),
      blockedReason: () => {
        if (state.flags.retrofitInstallComplete && !state.flags.prototypeSummaryViewed && !state.flags.retrofitInstallDebriefed) {
          return "Check in with Josh about the Burlington retrofit before reviewing the career snapshot.";
        }
        return "";
      },
      previewAction: showCareerSnapshot,
    },
  ];
}

function resolveDispatchBoardEntry(entry) {
  const contentData = typeof entry.contentGetter === "function" ? entry.contentGetter() || {} : content[entry.contentKey] || {};
  const routeId = typeof entry.routeId === "function" ? entry.routeId() : entry.routeId || "";
  const isAvailable = Boolean(entry.isAvailable?.());
  const isInProgress = Boolean(entry.isInProgress?.());
  const isComplete = Boolean(entry.isComplete?.());
  const blockedReason = !isAvailable && !isComplete ? entry.blockedReason?.() || "" : "";
  const route = routeId ? getWorldRoute(routeId) : null;
  const boardStatus = isInProgress
    ? "In progress"
    : isAvailable
    ? "Active board item"
    : blockedReason
    ? "Blocked"
    : isComplete
    ? "Complete"
    : "Locked";
  return {
    ...entry,
    boardRole: entry.boardRole === "optional" ? "optional" : "main",
    title: contentData.title || entry.fallbackTitle || "Dispatch Board Item",
    summary: contentData.summary || contentData.setup || entry.fallbackSummary || "",
    routeId,
    route,
    routeLabel: route ? `${route.fromLabel} -> ${route.toLabel}` : "Shop / board task",
    isAvailable,
    isInProgress,
    isComplete,
    blockedReason,
    boardStatus,
  };
}

function getDispatchBoardEntries() {
  return getDispatchBoardEntryDefinitions().map(resolveDispatchBoardEntry);
}

function getAvailableDispatchBoardEntries(entries = getDispatchBoardEntries()) {
  if (state.flags.endShiftPending) return [];
  return entries.filter((entry) => entry.isAvailable);
}

function getPlannedDispatchId() {
  return typeof state.flags.plannedDispatchId === "string" ? state.flags.plannedDispatchId : "";
}

function getPlannedDispatchBoardEntry(entries = getDispatchBoardEntries()) {
  const plannedDispatchId = getPlannedDispatchId();
  if (!plannedDispatchId) return null;
  return getAvailableDispatchBoardEntries(entries).find((entry) => entry.id === plannedDispatchId) || null;
}

function setPlannedDispatchBoardEntry(dispatchId, entries = getDispatchBoardEntries()) {
  const entry = getAvailableDispatchBoardEntries(entries).find((candidate) => candidate.id === dispatchId);
  if (!entry) return false;
  state.flags.plannedDispatchId = entry.id;
  markCareerSnapshotStale();
  return true;
}

function clearPlannedDispatchBoardEntry() {
  if (!getPlannedDispatchId()) return false;
  state.flags.plannedDispatchId = "";
  markCareerSnapshotStale();
  return true;
}

function getCurrentDispatchBoardEntry(entries = getDispatchBoardEntries()) {
  if (state.flags.endShiftPending) return null;
  const availableEntries = getAvailableDispatchBoardEntries(entries);
  const plannedEntry = getPlannedDispatchBoardEntry(availableEntries);
  if (plannedEntry) return plannedEntry;
  return availableEntries.length === 1 ? availableEntries[0] : null;
}

function getBlockedDispatchBoardEntry(entries = getDispatchBoardEntries()) {
  return entries.find((entry) => entry.blockedReason) || null;
}

function getInProgressDispatchBoardEntry(entries = getDispatchBoardEntries()) {
  return entries.find((entry) => entry.isInProgress) || null;
}

function getLastCompletedDispatchBoardEntry(entries = getDispatchBoardEntries()) {
  const completed = entries.filter((entry) => entry.isComplete);
  return completed.length ? completed[completed.length - 1] : null;
}

function getCurrentDispatchBoardObjective() {
  return getCurrentDispatchBoardEntry()?.objective || "";
}

function getDispatchBoardStateMarkup({ showBlocked = true } = {}) {
  const entry = getCurrentDispatchBoardEntry() || (showBlocked ? getBlockedDispatchBoardEntry() : null);
  if (!entry) return "";
  const routeDetail = entry.route
    ? `Route: ${entry.routeLabel}.`
    : "Route: no drive route; this resolves from the board or shop.";
  const why = entry.blockedReason
    ? `Why blocked: ${entry.blockedReason}`
    : `Why active: ${entry.availableReason || "Unlocked by current board progression."}`;
  return `<li><strong>Board state</strong><span>${escapeHtml(`${entry.boardStatus}: ${entry.title}. ${routeDetail} ${why}`)}</span></li>`;
}

function getFallbackDispatchPresentation() {
  if (!state.flags.finished) {
    return {
      title: "Two Quick Carts",
      summary: "Build two mobile video conferencing carts at a Center City East office.",
      statusLabel: "FIRST DAY",
    };
  }
  if (state.flags.prototypeSummaryViewed) {
    return {
      title: "Current Board Complete",
      summary: "You cleared the current Radnor Rack & Wire dispatch board. Review the career clipboard or explore the shop.",
      statusLabel: "BOARD COMPLETE",
    };
  }
  return {
    title: "Shop Hub",
    summary: "Use the dispatch board, Van #3, career clipboard, or nearby shop interactions to choose the next step.",
    statusLabel: state.flags.endShiftPending ? "END SHIFT" : "SHOP HUB",
  };
}

function getHudDispatchPresentation() {
  if (state.flags.endShiftPending) return getFallbackDispatchPresentation();
  const entries = getDispatchBoardEntries();
  const entry = getInProgressDispatchBoardEntry(entries)
    || (state.sceneId === "shop" ? getCurrentDispatchBoardEntry(entries) || getBlockedDispatchBoardEntry(entries) : null)
    || getLastCompletedDispatchBoardEntry(entries);
  const fallback = getFallbackDispatchPresentation();
  if (!entry) return fallback;
  return {
    title: entry.title || fallback.title,
    summary: entry.summary || fallback.summary,
    statusLabel: entry.blockedReason ? entry.blockedStatusLabel || "SHOP BLOCKED" : entry.statusLabel || fallback.statusLabel,
  };
}

function getCurrentDispatchRouteId() {
  if (!state.flags.finished || state.flags.endShiftPending) return null;
  return getCurrentDispatchBoardEntry()?.routeId || null;
}

function showDispatchPreview() {
  if (shouldIntroduceJoshBeforeNextDispatch()) return notifyJoshIntroRequired();
  if (state.flags.endShiftPending) return showEndShiftModal();
  const entry = getCurrentDispatchBoardEntry();
  if (entry?.previewAction) return entry.previewAction();
  const blockedEntry = getBlockedDispatchBoardEntry();
  if (blockedEntry?.blockedReason) return notify(blockedEntry.blockedReason);
  if (state.flags.secureAccessComplete) return showCareerSnapshot();
  return showServiceDispatchPreview();
}
