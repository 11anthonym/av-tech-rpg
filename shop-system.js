// Shop hub helpers: personal kit, career clipboard, Josh, and the supply counter.
// These are reusable home-base surfaces, separate from dispatch-specific job logic.
function showPersonalKit() {
  if (shouldIntroduceJoshBeforeNextDispatch()) return notifyJoshIntroRequired();
  const ownedTools = state.tools.map((toolId) => content.tools[toolId]);
  const partsBrainActive = hasActivePartsBrainFind();
  showModal({
    kicker: "Personal Kit",
    title: "Your Tools",
    body: `
      <ul class="modal-list">
        ${ownedTools.map((tool) => `<li><strong>${tool.name}</strong><span>${getToolEffectText(tool)}</span></li>`).join("")}
      </ul>
      <p class="muted">Garage carry capacity: ${getCarryCapacity("garage")} equipment group${getCarryCapacity("garage") === 1 ? "" : "s"}</p>
      <p class="muted">Assembly energy cost: ${getAssemblyEnergyCost(7)} per cart component</p>
      <p class="muted">Signal-path verification energy cost: ${getVerificationEnergyCost(4)}</p>
      ${ownsTool("circuitHutOrganizer") ? `<p class="muted">Circuit Hut Parts Brain: ${partsBrainActive ? `active this job (${getUsedPartsBrainDispatches()[getCurrentDispatchKey()]})` : "unused for this job"}</p>` : ""}
    `,
    actions: [
      ...(canUsePartsBrain() ? [{
        label: "Check Circuit Hut Organizer",
        className: "secondary-button",
        onClick: useCircuitHutPartsBrain,
      }] : []),
      { label: "Close Tool Bag" },
    ],
  });
}

function useCircuitHutPartsBrain() {
  if (!canUsePartsBrain()) return showPersonalKit();
  const dispatchKey = getCurrentDispatchKey();
  const find = getPartsBrainFind();
  getUsedPartsBrainDispatches()[dispatchKey] = find;
  addLog(`${state.technician.name} checked the Circuit Hut organizer and found a ${find}.`);
  showModal({
    kicker: "Circuit Hut Parts Brain",
    title: "Small Part, Big Judgment Call",
    body: `
      <p>${state.technician.name} digs through the old parts organizer and finds a <strong>${find}</strong>.</p>
      <p>This can help with testing during the current job. It does not automatically make the workaround acceptable for final closeout.</p>
      <blockquote>${state.technician.name}: "${getCharacterLine("partsBrainQuote", "This is fine for testing. Permanent is where the paperwork starts.")}"</blockquote>
    `,
    actions: [{ label: "Pocket It For Testing", onClick: render }],
  });
}

function showCareerClipboard() {
  if (shouldIntroduceJoshBeforeNextDispatch()) return notifyJoshIntroRequired();
  const rank = getCareerRank();
  const nextRank = getNextCareerRank();
  const pendingTraining = hasPendingTraining();
  const selectedTraining = state.training.map((trainingId) => (
    content.career.trainingChoices.find((choice) => choice.id === trainingId)
  ));
  showModal({
    kicker: "Radnor Rack & Wire Career Clipboard",
    title: `Level ${rank.level} ${rank.name}`,
    body: `
      <div class="results-grid">
        <span>Experience</span><strong>${state.xp} XP</strong>
        <span>Next rank</span><strong>${nextRank ? `${nextRank.name} at ${nextRank.xpRequired} XP` : "More ranks coming soon"}</strong>
        <span>Jobs completed</span><strong>${state.jobsCompleted}</strong>
        <span>Client reputation</span><strong>${formatReputation(state.reputation.clients)}</strong>
        <span>Coworker reputation</span><strong>${formatReputation(state.reputation.coworkers)}</strong>
        <span>Management reputation</span><strong>${formatReputation(state.reputation.management)}</strong>
      </div>
      <p><strong>Active consequences:</strong></p>
      ${getActiveCareerSummaryMarkup()}
      <p><strong>Consequence ledger:</strong></p>
      ${getConsequenceLedgerMarkup({ includeResolved: true })}
      <p><strong>Field task history:</strong></p>
      ${getFieldTaskResultLedgerMarkup()}
      <p><strong>Build identity:</strong></p>
      ${getBuildIdentityMarkup()}
      <p><strong>Skill tree details:</strong></p>
      ${getSkillSummaryMarkup()}
      <p><strong>Current company:</strong></p>
      ${getCompanyProfileMarkup()}
      ${selectedTraining.length ? `
        <p><strong>Training completed:</strong></p>
        <ul class="modal-list">
          ${selectedTraining.map((choice) => `<li><strong>${choice.branch || "Training"}: ${choice.name}</strong><span>${choice.effect}</span></li>`).join("")}
        </ul>
      ` : ""}
      <p><strong>Milestone preview:</strong></p>
      <ul class="modal-list">
        ${getCareerMilestones().map((milestone) => `<li><strong>${milestone.status} ${milestone.name}</strong><span>${milestone.description}</span></li>`).join("")}
      </ul>
      <p><strong>Career goals:</strong></p>
      ${getCareerGoalsMarkup()}
      <p><strong>Active career effects:</strong></p>
      ${getCareerEffectsMarkup()}
      <p><strong>Career ledger:</strong></p>
      ${getCareerLedgerMarkup()}
      <p class="muted">${pendingTraining
        ? "You earned a new field-training focus. Pick the habit you want to develop next."
        : "Complete more jobs to unlock another field-training focus."}</p>
    `,
    actions: [
      ...(pendingTraining ? content.career.trainingChoices
        .filter((choice) => !state.training.includes(choice.id))
        .map((choice) => ({
        label: `${choice.branch || "Training"} - ${choice.name}`,
        className: "secondary-button",
        onClick: () => chooseTraining(choice.id),
      })) : []),
      { label: "Return Clipboard" },
    ],
  });
}

function getCareerEffectsMarkup() {
  const effects = [
    {
      active: getDocumentationTraitReduction() > 0,
      name: "Character documentation habit",
      description: "Notebook Habit or By The Book reduces report, access-delay, and handoff paperwork by 1 energy from the start.",
    },
    {
      active: getCarefulTraitReduction() > 0,
      name: "Measure Twice tendency",
      description: "Careful closeout and repair choices cost 1 less energy before the career-wide rhythm is built.",
    },
    {
      active: getDocumentationHabitReduction() > 0,
      name: "Documentation habit",
      description: "Documenting access problems twice reduces future report and access-delay paperwork by 1 energy.",
    },
    {
      active: getCarefulWorkReduction() > 0,
      name: "Careful-work rhythm",
      description: "Two careful finishes reduce future repair and punch-list energy by 1.",
    },
    {
      active: getOpenCallbackPenalty() > 0,
      name: "Open callback drag",
      description: "Unresolved callbacks add 1 energy to access checks until the career ledger catches up.",
    },
    {
      active: Boolean(state.flags.shiftPrepActive),
      name: "Next-shift prep",
      description: "Staying late adds +1 Fieldcraft and +1 Documentation until the next job closes.",
    },
    {
      active: Boolean(state.flags.energyExhaustedThisShift || state.flags.exhaustionIncidentsThisShift),
      name: "Zero-energy pressure",
      description: "Hitting zero energy can cap ordinary recovery, lower skill checks, and turn unpaid effort into incidents.",
    },
    {
      active: Boolean(getConditionSkillPressureSummary()),
      name: "Field condition pressure",
      description: "Low energy and high burnout can lower skill checks before a full exhaustion crash.",
    },
  ];
  return `
    <ul class="modal-list">
      ${effects.map((effect) => `<li><strong>${effect.active ? "[ACTIVE]" : "[LOCKED]"} ${effect.name}</strong><span>${effect.description}</span></li>`).join("")}
    </ul>
  `;
}

function getCareerLedgerMarkup() {
  return `
    <div class="results-grid">
      <span>Careful finishes</span><strong>${state.stats.carefulFinishes}</strong>
      <span>Callbacks generated</span><strong>${state.stats.callbacks}</strong>
      <span>Callback notes rebuilt</span><strong>${state.stats.callbacksResolved}</strong>
      <span>Overtime days</span><strong>${state.stats.overtimeDays}</strong>
      <span>Shifts closed</span><strong>${state.stats.shiftsCompleted}</strong>
      <span>Overnight rests</span><strong>${state.stats.overnightRests}</strong>
      <span>Recovery days taken</span><strong>${state.stats.recoveryDays}</strong>
      <span>Same-day breaks</span><strong>${state.stats.sameDayBreaks}</strong>
      <span>Work orders reviewed</span><strong>${state.stats.workOrdersReviewed}</strong>
      <span>Lunches packed</span><strong>${state.stats.lunchesPacked}</strong>
      <span>Coffee jar contributions</span><strong>${state.stats.coffeesBought}</strong>
      <span>Bad coffee breaks</span><strong>${state.stats.coffeeBreaks}</strong>
      <span>Energy crashes</span><strong>${state.stats.energyCrashes || 0}</strong>
      <span>Exhaustion incidents</span><strong>${state.stats.exhaustionIncidents || 0}</strong>
      <span>Exhaustion mistakes</span><strong>${state.stats.exhaustionMistakes || 0}</strong>
      <span>Overexertion burnout</span><strong>${state.stats.exhaustionBurnout || 0}</strong>
      <span>Late prep nights</span><strong>${state.stats.stayLatePrepDays}</strong>
      <span>Shop help nights</span><strong>${state.stats.shopHelpDays}</strong>
      <span>Site surveys completed</span><strong>${state.stats.surveysCompleted}</strong>
      <span>Access risks documented</span><strong>${state.stats.accessRisksDocumented}</strong>
      <span>Quotes trusted anyway</span><strong>${state.stats.quotesTrustedAnyway}</strong>
      <span>Rooms commissioned</span><strong>${state.stats.commissioningRoomsCompleted}</strong>
      <span>Incomplete rooms documented</span><strong>${state.stats.incompleteRoomsDocumented}</strong>
      <span>Rooms passed anyway</span><strong>${state.stats.roomsPassedAnyway}</strong>
      <span>Warehouse runs completed</span><strong>${state.stats.warehouseRunsCompleted}</strong>
      <span>Stockroom labels corrected</span><strong>${state.stats.stockroomLabelsFixed}</strong>
      <span>Mystery boxes left alone</span><strong>${state.stats.mysteryBoxesLeft}</strong>
      <span>Secure-access jobs completed</span><strong>${state.stats.secureAccessJobsCompleted}</strong>
      <span>Access delays documented</span><strong>${state.stats.accessDelaysDocumented}</strong>
      <span>Unpaid delays absorbed</span><strong>${state.stats.unpaidDelaysAbsorbed}</strong>
      <span>Warranty returns completed</span><strong>${state.stats.warrantyReturnsCompleted}</strong>
      <span>Warranty bandages applied</span><strong>${state.stats.warrantyBandagesApplied}</strong>
      <span>Client handoffs completed</span><strong>${state.stats.clientHandoffsCompleted}</strong>
      <span>Systems jobs completed</span><strong>${state.stats.systemsJobsCompleted}</strong>
      <span>Systems mismatches documented</span><strong>${state.stats.systemMismatchesDocumented}</strong>
      <span>Quick reboots closed</span><strong>${state.stats.quickRebootsClosed}</strong>
      <span>Travel costs documented</span><strong>${state.stats.travelCostsDocumented}</strong>
      <span>Unreimbursed travel costs</span><strong>${state.stats.unreimbursedTravelCosts}</strong>
      <span>Retrofit walkdowns completed</span><strong>${state.stats.retrofitWalkdownsCompleted || 0}</strong>
      <span>Retrofit risks documented</span><strong>${state.stats.retrofitRisksDocumented || 0}</strong>
      <span>Retrofit scope pushbacks</span><strong>${state.stats.retrofitScopePushbacks || 0}</strong>
      <span>Retrofit risks accepted</span><strong>${state.stats.retrofitRisksAccepted || 0}</strong>
      <span>Retrofit installs completed</span><strong>${state.stats.retrofitInstallsCompleted || 0}</strong>
      <span>Retrofit pathways installed</span><strong>${state.stats.retrofitPathwaysInstalled || 0}</strong>
      <span>Retrofit install risks resolved</span><strong>${state.stats.retrofitInstallRisksResolved || 0}</strong>
      <span>Retrofit install risks inherited</span><strong>${state.stats.retrofitInstallRisksInherited || 0}</strong>
      <span>Training gaps left</span><strong>${state.stats.trainingGapsLeft}</strong>
      <span>Passed skill checks</span><strong>${state.stats.skillChecksPassed}</strong>
      <span>Strained skill checks</span><strong>${state.stats.skillChecksStrained}</strong>
      <span>Field task choices</span><strong>${state.stats.fieldTaskChoicesMade}</strong>
      <span>Clean terminations</span><strong>${state.stats.cleanTerminations}</strong>
      <span>Documented task risks</span><strong>${state.stats.documentedTaskRisks}</strong>
    </div>
  `;
}

function getCareerMilestones() {
  const josh = content.coworkers.josh;
  return [
    {
      status: state.training.length ? "[COMPLETE]" : getCareerLevel() >= 2 ? "[AVAILABLE]" : "[LOCKED]",
      name: "Junior Tech field-training focus",
      description: "Reach Level 2, then choose one practical habit from the career clipboard.",
    },
    {
      status: ownsTool("labeler") ? "[COMPLETE]" : state.reputation.coworkers >= josh.labelerTrustRequired ? "[AVAILABLE]" : "[LOCKED]",
      name: `${josh.name}'s rebuilt labeler`,
      description: `Earn ${josh.labelerTrustRequired} coworker reputation and check in with ${josh.name} at the shop.`,
    },
    {
      status: getCareerLevel() >= 3 ? "[COMPLETE]" : "[LOCKED]",
      name: "Field Tech rank",
      description: "Reach 180 XP. Certification choices will build on this milestone later.",
    },
  ];
}

function chooseTraining(trainingId) {
  if (!hasPendingTraining()) return showCareerClipboard();
  const choice = content.career.trainingChoices.find((item) => item.id === trainingId);
  if (!choice || state.training.includes(trainingId)) return showCareerClipboard();
  const previousMaxEnergy = getMaxEnergy();
  state.training.push(trainingId);
  if (getMaxEnergy() > previousMaxEnergy) changeEnergy(getMaxEnergy() - previousMaxEnergy);
  addLog(`${choice.name} selected as your next field-training focus.`);
  showModal({
    kicker: "Field Training Added",
    title: choice.name,
    body: `<p>${choice.description}</p><p class="muted">${choice.effect}</p><p><strong>Current skill tree:</strong></p>${getSkillSummaryMarkup()}`,
    actions: [{ label: "Return to Shop", onClick: render }],
  });
}

function showJoshConversation() {
  if (shouldHideJoshUntilNextMorning()) return notify("Close out the first day before catching Josh tomorrow morning.");
  const josh = content.coworkers.josh;
  if (!state.flags.metJosh) {
    state.flags.metJosh = true;
    if (state.flags.endShiftPending) {
      state.flags.joshIntroEndShiftSource = state.flags.endShiftSource || "current shift";
    }
    addLog("Met Josh, the lead technician. Management interrupted to blame him for an inventory problem.");
    return showModal({
      kicker: `${josh.name} / ${josh.role}`,
      title: "The Person Keeping This Place Running",
      body: `
        <p>Josh is sorting a pile of adapters into bins with labels that look newer than the shelves.</p>
        <p><strong>Manager, from the sales office:</strong> "Josh, why are we missing two HDMI couplers? This inventory situation is becoming a pattern."</p>
        <p><strong>Josh:</strong> "Morning. Ignore that. They zip-tied both couplers behind a display yesterday and called it spare inventory. If you get stuck onsite, slow down and trace the path before you start swapping things."</p>
      `,
      actions: [{ label: state.flags.endShiftPending ? "Close Out Shift" : "Thank Josh", onClick: state.flags.endShiftPending ? showEndShiftModal : render }],
    });
  }
  if (state.flags.serviceCallbackPending && !state.flags.serviceCallbackResolved) return showJoshCallback();
  if (state.flags.serviceComplete && !state.flags.joshServiceDebriefed) {
    const checkedSignalPath = state.flags.serviceApproach === "verify";
    state.flags.joshServiceDebriefed = true;
    addLog(checkedSignalPath
      ? "Josh noticed the Conshohocken room notes and the labeled coupler."
      : "Josh reviewed the Conshohocken callback and the missing room notes.");
    return showModal({
      kicker: `${josh.name} / ${josh.role}`,
      title: checkedSignalPath ? "Good Notes Save The Next Person" : "Now The Ticket Is Better Than It Was",
      body: `
        <p>Josh looks over the Conshohocken notes while management asks whether he can also swing by a warehouse to find a power supply that was last seen in "one of the vans."</p>
        <p><strong>Josh:</strong> "${checkedSignalPath
          ? "You traced it, marked the odd coupler, and left enough detail that the next person will know what happened. That is the job."
          : "You know what bit you now. Put it in the notes, label the weird part, and the next person gets to start one step ahead."}"</p>
      `,
      actions: [{
        label: canReceiveJoshLabeler() ? "Talk Tools" : "Keep That In Mind",
        onClick: () => canReceiveJoshLabeler() ? showJoshLabelerOffer() : render(),
      }],
    });
  }
  if (shouldShowRetrofitInstallDebrief()) return showRetrofitInstallDebrief();
  if (canReceiveJoshLabeler()) return showJoshLabelerOffer();
  notify(`Josh: "Label both ends. Future you is also a technician, and future you is already annoyed."`);
}

function showRetrofitInstallDebrief() {
  const branchId = state.flags.retrofitInstallBranch || getRetrofitInstallBranchIdFromFlags(state.flags);
  const branchLabel = getRetrofitInstallPreview()?.branch?.label || branchId;
  const resultSummary = getRetrofitInstallResultSummary(
    state.flags.retrofitInstallApproach,
    branchId,
    Boolean(state.flags.retrofitInstallCheckStrained),
  );
  const riskCopy = state.flags.retrofitInstallRiskInherited
    ? "Still visible on the ledger"
    : state.flags.retrofitInstallRiskResolved
    ? "Resolved by record/as-built notes"
    : "Controlled for this install";
  state.flags.retrofitInstallDebriefed = true;
  addLog("Debriefed the Burlington retrofit install with Josh before reviewing the career snapshot.");
  render();
  showModal({
    kicker: "Josh / Lead Technician",
    title: "The Ceiling Finally Has A Paper Trail",
    body: `
      <p>Josh has the Burlington photos open beside a label cassette and the kind of coffee that has become a troubleshooting tool by accident.</p>
      <p><strong>Josh:</strong> "Walkdown, install, then notes that admit what the ceiling actually did. That is a real little project. The board will call it one line item because the board has never held a ladder."</p>
      <div class="results-grid">
        <span>Inherited branch</span><strong>${escapeHtml(branchLabel)}</strong>
        <span>Install closeout</span><strong>${escapeHtml(resultSummary)}</strong>
        <span>Return-trip risk</span><strong>${escapeHtml(riskCopy)}</strong>
        <span>Energy after recovery</span><strong>${state.energy}/${getMaxEnergy()}</strong>
        <span>Burnout</span><strong>${state.burnout}</strong>
      </div>
      <p class="muted">${state.flags.retrofitInstallRiskInherited
        ? "The install is done, but Josh flags the weak pathway record as the kind of thing that can become somebody else's first hour later."
        : "The install is done, and the record is strong enough that the next tech should not have to rediscover the route from ceiling dust."}</p>
    `,
    actions: [
      { label: "Review Career Snapshot", onClick: showCareerSnapshot },
      ...(canReceiveJoshLabeler() ? [{ label: "Talk Tools", className: "secondary-button", onClick: showJoshLabelerOffer }] : []),
      { label: "Return To Shop", className: "secondary-button", onClick: render },
    ],
  });
}

function showJoshCallback() {
  showModal({
    kicker: "Callback Note",
    title: "Management Found A Way To Blame Josh",
    body: `
      <p>The Conshohocken room dropped signal again after you left. Josh found the callback note clipped to his bench underneath a handwritten work order for "TV issue."</p>
      <p><strong>Manager:</strong> "Josh, can you clean this up? We need better oversight on these service calls."</p>
      <p><strong>Josh:</strong> "The weird coupler should have been in the ticket. I can close it out. If you have a minute, help me reconstruct the room notes so the next call is cleaner."</p>
    `,
    actions: [
      { label: "Help Josh reconstruct the notes (-3 energy)", onClick: () => resolveJoshCallback(true) },
      { label: "Leave Josh to close the callback", className: "secondary-button", onClick: () => resolveJoshCallback(false) },
    ],
  });
}

function resolveJoshCallback(helpJosh) {
  state.flags.serviceCallbackResolved = true;
  if (state.flags.returnTripRisks?.conshohockenServiceRoomPressure) {
    resolveReturnTripRisk("conshohockenServiceRoomPressure", {
      source: content.serviceDispatch.title,
      resolution: helpJosh
        ? "Josh and the player rebuilt the room notes enough to resolve the Conshohocken service pressure."
        : "Josh closed the callback and removed the active Conshohocken service pressure.",
    });
  }
  if (helpJosh) {
    changeEnergy(-3);
    state.reputation.coworkers += 1;
    addLog("Helped Josh reconstruct the callback notes. Coworker reputation improved.");
  } else {
    state.reputation.management += 1;
    addLog("Josh handled the callback while management praised the team's responsiveness.");
  }
  state.stats.callbacksResolved += 1;
  render();
  if (canReceiveJoshLabeler()) showJoshLabelerOffer();
}

function canReceiveJoshLabeler() {
  return state.flags.metJosh
    && !ownsTool("labeler")
    && state.reputation.coworkers >= content.coworkers.josh.labelerTrustRequired;
}

function showJoshLabelerOffer() {
  const tool = content.tools.labeler;
  showModal({
    kicker: "Coworker Hand-Me-Down",
    title: tool.name,
    body: `
      <p><strong>Josh:</strong> "I rebuilt the feed roller on this one. It is not fancy, but it is dependable. Put your name in it before somebody decides it belongs in Van #2."</p>
      <p>${tool.description}</p>
      <p class="muted">${tool.effect}</p>
    `,
    actions: [{ label: "Add Labeler To Personal Kit", onClick: receiveJoshLabeler }],
  });
}

function receiveJoshLabeler() {
  if (!ownsTool("labeler")) state.tools.push("labeler");
  state.flags.joshLabelerGift = true;
  addLog("Josh handed down his rebuilt labeler.");
  showModal({
    kicker: "Personal Tool Added",
    title: content.tools.labeler.name,
    body: `<p>${content.tools.labeler.description}</p><p class="muted">${getToolEffectText(content.tools.labeler)}</p>`,
    actions: [{ label: "Return to Shop", onClick: render }],
  });
}

function showSupplyCounter() {
  if (shouldIntroduceJoshBeforeNextDispatch()) return notifyJoshIntroRequired();
  const availableTools = Object.values(content.tools).filter((tool) => tool.price > 0 && !ownsTool(tool.id));
  showModal({
    kicker: "Radnor Rack & Wire Supply Counter",
    title: "Personal Tool Purchases",
    body: availableTools.length ? `
      <p>Company reimbursement policy: optimistic.</p>
      <ul class="modal-list">
        ${availableTools.map((tool) => `<li><strong>${tool.name} - $${tool.price}</strong><span>${getToolEffectText(tool)}</span></li>`).join("")}
      </ul>
      <p class="muted">Cash available: ${formatCash(state.cash)}</p>
    ` : `<p>You already own every tool currently stocked here.</p>`,
    actions: [
      ...availableTools.map((tool) => ({
        label: `Buy ${tool.name} - $${tool.price}`,
        className: "secondary-button",
        onClick: () => buyTool(tool.id),
      })),
      { label: "Leave Supply Counter" },
    ],
  });
}

function buyTool(toolId) {
  const tool = content.tools[toolId];
  if (!tool || ownsTool(toolId)) return showSupplyCounter();
  if (state.cash < tool.price) {
    addLog(`Not enough cash for ${tool.name}.`);
    return showSupplyCounter();
  }
  state.cash -= tool.price;
  state.tools.push(toolId);
  addLog(`${tool.name} purchased for $${tool.price}.`);
  showModal({
    kicker: "Personal Tool Added",
    title: tool.name,
    body: `<p>${tool.description}</p><p class="muted">${getToolEffectText(tool)}</p><p class="muted">Cash remaining: ${formatCash(state.cash)}</p>`,
    actions: [{ label: "Return to Shop", onClick: render }],
  });
}

function takeBreak() {
  showBreakArea();
}
