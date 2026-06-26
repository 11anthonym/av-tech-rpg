// Warehouse run dispatch flow: shop search, inventory task checks, and stockroom closeout.
// This small shop-based job stays separate from larger site dispatch systems.
function showWarehouseDispatchPreview() {
  showModal({
    kicker: "Dispatch Board",
    title: content.warehouseDispatch.title,
    body: getDispatchBoardMarkup({
      type: "Warehouse Run",
      familyId: "logistics",
      setup: "Find a replacement power supply before another technician leaves for a service call. The work order says it was stored in one of the vans.",
      why: "Unlocked after commissioning. The shop needs a quick change of pace that tests whether messy inventory can become gameplay.",
      stakes: [
        "Searching costs energy.",
        "Fixing the bin label helps coworkers and annoys management.",
        "Leaving the pile alone keeps the task efficient and the next search worse.",
      ],
      note: "Van #2 is already offsite, and the key board says its key is with SALES.",
      managementNote: "This should only take a minute. Please check the obvious places before escalating.",
      fieldTasks: content.warehouseDispatch.checks,
    }),
    actions: [
      { label: "Start Looking", onClick: startWarehouseRun },
      { label: "Return to Shop", className: "secondary-button" },
    ],
  });
}

function startWarehouseRun() {
  state.flags.warehouseStarted = true;
  markCareerSnapshotStale();
  consumePackedLunch("the warehouse run");
  setClock(`${state.clock.slice(0, 3)} 4:18 PM`);
  addLog("Started looking for a replacement power supply reportedly stored in one of the vans.");
  render();
  showModal({
    kicker: "Radnor Rack & Wire Warehouse Run",
    title: "Check The Obvious Places",
    body: `
      <p>Search Van #3, the staging shelf, and the mystery-return pile. Coordination has already asked whether you found it.</p>
      <p class="muted">${ownsTool("toolBag") ? "Your tool bag makes it easier to work through the loose stock." : "Loose adapters have achieved a stable ecosystem."}</p>
    `,
    actions: [{ label: "Start Searching", onClick: render }],
  });
}

function getWarehouseSearchEnergyCost() {
  return getEquipmentEnergyCost(2);
}

function getWarehouseLabelEnergyCost() {
  return ownsTool("labeler") ? 2 : 4;
}

function inspectWarehouseLocation(checkId) {
  const check = content.warehouseDispatch.checks.find((item) => item.id === checkId);
  if (!check || state.warehouseChecks.includes(checkId)) return notify(`${check?.label || "That location"} is already checked.`);
  const { skillCheck, energyCost } = resolveFieldTaskCheck({
    check,
    checkId,
    completedChecks: state.warehouseChecks,
    flagKey: `warehouse-${checkId}`,
    contextBonus: state.flags.warehouseStarted ? 0 : -1,
    baseEnergyCost: getWarehouseSearchEnergyCost(),
    strainedFlag: "warehouseSearchStrained",
    logText: `${check.label} checked: ${check.log}`,
    strainedLogText: `Fieldcraft check strained on ${check.label}; the search took extra energy.`,
  });
  render();
  const allChecked = state.warehouseChecks.length === content.warehouseDispatch.checks.length;
  showModal({
    kicker: "Warehouse Note",
    title: check.label,
    body: `
      <p>${check.detail}</p>
      ${getFieldTaskResultMarkup({ check, skillCheck, energyCost })}
      ${allChecked ? `<p class="muted">The matching power supply is in the mystery-return pile beneath a handwritten question mark. Decide how much stockroom cleanup the schedule is willing to survive.</p>` : ""}
    `,
    actions: [{ label: allChecked ? "Review Found Power Supply" : "Keep Looking", onClick: allChecked ? showWarehouseChoice : render }],
  });
}

function showWarehouseChoice() {
  if (state.flags.warehouseComplete) {
    return showCompletedDispatchReturnReview({
      title: "Warehouse Run Already Complete",
      source: content.warehouseDispatch.title,
      result: getCompletedCloseoutPathResult("warehouseApproach"),
    });
  }
  showModal({
    kicker: "Warehouse Run",
    title: "Power Supply Located Technically",
    body: `
      <p>The correct power supply was placed in mystery returns beneath a box labeled <strong>HDMI EXTENDERS / DO NOT STOCK / RETURN?</strong></p>
      <p>Coordination wants the part immediately. Correcting the bin label would save the next search, but it would extend a task estimated at one minute.</p>
      ${getChoicePressureMarkup([
        {
          label: "Correct the label",
          detail: "Costs energy and probably annoys management; protects coworkers from repeating the same search.",
        },
        {
          label: "Leave the pile",
          detail: "Fastest shop outcome. Management sees speed, but the stockroom problem stays hidden.",
        },
      ])}
    `,
    actions: [
      { label: `Hand off part and correct the bin label (-${getWarehouseLabelEnergyCost()} energy)`, onClick: () => finishWarehouseRun("label") },
      { label: "Hand off part and leave the pile alone", className: "secondary-button", onClick: () => finishWarehouseRun("handoff") },
    ],
  });
}

function finishWarehouseRun(approach) {
  if (state.flags.warehouseComplete) {
    return showCompletedDispatchReturnReview({
      title: "Warehouse Run Already Complete",
      source: content.warehouseDispatch.title,
      result: getCompletedCloseoutPathResult("warehouseApproach"),
    });
  }
  const correctedLabel = approach === "label";
  if (correctedLabel) changeEnergy(-getWarehouseLabelEnergyCost());
  state.flags.warehouseComplete = true;
  state.flags.warehouseApproach = approach;
  markCareerSnapshotStale();
  setClock(`${state.clock.slice(0, 3)} ${correctedLabel ? "4:43" : "4:35"} PM`);
  if (!state.flags.warehousePaid) {
    state.cash += 48;
    state.flags.warehousePaid = true;
  }
  if (!state.flags.warehouseProgressAwarded) {
    awardCareerProgress({
      xp: correctedLabel ? 50 : 35,
      reputation: correctedLabel
        ? { clients: 0, coworkers: 1, management: -1 }
        : { clients: 0, coworkers: 0, management: 1 },
      source: content.warehouseDispatch.title,
    });
    state.flags.warehouseProgressAwarded = true;
  }
  if (!state.flags.warehouseStatsRecorded) {
    state.stats.warehouseRunsCompleted += 1;
    if (correctedLabel) state.stats.stockroomLabelsFixed += 1;
    else state.stats.mysteryBoxesLeft += 1;
    state.flags.warehouseStatsRecorded = true;
  }
  addLog(correctedLabel
    ? "Handed off the replacement power supply and corrected the mystery-return bin label."
    : "Handed off the replacement power supply. The mystery-return pile remains self-governing.");
  render();
  showModal({
    kicker: "Warehouse Run Complete",
    title: correctedLabel ? "The Next Search Might Be Shorter" : "The Part Left The Building",
    body: `
      <div class="results-grid">
        <span>Warehouse wages</span><strong>+$48</strong>
        <span>Cash balance</span><strong>${formatCash(state.cash)}</strong>
        <span>Experience</span><strong>+${correctedLabel ? 50 : 35} XP</strong>
        <span>Stockroom</span><strong>${correctedLabel ? "Bin label corrected" : "Mystery pile preserved"}</strong>
      </div>
      ${correctedLabel
        ? `<blockquote>Management note: "Please avoid spending excessive time reorganizing stock during urgent field support."</blockquote>`
        : `<blockquote>Management note: "Thanks for keeping the warehouse run efficient."</blockquote>`}
    `,
    actions: [{ label: "Return To Shop", onClick: () => finishWarehouseShift(content.warehouseDispatch.title) }],
  });
}
