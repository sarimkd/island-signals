import * as THREE from "three";

const WORLD_EXTENT = 42;

function worldToCanvas(value, size) {
  return ((value + WORLD_EXTENT) / (WORLD_EXTENT * 2)) * size;
}

/**
 * Paints the full path network into one texture and drapes it over the terrain.
 * One surface removes z-fighting at junctions and gives every branch rounded joins.
 */
export function createPathOverlay({ routes, groundHeight, parent, lowPower = false }) {
  const textureSize = lowPower ? 1024 : 2048;
  const canvas = document.createElement("canvas");
  canvas.width = textureSize;
  canvas.height = textureSize;
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, textureSize, textureSize);
  context.lineCap = "round";
  context.lineJoin = "round";
  context.strokeStyle = "#c9a878";

  routes.forEach((route, index) => {
    context.beginPath();
    route.forEach(([x, z], pointIndex) => {
      const px = worldToCanvas(x, textureSize);
      const py = textureSize - worldToCanvas(z, textureSize);
      if (pointIndex === 0) context.moveTo(px, py);
      else context.lineTo(px, py);
    });
    context.lineWidth = ((index === 0 ? 3.25 : 2.7) / (WORLD_EXTENT * 2)) * textureSize;
    context.stroke();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = 4;

  const segments = lowPower ? 72 : 112;
  const vertices = [];
  const uvs = [];
  const indices = [];
  for (let iz = 0; iz <= segments; iz += 1) {
    const z = THREE.MathUtils.lerp(-WORLD_EXTENT, WORLD_EXTENT, iz / segments);
    for (let ix = 0; ix <= segments; ix += 1) {
      const x = THREE.MathUtils.lerp(-WORLD_EXTENT, WORLD_EXTENT, ix / segments);
      vertices.push(x, groundHeight(x, z) + 0.072, z);
      uvs.push(ix / segments, iz / segments);
    }
  }
  for (let iz = 0; iz < segments; iz += 1) {
    for (let ix = 0; ix < segments; ix += 1) {
      const a = iz * (segments + 1) + ix;
      const b = a + 1;
      const c = a + segments + 1;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    alphaTest: 0.02,
    polygonOffset: true,
    polygonOffsetFactor: -4,
    polygonOffsetUnits: -4,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.renderOrder = 3;
  parent.add(mesh);
  return mesh;
}
