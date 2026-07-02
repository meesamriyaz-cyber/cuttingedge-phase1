import './style.css'
import { initNav }          from './nav.js'
import { initHero }         from './hero.js'
import { initCarousel }     from './carousel.js'
import { renderStories }    from './sections.js'
import { initArtisans }     from './artisans.js'
import { initScrollReveal } from './scroll.js'

/* render static DOM content */
renderStories()

/* boot all modules */
initNav()
initHero()
initCarousel()
initScrollReveal()

/* artisans — async, tries API first */
initArtisans()
