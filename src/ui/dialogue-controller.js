import { dampAngle } from "../core/math.js";

export function createDialogueController({
  THREE,
  dom,
  PLAYER_NAME,
  setPlayerAction,
  playerActions,
  getActivePlayerAction,
  setAnimalAction,
  notebook,
  interactionCounts,
  overlayOpen,
  interactables,
  player,
  wanderingAnimals,
  camera,
  bubbleProjected,
  bubbleAnchor,
  STATIONS,
  stationLabels,
  stationAnchors,
  projected,
  visited,
  updateProgress,
  isWorldStarted,
  getNearestStation
}) {
  let nearestInteractable = null;
  let callingInteractable = null;
  let lastCalloutWave = 0;
  let activeDialogue = null;
  let dialogueGestureTimer = 0;

  const dialogueFocusPattern = /(warming ocean|rising seas?|rising waterlines?|rainfall|freshwater|safe water|safely managed water|water access|water security|observing network|stations?|shared direction|long records?|missing data|field notes?|compare|evidence|waterline|climate records?)/gi;
  const dialogueFocusCheck = new RegExp(dialogueFocusPattern.source, "i");
  
  function renderFocusedText(text) {
    dom.dialogueText.replaceChildren();
    const parts = text.split(dialogueFocusPattern);
    const hasFocus = parts.some((part) => dialogueFocusCheck.test(part));
    if (!hasFocus) {
      const words = text.split(" ");
      const strong = document.createElement("strong");
      strong.textContent = words.slice(0, Math.min(4, words.length)).join(" ");
      dom.dialogueText.append(strong, document.createTextNode(words.length > 4 ? ` ${words.slice(4).join(" ")}` : ""));
      return;
    }
    parts.forEach((part) => {
      if (dialogueFocusCheck.test(part)) {
        const strong = document.createElement("strong");
        strong.textContent = part;
        dom.dialogueText.append(strong);
      } else dom.dialogueText.append(document.createTextNode(part));
    });
  }
  
  function renderDialogueLine() {
    if (!activeDialogue) return;
    const line = activeDialogue.lines[activeDialogue.index];
    dom.dialogueSpeaker.textContent = line.speaker.toLowerCase();
    dom.dialogueRole.textContent = (line.speaker === PLAYER_NAME ? "field researcher" : activeDialogue.item?.role || "field conversation").toLowerCase();
    renderFocusedText(line.text);
    const lastLine = activeDialogue.index === activeDialogue.lines.length - 1;
    dom.dialogueNext.setAttribute("aria-label", lastLine ? "finish conversation" : "continue dialogue");
    playDialogueGesture(line);
  }
  
  function playDialogueGesture(line) {
    window.clearTimeout(dialogueGestureTimer);
    const playerLine = line.speaker === PLAYER_NAME;
    if (playerLine) {
      setPlayerAction("interact-right");
      const action = playerActions.get(getActivePlayerAction());
      action?.reset().setLoop(THREE.LoopOnce, 1).fadeIn(.1).play();
      if (action) action.clampWhenFinished = true;
    } else if (activeDialogue?.item?.actor) {
      const actor = activeDialogue.item.actor;
      const gesture = activeDialogue.item.id.startsWith("animal-") ? "idle" : "emote-yes";
      setAnimalAction(actor, gesture);
      const action = actor.actions?.get(actor.active);
      if (gesture !== "idle") {
        action?.reset().setLoop(THREE.LoopOnce, 1).fadeIn(.1).play();
        if (action) action.clampWhenFinished = true;
      }
    }
    dialogueGestureTimer = window.setTimeout(() => {
      if (!activeDialogue) return;
      setPlayerAction("idle");
      if (activeDialogue.item?.actor) setAnimalAction(activeDialogue.item.actor, "idle");
    }, 720);
  }
  
  function closeDialogue(completed = false) {
    if (!activeDialogue) return;
    const finished = activeDialogue;
    activeDialogue = null;
    window.clearTimeout(dialogueGestureTimer);
    dom.dialogue.classList.remove("is-visible");
    dom.dialogue.setAttribute("aria-hidden", "true");
    if (finished.item?.actor) setAnimalAction(finished.item.actor, "idle");
    if (completed) {
      if (finished.item?.notebookEntry && finished.round >= (finished.item.notebookRound ?? 1)) notebook.addObservation(finished.item.notebookEntry);
      if (finished.completion) finished.completion(finished);
      else finished.item?.onComplete?.(finished);
    }
  }
  
  function startDialogue(item, lines = null, countInteraction = true, completion = null) {
    if (!item || activeDialogue) return;
    const priorInteractions = interactionCounts.get(item.id) || 0;
    const round = Math.min(priorInteractions, 3);
    if (countInteraction) interactionCounts.set(item.id, Math.min(priorInteractions + 1, 3));
    activeDialogue = { item, lines: lines || item.getConversation(round), index: 0, round, completion };
    const dx = item.root.position.x - player.position.x;
    const dz = item.root.position.z - player.position.z;
    activeDialogue.playerFacing = Math.atan2(dx, dz);
    activeDialogue.actorFacing = Math.atan2(-dx, -dz);
    dom.dialogue.classList.add("is-visible");
    dom.dialogue.setAttribute("aria-hidden", "false");
    renderDialogueLine();
  }
  
  function advanceDialogue() {
    if (!activeDialogue) return;
    if (activeDialogue.index < activeDialogue.lines.length - 1) {
      activeDialogue.index += 1;
      renderDialogueLine();
      return;
    }
    closeDialogue(true);
  }
  
  function interactWithNearest() {
    if (activeDialogue) {
      advanceDialogue();
      return;
    }
    if (nearestInteractable && !overlayOpen()) startDialogue(nearestInteractable);
  }
  
  function updateInteractions(time) {
    nearestInteractable = null;
    callingInteractable = null;
    let nearestDistance = Infinity;
    let callingDistance = Infinity;
    interactables.forEach((item) => {
      if (item.interactionDisabled) return;
      const dx = player.position.x - item.root.position.x;
      const dz = player.position.z - item.root.position.z;
      const distance = Math.hypot(dx, dz);
      if (distance < item.interactionRadius && distance < nearestDistance) {
        nearestDistance = distance;
        nearestInteractable = item;
      }
      const hasMoreToSay = (interactionCounts.get(item.id) || 0) < 3;
      const isHuman = !item.id.startsWith("animal-");
      if (isHuman && hasMoreToSay && distance >= item.interactionRadius && distance < 8 && distance < callingDistance) {
        callingDistance = distance;
        callingInteractable = item;
      }
    });
    const unavailable = !nearestInteractable || overlayOpen() || !isWorldStarted();
    dom.interactionPrompt.hidden = unavailable;
    if (!unavailable) dom.interactionCopy.textContent = `Talk to ${nearestInteractable.name}`;
    const showCallout = callingInteractable && !overlayOpen() && isWorldStarted();
    dom.nearbyCallout.hidden = !showCallout;
    if (showCallout) {
      dom.nearbyCaller.textContent = callingInteractable.name.toLowerCase();
      dom.nearbyMessage.textContent = callingInteractable.station?.callout
        || (callingInteractable.id === "professor-piko" ? "bring me what you find" : "i noticed something worth recording");
      if (time - lastCalloutWave > 4200 && callingInteractable.actor) {
        const wavingActor = callingInteractable.actor;
        wavingActor.calloutUntil = time + 1050;
        setAnimalAction(wavingActor, "emote-yes");
        if (!wanderingAnimals.includes(wavingActor)) window.setTimeout(() => {
          if (activeDialogue?.item?.actor !== wavingActor) setAnimalAction(wavingActor, "idle");
        }, 1100);
        lastCalloutWave = time;
      }
    }
  }
  
  function updateWorldBubbles(delta = 1 / 60) {
    if (activeDialogue) {
      player.rotation.y = dampAngle(player.rotation.y, activeDialogue.playerFacing, 13, delta);
      if (activeDialogue.item.root) activeDialogue.item.root.rotation.y = dampAngle(activeDialogue.item.root.rotation.y, activeDialogue.actorFacing, 13, delta);
      const line = activeDialogue.lines[activeDialogue.index];
      const root = line.speaker === PLAYER_NAME ? player : activeDialogue.item.root;
      root.getWorldPosition(bubbleAnchor);
      bubbleAnchor.y += line.speaker === PLAYER_NAME ? 2.55 : 2.9;
      bubbleProjected.copy(bubbleAnchor).project(camera);
      const left = THREE.MathUtils.clamp((bubbleProjected.x * .5 + .5) * innerWidth, 175, innerWidth - 175);
      const top = THREE.MathUtils.clamp((-bubbleProjected.y * .5 + .5) * innerHeight, 215, innerHeight - 90);
      dom.dialogue.style.left = `${left}px`;
      dom.dialogue.style.top = `${top}px`;
      dom.dialogue.classList.toggle("is-player-line", line.speaker === PLAYER_NAME);
    }
    if (!dom.interactionPrompt.hidden && nearestInteractable) {
      nearestInteractable.root.getWorldPosition(bubbleAnchor);
      bubbleAnchor.y += 2.72;
      bubbleProjected.copy(bubbleAnchor).project(camera);
      dom.interactionPrompt.style.left = `${THREE.MathUtils.clamp((bubbleProjected.x * .5 + .5) * innerWidth, 110, innerWidth - 110)}px`;
      dom.interactionPrompt.style.top = `${THREE.MathUtils.clamp((-bubbleProjected.y * .5 + .5) * innerHeight, 105, innerHeight - 75)}px`;
    }
    if (!dom.nearbyCallout.hidden && callingInteractable) {
      callingInteractable.root.getWorldPosition(bubbleAnchor);
      bubbleAnchor.y += 2.75;
      bubbleProjected.copy(bubbleAnchor).project(camera);
      dom.nearbyCallout.style.left = `${THREE.MathUtils.clamp((bubbleProjected.x * .5 + .5) * innerWidth, 105, innerWidth - 105)}px`;
      dom.nearbyCallout.style.top = `${THREE.MathUtils.clamp((-bubbleProjected.y * .5 + .5) * innerHeight, 120, innerHeight - 90)}px`;
    }
  }
  
  function updateStationLabels() {
    const width = innerWidth;
    const height = innerHeight;
    STATIONS.forEach((station) => {
      const label = stationLabels.get(station.id);
      if (!label) return;
      projected.copy(stationAnchors.get(station.id)).project(camera);
      const visible = projected.z > -1 && projected.z < 1 && Math.abs(projected.x) < 1.05 && Math.abs(projected.y) < 1.05;
      label.classList.toggle("is-hidden", !visible || overlayOpen());
      label.classList.toggle("is-near", getNearestStation()?.id === station.id);
      label.classList.toggle("is-visited", visited.has(station.id));
      if (!visible) return;
      label.style.left = `${(projected.x * .5 + .5) * width}px`;
      label.style.top = `${(-projected.y * .5 + .5) * height}px`;
    });
  }
  

  return {
    start: startDialogue,
    close: closeDialogue,
    advance: advanceDialogue,
    interactWithNearest,
    updateInteractions,
    updateWorldBubbles,
    updateStationLabels,
    isActive: () => Boolean(activeDialogue),
    isActorTalking: (actor) => activeDialogue?.item?.actor === actor,
  };
}
