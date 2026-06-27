// Consequence helpers own callback debt, return-trip risk, route pressure, and closeout departure summaries.
// Job scenes record consequences; this layer makes them readable across van, map, portal, and career surfaces.
const JOB_SITE_CLOSEOUT_HISTORY_LIMIT = 5;

function recordReturnTripRisk(riskId, detail) {
  state.flags.returnTripRisks ||= {};
  state.flags.returnTripRisks[riskId] = { status: "open", ...detail };
  if (state.flags.resolvedReturnTripRisks?.[riskId]) delete state.flags.resolvedReturnTripRisks[riskId];
}

function resolveReturnTripRisk(riskId, resolution = {}) {
  const existing = state.flags.returnTripRisks?.[riskId];
  if (!existing) return;
  delete state.flags.returnTripRisks[riskId];
  state.flags.resolvedReturnTripRisks ||= {};
  state.flags.resolvedReturnTripRisks[riskId] = {
    source: resolution.source || existing.source || "Return-trip risk",
    detail: existing.detail || "A weak closeout was carried on the ledger.",
    resolution: resolution.resolution || "Resolved by later field work.",
    resolvedAt: state.clock,
    status: "resolved",
  };
}

function getReturnTripRiskEntries() {
  return Object.entries(state.flags.returnTripRisks || {})
    .map(([id, risk]) => ({ id, status: risk.status || "open", ...risk }));
}

function getResolvedReturnTripRiskEntries() {
  return Object.entries(state.flags.resolvedReturnTripRisks || {})
    .map(([id, risk]) => ({ id, status: "resolved", ...risk }));
}

function getReturnTripRiskAffectedWork(riskId) {
  if (riskId === "usedTemporaryAdapterPermanently") return "future Center City service or warranty work";
  if (riskId === "centerCityCartPressure") return "future Center City cart service or warranty work";
  if (riskId === "conshohockenServiceRoomPressure") return "future Conshohocken service and Josh callback cleanup";
  if (riskId === "navyYardRackUpdate") return "future Navy Yard support and warranty routing";
  if (riskId === "southPhillySpeakerTermination") return "commissioning follow-up and warranty return pressure";
  if (riskId === "systemsQuickReboot") return "future systems service or warranty return pressure";
  if (riskId === "burlington-retrofit-install") return "Burlington retrofit install and future service";
  if (riskId?.startsWith("exhaustion-")) return "the next return trip tied to this tired closeout";
  return "future dispatch-board routing";
}

function getConsequenceStatusLabel(status = "open") {
  if (status === "resolved") return "Resolved";
  if (status === "inherited") return "Inherited";
  if (status === "documented") return "Documented";
  if (status === "controlled") return "Controlled";
  if (status === "protected") return "Protected";
  return "Open";
}

function getConsequenceLedgerEntries({ includeResolved = false } = {}) {
  const entries = [];
  const openCallbacks = getUnresolvedCallbackCount();
  if (openCallbacks > 0) {
    entries.push({
      id: "callback-debt",
      source: "Callback ledger",
      cause: `${openCallbacks} unresolved callback${openCallbacks === 1 ? "" : "s"} remain after closeout choices.`,
      status: "open",
      affects: "dispatch routing, access friction, and warranty return pressure",
      detail: "Fast or strained closeouts can stay on the board until a later job resolves them.",
    });
  }
  getReturnTripRiskEntries().forEach((risk) => {
    entries.push({
      id: risk.id,
      source: risk.source || "Return-trip risk",
      cause: risk.cause || risk.detail || "A weak closeout is still on the ledger.",
      status: risk.status || "open",
      affects: risk.affects || getReturnTripRiskAffectedWork(risk.id),
      detail: risk.detail || "A weak closeout is still on the ledger.",
    });
  });
  if (includeResolved) {
    getResolvedReturnTripRiskEntries().forEach((risk) => {
      entries.push({
        id: risk.id,
        source: risk.source || "Resolved return-trip risk",
        cause: risk.detail || "A prior risk was cleared by later field work.",
        status: "resolved",
        affects: risk.affects || getReturnTripRiskAffectedWork(risk.id),
        detail: risk.resolution || "Resolved by later field work.",
      });
    });
    const hasResolvedBurlingtonRisk = Boolean(state.flags.resolvedReturnTripRisks?.["burlington-retrofit-install"]);
    if (state.flags.retrofitInstallRiskResolved && !hasResolvedBurlingtonRisk) {
      entries.push({
        id: "retrofit-install-risk-resolved",
        source: "Burlington County Retrofit Install",
        cause: "Inherited pathway risk from the walkdown was handled during install closeout.",
        status: "resolved",
        affects: "Burlington future service",
        detail: "Record/as-built notes cleared the inherited pathway risk.",
      });
    } else if (state.flags.retrofitInstallRiskInherited) {
      entries.push({
        id: "retrofit-install-risk-inherited",
        source: "Burlington County Retrofit Install",
        cause: "Install closeout left the pathway record weak.",
        status: "inherited",
        affects: "Burlington future service",
        detail: "Future service inherits a thinner record of the actual pathway.",
      });
    }
    if (state.flags.commissioningRiskDocumented && !state.flags.commissioningCallbackRiskAdded) {
      entries.push({
        id: "commissioning-risk-controlled",
        source: content.commissioningDispatch.title,
        cause: "Speaker-path risk was documented before it became a surprise callback.",
        status: "controlled",
        affects: "South Philadelphia commissioning follow-up",
        detail: "Closeout made the technical risk visible instead of hiding it.",
      });
    }
    if (state.flags.secureAccessComplete && state.flags.secureAccessTaskStrained && state.flags.secureAccessApproach !== "absorb") {
      entries.push({
        id: "secure-access-task-documented",
        source: content.secureAccessDispatch.title,
        cause: "A strained rack task was documented in closeout.",
        status: "documented",
        affects: getReturnTripRiskAffectedWork("navyYardRackUpdate"),
        detail: "Documentation keeps the rack strain from becoming hidden return-trip debt.",
      });
    }
    if (state.flags.systemsComplete && state.flags.systemsApproach !== "reboot") {
      entries.push({
        id: "systems-risk-documented",
        source: content.systemsDispatch.title,
        cause: "The room-offline cause was documented instead of flattened into a reboot.",
        status: "documented",
        affects: getReturnTripRiskAffectedWork("systemsQuickReboot"),
        detail: "Future service starts from the mismatch note instead of the old ticket.",
      });
    }
  }
  return entries;
}

function hasConsequenceReviewInfo() {
  return getJobSiteCloseoutHistory().length > 0
    || getConsequenceLedgerEntries({ includeResolved: true }).length > 0;
}

function getConsequenceReviewMenuText() {
  const openEntries = getConsequenceLedgerEntries();
  const history = getJobSiteCloseoutHistory();
  const summary = history[0];
  if (openEntries.length && summary) {
    return `${openEntries.length} open consequence${openEntries.length === 1 ? "" : "s"} plus ${history.length} recent closeout record${history.length === 1 ? "" : "s"}.`;
  }
  if (openEntries.length) {
    return `${openEntries.length} open callback or return-trip consequence${openEntries.length === 1 ? "" : "s"} affecting routes or prep.`;
  }
  if (summary) {
    return `${history.length} recent closeout record${history.length === 1 ? "" : "s"} saved. Last: ${summary.source || "current job"}.`;
  }
  return "No job closeout or open consequence has been recorded yet.";
}

function getConsequenceLedgerMarkup({ includeResolved = false, emptyMessage = "No consequence ledger entries are active right now." } = {}) {
  const entries = getConsequenceLedgerEntries({ includeResolved });
  if (!entries.length) return `<p class="muted">${emptyMessage}</p>`;
  return `
    <ul class="modal-list">
      ${entries.map((entry) => `
        <li>
          <strong>${escapeHtml(`${getConsequenceStatusLabel(entry.status)} - ${entry.source}`)}</strong>
          <span>${escapeHtml(`Cause: ${entry.cause} Affects: ${entry.affects}. Result: ${entry.detail}`)}</span>
        </li>
      `).join("")}
    </ul>
  `;
}

function getCloseoutConsequenceMarkup(entries = []) {
  if (!entries.length) return "";
  return `
    <p><strong>Closeout consequence:</strong></p>
    <ul class="modal-list">
      ${entries.map((entry) => `
        <li>
          <strong>${escapeHtml(`${getConsequenceStatusLabel(entry.status)} - ${entry.source}`)}</strong>
          <span>${escapeHtml(`Because: ${entry.cause} Future effect: ${entry.affects}. ${entry.detail}`)}</span>
        </li>
      `).join("")}
    </ul>
  `;
}

function normalizeCloseoutSummaryEntry(entry = {}) {
  return {
    id: entry.id || "",
    source: entry.source || "Closeout",
    status: entry.status || "documented",
    cause: entry.cause || entry.detail || "Closeout result saved.",
    affects: entry.affects || "future field work",
    detail: entry.detail || "The closeout result is saved.",
  };
}

function normalizeJobSiteCloseoutSummary(summary = {}) {
  return {
    source: summary.source || "Current job",
    result: summary.result || "",
    sceneId: summary.sceneId || "",
    areaId: summary.areaId || "",
    clock: summary.clock || state.clock,
    before: summary.before || null,
    after: summary.after || null,
    consequences: (summary.consequences || []).map(normalizeCloseoutSummaryEntry),
  };
}

function getCloseoutSummaryKey(summary = {}) {
  return [
    summary.source || "",
    summary.result || "",
    summary.clock || "",
    summary.sceneId || "",
  ].join("|");
}

function getJobSiteCloseoutHistory() {
  const records = [];
  const seen = new Set();
  const addRecord = (summary) => {
    if (!summary || typeof summary !== "object") return;
    const normalized = normalizeJobSiteCloseoutSummary(summary);
    const key = getCloseoutSummaryKey(normalized);
    if (seen.has(key)) return;
    seen.add(key);
    records.push(normalized);
  };
  addRecord(state.flags.lastJobSiteCloseoutSummary);
  (Array.isArray(state.flags.jobSiteCloseoutHistory) ? state.flags.jobSiteCloseoutHistory : [])
    .forEach(addRecord);
  return records.slice(0, JOB_SITE_CLOSEOUT_HISTORY_LIMIT);
}

function recordJobSiteCloseoutSummary({ source = "Current job", result = "", before = null, consequences = [] } = {}) {
  const previousHistory = getJobSiteCloseoutHistory();
  const summary = normalizeJobSiteCloseoutSummary({
    source,
    result,
    sceneId: state.sceneId,
    areaId: state.flags.currentAreaId || "",
    clock: state.clock,
    before: before || null,
    after: getTrackedStateSnapshot(),
    consequences: consequences.map(normalizeCloseoutSummaryEntry),
  });
  const summaryKey = getCloseoutSummaryKey(summary);
  state.flags.lastJobSiteCloseoutSummary = summary;
  state.flags.jobSiteCloseoutHistory = [
    summary,
    ...previousHistory.filter((item) => getCloseoutSummaryKey(item) !== summaryKey),
  ].slice(0, JOB_SITE_CLOSEOUT_HISTORY_LIMIT);
}

function getLastJobSiteCloseoutReviewMarkup() {
  const summary = getJobSiteCloseoutHistory()[0];
  if (!summary) return `<p class="muted">No job-site closeout has been saved yet.</p>`;
  const area = getWorldArea(summary.areaId);
  const consequenceEntries = (summary.consequences || []).map(normalizeCloseoutSummaryEntry);
  return `
    <div class="results-grid">
      <span>Job</span><strong>${escapeHtml(summary.source || "Current job")}</strong>
      <span>Result</span><strong>${escapeHtml(summary.result || "Closeout result saved")}</strong>
      <span>Area</span><strong>${escapeHtml(area?.label || summary.areaId || "Job site")}</strong>
      <span>Clock</span><strong>${escapeHtml(summary.clock || state.clock)}</strong>
    </div>
    ${summary.before ? `
      <h3>What Changed</h3>
      ${getTrackedStateDeltaMarkup(summary.before, summary.after || getTrackedStateSnapshot())}
    ` : ""}
    <h3>Saved Consequence Record</h3>
    ${getDepartureConsequenceListMarkup(consequenceEntries, "This closeout saved no named callback or return-trip consequence.")}
  `;
}

function getRecentJobSiteCloseoutHistoryMarkup() {
  const previous = getJobSiteCloseoutHistory().slice(1);
  if (!previous.length) return `<p class="muted">No earlier job-site closeouts are saved yet.</p>`;
  return `
    <ul class="modal-list">
      ${previous.map((summary) => {
        const consequenceText = summary.consequences?.length
          ? summary.consequences.map((entry) => `${getConsequenceStatusLabel(entry.status)}: ${entry.detail}`).join(" ")
          : "No named consequence saved.";
        return `
          <li>
            <strong>${escapeHtml(`${summary.source || "Current job"} - ${summary.result || "Closeout saved"}`)}</strong>
            <span>${escapeHtml(`${summary.clock || "Saved earlier"}. ${consequenceText}`)}</span>
          </li>
        `;
      }).join("")}
    </ul>
  `;
}

function normalizeCloseoutSource(value = "") {
  return `${value}`.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function getReturnPortalSourceAliases(portal) {
  const aliases = [portal?.returnSource, portal?.label];
  const portalAliases = {
    centerCityConferenceRoomToShop: ["Two Quick Carts"],
    serviceOfficeToShop: [content.serviceDispatch?.title],
    conshohockenFollowupToShop: [content.followupDispatch?.title],
    universitySurveyToShop: [content.surveyDispatch?.title],
    southPhillyCommissioningToShop: [content.commissioningDispatch?.title],
    navyYardAccessToShop: [content.secureAccessDispatch?.title],
    warrantyReturnToShop: [content.callbackCleanupDispatch?.title],
    executiveHandoffToShop: [content.handoffDispatch?.title],
    systemsServiceToShop: [content.systemsDispatch?.title],
    burlingtonRetrofitWalkdownToShop: [content.retrofitWalkdownDispatch?.title],
    burlingtonRetrofitInstallToShop: ["Burlington County Retrofit Install"],
  };
  return [...aliases, ...(portalAliases[portal?.id] || [])]
    .filter(Boolean)
    .map(normalizeCloseoutSource)
    .filter(Boolean);
}

function isCloseoutSourceForPortal(source, portal) {
  const normalizedSource = normalizeCloseoutSource(source);
  if (!normalizedSource) return false;
  return getReturnPortalSourceAliases(portal).includes(normalizedSource);
}

function getLastJobSiteCloseoutSummaryForPortal(portal) {
  const summary = state.flags.lastJobSiteCloseoutSummary;
  if (!summary || !isCloseoutSourceForPortal(summary.source, portal)) return null;
  return summary;
}

function getReturnPortalResultFlagKey(portal) {
  return {
    centerCityConferenceRoomToShop: "finishChoice",
    serviceOfficeToShop: "serviceApproach",
    conshohockenFollowupToShop: "conshohockenFollowupApproach",
    universitySurveyToShop: "surveyApproach",
    southPhillyCommissioningToShop: "commissioningApproach",
    navyYardAccessToShop: "secureAccessApproach",
    warrantyReturnToShop: "callbackCleanupApproach",
    executiveHandoffToShop: "handoffApproach",
    systemsServiceToShop: "systemsApproach",
    burlingtonRetrofitWalkdownToShop: "retrofitWalkdownApproach",
    burlingtonRetrofitInstallToShop: "retrofitInstallApproach",
  }[portal?.id] || "";
}

function getReturnPortalSavedResultText(portal) {
  const flagKey = getReturnPortalResultFlagKey(portal);
  return flagKey ? getCompletedCloseoutPathResult(flagKey) : "";
}

function getConsequenceEntryKey(entry = {}) {
  return [
    entry.id || "",
    normalizeCloseoutSource(entry.source),
    entry.status || "",
    entry.detail || "",
  ].join("|");
}

function getReturnPortalCurrentConsequenceEntries(portal, summary) {
  const summaryEntries = (summary?.consequences || []).map(normalizeCloseoutSummaryEntry);
  if (summaryEntries.length) return summaryEntries;
  return getConsequenceLedgerEntries({ includeResolved: true })
    .filter((entry) => isCloseoutSourceForPortal(entry.source, portal))
    .map(normalizeCloseoutSummaryEntry);
}

function getReturnPortalOpenConsequenceEntries(currentEntries = []) {
  const currentKeys = new Set(currentEntries.map(getConsequenceEntryKey));
  return getConsequenceLedgerEntries()
    .map(normalizeCloseoutSummaryEntry)
    .filter((entry) => !currentKeys.has(getConsequenceEntryKey(entry)));
}

function getReturnPortalRiskSummaryText() {
  const callbackCount = getUnresolvedCallbackCount();
  const riskCount = getReturnTripRiskEntries().length;
  const parts = [
    callbackCount ? `${callbackCount} callback${callbackCount === 1 ? "" : "s"}` : "",
    riskCount ? `${riskCount} return-trip risk${riskCount === 1 ? "" : "s"}` : "",
  ].filter(Boolean);
  return parts.length ? `Carrying ${parts.join(" and ")} back to the shop` : "No open callback or return-trip risk";
}

function getReturnPortalNextStepText() {
  if (state.flags.serviceCallbackPending && !state.flags.serviceCallbackResolved) return "Return to the shop, close out the shift, then talk to Josh about the callback.";
  return "Return to the shop and close out the workday.";
}

function getDepartureConsequenceListMarkup(entries, emptyMessage) {
  if (!entries.length) return `<p class="muted">${escapeHtml(emptyMessage)}</p>`;
  return `
    <ul class="modal-list">
      ${entries.map((entry) => `
        <li>
          <strong>${escapeHtml(`${getConsequenceStatusLabel(entry.status)} - ${entry.source}`)}</strong>
          <span>${escapeHtml(`Because: ${entry.cause} Affects: ${entry.affects}. ${entry.detail}`)}</span>
        </li>
      `).join("")}
    </ul>
  `;
}

function getReturnPortalDepartureMarkup(portal) {
  if (portal?.kind !== "returnRoute") return "";
  const summary = getLastJobSiteCloseoutSummaryForPortal(portal);
  const currentEntries = getReturnPortalCurrentConsequenceEntries(portal, summary);
  const openEntries = getReturnPortalOpenConsequenceEntries(currentEntries);
  const resultText = summary?.result || getReturnPortalSavedResultText(portal) || "Closeout result saved";
  return `
    <h3>Before You Leave</h3>
    <div class="results-grid">
      <span>Closeout saved</span><strong>${escapeHtml(summary?.source || portal.returnSource || portal.label || "Current job")}</strong>
      <span>Result</span><strong>${escapeHtml(resultText)}</strong>
      <span>Risk remaining</span><strong>${escapeHtml(getReturnPortalRiskSummaryText())}</strong>
      <span>Next at shop</span><strong>${escapeHtml(getReturnPortalNextStepText())}</strong>
    </div>
    ${summary?.before ? `
      <h3>What Changed</h3>
      ${getTrackedStateDeltaMarkup(summary.before, summary.after || getTrackedStateSnapshot())}
    ` : ""}
    <h3>Current Closeout Effect</h3>
    ${getDepartureConsequenceListMarkup(currentEntries, "This closeout has no named callback or return-trip consequence recorded.")}
    <h3>Risk Carried Back</h3>
    ${getDepartureConsequenceListMarkup(openEntries, "No open callback or return-trip risk is leaving with you.")}
  `;
}

function getReturnTripRiskSummaryText(risk) {
  return `${risk.source || "Return-trip risk"}: ${risk.detail || "A weak closeout is still on the ledger."} Affects ${risk.affects || getReturnTripRiskAffectedWork(risk.id)}.`;
}

function getOpenReturnTripRiskSummary() {
  const risks = getReturnTripRiskEntries();
  if (!risks.length) return "";
  return risks.map(getReturnTripRiskSummaryText).join(" ");
}

function getReturnTripRiskRowsMarkup() {
  return getConsequenceLedgerEntries()
    .filter((entry) => entry.id !== "callback-debt")
    .map((entry) => `
      <li>
        <strong>${escapeHtml(`${getConsequenceStatusLabel(entry.status)} - ${entry.source}`)}</strong>
        <span>${escapeHtml(`Cause: ${entry.cause} Affects: ${entry.affects}. Result: ${entry.detail}`)}</span>
      </li>
    `).join("");
}

function getConsequenceRouteIds(entry) {
  if (!entry) return [];
  const routeMap = {
    "callback-debt": ["warrantyReturn", "conshohockenService"],
    usedTemporaryAdapterPermanently: ["centerCityTutorial"],
    centerCityCartPressure: ["centerCityTutorial"],
    conshohockenServiceRoomPressure: ["conshohockenService"],
    navyYardRackUpdate: ["navyYardAccess"],
    southPhillySpeakerTermination: ["southPhillyCommissioning", "warrantyReturn"],
    systemsQuickReboot: ["systemsService", "warrantyReturn"],
    "burlington-retrofit-install": ["burlingtonRetrofitWalkdown"],
    "retrofit-install-risk-inherited": ["burlingtonRetrofitWalkdown"],
    "retrofit-install-risk-resolved": ["burlingtonRetrofitWalkdown"],
  };
  if (routeMap[entry.id]) return routeMap[entry.id];
  if (entry.id?.startsWith("exhaustion-")) return [state.flags.lastRouteId || getCurrentDispatchRouteId()].filter(Boolean);
  return [];
}

function getConsequenceRouteImpactEntries({ includeResolved = false } = {}) {
  return getConsequenceLedgerEntries({ includeResolved })
    .flatMap((entry) => getConsequenceRouteIds(entry).map((routeId) => ({ ...entry, routeId })))
    .filter((entry) => getWorldRoute(entry.routeId));
}

function getRouteConsequenceImpactEntries(routeId, options = {}) {
  return getConsequenceRouteImpactEntries(options)
    .filter((entry) => entry.routeId === routeId);
}

function routeHasConsequencePressure(route) {
  return Boolean(route && getRouteConsequenceImpactEntries(route.id).length);
}

function getRouteConsequencePressureText(route) {
  const entries = route ? getRouteConsequenceImpactEntries(route.id) : [];
  if (!entries.length) return "";
  return entries.map((entry) => `${getConsequenceStatusLabel(entry.status)} ${entry.source}: ${entry.detail} Affects: ${entry.affects}.`).join(" ");
}

function getConsequenceRouteImpactMarkup() {
  const impacts = getConsequenceRouteImpactEntries();
  if (!impacts.length) return `<p class="muted">No open callback or return-trip pressure is attached to a mapped route right now.</p>`;
  return `
    <ul class="modal-list">
      ${impacts.map((entry) => {
        const route = getWorldRoute(entry.routeId);
        return `
          <li>
            <strong>${escapeHtml(`${route.toLabel} - ${entry.source}`)}</strong>
            <span>${escapeHtml(`${getConsequenceStatusLabel(entry.status)}. Cause: ${entry.cause} Affects: ${entry.affects}. Result: ${entry.detail}`)}</span>
          </li>
        `;
      }).join("")}
    </ul>
  `;
}

function showConsequenceReview() {
  showModal({
    kicker: "Consequence Ledger",
    title: "Callback And Return-Trip Pressure",
    body: `
      <h3>Last Job-Site Closeout</h3>
      ${getLastJobSiteCloseoutReviewMarkup()}
      <h3>Recent Closeout History</h3>
      ${getRecentJobSiteCloseoutHistoryMarkup()}
      <h3>Active Consequences</h3>
      ${getConsequenceLedgerMarkup()}
      <h3>Affected Routes</h3>
      ${getConsequenceRouteImpactMarkup()}
      <p class="muted">These entries come from closeout choices, callback debt, exhaustion, and saved return-trip risks. They do not create new jobs by themselves, but they can change board routing, prep pressure, and future field work.</p>
    `,
    actions: [
      { label: "Open Regional Map", onClick: showRegionalMap },
      { label: "Back To Van", className: "secondary-button", onClick: showVehicleMenu },
      { label: "Close", className: "text-button", onClick: render },
    ],
  });
}

function getOpenCallbackPenalty() {
  return Math.min(1, Math.max(0, state.stats.callbacks - state.stats.callbacksResolved));
}

function getUnresolvedCallbackCount() {
  return Math.max(0, state.stats.callbacks - state.stats.callbacksResolved);
}

function shouldOfferCallbackCleanupDispatch() {
  return state.flags.secureAccessComplete
    && !state.flags.handoffComplete
    && !state.flags.callbackCleanupComplete
    && getUnresolvedCallbackCount() > 0;
}
