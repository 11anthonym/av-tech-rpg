// Systems service dispatch flow: prep, room diagnostics, and return-trip risk closeout.
// This keeps advanced service checks isolated from the larger app controller.
function showSystemsDispatchPreview() {
  showModal({
    kicker: "Dispatch Board",
    title: content.systemsDispatch.title,
    body: getDispatchBoardMarkup({
      type: "Systems Service",
      familyId: "service",
      setup: "A King of Prussia conference room is reporting offline. The service ticket says the client already rebooted once, so maybe reboot it professionally.",
      why: "Unlocked after the executive handoff. This board is testing whether advanced systems skills can matter in one readable service job.",
      stakes: [
        "Networking and Control Systems can change how cleanly you identify the fault.",
        "Documentation can turn a weird room note into future-proof closeout.",
        "A quick reboot keeps management happy and may leave return-trip risk.",
      ],
      note: "This is still a field-tech service call, not a subnet worksheet.",
      managementNote: "Please avoid turning a simple offline room into a network investigation.",
      prep: state.flags.systemsPreparation ? `Preparation selected: ${getSystemsPreparationLabel()}` : "",
      taskCards: content.systemsDispatch.taskCards,
      fieldTasks: content.systemsDispatch.checks,
    }),
    actions: [
      getDispatchRoutePrepAction("systemsService", showSystemsDispatchPreview),
      { label: "Return to Shop", className: "secondary-button" },
    ],
  });
}

function getSystemsPreparationLabel() {
  return {
    review: "Reviewed room/network notes",
    josh: "Asked Josh what changed",
    leave: "Left with work-order notes as written",
  }[state.flags.systemsPreparation] || "None";
}

function showSystemsPreparation() {
  showModal({
    kicker: "Systems Prep",
    title: "Before The Reboot Request",
    body: `
      <p>Coordination wants this treated like a quick room reboot. The service ticket also says "network maybe?" which is not a diagnosis so much as a shrug with punctuation.</p>
      ${getChoicePressureMarkup([
        { label: "Review notes", detail: "Costs a little time now, but improves network and documentation checks." },
        { label: "Ask Josh", detail: "Improves the control-room read and keeps the joke aimed at bad process." },
        { label: "Leave now", detail: "Protects management optics, but the ticket stays vague." },
      ])}
    `,
    actions: [
      { label: "Review room and network notes", onClick: () => chooseSystemsPreparation("review") },
      { label: "Ask Josh what changed", className: "secondary-button", onClick: () => chooseSystemsPreparation("josh") },
      { label: "Leave with the work-order notes", className: "secondary-button", onClick: () => chooseSystemsPreparation("leave") },
    ],
  });
}

function chooseSystemsPreparation(preparation) {
  state.flags.systemsPreparation = preparation;
  if (preparation === "review") {
    changeEnergy(-2);
    state.stats.workOrdersReviewed += 1;
    addLog("Reviewed the room and network notes before leaving. The old VLAN note immediately looked suspicious.");
  } else if (preparation === "josh") {
    state.flags.metJosh = true;
    addLog("Asked Josh about the offline room. Management asked why he was explaining work during work hours.");
  } else {
    state.reputation.management += 1;
    addLog("Left with the work-order notes as written. Management appreciated the velocity of not knowing more yet.");
  }
  render();
  promptSystemsTravel();
}

function promptSystemsTravel({ fastTravel = false } = {}) {
  showTravelRouteModal({
    routeId: "systemsService",
    dispatchEstimate: "Quick reboot, confirm room online, close ticket.",
    extraBody: `<p class="muted">The client says the room has been rebooted twice. The room, bravely, remains offline.</p>`,
    fastTravel,
    beforeTravel: () => {
      state.flags.systemsStarted = true;
      markCareerSnapshotStale();
    },
  });
}

function getSystemsCheckContextBonus(checkId) {
  if (state.flags.systemsPreparation === "review" && ["network-path", "rack-note"].includes(checkId)) return 1;
  if (state.flags.systemsPreparation === "josh" && checkId === "panel-status") return 1;
  return 0;
}

function getSystemsCheckEnergyCost(checkId) {
  const preparationHelps = (state.flags.systemsPreparation === "review" && ["network-path", "rack-note"].includes(checkId))
    || (state.flags.systemsPreparation === "josh" && checkId === "panel-status");
  return Math.max(0, 3 - (preparationHelps ? 1 : 0));
}

function inspectSystemsCondition(checkId) {
  const check = content.systemsDispatch.checks.find((item) => item.id === checkId);
  if (!check || state.systemsChecks.includes(checkId)) return notify(`${check?.label || "That systems note"} is already checked.`);
  const { skillCheck, energyCost } = resolveFieldTaskCheck({
    check,
    checkId,
    completedChecks: state.systemsChecks,
    flagKey: `systems-${checkId}`,
    contextBonus: getSystemsCheckContextBonus(checkId),
    baseEnergyCost: getSystemsCheckEnergyCost(checkId),
    strainedFlag: "systemsChecksStrained",
    logText: `${check.label} checked: ${check.log}`,
    strainedLogText: `Systems check strained on ${check.label}; the room is still more confident than the ticket.`,
  });
  render();
  const allChecked = state.systemsChecks.length === content.systemsDispatch.checks.length;
  showModal({
    kicker: "Systems Note",
    title: check.label,
    body: `
      <p>${check.detail}</p>
      ${getFieldTaskResultMarkup({ check, skillCheck, energyCost })}
      ${allChecked ? `<p class="muted">You know enough to choose between a useful closeout and a clean-looking ticket.</p>` : ""}
    `,
    actions: [{ label: allChecked ? "Review Systems Closeout" : "Keep Troubleshooting", onClick: allChecked ? showSystemsChoice : render }],
  });
}

function showSystemsChoice() {
  if (state.flags.systemsComplete) {
    return showCompletedDispatchReturnReview({
      title: "Systems Service Already Complete",
      source: content.systemsDispatch.title,
      result: state.flags.systemsApproach ? `Closeout path: ${state.flags.systemsApproach}` : "",
    });
  }
  showModal({
    kicker: "Systems Closeout",
    title: "The Room Is Not Just Offline",
    body: `
      <p>The room can be rebooted into a temporarily less embarrassing state, but the real issue is the mismatch between the control path, network note, and what the ticket claims is true.</p>
      ${state.flags.systemsChecksStrained ? `<p class="muted">One of the systems checks was strained. Documenting is still useful, but the closeout has less upside because one read needed extra interpretation.</p>` : ""}
      ${getChoicePressureMarkup([
        { label: "Document mismatch", detail: "Costs energy and likely bothers management, but gives the next tech a usable trail and lowers return-trip risk." },
        { label: "Call out scope miss", detail: "Requires process confidence. Strong client/coworker upside, with sharper management friction possible." },
        { label: "Quick reboot", detail: "Fastest and management-friendly. The room may behave today, but the real mismatch stays loose." },
      ])}
    `,
    actions: [
      { label: "Document mismatch and reopen notes (-4 energy)", onClick: () => finishSystemsService("document") },
      ...(getSkillValue("commercialProcess") >= 3 || canUsePressureChoice() ? [{
        label: "Call out scope miss before closing (-3 energy)",
        className: "secondary-button",
        onClick: () => finishSystemsService("scope"),
      }] : []),
      { label: "Quick reboot and close ticket", className: "secondary-button", onClick: () => finishSystemsService("reboot") },
    ],
  });
}

function getSystemsReputationSummary(approach, strained = false) {
  if (approach === "reboot") return "Client trust drops; management likes the clean ticket";
  if (approach === "scope" && strained) return "Client trust rises; the crew gets a partial trail; management friction sharpens";
  if (approach === "scope") return "Client and crew trust rise; management friction sharpens";
  if (strained) return "Client trust rises; the crew gets partial help; management grumbles";
  return "Client and crew trust rise; management grumbles about the paper trail";
}

function getSystemsDiagnosticSummary(strained) {
  return strained
    ? "Strained read; useful closeout with reduced upside"
    : "Clean read; closeout is well supported";
}

function finishSystemsService(approach) {
  if (state.flags.systemsComplete) {
    return showCompletedDispatchReturnReview({
      title: "Systems Service Already Complete",
      source: content.systemsDispatch.title,
      result: state.flags.systemsApproach ? `Closeout path: ${state.flags.systemsApproach}` : "",
    });
  }
  const before = getTrackedStateSnapshot();
  const documented = approach !== "reboot";
  const strained = Boolean(state.flags.systemsChecksStrained) && documented;
  const xp = (approach === "scope" ? 65 : approach === "document" ? 55 : 35) - (strained ? 5 : 0);
  if (documented) changeEnergy(-(approach === "scope" ? 3 : 4));
  state.flags.systemsComplete = true;
  state.flags.systemsApproach = approach;
  markCareerSnapshotStale();
  setClock(`${state.clock.slice(0, 3)} ${documented ? "4:24" : "3:47"} PM`);
  if (!state.flags.systemsPaid) {
    state.cash += documented ? 68 : 52;
    state.flags.systemsPaid = true;
  }
  if (!state.flags.systemsProgressAwarded) {
    awardCareerProgress({
      xp,
      reputation: documented
        ? { clients: approach === "scope" ? 2 : 1, coworkers: strained ? 1 : 2, management: approach === "scope" ? -2 : -1 }
        : { clients: -1, coworkers: 0, management: 1 },
      source: content.systemsDispatch.title,
    });
    state.flags.systemsProgressAwarded = true;
  }
  if (!state.flags.systemsStatsRecorded) {
    state.stats.systemsJobsCompleted += 1;
    if (documented) {
      state.stats.systemMismatchesDocumented += 1;
      state.stats.documentedTaskRisks += 1;
    } else {
      state.stats.quickRebootsClosed += 1;
      state.stats.callbacks += 1;
    }
    state.flags.systemsStatsRecorded = true;
  }
  if (!documented) {
    recordReturnTripRisk("systemsQuickReboot", {
      source: content.systemsDispatch.title,
      detail: "Room was closed with a quick reboot while the control/network mismatch stayed loose.",
    });
  } else if (state.flags.returnTripRisks?.systemsQuickReboot) {
    resolveReturnTripRisk("systemsQuickReboot", {
      source: content.systemsDispatch.title,
      resolution: "Systems closeout documented the mismatch instead of leaving the reboot as the explanation.",
    });
  }
  addLog(documented
    ? "Closed the systems service with a usable mismatch note instead of pretending the reboot explained itself."
    : "Closed the systems service with a reboot. The room came online, and the callback ledger quietly found a chair.");
  const closeoutConsequences = [{
    source: content.systemsDispatch.title,
    status: documented ? "documented" : "open",
    cause: documented
      ? "Control/network mismatch was written into the closeout."
      : "Quick reboot restored the room without explaining the mismatch.",
    affects: getReturnTripRiskAffectedWork("systemsQuickReboot"),
    detail: documented
      ? "Future service gets a usable mismatch trail."
      : "Systems quick-reboot debt is now visible on the return-trip ledger.",
  }];
  recordJobSiteCloseoutSummary({
    source: content.systemsDispatch.title,
    result: state.flags.systemsApproach ? `Closeout path: ${state.flags.systemsApproach}` : "",
    before,
    consequences: closeoutConsequences,
  });
  render();
  showModal({
    kicker: "Systems Service Complete",
    title: approach === "scope" ? "Scope Miss Written In Human" : approach === "document" ? "The Next Tech Gets A Map" : "The Room Rebooted, Technically",
    body: `
      <div class="results-grid">
        <span>Systems wages</span><strong>+$${documented ? 68 : 52}</strong>
        <span>Cash balance</span><strong>${formatCash(state.cash)}</strong>
        <span>Experience</span><strong>+${xp} XP</strong>
        <span>Diagnostic quality</span><strong>${getSystemsDiagnosticSummary(strained)}</strong>
        <span>Relationship result</span><strong>${getSystemsReputationSummary(approach, strained)}</strong>
        <span>Return-trip risk</span><strong>${documented ? "Lowered by documenting the mismatch" : "Increased by leaving the mismatch loose"}</strong>
        <span>Career record</span><strong>${documented ? "Systems mismatch documented" : "Quick reboot closed"}</strong>
      </div>
      ${getCloseoutConsequenceMarkup(closeoutConsequences)}
      ${documented
        ? `<blockquote>Management note: "Please keep technical closeout proportionate to the original ticket."</blockquote>`
        : `<blockquote>Management note: "Thanks for resolving this quickly."</blockquote>`}
      ${getReturnPortalCloseoutNoteMarkup()}
    `,
    actions: [getCloseoutReturnAction(content.systemsDispatch.title, "Returned to Radnor Rack & Wire after the King of Prussia systems service.")],
  });
}
