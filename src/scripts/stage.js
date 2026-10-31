/* Loads the 3D world after first paint (scripts/world.js, its own chunk).
   The page works without it: no WebGL, reduced motion, Save-Data and
   low-memory devices get a plain layout (see the inline script in Layout.astro). */

const root = document.documentElement;
const canvas = document.getElementById('stage');

if (canvas && !root.classList.contains('no-stage')) {
  const fail = (err) => {
    console.warn('[stage] falling back to the static page:', err);
    root.classList.add('no-stage');
    window.dispatchEvent(new Event('wt:stage-fail'));
  };
  const go = () => import('./world.js').then((world) => world.start(canvas)).catch(fail);
  /* Start after the first paint instead of waiting up to 1.5s. The world warms
     every shader up front, so that work should overlap the page load, not the
     first scroll. */
  requestAnimationFrame(go);
}
