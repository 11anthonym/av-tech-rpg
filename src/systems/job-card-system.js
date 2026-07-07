// Job-card helpers turn routeJobs, dispatchToolPlans, field tasks, and route state into readable board cards.
// They depend on app.js plus the route, portal, and objective helper scripts and load before bootstrap starts the game.
function getDispatchTaskCardsMarkup(taskCards = []) {
  if (!taskCards.length) return "";
  return `
    <div class="dispatch-task-grid">
      ${taskCards.map((card) => `
        <div class="dispatch-task-card">
          <strong>${card.title}</strong>
          <span>${card.skill}</span>
          <small>${card.outcome}</small>
        </div>
      `).join("")}
    </div>
  `;
}

function getFieldTaskPreviewSkillText(check) {
  if (!check.skillId && !check.skill && !check.difficulty && !check.difficultyHint) return "No skill check";
  const skillName = getSkillDefinition(check.skillId)?.name || check.skill || check.skillId || "Variable skill";
  const difficulty = check.difficulty != null
    ? `Difficulty ${check.difficulty}`
    : check.difficultyHint || "Difficulty varies";
  return `${skillName} | ${difficulty}`;
}

function getFieldTaskPreviewEnergyText(check) {
  if (check.energyHint) return check.energyHint;
  if (check.energyCost != null) return `Effort: ${getEnergyEffortText(check.energyCost)}`;
  return "Effort varies by route, prep, or branch";
}

function getFieldTaskPreviewMarkup(fieldTasks = []) {
  if (!fieldTasks.length) return "";
  return `
    <h3>Field Task Checks</h3>
    <div class="dispatch-task-grid">
      ${fieldTasks.map((check) => {
        const taskState = getFieldTaskState(check);
        const toolText = [
          check.requiredTool ? `Required: ${getFieldTaskToolText(check.requiredTool)}` : "",
          check.optionalTool ? `Helpful: ${getFieldTaskToolText(check.optionalTool)}` : "",
          check.riskLabel ? `Risk: ${check.riskLabel}` : "",
        ].filter(Boolean).join(" | ");
        const pressureText = getActionPressureBrief({
          check,
          baseEnergyCost: check.energyCost ?? null,
          includeSkill: true,
          includeLedger: true,
          includeTools: true,
        });
        return `
          <div class="dispatch-task-card task-state-${taskState.id}">
            <strong>${escapeHtml(check.label)}</strong>
            <span>${escapeHtml(`${check.type || "field check"} | ${getFieldTaskPreviewSkillText(check)} | ${getFieldTaskPreviewEnergyText(check)}`)}</span>
            <small class="task-state-note task-state-${taskState.id}">${escapeHtml(`Task state: ${getTaskStateText(taskState)}`)}</small>
            <small>${escapeHtml(toolText || check.successText || check.detail || "Complete this task before closeout.")}</small>
            ${pressureText ? `<small class="pressure-note">${escapeHtml(`Pressure on this action: ${pressureText}`)}</small>` : ""}
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function getJobFamilyMarkup(familyId) {
  const family = content.jobFamilies?.[familyId];
  if (!family) return "";
  const workPattern = family.workPattern || family.loop || "Field steps vary by job.";
  const skillNames = family.coreSkills
    .map((skillId) => getSkillDefinition(skillId)?.name || skillId)
    .join(", ");
  return `
    <li><strong>Job family</strong><span>${family.name}</span></li>
    <li><strong>Work pattern</strong><span>${workPattern}</span></li>
    <li><strong>Core skills</strong><span>${skillNames}</span></li>
  `;
}

function getBoardBuildEdgeMarkup(familyId) {
  const family = content.jobFamilies?.[familyId];
  if (!family || !state.technician) return "";
  const rankedSkills = family.coreSkills
    .map((skillId) => ({
      id: skillId,
      name: getSkillDefinition(skillId)?.name || skillId,
      value: getSkillValue(skillId),
    }))
    .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name));
  const strongest = rankedSkills[0];
  const weakest = rankedSkills[rankedSkills.length - 1];
  const notes = [];
  if (strongest) notes.push(`Best fit: ${strongest.name} ${strongest.value}`);
  if (weakest && weakest.id !== strongest?.id && weakest.value <= 2) notes.push(`Watch: ${weakest.name} ${weakest.value}`);
  if (family.coreSkills.includes("documentation") && getDocumentationSupportReduction()) {
    notes.push("documentation support lowers some closeout costs");
  }
  if (family.coreSkills.includes("clientCommunication") || family.coreSkills.includes("commercialProcess")) {
    notes.push(canUsePressureChoice() ? "pressure choices are available" : "pressure pushback may stay locked");
  }
  if (ownsTool("circuitHutOrganizer")) {
    notes.push(hasActivePartsBrainFind() ? "parts organizer is active for this job" : canUsePartsBrain() ? "parts organizer can still be checked from the kit" : "");
  }
  if (familyId === "logistics" && hasCharacterTrait("badKnees")) notes.push("long carries and access moves hit harder");
  const detail = notes.filter(Boolean).join("; ");
  return detail ? `<li><strong>Current build</strong><span>${escapeHtml(detail)}.</span></li>` : "";
}

function getBoardRouteMemoryMarkup(routeId = getCurrentDispatchRouteId()) {
  if (!routeId) return "";
  const route = getWorldRoute(routeId);
  if (!route) return "";
  const travelCount = getRouteTravelCount(route.id);
  const lastRoute = getLastRouteChoiceLabel(route);
  let detail = "New route; travel choice still matters before the work starts.";
  if (route.planned) {
    detail = `Planned ${route.fromLabel} to ${route.toLabel} route; it is mapped for the work-order preview but not launchable yet.`;
  } else if (canFastTravelRoute(route)) {
    detail = `Known ${route.fromLabel} to ${route.toLabel} route; fast travel is ready from the regional map for ${getFastTravelEnergyCost(route)} energy.`;
  } else if (isFastTravelUnlocked(route)) {
    detail = `Known ${route.fromLabel} to ${route.toLabel} route; fast travel is unlocked when the active job starts from the right area.`;
  } else if (travelCount > 0) {
    detail = `Route has been driven ${travelCount} time${travelCount === 1 ? "" : "s"}; repeat-route memory can matter later.`;
  }
  if (lastRoute) detail += ` Last route choice: ${lastRoute}.`;
  return `<li><strong>Route memory</strong><span>${escapeHtml(detail)}</span></li>`;
}

function getBoardRoutingMarkup() {
  const notes = [];
  if (shouldOfferCallbackCleanupDispatch()) {
    notes.push("Warranty return is forced before handoff because unresolved callback pressure is still on the ledger.");
  } else if (state.flags.secureAccessComplete && !state.flags.handoffComplete && getUnresolvedCallbackCount() === 0) {
    notes.push("Clean callback ledger skips the warranty return and moves the board to client handoff.");
  }
  if (isConshohockenFollowupAvailable()) {
    notes.push("Josh debrief unlocked the Conshohocken label follow-up before the next new site.");
  }
  if (state.flags.systemsComplete && !state.flags.travelComplete) {
    notes.push("The next board item is a coordination-cost beat, not a full onsite service call.");
  }
  return notes.length ? `<li><strong>Board routing</strong><span>${escapeHtml(notes.join(" "))}</span></li>` : "";
}

function getBoardConsequenceHooksMarkup(consequenceHooks = []) {
  if (!consequenceHooks.length) return "";
  return `<li><strong>Consequence hooks</strong><span>${escapeHtml(consequenceHooks.join(" "))}</span></li>`;
}

function getJobFamilyName(familyId) {
  return content.jobFamilies?.[familyId]?.name || familyId || "Uncategorized work";
}

function getToolDisplayName(toolId) {
  const tool = content.tools?.[toolId];
  if (!tool) return toolId;
  return `${tool.name}${ownsTool(toolId) ? " (owned)" : ""}`;
}

// dispatchToolPlans define required and recommended prep shown on job/route cards.
function getDispatchToolPlan(familyId, routeId = "") {
  const plans = content.dispatchToolPlans || {};
  const basePlan = plans[familyId] || plans.default || { required: ["work-order notes"], recommended: ["toolBag"] };
  const routePlan = plans.routeOverrides?.[routeId] || {};
  return {
    required: uniqueValues([...(basePlan.required || []), ...(routePlan.required || [])]),
    recommended: uniqueValues([...(basePlan.recommended || []), ...(routePlan.recommended || [])]),
  };
}

function getToolPlanItemText(item, { required = false } = {}) {
  const tool = content.tools?.[item];
  if (!tool) return `${item} (${required ? "expected" : "recommended prep"})`;
  const status = ownsTool(item) ? "owned" : required ? "missing" : "not owned";
  const effect = getToolEffectText(tool);
  return `${tool.name} (${status})${effect ? ` - ${effect}` : ""}`;
}

function getToolPlanText(items = [], options = {}) {
  const uniqueItems = [...new Set(items)];
  if (!uniqueItems.length) return "None listed.";
  return uniqueItems
    .map((item) => getToolPlanItemText(item, options))
    .join(", ");
}

function getDispatchFieldTasksForRoute(routeId = "") {
  if (routeId === "universitySurvey" && typeof getSurveyAdjustedInspections === "function") {
    return getSurveyAdjustedInspections();
  }
  if (
    routeId === "burlingtonRetrofitWalkdown"
    && state.flags.retrofitWalkdownComplete
    && !state.flags.retrofitInstallComplete
    && typeof getRetrofitInstallChecks === "function"
  ) {
    return getRetrofitInstallChecks();
  }
  const routeJob = content.routeJobs?.[routeId] || {};
  const dispatch = getDispatchReference(routeJob.dispatchId || routeJob.followup?.dispatchId);
  return dispatch?.checks || dispatch?.inspections || [];
}

function getDispatchDifferenceText({ routeId = "", fieldTasks = [] } = {}) {
  const tasks = fieldTasks.length ? fieldTasks : getDispatchFieldTasksForRoute(routeId);
  return getWhyDifferentTodayText(tasks);
}

function getRouteBranchRows(route) {
  if (route?.id !== "burlingtonRetrofitWalkdown") return [];
  if (state.flags.retrofitWalkdownComplete && !state.flags.retrofitInstallComplete) {
    const preview = getRetrofitInstallPreview();
    const branchLabel = preview?.branch?.label || preview?.branchId || "walkdown result";
    const branchHint = preview?.branch?.stateHint || "The walkdown result has selected the install branch.";
    return [
      { label: "Saved walkdown result", detail: branchHint },
      { label: "Install branch", detail: branchLabel },
    ];
  }
  if (!state.flags.retrofitWalkdownComplete) {
    return [{ label: "Saved walkdown result", detail: "Pending. This walkdown closeout will decide the future install branch." }];
  }
  if (state.flags.retrofitInstallRiskInherited) {
    return [{ label: "Burlington consequence", detail: "Install closeout inherited pathway risk into future service." }];
  }
  if (state.flags.retrofitInstallRiskResolved) {
    return [{ label: "Burlington consequence", detail: "Install closeout resolved the pathway risk into record/as-built history." }];
  }
  if (state.flags.retrofitInstallComplete) {
    return [{ label: "Burlington consequence", detail: "Install is complete; future service starts from the saved closeout record." }];
  }
  return [];
}

function getRouteConsequenceText(route) {
  const notes = [];
  if (route?.id === "burlingtonRetrofitWalkdown") {
    if (state.flags.retrofitWalkdownComplete && !state.flags.retrofitInstallComplete) {
      const preview = getRetrofitInstallPreview();
      notes.push(`${preview?.branch?.stateHint || "Walkdown result saved; install branch is selected."} Install branch: ${preview?.branch?.label || preview?.branchId || "walkdown result"}.`);
    } else if (!state.flags.retrofitWalkdownComplete) {
      notes.push("Walkdown closeout will choose the future Burlington install branch.");
    } else if (state.flags.retrofitInstallRiskInherited) {
      notes.push("Install closeout inherited Burlington pathway risk into future service.");
    } else if (state.flags.retrofitInstallRiskResolved) {
      notes.push("Install closeout resolved the Burlington pathway risk into history.");
    }
  }
  const ledgerText = getDispatchCallbackEffectsText([]);
  if (ledgerText && !ledgerText.startsWith("No open")) notes.push(ledgerText);
  if (!notes.length) notes.push(ledgerText || "No open callback or return-trip effect is currently attached to this route.");
  return notes.join(" ");
}

function getRouteJobCardRows(route) {
  const job = getRouteJobData(route.id);
  const destination = getWorldArea(route.toAreaId);
  const region = getWorldRegion(destination?.regionId);
  const lastChoice = getLastRouteChoiceLabel(route);
  const fastTravelCount = getFastTravelCount(route.id);
  const lockReason = getRouteLockReason(route);
  const travelResult = getTravelResultText(getLastTravelResult(route));
  const toolPlan = getDispatchToolPlan(job.familyId, route.id);
  const dailyConditionText = getDailyConditionPrepText();
  const differenceText = getDispatchDifferenceText({ routeId: route.id });
  return [
    { label: "Destination", detail: `${destination?.label || route.toLabel}${region?.name ? `, ${region.name}` : ""}` },
    { label: "Job family", detail: getJobFamilyName(job.familyId) },
    { label: "Purpose", detail: job.purpose },
    { label: "Summary", detail: job.summary || "No summary listed." },
    ...getRouteBranchRows(route),
    { label: "Required tools", detail: getToolPlanText(toolPlan.required, { required: true }) },
    { label: "Recommended tools", detail: getToolPlanText(toolPlan.recommended) },
    { label: "Risk tags", detail: (job.riskTags || []).join(", ") || "ordinary field pressure" },
    { label: "Unlock condition", detail: job.unlockCondition },
    { label: "Route status", detail: getRouteStatus(route) },
    { label: "What happens next", detail: getRouteLaunchPreviewText(route) },
    { label: "Travel cost/risk", detail: getRouteTravelCostRisk(route) },
    differenceText ? { label: "Why this is different today", detail: differenceText } : null,
    dailyConditionText ? { label: "Today's condition", detail: dailyConditionText } : null,
    { label: "Driven before", detail: getRouteDrivenText(route) },
    { label: "Fast travel", detail: `${getRouteFastTravelText(route)}${fastTravelCount ? ` Used ${fastTravelCount} time${fastTravelCount === 1 ? "" : "s"}.` : ""}` },
    { label: "Rewards", detail: job.rewards },
    { label: "Callback / return-trip risk", detail: getRouteConsequenceText(route) },
    getRouteConsequencePressureText(route) ? { label: "Mapped consequence pressure", detail: getRouteConsequencePressureText(route) } : null,
    getRouteCloseoutHistoryText(route) ? { label: "Recent closeout history", detail: getRouteCloseoutHistoryText(route) } : null,
    lastChoice ? { label: "Last route choice", detail: lastChoice } : null,
    travelResult ? { label: "Last travel result", detail: travelResult } : null,
    lockReason ? { label: "Locked reason", detail: lockReason } : null,
  ].filter(Boolean);
}

function getDispatchLocationSummary(route) {
  if (!route) return "Radnor Rack & Wire shop / Wayne Area";
  const area = getWorldArea(route.toAreaId);
  const region = getWorldRegion(area?.regionId);
  return `${area?.label || route.toLabel}${region?.name ? `, ${region.name}` : ""}`;
}

function getDispatchRiskTags({ routeId = "", familyId = "", consequenceHooks = [] }) {
  const routeJob = routeId ? getRouteJobData(routeId) : null;
  const tags = [
    ...(routeJob?.riskTags || []),
    ...(consequenceHooks.length ? ["consequence hook"] : []),
    ...(getUnresolvedCallbackCount() ? ["callback debt"] : []),
    ...(state.flags.shiftPrepActive ? ["late-shift prep"] : []),
  ];
  if (familyId === "logistics") tags.push("process friction");
  if (familyId === "service") tags.push("return-trip risk");
  return [...new Set(tags)].join(", ") || "ordinary field pressure";
}

function getDispatchCallbackEffectsText(consequenceHooks = []) {
  const effects = [];
  if (consequenceHooks.length) effects.push(consequenceHooks.join(" "));
  if (getUnresolvedCallbackCount()) effects.push(`${getUnresolvedCallbackCount()} unresolved callback${getUnresolvedCallbackCount() === 1 ? "" : "s"} can affect routing and pressure.`);
  const risks = getOpenReturnTripRiskSummary();
  if (risks) effects.push(risks);
  return effects.join(" ") || "No open callback or return-trip effect is currently attached to this job.";
}

function getDispatchJobOverviewRowsMarkup({ type, setup, familyId = "", routeId = "", consequenceHooks = [] }) {
  const route = getWorldRoute(routeId || getCurrentDispatchRouteId());
  const routeJob = route ? getRouteJobData(route.id) : null;
  const resolvedFamilyId = familyId || routeJob?.familyId || "";
  const toolPlan = getDispatchToolPlan(resolvedFamilyId, route?.id || "");
  const routeCloseoutHistoryText = route ? getRouteCloseoutHistoryText(route) : "";
  const dailyConditionText = getDailyConditionPrepText({ includeClean: true });
  const differenceText = getDispatchDifferenceText({ routeId: route?.id || "" });
  const routeDetail = route
    ? `${route.fromLabel} -> ${route.toLabel}. ${getRouteTravelCostRisk(route)} ${getRouteFastTravelText(route)}`
    : "Shop-based task; no drive route starts for this board item.";
  const unlockDetail = routeJob?.unlockCondition
    ? `${routeJob.unlockCondition}${route ? ` ${getRouteLockReason(route) || "Launchable when this card is accepted."}` : ""}`
    : "Unlocked by the current dispatch-board progression.";
  return `
    <li><strong>Title</strong><span>${escapeHtml(routeJob?.title || type)}</span></li>
    <li><strong>Location / region</strong><span>${escapeHtml(getDispatchLocationSummary(route))}</span></li>
    <li><strong>Summary</strong><span>${escapeHtml(routeJob?.summary || setup)}</span></li>
    <li><strong>Required / expected tools</strong><span>${escapeHtml(getToolPlanText(toolPlan.required, { required: true }))}</span></li>
    <li><strong>Recommended tools</strong><span>${escapeHtml(getToolPlanText(toolPlan.recommended))}</span></li>
    <li><strong>Risk tags</strong><span>${escapeHtml(getDispatchRiskTags({ routeId: route?.id || "", familyId: resolvedFamilyId, consequenceHooks }))}</span></li>
    <li><strong>Route</strong><span>${escapeHtml(routeDetail)}</span></li>
    ${differenceText ? `<li><strong>Why this is different today</strong><span>${escapeHtml(differenceText)}</span></li>` : ""}
    <li><strong>Today's condition</strong><span>${escapeHtml(dailyConditionText)}</span></li>
    <li><strong>Rewards</strong><span>${escapeHtml(routeJob?.rewards || "Cash, XP, reputation, and ledger changes on closeout.")}</span></li>
    <li><strong>Unlock condition</strong><span>${escapeHtml(unlockDetail)}</span></li>
    <li><strong>Callback / return-trip effects</strong><span>${escapeHtml(getDispatchCallbackEffectsText(consequenceHooks))}</span></li>
    ${routeCloseoutHistoryText ? `<li><strong>Recent route closeout</strong><span>${escapeHtml(routeCloseoutHistoryText)}</span></li>` : ""}
  `;
}

function getDispatchBoardMarkup({ type, setup, why, stakes = [], note, managementNote, prep = "", taskCards = [], fieldTasks = [], familyId = "", routeId = "", consequenceHooks = [], showBoardState = true }) {
  return `
    <p><strong>${type}:</strong> ${setup}</p>
    ${getCurrentStepGuidanceMarkup()}
    <ul class="modal-list">
      ${showBoardState ? getDispatchBoardStateMarkup() : ""}
      ${getDispatchJobOverviewRowsMarkup({ type, setup, familyId, routeId, consequenceHooks })}
      <li><strong>Why this is on the board</strong><span>${why}</span></li>
      ${getJobFamilyMarkup(familyId)}
      ${getCompanyDispatchPressureMarkup()}
      ${getBoardBuildEdgeMarkup(familyId)}
      ${getBoardRouteMemoryMarkup(routeId || getCurrentDispatchRouteId())}
      <li><strong>Stakes</strong><span>${stakes.join(" ")}</span></li>
      ${getBoardConsequenceHooksMarkup(consequenceHooks)}
      ${getOpenCallbackBoardMarkup()}
      ${getBoardRoutingMarkup()}
      ${prep ? `<li><strong>Prep</strong><span>${prep}</span></li>` : ""}
      ${getDispatchDifferenceText({ routeId: routeId || getCurrentDispatchRouteId(), fieldTasks }) ? `<li><strong>Why this is different today</strong><span>${escapeHtml(getDispatchDifferenceText({ routeId: routeId || getCurrentDispatchRouteId(), fieldTasks }))}</span></li>` : ""}
    </ul>
    ${getDispatchTaskCardsMarkup(taskCards)}
    ${getFieldTaskPreviewMarkup(fieldTasks)}
    ${note ? `<p class="muted">${note}</p>` : ""}
    <blockquote>Management note: "${managementNote}"</blockquote>
  `;
}

function getOpenCallbackBoardMarkup() {
  const openCallbacks = getUnresolvedCallbackCount();
  const ledgerEntries = getConsequenceLedgerEntries();
  if (!openCallbacks && !ledgerEntries.length) return "";
  const returnTripSummary = getOpenReturnTripRiskSummary();
  return `
    <li><strong>Open consequence ledger</strong><span>${openCallbacks} unresolved callback${openCallbacks === 1 ? "" : "s"} on the ledger. ${returnTripSummary || "Future work may feel heavier until the callback ledger catches up."}</span></li>
    ${getReturnTripRiskRowsMarkup()}
  `;
}
