import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { clone as cloneSkeleton } from "three/addons/utils/SkeletonUtils.js";
import { Octree } from "three/addons/math/Octree.js";
import { Capsule } from "three/addons/math/Capsule.js";
import { createPathOverlay } from "./world/path-overlay.js";
import { createFieldNotebook } from "./ui/notebook.js";
import { PATH_NETWORK, ISLAND_OUTLINE, INSPECTION_LOCATIONS } from "./config/world-layout.js";
import { dampAngle, linearSlope, signed } from "./core/math.js";
import { ANIMAL_NAMES, createAssetManifest } from "./config/assets.js";
import { renderHorizontalBarChart } from "./ui/bar-chart.js";
import { renderNotebookDetail } from "./ui/series-chart.js";
import { createStoryContent } from "./content/story-content.js";
import { createWorldBuilder } from "./world/world-builder.js";
import { createNotebookController } from "./ui/notebook-controller.js";
import { createDialogueController } from "./ui/dialogue-controller.js";
import { queryAppDom } from "./core/dom.js";
import { createInputController } from "./core/input-controller.js";

const [DATA, CLIMATE] = await window.PACIFIC_DATA_PROMISE;

const dom = queryAppDom();

const {
  territories,
  regions,
  PLAYER_NAME,
  STATIONS,
  CONCLUSION,
  GUIDE_MALIA_LINES,
  ANIMAL_NOTE_CHAPTER,
  TOWN_NOTE_CHAPTER,
  ANIMAL_PROFILES,
  ANIMAL_MALIA_LINES,
  TOWN_PROFILES,
  TOWN_CHARACTER_ASSETS,
  validateCharacterProfiles,
  METRICS
} = createStoryContent({ THREE, DATA, CLIMATE, linearSlope, signed });
const visited = new Set();
const keyState = new Set();
const touchState = new Set();
let worldStarted = false;
let nearestStation = null;
let openingPlayed = false;
const interactionCounts = new Map();
const interactables = [];
const notebook = createFieldNotebook({ root: dom.atlas });
let notebookController;
let dialogueController;

STATIONS.forEach((station) => {
  const dot = document.createElement("i");
  dot.dataset.station = station.id;
  dom.progressDots.append(dot);
});

const manager = new THREE.LoadingManager();
manager.onProgress = (_url, loaded, total) => {
  const progress = Math.max(8, Math.round((loaded / Math.max(total, 1)) * 100));
  const loadingStages = progress < 28
    ? "sketching the coastline"
    : progress < 52
      ? "planting paths and gardens"
      : progress < 78
        ? "inviting the field guides"
        : "opening the notebook";
  dom.loadingBar.style.width = `${progress}%`;
  dom.loadingCopy.textContent = loadingStages;
  dom.loadingPercent.textContent = `${progress}%`;
};
manager.onError = (url) => console.warn(`Could not load asset: ${url}`);

const renderer = new THREE.WebGLRenderer({ canvas: dom.canvas, antialias: true, powerPreference: "high-performance" });
const lowPower = matchMedia("(max-width: 700px)").matches || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, lowPower ? 1.2 : 1.5));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = .98;
renderer.shadowMap.enabled = false;
renderer.shadowMap.type = THREE.PCFShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color("#9fcbd2");
scene.fog = new THREE.Fog("#a8d5d8", 42, 105);

const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, .1, 220);
camera.position.set(9, 8, 12);
camera.lookAt(0, 1, 0);

scene.add(new THREE.HemisphereLight(0xfff0d5, 0x3d6a57, 1.92));
scene.add(new THREE.AmbientLight(0xfff5df, .72));
const sun = new THREE.DirectionalLight(0xffdca3, lowPower ? 1.65 : 2.02);
sun.position.set(-22, 30, 18);
sun.castShadow = !lowPower;
sun.shadow.mapSize.set(1024, 1024);
sun.shadow.camera.left = -42;
sun.shadow.camera.right = 42;
sun.shadow.camera.top = 42;
sun.shadow.camera.bottom = -42;
sun.shadow.normalBias = .025;
scene.add(sun);

const world = new THREE.Group();
scene.add(world);

const gltfLoader = new GLTFLoader(manager);
const textureLoader = new THREE.TextureLoader(manager);
const modelCache = new Map();
const mixers = [];
const stationLabels = new Map();
const stationAnchors = new Map();
const player = new THREE.Group();
const playerActions = new Map();
let activePlayerAction = "";
const worldOctree = new Octree();
const colliderRoot = new THREE.Group();
const playerCollider = new Capsule(new THREE.Vector3(0, .46, 7), new THREE.Vector3(0, 1.48, 7), .44);
const wanderingAnimals = [];
const watercraftActors = [];
const obstacleBounds = [];
const dynamicBarriers = [];
const waterMaterials = [];
const shorelineRipples = [];
const pondZones = [];
const swayingPlants = [];
const guideActors = new Map();
let lastShoreRipple = 0;
let playerAirborne = false;
let playerJumpOffset = 0;
let playerJumpVelocity = 0;
const bridgeWalkable = { x: -9, z: 12, halfWidth: 1.72, halfLength: 4.72, deckY: 0, active: false };
const OCEAN_WATER_Y = -1.32;
world.add(player);
world.add(colliderRoot);

const {
  buildWorld,
  groundHeight,
  walkableHeight,
  pointInIsland,
  randomAnimalTarget,
  spawnShoreRipple,
  distanceToSegment2D
} = createWorldBuilder({
  THREE,
  cloneSkeleton,
  renderer,
  lowPower,
  gltfLoader,
  textureLoader,
  scene,
  modelCache,
  mixers,
  world,
  colliderRoot,
  worldOctree,
  player,
  playerCollider,
  playerActions,
  setInitialPlayerAction: (name) => { activePlayerAction = name; },
  wanderingAnimals,
  watercraftActors,
  obstacleBounds,
  dynamicBarriers,
  waterMaterials,
  shorelineRipples,
  pondZones,
  swayingPlants,
  guideActors,
  stationAnchors,
  bridgeWalkable,
  OCEAN_WATER_Y,
  ISLAND_OUTLINE,
  PATH_NETWORK,
  createPathOverlay,
  STATIONS,
  TOWN_CHARACTER_ASSETS,
  ANIMAL_NAMES,
  createAssetManifest,
  ANIMAL_PROFILES,
  ANIMAL_MALIA_LINES,
  ANIMAL_NOTE_CHAPTER,
  TOWN_PROFILES,
  TOWN_NOTE_CHAPTER,
  GUIDE_MALIA_LINES,
  PLAYER_NAME,
  notebook,
  interactables,
  visited,
  agentPositionClear,
  openAtlas
});

notebookController = createNotebookController({
  THREE,
  dom,
  STATIONS,
  CONCLUSION,
  notebook,
  visited,
  regions,
  METRICS,
  territories,
  DATA,
  CLIMATE,
  renderHorizontalBarChart,
  renderNotebookDetail,
  showLayer,
  startDialogue,
});

function setPlayerAction(name) {
  const desired = playerActions.get(name) || playerActions.get(name === "run" ? "walk" : "idle") || playerActions.values().next().value;
  if (!desired || activePlayerAction === name) return;
  const current = playerActions.get(activePlayerAction);
  current?.fadeOut(.16);
  desired.reset().fadeIn(.16).play();
  activePlayerAction = name;
}

function startJump() {
  if (playerAirborne || !worldStarted || overlayOpen()) return;
  playerAirborne = true;
  playerJumpVelocity = 5.4;
  const jumpAction = playerActions.get("jump");
  if (jumpAction) {
    jumpAction.setLoop(THREE.LoopOnce, 1);
    jumpAction.clampWhenFinished = true;
  }
  setPlayerAction("jump");
}

const moveDirection = new THREE.Vector3();
const moveForward = new THREE.Vector3();
const moveRight = new THREE.Vector3();
const colliderDelta = new THREE.Vector3();
const verticalVector = new THREE.Vector3();
const previousColliderStart = new THREE.Vector3();
const previousColliderEnd = new THREE.Vector3();
const cameraFocus = new THREE.Vector3(0, 1, 2);
const worldOrigin = new THREE.Vector3(0, 0, 2);
const cameraTarget = new THREE.Vector3();
const cameraPosition = new THREE.Vector3();
const cameraOffset = new THREE.Vector3();
const projected = new THREE.Vector3();
const bubbleProjected = new THREE.Vector3();
const bubbleAnchor = new THREE.Vector3();
const cameraState = {
  yaw: Math.PI * .22,
  distance: 9.9,
  height: 6.55,
};

dialogueController = createDialogueController({
  THREE,
  dom,
  PLAYER_NAME,
  setPlayerAction,
  playerActions,
  getActivePlayerAction: () => activePlayerAction,
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
  isWorldStarted: () => worldStarted,
  getNearestStation: () => nearestStation,
});

function updatePlayer(delta) {
  if (dom.dialogue.classList.contains("is-visible")) return;
  if (!worldStarted || overlayOpen()) {
    setPlayerAction("idle");
    return;
  }
  const held = (key) => keyState.has(key) || touchState.has(key);
  const horizontal = Number(held("d") || held("arrowright") || held("right")) - Number(held("a") || held("arrowleft") || held("left"));
  const vertical = Number(held("w") || held("arrowup") || held("up")) - Number(held("s") || held("arrowdown") || held("down"));
  moveForward.set(-Math.sin(cameraState.yaw), 0, -Math.cos(cameraState.yaw));
  moveRight.set(Math.cos(cameraState.yaw), 0, -Math.sin(cameraState.yaw));
  moveDirection.copy(moveForward).multiplyScalar(vertical).addScaledVector(moveRight, horizontal);
  const moving = moveDirection.lengthSq() > 0;
  const running = keyState.has("shift");
  if (moving) {
    moveDirection.normalize();
    const speed = running ? 8.1 : 4.6;
    const substeps = Math.max(1, Math.ceil(speed * delta / .16));
    for (let step = 0; step < substeps; step += 1) {
      previousColliderStart.copy(playerCollider.start);
      previousColliderEnd.copy(playerCollider.end);
      colliderDelta.copy(moveDirection).multiplyScalar(speed * delta / substeps);
      playerCollider.translate(colliderDelta);
      const collision = worldOctree.capsuleIntersect(playerCollider);
      if (collision) playerCollider.translate(collision.normal.multiplyScalar(collision.depth));
      const outsideIsland = !pointInIsland(playerCollider.start.x, playerCollider.start.z, 1.55);
      const hitsCharacter = interactables.some((item) => {
        if (!item.root?.visible || item.collisionRadius <= 0) return false;
        const dx = playerCollider.start.x - item.root.position.x;
        const dz = playerCollider.start.z - item.root.position.z;
        return Math.hypot(dx, dz) < .44 + item.collisionRadius;
      });
      if (outsideIsland || hitsCharacter) {
        playerCollider.start.copy(previousColliderStart);
        playerCollider.end.copy(previousColliderEnd);
        break;
      }
    }
    const desiredRotation = Math.atan2(moveDirection.x, moveDirection.z);
    player.rotation.y = dampAngle(player.rotation.y, desiredRotation, 13, delta);
  }
  const terrainY = walkableHeight(playerCollider.start.x, playerCollider.start.z);
  const verticalCorrection = terrainY + .46 - playerCollider.start.y;
  playerCollider.translate(verticalVector.set(0, verticalCorrection, 0));
  if (playerAirborne) {
    playerJumpOffset += playerJumpVelocity * delta;
    playerJumpVelocity -= 13.8 * delta;
    if (playerJumpVelocity < -.2) setPlayerAction("fall");
    if (playerJumpOffset <= 0) {
      playerJumpOffset = 0;
      playerJumpVelocity = 0;
      playerAirborne = false;
    }
  }
  player.position.set(playerCollider.start.x, terrainY + playerJumpOffset, playerCollider.start.z);
  if (!playerAirborne) setPlayerAction(moving ? (running ? "sprint" : "walk") : "idle");
}

function updateCamera(delta) {
  cameraTarget.copy(worldStarted ? player.position : worldOrigin);
  cameraTarget.y = 1.05;
  cameraFocus.lerp(cameraTarget, 1 - Math.exp(-3.8 * delta));
  cameraOffset.set(Math.sin(cameraState.yaw) * cameraState.distance, cameraState.height, Math.cos(cameraState.yaw) * cameraState.distance);
  cameraPosition.copy(cameraFocus).add(cameraOffset);
  camera.position.lerp(cameraPosition, 1 - Math.exp(-4.5 * delta));
  camera.lookAt(cameraFocus);
}

function setAnimalAction(agent, name) {
  if (agent.active === name) return;
  const current = agent.actions.get(agent.active);
  const next = agent.actions.get(name) || agent.actions.get("walk") || agent.actions.values().next().value;
  current?.fadeOut(.2);
  next?.reset().fadeIn(.2).play();
  agent.active = name;
}

function agentPositionClear(agent, x, z) {
  if (!pointInIsland(x, z, 2.2)) return false;
  const onBridge = Math.abs(x - bridgeWalkable.x) < bridgeWalkable.halfWidth + agent.radius
    && Math.abs(z - bridgeWalkable.z) < bridgeWalkable.halfLength + agent.radius;
  if (!agent.ignoreBarriers && onBridge) return false;
  if (STATIONS.some((station) => Math.hypot(x - station.position.x, z - station.position.z) < 5)) return false;
  if (obstacleBounds.some((box) => Math.abs(x - box.x) < box.halfW + agent.radius && Math.abs(z - box.z) < box.halfD + agent.radius)) return false;
  if (!agent.ignoreBarriers && dynamicBarriers.some((barrier) => distanceToSegment2D(x, z, barrier.start, barrier.end) < agent.radius + barrier.width * .5)) return false;
  return true;
}

function updateAnimals(delta, time) {
  wanderingAnimals.forEach((agent) => {
    if (dialogueController?.isActorTalking(agent)) return;
    if (time < (agent.calloutUntil || 0)) {
      setAnimalAction(agent, "emote-yes");
      return;
    }
    if (time < agent.pauseUntil) {
      const idleChoices = agent.idleChoices || ["idle"];
      if (!idleChoices.includes(agent.active)) setAnimalAction(agent, idleChoices[Math.floor(Math.random() * idleChoices.length)]);
      return;
    }
    const dx = agent.target.x - agent.root.position.x;
    const dz = agent.target.z - agent.root.position.z;
    const distance = Math.hypot(dx, dz);
    if (distance < .35) {
      agent.pauseUntil = time + 900 + Math.random() * 2200;
      randomAnimalTarget(agent);
      setAnimalAction(agent, "idle");
      return;
    }
    setAnimalAction(agent, "walk");
    let directionX = dx / distance;
    let directionZ = dz / distance;
    wanderingAnimals.forEach((other) => {
      if (other === agent) return;
      const separationX = agent.root.position.x - other.root.position.x;
      const separationZ = agent.root.position.z - other.root.position.z;
      const separationDistance = Math.hypot(separationX, separationZ);
      const preferredDistance = agent.radius + other.radius + .18;
      if (separationDistance > .001 && separationDistance < preferredDistance) {
        const strength = (preferredDistance - separationDistance) / preferredDistance;
        directionX += separationX / separationDistance * strength * 1.7;
        directionZ += separationZ / separationDistance * strength * 1.7;
      }
    });
    const playerSeparationX = agent.root.position.x - player.position.x;
    const playerSeparationZ = agent.root.position.z - player.position.z;
    const playerDistance = Math.hypot(playerSeparationX, playerSeparationZ);
    const playerClearance = agent.radius + .62;
    if (!agent.ignoreBarriers && playerDistance > .001 && playerDistance < playerClearance) {
      const strength = (playerClearance - playerDistance) / playerClearance;
      directionX += playerSeparationX / playerDistance * strength * 2.2;
      directionZ += playerSeparationZ / playerDistance * strength * 2.2;
    }
    const directionLength = Math.hypot(directionX, directionZ) || 1;
    directionX /= directionLength;
    directionZ /= directionLength;
    const step = Math.min(distance, agent.speed * delta);
    const nextX = agent.root.position.x + directionX * step;
    const nextZ = agent.root.position.z + directionZ * step;
    const blockedByAgent = wanderingAnimals.some((other) => other !== agent
      && Math.hypot(nextX - other.root.position.x, nextZ - other.root.position.z) < agent.radius + other.radius + .08);
    const blockedBySpeaker = interactables.some((item) => item.actor !== agent && item.root
      && Math.hypot(nextX - item.root.position.x, nextZ - item.root.position.z) < agent.radius + (item.collisionRadius || .6) + .08);
    if (!agentPositionClear(agent, nextX, nextZ) || blockedByAgent || blockedBySpeaker) {
      agent.pauseUntil = time + 260 + Math.random() * 420;
      randomAnimalTarget(agent);
      setAnimalAction(agent, "idle");
      return;
    }
    agent.root.position.x = nextX;
    agent.root.position.z = nextZ;
    if (agent.terrainFollow) agent.root.position.y = walkableHeight(agent.root.position.x, agent.root.position.z) + agent.heightOffset;
    agent.root.rotation.y = dampAngle(agent.root.rotation.y, Math.atan2(directionX, directionZ), 7, delta);
  });
}

function updateEnvironment(delta, time) {
  waterMaterials.forEach((material) => { material.uniforms.uTime.value = time * .001; });
  swayingPlants.forEach((item, index) => {
    item.plant.rotation.z = item.baseZ + Math.sin(time * .0014 + item.phase + index * .07) * .022;
  });
  for (let index = shorelineRipples.length - 1; index >= 0; index -= 1) {
    const ripple = shorelineRipples[index];
    ripple.age += delta;
    const progress = Math.min(1, ripple.age / 1.05);
    ripple.ring.scale.setScalar(1 + progress * 3.4);
    ripple.ring.material.opacity = .62 * (1 - progress);
    if (progress >= 1) {
      world.remove(ripple.ring);
      ripple.ring.geometry.dispose();
      ripple.ring.material.dispose();
      shorelineRipples.splice(index, 1);
    }
  }
  if (!worldStarted || overlayOpen() || time - lastShoreRipple < 420) return;
  const x = player.position.x;
  const z = player.position.z;
  const insidePond = pondZones.find((pond) => {
    const distance = Math.sqrt(((x - pond.x) / pond.radiusX) ** 2 + ((z - pond.z) / pond.radiusZ) ** 2);
    const onBridge = pond.x === bridgeWalkable.x && Math.abs(x - bridgeWalkable.x) < bridgeWalkable.halfWidth && Math.abs(z - bridgeWalkable.z) < bridgeWalkable.halfLength;
    return distance < .94 && !onBridge;
  });
  if (insidePond) {
    spawnShoreRipple(x, z, insidePond.waterY + .04, 0xd2f4ef);
    lastShoreRipple = time;
  }
}

function playGuideGesture(stationId) {
  const guide = guideActors.get(stationId);
  if (!guide) return;
  setAnimalAction(guide, "emote-yes");
  window.setTimeout(() => setAnimalAction(guide, "idle"), 1050);
}

function updateWatercraft(time) {
  watercraftActors.forEach((craft) => {
    craft.model.position.y = craft.baseY + Math.sin(time * .0012 + craft.phase) * .035;
    craft.model.position.x = craft.baseX + Math.sin(time * .00016 + craft.phase) * craft.drift;
    craft.model.position.z = craft.baseZ + Math.cos(time * .00013 + craft.phase) * craft.drift * .35;
  });
}

function updateStations(time) {
  nearestStation = null;
  let nearestDistance = Infinity;
  STATIONS.forEach((station, index) => {
    const dx = player.position.x - station.position.x;
    const dz = player.position.z - station.position.z;
    const distance = Math.hypot(dx, dz);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestStation = station;
    }
    station.ring.material.opacity = .42 + Math.sin(time * .002 + index) * .12 + (distance < 2.8 ? .28 : 0);
    station.ring.scale.setScalar(1 + Math.sin(time * .0022 + index) * .045);
  });
  if (nearestDistance > 2.8) nearestStation = null;
}

function startDialogue(...args) { return dialogueController.start(...args); }
function closeDialogue(...args) { return dialogueController.close(...args); }
function advanceDialogue() { return dialogueController.advance(); }
function interactWithNearest() { return dialogueController.interactWithNearest(); }
function updateInteractions(time) { return dialogueController.updateInteractions(time); }
function updateWorldBubbles() { return dialogueController.updateWorldBubbles(); }
function updateStationLabels() { return dialogueController.updateStationLabels(); }
let previousTime = performance.now();
let lastRender = 0;
function animate(time) {
  requestAnimationFrame(animate);
  if (document.hidden) return;
  const frameInterval = overlayOpen() ? 32 : 0;
  if (time - lastRender < frameInterval) return;
  const delta = Math.min((time - previousTime) * .001, .05);
  previousTime = time;
  lastRender = time;
  updatePlayer(delta);
  mixers.forEach((mixer) => mixer.update(delta));
  updateAnimals(delta, time);
  updateWatercraft(time);
  updateEnvironment(delta, time);
  updateCamera(delta);
  updateStations(time);
  updateInteractions(time);
  updateWorldBubbles();
  updateStationLabels();
  renderer.render(scene, camera);
}

function resize() {
  const width = innerWidth;
  const height = innerHeight;
  camera.aspect = width / Math.max(height, 1);
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
}

function overlayOpen() {
  return dom.welcome.classList.contains("is-visible") || dom.help.classList.contains("is-visible") || dom.credits.classList.contains("is-visible") || dom.atlas.classList.contains("is-visible") || dom.dialogue.classList.contains("is-visible");
}

function showLayer(layer, visible) {
  layer.classList.toggle("is-visible", visible);
  layer.setAttribute("aria-hidden", String(!visible));
}

function openAtlas(...args) { return notebookController.open(...args); }
function closeAtlas() { return notebookController.close(); }
function resetRevealHold() { return notebookController.resetRevealHold(); }
function startRevealHold() { return notebookController.startRevealHold(); }
function updateProgress() { return notebookController.updateProgress(); }

function applyInspectionPosition() {
  const inspectionParams = new URLSearchParams(location.search);
  const inspection = inspectionParams.get("inspect");
  if (!INSPECTION_LOCATIONS[inspection]) return;
  const [x, z] = INSPECTION_LOCATIONS[inspection];
  const y = walkableHeight(x, z);
  playerCollider.start.set(x, y + .46, z);
  playerCollider.end.set(x, y + 1.48, z);
  player.position.set(x, y, z);
  cameraFocus.set(x, 1.05, z);
  if (inspection === "maxim") {
    const maxim = interactables.find((item) => item.name === "Maxim Margin");
    if (maxim?.root) {
      maxim.root.position.set(-8, groundHeight(-8, 8), 8);
      if (maxim.actor) maxim.actor.pauseUntil = Number.POSITIVE_INFINITY;
    }
  }
  worldStarted = true;
  showLayer(dom.welcome, false);
}

function beginWorld() {
  worldStarted = true;
  showLayer(dom.welcome, false);
  if (!openingPlayed) {
    openingPlayed = true;
    const professor = interactables.find((item) => item.id === "professor-piko");
    window.setTimeout(() => startDialogue(professor, [
      { speaker: "Professor Piko Puddlejump", text: "Malia, the village has one question for you: which changes are shared across Pacific territories, and which need local answers?" },
      { speaker: PLAYER_NAME, text: "So I am looking for agreement, disagreement and what each pattern means for decisions." },
      { speaker: "Professor Piko Puddlejump", text: "Exactly. Dr. Afi has land temperature, Sela has two ocean measures, Officer Noa has rainfall and Litia has the Red List Index." },
      { speaker: "Professor Piko Puddlejump", text: "Meet all four, then listen to the rest of the village. Every person and animal sees one small part of how regional patterns meet daily life." },
      { speaker: PLAYER_NAME, text: "I will keep the measures separate, compare their directions and return with one clear answer." },
    ], false), 380);
  }
}

createInputController({
  THREE,
  dom,
  keyState,
  touchState,
  cameraState,
  isWorldStarted: () => worldStarted,
  setWorldStarted: (value) => { worldStarted = value; },
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
});

try {
  validateCharacterProfiles();
  await buildWorld();
  applyInspectionPosition();
  resize();
  updateProgress();
  dom.loadingBar.style.width = "100%";
  dom.loadingCopy.textContent = "the village is ready";
  dom.loadingPercent.textContent = "100%";
  setTimeout(() => dom.loading.classList.add("is-done"), 320);
  requestAnimationFrame(animate);
} catch (error) {
  console.error(error);
  dom.loadingCopy.textContent = "the field station could not load. please refresh the page";
}
