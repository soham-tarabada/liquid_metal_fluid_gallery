import { readFileSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { parser } from '@shaderfrog/glsl-parser/index.js'
import { preprocess } from '@shaderfrog/glsl-parser/preprocessor/index.js'

const THREE_VERTEX_PRELUDE = `
uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat3 normalMatrix;
uniform vec3 cameraPosition;
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;
`

const THREE_FRAGMENT_PRELUDE = `
uniform mat4 viewMatrix;
uniform vec3 cameraPosition;
`

const GL_BUILTINS = new Set([
  'gl_Position',
  'gl_PointSize',
  'gl_FragColor',
  'gl_FragData',
  'gl_FragCoord',
  'gl_PointCoord',
  'gl_FrontFacing',
  'gl_DepthRange',
  'gl_MaxVertexAttribs',
  'gl_MaxDrawBuffers',
])

function resolveIncludes(file, seen = new Set()) {
  const source = readFileSync(file, 'utf8')
  return source
    .split('\n')
    .map((line) => {
      const match = line.match(/^\s*#include\s+["']?([^"'\s]+)["']?\s*$/)
      if (!match) return line
      const target = resolve(dirname(file), match[1])
      if (!existsSync(target)) throw new Error(`missing include: ${match[1]} (from ${file})`)
      if (seen.has(target)) return ''
      seen.add(target)
      return resolveIncludes(target, seen)
    })
    .join('\n')
}

const TARGETS = [
  { file: 'src/scene/LiquidBlob/shaders/raymarch.vert.glsl', stage: 'vertex', defines: {} },
  {
    file: 'src/scene/LiquidBlob/shaders/raymarch.frag.glsl',
    stage: 'fragment',
    defines: { MAX_BALLS: 6, MAX_STEPS: 80 },
  },
  { file: 'src/scene/LiquidBlob/shaders/composite.vert.glsl', stage: 'vertex', defines: {} },
  { file: 'src/scene/LiquidBlob/shaders/composite.frag.glsl', stage: 'fragment', defines: {} },
  { file: 'src/scene/shaders/probe.vert.glsl', stage: 'vertex', defines: {} },
  { file: 'src/scene/shaders/probe.frag.glsl', stage: 'fragment', defines: {} },
]

let failures = 0

for (const target of TARGETS) {
  const label = target.file.replace('src/scene/', '')
  let issues = []

  try {
    const included = resolveIncludes(resolve(target.file))
    const defineBlock = Object.entries(target.defines)
      .map(([key, value]) => `#define ${key} ${value}`)
      .join('\n')
    const prelude = target.stage === 'vertex' ? THREE_VERTEX_PRELUDE : THREE_FRAGMENT_PRELUDE
    const full = `${defineBlock}\nprecision highp float;\n${prelude}\n${included}`

    const preprocessed = preprocess(full, { preserve: { version: () => true } })
    const ast = parser.parse(preprocessed, { quiet: true })

    for (const scope of ast.scopes) {
      for (const [name, binding] of Object.entries(scope.bindings ?? {})) {
        if (binding.declaration) continue
        if (GL_BUILTINS.has(name)) continue
        issues.push(`undeclared identifier "${name}" (scope: ${scope.name})`)
      }
    }
  } catch (error) {
    issues.push(`parse error: ${String(error.message).split('\n')[0]}`)
  }

  if (issues.length === 0) {
    console.log(`  PASS  ${label}`)
  } else {
    failures += 1
    console.log(`  FAIL  ${label}`)
    for (const issue of issues) console.log(`        ${issue}`)
  }
}

console.log(failures === 0 ? '\nAll shaders passed.' : `\n${failures} shader(s) failed.`)
process.exit(failures === 0 ? 0 : 1)
