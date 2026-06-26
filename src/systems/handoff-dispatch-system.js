// Client handoff dispatch flow: prep checks, walkthrough choices, and training-gap closeout.
// This keeps handoff/training consequence gameplay separate from other site visits.
function showHandoffDispatchPreview() {
  showModal({
    kicker: "Dispatch Board",
    title: content.handoffDispatch.title,
    body: getDispatchBoardMarkup({
      type: "Client Handoff",
      familyId: "handoff",
      setup: "The room works, but the client needs to run the same meeting without becoming an unpaid AV tech.",
      why: state.flags.callbackCleanupComplete
        ? "Unlocked after the warranty return. The room is quieter now; the client still needs the human version."
        : "Clean callback ledger skipped the warranty return, so the board moved you to a handoff.",
      stakes: [
        "Confidence can unlock a better cheat-sheet option.",
        "Documentation habit reduces handoff prep costs.",
        "A quick demo keeps management happy and leaves a training gap.",
      ],
      note: "The service ticket says this is just a quick demo. The client says the executive assistant has actual questions.",
      managementNote: "Please keep training concise. The system is designed to be intuitive.",
      fieldTasks: content.handoffDispatch.checks,
    }),
    actions: [
      getDispatchRoutePrepAction("executiveHandoff", showHandoffDispatchPreview),
      { label: "Return to Shop", className: "secondary-button" },
    ],
  });
}

function promptHandoffTravel({ fastTravel = false } = {}) {
  showTravelRouteModal({
    routeId: "executiveHandoff",
    dispatchEstimate: "Five-minute walkthrough. No technical work expected.",
    extraBody: `<p class="muted">No technical work expected is also what they said about the warranty return.</p>`,
    fastTravel,
    beforeTravel: () => {
      state.flags.handoffStarted = true;
      markCareerSnapshotStale();
    },
  });
}

function getHandoffCheckEnergyCost() {
  return Math.max(0, 2 - getDocumentationSupportReduction());
}

function getHandoffEnergyCost(baseCost) {
  return Math.max(0, baseCost - getDocumentationSupportReduction());
}

function inspectHandoffCondition(checkId) {
  const check = content.handoffDispatch.checks.find((item) => item.id === checkId);
  if (!check || state.handoffChecks.includes(checkId)) return notify(`${check?.label || "That handoff note"} is already checked.`);
  const { skillCheck, energyCost } = resolveFieldTaskCheck({
    check,
    checkId,
    completedChecks: state.handoffChecks,
    flagKey: `handoff-${checkId}`,
    contextBonus: getDocumentationSupportReduction(),
    baseEnergyCost: getHandoffCheckEnergyCost(),
    strainedFlag: "handoffPrepStrained",
    logText: `${check.label} checked: ${check.log}`,
    strainedLogText: `Handoff skill check strained on ${check.label}; the walkthrough risks sounding like button labels.`,
  });
  render();
  const allChecked = state.handoffChecks.length === content.handoffDispatch.checks.length;
  showModal({
    kicker: "Handoff Note",
    title: check.label,
    body: `
      <p>${check.detail}</p>
      ${getFieldTaskResultMarkup({ check, skillCheck, energyCost })}
      ${allChecked ? `<p class="muted">You know enough to decide whether this is a real handoff or a fast button tour.</p>` : ""}
    `,
    actions: [{ label: allChecked ? "Review Handoff Plan" : "Keep Preparing Handoff", onClick: allChecked ? showHandoffChoice : render }],
  });
}

function showHandoffChoice() {
  if (state.flags.handoffComplete) {
    return showCompletedDispatchReturnReview({
      title: "Client Handoff Already Complete",
      source: content.handoffDispatch.title,
      result: state.flags.handoffApproach ? `Closeout path: ${state.flags.handoffApproach}` : "",
    });
  }
  showModal({
    kicker: "Client Handoff",
    title: "The Room Works If Someone Explains It",
    body: `
      <p>The client does not need every feature. They need the morning meeting to start without a group of executives silently watching a laptop search for audio.</p>
      ${getDocumentationSupportReduction() ? `<p class="muted">Your documentation habits make the walkthrough notes and cheat sheet faster to prepare.</p>` : ""}
      ${getChoicePressureMarkup([
        {
          label: "Patient walkthrough",
          detail: "Costs energy now; likely improves client confidence while management may see extra training time.",
        },
        ...(canUsePressureChoice() ? [{
          label: "Client-language cheat sheet",
          detail: "Turns technical labels into a usable daily path. Strong client upside, still slower than leaving.",
        }] : []),
        {
          label: "Quick demo",
          detail: "Fastest closeout. The room works, but usage questions may come back through someone else.",
        },
      ])}
    `,
    actions: [
      { label: `Patient walkthrough of the daily path (-${getHandoffEnergyCost(5)} energy)`, onClick: () => finishHandoff("patient") },
      ...(canUsePressureChoice() ? [{
        label: `Rewrite the cheat sheet in client language (-${getHandoffEnergyCost(4)} energy)`,
        className: "secondary-button",
        onClick: () => finishHandoff("cheat"),
      }] : []),
      { label: "Quick demo and leave before questions", className: "secondary-button", onClick: () => finishHandoff("quick") },
    ],
  });
}

function finishHandoff(approach) {
  if (state.flags.handoffComplete) {
    return showCompletedDispatchReturnReview({
      title: "Client Handoff Already Complete",
      source: content.handoffDispatch.title,
      result: state.flags.handoffApproach ? `Closeout path: ${state.flags.handoffApproach}` : "",
    });
  }
  const before = getTrackedStateSnapshot();
  const helpful = approach !== "quick";
  const strainedPrep = Boolean(state.flags.handoffPrepStrained) && approach === "patient";
  const xp = (approach === "cheat" ? 60 : approach === "patient" ? 50 : 30) - (strainedPrep ? 5 : 0);
  if (helpful) changeEnergy(-getHandoffEnergyCost(approach === "cheat" ? 4 : 5));
  state.flags.handoffComplete = true;
  state.flags.handoffApproach = approach;
  markCareerSnapshotStale();
  setClock(`${state.clock.slice(0, 3)} ${helpful ? "2:28" : "2:03"} PM`);
  if (!state.flags.handoffPaid) {
    state.cash += helpful ? 64 : 48;
    state.flags.handoffPaid = true;
  }
  if (!state.flags.handoffProgressAwarded) {
    awardCareerProgress({
      xp,
      reputation: helpful
        ? { clients: approach === "cheat" ? 3 : strainedPrep ? 1 : 2, coworkers: 1, management: -1 }
        : { clients: 0, coworkers: 0, management: 1 },
      source: content.handoffDispatch.title,
    });
    state.flags.handoffProgressAwarded = true;
  }
  if (!state.flags.handoffStatsRecorded) {
    state.stats.clientHandoffsCompleted += 1;
    if (helpful) state.stats.carefulFinishes += 1;
    else state.stats.trainingGapsLeft += 1;
    state.flags.handoffStatsRecorded = true;
  }
  addLog(helpful
    ? "Completed the handoff in client language instead of button-label language."
    : "Completed a quick demo. The client now knows enough to ask better questions later.");
  const closeoutConsequences = [{
    source: content.handoffDispatch.title,
    status: helpful ? "controlled" : "inherited",
    cause: helpful
      ? "Client handoff translated the room into usable daily steps."
      : "The room was demoed quickly and the training gap stayed with the client.",
    affects: "future handoff support and client confidence",
    detail: helpful
      ? "Future questions start from a better client habit."
      : "Future support may inherit more user confusion.",
  }];
  recordJobSiteCloseoutSummary({
    source: content.handoffDispatch.title,
    result: state.flags.handoffApproach ? `Closeout path: ${state.flags.handoffApproach}` : "",
    before,
    consequences: closeoutConsequences,
  });
  render();
  showModal({
    kicker: "Handoff Complete",
    title: approach === "cheat" ? "The Cheat Sheet Makes Sense To Humans" : approach === "patient" ? "The Client Can Start The Meeting" : "The Demo Was Technically A Demo",
    body: `
      <div class="results-grid">
        <span>Handoff wages</span><strong>+$${helpful ? 64 : 48}</strong>
        <span>Cash balance</span><strong>${formatCash(state.cash)}</strong>
        <span>Experience</span><strong>+${xp} XP</strong>
        <span>Client outcome</span><strong>${approach === "cheat" ? "Cheat sheet rewritten" : approach === "patient" ? "Daily path practiced" : "Training gap left"}</strong>
      </div>
      ${getCloseoutConsequenceMarkup(closeoutConsequences)}
      ${helpful
        ? `<blockquote>Management note: "Please avoid expanding simple handoffs into undocumented training sessions."</blockquote>`
        : `<blockquote>Management note: "Thanks for keeping the handoff efficient."</blockquote>`}
      ${getReturnPortalCloseoutNoteMarkup()}
    `,
    actions: [getCloseoutReturnAction(content.handoffDispatch.title, "Returned to Radnor Rack & Wire after the executive handoff.")],
  });
}
