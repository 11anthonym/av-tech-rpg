// Burlington retrofit walkdown flow: preparation, site survey checks, and future-install branch pressure.
// The walkdown is the proof case for multi-step job consequences feeding a later install.
function showRetrofitWalkdownDispatchPreview() {
  showModal({
    kicker: "Dispatch Board",
    title: content.retrofitWalkdownDispatch.title,
    body: getDispatchBoardMarkup({
      type: "Retrofit Walkdown",
      familyId: "survey",
      routeId: "burlingtonRetrofitWalkdown",
      setup: "The drawings say existing conduit. The ceiling says several other things.",
      why: "Unlocked after the coordination-cost travel beat. This tests whether a site survey can protect a future install before the work becomes physical.",
      stakes: [
        "A real walkdown can protect the install crew from discovering pathway problems on install day.",
        "The quote pressure wants a clean yes/no instead of a useful scope note.",
        "Documentation and Commercial Process matter before any cable gets pulled.",
      ],
      consequenceHooks: [
        "Clean notes lower future retrofit install risk.",
        "Thin notes can create a field change or return-trip risk.",
        "Scope pushback may help coworkers while annoying management.",
      ],
      note: "This is a compact site survey: prep, walk the pathway, then decide how honest the closeout gets.",
      managementNote: "Please keep this quick. The quote already assumes the pathway is usable.",
      prep: state.flags.retrofitWalkdownPreparation ? `Preparation selected: ${getRetrofitWalkdownPreparationLabel()}` : "",
      taskCards: content.retrofitWalkdownDispatch.taskCards,
      fieldTasks: content.retrofitWalkdownDispatch.checks,
    }),
    actions: [
      getDispatchRoutePrepAction("burlingtonRetrofitWalkdown", showRetrofitWalkdownDispatchPreview),
      { label: "Return to Shop", className: "secondary-button" },
    ],
  });
}

function getRetrofitWalkdownPreparationLabel() {
  return {
    drawings: "Reviewed marked-up drawings",
    facilities: "Called facilities contact",
    none: "Trusted work-order notes",
  }[state.flags.retrofitWalkdownPreparation] || "None";
}

function showRetrofitWalkdownPreparation() {
  showModal({
    kicker: "Before You Leave",
    title: "Prepare For The Retrofit Walkdown",
    body: `
      <p>The work order says "existing pathway." The drawing shows one line, one wall, and no apparent fear of ceilings.</p>
      <p class="muted">Take one small preparation step before heading to Burlington County.</p>
    `,
    actions: [
      { label: "Review marked-up drawings", onClick: () => chooseRetrofitWalkdownPreparation("drawings") },
      { label: "Call the facilities contact", className: "secondary-button", onClick: () => chooseRetrofitWalkdownPreparation("facilities") },
      { label: "Trust work-order notes", className: "secondary-button", onClick: () => chooseRetrofitWalkdownPreparation("none") },
    ],
  });
}

function chooseRetrofitWalkdownPreparation(preparation) {
  state.flags.retrofitWalkdownPreparation = preparation;
  let title = "The Work Order Will Have To Do";
  let body = `<p>The notes say "existing conduit to display wall," which is a sentence with excellent confidence and no photos.</p>`;
  if (preparation === "drawings") {
    title = "Drawings Compared";
    body = `
      <p>The marked-up drawing shows the old projector location, the new display wall, and a gap where the word existing is supposed to become metal.</p>
      <p class="muted">Pathway and closeout checks get a small boost.</p>
    `;
    addLog("Compared the retrofit drawing against the work order before leaving for Burlington County.");
  }
  if (preparation === "facilities") {
    title = "Facilities Contact Reached";
    body = `
      <p>The facilities contact can meet you with a key and the ladder that actually clears the trophy case.</p>
      <p class="muted">Ceiling access costs 1 less energy and gets a small walkdown boost.</p>
    `;
    addLog("Called the Burlington facilities contact and arranged ceiling access before arrival.");
  }
  if (preparation === "none") addLog("Left for Burlington County trusting the work-order notes.");
  render();
  showModal({
    kicker: "Preparation Selected",
    title,
    body,
    actions: [{ label: "Head To Burlington County", onClick: promptRetrofitWalkdownTravel }],
  });
}

function promptRetrofitWalkdownTravel({ fastTravel = false } = {}) {
  showTravelRouteModal({
    routeId: "burlingtonRetrofitWalkdown",
    dispatchEstimate: "Confirm existing pathway and close the survey cleanly.",
    extraBody: `<p class="muted">This is a site walkdown, not the install. The useful work is deciding what the install crew should not have to discover live.</p>`,
    fastTravel,
    beforeTravel: () => {
      state.flags.retrofitWalkdownStarted = true;
      markCareerSnapshotStale();
    },
  });
}

function getRetrofitWalkdownCheckContextBonus(checkId) {
  if (state.flags.retrofitWalkdownPreparation === "facilities" && checkId === "ceiling-access") return 1;
  if (state.flags.retrofitWalkdownPreparation === "drawings" && ["pathway", "trade-conflict"].includes(checkId)) return 1;
  return 0;
}

function getRetrofitWalkdownCheckEnergyCost(checkId) {
  const preparationHelps = (state.flags.retrofitWalkdownPreparation === "facilities" && checkId === "ceiling-access")
    || (state.flags.retrofitWalkdownPreparation === "drawings" && checkId === "pathway");
  return Math.max(0, 3 - (preparationHelps ? 1 : 0));
}

function getRetrofitWalkdownCloseoutEnergyCost(baseCost) {
  return Math.max(2, baseCost - (state.flags.retrofitWalkdownPreparation === "drawings" ? 1 : 0) - getDocumentationSupportReduction());
}

function inspectRetrofitWalkdownCondition(checkId) {
  const check = content.retrofitWalkdownDispatch.checks.find((item) => item.id === checkId);
  if (!check || state.retrofitWalkdownChecks.includes(checkId)) return notify(`${check?.label || "That walkdown note"} is already checked.`);
  const { skillCheck, energyCost } = resolveFieldTaskCheck({
    check,
    checkId,
    completedChecks: state.retrofitWalkdownChecks,
    flagKey: `retrofit-walkdown-${checkId}`,
    contextBonus: getRetrofitWalkdownCheckContextBonus(checkId),
    baseEnergyCost: getRetrofitWalkdownCheckEnergyCost(checkId),
    failedEnergyPenalty: 1,
    cleanEnergyReduction: 1,
    strainedFlag: "retrofitWalkdownChecksStrained",
    logText: `${check.label} checked: ${check.log}.`,
    strainedLogText: `Walkdown check strained on ${check.label}; closeout will need a clearer scope call.`,
  });
  render();
  const allChecked = state.retrofitWalkdownChecks.length === content.retrofitWalkdownDispatch.checks.length;
  showModal({
    kicker: "Walkdown Note",
    title: check.label,
    body: `
      <p>${check.detail}</p>
      ${getFieldTaskResultMarkup({ check, skillCheck, energyCost })}
      ${allChecked ? `<p class="muted">You have enough to decide whether this becomes a clean install handoff, a field change, or another optimistic ticket.</p>` : ""}
    `,
    actions: [{ label: allChecked ? "Review Walkdown Closeout" : "Keep Walking The Site", onClick: allChecked ? showRetrofitWalkdownChoice : render }],
  });
}

function showRetrofitWalkdownChoice() {
  if (state.flags.retrofitWalkdownComplete) {
    return showCompletedDispatchReturnReview({
      title: "Retrofit Walkdown Already Complete",
      source: content.retrofitWalkdownDispatch.title,
      result: getCompletedCloseoutPathResult("retrofitWalkdownApproach"),
    });
  }
  showModal({
    kicker: "Retrofit Walkdown Closeout",
    title: "Existing Pathway, In The Theoretical Sense",
    body: `
      <p>The new display wall can work, but the existing pathway does not reach it cleanly. The install can be protected now, or the crew can discover the missing pathway while holding cable.</p>
      ${state.flags.retrofitWalkdownChecksStrained ? `<p class="muted">One walkdown check was strained. A scope pushback can keep the weak note from being buried.</p>` : ""}
      ${getDocumentationSupportReduction() ? `<p class="muted">Your documentation habits make the closeout less draining.</p>` : ""}
      ${getChoicePressureMarkup([
        {
          label: "Document blockers",
          detail: "Takes steady effort to leave photos, pathway blockers, and install notes. Lowers future install risk, unless the strained check makes the note too soft.",
        },
        ...(getSkillValue("commercialProcess") >= 3 || canUsePressureChoice() ? [{
          label: "Push scope change",
          detail: "Turns the pathway miss into a field-change conversation. Best future-install protection, with sharper management friction.",
        }] : []),
        {
          label: "Accept pathway",
          detail: "Fast management-friendly closeout. The quote stays clean and the future install inherits the ceiling problem.",
        },
      ])}
    `,
    actions: [
      { label: "Document pathway blockers", onClick: () => finishRetrofitWalkdown("document") },
      ...(getSkillValue("commercialProcess") >= 3 || canUsePressureChoice() ? [{
        label: "Push scope change with photos",
        className: "secondary-button",
        onClick: () => finishRetrofitWalkdown("scope"),
      }] : []),
      { label: "Accept pathway as usable", className: "secondary-button", onClick: () => finishRetrofitWalkdown("accept") },
    ],
  });
}

function getRetrofitWalkdownReputationSummary(approach, strained = false) {
  if (approach === "accept") return "Management likes the clean quote; crew trust drops later";
  if (approach === "scope") return "Client and crew trust rise; management friction sharpens";
  if (strained) return "Client trust rises; crew gets partial help; management grumbles";
  return "Client and crew trust rise; management grumbles about the scope note";
}

function getRetrofitInstallHookSummary(approach, strained = false) {
  if (approach === "scope") return "Future install protected by field-change note";
  if (approach === "document" && !strained) return "Future install protected by walkdown photos";
  if (approach === "document") return "Future install gets a partial warning";
  return "Future install inherits pathway risk";
}

function finishRetrofitWalkdown(approach) {
  if (state.flags.retrofitWalkdownComplete) {
    return showCompletedDispatchReturnReview({
      title: "Retrofit Walkdown Already Complete",
      source: content.retrofitWalkdownDispatch.title,
      result: getCompletedCloseoutPathResult("retrofitWalkdownApproach"),
    });
  }
  const before = getTrackedStateSnapshot();
  const documented = approach !== "accept";
  const strained = Boolean(state.flags.retrofitWalkdownChecksStrained) && approach === "document";
  const xp = (approach === "scope" ? 65 : approach === "document" ? 55 : 35) - (strained ? 5 : 0);
  if (documented) changeEnergy(-getRetrofitWalkdownCloseoutEnergyCost(approach === "scope" ? 3 : 4));
  state.flags.retrofitWalkdownComplete = true;
  state.flags.retrofitWalkdownApproach = approach;
  markCareerSnapshotStale();
  const futureInstallPartialWarning = approach === "document" && strained;
  const futureInstallProtected = approach === "scope" || (approach === "document" && !futureInstallPartialWarning);
  const futureInstallRisk = approach === "accept" || futureInstallPartialWarning;
  const futureInstallBranch = futureInstallProtected ? "protected" : futureInstallPartialWarning ? "partial" : "risk";
  state.flags.retrofitInstallProtected = futureInstallProtected;
  state.flags.retrofitInstallRisk = futureInstallRisk;
  state.flags.retrofitInstallPartialWarning = futureInstallPartialWarning;
  state.flags.retrofitInstallBranch = futureInstallBranch;
  state.flags.retrofitScopeChangeLogged = approach === "scope";
  setClock(`${state.clock.slice(0, 3)} ${approach === "accept" ? "11:34" : "11:58"} AM`);
  if (!state.flags.retrofitWalkdownPaid) {
    state.cash += documented ? 76 : 58;
    state.flags.retrofitWalkdownPaid = true;
  }
  if (!state.flags.retrofitWalkdownProgressAwarded) {
    awardCareerProgress({
      xp,
      reputation: documented
        ? { clients: approach === "scope" ? 2 : 1, coworkers: strained ? 0 : 1, management: approach === "scope" ? -2 : -1 }
        : { clients: 0, coworkers: -1, management: 1 },
      source: content.retrofitWalkdownDispatch.title,
    });
    state.flags.retrofitWalkdownProgressAwarded = true;
  }
  if (!state.flags.retrofitWalkdownStatsRecorded) {
    state.stats.retrofitWalkdownsCompleted += 1;
    if (approach === "scope") {
      state.stats.retrofitScopePushbacks += 1;
      state.stats.documentedTaskRisks += 1;
    } else if (approach === "document") {
      state.stats.retrofitRisksDocumented += 1;
      state.stats.documentedTaskRisks += 1;
    } else {
      state.stats.retrofitRisksAccepted += 1;
    }
    state.flags.retrofitWalkdownStatsRecorded = true;
  }
  if (futureInstallRisk) {
    recordReturnTripRisk("burlington-retrofit-install", {
      source: content.retrofitWalkdownDispatch.title,
      detail: approach === "accept"
        ? "Pathway accepted without field-change note; future install may inherit ceiling risk."
        : "Walkdown documented blockers, but one strained read leaves partial install risk.",
    });
  } else if (state.flags.returnTripRisks?.["burlington-retrofit-install"]) {
    resolveReturnTripRisk("burlington-retrofit-install", {
      source: content.retrofitWalkdownDispatch.title,
      resolution: "Walkdown closeout protected the future install before the risk reached install day.",
    });
  }
  addLog(documented
    ? "Closed the Burlington walkdown with pathway blockers visible before install day."
    : "Accepted the Burlington pathway as usable. The future install now owns whatever the ceiling remembers.");
  const closeoutConsequences = [{
    source: content.retrofitWalkdownDispatch.title,
    status: futureInstallRisk ? "open" : "protected",
    cause: futureInstallRisk
      ? approach === "accept"
        ? "Pathway was accepted as usable without a field-change note."
        : "Blockers were documented, but a strained walkdown note left partial risk."
      : "Walkdown closeout protected the install with photos, scope language, or field-change ownership.",
    affects: getReturnTripRiskAffectedWork("burlington-retrofit-install"),
    detail: futureInstallRisk
      ? "The install branch inherits pathway risk."
      : "The install branch starts from a protected pathway note.",
  }];
  recordJobSiteCloseoutSummary({
    source: content.retrofitWalkdownDispatch.title,
    result: getCompletedCloseoutPathResult("retrofitWalkdownApproach"),
    before,
    consequences: closeoutConsequences,
  });
  render();
  showModal({
    kicker: "Retrofit Walkdown Complete",
    title: approach === "scope" ? "The Field Change Exists Before Install Day" : approach === "document" ? "The Install Crew Gets A Warning" : "The Quote Remains Unbothered",
    body: `
      <div class="results-grid">
        <span>Walkdown wages</span><strong>+$${documented ? 76 : 58}</strong>
        <span>Cash balance</span><strong>${formatCash(state.cash)}</strong>
        <span>Experience</span><strong>+${xp} XP</strong>
        <span>Preparation</span><strong>${getRetrofitWalkdownPreparationLabel()}</strong>
        <span>Relationship result</span><strong>${getRetrofitWalkdownReputationSummary(approach, strained)}</strong>
        <span>Future install hook</span><strong>${getRetrofitInstallHookSummary(approach, strained)}</strong>
        ${strained ? `<span>Skill consequence</span><strong>Strained walkdown note leaves partial install risk</strong>` : ""}
      </div>
      ${getCloseoutConsequenceMarkup(closeoutConsequences)}
      ${documented
        ? `<blockquote>Management note: "Please avoid creating field changes from preliminary walkdowns unless the pathway is truly unavailable."</blockquote>`
        : `<blockquote>Management note: "Thanks for confirming the quoted pathway."</blockquote>`}
      ${getReturnPortalCloseoutNoteMarkup()}
    `,
    actions: [getCloseoutReturnAction(content.retrofitWalkdownDispatch.title, "Returned to Radnor Rack & Wire after the Burlington County retrofit walkdown.")],
  });
}
