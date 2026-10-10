#define ENV_PI 3.141592653589793

vec2 equirectUv(vec3 dir) {
  return vec2(
    atan(dir.z, dir.x) * (0.5 / ENV_PI) + 0.5,
    asin(clamp(dir.y, -1.0, 1.0)) * (1.0 / ENV_PI) + 0.5
  );
}

vec3 sampleEnv(sampler2D envMap, vec3 dir) {
  return texture2D(envMap, equirectUv(dir)).rgb;
}

float fresnelSchlick(float cosTheta, float f0, float power) {
  return f0 + (1.0 - f0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), power);
}

vec3 acesFilm(vec3 x) {
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
}
