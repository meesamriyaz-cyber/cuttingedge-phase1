import { crafts } from './data.js'

const RADIUS   = 220    // cylinder radius — fits hero right column
const PAUSE_MS = 2400   // pause when card front-facing
const SPIN_MS  = 900    // rotation transition ms
const HOVER_LIFT = 72
const HOVER_SCALE = 1.14

let current  = 0
let timer    = null
let spinning = false
let hoveredCard = null

/* ── SVG patterns per craft ─────────────────── */
const patterns = {
  pashmina: `
    <line x1="0" y1="0" x2="200" y2="280" stroke-width="0.6" stroke-dasharray="4 8"/>
    <line x1="200" y1="0" x2="0" y2="280" stroke-width="0.6" stroke-dasharray="4 8"/>
    <circle cx="100" cy="140" r="62" stroke-width="0.7" fill="none"/>
    <circle cx="100" cy="140" r="42" stroke-width="0.5" fill="none" stroke-dasharray="3 6"/>
    <path d="M100,78 Q124,110 100,140 Q76,170 100,202" stroke-width="1" fill="none"/>
    <path d="M68,95 Q100,124 132,95" stroke-width="0.7" fill="none"/>
    <path d="M68,185 Q100,156 132,185" stroke-width="0.7" fill="none"/>`,

  papier: `
    <path d="M100,38 Q138,70 138,100 Q138,140 100,162 Q62,140 62,100 Q62,70 100,38 Z" stroke-width="1" fill="none"/>
    <path d="M100,62 Q122,84 122,108 Q122,132 100,143 Q78,132 78,108 Q78,84 100,62 Z" stroke-width="0.7" fill="none" stroke-dasharray="3 5"/>
    <path d="M62,172 Q100,196 138,172" stroke-width="1" fill="none"/>
    <circle cx="100" cy="100" r="14" stroke-width="1.2" fill="none"/>
    <path d="M38,48 Q60,62 46,84" stroke-width="0.6" fill="none"/>
    <path d="M162,48 Q140,62 154,84" stroke-width="0.6" fill="none"/>
    <path d="M38,232 Q60,218 46,196" stroke-width="0.6" fill="none"/>
    <path d="M162,232 Q140,218 154,196" stroke-width="0.6" fill="none"/>`,

  kani: `
    <rect x="30" y="46" width="140" height="188" stroke-width="0.8" fill="none"/>
    <rect x="42" y="58" width="116" height="164" stroke-width="0.5" fill="none" stroke-dasharray="2 4"/>
    <path d="M30,124 L170,124" stroke-width="0.6" stroke-dasharray="3 5"/>
    <path d="M100,46 L100,234" stroke-width="0.6" stroke-dasharray="3 5"/>
    <polygon points="100,78 120,105 100,132 80,105" stroke-width="1" fill="none"/>
    <polygon points="100,148 120,175 100,202 80,175" stroke-width="0.8" fill="none"/>
    <circle cx="100" cy="105" r="11" stroke-width="0.7" fill="none"/>`,

  walnut: `
    <path d="M30,140 Q62,62 100,46 Q138,62 170,140 Q154,234 100,250 Q46,234 30,140 Z" stroke-width="1" fill="none"/>
    <path d="M50,140 Q74,78 100,66 Q126,78 150,140 Q134,218 100,230 Q66,218 50,140 Z" stroke-width="0.7" fill="none" stroke-dasharray="3 6"/>
    <path d="M62,140 Q78,101 100,89 Q122,101 138,140" stroke-width="0.8" fill="none"/>
    <circle cx="100" cy="140" r="17" stroke-width="1.2" fill="none"/>
    <line x1="83" y1="140" x2="117" y2="140" stroke-width="0.7"/>
    <line x1="100" y1="123" x2="100" y2="157" stroke-width="0.7"/>`,

  crewel: `
    <circle cx="100" cy="78" r="31" stroke-width="0.8" fill="none"/>
    <circle cx="62"  cy="172" r="23" stroke-width="0.8" fill="none"/>
    <circle cx="138" cy="172" r="23" stroke-width="0.8" fill="none"/>
    <path d="M100,47 Q130,62 130,108 Q130,156 100,172 Q70,156 70,108 Q70,62 100,47" stroke-width="0.6" fill="none" stroke-dasharray="2 5"/>
    <path d="M78,101 Q100,124 122,101" stroke-width="1" fill="none"/>
    <path d="M54,163 Q62,188 62,204" stroke-width="0.8" fill="none"/>
    <path d="M146,163 Q138,188 138,204" stroke-width="0.8" fill="none"/>
    <line x1="62" y1="149" x2="138" y2="149" stroke-width="0.5" stroke-dasharray="2 4"/>`,

  copper: `
    <polygon points="100,38 154,70 170,132 142,194 100,218 58,194 30,132 46,70" stroke-width="1" fill="none"/>
    <polygon points="100,58 140,82 154,132 132,182 100,200 68,182 46,132 60,82" stroke-width="0.6" fill="none" stroke-dasharray="3 5"/>
    <circle cx="100" cy="128" r="31" stroke-width="1" fill="none"/>
    <circle cx="100" cy="128" r="19" stroke-width="0.7" fill="none"/>
    <circle cx="100" cy="128" r="6"  stroke-width="1.2" fill="none"/>
    <line x1="100" y1="97" x2="100" y2="159" stroke-width="0.5"/>
    <line x1="69"  y1="128" x2="131" y2="128" stroke-width="0.5"/>`,
}

function buildCardHTML(c) {
  const pat = patterns[c.pattern] || patterns.pashmina
  return `
    <div class="craft-card-art">
      <!-- SVG pattern — visible until Cloudinary image loads -->
      <svg class="craft-card-svg" viewBox="0 0 200 280" xmlns="http://www.w3.org/2000/svg">
        <g stroke="${c.color}" fill="none">${pat}</g>
      </svg>
      <!-- photo injected here by loadCraftImage() once backend responds -->
      <div class="craft-card-photo-overlay"></div>
      <div class="craft-card-content">
        <div class="craft-card-corner tl"></div>
        <div class="craft-card-corner tr"></div>
        <div class="craft-card-corner bl"></div>
        <div class="craft-card-corner br"></div>
        <div class="craft-card-top">
          <span class="craft-card-tag">${c.tag}</span>
          <span class="craft-card-icon" style="color:${c.color}">${c.icon}</span>
        </div>
        <div class="craft-card-center">
          <div class="craft-card-emblem" style="border-color:${c.accent}0.3);color:${c.color}">${c.icon}</div>
        </div>
        <div class="craft-card-foot">
          <h3 class="craft-card-name">${c.name}</h3>
          <p class="craft-card-origin" style="color:${c.color}">${c.origin}</p>
        </div>
      </div>
    </div>`
}

/* ── Fetch Cloudinary image from backend; SVG illustration stays until it arrives ── */
function showCraftImage(url, alt, artEl) {
  if (!url) return false

  const img = new Image()
  img.onload = () => {
    img.alt = alt
    img.className = 'craft-card-photo'
    artEl.insertBefore(img, artEl.firstChild)
    artEl.querySelector('.craft-card-svg')?.classList.add('hidden')
    const card = artEl.closest('.craft-card')
    card?.querySelector('.craft-card-emblem')?.classList.add('hidden')
    card?.classList.add('has-photo')
  }
  img.onerror = () => {
    /* Real photo failed; keep SVG fallback visible. */
  }
  img.src = url
  return true
}

async function loadCraftImage(craft, artEl) {
  if (showCraftImage(craft.photo, craft.name, artEl)) return

  try {
    const res = await fetch(`/api/crafts/${craft.pattern}/image`, { signal: AbortSignal.timeout(5000) })
    if (!res.ok) throw new Error(`status ${res.status}`)
    const data = await res.json()
    const url  = data?.data?.imageUrl || data?.imageUrl
    if (!url) throw new Error('no imageUrl in response')

    /* preload, then inject photo — SVG fades out, photo fades in */
    const img = new Image()
    img.onload = () => {
      img.alt = craft.name
      img.className = 'craft-card-photo'
      artEl.insertBefore(img, artEl.firstChild)
      artEl.querySelector('.craft-card-svg')?.classList.add('hidden')
      const card = artEl.closest('.craft-card')
      card?.querySelector('.craft-card-emblem')?.classList.add('hidden')
      card?.classList.add('has-photo')
    }
    img.onerror = () => { /* Cloudinary URL failed — SVG stays */ }
    img.src = url
  } catch {
    /* backend not running — SVG illustration stays as intended fallback */
  }
}

export function initCarousel() {
  const ring   = document.getElementById('carousel-ring')
  const dots   = document.getElementById('carousel-dots')
  const detail = document.getElementById('carousel-detail')
  if (!ring || !dots) return

  const n    = crafts.length
  const step = 360 / n

  function cardTransform(idx, isHovered = false) {
    const lift = isHovered ? HOVER_LIFT : 0
    const scale = isHovered ? ` scale(${HOVER_SCALE})` : ''
    return `rotateY(${step * idx}deg) translateZ(${RADIUS + lift}px)${scale}`
  }

  function pauseCarousel() {
    clearTimeout(timer)
  }

  function resumeCarousel() {
    if (!hoveredCard) scheduleNext()
  }

  /* ── Build cards with local fallback photos ── */
  crafts.forEach((c, i) => {
    const card = document.createElement('div')
    card.className = 'craft-card'
    card.dataset.index = i
    card.style.background = `linear-gradient(165deg,${c.bg1} 0%,${c.bg2} 100%)`
    card.innerHTML = buildCardHTML(c)
    card.addEventListener('click', () => goTo(i))
    card.addEventListener('mouseenter', () => {
      hoveredCard = card
      pauseCarousel()
      card.classList.add('hovered')
      card.style.transform = cardTransform(i, true)
    })
    card.addEventListener('mouseleave', () => {
      if (hoveredCard === card) hoveredCard = null
      card.classList.remove('hovered')
      card.style.transform = cardTransform(i)
      resumeCarousel()
    })
    ring.appendChild(card)

    const artEl = card.querySelector('.craft-card-art')
    if (artEl) loadCraftImage(c, artEl)

    const dot = document.createElement('button')
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '')
    dot.setAttribute('aria-label', `Go to ${c.name}`)
    dot.addEventListener('click', () => goTo(i))
    dots.appendChild(dot)
  })

  /* ── Layout cards around cylinder ── */
  ring.querySelectorAll('.craft-card').forEach((card, i) => {
    card.style.transform = cardTransform(i)
  })

  /* ── Rotate ring ── */
  function rotateTo(idx, instant = false) {
    ring.style.transition = instant ? 'none' : `transform ${SPIN_MS}ms cubic-bezier(0.4,0,0.2,1)`
    ring.style.transform  = `rotateY(${-step * idx}deg)`
    ring.querySelectorAll('.craft-card').forEach((c, i) => c.classList.toggle('front', i === idx))
    dots.querySelectorAll('.carousel-dot').forEach((d, i) => d.classList.toggle('active', i === idx))
    if (detail) updateDetail(idx)
  }

  function updateDetail(idx) {
    const c = crafts[idx]
    if (detail) {
      detail.style.opacity   = '0'
      detail.style.transform = 'translateY(6px)'
    }
    setTimeout(() => {
      const dtag  = document.getElementById('detail-tag')
      const dname = document.getElementById('detail-name')
      const dori  = document.getElementById('detail-origin')
      const ddesc = document.getElementById('detail-desc')
      if (dtag)  dtag.textContent  = c.tag
      if (dname) dname.textContent = c.name
      if (dori)  { dori.textContent = c.origin; dori.style.color = c.color }
      if (ddesc) ddesc.textContent = c.desc
      if (detail) { detail.style.opacity = '1'; detail.style.transform = 'translateY(0)' }
    }, 200)
    if (detail) detail.style.transition = 'opacity .3s, transform .3s'
  }

  /* ── Auto-advance ── */
  function scheduleNext() {
    clearTimeout(timer)
    timer = setTimeout(() => {
      current = (current + 1) % n
      goTo(current)
    }, PAUSE_MS + SPIN_MS)
  }

  function goTo(idx) {
    if (spinning) return
    pauseCarousel()
    spinning = true
    current  = idx
    rotateTo(idx)
    setTimeout(() => { spinning = false }, SPIN_MS + 60)
    resumeCarousel()
  }

  document.getElementById('carousel-prev')?.addEventListener('click', () => goTo((current - 1 + n) % n))
  document.getElementById('carousel-next')?.addEventListener('click', () => goTo((current + 1) % n))

  let tx = 0
  ring.addEventListener('touchstart', e => { tx = e.touches[0].clientX }, { passive: true })
  ring.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - tx
    if (Math.abs(dx) > 40) goTo(dx < 0 ? (current + 1) % n : (current - 1 + n) % n)
  })

  rotateTo(0, true)
  scheduleNext()
}
