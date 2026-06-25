import { artisans as staticArtisans } from './data.js'

const API_BASE = '/api/v1'
const HUES = ['#c9a84c', '#a07ab8', '#c48050', '#50a878', '#c47a3a', '#8a7a9a']
const artisanCache = new Map()

let detailRouterReady = false
let currentGallery = []

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function slugify(value = '') {
  return String(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function initial(name) {
  return name ? name.split(' ').map(w => w[0]).slice(0, 2).join('') : '?'
}

function craftNames(craftIds) {
  if (!craftIds || craftIds.length === 0) return ''
  return craftIds
    .map(c => (typeof c === 'object' ? c.name : c))
    .filter(Boolean)
    .join(' / ')
}

function fetchSignal(timeout = 5000) {
  return AbortSignal.timeout ? AbortSignal.timeout(timeout) : undefined
}

async function fetchJson(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    signal: fetchSignal(),
  })

  if (!res.ok) throw new Error('Request failed')

  const json = await res.json()
  if (!json.success) throw new Error(json.message || 'API error')

  return json.data
}

async function fetchArtisans() {
  try {
    const list = await fetchJson('/artisans/featured')
    if (!Array.isArray(list) || list.length === 0) throw new Error('empty')
    return list
  } catch {
    return null
  }
}

async function fetchArtisanBySlug(slug) {
  try {
    return await fetchJson(`/artisans/slug/${encodeURIComponent(slug)}`)
  } catch {
    return artisanCache.get(slug) || null
  }
}

function toStaticArtisan(artisan) {
  return {
    name: artisan.name,
    slug: slugify(artisan.name),
    village: artisan.location?.split(', ')[0] || '',
    district: artisan.location?.split(', ')[1] || 'Kashmir',
    biography: artisan.quote,
    yearsOfExperience: parseInt(artisan.exp, 10),
    craftIds: artisan.skills?.map(skill => ({ name: skill, slug: slugify(skill) })) || [],
    awards: [],
    profilePhoto: null,
    artworkImages: []
  }
}

function rememberArtisans(list) {
  list.forEach(artisan => {
    const slug = artisan.slug || slugify(artisan.name)
    artisanCache.set(slug, {
      ...artisan,
      slug
    })
  })
}

function uniqueImages(images) {
  const seen = new Set()

  return images.filter(image => {
    if (!image?.url || seen.has(image.url)) return false
    seen.add(image.url)
    return true
  })
}

function craftKeys(value) {
  if (!value) return []

  if (typeof value === 'object') {
    return [value._id, value.id, value.slug, value.name]
      .filter(Boolean)
      .map(item => String(item))
  }

  return [String(value)]
}

function imageBelongsToArtisanCraft(image, artisanCraftKeySet) {
  if (!image.craftId) return true

  return craftKeys(image.craftId)
    .some(key => artisanCraftKeySet.has(key))
}

function galleryFor(artisan) {
  const artisanCraftKeySet = new Set(
    (artisan.craftIds || []).flatMap(craftKeys)
  )

  return uniqueImages(
    (artisan.artworkImages || [])
      .filter(image => image?.url)
      .filter(image => imageBelongsToArtisanCraft(image, artisanCraftKeySet))
      .map(image => ({
        url: image.url,
        caption: image.caption || image.craftId?.name || 'Artwork',
        craftName: image.craftId?.name || ''
      }))
  )
}

function renderAvatar(artisan, hue, sizeClass = '') {
  const init = escapeHtml(initial(artisan.name))
  const name = escapeHtml(artisan.name)

  if (artisan.profilePhoto) {
    return `
      <img class="art-avatar-img ${sizeClass}" src="${escapeHtml(artisan.profilePhoto)}" alt="${name}" loading="lazy"
        onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />
      <div class="art-avatar-fallback ${sizeClass}" style="background:radial-gradient(circle at 35% 35%,${hue}55,${hue}22);color:${hue}" data-hidden>
        ${init}
      </div>
    `
  }

  return `
    <div class="art-avatar-fallback ${sizeClass}" style="background:radial-gradient(circle at 35% 35%,${hue}55,${hue}22);color:${hue}">
      ${init}
    </div>
  `
}

function renderCard(artisan, idx) {
  const hue = HUES[idx % HUES.length]
  const slug = artisan.slug || slugify(artisan.name)
  const crafts = craftNames(artisan.craftIds)
  const loc = [artisan.village, artisan.district].filter(Boolean).join(', ')
  const exp = artisan.yearsOfExperience ? `${artisan.yearsOfExperience} yrs` : ''
  const bio = artisan.biography
    ? artisan.biography.length > 180
      ? `${artisan.biography.slice(0, 177)}...`
      : artisan.biography
    : ''
  const awards = artisan.awards?.length
    ? `<div class="art-awards">${artisan.awards.slice(0, 2).map(w => `<span>${escapeHtml(w)}</span>`).join('')}</div>`
    : ''

  const card = document.createElement('a')
  card.className = 'artisan-card'
  card.href = `#artisan/${encodeURIComponent(slug)}`
  card.style.transitionDelay = `${idx * 0.1}s`
  card.setAttribute('aria-label', `View ${artisan.name}`)

  card.innerHTML = `
    <div class="art-avatar-wrap">
      ${renderAvatar(artisan, hue)}
    </div>
    <div class="art-info">
      <div class="art-top">
        <span class="art-name">${escapeHtml(artisan.name)}</span>
        ${exp ? `<span class="art-exp" style="color:${hue}">${escapeHtml(exp)}</span>` : ''}
      </div>
      ${loc ? `<p class="art-meta">${escapeHtml(loc)}</p>` : ''}
      ${crafts ? `<p class="art-crafts" style="color:${hue}">${escapeHtml(crafts)}</p>` : ''}
      ${bio ? `<p class="art-bio">${escapeHtml(bio)}</p>` : ''}
      ${awards}
    </div>
    <span class="art-arrow" aria-hidden="true">&rarr;</span>
  `

  return card
}

function renderLoading(slug) {
  const detail = document.getElementById('artisan-detail')
  if (!detail) return

  detail.hidden = false
  detail.innerHTML = `
    <div class="detail-shell">
      <a class="detail-back" href="#artisans">&larr; Back to artisans</a>
      <div class="art-loading">Loading artisan profile...</div>
    </div>
  `

  document.body.classList.add('detail-open')
  document.title = slug ? `Loading ${slug} | Kashmir Arts & Crafts` : 'Artisan | Kashmir Arts & Crafts'
}

function renderDetailError() {
  const detail = document.getElementById('artisan-detail')
  if (!detail) return

  detail.hidden = false
  detail.innerHTML = `
    <div class="detail-shell">
      <a class="detail-back" href="#artisans">&larr; Back to artisans</a>
      <div class="detail-empty">
        <p class="section-eyebrow">Artisan</p>
        <h1>Profile unavailable</h1>
        <p>The artisan profile could not be loaded right now.</p>
      </div>
    </div>
  `
}

function renderGallery(gallery) {
  if (gallery.length === 0) {
    return `
      <div class="detail-empty">
        <p class="section-eyebrow">Gallery</p>
        <h2>Artwork coming soon</h2>
        <p>Add this artisan's own Cloudinary images to artworkImages to showcase selected work.</p>
      </div>
    `
  }

  return `
    <div class="work-gallery">
      ${gallery.map((image, index) => `
        <button class="work-tile" type="button" data-gallery-index="${index}" aria-label="Open ${escapeHtml(image.caption)}">
          <img src="${escapeHtml(image.url)}" alt="${escapeHtml(image.caption)}" loading="lazy"
            onerror="this.closest('.work-tile').classList.add('image-missing')" />
          <span class="work-caption">
            <span>${escapeHtml(image.caption)}</span>
            ${image.craftName ? `<small>${escapeHtml(image.craftName)}</small>` : ''}
          </span>
        </button>
      `).join('')}
    </div>
  `
}

function renderArtisanDetail(artisan) {
  const detail = document.getElementById('artisan-detail')
  if (!detail) return

  const hue = HUES[Math.abs((artisan.name || '').length) % HUES.length]
  const loc = [artisan.village, artisan.district].filter(Boolean).join(', ')
  const crafts = (artisan.craftIds || [])
    .map(craft => typeof craft === 'object' ? craft.name : craft)
    .filter(Boolean)
  const gallery = galleryFor(artisan)

  currentGallery = gallery
  detail.hidden = false
  detail.innerHTML = `
    <div class="detail-shell">
      <a class="detail-back" href="#artisans">&larr; Back to artisans</a>

      <div class="artisan-detail-hero">
        <div class="detail-copy">
          <p class="section-eyebrow">${escapeHtml(loc || 'Kashmir artisan')}</p>
          <h1>${escapeHtml(artisan.name)}</h1>
          ${artisan.biography ? `<p class="detail-bio">${escapeHtml(artisan.biography)}</p>` : ''}

          <div class="detail-facts">
            ${artisan.yearsOfExperience ? `<span>${escapeHtml(artisan.yearsOfExperience)} years of practice</span>` : ''}
            ${crafts.map(craft => `<span>${escapeHtml(craft)}</span>`).join('')}
          </div>

          ${artisan.awards?.length ? `
            <div class="detail-awards">
              ${artisan.awards.map(award => `<span>${escapeHtml(award)}</span>`).join('')}
            </div>
          ` : ''}
        </div>

        <div class="detail-portrait">
          ${renderAvatar(artisan, hue, 'detail-avatar')}
        </div>
      </div>

      <section class="detail-gallery-section">
        <div class="detail-section-head">
          <p class="section-eyebrow">Selected Work</p>
          <h2>Gallery</h2>
        </div>
        ${renderGallery(gallery)}
      </section>
    </div>

    <div class="work-lightbox" id="work-lightbox" hidden>
      <button class="lightbox-close" type="button" data-lightbox-close aria-label="Close gallery">&times;</button>
      <img id="lightbox-image" alt="" />
      <p id="lightbox-caption"></p>
    </div>
  `

  document.body.classList.add('detail-open')
  document.title = `${artisan.name} | Kashmir Arts & Crafts`
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function openLightbox(index) {
  const image = currentGallery[index]
  const lightbox = document.getElementById('work-lightbox')
  const lightboxImage = document.getElementById('lightbox-image')
  const lightboxCaption = document.getElementById('lightbox-caption')

  if (!image || !lightbox || !lightboxImage || !lightboxCaption) return

  lightboxImage.src = image.url
  lightboxImage.alt = image.caption
  lightboxCaption.textContent = [image.caption, image.craftName].filter(Boolean).join(' / ')
  lightbox.hidden = false
}

function closeLightbox() {
  const lightbox = document.getElementById('work-lightbox')
  if (lightbox) lightbox.hidden = true
}

async function openArtisanFromHash() {
  const hash = window.location.hash

  if (!hash.startsWith('#artisan/')) {
    document.body.classList.remove('detail-open')
    document.title = 'Kashmir Arts & Crafts - by Cutting Edge Enterprises'
    const detail = document.getElementById('artisan-detail')
    if (detail) detail.hidden = true
    closeLightbox()
    return
  }

  const slug = decodeURIComponent(hash.replace('#artisan/', ''))
  renderLoading(slug)

  const artisan = await fetchArtisanBySlug(slug)
  if (!artisan) {
    renderDetailError()
    return
  }

  rememberArtisans([artisan])
  renderArtisanDetail({
    ...artisan,
    slug: artisan.slug || slug
  })
}

function initDetailRouting() {
  if (detailRouterReady) return
  detailRouterReady = true

  window.addEventListener('hashchange', openArtisanFromHash)
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeLightbox()
  })

  const detail = document.getElementById('artisan-detail')
  if (detail) {
    detail.addEventListener('click', event => {
      const tile = event.target.closest('[data-gallery-index]')
      const close = event.target.closest('[data-lightbox-close]')
      const lightbox = event.target.id === 'work-lightbox'

      if (tile) openLightbox(Number(tile.dataset.galleryIndex))
      if (close || lightbox) closeLightbox()
    })
  }

  openArtisanFromHash()
}

export async function initArtisans() {
  const grid = document.getElementById('artisans-grid')
  const status = document.getElementById('artisans-status')
  if (!grid) return

  grid.innerHTML = '<div class="art-loading">Loading artisans...</div>'

  const data = await fetchArtisans()
  const list = data || staticArtisans.map(toStaticArtisan)

  rememberArtisans(list)

  grid.innerHTML = ''
  if (status) {
    status.textContent = data ? '' : '(showing example profiles - connect the backend to load live artisans)'
    status.style.display = data ? 'none' : 'block'
  }

  list.forEach((artisan, i) => {
    grid.appendChild(renderCard(artisan, i))
  })

  const io = new IntersectionObserver(
    entries => entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('vis')
    }),
    { threshold: 0.06, rootMargin: '-40px 0px' }
  )

  grid.querySelectorAll('.artisan-card').forEach(el => io.observe(el))
  initDetailRouting()
}
