// Interaction UI helpers: nearest target lookup, marker labels/placement, pressure copy, and interact action.
// Scene-specific interaction definitions live in scene-interactions-system.js; this file presents them to the player.
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

const INTERACTION_OBJECTIVE_PRIORITY = {
  critical: 600,
  recovery: 500,
  required: 400,
  pressure: 300,
  optional: 200,
  return: 100,
};

function getInteractionIdentity(interaction) {
  if (!interaction) return "";
  return interaction.id || interaction.portalId || `${interaction.label || "interaction"}:${interaction.x}:${interaction.y}`;
}

function getInteractionObjectivePriority(interaction) {
  const value = typeof interaction?.objectivePriority === "function"
    ? interaction.objectivePriority()
    : interaction?.objectivePriority;
  if (typeof value === "number") return value;
  return INTERACTION_OBJECTIVE_PRIORITY[value] || 0;
}

// Explicit scene metadata identifies the next physical object without making every nearby object compete for attention.
function getPrimaryInteraction() {
  if (!state.sceneId) return null;
  return getInteractions()
    .map((interaction) => {
      const taskState = getInteractionTaskState(interaction);
      const basePriority = getInteractionObjectivePriority(interaction);
      const stateAdjustment = {
        strained: 40,
        ready: 30,
        "in-progress": 20,
        locked: -50,
        completed: -200,
      }[taskState?.id] || 0;
      return {
        ...interaction,
        taskState,
        objectiveScore: basePriority + stateAdjustment,
      };
    })
    .filter((interaction) => getInteractionObjectivePriority(interaction) > 0 && interaction.taskState?.id !== "completed")
    .sort((a, b) => b.objectiveScore - a.objectiveScore || distanceTo(a) - distanceTo(b))[0] || null;
}

function getPrimaryInteractionObjectiveText(interaction = getPrimaryInteraction()) {
  if (!interaction) return "";
  const hint = typeof interaction.objectiveHint === "function"
    ? interaction.objectiveHint()
    : interaction.objectiveHint;
  return hint || interaction.taskState?.detail || interaction.label || "";
}

function getInteractionMarkerKind(interaction) {
  if (!interaction) return "task";
  if (interaction.markerKind) return interaction.markerKind;
  if (interaction.portalKind === "returnRoute") return "return";
  if (interaction.portalId) return "door";
  if (interaction.npc) return "contact";
  const label = interaction.label || "";
  if (/van|vehicle/i.test(label)) return "van";
  if (/carry|unload|pick up|install|search|inspect|file|review|close out|browse|read|choose|meet escort|ask what|practice/i.test(label)) return "task";
  if (/return|exit/i.test(label)) return "return";
  if (/door|entrance|elevator|lobby|room/i.test(label)) return "door";
  if (/talk|client|security|facilities|supervisor|josh|escort|contact/i.test(label)) return "contact";
  return "task";
}

function getInteractionMarkerText(interaction) {
  if (interaction?.markerText) return interaction.markerText;
  if (interaction?.npc) return String(interaction.npc).toUpperCase();
  const kind = getInteractionMarkerKind(interaction);
  if (kind === "task") return getTaskInteractionMarkerText(interaction);
  if (kind === "contact") return getContactInteractionMarkerText(interaction);
  const labels = {
    contact: "CONTACT",
    task: "TASK",
    van: "VAN",
    door: "DOOR",
    return: "RETURN",
  };
  return labels[kind] || "TASK";
}

function getContactInteractionMarkerText(interaction) {
  const label = interaction?.label || "";
  const patterns = [
    [/security|booth/i, "SEC"],
    [/facilities/i, "FAC"],
    [/escort/i, "ESCORT"],
    [/supervisor/i, "SUP"],
    [/josh/i, "JOSH"],
    [/client|contact/i, "CLIENT"],
  ];
  return patterns.find(([pattern]) => pattern.test(label))?.[1] || "TALK";
}

function getTaskInteractionMarkerText(interaction) {
  const label = interaction?.label || "";
  const patterns = [
    [/dispatch board/i, "BOARD"],
    [/career clipboard|field-training|training focus/i, "CAREER"],
    [/personal kit/i, "KIT"],
    [/personal tools|supply counter|browse/i, "TOOLS"],
    [/break area/i, "BREAK"],
    [/pick up/i, "PICKUP"],
    [/load carried|load .*van/i, "LOAD"],
    [/unload/i, "UNLOAD"],
    [/carry/i, "CARRY"],
    [/install/i, "INSTALL"],
    [/patch/i, "PATCH"],
    [/verify/i, "VERIFY"],
    [/test/i, "TEST"],
    [/search/i, "SEARCH"],
    [/inspect|check/i, "CHECK"],
    [/trace/i, "TRACE"],
    [/document/i, "DOCS"],
    [/review|compare/i, "REVIEW"],
    [/close out|file .*report/i, "CLOSE"],
    [/choose/i, "CHOOSE"],
    [/ask/i, "ASK"],
    [/practice|user path/i, "PATH"],
    [/find/i, "FIND"],
    [/read/i, "READ"],
  ];
  return patterns.find(([pattern]) => pattern.test(label))?.[1] || "TASK";
}

function getInteractionMarkerDimensions(kind) {
  const dimensions = {
    contact: { width: 76, height: 26 },
    task: { width: 70, height: 26 },
    van: { width: 56, height: 26 },
    door: { width: 58, height: 26 },
    return: { width: 76, height: 26 },
  };
  return dimensions[kind] || dimensions.task;
}

function getMarkerRect(position, dimensions) {
  return {
    left: position.x - (dimensions.width / 2),
    right: position.x + (dimensions.width / 2),
    top: position.y - (dimensions.height / 2),
    bottom: position.y + (dimensions.height / 2),
  };
}

function getDecorRect(item) {
  return {
    left: item.x,
    right: item.x + item.w,
    top: item.y,
    bottom: item.y + item.h,
  };
}

function doRectsOverlap(first, second) {
  return first.right > second.left
    && first.left < second.right
    && first.bottom > second.top
    && first.top < second.bottom;
}

function clampNumber(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function isPointInsideDecor(point, item) {
  return point.x >= item.x
    && point.x <= item.x + item.w
    && point.y >= item.y
    && point.y <= item.y + item.h;
}

function getInteractionMarkerPosition(interaction, kind) {
  const base = { x: interaction.x, y: interaction.y, placement: "center" };
  const scene = content.scenes[state.sceneId];
  const dimensions = getInteractionMarkerDimensions(kind);
  const baseRect = getMarkerRect(base, dimensions);
  const targetDecor = scene?.decor
    ?.filter((item) => item.text && (isPointInsideDecor(base, item) || doRectsOverlap(baseRect, getDecorRect(item))))
    .sort((a, b) => (
      Number(isPointInsideDecor(base, b)) - Number(isPointInsideDecor(base, a))
      || (a.w * a.h) - (b.w * b.h)
    ))[0];
  if (!targetDecor) return base;

  const padding = 8;
  const world = { width: 960, height: 540 };
  const minX = dimensions.width / 2 + padding;
  const maxX = world.width - dimensions.width / 2 - padding;
  const minY = dimensions.height / 2 + padding;
  const maxY = world.height - dimensions.height / 2 - padding;
  const candidates = [
    { x: base.x, y: targetDecor.y - dimensions.height / 2 - padding, edge: "top" },
    { x: base.x, y: targetDecor.y + targetDecor.h + dimensions.height / 2 + padding, edge: "bottom" },
    { x: targetDecor.x - dimensions.width / 2 - padding, y: base.y, edge: "left" },
    { x: targetDecor.x + targetDecor.w + dimensions.width / 2 + padding, y: base.y, edge: "right" },
  ].map((candidate) => ({
    x: clampNumber(candidate.x, minX, maxX),
    y: clampNumber(candidate.y, minY, maxY),
    placement: candidate.edge,
  }));
  const decorRects = (scene.decor || [])
    .filter((item) => item.text)
    .map(getDecorRect);
  return candidates
    .map((candidate) => {
      const rect = getMarkerRect(candidate, dimensions);
      const overlapCount = decorRects.filter((decorRect) => doRectsOverlap(rect, decorRect)).length;
      const distance = Math.hypot(candidate.x - base.x, candidate.y - base.y);
      return { ...candidate, overlapCount, distance };
    })
    .sort((a, b) => a.overlapCount - b.overlapCount || a.distance - b.distance)[0] || base;
}

function getInteractionMarkerClass(interaction, primaryInteraction = getPrimaryInteraction()) {
  const kind = getInteractionMarkerKind(interaction);
  return [
    "interaction-marker",
    `${kind}-marker`,
    interaction?.npc ? "npc-marker" : "",
    interaction?.portalId ? "portal-marker" : "",
    kind === "return" ? "return-portal-marker" : "",
    primaryInteraction && getInteractionIdentity(primaryInteraction) === getInteractionIdentity(interaction) ? "primary-objective-marker" : "",
  ].filter(Boolean).join(" ");
}

function getInteractionPressureText(interaction) {
  if (!interaction) return "";
  if (typeof interaction.pressure === "function") return interaction.pressure();
  if (interaction.pressure) return interaction.pressure;
  const label = interaction.label || "";
  const includeMovement = Boolean(interaction.portalId || /carry|unload|pick up|load|return|exit|entrance/i.test(label));
  const includeSkill = /install|inspect|search|check|file|review|close|patch|verify|document|report|handoff|warranty|diagnos/i.test(label);
  const includeLedger = /close|file|report|document|return|callback|handoff|warranty/i.test(label);
  if (!includeMovement && !includeSkill && !includeLedger) return "";
  return getActionPressureBrief({
    includeMovement,
    includeSkill,
    includeLedger,
  });
}

function getInteractionTaskState(interaction) {
  if (!interaction) return null;
  if (typeof interaction.taskState === "function") return interaction.taskState();
  if (interaction.taskState) return interaction.taskState;
  if (interaction.portalId) {
    const portal = getWorldPortal(interaction.portalId);
    if (!portal) return getTaskState({ lockedReason: "Transition is not mapped." });
    if (!isPortalReady(portal)) {
      return getTaskState({
        lockedReason: portal.requiredMessage || `${portal.label} is not available yet.`,
      });
    }
    return getTaskState({
      stateId: "ready",
      detail: `Destination: ${getPortalDestinationLabel(portal)}.`,
    });
  }
  return null;
}

function interact() {
  if (state.modalOpen || !state.sceneId) return;
  const nearest = getNearestInteraction();
  if (!nearest) return notify("Nothing nearby needs your attention.");
  nearest.action();
}
