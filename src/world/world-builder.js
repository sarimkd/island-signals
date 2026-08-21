import { createWorldPrimitives } from "./world-primitives.js";
import { createWorldActors } from "./world-actors.js";
import { createVillageBuilder } from "./village-builder.js";

export function createWorldBuilder(context) {
  const primitives = createWorldPrimitives(context);
  const actors = createWorldActors({ ...context, ...primitives });
  const village = createVillageBuilder({ ...context, ...primitives, ...actors });

  return {
    buildWorld: village.buildWorld,
    groundHeight: primitives.groundHeight,
    walkableHeight: primitives.walkableHeight,
    pointInIsland: primitives.pointInIsland,
    randomAnimalTarget: actors.randomAnimalTarget,
    spawnShoreRipple: primitives.spawnShoreRipple,
    distanceToSegment2D: primitives.distanceToSegment2D,
  };
}
