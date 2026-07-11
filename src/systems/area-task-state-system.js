// Area task-state helpers describe whether nearby work objects are ready, blocked, active, or complete.
// Keeping these separate makes scene interactions easier to read and reuse across jobs.
function getNextAssemblyItem() {
  return content.tutorial.assembly.find((item) => !state.assembled.includes(item.id));
}

function getWarehouseLocationTaskState(checkId) {
  const check = content.warehouseDispatch.checks.find((item) => item.id === checkId);
  return getFieldCheckTaskState({
    check,
    completedChecks: state.warehouseChecks,
    readyDetail: "Search this shop location for the replacement power supply.",
    completedDetail: `${check?.label || "That location"} is already searched.`,
  });
}

function getShopStagingTaskState(warehouseActive = state.flags.warehouseStarted && !state.flags.warehouseComplete) {
  if (warehouseActive) return getWarehouseLocationTaskState("staging");
  if (!state.flags.shopBrief) return getTaskState({ lockedReason: "Ask the supervisor what needs loading." });
  if (hasCarriedItems()) return getTaskState({ stateId: "inProgress", detail: "Hands are full; load carried gear into the van first." });
  if (!getNextShopLoad()) return getTaskState({ completed: true, detail: "Staged equipment is loaded into the van." });
  return getTaskState({ stateId: "ready", detail: "Pick up the next staged equipment group." });
}

function getGarageUnloadTaskState() {
  if (!state.flags.garageBrief) return getTaskState({ lockedReason: "Talk to the supervisor beside the van first." });
  if (hasCarriedItems()) return getTaskState({ stateId: "inProgress", detail: "Hands are full; deliver the carried gear before unloading more." });
  const nextItems = content.tutorial.garageUnload.filter((item) => !state.delivered.includes(item));
  if (!nextItems.length) return getTaskState({ completed: true, detail: "Everything has been carried to the client entrance." });
  return getTaskState({ stateId: "ready", detail: "Unload the next box group from the van." });
}

function getGarageEntranceTaskState() {
  if (hasCarriedItems()) return getTaskState({ stateId: "ready", detail: `Deliver ${getCarriedLabels().join(" and ")} to the client entrance.` });
  if (state.flags.centerCityEquipmentDelivered) return getTaskState({ completed: true, detail: "The client entrance is ready to use." });
  return getTaskState({ lockedReason: "Carry equipment from the van before walking to the client entrance." });
}

function getServiceSwapTaskState() {
  if (!state.flags.serviceBrief) return getTaskState({ lockedReason: "Check in with the client contact first." });
  if (state.flags.serviceComplete) return getTaskState({ completed: true, detail: "The service swap is complete." });
  if (!state.flags.serviceInspected) return getTaskState({ stateId: "ready", detail: "Diagnose the failed display before opening replacement gear." });
  if (isServiceInstallComplete()) return getTaskState({ completed: true, detail: "Replacement gear is installed. Close out with the client." });
  if (!hasCarriedItems()) return getTaskState({ lockedReason: "Pick up replacement gear before installing." });
  const check = getServiceAdjustedCheck(getServiceInstallCheck(state.carry));
  const resultState = getFieldTaskState(check);
  if (resultState.id !== "ready") return resultState;
  return getTaskState({ stateId: "ready", detail: `Install ${getServiceItemLabels(state.carry).join(" and ")}.` });
}

function getServicePickupTaskState() {
  if (!state.flags.serviceInspected) return getTaskState({ lockedReason: "Inspect the failed display before opening replacement gear." });
  if (hasCarriedItems()) return getTaskState({ stateId: "inProgress", detail: "Hands are full; install the carried replacement gear first." });
  const nextItems = content.serviceDispatch.swapItems
    .filter((item) => !state.serviceDelivered.includes(item.id) && !state.serviceInstalled.includes(item.id));
  if (!nextItems.length) return getTaskState({ completed: true, detail: "All replacement gear has been installed." });
  return getTaskState({ stateId: "ready", detail: "Pick up the next replacement gear group." });
}

function getCartPickupTaskState() {
  if (!state.flags.roomBrief) return getTaskState({ lockedReason: "Ask the supervisor how to start the cart build." });
  if (hasCarriedItems()) return getTaskState({ stateId: "inProgress", detail: "Hands are full; install the carried cart component first." });
  const next = getNextAssemblyItem();
  if (!next) return getTaskState({ completed: true, detail: "Both carts are assembled." });
  return getTaskState({ stateId: "ready", detail: `Pick up ${next.label}.` });
}

function getCartInstallTaskState(destination) {
  if (!state.flags.roomBrief) return getTaskState({ lockedReason: "Ask the supervisor how to start the cart build." });
  if (!hasCarriedItems()) return getTaskState({ lockedReason: "Pick up the next cart component first." });
  const part = getTutorialAdjustedAssemblyPart(content.tutorial.assembly.find((item) => item.id === state.carry[0]));
  if (!part) return getTaskState({ lockedReason: "The carried item is not a cart component." });
  if (part.destination !== destination) return getTaskState({ lockedReason: `${part.label} belongs on the other cart.` });
  const resultState = getFieldTaskState(part);
  if (resultState.id !== "ready") return resultState;
  return getTaskState({ stateId: "ready", detail: `Install ${part.label} on ${destination === "cart1" ? "Cart 1" : "Cart 2"}.` });
}
