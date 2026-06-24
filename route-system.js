// Route helpers keep travel choices, route history, fast travel, and route-summary modals together.
// They depend on app.js globals and are loaded before bootstrap starts the game.
function getRouteChoices(route) {
  return route?.choices || [];
}

function getRouteChoice(route, choiceId) {
  return getRouteChoices(route).find((choice) => choice.id === choiceId) || null;
}

function getLastRouteChoiceLabel(route) {
  const choiceId = state.flags.routeChoiceHistory?.[route.id];
  return getRouteChoice(route, choiceId)?.label || "";
}

function getTravelResultDeltaText(result) {
  const deltas = [];
  if (result.energyDelta) deltas.push(`${formatSignedNumber(result.energyDelta)} energy`);
  if (result.cashDelta) deltas.push(`${result.cashDelta > 0 ? "+" : "-"}${formatCash(Math.abs(result.cashDelta))}`);
  if (result.burnoutDelta) deltas.push(`${formatSignedNumber(result.burnoutDelta)} burnout`);
  return deltas.length ? deltas.join(", ") : "no stat change";
}

function getTravelRiskResultText(result) {
  if (!result?.riskLabel) return "";
  const rollText = Number.isFinite(result.riskRoll) && Number.isFinite(result.riskChance)
    ? ` Rolled ${formatChance(result.riskRoll)} against ${formatChance(result.riskChance)}.`
    : "";
  const outcome = result.riskHit ? "hit" : "held";
  return ` Risk: ${result.riskLabel} ${outcome}.${rollText}${result.riskDetail ? ` ${result.riskDetail}` : ""}`;
}

function getTravelResultText(result) {
  if (!result) return "";
  const arrival = result.arrivalClock ? ` Arrived ${result.arrivalClock}.` : "";
  const count = result.travelCount ? ` Route driven ${result.travelCount} time${result.travelCount === 1 ? "" : "s"}.` : "";
  return `${result.mode || "Drive"}: ${getTravelResultDeltaText(result)}.${arrival}${count}${getTravelRiskResultText(result)}`;
}

function getLastTravelResult(route) {
  return state.flags.travelResults?.[route.id] || null;
}

function getRouteTravelCostRisk(route) {
  const choices = getRouteChoices(route);
  const costs = [];
  if (route.arrivalTime) costs.push(`arrival ${route.arrivalTime}`);
  if (choices.length) {
    const choiceImpacts = choices.map((choice) => {
      const impacts = [];
      if (choice.energyDelta) impacts.push(`${choice.energyDelta > 0 ? "+" : ""}${choice.energyDelta} energy`);
      if (choice.cashDelta) impacts.push(`${choice.cashDelta > 0 ? "+" : "-"}$${Math.abs(choice.cashDelta)}`);
      if (choice.burnoutDelta) impacts.push(`${choice.burnoutDelta > 0 ? "+" : ""}${choice.burnoutDelta} burnout`);
      if (choice.arrivalTime && choice.arrivalTime !== route.arrivalTime) impacts.push(`arrival ${choice.arrivalTime}`);
      if (choice.riskRoll?.chance) impacts.push(`${formatChance(choice.riskRoll.chance)} ${choice.riskRoll.label || "risk"}`);
      return `${choice.label}${impacts.length ? ` (${impacts.join(", ")})` : ""}`;
    });
    costs.push(`choices: ${choiceImpacts.join("; ")}`);
  } else {
    costs.push(route.fastTravelEligible ? "standard drive; fast travel can unlock after route history" : "standard drive");
  }
  if (route.fastTravelEligible) costs.push(`fast travel cost ${getFastTravelEnergyCost(route)} energy`);
  return costs.join("; ");
}

function getRouteArrivalClock(route, routeChoice = null) {
  const arrivalTime = routeChoice?.arrivalTime || route?.arrivalTime;
  if (!arrivalTime) return null;
  if (/^[A-Z]{3} /.test(arrivalTime)) return arrivalTime;
  return `${state.clock.slice(0, 3)} ${arrivalTime}`;
}

function getRouteLineMarkup(route) {
  return `<div class="route-line"><span>${escapeHtml(route.fromLabel)}</span><i></i><span>${escapeHtml(route.toLabel)}</span></div>`;
}

function recordRouteTravel(route, routeChoice = null) {
  state.flags.routeHistory ||= {};
  state.flags.routeHistory[route.id] = (state.flags.routeHistory[route.id] || 0) + 1;
  state.flags.lastRouteId = route.id;
  if (routeChoice?.id) {
    state.flags.routeChoiceHistory ||= {};
    state.flags.routeChoiceHistory[route.id] = routeChoice.id;
  }
  if (route.toAreaId) state.flags.currentAreaId = route.toAreaId;
}

function recordTravelResult(route, routeChoice = null, { fastTravel = false, before = {}, routeOutcome = null } = {}) {
  const result = {
    routeId: route.id,
    destination: route.toLabel,
    mode: fastTravel ? "Fast travel" : routeChoice?.label || "Standard drive",
    choiceId: routeChoice?.id || "",
    energyDelta: state.energy - (before.energy ?? state.energy),
    cashDelta: state.cash - (before.cash ?? state.cash),
    burnoutDelta: state.burnout - (before.burnout ?? state.burnout),
    startClock: before.clock || "",
    arrivalClock: state.clock,
    travelCount: getRouteTravelCount(route.id),
    riskLabel: routeOutcome?.risk?.label || "",
    riskHit: Boolean(routeOutcome?.risk?.hit),
    riskRoll: routeOutcome?.risk?.roll ?? null,
    riskChance: routeOutcome?.risk?.chance ?? null,
    riskDetail: routeOutcome?.risk?.detail || "",
  };
  state.flags.travelResults ||= {};
  state.flags.travelResults[route.id] = result;
  state.flags.travelResultLog ||= [];
  state.flags.travelResultLog.push(result);
  state.flags.travelResultLog = state.flags.travelResultLog.slice(-8);
  addLog(`Travel result recorded for ${route.toLabel}: ${getTravelResultDeltaText(result)}.`);
}

function applyRouteTravelEffect(effect = {}) {
  if (effect.energyDelta) changeEnergy(effect.energyDelta);
  if (effect.cashDelta) state.cash += effect.cashDelta;
  if (effect.burnoutDelta) state.burnout = Math.max(0, state.burnout + effect.burnoutDelta);
}

function resolveRouteChoiceRisk(route, routeChoice) {
  const risk = routeChoice?.riskRoll;
  if (!risk?.chance) return null;
  const roll = Math.random();
  const hit = roll < risk.chance;
  const outcome = hit ? risk.failure || {} : risk.success || {};
  applyRouteTravelEffect(outcome);
  addLog(outcome.log || `${risk.label || routeChoice.label} ${hit ? "hit" : "held"} on the ${route.toLabel} route.`);
  return {
    label: risk.label || "Route risk",
    chance: risk.chance,
    roll,
    hit,
    detail: outcome.detail || "",
  };
}

function applyRouteChoice(route, routeChoice) {
  if (!routeChoice) return {};
  applyRouteTravelEffect(routeChoice);
  addLog(routeChoice.log || `${routeChoice.label} selected for ${route.toLabel}.`);
  return {
    risk: resolveRouteChoiceRisk(route, routeChoice),
  };
}

function applyFastTravelRoute(route) {
  const energyCost = getFastTravelEnergyCost(route);
  changeEnergy(-energyCost);
  state.flags.fastTravelHistory ||= {};
  state.flags.fastTravelHistory[route.id] = (state.flags.fastTravelHistory[route.id] || 0) + 1;
  state.flags.lastFastTravelRouteId = route.id;
  addLog(`Used the known ${route.toLabel} route. Fast travel cost ${energyCost} energy.`);
}

function travelRoute(routeId, { beforeTravel, afterTravel, routeChoice, fastTravel = false } = {}) {
  const route = getWorldRoute(routeId);
  if (!route) return notify(`Route ${routeId} is not mapped yet.`);
  beforeTravel?.(route);
  const before = {
    energy: state.energy,
    cash: state.cash,
    burnout: state.burnout,
    clock: state.clock,
  };
  if (fastTravel) applyFastTravelRoute(route);
  const routeOutcome = applyRouteChoice(route, routeChoice);
  if (route.packedLunchContext) consumePackedLunch(route.packedLunchContext);
  const arrivalClock = getRouteArrivalClock(route, routeChoice);
  if (arrivalClock) setClock(arrivalClock);
  if (route.arrivalLog) addLog(route.arrivalLog);
  recordRouteTravel(route, routeChoice);
  recordTravelResult(route, routeChoice, { fastTravel, before, routeOutcome });
  if (afterTravel) return afterTravel(route);
  if (route.destinationSceneId) return enterScene(route.destinationSceneId);
  return render();
}

function getRouteChoiceImpactMarkup(choice) {
  const impacts = [];
  if (choice.arrivalTime) impacts.push(`Arrive ${choice.arrivalTime}`);
  if (choice.energyDelta) impacts.push(`${choice.energyDelta > 0 ? "+" : ""}${choice.energyDelta} energy`);
  if (choice.cashDelta) impacts.push(`${choice.cashDelta > 0 ? "+" : "-"}$${Math.abs(choice.cashDelta)}`);
  if (choice.burnoutDelta) impacts.push(`${choice.burnoutDelta > 0 ? "+" : ""}${choice.burnoutDelta} burnout`);
  if (choice.riskRoll?.chance) impacts.push(`${formatChance(choice.riskRoll.chance)} ${choice.riskRoll.label || "risk"}`);
  return impacts.length ? ` <em>${escapeHtml(impacts.join(" / "))}</em>` : "";
}

function showRouteChoiceModal({ routeId, dispatchEstimate, extraBody = "", actionLabel, beforeTravel, afterTravel }) {
  const route = getWorldRoute(routeId);
  if (!route) return notify(`Route ${routeId} is not mapped yet.`);
  const choices = getRouteChoices(route);
  if (!choices.length) {
    return showTravelRouteModal({ routeId, dispatchEstimate, extraBody, actionLabel, beforeTravel, afterTravel });
  }
  showModal({
    kicker: "Route Choice",
    title: `${route.fromLabel} -> ${route.toLabel}`,
    body: `
      ${dispatchEstimate ? `<p><strong>Work-order estimate:</strong> ${dispatchEstimate}</p>` : ""}
      ${extraBody}
      ${getRouteLineMarkup(route)}
      <ul class="modal-list">
        ${choices.map((choice) => `
          <li>
            <strong>${escapeHtml(choice.label)}${getRouteChoiceImpactMarkup(choice)}</strong>
            <span>${escapeHtml(choice.detail)}</span>
          </li>
        `).join("")}
      </ul>
    `,
    actions: choices.map((choice, index) => ({
      label: choice.label,
      className: index === 0 ? undefined : "secondary-button",
      onClick: () => showTravelRouteModal({
        routeId,
        dispatchEstimate,
        extraBody: `${extraBody}<p class="muted"><strong>Route approach:</strong> ${escapeHtml(choice.label)}. ${escapeHtml(choice.detail)}</p>`,
        actionLabel,
        beforeTravel,
        afterTravel,
        routeChoice: choice,
      }),
    })),
  });
}

function showTravelRouteModal({ routeId, dispatchEstimate, extraBody = "", actionLabel, beforeTravel, afterTravel, routeChoice = null, fastTravel = false }) {
  const route = getWorldRoute(routeId);
  if (!route) return notify(`Route ${routeId} is not mapped yet.`);
  const fastTravelCost = getFastTravelEnergyCost(route);
  showModal({
    kicker: fastTravel ? "Fast Travel" : "Route Summary",
    title: `${route.fromLabel} -> ${route.toLabel}`,
    body: `
      ${dispatchEstimate ? `<p><strong>Work-order estimate:</strong> ${dispatchEstimate}</p>` : ""}
      ${fastTravel ? `<p class="expense"><strong>Fast travel:</strong> Known route shortcut, -${fastTravelCost} energy.</p>` : ""}
      ${extraBody}
      ${getRouteLineMarkup(route)}
      <div class="results-grid">
        <span>Route status</span><strong>${escapeHtml(getRouteStatus(route))}</strong>
        <span>Travel cost / risk</span><strong>${escapeHtml(getRouteTravelCostRisk(route))}</strong>
        <span>Driven before</span><strong>${escapeHtml(getRouteDrivenText(route))}</strong>
        <span>Fast travel</span><strong>${escapeHtml(getRouteFastTravelText(route))}</strong>
      </div>
    `,
    actions: [{
      label: actionLabel || (fastTravel ? `Fast Travel to ${route.toLabel}` : route.actionLabel || `Drive to ${route.toLabel}`),
      onClick: () => travelRoute(routeId, { beforeTravel, afterTravel, routeChoice, fastTravel }),
    }],
  });
}
