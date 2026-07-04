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
      if (!["In progress", "Active board item", "Blocked", "Complete", "Locked"].includes(entry.boardStatus)) {
        failures.push("resolved board entry " + entry.id + " has invalid boardStatus " + entry.boardStatus);
      }
      if (entry.routeId && !entry.route) failures.push("resolved board entry " + entry.id + " lost route lookup");
    });
    return failures;
  })()`);

  assert.deepEqual(failures, []);
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
