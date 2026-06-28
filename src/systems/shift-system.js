// Shift, clock, recovery, break-area, and career-award helpers for the daily rhythm.
// This keeps day-loop consequences separate from scene and job orchestration.
function setClock(clock) {
  state.clock = clock;
}

function getClockParts(clock = state.clock) {
  const match = clock.match(/^([A-Z]{3}) (\d{1,2}):(\d{2}) (AM|PM)$/);
  if (!match) return { day: clock.slice(0, 3), hour: 7, minute: 22, period: "AM" };
  return {
    day: match[1],
    hour: Number(match[2]),
    minute: Number(match[3]),
    period: match[4],
  };
}

function formatClockParts({ day, hour, minute, period }) {
  return `${day} ${hour}:${String(minute).padStart(2, "0")} ${period}`;
}

function getNextWeekday(day = state.clock.slice(0, 3), days = 1) {
  const index = WEEKDAYS.indexOf(day);
  return WEEKDAYS[((index >= 0 ? index : 0) + days) % WEEKDAYS.length];
}

function advanceClockMinutes(minutes) {
  const parts = getClockParts();
  let hour24 = parts.hour % 12;
  if (parts.period === "PM") hour24 += 12;
  let total = hour24 * 60 + parts.minute + minutes;
  let dayOffset = 0;
  while (total >= 24 * 60) {
    total -= 24 * 60;
    dayOffset += 1;
  }
  while (total < 0) {
    total += 24 * 60;
    dayOffset -= 1;
  }
  const nextHour24 = Math.floor(total / 60);
  const hour = nextHour24 % 12 || 12;
  setClock(formatClockParts({
    day: getNextWeekday(parts.day, dayOffset),
    hour,
    minute: total % 60,
    period: nextHour24 >= 12 ? "PM" : "AM",
  }));
}

function advanceToNextMorning(days = 1) {
  const day = getNextWeekday(state.clock.slice(0, 3), days);
  setClock(`${day} 7:18 AM`);
}

function getWorkdayPhase(clock = state.clock) {
  const parts = getClockParts(clock);
  let hour24 = parts.hour % 12;
  if (parts.period === "PM") hour24 += 12;
  if (hour24 < 12) return "morning";
  if (hour24 < 17) return "afternoon";
  if (hour24 < 20) return "late shift";
  return "evening";
}

function getWorkdayRhythmBriefText() {
  if (!state.technician) return "Workday has not started yet.";
  const parts = getClockParts();
  const maxEnergy = getMaxEnergy();
  const pressure = [];
  if (state.flags.endShiftPending) pressure.push("shift closeout pending");
  if (state.flags.shiftPrepActive) pressure.push("next-shift prep active");
  if (state.flags.energyExhaustedThisShift) pressure.push("zero-energy pressure active");
  if (state.energy > 0 && state.energy <= Math.ceil(maxEnergy * LOW_ENERGY_SPEED_THRESHOLD)) pressure.push("low energy");
  if (state.burnout >= HIGH_BURNOUT_SPEED_THRESHOLD) pressure.push("high burnout");
  if (state.flags.consecutiveLateNights) {
    pressure.push(`${state.flags.consecutiveLateNights} late night${state.flags.consecutiveLateNights === 1 ? "" : "s"} in a row`);
  }
  const latestShift = getLatestShiftMemoryText();
  const pressureText = pressure.length ? pressure.join("; ") : "No daily pressure active";
  return `${parts.day} ${getWorkdayPhase()}. Shift ${state.stats.shiftsCompleted + 1}. Energy ${state.energy}/${maxEnergy}. Burnout ${state.burnout}. ${pressureText}.${latestShift ? ` ${latestShift}` : ""}`;
}

function getShiftChoiceLabel(choice) {
  return {
    "prep": "Stayed late to prep",
    "help-josh": "Helped Josh",
    "recovery-day": "Took a recovery day",
    "clock-out": "Clocked out clean",
  }[choice] || "Closed out";
}

function normalizeShiftHistoryEntry(entry = {}) {
  const choice = entry.choice || "clock-out";
  return {
    id: entry.id || `shift-${entry.shiftNumber || 0}`,
    shiftNumber: Number.isFinite(entry.shiftNumber) ? entry.shiftNumber : 0,
    source: entry.source || "Shift",
    choice,
    choiceLabel: entry.choiceLabel || getShiftChoiceLabel(choice),
    clockBefore: entry.clockBefore || "",
    clockAfter: entry.clockAfter || "",
    energyBefore: Number.isFinite(entry.energyBefore) ? entry.energyBefore : null,
    energyAfter: Number.isFinite(entry.energyAfter) ? entry.energyAfter : null,
    burnoutBefore: Number.isFinite(entry.burnoutBefore) ? entry.burnoutBefore : null,
    burnoutAfter: Number.isFinite(entry.burnoutAfter) ? entry.burnoutAfter : null,
    energyRecovered: Number.isFinite(entry.energyRecovered) ? entry.energyRecovered : 0,
    burnoutRecovered: Number.isFinite(entry.burnoutRecovered) ? entry.burnoutRecovered : 0,
    nextShiftPrep: Boolean(entry.nextShiftPrep),
    recoveryDay: Boolean(entry.recoveryDay),
    stayedLate: Boolean(entry.stayedLate),
  };
}

function getShiftHistory() {
  if (!Array.isArray(state.flags.shiftHistory)) {
    state.flags.shiftHistory = [];
  }
  state.flags.shiftHistory = state.flags.shiftHistory
    .slice(0, SHIFT_HISTORY_LIMIT)
    .map(normalizeShiftHistoryEntry);
  return state.flags.shiftHistory;
}

function getLatestShiftHistoryEntry() {
  return getShiftHistory()[0] || null;
}

function getLatestShiftMemoryText() {
  const entry = getLatestShiftHistoryEntry();
  if (!entry) return "";
  const details = [];
  if (Number.isFinite(entry.energyBefore) && Number.isFinite(entry.energyAfter)) {
    details.push(`energy ${entry.energyBefore} to ${entry.energyAfter}`);
  }
  if (Number.isFinite(entry.burnoutBefore) && Number.isFinite(entry.burnoutAfter)) {
    details.push(`burnout ${entry.burnoutBefore} to ${entry.burnoutAfter}`);
  }
  if (entry.energyRecovered) details.push(`recovered ${entry.energyRecovered} energy overnight`);
  if (entry.burnoutRecovered) details.push(`reduced burnout by ${entry.burnoutRecovered}`);
  if (entry.nextShiftPrep) details.push("today starts with prep advantage");
  if (entry.recoveryDay) details.push("the board skipped a day for recovery");
  return `Last shift: ${entry.choiceLabel} after ${entry.source}${details.length ? `; ${details.join("; ")}` : ""}.`;
}

function recordShiftHistory({ choice, source, before, recovery, stayedLate }) {
  const after = getTrackedStateSnapshot();
  const entry = normalizeShiftHistoryEntry({
    id: `shift-${state.stats.shiftsCompleted}`,
    shiftNumber: state.stats.shiftsCompleted,
    source,
    choice,
    choiceLabel: getShiftChoiceLabel(choice),
    clockBefore: before.clock,
    clockAfter: after.clock,
    energyBefore: before.energy,
    energyAfter: after.energy,
    burnoutBefore: before.burnout,
    burnoutAfter: after.burnout,
    energyRecovered: recovery.energyRecovered,
    burnoutRecovered: recovery.burnoutRecovered,
    nextShiftPrep: after.nextShiftPrep,
    recoveryDay: choice === "recovery-day",
    stayedLate,
  });
  state.flags.shiftHistory = [
    entry,
    ...getShiftHistory(),
  ].slice(0, SHIFT_HISTORY_LIMIT);
  return entry;
}

function getOvernightRecovery({ stayedLate = false, burnout = state.burnout } = {}) {
  const enduranceBonus = state.training.includes("endurance") ? 10 : 0;
  const burnoutPenalty = burnout * 10;
  const latePenalty = stayedLate ? 10 : 0;
  const recoveryFloor = stayedLate ? MIN_STAYED_LATE_RECOVERY : MIN_OVERNIGHT_RECOVERY;
  return Math.max(recoveryFloor, 65 + enduranceBonus - burnoutPenalty - latePenalty);
}

function getStayedLateEnergyCap(lateNightStreak = state.flags.consecutiveLateNights || 1) {
  const streakPenalty = STAY_LATE_NEXT_MORNING_CAP_LOSS
    + Math.max(0, lateNightStreak - 1) * CONSECUTIVE_LATE_NIGHT_CAP_LOSS;
  return Math.max(MIN_STAY_LATE_NEXT_MORNING_ENERGY, getMaxEnergy() - streakPenalty);
}

function getExhaustionEnergyCap(incidentCount = state.flags.exhaustionIncidentsThisShift || 0) {
  const capLoss = EXHAUSTION_NEXT_MORNING_CAP_LOSS
    + Math.max(0, incidentCount) * EXHAUSTION_INCIDENT_CAP_LOSS;
  return Math.max(MIN_EXHAUSTION_NEXT_MORNING_ENERGY, getMaxEnergy() - capLoss);
}

function applyOvernightRecovery({ stayedLate = false, recoveryDay = false } = {}) {
  const beforeEnergy = state.energy;
  const beforeBurnout = state.burnout;
  const recovery = recoveryDay ? getMaxEnergy() : getOvernightRecovery({ stayedLate });
  const recoveredEnergy = recoveryDay ? getMaxEnergy() : Math.min(getMaxEnergy(), state.energy + recovery);
  const stayedLateCap = stayedLate && !recoveryDay ? getStayedLateEnergyCap() : getMaxEnergy();
  const exhaustionCap = state.flags.energyExhaustedThisShift && !recoveryDay ? getExhaustionEnergyCap() : getMaxEnergy();
  state.energy = Math.min(recoveredEnergy, stayedLateCap, exhaustionCap);
  if (recoveryDay) {
    state.burnout = Math.max(0, state.burnout - 2);
  } else if (!stayedLate && state.energy >= Math.ceil(getMaxEnergy() * 0.75)) {
    state.burnout = Math.max(0, state.burnout - 1);
  }
  return {
    energyRecovered: state.energy - beforeEnergy,
    burnoutRecovered: beforeBurnout - state.burnout,
    recovery,
  };
}

function previewShiftChoice(choice) {
  const maxEnergy = getMaxEnergy();
  const energyCost = choice === "prep" ? STAY_LATE_PREP_ENERGY_COST : choice === "help-josh" ? HELP_JOSH_ENERGY_COST : 0;
  const stayedLate = ["prep", "help-josh"].includes(choice);
  const recoveryDay = choice === "recovery-day";
  const lateNightStreak = stayedLate ? (state.flags.consecutiveLateNights || 0) + 1 : 0;
  const unpaidEnergy = Math.max(0, energyCost - state.energy);
  const exhaustionPressureDebt = (state.flags.exhaustionPressureDebt || 0) + unpaidEnergy;
  const exhaustionIncidentGain = Math.floor(exhaustionPressureDebt / EXHAUSTION_PRESSURE_PER_INCIDENT);
  const exhaustionIncidents = (state.flags.exhaustionIncidentsThisShift || 0) + exhaustionIncidentGain;
  const exhaustionBurnoutGain = Math.floor(((state.flags.exhaustionDebt || 0) + unpaidEnergy) / EXHAUSTION_DEBT_PER_BURNOUT);
  const burnoutAfterChoice = Math.max(0, state.burnout + exhaustionBurnoutGain + (stayedLate ? STAY_LATE_BURNOUT_GAIN : 0));
  const recovery = recoveryDay ? maxEnergy : getOvernightRecovery({ stayedLate, burnout: burnoutAfterChoice });
  const energyAfterChoice = Math.max(0, state.energy - energyCost);
  const rawNextEnergy = recoveryDay ? maxEnergy : Math.min(maxEnergy, energyAfterChoice + recovery);
  const lateEnergyCap = stayedLate ? getStayedLateEnergyCap(lateNightStreak) : maxEnergy;
  const willHitZero = state.flags.energyExhaustedThisShift || state.energy <= 0 || (energyCost > 0 && energyAfterChoice === 0);
  const exhaustionEnergyCap = willHitZero && !recoveryDay ? getExhaustionEnergyCap(exhaustionIncidents) : maxEnergy;
  const nextEnergy = Math.min(rawNextEnergy, lateEnergyCap, exhaustionEnergyCap);
  const cappedRecovery = recoveryDay ? 0 : Math.max(0, energyAfterChoice + recovery - maxEnergy);
  const lateCapNote = stayedLate && rawNextEnergy > lateEnergyCap
    ? ` Stayed-late fatigue caps tomorrow at ${lateEnergyCap} energy${lateNightStreak > 1 ? ` after ${lateNightStreak} late nights` : ""}.`
    : "";
  const exhaustionCapNote = willHitZero && !recoveryDay && rawNextEnergy > exhaustionEnergyCap
    ? ` Zero-energy crash caps tomorrow at ${exhaustionEnergyCap} energy${exhaustionIncidents ? ` after ${exhaustionIncidents} exhaustion incident${exhaustionIncidents === 1 ? "" : "s"}` : ""}.`
    : "";
  const exhaustionIncidentNote = exhaustionIncidentGain
    ? ` This overrun crosses ${exhaustionIncidentGain} exhaustion incident${exhaustionIncidentGain === 1 ? "" : "s"} before rest.`
    : "";
  const nextBurnout = recoveryDay
    ? Math.max(0, burnoutAfterChoice - 2)
    : !stayedLate && nextEnergy >= Math.ceil(maxEnergy * 0.75)
      ? Math.max(0, burnoutAfterChoice - 1)
      : burnoutAfterChoice;
  return {
    nextEnergy,
    nextBurnout,
    recovery,
    pressure: choice === "prep"
      ? "Management may notice the extra time."
      : choice === "help-josh"
        ? "Josh and the crew remember the help."
        : choice === "recovery-day"
          ? "Management may notice the schedule gap."
          : "No obvious reputation pressure.",
    benefit: choice === "prep" ? "+1 Fieldcraft/Documentation next job" : choice === "help-josh" ? "Josh relationship progress" : choice === "recovery-day" ? "Skips next workday pressure" : "Clean rest",
    capNote: `${lateCapNote}${exhaustionCapNote}${exhaustionIncidentNote}` || (cappedRecovery ? ` ${cappedRecovery} recovery would be capped at max energy.` : ""),
  };
}

function canHelpJoshAfterShift() {
  if (!state.flags.metJosh) return false;
  if (state.flags.serviceCallbackPending && !state.flags.serviceCallbackResolved) return false;
  return !state.flags.joshIntroEndShiftSource
    || state.flags.joshIntroEndShiftSource !== state.flags.endShiftSource;
}

function getHelpJoshShiftCopy() {
  if (!canHelpJoshAfterShift()) return null;
  return {
    previewLabel: "Help Josh",
    actionLabel: `Help Josh clean up notes (-${HELP_JOSH_ENERGY_COST} energy, +${STAY_LATE_BURNOUT_GAIN} burnout, crew remembers)`,
    log: "Helped Josh clean up notes and labels before clocking out. Coworker reputation improved, and the longer day still took something out of you.",
  };
}

function getEndShiftChoicePreviewMarkup() {
  const helpJoshCopy = getHelpJoshShiftCopy();
  const choices = [
    { id: "clock-out", label: "Clock out" },
    { id: "prep", label: "Stay late prep" },
    ...(helpJoshCopy ? [{ id: "help-josh", label: helpJoshCopy.previewLabel }] : []),
    { id: "recovery-day", label: "Recovery day" },
  ];
  return `
    <ul class="modal-list">
      ${choices.map((choice) => {
        const preview = previewShiftChoice(choice.id);
        return `<li><strong>${choice.label}: ${preview.nextEnergy}/${getMaxEnergy()} energy, burnout ${preview.nextBurnout}</strong><span>${preview.benefit}. ${preview.pressure} Recovery: +${preview.recovery} energy.${preview.capNote}</span></li>`;
      }).join("")}
    </ul>
  `;
}

function getTrackedStateSnapshot() {
  return {
    clock: state.clock,
    energy: state.energy,
    burnout: state.burnout,
    cash: state.cash,
    xp: state.xp,
    jobsCompleted: state.jobsCompleted,
    clientReputation: state.reputation.clients,
    coworkerReputation: state.reputation.coworkers,
    managementReputation: state.reputation.management,
    openCallbacks: getUnresolvedCallbackCount(),
    openReturnTripRisks: getReturnTripRiskEntries().length,
    shiftsCompleted: state.stats.shiftsCompleted || 0,
    overnightRests: state.stats.overnightRests || 0,
    recoveryDays: state.stats.recoveryDays || 0,
    stayLatePrepDays: state.stats.stayLatePrepDays || 0,
    shopHelpDays: state.stats.shopHelpDays || 0,
    lateNightStreak: state.flags.consecutiveLateNights || 0,
    nextShiftPrep: Boolean(state.flags.shiftPrepActive),
  };
}

function getTrackedStateLabel(key) {
  return {
    clock: "Clock",
    energy: "Energy",
    burnout: "Burnout",
    cash: "Cash",
    xp: "XP",
    jobsCompleted: "Jobs completed",
    clientReputation: "Client reputation",
    coworkerReputation: "Coworker reputation",
    managementReputation: "Management reputation",
    openCallbacks: "Open callbacks",
    openReturnTripRisks: "Open return-trip risks",
    shiftsCompleted: "Shifts completed",
    overnightRests: "Overnight rests",
    recoveryDays: "Recovery days",
    stayLatePrepDays: "Stay-late prep days",
    shopHelpDays: "Shop-help days",
    lateNightStreak: "Late-night streak",
    nextShiftPrep: "Next-shift prep",
  }[key] || key;
}

function formatTrackedStateValue(key, value) {
  if (key === "cash") return formatCash(value);
  if (key.includes("Reputation")) return formatReputation(value);
  if (key === "nextShiftPrep") return value ? "Active" : "Inactive";
  return `${value}`;
}

function formatTrackedStateChange(key, before, after) {
  if (before === after) return "";
  const beforeText = formatTrackedStateValue(key, before);
  const afterText = formatTrackedStateValue(key, after);
  if (typeof before === "number" && typeof after === "number") {
    const delta = after - before;
    const deltaText = key === "cash" ? formatCash(delta) : formatSignedNumber(delta);
    return `${beforeText} -> ${afterText} (${deltaText})`;
  }
  return `${beforeText} -> ${afterText}`;
}

function getTrackedStateDeltaRows(before, after = getTrackedStateSnapshot()) {
  return Object.keys(after)
    .map((key) => ({
      label: getTrackedStateLabel(key),
      detail: formatTrackedStateChange(key, before?.[key], after[key]),
    }))
    .filter((row) => row.detail);
}

function getTrackedStateDeltaMarkup(before, after = getTrackedStateSnapshot()) {
  const rows = getTrackedStateDeltaRows(before, after);
  if (!rows.length) return `<p class="muted">No tracked career state changed.</p>`;
  return `
    <ul class="modal-list">
      ${rows.map((row) => `<li><strong>${escapeHtml(row.label)}</strong><span>${escapeHtml(row.detail)}</span></li>`).join("")}
    </ul>
  `;
}

function getShiftChoiceResultText(choice, recovery) {
  if (choice === "prep") {
    return `Stayed late to prep the next job. The next shift starts with Fieldcraft and Documentation support, but the longer day still changed energy, burnout, and management pressure. Recovery restored ${recovery.energyRecovered} energy.`;
  }
  if (choice === "help-josh") {
    return `Helped Josh clean up notes. Crew trust improved, but the favor still cost energy and added late-night fatigue. Recovery restored ${recovery.energyRecovered} energy.`;
  }
  if (choice === "recovery-day") {
    return `Took a recovery day. Condition gets repaired more aggressively, but management sees the schedule gap. Recovery restored ${recovery.energyRecovered} energy.`;
  }
  return `Clocked out clean. You protected tomorrow's workday instead of borrowing more from the same shift. Recovery restored ${recovery.energyRecovered} energy.`;
}

function showShiftResultModal({ choice, source, before, recovery }) {
  const canReviewBoard = state.flags.finished && !state.flags.endShiftPending && !shouldIntroduceJoshBeforeNextDispatch();
  showModal({
    kicker: "Shift Result",
    title: `${source} Closed Out`,
    body: `
      <p>${escapeHtml(getShiftChoiceResultText(choice, recovery))}</p>
      <h3>What Changed</h3>
      ${getTrackedStateDeltaMarkup(before)}
      <h3>Workday Memory</h3>
      <p class="muted">${escapeHtml(getLatestShiftMemoryText() || "No prior shift result recorded yet.")}</p>
      <h3>Next Step</h3>
      ${getCurrentStepListMarkup({ includeDayPlan: false })}
    `,
    actions: [
      ...(canReviewBoard ? [{ label: "Review Dispatch Board Routes", onClick: showDispatchPreview }] : []),
      { label: "Back To Shop", className: "secondary-button", onClick: render },
    ],
  });
}

function clearEndShiftState() {
  state.flags.endShiftPending = false;
  state.flags.endShiftSource = null;
  state.flags.endShiftSummaryShown = false;
  delete state.flags.joshIntroEndShiftSource;
  state.flags.energyExhaustedThisShift = false;
  state.flags.exhaustionDebt = 0;
  state.flags.exhaustionPressureDebt = 0;
  state.flags.exhaustionIncidentsThisShift = 0;
}

function startEndShift(source) {
  state.flags.endShiftPending = true;
  state.flags.endShiftSource = source;
  state.flags.shiftPrepActive = false;
  state.flags.endShiftSummaryShown = false;
}

function shouldIntroduceJoshBeforeNextDispatch() {
  return state.sceneId === "shop"
    && state.flags.finished
    && !state.flags.endShiftPending
    && !state.flags.metJosh
    && !state.flags.serviceStarted
    && !state.flags.serviceComplete;
}

function shouldHideJoshUntilNextMorning() {
  return state.sceneId === "shop"
    && state.flags.finished
    && state.flags.endShiftPending
    && !state.flags.metJosh
    && !state.flags.serviceStarted
    && !state.flags.serviceComplete;
}

function notifyJoshIntroRequired() {
  return notify("Find Josh at the workbench before taking the next route.");
}

function shouldShowRetrofitInstallDebrief() {
  return state.sceneId === "shop"
    && state.flags.retrofitInstallComplete
    && !state.flags.retrofitInstallDebriefed
    && !state.flags.endShiftPending;
}

function returnToShopAfterDispatch(source, message) {
  state.carry = [];
  startEndShift(source);
  if (message) addLog(message);
  enterScene("shop");
  showEndShiftModal();
}

function finishWarehouseShift(source) {
  startEndShift(source);
  render();
  showEndShiftModal();
}

function showEndShiftModal() {
  const source = state.flags.endShiftSource || "today's job";
  const helpJoshCopy = getHelpJoshShiftCopy();
  const ordinaryRecovery = getOvernightRecovery();
  const lateRecovery = getOvernightRecovery({ stayedLate: true, burnout: state.burnout + STAY_LATE_BURNOUT_GAIN });
  const lateEnergyCap = getStayedLateEnergyCap((state.flags.consecutiveLateNights || 0) + 1);
  const exhaustionCap = state.flags.energyExhaustedThisShift ? getExhaustionEnergyCap() : null;
  const exhaustionPenalty = getExhaustionSkillPenalty();
  const pendingServiceCallback = state.flags.serviceCallbackPending && !state.flags.serviceCallbackResolved;
  showModal({
    kicker: "End Of Shift",
    title: "Close Out The Workday",
    body: `
      <p>${source} is wrapped. The board has more work, but the next job should start after an actual shift reset.</p>
      ${pendingServiceCallback ? `<p class="muted">A Conshohocken callback note is waiting on Josh's bench. Close out the shift, then talk to Josh before coordination adds another stop.</p>` : ""}
      <div class="results-grid">
        <span>Current time</span><strong>${state.clock}</strong>
        <span>Energy</span><strong>${state.energy}/${getMaxEnergy()}</strong>
        <span>Burnout</span><strong>${state.burnout}</strong>
        <span>Overnight recovery</span><strong>+${ordinaryRecovery} energy${state.burnout ? " after burnout penalty" : ""}</strong>
        <span>Stayed-late recovery</span><strong>+${lateRecovery} energy after new burnout</strong>
        <span>Stayed-late cap</span><strong>${lateEnergyCap}/${getMaxEnergy()} energy tomorrow</strong>
        ${exhaustionCap ? `<span>Zero-energy cap</span><strong>${exhaustionCap}/${getMaxEnergy()} energy tomorrow unless recovery day</strong>` : ""}
        ${exhaustionPenalty ? `<span>Exhaustion penalty</span><strong>-${exhaustionPenalty} on skill checks this shift</strong>` : ""}
      </div>
      <p class="muted">Burnout reduces ordinary overnight recovery. Staying late helps the work, but it caps tomorrow's energy; consecutive late nights tighten that cap. Hitting zero energy is a push-your-luck state: work can continue, but incidents, weaker skill checks, and a lower next-morning cap can follow. Recovery days restore more, but management notices the schedule gap.</p>
      <p><strong>Next-morning preview:</strong></p>
      ${getEndShiftChoicePreviewMarkup()}
    `,
    actions: [
      { label: `Clock out and go home (+${ordinaryRecovery} energy overnight)`, onClick: () => completeShift("clock-out") },
      { label: `Stay late to prep tomorrow (-${STAY_LATE_PREP_ENERGY_COST} energy, +${STAY_LATE_BURNOUT_GAIN} burnout, prep advantage)`, className: "secondary-button", onClick: () => completeShift("prep") },
      ...(helpJoshCopy ? [{ label: helpJoshCopy.actionLabel, className: "secondary-button", onClick: () => completeShift("help-josh") }] : []),
      { label: "Take a recovery day (full energy, management may notice)", className: "secondary-button", onClick: () => completeShift("recovery-day") },
      { label: "Not Yet", className: "text-button", onClick: render },
    ],
  });
}

function completeShift(choice) {
  const source = state.flags.endShiftSource || "Shift";
  const before = getTrackedStateSnapshot();
  let stayedLate = false;
  let days = 1;
  if (choice === "prep") {
    changeEnergy(-STAY_LATE_PREP_ENERGY_COST);
    state.burnout += STAY_LATE_BURNOUT_GAIN;
    stayedLate = true;
    state.flags.consecutiveLateNights = (state.flags.consecutiveLateNights || 0) + 1;
    state.flags.shiftPrepActive = true;
    state.reputation.management -= 1;
    state.stats.stayLatePrepDays += 1;
    addLog("Stayed late to prep tomorrow's first job. Fieldcraft and documentation get a next-shift boost, but the extra unpaid time landed hard.");
  } else if (choice === "help-josh") {
    const helpJoshCopy = getHelpJoshShiftCopy();
    if (!helpJoshCopy) {
      return notify(state.flags.serviceCallbackPending && !state.flags.serviceCallbackResolved
        ? "Clear the callback note with Josh before making generic end-shift plans."
        : "Meet Josh before making him part of end-shift plans.");
    }
    changeEnergy(-HELP_JOSH_ENERGY_COST);
    state.burnout += STAY_LATE_BURNOUT_GAIN;
    stayedLate = true;
    state.flags.consecutiveLateNights = (state.flags.consecutiveLateNights || 0) + 1;
    state.flags.metJosh = true;
    state.reputation.coworkers += 1;
    state.stats.shopHelpDays += 1;
    addLog(helpJoshCopy.log);
  } else if (choice === "recovery-day") {
    days = 2;
    state.flags.consecutiveLateNights = 0;
    state.reputation.management -= 1;
    state.stats.recoveryDays += 1;
    addLog("Took a recovery day instead of accepting the next job. Management reputation took a small hit.");
  } else {
    state.flags.shiftPrepActive = false;
    state.flags.consecutiveLateNights = 0;
    addLog("Clocked out and went home instead of turning the next work order into the same tired day.");
  }
  const recovery = applyOvernightRecovery({ stayedLate, recoveryDay: choice === "recovery-day" });
  state.stats.shiftsCompleted += 1;
  if (choice !== "recovery-day") state.stats.overnightRests += 1;
  clearEndShiftState();
  advanceToNextMorning(days);
  recordShiftHistory({ choice, source, before, recovery, stayedLate });
  addLog(`${source} closed out. Recovered ${recovery.energyRecovered} energy${recovery.burnoutRecovered ? ` and reduced burnout by ${recovery.burnoutRecovered}` : ""}.`);
  render();
  showShiftResultModal({ choice, source, before, recovery });
}

function getShiftPrepSkillBonus(skillId) {
  if (!state.flags.shiftPrepActive) return 0;
  return ["fieldcraft", "documentation"].includes(skillId) ? 1 : 0;
}

function showBreakArea({ backAction = null, backLabel = "Leave Break Area" } = {}) {
  if (shouldIntroduceJoshBeforeNextDispatch()) return notifyJoshIntroRequired();
  if (state.flags.endShiftPending) return showEndShiftModal();
  showModal({
    kicker: "Break Area",
    title: "Use The Quiet Corner Before Coordination Finds You",
    body: `
      <p>The break area is now same-day recovery and preparation, not a free time machine.</p>
      <div class="results-grid">
        <span>Energy</span><strong>${state.energy}/${getMaxEnergy()}</strong>
        <span>Burnout</span><strong>${state.burnout}</strong>
        <span>Lunch packed</span><strong>${state.flags.packedLunchReady ? "Yes" : "No"}</strong>
        <span>Cash</span><strong>${formatCash(state.cash)}</strong>
      </div>
      ${getExhaustionPressureMarkup()}
    `,
    actions: [
      { label: "Take 15-minute break (+10 energy)", onClick: takeShortBreak },
      ...(!state.flags.packedLunchReady ? [{ label: "Pack lunch for next job", className: "secondary-button", onClick: packLunchForNextDispatch }] : []),
      ...(state.cash >= 5 ? [{ label: "Buy bad shop coffee - $5 (+12 energy, +1 burnout)", className: "secondary-button", onClick: buyBreakCoffee }] : []),
      { label: "Take unpaid recovery day (full energy, management may notice)", className: "secondary-button", onClick: takeRecoveryDayFromShop },
      { label: backLabel, className: "text-button", onClick: backAction || undefined },
    ],
  });
}

function applyShortBreak(logText = "Took a short break. Energy improved, and the clock moved instead of the calendar.") {
  if (state.energy >= getMaxEnergy()) return notify("You are already at full energy. The chair is still bad.");
  changeEnergy(10);
  advanceClockMinutes(15);
  state.stats.sameDayBreaks += 1;
  addLog(logText);
  return true;
}

function takeShortBreak() {
  if (!applyShortBreak()) return;
  render();
}

function packLunchForNextDispatch() {
  state.flags.packedLunchReady = true;
  state.stats.lunchesPacked += 1;
  addLog("Packed lunch for the next job. It will restore energy when you head out.");
  render();
}

function buyBreakCoffee() {
  state.cash -= 5;
  changeEnergy(12);
  state.burnout += 1;
  state.stats.coffeeBreaks += 1;
  state.stats.coffeesBought += 1;
  addLog("Bought bad shop coffee. Energy improved, but burnout ticked up.");
  render();
}

function takeRecoveryDayFromShop() {
  state.reputation.management -= 1;
  state.stats.recoveryDays += 1;
  const recovery = applyOvernightRecovery({ recoveryDay: true });
  state.flags.energyExhaustedThisShift = false;
  state.flags.exhaustionDebt = 0;
  state.flags.exhaustionPressureDebt = 0;
  state.flags.exhaustionIncidentsThisShift = 0;
  state.flags.consecutiveLateNights = 0;
  advanceToNextMorning(1);
  addLog(`Took an unpaid recovery day. Recovered ${recovery.energyRecovered} energy${recovery.burnoutRecovered ? ` and reduced burnout by ${recovery.burnoutRecovered}` : ""}. Management noticed.`);
  render();
}

function consumePackedLunch(context) {
  if (!state.flags.packedLunchReady) return;
  state.flags.packedLunchReady = false;
  changeEnergy(8);
  addLog(`Ate the packed lunch before ${context}. Energy improved.`);
}

function awardCareerProgress({ xp, reputation, source }) {
  const previousLevel = getCareerLevel();
  state.xp += xp;
  state.jobsCompleted += 1;
  Object.entries(reputation).forEach(([group, amount]) => {
    state.reputation[group] += amount;
  });
  addLog(`${source}: +${xp} XP.`);
  const currentLevel = getCareerLevel();
  if (currentLevel > previousLevel) {
    addLog(`Career level increased. You are now a Level ${currentLevel} ${getCareerRank(currentLevel).name}.`);
  }
}
