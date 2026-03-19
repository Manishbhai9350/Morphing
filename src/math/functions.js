export const Functions = {
  circlePoints: (n, r = 1) => {
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      arr[i * 3] = Math.cos(a) * r;
      arr[i * 3 + 1] = Math.sin(a) * r;
      arr[i * 3 + 2] = 0;
    }
    return arr;
  },

  spherePoints: (n, r = 1) => {
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / n);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      arr[i * 3] = Math.sin(phi) * Math.cos(theta) * r;
      arr[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * r;
      arr[i * 3 + 2] = Math.cos(phi) * r;
    }
    return arr;
  },
  cylinder: (n, r = 1, height = 2) => {
    const arr = new Float32Array(n * 3);
    const side = Math.ceil(Math.sqrt(n));
    for (let i = 0; i < n; i++) {
      const col = i % side;
      const row = Math.floor(i / side);
      const a = (col / (side - 1)) * Math.PI * 2;
      const y = ((row / (side - 1)) * 2 - 1) * height * 0.5;
      arr[i * 3] = Math.cos(a) * r;
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = Math.sin(a) * r;
    }
    return arr;
  },

  waveGrid: (n, s = 1) => {
    const arr = new Float32Array(n * 3);
    const side = Math.ceil(Math.sqrt(n));
    for (let i = 0; i < n; i++) {
      const col = i % side,
        row = Math.floor(i / side);
      const x = ((col / (side - 1)) * 2 - 1) * Math.PI * 2;
      const z = ((row / (side - 1)) * 2 - 1) * Math.PI * 2;
      arr[i * 3] = x * s * 0.4;
      arr[i * 3 + 1] = Math.sin(x) * Math.cos(z) * s * 0.5;
      arr[i * 3 + 2] = z * s * 0.4;
    }
    return arr;
  },

  saddle: (n, s = 1) => {
    const arr = new Float32Array(n * 3);
    const side = Math.ceil(Math.sqrt(n));
    for (let i = 0; i < n; i++) {
      const col = i % side,
        row = Math.floor(i / side);
      const x = ((col / (side - 1)) * 2 - 1) * s;
      const z = ((row / (side - 1)) * 2 - 1) * s;
      arr[i * 3] = x;
      arr[i * 3 + 1] = (x * x - z * z) * 0.6;
      arr[i * 3 + 2] = z;
    }
    return arr;
  },

  ripple: (n, s = 1) => {
    const arr = new Float32Array(n * 3);
    const side = Math.ceil(Math.sqrt(n));
    for (let i = 0; i < n; i++) {
      const col = i % side,
        row = Math.floor(i / side);
      const x = ((col / (side - 1)) * 2 - 1) * 4 * s;
      const z = ((row / (side - 1)) * 2 - 1) * 4 * s;
      const r = Math.sqrt(x * x + z * z) || 0.001;
      arr[i * 3] = x * 0.3;
      arr[i * 3 + 1] = (Math.sin(r * 2) / r) * 0.6;
      arr[i * 3 + 2] = z * 0.3;
    }
    return arr;
  },

  torusKnot: (n, p = 2, q = 3) => {
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const t = (i / n) * Math.PI * 2;
      const r = Math.cos(q * t) + 2;
      arr[i * 3] = r * .5 * Math.cos(p * t);
      arr[i * 3 + 1] = Math.sin(q * t);
      arr[i * 3 + 2] = r * .5 * Math.sin(p * t);
    }
    return arr;
  },

  rose: (n, k = 3) => {
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / n);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const r = Math.abs(Math.cos(k * phi));
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.cos(phi);
      arr[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    return arr;
  },

  shell: (n) => {
    const arr = new Float32Array(n * 3);
    const side = Math.ceil(Math.sqrt(n));
    for (let i = 0; i < n; i++) {
      const col = i % side,
        row = Math.floor(i / side);
      const u = (col / (side - 1)) * Math.PI * 4;
      const v = (row / (side - 1)) * 2 - 1;
      const r = Math.exp(0.15 * u);
      arr[i * 3] = r * Math.cos(u) * 0.3;
      arr[i * 3 + 1] = v * r * 0.15;
      arr[i * 3 + 2] = r * Math.sin(u) * 0.3;
    }
    return arr;
  },

  lissajous: (n, a = 3, b = 4, c = 5) => {
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const t = (i / n) * Math.PI * 2;
      arr[i * 3] = Math.sin(a * t + 0.1);
      arr[i * 3 + 1] = Math.sin(b * t + 0.5);
      arr[i * 3 + 2] = Math.sin(c * t + 1.2);
    }
    return arr;
  },

  mobius: (n) => {
    const arr = new Float32Array(n * 3);
    const side = Math.ceil(Math.sqrt(n));
    for (let i = 0; i < n; i++) {
      const col = i % side,
        row = Math.floor(i / side);
      const u = (col / (side - 1)) * Math.PI * 2;
      const v = ((row / (side - 1)) * 2 - 1) * 0.4;
      arr[i * 3] = (1 + v * Math.cos(u / 2)) * Math.cos(u);
      arr[i * 3 + 1] = v * Math.sin(u / 2);
      arr[i * 3 + 2] = (1 + v * Math.cos(u / 2)) * Math.sin(u);
    }
    return arr;
  },
};
