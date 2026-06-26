// Callback cleanup / warranty return dispatch flow: troubleshoot, repair, and resolve return-trip pressure.
// This keeps callback-debt gameplay visible as its own reusable consequence pattern.
function showCallbackCleanupDispatchPreview() {
  const returnTripSummary = getOpenReturnTripRiskSummary();
  showModal({
    kicker: "Dispatch Board",
    title: content.callbackCleanupDispatch.title,
    body: getDispatchBoardMarkup({
      type: "Return Trip",
      familyId: "service",
      setup: "A callback is still sitting in the career ledger, and coordination wants it cleaned up before anyone says warranty hours out loud.",
      why: `Triggered by unresolved callback pressure. Current unresolved callbacks: ${getUnresolvedCallbackCount()}.${returnTripSummary ? ` ${returnTripSummary}` : ""}`,
      stakes: [
        "A real fix resolves ledger pressure and helps client trust.",
        "A quick bandage keeps warranty hours contained.",
        "Craftsmanship can turn the cleanup into a better handoff.",
      ],
      note: "The client says the room was marked complete, then immediately started acting like it read the closeout note.",
      managementNote: "Please determine whether this is truly a callback or simply extended closeout support.",
      fieldTasks: content.callbackCleanupDispatch.checks,
      taskCards: returnTripSummary ? [{
        title: "Open Return-Trip Risk",
        skill: "Troubleshooting 4",
        outcome: returnTripSummary,
      }] : [],
    }),
    actions: [
      getDispatchRoutePrepAction("warrantyReturn", showCallbackCleanupDispatchPreview),
      { label: "Return to Shop", className: "secondary-button" },
    ],
  });
}

function promptCallbackCleanupTravel({ fastTravel = false } = {}) {
  showTravelRouteModal({
    routeId: "warrantyReturn",
    dispatchEstimate: "Confirm user concern, restore confidence, avoid assigning blame in writing.",
    extraBody: `<p class="muted">The previous closeout note is short enough to remember accidentally.</p>`,
    fastTravel,
    beforeTravel: () => {
      state.flags.callbackCleanupStarted = true;
      markCareerSnapshotStale();
    },
  });
}

function getCallbackCleanupCheckEnergyCost() {
  return getVerificationEnergyCost(3);
}

function getCallbackCleanupRepairEnergyCost(baseCost) {
  return Math.max(0, getVerificationEnergyCost(baseCost) - getCarefulTaskReduction());
}

function inspectCallbackCleanupCondition(checkId) {
  const check = content.callbackCleanupDispatch.checks.find((item) => item.id === checkId);
  if (!check || state.callbackCleanupChecks.includes(checkId)) return notify(`${check?.label || "That callback note"} is already checked.`);
  const { skillCheck, energyCost } = resolveFieldTaskCheck({
    check,
    checkId,
    completedChecks: state.callbackCleanupChecks,
    flagKey: `callback-${checkId}`,
    baseEnergyCost: getCallbackCleanupCheckEnergyCost(),
    strainedFlag: "callbackTroubleshootingStrained",
    logText: `${check.label} checked: ${check.log}`,
    strainedLogText: `Callback skill check strained on ${check.label}; the fix will take more discipline to close cleanly.`,
  });
  render();
  const allChecked = state.callbackCleanupChecks.length === content.callbackCleanupDispatch.checks.length;
  showModal({
    kicker: "Callback Note",
    title: check.label,
    body: `
      <p>${check.detail}</p>
      ${getFieldTaskResultMarkup({ check, skillCheck, energyCost })}
      ${allChecked ? `<p class="muted">You found enough to decide whether this becomes a real fix or another quiet bandage.</p>` : ""}
    `,
    actions: [{ label: allChecked ? "Review Warranty Fix" : "Keep Troubleshooting", onClick: allChecked ? showCallbackCleanupChoice : render }],
  });
}

function showCallbackCleanupChoice() {
  if (state.flags.callbackCleanupComplete) {
    return showCompletedDispatchReturnReview({
      title: "Warranty Return Already Complete",
      source: content.callbackCleanupDispatch.title,
      result: state.flags.callbackCleanupApproach ? `Closeout path: ${state.flags.callbackCleanupApproach}` : "",
    });
  }
  showModal({
    kicker: "Warranty Decision",
    title: "The Callback Has A Cause",
    body: `
      <p>The issue came back because the previous closeout skipped the boring verification. The room can be fixed, documented, and removed from the callback ledger, or it can be made quiet enough for the ticket to close again.</p>
      ${getCarefulTaskReduction() ? `<p class="muted">Your careful-work habits reduce the proper fix cost by 1 energy.</p>` : ""}
      ${getChoicePressureMarkup([
        {
          label: "Fix the root cause",
          detail: "Costs energy and exposes the weak closeout; likely protects the client and reduces return-trip pressure.",
        },
        ...(getCraftsmanship() >= 3 ? [{
          label: "Clean repair",
          detail: "Higher-quality field work with stronger client handoff; management may question why the warranty visit took longer.",
        }] : []),
        {
          label: "Bandage it",
          detail: "Fastest ticket close. Management may like the clean-looking update, but the room can still punish someone later.",
        },
      ])}
    `,
    actions: [
      { label: `Fix root cause and update notes (-${getCallbackCleanupRepairEnergyCost(6)} energy)`, onClick: () => finishCallbackCleanup("root") },
      ...(getCraftsmanship() >= 3 ? [{
        label: `Clean repair and teach the client what changed (-${getCallbackCleanupRepairEnergyCost(5)} energy)`,
        className: "secondary-button",
        onClick: () => finishCallbackCleanup("craft"),
      }] : []),
      { label: "Bandage it and close the warranty ticket", className: "secondary-button", onClick: () => finishCallbackCleanup("bandage") },
    ],
  });
}

function finishCallbackCleanup(approach) {
  if (state.flags.callbackCleanupComplete) {
    return showCompletedDispatchReturnReview({
      title: "Warranty Return Already Complete",
      source: content.callbackCleanupDispatch.title,
      result: state.flags.callbackCleanupApproach ? `Closeout path: ${state.flags.callbackCleanupApproach}` : "",
    });
  }
  const before = getTrackedStateSnapshot();
  const resolved = approach !== "bandage";
  const strainedFix = Boolean(state.flags.callbackTroubleshootingStrained) && approach === "root";
  const xp = (approach === "craft" ? 65 : approach === "root" ? 55 : 35) - (strainedFix ? 5 : 0);
  const callbackRiskIds = ["usedTemporaryAdapterPermanently", "navyYardRackUpdate", "southPhillySpeakerTermination", "systemsQuickReboot"];
  const resolvedRiskId = resolved ? callbackRiskIds.find((riskId) => state.flags.returnTripRisks?.[riskId]) : "";
  if (resolved) changeEnergy(-(getCallbackCleanupRepairEnergyCost(approach === "craft" ? 5 : 6) + (strainedFix ? 2 : 0)));
  else state.burnout += 1;
  state.flags.callbackCleanupComplete = true;
  state.flags.callbackCleanupApproach = approach;
  markCareerSnapshotStale();
  setClock(`${state.clock.slice(0, 3)} ${resolved ? "11:16" : "10:38"} AM`);
  if (!state.flags.callbackCleanupPaid) {
    state.cash += resolved ? 68 : 54;
    state.flags.callbackCleanupPaid = true;
  }
  if (!state.flags.callbackCleanupProgressAwarded) {
    awardCareerProgress({
      xp,
      reputation: resolved
        ? { clients: strainedFix ? 1 : 2, coworkers: approach === "craft" ? 2 : 1, management: -1 }
        : { clients: 0, coworkers: 0, management: 1 },
      source: content.callbackCleanupDispatch.title,
    });
    state.flags.callbackCleanupProgressAwarded = true;
  }
  if (!state.flags.callbackCleanupStatsRecorded) {
    state.stats.warrantyReturnsCompleted += 1;
    if (resolved) {
      state.stats.callbacksResolved += 1;
      state.stats.carefulFinishes += 1;
    } else {
      state.stats.warrantyBandagesApplied += 1;
    }
    state.flags.callbackCleanupStatsRecorded = true;
  }
  if (resolvedRiskId) {
    resolveReturnTripRisk(resolvedRiskId, {
      source: content.callbackCleanupDispatch.title,
      resolution: "Warranty return fixed the cause and rebuilt the notes enough to remove this return-trip risk.",
    });
  }
  addLog(resolved
    ? "Resolved the warranty return and wrote notes the next tech can actually use."
    : "Closed the warranty ticket with a bandage. The callback ledger remains spiritually aware.");
  const closeoutConsequences = [{
    source: content.callbackCleanupDispatch.title,
    status: resolved ? "resolved" : "inherited",
    cause: resolved
      ? "Warranty return fixed the root cause instead of hiding the callback."
      : "Warranty return was bandaged to protect the ticket.",
    affects: resolvedRiskId ? getReturnTripRiskAffectedWork(resolvedRiskId) : "callback ledger and future warranty pressure",
    detail: resolved
      ? "Callback pressure drops and any matched return-trip risk moves into resolved history."
      : "Callback debt remains visible for future routing and trust pressure.",
  }];
  recordJobSiteCloseoutSummary({
    source: content.callbackCleanupDispatch.title,
    result: state.flags.callbackCleanupApproach ? `Closeout path: ${state.flags.callbackCleanupApproach}` : "",
    before,
    consequences: closeoutConsequences,
  });
  render();
  showModal({
    kicker: "Warranty Return Complete",
    title: approach === "craft" ? "The Room And The Client Are Both Calmer" : approach === "root" ? "The Callback Has Real Notes Now" : "The Ticket Is Quiet For Now",
    body: `
      <div class="results-grid">
        <span>Warranty wages</span><strong>+$${resolved ? 68 : 54}</strong>
        <span>Cash balance</span><strong>${formatCash(state.cash)}</strong>
        <span>Experience</span><strong>+${xp} XP</strong>
        <span>Callback ledger</span><strong>${resolved ? "Callback resolved" : "Callback debt remains"}</strong>
        <span>Unresolved callbacks</span><strong>${getUnresolvedCallbackCount()}</strong>
        ${strainedFix ? `<span>Skill consequence</span><strong>Root cause fixed, notes needed extra cleanup</strong>` : ""}
      </div>
      ${getCloseoutConsequenceMarkup(closeoutConsequences)}
      ${resolved
        ? `<blockquote>Management note: "Please avoid implying previous closeout was incomplete when documenting warranty support."</blockquote>`
        : `<blockquote>Management note: "Thanks for keeping warranty hours contained."</blockquote>`}
      ${getReturnPortalCloseoutNoteMarkup()}
    `,
    actions: [getCloseoutReturnAction(content.callbackCleanupDispatch.title, "Returned to Radnor Rack & Wire after the warranty return.")],
  });
}
