// Travel-cost dispatch flow: toll reimbursement choice and immediate route-friction consequence.
// This keeps single-decision travel pressure out of the main app controller.
const CHERRY_HILL_TOLL_COST = 6;
function showTravelDispatchPreview() {
  showModal({
    kicker: "Dispatch Board",
    title: content.travelDispatch.title,
    body: getDispatchBoardMarkup({
      type: "Travel Cost",
      familyId: "logistics",
      setup: "Coordination added a quick Cherry Hill return stop after the King of Prussia service call. The work is tiny. The bridge toll and paperwork are somehow yours.",
      why: "Unlocked after the systems service job. This tests whether travel friction can be a readable RPG choice without adding a route simulator.",
      stakes: [
        `The current DRPA passenger toll is $${content.travelDispatch.tollCost || CHERRY_HILL_TOLL_COST}.`,
        "Documenting the cost protects reimbursement and annoys management.",
        "Eating the toll keeps the ticket clean and quietly costs you cash.",
      ],
      note: "This is a single travel decision: no new map, no toll booth minigame, no heroic spreadsheet.",
      managementNote: "Please keep this return stop efficient. Travel expenses should be reasonable and pre-approved.",
      taskCards: content.travelDispatch.taskCards,
    }),
    actions: [
      { label: "Review Travel Choices", onClick: showTravelChoice },
      { label: "Return to Shop", className: "secondary-button" },
    ],
  });
}

function showTravelChoice() {
  if (state.flags.travelComplete) {
    return showCompletedDispatchReturnReview({
      title: "Travel Cost Already Complete",
      source: content.travelDispatch.title,
      result: getCompletedCloseoutPathResult("travelApproach"),
    });
  }
  const tollCost = content.travelDispatch.tollCost || CHERRY_HILL_TOLL_COST;
  showModal({
    kicker: "Cherry Hill Return",
    title: "The Toll Exists Both Ways",
    body: `
      <p>The return stop itself is small. The problem is that coordination treated the bridge like a rumor and the van like it runs on optimism.</p>
      ${getChoicePressureMarkup([
        { label: "File receipt", detail: "Costs a little energy and protects your cash. Management may grumble about the paper trail." },
        { label: "Push coordination", detail: "Best process outcome if you can handle the pressure, but it asks management to notice its own travel planning." },
        { label: "Eat the toll", detail: `Fastest option. You pay $${tollCost}, and the bad process stays invisible for now.` },
      ])}
    `,
    actions: [
      { label: `File toll receipt and ETA note (-2 energy, $${tollCost} reimbursed)`, onClick: () => finishTravelDispatch("receipt") },
      ...(getSkillValue("commercialProcess") >= 3 || canUsePressureChoice() ? [{
        label: "Push coordination to own the return toll (-2 energy)",
        className: "secondary-button",
        onClick: () => finishTravelDispatch("pushback"),
      }] : []),
      { label: `Eat the toll and keep moving (-$${tollCost})`, className: "secondary-button", onClick: () => finishTravelDispatch("absorb") },
    ],
  });
}

function getTravelReputationSummary(approach) {
  if (approach === "absorb") return "Management likes the clean ticket";
  if (approach === "pushback") return "Crew trust rises; management friction sharpens";
  return "Crew trust rises; management grumbles about the receipt trail";
}

function finishTravelDispatch(approach) {
  if (state.flags.travelComplete) {
    return showCompletedDispatchReturnReview({
      title: "Travel Cost Already Complete",
      source: content.travelDispatch.title,
      result: getCompletedCloseoutPathResult("travelApproach"),
    });
  }
  const before = getTrackedStateSnapshot();
  const tollCost = content.travelDispatch.tollCost || CHERRY_HILL_TOLL_COST;
  const documented = approach !== "absorb";
  const xp = approach === "pushback" ? 45 : approach === "receipt" ? 35 : 25;
  const basePay = 42;
  const netPay = documented ? basePay : basePay - tollCost;
  if (documented) changeEnergy(-2);
  state.flags.travelComplete = true;
  state.flags.travelApproach = approach;
  markCareerSnapshotStale();
  setClock(`${state.clock.slice(0, 3)} ${documented ? "5:18" : "4:58"} PM`);
  if (!state.flags.travelPaid) {
    state.cash += netPay;
    state.flags.travelPaid = true;
  }
  if (!state.flags.travelProgressAwarded) {
    awardCareerProgress({
      xp,
      reputation: documented
        ? { clients: 0, coworkers: 1, management: approach === "pushback" ? -2 : -1 }
        : { clients: 0, coworkers: 0, management: 1 },
      source: content.travelDispatch.title,
    });
    state.flags.travelProgressAwarded = true;
  }
  if (!state.flags.travelStatsRecorded) {
    if (documented) {
      state.stats.travelCostsDocumented += 1;
      state.stats.documentedTaskRisks += 1;
    } else {
      state.stats.unreimbursedTravelCosts += 1;
    }
    state.flags.travelStatsRecorded = true;
  }
  addLog(documented
    ? "Documented the Cherry Hill return toll instead of letting the van become a charity with ladder racks."
    : "Ate the Cherry Hill toll to keep the ticket moving. The receipt disappeared into the same place as accurate route estimates.");
  const closeoutConsequences = [{
    source: content.travelDispatch.title,
    status: documented ? "documented" : "inherited",
    cause: documented
      ? "Return-route cost was filed before it disappeared into the workday."
      : "The toll was absorbed to keep the ticket simple.",
    affects: "future travel-cost expectations and shop trust",
    detail: documented
      ? "The route friction is visible to the shop."
      : "The route friction stays hidden and the tech eats the cost.",
  }];
  recordJobSiteCloseoutSummary({
    source: content.travelDispatch.title,
    result: getCompletedCloseoutPathResult("travelApproach"),
    before,
    consequences: closeoutConsequences,
  });
  render();
  showModal({
    kicker: "Travel Cost Complete",
    title: approach === "pushback" ? "Coordination Owns The Bridge Now" : approach === "receipt" ? "Receipt Filed Before It Became Folklore" : "The Toll Came Out Of Your Pocket",
    body: `
      <div class="results-grid">
        <span>Base travel pay</span><strong>+$${basePay}</strong>
        <span>Bridge toll</span><strong>${documented ? `$${tollCost} reimbursed` : `-$${tollCost} absorbed`}</strong>
        <span>Net cash</span><strong>+${formatCash(netPay)}</strong>
        <span>Cash balance</span><strong>${formatCash(state.cash)}</strong>
        <span>Experience</span><strong>+${xp} XP</strong>
        <span>Relationship result</span><strong>${getTravelReputationSummary(approach)}</strong>
        <span>Career record</span><strong>${documented ? "Travel cost documented" : "Unreimbursed travel cost"}</strong>
      </div>
      ${getCloseoutConsequenceMarkup(closeoutConsequences)}
      ${documented
        ? `<blockquote>Management note: "Please avoid over-documenting routine travel expenses."</blockquote>`
        : `<blockquote>Management note: "Thanks for keeping the return stop simple."</blockquote>`}
      ${getReturnPortalCloseoutNoteMarkup()}
    `,
    actions: [getCloseoutReturnAction(content.travelDispatch.title, "Returned to Radnor Rack & Wire after the Cherry Hill return stop.")],
  });
}
