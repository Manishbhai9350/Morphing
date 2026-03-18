import "./style.css";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import fragmentShader from "./shaders/fragment.glsl";
import vertexShader from "./shaders/vertex.glsl";
import { Clock } from "three";
import { GetSceneBounds } from "./utils";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { BufferGeometry } from "three";
import { BufferAttribute } from "three";
import { Points } from "three";
import GUI from "lil-gui";
import { Functions } from "./math/functions";
import { InitUI } from "./ui";
import gsap from "gsap";

const { PI } = Math;

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
});
const camera = new THREE.PerspectiveCamera(
  75,
  innerWidth / innerHeight,
  1,
  1000,
);
camera.position.set(0, 0, 5);
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

const N = 5000;

const CONFIG = {
  points: N,
  ...Functions,
};

// --- 2. Put BOTH shapes in the geometry as attributes ---
const Geometry = new BufferGeometry();

Geometry.setAttribute(
  "position",
  new BufferAttribute(CONFIG.circlePoints(CONFIG.points), 3),
);
Geometry.setAttribute(
  "positionB",
  new BufferAttribute(CONFIG.circlePoints(CONFIG.points), 3),
);

// --- 3. Shader material — lerp happens on the GPU ---
const Material = new THREE.ShaderMaterial({
  uniforms: {
    uProgress: { value: 0.0 },
    uRadius: { value: 2 },
    uTime: { value: 0 },
    uColor1: { value: new THREE.Color("#6c63ff") }, // purple-blue (low Y)
    uColor2: { value: new THREE.Color("#ff6cab") }, // pink (high Y)
  },
  vertexShader: /* glsl */ `
    attribute vec3 positionB;
    uniform float uProgress;
    uniform float uRadius;
    uniform float uTime;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    varying vec3 vColor;
    void main() {

      float h = (sin(uTime * 2. + cos(position.y + uTime) * 2.)); // remap -1..1 → 0..1
      vColor = mix(uColor1, uColor2, clamp(h, 0., 1.));

      float noisedProgress = uProgress;

      vec3 pos = mix(position, positionB, uProgress) * uRadius;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      gl_PointSize = 2.0;
    }
  `,
  fragmentShader: /* glsl */ `
    varying vec3 vColor;
    void main() {
      gl_FragColor = vec4(vColor, 1.0);
    }
  `,
});

const points = new Points(Geometry, Material);
scene.add(points);

lil.add(Material.uniforms.uProgress, "value", 0, 1).name("Progress");
lil.add(Material.uniforms.uRadius, "value", 0, 5).name("Radius");

// --- 4. Animate ---

let isAnimating = false;
function OnMorph(name, fn) {
  if (isAnimating) return false;
  isAnimating = true;
  // snap current positionB to position (where we are now)
  Geometry.setAttribute("position", Geometry.getAttribute("positionB"));

  // set the new target
  Geometry.setAttribute("positionB", new THREE.BufferAttribute(fn(N), 3));

  // reset and tween
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

  Material.uniforms.uTime.value = CurrentTime;

  renderer.render(scene, camera);
  requestAnimationFrame(Animate);
}

lil.destroy()

requestAnimationFrame(Animate);

function resize() {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  renderer.setSize(innerWidth, innerHeight);
}

window.addEventListener("resize", resize);
