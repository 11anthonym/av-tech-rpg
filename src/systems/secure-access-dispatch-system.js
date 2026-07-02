// Navy Yard secure-access dispatch flow: prep, access checks, rack update tasks, and closeout.
// Keeping it separate makes future access/portal-heavy jobs easier to compare and reuse.
function showSecureAccessDispatchPreview() {
  showModal({
    kicker: "Dispatch Board",
    title: content.secureAccessDispatch.title,
    body: getDispatchBoardMarkup({
      type: "Access Quest",
      familyId: "logistics",
      setup: "Drop off a small rack update at a Navy Yard building with secure access. The ticket says Building 12. The forwarded email subject says Building 13.",
      why: "Unlocked after the warehouse run. The board has moved from missing parts to missing site-access details.",
      stakes: [
        "Preparation can reduce access-check or report costs.",
        "Once you reach the room, the rack update still has to be patched and verified.",
        "Documenting the delay builds the documentation habit.",
        "Absorbing the delay protects the ticket and adds burnout.",
      ],
      note: "The work order says the building mismatch is probably campus language.",
      managementNote: "Please do not let access delays affect today's schedule.",
      prep: state.flags.secureAccessPreparation ? `Preparation selected: ${getSecureAccessPreparationLabel()}` : "",
      taskCards: content.secureAccessDispatch.taskCards,
      fieldTasks: [
        ...content.secureAccessDispatch.checks,
        ...content.secureAccessDispatch.taskChecks,
      ],
    }),
    actions: [
      getDispatchRoutePrepAction("navyYardAccess", showSecureAccessDispatchPreview),
      { label: "Return to Shop", className: "secondary-button" },
    ],
  });
}

function getSecureAccessPreparationLabel() {
  return {
    review: "Reviewed access email",
    contact: "Called listed site contact",
    none: "Trusted work-order notes",
  }[state.flags.secureAccessPreparation] || "None";
}

function showSecureAccessPreparation() {
  showModal({
    kicker: "Before You Leave",
    title: "Prepare For Secure Access",
    body: `
      <p>The work order has a building number, a badge note, and a forwarded email chain where everyone spells the client acronym differently.</p>
      <p class="muted">Take one small preparation step before leaving Radnor Rack & Wire.</p>
    `,
    actions: [
      { label: "Review the access email", onClick: () => chooseSecureAccessPreparation("review") },
      { label: "Call the listed site contact", className: "secondary-button", onClick: () => chooseSecureAccessPreparation("contact") },
      { label: "Trust work-order notes", className: "secondary-button", onClick: () => chooseSecureAccessPreparation("none") },
    ],
  });
}

function chooseSecureAccessPreparation(preparation) {
  state.flags.secureAccessPreparation = preparation;
  let title = "The Ticket Will Have To Do";
  let body = `<p>The work-order note says "security aware," which is doing a heroic amount of work for two words.</p>`;
  if (preparation === "review") {
    title = "Access Email Reviewed";
    body = `
      <p>The email chain confirms the secure escort requirement. It also confirms nobody put your name in the visitor portal.</p>
      <p class="muted">The access checks should feel less messy.</p>
    `;
    addLog("Reviewed the Navy Yard access email and found the missing visitor-portal step.");
  }
  if (preparation === "contact") {
    title = "Site Contact Reached";
    body = `
      <p>The site contact answers between meetings and confirms Building 13. They cannot add you to the visitor list until security sees the work order.</p>
      <p class="muted">Documenting the access delay should feel less draining.</p>
    `;
    addLog("Called the Navy Yard site contact and confirmed the building mismatch.");
  }
  if (preparation === "none") addLog("Left for Navy Yard trusting the work-order notes.");
  render();
  showModal({
    kicker: "Preparation Selected",
    title,
    body,
    actions: [{ label: "Head To Navy Yard", onClick: promptSecureAccessTravel }],
  });
}

function promptSecureAccessTravel({ fastTravel = false } = {}) {
  showTravelRouteModal({
    routeId: "navyYardAccess",
    dispatchEstimate: "Quick rack update. Security already knows you are coming.",
    extraBody: `<p class="muted">Security may have received that information in a different timeline.</p>`,
    fastTravel,
    beforeTravel: () => {
      state.flags.secureAccessStarted = true;
      markCareerSnapshotStale();
    },
  });
}

function getSecureAccessCheckEnergyCost() {
  return Math.max(0, 3 - (state.flags.secureAccessPreparation === "review" ? 1 : 0) + getOpenCallbackPenalty());
}

function getSecureAccessReportEnergyCost(baseCost) {
  return Math.max(2, baseCost - (state.flags.secureAccessPreparation === "contact" ? 1 : 0) - getDocumentationSupportReduction());
}

function inspectSecureAccessCondition(checkId) {
  const check = content.secureAccessDispatch.checks.find((item) => item.id === checkId);
  if (!check || state.secureAccessChecks.includes(checkId)) return notify(`${check?.label || "That access issue"} is already in your notes.`);
  const { skillCheck, energyCost } = resolveFieldTaskCheck({
    check,
    checkId,
    completedChecks: state.secureAccessChecks,
    flagKey: `secure-access-${checkId}`,
    contextBonus: state.flags.secureAccessPreparation === "review" ? 1 : 0,
    baseEnergyCost: getSecureAccessCheckEnergyCost(),
    strainedFlag: "secureAccessNotesStrained",
    logText: `${check.label} checked: ${check.log}.`,
    strainedLogText: `Access skill check strained on ${check.label}; the note will be easier for management to downplay.`,
  });
  render();
  const allChecked = state.secureAccessChecks.length === content.secureAccessDispatch.checks.length;
  showModal({
    kicker: "Access Note",
    title: check.label,
    body: `
      <p>${check.detail}</p>
      ${getFieldTaskResultMarkup({ check, skillCheck, energyCost })}
      ${allChecked ? `<p class="muted">Access is finally sorted. Now the quick rack update still has to actually happen.</p>` : ""}
    `,
    actions: [{ label: allChecked ? "Enter Telecom Room" : "Keep Sorting Access", onClick: allChecked ? showSecureAccessWorkStart : render }],
  });
}

function showSecureAccessWorkStart() {
  state.flags.secureAccessRoomReached = true;
  showModal({
    kicker: "Telecom Room",
    title: "Now Do The Actual Job",
    body: `
      <p>The escort finally badges you into the telecom room. The rack update is small, but the rack does not know that.</p>
      <p class="muted">Find the correct rack unit, patch the encoder feed, and verify the room signal before closeout.</p>
    `,
    actions: [{ label: "Start Rack Update", onClick: render }],
  });
}

function getSecureAccessTaskEnergyCost(checkId) {
  const accessDrag = state.flags.secureAccessNotesStrained ? 1 : 0;
  const preparationHelp = state.flags.secureAccessPreparation === "contact" && checkId === "verify-signal" ? 1 : 0;
  return Math.max(1, 3 + accessDrag - preparationHelp);
}

function inspectSecureAccessTask(checkId) {
  const check = content.secureAccessDispatch.taskChecks.find((item) => item.id === checkId);
  if (!check || state.secureAccessTaskChecks.includes(checkId)) return notify(`${check?.label || "That rack task"} is already handled.`);
  const { skillCheck, energyCost } = resolveFieldTaskCheck({
    check,
    checkId,
    completedChecks: state.secureAccessTaskChecks,
    flagKey: `secure-access-task-${checkId}`,
    contextBonus: state.flags.secureAccessPreparation === "contact" && checkId === "verify-signal" ? 1 : 0,
    baseEnergyCost: getSecureAccessTaskEnergyCost(checkId),
    strainedFlag: "secureAccessTaskStrained",
    logText: `${check.label}: ${check.log}.`,
    strainedLogText: `Rack update check strained on ${check.label}; closeout will need clearer notes.`,
  });
  render();
  const allChecked = state.secureAccessTaskChecks.length === content.secureAccessDispatch.taskChecks.length;
  showModal({
    kicker: "Rack Update",
    title: check.label,
    body: `
      <p>${check.detail}</p>
      ${getFieldTaskResultMarkup({ check, skillCheck, energyCost })}
      ${allChecked ? `<p class="muted">The rack update is done. Now decide how honest the closeout gets about the access delay and the stale room label.</p>` : ""}
    `,
    actions: [{ label: allChecked ? "Close Out Navy Yard Job" : "Keep Working The Rack", onClick: allChecked ? showSecureAccessChoice : render }],
  });
}

function getSecureAccessTaskQualityLabel() {
  return state.flags.secureAccessTaskStrained
    ? "Rack update completed with strained verification"
    : "Rack update patched and verified";
}

function showSecureAccessChoice() {
  if (state.flags.secureAccessComplete) {
    return showCompletedDispatchReturnReview({
      title: "Secure Access Already Complete",
      source: content.secureAccessDispatch.title,
      result: getCompletedCloseoutPathResult("secureAccessApproach"),
    });
  }
  showModal({
    kicker: "Navy Yard Closeout",
    title: "The Work Is Done, The Story Is Not",
    body: `
      <p>The encoder feed is patched and the room signal verifies. Security, the building number, and the escort policy still disagree with the original work-order estimate.</p>
      <p>Management wants the ticket kept clean. The client would prefer an honest ETA and a note that the stale rack label changed.</p>
      ${state.flags.secureAccessTaskStrained ? `<p class="muted">One rack-update check was strained. Better closeout notes can keep that from becoming the next mystery.</p>` : ""}
      ${getDocumentationSupportReduction() ? `<p class="muted">Your documentation habits make the access-delay note faster to write.</p>` : ""}
      ${getOpenCallbackPenalty() ? `<p class="muted">The open callback still on the ledger made today's access shuffle feel heavier.</p>` : ""}
      ${getChoicePressureMarkup([
        {
          label: "Document access and rack change",
          detail: "Costs energy to protect the ETA trail and future support notes. Likely helps clients and coworkers, with management friction possible.",
        },
        ...(canUsePressureChoice() ? [{
          label: "Push coordination",
          detail: "Stronger accountability if you can carry the conversation. Best process pressure, but management may not enjoy owning the access miss.",
        }] : []),
        {
          label: "Eat the delay",
          detail: "Clean-ticket path. Saves the schedule story now, but hides the access problem and leaves the stale label easier to rediscover.",
        },
      ])}
    `,
    actions: [
      { label: "Document access delay and rack change", onClick: () => finishSecureAccess("document") },
      ...(canUsePressureChoice() ? [{
        label: "Push coordination to own the access miss and update notes",
        className: "secondary-button",
        onClick: () => finishSecureAccess("pushback"),
      }] : []),
      { label: "Mark rack update complete and eat the delay", className: "secondary-button", onClick: () => finishSecureAccess("absorb") },
    ],
  });
}

function finishSecureAccess(approach) {
  if (state.flags.secureAccessComplete) {
    return showCompletedDispatchReturnReview({
      title: "Secure Access Already Complete",
      source: content.secureAccessDispatch.title,
      result: getCompletedCloseoutPathResult("secureAccessApproach"),
    });
  }
  const before = getTrackedStateSnapshot();
  const honest = approach !== "absorb";
  const strainedNotes = Boolean(state.flags.secureAccessNotesStrained) && approach === "document";
  const strainedTask = Boolean(state.flags.secureAccessTaskStrained);
  const documentedTask = honest;
  const createsRackReturnRisk = strainedTask && !documentedTask;
  const xp = (approach === "pushback" ? 70 : approach === "document" ? 65 : 45) - (strainedNotes ? 5 : 0) - (strainedTask && !documentedTask ? 5 : 0);
  if (honest) changeEnergy(-getSecureAccessReportEnergyCost(approach === "pushback" ? 3 : 4));
  else state.burnout += 1;
  state.flags.secureAccessComplete = true;
  state.flags.secureAccessApproach = approach;
  markCareerSnapshotStale();
  setClock(`${state.clock.slice(0, 3)} ${approach === "absorb" ? "6:22" : "6:38"} PM`);
  if (!state.flags.secureAccessPaid) {
    state.cash += honest ? 112 : 96;
    state.flags.secureAccessPaid = true;
  }
  if (!state.flags.secureAccessProgressAwarded) {
    awardCareerProgress({
      xp,
      reputation: honest
        ? { clients: strainedNotes ? 0 : 1, coworkers: strainedTask ? 1 : 2, management: approach === "pushback" ? -2 : -1 }
        : { clients: strainedTask ? -1 : 0, coworkers: 0, management: 1 },
      source: content.secureAccessDispatch.title,
    });
    state.flags.secureAccessProgressAwarded = true;
  }
  if (!state.flags.secureAccessStatsRecorded) {
    state.stats.secureAccessJobsCompleted += 1;
    state.stats.fieldTaskChoicesMade += 1;
    if (honest) {
      state.stats.accessDelaysDocumented += 1;
      if (strainedTask) state.stats.documentedTaskRisks += 1;
    } else {
      state.stats.unpaidDelaysAbsorbed += 1;
    }
    if (createsRackReturnRisk) {
      state.stats.callbacks += 1;
      recordReturnTripRisk("navyYardRackUpdate", {
        source: content.secureAccessDispatch.title,
        detail: "A strained rack update was closed with the access delay hidden.",
      });
    }
    state.flags.secureAccessStatsRecorded = true;
  }
  addLog(honest
    ? "Documented the Navy Yard access delay and rack update before the schedule could pretend nothing happened."
    : "Completed the Navy Yard rack update while absorbing the access delay into a clean-looking ticket.");
  const closeoutConsequences = [{
    source: content.secureAccessDispatch.title,
    status: createsRackReturnRisk ? "open" : honest ? "documented" : "inherited",
    cause: createsRackReturnRisk
      ? "A strained rack update was closed while the access delay stayed hidden."
      : honest
      ? "The access delay and rack change were written into the closeout."
      : "The access delay was absorbed into a clean-looking ticket.",
    affects: getReturnTripRiskAffectedWork("navyYardRackUpdate"),
    detail: createsRackReturnRisk
      ? "Stale rack context stays on the return-trip ledger."
      : honest
      ? "Future support gets the rack/access context before guessing."
      : "The process problem remains hidden even though no named rack risk was recorded.",
  }];
  recordJobSiteCloseoutSummary({
    source: content.secureAccessDispatch.title,
    result: getCompletedCloseoutPathResult("secureAccessApproach"),
    before,
    consequences: closeoutConsequences,
  });
  render();
  showModal({
    kicker: "Secure Access Complete",
    title: approach === "pushback" ? "The Access Miss Has An Owner" : approach === "document" ? "The Delay And Rack Change Have A Trail" : "The Rack Works And The Ticket Looks Clean",
    body: `
      <div class="results-grid">
        <span>Access job wages</span><strong>+$${honest ? 112 : 96}</strong>
        <span>Cash balance</span><strong>${formatCash(state.cash)}</strong>
        <span>Experience</span><strong>+${xp} XP</strong>
        <span>Preparation</span><strong>${getSecureAccessPreparationLabel()}</strong>
        <span>Rack task</span><strong>${getSecureAccessTaskQualityLabel()}</strong>
        <span>Closeout</span><strong>${approach === "pushback" ? "Coordination access miss escalated" : approach === "document" ? "Delay and rack change documented" : "Delay absorbed"}</strong>
        ${strainedNotes ? `<span>Skill consequence</span><strong>Thin access notes limited client trust</strong>` : ""}
        ${createsRackReturnRisk ? `<span>Return-trip risk</span><strong>Stale rack note may send someone back</strong>` : ""}
      </div>
      ${getCloseoutConsequenceMarkup(closeoutConsequences)}
      ${honest
        ? `<blockquote>Management note: "Please avoid creating client-facing narratives around internal scheduling friction."</blockquote>`
        : `<blockquote>Management note: "Thanks for keeping the ticket clean. Please improve onsite arrival efficiency."</blockquote>`}
      ${getReturnPortalCloseoutNoteMarkup()}
    `,
    actions: [getCloseoutReturnAction(content.secureAccessDispatch.title, "Returned to Radnor Rack & Wire after the Navy Yard access job.")],
  });
}
