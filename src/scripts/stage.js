/* Loads the 3D world after the Hero text entrance animation completes.
   The page works without it: no WebGL, reduced motion, Save-Data and
   low-memory devices get a plain layout (see inline script in Layout.astro). */

const root = document.documentElement;
const canvas = document.getElementById('stage');

if (canvas && !root.classList.contains('no-stage')) {
  let started = false;
  const fail = (err) => {
    console.warn('[stage] falling back to the static page:', err);
    root.classList.add('no-stage');
    window.dispatchEvent(new Event('wt:stage-fail'));
  };

  const startWorld = () => {
    if (started) return;
    started = true;
    import('./world.js').then((world) => world.start(canvas)).catch(fail);
  };

  /* Start 3D initialization ONLY after Hero text entrance animation finishes (~700ms)
     to eliminate initial startup lag and main-thread contention. */
  window.addEventListener('wt:hero-ready', startWorld, { once: true });
  setTimeout(startWorld, 750);
}
