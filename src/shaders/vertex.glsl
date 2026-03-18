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