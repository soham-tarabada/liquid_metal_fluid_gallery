precision highp float;

#include ../../shaders/lib/sdf.glsl
#include ../../shaders/lib/env.glsl

uniform vec4 uMetaballs[MAX_BALLS];
uniform int uCount;
uniform float uSmoothness;
uniform vec2 uResolution;
uniform vec3 uCameraPos;
uniform float uFocalLength;
uniform float uMaxDistance;
uniform float uSurfaceEpsilon;
uniform float uEdgeSoftness;
uniform sampler2D uEnvMap;
uniform float uEnvIntensity;
uniform vec3 uTint;
uniform vec3 uFresnelTint;
uniform float uFresnelPower;
uniform vec3 uLightDir;
uniform float uLightIntensity;
uniform float uSpecularSharpness;

varying vec2 vUv;

float sceneSDF(vec3 p) {
  float d = sphereSDF(p - uMetaballs[0].xyz, uMetaballs[0].w);

  for (int i = 1; i < MAX_BALLS; i++) {
    if (i >= uCount) break;
    d = smin(d, sphereSDF(p - uMetaballs[i].xyz, uMetaballs[i].w), uSmoothness);
  }

  return d;
}

vec3 estimateNormal(vec3 p) {
  vec2 e = vec2(1.0, -1.0) * 0.5773 * uSurfaceEpsilon * 2.0;
  return normalize(
    e.xyy * sceneSDF(p + e.xyy) +
    e.yyx * sceneSDF(p + e.yyx) +
    e.yxy * sceneSDF(p + e.yxy) +
    e.xxx * sceneSDF(p + e.xxx)
  );
}

void main() {
  vec2 ndc = vUv * 2.0 - 1.0;
  ndc.x *= uResolution.x / uResolution.y;

  vec3 ro = uCameraPos;
  vec3 rd = normalize(vec3(ndc, -uFocalLength));

  float t = 0.0;
  float nearest = 1e9;
  bool hit = false;

  for (int i = 0; i < MAX_STEPS; i++) {
    vec3 p = ro + rd * t;
    float d = sceneSDF(p);
    nearest = min(nearest, d);

    if (d < uSurfaceEpsilon) {
      hit = true;
      break;
    }

    t += d;

    if (t > uMaxDistance) break;
  }

  if (!hit) {
    float coverage = 1.0 - smoothstep(0.0, uEdgeSoftness, nearest);
    if (coverage <= 0.004) discard;
    gl_FragColor = vec4(uFresnelTint * uLightIntensity, coverage);
    return;
  }

  vec3 p = ro + rd * t;
  vec3 normal = estimateNormal(p);
  vec3 viewDir = -rd;
  vec3 reflected = reflect(rd, normal);

  vec3 env = sampleEnv(uEnvMap, reflected) * uEnvIntensity;

  float ndv = clamp(dot(normal, viewDir), 0.0, 1.0);
  float fresnel = fresnelSchlick(ndv, 0.08, uFresnelPower);

  vec3 lightDir = normalize(uLightDir);
  vec3 halfway = normalize(lightDir + viewDir);
  float specular = pow(max(dot(normal, halfway), 0.0), uSpecularSharpness);

  vec3 color = env * uTint;
  color += uFresnelTint * fresnel;
  color += specular * uLightIntensity;

  gl_FragColor = vec4(color, 1.0);
}
