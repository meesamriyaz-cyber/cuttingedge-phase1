const WORDS = ['Heritage', 'Artistry', 'Craftsmanship', 'Tradition', 'Excellence']

export function initHero() {
  initRotatingWord()
  initParallax()
}

function initRotatingWord() {
  const el = document.getElementById('rotating-word')
  if (!el) return
  let idx = 0

  setInterval(() => {
    el.style.opacity = '0'
    el.style.transform = 'translateY(10px)'
    setTimeout(() => {
      idx = (idx + 1) % WORDS.length
      el.textContent = WORDS[idx]
      el.style.opacity = '1'
      el.style.transform = 'translateY(0)'
    }, 280)
  }, 2800)
}

function initParallax() {
  const content = document.querySelector('.hero-content')
  if (!content) return

  let ticking = false

  window.addEventListener('scroll', () => {
    if (ticking) return
    requestAnimationFrame(() => {
      const hero = document.getElementById('hero')
      const h    = hero ? hero.offsetHeight : window.innerHeight
      const progress = Math.min(window.scrollY / h, 1)
      const y  = progress * 28   // % parallax drift
      const op = Math.max(1 - progress / 0.55, 0)
      content.style.transform = `translateY(${y}%)`
      content.style.opacity   = op
      ticking = false
    })
    ticking = true
  }, { passive: true })
}
