#include ./noise.glsl

attribute vec3 positionB;
uniform float uProgress;
uniform float uRadius;
uniform float uTime;
uniform float uNoiseFreq;
uniform float uNoiseScale;
uniform vec3 uColor1;
uniform vec3 uColor2;
varying vec3 vColor;

void main() {
    // color
    float h = sin(uTime * 2.0 + cos(position.y + uTime) * 2.0);
    vColor = mix(uColor1, uColor2, clamp(h, 0.0, 1.0));

    // triangle wave — peaks at midpoint of morph
    float noisedProgress = uProgress;
    if(noisedProgress >= 0.5) {
        noisedProgress = 1.0 - noisedProgress;
    }
    float noiseStrength = noisedProgress; // 0 → .5 → 0

    // displacement using 3D noise
    vec3 posA = position;
    vec3 posB = positionB;
    float noised = (noise(posA * uNoiseFreq) - .5)  * uNoiseScale;
    vec3 displacement = vec3(noised, noised, noised) * noiseStrength;

    posA += displacement * normalize(posA);
    posB += displacement * normalize(posB); 

    vec3 pos = mix(posA, posB, uProgress);

    pos *= uRadius;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = 2.0;
}