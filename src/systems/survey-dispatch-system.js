// University City site survey flow: prep, access inspections, closeout guard, and install-risk consequence.
// Keeping the completion review here prevents repeated closeout choices from reapplying rewards or costs.
function showSurveyDispatchPreview() {
  showModal({
    kicker: "Dispatch Board",
    title: content.surveyDispatch.title,
    body: getDispatchBoardMarkup({
      type: "Site Survey",
      familyId: "survey",
      setup: "Confirm access and mounting conditions for a University City classroom display. Sales already measured the wall.",
      why: "Unlocked after the service call and Josh debrief. The game is testing whether field judgment matters before install day.",
      stakes: [
        "Preparation lowers inspection or report costs.",
        "Confidence can unlock a direct sales pushback.",
        "Trusting the quote helps management and may create future pain.",
      ],
      note: "The facilities contact asked whether the quoted display will fit through the building.",
      managementNote: "Should be straightforward. Same basic idea as a display we installed somewhere else.",
      prep: state.flags.surveyPreparation ? `Preparation selected: ${getSurveyPreparationLabel()}` : "",
      fieldTasks: content.surveyDispatch.inspections,
    }),
    actions: [
      getDispatchRoutePrepAction("universitySurvey", showSurveyDispatchPreview),
      { label: "Return to Shop", className: "secondary-button" },
    ],
  });
}

function getSurveyPreparationLabel() {
  return {
    sketch: "Reviewed sales sketch",
    measure: "Found shop tape measure",
    none: "Left with the forwarded email",
  }[state.flags.surveyPreparation] || "None";
}

function showSurveyPreparation() {
  showModal({
    kicker: "Before You Leave",
    title: "Prepare For The Site Survey",
    body: `
      <p>The forwarded work order says to confirm the wall dimensions. Facilities also asked about the delivery path, which is not mentioned in the quote.</p>
      <p class="muted">Take one small preparation step before heading to University City.</p>
    `,
    actions: [
      { label: "Review the sales sketch", onClick: () => chooseSurveyPreparation("sketch") },
      { label: "Find the shop tape measure", className: "secondary-button", onClick: () => chooseSurveyPreparation("measure") },
      { label: "Leave with the forwarded email", className: "secondary-button", onClick: () => chooseSurveyPreparation("none") },
    ],
  });
}

function chooseSurveyPreparation(preparation) {
  state.flags.surveyPreparation = preparation;
  let title = "The Email Will Have To Do";
  let body = `<p>The forwarded email contains a room number and the phrase "standard display." Nobody defined standard.</p>`;
  if (preparation === "sketch") {
    title = "Sales Sketch Located";
    body = `
      <p>The sketch shows a 98-inch display on the classroom wall. The delivery path is represented by an arrow entering from the edge of the page.</p>
      <p class="muted">Filing a careful report will cost 1 less energy.</p>
    `;
    addLog("Reviewed the sales sketch. The proposed 98-inch display arrives by way of a confident arrow.");
  }
  if (preparation === "measure") {
    title = "Tape Measure Located";
    body = `
      <p>You find the shop tape measure in a box labeled AUDIO. Somebody scratched out another technician's initials and wrote COMPANY.</p>
      <p class="muted">Each survey inspection will cost 1 less energy.</p>
    `;
    addLog("Found the company tape measure in a box labeled AUDIO.");
  }
  if (preparation === "none") addLog("Left for University City with the forwarded sales email.");
  render();
  showModal({
    kicker: "Preparation Selected",
    title,
    body,
    actions: [{ label: "Head To University City", onClick: promptSurveyTravel }],
  });
}

function promptSurveyTravel({ fastTravel = false } = {}) {
  showTravelRouteModal({
    routeId: "universitySurvey",
    dispatchEstimate: "Measure one wall. Confirm install conditions. Do not overcomplicate the quote.",
    fastTravel,
    beforeTravel: () => {
      state.flags.surveyStarted = true;
    },
  });
}

function getSurveyInspectionEnergyCost() {
  return Math.max(0, 2 - (state.flags.surveyPreparation === "measure" ? 1 : 0));
}

function getSurveyReportEnergyCost(baseCost) {
  return Math.max(2, baseCost - (state.flags.surveyPreparation === "sketch" ? 1 : 0) - getDocumentationSupportReduction());
}

function isSurveyInspectionComplete() {
  return content.surveyDispatch.inspections.every((item) => state.surveyInspections.includes(item.id));
}

function getSurveyReportTitle(approach = state.flags.surveyApproach) {
  return {
    pushback: "The Quote Is Paused Before The Damage",
    document: "The Constraint Is Now Somebody's Email",
    trust: "The Quote Remains Basically Approved",
  }[approach] || "The Survey Report Is Filed";
}

function getSurveyReportLabel(approach = state.flags.surveyApproach) {
  return {
    pushback: "Sales called directly",
    document: "Access risk documented",
    trust: "Quoted plan accepted",
  }[approach] || "Report filed";
}

function inspectSurveyConstraint(inspectionId) {
  if (state.flags.surveyComplete) return showSurveyCompleteReview();
  const inspection = content.surveyDispatch.inspections.find((item) => item.id === inspectionId);
  if (!inspection || state.surveyInspections.includes(inspectionId)) return notify(`${inspection?.label || "That condition"} is already in your notes.`);
  const { skillCheck, energyCost } = resolveFieldTaskCheck({
    check: inspection,
    checkId: inspectionId,
    completedChecks: state.surveyInspections,
    flagKey: `survey-${inspectionId}`,
    contextBonus: state.flags.surveyPreparation === "measure" ? 1 : 0,
    baseEnergyCost: getSurveyInspectionEnergyCost(),
    strainedFlag: inspectionId === "wall" ? "" : "surveyDocumentationStrained",
    logText: `${inspection.label} checked: ${inspection.log}`,
    strainedLogText: `Survey skill check strained on ${inspection.label}; the report will need a clearer closeout choice.`,
  });
  render();
  const allChecked = isSurveyInspectionComplete();
  showModal({
    kicker: "Survey Note",
    title: inspection.label,
    body: `
      <p>${inspection.detail}</p>
      ${getFieldTaskResultMarkup({ check: inspection, skillCheck, energyCost })}
      ${inspection.id === "wall" && getCharacterLine("surveyWall") ? `<p class="muted">${getCharacterLine("surveyWall")}</p>` : ""}
      ${allChecked ? `<p class="muted">You have enough information. Return to the facilities contact and file the survey report.</p>` : ""}
    `,
    actions: [{ label: allChecked ? "Return To Facilities Contact" : "Keep Surveying", onClick: render }],
  });
}

function showSurveyCompleteReview() {
  const returnPortal = getCurrentReturnPortal();
  showModal({
    kicker: "Site Survey Review",
    title: getSurveyReportTitle(),
    body: `
      <p>The University City site survey is already filed. The closeout choice is locked in.</p>
      <div class="results-grid">
        <span>Preparation</span><strong>${getSurveyPreparationLabel()}</strong>
        <span>Report</span><strong>${getSurveyReportLabel()}</strong>
        <span>Return route</span><strong>${returnPortal ? `${escapeHtml(returnPortal.label)} marker is ready` : "Use the site exit when available"}</strong>
      </div>
      <p class="muted">No more survey energy, XP, wages, or reputation changes can be taken from this contact. Walk to the marked return point to leave the site.</p>
    `,
    actions: [{ label: "Back To Survey Site", onClick: render }],
  });
}

function showSurveyReportChoice() {
  if (state.flags.surveyComplete) return showSurveyCompleteReview();
  if (!isSurveyInspectionComplete()) return notify("Finish the elevator, hallway, and wall observations before filing the survey report.");
  showModal({
    kicker: "Survey Report",
    title: "The Wall Is Not The Only Dimension",
    body: `
      <p>The 98-inch display fits on the classroom wall. It does not fit through the elevator opening, and the hallway turn offers no useful miracle.</p>
      <p>Sales wants the survey closed today because the quote is "basically approved."</p>
      ${getDocumentationSupportReduction() ? `<p class="muted">Your documentation habits make this report cost 1 less energy.</p>` : ""}
      ${state.flags.surveyDocumentationStrained ? `<p class="muted">Your access notes are thin. Documenting still helps, but calling sales directly prevents the weak notes from being buried.</p>` : ""}
      ${getChoicePressureMarkup([
        {
          label: "Document the constraint",
          detail: "Costs energy to make the access problem real on paper. Likely protects install day, but management may call it complexity.",
        },
        ...(canUsePressureChoice() ? [{
          label: "Call sales calmly",
          detail: "Uses pressure handling to challenge the quote before install day. Outcome depends on how well the conversation lands.",
        }] : []),
        {
          label: "Trust the quote",
          detail: "Fast management-friendly closeout. Keeps the schedule clean while leaving the access risk unresolved.",
        },
      ])}
    `,
    actions: [
      { label: `Document the access constraint (-${getSurveyReportEnergyCost(3)} energy)`, onClick: () => finishSurvey("document") },
      ...(canUsePressureChoice() ? [{
        label: `Call sales and push back calmly (-${getSurveyReportEnergyCost(2)} energy)`,
        className: "secondary-button",
        onClick: () => finishSurvey("pushback"),
      }] : []),
      { label: "Trust the quote and mark survey complete", className: "secondary-button", onClick: () => finishSurvey("trust") },
    ],
  });
}

function finishSurvey(approach) {
  if (state.flags.surveyComplete) return showSurveyCompleteReview();
  const before = getTrackedStateSnapshot();
  const careful = approach !== "trust";
  const strainedDocument = Boolean(state.flags.surveyDocumentationStrained) && approach === "document";
  const xp = (approach === "pushback" ? 60 : approach === "document" ? 55 : 35) - (strainedDocument ? 5 : 0);
  if (careful) changeEnergy(-getSurveyReportEnergyCost(approach === "pushback" ? 2 : 3));
  state.flags.surveyComplete = true;
  state.flags.surveyApproach = approach;
  markCareerSnapshotStale();
  setClock(`${state.clock.slice(0, 3)} ${approach === "trust" ? "2:06" : "2:21"} PM`);
  if (!state.flags.surveyPaid) {
    state.cash += 72;
    state.flags.surveyPaid = true;
  }
  if (!state.flags.surveyProgressAwarded) {
    awardCareerProgress({
      xp,
      reputation: careful
        ? { clients: strainedDocument ? 1 : 2, coworkers: strainedDocument ? 0 : 1, management: -1 }
        : { clients: 0, coworkers: 0, management: 1 },
      source: content.surveyDispatch.title,
    });
    state.flags.surveyProgressAwarded = true;
  }
  if (!state.flags.surveyStatsRecorded) {
    state.stats.surveysCompleted += 1;
    if (careful) state.stats.accessRisksDocumented += 1;
    else state.stats.quotesTrustedAnyway += 1;
    state.flags.surveyStatsRecorded = true;
  }
  addLog(careful
    ? "Documented the University City access problem before it became an install-day problem."
    : "Marked the University City survey complete without adding the access problem to the quote.");
  const closeoutConsequences = [{
    source: content.surveyDispatch.title,
    status: careful ? "documented" : "inherited",
    cause: careful
      ? "Access constraints were filed before the install quote could pretend they were simple."
      : "The quote was trusted even though the access path still looked constrained.",
    affects: "future install planning and access expectations",
    detail: careful
      ? "Future work starts with the access issue visible."
      : "Future work may inherit a cleaner-looking quote than the site deserves.",
  }];
  recordJobSiteCloseoutSummary({
    source: content.surveyDispatch.title,
    result: getCompletedCloseoutPathResult("surveyApproach"),
    before,
    consequences: closeoutConsequences,
  });
  render();
  showModal({
    kicker: "Site Survey Complete",
    title: getSurveyReportTitle(approach),
    body: `
      <div class="results-grid">
        <span>Survey wages</span><strong>+$72</strong>
        <span>Cash balance</span><strong>${formatCash(state.cash)}</strong>
        <span>Experience</span><strong>+${xp} XP</strong>
        <span>Preparation</span><strong>${getSurveyPreparationLabel()}</strong>
        <span>Report</span><strong>${getSurveyReportLabel(approach)}</strong>
        ${strainedDocument ? `<span>Skill consequence</span><strong>Thin notes softened the coworker/client gain</strong>` : ""}
      </div>
      ${approach === "trust"
        ? `<blockquote>Management note: "Thanks for keeping the survey efficient. Installation can confirm final access conditions onsite."</blockquote>`
        : `<blockquote>Management note: "Please avoid introducing unnecessary complexity after sales has aligned the client around a solution."</blockquote>`}
      ${getCloseoutConsequenceMarkup(closeoutConsequences)}
      ${getReturnPortalCloseoutNoteMarkup()}
    `,
    actions: [getCloseoutReturnAction(content.surveyDispatch.title, "Returned to Radnor Rack & Wire after the University City survey.")],
  });
}
