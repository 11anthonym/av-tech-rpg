#!/usr/bin/env node

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const projectRoot = path.resolve(__dirname, "..");
const indexPath = path.join(projectRoot, "index.html");

function readIndexScripts() {
  const html = fs.readFileSync(indexPath, "utf8");
  const match = html.match(/const scripts = \[([\s\S]*?)\];/);
  assert(match, "index.html should define the static script loader list.");
  return [...match[1].matchAll(/"([^"]+\.js)"/g)].map((item) => item[1]);
}

function createClassList() {
  const classes = new Set();
  return {
    add: (...names) => names.forEach((name) => classes.add(name)),
    remove: (...names) => names.forEach((name) => classes.delete(name)),
    contains: (name) => classes.has(name),
    toggle: (name, force) => {
      if (force === true) {
        classes.add(name);
        return true;
      }
      if (force === false) {
        classes.delete(name);
        return false;
      }
      if (classes.has(name)) {
        classes.delete(name);
        return false;
      }
      classes.add(name);
      return true;
    },
  };
}

function createElementStub(tagName = "div") {
  return {
    tagName: tagName.toUpperCase(),
    className: "",
    textContent: "",
    innerHTML: "",
    value: "",
    disabled: false,
    style: {},
    dataset: {},
    children: [],
    options: [],
    classList: createClassList(),
    append(...nodes) {
      this.children.push(...nodes);
    },
    appendChild(node) {
      this.children.push(node);
      return node;
    },
    replaceChildren(...nodes) {
      this.children = nodes;
    },
    addEventListener() {},
    removeEventListener() {},
    focus() {},
    setAttribute(name, value) {
      this[name] = value;
    },
    getAttribute(name) {
      return this[name];
    },
    querySelector() {
      return null;
    },
    querySelectorAll() {
      return [];
    },
    getBoundingClientRect() {
      return { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 };
    },
  };
}

function createDocumentStub() {
  const elements = new Map();
  const getElement = (selector) => {
    if (!elements.has(selector)) elements.set(selector, createElementStub());
    return elements.get(selector);
  };
  return {
    body: createElementStub("body"),
    createElement: createElementStub,
    querySelector: getElement,
    querySelectorAll: () => [],
    addEventListener() {},
    removeEventListener() {},
  };
}

function createLocalStorageStub() {
  const storage = new Map();
  return {
    getItem: (key) => (storage.has(key) ? storage.get(key) : null),
    setItem: (key, value) => storage.set(key, `${value}`),
    removeItem: (key) => storage.delete(key),
    clear: () => storage.clear(),
  };
}

function createGameContext() {
  const context = {
    console,
    Math,
    Date,
    JSON,
    URLSearchParams,
    setTimeout: () => 0,
    clearTimeout() {},
    setInterval: () => 0,
    clearInterval() {},
    localStorage: createLocalStorageStub(),
    document: createDocumentStub(),
    location: { search: "" },
  };
  context.window = context;
  context.globalThis = context;
  context.window.scrollTo = () => {};
  vm.createContext(context);
  return context;
}

function loadGameRuntime() {
  const context = createGameContext();
  readIndexScripts()
    .filter((script) => script !== "src/core/bootstrap.js")
    .forEach((script) => {
      const absolutePath = path.join(projectRoot, script);
      vm.runInContext(fs.readFileSync(absolutePath, "utf8"), context, { filename: script });
    });
  return context;
}

const game = loadGameRuntime();

function runGame(expression) {
  return vm.runInContext(expression, game);
}

function readGameJson(expression) {
  return JSON.parse(runGame(`JSON.stringify(${expression})`));
}

function resetGameState(technicianId = "prototype-tech") {
  runGame(`(() => {
    Object.assign(state, createInitialState());
    state.technician = content.technicians.find((technician) => technician.id === ${JSON.stringify(technicianId)});
    state.tools = uniqueValues(["screwdriver", ...(state.technician.startingTools || [])]);
    state.energy = state.technician.stats.energy;
    state.burnout = state.technician.stats.burnout;
    state.cash = state.technician.startingCash || 0;
    state.vehicleId = content.world?.defaultVehicleId || "van3";
    state.sceneId = "shop";
    state.flags.currentAreaId = content.world?.homeAreaId || "shop";
  })()`);
}

const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
}

test("custom technician names allow first and last names", () => {
  const result = readGameJson(`(() => {
    const selections = {
      name: "  Drew   Wade  ",
      backgroundId: "warehouse-runner",
      workStyleId: "parts-brain",
      traitIds: ["steady-hands", "tool-debt"],
      primarySkillIds: ["install", "documentation"],
      secondarySkillIds: ["fieldcraft", "troubleshooting"],
    };
    const technician = buildCustomTechnician(selections);
    return {
      cleaned: sanitizeCreatorName("  Drew   Wade <temp>  "),
      fallback: sanitizeCreatorName(" <> "),
      technician,
    };
  })()`);

  assert.equal(result.cleaned, "Drew Wade temp");
  assert.equal(result.fallback, "Custom Tech");
  assert.equal(result.technician.name, "Drew Wade");
  assert.equal(result.technician.custom, true);
  assert.equal(result.technician.id, "custom-tech");
  assert.ok(result.technician.startingTools.includes("screwdriver"), "custom tech keeps the basic screwdriver");
  assert.ok(result.technician.startingTools.includes("toolBag"), "background tools should be preserved");
  assert.ok(result.technician.startingTools.includes("circuitHutOrganizer"), "work-style tools should be preserved");
  assert.ok(result.technician.startingTools.includes("drill"), "trait tools should be preserved");
});

test("roster, tools, skills, and character creator data stay valid", () => {
  const failures = readGameJson(`(() => {
    const failures = [];
    const hasDuplicate = (items, label) => {
      const ids = items.map((item) => item.id).filter(Boolean);
      const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
      if (duplicates.length) failures.push(label + " has duplicate ids: " + uniqueValues(duplicates).join(", "));
    };
    const isNumber = (value) => Number.isFinite(value);
    const skills = content.career?.skills || [];
    const skillIds = new Set(skills.map((skill) => skill.id));
    const toolIds = new Set(Object.keys(content.tools || {}));
    const technicianIds = new Set((content.technicians || []).map((technician) => technician.id));
    const validateSkillBonusMap = (map = {}, label) => {
      Object.entries(map).forEach(([skillId, value]) => {
        if (!skillIds.has(skillId)) failures.push(label + " references unknown skill " + skillId);
        if (!isNumber(value)) failures.push(label + "." + skillId + " should be numeric");
      });
    };
    const validateNumericMap = (map = {}, label) => {
      Object.entries(map).forEach(([key, value]) => {
        if (!isNumber(value)) failures.push(label + "." + key + " should be numeric");
      });
    };
    const validateToolRefs = (toolRefs = [], label) => {
      toolRefs.forEach((toolId) => {
        if (!toolIds.has(toolId)) failures.push(label + " references unknown tool " + toolId);
      });
    };

    hasDuplicate(skills, "career.skills");
    skills.forEach((skill) => {
      if (!skill.id || !skill.name || !skill.branch || !skill.description) failures.push("career skill " + (skill.id || "?") + " is missing display data");
    });

    Object.entries(content.tools || {}).forEach(([toolId, tool]) => {
      if (tool.id !== toolId) failures.push("tool " + toolId + " id does not match its key");
      if (!tool.name || !tool.description || !tool.effect) failures.push("tool " + toolId + " is missing display copy");
      if (!isNumber(tool.price ?? 0)) failures.push("tool " + toolId + " price should be numeric");
      validateSkillBonusMap(tool.skillBonuses || {}, "tool " + toolId + " skillBonuses");
      validateNumericMap(tool.modifiers || {}, "tool " + toolId + " modifiers");
    });

    hasDuplicate(content.technicians || [], "technicians");
    ["prototype-tech", "organized-rookie", "wiley", "jordan", "morgan"].forEach((technicianId) => {
      if (!technicianIds.has(technicianId)) failures.push("missing premade technician " + technicianId);
    });
    (content.technicians || []).forEach((technician) => {
      if (!technician.name || !technician.role || !technician.tagline) failures.push("technician " + technician.id + " is missing display copy");
      if (/prototype tech/i.test(technician.name)) failures.push("technician " + technician.id + " exposes old prototype naming");
      ["energy", "burnout", "craftsmanship", "confidence"].forEach((statId) => {
        if (!isNumber(technician.stats?.[statId])) failures.push("technician " + technician.id + " missing numeric stat " + statId);
      });
      validateToolRefs(technician.startingTools || [], "technician " + technician.id + " startingTools");
      skills.forEach((skill) => {
        if (!isNumber(technician.characterStats?.[skill.id])) failures.push("technician " + technician.id + " missing numeric skill " + skill.id);
      });
    });

    const creator = content.characterCreation || {};
    ["backgrounds", "workStyles", "traits"].forEach((collectionKey) => {
      const collection = creator[collectionKey] || [];
      hasDuplicate(collection, "characterCreation." + collectionKey);
      collection.forEach((choice) => {
        if (!choice.name || !choice.tradeoff) failures.push("creator " + collectionKey + "." + choice.id + " is missing name or tradeoff");
        validateSkillBonusMap(choice.skillBonuses || {}, "creator " + collectionKey + "." + choice.id + " skillBonuses");
        validateNumericMap(choice.characterStats || {}, "creator " + collectionKey + "." + choice.id + " characterStats");
        validateNumericMap(choice.statModifiers || {}, "creator " + collectionKey + "." + choice.id + " statModifiers");
        validateToolRefs(choice.startingTools || [], "creator " + collectionKey + "." + choice.id + " startingTools");
      });
    });
    (creator.premadeTemplates || []).forEach((template) => {
      if (!technicianIds.has(template.technicianId)) failures.push("premade template references unknown technician " + template.technicianId);
      if (!template.formula) failures.push("premade template " + template.technicianId + " is missing formula copy");
    });

    Object.entries(content.traitContextBonuses || {}).forEach(([traitId, rules]) => {
      if (!Array.isArray(rules)) failures.push("traitContextBonuses." + traitId + " should be an array");
      (rules || []).forEach((rule, index) => {
        if (!skillIds.has(rule.skillId)) failures.push("traitContextBonuses." + traitId + "." + index + " references unknown skill " + rule.skillId);
        if (!Array.isArray(rule.contextIds) || !rule.contextIds.length) failures.push("traitContextBonuses." + traitId + "." + index + " needs contextIds");
        if (!isNumber(rule.bonus)) failures.push("traitContextBonuses." + traitId + "." + index + " needs numeric bonus");
      });
    });

    return failures;
  })()`);

  assert.deepEqual(failures, []);
});

test("energy and route previews use qualitative pressure language", () => {
  resetGameState();
  const result = readGameJson(`(() => {
    const route = {
      id: "unitRoute",
      fromLabel: "Shop",
      toLabel: "Test Site",
      arrivalTime: "8:30 AM",
      fastTravelEligible: true,
      fastTravelEnergyCost: 2,
      choices: [
        { id: "steady", label: "Take steady route", energyDelta: -2, burnoutDelta: 1 },
        { id: "toll", label: "Use toll road", cashDelta: -8, arrivalTime: "8:10 AM" },
      ],
    };
    return {
      effort: getEnergyEffortText(5),
      energyLoss: getEnergyDeltaPreviewText(-3),
      energyGain: getEnergyDeltaPreviewText(12),
      burnout: getBurnoutPressureText(1),
      routeText: getRouteTravelCostRisk(route),
    };
  })()`);

  assert.equal(result.effort, "steady effort");
  assert.equal(result.energyLoss, "steady effort");
  assert.equal(result.energyGain, "noticeable recovery");
  assert.equal(result.burnout, "some late-night fatigue");
  assert.match(result.routeText, /light effort/);
  assert.match(result.routeText, /some late-night fatigue/);
  assert.match(result.routeText, /-\$8/);
  assert.doesNotMatch(result.routeText, /-2 energy|\+1 burnout/i);
});

test("route job cards expose route metadata and dispatch tool plans", () => {
  resetGameState();
  const result = readGameJson(`(() => {
    const route = getWorldRoute("conshohockenService");
    const job = getRouteJobData(route.id);
    const toolPlan = getDispatchToolPlan(job.familyId, route.id);
    const rows = getRouteJobCardRows(route);
    return {
      title: job.title,
      familyId: job.familyId,
      required: toolPlan.required,
      recommended: toolPlan.recommended,
      rowLabels: rows.map((row) => row.label),
      requiredRow: rows.find((row) => row.label === "Required tools")?.detail || "",
      prepRow: rows.find((row) => row.label === "What happens next")?.detail || "",
    };
  })()`);

  assert.equal(result.familyId, "service");
  assert.ok(result.title.length > 0, "route job should have a player-facing title");
  assert.ok(result.required.includes("screwdriver"), "service plan should require a screwdriver");
  assert.ok(result.recommended.includes("labeler"), "service plan should recommend a labeler");
  assert.ok(result.rowLabels.includes("Required tools"), "job card should show required tools");
  assert.ok(result.rowLabels.includes("Recommended tools"), "job card should show recommended tools");
  assert.ok(result.rowLabels.includes("Callback / return-trip risk"), "job card should show consequence risk");
  assert.match(result.requiredRow, /Basic Screwdriver/);
  assert.ok(result.prepRow.length > 0, "job card should describe what happens next");
});

test("world routes and job card contracts stay internally consistent", () => {
  resetGameState();
  const failures = readGameJson(`(() => {
    const failures = [];
    const routes = content.world?.routes || {};
    const areas = content.world?.areas || {};
    const scenes = content.scenes || {};
    const jobFamilies = content.jobFamilies || {};
    const routeJobs = content.routeJobs || {};
    const dispatchKeys = new Set(Object.keys(content).filter((key) => /Dispatch$/.test(key)));
    const requiredRows = [
      "Destination",
      "Job family",
      "Purpose",
      "Summary",
      "Required tools",
      "Recommended tools",
      "Route status",
      "What happens next",
      "Travel cost/risk",
      "Callback / return-trip risk",
    ];
    const validateJobNode = (node, label) => {
      if (node.familyId && !jobFamilies[node.familyId]) failures.push(label + " has unknown familyId " + node.familyId);
      if (node.dispatchId && !dispatchKeys.has(node.dispatchId)) failures.push(label + " has unknown dispatchId " + node.dispatchId);
    };

    Object.entries(routes).forEach(([routeId, route]) => {
      if (route.id !== routeId) failures.push(routeId + " route id does not match its key");
      if (!areas[route.fromAreaId]) failures.push(routeId + " has unknown fromAreaId " + route.fromAreaId);
      if (!areas[route.toAreaId]) failures.push(routeId + " has unknown toAreaId " + route.toAreaId);
      if (!route.fromLabel) failures.push(routeId + " is missing fromLabel");
      if (!route.toLabel) failures.push(routeId + " is missing toLabel");
      if (route.destinationSceneId && !scenes[route.destinationSceneId]) failures.push(routeId + " has unknown destinationSceneId " + route.destinationSceneId);
      if (route.destinationSceneId && areas[route.toAreaId]?.sceneId !== route.destinationSceneId) {
        failures.push(routeId + " destinationSceneId does not match its destination area scene");
      }
      const job = getRouteJobData(routeId);
      ["title", "familyId", "purpose", "unlockCondition", "rewards"].forEach((field) => {
        if (!job[field]) failures.push(routeId + " job card is missing " + field);
      });
      if (!jobFamilies[job.familyId]) failures.push(routeId + " job card has unknown familyId " + job.familyId);
      const rowLabels = getRouteJobCardRows(route).map((row) => row.label);
      requiredRows.forEach((label) => {
        if (!rowLabels.includes(label)) failures.push(routeId + " job card is missing row " + label);
      });
    });

    Object.entries(routeJobs).forEach(([routeId, routeJob]) => {
      if (!routes[routeId]) failures.push("routeJobs." + routeId + " does not match a route");
      validateJobNode(routeJob, "routeJobs." + routeId);
      ["followup", "install"].forEach((variantKey) => {
        if (routeJob[variantKey]) validateJobNode(routeJob[variantKey], "routeJobs." + routeId + "." + variantKey);
      });
    });

    Object.entries(content.dispatchToolPlans?.routeOverrides || {}).forEach(([routeId, override]) => {
      if (!routes[routeId]) failures.push("dispatchToolPlans.routeOverrides." + routeId + " does not match a route");
      if (!Array.isArray(override.required || [])) failures.push("dispatchToolPlans.routeOverrides." + routeId + ".required is not an array");
      if (!Array.isArray(override.recommended || [])) failures.push("dispatchToolPlans.routeOverrides." + routeId + ".recommended is not an array");
    });

    return failures;
  })()`);

  assert.deepEqual(failures, []);
});

test("dispatch board entries resolve to valid content, routes, and actions", () => {
  resetGameState();
  const failures = readGameJson(`(() => {
    const failures = [];
    const definitions = getDispatchBoardEntryDefinitions();
    const ids = definitions.map((entry) => entry.id);
    ids.filter((id, index) => ids.indexOf(id) !== index).forEach((id) => failures.push("duplicate board entry id " + id));
    definitions.forEach((entry) => {
      if (!entry.id) failures.push("board entry is missing id");
      if (!entry.statusLabel) failures.push("board entry " + entry.id + " is missing statusLabel");
      if (!entry.objective) failures.push("board entry " + entry.id + " is missing objective");
      if (!entry.availableReason) failures.push("board entry " + entry.id + " is missing availableReason");
      if (entry.boardRole && !["main", "optional"].includes(entry.boardRole)) {
        failures.push("board entry " + entry.id + " has invalid boardRole " + entry.boardRole);
      }
      if (["followup", "survey"].includes(entry.id) && (!entry.planningSummary || !entry.planningTradeoff)) {
        failures.push("board entry " + entry.id + " is missing planning copy");
      }
      if (entry.contentKey && !content[entry.contentKey]) failures.push("board entry " + entry.id + " has unknown contentKey " + entry.contentKey);
      if (entry.routeId && typeof entry.routeId === "string" && !getWorldRoute(entry.routeId)) {
        failures.push("board entry " + entry.id + " has unknown routeId " + entry.routeId);
      }
      ["isAvailable", "isInProgress", "isComplete"].forEach((fnName) => {
        if (typeof entry[fnName] !== "function") failures.push("board entry " + entry.id + " missing " + fnName + " function");
      });
      if (typeof entry.previewAction !== "function") failures.push("board entry " + entry.id + " missing previewAction function");
    });
    getDispatchBoardEntries().forEach((entry) => {
      if (!entry.title) failures.push("resolved board entry " + entry.id + " is missing title");
      if (!entry.summary) failures.push("resolved board entry " + entry.id + " is missing summary");
      if (!["main", "optional"].includes(entry.boardRole)) failures.push("resolved board entry " + entry.id + " has invalid boardRole " + entry.boardRole);
      if (!["In progress", "Active board item", "Blocked", "Complete", "Locked"].includes(entry.boardStatus)) {
        failures.push("resolved board entry " + entry.id + " has invalid boardStatus " + entry.boardStatus);
      }
      if (entry.routeId && !entry.route) failures.push("resolved board entry " + entry.id + " lost route lookup");
    });
    return failures;
  })()`);

  assert.deepEqual(failures, []);
});

test("dispatch board planning supports one-job fallback and future multi-job choice", () => {
  resetGameState();
  const result = readGameJson(`(() => {
    state.flags.finished = true;
    state.flags.metJosh = true;
    const currentEntries = getDispatchBoardEntries();
    const singleAvailableIds = getAvailableDispatchBoardEntries(currentEntries).map((entry) => entry.id);
    state.flags.plannedDispatchId = "survey";
    const stalePlanFallback = getCurrentDispatchBoardEntry(currentEntries)?.id || "";

    const choiceEntries = [
      { id: "followup", boardRole: "optional", isAvailable: true },
      { id: "survey", boardRole: "main", isAvailable: true },
    ];
    state.flags.plannedDispatchId = "";
    const availableChoiceIds = getAvailableDispatchBoardEntries(choiceEntries).map((entry) => entry.id);
    const noImplicitChoice = getCurrentDispatchBoardEntry(choiceEntries);
    const selected = setPlannedDispatchBoardEntry("survey", choiceEntries);
    const plannedChoice = getCurrentDispatchBoardEntry(choiceEntries)?.id || "";
    const rejectedLockedPlan = setPlannedDispatchBoardEntry("service", choiceEntries);

    const valid = migrateSavedGame({
      version: 28,
      technicianId: "prototype-tech",
      sceneId: "shop",
      flags: { plannedDispatchId: " followup " },
    });
    const invalid = migrateSavedGame({
      version: 28,
      technicianId: "prototype-tech",
      sceneId: "shop",
      flags: { plannedDispatchId: "not-a-board-entry" },
    });
    const missing = migrateSavedGame({
      version: 28,
      technicianId: "prototype-tech",
      sceneId: "shop",
      flags: {},
    });

    return {
      roles: Object.fromEntries(getDispatchBoardEntries().map((entry) => [entry.id, entry.boardRole])),
      singleAvailableIds,
      stalePlanFallback,
      availableChoiceIds,
      noImplicitChoice: noImplicitChoice?.id || "",
      selected,
      plannedChoice,
      rejectedLockedPlan,
      validPlan: valid.flags.plannedDispatchId,
      invalidPlan: invalid.flags.plannedDispatchId,
      missingPlan: missing.flags.plannedDispatchId,
      migratedVersion: valid.version,
    };
  })()`);

  assert.equal(result.roles.followup, "optional");
  assert.equal(Object.entries(result.roles).filter(([, role]) => role === "optional").length, 1);
  assert.deepEqual(result.singleAvailableIds, ["service"]);
  assert.equal(result.stalePlanFallback, "service");
  assert.deepEqual(result.availableChoiceIds, ["followup", "survey"]);
  assert.equal(result.noImplicitChoice, "");
  assert.equal(result.selected, true);
  assert.equal(result.plannedChoice, "survey");
  assert.equal(result.rejectedLockedPlan, false);
  assert.equal(result.validPlan, "followup");
  assert.equal(result.invalidPlan, "");
  assert.equal(result.missingPlan, "");
  assert.equal(result.migratedVersion, 29);
});

test("post-service board choice stays readable and locks when travel begins", () => {
  resetGameState();
  const result = readGameJson(`(() => {
    state.flags.finished = true;
    state.flags.metJosh = true;
    state.flags.serviceStarted = true;
    state.flags.serviceComplete = true;
    state.flags.serviceApproach = "verify";
    state.flags.serviceRepairMethod = "verify-path";
    state.flags.joshServiceDebriefed = true;
    state.flags.plannedDispatchId = "";

    const openEntries = getDispatchBoardEntries();
    const planningEntries = getDispatchPlanningEntries(openEntries);
    const openingCards = planningEntries.map((entry) => getDispatchBoardPlanningCardMarkup(entry));
    const openingObjective = getCurrentDispatchBoardObjective();
    const openingHud = getHudDispatchPresentation();
    const openingBoardState = getDispatchBoardStateMarkup();

    const selectedFollowup = setPlannedDispatchBoardEntry("followup", openEntries);
    const followupCurrent = getCurrentDispatchBoardEntry(openEntries)?.id || "";
    const followupRouteId = getCurrentDispatchRouteId();
    const selectedSurvey = setPlannedDispatchBoardEntry("survey", openEntries);
    const surveyCurrent = getCurrentDispatchBoardEntry(openEntries)?.id || "";
    const surveyRouteId = getCurrentDispatchRouteId();

    state.flags.surveyStarted = true;
    const surveyStartedEntries = getDispatchBoardEntries();
    const availableAfterSurveyDeparture = getAvailableDispatchBoardEntries(surveyStartedEntries).map((entry) => entry.id);
    const rejectedFollowupSwitch = setPlannedDispatchBoardEntry("followup", surveyStartedEntries);
    const currentAfterSurveyDeparture = getCurrentDispatchBoardEntry(surveyStartedEntries)?.id || "";

    state.flags.surveyStarted = false;
    state.flags.plannedDispatchId = "followup";
    state.flags.conshohockenFollowupStarted = true;
    const followupStartedEntries = getDispatchBoardEntries();
    const availableAfterFollowupDeparture = getAvailableDispatchBoardEntries(followupStartedEntries).map((entry) => entry.id);
    const rejectedSurveySwitch = setPlannedDispatchBoardEntry("survey", followupStartedEntries);
    const currentAfterFollowupDeparture = getCurrentDispatchBoardEntry(followupStartedEntries)?.id || "";

    return {
      planningIds: planningEntries.map((entry) => entry.id),
      roles: planningEntries.map((entry) => entry.boardRole),
      openingCards,
      openingObjective,
      openingHud,
      openingBoardState,
      selectedFollowup,
      followupCurrent,
      followupRouteId,
      selectedSurvey,
      surveyCurrent,
      surveyRouteId,
      availableAfterSurveyDeparture,
      rejectedFollowupSwitch,
      currentAfterSurveyDeparture,
      availableAfterFollowupDeparture,
      rejectedSurveySwitch,
      currentAfterFollowupDeparture,
    };
  })()`);

  assert.deepEqual(result.planningIds, ["followup", "survey"]);
  assert.deepEqual(result.roles, ["optional", "main"]);
  assert.match(result.openingCards[0], /Optional follow-up/i);
  assert.match(result.openingCards[0], /Tradeoff:/i);
  assert.match(result.openingCards[1], /Main assignment/i);
  assert.match(result.openingCards[1], /coordination will reassign/i);
  assert.equal(result.openingObjective, "Choose today's work on the dispatch board.");
  assert.equal(result.openingHud.title, "Choose Today's Work");
  assert.equal(result.openingHud.statusLabel, "WORKDAY PLAN");
  assert.match(result.openingBoardState, /2 jobs are available/i);
  assert.equal(result.selectedFollowup, true);
  assert.equal(result.followupCurrent, "followup");
  assert.equal(result.followupRouteId, "conshohockenService");
  assert.equal(result.selectedSurvey, true);
  assert.equal(result.surveyCurrent, "survey");
  assert.equal(result.surveyRouteId, "universitySurvey");
  assert.deepEqual(result.availableAfterSurveyDeparture, ["survey"]);
  assert.equal(result.rejectedFollowupSwitch, false);
  assert.equal(result.currentAfterSurveyDeparture, "survey");
  assert.deepEqual(result.availableAfterFollowupDeparture, ["followup"]);
  assert.equal(result.rejectedSurveySwitch, false);
  assert.equal(result.currentAfterFollowupDeparture, "followup");
});

test("planned work agrees across objective, van, map, prep, and route launch rules", () => {
  resetGameState();
  const result = readGameJson(`(() => {
    state.flags.finished = true;
    state.flags.metJosh = true;
    state.flags.serviceStarted = true;
    state.flags.serviceComplete = true;
    state.flags.serviceApproach = "verify";
    state.flags.serviceRepairMethod = "verify-path";
    state.flags.joshServiceDebriefed = true;
    state.flags.currentAreaId = "shop";
    state.sceneId = "shop";
    state.flags.plannedDispatchId = "";

    const followupRoute = getWorldRoute("conshohockenService");
    const surveyRoute = getWorldRoute("universitySurvey");
    const noPlan = {
      objective: getObjective(),
      followupCanLaunch: canLaunchRouteFromRegionalMap(followupRoute.id),
      surveyCanLaunch: canLaunchRouteFromRegionalMap(surveyRoute.id),
      followupLock: getRouteLockReason(followupRoute),
      surveyLock: getRouteLockReason(surveyRoute),
      van: getVehicleMenuFlowMarkup(),
      map: getRegionalRouteMarkup(),
    };

    setPlannedDispatchBoardEntry("survey");
    const surveyPrep = Object.fromEntries(getRoutePrepRows(surveyRoute).map((row) => [row.label, row.detail]));
    const surveyPlan = {
      objective: getObjective(),
      routeId: getCurrentDispatchRouteId(),
      surveyCanLaunch: canLaunchRouteFromRegionalMap(surveyRoute.id),
      followupCanLaunch: canLaunchRouteFromRegionalMap(followupRoute.id),
      followupLock: getRouteLockReason(followupRoute),
      surveyStatus: getRouteStatus(surveyRoute),
      followupStatus: getRouteStatus(followupRoute),
      van: getVehicleMenuFlowMarkup(),
      map: getRegionalRouteMarkup(),
      prep: surveyPrep,
    };

    state.flags.currentAreaId = "universitySurvey";
    state.sceneId = "universitySurvey";
    const wrongOrigin = getRouteLaunchEligibility(surveyRoute.id);
    state.flags.currentAreaId = "shop";
    state.sceneId = "shop";

    state.flags.routeHistory = { ...(state.flags.routeHistory || {}), conshohockenService: 1 };
    setPlannedDispatchBoardEntry("followup");
    const followupPlan = {
      objective: getObjective(),
      routeId: getCurrentDispatchRouteId(),
      canLaunch: canLaunchRouteFromRegionalMap(followupRoute.id),
      fastTravel: canFastTravelRoute(followupRoute),
      map: getRegionalRouteMarkup(),
      prepPlan: Object.fromEntries(getRoutePrepRows(followupRoute).map((row) => [row.label, row.detail]))["Workday plan"],
    };

    state.flags.plannedDispatchId = "survey";
    state.flags.surveyStarted = true;
    state.flags.surveyComplete = true;
    const stalePlan = {
      currentEntry: getCurrentDispatchBoardEntry()?.id || "",
      surveyCanLaunch: canLaunchRouteFromRegionalMap(surveyRoute.id),
      surveyLock: getRouteLockReason(surveyRoute),
    };

    return { noPlan, surveyPlan, wrongOrigin, followupPlan, stalePlan };
  })()`);

  assert.match(result.noPlan.objective, /choose today's work/i);
  assert.equal(result.noPlan.followupCanLaunch, false);
  assert.equal(result.noPlan.surveyCanLaunch, false);
  assert.match(result.noPlan.followupLock, /choose it on the dispatch board/i);
  assert.match(result.noPlan.surveyLock, /choose it on the dispatch board/i);
  assert.match(result.noPlan.van, /No job selected/i);
  assert.match(result.noPlan.map, /Other Available Work/i);
  assert.match(result.noPlan.map, /Conshohocken Label Follow-up/i);
  assert.match(result.noPlan.map, /University City Site Survey/i);

  assert.equal(result.surveyPlan.routeId, "universitySurvey");
  assert.match(result.surveyPlan.objective, /Van #3.*University City survey/i);
  assert.equal(result.surveyPlan.surveyCanLaunch, true);
  assert.equal(result.surveyPlan.followupCanLaunch, false);
  assert.match(result.surveyPlan.followupLock, /planned job is University City Site Survey/i);
  assert.equal(result.surveyPlan.surveyStatus, "Active");
  assert.equal(result.surveyPlan.followupStatus, "Available work");
  assert.match(result.surveyPlan.van, /University City Site Survey/i);
  assert.match(result.surveyPlan.map, /\[Active\] UNIVERSITY CITY/i);
  assert.match(result.surveyPlan.map, /\[Available Work\] CONSHOHOCKEN/i);
  assert.match(result.surveyPlan.prep["Workday plan"], /University City Site Survey.*main assignment/i);
  assert.equal(result.surveyPlan.prep["Locked reason"], undefined);

  assert.equal(result.wrongOrigin.allowed, false);
  assert.match(result.wrongOrigin.reason, /Starts from WAYNE AREA/i);
  assert.equal(result.followupPlan.routeId, "conshohockenService");
  assert.match(result.followupPlan.objective, /Van #3.*Conshohocken follow-up/i);
  assert.equal(result.followupPlan.canLaunch, true);
  assert.equal(result.followupPlan.fastTravel, true);
  assert.match(result.followupPlan.map, /\[Active \/ fast travel available\] CONSHOHOCKEN/i);
  assert.match(result.followupPlan.map, /\[Available Work\] UNIVERSITY CITY/i);
  assert.match(result.followupPlan.prepPlan, /Conshohocken Label Follow-up.*optional follow-up/i);

  assert.equal(result.stalePlan.currentEntry, "commissioning");
  assert.equal(result.stalePlan.surveyCanLaunch, false);
  assert.match(result.stalePlan.surveyLock, /planned job is South Philadelphia Commissioning/i);
});

test("portal contracts expose valid spatial movement and lock messaging", () => {
  resetGameState();
  const result = readGameJson(`(() => {
    const failures = [];
    const areas = content.world?.areas || {};
    const portals = content.world?.portals || {};
    Object.entries(portals).forEach(([portalId, portal]) => {
      if (portal.id !== portalId) failures.push(portalId + " portal id does not match its key");
      if (!portal.fromAreaId || !areas[portal.fromAreaId]) failures.push(portalId + " has unknown fromAreaId " + portal.fromAreaId);
      if (!portal.toAreaId || !areas[portal.toAreaId]) failures.push(portalId + " has unknown toAreaId " + portal.toAreaId);
      if (!portal.label) failures.push(portalId + " is missing a player-facing label");
      if (portal.requiredFlag && !portal.requiredMessage) failures.push(portalId + " has a requiredFlag without a requiredMessage");
      if (portal.kind === "returnRoute" && (!portal.returnSource || !portal.returnLog)) {
        failures.push(portalId + " returnRoute is missing returnSource or returnLog");
      }
      if (portal.showWhenFlag && portal.hiddenWhenFlag) failures.push(portalId + " should not have both showWhenFlag and hiddenWhenFlag");
    });

    state.sceneId = "garage";
    state.flags.currentAreaId = "centerCityGarage";
    const lockedPortal = getWorldPortal("garageToLobby");
    const lockedRows = getPortalCardRows(lockedPortal).map((row) => row.label);
    const lockedReady = isPortalReady(lockedPortal);
    const lockedRequirement = getPortalRequirementText(lockedPortal);
    state.flags.centerCityEquipmentDelivered = true;
    const readyText = getPortalStatusText(lockedPortal);
    return {
      failures,
      lockedReady,
      lockedRequirement,
      lockedRows,
      readyText,
    };
  })()`);

  assert.deepEqual(result.failures, []);
  assert.equal(result.lockedReady, false);
  assert.match(result.lockedRequirement, /equipment still needs to be carried/i);
  assert.ok(result.lockedRows.includes("Origin"), "portal cards should show origin");
  assert.ok(result.lockedRows.includes("Destination"), "portal cards should show destination");
  assert.ok(result.lockedRows.includes("Requirement"), "portal cards should show the lock requirement");
  assert.equal(result.readyText, "Ready");
});

test("route lock and status helpers change with player state", () => {
  resetGameState();
  const result = readGameJson(`(() => {
    const route = getWorldRoute("centerCityTutorial");
    const fresh = {
      status: getRouteStatus(route),
      lockReason: getRouteLockReason(route),
      preview: getRouteLaunchPreviewText(route),
    };
    state.flags.shopBrief = true;
    state.loaded = [...content.tutorial.shopLoad];
    const ready = {
      status: getRouteStatus(route),
      lockReason: getRouteLockReason(route),
      preview: getRouteLaunchPreviewText(route),
    };
    state.flags.finished = true;
    const completed = {
      status: getRouteStatus(route),
      lockReason: getRouteLockReason(route),
    };
    return { fresh, ready, completed };
  })()`);

  assert.match(result.fresh.lockReason, /supervisor/i);
  assert.match(result.fresh.preview, /^Locked:/);
  assert.equal(result.ready.status, "Available");
  assert.equal(result.ready.lockReason, "");
  assert.doesNotMatch(result.ready.preview, /^Locked:/);
  assert.match(result.completed.lockReason, /already complete/i);
});

test("field task content has reusable check structure", () => {
  resetGameState();
  const failures = readGameJson(`(() => {
    const failures = [];
    const skillIds = new Set((content.career?.skills || []).map((skill) => skill.id));
    const taskCollections = [];
    const visit = (value, path = []) => {
      if (Array.isArray(value)) {
        const key = path[path.length - 1];
        if (
          path[0] !== "upcomingDispatches"
          && ["checks", "inspections", "taskChecks", "assembly"].includes(key)
          && value.some((item) => item && typeof item === "object" && item.label)
        ) {
          taskCollections.push({ path: path.join("."), items: value });
        }
        value.forEach((item, index) => visit(item, path.concat(index)));
        return;
      }
      if (value && typeof value === "object") {
        Object.entries(value).forEach(([key, next]) => visit(next, path.concat(key)));
      }
    };
    visit(content);
    taskCollections.forEach((collection) => {
      const ids = collection.items.map((check) => check.id).filter(Boolean);
      ids.filter((id, index) => ids.indexOf(id) !== index).forEach((id) => failures.push(collection.path + " has duplicate check id " + id));
      collection.items.forEach((check, index) => {
        const label = collection.path + "." + (check.id || index);
        if (!check.id) failures.push(label + " is missing id");
        if (!check.label) failures.push(label + " is missing label");
        if (!check.type) failures.push(label + " is missing type");
        if (!skillIds.has(check.skillId)) failures.push(label + " references unknown skillId " + check.skillId);
        if (!Number.isFinite(check.difficulty)) failures.push(label + " is missing numeric difficulty");
        if (!Number.isFinite(check.energyCost)) failures.push(label + " is missing numeric energyCost");
        if (!check.contextId) failures.push(label + " is missing contextId");
        if (!check.requiredTool) failures.push(label + " is missing requiredTool/prep");
        if (!check.successText) failures.push(label + " is missing successText");
        if (!check.strainedText) failures.push(label + " is missing strainedText");
        if (!check.log) failures.push(label + " is missing log");
        if (check.riskFlag && !check.riskLabel) failures.push(label + " has riskFlag without riskLabel");
        (check.taskModifiers || []).forEach((modifier, modifierIndex) => {
          const modifierLabel = label + ".taskModifiers." + modifierIndex;
          if (!modifier.id || !modifier.label || !modifier.source) failures.push(modifierLabel + " is missing id, label, or source");
          if (modifier.statDelta !== undefined && !Number.isFinite(modifier.statDelta)) failures.push(modifierLabel + " statDelta should be numeric");
          if (modifier.energyDelta !== undefined && !Number.isFinite(modifier.energyDelta)) failures.push(modifierLabel + " energyDelta should be numeric");
        });
      });
    });
    const preview = getFieldTaskPreviewMarkup(content.serviceDispatch.checks);
    return {
      failures,
      collectionCount: taskCollections.length,
      previewHasCards: preview.includes("Field Task Checks") && preview.includes("Verify signal path"),
    };
  })()`);

  assert.deepEqual(failures.failures || failures, []);
  assert.ok(failures.collectionCount >= 10, "expected current dispatch task collections to be covered");
  assert.equal(failures.previewHasCards, true);
});

test("field task modifiers preview, apply, and consume one-time support", () => {
  resetGameState("jordan");
  const result = readGameJson(`(() => {
    state.energy = 20;
    state.burnout = 0;
    state.flags.shiftPrepActive = true;
    grantJoshCrewSupport("unit test Josh help");
    const check = {
      id: "unit-service-check",
      label: "Document callback cleanup",
      skillId: "documentation",
      difficulty: 4,
      energyCost: 3,
      contextId: "callback-documentation",
      taskModifiers: [
        {
          id: "room-pressure",
          label: "Room pressure",
          source: "The client is waiting in the room.",
          statDelta: -1,
          energyDelta: 2,
          resultText: "Room pressure made the service check less forgiving.",
        },
      ],
    };
    const applied = applyTaskModifiers(check);
    const preview = getTaskModifierPreviewText(check);
    const result = getSkillCheckResult({
      skillId: check.skillId,
      difficulty: check.difficulty,
      contextId: check.contextId,
      check,
    });
    const consumed = consumeTaskModifiers(check, result);
    return {
      preview,
      applied,
      result,
      consumed,
      joshCrewSupportAvailable: state.flags.joshCrewSupportAvailable,
      joshCrewSupportUsed: state.flags.joshCrewSupportUsed,
      joshCrewSupportLastUsed: state.flags.joshCrewSupportLastUsed,
    };
  })()`);

  const modifierIds = result.applied.modifiers.map((modifier) => modifier.id);
  assert.ok(modifierIds.includes("room-pressure"), "check-specific modifier should apply");
  assert.ok(modifierIds.includes("next-shift-prep"), "shift prep modifier should apply");
  assert.ok(modifierIds.includes("field-condition-pressure"), "low-energy modifier should apply");
  assert.ok(modifierIds.includes("josh-crew-support"), "Josh support modifier should apply");
  assert.equal(result.applied.baseEnergyCost, 5);
  assert.match(result.preview, /Room pressure/);
  assert.match(result.preview, /makes the check harder/);
  assert.match(result.preview, /adds effort/);
  assert.match(result.preview, /Josh crew support/);
  assert.ok(result.result.modifiersApplied.some((modifier) => modifier.id === "josh-crew-support"));
  assert.deepEqual(result.consumed, ["josh-crew-support"]);
  assert.equal(result.joshCrewSupportAvailable, false);
  assert.equal(result.joshCrewSupportUsed, true);
  assert.equal(result.joshCrewSupportLastUsed.contextId, "callback-documentation");
});

test("University City survey task modifiers respond to prep and inspection order", () => {
  resetGameState();
  const result = readGameJson(`(() => {
    state.sceneId = "universitySurvey";
    state.flags.currentAreaId = "universitySurvey";
    state.flags.surveyBrief = true;
    state.flags.surveyPreparation = "none";

    const elevatorNoPrep = getSurveyAdjustedInspection("elevator");
    const wallBeforePath = getSurveyAdjustedInspection("wall");
    const routeDifferenceBefore = getDispatchDifferenceText({ routeId: "universitySurvey" });
    inspectSurveyConstraint("wall");
    const wallResult = state.flags.fieldTaskResults?.["survey-wall"];
    const objectiveAfterWall = resolveCurrentObjective().text;

    state.surveyInspections = ["elevator", "hallway"];
    state.flags.surveyPreparation = "measure";
    const wallAfterPath = getSurveyAdjustedInspection("wall");
    const surveyTaskMarkup = getFieldTaskPreviewMarkup(getSurveyAdjustedInspections());

    return {
      elevatorModifierIds: (elevatorNoPrep.taskModifiers || []).map((modifier) => modifier.id),
      wallBeforeIds: (wallBeforePath.taskModifiers || []).map((modifier) => modifier.id),
      wallBeforePreview: getTaskModifierPreviewText(wallBeforePath),
      routeDifferenceBefore,
      wallResultIds: (wallResult?.modifiersApplied || []).map((modifier) => modifier.id),
      wallFirstFlag: Boolean(state.flags.surveyWallCheckedBeforeAccessPath),
      objectiveAfterWall,
      wallAfterIds: (wallAfterPath.taskModifiers || []).map((modifier) => modifier.id),
      wallAfterPreview: getTaskModifierPreviewText(wallAfterPath),
      surveyTaskMarkup,
    };
  })()`);

  assert.ok(result.elevatorModifierIds.includes("survey-forwarded-email"), "No-prep survey should carry thin-note pressure");
  assert.ok(result.wallBeforeIds.includes("survey-wall-before-path"), "Wall check before access path should carry order pressure");
  assert.match(result.wallBeforePreview, /Access path unresolved/);
  assert.match(result.routeDifferenceBefore, /Thin starting notes|Access path unresolved/);
  assert.ok(result.wallResultIds.includes("survey-wall-before-path"), "Resolved wall-first check should save the applied modifier");
  assert.equal(result.wallFirstFlag, true, "Wall-first choice should become saved survey state");
  assert.match(result.objectiveAfterWall, /Measure the elevator and hallway/);
  assert.ok(result.wallAfterIds.includes("survey-access-path-measured"), "Wall check after access path should carry access-path support");
  assert.match(result.wallAfterPreview, /Access path measured/);
  assert.match(result.surveyTaskMarkup, /Pressure on this action/);
});

test("University City trusted quote creates visible route consequence pressure", () => {
  resetGameState();
  const result = readGameJson(`(() => {
    state.sceneId = "universitySurvey";
    state.flags.currentAreaId = "universitySurvey";
    state.flags.surveyBrief = true;
    state.flags.surveyPreparation = "sketch";
    state.surveyInspections = ["elevator", "hallway", "wall"];
    finishSurvey("trust");
    const route = getWorldRoute("universitySurvey");
    const risk = state.flags.returnTripRisks?.universitySurveyAccessPressure || null;
    return {
      risk,
      ledgerEntry: getConsequenceLedgerEntries().find((entry) => entry.id === "universitySurveyAccessPressure") || null,
      pressureText: getRouteConsequencePressureText(route),
      routeCard: getRouteCardMarkup(route),
      closeoutDetail: state.flags.lastJobSiteCloseoutSummary?.consequences?.[0]?.detail || "",
    };
  })()`);

  assert.ok(result.risk, "Trusting the survey quote should save named University City pressure");
  assert.match(result.risk.detail, /access pressure is still open/i);
  assert.equal(result.ledgerEntry.status, "open");
  assert.match(result.ledgerEntry.affects, /University City install/);
  assert.match(result.pressureText, /University City access pressure/);
  assert.match(result.routeCard, /Mapped consequence pressure/);
  assert.match(result.closeoutDetail, /cleaner-looking quote/);
});

test("Burlington retrofit install branch uses visible task modifiers", () => {
  resetGameState();
  const result = readGameJson(`(() => {
    state.sceneId = "burlingtonRetrofitWalkdown";
    state.flags.currentAreaId = "burlingtonRetrofitWalkdown";
    state.flags.retrofitWalkdownComplete = true;
    state.flags.retrofitWalkdownApproach = "accept";
    state.flags.retrofitInstallRisk = true;
    state.flags.retrofitInstallBranch = "risk";
    state.flags.retrofitInstallPackageReviewed = true;

    const routeDifference = getDispatchDifferenceText({ routeId: "burlingtonRetrofitWalkdown" });
    const riskCheck = getRetrofitInstallChecks().find((item) => item.id === "pathway-install");
    const riskPreview = getTaskModifierPreviewText(riskCheck);
    const beforeEnergy = state.energy;
    const { skillCheck, energyCost } = resolveFieldTaskCheck({
      check: riskCheck,
      checkId: riskCheck.id,
      completedChecks: [],
      flagKey: "unit-retrofit-risk",
      cleanEnergyReduction: 0,
      failedEnergyPenalty: 0,
    });
    const ledgerIds = (state.flags.fieldTaskResults["unit-retrofit-risk"]?.modifiersApplied || []).map((modifier) => modifier.id);
    const appliedIds = (skillCheck.modifiersApplied || []).map((modifier) => modifier.id);
    const resolvedEnergyDelta = beforeEnergy - state.energy;

    state.flags.fieldTaskResults = {};
    state.flags.skillChecks = {};
    state.retrofitInstallChecks = [];
    state.energy = beforeEnergy;
    state.flags.retrofitWalkdownApproach = "scope";
    state.flags.retrofitInstallRisk = false;
    state.flags.retrofitInstallProtected = true;
    state.flags.retrofitInstallBranch = "protected";
    const protectedCheck = getRetrofitInstallChecks().find((item) => item.id === "pathway-install");
    const protectedPreview = getTaskModifierPreviewText(protectedCheck);

    return {
      routeDifference,
      riskPreview,
      riskModifierIds: (riskCheck.taskModifiers || []).map((modifier) => modifier.id),
      riskEnergyDelta: (riskCheck.taskModifiers || [])[0]?.energyDelta,
      riskStatDelta: (riskCheck.taskModifiers || [])[0]?.statDelta,
      appliedIds,
      ledgerIds,
      energyCost,
      energyDelta: resolvedEnergyDelta,
      protectedPreview,
      protectedModifier: (protectedCheck.taskModifiers || [])[0] || null,
    };
  })()`);

  assert.match(result.routeDifference, /Inherited pathway risk/);
  assert.match(result.riskPreview, /Inherited pathway risk/);
  assert.ok(result.riskModifierIds.includes("retrofit-inherited-pathway-risk"), "Risk branch should attach a named install modifier");
  assert.equal(result.riskEnergyDelta, 2);
  assert.equal(result.riskStatDelta, -1);
  assert.ok(result.appliedIds.includes("retrofit-inherited-pathway-risk"), "Skill check should record the risk modifier");
  assert.ok(result.ledgerIds.includes("retrofit-inherited-pathway-risk"), "Field-task ledger should persist the branch modifier");
  assert.equal(result.energyDelta, result.energyCost);
  assert.ok(result.energyCost >= 7, "Inherited pathway risk should add install effort through the modifier layer");
  assert.match(result.protectedPreview, /Protected walkdown package/);
  assert.equal(result.protectedModifier.id, "retrofit-protected-pathway");
  assert.equal(result.protectedModifier.statDelta, 1);
  assert.equal(result.protectedModifier.energyDelta, -2);
});

test("consequence review groups active, resolved, and inherited pressure", () => {
  resetGameState();
  const result = readGameJson(`(() => {
    state.stats.callbacks = 1;
    state.stats.callbacksResolved = 0;
    state.flags.returnTripRisks = {
      systemsQuickReboot: {
        status: "open",
        source: "King of Prussia Room Offline",
        cause: "The room was closed with a reboot instead of mismatch notes.",
        detail: "Systems quick-reboot debt is still open.",
        affects: "future systems service or warranty return pressure",
      },
    };
    state.flags.resolvedReturnTripRisks = {
      conshohockenServiceRoomPressure: {
        source: "One Quick Display Swap",
        detail: "Room pressure stayed on the ledger.",
        resolution: "Josh and the player rebuilt the callback notes.",
        status: "resolved",
      },
    };
    state.flags.lastJobSiteCloseoutSummary = {
      source: "Burlington County Retrofit Install",
      result: "Install risk inherited",
      sceneId: "burlingtonRetrofitWalkdown",
      areaId: "burlingtonRetrofitWalkdown",
      clock: "FRI 3:18 PM",
      consequences: [{
        status: "inherited",
        source: "Burlington County Retrofit Install",
        cause: "Install closeout left the pathway record weak.",
        affects: "Burlington future service",
        detail: "Future service inherits a thinner record of the actual pathway.",
      }],
    };
    const groups = getConsequenceReviewGroups();
    const summaryMarkup = getConsequenceReviewFilterSummaryMarkup();
    const activeMarkup = getConsequenceReviewGroupMarkup(groups.active);
    const resolvedMarkup = getConsequenceReviewGroupMarkup(groups.resolved);
    const inheritedMarkup = getConsequenceReviewGroupMarkup(groups.inherited);
    showCareerClipboard();
    const clipboardMarkup = elements.modalBody.innerHTML;
    return {
      activeCount: groups.active.length,
      resolvedCount: groups.resolved.length,
      inheritedCount: groups.inherited.length,
      summaryMarkup,
      activeMarkup,
      resolvedMarkup,
      inheritedMarkup,
      menuText: getConsequenceReviewMenuText(),
      clipboardMarkup,
    };
  })()`);

  assert.equal(result.activeCount, 2, "Callback debt and systems risk should both count as active pressure");
  assert.equal(result.resolvedCount, 1, "Resolved return-trip risk should appear in the resolved group");
  assert.equal(result.inheritedCount, 1, "Saved inherited closeout should appear in the inherited group");
  assert.match(result.summaryMarkup, /Active today/);
  assert.match(result.summaryMarkup, /Resolved/);
  assert.match(result.summaryMarkup, /Inherited/);
  assert.match(result.activeMarkup, /KING OF PRUSSIA|King of Prussia/);
  assert.match(result.resolvedMarkup, /Josh and the player rebuilt/);
  assert.match(result.inheritedMarkup, /Burlington County Retrofit Install/);
  assert.match(result.menuText, /active/);
  assert.match(result.clipboardMarkup, /Consequence review/);
  assert.match(result.clipboardMarkup, /Active today/);
});

test("save migration maps trusted University City survey into access pressure", () => {
  const result = readGameJson(`(() => {
    const migrated = migrateSavedGame({
      version: 1,
      technicianId: "prototype-tech",
      sceneId: "shop",
      flags: {
        surveyComplete: true,
        surveyApproach: "trust",
      },
    });
    const risk = migrated.flags.returnTripRisks?.universitySurveyAccessPressure || null;
    return {
      risk,
      inherited: Boolean(migrated.flags.surveyAccessPressureInherited),
    };
  })()`);

  assert.ok(result.risk, "Older trusted survey saves should migrate into University City access pressure");
  assert.equal(result.risk.status, "open");
  assert.match(result.risk.affects, /University City install/);
  assert.equal(result.inherited, true);
});

test("pressure rolls are deterministic or overridable for unit scenarios", () => {
  const result = readGameJson(`(() => {
    const conditions = [
      { id: "client-in-room" },
      { id: "bad-ticket" },
      { id: "missing-adapter" },
    ];
    return {
      hit: rollImmediatePressureIncident({ incidentChance: 0.4 }, 0.39),
      miss: rollImmediatePressureIncident({ incidentChance: 0.4 }, 0.41),
      first: getRolledPressureConditionIds(conditions, "service-seed", { limit: 2 }),
      second: getRolledPressureConditionIds(conditions, "service-seed", { limit: 2 }),
    };
  })()`);

  assert.equal(result.hit.happened, true);
  assert.equal(result.miss.happened, false);
  assert.deepEqual(result.first, result.second);
  assert.equal(result.first.length, 2);
});

test("save migration fills current route, cargo, support, and ledger defaults", () => {
  const result = readGameJson(`(() => {
    const migrated = migrateSavedGame({
      version: 1,
      technicianId: "prototype-tech",
      sceneId: "serviceOffice",
      energy: 42,
      burnout: 1,
      flags: {
        serviceComplete: true,
        serviceApproach: "rush",
        joshCrewSupportAvailable: true,
      },
    });
    return {
      version: migrated.version,
      vehicleId: migrated.vehicleId,
      carryIsArray: Array.isArray(migrated.carry),
      loadedIsArray: Array.isArray(migrated.loaded),
      routeHistory: migrated.flags.routeHistory,
      routeChoiceHistoryIsObject: migrated.flags.routeChoiceHistory && typeof migrated.flags.routeChoiceHistory === "object",
      currentAreaId: migrated.flags.currentAreaId,
      serviceCallbackPending: migrated.flags.serviceCallbackPending,
      jobSiteCloseoutHistoryIsArray: Array.isArray(migrated.flags.jobSiteCloseoutHistory),
      shiftHistoryIsArray: Array.isArray(migrated.flags.shiftHistory),
      joshHelpHistoryIsArray: Array.isArray(migrated.flags.joshHelpHistory),
      joshCrewSupportAvailable: migrated.flags.joshCrewSupportAvailable,
      joshCrewSupportUsed: migrated.flags.joshCrewSupportUsed,
      joshCrewSupportSource: migrated.flags.joshCrewSupportSource,
    };
  })()`);

  assert.equal(result.vehicleId, "van3");
  assert.equal(result.carryIsArray, true);
  assert.equal(result.loadedIsArray, true);
  assert.equal(result.routeHistory.conshohockenService, 1);
  assert.equal(result.routeChoiceHistoryIsObject, true);
  assert.equal(result.currentAreaId, "serviceOffice");
  assert.equal(result.serviceCallbackPending, true);
  assert.equal(result.jobSiteCloseoutHistoryIsArray, true);
  assert.equal(result.shiftHistoryIsArray, true);
  assert.equal(result.joshHelpHistoryIsArray, true);
  assert.equal(result.joshCrewSupportAvailable, true);
  assert.equal(result.joshCrewSupportUsed, false);
  assert.equal(result.joshCrewSupportSource, "");
});

test("current verified service closeouts do not regain legacy callback pressure on load", () => {
  const result = readGameJson(`(() => {
    const current = migrateSavedGame({
      version: SAVE_VERSION,
      technicianId: "wiley",
      sceneId: "serviceOffice",
      flags: {
        serviceComplete: true,
        serviceApproach: "rush",
        serviceRepairMethod: "stage-clean-swap",
        serviceFinalVerification: {
          id: "quick",
          label: "Run a quick confidence check",
          status: "quick",
          detail: "The visible source and display path held through the confidence check.",
          clock: "TUE 11:42 AM",
        },
        returnTripRisks: {},
      },
    });
    const legacy = migrateSavedGame({
      version: 27,
      technicianId: "prototype-tech",
      sceneId: "serviceOffice",
      flags: {
        serviceComplete: true,
        serviceApproach: "rush",
      },
    });
    return {
      currentPending: Boolean(current.flags.serviceCallbackPending),
      currentFinalStatus: current.flags.serviceFinalVerification?.status || "",
      legacyPending: Boolean(legacy.flags.serviceCallbackPending),
      legacyFinalId: legacy.flags.serviceFinalVerification?.id || "",
    };
  })()`);

  assert.equal(result.currentPending, false);
  assert.equal(result.currentFinalStatus, "quick");
  assert.equal(result.legacyPending, true);
  assert.equal(result.legacyFinalId, "legacy");
});

test("save serialization round-trips through migration with current state shape", () => {
  resetGameState("wiley");
  const result = readGameJson(`(() => {
    state.sceneId = "serviceOffice";
    state.flags.currentAreaId = "serviceOffice";
    state.flags.serviceComplete = true;
    state.flags.serviceApproach = "verify";
    state.flags.routeHistory = { conshohockenService: 1 };
    state.flags.returnTripRisks = {
      conshohockenServiceRoomPressure: {
        source: "Unit service check",
        detail: "Room pressure stayed on the ledger.",
      },
    };
    state.serviceInstalled = content.serviceDispatch.swapItems.map((item) => item.id);
    const saved = serializeGame();
    const migrated = migrateSavedGame(JSON.parse(JSON.stringify(saved)));
    return {
      technicianId: saved.technicianId,
      customTechnician: saved.customTechnician,
      sceneId: migrated.sceneId,
      vehicleId: migrated.vehicleId,
      serviceInstalledIsArray: Array.isArray(migrated.serviceInstalled),
      routeHistory: migrated.flags.routeHistory,
      returnTripRisks: migrated.flags.returnTripRisks,
      statsHasEnergyCrashes: Object.prototype.hasOwnProperty.call(migrated.stats, "energyCrashes"),
      logIsArray: Array.isArray(migrated.log),
    };
  })()`);

  assert.equal(result.technicianId, "wiley");
  assert.equal(result.customTechnician, null);
  assert.equal(result.sceneId, "serviceOffice");
  assert.equal(result.vehicleId, "van3");
  assert.equal(result.serviceInstalledIsArray, true);
  assert.equal(result.routeHistory.conshohockenService, 1);
  assert.ok(result.returnTripRisks.conshohockenServiceRoomPressure);
  assert.equal(result.statsHasEnergyCrashes, true);
  assert.equal(result.logIsArray, true);
});

test("current objective resolver covers representative player states", () => {
  const result = readGameJson(`(() => {
    const snapshots = [];
    const capture = (id) => {
      const resolved = resolveCurrentObjective();
      const panelRows = getCurrentStepPanelRows();
      snapshots.push({
        id,
        objective: resolved.text,
        stage: getCurrentStepStage(resolved.text),
        firstPanelLabel: panelRows[0]?.label || "",
        firstPanelDetail: panelRows[0]?.detail || "",
      });
    };

    Object.assign(state, createInitialState());
    state.technician = content.technicians.find((technician) => technician.id === "prototype-tech");
    state.tools = ["screwdriver"];
    state.sceneId = "shop";
    state.flags.currentAreaId = "shop";
    capture("fresh-shop");

    state.flags.shopBrief = true;
    capture("loadout");

    state.loaded = [...content.tutorial.shopLoad];
    capture("ready-route");

    Object.assign(state, createInitialState());
    state.technician = content.technicians.find((technician) => technician.id === "prototype-tech");
    state.tools = ["screwdriver"];
    state.sceneId = "serviceOffice";
    state.flags.currentAreaId = "serviceOffice";
    state.flags.serviceComplete = true;
    capture("service-return");

    Object.assign(state, createInitialState());
    state.technician = content.technicians.find((technician) => technician.id === "prototype-tech");
    state.tools = ["screwdriver"];
    state.sceneId = "burlingtonRetrofitWalkdown";
    state.flags.currentAreaId = "burlingtonRetrofitWalkdown";
    state.flags.retrofitInstallStarted = true;
    state.flags.retrofitInstallBrief = true;
    state.retrofitInstallChecks = [];
    capture("retrofit-install");

    return snapshots;
  })()`);

  assert.equal(result.length, 5);
  result.forEach((snapshot) => {
    assert.ok(snapshot.objective.length > 8, `${snapshot.id} should have a useful objective`);
    assert.ok(snapshot.stage.length > 0, `${snapshot.id} should have a current stage`);
    assert.equal(snapshot.firstPanelLabel, "Next task", `${snapshot.id} should put next task first`);
    assert.equal(snapshot.firstPanelDetail, snapshot.objective, `${snapshot.id} panel should match resolver objective`);
    assert.doesNotMatch(snapshot.objective, /prototype|current loop/i, `${snapshot.id} should avoid internal jargon`);
  });
  assert.match(result.find((item) => item.id === "fresh-shop").objective, /supervisor/i);
  assert.match(result.find((item) => item.id === "loadout").objective, /Load staged equipment/i);
  assert.match(result.find((item) => item.id === "ready-route").objective, /Van #3|Center City East/i);
  assert.match(result.find((item) => item.id === "service-return").objective, /RETURN marker/i);
  assert.match(result.find((item) => item.id === "retrofit-install").objective, /Install the retrofit pathway/i);
});

test("Conshohocken primary interactions guide the physical service-room sequence", () => {
  const result = readGameJson(`(() => {
    Object.assign(state, createInitialState());
    state.technician = content.technicians.find((technician) => technician.id === "prototype-tech");
    state.tools = ["screwdriver"];
    state.sceneId = "serviceOffice";
    state.flags.currentAreaId = "serviceOffice";

    const capture = (id) => {
      const interaction = getPrimaryInteraction();
      return {
        id,
        interactionId: interaction?.id || "",
        marker: interaction ? getInteractionMarkerText(interaction) : "",
        objective: resolveCurrentObjective().text,
        markerClass: interaction ? getInteractionMarkerClass(interaction) : "",
      };
    };

    const snapshots = [capture("check-in")];
    state.flags.serviceBrief = true;
    snapshots.push(capture("inspect"));
    state.flags.serviceInspected = true;
    state.flags.serviceRoomConditions = [];
    state.flags.serviceKnownRoomConditions = [];
    snapshots.push(capture("investigate"));
    state.carry = ["replacement-display"];
    state.flags.serviceApproach = "verify";
    snapshots.push(capture("install"));
    state.flags.serviceRoomIncidents = [{
      id: "unit-room-incident",
      conditionId: "client-time-pressure",
      conditionLabel: "Client time pressure",
      detail: "The client saw the rushed result.",
      incidentFlags: ["serviceClientAngry"],
      status: "open",
    }];
    snapshots.push(capture("recover"));
    state.flags.serviceRoomIncidents[0].recoveryAction = "carry";
    state.serviceInstalled = content.serviceDispatch.swapItems.map((item) => item.id);
    state.carry = [];
    snapshots.push(capture("verify"));
    state.flags.serviceFinalVerification = {
      id: "full",
      label: "Run a full room test",
      status: "confirmed",
      detail: "The room held under test.",
      clock: state.clock,
    };
    snapshots.push(capture("closeout"));
    return snapshots;
  })()`);

  const byId = Object.fromEntries(result.map((entry) => [entry.id, entry]));
  assert.equal(byId["check-in"].interactionId, "service-client");
  assert.match(byId["check-in"].objective, /check in/i);
  assert.equal(byId.inspect.interactionId, "service-display");
  assert.match(byId.inspect.objective, /inspect the failed display/i);
  assert.equal(byId.investigate.interactionId, "");
  assert.match(byId.investigate.objective, /Gather another room finding|select a service approach/i);
  assert.equal(byId.install.interactionId, "service-display");
  assert.match(byId.install.objective, /fit the carried replacement gear/i);
  assert.equal(byId.recover.interactionId, "service-incident-recovery");
  assert.match(byId.recover.objective, /recover the visible room incident/i);
  assert.equal(byId.verify.interactionId, "service-display");
  assert.equal(byId.verify.marker, "TEST");
  assert.match(byId.verify.objective, /prove the repaired room/i);
  assert.equal(byId.closeout.interactionId, "service-client");
  assert.match(byId.closeout.objective, /close out the service call/i);
  result.filter((entry) => entry.interactionId).forEach((entry) => {
    assert.match(entry.markerClass, /primary-objective-marker/, `${entry.id} should visibly mark the primary interaction`);
  });
});

test("Conshohocken findings can be gathered in different room orders before choosing an approach", () => {
  const result = readGameJson(`(() => {
    Object.assign(state, createInitialState());
    state.technician = content.technicians.find((technician) => technician.id === "prototype-tech");
    state.tools = ["screwdriver"];
    state.sceneId = "serviceOffice";
    state.flags.currentAreaId = "serviceOffice";
    state.flags.serviceBrief = true;
    state.flags.serviceInspected = true;
    state.flags.serviceRoomConditions = ["mislabeled-input", "loose-mount-hardware"];
    state.flags.serviceKnownRoomConditions = [];

    const initialInteractions = getInteractions();
    const initialLabels = initialInteractions.map((interaction) => interaction.label);
    initialInteractions.find((interaction) => interaction.id === "service-signal-path-finding").action();
    closeModal();
    getInteractions().find((interaction) => interaction.id === "service-pickup").action();
    closeModal();
    getInteractions().find((interaction) => interaction.id === "service-client").action();
    closeModal();
    const afterInteractions = getInteractions();
    const display = afterInteractions.find((interaction) => interaction.id === "service-display");
    display.action();
    const diagnosisMarkup = elements.modalBody.innerHTML || "";
    return {
      initialLabels,
      evidenceIds: getDiscoveredServiceDiagnosticEvidenceIds(),
      knownConditionIds: getKnownServiceRoomConditionIds(),
      objective: resolveCurrentObjective().text,
      primaryId: getPrimaryInteraction()?.id || "",
      clientTaskState: getInteractionTaskState(afterInteractions.find((interaction) => interaction.id === "service-client")),
      signalTaskState: getInteractionTaskState(afterInteractions.find((interaction) => interaction.id === "service-signal-path-finding")),
      pickupLabel: afterInteractions.find((interaction) => interaction.id === "service-pickup")?.label || "",
      displayLabel: display.label,
      diagnosisMarkup,
    };
  })()`);

  assert.ok(result.initialLabels.includes("Ask client about symptoms"));
  assert.ok(result.initialLabels.includes("Inspect signal path"));
  assert.ok(result.initialLabels.includes("Inspect replacement gear"));
  assert.ok(result.initialLabels.includes("Choose service approach"));
  assert.deepEqual(result.evidenceIds, ["inline-coupler-path", "replacement-kit-fit", "client-symptom-timeline"]);
  assert.ok(result.knownConditionIds.includes("mislabeled-input"));
  assert.ok(result.knownConditionIds.includes("loose-mount-hardware"));
  assert.doesNotMatch(result.evidenceIds.join(" "), /display-failure-pattern/);
  assert.match(result.objective, /Gather another room finding|select a service approach/i);
  assert.equal(result.primaryId, "");
  assert.equal(result.clientTaskState.id, "completed");
  assert.equal(result.signalTaskState.id, "completed");
  assert.equal(result.pickupLabel, "Pick up replacement gear");
  assert.equal(result.displayLabel, "Choose service approach");
  assert.match(result.diagnosisMarkup, /Room Findings/i);
});

test("Conshohocken repair approaches unlock different verbs for different technician builds", () => {
  const result = readGameJson(`(() => {
    const definitions = getServiceRepairApproachDefinitions();
    const evidenceIds = new Set(getServiceDiagnosticEvidenceDefinitions().map((evidence) => evidence.id));
    const skillIds = new Set(getSkillDefinitions().map((skill) => skill.id));
    const traitIds = new Set(content.technicians.flatMap((technician) => technician.traits || []));
    [
      ...(content.characterCreator?.backgrounds || []),
      ...(content.characterCreator?.workStyles || []),
      ...(content.characterCreator?.traits || []),
    ].forEach((piece) => (piece.traits || []).forEach((traitId) => traitIds.add(traitId)));

    const buildMethods = {};
    content.technicians.forEach((technician) => {
      Object.assign(state, createInitialState());
      state.technician = technician;
      state.tools = uniqueValues(["screwdriver", ...(technician.startingTools || [])]);
      state.sceneId = "serviceOffice";
      state.flags.currentAreaId = "serviceOffice";
      state.flags.serviceDiagnosticEvidence = getServiceDiagnosticEvidenceDefinitions()
        .map((evidence) => ({ id: evidence.id, source: "Unit findings", clock: "" }));
      buildMethods[technician.id] = getServiceRepairApproachStatuses()
        .filter((status) => status.available && status.approach.branchLabel !== "Universal")
        .map((status) => status.approach.id);
    });

    Object.assign(state, createInitialState());
    state.technician = content.technicians.find((technician) => technician.id === "wiley");
    state.tools = uniqueValues(["screwdriver", ...(state.technician.startingTools || [])]);
    state.sceneId = "serviceOffice";
    state.flags.currentAreaId = "serviceOffice";
    state.flags.serviceBrief = true;
    state.flags.serviceInspected = true;
    state.flags.serviceRoomConditions = ["loose-mount-hardware"];
    state.flags.serviceKnownRoomConditions = ["loose-mount-hardware"];
    state.flags.serviceDiagnosticEvidence = [
      { id: "display-failure-pattern", source: "Display", clock: "" },
      { id: "replacement-kit-fit", source: "Gear", clock: "" },
    ];
    chooseServiceRepairMethod("stage-clean-swap");
    const stagedCheck = getServiceAdjustedCheck(getServiceInstallCheck(["replacement-display"]));
    const stagedModifier = stagedCheck.taskModifiers.find((modifier) => modifier.id === "service-repair-stage-clean-swap");
    const stagedState = {
      method: state.flags.serviceRepairMethod,
      canonical: state.flags.serviceApproach,
      modifier: stagedModifier,
    };

    Object.assign(state, createInitialState());
    state.technician = content.technicians.find((technician) => technician.id === "morgan");
    state.tools = uniqueValues(["screwdriver", ...(state.technician.startingTools || [])]);
    state.sceneId = "serviceOffice";
    state.flags.currentAreaId = "serviceOffice";
    state.flags.serviceBrief = true;
    state.flags.serviceInspected = true;
    state.flags.serviceRoomConditions = ["client-time-pressure"];
    state.flags.serviceKnownRoomConditions = ["client-time-pressure"];
    state.flags.serviceDiagnosticEvidence = [
      { id: "client-symptom-timeline", source: "Client", clock: "" },
      { id: "display-failure-pattern", source: "Display", clock: "" },
    ];
    chooseServiceRepairMethod("negotiate-verification-window");
    const socialResult = state.flags.fieldTaskResults?.["service-signal-path"];
    const socialState = {
      method: state.flags.serviceRepairMethod,
      canonical: state.flags.serviceApproach,
      skillId: socialResult?.skillId || "",
      modifierIds: (socialResult?.modifiersApplied || []).map((modifier) => modifier.id),
      clientPressureControlled: Boolean(state.flags.serviceConditionResolutions?.["client-time-pressure"]?.controlled),
    };

    return {
      definitionCount: definitions.length,
      uniqueCount: new Set(definitions.map((approach) => approach.id)).size,
      referencesValid: definitions.every((approach) => (
        ["verify", "rush"].includes(approach.canonicalApproach)
        && (approach.requiredEvidenceIds || []).every((id) => evidenceIds.has(id))
        && (approach.unlockAny || []).every((requirement) => (
          !requirement.skillId || skillIds.has(requirement.skillId)
        ) && (
          !requirement.toolId || Boolean(content.tools[requirement.toolId])
        ) && (
          !requirement.traitId || traitIds.has(requirement.traitId)
        ))
      )),
      buildMethods,
      stagedState,
      socialState,
    };
  })()`);

  assert.equal(result.definitionCount, 6);
  assert.equal(result.uniqueCount, result.definitionCount);
  assert.equal(result.referencesValid, true);
  assert.ok(result.buildMethods["prototype-tech"].includes("negotiate-verification-window"));
  assert.ok(result.buildMethods["organized-rookie"].includes("label-and-prove-path"));
  assert.ok(result.buildMethods.wiley.includes("isolate-coupler"));
  assert.ok(result.buildMethods.wiley.includes("stage-clean-swap"));
  assert.ok(result.buildMethods.jordan.includes("isolate-coupler"));
  assert.ok(result.buildMethods.jordan.includes("label-and-prove-path"));
  assert.deepEqual(result.buildMethods.morgan, ["negotiate-verification-window"]);
  assert.equal(result.stagedState.method, "stage-clean-swap");
  assert.equal(result.stagedState.canonical, "rush");
  assert.equal(result.stagedState.modifier.statDelta, 2);
  assert.equal(result.stagedState.modifier.energyDelta, -2);
  assert.equal(result.socialState.method, "negotiate-verification-window");
  assert.equal(result.socialState.canonical, "verify");
  assert.equal(result.socialState.skillId, "clientCommunication");
  assert.ok(result.socialState.modifierIds.includes("service-repair-negotiate-verification-window"));
  assert.equal(result.socialState.clientPressureControlled, true);
});

test("Conshohocken appointment pressure trades diagnostic certainty for client time", () => {
  const result = readGameJson(`(() => {
    Object.assign(state, createInitialState());
    state.technician = content.technicians.find((technician) => technician.id === "prototype-tech");
    state.sceneId = "serviceOffice";
    state.flags.currentAreaId = "serviceOffice";
    state.clock = "TUE 9:14 AM";
    const calm = getServiceAppointmentPhase();
    const firstSpend = spendServiceActionTime("unit-display", 25, "Unit display inspection");
    const repeatedSpend = spendServiceActionTime("unit-display", 25, "Repeated unit display inspection");
    const clockAfterRepeat = state.clock;

    state.clock = "TUE 11:15 AM";
    const tight = getServiceAppointmentPhase();
    const tightCheck = getServiceAdjustedCheck(getServiceCheckById("signal-path"));
    state.clock = "TUE 1:05 PM";
    const late = getServiceAppointmentPhase();
    const lateCheck = getServiceAdjustedCheck(getServiceCheckById("signal-path"));
    state.flags.serviceRoomConditions = ["client-time-pressure"];
    state.flags.serviceKnownRoomConditions = ["client-time-pressure"];
    const incident = getServiceRiskyRepairIncident(getServiceRepairApproachById("ticket-swap"), 0);

    Object.assign(state, createInitialState());
    state.technician = content.technicians.find((technician) => technician.id === "morgan");
    state.sceneId = "serviceOffice";
    state.flags.currentAreaId = "serviceOffice";
    state.clock = "TUE 10:45 AM";
    state.flags.serviceRoomConditions = ["client-time-pressure"];
    state.flags.serviceKnownRoomConditions = ["client-time-pressure"];
    const beforeNegotiation = getServiceAppointmentPhase();
    applyServiceRepairMethodImmediateEffects(getServiceRepairApproachById("negotiate-verification-window"));
    const afterNegotiation = getServiceAppointmentPhase();

    const migrated = migrateSavedGame({
      version: 26,
      technicianId: "prototype-tech",
      sceneId: "serviceOffice",
      flags: {
        serviceRepairMethod: "negotiate-verification-window",
        serviceAppointmentExtensionMinutes: 500,
        serviceTimedActions: [
          { id: "display", minutes: 25, label: "Display", clockBefore: "TUE 9:14 AM", clockAfter: "TUE 9:39 AM" },
          { id: "display", minutes: 999 },
          null,
          { id: "signal", minutes: -4 },
        ],
      },
    });
    const staleExtension = migrateSavedGame({
      version: 26,
      technicianId: "prototype-tech",
      sceneId: "serviceOffice",
      flags: { serviceRepairMethod: "ticket-swap", serviceAppointmentExtensionMinutes: 30 },
    });

    return {
      phaseIds: [calm.id, tight.id, late.id],
      firstSpend,
      repeatedSpend,
      clockAfterRepeat,
      timedActionCount: getServiceTimedActionEntries().length,
      tightModifier: tightCheck.taskModifiers.find((modifier) => modifier.id === "service-appointment-tight"),
      lateModifier: lateCheck.taskModifiers.find((modifier) => modifier.id === "service-appointment-late"),
      incident,
      beforeNegotiation: beforeNegotiation.id,
      afterNegotiation: afterNegotiation.id,
      extension: state.flags.serviceAppointmentExtensionMinutes,
      migratedActions: migrated.flags.serviceTimedActions,
      migratedExtension: migrated.flags.serviceAppointmentExtensionMinutes,
      staleExtension: staleExtension.flags.serviceAppointmentExtensionMinutes || 0,
    };
  })()`);

  assert.deepEqual(result.phaseIds, ["calm", "tight", "late"]);
  assert.equal(result.firstSpend.clockAfter, "TUE 9:39 AM");
  assert.deepEqual(result.repeatedSpend, result.firstSpend);
  assert.equal(result.clockAfterRepeat, "TUE 9:39 AM");
  assert.equal(result.tightModifier.energyDelta, 1);
  assert.equal(result.lateModifier.statDelta, -1);
  assert.equal(result.incident.happened, true);
  assert.equal(result.incident.phase.id, "late");
  assert.match(result.incident.detail, /waiting meeting|visible dropout/i);
  assert.equal(result.beforeNegotiation, "tight");
  assert.equal(result.afterNegotiation, "calm");
  assert.equal(result.extension, 30);
  assert.deepEqual(result.migratedActions.map((entry) => [entry.id, entry.minutes]), [["display", 25], ["signal", 0]]);
  assert.equal(result.migratedExtension, 60);
  assert.equal(result.staleExtension, 0);
});

test("Conshohocken final verification can confirm, expose, recover, or inherit room risk", () => {
  const result = readGameJson(`(() => {
    const prepare = ({ approach = "verify", clock = "TUE 10:30 AM", strainedInstall = false } = {}) => {
      Object.assign(state, createInitialState());
      state.technician = content.technicians.find((technician) => technician.id === "prototype-tech");
      state.tools = ["screwdriver"];
      state.sceneId = "serviceOffice";
      state.flags.currentAreaId = "serviceOffice";
      state.clock = clock;
      state.flags.serviceBrief = true;
      state.flags.serviceInspected = true;
      state.flags.serviceApproach = approach;
      state.flags.serviceRepairMethod = approach === "verify" ? "verify-path" : "ticket-swap";
      state.flags.serviceInstallStrained = strainedInstall;
      state.flags.serviceRoomConditions = ["mislabeled-input"];
      state.flags.serviceKnownRoomConditions = ["mislabeled-input"];
      state.flags.serviceConditionResolutions = {
        "mislabeled-input": { conditionId: "mislabeled-input", controlled: true },
      };
      state.serviceInstalled = content.serviceDispatch.swapItems.map((item) => item.id);
    };

    prepare();
    resolveServiceFinalVerification("full");
    const confirmed = {
      result: { ...getServiceFinalVerification() },
      fieldTask: state.flags.fieldTaskResults?.["service-final-verification"],
      primaryId: getPrimaryInteraction()?.id || "",
      objective: resolveCurrentObjective().text,
    };

    prepare({ approach: "verify", strainedInstall: true });
    state.technician = content.technicians.find((technician) => technician.id === "jordan");
    resolveServiceFinalVerification("full");
    const provenInstall = {
      status: getServiceFinalVerification()?.status || "",
      installStrained: Boolean(state.flags.serviceInstallStrained),
    };

    prepare({ approach: "rush", clock: "TUE 1:05 PM", strainedInstall: true });
    resolveServiceFinalVerification("full");
    const exposedBefore = {
      result: { ...getServiceFinalVerification() },
      incidents: getServiceRoomIncidentEntries().length,
      recoverable: getRecoverableServiceRoomIncidents().length,
    };
    const fullIncidentId = getServiceRoomIncidentId(getServiceRoomIncidentEntries()[0], 0);
    resolveServiceIncidentRecovery(fullIncidentId, "document");
    const documented = {
      result: { ...getServiceFinalVerification() },
      safe: isServiceFinalVerificationSafe(),
      recoverable: getRecoverableServiceRoomIncidents().length,
      openIncidents: getOpenServiceRoomIncidents().length,
    };

    prepare({ approach: "rush", clock: "TUE 11:30 AM" });
    resolveServiceFinalVerification("quick", 0);
    const quickFailure = {
      result: { ...getServiceFinalVerification() },
      incident: getServiceRoomIncidentEntries()[0],
    };

    prepare({ approach: "verify", clock: "TUE 12:20 PM" });
    resolveServiceFinalVerification("skip");
    const clockBeforeCloseout = state.clock;
    showServiceResults();
    const firstCloseout = {
      clock: state.clock,
      cash: state.cash,
      jobs: state.jobsCompleted,
      risk: state.flags.returnTripRisks?.conshohockenServiceRoomPressure,
      summary: state.flags.lastJobSiteCloseoutSummary,
      final: { ...getServiceFinalVerification() },
    };
    showServiceResults();
    const repeatCloseout = { cash: state.cash, jobs: state.jobsCompleted, clock: state.clock };

    const migrated = migrateSavedGame({
      version: 27,
      technicianId: "prototype-tech",
      sceneId: "serviceOffice",
      flags: {
        serviceComplete: true,
        serviceApproach: "rush",
        serviceFinalVerification: { id: "removed", status: "impossible" },
      },
    });

    return {
      confirmed,
      provenInstall,
      exposedBefore,
      documented,
      quickFailure,
      clockBeforeCloseout,
      firstCloseout,
      repeatCloseout,
      migratedFinal: migrated.flags.serviceFinalVerification,
    };
  })()`);

  assert.equal(result.confirmed.result.status, "confirmed");
  assert.equal(result.confirmed.fieldTask.successful, true);
  assert.equal(result.confirmed.primaryId, "service-client");
  assert.match(result.confirmed.objective, /close out the service call/i);
  assert.equal(result.provenInstall.status, "confirmed");
  assert.equal(result.provenInstall.installStrained, false);
  assert.equal(result.exposedBefore.result.status, "weak");
  assert.equal(result.exposedBefore.incidents, 1);
  assert.equal(result.exposedBefore.recoverable, 1);
  assert.equal(result.documented.result.status, "documented");
  assert.equal(result.documented.safe, false);
  assert.equal(result.documented.recoverable, 0);
  assert.equal(result.documented.openIncidents, 1);
  assert.equal(result.quickFailure.result.status, "weak");
  assert.equal(result.quickFailure.incident.conditionId, "final-verification");
  assert.match(result.quickFailure.incident.detail, /drops|diagnosis/i);
  assert.equal(result.firstCloseout.final.status, "skipped");
  assert.ok(result.firstCloseout.risk);
  assert.match(result.firstCloseout.summary.result, /Final test: Room handed back unverified/i);
  assert.notEqual(result.firstCloseout.clock, result.clockBeforeCloseout);
  assert.deepEqual(result.repeatCloseout, {
    cash: result.firstCloseout.cash,
    jobs: result.firstCloseout.jobs,
    clock: result.firstCloseout.clock,
  });
  assert.equal(result.migratedFinal.id, "legacy");
  assert.equal(result.migratedFinal.status, "skipped");
});

test("Conshohocken diagnostic evidence is data-backed, idempotent, and save-safe", () => {
  const result = readGameJson(`(() => {
    Object.assign(state, createInitialState());
    state.technician = content.technicians.find((technician) => technician.id === "prototype-tech");
    state.sceneId = "serviceOffice";
    state.flags.currentAreaId = "serviceOffice";
    state.clock = "TUE 10:14 AM";
    const definitions = getServiceDiagnosticEvidenceDefinitions();
    const conditionIds = new Set(content.serviceDispatch.roomConditions.map((condition) => condition.id));
    const first = discoverServiceDiagnosticEvidence("client-symptom-timeline", "Client conversation");
    const repeated = discoverServiceDiagnosticEvidence("client-symptom-timeline", "Repeated conversation");
    const invalid = discoverServiceDiagnosticEvidence("not-a-real-finding", "Invalid source");
    const saved = migrateSavedGame(JSON.parse(JSON.stringify(serializeGame())));
    const missing = migrateSavedGame({
      version: 1,
      technicianId: "prototype-tech",
      sceneId: "shop",
      flags: {},
    });
    const dirty = migrateSavedGame({
      version: 1,
      technicianId: "prototype-tech",
      sceneId: "serviceOffice",
      flags: {
        serviceRepairMethod: "removed-method",
        serviceDiagnosticEvidence: [
          "display-failure-pattern",
          { id: "display-failure-pattern", source: "Duplicate" },
          { id: "stale-finding", source: "Old build" },
          null,
        ],
      },
    });
    const legacyProgress = migrateSavedGame({
      version: 24,
      technicianId: "prototype-tech",
      sceneId: "serviceOffice",
      flags: {
        serviceClientContext: true,
        serviceInspected: true,
        serviceApproach: "verify",
      },
    });
    return {
      definitions,
      allConditionReferencesValid: definitions.every((evidence) => evidence.conditionIds.every((conditionId) => conditionIds.has(conditionId))),
      allSkillsValid: definitions.every((evidence) => Boolean(getSkillDefinition(evidence.skillId))),
      uniqueDefinitionCount: new Set(definitions.map((evidence) => evidence.id)).size,
      first,
      repeated,
      invalid,
      liveEntries: getServiceDiagnosticEvidenceEntries(),
      state: getServiceDiagnosticEvidenceState("client-symptom-timeline"),
      savedEntries: saved.flags.serviceDiagnosticEvidence,
      missingEntries: missing.flags.serviceDiagnosticEvidence,
      dirtyEntries: dirty.flags.serviceDiagnosticEvidence,
      dirtyRepairMethod: dirty.flags.serviceRepairMethod || "",
      legacyEntries: legacyProgress.flags.serviceDiagnosticEvidence,
      legacyRepairMethod: legacyProgress.flags.serviceRepairMethod,
    };
  })()`);

  assert.equal(result.definitions.length, 4);
  assert.equal(result.uniqueDefinitionCount, result.definitions.length);
  assert.equal(result.allConditionReferencesValid, true);
  assert.equal(result.allSkillsValid, true);
  result.definitions.forEach((definition) => {
    assert.ok(definition.label.length > 4);
    assert.ok(definition.summary.length > 20);
    assert.match(definition.interactionId, /^service-/);
  });
  assert.equal(result.first.id, "client-symptom-timeline");
  assert.deepEqual(result.repeated, result.first);
  assert.equal(result.invalid, null);
  assert.equal(result.liveEntries.length, 1);
  assert.equal(result.state.discovered, true);
  assert.equal(result.state.entry.source, "Client conversation");
  assert.equal(result.state.entry.clock, "TUE 10:14 AM");
  assert.deepEqual(result.savedEntries, result.liveEntries);
  assert.deepEqual(result.missingEntries, []);
  assert.deepEqual(result.dirtyEntries.map((entry) => entry.id), ["display-failure-pattern"]);
  assert.equal(result.dirtyRepairMethod, "");
  assert.deepEqual(result.legacyEntries.map((entry) => entry.id), [
    "client-symptom-timeline",
    "display-failure-pattern",
    "inline-coupler-path",
  ]);
  assert.equal(result.legacyRepairMethod, "verify-path");
});

test("Secret Squirrel copy keeps the mystery shelf joke understandable", () => {
  const result = readGameJson(`(() => {
    const returns = content.warehouseDispatch.checks.find((check) => check.id === "returns");
    return {
      label: returns.label,
      riskLabel: returns.riskLabel,
      successText: returns.successText,
      detail: returns.detail,
    };
  })()`);

  assert.match(result.label, /Secret Squirrel/);
  assert.match(result.riskLabel, /Secret Squirrel mystery shelf/);
  assert.match(result.successText, /mystery-return problem/);
  assert.match(result.detail, /mystery-return shelf/);
});

const failures = [];

tests.forEach(({ name, fn }) => {
  try {
    fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    failures.push({ name, error });
    console.error(`not ok - ${name}`);
    console.error(error.stack || error.message);
  }
});

if (failures.length) {
  console.error(`Unit QA failed: ${failures.length}/${tests.length} checks failed.`);
  process.exit(1);
}

console.log(`Unit QA passed: ${tests.length} checks.`);
