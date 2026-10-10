precision highp float;

#include ./lib/sdf.glsl

uniform float uTime;
varying vec2 vUv;

void main() {
  vec2 p = vUv * 2.0 - 1.0;
  float a = sphereSDF(vec3(p - vec2(0.35, 0.0), 0.0), 0.32);
  float b = sphereSDF(vec3(p + vec2(0.35, 0.0), 0.0), 0.32);
  float d = smin(a, b, 0.35 + 0.2 * sin(uTime));
  float mask = smoothstep(0.01, -0.01, d);
  gl_FragColor = vec4(vec3(mask), 1.0);
}
