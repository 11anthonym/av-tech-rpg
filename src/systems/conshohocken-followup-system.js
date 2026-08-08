// Conshohocken repeat-route follow-up flow proves route history and fast-travel behavior.
// It stays separate from the main service-call system because it is a small repeat-route job.
function isConshohockenFollowupAvailable() {
  return state.flags.serviceComplete
    && state.flags.joshServiceDebriefed
    && !state.flags.surveyStarted
    && !state.flags.conshohockenFollowupComplete;
}

function showConshohockenFollowupPreview() {
  const route = getWorldRoute("conshohockenService");
  const fastTravelReady = canFastTravelRoute(route);
  showModal({
    kicker: "Dispatch Board",
    title: content.followupDispatch.title,
    body: getDispatchBoardMarkup({
      type: "Repeat Route",
      familyId: "service",
      setup: "The Conshohocken client found the unlabeled coupler note useful, which means someone now wants the actual coupler labeled.",
      why: "This is a small repeat-route test: the route is already known, so the regional map can offer fast travel without skipping board prep.",
      stakes: [
        "The regional map should show Conshohocken as fast-travel ready.",
        "Fast travel still costs energy instead of becoming a free teleport.",
        "Careful labeling improves the next service visit; dropping labels keeps management happy.",
      ],
      note: fastTravelReady
        ? "Open the regional map from Van #3 to use the known Conshohocken shortcut."
        : "The route has to be driven once before fast travel appears.",
      managementNote: "Please avoid turning a label drop into a documentation project.",
      taskCards: content.followupDispatch.taskCards,
    }),
    actions: [
      ...(fastTravelReady ? [{ label: "Open Regional Map", onClick: showRegionalMap }] : []),
      getDispatchRoutePrepAction("conshohockenService", showConshohockenFollowupPreview, { className: fastTravelReady ? "secondary-button" : undefined }),
      getDispatchPreviewBackAction(),
    ],
  });
}

function promptConshohockenFollowupTravel({ fastTravel = false } = {}) {
  showTravelRouteModal({
    routeId: "conshohockenService",
    dispatchEstimate: "Drop labels, update the note, avoid creating a second service call.",
    extraBody: `<p class="muted">This is the same client route. The work is smaller; the bad note is not.</p>`,
    fastTravel,
    beforeTravel: () => {
      state.flags.conshohockenFollowupStarted = true;
      markCareerSnapshotStale();
    },
    afterTravel: (route) => {
      enterScene(route.destinationSceneId);
      showConshohockenFollowupChoice();
    },
  });
}

function showConshohockenFollowupChoice() {
  if (state.flags.conshohockenFollowupComplete) {
    return showCompletedDispatchReturnReview({
      title: "Follow-up Already Complete",
      source: content.followupDispatch.title,
      result: getCompletedCloseoutPathResult("conshohockenFollowupApproach"),
    });
  }
  showModal({
    kicker: "Repeat Route",
    title: "The Coupler Gets A Name",
    body: `
      <p>The room is working. The exposed problem is simpler and more durable: nobody labeled the inline coupler or updated the service note in a way the next tech can find.</p>
      ${getChoicePressureMarkup([
        { label: "Label and update", detail: "Costs energy and annoys management, but makes the next service visit cleaner." },
        { label: "Drop labels", detail: "Fast and management-friendly, but the route stays easier than the room notes." },
      ])}
    `,
    actions: [
      { label: "Label coupler and update note", onClick: () => finishConshohockenFollowup("label") },
      { label: "Drop labels and leave", className: "secondary-button", onClick: () => finishConshohockenFollowup("drop") },
    ],
  });
}

function finishConshohockenFollowup(approach) {
  if (state.flags.conshohockenFollowupComplete) {
    return showCompletedDispatchReturnReview({
      title: "Follow-up Already Complete",
      source: content.followupDispatch.title,
      result: getCompletedCloseoutPathResult("conshohockenFollowupApproach"),
    });
  }
  const before = getTrackedStateSnapshot();
  const documented = approach === "label";
  const xp = documented ? 30 : 20;
  if (documented) changeEnergy(-2);
  state.flags.conshohockenFollowupComplete = true;
  state.flags.conshohockenFollowupApproach = approach;
  setClock(`${state.clock.slice(0, 3)} ${documented ? "10:02" : "9:46"} AM`);
  if (!state.flags.conshohockenFollowupPaid) {
    state.cash += documented ? 38 : 30;
    state.flags.conshohockenFollowupPaid = true;
  }
  if (!state.flags.conshohockenFollowupProgressAwarded) {
    awardCareerProgress({
      xp,
      reputation: documented
        ? { clients: 1, coworkers: 1, management: -1 }
        : { clients: 0, coworkers: 0, management: 1 },
      source: content.followupDispatch.title,
    });
    state.flags.conshohockenFollowupProgressAwarded = true;
  }
  if (documented && !state.flags.conshohockenFollowupStatsRecorded) {
    state.stats.documentedTaskRisks += 1;
    state.flags.conshohockenFollowupStatsRecorded = true;
  }
  addLog(documented
    ? "Returned to Conshohocken and labeled the coupler path for the next tech."
    : "Dropped labels at Conshohocken and left the note mostly as-found.");
  const closeoutConsequences = [{
    source: content.followupDispatch.title,
    status: documented ? "documented" : "inherited",
    cause: documented
      ? "The coupler was labeled and the room note was updated."
      : "Labels were dropped without fully rebuilding the room note.",
    affects: "future Conshohocken service notes",
    detail: documented
      ? "Future service starts from a clearer room path."
      : "Future service still has to interpret the room note.",
  }];
  recordJobSiteCloseoutSummary({
    source: content.followupDispatch.title,
    result: getCompletedCloseoutPathResult("conshohockenFollowupApproach"),
    before,
    consequences: closeoutConsequences,
  });
  render();
  showModal({
    kicker: "Follow-up Complete",
    title: documented ? "The Known Route Paid Off" : "Fast, Technically",
    body: `
      <div class="results-grid">
        <span>Follow-up wages</span><strong>+$${documented ? 38 : 30}</strong>
        <span>Cash balance</span><strong>${formatCash(state.cash)}</strong>
        <span>Experience</span><strong>+${xp} XP</strong>
        <span>Route memory</span><strong>${getFastTravelCount("conshohockenService") ? "Fast travel used" : "Repeat route driven"}</strong>
        <span>Closeout</span><strong>${documented ? "Coupler path labeled" : "Labels dropped only"}</strong>
      </div>
      <p class="muted">${documented
        ? "The next tech gets a route shortcut and a room note that finally points to the right thing."
        : "Management likes the speed. The next tech still has to interpret the room note."}</p>
      ${getReturnPortalCloseoutNoteMarkup()}
    `,
    actions: [getCloseoutReturnAction(content.followupDispatch.title, "Returned to Radnor Rack & Wire after the Conshohocken label follow-up.")],
  });
}
