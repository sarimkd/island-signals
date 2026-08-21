export function createWorldPrimitives({
  THREE,
  cloneSkeleton,
  renderer,
  lowPower,
  gltfLoader,
  modelCache,
  mixers,
  world,
  colliderRoot,
  obstacleBounds,
  dynamicBarriers,
  waterMaterials,
  shorelineRipples,
  pondZones,
  swayingPlants,
  bridgeWalkable,
  OCEAN_WATER_Y,
  ISLAND_OUTLINE,
  STATIONS,
  PATH_NETWORK,
  createPathOverlay
}) {
  const decorativeBounds = [];
  const mainModuleUrl = new URL("../main.js", import.meta.url);
  const url = (path) => new URL(path, mainModuleUrl).href;
  const loadModel = (path) => {
    if (!modelCache.has(path)) modelCache.set(path, gltfLoader.loadAsync(url(path)));
    return modelCache.get(path);
  };
  
  function groundHeight(x, z) {
    const radius = Math.min(1, Math.sqrt((x / 39) ** 2 + (z / 30) ** 2));
    return .92 * (1 - radius ** 1.55);
  }
  
  function walkableHeight(x, z) {
    const terrain = groundHeight(x, z);
    if (!bridgeWalkable.active) return terrain;
    const across = Math.abs(x - bridgeWalkable.x);
    const along = Math.abs(z - bridgeWalkable.z);
    if (across <= bridgeWalkable.halfWidth && along <= bridgeWalkable.halfLength) return Math.max(terrain, bridgeWalkable.deckY);
    return terrain;
  }
  
  function pointInIsland(x, z, margin = 0) {
    let inside = false;
    for (let i = 0, j = ISLAND_OUTLINE.length - 1; i < ISLAND_OUTLINE.length; j = i, i += 1) {
      const [xi, zi] = ISLAND_OUTLINE[i];
      const [xj, zj] = ISLAND_OUTLINE[j];
      const hit = ((zi > z) !== (zj > z)) && (x < (xj - xi) * (z - zi) / (zj - zi) + xi);
      if (hit) inside = !inside;
    }
    if (!inside || margin <= 0) return inside;
    return pointInIsland(x * (1 + margin / 36), z * (1 + margin / 28), 0);
  }
  
  function placeModel(gltf, options = {}) {
    const model = cloneSkeleton(gltf.scene);
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const scale = (options.size || 1) / Math.max(size.x, size.y, size.z, .001);
    const centerX = (box.min.x + box.max.x) * .5;
    const centerZ = (box.min.z + box.max.z) * .5;
    model.scale.setScalar(scale);
    const baseY = options.y ?? (options.parent ? 0 : groundHeight(options.x || 0, options.z || 0));
    model.position.set(
      (options.x || 0) - centerX * scale,
      baseY - box.min.y * scale,
      (options.z || 0) - centerZ * scale,
    );
    model.rotation.y = options.rotation || 0;
    model.traverse((child) => {
      if (!child.isMesh) return;
      if (options.tint && child.material) {
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        const tinted = materials.map((material) => {
          const clone = material.clone();
          if (clone.color) clone.color.lerp(new THREE.Color(options.tint), options.tintAmount ?? .35);
          return clone;
        });
        child.material = Array.isArray(child.material) ? tinted : tinted[0];
      }
      const activeMaterials = Array.isArray(child.material) ? child.material : [child.material];
      activeMaterials.forEach((material) => {
        if ("metalness" in material) material.metalness = 0;
        if ("roughness" in material) material.roughness = Math.max(material.roughness ?? 0, .82);
        material.needsUpdate = true;
      });
      child.castShadow = !lowPower && options.castShadow !== false;
      child.receiveShadow = !lowPower && options.receiveShadow !== false;
      child.frustumCulled = true;
    });
    (options.parent || world).add(model);
    return model;
  }
  
  function addMixer(model, animations, preferred = "idle") {
    const mixer = new THREE.AnimationMixer(model);
    const actions = new Map();
    animations.forEach((clip) => actions.set(clip.name.toLowerCase(), mixer.clipAction(clip)));
    const action = actions.get(preferred) || actions.values().next().value;
    action?.play();
    mixers.push(mixer);
    return { mixer, actions };
  }
  
  const invisibleColliderMaterial = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false });
  
  function addColliderBox(x, z, width, depth, height = 4) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), invisibleColliderMaterial);
    mesh.position.set(x, groundHeight(x, z) + height * .5, z);
    colliderRoot.add(mesh);
    obstacleBounds.push({ x, z, halfW: width * .5, halfD: depth * .5 });
  }
  
  function addColliderSegment(start, end, width = .34, height = 1.5) {
    const dx = end[0] - start[0];
    const dz = end[1] - start[1];
    const length = Math.hypot(dx, dz);
    const x = (start[0] + end[0]) * .5;
    const z = (start[1] + end[1]) * .5;
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, length), invisibleColliderMaterial);
    mesh.position.set(x, groundHeight(x, z) + height * .5, z);
    mesh.rotation.y = Math.atan2(dx, dz);
    colliderRoot.add(mesh);
    dynamicBarriers.push({ start, end, width });
  }
  
  function seededNoise(seed) {
    const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
    return value - Math.floor(value);
  }
  
  function createGrassMaterial() {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext("2d");
    context.fillStyle = "#4f7b55";
    context.fillRect(0, 0, 128, 128);
    for (let index = 0; index < 90; index += 1) {
      const x = seededNoise(index * 4.3 + 2) * 128;
      const y = seededNoise(index * 8.1 + 5) * 128;
      const radius = 1.5 + seededNoise(index * 6.7) * 3.6;
      context.fillStyle = index % 2 ? "rgba(49,105,67,.1)" : "rgba(151,183,115,.1)";
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    }
    for (let index = 0; index < 900; index += 1) {
      const x = seededNoise(index * 3.1) * 128;
      const y = seededNoise(index * 7.7 + 9) * 128;
      const light = seededNoise(index * 11.3) > .54;
      context.fillStyle = light ? "rgba(143,177,112,.25)" : "rgba(42,93,61,.2)";
      context.fillRect(x, y, light ? 1.6 : 1.2, light ? 2.4 : 1.7);
    }
    for (let index = 0; index < 70; index += 1) {
      const x = seededNoise(index * 13.1) * 128;
      const y = seededNoise(index * 17.9) * 128;
      context.strokeStyle = "rgba(38,84,55,.24)";
      context.beginPath();
      context.moveTo(x, y + 3);
      context.lineTo(x + seededNoise(index) * 2 - 1, y);
      context.stroke();
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 7);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    return new THREE.MeshStandardMaterial({ map: texture, color: 0xffffff, roughness: 1 });
  }
  
  function createWaterMaterial(baseColor, lineColor) {
    const material = new THREE.ShaderMaterial({
      transparent: false,
      uniforms: {
        uTime: { value: 0 },
        uBase: { value: new THREE.Color(baseColor) },
        uLine: { value: new THREE.Color(lineColor) },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uBase;
        uniform vec3 uLine;
        varying vec2 vUv;
        void main() {
          float bend = sin(vUv.y * 28.0 - uTime * 0.85) * 0.035;
          float wave = sin((vUv.x + bend) * 44.0 + uTime * 1.25);
          float fineWave = sin(vUv.y * 64.0 - uTime * 1.6) * 0.25;
          float crest = smoothstep(0.7, 0.94, wave + fineWave);
          float vignette = 1.0 - distance(vUv, vec2(0.5)) * 0.12;
          gl_FragColor = vec4(mix(uBase, uLine, crest * 0.48) * vignette, 1.0);
        }
      `,
    });
    waterMaterials.push(material);
    return material;
  }
  
  function spawnShoreRipple(x, z, y, color = 0xd6f4ef) {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(.34, .43, 28),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .62, depthWrite: false, side: THREE.DoubleSide }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(x, y, z);
    world.add(ring);
    shorelineRipples.push({ ring, age: 0 });
  }
  
  function addConnectedFence(points, options = {}) {
    const wood = new THREE.MeshStandardMaterial({ color: options.color || 0x8c623f, roughness: 1 });
    const postGeometry = new THREE.BoxGeometry(.18, 1.32, .18);
    const railGeometry = new THREE.BoxGeometry(.13, .14, 1);
    for (let pointIndex = 0; pointIndex < points.length - 1; pointIndex += 1) {
      const start = points[pointIndex];
      const end = points[pointIndex + 1];
      const dx = end[0] - start[0];
      const dz = end[1] - start[1];
      const distance = Math.hypot(dx, dz);
      const panels = Math.max(1, Math.ceil(distance / 1.75));
      for (let index = 0; index < panels; index += 1) {
        const t0 = index / panels;
        const t1 = (index + 1) / panels;
        const x0 = THREE.MathUtils.lerp(start[0], end[0], t0);
        const z0 = THREE.MathUtils.lerp(start[1], end[1], t0);
        const x1 = THREE.MathUtils.lerp(start[0], end[0], t1);
        const z1 = THREE.MathUtils.lerp(start[1], end[1], t1);
        const segmentLength = Math.hypot(x1 - x0, z1 - z0);
        const midpointX = (x0 + x1) * .5;
        const midpointZ = (z0 + z1) * .5;
        const angle = Math.atan2(x1 - x0, z1 - z0);
        if (index === 0) {
          const post = new THREE.Mesh(postGeometry, wood);
          post.position.set(x0, groundHeight(x0, z0) + .66, z0);
          world.add(post);
        }
        const post = new THREE.Mesh(postGeometry, wood);
        post.position.set(x1, groundHeight(x1, z1) + .66, z1);
        world.add(post);
        [.48, 1.02].forEach((height) => {
          const rail = new THREE.Mesh(railGeometry, wood);
          rail.scale.z = segmentLength + .05;
          rail.position.set(midpointX, groundHeight(midpointX, midpointZ) + height, midpointZ);
          rail.rotation.y = angle;
          world.add(rail);
        });
        addColliderSegment([x0, z0], [x1, z1], .3, 1.25);
      }
    }
  }
  
  function decorationPositionClear(x, z, clearance = .7) {
    if (obstacleBounds.some((box) => Math.abs(x - box.x) < box.halfW + clearance && Math.abs(z - box.z) < box.halfD + clearance)) return false;
    if (dynamicBarriers.some((barrier) => distanceToSegment2D(x, z, barrier.start, barrier.end) < clearance + barrier.width * .5)) return false;
    if (decorativeBounds.some((item) => Math.hypot(x - item.x, z - item.z) < clearance + item.radius)) return false;
    if (STATIONS.some((station) => Math.hypot(x - station.position.x, z - station.position.z) < 2.35 + clearance)) return false;
    return true;
  }
  
  function tallSceneryPositionClear(x, z) {
    if (!decorationPositionClear(x, z, 1.35)) return false;
    return STATIONS.every((station) => Math.hypot(x - station.position.x, z - station.position.z) > 7);
  }
  
  function placePlant(gltf, options) {
    const clearance = Math.max(.45, (options.size || 1) * .32);
    if (!options.allowOverlap && !decorationPositionClear(options.x || 0, options.z || 0, clearance)) return null;
    const plant = placeModel(gltf, options);
    decorativeBounds.push({ x: options.x || 0, z: options.z || 0, radius: clearance });
    swayingPlants.push({ plant, phase: Math.random() * Math.PI * 2, baseZ: plant.rotation.z });
    return plant;
  }
  
  function createTerrainSurface(scale, yOffset, color, textured = false) {
    const rings = [.16, .34, .53, .71, .87, 1];
    const vertices = [0, groundHeight(0, 0) + yOffset, 0];
    const indices = [];
    rings.forEach((ring) => ISLAND_OUTLINE.forEach(([x,z]) => {
      const px = x * ring * scale;
      const pz = z * ring * scale;
      vertices.push(px, groundHeight(px / scale, pz / scale) + yOffset, pz);
    }));
    const count = ISLAND_OUTLINE.length;
    for (let i = 0; i < count; i += 1) indices.push(0, 1 + (i + 1) % count, 1 + i);
    for (let ring = 0; ring < rings.length - 1; ring += 1) {
      const inner = 1 + ring * count;
      const outer = inner + count;
      for (let i = 0; i < count; i += 1) {
        const next = (i + 1) % count;
        indices.push(inner + i, outer + next, outer + i, inner + i, inner + next, outer + next);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    const mesh = new THREE.Mesh(geometry, textured ? createGrassMaterial() : new THREE.MeshStandardMaterial({ color, roughness: 1, flatShading: false }));
    mesh.receiveShadow = false;
    world.add(mesh);
    return mesh;
  }
  
  function createCoastSkirt(scale = 1.07) {
    const vertices = [];
    const indices = [];
    ISLAND_OUTLINE.forEach(([x,z]) => {
      const px = x * scale;
      const pz = z * scale;
      vertices.push(px, groundHeight(x, z) - .28, pz, px, -1.5, pz);
    });
    for (let i = 0; i < ISLAND_OUTLINE.length; i += 1) {
      const next = (i + 1) % ISLAND_OUTLINE.length;
      indices.push(i * 2, next * 2, next * 2 + 1, i * 2, next * 2 + 1, i * 2 + 1);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    world.add(new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0xc9a46f, roughness: 1 })));
  }
  
  function addPathNetwork(routes) {
    return createPathOverlay({ routes, groundHeight, parent: world, lowPower });
  }
  
  function addDistrictPatch(x, z, radiusX, radiusZ, color, segments = 40) {
    const vertices = [x, groundHeight(x, z) + .045, z];
    const indices = [];
    for (let index = 0; index < segments; index += 1) {
      const angle = index / segments * Math.PI * 2;
      const px = x + Math.cos(angle) * radiusX;
      const pz = z + Math.sin(angle) * radiusZ;
      vertices.push(px, groundHeight(px, pz) + .05, pz);
      indices.push(0, 1 + index, 1 + (index + 1) % segments);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    const patch = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color, roughness: 1, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2 }));
    patch.receiveShadow = false;
    world.add(patch);
    return patch;
  }
  
  function createPond(x, z, radiusX, radiusZ, waterY = groundHeight(x, z) + .065) {
    const bank = new THREE.Mesh(
      new THREE.RingGeometry(1, 1.1, 44),
      new THREE.MeshStandardMaterial({ color: 0xb59a68, roughness: 1, side: THREE.DoubleSide }),
    );
    bank.rotation.x = -Math.PI / 2;
    bank.scale.set(radiusX, radiusZ, 1);
    bank.position.set(x, waterY - .012, z);
    world.add(bank);
    const pond = new THREE.Mesh(new THREE.CircleGeometry(1, 44), createWaterMaterial(0x69b9c5, 0xe0f6ee));
    pond.rotation.x = -Math.PI / 2;
    pond.scale.set(radiusX, radiusZ, 1);
    pond.position.set(x, waterY, z);
    world.add(pond);
    const zone = { x, z, radiusX, radiusZ, waterY };
    pondZones.push(zone);
    return zone;
  }
  
  function buildPicnicTable(x, z, rotation = 0) {
    const group = new THREE.Group();
    const wood = new THREE.MeshStandardMaterial({ color: 0x9b6841, roughness: 1 });
    const top = new THREE.Mesh(new THREE.BoxGeometry(2.8, .18, 1.15), wood);
    top.position.y = .95;
    group.add(top);
    [-.82,.82].forEach((side) => {
      const bench = new THREE.Mesh(new THREE.BoxGeometry(2.8, .14, .36), wood);
      bench.position.set(0,.56,side);
      group.add(bench);
    });
    [[-1,-.35],[1,-.35],[-1,.35],[1,.35]].forEach(([px,pz]) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(.16,.88,.16), wood);
      leg.position.set(px,.44,pz);
      leg.rotation.z = px < 0 ? -.18 : .18;
      group.add(leg);
    });
    group.position.set(x, groundHeight(x, z), z);
    group.rotation.y = rotation;
    world.add(group);
    addColliderBox(x, z, 3.15, 2.25, 1.3);
    return group;
  }
  
  function buildFoodDisplay(assets, x, z, rotation = 0) {
    const table = buildPicnicTable(x, z, rotation);
    const food = [assets.foodBread, assets.foodBanana, assets.foodPineapple, assets.foodWatermelon, assets.foodCoconut];
    food.forEach((item, index) => placeModel(item, {
      parent: table, size: index === 3 ? .48 : .34, x: -1 + index * .5, y: 1.07, z: index % 2 ? .18 : -.14, rotation: index * .7, castShadow: false,
    }));
    return table;
  }
  
  function buildBridge(x, y, z) {
    const bridge = new THREE.Group();
    const wood = new THREE.MeshStandardMaterial({ color: 0xa86f43, roughness: 1 });
    const darkWood = new THREE.MeshStandardMaterial({ color: 0x765039, roughness: 1 });
    for (let index = -7; index <= 7; index += 1) {
      const plank = new THREE.Mesh(new THREE.BoxGeometry(3.7, .18, .62), index % 2 ? wood : darkWood);
      plank.position.z = index * .61;
      bridge.add(plank);
    }
    [-1.78, 1.78].forEach((side) => {
      for (let index = -3; index <= 3; index += 1) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(.16, 1.35, .16), darkWood);
        post.position.set(side, .64, index * 1.45);
        bridge.add(post);
      }
      const rail = new THREE.Mesh(new THREE.BoxGeometry(.16, .16, 9.25), darkWood);
      rail.position.set(side, 1.18, 0);
      bridge.add(rail);
    });
    bridge.position.set(x, y, z);
    world.add(bridge);
    bridgeWalkable.x = x;
    bridgeWalkable.z = z;
    bridgeWalkable.deckY = y + .11;
    bridgeWalkable.active = true;
    addColliderSegment([x - 1.82, z - 4.65], [x - 1.82, z + 4.65], .2, 1.35);
    addColliderSegment([x + 1.82, z - 4.65], [x + 1.82, z + 4.65], .2, 1.35);
    return bridge;
  }
  
  function buildCottage(assets, x, z, rotation = 0, color = 0xe7c493) {
    const house = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(4.9, 2.25, 4.9), new THREE.MeshStandardMaterial({ color, roughness: .94 }));
    body.position.y = 1.125;
    house.add(body);
    placeModel(assets.wallDoor, { parent: house, size: 2.2, x: .95, y: .03, z: 2.48, rotation: Math.PI / 2 });
    placeModel(assets.wallWindow, { parent: house, size: 2.2, x: -.95, y: .03, z: 2.48, rotation: Math.PI / 2 });
    placeModel(assets.wallWindow, { parent: house, size: 2.2, x: 2.48, y: .03, z: -.7, rotation: Math.PI });
    const roofMaterial = new THREE.MeshStandardMaterial({ color: rotation > 0 ? 0x5d9b88 : 0xcf6d58, roughness: .95 });
    const roofLeft = new THREE.Mesh(new THREE.BoxGeometry(3.45, .28, 5.65), roofMaterial);
    const roofRight = roofLeft.clone();
    roofLeft.position.set(-1.25, 2.92, 0);
    roofRight.position.set(1.25, 2.92, 0);
    roofLeft.rotation.z = .55;
    roofRight.rotation.z = -.55;
    house.add(roofLeft, roofRight);
    const ridge = new THREE.Mesh(new THREE.BoxGeometry(.28, .3, 5.75), roofMaterial);
    ridge.position.y = 3.72;
    house.add(ridge);
    house.position.set(x, groundHeight(x, z), z);
    house.rotation.y = rotation;
    world.add(house);
    addColliderBox(x, z, 5.6, 5.6, 5.3);
    return house;
  }
  
  function buildOpenFale(x, z, rotation = 0) {
    const fale = new THREE.Group();
    const timber = new THREE.MeshStandardMaterial({ color: 0x8b603e, roughness: 1 });
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xb9814f, roughness: 1 });
    const thatch = new THREE.MeshStandardMaterial({ color: 0xb98b52, roughness: 1, flatShading: true });
    const floor = new THREE.Mesh(new THREE.CylinderGeometry(3.05, 3.2, .38, 12), floorMaterial);
    floor.scale.z = .74;
    floor.position.y = .22;
    fale.add(floor);
    [[-2.25,-1.25],[2.25,-1.25],[-2.25,1.25],[2.25,1.25],[0,-1.65],[0,1.65]].forEach(([px,pz]) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(.12,.15,2.65,8), timber);
      post.position.set(px, 1.62, pz);
      fale.add(post);
    });
    const roof = new THREE.Mesh(new THREE.ConeGeometry(3.65, 1.55, 12), thatch);
    roof.scale.z = .76;
    roof.position.y = 3.15;
    roof.rotation.y = Math.PI / 12;
    fale.add(roof);
    fale.position.set(x, groundHeight(x, z), z);
    fale.rotation.y = rotation;
    world.add(fale);
    addColliderBox(x, z, 5.7, 3.9, 4.3);
    return fale;
  }
  
  function distanceToSegment2D(x, z, start, end) {
    const dx = end[0] - start[0];
    const dz = end[1] - start[1];
    const denominator = dx * dx + dz * dz || 1;
    const amount = THREE.MathUtils.clamp(((x - start[0]) * dx + (z - start[1]) * dz) / denominator, 0, 1);
    return Math.hypot(x - (start[0] + dx * amount), z - (start[1] + dz * amount));
  }
  
  function distanceToRoute(x, z) {
    let distance = Infinity;
    PATH_NETWORK.forEach((route) => {
      for (let index = 0; index < route.length - 1; index += 1) distance = Math.min(distance, distanceToSegment2D(x, z, route[index], route[index + 1]));
    });
    return distance;
  }

  return { url, loadModel, groundHeight, walkableHeight, pointInIsland, placeModel, addMixer, addColliderBox, addColliderSegment, seededNoise, createGrassMaterial, createWaterMaterial, spawnShoreRipple, addConnectedFence, decorationPositionClear, tallSceneryPositionClear, placePlant, createTerrainSurface, createCoastSkirt, addPathNetwork, addDistrictPatch, createPond, buildPicnicTable, buildFoodDisplay, buildBridge, buildCottage, buildOpenFale, distanceToSegment2D, distanceToRoute };
}
