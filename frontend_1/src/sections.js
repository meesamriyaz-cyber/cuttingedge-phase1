import { stories } from './data.js'

export function renderStories() {
  const grid = document.getElementById('stories-grid')
  if (!grid) return
  stories.forEach((s, i) => {
    const card = document.createElement('div')
    card.className = 'story-card'
    card.style.transitionDelay = `${i * 0.1}s`
    card.innerHTML = `
      <div class="story-bar" style="background:${s.accent}"></div>
      <div class="story-meta">
        <span class="story-cat" style="color:${s.accent}">${s.cat}</span>
        <span class="story-date">${s.date}</span>
      </div>
      <h3 class="story-title">${s.title}</h3>
      <p class="story-excerpt">${s.excerpt}</p>
      <div class="story-footer">
        <span class="story-read">${s.read} read</span>
        <span class="story-cta" style="color:${s.accent}">Read →</span>
      </div>
    `
    grid.appendChild(card)
  })
}
