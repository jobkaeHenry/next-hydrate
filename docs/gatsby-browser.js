// gatsby-browser.js
import './src/styles/global.css'

export const onClientEntry = () => {
  // Polyfill for older browsers if needed
  if (typeof window.IntersectionObserver === 'undefined') {
    import('intersection-observer')
  }
}
