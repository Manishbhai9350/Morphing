# Three.js Particle Morphing

Particle morphing between mathematical 3D surfaces built with Three.js and GLSL shaders.

![Three.js](https://img.shields.io/badge/Three.js-r128-black?logo=three.js) ![Vite](https://img.shields.io/badge/Vite-latest-646CFF?logo=vite) ![GSAP](https://img.shields.io/badge/GSAP-3-88CE02)

## What it does

Thousands of particles smoothly morph between different mathematical surfaces. Each shape is defined as a function that returns a `Float32Array` of XYZ positions. The interpolation happens in a GLSL vertex shader using `mix()`, driven by GSAP.

## Shapes

| Function | Description |
|---|---|
| `circlePoints` | Points distributed around a circle |
| `spherePoints` | Fibonacci sphere distribution |
| `cylinder` | Grid of points wrapping a tube |
| `waveGrid` | sin(x) × cos(z) ocean surface |
| `saddle` | x² - z² saddle surface |
| `ripple` | sinc function — stone in water |
| `torusKnot` | Parametric knot, tunable p/q |
| `rose` | r=cos(kθ) mapped onto a sphere |
| `shell` | Exponential nautilus spiral |
| `lissajous` | 3D Lissajous curve with a/b/c ratios |
| `mobius` | Möbius strip — one-sided surface |

## Tech stack

- [Three.js](https://threejs.org/) — WebGL rendering
- [GSAP](https://gsap.com/) — morph progress animation
- [Vite](https://vitejs.dev/) — dev server and bundler
- GLSL — vertex shader lerp between shapes

## How the morphing works

Each shape function returns a `Float32Array` of particle positions. Both the current and target shapes are stored as `BufferAttribute`s on the same geometry. A `uProgress` uniform (0→1) drives the `mix()` in the vertex shader:

```glsl
attribute vec3 positionB;
uniform float uProgress;

void main() {
  vec3 pos = mix(position, positionB, uProgress);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = 2.0;
}
```

When a new shape is selected, GSAP tweens `uProgress` from 0 to 1:

```js
function OnMorph(name, fn) {
  Geometry.setAttribute("position", Geometry.getAttribute("positionB"));
  Geometry.setAttribute("positionB", new THREE.BufferAttribute(fn(N), 3));
  Material.uniforms.uProgress.value = 0;

  gsap.to(Material.uniforms.uProgress, {
    value: 1,
    duration: 1.5,
    ease: "power3.inOut",
  });
}
```

## Getting started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Adding a new shape

Add a function to `src/math/functions.js` inside the `Functions` object. It must accept `n` as the first argument and return a `Float32Array` of length `n * 3`:

```js
export const Functions = {
  // ...existing shapes

  yourShape: (n, param = 1) => {
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      arr[i * 3]     = /* x */;
      arr[i * 3 + 1] = /* y */;
      arr[i * 3 + 2] = /* z */;
    }
    return arr;
  },
};
```

It will automatically appear as a button in the UI.

## Project structure

```
src/
├── main.js              # Scene setup, render loop
├── math/
│   └── functions.js     # All shape functions
├── shaders/
│   ├── vertex.glsl      # Particle lerp shader
│   └── fragment.glsl    # Particle color shader
├── ui.js                # Button generation
└── style.css
```