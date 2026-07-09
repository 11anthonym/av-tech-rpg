// Generic screen, modal, button, and field-log helpers shared by gameplay systems.
// They depend on app.js DOM/state globals and are loaded before bootstrap starts the game.
function showTitleScreen() {
  closeModal();
  keys.clear();
  window.scrollTo({ left: 0, top: 0 });
  elements.locationTitle.textContent = "AV Tech RPG";
  elements.clock.textContent = "MON 7:11 AM";
  elements.jobStatus.textContent = "CAREER MODE";
  elements.gameLayout.classList.add("hidden");
  elements.selection.classList.add("hidden");
  elements.menuButton.classList.add("hidden");
  elements.saveStatus.classList.add("hidden");
  elements.titleScreen.classList.remove("hidden");
  refreshTitleScreen();
}

function showTechnicianSelection() {
  window.scrollTo({ left: 0, top: 0 });
  elements.titleScreen.classList.add("hidden");
  elements.selection.classList.remove("hidden");
  elements.locationTitle.textContent = "Technician Selection";
}

function promptNewCareer() {
  if (!getSavedGame()) return showTechnicianSelection();
  showModal({
    kicker: "New Career",
    title: "Start Over?",
    body: `<p>Starting a new technician will overwrite the current saved career after you choose a profile.</p>`,
    actions: [
      { label: "Choose New Technician", onClick: showTechnicianSelection },
      { label: "Keep Current Career", className: "secondary-button" },
    ],
  });
}

function promptClearSavedGame() {
  if (!getSavedGame()) return;
  showModal({
    kicker: "Saved Career",
    title: "Clear Saved Career?",
    body: `<p>This removes the local career save from this browser. It cannot be undone.</p>`,
    actions: [
      { label: "Clear Saved Career", className: "secondary-button", onClick: clearSavedGame },
      { label: "Keep Current Career" },
    ],
  });
}

function resumeRequiredPrompt() {
  if (shouldIntroduceJoshBeforeNextDispatch()) return render();
  if (state.flags.endShiftPending) return showEndShiftModal();
  if (state.flags.finished && !state.flags.reward) return showResults();
  if (state.sceneId === "garage" && state.delivered.length === content.tutorial.garageUnload.length) {
    return showLobbyTransition();
  }
  if (state.sceneId === "client" && state.assembled.length === content.tutorial.assembly.length && !state.flags.finished) {
    return showFinishChoice();
  }
  if (state.sceneId === "serviceOffice" && state.serviceInstalled.length === content.serviceDispatch.swapItems.length && !state.flags.serviceComplete) {
    return showServiceResults();
  }
  if (state.flags.conshohockenFollowupStarted && !state.flags.conshohockenFollowupComplete) {
    return showConshohockenFollowupChoice();
  }
  if (state.sceneId === "universitySurvey" && isSurveyInspectionComplete() && !state.flags.surveyComplete) {
    return showSurveyReportChoice();
  }
  if (state.sceneId === "southPhillyCommissioning" && state.commissioningChecks.length === content.commissioningDispatch.checks.length && !state.flags.commissioningComplete) {
    if (!state.flags.commissioningTerminationAction) return showCommissioningTerminationChoice();
    return showCommissioningChoice();
  }
  if (state.sceneId === "shop" && state.flags.warehouseStarted && state.warehouseChecks.length === content.warehouseDispatch.checks.length && !state.flags.warehouseComplete) {
    return showWarehouseChoice();
  }
  if (state.sceneId === "navyYardAccess" && state.secureAccessChecks.length === content.secureAccessDispatch.checks.length && !state.flags.secureAccessComplete) {
    if (state.secureAccessTaskChecks.length === content.secureAccessDispatch.taskChecks.length) return showSecureAccessChoice();
    if (!state.flags.secureAccessRoomReached) return showSecureAccessWorkStart();
  }
  if (state.sceneId === "warrantyReturn" && state.callbackCleanupChecks.length === content.callbackCleanupDispatch.checks.length && !state.flags.callbackCleanupComplete) {
    return showCallbackCleanupChoice();
  }
  if (state.sceneId === "executiveHandoff" && state.handoffChecks.length === content.handoffDispatch.checks.length && !state.flags.handoffComplete) {
    return showHandoffChoice();
  }
  if (state.sceneId === "systemsService" && state.systemsChecks.length === content.systemsDispatch.checks.length && !state.flags.systemsComplete) {
    return showSystemsChoice();
  }
  if (state.sceneId === "burlingtonRetrofitWalkdown" && state.retrofitWalkdownChecks.length === content.retrofitWalkdownDispatch.checks.length && !state.flags.retrofitWalkdownComplete) {
    return showRetrofitWalkdownChoice();
  }
  if (state.sceneId === "burlingtonRetrofitWalkdown" && state.retrofitInstallChecks.length === getRetrofitInstallChecks().length && state.flags.retrofitInstallStarted && !state.flags.retrofitInstallComplete) {
    return showRetrofitInstallChoice();
  }
}

function makeButton(label, onClick, className = "primary-button") {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = label;
  button.addEventListener("click", onClick);
  return button;
}

function isModalUtilityAction(action = {}) {
  const label = String(action.label || "").trim().toLowerCase();
  if (action.className === "text-button") return true;
  return /^(back\b|back to\b|close$|not yet$|return to\b|keep current career$)/.test(label);
}

function hasCompetingModalChoices(actions = []) {
  return actions.filter((action = {}) => {
    if (action.primary || isModalUtilityAction(action)) return false;
    if (action.className && !["secondary-button", "choice-button"].includes(action.className)) return false;
    return Boolean(action.label);
  }).length > 1;
}

function getModalActionClass(action = {}, actions = []) {
  if (action.className) return action.className;
  if (action.primary) return "primary-button";
  // Gold means commit/continue. Equal-weight tradeoffs stay neutral so the UI does not imply a correct answer.
  return hasCompetingModalChoices(actions) ? "choice-button" : "primary-button";
}

function getModalListRowClass(label = "", detail = "") {
  const normalizedLabel = label.toLowerCase();
  const normalizedDetail = detail.toLowerCase();
  const text = `${label} ${detail}`.toLowerCase();
  const classes = ["modal-row"];
  const noActivePressure = /no open|ready: no active|no daily pressure|no mapped routes are carrying/.test(normalizedDetail);
  if (/next task|next step|what happens next|current work|current area/.test(text)) classes.push("modal-row-priority");
  if (/why this is different today|task modifiers|pressure on this action|condition pressure/.test(text)) classes.push("modal-row-pressure");
  if (normalizedLabel === "today's condition" && !noActivePressure) classes.push("modal-row-pressure");
  if (/callback|return-trip|consequence|risk|inherited/.test(text) && !noActivePressure) classes.push("modal-row-risk");
  if (/locked|missing/.test(text) || (/required/.test(normalizedLabel) && /missing/.test(normalizedDetail))) classes.push("modal-row-warning");
  if (/required prep|required tools|recommended prep|recommended tools|prep\b|tools/.test(text)) classes.push("modal-row-prep");
  if (/route status|fast travel|driven before|travel cost|route memory/.test(text)) classes.push("modal-row-route");
  return classes.join(" ");
}

function getModalListRowMarkup(row = {}) {
  return `<li class="${getModalListRowClass(row.label, row.detail)}"><strong>${escapeHtml(row.label || "")}</strong><span>${escapeHtml(row.detail || "")}</span></li>`;
}

function getModalListRowsMarkup(rows = []) {
  return rows.map(getModalListRowMarkup).join("");
}

function showModal({ kicker = "Field Update", title, body, actions }) {
  state.modalOpen = true;
  elements.modalKicker.textContent = kicker;
  elements.modalTitle.textContent = title;
  elements.modalBody.innerHTML = body;
  const modalActions = Array.isArray(actions) ? actions : [];
  elements.modalActions.replaceChildren(
    ...modalActions.map((action) => makeButton(action.label, () => {
      if (action.close !== false) closeModal();
      action.onClick?.();
    }, getModalActionClass(action, modalActions))),
  );
  elements.modalBackdrop.classList.remove("hidden");
  saveGame();
}

function closeModal() {
  state.modalOpen = false;
  elements.modalBackdrop.classList.add("hidden");
  elements.scene.focus();
}

function addLog(message) {
  state.log.unshift(message);
  state.log = state.log.slice(0, 10);
}
