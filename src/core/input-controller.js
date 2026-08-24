export function createInputController({
  THREE,
  dom,
  keyState,
  touchState,
  cameraState,
  isWorldStarted,
  setWorldStarted,
  overlayOpen,
  dialogueController,
  notebookController,
  notebook,
  beginWorld,
  startJump,
  interactWithNearest,
  advanceDialogue,
  closeDialogue,
  openAtlas,
  closeAtlas,
  startRevealHold,
  resetRevealHold,
  showLayer,
  resize,
}) {
  window.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(key)) event.preventDefault();
    if (dialogueController.isActive() && ["enter", " ", "e"].includes(key)) {
      event.preventDefault();
      advanceDialogue();
      return;
    }
    if (key === "escape") {
      if (dialogueController.isActive()) closeDialogue(false);
      else if (dom.atlas.classList.contains("is-visible")) closeAtlas();
      else if (dom.credits.classList.contains("is-visible")) showLayer(dom.credits, false);
      else if (dom.help.classList.contains("is-visible")) showLayer(dom.help, false);
      else if (dom.welcome.classList.contains("is-visible")) beginWorld();
      return;
    }
    if (key === "e" && dom.atlas.classList.contains("is-visible") && !notebook.isUnlocked("conclusion")) {
      event.preventDefault();
      startRevealHold();
      return;
    }
    if (key === "e") {
      interactWithNearest();
      return;
    }
    if (key === "n") {
      if (dialogueController.isActive()) closeDialogue(false);
      if (dom.atlas.classList.contains("is-visible")) closeAtlas();
      else openAtlas(notebookController.getSelectedStation());
      return;
    }
    if (key === " ") {
      startJump();
      return;
    }
    keyState.add(key);
  });

  window.addEventListener("keyup", (event) => {
    const key = event.key.toLowerCase();
    keyState.delete(key);
    if (key === "e") resetRevealHold();
  });
  window.addEventListener("blur", () => { keyState.clear(); resetRevealHold(); });
  window.addEventListener("resize", resize);

  let cameraDragging = false;
  let previousPointerX = 0;
  let previousPointerY = 0;
  dom.canvas.addEventListener("pointerdown", (event) => {
    if (!isWorldStarted() || overlayOpen()) return;
    cameraDragging = true;
    previousPointerX = event.clientX;
    previousPointerY = event.clientY;
    dom.canvas.setPointerCapture(event.pointerId);
  });
  dom.canvas.addEventListener("pointermove", (event) => {
    if (!cameraDragging) return;
    cameraState.yaw -= (event.clientX - previousPointerX) * .006;
    cameraState.yawTarget = cameraState.yaw;
    cameraState.distance = THREE.MathUtils.clamp(cameraState.distance + (event.clientY - previousPointerY) * .018, 8.5, 17);
    cameraState.height = THREE.MathUtils.lerp(6.2, 10.2, (cameraState.distance - 8.5) / 8.5);
    previousPointerX = event.clientX;
    previousPointerY = event.clientY;
  });
  dom.canvas.addEventListener("pointerup", (event) => {
    cameraDragging = false;
    if (dom.canvas.hasPointerCapture(event.pointerId)) dom.canvas.releasePointerCapture(event.pointerId);
  });
  dom.canvas.addEventListener("pointercancel", () => { cameraDragging = false; });
  dom.canvas.addEventListener("wheel", (event) => {
    if (!isWorldStarted() || overlayOpen()) return;
    event.preventDefault();
    cameraState.distance = THREE.MathUtils.clamp(cameraState.distance + event.deltaY * .008, 8.5, 17);
    cameraState.height = THREE.MathUtils.lerp(6.2, 10.2, (cameraState.distance - 8.5) / 8.5);
  }, { passive: false });

  document.querySelector("#enter-world").addEventListener("click", beginWorld);
  document.querySelector("#enter-atlas").addEventListener("click", () => { setWorldStarted(true); openAtlas("ocean"); });
  document.querySelector("#atlas-button").addEventListener("click", () => {
    const selectedStation = notebookController.getSelectedStation();
    openAtlas(selectedStation === "conclusion" ? "ocean" : selectedStation);
  });
  document.querySelector("#help-button").addEventListener("click", () => showLayer(dom.help, true));
  document.querySelector("#help-close").addEventListener("click", () => showLayer(dom.help, false));
  document.querySelector("#credits-button").addEventListener("click", () => showLayer(dom.credits, true));
  document.querySelector("#credits-close").addEventListener("click", () => showLayer(dom.credits, false));
  document.querySelector("#touch-interact").addEventListener("click", interactWithNearest);
  document.querySelector("#touch-jump").addEventListener("click", startJump);
  dom.interactionPrompt.addEventListener("click", interactWithNearest);
  dom.dialogueNext.addEventListener("click", advanceDialogue);
  const joystick = document.querySelector("#touch-joystick");
  const knob = document.querySelector("#joystick-knob");
  let joystickPointerId = null;
  const clearJoystick = () => {
    ["up", "down", "left", "right"].forEach((direction) => touchState.delete(direction));
    knob.style.transform = "translate(-50%, -50%)";
    joystickPointerId = null;
  };
  const moveJoystick = (event) => {
    if (joystickPointerId !== event.pointerId) return;
    const bounds = joystick.getBoundingClientRect();
    const radius = bounds.width * .34;
    const centerX = bounds.left + bounds.width / 2;
    const centerY = bounds.top + bounds.height / 2;
    const dx = event.clientX - centerX;
    const dy = event.clientY - centerY;
    const length = Math.hypot(dx, dy);
    const scale = Math.min(1, radius / Math.max(length, 1));
    const x = dx * scale;
    const y = dy * scale;
    knob.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
    ["up", "down", "left", "right"].forEach((direction) => touchState.delete(direction));
    if (Math.abs(x) > radius * .2) touchState.add(x < 0 ? "left" : "right");
    if (Math.abs(y) > radius * .2) touchState.add(y < 0 ? "up" : "down");
  };
  joystick.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    joystickPointerId = event.pointerId;
    joystick.setPointerCapture(event.pointerId);
    moveJoystick(event);
  });
  joystick.addEventListener("pointermove", moveJoystick);
  joystick.addEventListener("pointerup", clearJoystick);
  joystick.addEventListener("pointercancel", clearJoystick);
  const runButton = document.querySelector("#touch-run");
  const startRun = (event) => { event.preventDefault(); touchState.add("shift"); runButton.setPointerCapture(event.pointerId); };
  const stopRun = (event) => { event.preventDefault(); touchState.delete("shift"); };
  runButton.addEventListener("pointerdown", startRun);
  runButton.addEventListener("pointerup", stopRun);
  runButton.addEventListener("pointercancel", stopRun);
}
