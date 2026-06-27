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
  const pressure = ensureTutorialInstallPressure();
  setClock("MON 11:38 AM");
  showModal({
    kicker: "Supervisor Update",
    title: "You Should Be Fine. Probably.",
    body: `
      <p><strong>Supervisor:</strong> "I'm sorry. They need me at another site for meetings. Finish the second cart the same way and text me if anything gets weird."</p>
      <p>Your supervisor leaves apologetically. They appear to be having a worse day than you.</p>
      ${pressure ? getTutorialInstallPressureMarkup() : ""}
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

function getTutorialInstallPressureDefinitions() {
  return content.tutorial.installPressures || [];
}

function getTutorialInstallPressureById(pressureId) {
  return getTutorialInstallPressureDefinitions().find((pressure) => pressure.id === pressureId) || null;
}

function getTutorialInstallPressureSeed() {
  if (!state.flags.tutorialInstallPressureSeed) {
    state.flags.tutorialInstallPressureSeed = Math.floor(Math.random() * 1000000000) + 1;
  }
  return state.flags.tutorialInstallPressureSeed;
}

function ensureTutorialInstallPressure() {
  const definitions = getTutorialInstallPressureDefinitions();
  if (!definitions.length) return null;
  const validIds = new Set(definitions.map((pressure) => pressure.id));
  if (!validIds.has(state.flags.tutorialInstallPressureId)) {
    state.flags.tutorialInstallPressureId = getRolledPressureConditionIds(definitions, getTutorialInstallPressureSeed(), { limit: 1 })[0];
  }
  return getTutorialInstallPressureById(state.flags.tutorialInstallPressureId);
}

function getTutorialInstallPressureResolution() {
  const pressure = ensureTutorialInstallPressure();
  const resolution = state.flags.tutorialInstallPressureResolution || null;
  return pressure && resolution?.pressureId === pressure.id ? resolution : null;
}

function isTutorialInstallPressureControlled() {
  return Boolean(getTutorialInstallPressureResolution()?.controlled);
}

function getActionableTutorialInstallPressure() {
  if (!state.flags.supervisorLeft || state.flags.finished) return null;
  const pressure = ensureTutorialInstallPressure();
  if (!pressure || getTutorialInstallPressureResolution()) return null;
  return pressure;
}

function getUncontrolledTutorialInstallPressure() {
  const pressure = ensureTutorialInstallPressure();
  if (!pressure || isTutorialInstallPressureControlled()) return null;
  return pressure;
}

function getTutorialPressureCheckModifier(pressure, check) {
  const modifiers = pressure?.checkModifiers || {};
  const keys = uniqueValues([check?.id, check?.contextId]);
  return keys.map((key) => modifiers[key]).find(Boolean) || null;
}

function getTutorialInstallPressureEffects(check) {
  if (!state.flags.supervisorLeft) {
    return { pressure: null, difficulty: 0, energy: 0 };
  }
  const pressure = getUncontrolledTutorialInstallPressure();
  const modifier = getTutorialPressureCheckModifier(pressure, check);
  return {
    pressure,
    difficulty: modifier?.difficulty || 0,
    energy: modifier?.energy || 0,
  };
}

function getTutorialAdjustedAssemblyPart(part) {
  if (!part) return part;
  const effects = getTutorialInstallPressureEffects(part);
  const pressureNote = effects.pressure
    ? ` First-day pressure: ${effects.pressure.label}. ${effects.pressure.revealedSummary}`
    : "";
  return {
    ...part,
    difficulty: Math.max(0, (part.difficulty || 0) + effects.difficulty),
    energyCost: Math.max(0, (part.energyCost || 0) + effects.energy),
    detail: `${part.detail || ""}${pressureNote}`,
  };
}

function getTutorialInstallPressureMarkup() {
  const pressure = ensureTutorialInstallPressure();
  if (!pressure) return "";
  const resolution = getTutorialInstallPressureResolution();
  return `
    <h3>First-Day Pressure</h3>
    <ul class="modal-list">
      <li>
        <strong>${escapeHtml(pressure.label)}</strong>
        <span>${escapeHtml(pressure.revealedSummary || "")}</span>
        ${resolution ? `<span>Response: ${escapeHtml(resolution.detail)}</span>` : ""}
        ${resolution?.incidentChance ? `<span>Risk roll: ${formatChance(resolution.incidentChance)} chance, rolled ${Math.round((resolution.incidentRoll || 0) * 100)}%.</span>` : ""}
      </li>
    </ul>
  `;
}

function getTutorialPressureResponseOptions(pressure) {
  if (!pressure) return [];
  const careful = pressure.carefulOption || {};
  const quick = pressure.quickOption || {};
  return [
    {
      id: careful.id || "careful",
      label: `${careful.label || "Handle carefully"} (-${careful.energyCost || 2} energy)`,
      detail: careful.detail || "Spend energy now to control the issue before closeout.",
      result: careful.result || `${pressure.label} is controlled before closeout.`,
      log: careful.log || `${pressure.label} handled carefully before closeout.`,
      energyCost: careful.energyCost ?? 2,
      reputation: careful.reputation || { coworkers: 1, management: -1 },
      stat: careful.stat || "documentedTaskRisks",
      controlled: true,
    },
    {
      id: quick.id || "quick",
      label: `${quick.label || "Try a quick fix"} (-${quick.energyCost || 1} energy, ${formatChance(quick.incidentChance || 0.3)} incident risk)`,
      detail: quick.detail || "Save energy now, but a bad roll makes the room pressure visible.",
      result: quick.result || `${pressure.label} holds after a quick fix.`,
      log: quick.log || `${pressure.label} quick fix held during the room test.`,
      energyCost: quick.energyCost ?? 1,
      reputation: quick.reputation || { management: 1 },
      controlled: true,
      incidentChance: quick.incidentChance ?? 0.3,
      incidentResult: quick.incidentResult || `${pressure.label} caused an immediate room issue.`,
      incidentLog: quick.incidentLog || `${pressure.label} caused an immediate room issue during the first install.`,
      incidentReputation: quick.incidentReputation || { clients: -1, management: -1 },
      incidentBurnout: quick.incidentBurnout ?? 1,
    },
    {
      id: "leave",
      label: "Leave it for closeout",
      detail: "Spend nothing now. Tidy closeout can still catch it; a rushed closeout can carry it back to the shop.",
      result: pressure.leaveResult || `${pressure.label} was left for closeout.`,
      log: `${pressure.label} left for closeout on the first install day.`,
      controlled: false,
    },
  ];
}

function showTutorialInstallPressureChoice() {
  const pressure = getActionableTutorialInstallPressure();
  if (!pressure) {
    return getTutorialInstallPressureResolution()
      ? showModal({
        kicker: "First-Day Pressure",
        title: "Already Handled",
        body: getTutorialInstallPressureMarkup(),
        actions: [{ label: "Back To Room", onClick: render }],
      })
      : notify("No cart-room pressure needs a decision right now.");
  }
  const options = getTutorialPressureResponseOptions(pressure);
  showModal({
    kicker: "First-Day Pressure",
    title: pressure.label,
    body: `
      <p>${escapeHtml(pressure.revealedSummary || "")}</p>
      ${getChoicePressureMarkup(options.map((option) => ({ label: option.label, detail: option.detail })))}
      <p class="muted">This is the first small version of field pressure: spend energy now, risk a quick fix, or leave the issue for closeout.</p>
    `,
    actions: options.map((option) => ({
      label: option.label,
      className: option.controlled ? undefined : "secondary-button",
      onClick: () => resolveTutorialInstallPressureResponse(pressure.id, option.id),
    })),
  });
}

function resolveTutorialInstallPressureResponse(pressureId, optionId, rollOverride = null) {
  const pressure = getTutorialInstallPressureById(pressureId);
  const option = getTutorialPressureResponseOptions(pressure).find((item) => item.id === optionId);
  if (!pressure || !option) return notify("That cart-pressure response is not available.");
  if (state.flags.finished) return notify("The first install is already closed out.");
  if (getTutorialInstallPressureResolution()) return notify("That cart pressure already has a response.");

  const { rollResult, incidentHappened, controlled, detail } = resolvePressureResponseOutcome(option, rollOverride);
  if (incidentHappened) {
    state.flags.tutorialInstallPressureIncident = true;
    state.flags.cartAssemblyStrained = true;
    addLog(option.incidentLog || detail);
  } else {
    addLog(option.log || detail);
  }
  state.flags.tutorialInstallPressureResolution = {
    pressureId: pressure.id,
    actionId: option.id,
    label: option.label,
    detail,
    controlled,
    incident: incidentHappened,
    incidentChance: rollResult?.chance || 0,
    incidentRoll: rollResult?.roll ?? null,
  };
  markCareerSnapshotStale();
  render();
  showModal({
    kicker: "First-Day Pressure",
    title: incidentHappened ? "The Room Notices" : controlled ? "Pressure Controlled" : "Saved For Closeout",
    body: `
      <p>${escapeHtml(detail)}</p>
      ${rollResult ? `<p class="muted"><strong>Incident roll:</strong> ${formatChance(rollResult.chance)} chance, rolled ${Math.round(rollResult.roll * 100)}%. ${incidentHappened ? "The risk happened in the room." : "The quick fix held this time."}</p>` : ""}
      ${getTutorialInstallPressureMarkup()}
      <p class="muted">${controlled ? "This pressure will not add return-trip risk unless another closeout problem remains." : "This pressure can still be cleaned up by a tidy closeout, but rushing will carry it back."}</p>
    `,
    actions: [{ label: "Back To Room", onClick: render }],
  });
}

function controlTutorialInstallPressureAtCloseout() {
  const pressure = getUncontrolledTutorialInstallPressure();
  if (!pressure) return null;
  const detail = `${pressure.label} was caught during careful cable dressing and final cart cleanup.`;
  state.flags.tutorialInstallPressureResolution = {
    pressureId: pressure.id,
    actionId: "tidy-closeout",
    label: "Caught during tidy closeout",
    detail,
    controlled: true,
    incident: Boolean(state.flags.tutorialInstallPressureIncident),
    controlledAtCloseout: true,
  };
  return detail;
}

function getTutorialOpenPressureRiskDetail() {
  const pressure = getUncontrolledTutorialInstallPressure();
  if (!pressure) return "";
  const resolution = getTutorialInstallPressureResolution();
  const incidentText = resolution?.incident || state.flags.tutorialInstallPressureIncident
    ? " The issue already became visible in the room."
    : "";
  return `${pressure.label}: ${pressure.closeoutRisk || "A rushed closeout can leave this as return-trip pressure."}${incidentText}`;
}

function installCartPart(destination) {
  if (!hasCarriedItems()) return notify("Pick up the next cart component from the delivered boxes.");
  const basePart = content.tutorial.assembly.find((item) => item.id === state.carry[0]);
  const part = getTutorialAdjustedAssemblyPart(basePart);
  if (!part || part.destination !== destination) return notify(`${part?.label || "That component"} belongs on the other cart.`);
  const { skillCheck, energyCost } = resolveFieldTaskCheck({
    check: part,
    checkId: part.id,
    completedChecks: state.assembled,
    flagKey: `cart-${part.id}`,
    baseEnergyCost: getAssemblyEnergyCost(part.energyCost),
    failedEnergyPenalty: 1,
    strainedFlag: "cartAssemblyStrained",
    logText: `${part.label} installed ${ownsTool("drill") ? "with your drill" : "with your screwdriver"}.`,
    strainedLogText: "Cart assembly check strained; the first install day is teaching through resistance.",
  });
  state.carry = [];
  const cart1Done = state.assembled.filter((id) => id.startsWith("cart-1")).length === 2;
  const cart2Done = state.assembled.filter((id) => id.startsWith("cart-2")).length === 2;
  if (cart1Done && !state.flags.supervisorLeft) return showSupervisorDeparture();
  if (cart2Done && !state.flags.finished) return showFinishChoice();
  render();
  showModal({
    kicker: "Cart Assembly",
    title: part.label,
    body: `
      <p>${part.detail}</p>
      ${getFieldTaskResultMarkup({ check: part, skillCheck, energyCost })}
    `,
    actions: [{ label: "Keep Building", onClick: render }],
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
  const openPressure = getUncontrolledTutorialInstallPressure();
  setClock("MON 5:46 PM");
  showModal({
    kicker: "Last Decision",
    title: "Cart 2 Works. The Cables Do Not Look Happy.",
    body: `
      <p>The work order expected you to be done hours ago. You can clean up the cable routing or leave before traffic gets worse.</p>
      ${canUseMakeThatWorkShortcut() ? `<p class="muted">${getCharacterLine("finishChoice", "You can make the awkward path work for now. The question is whether it deserves to become the install.")}</p>` : ""}
      ${state.flags.cartAssemblyStrained ? `<p class="muted">Some assembly checks were strained. Dressing the cables properly also gives you time to catch the shaky details.</p>` : ""}
      ${openPressure ? getTutorialInstallPressureMarkup() : ""}
      <p><strong>Energy:</strong> ${state.energy}/${getMaxEnergy()}</p>
      ${getChoicePressureMarkup([
        {
          label: "Dress properly",
          detail: `Careful install closeout. Costs time and energy now; likely protects the client and next tech while making management impatient.${openPressure ? ` Also gives you time to control ${openPressure.label}.` : ""}`,
        },
        ...(canUseMakeThatWorkShortcut() ? [{
          label: "Use the workaround",
          detail: `Fast improvisation. Saves energy now, but may turn today's temporary fix into tomorrow's return trip.${openPressure ? ` Does not fully resolve ${openPressure.label}.` : ""}`,
        }] : []),
        {
          label: "Zip ties and leave",
          detail: `Management-friendly speed. Lower effort now; future risk depends on how clean the build really was.${openPressure ? ` Riskier while ${openPressure.label} is still open.` : ""}`,
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
  const openPressureBeforeCloseout = getUncontrolledTutorialInstallPressure();
  const openPressureRiskDetail = getTutorialOpenPressureRiskDetail();
  state.flags.finished = true;
  state.flags.finishChoice = choice;
  if (choice === "tidy") {
    changeEnergy(-getCableDressEnergyCost());
    state.burnout += 1;
    setClock("MON 6:21 PM");
    const pressureCloseout = controlTutorialInstallPressureAtCloseout();
    if (pressureCloseout) addLog(pressureCloseout);
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
    if (state.flags.cartAssemblyStrained || openPressureBeforeCloseout) {
      state.stats.callbacks += 1;
      state.flags.tutorialAssemblyCallbackRisk = true;
    }
    if (openPressureBeforeCloseout) {
      state.flags.tutorialInstallPressureCallbackRisk = true;
      recordReturnTripRisk("centerCityCartPressure", {
        source: "Two Quick Carts",
        cause: openPressureRiskDetail,
        detail: openPressureRiskDetail,
        affects: getReturnTripRiskAffectedWork("centerCityCartPressure"),
      });
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
  let closeoutConsequences = [];
  if (before) {
    const riskyWorkaround = state.flags.finishChoice === "wiley-workaround";
    const pressureResolution = getTutorialInstallPressureResolution();
    const pressure = ensureTutorialInstallPressure();
    const rushedRisk = state.flags.finishChoice === "rush" && (state.flags.tutorialAssemblyCallbackRisk || state.flags.tutorialInstallPressureCallbackRisk);
    closeoutConsequences = [{
      source: "Two Quick Carts",
      status: tidy ? "controlled" : riskyWorkaround || rushedRisk ? "open" : "inherited",
      cause: tidy
        ? pressureResolution?.controlledAtCloseout
          ? `${pressure?.label || "First-day pressure"} was caught during careful closeout.`
          : "Cable routing was cleaned up before packing out."
        : riskyWorkaround
        ? "Adapter workaround was used as the final install path."
        : state.flags.tutorialInstallPressureCallbackRisk
        ? `${pressure?.label || "First-day pressure"} was rushed through closeout.`
        : "The cart build was closed quickly with a thinner final check.",
      affects: getReturnTripRiskAffectedWork(state.flags.tutorialInstallPressureCallbackRisk ? "centerCityCartPressure" : "usedTemporaryAdapterPermanently"),
      detail: tidy
        ? pressureResolution?.controlledAtCloseout
          ? `${pressureResolution.detail} The first install leaves no named callback risk.`
          : "The first install leaves no named callback risk."
        : riskyWorkaround || rushedRisk
        ? "The closeout can create callback pressure or future warranty work."
        : "The shortcut is saved on the closeout path even without a named risk.",
    }];
    recordJobSiteCloseoutSummary({
      source: "Two Quick Carts",
      result: getCompletedCloseoutPathResult("finishChoice"),
      before,
      consequences: closeoutConsequences,
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
        ${getCloseoutConsequenceMarkup(closeoutConsequences)}
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
