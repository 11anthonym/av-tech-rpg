#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

function loadPlaywright() {
  try {
    return require("playwright");
  } catch (error) {
    console.error("Playwright is required for this smoke test.");
    console.error("Run from a Codex runtime with Playwright on NODE_PATH, or install Playwright outside the repo.");
    console.error(error.message);
    process.exit(1);
  }
}

function getChromeExecutablePath() {
  if (process.env.CHROME_EXECUTABLE_PATH) return process.env.CHROME_EXECUTABLE_PATH;
  const candidates = process.platform === "win32"
    ? [
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
      ]
    : [
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "/usr/bin/google-chrome",
        "/usr/bin/chromium-browser",
        "/usr/bin/chromium",
      ];
  return candidates.find((candidate) => fs.existsSync(candidate));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function assertModalIncludes(page, expected, context) {
  const body = await page.locator("#modal-backdrop").innerText();
  const normalizedBody = body.toLowerCase();
  for (const text of expected) {
    assert(normalizedBody.includes(text.toLowerCase()), `${context}: expected modal to include "${text}"`);
  }
}

async function clickButton(page, name) {
  await page.getByRole("button", { name }).click();
}

(async () => {
  const { chromium } = loadPlaywright();
  const projectRoot = path.resolve(__dirname, "..");
  const url = `${pathToFileURL(path.join(projectRoot, "index.html")).href}?debug`;
  const executablePath = getChromeExecutablePath();
  const browser = await chromium.launch({
    headless: true,
    ...(executablePath ? { executablePath } : {}),
  });
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") pageErrors.push(message.text());
  });

  try {
    await page.goto(url);
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => window.AV_TECH_RPG_READY === true);

    assert(await page.locator("#title-screen").isVisible(), "Title screen should render");
    await clickButton(page, "New Career");
    const rosterText = await page.locator("#technician-grid").innerText();
    for (const name of ["Alex", "Casey", "Wiley", "Jordan", "Morgan", "Custom Technician Creator"]) {
      assert(rosterText.includes(name), `Roster should include ${name}`);
    }

    await clickButton(page, "Create Custom Technician");
    await assertModalIncludes(page, ["Build Your First Tech", "Start Custom Career"], "custom creator");
    await page.locator("#creator-name").click();
    await page.keyboard.press(process.platform === "darwin" ? "Meta+A" : "Control+A");
    await page.keyboard.type("Drew Wade");
    assert(await page.locator("#creator-name").inputValue() === "Drew Wade", "Custom creator should allow spaces and movement-key letters in names");
    assert((await page.locator("#creator-preview").innerText()).includes("Drew Wade"), "Custom creator preview should show full custom name");
    await clickButton(page, "Start Custom Career");
    await page.waitForSelector("#game-layout:not(.hidden)");
    assert((await page.locator("#tech-name").innerText()).includes("Drew Wade"), "Custom technician should start with full custom name");
    const savedCustomName = await page.evaluate(() => JSON.parse(localStorage.getItem("av-tech-rpg-save-v1"))?.customTechnician?.name || "");
    assert(savedCustomName === "Drew Wade", "Custom save payload should preserve full custom name");

    const premadeStarts = await page.evaluate(() => {
      return window.GAME_CONTENT.technicians.map((technician) => {
        window.startGame(technician.id);
        return {
          id: technician.id,
          expectedName: technician.name,
          renderedName: document.querySelector("#tech-name")?.textContent || "",
          objective: document.querySelector("#objective")?.textContent || "",
        };
      });
    });
    for (const start of premadeStarts) {
      assert(start.renderedName.includes(start.expectedName), `${start.expectedName} should start correctly`);
      assert(start.objective.trim().length > 0, `${start.expectedName} should have a current objective`);
    }

    async function captureLayout(viewport) {
      await page.setViewportSize(viewport);
      return page.evaluate(() => {
        window.startGame("prototype-tech");
        const state = window.AV_TECH_RPG_DEBUG.state;
        state.flags.shopBrief = true;
        state.loaded = [...window.GAME_CONTENT.tutorial.shopLoad];
        window.render();
        const rect = (selector) => {
          const box = document.querySelector(selector)?.getBoundingClientRect();
          return box ? { width: Math.round(box.width), height: Math.round(box.height) } : { width: 0, height: 0 };
        };
        const shell = {
          scene: rect("#scene"),
          leftPanel: rect(".hud-panel"),
          rightPanel: rect(".task-panel"),
          scrollHeight: document.documentElement.scrollHeight,
          viewportHeight: window.innerHeight,
          objectiveFontWeight: Number.parseInt(getComputedStyle(document.querySelector("#objective")).fontWeight, 10),
          objectiveBorderLeft: Number.parseInt(getComputedStyle(document.querySelector("#objective")).borderLeftWidth, 10),
        };
        window.showRegionalMap();
        const modal = rect(".modal-card");
        const emphasized = {
          currentStep: Boolean(document.querySelector(".modal-list .current-step-next.modal-row-priority")),
          launchableRoute: Boolean(document.querySelector(".modal-list .route-card-active, .modal-list .route-card-available")),
          importantRows: document.querySelectorAll(".modal-list .modal-row-priority, .modal-list .modal-row-pressure, .modal-list .modal-row-risk, .modal-list .modal-row-warning").length,
        };
        window.closeModal();
        return { shell, modal, emphasized };
      });
    }

    const compactLayout = await captureLayout({ width: 1366, height: 900 });
    const wideLayout = await captureLayout({ width: 1920, height: 1080 });
    await page.setViewportSize({ width: 1366, height: 900 });
    assert(compactLayout.shell.scene.width === 780 && compactLayout.modal.width >= 860, "Compact desktop layout should keep the playable scene stable and widen modals");
    assert(compactLayout.shell.scrollHeight <= compactLayout.shell.viewportHeight + 1, "Compact desktop layout should not create a tall document page");
    assert(wideLayout.shell.scene.width === 960, "Wide desktop layout should show the full 960px map view");
    assert(wideLayout.shell.leftPanel.width >= 240 && wideLayout.shell.rightPanel.width >= 320, "Wide desktop layout should widen both side panels");
    assert(wideLayout.modal.width >= 1000, "Wide desktop modal should use more horizontal space");
    assert(wideLayout.shell.scrollHeight <= wideLayout.shell.viewportHeight + 1, "Wide desktop layout should fit inside the viewport height");
    assert(compactLayout.shell.objectiveFontWeight >= 700 && compactLayout.shell.objectiveBorderLeft >= 3, "Current objective should be visually emphasized in the scene header");
    assert(compactLayout.emphasized.currentStep && compactLayout.emphasized.launchableRoute && compactLayout.emphasized.importantRows >= 2, "Regional map should emphasize current step, launchable route, and important rows");

    const energyMeterReset = await page.evaluate(() => {
      window.startGame("prototype-tech");
      const state = window.AV_TECH_RPG_DEBUG.state;
      state.energy = 0;
      state.flags.energyExhaustedThisShift = true;
      window.render();
      const dangerBefore = document.querySelector("#energy-meter")?.classList.contains("energy-danger") || false;
      window.startGame("prototype-tech");
      return {
        dangerBefore,
        dangerAfter: document.querySelector("#energy-meter")?.classList.contains("energy-danger") || false,
        energy: state.energy,
      };
    });
    assert(energyMeterReset.dangerBefore, "Energy meter should show danger at zero energy");
    assert(!energyMeterReset.dangerAfter && energyMeterReset.energy > 0, "Fresh start should clear stale energy-danger meter state");

    const cartAssemblyTask = await page.evaluate(() => {
      window.startGame("prototype-tech");
      const state = window.AV_TECH_RPG_DEBUG.state;
      window.enterScene("client");
      state.flags.roomBrief = true;
      state.carry = ["cart-1-frame"];
      const beforeEnergy = state.energy;
      window.installCartPart("cart1");
      const modalText = document.querySelector("#modal-backdrop")?.innerText || "";
      const result = state.flags.fieldTaskResults?.["cart-cart-1-frame"];
      return {
        assembled: state.assembled.includes("cart-1-frame"),
        resultSaved: Boolean(result),
        resultType: result?.type || "",
        resultSkill: result?.skillId || "",
        energyChanged: state.energy !== beforeEnergy,
        showsResultRows: modalText.includes("Task type") && modalText.includes("Risk tracked") && modalText.includes("frame alignment"),
      };
    });
    assert(cartAssemblyTask.assembled, "Tutorial cart assembly should keep assembled progress");
    assert(cartAssemblyTask.resultSaved, "Tutorial cart assembly should save field-task result data");
    assert(cartAssemblyTask.resultType === "cart frame assembly", "Tutorial cart assembly should use data-backed task type");
    assert(cartAssemblyTask.resultSkill === "install", "Tutorial cart assembly should use data-backed skill");
    assert(cartAssemblyTask.energyChanged, "Tutorial cart assembly should affect energy");
    assert(cartAssemblyTask.showsResultRows, "Tutorial cart assembly should show structured result rows");

    const tutorialPressureGameplay = await page.evaluate(() => {
      window.startGame("prototype-tech");
      const state = window.AV_TECH_RPG_DEBUG.state;
      window.enterScene("client");
      state.flags.roomBrief = true;
      state.flags.supervisorLeft = true;
      state.flags.tutorialInstallPressureId = "cable-bag-mismatch";
      window.ensureTutorialInstallPressure();
      state.carry = ["cart-2-display"];
      const labels = window.getInteractions().map((interaction) => interaction.label);
      const objective = window.getObjective();
      const basePart = window.GAME_CONTENT.tutorial.assembly.find((item) => item.id === "cart-2-display");
      const beforeAdjusted = window.getTutorialAdjustedAssemblyPart(basePart);
      window.showTutorialInstallPressureChoice();
      const choiceText = document.querySelector("#modal-backdrop")?.innerText || "";
      const beforeEnergy = state.energy;
      window.resolveTutorialInstallPressureResponse("cable-bag-mismatch", "sort-labels");
      const carefulText = document.querySelector("#modal-backdrop")?.innerText || "";
      const afterAdjusted = window.getTutorialAdjustedAssemblyPart(basePart);
      const carefulResolution = state.flags.tutorialInstallPressureResolution;

      window.startGame("prototype-tech");
      const quickState = window.AV_TECH_RPG_DEBUG.state;
      window.enterScene("client");
      quickState.flags.roomBrief = true;
      quickState.flags.supervisorLeft = true;
      quickState.flags.tutorialInstallPressureId = "cable-bag-mismatch";
      window.ensureTutorialInstallPressure();
      window.resolveTutorialInstallPressureResponse("cable-bag-mismatch", "match-by-memory", 0.1);
      const quickText = document.querySelector("#modal-backdrop")?.innerText || "";
      const quickResolution = quickState.flags.tutorialInstallPressureResolution;
      quickState.assembled = window.GAME_CONTENT.tutorial.assembly.map((item) => item.id);
      quickState.energy = 80;
      window.finishJob("rush");
      const quickCloseoutText = document.querySelector("#modal-backdrop")?.innerText || "";
      const quickRiskSaved = Boolean(quickState.flags.returnTripRisks?.centerCityCartPressure);
      const quickCallbackRisk = Boolean(quickState.flags.tutorialInstallPressureCallbackRisk);

      window.startGame("prototype-tech");
      const tidyState = window.AV_TECH_RPG_DEBUG.state;
      window.enterScene("client");
      tidyState.flags.roomBrief = true;
      tidyState.flags.supervisorLeft = true;
      tidyState.flags.tutorialInstallPressureId = "cable-bag-mismatch";
      window.ensureTutorialInstallPressure();
      tidyState.assembled = window.GAME_CONTENT.tutorial.assembly.map((item) => item.id);
      tidyState.energy = 80;
      window.finishJob("tidy");
      const tidyText = document.querySelector("#modal-backdrop")?.innerText || "";
      const tidyResolution = tidyState.flags.tutorialInstallPressureResolution;

      return {
        labels,
        objective,
        choiceText,
        beforeDifficulty: beforeAdjusted.difficulty,
        afterDifficulty: afterAdjusted.difficulty,
        carefulEnergyChanged: state.energy !== beforeEnergy,
        carefulText,
        carefulResolution,
        quickText,
        quickResolution,
        quickRiskSaved,
        quickCallbackRisk,
        quickCloseoutText,
        tidyText,
        tidyResolution,
        tidyRiskSaved: Boolean(tidyState.flags.returnTripRisks?.centerCityCartPressure),
      };
    });
    assert(tutorialPressureGameplay.labels.includes("Handle cart pressure"), "First-day pressure should create a visible room decision");
    assert(tutorialPressureGameplay.objective.includes("first-day cart pressure"), "Current objective should point to first-day pressure");
    assert(tutorialPressureGameplay.choiceText.includes("bad guess will show up"), "First-day quick pressure option should show qualitative incident risk");
    assert(tutorialPressureGameplay.beforeDifficulty > tutorialPressureGameplay.afterDifficulty, "Careful first-day pressure response should remove adjusted task pressure");
    assert(tutorialPressureGameplay.carefulEnergyChanged, "Careful first-day pressure response should spend energy now");
    assert(tutorialPressureGameplay.carefulText.includes("Pressure Controlled") && tutorialPressureGameplay.carefulResolution?.controlled, "Careful first-day pressure response should save controlled state");
    assert(tutorialPressureGameplay.quickText.includes("The Room Notices") && tutorialPressureGameplay.quickResolution?.incident, "Failed first-day quick response should create visible room pressure");
    assert(tutorialPressureGameplay.quickRiskSaved && tutorialPressureGameplay.quickCallbackRisk, "Rushed first-day pressure should save Center City return-trip risk");
    assert(tutorialPressureGameplay.quickCloseoutText.includes("Open return-trip risks"), "Rushed first-day pressure closeout should show return-trip consequence");
    assert(tutorialPressureGameplay.tidyText.includes("caught during careful closeout") && tutorialPressureGameplay.tidyResolution?.controlledAtCloseout, "Tidy first-day closeout should control unresolved pressure");
    assert(!tutorialPressureGameplay.tidyRiskSaved, "Tidy first-day closeout should not save Center City pressure risk");

    const tutorialCloseoutDelta = await page.evaluate(() => {
      window.startGame("wiley");
      const state = window.AV_TECH_RPG_DEBUG.state;
      window.enterScene("client");
      state.flags.roomBrief = true;
      state.assembled = window.GAME_CONTENT.tutorial.assembly.map((item) => item.id);
      state.energy = 80;
      state.cash = 0;
      window.finishJob("wiley-workaround");
      const modalText = document.querySelector("#modal-backdrop")?.innerText || "";
      return {
        modalText,
        callbackCount: state.stats.callbacks,
        returnRiskCount: Object.keys(state.flags.returnTripRisks || {}).length,
        cash: state.cash,
        xp: state.xp,
      };
    });
    const tutorialCloseoutText = tutorialCloseoutDelta.modalText.toLowerCase();
    assert(tutorialCloseoutText.includes("what changed"), "First-day closeout should show a changed-state summary");
    assert(tutorialCloseoutDelta.modalText.includes("Cash") && tutorialCloseoutDelta.modalText.includes("XP"), "First-day closeout delta should show reward changes");
    assert(tutorialCloseoutDelta.modalText.includes("Client reputation") && tutorialCloseoutDelta.modalText.includes("Management reputation"), "First-day closeout delta should show reputation changes");
    assert(tutorialCloseoutDelta.modalText.includes("Open callbacks") && tutorialCloseoutDelta.modalText.includes("Open return-trip risks"), "Risky first-day closeout delta should show callback and return-trip risk");
    assert(tutorialCloseoutDelta.callbackCount === 1 && tutorialCloseoutDelta.returnRiskCount === 1 && tutorialCloseoutDelta.cash === 141 && tutorialCloseoutDelta.xp === 40, "Wiley workaround closeout should preserve callback, risk, cash, and XP state");

    const movementPressure = await page.evaluate(() => {
      window.startGame("prototype-tech");
      const state = window.AV_TECH_RPG_DEBUG.state;
      const baseSpeed = window.getMovementSpeed();
      state.carry = ["cart-1-frame"];
      window.render();
      const carrySpeed = window.getMovementSpeed();
      const carryCard = document.querySelector("#carry-card")?.innerText || "";
      const carryTaskCopy = document.querySelector("#task-copy")?.textContent || "";
      state.energy = 0;
      state.flags.energyExhaustedThisShift = true;
      window.render();
      const exhaustedSpeed = window.getMovementSpeed();
      const exhaustedTaskCopy = document.querySelector("#task-copy")?.textContent || "";
      window.startGame({
        id: "smoke-bad-knees",
        name: "Smoke Bad Knees",
        custom: true,
        stats: { energy: 100, burnout: 0, craftsmanship: 2, confidence: 1 },
        characterStats: {},
        traits: ["badKnees"],
        startingTools: ["screwdriver"],
      });
      const kneeState = window.AV_TECH_RPG_DEBUG.state;
      kneeState.carry = ["cart-1-frame"];
      window.render();
      const badKneesCarrySpeed = window.getMovementSpeed();
      return {
        baseSpeed,
        carrySpeed,
        exhaustedSpeed,
        badKneesCarrySpeed,
        carryCard,
        carryTaskCopy,
        exhaustedTaskCopy,
      };
    });
    assert(movementPressure.baseSpeed === 8, "Base movement speed should remain stable");
    assert(movementPressure.carrySpeed < movementPressure.baseSpeed, "Carrying gear should slow movement");
    assert(movementPressure.exhaustedSpeed < movementPressure.carrySpeed, "Exhaustion should add movement pressure");
    assert(movementPressure.badKneesCarrySpeed < movementPressure.carrySpeed, "Bad knees should make loaded walks slower");
    assert(movementPressure.carryCard.includes("Condition pressure") && movementPressure.carryCard.includes("Carrying gear"), "Carry card should explain movement pressure");
    assert(movementPressure.carryTaskCopy.includes("Condition pressure") && movementPressure.carryTaskCopy.includes("Walk speed"), "Current-step guidance should show carry pressure");
    assert(movementPressure.exhaustedTaskCopy.includes("Exhausted"), "Current-step guidance should show exhaustion pressure");

    const currentStepBriefing = await page.evaluate(() => {
      window.startGame("prototype-tech");
      const state = window.AV_TECH_RPG_DEBUG.state;
      const initialText = document.querySelector("#task-copy")?.textContent || "";
      const initialFirstLabel = document.querySelector("#task-copy .current-step-list li:first-child strong")?.textContent || "";
      const initialNextCard = document.querySelector("#task-copy .current-step-next")?.textContent || "";
      state.flags.finished = true;
      state.flags.serviceStarted = true;
      state.flags.routeHistory = { conshohockenService: 1 };
      state.stats.callbacks = 1;
      state.flags.returnTripRisks = {};
      state.flags.returnTripRisks.systemsQuickReboot = {
        status: "open",
        source: "Smoke systems shortcut",
        cause: "Quick reboot skipped the mismatch note.",
        detail: "Future service inherits a thin diagnosis.",
      };
      state.flags.shiftPrepActive = true;
      state.energy = 18;
      state.burnout = 4;
      window.render();
      const consequenceText = document.querySelector("#task-copy")?.textContent || "";
      return { initialText, consequenceText, initialFirstLabel, initialNextCard };
    });
    assert(currentStepBriefing.initialText.includes("Next task") && currentStepBriefing.initialText.includes("Nearby cue"), "Current step panel should label the next action and nearby cue");
    assert(currentStepBriefing.initialFirstLabel === "Next task" && currentStepBriefing.initialNextCard.includes("Find your supervisor"), "Current step panel should make the next task the first prominent card");
    assert(currentStepBriefing.initialText.includes("Workday") && currentStepBriefing.initialText.includes("MON morning") && currentStepBriefing.initialText.includes("Energy 100/100"), "Current step panel should show daily rhythm state");
    assert(currentStepBriefing.initialText.includes("Route") && currentStepBriefing.initialText.includes("Locked: Talk to the supervisor"), "Current step panel should explain the initial locked route");
    assert(currentStepBriefing.initialText.includes("Consequences") && currentStepBriefing.initialText.includes("No open callback debt"), "Current step panel should show clean consequence state");
    assert(currentStepBriefing.consequenceText.includes("next-shift prep active") && currentStepBriefing.consequenceText.includes("low energy") && currentStepBriefing.consequenceText.includes("high burnout"), "Current step panel should expose daily pressure state");
    assert(currentStepBriefing.consequenceText.includes("Fast travel: Available now") && currentStepBriefing.consequenceText.includes("Driven before: Yes"), "Current step panel should expose route history and fast travel state");
    assert(currentStepBriefing.consequenceText.includes("Open: 1 callback") && currentStepBriefing.consequenceText.includes("return-trip risk"), "Current step panel should expose callback and return-trip debt");

    const conditionSkillPressure = await page.evaluate(() => {
      window.startGame("prototype-tech");
      const state = window.AV_TECH_RPG_DEBUG.state;
      const check = {
        id: "smoke-condition-pressure",
        label: "Smoke condition pressure",
        type: "diagnostic check",
        skillId: "install",
        difficulty: 2,
        energyCost: 1,
        riskLabel: "condition drift",
        successText: "The task stays steady.",
        strainedText: "The task inherits pressure from the shift.",
      };
      const base = window.getSkillCheckResult({ skillId: "install", difficulty: 2, contextId: "smoke-condition" });
      state.energy = 12;
      state.burnout = 4;
      const pressured = window.getSkillCheckResult({ skillId: "install", difficulty: 2, contextId: "smoke-condition" });
      const resultMarkup = window.getFieldTaskResultMarkup({ check, skillCheck: pressured, energyCost: 1 });
      window.recordFieldTaskResult({ flagKey: "smoke-condition-pressure", check, skillCheck: pressured, energyCost: 1 });
      const saved = state.flags.fieldTaskResults?.["smoke-condition-pressure"];
      const ledger = window.getFieldTaskResultLedgerMarkup();
      window.showCareerClipboard();
      const clipboardText = document.querySelector("#modal-backdrop")?.innerText || "";
      return {
        baseScore: base.score,
        pressuredScore: pressured.score,
        conditionPenalty: pressured.conditionPenalty,
        label: window.getSkillCheckLabel(pressured),
        resultMarkup,
        savedConditionText: saved?.conditionPressureText || "",
        ledger,
        clipboardText,
      };
    });
    assert(conditionSkillPressure.conditionPenalty === 2, "Low energy and high burnout should combine into a condition skill penalty");
    assert(conditionSkillPressure.pressuredScore === conditionSkillPressure.baseScore - 2, "Condition pressure should lower the skill score");
    assert(conditionSkillPressure.label.includes("condition -2"), "Skill-check label should name condition pressure");
    assert(conditionSkillPressure.resultMarkup.includes("Condition pressure") && conditionSkillPressure.resultMarkup.includes("-2 to skill checks"), "Field-task result rows should show condition pressure");
    assert(conditionSkillPressure.savedConditionText.includes("Low energy") && conditionSkillPressure.savedConditionText.includes("High burnout"), "Field-task result history should save condition pressure text");
    assert(conditionSkillPressure.ledger.includes("condition: Low energy, High burnout"), "Career field-task history should show condition pressure");
    assert(conditionSkillPressure.clipboardText.includes("Field condition pressure") && conditionSkillPressure.clipboardText.includes("-2 to skill checks"), "Career clipboard should show active field condition pressure");

    const actionPressurePreview = await page.evaluate(() => {
      window.startGame("prototype-tech");
      const state = window.AV_TECH_RPG_DEBUG.state;
      state.energy = 12;
      state.burnout = 4;
      const check = window.GAME_CONTENT.warehouseDispatch.checks.find((item) => item.id === "returns");
      const summary = window.getActionPressureSummary({
        check,
        baseEnergyCost: 2,
        includeSkill: true,
        includeLedger: true,
      });
      const previewMarkup = window.getFieldTaskPreviewMarkup([check]);
      const choiceMarkup = window.getChoicePressureMarkup([{ label: "Careful path", detail: "Spend effort now to reduce later risk." }]);
      window.enterScene("serviceOffice");
      state.energy = 12;
      state.burnout = 4;
      state.flags.serviceBrief = true;
      state.flags.serviceInspected = true;
      state.flags.serviceRoomConditions = ["client-time-pressure"];
      state.carry = ["replacement-display"];
      state.player = { x: 760, y: 305 };
      window.render();
      const nearby = document.querySelector("#nearby-card")?.textContent || "";
      const nearbyHighlighted = document.querySelector("#nearby-card")?.classList.contains("pressure-active") || false;
      return {
        summary,
        previewMarkup,
        choiceMarkup,
        nearby,
        nearbyHighlighted,
      };
    });
    assert(actionPressurePreview.summary.includes("Energy cost") && actionPressurePreview.summary.includes("Field condition") && actionPressurePreview.summary.includes("Skill fit"), "Action pressure summary should combine energy, condition, and skill fit");
    assert(actionPressurePreview.previewMarkup.includes("Pressure on this action") && actionPressurePreview.previewMarkup.includes("Condition"), "Field-task preview cards should show action pressure before the task");
    assert(actionPressurePreview.previewMarkup.includes("Task state: READY"), "Field-task preview cards should show task state before the task");
    assert(actionPressurePreview.choiceMarkup.includes("Pressure on this action") && actionPressurePreview.choiceMarkup.includes("Choice pressure"), "Choice pressure panels should include current action pressure");
    assert(actionPressurePreview.nearby.includes("State: READY") && actionPressurePreview.nearby.includes("Pressure on this action") && actionPressurePreview.nearby.includes("Condition") && actionPressurePreview.nearby.includes("Install 2 vs difficulty 4"), "Nearby card should preview state and pressure before interacting with a task object");
    assert(actionPressurePreview.nearbyHighlighted, "Nearby card should highlight active action pressure");

    const markerAffordances = await page.evaluate(() => {
      window.startGame("prototype-tech");
      const state = window.AV_TECH_RPG_DEBUG.state;
      state.flags.shopBrief = true;
      state.player = { x: 830, y: 380 };
      window.render();
      const shopMarkers = [...document.querySelectorAll(".interaction-marker")].map((marker) => ({
        text: marker.textContent,
        kind: marker.dataset.markerKind,
        placement: marker.dataset.markerPlacement,
        taskState: marker.dataset.taskState,
        title: marker.title,
      }));
      const checkMarker = [...document.querySelectorAll(".interaction-marker")].find((marker) => marker.textContent === "CHECK");
      const secretSquirrel = [...document.querySelectorAll(".decor")].find((item) => item.textContent.includes("SECRET SQUIRREL"));
      const markerRect = checkMarker?.getBoundingClientRect();
      const decorRect = secretSquirrel?.getBoundingClientRect();
      const checkMarkerOverlapsDecor = Boolean(markerRect && decorRect && markerRect.right > decorRect.left
        && markerRect.left < decorRect.right
        && markerRect.bottom > decorRect.top
        && markerRect.top < decorRect.bottom);
      state.flags.finished = true;
      state.flags.metJosh = true;
      window.render();
      const finishedShopMarkers = [...document.querySelectorAll(".interaction-marker")].map((marker) => ({
        text: marker.textContent,
        kind: marker.dataset.markerKind,
        title: marker.title,
      }));
      const vanNearby = document.querySelector("#nearby-card")?.textContent || "";
      const vanInteract = document.querySelector("#interact-button")?.textContent || "";
      const vanMarker = shopMarkers.find((marker) => marker.text === "VAN");
      window.enterScene("garage");
      state.flags.garageBrief = true;
      state.flags.centerCityEquipmentDelivered = true;
      state.player = { x: 116, y: 185 };
      window.render();
      const doorMarker = document.querySelector(".door-marker");
      const doorNearby = document.querySelector("#nearby-card")?.textContent || "";
      window.enterScene("serviceOffice");
      state.flags.serviceComplete = true;
      window.render();
      const returnMarker = document.querySelector(".return-portal-marker");
      return {
        shopMarkers,
        checkMarkerOverlapsDecor,
        finishedShopMarkers,
        vanNearby,
        vanInteract,
        vanTaskState: vanMarker?.taskState || "",
        doorText: doorMarker?.textContent || "",
        doorKind: doorMarker?.dataset.markerKind || "",
        doorTaskState: doorMarker?.dataset.taskState || "",
        doorNearby,
        returnText: returnMarker?.textContent || "",
        returnKind: returnMarker?.dataset.markerKind || "",
        returnTaskState: returnMarker?.dataset.taskState || "",
      };
    });
    assert(markerAffordances.shopMarkers.some((marker) => marker.text === "SUP" && marker.kind === "contact"), "Supervisor contact should render as a SUP marker");
    assert(markerAffordances.finishedShopMarkers.some((marker) => marker.text === "JOSH" && marker.kind === "contact"), "Josh contact should render as a JOSH marker");
    assert(markerAffordances.shopMarkers.some((marker) => marker.text === "BOARD" && marker.kind === "task"), "Dispatch board should render as a BOARD marker");
    assert(markerAffordances.shopMarkers.some((marker) => marker.text === "PICKUP" && marker.kind === "task"), "Pickup work should render as a PICKUP marker");
    assert(markerAffordances.shopMarkers.some((marker) => marker.text === "CHECK" && marker.kind === "task"), "Inspection work should render as a CHECK marker");
    assert(markerAffordances.shopMarkers.some((marker) => marker.text === "CHECK" && marker.placement !== "center"), "Inspection marker should move off the object label");
    assert(!markerAffordances.checkMarkerOverlapsDecor, "Inspection marker should not cover the Secret Squirrel label");
    assert(markerAffordances.shopMarkers.some((marker) => marker.text === "VAN" && marker.kind === "van"), "Vehicle interaction should render as a VAN marker");
    assert(markerAffordances.vanNearby.startsWith("VAN - "), "Nearby card should use the VAN marker label");
    assert(markerAffordances.vanInteract.startsWith("Interact: VAN - "), "Interact button should use the marker label");
    assert(markerAffordances.doorText === "DOOR" && markerAffordances.doorKind === "door", "Ready portals should render as DOOR markers");
    assert(markerAffordances.vanTaskState === "ready" && markerAffordances.doorTaskState === "ready", "Vehicle and ready portal markers should expose ready task state");
    assert(markerAffordances.doorNearby.startsWith("DOOR - ") && markerAffordances.doorNearby.includes("Client Lobby"), "Nearby card should use the DOOR marker label and destination");
    assert(markerAffordances.returnText === "RETURN" && markerAffordances.returnKind === "return", "Return portals should render as RETURN markers");
    assert(markerAffordances.returnTaskState === "ready", "Return portal marker should expose ready task state");

    const sceneMarkerAudit = await page.evaluate(() => {
      const rectsOverlap = (first, second) => first.right > second.left
        && first.left < second.right
        && first.bottom > second.top
        && first.top < second.bottom;
      const scenarios = [
        { id: "shop-first-day", scene: "shop", flags: { shopBrief: true } },
        { id: "shop-post-first-job", scene: "shop", flags: { shopBrief: true, finished: true, metJosh: true } },
        { id: "garage-loaded", scene: "garage", flags: { garageBrief: true, centerCityEquipmentDelivered: true } },
        { id: "lobby-ready", scene: "lobby", flags: { lobbyBrief: true, lobbyCleared: true } },
        { id: "client-ready", scene: "client", flags: { roomBrief: true, finished: false } },
        { id: "service-ready", scene: "serviceOffice", flags: { serviceStarted: true, serviceBrief: true } },
        { id: "survey-ready", scene: "universitySurvey", flags: { surveyStarted: true, surveyBrief: true } },
        { id: "commissioning-ready", scene: "southPhillyCommissioning", flags: { commissioningStarted: true, commissioningBrief: true } },
        { id: "secure-ready", scene: "navyYardAccess", flags: { secureAccessStarted: true, secureAccessBrief: true, secureAccessRoomReached: true } },
        { id: "warranty-ready", scene: "warrantyReturn", flags: { callbackCleanupStarted: true, callbackCleanupBrief: true } },
        { id: "handoff-ready", scene: "executiveHandoff", flags: { handoffStarted: true, handoffBrief: true } },
        { id: "systems-ready", scene: "systemsService", flags: { systemsStarted: true, systemsBrief: true } },
        { id: "retrofit-ready", scene: "burlingtonRetrofitWalkdown", flags: { retrofitWalkdownStarted: true, retrofitWalkdownBrief: true } },
        { id: "retrofit-install-ready", scene: "burlingtonRetrofitWalkdown", flags: { retrofitWalkdownComplete: true, retrofitInstallStarted: true, retrofitInstallBrief: true } },
      ];
      return scenarios.map((scenario) => {
        window.startGame("prototype-tech");
        const state = window.AV_TECH_RPG_DEBUG.state;
        Object.assign(state.flags, scenario.flags);
        state.modalOpen = false;
        document.querySelector("#modal-backdrop")?.classList.add("hidden");
        window.enterScene(scenario.scene);
        window.render();
        const worldRect = document.querySelector(".scene-world")?.getBoundingClientRect();
        const decor = [...document.querySelectorAll(".decor")].map((item) => ({
          text: item.textContent.trim(),
          rect: item.getBoundingClientRect(),
        }));
        const markers = [...document.querySelectorAll(".interaction-marker")].map((marker) => ({
          text: marker.textContent.trim(),
          title: marker.title,
          rect: marker.getBoundingClientRect(),
        }));
        const issues = [];
        markers.forEach((marker) => {
          if (["TASK", "CONTACT"].includes(marker.text)) issues.push(`generic ${marker.text}: ${marker.title}`);
          if (worldRect && (
            marker.rect.left < worldRect.left
            || marker.rect.right > worldRect.right
            || marker.rect.top < worldRect.top
            || marker.rect.bottom > worldRect.bottom
          )) {
            issues.push(`off scene: ${marker.text} ${marker.title}`);
          }
          decor.forEach((item) => {
            if (item.text && rectsOverlap(marker.rect, item.rect)) issues.push(`${marker.text} overlaps ${item.text}: ${marker.title}`);
          });
        });
        markers.forEach((marker, index) => {
          markers.slice(index + 1).forEach((other) => {
            if (rectsOverlap(marker.rect, other.rect)) issues.push(`marker overlap: ${marker.text}/${other.text}`);
          });
        });
        return { id: scenario.id, issues };
      });
    });
    const sceneMarkerIssues = sceneMarkerAudit.flatMap((item) => item.issues.map((issue) => `${item.id}: ${issue}`));
    assert(sceneMarkerIssues.length === 0, `Scene marker audit found issues: ${sceneMarkerIssues.slice(0, 5).join(" | ")}`);

    const taskStatePresentation = await page.evaluate(() => {
      window.startGame("prototype-tech");
      const state = window.AV_TECH_RPG_DEBUG.state;
      state.flags.shopBrief = true;
      state.player = { x: 590, y: 180 };
      window.render();
      const stagedMarker = [...document.querySelectorAll(".interaction-marker")].find((marker) => marker.title.includes("Pick up staged equipment"));
      const stagedNearby = document.querySelector("#nearby-card")?.textContent || "";
      const readyPreview = window.getFieldTaskPreviewMarkup([window.GAME_CONTENT.warehouseDispatch.checks.find((item) => item.id === "returns")]);
      const strainedCheck = {
        id: "smoke-task-state",
        label: "Smoke task state",
        type: "diagnostic check",
        skillId: "install",
        difficulty: 99,
        energyCost: 1,
        riskFlag: "smokeTaskRisk",
        riskLabel: "smoke task risk",
        successText: "The task resolves cleanly.",
        strainedText: "The task leaves visible risk.",
      };
      window.recordFieldTaskResult({
        flagKey: "smoke-task-state",
        check: strainedCheck,
        skillCheck: {
          skillId: "install",
          score: 0,
          difficulty: 99,
          successful: false,
          tier: "strained",
          conditionPenalty: 0,
          conditionPressure: [],
          conditionPressureText: "",
        },
        energyCost: 1,
      });
      const strainedPreview = window.getFieldTaskPreviewMarkup([strainedCheck]);
      window.enterScene("systemsService");
      state.player = { x: 500, y: 260 };
      window.render();
      const lockedSystemsNearby = document.querySelector("#nearby-card")?.textContent || "";
      const lockedSystemsMarker = [...document.querySelectorAll(".interaction-marker")].find((marker) => marker.title.includes("Check touch panel status"));
      state.flags.systemsBrief = true;
      window.render();
      const readySystemsNearby = document.querySelector("#nearby-card")?.textContent || "";
      const readySystemsMarker = [...document.querySelectorAll(".interaction-marker")].find((marker) => marker.title.includes("Check touch panel status"));
      return {
        stagedNearby,
        stagedTaskState: stagedMarker?.dataset.taskState || "",
        readyPreview,
        strainedPreview,
        lockedSystemsNearby,
        lockedSystemsTaskState: lockedSystemsMarker?.dataset.taskState || "",
        readySystemsNearby,
        readySystemsTaskState: readySystemsMarker?.dataset.taskState || "",
      };
    });
    assert(taskStatePresentation.stagedTaskState === "ready" && taskStatePresentation.stagedNearby.includes("State: READY"), "Shop staged equipment should show ready task state");
    assert(taskStatePresentation.readyPreview.includes("Task state: READY"), "Fresh field-task preview should show READY state");
    assert(taskStatePresentation.strainedPreview.includes("Task state: STRAINED") && taskStatePresentation.strainedPreview.includes("smoke task risk"), "Strained field-task preview should show tracked risk state");
    assert(taskStatePresentation.lockedSystemsTaskState === "locked" && taskStatePresentation.lockedSystemsNearby.includes("State: LOCKED"), "Locked systems task should explain blocker in nearby card");
    assert(taskStatePresentation.readySystemsTaskState === "ready" && taskStatePresentation.readySystemsNearby.includes("State: READY"), "Briefed systems task should change to ready state");

    await page.evaluate(() => {
      window.startGame("prototype-tech");
      window.AV_TECH_RPG_DEBUG.state.flags.shopBrief = true;
      window.render();
      window.showVehicleMenu();
    });
    await assertModalIncludes(page, [
      "Current Work",
      "Now",
      "Day plan",
      "[Shop]",
      "Nearby cue",
      "Review cargo",
      "Load carried items",
      "Review dispatch board routes",
      "Open regional map",
      "Review consequence ledger",
      "Drive active route",
      "Prep",
    ], "van menu");

    await page.evaluate(() => {
      window.startGame("prototype-tech");
      const state = window.AV_TECH_RPG_DEBUG.state;
      state.flags.shopBrief = true;
      state.loaded = [...window.GAME_CONTENT.tutorial.shopLoad];
      window.showVehicleMenu();
    });
    await page.getByRole("button", { name: /Drive Active Route/ }).click();
    await assertModalIncludes(page, [
      "Route Prep",
      "Two Quick Carts",
      "Job family",
      "Required prep",
      "Recommended prep",
      "Risk tags",
      "Today's condition",
      "Ready: no active low-energy",
      "What happens next",
      "Choose a route approach",
      "Travel cost / risk",
      "Drive to Center City",
    ], "van route prep");
    const vanPrepEmphasis = await page.evaluate(() => {
      const rows = [...document.querySelectorAll("#modal-backdrop .modal-list li")];
      return {
        next: rows.some((row) => row.classList.contains("modal-row-priority") && row.textContent.includes("What happens next")),
        prep: rows.some((row) => row.classList.contains("modal-row-prep") && row.textContent.includes("Required prep")),
        route: rows.some((row) => row.classList.contains("modal-row-route") && row.textContent.includes("Route status")),
      };
    });
    assert(vanPrepEmphasis.next && vanPrepEmphasis.prep && vanPrepEmphasis.route, "Route prep should visually emphasize next step, prep, and route status rows");
    const routePrepActionClasses = await page.evaluate(() => [...document.querySelectorAll("#modal-actions button")]
      .map((button) => ({ label: button.textContent || "", className: button.className || "" })));
    assert(
      routePrepActionClasses.some((button) => button.label.includes("Drive to Center City") && button.className.includes("primary-button")),
      "Route prep launch should keep the primary go-forward treatment",
    );

    const closeoutChoiceClasses = await page.evaluate(() => {
      window.startGame("prototype-tech");
      window.showFinishChoice();
      return [...document.querySelectorAll("#modal-actions button")]
        .map((button) => ({ label: button.textContent || "", className: button.className || "" }));
    });
    const closeoutTradeoffs = closeoutChoiceClasses.filter((button) => /Dress the cables|adapter workaround|three zip ties/.test(button.label));
    assert(closeoutTradeoffs.length >= 2, "First closeout should expose multiple tradeoff choices");
    assert(
      closeoutTradeoffs.every((button) => !button.className.includes("primary-button")),
      "Closeout tradeoff choices should not be gold-coded as primary actions",
    );
    assert(
      closeoutTradeoffs.some((button) => button.className.includes("choice-button")),
      "The unclassified closeout tradeoff should receive the neutral choice-button style",
    );

    await page.evaluate(() => {
      window.startGame("prototype-tech");
      const state = window.AV_TECH_RPG_DEBUG.state;
      state.flags.finished = true;
      state.flags.metJosh = true;
      state.flags.currentAreaId = "shop";
      window.showServiceDispatchPreview();
    });
    await page.getByRole("button", { name: /Review Route & Prep/ }).click();
    await assertModalIncludes(page, [
      "Route Prep",
      "One Quick Display Swap",
      "Today's condition",
      "Required prep",
      "Recommended prep",
      "Callback / return-trip risk",
      "What happens next",
      "Review service prep",
      "Drive to Client Office",
      "Back To Job Card",
    ], "dispatch route prep");

    await page.getByRole("button", { name: /Drive to Client Office/ }).click();
    await assertModalIncludes(page, [
      "Before You Leave",
      "Prepare For The Service Call",
    ], "dispatch route prep launch");

    const pressuredRoutePrep = await page.evaluate(() => {
      window.startGame("prototype-tech");
      const state = window.AV_TECH_RPG_DEBUG.state;
      state.flags.finished = true;
      state.flags.metJosh = true;
      state.flags.currentAreaId = "shop";
      state.energy = 18;
      state.burnout = 4;
      window.showServiceDispatchPreview();
      const jobCardText = document.querySelector("#modal-backdrop")?.innerText || "";
      window.showRoutePrepModal("conshohockenService");
      const routePrepText = document.querySelector("#modal-backdrop")?.innerText || "";
      const routePrepButtons = [...document.querySelectorAll("#modal-actions button")].map((button) => button.textContent || "");
      window.takeRoutePrepShortBreak("conshohockenService", { backAction: window.showDispatchPreview, backLabel: "Back To Job Card" });
      const afterBreakRoutePrepText = document.querySelector("#modal-backdrop")?.innerText || "";
      const afterBreakButtons = [...document.querySelectorAll("#modal-actions button")].map((button) => button.textContent || "");
      window.showRegionalMap();
      const mapText = document.querySelector("#modal-backdrop")?.innerText || "";
      return {
        jobCardText,
        routePrepText,
        routePrepButtons,
        afterBreakRoutePrepText,
        afterBreakButtons,
        afterBreakEnergy: state.energy,
        afterBreakClock: state.clock,
        mapText,
      };
    });
    assert(pressuredRoutePrep.jobCardText.includes("Today's condition") && pressuredRoutePrep.jobCardText.includes("Low energy") && pressuredRoutePrep.jobCardText.includes("High burnout"), "Dispatch job card should show active daily condition pressure");
    assert(pressuredRoutePrep.routePrepText.includes("Today's condition") && pressuredRoutePrep.routePrepText.includes("-2 to skill checks"), "Route prep should show condition skill pressure before travel");
    assert(pressuredRoutePrep.routePrepButtons.some((label) => label.includes("Take 15-Minute Break Before Driving")) && pressuredRoutePrep.routePrepButtons.some((label) => label.includes("Open Break Area")), "Pressured route prep should offer recovery choices before driving");
    assert(pressuredRoutePrep.afterBreakEnergy === 28 && pressuredRoutePrep.afterBreakClock.includes("7:26 AM"), "Route-prep break should restore energy and advance the clock");
    assert(pressuredRoutePrep.afterBreakRoutePrepText.includes("Today's condition") && pressuredRoutePrep.afterBreakRoutePrepText.includes("High burnout") && pressuredRoutePrep.afterBreakRoutePrepText.includes("-1 to skill checks"), "Route prep should reopen with updated condition pressure after a break");
    assert(pressuredRoutePrep.afterBreakButtons.some((label) => label.includes("Back To Job Card")), "Route-prep break should preserve the original back action");
    assert(pressuredRoutePrep.mapText.includes("Today's condition") && pressuredRoutePrep.mapText.includes("Field checks: High burnout"), "Regional route cards should expose active condition pressure");

    const routeLaunchFlows = await page.evaluate(() => {
      window.startGame("prototype-tech");
      const state = window.AV_TECH_RPG_DEBUG.state;
      state.flags.finished = true;
      const servicePrep = window.getRouteLaunchFlow("conshohockenService").preview;
      state.flags.servicePreparation = "review";
      const serviceReady = window.getRouteLaunchFlow("conshohockenService").preview;
      Object.assign(state.flags, {
        serviceComplete: true,
        conshohockenFollowupComplete: true,
        surveyComplete: true,
        commissioningComplete: true,
        warehouseComplete: true,
        secureAccessComplete: true,
        handoffComplete: true,
        systemsComplete: true,
        travelComplete: true,
        retrofitWalkdownComplete: true,
        retrofitInstallComplete: false,
        retrofitInstallPackageReviewed: false,
      });
      const retrofitPackage = window.getRouteLaunchFlow("burlingtonRetrofitWalkdown").preview;
      state.flags.retrofitInstallPackageReviewed = true;
      const retrofitInstallReady = window.getRouteLaunchFlow("burlingtonRetrofitWalkdown").preview;
      return { servicePrep, serviceReady, retrofitPackage, retrofitInstallReady };
    });
    assert(routeLaunchFlows.servicePrep.includes("service prep"), "Route launch flow should preview service prep before service travel");
    assert(routeLaunchFlows.serviceReady.includes("service drive summary"), "Route launch flow should preview service travel after prep");
    assert(routeLaunchFlows.retrofitPackage.includes("saved walkdown package"), "Route launch flow should preview Burlington package review before install travel");
    assert(routeLaunchFlows.retrofitInstallReady.includes("Burlington install drive summary"), "Route launch flow should preview Burlington install travel after package review");

    await page.evaluate(() => {
      window.startGame("prototype-tech");
      const state = window.AV_TECH_RPG_DEBUG.state;
      state.flags.shopBrief = true;
      state.carry = [window.GAME_CONTENT.tutorial.shopLoad[0]];
      window.showVehicleMenu();
    });
    await page.getByRole("button", { name: /Load Carried Items/ }).click();
    const vanLoadResult = await page.evaluate(() => {
      const state = window.AV_TECH_RPG_DEBUG.state;
      return {
        modalOpen: state.modalOpen,
        modalHidden: document.querySelector("#modal-backdrop")?.classList.contains("hidden") || false,
        loadedCount: state.loaded.length,
        carriedCount: state.carry.length,
        logText: state.log.join(" "),
      };
    });
    assert(vanLoadResult.loadedCount === 1, "Loading carried items should add cargo to the van");
    assert(vanLoadResult.carriedCount === 0, "Loading carried items should clear carried cargo");
    assert(!vanLoadResult.modalOpen && vanLoadResult.modalHidden, "Loading carried items should return to the map instead of reopening the van modal");
    assert(vanLoadResult.logText.includes("loaded into"), "Loading carried items should still log what happened");

    const directVanLoad = await page.evaluate(() => {
      window.startGame("prototype-tech");
      const state = window.AV_TECH_RPG_DEBUG.state;
      state.flags.shopBrief = true;
      state.carry = [window.GAME_CONTENT.tutorial.shopLoad[0]];
      state.player = { x: 830, y: 380 };
      window.render();
      const nearbyBefore = document.querySelector("#nearby-card")?.textContent || "";
      const interactBefore = document.querySelector("#interact-button")?.textContent || "";
      const markerText = [...document.querySelectorAll(".interaction-marker")]
        .find((marker) => marker.title.includes("Load carried items"))?.textContent || "";
      document.querySelector("#interact-button")?.click();
      return {
        nearbyBefore,
        interactBefore,
        markerText,
        loadedCount: state.loaded.length,
        carriedCount: state.carry.length,
        modalOpen: state.modalOpen,
      };
    });
    assert(directVanLoad.markerText === "LOAD", "Carrying gear should turn the van marker into a LOAD action");
    assert(directVanLoad.nearbyBefore.startsWith("LOAD - Load carried items") && directVanLoad.interactBefore.startsWith("Interact: LOAD - "), "Nearby and interact copy should show the direct load action");
    assert(directVanLoad.loadedCount === 1 && directVanLoad.carriedCount === 0, "Direct van interaction should load carried cargo");
    assert(!directVanLoad.modalOpen, "Direct van loading should not open the van modal");

    const naturalJoshIntro = await page.evaluate(() => {
      window.startGame("prototype-tech");
      const state = window.AV_TECH_RPG_DEBUG.state;
      state.flags.finished = true;
      state.flags.endShiftPending = true;
      state.flags.endShiftSource = "Two Quick Carts";
      state.flags.metJosh = false;
      window.enterScene("shop");
      window.render();
      const sameDayModalHidden = document.querySelector("#modal-backdrop")?.classList.contains("hidden") || false;
      const sameDayObjective = window.getObjective();
      const sameDayInteractions = window.getInteractions().map((interaction) => ({
        label: interaction.label,
        marker: window.getInteractionMarkerText(interaction),
        state: interaction.taskState?.()?.id || "",
      }));
      window.showVehicleMenu();
      const sameDayVanText = document.querySelector("#modal-backdrop")?.innerText || "";
      window.closeModal();
      window.showRegionalMap();
      const sameDayMapText = document.querySelector("#modal-backdrop")?.innerText || "";
      window.closeModal();
      window.showDispatchPreview();
      const sameDayBoardText = document.querySelector("#modal-backdrop")?.innerText || "";
      window.completeShift("clock-out");
      const nextMorningShiftText = document.querySelector("#modal-backdrop")?.innerText || "";
      const nextMorningButtons = [...document.querySelectorAll("#modal-actions button")].map((button) => button.textContent || "");
      const nextMorningObjective = window.getObjective();
      const nextMorningInteractions = window.getInteractions().map((interaction) => ({
        label: interaction.label,
        marker: window.getInteractionMarkerText(interaction),
        state: interaction.taskState?.()?.id || "",
      }));
      const nextMorningFirstStepLabel = document.querySelector("#task-copy .current-step-list li:first-child strong")?.textContent || "";
      const nextMorningNextCard = document.querySelector("#task-copy .current-step-next")?.textContent || "";
      window.saveGame();
      window.continueGame();
      const continuedNextMorningModalHidden = document.querySelector("#modal-backdrop")?.classList.contains("hidden") || false;
      const continuedNextMorningObjective = window.getObjective();
      const continuedNextMorningInteractions = window.getInteractions().map((interaction) => ({
        label: interaction.label,
        marker: window.getInteractionMarkerText(interaction),
        state: interaction.taskState?.()?.id || "",
      }));
      window.showDispatchPreview();
      const boardAttemptHidden = document.querySelector("#modal-backdrop")?.classList.contains("hidden") || false;
      const boardAttemptText = document.querySelector("#modal-backdrop")?.innerText || "";
      const promptedForJosh = state.log.some((entry) => entry.includes("Find Josh"));
      window.getInteractions()[0].action();
      const introText = document.querySelector("#modal-backdrop")?.innerText || "";
      const introButtons = [...document.querySelectorAll("#modal-actions button")].map((button) => button.textContent || "");
      const interactionsAfterIntro = window.getInteractions().map((interaction) => interaction.label);
      return {
        sameDayModalHidden,
        sameDayObjective,
        sameDayInteractions,
        sameDayVanText,
        sameDayMapText,
        sameDayBoardText,
        nextMorningShiftText,
        nextMorningButtons,
        nextMorningObjective,
        nextMorningInteractions,
        nextMorningFirstStepLabel,
        nextMorningNextCard,
        continuedNextMorningModalHidden,
        continuedNextMorningObjective,
        continuedNextMorningInteractions,
        boardAttemptHidden,
        boardAttemptText,
        promptedForJosh,
        metJosh: Boolean(state.flags.metJosh),
        introText,
        introButtons,
        interactionsAfterIntro,
      };
    });
    assert(naturalJoshIntro.sameDayModalHidden, "Returning from the first job should not auto-open a Josh modal");
    assert(naturalJoshIntro.sameDayObjective.includes("Close out the shift"), "Same-day return should keep the objective on shift closeout");
    assert(naturalJoshIntro.sameDayInteractions.some((interaction) => interaction.label.includes("Close out shift")), "Same-day return should expose shift closeout");
    assert(naturalJoshIntro.sameDayInteractions.length === 1 && naturalJoshIntro.sameDayInteractions[0].marker === "CLOSE", "Same-day end-shift shop should focus on one closeout marker");
    assert(!naturalJoshIntro.sameDayInteractions.some((interaction) => interaction.marker === "JOSH"), "Josh intro should not be available during first-day closeout");
    assert(naturalJoshIntro.sameDayVanText.includes("Close Out The Workday") && naturalJoshIntro.sameDayMapText.includes("Close Out The Workday"), "End-shift van and map calls should route to closeout");
    assert(naturalJoshIntro.sameDayBoardText.includes("Close Out The Workday"), "Same-day board access should route to end-shift closeout");
    assert(naturalJoshIntro.nextMorningShiftText.toLowerCase().includes("shift result"), "Clocking out should show the shift result before the next morning");
    assert(!naturalJoshIntro.nextMorningButtons.some((label) => label.includes("Review Dispatch Board Routes")), "Next morning shift result should not offer the board before meeting Josh");
    assert(naturalJoshIntro.nextMorningObjective.includes("Josh") && naturalJoshIntro.nextMorningObjective.includes("next route"), "Next morning objective should require finding Josh before the next route");
    assert(naturalJoshIntro.nextMorningFirstStepLabel === "Next task" && naturalJoshIntro.nextMorningNextCard.includes("Josh"), "Next morning sidebar should put the Josh task first");
    assert(naturalJoshIntro.nextMorningInteractions.length === 1 && naturalJoshIntro.nextMorningInteractions[0].label.includes("Josh") && naturalJoshIntro.nextMorningInteractions[0].marker === "JOSH", "Next morning shop should only expose the Josh workbench interaction");
    assert(naturalJoshIntro.nextMorningInteractions[0].state === "ready", "Josh intro interaction should present as a ready task");
    assert(naturalJoshIntro.continuedNextMorningModalHidden, "Continue should hide stale shift-result modals before the next-morning Josh gate");
    assert(naturalJoshIntro.continuedNextMorningObjective.includes("Josh"), "Continue should preserve the next-morning Josh objective");
    assert(naturalJoshIntro.continuedNextMorningInteractions.length === 1 && naturalJoshIntro.continuedNextMorningInteractions[0].marker === "JOSH", "Continue should preserve Josh as the only next-morning interaction");
    assert(naturalJoshIntro.boardAttemptHidden && naturalJoshIntro.promptedForJosh, "Next-morning board access should prompt the player to find Josh instead of opening Josh automatically");
    assert(naturalJoshIntro.metJosh && naturalJoshIntro.introText.includes("The Person Keeping This Place Running"), "Walking to Josh should trigger the intro conversation");
    assert(naturalJoshIntro.introButtons.some((label) => label.includes("Thank Josh")), "Next-morning Josh intro should return to the shop afterward");
    assert(naturalJoshIntro.interactionsAfterIntro.some((label) => label.includes("Read dispatch board")), "After meeting Josh, dispatch board should become available again");

    const endShiftJoshGate = await page.evaluate(() => {
      window.startGame("prototype-tech");
      const state = window.AV_TECH_RPG_DEBUG.state;
      state.flags.finished = true;
      state.flags.endShiftPending = true;
      state.flags.endShiftSource = "Two Quick Carts";
      state.flags.metJosh = false;
      window.showEndShiftModal();
      const beforeIntroText = document.querySelector("#modal-backdrop")?.innerText || "";
      const beforeIntroButtons = [...document.querySelectorAll("#modal-actions button")].map((button) => button.textContent || "");
      state.flags.metJosh = true;
      window.showEndShiftModal();
      const afterIntroText = document.querySelector("#modal-backdrop")?.innerText || "";
      const afterIntroButtons = [...document.querySelectorAll("#modal-actions button")].map((button) => button.textContent || "");
      state.flags.metJosh = false;
      delete state.flags.joshIntroEndShiftSource;
      window.showJoshConversation();
      window.showEndShiftModal();
      const sameShiftIntroText = document.querySelector("#modal-backdrop")?.innerText || "";
      const sameShiftIntroButtons = [...document.querySelectorAll("#modal-actions button")].map((button) => button.textContent || "");
      state.flags.metJosh = true;
      state.flags.endShiftSource = "One Quick Display Swap";
      window.showEndShiftModal();
      const laterShiftText = document.querySelector("#modal-backdrop")?.innerText || "";
      const laterShiftButtons = [...document.querySelectorAll("#modal-actions button")].map((button) => button.textContent || "");
      const routineScenarioLabels = ["Smoke Shift A", "Smoke Shift B", "Smoke Shift C", "Smoke Shift D"].map((source, index) => {
        state.flags.serviceCallbackPending = false;
        state.flags.serviceCallbackResolved = false;
        state.flags.endShiftSource = source;
        state.stats.shiftsCompleted = index;
        return window.getHelpJoshShiftCopy()?.taskLabel || "";
      });
      state.flags.endShiftSource = "One Quick Display Swap";
      state.flags.serviceCallbackPending = true;
      state.flags.serviceCallbackResolved = false;
      window.showEndShiftModal();
      const pendingCallbackText = document.querySelector("#modal-backdrop")?.innerText || "";
      const pendingCallbackButtons = [...document.querySelectorAll("#modal-actions button")].map((button) => button.textContent || "");
      const pendingCallbackHelpLabel = pendingCallbackButtons.find((label) => label.includes("Help Josh")) || "";
      window.completeShift("help-josh");
      const callbackHelpResultText = document.querySelector("#modal-backdrop")?.innerText || "";
      window.showCareerClipboard();
      const careerClipboardText = document.querySelector("#modal-backdrop")?.innerText || "";
      window.showRoutePrepModal("conshohockenService");
      const routePrepModifierText = document.querySelector("#modal-backdrop")?.innerText || "";
      const supportAvailableBeforeCheck = Boolean(state.flags.joshCrewSupportAvailable && !state.flags.joshCrewSupportUsed);
      const supportPressureText = window.getActionPressureSummary({
        check: { skillId: "troubleshooting", difficulty: 4, contextId: "service-diagnosis" },
      });
      const supportSkillCheck = window.resolveSkillCheck("smoke-josh-crew-support", {
        skillId: "troubleshooting",
        difficulty: 4,
        contextId: "service-diagnosis",
      });
      const supportSkillLabel = window.getSkillCheckLabel(supportSkillCheck);
      const supportAvailableAfterCheck = Boolean(state.flags.joshCrewSupportAvailable && !state.flags.joshCrewSupportUsed);
      return {
        beforeIntroText,
        beforeIntroButtons,
        afterIntroText,
        afterIntroButtons,
        sameShiftIntroText,
        sameShiftIntroButtons,
        laterShiftText,
        laterShiftButtons,
        routineScenarioLabels,
        pendingCallbackText,
        pendingCallbackButtons,
        pendingCallbackHelpLabel,
        callbackHelpResultText,
        callbackResolved: Boolean(state.flags.serviceCallbackResolved),
        callbacksResolved: state.stats.callbacksResolved || 0,
        coworkerReputation: state.reputation.coworkers,
        shopHelpDays: state.stats.shopHelpDays || 0,
        lastHelpScenario: state.flags.lastHelpJoshScenario || {},
        joshHelpHistory: state.flags.joshHelpHistory || [],
        shiftHistory: state.flags.shiftHistory || [],
        careerClipboardText,
        routePrepModifierText,
        supportAvailableBeforeCheck,
        supportPressureText,
        supportSkillCheck,
        supportSkillLabel,
        supportAvailableAfterCheck,
        supportLastUsed: state.flags.joshCrewSupportLastUsed || {},
      };
    });
    assert(!endShiftJoshGate.beforeIntroText.includes("Help Josh"), "First end-shift modal should not offer Josh help before the player has met him");
    assert(!endShiftJoshGate.beforeIntroText.includes("lead tech"), "First end-shift modal should not introduce Josh through a generic lead-tech option");
    assert(endShiftJoshGate.beforeIntroButtons.every((label) => !/Josh|lead tech/i.test(label)), "First end-shift actions should hide Josh help before the intro");
    assert(endShiftJoshGate.afterIntroText.includes("Help Josh") && endShiftJoshGate.afterIntroButtons.some((label) => label.includes("Help Josh")), "End-shift modal should offer Josh help after the player has met him");
    assert(!endShiftJoshGate.sameShiftIntroText.includes("Help Josh") && endShiftJoshGate.sameShiftIntroButtons.every((label) => !/Josh|lead tech/i.test(label)), "Same-shift Josh intro should not immediately unlock Help Josh");
    assert(endShiftJoshGate.laterShiftText.includes("Help Josh") && endShiftJoshGate.laterShiftButtons.some((label) => label.includes("Help Josh")), "Later shifts should offer Josh help after the intro shift has passed");
    assert(new Set(endShiftJoshGate.routineScenarioLabels.filter(Boolean)).size > 1, "Routine after-hours Josh help should rotate through multiple task labels");
    assert(endShiftJoshGate.pendingCallbackText.includes("callback note") && endShiftJoshGate.pendingCallbackHelpLabel.includes("callback"), "Pending service callback should offer a callback-specific after-hours Josh help option");
    assert(endShiftJoshGate.callbackResolved && endShiftJoshGate.callbacksResolved === 1, "After-hours callback help should resolve the pending service callback");
    assert(endShiftJoshGate.coworkerReputation === 1 && endShiftJoshGate.shopHelpDays === 1, "After-hours Josh help should still improve coworker trust and shop-help stats");
    assert(endShiftJoshGate.lastHelpScenario.resolvedCallback && endShiftJoshGate.shiftHistory[0]?.helpJoshTask, "Shift memory should record the Josh help scenario");
    assert(endShiftJoshGate.joshHelpHistory.length === 1 && endShiftJoshGate.joshHelpHistory[0].resolvedCallback, "Josh help history should record callback-specific after-hours help");
    assert(endShiftJoshGate.careerClipboardText.includes("Coworker help history") && endShiftJoshGate.careerClipboardText.includes(endShiftJoshGate.joshHelpHistory[0].taskLabel), "Career clipboard should surface recent Josh help history");
    assert(endShiftJoshGate.careerClipboardText.includes("Josh after-hours help") && endShiftJoshGate.careerClipboardText.includes("Callback pressure was cleaned up"), "Active career summary should describe the Josh help consequence");
    assert(endShiftJoshGate.supportAvailableBeforeCheck && endShiftJoshGate.careerClipboardText.includes("Josh crew support"), "Helping Josh should grant visible crew support before the next eligible check");
    assert(endShiftJoshGate.routePrepModifierText.includes("Why this is different today") && endShiftJoshGate.routePrepModifierText.includes("Josh crew support ready"), "Route prep should surface active task modifiers before driving");
    assert(endShiftJoshGate.supportPressureText.includes("Josh crew support ready"), "Action pressure should preview Josh crew support on eligible checks");
    assert(endShiftJoshGate.supportSkillCheck.joshCrewSupportBonus === 1 && endShiftJoshGate.supportSkillLabel.includes("Josh +1"), "Eligible checks should apply the Josh crew-support bonus visibly");
    assert(endShiftJoshGate.supportSkillCheck.modifiersApplied?.some((modifier) => modifier.id === "josh-crew-support" && modifier.consumesOnUse), "Skill result should preserve the Josh modifier data shape");
    assert(!endShiftJoshGate.supportAvailableAfterCheck && endShiftJoshGate.supportLastUsed.contextId === "service-diagnosis", "Josh crew support should be consumed by the eligible check");
    assert(endShiftJoshGate.callbackHelpResultText.includes("Helped Josh") && endShiftJoshGate.callbackHelpResultText.includes("callback note was cleaned up"), "Shift result should explain the after-hours callback cleanup");

    const taskModifierShape = await page.evaluate(() => {
      window.startGame("prototype-tech");
      const state = window.AV_TECH_RPG_DEBUG.state;
      const check = {
        id: "smoke-modifier-check",
        label: "Smoke Modifier Check",
        type: "field check",
        skillId: "troubleshooting",
        difficulty: 3,
        contextId: "service-diagnosis",
        energyCost: 3,
        taskModifiers: [{
          id: "smoke-room-pressure",
          label: "Known room pressure",
          source: "Smoke room condition",
          statDelta: -1,
          energyDelta: 2,
          consumesOnUse: false,
          resultText: "Smoke pressure affected the check.",
        }],
      };
      const beforeEnergy = state.energy;
      const { skillCheck, energyCost } = window.resolveFieldTaskCheck({
        check,
        checkId: check.id,
        completedChecks: [],
        flagKey: "smoke-modifier-check",
        cleanEnergyReduction: 0,
      });
      return {
        beforeEnergy,
        afterEnergy: state.energy,
        energyCost,
        skillCheck,
        ledgerEntry: state.flags.fieldTaskResults["smoke-modifier-check"],
        preview: window.getTaskModifierPreviewText(check),
      };
    });
    assert(taskModifierShape.preview.includes("Known room pressure") && taskModifierShape.preview.includes("adds effort"), "Task modifier preview should include source and qualitative effort impact");
    assert(taskModifierShape.skillCheck.modifiersApplied.some((modifier) => modifier.id === "smoke-room-pressure" && modifier.statDelta === -1 && modifier.energyDelta === 2), "Skill check should carry generic modifier data");
    assert(taskModifierShape.ledgerEntry.modifiersApplied.some((modifier) => modifier.id === "smoke-room-pressure"), "Field-task result ledger should persist modifiersApplied");
    assert(taskModifierShape.beforeEnergy - taskModifierShape.afterEnergy === taskModifierShape.energyCost && taskModifierShape.energyCost >= 5, "Task modifier energy delta should affect resolved energy cost");

    const beforeMeetHelpGuard = await page.evaluate(() => {
      window.startGame("prototype-tech");
      const state = window.AV_TECH_RPG_DEBUG.state;
      state.flags.finished = true;
      state.flags.endShiftPending = true;
      state.flags.endShiftSource = "Smoke No Josh";
      state.flags.metJosh = false;
      window.completeShift("help-josh");
      return {
        shiftsCompleted: state.stats.shiftsCompleted,
        endShiftPending: Boolean(state.flags.endShiftPending),
        logText: state.log.join(" "),
      };
    });
    assert(beforeMeetHelpGuard.shiftsCompleted === 0 && beforeMeetHelpGuard.endShiftPending, "Help Josh should not complete a shift before the player has met Josh");
    assert(beforeMeetHelpGuard.logText.includes("Meet Josh"), "Blocked Help Josh should tell the player to meet Josh first");

    const shiftResultDelta = await page.evaluate(() => {
      window.startGame("prototype-tech");
      const state = window.AV_TECH_RPG_DEBUG.state;
      state.flags.finished = true;
      state.flags.metJosh = true;
      state.flags.endShiftPending = true;
      state.flags.endShiftSource = "Smoke Shift";
      state.energy = 70;
      state.burnout = 2;
      state.reputation.management = 0;
      window.completeShift("prep");
      const modalText = document.querySelector("#modal-backdrop")?.innerText || "";
      const buttons = [...document.querySelectorAll("#modal-actions button")].map((button) => button.textContent || "");
      const currentStepText = document.querySelector("#task-copy")?.textContent || "";
      window.saveGame();
      const savedShiftHistory = window.getSavedGame().flags.shiftHistory || [];
      return {
        modalText,
        buttons,
        currentStepText,
        endShiftPending: Boolean(state.flags.endShiftPending),
        shiftPrepActive: Boolean(state.flags.shiftPrepActive),
        shiftHistory: state.flags.shiftHistory || [],
        savedShiftHistory,
        clock: state.clock,
        management: state.reputation.management,
        shiftsCompleted: state.stats.shiftsCompleted,
      };
    });
    const shiftResultText = shiftResultDelta.modalText.toLowerCase();
    assert(shiftResultText.includes("shift result") && shiftResultText.includes("what changed"), "Shift completion should show a result summary");
    assert(shiftResultDelta.modalText.includes("Energy") && shiftResultDelta.modalText.includes("Burnout") && shiftResultDelta.modalText.includes("Management reputation"), "Shift result should show changed condition and reputation");
    assert(shiftResultDelta.modalText.includes("Next-shift prep") && shiftResultText.includes("next step"), "Shift result should show prep consequence and next step");
    assert(shiftResultText.includes("workday memory") && shiftResultDelta.modalText.includes("Last shift: Stayed late to prep after Smoke Shift"), "Shift result should record a readable workday memory");
    assert(shiftResultDelta.currentStepText.includes("Last shift: Stayed late to prep after Smoke Shift"), "Current step panel should keep the latest shift memory visible");
    assert(shiftResultDelta.shiftHistory.length === 1 && shiftResultDelta.shiftHistory[0].choice === "prep" && shiftResultDelta.shiftHistory[0].source === "Smoke Shift", "Prep shift result should store compact shift history");
    assert(shiftResultDelta.savedShiftHistory.length === 1 && shiftResultDelta.savedShiftHistory[0].choiceLabel === "Stayed late to prep", "Shift history should persist through save migration");
    assert(shiftResultDelta.buttons.some((label) => label.includes("Review Dispatch Board Routes")), "Shift result should offer the dispatch board when available");
    assert(!shiftResultDelta.endShiftPending && shiftResultDelta.shiftPrepActive, "Prep shift result should clear end-shift state and keep next-shift prep active");
    assert(shiftResultDelta.clock.startsWith("TUE") && shiftResultDelta.management === -1 && shiftResultDelta.shiftsCompleted === 1, "Prep shift result should preserve clock, reputation, and shift stats");

    await page.evaluate(() => window.showRegionalMap());
    await assertModalIncludes(page, [
      "Current Work",
      "Day plan",
      "Active Job Route",
      "Available Routes",
      "Callback / Return-Trip Pressure",
      "Unlocked Fast-Travel Routes",
      "Known Destinations",
      "Area Transitions",
      "Locked Future Candidates",
      "Destination:",
      "Job family:",
      "Required tools:",
      "Recommended tools:",
      "Unlock condition:",
      "What happens next:",
      "Travel cost/risk:",
      "Fast travel:",
      "Rewards:",
      "Callback / return-trip risk:",
    ], "regional map");

    const travelResult = await page.evaluate(() => {
      window.startGame("prototype-tech");
      const state = window.AV_TECH_RPG_DEBUG.state;
      state.flags.shopBrief = true;
      state.loaded = [...window.GAME_CONTENT.tutorial.shopLoad];
      const route = window.getWorldRoute("centerCityTutorial");
      const choice = route.choices.find((item) => item.id === "loadingZoneGamble");
      const originalRandom = Math.random;
      Math.random = () => 0.9;
      window.travelRoute("centerCityTutorial", { routeChoice: choice });
      Math.random = originalRandom;
      window.showRegionalMap();
      const modalText = document.querySelector("#modal-backdrop")?.innerText || "";
      const result = state.flags.travelResults?.centerCityTutorial;
      return {
        resultSaved: Boolean(result),
        choiceId: result?.choiceId || "",
        energyDelta: result?.energyDelta || 0,
        riskLabel: result?.riskLabel || "",
        riskHit: Boolean(result?.riskHit),
        arrivalClock: result?.arrivalClock || "",
        routeCount: state.flags.routeHistory?.centerCityTutorial || 0,
        cardShowsResult: modalText.includes("Last travel result")
          && modalText.includes("Try the loading-zone approach")
          && modalText.includes("-2 energy")
          && modalText.includes("Curb conflict held")
          && modalText.includes("MON 7:58 AM"),
      };
    });
    assert(travelResult.resultSaved, "Route travel should save latest travel-result data");
    assert(travelResult.choiceId === "loadingZoneGamble", "Travel result should save the selected route choice");
    assert(travelResult.energyDelta === -2, "Travel result should save route energy delta");
    assert(travelResult.riskLabel === "Curb conflict" && !travelResult.riskHit, "Travel result should save a held route-risk roll");
    assert(travelResult.arrivalClock === "MON 7:58 AM", "Travel result should save arrival clock");
    assert(travelResult.routeCount === 1, "Travel result should preserve route history count");
    assert(travelResult.cardShowsResult, "Regional map route card should show latest travel result");

    const failedTravelRisk = await page.evaluate(() => {
      window.startGame("prototype-tech");
      const state = window.AV_TECH_RPG_DEBUG.state;
      state.flags.shopBrief = true;
      state.loaded = [...window.GAME_CONTENT.tutorial.shopLoad];
      const route = window.getWorldRoute("centerCityTutorial");
      const choice = route.choices.find((item) => item.id === "loadingZoneGamble");
      const originalRandom = Math.random;
      Math.random = () => 0.1;
      window.travelRoute("centerCityTutorial", { routeChoice: choice });
      Math.random = originalRandom;
      const result = state.flags.travelResults?.centerCityTutorial;
      return {
        energyDelta: result?.energyDelta || 0,
        burnoutDelta: result?.burnoutDelta || 0,
        riskHit: Boolean(result?.riskHit),
        riskDetail: result?.riskDetail || "",
        logShowsRisk: state.log.some((entry) => entry.includes("Loading-zone gamble failed")),
      };
    });
    assert(failedTravelRisk.energyDelta === -4 && failedTravelRisk.burnoutDelta === 1, "Failed route-risk roll should add immediate energy and burnout pressure");
    assert(failedTravelRisk.riskHit && failedTravelRisk.riskDetail.includes("security"), "Failed route-risk roll should save readable detail");
    assert(failedTravelRisk.logShowsRisk, "Failed route-risk roll should log the immediate travel outcome");

    const conditionedRouteChoice = await page.evaluate(() => {
      window.startGame("prototype-tech");
      const state = window.AV_TECH_RPG_DEBUG.state;
      state.flags.shopBrief = true;
      state.loaded = [...window.GAME_CONTENT.tutorial.shopLoad];
      state.energy = 18;
      state.burnout = 4;
      const route = window.getWorldRoute("centerCityTutorial");
      const choice = route.choices.find((item) => item.id === "garageRoute");
      window.showRouteChoiceModal({ routeId: "centerCityTutorial" });
      const choiceText = document.querySelector("#modal-backdrop")?.innerText || "";
      window.travelRoute("centerCityTutorial", { routeChoice: choice });
      const result = state.flags.travelResults?.centerCityTutorial;
      return {
        choiceText,
        energyDelta: result?.energyDelta || 0,
        burnoutDelta: result?.burnoutDelta || 0,
        conditionPressureText: result?.conditionPressureText || "",
        resultText: window.getTravelResultText(result),
        energy: state.energy,
        burnout: state.burnout,
      };
    });
    assert(conditionedRouteChoice.choiceText.includes("Today's condition") && conditionedRouteChoice.choiceText.includes("condition pressure"), "Route choice modal should preview qualitative condition pressure before travel");
    assert(conditionedRouteChoice.energyDelta === -1 && conditionedRouteChoice.burnoutDelta === 1, "Route condition pressure should change travel result deltas");
    assert(conditionedRouteChoice.conditionPressureText.includes("low energy") && conditionedRouteChoice.conditionPressureText.includes("high burnout"), "Travel result should save readable route condition pressure");
    assert(conditionedRouteChoice.resultText.includes("Condition:") && conditionedRouteChoice.energy === 17 && conditionedRouteChoice.burnout === 5, "Travel result text and state should reflect route condition pressure");

    const transitionGuidance = await page.evaluate(() => {
      window.startGame("prototype-tech");
      const state = window.AV_TECH_RPG_DEBUG.state;
      window.enterScene("garage");
      state.flags.garageBrief = true;
      state.player = { x: 116, y: 185 };
      window.render();
      const lockedNearby = document.querySelector("#nearby-card")?.textContent || "";
      const lockedTaskCopy = document.querySelector("#task-copy")?.textContent || "";
      window.usePortal("garageToLobby");
      const lockedText = document.querySelector("#modal-backdrop")?.innerText || "";
      state.flags.centerCityEquipmentDelivered = true;
      window.render();
      const readyNearby = document.querySelector("#nearby-card")?.textContent || "";
      const readyTaskCopy = document.querySelector("#task-copy")?.textContent || "";
      window.usePortal("garageToLobby");
      const readyText = document.querySelector("#modal-backdrop")?.innerText || "";
      return {
        lockedText,
        readyText,
        lockedNearby,
        readyNearby,
        lockedTaskCopy,
        readyTaskCopy,
        taskCopy: document.querySelector("#task-copy")?.textContent || "",
      };
    });
    assert(transitionGuidance.lockedText.includes("Requirement") && transitionGuidance.lockedText.includes("Origin") && transitionGuidance.lockedText.includes("Destination") && transitionGuidance.lockedText.includes("equipment still needs"), "Locked portal should explain blocker with transition details");
    assert(transitionGuidance.readyText.includes("Status") && transitionGuidance.readyText.includes("Ready") && transitionGuidance.readyText.includes("Requirement") && transitionGuidance.readyText.includes("Travel effect") && transitionGuidance.readyText.includes("Client Lobby"), "Ready portal should show transition destination and effects");
    assert(transitionGuidance.lockedNearby.includes("State: LOCKED") && transitionGuidance.lockedNearby.includes("Carry equipment from the van"), "Nearby card should explain locked entrance");
    assert(transitionGuidance.readyNearby.includes("State: READY") && transitionGuidance.readyNearby.includes("Client Lobby"), "Nearby card should explain ready transition destination");
    assert(transitionGuidance.lockedTaskCopy.includes("Area transitions") && transitionGuidance.lockedTaskCopy.includes("Locked: Enter client lobby") && transitionGuidance.lockedTaskCopy.includes("equipment still needs"), "Current step should summarize locked area transition requirements");
    assert(transitionGuidance.readyTaskCopy.includes("Area transitions") && transitionGuidance.readyTaskCopy.includes("Ready: Enter client lobby"), "Current step should summarize ready area transitions");
    assert(transitionGuidance.lockedTaskCopy.includes("Route / Building Entry") && transitionGuidance.lockedTaskCopy.includes("Use Van #3") && !transitionGuidance.lockedTaskCopy.includes("Interface:"), "Locked current step should include player-facing work-step guidance");
    assert(transitionGuidance.readyTaskCopy.includes("Route / Building Entry") && transitionGuidance.readyTaskCopy.includes("Talk to the nearby contact") && !transitionGuidance.readyTaskCopy.includes("Interface:"), "Ready current step should include player-facing work-step guidance");

    const returnMarkerFlow = await page.evaluate(() => {
      window.startGame("prototype-tech");
      const state = window.AV_TECH_RPG_DEBUG.state;
      window.enterScene("serviceOffice");
      state.flags.serviceComplete = true;
      window.returnToShopViaCurrentExit("One Quick Display Swap", "Returned to Radnor Rack & Wire after the Conshohocken service call.");
      const modalOpen = state.modalOpen;
      const modalHidden = document.querySelector("#modal-backdrop")?.classList.contains("hidden") || false;
      const markerText = document.querySelector(".return-portal-marker")?.textContent || "";
      const sceneAfterPrompt = state.sceneId;
      window.usePortal("serviceOfficeToShop");
      const portalText = document.querySelector("#modal-backdrop")?.innerText || "";
      return {
        sceneAfterPrompt,
        modalOpen,
        modalHidden,
        markerText,
        portalText,
        logText: state.log.join(" "),
      };
    });
    assert(returnMarkerFlow.sceneAfterPrompt === "serviceOffice", "Return helper should leave player onsite after closeout");
    assert(!returnMarkerFlow.modalOpen && returnMarkerFlow.modalHidden, "Return helper should not open a second return-ready modal");
    assert(returnMarkerFlow.logText.includes("Walk to the marked RETURN point"), "Return helper should log the marked return point");
    assert(returnMarkerFlow.markerText === "RETURN", "Return portal marker should render as a readable RETURN control");
    assert(returnMarkerFlow.portalText.toLowerCase().includes("service exit") && returnMarkerFlow.portalText.includes("Back To The Shop"), "Return portal should still open the mapped transition");
    assert(returnMarkerFlow.portalText.toLowerCase().includes("before you leave") && returnMarkerFlow.portalText.toLowerCase().includes("risk carried back"), "Return portal should show a departure consequence summary");

    const routeJobData = await page.evaluate(() => {
      return Object.keys(window.GAME_CONTENT.world.routes).map((routeId) => ({
        routeId,
        job: window.getRouteJobData(routeId),
      }));
    });
    for (const item of routeJobData) {
      assert(item.job.title && item.job.purpose && item.job.rewards, `${item.routeId} should resolve route job data`);
      assert(item.job.title !== "Mapped route", `${item.routeId} should not fall back to the generic route title`);
    }

    const retrofitRouteCard = await page.evaluate(() => {
      window.startGame("prototype-tech");
      const state = window.AV_TECH_RPG_DEBUG.state;
      Object.assign(state.flags, {
        finished: true,
        metJosh: true,
        serviceComplete: true,
        joshServiceDebriefed: true,
        conshohockenFollowupComplete: true,
        surveyComplete: true,
        commissioningComplete: true,
        warehouseComplete: true,
        secureAccessComplete: true,
        handoffComplete: true,
        systemsComplete: true,
        travelComplete: true,
        retrofitWalkdownComplete: true,
        retrofitWalkdownApproach: "accept",
        retrofitInstallRisk: true,
      });
      state.flags.currentAreaId = "shop";
      window.showRegionalMap();
      return document.querySelector("#modal-backdrop")?.innerText || "";
    });
    assert(retrofitRouteCard.includes("Burlington County Retrofit Install"), "Retrofit route card should use the install variant after walkdown closeout");
    assert(retrofitRouteCard.includes("Walkdown result: pathway accepted") && retrofitRouteCard.includes("Install branch: Inherited pathway risk"), "Retrofit route card should explain the walkdown-to-install branch");
    assert(retrofitRouteCard.includes("Required tools:") && retrofitRouteCard.includes("Recommended tools:"), "Retrofit route card should show route tool prep");

    const retrofitRoutePrep = await page.evaluate(() => {
      window.startGame("prototype-tech");
      const state = window.AV_TECH_RPG_DEBUG.state;
      Object.assign(state.flags, {
        finished: true,
        metJosh: true,
        serviceComplete: true,
        joshServiceDebriefed: true,
        conshohockenFollowupComplete: true,
        surveyComplete: true,
        commissioningComplete: true,
        warehouseComplete: true,
        secureAccessComplete: true,
        handoffComplete: true,
        systemsComplete: true,
        travelComplete: true,
        retrofitWalkdownComplete: true,
        retrofitWalkdownApproach: "accept",
        retrofitInstallRisk: true,
        retrofitInstallBranch: "risk",
      });
      state.flags.currentAreaId = "shop";
      window.showRoutePrepModal("burlingtonRetrofitWalkdown");
      return document.querySelector("#modal-backdrop")?.innerText || "";
    });
    assert(retrofitRoutePrep.toLowerCase().includes("route prep") && retrofitRoutePrep.includes("Saved walkdown result") && retrofitRoutePrep.includes("Install branch"), "Retrofit route prep should show saved walkdown branch rows");
    assert(retrofitRoutePrep.includes("Why this is different today") && retrofitRoutePrep.includes("Inherited pathway risk"), "Retrofit route prep should show branch task modifiers before driving");
    assert(retrofitRoutePrep.includes("Required prep") && retrofitRoutePrep.includes("Recommended prep"), "Retrofit route prep should show branch prep");

    await page.evaluate(() => {
      window.startGame("prototype-tech");
      const state = window.AV_TECH_RPG_DEBUG.state;
      state.flags.finished = true;
      state.flags.currentAreaId = "shop";
      window.showServiceDispatchPreview();
    });
    await assertModalIncludes(page, [
      "Field Task Checks",
      "Verify signal path",
      "signal-path verification",
      "Risk: unlabeled coupler",
      "Install replacement display",
      "display install",
    ], "service field task preview");

    const jobPressureHelpers = await page.evaluate(() => {
      window.startGame("prototype-tech");
      const state = window.AV_TECH_RPG_DEBUG.state;
      const startingEnergy = state.energy;
      const startingClients = state.reputation.clients;
      const cleanOutcome = window.resolvePressureResponseOutcome({
        energyCost: 2,
        result: "Held the room steady.",
        reputation: { clients: 1 },
        stat: "documentedTaskRisks",
        incidentChance: 0.5,
        incidentResult: "The room noticed the shortcut.",
        incidentReputation: { clients: -2 },
        incidentBurnout: 1,
        incidentFlags: { smokePressureIncident: true },
      }, 0.9);
      const afterClean = {
        energy: state.energy,
        clients: state.reputation.clients,
        stat: state.stats.documentedTaskRisks,
        choices: state.stats.fieldTaskChoicesMade,
      };
      const incidentOutcome = window.resolvePressureResponseOutcome({
        energyCost: 1,
        result: "This should not display.",
        reputation: { clients: 5 },
        stat: "documentedTaskRisks",
        incidentChance: 0.5,
        incidentResult: "The quick response created smoke-test pressure.",
        incidentReputation: { clients: -2 },
        incidentBurnout: 1,
        incidentFlags: { smokePressureIncident: true },
      }, 0.1);
      const conditions = [
        { id: "alpha" },
        { id: "bravo" },
        { id: "charlie" },
      ];
      return {
        chanceText: window.formatChance(0.35),
        firstRoll: window.getRolledPressureConditionIds(conditions, 12345, { limit: 2 }).join(","),
        secondRoll: window.getRolledPressureConditionIds(conditions, 12345, { limit: 2 }).join(","),
        incidentHit: window.rollImmediatePressureIncident({ incidentChance: 0.4 }, 0.2)?.happened,
        incidentMiss: window.rollImmediatePressureIncident({ incidentChance: 0.4 }, 0.8)?.happened,
        incidentId: window.getPressureIncidentId({ conditionId: "room", actionId: "quick" }, 0),
        cleanOutcome,
        incidentOutcome,
        startingEnergy,
        startingClients,
        afterClean,
        finalEnergy: state.energy,
        finalClients: state.reputation.clients,
        finalBurnout: state.burnout,
        finalStat: state.stats.documentedTaskRisks,
        finalChoices: state.stats.fieldTaskChoicesMade,
        incidentFlag: state.flags.smokePressureIncident,
      };
    });
    assert(jobPressureHelpers.chanceText === "35%", "Job pressure helper should format readable odds");
    assert(jobPressureHelpers.firstRoll === jobPressureHelpers.secondRoll && jobPressureHelpers.firstRoll.split(",").length === 2, "Job pressure helper should roll saved conditions deterministically");
    assert(jobPressureHelpers.incidentHit === true && jobPressureHelpers.incidentMiss === false, "Job pressure helper should resolve immediate incidents from chance rolls");
    assert(jobPressureHelpers.incidentId === "room-quick-1", "Job pressure helper should provide stable incident IDs");
    assert(jobPressureHelpers.cleanOutcome.incidentHappened === false && jobPressureHelpers.cleanOutcome.controlled === true, "Pressure response helper should mark controlled non-incidents");
    assert(jobPressureHelpers.afterClean.energy === jobPressureHelpers.startingEnergy - 2 && jobPressureHelpers.afterClean.clients === jobPressureHelpers.startingClients + 1 && jobPressureHelpers.afterClean.stat === 1, "Pressure response helper should apply clean response energy, reputation, and stat changes");
    assert(jobPressureHelpers.incidentOutcome.incidentHappened === true && jobPressureHelpers.incidentOutcome.controlled === false, "Pressure response helper should mark incident outcomes");
    assert(jobPressureHelpers.finalEnergy === jobPressureHelpers.startingEnergy - 3 && jobPressureHelpers.finalClients === jobPressureHelpers.startingClients - 1 && jobPressureHelpers.finalBurnout === 1, "Pressure response helper should apply incident energy, reputation, and burnout changes");
    assert(jobPressureHelpers.finalStat === 1 && jobPressureHelpers.finalChoices === 2 && jobPressureHelpers.incidentFlag === true, "Pressure response helper should keep failed incident stats separate while recording choices and flags");

    const serviceConditionGameplay = await page.evaluate(() => {
      window.startGame("prototype-tech");
      const state = window.AV_TECH_RPG_DEBUG.state;
      window.enterScene("serviceOffice");
      state.flags.servicePreparation = "contact";
      state.flags.serviceRoomConditions = ["mislabeled-input", "flaky-replacement-display"];
      window.ensureServiceRoomConditions();
      const rolledConditions = [...state.flags.serviceRoomConditions];
      const knownFromPrep = state.flags.serviceKnownRoomConditions.includes("mislabeled-input");
      state.flags.serviceBrief = true;
      window.showServiceClientContext();
      const clientText = document.querySelector("#modal-backdrop")?.innerText || "";
      const knownAfterClient = [...state.flags.serviceKnownRoomConditions];
      state.flags.serviceInspected = true;
      const adjustedSignal = window.getServiceAdjustedCheck(window.getServiceCheckById("signal-path"));
      window.chooseServiceApproach("verify");
      const signalResult = state.flags.fieldTaskResults?.["service-signal-path"];
      state.carry = ["replacement-display"];
      const adjustedInstall = window.getServiceAdjustedCheck(window.getServiceInstallCheck(state.carry));
      return {
        rolledConditions,
        knownFromPrep,
        clientRevealedSecond: knownAfterClient.length === 2,
        clientText,
        signalDifficulty: adjustedSignal.difficulty,
        resultDifficulty: signalResult?.difficulty || 0,
        signalModifierIds: (adjustedSignal.taskModifiers || []).map((modifier) => modifier.id),
        resultModifierIds: (signalResult?.modifiersApplied || []).map((modifier) => modifier.id),
        installDifficulty: adjustedInstall.difficulty,
        installModifierIds: (adjustedInstall.taskModifiers || []).map((modifier) => modifier.id),
      };
    });
    assert(serviceConditionGameplay.rolledConditions.length === 2, "Service room should roll two saved conditions");
    assert(serviceConditionGameplay.knownFromPrep, "Service prep should reveal a relevant room condition");
    assert(serviceConditionGameplay.clientRevealedSecond, "Client context should reveal another room condition");
    assert(serviceConditionGameplay.clientText.includes("ROOM CONDITIONS"), "Client context should show room condition information");
    assert(serviceConditionGameplay.signalDifficulty === 4 && serviceConditionGameplay.resultDifficulty === 4, "Service room base signal-path difficulty should stay readable while modifiers carry pressure");
    assert(serviceConditionGameplay.signalModifierIds.length && serviceConditionGameplay.resultModifierIds.some((id) => id.startsWith("service-room-")), "Service room conditions should apply signal-path task modifiers");
    assert(serviceConditionGameplay.installDifficulty === 4 && serviceConditionGameplay.installModifierIds.length, "Service room conditions should apply install task modifiers without hiding the base difficulty");

    const serviceConditionChoices = await page.evaluate(() => {
      window.startGame("prototype-tech");
      const state = window.AV_TECH_RPG_DEBUG.state;
      window.enterScene("serviceOffice");
      state.flags.serviceRoomConditions = ["mislabeled-input"];
      state.flags.serviceKnownRoomConditions = ["mislabeled-input"];
      state.flags.serviceBrief = true;
      state.flags.serviceInspected = true;
      const labels = window.getInteractions().map((interaction) => interaction.label);
      const objective = window.getObjective();
      const beforeDifficulty = window.getServiceAdjustedCheck(window.getServiceCheckById("signal-path")).difficulty;
      const beforeModifierCount = window.getServiceAdjustedCheck(window.getServiceCheckById("signal-path")).taskModifiers.length;
      window.showServiceConditionResponseChoice("mislabeled-input");
      const choiceText = document.querySelector("#modal-backdrop")?.innerText || "";
      const beforeEnergy = state.energy;
      window.resolveServiceConditionResponse("mislabeled-input", "document");
      const afterDifficulty = window.getServiceAdjustedCheck(window.getServiceCheckById("signal-path")).difficulty;
      const afterModifierCount = window.getServiceAdjustedCheck(window.getServiceCheckById("signal-path")).taskModifiers.length;
      const documentText = document.querySelector("#modal-backdrop")?.innerText || "";
      const documentEnergyChanged = state.energy !== beforeEnergy;

      window.startGame("prototype-tech");
      const incidentState = window.AV_TECH_RPG_DEBUG.state;
      window.enterScene("serviceOffice");
      incidentState.flags.serviceRoomConditions = ["mislabeled-input"];
      incidentState.flags.serviceKnownRoomConditions = ["mislabeled-input"];
      incidentState.flags.serviceBrief = true;
      incidentState.flags.serviceInspected = true;
      window.resolveServiceConditionResponse("mislabeled-input", "quick-trace", 0.2);
      const incidentText = document.querySelector("#modal-backdrop")?.innerText || "";
      const incidentResolution = incidentState.flags.serviceConditionResolutions?.["mislabeled-input"];
      const incidentLabels = window.getInteractions().map((interaction) => interaction.label);
      const incidentObjective = window.getObjective();
      incidentState.flags.serviceApproach = "rush";
      incidentState.serviceInstalled = window.GAME_CONTENT.serviceDispatch.swapItems.map((item) => item.id);
      window.showServiceResults();
      const incidentCloseoutText = document.querySelector("#modal-backdrop")?.innerText || "";
      const incidentRiskSaved = Boolean(incidentState.flags.returnTripRisks?.conshohockenServiceRoomPressure);

      window.startGame("prototype-tech");
      const recoveryState = window.AV_TECH_RPG_DEBUG.state;
      window.enterScene("serviceOffice");
      recoveryState.flags.serviceRoomConditions = ["mislabeled-input"];
      recoveryState.flags.serviceKnownRoomConditions = ["mislabeled-input"];
      recoveryState.flags.serviceBrief = true;
      recoveryState.flags.serviceInspected = true;
      window.resolveServiceConditionResponse("mislabeled-input", "quick-trace", 0.2);
      const recoveryIncidentId = recoveryState.flags.serviceRoomIncidents?.[0]?.id;
      window.showServiceIncidentRecoveryChoice();
      const recoveryChoiceText = document.querySelector("#modal-backdrop")?.innerText || "";
      const beforeRecoveryEnergy = recoveryState.energy;
      window.resolveServiceIncidentRecovery(recoveryIncidentId, "stabilize");
      const recoveryText = document.querySelector("#modal-backdrop")?.innerText || "";
      const recoveredIncident = recoveryState.flags.serviceRoomIncidents?.[0];
      const recoveredResolution = recoveryState.flags.serviceConditionResolutions?.["mislabeled-input"];
      const recoveryEnergyChanged = recoveryState.energy !== beforeRecoveryEnergy;
      recoveryState.flags.serviceApproach = "rush";
      recoveryState.serviceInstalled = window.GAME_CONTENT.serviceDispatch.swapItems.map((item) => item.id);
      window.showServiceResults();
      const recoveredCloseoutText = document.querySelector("#modal-backdrop")?.innerText || "";
      const recoveredRiskSaved = Boolean(recoveryState.flags.returnTripRisks?.conshohockenServiceRoomPressure);

      window.startGame("prototype-tech");
      const successState = window.AV_TECH_RPG_DEBUG.state;
      window.enterScene("serviceOffice");
      successState.flags.serviceRoomConditions = ["mislabeled-input"];
      successState.flags.serviceKnownRoomConditions = ["mislabeled-input"];
      successState.flags.serviceBrief = true;
      successState.flags.serviceInspected = true;
      window.resolveServiceConditionResponse("mislabeled-input", "quick-trace", 0.9);
      const successResolution = successState.flags.serviceConditionResolutions?.["mislabeled-input"];
      successState.flags.serviceApproach = "rush";
      successState.serviceInstalled = window.GAME_CONTENT.serviceDispatch.swapItems.map((item) => item.id);
      window.showServiceResults();
      const successCloseoutText = document.querySelector("#modal-backdrop")?.innerText || "";
      return {
        labels,
        objective,
        choiceText,
        beforeDifficulty,
        afterDifficulty,
        beforeModifierCount,
        afterModifierCount,
        energyChanged: documentEnergyChanged,
        documentText,
        incidentText,
        incidentResolution,
        incidentLabels,
        incidentObjective,
        incidentCloseoutText,
        incidentRiskSaved,
        recoveryChoiceText,
        recoveryText,
        recoveredIncident,
        recoveredResolution,
        recoveryEnergyChanged,
        recoveredCloseoutText,
        recoveredRiskSaved,
        successResolution,
        successCloseoutText,
        successRiskSaved: Boolean(successState.flags.returnTripRisks?.conshohockenServiceRoomPressure),
      };
    });
    assert(serviceConditionChoices.labels.includes("Handle room pressure"), "Known service pressure should create a visible room decision");
    assert(serviceConditionChoices.objective.includes("known room pressure"), "Objective should point to known service pressure decisions");
    assert(serviceConditionChoices.choiceText.includes("risky shortcut"), "Quick service responses should show qualitative incident risk");
    assert(serviceConditionChoices.afterDifficulty === serviceConditionChoices.beforeDifficulty && serviceConditionChoices.afterModifierCount < serviceConditionChoices.beforeModifierCount, "Careful service response should remove controlled condition modifiers from later checks");
    assert(serviceConditionChoices.energyChanged, "Careful service response should spend energy now");
    assert(serviceConditionChoices.documentText.includes("Pressure Controlled"), "Careful service response should show immediate resolution");
    assert(serviceConditionChoices.incidentText.includes("Immediate Problem") && serviceConditionChoices.incidentText.includes("risk happened in the room"), "Failed quick response should create visible immediate pressure");
    assert(serviceConditionChoices.incidentResolution?.incident && !serviceConditionChoices.incidentResolution?.controlled, "Failed quick response should save unresolved incident state");
    assert(serviceConditionChoices.incidentLabels.includes("Recover room incident"), "Immediate service pressure should create a visible recovery action");
    assert(serviceConditionChoices.incidentObjective.includes("visible room incident"), "Objective should point to immediate incident recovery");
    assert(serviceConditionChoices.incidentCloseoutText.toLowerCase().includes("immediate site pressure") && serviceConditionChoices.incidentRiskSaved, "Immediate service pressure should carry into closeout risk");
    assert(serviceConditionChoices.recoveryChoiceText.includes("Stabilize room and own the delay"), "Incident recovery should show a recovery tradeoff");
    assert(serviceConditionChoices.recoveryText.includes("Incident Recovered") && serviceConditionChoices.recoveredIncident?.recovered, "Incident recovery should visibly recover the site problem");
    assert(serviceConditionChoices.recoveredResolution?.controlled && serviceConditionChoices.recoveryEnergyChanged, "Incident recovery should control the condition and spend energy");
    assert(serviceConditionChoices.recoveredCloseoutText.includes("Return-trip risk\nControlled") && !serviceConditionChoices.recoveredRiskSaved, "Recovered incident should avoid callback pressure");
    assert(serviceConditionChoices.successResolution?.controlled && !serviceConditionChoices.successResolution?.incident, "Successful quick response should save controlled state");
    assert(serviceConditionChoices.successCloseoutText.toLowerCase().includes("quick choices held") && !serviceConditionChoices.successRiskSaved, "Lucky quick service response should avoid callback pressure");

    const serviceSignalTask = await page.evaluate(() => {
      window.startGame("prototype-tech");
      const state = window.AV_TECH_RPG_DEBUG.state;
      state.flags.servicePreparation = "josh";
      window.enterScene("serviceOffice");
      const beforeEnergy = state.energy;
      window.chooseServiceApproach("verify");
      const modalText = document.querySelector("#modal-backdrop")?.innerText || "";
      const result = state.flags.fieldTaskResults?.["service-signal-path"];
      return {
        resultSaved: Boolean(result),
        resultType: result?.type || "",
        resultSkill: result?.skillId || "",
        approach: state.flags.serviceApproach || "",
        energyChanged: state.energy !== beforeEnergy,
        showsResultRows: modalText.includes("Task type") && modalText.includes("Risk tracked") && modalText.includes("unlabeled coupler"),
      };
    });
    assert(serviceSignalTask.resultSaved, "Service signal-path check should save field-task result data");
    assert(serviceSignalTask.resultType === "signal-path verification", "Service signal-path check should use data-backed task type");
    assert(serviceSignalTask.resultSkill === "troubleshooting", "Service signal-path check should use data-backed skill");
    assert(serviceSignalTask.approach === "verify", "Service signal-path check should set the service approach");
    assert(serviceSignalTask.energyChanged, "Service signal-path check should affect energy");
    assert(serviceSignalTask.showsResultRows, "Service signal-path check should show structured result rows");

    const serviceInstallTask = await page.evaluate(() => {
      window.startGame("prototype-tech");
      const state = window.AV_TECH_RPG_DEBUG.state;
      window.enterScene("serviceOffice");
      state.flags.serviceApproach = "verify";
      state.carry = ["replacement-display"];
      const beforeEnergy = state.energy;
      window.installServicePart();
      const modalText = document.querySelector("#modal-backdrop")?.innerText || "";
      const result = state.flags.fieldTaskResults?.["service-install-replacement-display"];
      return {
        installed: state.serviceInstalled.includes("replacement-display"),
        resultSaved: Boolean(result),
        resultType: result?.type || "",
        resultSkill: result?.skillId || "",
        energyChanged: state.energy !== beforeEnergy,
        showsResultRows: modalText.includes("Task type") && modalText.includes("Risk tracked") && modalText.includes("strained display swap"),
      };
    });
    assert(serviceInstallTask.installed, "Service install should keep installed-item progress");
    assert(serviceInstallTask.resultSaved, "Service install should save field-task result data");
    assert(serviceInstallTask.resultType === "display install", "Service install should use data-backed task type");
    assert(serviceInstallTask.resultSkill === "install", "Service install should use data-backed skill");
    assert(serviceInstallTask.energyChanged, "Service install should affect energy");
    assert(serviceInstallTask.showsResultRows, "Service install should show structured result rows");

    const serviceRoomSequence = await page.evaluate(() => {
      window.startGame("prototype-tech");
      const state = window.AV_TECH_RPG_DEBUG.state;
      state.flags.finished = true;
      state.flags.reward = "toolBag";
      window.enterScene("serviceOffice");
      state.flags.serviceBrief = true;
      state.flags.serviceInspected = true;
      state.flags.serviceApproach = "verify";
      state.flags.serviceRoomConditions = ["mislabeled-input"];
      state.flags.serviceKnownRoomConditions = ["mislabeled-input"];
      state.flags.serviceConditionResolutions = {
        "mislabeled-input": { conditionId: "mislabeled-input", controlled: true },
      };
      state.carry = window.GAME_CONTENT.serviceDispatch.swapItems.map((item) => item.id);
      window.installServicePart();
      const installModalText = document.querySelector("#modal-backdrop")?.innerText || "";
      const completeAfterInstall = Boolean(state.flags.serviceComplete);
      window.closeModal();
      window.render();
      const primary = window.getPrimaryInteraction();
      const primaryMarker = [...document.querySelectorAll(".interaction-marker")]
        .find((marker) => marker.classList.contains("primary-objective-marker"));
      const objective = window.resolveCurrentObjective().text;
      window.resumeRequiredPrompt();
      const modalAfterResume = document.querySelector("#modal-backdrop")?.classList.contains("hidden") === false;
      window.getInteractions().find((interaction) => interaction.id === "service-client")?.action();
      const closeoutText = document.querySelector("#modal-backdrop")?.innerText || "";
      const completeAfterClient = Boolean(state.flags.serviceComplete);

      window.startGame("prototype-tech");
      const guardState = window.AV_TECH_RPG_DEBUG.state;
      window.enterScene("serviceOffice");
      guardState.flags.serviceBrief = true;
      guardState.flags.serviceInspected = true;
      guardState.flags.serviceRoomIncidents = [{
        id: "single-use-incident",
        conditionId: "client-time-pressure",
        conditionLabel: "Client time pressure",
        detail: "The client is waiting.",
        incidentFlags: ["serviceClientAngry"],
        status: "open",
      }];
      window.resolveServiceIncidentRecovery("single-use-incident", "carry");
      const afterFirst = {
        energy: guardState.energy,
        choices: guardState.stats.fieldTaskChoicesMade,
        action: guardState.flags.serviceRoomIncidents[0].recoveryAction,
        recoverable: window.getRecoverableServiceRoomIncidents().length,
      };
      window.resolveServiceIncidentRecovery("single-use-incident", "stabilize");
      return {
        installModalText,
        completeAfterInstall,
        primaryId: primary?.id || "",
        primaryMarkerText: primaryMarker?.textContent || "",
        objective,
        modalAfterResume,
        completeAfterClient,
        closeoutText,
        afterFirst,
        afterSecond: {
          energy: guardState.energy,
          choices: guardState.stats.fieldTaskChoicesMade,
          action: guardState.flags.serviceRoomIncidents[0].recoveryAction,
        },
      };
    });
    assert(serviceRoomSequence.installModalText.includes("Review The Room") && !serviceRoomSequence.completeAfterInstall, "Final service install should return control to the room before closeout");
    assert(serviceRoomSequence.primaryId === "service-client" && serviceRoomSequence.primaryMarkerText === "CLIENT", "Client should become the highlighted closeout interaction after install");
    assert(serviceRoomSequence.objective.includes("close out the service call"), "Current objective should direct the player to physical client closeout");
    assert(!serviceRoomSequence.modalAfterResume, "Reloading the completed install state should not auto-open service closeout");
    assert(
      serviceRoomSequence.completeAfterClient && /service call complete/i.test(serviceRoomSequence.closeoutText),
      `Client interaction should complete the service closeout (complete=${serviceRoomSequence.completeAfterClient}, modal=${serviceRoomSequence.closeoutText.slice(0, 120)})`,
    );
    assert(serviceRoomSequence.afterFirst.recoverable === 0 && serviceRoomSequence.afterFirst.action === "carry", "Carried room pressure should remove the recovery marker after one decision");
    assert(serviceRoomSequence.afterSecond.energy === serviceRoomSequence.afterFirst.energy && serviceRoomSequence.afterSecond.choices === serviceRoomSequence.afterFirst.choices && serviceRoomSequence.afterSecond.action === "carry", "Room incident recovery decisions should be single use");

    const serviceConditionCloseout = await page.evaluate(() => {
      window.startGame("prototype-tech");
      const state = window.AV_TECH_RPG_DEBUG.state;
      window.enterScene("serviceOffice");
      state.flags.serviceRoomConditions = ["mislabeled-input", "flaky-replacement-display"];
      state.flags.serviceKnownRoomConditions = ["mislabeled-input"];
      state.flags.serviceApproach = "rush";
      state.serviceInstalled = window.GAME_CONTENT.serviceDispatch.swapItems.map((item) => item.id);
      window.showServiceResults();
      const closeoutText = document.querySelector("#modal-backdrop")?.innerText || "";
      window.usePortal("serviceOfficeToShop");
      const departureText = document.querySelector("#modal-backdrop")?.innerText || "";
      return {
        riskSaved: Boolean(state.flags.returnTripRisks?.conshohockenServiceRoomPressure),
        callbackCount: state.stats.callbacks,
        closeoutText,
        departureText,
      };
    });
    assert(serviceConditionCloseout.riskSaved, "Risky service closeout should save named Conshohocken return-trip pressure");
    assert(serviceConditionCloseout.callbackCount === 1, "Risky service closeout should add callback pressure");
    assert(serviceConditionCloseout.closeoutText.toLowerCase().includes("room conditions") && serviceConditionCloseout.closeoutText.includes("Unresolved room pressure"), "Service closeout should explain unresolved room conditions");
    assert(serviceConditionCloseout.departureText.includes("Conshohocken") && serviceConditionCloseout.departureText.toLowerCase().includes("risk carried back"), "Return marker should carry service room pressure back to the shop");

    await page.evaluate(() => {
      window.startGame("prototype-tech");
      const state = window.AV_TECH_RPG_DEBUG.state;
      state.flags.finished = true;
      state.flags.serviceComplete = true;
      state.flags.joshServiceDebriefed = true;
      state.flags.conshohockenFollowupComplete = true;
      state.flags.currentAreaId = "shop";
      window.showSurveyDispatchPreview();
    });
    await assertModalIncludes(page, ["Field Task Checks", "Freight elevator opening", "access survey", "Risk: thin access measurement"], "survey field task preview");

    await page.evaluate(() => {
      window.startGame("prototype-tech");
      const state = window.AV_TECH_RPG_DEBUG.state;
      state.flags.warehouseComplete = true;
      state.flags.currentAreaId = "shop";
      window.showSecureAccessDispatchPreview();
    });
    await assertModalIncludes(page, [
      "Field Task Checks",
      "Security gate",
      "visitor-list check",
      "Risk: visitor-list mismatch",
      "Find the correct rack unit",
      "rack record",
    ], "secure access field task preview");

    const secureAccessTask = await page.evaluate(() => {
      window.startGame("prototype-tech");
      const state = window.AV_TECH_RPG_DEBUG.state;
      state.flags.secureAccessPreparation = "review";
      window.enterScene("navyYardAccess");
      const beforeEnergy = state.energy;
      window.inspectSecureAccessCondition("gate");
      const modalText = document.querySelector("#modal-backdrop")?.innerText || "";
      const result = state.flags.fieldTaskResults?.["secure-access-gate"];
      return {
        inspected: state.secureAccessChecks.includes("gate"),
        resultSaved: Boolean(result),
        resultType: result?.type || "",
        resultSkill: result?.skillId || "",
        energyChanged: state.energy !== beforeEnergy,
        showsResultRows: modalText.includes("Task type") && modalText.includes("Risk tracked") && modalText.includes("visitor-list mismatch"),
      };
    });
    assert(secureAccessTask.inspected, "Secure access check should complete");
    assert(secureAccessTask.resultSaved, "Secure access check should save field-task result data");
    assert(secureAccessTask.resultType === "visitor-list check", "Secure access check should use data-backed task type");
    assert(secureAccessTask.resultSkill === "documentation", "Secure access check should use data-backed skill");
    assert(secureAccessTask.energyChanged, "Secure access check should affect energy");
    assert(secureAccessTask.showsResultRows, "Secure access check should show structured result rows");

    const surveyTask = await page.evaluate(() => {
      window.startGame("prototype-tech");
      const state = window.AV_TECH_RPG_DEBUG.state;
      state.flags.surveyPreparation = "measure";
      window.enterScene("universitySurvey");
      const beforeEnergy = state.energy;
      window.inspectSurveyConstraint("elevator");
      const modalText = document.querySelector("#modal-backdrop")?.innerText || "";
      const result = state.flags.fieldTaskResults?.["survey-elevator"];
      return {
        inspected: state.surveyInspections.includes("elevator"),
        resultSaved: Boolean(result),
        resultType: result?.type || "",
        resultSkill: result?.skillId || "",
        energyChanged: state.energy !== beforeEnergy,
        showsResultRows: modalText.includes("Task type") && modalText.includes("Risk tracked") && modalText.includes("thin access measurement"),
      };
    });
    assert(surveyTask.inspected, "Survey inspection should complete");
    assert(surveyTask.resultSaved, "Survey inspection should save field-task result data");
    assert(surveyTask.resultType === "access survey", "Survey inspection should use data-backed task type");
    assert(surveyTask.resultSkill === "documentation", "Survey inspection should use data-backed skill");
    assert(surveyTask.energyChanged, "Survey inspection should affect energy");
    assert(surveyTask.showsResultRows, "Survey inspection should show structured result rows");

    const surveyCloseoutGuard = await page.evaluate(() => {
      window.startGame("prototype-tech");
      const state = window.AV_TECH_RPG_DEBUG.state;
      window.enterScene("universitySurvey");
      state.flags.surveyBrief = true;
      state.flags.surveyPreparation = "sketch";
      state.surveyInspections = window.GAME_CONTENT.surveyDispatch.inspections.map((item) => item.id);
      state.player = { x: 310, y: 185 };
      window.render();
      window.finishSurvey("document");
      const firstSnapshot = {
        energy: state.energy,
        cash: state.cash,
        xp: state.xp,
        approach: state.flags.surveyApproach,
        surveysCompleted: state.stats.surveysCompleted,
        accessRisksDocumented: state.stats.accessRisksDocumented,
        quotesTrustedAnyway: state.stats.quotesTrustedAnyway,
      };
      window.closeModal();
      state.player = { x: 310, y: 185 };
      window.render();
      const nearbyAfterComplete = document.querySelector("#nearby-card")?.textContent || "";
      const interactAfterComplete = document.querySelector("#interact-button")?.textContent || "";
      const interactionsAfterComplete = window.getInteractions().map((item) => item.label);
      window.interact();
      const contactModalText = document.querySelector("#modal-backdrop")?.innerText || "";
      window.closeModal();
      window.finishSurvey("pushback");
      const repeatModalText = document.querySelector("#modal-backdrop")?.innerText || "";
      return {
        firstSnapshot,
        afterRepeat: {
          energy: state.energy,
          cash: state.cash,
          xp: state.xp,
          approach: state.flags.surveyApproach,
          surveysCompleted: state.stats.surveysCompleted,
          accessRisksDocumented: state.stats.accessRisksDocumented,
          quotesTrustedAnyway: state.stats.quotesTrustedAnyway,
        },
        nearbyAfterComplete,
        interactAfterComplete,
        interactionsAfterComplete,
        contactModalText,
        repeatModalText,
      };
    });
    assert(surveyCloseoutGuard.firstSnapshot.approach === "document", "Survey should record the first closeout approach");
    assert(surveyCloseoutGuard.afterRepeat.approach === "document", "Survey repeat attempts should not overwrite the closeout approach");
    assert(surveyCloseoutGuard.afterRepeat.energy === surveyCloseoutGuard.firstSnapshot.energy, "Survey repeat attempts should not spend energy");
    assert(surveyCloseoutGuard.afterRepeat.cash === surveyCloseoutGuard.firstSnapshot.cash, "Survey repeat attempts should not pay wages again");
    assert(surveyCloseoutGuard.afterRepeat.xp === surveyCloseoutGuard.firstSnapshot.xp, "Survey repeat attempts should not award XP again");
    assert(surveyCloseoutGuard.afterRepeat.surveysCompleted === surveyCloseoutGuard.firstSnapshot.surveysCompleted, "Survey repeat attempts should not increment survey stats again");
    assert(surveyCloseoutGuard.afterRepeat.accessRisksDocumented === surveyCloseoutGuard.firstSnapshot.accessRisksDocumented, "Survey repeat attempts should not increment access-risk stats again");
    assert(surveyCloseoutGuard.afterRepeat.quotesTrustedAnyway === surveyCloseoutGuard.firstSnapshot.quotesTrustedAnyway, "Survey repeat attempts should not increment shortcut stats");
    assert(surveyCloseoutGuard.nearbyAfterComplete.includes("COMPLETED") && surveyCloseoutGuard.nearbyAfterComplete.includes("Use the site exit"), "Completed survey contact should show review-only task state");
    assert(surveyCloseoutGuard.interactAfterComplete.includes("Review filed survey"), "Completed survey contact should no longer offer fresh report filing");
    assert(!surveyCloseoutGuard.interactionsAfterComplete.some((label) => label.startsWith("Inspect ")), "Completed survey should not keep inspection hotspots active");
    assert(surveyCloseoutGuard.contactModalText.includes("already filed"), "Completed survey contact should open the filed-report review");
    assert(!surveyCloseoutGuard.contactModalText.includes("Call sales and push back"), "Completed survey contact should not show consequence choices again");
    assert(surveyCloseoutGuard.repeatModalText.includes("already filed"), "Repeated survey closeout should open the filed-report review");
    assert(!surveyCloseoutGuard.repeatModalText.includes("Call sales and push back"), "Repeated survey closeout should not show consequence choices again");

    const completedSceneReturnGuards = await page.evaluate(() => {
      const scenarios = [
        {
          id: "commissioning-complete",
          scene: "southPhillyCommissioning",
          approachFlag: "commissioningApproach",
          firstApproach: "repair",
          repeatLabel: "Mark room passed",
          setup: (state) => {
            state.flags.commissioningBrief = true;
            state.flags.commissioningComplete = true;
            state.flags.commissioningApproach = "repair";
            state.flags.commissioningTerminationAction = "repair";
            state.commissioningChecks = window.GAME_CONTENT.commissioningDispatch.checks.map((item) => item.id);
          },
          repeat: () => window.finishCommissioning("pass"),
        },
        {
          id: "warranty-complete",
          scene: "warrantyReturn",
          approachFlag: "callbackCleanupApproach",
          firstApproach: "root",
          repeatLabel: "Bandage it",
          setup: (state) => {
            state.flags.callbackCleanupBrief = true;
            state.flags.callbackCleanupComplete = true;
            state.flags.callbackCleanupApproach = "root";
            state.callbackCleanupChecks = window.GAME_CONTENT.callbackCleanupDispatch.checks.map((item) => item.id);
          },
          repeat: () => window.finishCallbackCleanup("bandage"),
        },
        {
          id: "handoff-complete",
          scene: "executiveHandoff",
          approachFlag: "handoffApproach",
          firstApproach: "patient",
          repeatLabel: "Quick demo",
          setup: (state) => {
            state.flags.handoffBrief = true;
            state.flags.handoffComplete = true;
            state.flags.handoffApproach = "patient";
            state.handoffChecks = window.GAME_CONTENT.handoffDispatch.checks.map((item) => item.id);
          },
          repeat: () => window.finishHandoff("quick"),
        },
        {
          id: "systems-complete",
          scene: "systemsService",
          approachFlag: "systemsApproach",
          firstApproach: "document",
          repeatLabel: "Quick reboot",
          setup: (state) => {
            state.flags.systemsBrief = true;
            state.flags.systemsComplete = true;
            state.flags.systemsApproach = "document";
            state.systemsChecks = window.GAME_CONTENT.systemsDispatch.checks.map((item) => item.id);
          },
          repeat: () => window.finishSystemsService("reboot"),
        },
      ];
      return scenarios.map((scenario) => {
        window.startGame("prototype-tech");
        const state = window.AV_TECH_RPG_DEBUG.state;
        scenario.setup(state);
        window.enterScene(scenario.scene);
        window.render();
        const interactions = window.getInteractions().map((item) => ({
          label: item.label,
          marker: window.getInteractionMarkerText(item),
          task: window.getInteractionTaskState(item)?.label || "",
        }));
        const before = {
          energy: state.energy,
          cash: state.cash,
          xp: state.xp,
          approach: state.flags[scenario.approachFlag],
          stats: JSON.stringify(state.stats),
        };
        scenario.repeat();
        const modalText = document.querySelector("#modal-backdrop")?.innerText || "";
        return {
          id: scenario.id,
          interactions,
          objective: window.getObjective(),
          modalText,
          repeatLabel: scenario.repeatLabel,
          stateUnchanged: state.energy === before.energy
            && state.cash === before.cash
            && state.xp === before.xp
            && state.flags[scenario.approachFlag] === before.approach
            && JSON.stringify(state.stats) === before.stats,
        };
      });
    });
    for (const guard of completedSceneReturnGuards) {
      assert(guard.objective.includes("return to Radnor Rack & Wire"), `${guard.id} should point players to the return route`);
      assert(guard.interactions.length === 1, `${guard.id} should only expose the return route after closeout`);
      assert(guard.interactions[0].marker === "RETURN" && guard.interactions[0].task === "READY", `${guard.id} should expose a ready RETURN marker`);
      assert(!guard.interactions.some((item) => /Close out|Talk to|Test|Review|Practice|Ask|Check|Verify|Compare|Read/.test(item.label)), `${guard.id} should not expose active job hotspots after closeout`);
      assert(guard.stateUnchanged, `${guard.id} stale closeout calls should not change player state`);
      assert(guard.modalText.includes("already closed out"), `${guard.id} stale closeout should show an already-complete review`);
      assert(!guard.modalText.includes(guard.repeatLabel), `${guard.id} stale closeout should not show the old consequence choice`);
    }

    const singleUseCloseoutGuards = await page.evaluate(() => {
      const scenarios = [
        {
          id: "tutorial-finish",
          scene: "client",
          staleLabel: "Dress the cables",
          setup: (state) => {
            state.flags.finished = true;
            state.flags.finishChoice = "tidy";
            state.flags.reward = "toolBag";
          },
          repeat: () => window.finishJob("rush"),
        },
        {
          id: "service-result",
          scene: "serviceOffice",
          staleLabel: "Service Call Complete",
          setup: (state) => {
            state.flags.serviceComplete = true;
            state.flags.serviceApproach = "verify";
            state.serviceInstalled = window.GAME_CONTENT.serviceDispatch.swapItems.map((item) => item.id);
          },
          repeat: () => window.showServiceResults(),
        },
        {
          id: "followup-closeout",
          scene: "serviceOffice",
          staleLabel: "Drop labels",
          setup: (state) => {
            state.flags.serviceComplete = true;
            state.flags.conshohockenFollowupStarted = true;
            state.flags.conshohockenFollowupComplete = true;
            state.flags.conshohockenFollowupApproach = "label";
          },
          repeat: () => window.finishConshohockenFollowup("drop"),
        },
        {
          id: "warehouse-closeout",
          scene: "shop",
          staleLabel: "leave the pile",
          setup: (state) => {
            state.flags.finished = true;
            state.flags.metJosh = true;
            state.flags.warehouseStarted = true;
            state.flags.warehouseComplete = true;
            state.flags.warehouseApproach = "label";
            state.warehouseChecks = window.GAME_CONTENT.warehouseDispatch.checks.map((item) => item.id);
          },
          repeat: () => window.finishWarehouseRun("handoff"),
        },
        {
          id: "secure-access-closeout",
          scene: "navyYardAccess",
          staleLabel: "eat the delay",
          setup: (state) => {
            state.flags.secureAccessComplete = true;
            state.flags.secureAccessApproach = "document";
            state.secureAccessChecks = window.GAME_CONTENT.secureAccessDispatch.checks.map((item) => item.id);
            state.secureAccessTaskChecks = window.GAME_CONTENT.secureAccessDispatch.taskChecks.map((item) => item.id);
          },
          repeat: () => window.finishSecureAccess("absorb"),
        },
        {
          id: "travel-closeout",
          scene: "shop",
          staleLabel: "Eat the toll",
          setup: (state) => {
            state.flags.finished = true;
            state.flags.metJosh = true;
            state.flags.travelComplete = true;
            state.flags.travelApproach = "receipt";
          },
          repeat: () => window.finishTravelDispatch("absorb"),
        },
        {
          id: "retrofit-walkdown-closeout",
          scene: "burlingtonRetrofitWalkdown",
          staleLabel: "Accept pathway",
          setup: (state) => {
            state.flags.retrofitWalkdownComplete = true;
            state.flags.retrofitWalkdownApproach = "document";
            state.retrofitWalkdownChecks = window.GAME_CONTENT.retrofitWalkdownDispatch.checks.map((item) => item.id);
          },
          repeat: () => window.finishRetrofitWalkdown("accept"),
        },
        {
          id: "retrofit-install-closeout",
          scene: "burlingtonRetrofitWalkdown",
          staleLabel: "quick install note",
          setup: (state) => {
            state.flags.retrofitWalkdownComplete = true;
            state.flags.retrofitInstallStarted = true;
            state.flags.retrofitInstallComplete = true;
            state.flags.retrofitInstallApproach = "record";
            state.flags.retrofitInstallBranch = "protected";
            state.retrofitInstallChecks = window.getRetrofitInstallChecks().map((item) => item.id);
          },
          repeat: () => window.finishRetrofitInstall("quick"),
        },
      ];
      return scenarios.map((scenario) => {
        window.startGame("prototype-tech");
        const state = window.AV_TECH_RPG_DEBUG.state;
        scenario.setup(state);
        window.enterScene(scenario.scene);
        window.render();
        const before = {
          energy: state.energy,
          cash: state.cash,
          xp: state.xp,
          burnout: state.burnout,
          jobsCompleted: state.jobsCompleted,
          stats: JSON.stringify(state.stats),
          flags: JSON.stringify(state.flags),
        };
        scenario.repeat();
        const after = {
          energy: state.energy,
          cash: state.cash,
          xp: state.xp,
          burnout: state.burnout,
          jobsCompleted: state.jobsCompleted,
          stats: JSON.stringify(state.stats),
          flags: JSON.stringify(state.flags),
        };
        return {
          id: scenario.id,
          staleLabel: scenario.staleLabel,
          unchanged: JSON.stringify(before) === JSON.stringify(after),
          modalText: document.querySelector("#modal-backdrop")?.innerText || "",
        };
      });
    });
    for (const guard of singleUseCloseoutGuards) {
      assert(guard.unchanged, `${guard.id} stale closeout should not mutate state`);
      assert(guard.modalText.includes("already closed out"), `${guard.id} stale closeout should show an already-complete review`);
      assert(!guard.modalText.toLowerCase().includes(guard.staleLabel.toLowerCase()), `${guard.id} stale closeout should not show the old choice copy`);
    }

    const boardStates = await page.evaluate(() => {
      function snapshot(label, setup) {
        window.startGame("prototype-tech");
        const state = window.AV_TECH_RPG_DEBUG.state;
        setup(state);
        window.enterScene("shop");
        window.render();
        const current = window.getCurrentDispatchBoardEntry?.();
        const blocked = window.getBlockedDispatchBoardEntry?.();
        const hud = window.getHudDispatchPresentation?.();
        return {
          label,
          current: current ? {
            id: current.id,
            routeId: current.routeId,
            title: current.title,
            boardStatus: current.boardStatus,
          } : null,
          blocked: blocked ? {
            id: blocked.id,
            reason: blocked.blockedReason,
            statusLabel: blocked.blockedStatusLabel || blocked.statusLabel,
          } : null,
          hud,
          objective: window.getObjective(),
          routeId: window.getCurrentDispatchRouteId(),
        };
      }
      return [
        snapshot("service", (state) => {
          state.flags.finished = true;
          state.flags.metJosh = true;
        }),
        snapshot("end-shift-suppresses-board", (state) => {
          state.flags.finished = true;
          state.flags.metJosh = true;
          state.flags.endShiftPending = true;
        }),
        snapshot("josh-blocked-followup", (state) => {
          state.flags.finished = true;
          state.flags.metJosh = true;
          state.flags.serviceStarted = true;
          state.flags.serviceComplete = true;
          state.flags.servicePaid = true;
          state.flags.joshServiceDebriefed = false;
        }),
        snapshot("training-blocked-followup", (state) => {
          state.flags.finished = true;
          state.flags.metJosh = true;
          state.flags.serviceStarted = true;
          state.flags.serviceComplete = true;
          state.flags.servicePaid = true;
          state.flags.joshServiceDebriefed = true;
          state.xp = 90;
          state.training = [];
        }),
        snapshot("travel-no-route", (state) => {
          state.flags.finished = true;
          state.flags.metJosh = true;
          state.flags.serviceComplete = true;
          state.flags.joshServiceDebriefed = true;
          state.flags.conshohockenFollowupComplete = true;
          state.flags.surveyComplete = true;
          state.flags.commissioningComplete = true;
          state.flags.warehouseComplete = true;
          state.flags.secureAccessComplete = true;
          state.flags.handoffComplete = true;
          state.flags.systemsComplete = true;
        }),
        snapshot("retrofit-install-route-reuse", (state) => {
          state.flags.finished = true;
          state.flags.metJosh = true;
          state.flags.serviceComplete = true;
          state.flags.joshServiceDebriefed = true;
          state.flags.conshohockenFollowupComplete = true;
          state.flags.surveyComplete = true;
          state.flags.commissioningComplete = true;
          state.flags.warehouseComplete = true;
          state.flags.secureAccessComplete = true;
          state.flags.handoffComplete = true;
          state.flags.systemsComplete = true;
          state.flags.travelComplete = true;
          state.flags.retrofitWalkdownComplete = true;
          state.flags.retrofitInstallProtected = true;
          state.flags.retrofitInstallBranch = "protected";
        }),
      ];
    });
    const serviceBoard = boardStates.find((item) => item.label === "service");
    assert(serviceBoard.current.id === "service", "Board helper should select service as the first post-tutorial dispatch");
    assert(serviceBoard.routeId === "conshohockenService", "Service board entry should drive the Conshohocken route selector");
    assert(serviceBoard.hud.title === "One Quick Display Swap" && serviceBoard.hud.statusLabel === "SERVICE CALL", "HUD should read active service board state");
    assert(serviceBoard.objective.includes("Conshohocken service call"), "Objective should read from active service board state");
    const endShiftBoard = boardStates.find((item) => item.label === "end-shift-suppresses-board");
    assert(!endShiftBoard.current && endShiftBoard.routeId === null, "End-shift state should suppress active board routes");
    assert(endShiftBoard.hud.statusLabel === "END SHIFT" && endShiftBoard.objective.includes("Close out the shift"), "End-shift state should keep the HUD and objective on closeout");
    const blockedFollowup = boardStates.find((item) => item.label === "josh-blocked-followup");
    assert(!blockedFollowup.current && blockedFollowup.blocked.id === "followup", "Follow-up should be blocked until Josh debriefs the service call");
    assert(blockedFollowup.blocked.reason.includes("Josh"), "Blocked board state should explain the Josh debrief gate");
    assert(blockedFollowup.hud.title === "Conshohocken Label Follow-up" && blockedFollowup.hud.statusLabel === "SHOP BLOCKED", "HUD should name the blocked next board item");
    const trainingBlocked = boardStates.find((item) => item.label === "training-blocked-followup");
    assert(!trainingBlocked.current && trainingBlocked.routeId === null, "Pending training should suppress the follow-up route");
    assert(trainingBlocked.blocked.id === "followup" && trainingBlocked.blocked.reason.includes("training"), "Blocked board state should explain the training gate");
    const travelNoRoute = boardStates.find((item) => item.label === "travel-no-route");
    assert(travelNoRoute.current.id === "travelCost", "Travel-cost board item should become active after systems service");
    assert(travelNoRoute.current.routeId === "" && travelNoRoute.routeId === null, "Travel-cost board item should not pretend it has a drive route");
    assert(travelNoRoute.hud.statusLabel === "TRAVEL COST", "HUD should name the no-route travel board item");
    const retrofitInstallBoard = boardStates.find((item) => item.label === "retrofit-install-route-reuse");
    assert(retrofitInstallBoard.current.id === "retrofitInstall", "Retrofit install should be the active board item after the walkdown");
    assert(retrofitInstallBoard.current.routeId === "burlingtonRetrofitWalkdown", "Retrofit install should reuse the Burlington route");
    assert(retrofitInstallBoard.hud.title.includes("Retrofit Install"), "HUD should show the install variant instead of the walkdown title");

    const dispatchKeys = await page.evaluate(() => {
      function snapshot(label, setup, scene = "shop") {
        window.startGame("prototype-tech");
        const state = window.AV_TECH_RPG_DEBUG.state;
        setup(state);
        window.enterScene(scene);
        window.render();
        return {
          label,
          key: window.getCurrentDispatchKey(),
          current: window.getCurrentDispatchBoardEntry?.()?.id || "",
          inProgress: window.getInProgressDispatchBoardEntry?.()?.id || "",
          blocked: window.getBlockedDispatchBoardEntry?.()?.id || "",
        };
      }
      const throughHandoff = (state) => {
        state.flags.finished = true;
        state.flags.metJosh = true;
        state.flags.serviceComplete = true;
        state.flags.joshServiceDebriefed = true;
        state.flags.conshohockenFollowupComplete = true;
        state.flags.surveyComplete = true;
        state.flags.commissioningComplete = true;
        state.flags.warehouseComplete = true;
        state.flags.secureAccessComplete = true;
        state.flags.handoffComplete = true;
      };
      return [
        snapshot("systems-active-after-handoff", throughHandoff),
        snapshot("systems-scene", (state) => {
          throughHandoff(state);
          state.flags.systemsStarted = true;
        }, "systemsService"),
        snapshot("travel-active-after-systems", (state) => {
          throughHandoff(state);
          state.flags.systemsComplete = true;
        }),
        snapshot("retrofit-walkdown-active-after-travel", (state) => {
          throughHandoff(state);
          state.flags.systemsComplete = true;
          state.flags.travelComplete = true;
        }),
        snapshot("retrofit-install-active-after-walkdown", (state) => {
          throughHandoff(state);
          state.flags.systemsComplete = true;
          state.flags.travelComplete = true;
          state.flags.retrofitWalkdownComplete = true;
          state.flags.retrofitInstallProtected = true;
          state.flags.retrofitInstallBranch = "protected";
        }),
        snapshot("warranty-active-before-handoff", (state) => {
          state.flags.finished = true;
          state.flags.metJosh = true;
          state.flags.serviceComplete = true;
          state.flags.joshServiceDebriefed = true;
          state.flags.conshohockenFollowupComplete = true;
          state.flags.surveyComplete = true;
          state.flags.commissioningComplete = true;
          state.flags.warehouseComplete = true;
          state.flags.secureAccessComplete = true;
          state.stats.callbacks = 1;
        }),
      ];
    });
    const keyByLabel = Object.fromEntries(dispatchKeys.map((item) => [item.label, item]));
    assert(keyByLabel["systems-active-after-handoff"].key === "systems" && keyByLabel["systems-active-after-handoff"].current === "systems", "Dispatch key should advance to systems after handoff");
    assert(keyByLabel["systems-scene"].key === "systems" && keyByLabel["systems-scene"].inProgress === "systems", "Dispatch key should use the current systems scene");
    assert(keyByLabel["travel-active-after-systems"].key === "travel" && keyByLabel["travel-active-after-systems"].current === "travelCost", "Dispatch key should advance to travel after systems");
    assert(keyByLabel["retrofit-walkdown-active-after-travel"].key === "retrofitWalkdown" && keyByLabel["retrofit-walkdown-active-after-travel"].current === "retrofitWalkdown", "Dispatch key should advance to retrofit walkdown after travel");
    assert(keyByLabel["retrofit-install-active-after-walkdown"].key === "retrofitInstall" && keyByLabel["retrofit-install-active-after-walkdown"].current === "retrofitInstall", "Dispatch key should advance to retrofit install after walkdown");
    assert(keyByLabel["warranty-active-before-handoff"].key === "warranty" && keyByLabel["warranty-active-before-handoff"].current === "callbackCleanup", "Dispatch key should map warranty cleanup board state to the warranty key");

    await page.evaluate(() => {
      window.startGame("prototype-tech");
      const state = window.AV_TECH_RPG_DEBUG.state;
      state.flags.finished = true;
      state.flags.travelComplete = true;
      state.flags.currentAreaId = "shop";
      window.showRetrofitWalkdownDispatchPreview();
    });
    await assertModalIncludes(page, ["Field Task Checks", "Existing pathway", "Effort: steady effort", "Risk: pathway assumption"], "field task preview");

    await page.evaluate(() => {
      window.AV_TECH_RPG_DEBUG.jump("service-ready");
      window.showRegionalMap();
    });
    const beforeFastTravel = await page.locator("#modal-backdrop").innerText();
    assert(!beforeFastTravel.includes("Fast travel ready"), "Conshohocken fast travel should not be ready before route history");
    await page.evaluate(() => {
      const state = window.AV_TECH_RPG_DEBUG.state;
      state.flags.routeHistory = { ...(state.flags.routeHistory || {}), conshohockenService: 1 };
      state.flags.currentAreaId = "shop";
      window.render();
      window.showRegionalMap();
    });
    await assertModalIncludes(page, ["Fast Travel to CONSHOHOCKEN", "Available now with light effort"], "fast travel unlock");

    const consequenceLedger = await page.evaluate(() => {
      window.startGame("prototype-tech");
      const state = window.AV_TECH_RPG_DEBUG.state;
      state.flags.finished = true;
      state.flags.metJosh = true;
      state.flags.handoffComplete = true;
      window.enterScene("systemsService");
      window.finishSystemsService("reboot");
      const closeoutText = document.querySelector("#modal-backdrop")?.innerText || "";
      const openRiskSaved = Boolean(state.flags.returnTripRisks?.systemsQuickReboot);
      window.usePortal("systemsServiceToShop");
      const departureText = document.querySelector("#modal-backdrop")?.innerText || "";
      window.showRegionalMap();
      const mapText = document.querySelector("#modal-backdrop")?.innerText || "";
      window.showConsequenceReview();
      const reviewText = document.querySelector("#modal-backdrop")?.innerText || "";
      window.showCareerClipboard();
      const clipboardText = document.querySelector("#modal-backdrop")?.innerText || "";
      window.finishCallbackCleanup("root");
      const resolvedRiskSaved = Boolean(state.flags.resolvedReturnTripRisks?.systemsQuickReboot);
      const cleanupText = document.querySelector("#modal-backdrop")?.innerText || "";
      return {
        closeoutShowsConsequence: closeoutText.includes("Closeout consequence") && closeoutText.includes("Systems quick-reboot debt"),
        openRiskSaved,
        departureShowsSummary: departureText.toLowerCase().includes("before you leave") && departureText.toLowerCase().includes("what changed") && departureText.toLowerCase().includes("risk carried back"),
        departureShowsRisk: departureText.includes("Systems quick-reboot debt") && departureText.includes("Open return-trip risks"),
        mapShowsPressureRoute: mapText.toLowerCase().includes("callback / return-trip pressure") && mapText.includes("Mapped consequence pressure") && mapText.includes("King of Prussia Room Offline"),
        reviewShowsAffectedRoute: reviewText.toLowerCase().includes("affected routes") && reviewText.includes("KING OF PRUSSIA") && reviewText.includes("King of Prussia Room Offline"),
        reviewShowsFilters: reviewText.toLowerCase().includes("review filters") && reviewText.toLowerCase().includes("active today") && reviewText.toLowerCase().includes("resolved") && reviewText.toLowerCase().includes("inherited"),
        clipboardShowsLedger: clipboardText.includes("Consequence ledger") && clipboardText.includes("King of Prussia Room Offline"),
        clipboardShowsReviewSummary: clipboardText.includes("Consequence review") && clipboardText.includes("Active today"),
        resolvedRiskSaved,
        cleanupShowsResolved: cleanupText.includes("Closeout consequence") && cleanupText.includes("Callback pressure drops"),
      };
    });
    assert(consequenceLedger.closeoutShowsConsequence, "Systems closeout should show consequence ledger language");
    assert(consequenceLedger.openRiskSaved, "Systems quick reboot should save an open return-trip risk");
    assert(consequenceLedger.departureShowsSummary, "Return marker should recap closeout changes before leaving the job site");
    assert(consequenceLedger.departureShowsRisk, "Return marker should show systems risk carried back to the shop");
    assert(consequenceLedger.mapShowsPressureRoute, "Regional map should group routes carrying consequence pressure");
    assert(consequenceLedger.reviewShowsAffectedRoute, "Consequence review should list affected routes");
    assert(consequenceLedger.reviewShowsFilters, "Consequence review should group active, resolved, and inherited pressure");
    assert(consequenceLedger.clipboardShowsLedger, "Career clipboard should show the open consequence ledger");
    assert(consequenceLedger.clipboardShowsReviewSummary, "Career clipboard should show the consequence review summary");
    assert(consequenceLedger.resolvedRiskSaved, "Warranty cleanup should save resolved return-trip risk history");
    assert(consequenceLedger.cleanupShowsResolved, "Warranty cleanup should show resolved consequence language");

    const consequenceReviewAudit = await page.evaluate(() => {
      window.startGame("prototype-tech");
      const state = window.AV_TECH_RPG_DEBUG.state;
      state.flags.finished = true;
      state.flags.metJosh = true;
      state.flags.handoffComplete = true;
      window.enterScene("systemsService");
      window.finishSystemsService("scope");
      window.showSystemsDispatchPreview();
      const systemsBoardText = document.querySelector("#modal-backdrop")?.innerText || "";
      window.finishTravelDispatch("receipt");
      const currentStepText = document.querySelector("#task-copy")?.textContent || "";
      const openEntries = window.getConsequenceLedgerEntries().length;
      const reviewAvailable = window.hasConsequenceReviewInfo();
      const history = window.getJobSiteCloseoutHistory().map((summary) => summary.source);
      window.saveGame();
      const savedHistory = window.getSavedGame().flags.jobSiteCloseoutHistory.map((summary) => summary.source);
      const systemsHistoryText = window.getRouteCloseoutHistoryText(window.getWorldRoute("systemsService"));
      window.showRoutePrepModal("systemsService");
      const systemsPrepText = document.querySelector("#modal-backdrop")?.innerText || "";
      window.showRegionalMap();
      const mapText = document.querySelector("#modal-backdrop")?.innerText || "";
      window.showConsequenceReview();
      const reviewText = document.querySelector("#modal-backdrop")?.innerText || "";
      return {
        openEntries,
        reviewAvailable,
        mapText,
        reviewText,
        history,
        savedHistory,
        systemsHistoryText,
        systemsPrepText,
        systemsBoardText,
        currentStepText,
        closeoutSource: state.flags.lastJobSiteCloseoutSummary?.source || "",
      };
    });
    assert(consequenceReviewAudit.openEntries === 0, "Controlled systems closeout should leave no open consequence entries");
    assert(consequenceReviewAudit.reviewAvailable, "Consequence review should remain available after a saved controlled closeout");
    assert(consequenceReviewAudit.mapText.includes("Review Consequence Ledger"), "Regional map should expose consequence review after saved closeout history");
    assert(consequenceReviewAudit.reviewText.toLowerCase().includes("last job-site closeout") && consequenceReviewAudit.reviewText.toLowerCase().includes("saved consequence record"), "Consequence review should show the last closeout audit trail");
    assert(consequenceReviewAudit.reviewText.toLowerCase().includes("recent closeout history"), "Consequence review should show recent closeout history");
    assert(consequenceReviewAudit.reviewText.includes("Cherry Hill Return Toll") && consequenceReviewAudit.reviewText.includes("The route friction is visible to the shop."), "Consequence review should show the newest controlled closeout details");
    assert(consequenceReviewAudit.reviewText.includes("King of Prussia Room Offline") && consequenceReviewAudit.reviewText.includes("Future service gets a usable mismatch trail"), "Consequence review should keep earlier controlled closeout history");
    assert(consequenceReviewAudit.closeoutSource === "Cherry Hill Return Toll", "Last closeout source should update to the newest closeout");
    assert(consequenceReviewAudit.history[0] === "Cherry Hill Return Toll" && consequenceReviewAudit.history[1] === "King of Prussia Room Offline", "Closeout history should keep newest-first records");
    assert(consequenceReviewAudit.savedHistory[0] === "Cherry Hill Return Toll" && consequenceReviewAudit.savedHistory[1] === "King of Prussia Room Offline", "Saved closeout history should migrate newest-first records");
    assert(consequenceReviewAudit.systemsHistoryText.includes("Documented King of Prussia Room Offline") && consequenceReviewAudit.systemsHistoryText.includes("Future service gets a usable mismatch trail"), "Route closeout history helper should map saved closeout history back to its route");
    assert(consequenceReviewAudit.systemsBoardText.includes("Recent route closeout") && consequenceReviewAudit.systemsBoardText.includes("Future service gets a usable mismatch trail"), "Dispatch board job card should show saved closeout history for its route");
    assert(consequenceReviewAudit.systemsPrepText.includes("Recent closeout history") && consequenceReviewAudit.systemsPrepText.includes("Future service gets a usable mismatch trail"), "Route prep should show saved closeout history for this route");
    assert(consequenceReviewAudit.mapText.includes("Recent closeout history") && consequenceReviewAudit.mapText.includes("Future service gets a usable mismatch trail"), "Regional map route cards should show saved closeout history for this route");
    assert(consequenceReviewAudit.currentStepText.includes("Last closeout") && consequenceReviewAudit.currentStepText.includes("The route friction is visible to the shop."), "Current step panel should keep the latest controlled closeout visible");

    await page.evaluate(() => {
      window.startGame("prototype-tech");
      const state = window.AV_TECH_RPG_DEBUG.state;
      state.flags.finished = true;
      state.flags.secureAccessComplete = true;
      state.stats.callbacks = 1;
      state.flags.currentAreaId = "shop";
      window.showCallbackCleanupDispatchPreview();
    });
    await assertModalIncludes(page, ["Field Task Checks", "Actual fault", "callback troubleshooting", "Risk: unclear root cause"], "callback cleanup field task preview");

    const callbackTask = await page.evaluate(() => {
      window.startGame("prototype-tech");
      const state = window.AV_TECH_RPG_DEBUG.state;
      window.enterScene("warrantyReturn");
      const beforeEnergy = state.energy;
      window.inspectCallbackCleanupCondition("actual-fault");
      const modalText = document.querySelector("#modal-backdrop")?.innerText || "";
      const result = state.flags.fieldTaskResults?.["callback-actual-fault"];
      return {
        checked: state.callbackCleanupChecks.includes("actual-fault"),
        resultSaved: Boolean(result),
        resultType: result?.type || "",
        resultSkill: result?.skillId || "",
        energyChanged: state.energy !== beforeEnergy,
        showsResultRows: modalText.includes("Task type") && modalText.includes("Risk tracked") && modalText.includes("unclear root cause"),
      };
    });
    assert(callbackTask.checked, "Callback cleanup check should complete");
    assert(callbackTask.resultSaved, "Callback cleanup check should save field-task result data");
    assert(callbackTask.resultType === "callback troubleshooting", "Callback cleanup check should use data-backed task type");
    assert(callbackTask.resultSkill === "troubleshooting", "Callback cleanup check should use data-backed skill");
    assert(callbackTask.energyChanged, "Callback cleanup check should affect energy");
    assert(callbackTask.showsResultRows, "Callback cleanup check should show structured result rows");

    await page.evaluate(() => {
      window.startGame("prototype-tech");
      const state = window.AV_TECH_RPG_DEBUG.state;
      state.flags.finished = true;
      state.flags.secureAccessComplete = true;
      state.flags.callbackCleanupComplete = true;
      state.flags.currentAreaId = "shop";
      window.showHandoffDispatchPreview();
    });
    await assertModalIncludes(page, ["Field Task Checks", "Client's actual need", "client handoff", "Risk: missed client need"], "handoff field task preview");

    const handoffTask = await page.evaluate(() => {
      window.startGame("prototype-tech");
      const state = window.AV_TECH_RPG_DEBUG.state;
      window.enterScene("executiveHandoff");
      const beforeEnergy = state.energy;
      window.inspectHandoffCondition("client-need");
      const modalText = document.querySelector("#modal-backdrop")?.innerText || "";
      const result = state.flags.fieldTaskResults?.["handoff-client-need"];
      return {
        checked: state.handoffChecks.includes("client-need"),
        resultSaved: Boolean(result),
        resultType: result?.type || "",
        resultSkill: result?.skillId || "",
        energyChanged: state.energy !== beforeEnergy,
        showsResultRows: modalText.includes("Task type") && modalText.includes("Risk tracked") && modalText.includes("missed client need"),
      };
    });
    assert(handoffTask.checked, "Handoff check should complete");
    assert(handoffTask.resultSaved, "Handoff check should save field-task result data");
    assert(handoffTask.resultType === "client handoff", "Handoff check should use data-backed task type");
    assert(handoffTask.resultSkill === "clientCommunication", "Handoff check should use data-backed skill");
    assert(handoffTask.energyChanged, "Handoff check should affect energy");
    assert(handoffTask.showsResultRows, "Handoff check should show structured result rows");

    await page.evaluate(() => {
      window.startGame("prototype-tech");
      const state = window.AV_TECH_RPG_DEBUG.state;
      state.flags.finished = true;
      state.flags.commissioningComplete = true;
      state.flags.currentAreaId = "shop";
      window.showWarehouseDispatchPreview();
    });
    await assertModalIncludes(page, ["Field Task Checks", "Secret Squirrel Shelf", "returns search", "Risk: Secret Squirrel mystery shelf"], "warehouse field task preview");

    const warehouseTask = await page.evaluate(() => {
      window.startGame("prototype-tech");
      const state = window.AV_TECH_RPG_DEBUG.state;
      state.flags.warehouseStarted = true;
      window.enterScene("shop");
      const beforeEnergy = state.energy;
      window.inspectWarehouseLocation("returns");
      const modalText = document.querySelector("#modal-backdrop")?.innerText || "";
      const result = state.flags.fieldTaskResults?.["warehouse-returns"];
      return {
        checked: state.warehouseChecks.includes("returns"),
        resultSaved: Boolean(result),
        resultType: result?.type || "",
        resultSkill: result?.skillId || "",
        energyChanged: state.energy !== beforeEnergy,
        showsResultRows: modalText.includes("Task type") && modalText.includes("Risk tracked") && modalText.includes("Secret Squirrel mystery shelf"),
      };
    });
    assert(warehouseTask.checked, "Warehouse search should complete");
    assert(warehouseTask.resultSaved, "Warehouse search should save field-task result data");
    assert(warehouseTask.resultType === "returns search", "Warehouse search should use data-backed task type");
    assert(warehouseTask.resultSkill === "fieldcraft", "Warehouse search should use data-backed skill");
    assert(warehouseTask.energyChanged, "Warehouse search should affect energy");
    assert(warehouseTask.showsResultRows, "Warehouse search should show structured result rows");

    const walkdownTask = await page.evaluate(() => {
      window.startGame("prototype-tech");
      const state = window.AV_TECH_RPG_DEBUG.state;
      state.flags.retrofitWalkdownPreparation = "drawings";
      window.enterScene("burlingtonRetrofitWalkdown");
      const beforeEnergy = state.energy;
      window.inspectRetrofitWalkdownCondition("pathway");
      const modalText = document.querySelector("#modal-backdrop")?.innerText || "";
      return {
        completed: state.retrofitWalkdownChecks.includes("pathway"),
        skillCheckSaved: Boolean(state.flags.skillChecks?.["retrofit-walkdown-pathway"]),
        fieldTaskResultSaved: Boolean(state.flags.fieldTaskResults?.["retrofit-walkdown-pathway"]),
        energyChanged: state.energy !== beforeEnergy,
        usedResolverLog: state.log.some((entry) => entry.includes("Existing pathway checked:")),
        showsResultRows: modalText.includes("Energy spent") && modalText.includes("Risk tracked") && modalText.includes("pathway assumption"),
      };
    });
    assert(walkdownTask.completed, "Retrofit walkdown task should mark completion");
    assert(walkdownTask.skillCheckSaved, "Retrofit walkdown task should save skill-check result");
    assert(walkdownTask.fieldTaskResultSaved, "Retrofit walkdown task should save field-task result data");
    assert(walkdownTask.energyChanged, "Retrofit walkdown task should affect energy");
    assert(walkdownTask.usedResolverLog, "Retrofit walkdown task should log through shared resolver");
    assert(walkdownTask.showsResultRows, "Retrofit walkdown task should show structured result rows");

    await page.evaluate(() => {
      window.startGame("prototype-tech");
      const state = window.AV_TECH_RPG_DEBUG.state;
      state.flags.finished = true;
      state.flags.surveyComplete = true;
      state.flags.currentAreaId = "shop";
      window.showCommissioningDispatchPreview();
    });
    await assertModalIncludes(page, ["Field Task Checks", "Ceiling speaker zone", "audio verification", "Re-terminate cleanly", "Risk: weak strain relief"], "commissioning field task preview");

    const commissioningInspectionTask = await page.evaluate(() => {
      window.startGame("prototype-tech");
      const state = window.AV_TECH_RPG_DEBUG.state;
      window.enterScene("southPhillyCommissioning");
      const beforeEnergy = state.energy;
      window.inspectCommissioningCondition("drawing");
      const modalText = document.querySelector("#modal-backdrop")?.innerText || "";
      const result = state.flags.fieldTaskResults?.["commissioning-drawing"];
      return {
        checked: state.commissioningChecks.includes("drawing"),
        resultSaved: Boolean(result),
        resultType: result?.type || "",
        resultSkill: result?.skillId || "",
        energyChanged: state.energy !== beforeEnergy,
        showsResultRows: modalText.includes("Task type") && modalText.includes("Risk tracked") && modalText.includes("mirrored drawing note"),
      };
    });
    assert(commissioningInspectionTask.checked, "Commissioning inspection should complete");
    assert(commissioningInspectionTask.resultSaved, "Commissioning inspection should save field-task result data");
    assert(commissioningInspectionTask.resultType === "documentation check", "Commissioning inspection should use data-backed task type");
    assert(commissioningInspectionTask.resultSkill === "documentation", "Commissioning inspection should use data-backed skill");
    assert(commissioningInspectionTask.energyChanged, "Commissioning inspection should affect energy");
    assert(commissioningInspectionTask.showsResultRows, "Commissioning inspection should show structured field-task rows");

    const commissioningTerminationTask = await page.evaluate(() => {
      window.startGame("prototype-tech");
      const state = window.AV_TECH_RPG_DEBUG.state;
      window.enterScene("southPhillyCommissioning");
      state.flags.commissioningBrief = true;
      state.commissioningChecks = ["termination"];
      state.player = { x: 760, y: 300 };
      window.render();
      const beforeChoiceNearby = document.querySelector("#nearby-card")?.textContent || "";
      const beforeChoiceInteract = document.querySelector("#interact-button")?.textContent || "";
      const beforeEnergy = state.energy;
      window.resolveCommissioningTerminationTask("document");
      const modalText = document.querySelector("#modal-backdrop")?.innerText || "";
      const result = state.flags.fieldTaskResults?.["commissioning-termination-document"];
      window.closeModal();
      state.player = { x: 760, y: 300 };
      window.render();
      const afterChoiceNearby = document.querySelector("#nearby-card")?.textContent || "";
      const afterChoiceInteract = document.querySelector("#interact-button")?.textContent || "";
      const afterChoiceTaskCopy = document.querySelector("#task-copy")?.textContent || "";
      window.showCommissioningTerminationTaskReview();
      const reviewText = document.querySelector("#modal-backdrop")?.innerText || "";
      window.showCareerClipboard();
      const clipboardText = document.querySelector("#modal-backdrop")?.innerText || "";
      return {
        actionSaved: state.flags.commissioningTerminationAction === "document",
        resultSaved: Boolean(result),
        resultType: result?.type || "",
        resultSkill: result?.skillId || "",
        resultRiskLabel: result?.riskLabel || "",
        resultOutcomeText: result?.outcomeText || "",
        energyChanged: state.energy !== beforeEnergy,
        showsResultRows: modalText.includes("Task type") && modalText.includes("Skill check") && modalText.includes("Risk tracked"),
        beforeChoiceNearby,
        beforeChoiceInteract,
        afterChoiceNearby,
        afterChoiceInteract,
        afterChoiceTaskCopy,
        reviewShowsSavedResult: reviewText.includes("Saved task result")
          && reviewText.includes("Document first")
          && reviewText.includes("Return-trip risk")
          && reviewText.includes("Controlled"),
        clipboardShowsHistory: clipboardText.includes("Field task history")
          && clipboardText.includes("Document first")
          && clipboardText.includes("thin mismatch explanation")
          && clipboardText.includes("The mismatch is documented before the room gets another confident status update."),
      };
    });
    assert(commissioningTerminationTask.actionSaved, "Commissioning termination task should save the selected action");
    assert(commissioningTerminationTask.resultSaved, "Commissioning termination task should save field-task result data");
    assert(commissioningTerminationTask.resultType === "closeout documentation", "Commissioning termination task should use data-backed task type");
    assert(commissioningTerminationTask.resultSkill === "clientCommunication", "Commissioning termination task should use data-backed skill");
    assert(commissioningTerminationTask.resultRiskLabel === "thin mismatch explanation", "Commissioning termination task should save readable risk label");
    assert(commissioningTerminationTask.resultOutcomeText.includes("mismatch is documented"), "Commissioning termination task should save readable outcome text");
    assert(commissioningTerminationTask.energyChanged, "Commissioning termination task should affect energy");
    assert(commissioningTerminationTask.showsResultRows, "Commissioning termination task should show structured field-task rows");
    assert(commissioningTerminationTask.beforeChoiceNearby.includes("READY") && commissioningTerminationTask.beforeChoiceInteract.includes("Choose termination task"), "Commissioning termination hotspot should show ready choice state");
    assert(commissioningTerminationTask.afterChoiceNearby.includes("COMPLETED") && commissioningTerminationTask.afterChoiceInteract.includes("Review termination task"), "Commissioning termination hotspot should show completed review state");
    assert(commissioningTerminationTask.afterChoiceTaskCopy.includes("Use the nearest highlighted interaction") && !commissioningTerminationTask.afterChoiceTaskCopy.includes("career clipboard"), "Training room objective should not point to career-training UI");
    assert(commissioningTerminationTask.reviewShowsSavedResult, "Commissioning termination hotspot should reopen saved task result review");
    assert(commissioningTerminationTask.clipboardShowsHistory, "Career clipboard should show saved commissioning field-task history");

    const saveRoundTrip = await page.evaluate(() => {
      const state = window.AV_TECH_RPG_DEBUG.state;
      state.flags.routeHistory = { centerCityTutorial: 1, conshohockenService: 1 };
      state.flags.retrofitWalkdownComplete = true;
      state.flags.systemsComplete = true;
      state.flags.endShiftPending = true;
      window.saveGame();
      return localStorage.getItem("av-tech-rpg-save-v1");
    });
    assert(Boolean(saveRoundTrip), "Smoke state should save");
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => window.AV_TECH_RPG_READY === true);
    await clickButton(page, "Continue Career");
    const continued = await page.evaluate(() => {
      const state = window.AV_TECH_RPG_DEBUG.state;
      return {
        routeHistory: state.flags.routeHistory || {},
        retrofitWalkdownComplete: Boolean(state.flags.retrofitWalkdownComplete),
        systemsComplete: Boolean(state.flags.systemsComplete),
        endShiftPending: Boolean(state.flags.endShiftPending),
        fieldTaskResultSaved: Boolean(state.flags.fieldTaskResults?.["commissioning-termination-document"]),
      };
    });
    assert(continued.routeHistory.conshohockenService === 1, "Continue should preserve route history");
    assert(continued.retrofitWalkdownComplete, "Continue should preserve retrofit flags");
    assert(continued.systemsComplete, "Continue should preserve systems flags");
    assert(continued.endShiftPending, "Continue should preserve end-shift state");
    assert(continued.fieldTaskResultSaved, "Continue should preserve commissioning field-task result flags");

    assert(pageErrors.length === 0, `Browser errors were reported:\n${pageErrors.join("\n")}`);
    console.log("AV Tech RPG smoke QA passed: roster, custom creator, board state, van/map cards, fast travel, task checks, save/continue.");
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
