(() => {
  if (typeof window.startAvTechRpg !== "function") {
    throw new Error("AV Tech RPG failed to load: startAvTechRpg is unavailable.");
  }
  window.startAvTechRpg();
})();
