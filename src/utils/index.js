import { PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { degToRad } from "three/src/math/MathUtils.js";

export function GetSceneBounds(
  renderer = new WebGLRenderer(),
  camera = new PerspectiveCamera(),
) {
  const aspect = camera.aspect;
  const z = camera.position.z;
  const theta = degToRad(camera.fov) / 2;
  const height = Math.tan(theta) * z * 2;
  const width = height * aspect;
  return { width, height };
}

export function circlePoints(n, r = 1) {
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    arr[i * 3] = Math.cos(a) * r; // x
    arr[i * 3 + 1] = Math.sin(a) * r; // y
    arr[i * 3 + 2] = 0; // z
  }
  return arr;
}

export function spherePoints(n, r = 1) {
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    // Fibonacci sphere distribution
    const phi = Math.acos(1 - (2 * (i + 0.5)) / n);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    arr[i * 3] = Math.sin(phi) * Math.cos(theta) * r;
    arr[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * r;
    arr[i * 3 + 2] = Math.cos(phi) * r;
  }
  return arr;
}

export function curvedPlane(n, s = 1) {
  const arr = new Float32Array(n * 3);
  const side = Math.ceil(Math.sqrt(n)); // e.g. n=5000 → 71×71 grid

  for (let i = 0; i < n; i++) {
    const col = i % side;
    const row = Math.floor(i / side);

    // remap 0..side → -1..1, then scale
    const x = ((col / (side - 1)) * 2 - 1) * s;
    const z = ((row / (side - 1)) * 2 - 1) * s;
    arr[i * 3] = x; // x
    arr[i * 3 + 1] = Math.sqrt(x * x / 9 - z * z / 4) ; // y (flat)
    arr[i * 3 + 2] = z; // z
  }
  return arr;
}
