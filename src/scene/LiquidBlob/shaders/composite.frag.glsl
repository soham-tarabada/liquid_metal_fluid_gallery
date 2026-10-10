precision highp float;

#include ../../shaders/lib/env.glsl

uniform sampler2D uMap;
uniform vec2 uTexelSize;
uniform float uBlurAmount;
uniform float uOpacity;

varying vec2 vUv;

void main() {
  vec4 centre = texture2D(uMap, vUv);

  vec2 offset = uTexelSize * 0.75;
  vec4 blurred = centre * 0.4;
  blurred += texture2D(uMap, vUv + vec2(offset.x, offset.y)) * 0.15;
  blurred += texture2D(uMap, vUv + vec2(-offset.x, offset.y)) * 0.15;
  blurred += texture2D(uMap, vUv + vec2(offset.x, -offset.y)) * 0.15;
  blurred += texture2D(uMap, vUv + vec2(-offset.x, -offset.y)) * 0.15;

  vec4 source = mix(centre, blurred, uBlurAmount);
  float alpha = source.a * uOpacity;

  if (alpha <= 0.002) discard;

  gl_FragColor = vec4(acesFilm(source.rgb), alpha);
}
