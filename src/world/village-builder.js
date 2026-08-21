export function createVillageBuilder({
  THREE,
  loadModel,
  textureLoader,
  scene,
  world,
  lowPower,
  createAssetManifest,
  TOWN_CHARACTER_ASSETS,
  ANIMAL_NAMES,
  PATH_NETWORK,
  groundHeight,
  createWaterMaterial,
  OCEAN_WATER_Y,
  createTerrainSurface,
  createCoastSkirt,
  addDistrictPatch,
  addPathNetwork,
  createPond,
  buildBridge,
  addColliderBox,
  placeModel,
  buildOpenFale,
  buildCottage,
  buildFoodDisplay,
  buildPicnicTable,
  addConnectedFence,
  tallSceneryPositionClear,
  placePlant,
  decorationPositionClear,
  distanceToRoute,
  seededNoise,
  pondZones,
  obstacleBounds,
  pointInIsland,
  addBlobShadow,
  player,
  playerCollider,
  playerActions,
  setInitialPlayerAction,
  addMixer,
  spawnProfessor,
  spawnVillager,
  TOWN_PROFILES,
  STATIONS,
  guideActors,
  stationAnchors,
  registerInteractable,
  guideConversation,
  GUIDE_MALIA_LINES,
  openAtlas,
  spawnAnimal,
  wanderingAnimals,
  settleAgentPosition,
  randomAnimalTarget,
  placeWatercraft,
  worldOctree,
  colliderRoot,
  url
}) {
  async function buildWorld() {
    const paths = createAssetManifest(TOWN_CHARACTER_ASSETS);
    const extraCharacters = TOWN_CHARACTER_ASSETS;
    const animalNames = ANIMAL_NAMES;
    const entries = await Promise.all(Object.entries(paths).map(async ([key, path]) => [key, await loadModel(path)]));
    const assets = Object.fromEntries(entries);
  
    const sky = await textureLoader.loadAsync(url("../assets/environment/skybox-day.png"));
    sky.mapping = THREE.EquirectangularReflectionMapping;
    sky.colorSpace = THREE.SRGBColorSpace;
    scene.background = sky;
  
    const water = new THREE.Mesh(
      new THREE.CircleGeometry(125, lowPower ? 48 : 64),
      createWaterMaterial(0x69b9c5, 0xe0f6ee, 3.5),
    );
    water.rotation.x = -Math.PI / 2;
    water.position.y = OCEAN_WATER_Y;
    world.add(water);
  
    createTerrainSurface(1.07, -.28, 0xd8bd83);
    createCoastSkirt(1.07);
    createTerrainSurface(1, 0, 0x507b58, true);
  
    addDistrictPatch(16, -18.5, 10.5, 6.3, 0xd9bd83);
    addDistrictPatch(-17, -9, 9.5, 7.3, 0x66805a);
    addDistrictPatch(-16, 15, 9.2, 7.1, 0x4f7755);
    addDistrictPatch(8, 5, 9.4, 7.2, 0xb79b70);
    addPathNetwork(PATH_NETWORK);
    const plaza = new THREE.Mesh(new THREE.CircleGeometry(4.7, 32), new THREE.MeshStandardMaterial({ color: 0xc7a06e, roughness: 1 }));
    plaza.rotation.x = -Math.PI / 2;
    plaza.position.set(8, groundHeight(8, 5) + .075, 5);
    plaza.receiveShadow = false;
    world.add(plaza);
  
    const lakeY = groundHeight(-9, 12) + .18;
    createPond(-9, 12, 6.2, 4.2, lakeY);
    buildBridge(-9, lakeY + .42, 12);
    addColliderBox(-12.4, 12, 3.8, 7.2, .8);
    addColliderBox(-5.6, 12, 3.8, 7.2, .8);
    const farmPond = createPond(-22, -1, 3.7, 2.5);
    const gardenPond = createPond(18, 12, 3.2, 2.2);
  
    placeModel(assets.fountain, { size: 3.8, x: 8, z: 5 });
    addColliderBox(8, 5, 3.1, 3.1, 2.4);
    placeModel(assets.stallGreen, { size: 3.8, x: 3, z: 6.5, rotation: Math.PI / 2 });
    placeModel(assets.cart, { size: 2.1, x: 11.5, z: 1.5, rotation: .35 });
    addColliderBox(3, 6.5, 3.8, 3, 3.5);
    buildOpenFale(15, .5, -.12);
    buildOpenFale(-13.5, 20.2, .22);
    buildOpenFale(-21, 14, -.3);
  
    buildCottage(assets, -16, -16, Math.PI / 2, 0xe8c08c);
    buildCottage(assets, 15, -10, -Math.PI / 2, 0xd7b18c);
    buildCottage(assets, -16, 1, Math.PI / 2, 0xd9c18d);
    buildCottage(assets, 15, 7, -Math.PI / 2, 0xe3b993);
    buildCottage(assets, -15, 21, Math.PI / 2, 0xe0c28f);
    buildCottage(assets, 16, 20, -Math.PI / 2, 0xd7b58f);
    buildCottage(assets, 1, 26, Math.PI, 0xe7c59c);
    buildCottage(assets, 24, -14, -Math.PI / 2, 0xe1bf91);
    buildCottage(assets, -25, -5, Math.PI / 2, 0xdab98c);
    buildCottage(assets, -24, 20, Math.PI / 2, 0xe0c394);
    buildCottage(assets, 22, 7, -Math.PI / 2, 0xd8b487);
  
    buildCottage(assets, 24, 13, Math.PI / 2, 0xddbc8d);
    placeModel(assets.windmill, { size: 2.5, x: 21.45, y: groundHeight(24, 13) + 1.02, z: 13, rotation: Math.PI / 2 });
  
    buildFoodDisplay(assets, -18.5, -5.2, .2);
    buildPicnicTable(-13.5, -10.5, -.35);
    placeModel(assets.campfireStones, { size: 1.8, x: -17, z: -13, rotation: .2 });
    placeModel(assets.campfireLogs, { size: 1.15, x: -17, z: -13, rotation: -.2 });
    [[-23,-13],[-21,-13],[-19,-13],[-23,-10.8],[-21,-10.8],[-19,-10.8]].forEach(([x,z], index) =>
      placeModel(index % 3 === 0 ? assets.cropPumpkin : index % 3 === 1 ? assets.cropCorn : assets.cropCarrot, { size: 1.05, x, z, rotation: index * .25, castShadow: false }));
  
    addConnectedFence([[-1,-25],[-7,-22],[-12,-17],[-12,-13]], { color: 0x8c623f });
    addConnectedFence([[6.5,-22.7],[1,-18],[-3,-14],[-3,-11]], { color: 0x8c623f });
    addConnectedFence([[3,-10],[8,-11],[13,-8],[14,-4]], { color: 0x8c623f });
    addConnectedFence([[12,-1],[11,1.5]], { color: 0x8c623f });
    addConnectedFence([[-13,18],[-11,21],[-7,23]], { color: 0x8c623f });
    addConnectedFence([[12,16],[14,19],[13,23]], { color: 0x8c623f });
    addConnectedFence([[-25,-14],[-18,-14],[-17,-11]], { color: 0x80603f });
    addConnectedFence([[-25,-14],[-25,-8],[-22,-7]], { color: 0x80603f });
    addConnectedFence([[16,-20],[20,-19],[23,-17]], { color: 0x8c623f });
    addConnectedFence([[-22,19],[-20,22],[-18.5,23.5]], { color: 0x8c623f });
  
    const treePositions = [
      [-27,-17],[-22,-21],[-14,-24],[11,-23],[21,-19],[27,-12],[29,-3],[28,7],[27,21],
      [20,24],[10,26],[-7,26],[-21,24],[-28,17],[-30,8],[-29,-3],[-18,-19],[18,-18],
    ];
    treePositions.forEach(([x, z], index) => {
      if (!tallSceneryPositionClear(x, z)) return;
      const tree = index % 5 === 0 ? assets.palmTall : index % 5 === 1 ? assets.palmShort : assets.canopy;
      placeModel(tree, { size: 4.8 + (index % 4) * .42, x, z, rotation: index * .73, ...(tree === assets.canopy ? { tint: 0x5f965f, tintAmount: .5 } : {}) });
      addColliderBox(x, z, .9, .9, 5.2);
    });
  
    [[-32,-10],[-29,-18],[-20,-23],[22,-21],[31,-11],[31,12],[-29,13]].forEach(([x,z], index) => {
      if (!tallSceneryPositionClear(x, z)) return;
      placeModel(index % 2 ? assets.palmShort : assets.palmTall, { size: 5.2, x, z, rotation: index * .5 });
      addColliderBox(x, z, .82, .82, 5);
    });
  
    const tropicalGroves = [
      [-24,-11],[-21,-8],[-23,10],[-24,16],[-20,19],[-10,24],[-5,24],
      [8,24],[13,23],[19,17],[22,1],[23,-5],[20,-10],[17,-15],[12,-19],[-12,-20],[-16,-17],
    ];
    tropicalGroves.forEach(([x,z], index) => {
      if (!tallSceneryPositionClear(x, z)) return;
      const tree = index % 4 === 0 ? assets.palmTall : index % 4 === 1 ? assets.palmShort : assets.canopy;
      placeModel(tree, { size: 4.4 + seededNoise(index * 2.7) * 1.3, x, z, rotation: index * .81, ...(tree === assets.canopy ? { tint: 0x5f965f, tintAmount: .5 } : {}) });
      addColliderBox(x, z, .86, .86, 5);
      if (index % 3 === 0) placePlant(assets.bush, { size: 1.45, x: x + .9, z: z - .7, rotation: index, tint: 0x4c8558, tintAmount: .58 });
    });
  
    [[-20,-6],[-18,7],[-21,14],[-12,6],[-11,22],[-2,24],[7,23],[13,16],[17,8],[18,-1],[16,-12],[10,-17],[-13,-18]].forEach(([x,z], index) => {
      placePlant(assets.pandanus, { size: 1.5 + (index % 3) * .18, x, z, rotation: index * .62, castShadow: false, tint: 0x3d754e, tintAmount: .65 });
    });
  
    const villageGardens = [
      [8,-24],[10,-22],[12,-20],[-3,-25],[-7,-23],[-14,-15],[-13,-12],[-13,-9],[-4,-12],[-1,-10],
      [13,-6],[14,-3],[11,0],[5,-4],[-7,2],[-7,5],[8,6],[-15,8],[-16,12],[-15,16],[-3,8],[-2,14],
      [-10,19],[-7,23],[3,22],[8,16],[12,18],[11,24],
    ];
    villageGardens.forEach(([x,z], index) => {
      placePlant(index % 3 === 0 ? assets.pandanus : assets.bush, { size: index % 3 === 0 ? 1.45 : 1.3 + (index % 2) * .25, x, z, rotation: index * .71, castShadow: false, tint: index % 3 === 0 ? 0x3d754e : 0x4c8558, tintAmount: .62 });
      if (index % 4 === 1) placePlant(assets.flowersTall, { size: .68, x: x + .8, z: z + .45, rotation: index, castShadow: false });
    });
    const entranceMeadow = [[4,-18],[6,-17],[8,-17],[10,-16],[5,-15],[8,-14],[11,-13],[4,-12],[7,-11],[10,-10]];
    entranceMeadow.forEach(([x,z], index) => {
      placePlant(index % 3 === 0 ? assets.pandanus : index % 3 === 1 ? assets.flowersTall : assets.bush, {
        size: index % 3 === 0 ? 1.2 : index % 3 === 1 ? .66 : 1.05,
        x, z, rotation: index * .83, castShadow: false,
        ...(index % 3 === 2 ? { tint: 0x4c8558, tintAmount: .58 } : {}),
      });
    });
  
    const detailPositions = [[-11,-7],[-7,-6],[11,-3],[12,0],[-14,10],[-5,10],[7,12],[12,15],[-4,-14],[1,-12],[-4,22],[6,23],[-11,2],[10,8]];
    detailPositions.forEach(([x,z], index) => {
      placePlant(index % 2 ? assets.flowersTall : assets.flowers, { size: .8, x, z, rotation: index * .9, castShadow: false });
      if (index % 3 === 0) placePlant(assets.bush, { size: 1.5, x: x + 1.1, z: z - .5, rotation: index, tint: 0x4c8558, tintAmount: .58 });
    });
    [[-27,0],[27,1],[-11,20],[12,21],[-25,-12],[25,-11]].forEach(([x,z], index) => {
      if (!decorationPositionClear(x, z, .85)) return;
      placeModel(assets.rock, { size: 1.4, x, z, rotation: index });
      addColliderBox(x, z, 1.15, 1.15, 1.3);
    });
    [
      [-31,-2],[-29,3],[-23,-12],[-18,-16],[-4,-20],[15,-18],[23,-13],[29,-7],[31,3],[27,8],
      [24,20],[14,23],[4,21],[-3,25],[-15,23],[-23,19],[-28,12],[-17,7],[17,10],[4,-6],
    ].forEach(([x,z], index) => {
      placePlant(index % 2 ? assets.bush : assets.flowersTall, { size: index % 2 ? 1.35 : .72, x, z, rotation: index * .41, castShadow: false, ...(index % 2 ? { tint: 0x4c8558, tintAmount: .58 } : {}) });
      if (index % 4 === 0) placeModel(assets.stones, { size: .65, x: x + .8, z: z + .4, rotation: index });
    });
  
    [[-12.5,9.6],[-13.8,12.4],[-5.1,11],[-5.2,14.1]].forEach(([x,z], index) =>
      placeModel(assets.lily, { size: .78, x, y: lakeY + .025, z, rotation: index * 1.3, castShadow: false, receiveShadow: false }));
    [[farmPond,-23,-1.2],[farmPond,-20.8,-.4],[gardenPond,17,11.5],[gardenPond,19,12.6]].forEach(([pond,x,z], index) =>
      placeModel(assets.lily, { size: .64, x, y: pond.waterY + .02, z, rotation: index * .9, castShadow: false, receiveShadow: false }));
    placeModel(assets.canoe, { size: 3.35, x: -13.5, y: lakeY - .2, z: 12, rotation: .16, castShadow: false, receiveShadow: false });
    placeWatercraft(assets.canoe, { size: 4.2, x: 11, z: -34, rotation: -.4, phase: 1.7, draft: .46 });
    placeModel(assets.bench, { size: 2.2, x: 13, z: -18, rotation: .35 });
    placeModel(assets.bench, { size: 2.2, x: 22, z: -16, rotation: -.5 });
    addColliderBox(13, -18, 2.3, 1.1, 1.5);
    addColliderBox(22, -16, 2.3, 1.1, 1.5);
  
    const grassTarget = lowPower ? 18 : 30;
    let grassPlaced = 0;
    for (let attempt = 0; attempt < grassTarget * 10 && grassPlaced < grassTarget; attempt += 1) {
      const x = seededNoise(attempt * 5.17 + 2) * 70 - 35;
      const z = seededNoise(attempt * 9.31 + 4) * 52 - 26;
      const clearOfPonds = pondZones.every((pond) => Math.sqrt(((x - pond.x) / (pond.radiusX * 1.2)) ** 2 + ((z - pond.z) / (pond.radiusZ * 1.2)) ** 2) > 1);
      const clearOfObjects = obstacleBounds.every((box) => Math.abs(x - box.x) > box.halfW + .45 || Math.abs(z - box.z) > box.halfD + .45);
      if (!pointInIsland(x, z, 2.2) || distanceToRoute(x, z) < 2.25 || !clearOfPonds || !clearOfObjects) continue;
      placePlant(assets.bush, { size: .72 + seededNoise(attempt * 2.2) * .42, x, z, rotation: seededNoise(attempt * 1.4) * Math.PI * 2, castShadow: false, receiveShadow: false, tint: 0x3f7950, tintAmount: .55 });
      grassPlaced += 1;
    }
  
    addBlobShadow(player, .7);
    const human = placeModel(assets.player, { parent: player, size: 2.15, rotation: 0 });
    player.position.set(2, groundHeight(2, -23), -23);
    const colliderGround = groundHeight(2, -23);
    playerCollider.start.set(2, colliderGround + .46, -23);
    playerCollider.end.set(2, colliderGround + 1.48, -23);
    const playerAnimation = addMixer(human, assets.player.animations || [], "idle");
    playerAnimation.actions.forEach((action, name) => playerActions.set(name, action));
    setInitialPlayerAction("idle");
  
    const npcAssets = { guideLand: assets.guideLand, guideOcean: assets.guideOcean, guideRain: assets.guideRain, guideLife: assets.guideLife };
    STATIONS.forEach((station, index) => {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(1.4, 1.58, 48),
        new THREE.MeshBasicMaterial({ color: station.color, transparent: true, opacity: .7, depthWrite: false, side: THREE.DoubleSide }),
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.copy(station.position).setY(groundHeight(station.position.x, station.position.z) + .09);
      world.add(ring);
      station.ring = ring;
      const guideRoot = new THREE.Group();
      guideRoot.position.set(station.position.x, groundHeight(station.position.x, station.position.z), station.position.z);
      world.add(guideRoot);
      addBlobShadow(guideRoot, .6);
      const npcModel = placeModel(npcAssets[station.npc], { parent: guideRoot, size: 2.05, rotation: index * .45 });
      const guideAnimation = addMixer(npcModel, npcAssets[station.npc].animations || [], "idle");
      const guideActor = { root: guideRoot, actions: guideAnimation.actions, active: "idle", radius: .58 };
      guideActors.set(station.id, guideActor);
      registerInteractable({
        id: `guide-${station.id}`,
        name: station.guide,
        role: station.role,
        root: guideRoot,
        actor: guideActor,
        station,
        notebookRound: 0,
        notebookEntry: { id: `guide-${station.id}`, chapter: station.id, kind: station.id, name: station.guide, role: station.role, text: station.lead },
        getConversation: (round) => guideConversation(station, round),
        onComplete: (finished) => openAtlas(station.id, { unlock: true, guidedBy: finished.item, page: 1 }),
      });
      placeModel(index % 2 ? assets.bench : assets.lantern, { size: 1.8, x: station.position.x + 2.1, z: station.position.z + .7, rotation: index * .7 });
      stationAnchors.set(station.id, new THREE.Vector3(station.position.x, groundHeight(station.position.x, station.position.z) + 2.8, station.position.z));
    });
  
    spawnProfessor(assets.professor, 0, -21.5);
    const villagerPatrols = [
      [[-18,-5],[-20,-8],[-16,-11],[-13,-8]],
      [[4,7],[6,9],[10,8],[11,3]],
      [[-15,18],[-18,15],[-14,10],[-10,16]],
      [[17,-21],[20,-18],[24,-19],[21,-23]],
      [[20,-9],[22,-7],[24,-6],[23,-3],[19,-4]],
      [[6,3],[10,3],[11,7],[6,8]],
    ];
    extraCharacters.forEach((name, index) => spawnVillager(assets[`villager_${name}`], {
      x: villagerPatrols[index][0][0], z: villagerPatrols[index][0][1], roamRadius: 4.2 + index % 2,
      profile: TOWN_PROFILES[name], assetName: name, patrol: villagerPatrols[index],
    }));
  
    const districtPatrols = [
      [[14,-22],[18,-20],[22,-18],[24,-21],[19,-24]],
      [[7,-22],[10,-19],[14,-17],[17,-20],[12,-24]],
      [[-22,-12],[-18,-12],[-14,-10],[-15,-5],[-20,-4],[-23,-8]],
      [[-12,-16],[-16,-14],[-18,-10],[-14,-7],[-10,-11]],
      [[-20,12],[-17,10],[-12,12],[-12,18],[-18,20],[-21,16]],
      [[-9,18],[-5,21],[0,23],[4,20],[-2,17]],
      [[4,3],[7,1],[12,2],[13,7],[9,10],[4,8]],
      [[8,12],[12,14],[17,12],[18,8],[13,7]],
    ];
    const largeAnimals = new Set(["cow","deer","elephant","giraffe","lion","polar","tiger"]);
    const smallAnimals = new Set(["bee","caterpillar","chick","crab","fish","parrot"]);
    animalNames.forEach((name, index) => {
      const patrol = name === "fish" ? [[-24,-1],[-22.5,-2],[-20,-1],[-22,.6]] : districtPatrols[index % districtPatrols.length];
      const [x,z] = patrol[index % patrol.length];
      const flying = name === "bee" || name === "parrot";
      const fish = name === "fish";
      spawnAnimal(assets[`animal_${name}`], {
        x, z,
        roamRadius: fish ? 2.2 : 4.5 + index % 4,
        speed: smallAnimals.has(name) ? .55 : largeAnimals.has(name) ? .7 : .9,
        size: largeAnimals.has(name) ? 1.55 : smallAnimals.has(name) ? .82 : 1.15,
        heightOffset: flying ? 1.7 : fish ? .18 : 0,
        terrainFollow: !flying,
        animalName: name,
        patrol,
      });
    });
    spawnAnimal(assets.animal_fish, { x: 16, z: 12, roamRadius: 2, speed: .5, size: .82, heightOffset: .18, terrainFollow: false, animalName: "fish", instance: "garden", displayName: "Bubbles Junior", patrol: [[16,12],[18,11],[20,12],[18,13]] });

    // Re-run placement after the full cast exists so no two actors begin in the
    // same space. The second pass resolves positions opened by the first pass.
    for (let pass = 0; pass < 2; pass += 1) wanderingAnimals.forEach(settleAgentPosition);
    wanderingAnimals.forEach(randomAnimalTarget);
  
    placeModel(assets.dock, { size: 5.4, x: 30.5, y: OCEAN_WATER_Y - .12, z: -27.8, rotation: .08, castShadow: false, receiveShadow: false });
    placeWatercraft(assets.boatRow, { size: 3.2, x: 22, z: -33, rotation: -.25, phase: .2, draft: .38 });
    placeWatercraft(assets.boatFishing, { size: 5, x: 35.5, z: -29.5, rotation: .28, phase: 1.2, draft: .55 });
    placeWatercraft(assets.boatSail, { size: 6.5, x: 34, z: 15, rotation: -1.1, phase: 2.1, drift: .025 });
    placeWatercraft(assets.boatTug, { size: 5, x: -36, z: -15, rotation: .8, phase: 3.2, drift: -.02 });
    placeWatercraft(assets.shipSmall, { size: 7, x: 40, z: -6, rotation: -.8, phase: 4.1, drift: .02 });
    placeWatercraft(assets.shipCargo, { size: 8.5, x: -42, z: 7, rotation: 1.2, phase: 5.4, drift: -.015 });
    placeWatercraft(assets.oceanLiner, { size: 8.5, x: 4, z: -40, rotation: .2, phase: .8, drift: .012 });
    placeWatercraft(assets.shipLarge, { size: 9, x: -23, z: 39, rotation: 2.2, phase: 2.8, drift: -.012 });
  
    worldOctree.fromGraphNode(colliderRoot);
  }

  return { buildWorld };
}
