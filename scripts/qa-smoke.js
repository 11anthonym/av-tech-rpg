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

    assert(await page.locator("#title-screen").isVisible(), "Title screen should render");
    await clickButton(page, "New Career");
    const rosterText = await page.locator("#technician-grid").innerText();
    for (const name of ["Alex", "Casey", "Wiley", "Jordan", "Morgan", "Custom Technician Creator"]) {
      assert(rosterText.includes(name), `Roster should include ${name}`);
    }

    await clickButton(page, "Create Custom Technician");
    await assertModalIncludes(page, ["Build Your First Tech", "Start Custom Career"], "custom creator");
    await clickButton(page, "Start Custom Career");
    await page.waitForSelector("#game-layout:not(.hidden)");
    assert((await page.locator("#tech-name").innerText()).includes("Custom Tech"), "Custom technician should start");

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
        showsResultRows: modalText.includes("Task type") && modalText.includes("Risk flag") && modalText.includes("frame alignment"),
      };
    });
    assert(cartAssemblyTask.assembled, "Tutorial cart assembly should keep assembled progress");
    assert(cartAssemblyTask.resultSaved, "Tutorial cart assembly should save field-task result data");
    assert(cartAssemblyTask.resultType === "cart frame assembly", "Tutorial cart assembly should use data-backed task type");
    assert(cartAssemblyTask.resultSkill === "install", "Tutorial cart assembly should use data-backed skill");
    assert(cartAssemblyTask.energyChanged, "Tutorial cart assembly should affect energy");
    assert(cartAssemblyTask.showsResultRows, "Tutorial cart assembly should show structured result rows");

    await page.evaluate(() => {
      window.startGame("prototype-tech");
      window.AV_TECH_RPG_DEBUG.state.flags.shopBrief = true;
      window.render();
      window.showVehicleMenu();
    });
    await assertModalIncludes(page, [
      "Current Loop",
      "Loop step",
      "Where to look",
      "Review cargo",
      "Load carried items",
      "Review dispatch board routes",
      "Open regional map",
      "Drive active route",
    ], "van menu");

    await page.evaluate(() => window.showRegionalMap());
    await assertModalIncludes(page, [
      "Current Loop",
      "Active Job Route",
      "Known Destinations",
      "Locked Future Candidates",
      "Destination:",
      "Travel cost/risk:",
      "Fast travel:",
    ], "regional map");

    const transitionGuidance = await page.evaluate(() => {
      window.startGame("prototype-tech");
      const state = window.AV_TECH_RPG_DEBUG.state;
      window.enterScene("garage");
      state.flags.garageBrief = true;
      state.player = { x: 116, y: 185 };
      window.render();
      const lockedNearby = document.querySelector("#nearby-card")?.textContent || "";
      window.usePortal("garageToLobby");
      const lockedText = document.querySelector("#modal-backdrop")?.innerText || "";
      state.flags.centerCityEquipmentDelivered = true;
      window.render();
      const readyNearby = document.querySelector("#nearby-card")?.textContent || "";
      window.usePortal("garageToLobby");
      const readyText = document.querySelector("#modal-backdrop")?.innerText || "";
      return {
        lockedText,
        readyText,
        lockedNearby,
        readyNearby,
        taskCopy: document.querySelector("#task-copy")?.textContent || "",
      };
    });
    assert(transitionGuidance.lockedText.includes("Locked") && transitionGuidance.lockedText.includes("equipment still needs"), "Locked portal should explain blocker");
    assert(transitionGuidance.readyText.includes("Status") && transitionGuidance.readyText.includes("Ready") && transitionGuidance.readyText.includes("Client Lobby"), "Ready portal should show transition destination");
    assert(transitionGuidance.lockedNearby.includes("Locked") && transitionGuidance.lockedNearby.includes("equipment still needs"), "Nearby card should explain locked entrance");
    assert(transitionGuidance.readyNearby.includes("Ready") && transitionGuidance.readyNearby.includes("Client Lobby"), "Nearby card should explain ready transition destination");
    assert(transitionGuidance.taskCopy.includes("Route / Building Transition") && transitionGuidance.taskCopy.includes("Interface:"), "Current step should include loop-stage guidance");

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
        showsResultRows: modalText.includes("Task type") && modalText.includes("Risk flag") && modalText.includes("unlabeled coupler"),
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
        showsResultRows: modalText.includes("Task type") && modalText.includes("Risk flag") && modalText.includes("strained display swap"),
      };
    });
    assert(serviceInstallTask.installed, "Service install should keep installed-item progress");
    assert(serviceInstallTask.resultSaved, "Service install should save field-task result data");
    assert(serviceInstallTask.resultType === "display install", "Service install should use data-backed task type");
    assert(serviceInstallTask.resultSkill === "install", "Service install should use data-backed skill");
    assert(serviceInstallTask.energyChanged, "Service install should affect energy");
    assert(serviceInstallTask.showsResultRows, "Service install should show structured result rows");

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
        showsResultRows: modalText.includes("Task type") && modalText.includes("Risk flag") && modalText.includes("visitor-list mismatch"),
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
        showsResultRows: modalText.includes("Task type") && modalText.includes("Risk flag") && modalText.includes("thin access measurement"),
      };
    });
    assert(surveyTask.inspected, "Survey inspection should complete");
    assert(surveyTask.resultSaved, "Survey inspection should save field-task result data");
    assert(surveyTask.resultType === "access survey", "Survey inspection should use data-backed task type");
    assert(surveyTask.resultSkill === "documentation", "Survey inspection should use data-backed skill");
    assert(surveyTask.energyChanged, "Survey inspection should affect energy");
    assert(surveyTask.showsResultRows, "Survey inspection should show structured result rows");

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

    await page.evaluate(() => {
      window.startGame("prototype-tech");
      const state = window.AV_TECH_RPG_DEBUG.state;
      state.flags.finished = true;
      state.flags.travelComplete = true;
      state.flags.currentAreaId = "shop";
      window.showRetrofitWalkdownDispatchPreview();
    });
    await assertModalIncludes(page, ["Field Task Checks", "Existing pathway", "Base energy 3", "Risk: pathway assumption"], "field task preview");

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
    await assertModalIncludes(page, ["Fast Travel to CONSHOHOCKEN", "Available now for 1 energy"], "fast travel unlock");

    const consequenceLedger = await page.evaluate(() => {
      window.startGame("prototype-tech");
      const state = window.AV_TECH_RPG_DEBUG.state;
      state.flags.finished = true;
      state.flags.metJosh = true;
      state.flags.handoffComplete = true;
      window.finishSystemsService("reboot");
      const closeoutText = document.querySelector("#modal-backdrop")?.innerText || "";
      const openRiskSaved = Boolean(state.flags.returnTripRisks?.systemsQuickReboot);
      window.showCareerClipboard();
      const clipboardText = document.querySelector("#modal-backdrop")?.innerText || "";
      window.finishCallbackCleanup("root");
      const resolvedRiskSaved = Boolean(state.flags.resolvedReturnTripRisks?.systemsQuickReboot);
      const cleanupText = document.querySelector("#modal-backdrop")?.innerText || "";
      return {
        closeoutShowsConsequence: closeoutText.includes("Closeout consequence") && closeoutText.includes("Systems quick-reboot debt"),
        openRiskSaved,
        clipboardShowsLedger: clipboardText.includes("Consequence ledger") && clipboardText.includes("King of Prussia Room Offline"),
        resolvedRiskSaved,
        cleanupShowsResolved: cleanupText.includes("Closeout consequence") && cleanupText.includes("Callback pressure drops"),
      };
    });
    assert(consequenceLedger.closeoutShowsConsequence, "Systems closeout should show consequence ledger language");
    assert(consequenceLedger.openRiskSaved, "Systems quick reboot should save an open return-trip risk");
    assert(consequenceLedger.clipboardShowsLedger, "Career clipboard should show the open consequence ledger");
    assert(consequenceLedger.resolvedRiskSaved, "Warranty cleanup should save resolved return-trip risk history");
    assert(consequenceLedger.cleanupShowsResolved, "Warranty cleanup should show resolved consequence language");

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
        showsResultRows: modalText.includes("Task type") && modalText.includes("Risk flag") && modalText.includes("unclear root cause"),
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
        showsResultRows: modalText.includes("Task type") && modalText.includes("Risk flag") && modalText.includes("missed client need"),
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
    await assertModalIncludes(page, ["Field Task Checks", "Mystery-return pile", "returns search", "Risk: mystery-return pile"], "warehouse field task preview");

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
        showsResultRows: modalText.includes("Task type") && modalText.includes("Risk flag") && modalText.includes("mystery-return pile"),
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
        showsResultRows: modalText.includes("Energy spent") && modalText.includes("Risk flag") && modalText.includes("pathway assumption"),
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
        showsResultRows: modalText.includes("Task type") && modalText.includes("Risk flag") && modalText.includes("mirrored drawing note"),
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
      const beforeEnergy = state.energy;
      window.resolveCommissioningTerminationTask("document");
      const modalText = document.querySelector("#modal-backdrop")?.innerText || "";
      const result = state.flags.fieldTaskResults?.["commissioning-termination-document"];
      window.showCareerClipboard();
      const clipboardText = document.querySelector("#modal-backdrop")?.innerText || "";
      return {
        actionSaved: state.flags.commissioningTerminationAction === "document",
        resultSaved: Boolean(result),
        resultType: result?.type || "",
        resultSkill: result?.skillId || "",
        energyChanged: state.energy !== beforeEnergy,
        showsResultRows: modalText.includes("Task type") && modalText.includes("Skill check") && modalText.includes("Risk flag"),
        clipboardShowsHistory: clipboardText.includes("Field task history") && clipboardText.includes("Document first"),
      };
    });
    assert(commissioningTerminationTask.actionSaved, "Commissioning termination task should save the selected action");
    assert(commissioningTerminationTask.resultSaved, "Commissioning termination task should save field-task result data");
    assert(commissioningTerminationTask.resultType === "closeout documentation", "Commissioning termination task should use data-backed task type");
    assert(commissioningTerminationTask.resultSkill === "clientCommunication", "Commissioning termination task should use data-backed skill");
    assert(commissioningTerminationTask.energyChanged, "Commissioning termination task should affect energy");
    assert(commissioningTerminationTask.showsResultRows, "Commissioning termination task should show structured field-task rows");
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
