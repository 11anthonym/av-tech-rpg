// Planned-job and career-snapshot helpers present board completion and future branch previews.
// They sit outside core dispatch orchestration so systems can reuse planned job presentation data.
function getPlannedJobBranchId(job) {
  if (job.id !== "burlington-retrofit-install") return "";
  return getRetrofitInstallBranchIdFromFlags(state.flags);
}

function getPlannedJobBranch(job) {
  const branchId = getPlannedJobBranchId(job);
  if (!branchId) return null;
  return job.resultBranches?.[branchId] || null;
}

function getPlannedJobPresentation(job) {
  const branchId = getPlannedJobBranchId(job);
  const branch = getPlannedJobBranch(job);
  return {
    ...job,
    branchId,
    branch,
    summary: branch?.summary || job.summary,
    setup: branch?.setup || job.setup || job.summary,
    prep: branch?.prep || job.prep || "",
    stakes: branch?.stakes?.length ? branch.stakes : job.stakes || [],
    consequenceHooks: branch?.consequenceHooks?.length ? branch.consequenceHooks : job.consequenceHooks || [],
    taskCards: branch?.taskCards?.length ? branch.taskCards : job.taskCards || [],
    note: branch?.note || job.note,
    managementNote: branch?.managementNote || job.managementNote,
  };
}

function getPlannedJobBranchMarkup(preview) {
  if (!preview.branch) return "";
  const implementationHook = preview.branchId === "protected"
    ? "Install can start with fewer unknowns and a cleaner record-drawing closeout."
    : preview.branchId === "partial"
    ? "Install starts with one warned-but-unresolved pathway question."
    : preview.branchId === "risk"
    ? "Install starts by surfacing the missing pathway as field-change pressure."
    : "Keep the install locked until the walkdown chooses a branch.";
  return `
    <ul class="modal-list">
      <li><strong>Inherited walkdown result</strong><span>${escapeHtml(preview.branch.stateHint || preview.branch.label)}</span></li>
      <li><strong>Install impact</strong><span>${escapeHtml(implementationHook)}</span></li>
    </ul>
  `;
}

function getPlannedJob(jobId) {
  return (content.upcomingDispatches || []).find((job) => job.id === jobId) || null;
}

// Save compatibility keeps this flag name; new code should use career snapshot helpers.
function markCareerSnapshotReviewed() {
  state.flags.prototypeSummaryViewed = true;
}

function markCareerSnapshotStale() {
  state.flags.prototypeSummaryViewed = false;
}

function showCareerSnapshot() {
  const rank = getCareerRank();
  markCareerSnapshotReviewed();
  render();
  showModal({
    kicker: "Current Board Complete",
    title: `Level ${rank.level} ${rank.name}`,
    body: `
      <p>You cleared the current Radnor Rack & Wire dispatch board. More work is already written in erasable marker.</p>
      <div class="results-grid">
        <span>Experience</span><strong>${state.xp} XP</strong>
        <span>Cash balance</span><strong>${formatCash(state.cash)}</strong>
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
      <p><strong>Career ledger:</strong></p>
      ${getCareerLedgerMarkup()}
      <p><strong>Next step:</strong></p>
      <ul class="modal-list">
        <li><strong>Shop reset</strong><span>Return to Radnor Rack & Wire, review the clipboard, and recover before the next board refresh.</span></li>
      </ul>
      <blockquote>Coordination note: "Please remain flexible. Several schedules are currently being finalized retroactively."</blockquote>
    `,
    actions: [
      { label: "Review Career Clipboard", onClick: showCareerClipboard },
      { label: "Return To Shop", className: "secondary-button", onClick: render },
      { label: "Return To Title Screen", className: "secondary-button", onClick: showTitleScreen },
    ],
  });
}
