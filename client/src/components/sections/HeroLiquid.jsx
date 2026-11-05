import { useEffect, useRef } from 'react'

const VERT = 'attribute vec2 a; void main() { gl_Position = vec4(a, 0., 1.); }'

// Marbled ink: sine waves bend space into swirls, soft noise on top of that picks the tone,
// and layered tone bands give the black, deep, mid and pale folds. A faint line traces one edge as a filament.
const FRAG = `
precision highp float;
uniform vec2 res;
uniform float t;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * f * (f * (f * 6. - 15.) + 10.);
  return mix(mix(hash(i), hash(i + vec2(1., 0.)), f.x), mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), f.x), f.y);
}

void main() {
  vec2 p = gl_FragCoord.xy / res.y * 5. + 12.;
  float T = t * .05;
  for (int i = 1; i < 5; i++) {
    float k = float(i);
    float f = .9 * (1. + k * .5);
    p += vec2(sin(p.y * f + T * (1. + k * .2) + k * 1.3), cos(p.x * f - T * 1.1 + k * 2.1)) * 1.3 / k;
  }
  vec2 q = vec2(noise(p * .6 + vec2(1.7, 9.2) + T * .3), noise(p * .6 + vec2(8.3, 2.8) - T * .3));
  float e = noise(p * .6 + 1.5 * q);

  vec3 col = vec3(0.);
  col = mix(col, vec3(.05), smoothstep(.24, .42, e));
  col = mix(col, vec3(.16), smoothstep(.4, .47, e));
  col = mix(col, vec3(.34), smoothstep(.5, .56, e));
  col = mix(col, vec3(.52 + .22 * q.x), smoothstep(.57, .68, e));
  col += smoothstep(.03, 0., abs(e - .33)) * .035;
  gl_FragColor = vec4(col, 1.);
}`

export default function HeroLiquid() {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    const gl = canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'low-power' })
    if (!gl) return undefined // Without WebGL the planet just stays black

    const program = gl.createProgram()
    for (const [type, src] of [[gl.VERTEX_SHADER, VERT], [gl.FRAGMENT_SHADER, FRAG]]) {
      const shader = gl.createShader(type)
      gl.shaderSource(shader, src)
      gl.compileShader(shader)
      gl.attachShader(program, shader)
    }
    gl.bindAttribLocation(program, 0, 'a')
    gl.linkProgram(program)
    gl.useProgram(program)
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
    const uRes = gl.getUniformLocation(program, 'res')
    const uTime = gl.getUniformLocation(program, 't')

    const still = matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    let last = 0

    const draw = (now) => {
      // The image is soft, so a smaller buffer scaled up by CSS looks the same and costs far less
      const scale = Math.min(1, 1200 / (canvas.clientWidth || 1))
      const w = Math.round(canvas.clientWidth * scale)
      const h = Math.round(canvas.clientHeight * scale)
      if (!w || !h) return
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
        gl.viewport(0, 0, w, h)
      }
      gl.uniform2f(uRes, w, h)
      gl.uniform1f(uTime, 40 + (still ? 0 : now / 1000))
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }
    const tick = (now) => {
      raf = requestAnimationFrame(tick)
      if (now - last > 33) {
        last = now
        draw(now)
      }
    }

    draw(performance.now())
    // Only animate while on screen
    const io = new IntersectionObserver(([e]) => {
      cancelAnimationFrame(raf)
      if (e.isIntersecting && !still) raf = requestAnimationFrame(tick)
    })
    io.observe(canvas)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div aria-hidden="true" className="hero-liquid hidden lg:block">
      <canvas ref={ref} className="block w-full h-full" />
    </div>
  )
}
