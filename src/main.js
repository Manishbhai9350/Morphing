import "./style.css";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import fragmentShader from "./shaders/fragment.glsl";
import vertexShader from "./shaders/vertex.glsl";
import { Clock } from "three";
import { GetSceneBounds } from "./utils";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { BufferGeometry, BufferAttribute, Points } from "three";
import GUI from "lil-gui";
import { Functions } from "./math/functions";
import { InitUI } from "./ui";
import gsap from "gsap";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { Color } from "three";

const lil = new GUI();

const canvas = document.querySelector("canvas");
InitUI(OnMorph);
canvas.width = innerWidth;
canvas.height = innerHeight;

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
  powerPreference: "high-performance", // required for postprocessing
});

// scene.background = new Color("#010910");

// renderer.setClearColor(0x000000, 0); // transparent
// renderer.setClearAlpha(0);

const camera = new THREE.PerspectiveCamera(
  75,
  innerWidth / innerHeight,
  1,
  1000,
);
camera.position.set(0, 3, 5);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.03;

const Manager = new THREE.LoadingManager();
const Draco = new DRACOLoader(Manager);
const GLB = new GLTFLoader(Manager);
Draco.setDecoderPath("/draco/");
Draco.setDecoderConfig({ type: "wasm" });
GLB.setDRACOLoader(Draco);

const { width: SceneWidth, height: SceneHeight } = GetSceneBounds(
  renderer,
  camera,
);

// --- Postprocessing ---
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloom = new UnrealBloomPass(
  new THREE.Vector2(innerWidth, innerHeight),
  4, // strength
  0.6, // radius
  0, // threshold — keep low for particles
);
composer.addPass(bloom); // ← directly, no ShaderPass wrapper

lil.add(bloom, "strength", 0, 3).name("Bloom strength");
lil.add(bloom, "radius", 0, 2).name("Bloom radius");
lil.add(bloom, "threshold", 0, 1).name("Bloom threshold");

lil.destroy()

// --- Morphing ---
const N = 6400;
const CONFIG = { points: N, ...Functions };

const Geometry = new BufferGeometry();
Geometry.setAttribute(
  "position",
  new BufferAttribute(CONFIG.circlePoints(N), 3),
);
Geometry.setAttribute(
  "positionB",
  // new BufferAttribute(CONFIG.spherePoints(N), 3),
  new BufferAttribute(CONFIG.circlePoints(N), 3),
);

const Material = new THREE.ShaderMaterial({
  uniforms: {
    uProgress: { value: 0.0 },
    uNoiseFreq: { value: 50.0 },
    uNoiseScale: { value: 2.5 },
    uRadius: { value: 2 },
    uTime: { value: 0 },
    uColor1: { value: new THREE.Color("#6c63ff") },
    uColor2: { value: new THREE.Color("#ff6cab") },
  },
  vertexShader,
  fragmentShader,
});

// lil.add(Material.uniforms.uProgress,'value',0,1).name('Progress')
lil.add(Material.uniforms.uNoiseFreq, "value", 0, 100).name("Noise Frequence");
lil.add(Material.uniforms.uNoiseScale, "value", 0, 10).name("Noise Scale");

const points = new Points(Geometry, Material);
scene.add(points);

// --- Animate ---
let isAnimating = false;

function OnMorph(name, fn) {
  if (isAnimating) return false;
  isAnimating = true;
  Geometry.setAttribute("position", Geometry.getAttribute("positionB"));
  Geometry.setAttribute("positionB", new THREE.BufferAttribute(fn(N), 3));
  Material.uniforms.uProgress.value = 0;
  gsap.to(Material.uniforms.uProgress, {
    value: 1,
    duration: 1.5,
    ease: "power3.inOut",
    onComplete() {
      isAnimating = false;
    },
  });
  return true;
}

const clock = new Clock();
let PrevTime = clock.getElapsedTime();

function Animate() {
  const CurrentTime = clock.getElapsedTime();
  const DT = CurrentTime - PrevTime;
  PrevTime = CurrentTime;

  points.rotation.y += DT * 0.1;
  controls.update(DT);
  Material.uniforms.uTime.value = CurrentTime;

  composer.render(); // ← replaces renderer.render()
  requestAnimationFrame(Animate);
}

requestAnimationFrame(Animate);

function resize() {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  composer.setSize(innerWidth, innerHeight); // ← keep composer in sync
}

window.addEventListener("resize", resize);
