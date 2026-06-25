import * as THREE from 'three'

export function initBackground() {
  const canvas = document.getElementById('bg-canvas')
  if (!canvas) return

  /* ── Try Three.js WebGL first ─────────────────────────────────── */
  try {
    initThree(canvas)
  } catch (e) {
    /* WebGL unavailable (sandboxed env) — fall back to 2D canvas */
    init2D(canvas)
  }
}

/* ══════════════════════════════════════════════════════════════════
   THREE.JS  —  full WebGL renderer
══════════════════════════════════════════════════════════════════ */
function initThree(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  if (!renderer.getContext()) throw new Error('no webgl')

  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  renderer.setSize(innerWidth, innerHeight)
  renderer.setClearColor(0x000000, 0)

  const scene  = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.1, 1000)
  camera.position.z = 5

  /* — Gold particle field — */
  const COUNT = 1800
  const pos  = new Float32Array(COUNT * 3)
  const size = new Float32Array(COUNT)

  for (let i = 0; i < COUNT; i++) {
    pos[i * 3]     = (Math.random() - 0.5) * 30
    pos[i * 3 + 1] = (Math.random() - 0.5) * 30
    pos[i * 3 + 2] = (Math.random() - 0.5) * 15
    size[i] = Math.random() * 2.4 + 0.4
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geo.setAttribute('size',     new THREE.BufferAttribute(size, 1))

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime:  { value: 0 },
      uColor: { value: new THREE.Color(0xc9a84c) },
    },
    vertexShader: `
      attribute float size;
      uniform float uTime;
      varying float vAlpha;
      void main() {
        vAlpha = 0.12 + 0.48 * abs(sin(uTime * 0.4 + position.x * 0.3 + position.y * 0.2));
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (300.0 / -mv.z);
        gl_Position  = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - vec2(0.5));
        if (d > 0.5) discard;
        float s = pow(1.0 - d * 2.0, 2.0);
        gl_FragColor = vec4(uColor, s * vAlpha);
      }
    `,
    transparent: true,
    depthWrite:  false,
    blending:    THREE.AdditiveBlending,
  })

  const particles = new THREE.Points(geo, mat)
  scene.add(particles)

  /* — Floating wireframe gems (octahedra / icosahedra) — */
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0xc9a84c, wireframe: true, transparent: true, opacity: 0.11,
  })
  const gemConfigs = [
    { G: THREE.OctahedronGeometry,  args: [0.6],    x: -6,   y:  2,  z: -2, spd: 0.003 },
    { G: THREE.OctahedronGeometry,  args: [0.35],   x:  5.5, y: -2,  z: -1, spd: 0.005 },
    { G: THREE.IcosahedronGeometry, args: [0.5, 0], x:  3,   y:  3,  z: -3, spd: 0.004 },
    { G: THREE.OctahedronGeometry,  args: [0.25],   x: -4,   y: -3,  z: -1, spd: 0.007 },
    { G: THREE.TetrahedronGeometry, args: [0.45],   x:  7,   y:  1,  z: -4, spd: 0.003 },
    { G: THREE.IcosahedronGeometry, args: [0.3, 0], x: -7,   y: -1,  z: -2, spd: 0.006 },
  ]

  const gems = gemConfigs.map(cfg => {
    const mesh = new THREE.Mesh(new cfg.G(...cfg.args), wireMat.clone())
    mesh.position.set(cfg.x, cfg.y, cfg.z)
    mesh.userData = { spd: cfg.spd, initY: cfg.y }
    scene.add(mesh)
    return mesh
  })

  /* — Subtle perspective grid — */
  const grid = new THREE.GridHelper(40, 40, 0xc9a84c, 0xc9a84c)
  grid.material.transparent = true
  grid.material.opacity     = 0.035
  grid.position.y = -6
  scene.add(grid)

  /* — Mouse parallax — */
  let mx = 0, my = 0
  window.addEventListener('mousemove', e => {
    mx = (e.clientX / innerWidth  - 0.5) * 2
    my = (e.clientY / innerHeight - 0.5) * 2
  })

  /* — Resize — */
  window.addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(innerWidth, innerHeight)
  })

  /* — Animate — */
  const clock = new THREE.Clock()
  let rafId

  ;(function loop() {
    rafId = requestAnimationFrame(loop)
    const t = clock.getElapsedTime()

    mat.uniforms.uTime.value = t
    particles.rotation.y = t * 0.018
    particles.rotation.x = t * 0.007

    camera.position.x += (mx * 0.4 - camera.position.x) * 0.03
    camera.position.y += (-my * 0.3 - camera.position.y) * 0.03
    camera.lookAt(scene.position)

    gems.forEach((m, i) => {
      m.rotation.x += m.userData.spd
      m.rotation.y += m.userData.spd * 1.3
      m.position.y  = m.userData.initY + Math.sin(t * 0.5 + i) * 0.3
    })

    renderer.render(scene, camera)
  })()
}

/* ══════════════════════════════════════════════════════════════════
   2D CANVAS FALLBACK  —  same visual, no WebGL required
══════════════════════════════════════════════════════════════════ */
function init2D(canvas) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  let W = innerWidth, H = innerHeight
  canvas.width = W; canvas.height = H

  let mx = 0, my = 0, rafId

  const PARTICLES = Array.from({ length: 220 }, () => ({
    x: Math.random() * W, y: Math.random() * H,
    z: Math.random() * 600 + 100,
    r: Math.random() * 1.5 + 0.3,
    speed: Math.random() * 0.12 + 0.04,
    phase: Math.random() * Math.PI * 2,
    drift: (Math.random() - 0.5) * 0.15,
  }))

  const SHAPES = [
    { bx: 0.10, by: 0.20, sides: 6, r: 55, rot: 0,   spd: 0.0038, fi: 0 },
    { bx: 0.88, by: 0.15, sides: 8, r: 38, rot: 1,   spd: 0.006,  fi: 1 },
    { bx: 0.75, by: 0.75, sides: 6, r: 48, rot: 2,   spd: 0.003,  fi: 2 },
    { bx: 0.08, by: 0.72, sides: 4, r: 32, rot: 0.5, spd: 0.007,  fi: 3 },
    { bx: 0.50, by: 0.08, sides: 3, r: 28, rot: 0.2, spd: 0.005,  fi: 4 },
  ]

  function poly(cx, cy, sides, r, rot, alpha) {
    ctx.beginPath()
    for (let i = 0; i < sides; i++) {
      const a = rot + (i / sides) * Math.PI * 2
      i === 0 ? ctx.moveTo(cx + r * Math.cos(a), cy + r * Math.sin(a))
              : ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a))
    }
    ctx.closePath()
    ctx.strokeStyle = `rgba(201,168,76,${alpha})`
    ctx.lineWidth = 0.8; ctx.stroke()
  }

  let t = 0
  ;(function loop() {
    rafId = requestAnimationFrame(loop)
    ctx.clearRect(0, 0, W, H)

    /* glow */
    const g = ctx.createRadialGradient(W/2, H*.55, 0, W/2, H*.55, H*.7)
    g.addColorStop(0, 'rgba(201,168,76,0.045)'); g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)

    /* grid */
    const vx = W/2 + mx*18, vy = H*.6
    ctx.strokeStyle = 'rgba(201,168,76,0.035)'; ctx.lineWidth = 0.5
    for (let i = 0; i <= 14; i++) {
      const bx = i*(W/14)
      ctx.beginPath(); ctx.moveTo(bx, H)
      ctx.lineTo(vx+(bx-vx)*0.08, vy); ctx.stroke()
    }
    for (let j = 1; j <= 8; j++) {
      const t2 = j/8, y = vy+(H-vy)*t2, f = 1-t2+t2*0.08
      ctx.beginPath(); ctx.moveTo(vx+(0-vx)*f, y)
      ctx.lineTo(vx+(W-vx)*f, y); ctx.stroke()
    }

    /* particles */
    for (const p of PARTICLES) {
      const d = 1 - p.z/800
      const px = p.x + mx*22*d + Math.sin(t*.5+p.phase)*.4
      const py = p.y + my*14*d
      const a  = 0.08 + 0.42*(0.5+0.5*Math.sin(t*.8+p.phase))
      const sz = p.r*(0.7+0.5*(p.z/700))
      const gw = ctx.createRadialGradient(px,py,0,px,py,sz*3.5)
      gw.addColorStop(0,`rgba(201,168,76,${a})`); gw.addColorStop(1,'rgba(201,168,76,0)')
      ctx.beginPath(); ctx.arc(px,py,sz*3.5,0,Math.PI*2)
      ctx.fillStyle=gw; ctx.fill()
      ctx.beginPath(); ctx.arc(px,py,sz,0,Math.PI*2)
      ctx.fillStyle=`rgba(232,201,122,${a*1.6})`; ctx.fill()
      p.y -= p.speed; p.x += p.drift
      if (p.y < -5) p.y = H+5
      if (p.x < -5) p.x = W+5
      if (p.x > W+5) p.x = -5
    }

    /* wireframe shapes */
    for (const s of SHAPES) {
      s.rot += s.spd
      const cx = s.bx*W + mx*12
      const cy = s.by*H + Math.sin(t*.4+s.fi)*18 + my*8
      poly(cx,cy,s.sides,s.r,s.rot,0.10)
      poly(cx,cy,s.sides,s.r*.6,-s.rot*1.2,0.06)
      ctx.beginPath(); ctx.arc(cx,cy,2,0,Math.PI*2)
      ctx.fillStyle='rgba(201,168,76,0.18)'; ctx.fill()
    }

    t += 0.016
  })()

  window.addEventListener('mousemove', e => { mx=e.clientX/W-.5; my=e.clientY/H-.5 })
  window.addEventListener('resize', () => {
    W=innerWidth; H=innerHeight; canvas.width=W; canvas.height=H
  })
}
