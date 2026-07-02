// Burlington retrofit install flow: inherited walkdown package, pathway task, and record/as-built closeout.
// This keeps the second half of the multi-step retrofit consequence chain beside the walkdown system.
function getRetrofitInstallJob() {
  return getPlannedJob("burlington-retrofit-install");
}

function getRetrofitInstallPreview() {
  const job = getRetrofitInstallJob();
  return job ? getPlannedJobPresentation(job) : null;
}

function getRetrofitInstallChecks() {
  return getRetrofitInstallJob()?.checks || [];
}

function getRetrofitInstallBranchLabel() {
  return getRetrofitInstallPreview()?.branch?.label || "Walkdown result";
}

function getRetrofitInstallLoadoutText(branchId = getRetrofitInstallPreview()?.branchId || "pending") {
  return {
    protected: "Load display hardware, pathway fittings that match the photo set, labels, pull string, and the marked-up walkdown notes.",
    partial: "Load display hardware, extra pathway hardware, pull string, labels, and the weak-note photos so the missing detail can be resolved onsite.",
    risk: "Load display hardware, extra pathway hardware, warning labels, pull string, and enough closeout discipline to keep the shortcut from becoming folklore.",
    pending: "Review the walkdown result before loading. The install should not leave as a blank work order.",
  }[branchId] || "Review the walkdown result before loading.";
}

function showRetrofitInstallDispatchPreview() {
  const preview = getRetrofitInstallPreview();
  if (!preview) return notify("The Burlington install is not on the board yet.");
  showModal({
    kicker: "Dispatch Board",
    title: preview.title,
    body: `
      ${getDispatchBoardMarkup({
        type: preview.type || "Retrofit Install",
        familyId: preview.familyId || "install",
        routeId: preview.routeId || "burlingtonRetrofitWalkdown",
        setup: preview.setup,
        why: "Unlocked after the Burlington walkdown. This install starts by inheriting that closeout instead of pretending the site is new.",
        stakes: preview.stakes,
        consequenceHooks: preview.consequenceHooks,
        note: preview.note,
        managementNote: preview.managementNote,
        prep: state.flags.retrofitInstallPackageReviewed ? `Walkdown package reviewed: ${getRetrofitInstallBranchLabel()}` : "Review the inherited walkdown package before loading the van.",
        taskCards: preview.taskCards,
        fieldTasks: getRetrofitInstallChecks(),
      })}
      ${getPlannedJobBranchMarkup(preview)}
    `,
    actions: [
      getDispatchRoutePrepAction("burlingtonRetrofitWalkdown", showRetrofitInstallDispatchPreview),
      { label: "Return to Shop", className: "secondary-button" },
    ],
  });
}

function showRetrofitInstallPackage() {
  const preview = getRetrofitInstallPreview();
  if (!preview) return notify("The Burlington install package is not ready.");
  state.flags.retrofitInstallPackageReviewed = true;
  state.flags.retrofitInstallBranch = preview.branchId;
  showModal({
    kicker: "Install Package",
    title: `Load For ${preview.branch?.label || "The Walkdown"}`,
    body: `
      <p>${preview.branch?.stateHint || "Walkdown result loaded."}</p>
      <p><strong>Loadout:</strong> ${escapeHtml(getRetrofitInstallLoadoutText(preview.branchId))}</p>
      <p class="muted">The install will use the same Burlington route. Fast travel is available after the first drive, but it still costs energy.</p>
    `,
    actions: [{ label: "Head To Burlington County", onClick: promptRetrofitInstallTravel }],
  });
}

function promptRetrofitInstallTravel({ fastTravel = false } = {}) {
  const preview = getRetrofitInstallPreview();
  showTravelRouteModal({
    routeId: "burlingtonRetrofitWalkdown",
    dispatchEstimate: "Install the retrofit using the inherited walkdown result.",
    actionLabel: fastTravel ? "Fast Travel To Retrofit Install" : "Drive To Retrofit Install",
    extraBody: `
      <p class="muted">Inherited result: ${escapeHtml(preview?.branch?.stateHint || "walkdown package reviewed")}.</p>
      <p class="muted">${escapeHtml(getRetrofitInstallLoadoutText(preview?.branchId))}</p>
    `,
    fastTravel,
    beforeTravel: () => {
      state.flags.retrofitInstallStarted = true;
      state.flags.retrofitInstallBranch = getRetrofitInstallBranchIdFromFlags(state.flags);
      markCareerSnapshotStale();
    },
  });
}

function getRetrofitInstallCheckDifficulty(branchId = getRetrofitInstallPreview()?.branchId || "pending") {
  return {
    protected: 3,
    partial: 4,
    risk: 5,
    pending: 4,
  }[branchId] || 4;
}

function getRetrofitInstallCheckEnergyCost(branchId = getRetrofitInstallPreview()?.branchId || "pending") {
  return {
    protected: 3,
    partial: 5,
    risk: 7,
    pending: 5,
  }[branchId] || 5;
}

function getRetrofitInstallCloseoutEnergyCost() {
  const branchId = getRetrofitInstallPreview()?.branchId || "pending";
  const baseCost = branchId === "protected" ? 3 : branchId === "partial" ? 4 : 5;
  return Math.max(2, baseCost - getDocumentationSupportReduction());
}

function getRetrofitInstallCheckContextBonus(branchId = getRetrofitInstallPreview()?.branchId || "pending") {
  if (branchId === "protected") return 1;
  if (branchId === "partial" && state.flags.retrofitInstallPackageReviewed) return 1;
  return 0;
}

function inspectRetrofitInstallCondition(checkId) {
  const check = getRetrofitInstallChecks().find((item) => item.id === checkId);
  if (!check || state.retrofitInstallChecks.includes(checkId)) return notify(`${check?.label || "That install task"} is already checked.`);
  const preview = getRetrofitInstallPreview();
  const branchId = preview?.branchId || "pending";
  const { skillCheck, energyCost } = resolveFieldTaskCheck({
    check,
    checkId,
    completedChecks: state.retrofitInstallChecks,
    flagKey: `retrofit-install-${checkId}-${branchId}`,
    skillId: check.skillId,
    difficulty: getRetrofitInstallCheckDifficulty(branchId),
    contextBonus: getRetrofitInstallCheckContextBonus(branchId),
    contextId: check.contextId,
    baseEnergyCost: getRetrofitInstallCheckEnergyCost(branchId),
    failedEnergyPenalty: 2,
    cleanEnergyReduction: 1,
    strainedFlag: "retrofitInstallCheckStrained",
    logText: `${check.label} complete: ${check.log}.`,
    strainedLogText: "Retrofit install check strained; the closeout needs stronger record/as-built notes.",
  });
  render();
  showModal({
    kicker: "Install Task",
    title: check.label,
    body: `
      <p>${check.detail}</p>
      <p class="muted">${preview?.branch?.stateHint || ""}</p>
      ${getFieldTaskResultMarkup({ check, skillCheck, energyCost })}
      <p class="muted">The pathway is in. Closeout decides whether the actual route becomes a usable record or another vague handoff.</p>
    `,
    actions: [{ label: "Review Install Closeout", onClick: showRetrofitInstallChoice }],
  });
}

function showRetrofitInstallChoice() {
  if (state.flags.retrofitInstallComplete) {
    return showCompletedDispatchReturnReview({
      title: "Retrofit Install Already Complete",
      source: getRetrofitInstallPreview()?.title || "Burlington County Retrofit Install",
      result: getCompletedCloseoutPathResult("retrofitInstallApproach"),
    });
  }
  const preview = getRetrofitInstallPreview();
  const branchId = preview?.branchId || "pending";
  const riskBranch = branchId === "partial" || branchId === "risk";
  showModal({
    kicker: "Retrofit Install Closeout",
    title: riskBranch ? "The Ceiling Is Finally In The Notes" : "Known Pathway, Actual Record",
    body: `
      <p>The display pathway is installed. The closeout can turn the real route into record/as-built notes, or it can leave the next person with a clean-looking install and a thinner map.</p>
      ${state.flags.retrofitInstallCheckStrained ? `<p class="muted">The install check was strained. A record/as-built closeout can still protect future service, but the upside is smaller.</p>` : ""}
      ${getDocumentationSupportReduction() ? `<p class="muted">Your documentation habits make the record/as-built closeout less draining.</p>` : ""}
      ${getChoicePressureMarkup([
        {
          label: "Record actual pathway",
          detail: riskBranch ? "Takes steady effort, resolves the inherited pathway risk, and gives future service usable record/as-built notes." : "Takes steady effort and turns the protected pathway into useful closeout documentation.",
        },
        {
          label: "Quick install note",
          detail: riskBranch ? "Fast and management-friendly, but the weak pathway record stays on the ledger." : "Fast, but it wastes some of the walkdown's documentation value.",
        },
      ])}
    `,
    actions: [
      { label: "Record actual pathway", onClick: () => finishRetrofitInstall("record") },
      { label: "Close with quick install note", className: "secondary-button", onClick: () => finishRetrofitInstall("quick") },
    ],
  });
}

function getRetrofitInstallReputationSummary(approach, riskResolved, riskInherited) {
  if (approach === "quick" && riskInherited) return "Management likes the fast closeout; crew trust drops because the pathway record stays weak";
  if (approach === "quick") return "Management likes the fast closeout; documentation value is left on the table";
  if (riskResolved) return "Client and crew trust rise; management grumbles about the record/as-built trail";
  return "Client trust rises; crew gets usable notes; management mostly tolerates it";
}

function getRetrofitInstallResultSummary(approach, branchId, strained) {
  if (approach === "quick") return branchId === "protected" ? "Installed with thin closeout" : "Installed with inherited pathway risk still loose";
  if (branchId === "protected") return strained ? "Protected route recorded with a strained install note" : "Protected route recorded cleanly";
  if (branchId === "partial") return strained ? "Partial warning improved, but not fully erased" : "Partial warning resolved into record notes";
  return strained ? "Risk documented after a strained install" : "Inherited risk resolved into record notes";
}

function finishRetrofitInstall(approach) {
  if (state.flags.retrofitInstallComplete) {
    return showCompletedDispatchReturnReview({
      title: "Retrofit Install Already Complete",
      source: getRetrofitInstallPreview()?.title || "Burlington County Retrofit Install",
      result: getCompletedCloseoutPathResult("retrofitInstallApproach"),
    });
  }
  const before = getTrackedStateSnapshot();
  const preview = getRetrofitInstallPreview();
  const branchId = preview?.branchId || "pending";
  const documented = approach === "record";
  const strained = Boolean(state.flags.retrofitInstallCheckStrained);
  const riskBranch = branchId === "partial" || branchId === "risk";
  const riskResolved = documented && riskBranch && !strained;
  const riskInherited = riskBranch && !riskResolved;
  const xp = Math.max(30, (documented ? (branchId === "risk" ? 70 : branchId === "partial" ? 65 : 60) : (branchId === "protected" ? 45 : 38)) - (strained ? 5 : 0));
  if (documented) changeEnergy(-getRetrofitInstallCloseoutEnergyCost());
  state.flags.retrofitInstallComplete = true;
  state.flags.retrofitInstallApproach = approach;
  state.flags.retrofitInstallRecordComplete = documented;
  state.flags.retrofitInstallRiskResolved = riskResolved;
  state.flags.retrofitInstallRiskInherited = riskInherited;
  markCareerSnapshotStale();
  setClock(`${state.clock.slice(0, 3)} ${documented ? "2:42" : "2:08"} PM`);
  if (!state.flags.retrofitInstallPaid) {
    state.cash += documented ? 94 : 76;
    state.flags.retrofitInstallPaid = true;
  }
  if (!state.flags.retrofitInstallProgressAwarded) {
    awardCareerProgress({
      xp,
      reputation: documented
        ? { clients: 1, coworkers: riskResolved ? 2 : 1, management: riskResolved ? -1 : 0 }
        : { clients: 0, coworkers: riskInherited ? -1 : 0, management: 1 },
      source: preview?.title || "Burlington County Retrofit Install",
    });
    state.flags.retrofitInstallProgressAwarded = true;
  }
  if (!state.flags.retrofitInstallStatsRecorded) {
    state.stats.retrofitInstallsCompleted += 1;
    state.stats.retrofitPathwaysInstalled += 1;
    if (riskResolved) {
      state.stats.retrofitInstallRisksResolved += 1;
      state.stats.documentedTaskRisks += 1;
    }
    if (riskInherited) state.stats.retrofitInstallRisksInherited += 1;
    state.flags.retrofitInstallStatsRecorded = true;
  }
  if (riskInherited) {
    recordReturnTripRisk("burlington-retrofit-install", {
      source: preview?.title || "Burlington County Retrofit Install",
      detail: documented
        ? "Retrofit pathway installed, but a strained note leaves partial future-service risk."
        : "Retrofit pathway installed with a quick note; weak pathway documentation remains.",
    });
  } else if (state.flags.returnTripRisks?.["burlington-retrofit-install"]) {
    resolveReturnTripRisk("burlington-retrofit-install", {
      source: preview?.title || "Burlington County Retrofit Install",
      resolution: riskResolved
        ? "Record/as-built closeout resolved the inherited pathway risk."
        : "Install closeout cleared the active Burlington risk.",
    });
  }
  addLog(documented
    ? "Closed the Burlington retrofit install with record/as-built pathway notes."
    : "Closed the Burlington retrofit install with a quick note. The ceiling knows what happened, at least.");
  const closeoutConsequences = [{
    source: preview?.title || "Burlington County Retrofit Install",
    status: riskInherited ? "inherited" : riskResolved ? "resolved" : documented ? "documented" : "controlled",
    cause: riskInherited
      ? "Install closeout left the inherited pathway record weak."
      : riskResolved
      ? "Record/as-built notes answered the inherited pathway risk."
      : documented
      ? "Protected route was turned into usable closeout documentation."
      : "Quick note left less documentation value, but no inherited pathway risk was active.",
    affects: getReturnTripRiskAffectedWork("burlington-retrofit-install"),
    detail: riskInherited
      ? "Future service inherits a thinner map of the actual pathway."
      : riskResolved
      ? "The prior Burlington risk is cleared into resolved history."
      : documented
      ? "Future service gets record/as-built context."
      : "The install is complete, but documentation value was left on the table.",
  }];
  recordJobSiteCloseoutSummary({
    source: preview?.title || "Burlington County Retrofit Install",
    result: getCompletedCloseoutPathResult("retrofitInstallApproach"),
    before,
    consequences: closeoutConsequences,
  });
  render();
  showModal({
    kicker: "Retrofit Install Complete",
    title: documented ? "The Actual Pathway Made It Into The Record" : "The Display Is Up, The Record Is Thin",
    body: `
      <div class="results-grid">
        <span>Install wages</span><strong>+$${documented ? 94 : 76}</strong>
        <span>Cash balance</span><strong>${formatCash(state.cash)}</strong>
        <span>Experience</span><strong>+${xp} XP</strong>
        <span>Inherited branch</span><strong>${preview?.branch?.label || branchId}</strong>
        <span>Install result</span><strong>${getRetrofitInstallResultSummary(approach, branchId, strained)}</strong>
        <span>Relationship result</span><strong>${getRetrofitInstallReputationSummary(approach, riskResolved, riskInherited)}</strong>
        <span>Return-trip risk</span><strong>${riskInherited ? "Still visible on the ledger" : "Cleared for this install"}</strong>
      </div>
      ${getCloseoutConsequenceMarkup(closeoutConsequences)}
      ${documented
        ? `<blockquote>Management note: "Please keep record drawing updates proportionate to the approved install."</blockquote>`
        : `<blockquote>Management note: "Thanks for keeping the install moving."</blockquote>`}
      ${getReturnPortalCloseoutNoteMarkup()}
    `,
    actions: [getCloseoutReturnAction(preview?.title || "Burlington County Retrofit Install", "Returned to Radnor Rack & Wire after the Burlington County retrofit install.")],
  });
}
