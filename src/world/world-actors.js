export function createWorldActors({
  THREE,
  groundHeight,
  pointInIsland,
  dynamicBarriers,
  obstacleBounds,
  wanderingAnimals,
  ANIMAL_PROFILES,
  ANIMAL_MALIA_LINES,
  ANIMAL_NOTE_CHAPTER,
  TOWN_PROFILES,
  TOWN_NOTE_CHAPTER,
  GUIDE_MALIA_LINES,
  PLAYER_NAME,
  placeModel,
  addMixer,
  world,
  interactables,
  visited,
  STATIONS,
  notebook,
  OCEAN_WATER_Y,
  watercraftActors,
  agentPositionClear
}) {
  function randomAnimalTarget(agent) {
    if (agent.patrol?.length) {
      agent.patrolIndex = (agent.patrolIndex + 1) % agent.patrol.length;
      const [x, z] = agent.patrol[agent.patrolIndex];
      agent.target.set(x, agent.heightOffset || 0, z);
      return;
    }
    for (let attempt = 0; attempt < 12; attempt += 1) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.sqrt(Math.random()) * agent.roamRadius;
      const x = agent.home.x + Math.cos(angle) * radius;
      const z = agent.home.z + Math.sin(angle) * radius;
      const clear = obstacleBounds.every((box) => Math.abs(x - box.x) > box.halfW + .8 || Math.abs(z - box.z) > box.halfD + .8);
      if (clear && pointInIsland(x, z, 3)) {
        agent.target.set(x, agent.heightOffset || 0, z);
        return;
      }
    }
    agent.target.copy(agent.home);
  }
  
  function animalConversation(profile, round) {
    const malia = ANIMAL_MALIA_LINES[profile.kind];
    if (round >= 3) return [{ speaker: profile.name, text: `${profile.sound}!` }];
    if (round === 0) return [
      { speaker: profile.name, text: `${profile.sound}! ${profile.habit}` },
      { speaker: PLAYER_NAME, text: malia[0] },
      { speaker: profile.name, text: profile.punch },
    ];
    if (round === 1) return [
      { speaker: PLAYER_NAME, text: malia[1] },
      { speaker: profile.name, text: profile.clue },
      { speaker: PLAYER_NAME, text: malia[2] },
    ];
    return [
      { speaker: PLAYER_NAME, text: malia[3] },
      { speaker: profile.name, text: profile.punch },
      { speaker: PLAYER_NAME, text: malia[4] },
    ];
  }
  
  function townConversation(profile, round) {
    if (round >= 3) return [{ speaker: profile.name, text: profile.final }];
    const pair = profile.lines[round];
    return [
      { speaker: profile.name, text: pair[0] },
      { speaker: PLAYER_NAME, text: profile.responses[round] },
      { speaker: profile.name, text: pair[1] },
    ];
  }
  
  function guideConversation(station, round) {
    if (round >= 3) return [{ speaker: station.guide, text: `Look at the ${station.title.toLowerCase()} record again, then compare it with the other districts.` }];
    const middle = round === 0 ? station.lead : round === 1 ? station.explanation : `You have the ${station.short.toLowerCase()} record now. Compare it with the other stations before deciding what the region needs.`;
    const openers = {
      land: [station.greeting, "Let us read the full land pattern carefully.", "The land chapter gives you the shared baseline."],
      ocean: [station.greeting, "This time, compare sea heat and sea level side by side.", "The two ocean measures belong together, but not in one number."],
      rain: [station.greeting, "Come back to the fifteen-seven split.", "Rainfall is the reminder that regional direction can break locally."],
      life: [station.greeting, "Look again at how the 2024 endpoints compare with 1993.", "The life chapter adds a separate pattern to your final answer."],
    };
    return [
      { speaker: station.guide, text: openers[station.id][round] },
      { speaker: station.guide, text: middle },
      { speaker: PLAYER_NAME, text: GUIDE_MALIA_LINES[station.id][round] },
    ];
  }
  
  function registerInteractable(config) {
    interactables.push({ collisionRadius: .62, interactionRadius: 2.65, ...config });
  }
  
  function settleAgentPosition(agent) {
    const isClear = (x, z) => agentPositionClear(agent, x, z)
      && wanderingAnimals.every((other) => Math.hypot(x - other.root.position.x, z - other.root.position.z) > agent.radius + other.radius + .24)
      && interactables.every((item) => !item.root || item.actor === agent || Math.hypot(x - item.root.position.x, z - item.root.position.z) > agent.radius + (item.collisionRadius || .6) + .2);
    if (isClear(agent.root.position.x, agent.root.position.z)) return;
    for (let ring = 1; ring <= 10; ring += 1) {
      for (let step = 0; step < 12; step += 1) {
        const angle = step / 12 * Math.PI * 2;
        const x = agent.home.x + Math.cos(angle) * ring * .7;
        const z = agent.home.z + Math.sin(angle) * ring * .7;
        if (!isClear(x, z)) continue;
        agent.root.position.set(x, groundHeight(x, z) + agent.heightOffset, z);
        agent.home.set(x, 0, z);
        return;
      }
    }
  }
  
  function spawnAnimal(gltf, options) {
    const root = new THREE.Group();
    root.position.set(options.x, groundHeight(options.x, options.z) + (options.heightOffset || 0), options.z);
    world.add(root);
    if ((options.heightOffset || 0) < .5) addBlobShadow(root, (options.size || 1.25) * .38);
    const model = placeModel(gltf, { parent: root, size: options.size || 1.25, rotation: options.rotation || 0 });
    const animation = addMixer(model, gltf.animations || [], options.clip || "walk");
    const agent = {
      root,
      home: new THREE.Vector3(options.x, 0, options.z),
      target: new THREE.Vector3(options.x, 0, options.z),
      roamRadius: options.roamRadius || 6,
      speed: options.speed || .8,
      heightOffset: options.heightOffset || 0,
      terrainFollow: options.terrainFollow !== false,
      pauseUntil: 0,
      actions: animation.actions,
      active: options.clip || "walk",
      radius: options.radius || Math.max(.38, (options.size || 1.25) * .38),
      idleChoices: ["idle"],
      ignoreBarriers: (options.heightOffset || 0) > 1.2,
      patrol: options.patrol || null,
      patrolIndex: 0,
    };
    settleAgentPosition(agent);
    wanderingAnimals.push(agent);
    const baseProfile = ANIMAL_PROFILES[options.animalName];
    const profile = baseProfile ? { ...baseProfile, kind: options.animalName, name: options.displayName || baseProfile.name } : null;
    if (profile) registerInteractable({
      id: `animal-${options.animalName}${options.instance ? `-${options.instance}` : ""}`,
      name: profile.name,
      role: options.animalName,
      root,
      actor: agent,
      notebookRound: 1,
      notebookEntry: { id: `animal-${options.animalName}${options.instance ? `-${options.instance}` : ""}`, chapter: ANIMAL_NOTE_CHAPTER[options.animalName] || "conclusion", kind: options.animalName, name: profile.name, role: `${options.animalName} observation`, text: profile.clue },
      collisionRadius: agent.ignoreBarriers ? 0 : agent.radius,
      getConversation: (round) => animalConversation(profile, round),
    });
    randomAnimalTarget(agent);
    return agent;
  }
  
  function addBlobShadow(parent, size = .7) {
    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(size, 20),
      new THREE.MeshBasicMaterial({ color: 0x244b3e, transparent: true, opacity: .16, depthWrite: false }),
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = .025;
    parent.add(shadow);
  }
  
  function spawnVillager(gltf, options) {
    const root = new THREE.Group();
    root.position.set(options.x, groundHeight(options.x, options.z), options.z);
    world.add(root);
    addBlobShadow(root, .62);
    const model = placeModel(gltf, { parent: root, size: 2, rotation: 0 });
    const animation = addMixer(model, gltf.animations || [], "walk");
    const agent = {
      root,
      home: new THREE.Vector3(options.x, 0, options.z),
      target: new THREE.Vector3(options.x, 0, options.z),
      roamRadius: options.roamRadius || 7,
      speed: options.speed || 1.1,
      heightOffset: 0,
      terrainFollow: true,
      pauseUntil: 0,
      actions: animation.actions,
      active: "walk",
      idleChoices: ["idle", "emote-yes", "emote-no", "pick-up"],
      radius: .58,
      patrol: options.patrol || null,
      patrolIndex: 0,
    };
    settleAgentPosition(agent);
    wanderingAnimals.push(agent);
    if (options.profile) registerInteractable({
      id: `town-${options.assetName}`,
      name: options.profile.name,
      role: options.profile.role,
      root,
      actor: agent,
      notebookRound: 1,
      notebookEntry: { id: `town-${options.assetName}`, chapter: TOWN_NOTE_CHAPTER[options.assetName] || "conclusion", kind: "person", name: options.profile.name, role: options.profile.role, text: options.profile.lines[1][1] },
      getConversation: (round) => townConversation(options.profile, round),
    });
    randomAnimalTarget(agent);
    return agent;
  }
  
  function spawnProfessor(gltf, x, z) {
    const root = new THREE.Group();
    root.position.set(x, groundHeight(x, z), z);
    world.add(root);
    addBlobShadow(root, .62);
    const model = placeModel(gltf, { parent: root, size: 2.05, rotation: 0 });
    const animation = addMixer(model, gltf.animations || [], "idle");
    const actor = { root, actions: animation.actions, active: "idle", radius: .6 };
    registerInteractable({
      id: "professor-piko",
      name: "Professor Piko Puddlejump",
      role: "field survey lead",
      root,
      actor,
      notebookRound: 1,
      notebookEntry: { id: "professor-piko", chapter: "conclusion", kind: "research", name: "Professor Piko Puddlejump", role: "field survey lead", text: "Ask which directions are shared across territories and which patterns remain local." },
      getConversation: (round) => {
        if (round >= 3) return [{ speaker: "Professor Piko Puddlejump", text: visited.size === STATIONS.length ? "Put the four records side by side. Answer the question we began with." : "Keep exploring. You still need the four directions before you can compare them." }];
        if (visited.size === STATIONS.length) return [
          { speaker: "Professor Piko Puddlejump", text: "Four field notes and only moderate animal gossip. What is your answer?" },
          { speaker: PLAYER_NAME, text: "Land temperature, sea-surface temperature and sea level share an upward direction. Rainfall splits, while biodiversity risk shows a separate broad pattern." },
          { speaker: "Professor Piko Puddlejump", text: "Good. The Pacific picture is connected, but planning cannot be identical everywhere. Write that plainly." },
        ];
        const reminders = ["Find Dr. Afi, Sela, Officer Noa and Litia. Each answers one part of our main question.", "Compare directions before interpretations. Rainfall may not follow the land and ocean pattern.", "Talk to the village too. Each person and animal adds one practical observation to your notebook.", "Keep exploring. The answer appears only when the four records sit beside one another."];
        const replies = ["I will begin with the land record.", "I am checking agreement first and differences second.", "I will ask what each pattern looks like in daily village life.", "I am close. I still need to compare the chapters directly."];
        return [
          { speaker: "Professor Piko Puddlejump", text: reminders[round] },
          { speaker: PLAYER_NAME, text: replies[round] },
          { speaker: "Professor Piko Puddlejump", text: "Excellent. My clipboard and I will continue looking professionally concerned." },
        ];
      },
    });
    return actor;
  }
  
  function placeWatercraft(gltf, options) {
    const model = placeModel(gltf, { size: options.size, x: options.x, y: options.y ?? OCEAN_WATER_Y, z: options.z, rotation: options.rotation || 0, castShadow: false, receiveShadow: false });
    const box = new THREE.Box3().setFromObject(model);
    const footprint = box.getSize(new THREE.Vector3());
    const draft = options.draft ?? THREE.MathUtils.clamp(footprint.y * .11, .18, .55);
    if (options.y == null) model.position.y = OCEAN_WATER_Y - draft;
    const clearance = Math.max(1.1, Math.max(footprint.x, footprint.z) * .42);
    const insideCoast = (x, z) => pointInIsland(x / 1.09, z / 1.09);
    for (let attempt = 0; attempt < 18; attempt += 1) {
      const intersectsShore = insideCoast(model.position.x, model.position.z)
        || [0, Math.PI * .5, Math.PI, Math.PI * 1.5].some((angle) => insideCoast(model.position.x + Math.cos(angle) * clearance, model.position.z + Math.sin(angle) * clearance));
      if (!intersectsShore) break;
      const length = Math.hypot(model.position.x, model.position.z) || 1;
      model.position.x += model.position.x / length * 1.1;
      model.position.z += model.position.z / length * 1.1;
    }
    watercraftActors.push({ model, baseX: model.position.x, baseZ: model.position.z, baseY: model.position.y, phase: options.phase || 0, drift: Math.abs(options.drift || 0) * 14 });
    return model;
  }

  return { randomAnimalTarget, animalConversation, townConversation, guideConversation, registerInteractable, settleAgentPosition, spawnAnimal, addBlobShadow, spawnVillager, spawnProfessor, placeWatercraft };
}
