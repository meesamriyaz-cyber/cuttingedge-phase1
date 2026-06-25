export function initScrollReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('vis')
          observer.unobserve(entry.target)  /* fire once */
        }
      })
    },
    { threshold: 0.06, rootMargin: '-40px 0px' }
  )

  document.querySelectorAll(
    '.section-header, .stat-item, .story-card'
  ).forEach(el => observer.observe(el))
}
