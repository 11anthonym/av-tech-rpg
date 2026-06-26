// Dispatch-context helpers resolve the current job identity for tools, checks, and UI state.
// This keeps cross-dispatch state out of the main scene orchestration file.
function getCurrentDispatchKey() {
  if (state.sceneId === "executiveHandoff") return "handoff";
  if (state.sceneId === "warrantyReturn") return "warranty";
  if (state.sceneId === "navyYardAccess") return "secureAccess";
  if (state.sceneId === "southPhillyCommissioning") return "commissioning";
  if (state.sceneId === "universitySurvey") return "survey";
  if (state.sceneId === "systemsService") return "systems";
  if (state.sceneId === "burlingtonRetrofitWalkdown") {
    return state.flags.retrofitInstallStarted ? "retrofitInstall" : "retrofitWalkdown";
  }
  if (state.sceneId === "serviceOffice") {
    return state.flags.conshohockenFollowupStarted ? "followup" : "service";
  }
  const entries = getDispatchBoardEntries();
  const boardEntry = getInProgressDispatchBoardEntry(entries)
    || getCurrentDispatchBoardEntry(entries)
    || getBlockedDispatchBoardEntry(entries)
    || getLastCompletedDispatchBoardEntry(entries);
  if (boardEntry) return getDispatchKeyForBoardEntry(boardEntry);
  if (state.flags.finished) return "service";
  return "tutorial";
}

function getDispatchKeyForBoardEntry(entry) {
  return {
    callbackCleanup: "warranty",
    travelCost: "travel",
    careerSnapshot: "retrofitInstall",
  }[entry?.id] || entry?.id || "tutorial";
}

function getUsedPartsBrainDispatches() {
  state.flags.partsBrainDispatches ||= {};
  return state.flags.partsBrainDispatches;
}

function getPartsBrainFind() {
  const finds = content.tools.circuitHutOrganizer.finds;
  const index = getCurrentDispatchKey()
    .split("")
    .reduce((total, char) => total + char.charCodeAt(0), 0) % finds.length;
  return finds[index];
}

function hasActivePartsBrainFind() {
  return ownsTool("circuitHutOrganizer") && Boolean(getUsedPartsBrainDispatches()[getCurrentDispatchKey()]);
}

function canUsePartsBrain() {
  return hasCharacterTrait("circuitHutPartsBrain") && ownsTool("circuitHutOrganizer") && !hasActivePartsBrainFind();
}
