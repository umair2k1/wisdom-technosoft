/* One reveal for the first screen.
   The loader stays up until the web fonts and the 3D world's warm-up are done,
   then html.site-ready fades it out and motion.js starts the hero entrance while
   world.js starts the emblem assembly. Everything after that runs on an idle page. */

const root = document.documentElement;
const MIN_SHOW = 500;
const MAX_WAIT = 9000;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fonts =
  document.fonts && document.fonts.ready ? document.fonts.ready.catch(() => undefined) : Promise.resolve();
const fontsCapped = Promise.race([fonts, wait(1500)]);

const world =
  root.classList.contains('no-stage') || !document.getElementById('stage')
    ? Promise.resolve()
    : new Promise((resolve) => {
        if (window.__worldReady) resolve();
        else window.addEventListener('wt:world-ready', resolve, { once: true });
      });

let revealed = false;

function reveal() {
  if (revealed) return;
  revealed = true;

  window.__siteReady = true;
  root.classList.add('site-ready');
  window.dispatchEvent(new Event('wt:site-ready'));

  /* Free the node once the fade has finished. */
  const loader = document.querySelector('[data-loader]');
  if (loader) setTimeout(() => loader.remove(), 700);
}

Promise.all([fontsCapped, world, wait(MIN_SHOW)]).then(reveal);
setTimeout(reveal, MAX_WAIT);
