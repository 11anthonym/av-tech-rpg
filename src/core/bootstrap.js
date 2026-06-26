(() => {
  let started = false;

  function startAvTechRpg() {
    if (started) return;
    started = true;

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

    installDebugTools();
    renderSelection();
    showTitleScreen();
    window.AV_TECH_RPG_READY = true;
  }

  startAvTechRpg();
})();
