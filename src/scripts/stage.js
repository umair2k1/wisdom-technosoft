/* Loads the 3D world after first paint (scripts/world.js, its own chunk).
   The page works without it: no WebGL, reduced motion, Save-Data and
   low-memory devices get a plain layout (see the inline script in Layout.astro). */

const root = document.documentElement;
const canvas = document.getElementById('stage');

if (canvas && !root.classList.contains('no-stage')) {
  let started = false;
  const fail = (err) => {
    console.warn('[stage] falling back to the static page:', err);
    root.classList.add('no-stage');
    window.dispatchEvent(new Event('wt:stage-fail'));
  };
  const go = () => {
    if (started) return;
    started = true;
    import('./world.js').then((world) => world.start(canvas)).catch(fail);
  };

  /* Defer Three.js boot until the browser is idle so the hero headline animation
     runs at 60fps without main-thread contention. */
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(go, { timeout: 2000 });
  } else {
    setTimeout(go, 300);
  }
}
