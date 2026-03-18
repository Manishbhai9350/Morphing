import "./style.css";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import fragmentShader from "./shaders/fragment.glsl";
import vertexShader from "./shaders/vertex.glsl";
import { Clock } from "three";
import {
  circlePoints,
  curvedPlane,
  GetSceneBounds,
  spherePoints,
} from "./utils";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { BufferGeometry } from "three";
import { BufferAttribute } from "three";
import { Points } from "three";
import GUI from "lil-gui";

const { PI } = Math;

const lil = new GUI();

const canvas = document.querySelector("canvas");

canvas.width = innerWidth;
canvas.height = innerHeight;

const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
});
const camera = new THREE.PerspectiveCamera(
  75,
  innerWidth / innerHeight,
  1,
  1000,
);
camera.position.set(5, 5, 5);
const controls = new OrbitControls(camera, canvas);

const Manager = new THREE.LoadingManager();
const Draco = new DRACOLoader(Manager);
const GLB = new GLTFLoader(Manager);
const TextureLoader = new THREE.TextureLoader(Manager);

Draco.setDecoderPath("/draco/");
Draco.setDecoderConfig({ type: "wasm" });
GLB.setDRACOLoader(Draco);

const { width: SceneWidth, height: SceneHeight } = GetSceneBounds(
  renderer,
  camera,
);

// ?? Morphing

// --- 1. Generate points for two shapes ---F
let N = 5000;
const posA = circlePoints(N);
// const posA = spherePoints(N);
const posB = spherePoints(N);
// const posB = curvedPlane(N);

// --- 2. Put BOTH shapes in the geometry as attributes ---
const Geometry = new BufferGeometry();

Geometry.setAttribute("position", new BufferAttribute(posA, 3));
Geometry.setAttribute("positionB", new BufferAttribute(posB, 3));

// --- 3. Shader material — lerp happens on the GPU ---
const Material = new THREE.ShaderMaterial({
  uniforms: {
    uProgress: { value: 0.0 },
    uRadius: { value: 2.5 },
  },
  vertexShader: `
    attribute vec3 positionB;
    uniform float uProgress;
    uniform float uRadius;
    void main() {
      vec3 pos = mix(position, positionB, uProgress) * uRadius;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      gl_PointSize = 2.0;
    }
  `,
  fragmentShader: `
    void main() {
      gl_FragColor = vec4(1.0, 0.8, 0.5, 1.0);
    }
  `,
});

const points = new Points(Geometry, Material);
scene.add(points);

lil.add(Material.uniforms.uProgress, "value", 0, 1).name("Progress");
lil.add(Material.uniforms.uRadius, "value", 0, 5).name("Radius");

// --- 4. Animate ---
let progress = 0;
let direction = 1;

const clock = new Clock();
let PrevTime = clock.getElapsedTime();

function Animate() {
  const CurrentTime = clock.getElapsedTime();
  const DT = CurrentTime - PrevTime;
  PrevTime = CurrentTime;

  // progress += 0.005 * direction;
  // if (progress >= 1 || progress <= 0) direction *= -1;
  // Material.uniforms.uProgress.value = progress;

  renderer.render(scene, camera);
  requestAnimationFrame(Animate);
}

requestAnimationFrame(Animate);

function resize() {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  renderer.setSize(innerWidth, innerHeight);
}

window.addEventListener("resize", resize);
