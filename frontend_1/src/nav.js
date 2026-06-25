export function initNav() {
  const navbar = document.getElementById('navbar')
  const hamburger = document.querySelector('.hamburger')
  const mobileMenu = document.querySelector('.mobile-menu')

  /* Scroll → compact */
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40)
  }, { passive: true })

  /* Hamburger */
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open')
    mobileMenu.classList.toggle('open')
  })

  /* Close mobile menu on link click */
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('open')
      mobileMenu.classList.remove('open')
    })
  })
}
