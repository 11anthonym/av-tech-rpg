const content = window.GAME_CONTENT;
const keys = new Set();
const PLAYER_SPEED = 8;
const SAVE_KEY = "av-tech-rpg-save-v1";

function createInitialState() {
  return {
    technician: null,
    sceneId: null,
    player: { x: 0, y: 0 },
    tools: [],
    carry: null,
    loaded: [],
    delivered: [],
    assembled: [],
    energy: 100,
    burnout: 0,
    clock: "MON 7:11 AM",
    flags: {},
    log: [],
    modalOpen: false,
  };
}

const state = createInitialState();

const elements = {
  titleScreen: document.querySelector("#title-screen"),
  continueButton: document.querySelector("#continue-button"),
  newGameButton: document.querySelector("#new-game-button"),
  clearSaveButton: document.querySelector("#clear-save-button"),
  saveSummary: document.querySelector("#save-summary"),
  saveStatus: document.querySelector("#save-status"),
  menuButton: document.querySelector("#menu-button"),
  selection: document.querySelector("#selection-screen"),
  selectionBackButton: document.querySelector("#selection-back-button"),
  technicianGrid: document.querySelector("#technician-grid"),
  gameLayout: document.querySelector("#game-layout"),
  locationTitle: document.querySelector("#location-title"),
  jobStatus: document.querySelector("#job-status"),
  clock: document.querySelector("#clock"),
  techName: document.querySelector("#tech-name"),
  energyValue: document.querySelector("#energy-value"),
  energyMeter: document.querySelector("#energy-meter"),
  burnoutValue: document.querySelector("#burnout-value"),
  craftValue: document.querySelector("#craft-value"),
  confidenceValue: document.querySelector("#confidence-value"),
  carryCard: document.querySelector("#carry-card"),
  carryBubble: document.querySelector("#carry-bubble"),
  toolList: document.querySelector("#tool-list"),
  vehicleCard: document.querySelector("#vehicle-card"),
  sceneKicker: document.querySelector("#scene-kicker"),
  sceneName: document.querySelector("#scene-name"),
  objective: document.querySelector("#objective"),
  taskCopy: document.querySelector("#task-copy"),
  nearbyCard: document.querySelector("#nearby-card"),
  scene: document.querySelector("#scene"),
  sceneLayer: document.querySelector("#scene-layer"),
  player: document.querySelector("#player"),
  interactButton: document.querySelector("#interact-button"),
  fieldLog: document.querySelector("#field-log"),
  modalBackdrop: document.querySelector("#modal-backdrop"),
  modalKicker: document.querySelector("#modal-kicker"),
  modalTitle: document.querySelector("#modal-title"),
  modalBody: document.querySelector("#modal-body"),
  modalActions: document.querySelector("#modal-actions"),
};

function getSavedGame() {
  try {
    return JSON.parse(localStorage.getItem(SAVE_KEY));
  } catch {
    return null;
  }
}

function getSaveSummary(savedGame) {
  if (!savedGame) return "No saved career yet.";
  const technician = content.technicians.find((item) => item.id === savedGame.technicianId);
  const scene = content.scenes[savedGame.sceneId];
  const reward = savedGame.flags?.reward ? content.tools[savedGame.flags.reward]?.name : null;
  const detail = reward ? ` | Latest tool: ${reward}` : "";
  return `${technician?.name || "Technician"} | ${scene?.name || "First day"} | Energy ${savedGame.energy}${detail}`;
}

function refreshTitleScreen() {
  const savedGame = getSavedGame();
  elements.continueButton.disabled = !savedGame;
  elements.clearSaveButton.disabled = !savedGame;
  elements.saveSummary.textContent = getSaveSummary(savedGame);
}

function serializeGame() {
  return {
    version: 1,
    technicianId: state.technician.id,
    sceneId: state.sceneId,
    player: state.player,
    tools: state.tools,
    carry: state.carry,
    loaded: state.loaded,
    delivered: state.delivered,
    assembled: state.assembled,
    energy: state.energy,
    burnout: state.burnout,
    clock: state.clock,
    flags: state.flags,
    log: state.log,
  };
}

function saveGame() {
  if (!state.technician || !state.sceneId) return;
  localStorage.setItem(SAVE_KEY, JSON.stringify(serializeGame()));
  elements.saveStatus.classList.remove("hidden");
  elements.saveStatus.textContent = "AUTOSAVED";
}

function resetRuntimeState() {
  Object.assign(state, createInitialState());
}

function showTitleScreen() {
  closeModal();
  keys.clear();
  window.scrollTo({ left: 0, top: 0 });
  elements.locationTitle.textContent = "AV Tech RPG";
  elements.clock.textContent = "MON 7:11 AM";
  elements.jobStatus.textContent = "CAREER MODE";
  elements.gameLayout.classList.add("hidden");
  elements.selection.classList.add("hidden");
  elements.menuButton.classList.add("hidden");
  elements.saveStatus.classList.add("hidden");
  elements.titleScreen.classList.remove("hidden");
  refreshTitleScreen();
}

function showTechnicianSelection() {
  window.scrollTo({ left: 0, top: 0 });
  elements.titleScreen.classList.add("hidden");
  elements.selection.classList.remove("hidden");
  elements.locationTitle.textContent = "Technician Selection";
}

function promptNewCareer() {
  if (!getSavedGame()) return showTechnicianSelection();
  showModal({
    kicker: "New Career",
    title: "Start Over?",
    body: `<p>Starting a new technician will overwrite the current saved career after you choose a profile.</p>`,
    actions: [
      { label: "Choose New Technician", onClick: showTechnicianSelection },
      { label: "Keep Current Career", className: "secondary-button" },
    ],
  });
}

function promptClearSavedGame() {
  if (!getSavedGame()) return;
  showModal({
    kicker: "Saved Career",
    title: "Clear Saved Career?",
    body: `<p>This removes the local career save from this browser. It cannot be undone.</p>`,
    actions: [
      { label: "Clear Saved Career", className: "secondary-button", onClick: clearSavedGame },
      { label: "Keep Current Career" },
    ],
  });
}

function clearSavedGame() {
  localStorage.removeItem(SAVE_KEY);
  resetRuntimeState();
  refreshTitleScreen();
}

function continueGame() {
  const savedGame = getSavedGame();
  if (!savedGame) return;
  const technician = content.technicians.find((item) => item.id === savedGame.technicianId);
  if (!technician || !content.scenes[savedGame.sceneId]) return clearSavedGame();
  resetRuntimeState();
  Object.assign(state, savedGame, { technician, modalOpen: false });
  elements.titleScreen.classList.add("hidden");
  elements.selection.classList.add("hidden");
  elements.gameLayout.classList.remove("hidden");
  elements.menuButton.classList.remove("hidden");
  enterScene(state.sceneId, state.player);
  resumeRequiredPrompt();
}

function resumeRequiredPrompt() {
  if (state.flags.finished && !state.flags.reward) return showResults();
  if (state.sceneId === "garage" && state.delivered.length === content.tutorial.garageUnload.length) {
    return showLobbyTransition();
  }
  if (state.sceneId === "client" && state.assembled.length === content.tutorial.assembly.length && !state.flags.finished) {
    return showFinishChoice();
  }
}

function makeButton(label, onClick, className = "primary-button") {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = label;
  button.addEventListener("click", onClick);
  return button;
}

function showModal({ kicker = "Dispatch Update", title, body, actions }) {
  state.modalOpen = true;
  elements.modalKicker.textContent = kicker;
  elements.modalTitle.textContent = title;
  elements.modalBody.innerHTML = body;
  elements.modalActions.replaceChildren(
    ...actions.map((action) => makeButton(action.label, () => {
      if (action.close !== false) closeModal();
      action.onClick?.();
    }, action.className)),
  );
  elements.modalBackdrop.classList.remove("hidden");
  saveGame();
}

function closeModal() {
  state.modalOpen = false;
  elements.modalBackdrop.classList.add("hidden");
  elements.scene.focus();
}

function addLog(message) {
  state.log.unshift(message);
  state.log = state.log.slice(0, 10);
}

function changeEnergy(amount) {
  state.energy = Math.max(0, Math.min(100, state.energy + amount));
}

function setClock(clock) {
  state.clock = clock;
}

function startGame(technicianId) {
  resetRuntimeState();
  state.technician = content.technicians.find((item) => item.id === technicianId);
  state.tools = [...state.technician.startingTools];
  state.energy = state.technician.stats.energy;
  state.burnout = state.technician.stats.burnout;
  addLog("First day started. Nobody mentioned an onboarding packet.");
  elements.selection.classList.add("hidden");
  elements.gameLayout.classList.remove("hidden");
  elements.menuButton.classList.remove("hidden");
  enterScene("shop");
}

function enterScene(sceneId, playerPosition = null) {
  state.sceneId = sceneId;
  state.player = playerPosition && !overlapsSolidObject(playerPosition.x, playerPosition.y)
    ? { ...playerPosition }
    : { ...content.scenes[sceneId].playerStart };
  render();
  elements.scene.focus();
}

function getNextShopLoad() {
  return content.tutorial.shopLoad.find((item) => !state.loaded.includes(item));
}

function getNextGarageUnload() {
  return content.tutorial.garageUnload.find((item) => !state.delivered.includes(item));
}

function getNextAssemblyItem() {
  return content.tutorial.assembly.find((item) => !state.assembled.includes(item.id));
}

function promptTravel() {
  showModal({
    kicker: "Route Summary",
    title: "Broomall -> Center City East",
    body: `
      <p><strong>Dispatch estimate:</strong> Simple two-cart build. Supervisor onsite.</p>
      <p>Today's drive is scripted for the tutorial. Future jobs can offer route, toll, and parking choices.</p>
      <div class="route-line"><span>BROOMALL</span><i></i><span>CENTER CITY EAST</span></div>
    `,
    actions: [{
      label: "Drive to Center City",
      onClick: () => {
        setClock("MON 8:03 AM");
        addLog("Arrived in Center City East. Curb unloading was not arranged.");
        showParkingModal();
      },
    }],
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
  showModal({
    kicker: "Client Entrance",
    title: "Everything Is Inside",
    body: `<p>You made the garage trips manually. A folding hand truck is beginning to sound appealing.</p>`,
    actions: [{ label: "Enter Lobby", onClick: () => enterScene("lobby") }],
  });
}

function showSupervisorDeparture() {
  state.flags.supervisorLeft = true;
  setClock("MON 11:38 AM");
  showModal({
    kicker: "Supervisor Update",
    title: "You Should Be Fine. Probably.",
    body: `
      <p><strong>Supervisor:</strong> "I'm sorry. They need me at another site for meetings. Finish the second cart the same way and text me if anything gets weird."</p>
      <p>Your supervisor leaves apologetically. They appear to be having a worse day than you.</p>
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

function showFinishChoice() {
  setClock("MON 5:46 PM");
  showModal({
    kicker: "Last Decision",
    title: "Cart 2 Works. The Cables Do Not Look Happy.",
    body: `
      <p>Dispatch expected you to be done hours ago. You can clean up the cable routing or leave before traffic gets worse.</p>
      <p><strong>Energy:</strong> ${state.energy}/100</p>
    `,
    actions: [
      { label: "Dress the cables properly (+35 min)", onClick: () => finishJob("tidy") },
      { label: "Use three zip ties and leave", className: "secondary-button", onClick: () => finishJob("rush") },
    ],
  });
}

function finishJob(choice) {
  state.flags.finished = true;
  state.flags.finishChoice = choice;
  if (choice === "tidy") {
    changeEnergy(-13);
    state.burnout += 1;
    setClock("MON 6:21 PM");
    addLog("Cable routing cleaned up. Client is happy. Management notices the clock.");
  } else {
    changeEnergy(-4);
    setClock("MON 5:54 PM");
    addLog("You left before traffic got worse. The second cart may become a callback.");
  }
  showResults();
}

function showResults() {
  const tidy = state.flags.finishChoice === "tidy";
  showModal({
    kicker: "End of Day",
    title: "Two Quick Carts: Complete",
    body: `
      <div class="results-grid">
        <span>Base wages</span><strong>+$128</strong>
        <span>Overtime</span><strong>+${tidy ? "$42" : "$31"}</strong>
        <span>Garage parking</span><strong>-$18</strong>
        <span>Expense status</span><strong>Receipt under review</strong>
        <span>Energy remaining</span><strong>${state.energy}/100</strong>
        <span>Burnout</span><strong>${state.burnout}</strong>
      </div>
      <blockquote>Management note: "Please improve time management and plan parking more efficiently."</blockquote>
      <p>You survived your first week early. Choose one starter upgrade.</p>
    `,
    actions: content.tutorial.rewardTools.map((toolId) => ({
      label: content.tools[toolId].name,
      className: "secondary-button",
      onClick: () => chooseReward(toolId),
    })),
  });
}

function chooseReward(toolId) {
  state.tools.push(toolId);
  state.flags.reward = toolId;
  showModal({
    kicker: "Personal Tool Added",
    title: content.tools[toolId].name,
    body: `
      <p>${content.tools[toolId].description}</p>
      <p class="muted">${content.tools[toolId].effect}</p>
    `,
    actions: [{
      label: "Return to Broomall Shop",
      onClick: () => {
        state.carry = null;
        addLog(`${content.tools[toolId].name} added to your personal kit.`);
        addLog("Returned to the Broomall shop. More dispatches will be added next.");
        enterScene("shop");
      },
    }],
  });
}

function getInteractions() {
  if (state.sceneId === "shop") {
    return [
      {
        x: 330, y: 330, label: "Talk to supervisor", npc: "SUP",
        action: () => {
          if (state.flags.finished) return notify('Supervisor: "Good work today. Dispatch will have more tomorrow."');
          if (!state.flags.shopBrief) {
            state.flags.shopBrief = true;
            addLog("Supervisor asked you to load the staged cart boxes into Van #3.");
            showModal({
              kicker: "Supervisor",
              title: "We're Already Late",
              body: `<p>"You must be the new tech. Grab those cart boxes and load Van #3. We have a simple two-cart build downtown. I'll show you everything onsite."</p>`,
              actions: [{ label: "Start Loading", onClick: render }],
            });
          } else {
            notify('Supervisor: "Load the staged boxes into Van #3 and we can go."');
          }
        },
      },
      {
        x: 150, y: 170, label: "Read dispatch board",
        action: () => notify("Dispatch board: TWO QUICK CARTS. Estimated labor: unclear."),
      },
      {
        x: 590, y: 180, label: "Pick up staged equipment",
        action: () => {
          if (!state.flags.shopBrief) return notify("You should ask the supervisor what is happening.");
          if (state.carry) return notify("Your hands are already full.");
          const next = getNextShopLoad();
          if (!next) return notify("The staged equipment is loaded.");
          state.carry = next;
          changeEnergy(-2);
          addLog(`Picked up ${next}.`);
          render();
        },
      },
      {
        x: 580, y: 400, label: "Inspect shop loaner drill",
        action: () => {
          showModal({
            kicker: "Company Loaner",
            title: "Shop Loaner Drill",
            body: `<p><strong>Battery:</strong> 18%</p><p><strong>Charger:</strong> Reportedly in another van</p>`,
            actions: [{ label: "Leave It Here" }],
          });
        },
      },
      {
        x: 830, y: 380, label: state.carry ? "Load item into Van #3" : "Inspect Van #3",
        action: () => {
          if (state.carry) {
            state.loaded.push(state.carry);
            addLog(`${state.carry} loaded into Van #3.`);
            state.carry = null;
            if (state.loaded.length === content.tutorial.shopLoad.length) {
              addLog("Van loaded. Supervisor is ready to leave for Center City East.");
            }
            return render();
          }
          if (state.flags.finished) return notify("Van #3 is parked. Future dispatches will start here.");
          if (state.loaded.length === content.tutorial.shopLoad.length && state.flags.shopBrief) return promptTravel();
          notify("Company Van #3: limited cargo, poor organization, questionable reliability.");
        },
      },
    ];
  }

  if (state.sceneId === "garage") {
    return [
      ...(!state.flags.garageBrief ? [{
        x: 665, y: 360, label: "Talk to supervisor", npc: "SUP",
        action: () => {
          state.flags.garageBrief = true;
          addLog("Supervisor confirmed the garage carry was not included in dispatch's estimate.");
          showModal({
            kicker: "Supervisor",
            title: "About the Loading Dock",
            body: `<p>"Nobody booked one. We'll carry the boxes from here. It's not that far."</p><p>It is farther than dispatch estimated.</p>`,
            actions: [{ label: "Start Unloading", onClick: render }],
          });
        },
      }] : []),
      {
        x: 800, y: 375, label: "Unload next box group",
        action: () => {
          if (!state.flags.garageBrief) return notify("Your supervisor is waiting beside the van.");
          if (state.carry) return notify("Your hands are already full.");
          const next = getNextGarageUnload();
          if (!next) return notify("Everything has been carried to the client entrance.");
          state.carry = next;
          changeEnergy(-3);
          addLog(`Unloaded ${next} from the van.`);
          render();
        },
      },
      {
        x: 116, y: 185, label: state.carry ? "Carry item to client entrance" : "Walk to client entrance",
        action: () => {
          if (state.carry) {
            state.delivered.push(state.carry);
            addLog(`${state.carry} carried from garage to the client entrance.`);
            state.carry = null;
            changeEnergy(-4);
            if (state.delivered.length === content.tutorial.garageUnload.length) {
              setClock("MON 8:39 AM");
              addLog("Equipment delivered to lobby. Utility cart would have helped.");
              return showLobbyTransition();
            }
            return render();
          }
          notify("The equipment still needs to be carried from the van.");
        },
      },
    ];
  }

  if (state.sceneId === "lobby") {
    return [
      {
        x: 405, y: 225, label: "Check in with security", npc: "SEC",
        action: () => {
          state.flags.securityChecked = true;
          changeEnergy(-2);
          setClock("MON 8:52 AM");
          addLog("Security printed a visitor badge after locating the work order.");
          showModal({
            kicker: "Security Desk",
            title: "Visitor Badge Located Eventually",
            body: `<p>The client contact used a different company abbreviation. Security finds the work order after a short wait.</p>`,
            actions: [{ label: "Take Badge", onClick: render }],
          });
        },
      },
      {
        x: 795, y: 205, label: "Take elevator to client floor",
        action: () => {
          if (!state.flags.securityChecked) return notify("Security wants you to check in first.");
          setClock("MON 9:06 AM");
          addLog("Reached the client floor with the delivered equipment.");
          enterScene("client");
        },
      },
    ];
  }

  return [
    ...(!state.flags.roomBrief && !state.flags.supervisorLeft ? [{
      x: 320, y: 185, label: "Talk to supervisor", npc: "SUP",
      action: () => {
        state.flags.roomBrief = true;
        addLog("Supervisor explained cart assembly in a hurry.");
        showModal({
          kicker: "Supervisor",
          title: "First Cart Together",
          body: `<p>"Frame first, then display. We'll build the first one together. The second is the same thing twice."</p>`,
          actions: [{ label: "Open the Boxes", onClick: render }],
        });
      },
    }] : []),
    {
      x: 178, y: 345, label: "Pick up next cart component",
      action: () => {
        if (!state.flags.roomBrief) return notify("Your supervisor is ready to explain the first cart.");
        if (state.carry) return notify("Your hands are already full.");
        const next = getNextAssemblyItem();
        if (!next) return notify("Both carts are assembled.");
        state.carry = next.id;
        changeEnergy(-2);
        addLog(`Picked up ${next.label}.`);
        render();
      },
    },
    { x: 530, y: 220, label: "Install component on Cart 1", action: () => installCartPart("cart1") },
    { x: 755, y: 390, label: "Install component on Cart 2", action: () => installCartPart("cart2") },
  ];
}

function installCartPart(destination) {
  if (!state.carry) return notify("Pick up the next cart component from the delivered boxes.");
  const part = content.tutorial.assembly.find((item) => item.id === state.carry);
  if (!part || part.destination !== destination) return notify(`${part?.label || "That component"} belongs on the other cart.`);
  state.assembled.push(part.id);
  state.carry = null;
  changeEnergy(-7);
  addLog(`${part.label} installed with your screwdriver.`);
  const cart1Done = state.assembled.filter((id) => id.startsWith("cart-1")).length === 2;
  const cart2Done = state.assembled.filter((id) => id.startsWith("cart-2")).length === 2;
  if (cart1Done && !state.flags.supervisorLeft) return showSupervisorDeparture();
  if (cart2Done && !state.flags.finished) return showFinishChoice();
  render();
}

function notify(message) {
  addLog(message);
  render();
}

function getObjective() {
  if (state.sceneId === "shop") {
    if (state.flags.finished) return "First tutorial complete. Explore the shop.";
    if (!state.flags.shopBrief) return "Find your supervisor.";
    if (state.loaded.length < content.tutorial.shopLoad.length) return `Load staged equipment into Van #3 (${state.loaded.length}/3).`;
    return "Inspect Van #3 and leave for Center City East.";
  }
  if (state.sceneId === "garage") {
    if (!state.flags.garageBrief) return "Meet your supervisor beside Van #3.";
    return `Carry equipment from the garage to the client entrance (${state.delivered.length}/3).`;
  }
  if (state.sceneId === "lobby") {
    if (!state.flags.securityChecked) return "Check in with security.";
    return "Take the elevator to the client floor.";
  }
  if (!state.flags.roomBrief) return "Ask the supervisor how to start the cart build.";
  if (state.assembled.length < 2) return `Assemble Cart 1 with your supervisor (${state.assembled.length}/2).`;
  if (state.assembled.length < 4) return `Finish Cart 2 alone (${state.assembled.length - 2}/2).`;
  return "Review the result of your first day.";
}

function distanceTo(interaction) {
  return Math.hypot(state.player.x - interaction.x, state.player.y - interaction.y);
}

function getNearestInteraction() {
  if (!state.sceneId) return null;
  return getInteractions()
    .map((interaction) => ({ ...interaction, distance: distanceTo(interaction) }))
    .filter((interaction) => interaction.distance < 105)
    .sort((a, b) => a.distance - b.distance)[0] || null;
}

function interact() {
  if (state.modalOpen || !state.sceneId) return;
  const nearest = getNearestInteraction();
  if (!nearest) return notify("Nothing nearby needs your attention.");
  nearest.action();
}

function overlapsSolidObject(x, y) {
  const playerBounds = { left: x - 11, right: x + 11, top: y - 13, bottom: y + 13 };
  return content.scenes[state.sceneId].decor
    .filter((item) => item.solid)
    .some((item) => (
      playerBounds.right > item.x
      && playerBounds.left < item.x + item.w
      && playerBounds.bottom > item.y
      && playerBounds.top < item.y + item.h
    ));
}

function moveOnAxis(axis, amount) {
  const next = { ...state.player, [axis]: state.player[axis] + amount };
  next.x = Math.max(28, Math.min(912, next.x));
  next.y = Math.max(48, Math.min(500, next.y));
  if (!overlapsSolidObject(next.x, next.y)) state.player = next;
}

function movePlayer() {
  if (state.modalOpen || !state.sceneId) return;
  let dx = 0;
  let dy = 0;
  if (keys.has("arrowleft") || keys.has("a")) dx -= 1;
  if (keys.has("arrowright") || keys.has("d")) dx += 1;
  if (keys.has("arrowup") || keys.has("w")) dy -= 1;
  if (keys.has("arrowdown") || keys.has("s")) dy += 1;
  if (!dx && !dy) return;
  const length = Math.hypot(dx, dy);
  moveOnAxis("x", (dx / length) * PLAYER_SPEED);
  moveOnAxis("y", (dy / length) * PLAYER_SPEED);
  renderPlayer();
  renderNearby();
}

function renderSelection() {
  elements.technicianGrid.replaceChildren(
    ...content.technicians.map((technician) => {
      const card = document.createElement("article");
      card.className = "technician-card";
      card.innerHTML = `
        <p class="eyebrow">Placeholder Profile</p>
        <h3>${technician.name}</h3>
        <p>${technician.tagline}</p>
        <div class="tech-stats">
          <span>Energy <strong>${technician.stats.energy}</strong></span>
          <span>Craft <strong>${technician.stats.craftsmanship}</strong></span>
          <span>Confidence <strong>${technician.stats.confidence}</strong></span>
        </div>
      `;
      card.append(makeButton("Start First Day", () => startGame(technician.id)));
      return card;
    }),
  );
}

function renderDecor() {
  const scene = content.scenes[state.sceneId];
  const decor = scene.decor.map((item) => {
    const node = document.createElement("div");
    node.className = `decor ${item.type}`;
    node.style.left = `${item.x}px`;
    node.style.top = `${item.y}px`;
    node.style.width = `${item.w}px`;
    node.style.height = `${item.h}px`;
    node.textContent = item.text;
    return node;
  });
  const interactions = getInteractions().map((item) => {
    const marker = document.createElement("div");
    marker.className = item.npc ? "interaction-marker npc-marker" : "interaction-marker";
    marker.style.left = `${item.x - 11}px`;
    marker.style.top = `${item.y - 11}px`;
    marker.title = item.label;
    marker.textContent = item.npc || "";
    return marker;
  });
  elements.sceneLayer.replaceChildren(...decor, ...interactions);
}

function renderPlayer() {
  elements.player.style.left = `${state.player.x - 15}px`;
  elements.player.style.top = `${state.player.y - 19}px`;
  const carried = state.carry
    ? content.tutorial.assembly.find((item) => item.id === state.carry)?.label || state.carry
    : null;
  elements.carryBubble.textContent = carried || "";
  elements.carryBubble.classList.toggle("hidden", !carried);
}

function renderNearby() {
  const nearest = getNearestInteraction();
  elements.nearbyCard.textContent = nearest ? nearest.label : "Walk toward an object or person.";
  elements.interactButton.disabled = !nearest;
  elements.interactButton.textContent = nearest ? `Interact: ${nearest.label}` : "Interact";
}

function renderHud() {
  const vehicle = content.vehicles.van3;
  elements.techName.textContent = state.technician.name;
  elements.energyValue.textContent = state.energy;
  elements.energyMeter.style.width = `${state.energy}%`;
  elements.burnoutValue.textContent = state.burnout;
  elements.craftValue.textContent = state.technician.stats.craftsmanship;
  elements.confidenceValue.textContent = state.technician.stats.confidence;
  elements.carryCard.textContent = state.carry
    ? content.tutorial.assembly.find((item) => item.id === state.carry)?.label || state.carry
    : "Nothing";
  elements.toolList.replaceChildren(...state.tools.map((toolId) => {
    const li = document.createElement("li");
    li.textContent = content.tools[toolId].name;
    return li;
  }));
  elements.vehicleCard.innerHTML = `
    <strong>${vehicle.name}</strong>
    <span>Cargo: ${state.loaded.length}/${vehicle.cargoCapacity}</span>
    <span>Organization: ${vehicle.organization}</span>
    <small>${vehicle.comfort}</small>
  `;
}

function renderLog() {
  elements.fieldLog.replaceChildren(...state.log.map((message) => {
    const li = document.createElement("li");
    li.textContent = message;
    return li;
  }));
}

function render() {
  if (!state.sceneId) return;
  const scene = content.scenes[state.sceneId];
  elements.locationTitle.textContent = scene.name;
  elements.sceneKicker.textContent = scene.kicker;
  elements.sceneName.textContent = scene.name;
  elements.clock.textContent = state.clock;
  elements.jobStatus.textContent = state.flags.finished ? "SHIFT COMPLETE" : "FIRST DAY";
  elements.objective.textContent = getObjective();
  elements.taskCopy.textContent = getObjective();
  renderDecor();
  renderPlayer();
  renderNearby();
  renderHud();
  renderLog();
  saveGame();
}

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (["arrowleft", "arrowright", "arrowup", "arrowdown", "w", "a", "s", "d", "e", " "].includes(key)) {
    event.preventDefault();
  }
  keys.add(key);
  if ((key === "e" || key === " ") && !event.repeat) interact();
  if (!event.repeat && ["arrowleft", "arrowright", "arrowup", "arrowdown", "w", "a", "s", "d"].includes(key)) {
    movePlayer();
  }
});

document.addEventListener("keyup", (event) => keys.delete(event.key.toLowerCase()));
elements.interactButton.addEventListener("click", interact);
elements.continueButton.addEventListener("click", continueGame);
elements.newGameButton.addEventListener("click", promptNewCareer);
elements.clearSaveButton.addEventListener("click", promptClearSavedGame);
elements.selectionBackButton.addEventListener("click", showTitleScreen);
elements.menuButton.addEventListener("click", showTitleScreen);
setInterval(movePlayer, 16);

renderSelection();
showTitleScreen();
