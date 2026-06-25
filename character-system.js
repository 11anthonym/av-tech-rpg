// Technician roster and character-creation helpers keep profile selection separate from scene orchestration.
// They depend on app.js globals and are loaded before bootstrap starts the game.
function sanitizeCreatorName(value) {
  const clean = `${value || ""}`.replace(/[<>]/g, "").replace(/\s+/g, " ").trim();
  return clean.slice(0, 32) || "Custom Tech";
}

function addNumericMap(target, source = {}) {
  Object.entries(source).forEach(([key, value]) => {
    target[key] = (target[key] || 0) + value;
  });
}

function getCreatorConfig() {
  return content.characterCreation;
}

function getCreatorChoice(collection, choiceId) {
  return collection.find((item) => item.id === choiceId);
}

function getCreatorSelectionsFromForm() {
  return {
    name: sanitizeCreatorName(document.querySelector("#creator-name")?.value),
    backgroundId: document.querySelector("#creator-background")?.value,
    workStyleId: document.querySelector("#creator-work-style")?.value,
    traitIds: [
      document.querySelector("#creator-trait-1")?.value,
      document.querySelector("#creator-trait-2")?.value,
    ].filter(Boolean),
    primarySkillIds: [
      document.querySelector("#creator-primary-1")?.value,
      document.querySelector("#creator-primary-2")?.value,
    ].filter(Boolean),
    secondarySkillIds: [
      document.querySelector("#creator-secondary-1")?.value,
      document.querySelector("#creator-secondary-2")?.value,
    ].filter(Boolean),
  };
}

function validateCreatorSelections(selections = {}) {
  const creator = getCreatorConfig();
  const validSkillIds = new Set(getSkillDefinitions().map((skill) => skill.id));
  const traitSlots = creator.traitSlots || 2;
  const traitIds = selections.traitIds || [];
  const primarySkillIds = selections.primarySkillIds || [];
  const secondarySkillIds = selections.secondarySkillIds || [];
  const skillIds = [...primarySkillIds, ...secondarySkillIds];
  if (!getCreatorChoice(creator.backgrounds, selections.backgroundId)) return "Pick a valid background.";
  if (!getCreatorChoice(creator.workStyles, selections.workStyleId)) return "Pick a valid work style.";
  if (traitIds.length !== traitSlots) return `Pick ${traitSlots} different traits.`;
  if (traitIds.some((traitId) => !getCreatorChoice(creator.traits, traitId))) return "Pick valid traits.";
  if (primarySkillIds.length !== 2 || secondarySkillIds.length !== 2) return "Pick two primary and two secondary major skills.";
  if (skillIds.some((skillId) => !validSkillIds.has(skillId))) return "Pick valid major skills.";
  if (new Set(skillIds).size !== skillIds.length) return "Pick four different major skills. Primary and secondary skills cannot overlap.";
  if (new Set(traitIds).size !== traitIds.length) return "Pick two different traits.";
  return "";
}

function buildCustomTechnician(selections) {
  const validationError = validateCreatorSelections(selections);
  if (validationError) throw new Error(validationError);
  const creator = getCreatorConfig();
  const background = getCreatorChoice(creator.backgrounds, selections.backgroundId);
  const workStyle = getCreatorChoice(creator.workStyles, selections.workStyleId);
  const traits = selections.traitIds.map((traitId) => getCreatorChoice(creator.traits, traitId)).filter(Boolean);
  const stats = { ...creator.baseStats };
  const characterStats = { ...creator.baseSkills };
  const mechanicalTraits = ["customTechnician"];
  const startingTools = ["screwdriver"];
  let startingCash = 0;

  [background, workStyle, ...traits].forEach((piece) => {
    addNumericMap(stats, piece.statModifiers);
    addNumericMap(characterStats, piece.skillBonuses);
    addNumericMap(characterStats, piece.characterStats);
    startingTools.push(...(piece.startingTools || []));
    mechanicalTraits.push(...(piece.traits || []));
    startingCash += piece.cashModifier || 0;
  });

  selections.primarySkillIds.forEach((skillId) => {
    characterStats[skillId] = (characterStats[skillId] || 0) + creator.primarySkillBonus;
  });
  selections.secondarySkillIds.forEach((skillId) => {
    characterStats[skillId] = (characterStats[skillId] || 0) + creator.secondarySkillBonus;
  });

  Object.keys(stats).forEach((key) => {
    stats[key] = Math.max(key === "burnout" ? 0 : 1, stats[key]);
  });
  getSkillDefinitions().forEach((skill) => {
    characterStats[skill.id] = Math.max(1, characterStats[skill.id] || 1);
  });

  const rankedSkills = getSkillDefinitions()
    .map((skill) => ({ ...skill, value: characterStats[skill.id] || 0 }))
    .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name));

  return {
    id: "custom-tech",
    custom: true,
    name: sanitizeCreatorName(selections.name),
    role: `${background.name} / ${workStyle.name}`,
    tagline: `Custom build: ${background.name}, ${workStyle.name}.`,
    description: `${background.tradeoff} ${workStyle.tradeoff}`,
    strengths: rankedSkills.slice(0, 2).map((skill) => `${skill.name} ${skill.value}`),
    weaknesses: rankedSkills.slice(-2).map((skill) => `${skill.name} ${skill.value}`),
    playstyle: workStyle.effect,
    difficulty: "Custom",
    trait: workStyle.name,
    tendency: traits.map((trait) => trait.name).join(", "),
    stats,
    characterStats,
    traits: uniqueValues(mechanicalTraits),
    startingTools: uniqueValues(startingTools),
    startingCash,
    creatorBuild: {
      backgroundId: background.id,
      workStyleId: workStyle.id,
      traitIds: traits.map((trait) => trait.id),
      primarySkillIds: selections.primarySkillIds,
      secondarySkillIds: selections.secondarySkillIds,
      formula: `${background.name} + ${workStyle.name} + ${traits.map((trait) => trait.name).join(" + ")}`,
    },
  };
}

function getCreatorBuildFromForm() {
  const selections = getCreatorSelectionsFromForm();
  const error = validateCreatorSelections(selections);
  if (error) return { error, technician: null };
  return { error: "", technician: buildCustomTechnician(selections) };
}

function getTechnicianPreviewSkillValue(technician, skillId) {
  return technician.characterStats?.[skillId]
    || (skillId === "install" ? Math.max(1, technician.stats.craftsmanship || 0)
    : skillId === "troubleshooting" ? Math.max(1, (technician.stats.confidence || 0) + 1)
    : skillId === "documentation" ? Math.max(1, technician.stats.confidence || 0)
    : skillId === "clientCommunication" ? Math.max(1, (technician.stats.confidence || 0) + 1)
    : skillId === "fieldcraft" ? Math.max(1, Math.floor((technician.stats.energy || 100) / 45))
    : 0);
}

function hasPreviewTrait(technician, traitId) {
  return technician.traits?.includes(traitId) || false;
}

function hasAnyPreviewTrait(technician, traitIds) {
  return traitIds.some((traitId) => hasPreviewTrait(technician, traitId));
}

function getTechnicianStartingToolIds(technician) {
  return uniqueValues(["screwdriver", ...(technician.startingTools || [])]);
}

function getTechnicianStartingKitLabel(technician) {
  return getTechnicianStartingToolIds(technician)
    .map((toolId) => content.tools[toolId]?.name || toolId)
    .join(", ");
}

function canPreviewPressureChoice(technician) {
  return (technician.stats.confidence || 0) >= 2
    || hasPreviewTrait(technician, "calmUnderFire")
    || getTechnicianPreviewSkillValue(technician, "clientCommunication") >= 4;
}

function canPreviewMakeThatWorkShortcut(technician) {
  return hasPreviewTrait(technician, "makeThatWork")
    && (technician.characterStats?.improvisation || 0) >= 4;
}

function getTechnicianEarlyReadout(technician) {
  const toolIds = getTechnicianStartingToolIds(technician);
  const startingCash = technician.startingCash || 0;
  const install = getTechnicianPreviewSkillValue(technician, "install");
  const documentation = getTechnicianPreviewSkillValue(technician, "documentation");
  const commercialProcess = getTechnicianPreviewSkillValue(technician, "commercialProcess");
  const clientCommunication = getTechnicianPreviewSkillValue(technician, "clientCommunication");
  const networking = getTechnicianPreviewSkillValue(technician, "networking");
  const controlSystems = getTechnicianPreviewSkillValue(technician, "controlSystems");
  const earlyUnlocks = [];
  const firstJobFeel = [];
  const watchOuts = [];
  const cashDetail = startingCash < 0
    ? ` and ${formatCash(startingCash)} starting cash`
    : startingCash > 0
    ? ` and ${formatCash(startingCash)} extra cash`
    : "";

  if (hasPreviewTrait(technician, "circuitHutPartsBrain") && toolIds.includes("circuitHutOrganizer")) {
    earlyUnlocks.push("parts organizer testing aid once per job");
  }
  if (canPreviewMakeThatWorkShortcut(technician)) earlyUnlocks.push("adapter workaround at first closeout");
  if (canPreviewPressureChoice(technician)) earlyUnlocks.push("calmer pushback options");
  if (hasPreviewTrait(technician, "knowsAGuy")) earlyUnlocks.push("site-contact prep options");
  if (hasAnyPreviewTrait(technician, ["byTheBook", "notebookHabit"])) earlyUnlocks.push("faster documentation closeouts");

  if (toolIds.includes("toolBag")) firstJobFeel.push("tool bag trims pickup effort");
  if (toolIds.includes("drill")) firstJobFeel.push("drill cuts cart assembly cost");
  if (toolIds.includes("handTruck")) firstJobFeel.push("hand truck carries more in the garage");
  if (hasPreviewTrait(technician, "badKnees")) firstJobFeel.push("long carries bite harder");
  if (install >= 4) firstJobFeel.push("cart assembly checks are strong");
  else if (install <= 1) firstJobFeel.push("cart assembly checks are fragile");
  if (hasPreviewTrait(technician, "measureTwice")) firstJobFeel.push("careful work gets cheaper after habits build");

  if (documentation <= 1 && !hasAnyPreviewTrait(technician, ["byTheBook", "notebookHabit"])) watchOuts.push("paperwork-heavy surveys and handoffs");
  if (commercialProcess <= 1) watchOuts.push("commercial process and access rules");
  if (!canPreviewPressureChoice(technician) && clientCommunication < 4) watchOuts.push("pressure conversations stay locked early");
  if (install <= 1) watchOuts.push("physical install tasks");
  if (networking <= 1 && controlSystems <= 1) watchOuts.push("later systems service calls");
  if ((technician.stats.energy || 0) < 100 || (technician.stats.burnout || 0) > 0) watchOuts.push("stamina on long days");

  return [
    {
      label: "Shop start",
      detail: `Starts with ${getTechnicianStartingKitLabel(technician)}${cashDetail}.`,
    },
    {
      label: "Early unlocks",
      detail: earlyUnlocks.length ? earlyUnlocks.join("; ") : "Baseline choices; growth comes from tools, training, and careful closeout.",
    },
    {
      label: "First job feel",
      detail: firstJobFeel.length ? firstJobFeel.join("; ") : "No special tool edge on the cart build.",
    },
    {
      label: "Watch-outs",
      detail: watchOuts.length ? watchOuts.slice(0, 3).join("; ") : "No sharp early penalty; build identity will come from later choices.",
    },
  ];
}

function getTechnicianEarlyReadoutMarkup(technician) {
  return `
    <ul class="profile-readout">
      ${getTechnicianEarlyReadout(technician).map((item) => `
        <li><strong>${escapeHtml(item.label)}</strong><span>${escapeHtml(item.detail)}</span></li>
      `).join("")}
    </ul>
  `;
}

function getCreatorSelectMarkup(id, options, selectedId) {
  return `
    <select id="${id}">
      ${options.map((option) => `<option value="${option.id}"${option.id === selectedId ? " selected" : ""}>${option.name}</option>`).join("")}
    </select>
  `;
}

function getSkillSelectMarkup(id, selectedId) {
  return getCreatorSelectMarkup(id, getSkillDefinitions(), selectedId);
}

function syncCreatorExclusiveSelects(selectIds) {
  const selects = selectIds
    .map((id) => document.querySelector(`#${id}`))
    .filter(Boolean);
  const selectedValues = selects.map((select) => select.value).filter(Boolean);
  selects.forEach((select) => {
    Array.from(select.options).forEach((option) => {
      option.disabled = option.value !== select.value && selectedValues.includes(option.value);
    });
  });
}

function syncCreatorChoiceAvailability() {
  syncCreatorExclusiveSelects(["creator-trait-1", "creator-trait-2"]);
  syncCreatorExclusiveSelects([
    "creator-primary-1",
    "creator-primary-2",
    "creator-secondary-1",
    "creator-secondary-2",
  ]);
}

function getCreatorPreviewMarkup(technician) {
  return `
    <div class="results-grid">
      <span>Name</span><strong>${escapeHtml(technician.name)}</strong>
      <span>Formula</span><strong>${escapeHtml(technician.creatorBuild.formula)}</strong>
      <span>Energy</span><strong>${technician.stats.energy}</strong>
      <span>Craftsmanship</span><strong>${technician.stats.craftsmanship}</strong>
      <span>Confidence</span><strong>${technician.stats.confidence}</strong>
      <span>Starting cash</span><strong>${formatCash(technician.startingCash)}</strong>
      <span>Starting kit</span><strong>${getTechnicianStartingKitLabel(technician)}</strong>
      <span>Key skills</span><strong>${getTechnicianSkillPreview(technician)}</strong>
    </div>
    <p><strong>Early read:</strong></p>
    ${getTechnicianEarlyReadoutMarkup(technician)}
    <p class="muted"><strong>Tradeoff:</strong> ${escapeHtml(technician.description)}</p>
  `;
}

function renderCreatorPreviewFromForm() {
  const preview = document.querySelector("#creator-preview");
  const errorNode = document.querySelector("#creator-error");
  if (!preview || !errorNode) return;
  syncCreatorChoiceAvailability();
  const { error, technician } = getCreatorBuildFromForm();
  errorNode.textContent = error;
  preview.innerHTML = technician ? getCreatorPreviewMarkup(technician) : "";
}

function showCharacterCreator() {
  const creator = getCreatorConfig();
  const skills = getSkillDefinitions();
  showModal({
    kicker: "Custom Technician",
    title: "Build Your First Tech",
    body: `
      <p>Pick a work background, work style, two traits, and four major skill focuses. The creator stays compact, but the resulting technician is playable and saved like a premade.</p>
      <div class="creator-form">
        <label>Name <input id="creator-name" maxlength="32" value="Custom Tech" /></label>
        <label>Background ${getCreatorSelectMarkup("creator-background", creator.backgrounds, "green-apprentice")}</label>
        <label>Work style ${getCreatorSelectMarkup("creator-work-style", creator.workStyles, "calm-under-fire")}</label>
        <label>Trait 1 ${getCreatorSelectMarkup("creator-trait-1", creator.traits, "steady-hands")}</label>
        <label>Trait 2 ${getCreatorSelectMarkup("creator-trait-2", creator.traits, "notebook-habit")}</label>
        <label>Primary skill 1 ${getSkillSelectMarkup("creator-primary-1", skills[0]?.id)}</label>
        <label>Primary skill 2 ${getSkillSelectMarkup("creator-primary-2", skills[1]?.id)}</label>
        <label>Secondary skill 1 ${getSkillSelectMarkup("creator-secondary-1", skills[2]?.id)}</label>
        <label>Secondary skill 2 ${getSkillSelectMarkup("creator-secondary-2", skills[4]?.id || skills[3]?.id)}</label>
      </div>
      <p class="creator-error" id="creator-error"></p>
      <p><strong>Build preview:</strong></p>
      <div id="creator-preview"></div>
    `,
    actions: [
      { label: "Start Custom Career", close: false, onClick: () => {
        const { error, technician } = getCreatorBuildFromForm();
        const errorNode = document.querySelector("#creator-error");
        if (error) {
          if (errorNode) errorNode.textContent = error;
          return;
        }
        closeModal();
        startGame(technician);
      } },
      { label: "Update Preview", className: "secondary-button", close: false, onClick: renderCreatorPreviewFromForm },
      { label: "Back to Profiles", className: "secondary-button" },
    ],
  });
  document.querySelectorAll(".creator-form input, .creator-form select").forEach((input) => {
    input.addEventListener("input", renderCreatorPreviewFromForm);
    input.addEventListener("change", renderCreatorPreviewFromForm);
  });
  renderCreatorPreviewFromForm();
}

function renderSelection() {
  elements.technicianGrid.replaceChildren(
    ...content.technicians.map((technician) => {
      const card = document.createElement("article");
      card.className = "technician-card";
      const template = content.characterCreation?.premadeTemplates?.find((item) => item.technicianId === technician.id);
      card.innerHTML = `
        <p class="eyebrow">Technician Profile</p>
        <h3>${technician.name}</h3>
        ${technician.role ? `<p class="muted">${technician.role}</p>` : ""}
        <p>${technician.tagline}</p>
        ${technician.description ? `<p>${technician.description}</p>` : ""}
        <div class="tech-stats">
          <span>Energy <strong>${technician.stats.energy}</strong></span>
          <span>Craft <strong>${technician.stats.craftsmanship}</strong></span>
          <span>Confidence <strong>${technician.stats.confidence}</strong></span>
        </div>
        <p class="starting-kit"><strong>Key skills:</strong> ${getTechnicianSkillPreview(technician)}</p>
        ${technician.strengths ? `<p class="starting-kit"><strong>Strengths:</strong> ${technician.strengths.join(", ")}</p>` : ""}
        ${technician.weaknesses ? `<p class="starting-kit"><strong>Growth areas:</strong> ${technician.weaknesses.join(", ")}</p>` : ""}
        ${technician.playstyle ? `<p class="starting-kit"><strong>Playstyle:</strong> ${technician.playstyle}</p>` : ""}
        ${technician.difficulty ? `<p class="starting-kit"><strong>Difficulty:</strong> ${technician.difficulty}</p>` : ""}
        ${technician.trait ? `<p class="starting-kit"><strong>Trait:</strong> ${technician.trait}</p>` : ""}
        ${technician.tendency ? `<p class="starting-kit"><strong>Tendency:</strong> ${technician.tendency}</p>` : ""}
        ${template ? `<p class="starting-kit"><strong>Creator formula:</strong> ${template.formula}</p>` : ""}
        <p class="starting-kit"><strong>Starting kit:</strong> ${getTechnicianStartingKitLabel(technician)}</p>
        <p class="starting-kit"><strong>Early read:</strong></p>
        ${getTechnicianEarlyReadoutMarkup(technician)}
      `;
      card.append(makeButton("Start First Day", () => startGame(technician.id)));
      return card;
    }),
    renderCharacterCreatorCard(),
  );
}

function renderCharacterCreatorCard() {
  const creator = content.characterCreation;
  const card = document.createElement("article");
  card.className = "technician-card creator-preview-card";
  if (!creator) {
    card.innerHTML = `
      <p class="eyebrow">Custom Build</p>
      <h3>Custom Technician</h3>
      <p>Character creation planning has not been configured yet.</p>
    `;
    return card;
  }
  card.innerHTML = `
    <p class="eyebrow">Custom Build</p>
    <h3>Custom Technician Creator</h3>
    <p>${creator.summary}</p>
    <p class="starting-kit"><strong>Backgrounds:</strong> ${creator.backgrounds.map((item) => item.name).join(", ")}</p>
    <p class="starting-kit"><strong>Work styles:</strong> ${creator.workStyles.map((item) => item.name).join(", ")}</p>
    <p class="starting-kit"><strong>Traits:</strong> ${creator.traits.map((item) => item.name).join(", ")}</p>
    <p class="starting-kit"><strong>Creator release:</strong> pick one background, one work style, two traits, and four major skill focuses, then preview the final build before starting.</p>
  `;
  const button = makeButton("Create Custom Technician", showCharacterCreator, "primary-button");
  card.append(button);
  return card;
}

function getTechnicianSkillPreview(technician, { limit = 5 } = {}) {
  const skillValues = getSkillDefinitions().map((skill) => {
    const value = getTechnicianPreviewSkillValue(technician, skill.id);
    return { ...skill, value };
  });
  return skillValues
    .filter((skill) => skill.value > 0)
    .sort((a, b) => b.value - a.value || a.branch.localeCompare(b.branch) || a.name.localeCompare(b.name))
    .slice(0, limit)
    .map((skill) => `${skill.name} ${skill.value}`)
    .join(", ");
}
