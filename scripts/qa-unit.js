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
