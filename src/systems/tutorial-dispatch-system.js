// First-day tutorial dispatch flow: Center City travel, carts, closeout, and starter reward.
// Keeping this out of core/app.js makes later dispatch cleanup easier to review.
function promptTravel() {
  showRouteChoiceModal({
    routeId: "centerCityTutorial",
    dispatchEstimate: "Simple two-cart build. Supervisor onsite.",
    extraBody: "<p>Today's drive is scripted for the tutorial. Future jobs can offer route, toll, and parking choices.</p>",
    afterTravel: showParkingModal,
  });
}

function showParkingModal() {
  showModal({
    kicker: "Parking Complication",
    title: "Garage First, Apparently",
    body: `
      <p>The client building has no arranged curb access. Park in a nearby fictional garage and meet your supervisor at the van.</p>
      <p class="expense">Garage parking: <strong>-$18</strong> pending reimbursement</p>
    `,
    actions: [{ label: "Park on Level B2", onClick: () => enterScene("garage") }],
  });
}

function showLobbyTransition() {
  usePortal("garageToLobby");
}

function showSupervisorDeparture() {
  state.flags.supervisorLeft = true;
  setClock("MON 11:38 AM");
  showModal({
    kicker: "Supervisor Update",
    title: "You Should Be Fine. Probably.",
    body: `
      <p><strong>Supervisor:</strong> "I'm sorry. They need me at another site for meetings. Finish the second cart the same way and text me if anything gets weird."</p>
      <p>Your supervisor leaves apologetically. They appear to be having a worse day than you.</p>
    `,
    actions: [{
      label: "Finish Cart 2 Alone",
      onClick: () => {
        addLog("Supervisor pulled into meetings at another site. You are finishing alone.");
        render();
      },
    }],
  });
}

function getCableDressEnergyCost() {
  return Math.max(0, 13 - getCarefulTaskReduction());
}

function showFinishChoice() {
  if (state.flags.finished) {
    return state.flags.reward
      ? showCompletedDispatchReturnReview({
        title: "First Install Already Complete",
        source: "Two Quick Carts",
        result: getCompletedCloseoutPathResult("finishChoice"),
      })
      : showResults();
  }
  setClock("MON 5:46 PM");
  showModal({
    kicker: "Last Decision",
    title: "Cart 2 Works. The Cables Do Not Look Happy.",
    body: `
      <p>The work order expected you to be done hours ago. You can clean up the cable routing or leave before traffic gets worse.</p>
      ${canUseMakeThatWorkShortcut() ? `<p class="muted">${getCharacterLine("finishChoice", "You can make the awkward path work for now. The question is whether it deserves to become the install.")}</p>` : ""}
      ${state.flags.cartAssemblyStrained ? `<p class="muted">Some assembly checks were strained. Dressing the cables properly also gives you time to catch the shaky details.</p>` : ""}
      <p><strong>Energy:</strong> ${state.energy}/${getMaxEnergy()}</p>
      ${getChoicePressureMarkup([
        {
          label: "Dress properly",
          detail: "Careful install closeout. Costs time and energy now; likely protects the client and next tech while making management impatient.",
        },
        ...(canUseMakeThatWorkShortcut() ? [{
          label: "Use the workaround",
          detail: "Fast improvisation. Saves energy now, but may turn today's temporary fix into tomorrow's return trip.",
        }] : []),
        {
          label: "Zip ties and leave",
          detail: "Management-friendly speed. Lower effort now; future risk depends on how clean the build really was.",
        },
      ])}
    `,
    actions: [
      { label: `Dress the cables properly (+35 min, -${getCableDressEnergyCost()} energy)`, onClick: () => finishJob("tidy") },
      ...(canUseMakeThatWorkShortcut() ? [{
        label: "Use the adapter workaround and leave",
        className: "secondary-button",
        onClick: () => finishJob("wiley-workaround"),
      }] : []),
      { label: "Use three zip ties and leave", className: "secondary-button", onClick: () => finishJob("rush") },
    ],
  });
}

function finishJob(choice) {
  if (state.flags.finished) {
    return state.flags.reward
      ? showCompletedDispatchReturnReview({
        title: "First Install Already Complete",
        source: "Two Quick Carts",
        result: getCompletedCloseoutPathResult("finishChoice"),
      })
      : showResults();
  }
  const before = getTrackedStateSnapshot();
  state.flags.finished = true;
  state.flags.finishChoice = choice;
  if (choice === "tidy") {
    changeEnergy(-getCableDressEnergyCost());
    state.burnout += 1;
    setClock("MON 6:21 PM");
    addLog("Cable routing cleaned up. Client is happy. Management notices the clock.");
  } else if (choice === "wiley-workaround") {
    changeEnergy(-2);
    setClock("MON 5:49 PM");
    state.stats.callbacks += 1;
    state.flags.wileyUsedTemporaryFix = true;
    recordReturnTripRisk("usedTemporaryAdapterPermanently", {
      source: "Two Quick Carts",
      detail: "Adapter workaround used as final install path.",
    });
    addLog(getCharacterLine("workaroundLog", "Made the adapter path work for now. The closeout notes did not get smarter."));
  } else {
    changeEnergy(-4);
    setClock("MON 5:54 PM");
    if (state.flags.cartAssemblyStrained) {
      state.stats.callbacks += 1;
      state.flags.tutorialAssemblyCallbackRisk = true;
    }
    addLog("You left before traffic got worse. The second cart may become a callback.");
  }
  if (!state.flags.tutorialPaid) {
    state.cash += choice === "tidy" ? 152 : 141;
    state.flags.tutorialPaid = true;
  }
  if (!state.flags.tutorialProgressAwarded) {
    awardCareerProgress({
      xp: 40,
      reputation: choice === "tidy"
        ? { clients: 2, coworkers: 1, management: -1 }
        : choice === "wiley-workaround"
        ? { clients: 1, coworkers: -1, management: 1 }
        : { clients: 0, coworkers: 0, management: 1 },
      source: "Two Quick Carts",
    });
    state.flags.tutorialProgressAwarded = true;
  }
  if (!state.flags.tutorialStatsRecorded) {
    state.stats.overtimeDays += 1;
    if (choice === "tidy") state.stats.carefulFinishes += 1;
    state.flags.tutorialStatsRecorded = true;
  }
  showResults({ before });
}

function showResults({ before = null } = {}) {
  const tidy = state.flags.finishChoice === "tidy";
  const netPay = tidy ? 152 : 141;
  const rewardTools = content.tutorial.rewardTools.filter((toolId) => !ownsTool(toolId));
  if (before) {
    const riskyWorkaround = state.flags.finishChoice === "wiley-workaround";
    const rushedRisk = state.flags.finishChoice === "rush" && state.flags.tutorialAssemblyCallbackRisk;
    recordJobSiteCloseoutSummary({
      source: "Two Quick Carts",
      result: getCompletedCloseoutPathResult("finishChoice"),
      before,
      consequences: [{
        source: "Two Quick Carts",
        status: tidy ? "controlled" : riskyWorkaround || rushedRisk ? "open" : "inherited",
        cause: tidy
          ? "Cable routing was cleaned up before packing out."
          : riskyWorkaround
          ? "Adapter workaround was used as the final install path."
          : "The cart build was closed quickly with a thinner final check.",
        affects: getReturnTripRiskAffectedWork("usedTemporaryAdapterPermanently"),
        detail: tidy
          ? "The first install leaves no named callback risk."
          : riskyWorkaround || rushedRisk
          ? "The closeout can create callback pressure or future warranty work."
          : "The shortcut is saved on the closeout path even without a named risk.",
      }],
    });
  }
  showModal({
    kicker: "End of Day",
    title: "Two Quick Carts: Complete",
    body: `
      <div class="results-grid">
        <span>Base wages</span><strong>+$128</strong>
        <span>Overtime</span><strong>+${tidy ? "$42" : "$31"}</strong>
        <span>Garage parking</span><strong>-$18</strong>
        <span>Net take-home</span><strong>+$${netPay}</strong>
        <span>Cash balance</span><strong>${formatCash(state.cash)}</strong>
        <span>Expense status</span><strong>Receipt under review</strong>
        <span>Energy remaining</span><strong>${state.energy}/${getMaxEnergy()}</strong>
        <span>Burnout</span><strong>${state.burnout}</strong>
        <span>Experience</span><strong>+40 XP</strong>
      </div>
      ${before ? `
        <h3>What Changed</h3>
        ${getTrackedStateDeltaMarkup(before)}
      ` : ""}
      <blockquote>Management note: "Please improve time management and plan parking more efficiently."</blockquote>
      <p>You survived your first week early. ${rewardTools.length ? "Choose one starter upgrade." : "Your starter kit already covers the current upgrade choices."}</p>
      ${getReturnPortalCloseoutNoteMarkup()}
    `,
    actions: rewardTools.length ? rewardTools.map((toolId) => ({
      label: content.tools[toolId].name,
      className: "secondary-button",
      onClick: () => chooseReward(toolId),
    })) : [getCloseoutReturnAction("Two Quick Carts", "Returned to Radnor Rack & Wire after the Center City cart build.", {
      beforeReturn: () => {
        state.flags.reward = "starter-kit";
        addLog("Starter kit already included the current upgrade choices.");
      },
    })],
  });
}

function chooseReward(toolId) {
  if (!ownsTool(toolId)) state.tools.push(toolId);
  state.flags.reward = toolId;
  showModal({
    kicker: "Personal Tool Added",
    title: content.tools[toolId].name,
    body: `
      <p>${content.tools[toolId].description}</p>
      <p class="muted">${getToolEffectText(content.tools[toolId])}</p>
      ${getReturnPortalCloseoutNoteMarkup()}
    `,
    actions: [getCloseoutReturnAction("Two Quick Carts", "Returned to Radnor Rack & Wire after the Center City cart build.", {
      beforeReturn: () => {
        addLog(`${content.tools[toolId].name} added to your personal kit.`);
      },
    })],
  });
}
