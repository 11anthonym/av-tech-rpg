// Render system: paints scene decor, interaction markers, HUD, nearby prompt, log, and the main frame.
// Gameplay systems update state; this layer reflects that state into the static DOM.
function renderDecor() {
  const scene = content.scenes[state.sceneId];
  const decor = scene.decor.map((item) => {
    const node = document.createElement("div");
    node.className = `decor ${item.type}`;
    node.style.left = `${item.x}px`;
    node.style.top = `${item.y}px`;
    node.style.width = `${item.w}px`;
    node.style.height = `${item.h}px`;
    node.textContent = item.text;
    return node;
  });
  const interactions = getInteractions().map((item) => {
    const marker = document.createElement("div");
    const kind = getInteractionMarkerKind(item);
    const markerText = getInteractionMarkerText(item);
    const taskState = getInteractionTaskState(item);
    const markerPosition = getInteractionMarkerPosition(item, kind);
    marker.className = [
      getInteractionMarkerClass(item),
      taskState ? `task-state-${taskState.id}` : "",
    ].filter(Boolean).join(" ");
    marker.dataset.markerKind = kind;
    marker.dataset.markerPlacement = markerPosition.placement;
    marker.dataset.taskState = taskState?.id || "";
    marker.style.left = `${markerPosition.x}px`;
    marker.style.top = `${markerPosition.y}px`;
    marker.title = `${markerText}: ${item.label}${taskState ? ` (${getTaskStateText(taskState)})` : ""}`;
    marker.textContent = markerText;
    return marker;
  });
  elements.sceneLayer.replaceChildren(...decor, ...interactions);
}

function renderPlayer() {
  elements.player.style.left = `${state.player.x - 15}px`;
  elements.player.style.top = `${state.player.y - 19}px`;
  const carried = hasCarriedItems() ? getCarriedLabels().join(" + ") : null;
  elements.carryBubble.textContent = carried || "";
  elements.carryBubble.classList.toggle("hidden", !carried);
}

function renderNearby() {
  const nearest = getNearestInteraction();
  const pressureText = nearest ? getInteractionPressureText(nearest) : "";
  const markerText = nearest ? getInteractionMarkerText(nearest) : "";
  const taskState = nearest ? getInteractionTaskState(nearest) : null;
  const stateText = taskState ? ` State: ${getTaskStateText(taskState)}` : "";
  const interactionText = nearest?.detail && !taskState
    ? `${nearest.label}: ${nearest.detail}`
    : nearest?.label;
  const nearbyText = nearest
    ? `${markerText} - ${interactionText}${stateText}${pressureText ? ` Pressure on this action: ${pressureText}` : ""}`
    : "Walk toward an object or person.";
  elements.nearbyCard.classList.toggle("pressure-active", Boolean(pressureText));
  elements.nearbyCard.classList.toggle("task-state-active", Boolean(taskState));
  elements.nearbyCard.dataset.taskState = taskState?.id || "";
  elements.nearbyCard.textContent = nearbyText;
  elements.interactButton.disabled = !nearest;
  elements.interactButton.textContent = nearest ? `Interact: ${markerText} - ${nearest.label}` : "Interact";
}

function renderHud() {
  const vehicle = getCurrentVehicle();
  const rank = getCareerRank();
  elements.techName.textContent = state.technician.name;
  elements.energyValue.textContent = state.energy;
  const energyRatio = state.energy / getMaxEnergy();
  elements.energyMeter.style.width = `${energyRatio * 100}%`;
  elements.energyMeter.classList.toggle("energy-low", energyRatio > 0 && energyRatio <= 0.25);
  elements.energyMeter.classList.toggle("energy-danger", Boolean(state.energy <= 0 || state.flags.energyExhaustedThisShift));
  elements.burnoutValue.textContent = state.burnout;
  elements.cashValue.textContent = formatCash(state.cash);
  elements.craftValue.textContent = getCraftsmanship();
  elements.confidenceValue.textContent = getConfidence();
  elements.rankValue.textContent = rank.name;
  elements.levelValue.textContent = rank.level;
  elements.xpValue.textContent = `${state.xp} XP`;
  elements.clientRepValue.textContent = formatReputation(state.reputation.clients);
  elements.coworkerRepValue.textContent = formatReputation(state.reputation.coworkers);
  elements.managementRepValue.textContent = formatReputation(state.reputation.management);
  elements.skillList.replaceChildren(...getSkillDefinitions().map((skill) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${skill.name} ${getSkillValue(skill.id)}</strong><small>${skill.branch}</small>`;
    return li;
  }));
  const conditionPressure = getConditionPressureSummary();
  elements.carryCard.classList.toggle("pressure-active", Boolean(conditionPressure));
  elements.carryCard.innerHTML = `
    <strong>${escapeHtml(hasCarriedItems()
      ? `${getCarriedLabels().join(" + ")} (${state.carry.length}/${getCarryCapacity()})`
      : `Nothing (0/${getCarryCapacity()})`)}</strong>
    <small>${escapeHtml(conditionPressure ? `Condition pressure: ${conditionPressure}` : "No active condition pressure.")}</small>
  `;
  elements.toolList.replaceChildren(...state.tools.map((toolId) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${content.tools[toolId].name}</strong><small>${getToolEffectText(content.tools[toolId])}</small>`;
    return li;
  }));
  elements.vehicleCard.innerHTML = `
    <strong>${vehicle.name}</strong>
    <span>Cargo: ${state.loaded.length}/${vehicle.cargoCapacity}</span>
    <span>Organization: ${vehicle.organization}</span>
    <small>${vehicle.comfort}</small>
  `;
}

function renderLog() {
  elements.fieldLog.replaceChildren(...state.log.map((message) => {
    const li = document.createElement("li");
    li.textContent = message;
    return li;
  }));
}

function render() {
  if (!state.sceneId) return;
  const scene = content.scenes[state.sceneId];
  elements.locationTitle.textContent = scene.name;
  elements.sceneKicker.textContent = scene.kicker;
  elements.sceneName.textContent = scene.name;
  elements.clock.textContent = state.clock;
  const activeDispatch = getHudDispatchPresentation();
  elements.jobStatus.textContent = activeDispatch.statusLabel;
  elements.dispatchTitle.textContent = activeDispatch.title;
  elements.dispatchSummary.textContent = activeDispatch.summary;
  elements.objective.textContent = resolveCurrentObjective().text;
  elements.taskCopy.innerHTML = getCurrentStepPanelMarkup();
  renderDecor();
  renderPlayer();
  renderNearby();
  renderHud();
  renderLog();
  saveGame();
}
