export const ANIMAL_NAMES = ["beaver","bee","bunny","cat","caterpillar","chick","cow","crab","deer","dog","elephant","fish","fox","giraffe","hog","koala","lion","monkey","panda","parrot","penguin","pig","polar","tiger"];

const MODEL_ROOT = "../assets/models";

export function createAssetManifest(townCharacterAssets) {
  const paths = {
    player: `${MODEL_ROOT}/village/characters/all/character-female-a.glb`,
    guideLand: `${MODEL_ROOT}/village/characters/all/character-male-a.glb`,
    guideOcean: `${MODEL_ROOT}/village/characters/all/character-female-b.glb`,
    guideRain: `${MODEL_ROOT}/village/characters/all/character-male-c.glb`,
    guideLife: `${MODEL_ROOT}/village/characters/all/character-female-d.glb`,
    professor: `${MODEL_ROOT}/village/characters/all/character-male-e.glb`,
    wallDoor: "village/town/wall-door.glb",
    wallWindow: "village/town/wall-window.glb",
    stallGreen: "village/town/stall-green.glb",
    stallRed: "village/town/stall-red.glb",
    bench: "village/town/stall-bench.glb",
    fountain: "village/town/fountain.glb",
    windmill: "village/town/windmill.glb",
    hedge: "village/town/hedge.glb",
    lantern: "village/town/lantern.glb",
    cart: "village/town/cart.glb",
    flowers: "village/platformer/flowers.glb",
    flowersTall: "village/platformer/flowers-tall.glb",
    stones: "village/platformer/stones.glb",
    dock: "village/bridge/dock.glb",
    boatRow: "village/watercraft/boat-row-small.glb",
    boatSail: "village/watercraft/boat-sail.glb",
    boatFishing: "village/watercraft/boat-fishing.glb",
    boatTug: "village/watercraft/boat-tug.glb",
    shipSmall: "village/watercraft/ship-small.glb",
    shipLarge: "village/watercraft/ship-large.glb",
    shipCargo: "village/watercraft/ship-cargo.glb",
    oceanLiner: "village/watercraft/ocean-liner.glb",
    palmTall: "cozy/world/tree_palmDetailedTall.glb",
    palmShort: "cozy/world/tree_palmDetailedShort.glb",
    bush: "cozy/world/plant_bushDetailed.glb",
    rock: "cozy/world/rock_largeA.glb",
    canopy: "cozy/world/tree-canopy.glb",
    pandanus: "cozy/world/plant-pandanus.glb",
    lily: "cozy/world/lily-large.glb",
    canoe: "cozy/world/canoe.glb",
    foodBanana: "cozy/food/banana.glb",
    foodBread: "cozy/food/bread.glb",
    foodCoconut: "cozy/food/coconut-half.glb",
    foodPineapple: "cozy/food/pineapple.glb",
    foodWatermelon: "cozy/food/watermelon.glb",
    foodPlate: "cozy/food/plate.glb",
    cropCarrot: "cozy/farm/crop-carrot.glb",
    cropPumpkin: "cozy/farm/crop-pumpkin.glb",
    cropCorn: "cozy/farm/crop-corn.glb",
    campfireStones: "cozy/farm/campfire-stones.glb",
    campfireLogs: "cozy/farm/campfire-logs.glb",
  };
  Object.entries(paths).forEach(([key, path]) => {
    if (!path.startsWith(MODEL_ROOT)) paths[key] = `${MODEL_ROOT}/${path}`;
  });
  townCharacterAssets.forEach((name) => { paths[`villager_${name}`] = `${MODEL_ROOT}/village/characters/all/${name}.glb`; });
  ANIMAL_NAMES.forEach((name) => { paths[`animal_${name}`] = `${MODEL_ROOT}/village/animals/all/animal-${name}.glb`; });
  return paths;
}
