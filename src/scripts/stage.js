/* Loads the 3D world behind the loader (scripts/world.js, its own chunk).
   Three.js parsing, WebGL setup and the shader warm-up all happen on the main
   thread; boot.js keeps the loader up until world.js reports `wt:world-ready`,
   so that work never competes with the hero entrance. The page works without it:
   no WebGL, reduced motion, Save-Data and low-memory devices get a plain layout
   (see the inline script in Layout.astro). */

const root = document.documentElement;
const canvas = document.getElementById('stage');

if (canvas && !root.classList.contains('no-stage')) {
  let started = false;

  const worldReady = () => window.dispatchEvent(new Event('wt:world-ready'));

  const fail = (err) => {
    console.warn('[stage] falling back to the static page:', err);
    root.classList.add('no-stage');
    window.dispatchEvent(new Event('wt:stage-fail'));
    worldReady();
  };

  const go = () => {
    if (started) return;
    started = true;
    /* motion.js may have handed us a page it already degraded. */
    if (root.classList.contains('no-stage')) {
      worldReady();
      return;
    }
    import('./world.js').then((world) => world.start(canvas)).catch(fail);
  };

  /* Give the loader one painted frame before the heavy chunk starts parsing. */
  requestAnimationFrame(() => {
    if ('requestIdleCallback' in window) window.requestIdleCallback(go, { timeout: 300 });
    else setTimeout(go, 50);
  });
}
