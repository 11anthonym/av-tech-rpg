// South Philadelphia commissioning flow: technical task choice, speaker-risk consequence, and closeout.
// This isolates one of the stronger in-job RPG decision patterns from the main app controller.
function showCommissioningDispatchPreview() {
  showModal({
    kicker: "Dispatch Board",
    title: content.commissioningDispatch.title,
    body: getDispatchBoardMarkup({
      type: "Commissioning",
      familyId: "commissioning",
      setup: "Verify a small South Philadelphia training room before client handoff. The installation ticket is closed, but the client says one side of the room sounds quieter.",
      why: "Unlocked after the University City survey. This job tests whether incomplete-site troubleshooting can become a clean closeout.",
      stakes: [
        "Craftsmanship can unlock a cleaner punch-list option.",
        "Passing the room protects management's schedule.",
        "Documenting the fault improves client and coworker trust.",
      ],
      note: "The completion sheet has already been signed internally.",
      managementNote: "Room complete except final commissioning. Please avoid creating a punch list unless necessary.",
      taskCards: content.commissioningDispatch.taskCards,
      fieldTasks: [
        ...content.commissioningDispatch.checks,
        ...content.commissioningDispatch.terminationTasks,
      ],
    }),
    actions: [
      getDispatchRoutePrepAction("southPhillyCommissioning", showCommissioningDispatchPreview),
      { label: "Return to Shop", className: "secondary-button" },
    ],
  });
}

function promptCommissioningTravel({ fastTravel = false } = {}) {
  showTravelRouteModal({
    routeId: "southPhillyCommissioning",
    dispatchEstimate: "Confirm room operation and collect client signoff.",
    extraBody: `<p class="muted">The completion sheet has already been signed internally.</p>`,
    fastTravel,
    beforeTravel: () => {
      state.flags.commissioningStarted = true;
    },
  });
}

function getCommissioningCheckEnergyCost() {
  return getVerificationEnergyCost(3);
}

function getCommissioningRepairEnergyCost(baseCost) {
  return Math.max(0, getVerificationEnergyCost(baseCost) - getCarefulTaskReduction());
}

function getCommissioningTerminationTask(action = state.flags.commissioningTerminationAction) {
  return content.commissioningDispatch.terminationTasks?.find((task) => task.id === action) || null;
}

function getCommissioningTerminationContextBonus(task) {
  if (!task) return 0;
  if (task.contextBonusSource === "carefulWork") return getCarefulWorkReduction();
  if (task.contextBonusSource === "documentationSupport") return getDocumentationSupportReduction();
  if (task.contextBonusSource === "ownedOptionalTool" && task.optionalTool && ownsTool(task.optionalTool)) {
    return task.optionalToolBonus || 1;
  }
  return task.contextBonus || 0;
}

function getCommissioningTerminationTaskDifficulty(action) {
  const task = getCommissioningTerminationTask(action);
  if (!task) return 0;
  if (action === "clean" && state.flags.terminationSkillStrained) return task.strainedDifficulty ?? task.difficulty ?? 0;
  return task.difficulty ?? 0;
}

function getCommissioningTerminationTaskEnergyCost(action) {
  const task = getCommissioningTerminationTask(action);
  const carefulDiscount = task?.carefulDiscount === false ? 0 : getCarefulTaskReduction();
  return Math.max(0, getVerificationEnergyCost(task?.energyCost ?? 3) - carefulDiscount);
}

function getCommissioningCloseoutEnergyCost(approach) {
  if (approach === "pass") return 0;
  const hasTaskAction = Boolean(state.flags.commissioningTerminationAction);
  const baseCost = hasTaskAction ? (approach === "craft" ? 4 : 3) : (approach === "craft" ? 5 : 6);
  const riskPenalty = state.flags.commissioningTerminationCallbackRisk && approach === "repair" ? 1 : 0;
  return getCommissioningRepairEnergyCost(baseCost) + riskPenalty;
}

function getCommissioningTerminationTaskLabel(action = state.flags.commissioningTerminationAction) {
  const task = getCommissioningTerminationTask(action);
  return task?.resultLabel || task?.label || "No termination task selected";
}

function getCommissioningTerminationActionLabel(action) {
  const task = getCommissioningTerminationTask(action);
  return `${task?.label || getCommissioningTerminationTaskLabel(action)} (-${getCommissioningTerminationTaskEnergyCost(action)} energy)`;
}

function getCommissioningTerminationQualityLabel(quality = state.flags.commissioningTerminationQuality) {
  const labels = {
    temporary: "Works now, weak strain relief",
    functional: "Functional termination",
    clean: "Clean termination",
    strained: "Functional under strain",
    documented: "Readable path documented",
    "documented-clean": "Labeled cleanly",
    "thin-notes": "Notes are thin",
    "reopen-documented": "Mismatch documented",
    "reopen-thin": "Mismatch noted thinly",
  };
  return labels[quality] || "No task outcome yet";
}

function isCommissioningTerminationClean() {
  return ["clean", "documented-clean"].includes(state.flags.commissioningTerminationQuality);
}

function isCommissioningTerminationStable() {
  return ["functional", "clean", "documented", "documented-clean", "reopen-documented"].includes(state.flags.commissioningTerminationQuality);
}

function isCommissioningRiskDocumented(approach) {
  return approach === "craft" || ["label", "document"].includes(state.flags.commissioningTerminationAction);
}

function shouldAddCommissioningCallback(approach) {
  if (approach === "pass") return !isCommissioningTerminationStable();
  if (approach === "craft") return false;
  if (state.flags.commissioningTerminationCallbackRisk) return true;
  return Boolean(state.flags.terminationSkillStrained) && !state.flags.commissioningTerminationAction;
}

function getCommissioningCallbackDetail(approach) {
  if (approach === "pass") return "Silent speaker was passed as complete.";
  if (state.flags.commissioningTerminationAction === "quick") return "Loose speaker line was re-landed quickly without enough strain relief.";
  if (state.flags.commissioningTerminationCallbackRisk) return `Termination task outcome: ${getCommissioningTerminationQualityLabel()}.`;
  return "Commissioning closeout left a known speaker-path risk.";
}

function getCommissioningTerminationTaskSummaryMarkup() {
  if (!state.flags.commissioningTerminationAction) return "";
  return `
    <div class="results-grid">
      <span>Termination task</span><strong>${getCommissioningTerminationTaskLabel()}</strong>
      <span>Task outcome</span><strong>${getCommissioningTerminationQualityLabel()}</strong>
      <span>Return-trip risk</span><strong>${state.flags.commissioningTerminationCallbackRisk ? "Possible unless documented cleanly" : "Controlled"}</strong>
    </div>
  `;
}

function getCommissioningTerminationTaskResult(action = state.flags.commissioningTerminationAction) {
  const task = getCommissioningTerminationTask(action);
  if (!task) return null;
  return state.flags.fieldTaskResults?.[`commissioning-termination-${action}`]
    || getFieldTaskResultForCheck(task);
}

function getCommissioningTerminationTaskState() {
  if (!state.flags.commissioningBrief) return getTaskState({ lockedReason: "Check in with the client contact first." });
  if (!state.commissioningChecks.includes("termination")) {
    return getDispatchFieldCheckTaskState({
      checks: content.commissioningDispatch.checks,
      checkId: "termination",
      completedChecks: state.commissioningChecks,
      readyDetail: "Inspect the credenza termination before deciding how to close out the room.",
    });
  }
  if (!state.flags.commissioningTerminationAction) {
    return getTaskState({
      stateId: "ready",
      detail: "Choose how to handle the loose speaker line before closeout.",
    });
  }
  const result = getCommissioningTerminationTaskResult();
  return result
    ? getTaskState({ result })
    : getTaskState({
      completed: true,
      detail: `${getCommissioningTerminationTaskLabel()}: ${getCommissioningTerminationQualityLabel()}.`,
    });
}

function showCommissioningTerminationTaskReview() {
  if (!state.flags.commissioningTerminationAction) return showCommissioningTerminationChoice();
  const result = getCommissioningTerminationTaskResult();
  showModal({
    kicker: "Field Task Review",
    title: getCommissioningTerminationTaskLabel(),
    body: `
      <p>${escapeHtml(state.flags.commissioningTerminationTaskOutcome || "The termination task is in your closeout notes.")}</p>
      ${getCommissioningTerminationTaskSummaryMarkup()}
      <p><strong>Saved task result:</strong></p>
      ${result ? `<ul class="modal-list">${getFieldTaskResultEntryMarkup(result)}</ul>` : `<p class="muted">No saved task result is attached to this action yet.</p>`}
      <p class="muted">This is the part of the room the closeout choice will inherit.</p>
    `,
    actions: [{ label: "Back To Commissioning", onClick: render }],
  });
}

function getCommissioningTerminationSkillCheck(action) {
  const task = getCommissioningTerminationTask(action);
  if (!task?.skillId) return null;
  return resolveSkillCheck(`commissioning-termination-action-${action}`, {
    skillId: task.skillId,
    difficulty: getCommissioningTerminationTaskDifficulty(action),
    contextBonus: getCommissioningTerminationContextBonus(task),
    contextId: task.contextId,
  });
}

function resolveCommissioningTerminationTask(action) {
  if (state.flags.commissioningTerminationAction) return notify("The termination task is already in your closeout notes.");
  const task = getCommissioningTerminationTask(action);
  if (!task) return notify("That termination task is not available.");
  const energyCost = getCommissioningTerminationTaskEnergyCost(action);
  const skillCheck = getCommissioningTerminationSkillCheck(action);
  let quality = "temporary";
  let callbackRisk = false;
  let outcome = "The speaker plays again, but the path still deserves a better closeout.";

  changeEnergy(-energyCost);
  if (action === "quick") {
    quality = "temporary";
    callbackRisk = true;
    outcome = "The test tone comes back immediately. The cable has not become more trustworthy.";
  } else if (action === "clean") {
    quality = skillCheck.successful ? (skillCheck.tier === "clean" ? "clean" : "functional") : "strained";
    callbackRisk = !skillCheck.successful;
    outcome = skillCheck.successful
      ? "The conductor is landed cleanly enough that the room can be trusted."
      : "The speaker works, but the termination fought you and deserves an honest closeout.";
  } else if (action === "label") {
    quality = skillCheck.successful ? (skillCheck.tier === "clean" ? "documented-clean" : "documented") : "thin-notes";
    callbackRisk = !skillCheck.successful && Boolean(state.flags.terminationSkillStrained);
    outcome = skillCheck.successful
      ? "The signal path is readable now. The next tech will not have to rediscover the room."
      : "The path is less mysterious, but the notes are not strong enough to protect a sloppy closeout.";
  } else {
    quality = skillCheck.successful ? "reopen-documented" : "reopen-thin";
    callbackRisk = false;
    outcome = skillCheck.successful
      ? "The mismatch is documented before the room gets another confident status update."
      : "The concern is on paper, but the explanation is thin enough for management to argue with.";
  }

  state.flags.commissioningTerminationAction = action;
  state.flags.commissioningTerminationQuality = quality;
  state.flags.commissioningTerminationCallbackRisk = callbackRisk;
  state.flags.commissioningTerminationTaskOutcome = outcome;
  recordFieldTaskResult({
    flagKey: `commissioning-termination-${action}`,
    check: task,
    checkId: action,
    skillCheck,
    energyCost,
    skillId: task.skillId || "",
    difficulty: getCommissioningTerminationTaskDifficulty(action),
    contextId: task.contextId || "",
    successful: skillCheck ? skillCheck.successful : !callbackRisk,
  });
  state.stats.fieldTaskChoicesMade += 1;
  addLog(`${getCommissioningTerminationTaskLabel(action)}: ${outcome}`);
  render();
  showModal({
    kicker: "Field Task Result",
    title: getCommissioningTerminationTaskLabel(action),
    body: `
      <p>${outcome}</p>
      ${getFieldTaskResultMarkup({ check: task, skillCheck, energyCost, successful: skillCheck ? skillCheck.successful : !callbackRisk })}
      <div class="results-grid">
        <span>Task outcome</span><strong>${getCommissioningTerminationQualityLabel(quality)}</strong>
        <span>Return-trip risk</span><strong>${callbackRisk ? "Possible" : "Controlled"}</strong>
      </div>
    `,
    actions: [{ label: "Return To Commissioning", onClick: render }],
  });
}

function showCommissioningTerminationChoice() {
  showModal({
    kicker: "Field Task",
    title: "The Loose Speaker Line Needs A Choice",
    body: `
      <p>The third speaker line is loose at the output block. This is the moment where skill matters: a fast re-land can make the room quiet enough to pass, but the next person may inherit the same fault.</p>
      <ul class="modal-list">
        <li><strong>Install ${getSkillValue("install")}</strong><span>Clean re-termination tests your physical install skill.</span></li>
        <li><strong>Documentation ${getSkillValue("documentation")}</strong><span>Readable labels and notes protect the next tech from the mirrored drawing.</span></li>
        <li><strong>Client Communication ${getSkillValue("clientCommunication")}</strong><span>Explaining the mismatch can protect trust while hurting schedule optics.</span></li>
      </ul>
      ${ownsTool("labeler") ? `<p class="muted">Josh's rebuilt labeler unlocks a stronger trace-and-label path.</p>` : `<p class="muted">A labeler would make the documentation path stronger here.</p>`}
      ${getChoicePressureMarkup([
        {
          label: "Re-land fast",
          detail: "Lowest-effort technical answer. It may get audio back, but the underlying workmanship risk is less controlled.",
        },
        {
          label: "Re-terminate cleanly",
          detail: "Costs more energy and tests install skill. Stronger chance the room stays fixed after you leave.",
        },
        ...(ownsTool("labeler") ? [{
          label: "Trace and label",
          detail: "Uses Josh's labeler to protect the next tech and make the weird path readable.",
        }] : []),
        {
          label: "Document first",
          detail: "Slower process choice. Helps explain the mismatch before touching something the paperwork says is already fine.",
        },
      ])}
    `,
    actions: [
      { label: getCommissioningTerminationActionLabel("quick"), onClick: () => resolveCommissioningTerminationTask("quick") },
      { label: getCommissioningTerminationActionLabel("clean"), onClick: () => resolveCommissioningTerminationTask("clean") },
      ...(ownsTool("labeler") ? [{
        label: getCommissioningTerminationActionLabel("label"),
        className: "secondary-button",
        onClick: () => resolveCommissioningTerminationTask("label"),
      }] : []),
      { label: getCommissioningTerminationActionLabel("document"), className: "secondary-button", onClick: () => resolveCommissioningTerminationTask("document") },
    ],
  });
}

function inspectCommissioningCondition(checkId) {
  const check = content.commissioningDispatch.checks.find((item) => item.id === checkId);
  if (!check || state.commissioningChecks.includes(checkId)) return notify(`${check?.label || "That condition"} is already in your notes.`);
  const { skillCheck, energyCost } = resolveFieldTaskCheck({
    check,
    checkId,
    completedChecks: state.commissioningChecks,
    flagKey: `commissioning-${checkId}`,
    contextBonus: checkId === "termination" && ownsTool("labeler") ? 1 : 0,
    baseEnergyCost: getCommissioningCheckEnergyCost(),
    strainedFlag: checkId === "termination" ? "terminationSkillStrained" : checkId === "drawing" ? "commissioningNotesStrained" : "",
    logText: `${check.label} checked: ${check.log}`,
    strainedLogText: `Commissioning skill check strained on ${check.label}; the closeout will need a stronger choice to stay clean.`,
  });
  render();
  const allChecked = state.commissioningChecks.length === content.commissioningDispatch.checks.length;
  const needsTerminationTask = state.commissioningChecks.includes("termination") && !state.flags.commissioningTerminationAction;
  showModal({
    kicker: "Commissioning Note",
    title: check.label,
    body: `
      <p>${check.detail}</p>
      ${getFieldTaskResultMarkup({ check, skillCheck, energyCost })}
      ${ownsTool("labeler") ? `<p class="muted">Josh's rebuilt labeler makes it easier to leave the suspect path readable.</p>` : ""}
      ${checkId === "termination" ? `<p class="muted">The loose line now needs a field-task choice before the closeout can be trusted.</p>` : ""}
      ${allChecked ? `<p class="muted">You found the room issue. Return to the client contact and close out the visit.</p>` : ""}
    `,
    actions: [{
      label: needsTerminationTask ? "Choose Termination Task" : allChecked ? "Return To Client Contact" : "Keep Testing",
      onClick: needsTerminationTask ? showCommissioningTerminationChoice : allChecked ? showCommissioningChoice : render,
    }],
  });
}

function showCommissioningChoice() {
  if (state.flags.commissioningComplete) {
    return showCompletedDispatchReturnReview({
      title: "Commissioning Visit Already Complete",
      source: content.commissioningDispatch.title,
      result: state.flags.commissioningApproach ? `Closeout path: ${state.flags.commissioningApproach}` : "",
    });
  }
  if (!state.flags.commissioningTerminationAction && state.commissioningChecks.includes("termination")) return showCommissioningTerminationChoice();
  const canCleanTerminate = isCommissioningTerminationClean()
    || ["label", "document"].includes(state.flags.commissioningTerminationAction)
    || getSkillValue("install") >= 4
    || getCraftsmanship() >= 3;
  showModal({
    kicker: "Commissioning Decision",
    title: "The Room Is Complete On Paper",
    body: `
      <p>The third ceiling speaker is silent because its termination is loose. The drawing is for a mirrored room across the hall, which explains why the closed ticket was so confident.</p>
      <p>The client would like the room working. Project management would like the completion sheet to remain emotionally undisturbed.</p>
      ${getCommissioningTerminationTaskSummaryMarkup()}
      ${getCarefulTaskReduction() ? `<p class="muted">Your careful-work habits are paying off: repair and punch-list work costs 1 less energy.</p>` : ""}
      ${state.flags.commissioningTerminationCallbackRisk ? `<p class="muted">The field task left a return-trip risk. A clean punch-list closeout can expose it before it becomes a surprise callback.</p>` : ""}
      ${getChoicePressureMarkup([
        {
          label: "Repair and document",
          detail: "Costs energy and protects the client with a usable discrepancy note. Management may dislike the extra paper trail.",
        },
        ...(canCleanTerminate ? [{
          label: "Clean punch list",
          detail: "Strongest field-quality stance. It owns the mismatch now, with possible schedule pressure later.",
        }] : []),
        {
          label: "Pass the room",
          detail: "Fastest closeout. The current notes may be enough, or they may hand the next problem to someone else.",
        },
      ])}
    `,
    actions: [
      { label: `Tell client it is repaired and document discrepancy (-${getCommissioningCloseoutEnergyCost("repair")} energy)`, onClick: () => finishCommissioning("repair") },
      ...(canCleanTerminate ? [{
        label: `Issue clean punch list and own the mismatch (-${getCommissioningCloseoutEnergyCost("craft")} energy)`,
        className: "secondary-button",
        onClick: () => finishCommissioning("craft"),
      }] : []),
      { label: "Mark room passed with current task notes", className: "secondary-button", onClick: () => finishCommissioning("pass") },
    ],
  });
}

function finishCommissioning(approach) {
  if (state.flags.commissioningComplete) {
    return showCompletedDispatchReturnReview({
      title: "Commissioning Visit Already Complete",
      source: content.commissioningDispatch.title,
      result: state.flags.commissioningApproach ? `Closeout path: ${state.flags.commissioningApproach}` : "",
    });
  }
  if (!state.flags.commissioningTerminationAction && state.commissioningChecks.includes("termination")) return showCommissioningTerminationChoice();
  const before = getTrackedStateSnapshot();
  const careful = approach !== "pass";
  const cleanTask = isCommissioningTerminationClean();
  const stableTask = isCommissioningTerminationStable();
  const callbackRiskAdded = shouldAddCommissioningCallback(approach);
  const documentedRisk = isCommissioningRiskDocumented(approach);
  const strainedRepair = Boolean(state.flags.terminationSkillStrained) && approach === "repair" && !state.flags.commissioningTerminationAction;
  const taskBonus = cleanTask && careful ? 5 : approach === "pass" && cleanTask ? 3 : 0;
  const taskPenalty = callbackRiskAdded && careful ? 5 : 0;
  const xp = Math.max(25, (approach === "craft" ? 65 : approach === "repair" ? 58 : 40) + taskBonus - taskPenalty - (strainedRepair ? 5 : 0));
  const reputation = careful
    ? {
      clients: Math.max(0, (approach === "craft" ? 2 : 1) + (cleanTask && !callbackRiskAdded ? 1 : 0) - (callbackRiskAdded ? 1 : 0)),
      coworkers: approach === "craft" || documentedRisk ? 2 : 1,
      management: approach === "craft" ? -2 : -1,
    }
    : {
      clients: stableTask ? 1 : 0,
      coworkers: stableTask ? 0 : -1,
      management: 1,
    };
  const callbackDetail = callbackRiskAdded ? getCommissioningCallbackDetail(approach) : "";

  if (careful) changeEnergy(-getCommissioningCloseoutEnergyCost(approach));
  state.flags.commissioningComplete = true;
  state.flags.commissioningApproach = approach;
  state.flags.commissioningCallbackRiskAdded = callbackRiskAdded;
  state.flags.commissioningRiskDocumented = documentedRisk;
  markCareerSnapshotStale();
  setClock(`${state.clock.slice(0, 3)} ${approach === "pass" ? (cleanTask ? "3:47" : "3:39") : approach === "craft" ? "4:12" : "4:03"} PM`);
  if (!state.flags.commissioningPaid) {
    state.cash += 84;
    state.flags.commissioningPaid = true;
  }
  if (!state.flags.commissioningProgressAwarded) {
    awardCareerProgress({
      xp,
      reputation,
      source: content.commissioningDispatch.title,
    });
    state.flags.commissioningProgressAwarded = true;
  }
  if (!state.flags.commissioningStatsRecorded) {
    state.stats.commissioningRoomsCompleted += 1;
    if (careful) {
      state.stats.incompleteRoomsDocumented += 1;
      state.stats.carefulFinishes += 1;
    } else {
      state.stats.roomsPassedAnyway += 1;
    }
    if (cleanTask) state.stats.cleanTerminations += 1;
    if (documentedRisk) state.stats.documentedTaskRisks += 1;
    if (callbackRiskAdded) {
      state.stats.callbacks += 1;
      recordReturnTripRisk("southPhillySpeakerTermination", {
        source: content.commissioningDispatch.title,
        detail: callbackDetail,
      });
    }
    state.flags.commissioningStatsRecorded = true;
  }
  addLog(careful
    ? `${getCommissioningTerminationTaskLabel()} and closed the South Philadelphia room with ${approach === "craft" ? "a clean punch list" : "a documented repair"}.`
    : `Marked the South Philadelphia room passed after: ${getCommissioningTerminationTaskLabel()}.`);
  if (callbackRiskAdded) addLog(`Return-trip risk recorded: ${callbackDetail}`);
  const closeoutConsequences = [{
    source: content.commissioningDispatch.title,
    status: callbackRiskAdded ? "open" : documentedRisk ? "documented" : stableTask ? "controlled" : "inherited",
    cause: callbackRiskAdded
      ? callbackDetail
      : documentedRisk
      ? "Speaker-path risk was documented in closeout."
      : stableTask
      ? "Termination work was stable enough to avoid a callback."
      : "Room was passed with thin task notes.",
    affects: getReturnTripRiskAffectedWork("southPhillySpeakerTermination"),
    detail: callbackRiskAdded
      ? "Speaker-path risk is now visible on the return-trip ledger."
      : documentedRisk
      ? "Future work sees the discrepancy before it becomes a surprise."
      : stableTask
      ? "No speaker callback was created by this closeout."
      : "Future support inherits less clarity about the speaker path.",
  }];
  recordJobSiteCloseoutSummary({
    source: content.commissioningDispatch.title,
    result: state.flags.commissioningApproach ? `Closeout path: ${state.flags.commissioningApproach}` : "",
    before,
    consequences: closeoutConsequences,
  });
  render();
  showModal({
    kicker: "Commissioning Visit Complete",
    title: approach === "craft" ? "The Room Works And The Notes Do Too" : approach === "repair" ? "The Room Works Despite The Ticket" : stableTask ? "The Room Passes Because The Work Actually Did" : "The Completion Sheet Remains Complete",
    body: `
      <div class="results-grid">
        <span>Commissioning wages</span><strong>+$84</strong>
        <span>Cash balance</span><strong>${formatCash(state.cash)}</strong>
        <span>Experience</span><strong>+${xp} XP</strong>
        <span>Closeout</span><strong>${approach === "craft" ? "Clean punch list issued" : approach === "repair" ? "Issue repaired and documented" : "Room marked passed"}</strong>
        <span>Technical task</span><strong>${getCommissioningTerminationTaskLabel()}</strong>
        <span>Task outcome</span><strong>${getCommissioningTerminationQualityLabel()}</strong>
        <span>Reputation</span><strong>${formatReputationDelta(reputation)}</strong>
        <span>Callback ledger</span><strong>${callbackRiskAdded ? callbackDetail : stableTask ? "No speaker callback created" : "Risk documented before callback"}</strong>
      </div>
      ${getCloseoutConsequenceMarkup(closeoutConsequences)}
      ${careful
        ? `<blockquote>Management note: "Please distinguish between commissioning and reopening completed installation work."</blockquote>`
        : callbackRiskAdded
          ? `<blockquote>Management note: "Thanks for keeping closeout moving. Service can address any user-reported concerns."</blockquote>`
          : `<blockquote>Management note: "Thanks for protecting the schedule. Please update drawings when time allows."</blockquote>`}
      ${getReturnPortalCloseoutNoteMarkup()}
    `,
    actions: [getCloseoutReturnAction(content.commissioningDispatch.title, "Returned to Radnor Rack & Wire after the South Philadelphia commissioning visit.")],
  });
}
