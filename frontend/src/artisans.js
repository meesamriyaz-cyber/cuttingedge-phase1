import { artisans as staticArtisans } from './data.js'

/* ── colour palette cycling for avatar backgrounds ── */
const HUES = ['#c9a84c', '#a07ab8', '#c48050', '#50a878', '#c47a3a', '#8a7a9a']

function initial(name) {
  return name ? name.split(' ').map(w => w[0]).slice(0, 2).join('') : '?'
}

function craftNames(craftIds) {
  if (!craftIds || craftIds.length === 0) return ''
  return craftIds
    .map(c => (typeof c === 'object' ? c.name : c))
    .filter(Boolean)
    .join(' · ')
}

/* ── Fetch from backend, fall back to static ── */
async function fetchArtisans() {
  try {
    const res = await fetch('/api/artisans/featured', {
      signal: AbortSignal.timeout(4000),
    })
    if (!res.ok) throw new Error('non-2xx')
    const json = await res.json()
    const list = Array.isArray(json.data) ? json.data : []
    if (list.length === 0) throw new Error('empty')
    return list
  } catch {
    return null   /* signal fallback */
  }
}

/* ── Render a single artisan card ── */
function renderCard(a, idx) {
  const hue    = HUES[idx % HUES.length]
  const init   = initial(a.name)
  const crafts = craftNames(a.craftIds)
  const loc    = [a.village, a.district].filter(Boolean).join(', ')
  const exp    = a.yearsOfExperience ? `${a.yearsOfExperience} yrs` : ''
  const bio    = a.biography
    ? a.biography.length > 180
      ? a.biography.slice(0, 177) + '…'
      : a.biography
    : ''
  const awards = a.awards?.length
    ? `<div class="art-awards">${a.awards.slice(0, 2).map(w => `<span>${w}</span>`).join('')}</div>`
    : ''

  const card = document.createElement('div')
  card.className = 'artisan-card'
  card.style.transitionDelay = `${idx * 0.1}s`

  card.innerHTML = `
    <div class="art-avatar-wrap">
      ${a.profilePhoto
        ? `<img class="art-avatar-img" src="${a.profilePhoto}" alt="${a.name}" loading="lazy"
              onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />
           <div class="art-avatar-fallback" style="background:radial-gradient(circle at 35% 35%,${hue}55,${hue}22);color:${hue}" data-hidden>
             ${init}
           </div>`
        : `<div class="art-avatar-fallback" style="background:radial-gradient(circle at 35% 35%,${hue}55,${hue}22);color:${hue}">
             ${init}
           </div>`
      }
    </div>
    <div class="art-info">
      <div class="art-top">
        <span class="art-name">${a.name}</span>
        ${exp ? `<span class="art-exp" style="color:${hue}">${exp}</span>` : ''}
      </div>
      ${loc    ? `<p class="art-meta"><span class="art-pin">📍</span>${loc}</p>` : ''}
      ${crafts ? `<p class="art-crafts" style="color:${hue}">${crafts}</p>` : ''}
      ${bio    ? `<p class="art-bio">${bio}</p>` : ''}
      ${awards}
    </div>
    <span class="art-arrow">→</span>
  `
  return card
}

/* ── Main init ── */
export async function initArtisans() {
  const grid   = document.getElementById('artisans-grid')
  const status = document.getElementById('artisans-status')
  if (!grid) return

  /* skeleton shimmer while loading */
  grid.innerHTML = '<div class="art-loading">Loading artisans…</div>'

  const data = await fetchArtisans()
  const list = data || staticArtisans.map(a => ({
    name: a.name,
    village: a.location?.split(', ')[0] || '',
    district: a.location?.split(', ')[1] || 'Kashmir',
    biography: a.quote,
    yearsOfExperience: parseInt(a.exp),
    craftIds: a.skills?.map(s => ({ name: s })) || [],
    awards: [],
    profilePhoto: null,
  }))

  grid.innerHTML = ''
  if (status) {
    status.textContent = data ? '' : '(showing example profiles — connect the backend to load live artisans)'
    status.style.display = data ? 'none' : 'block'
  }

  list.forEach((a, i) => {
    const card = renderCard(a, i)
    grid.appendChild(card)
  })

  /* scroll reveal */
  const io = new IntersectionObserver(
    entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('vis') }),
    { threshold: 0.06, rootMargin: '-40px 0px' }
  )
  grid.querySelectorAll('.artisan-card').forEach(el => io.observe(el))
}
