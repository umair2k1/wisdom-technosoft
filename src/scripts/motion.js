/* ------------------------------------------------------------------
   Scroll choreography (GSAP + ScrollTrigger).
   The 3D camera lives in world.js and reads scrollY directly; this file
   handles everything in the DOM: the hero lines, each chapter's giant
   background word and copy, the HUD, principles, vision and anchor flights.

   Content is visible by default. With JS on, animated elements are hidden by
   CSS only until this script releases them (html.is-ready), and CSS reveals
   them on its own after 3.5s if anything here fails.
   ------------------------------------------------------------------ */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
ScrollTrigger.config({ ignoreMobileResize: true });

const root = document.documentElement;
const still = root.classList.contains('no-motion') || root.classList.contains('no-stage');
const $ = (selector, ctx = document) => Array.from(ctx.querySelectorAll(selector));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/* Anchor links fly instead of jump; the 3D camera follows the scroll.
   Uses cached offsetTop instead of getBoundingClientRect() to avoid synchronous reflows. */
document.addEventListener('click', (event) => {
 const link = event.target.closest && event.target.closest('a[href^="#"]');
 if (!link) return;
 const hash = link.getAttribute('href');
 if (!hash || hash.length < 2) return;
 const target = document.querySelector(hash);
 if (!target) return;
 event.preventDefault();
 const distance = Math.abs(target.offsetTop - (window.scrollY || 0));
 gsap.to(window, {
  duration: still ? 0 : clamp(distance / (window.innerHeight * 6), 1, 3.6),
  scrollTo: { y: target, autoKill: true },
  ease: 'power3.inOut',
 });
 history.replaceState(null, '', hash);
});

function splitChars(el) {
 const text = el.textContent || '';
 el.textContent = '';
 return Array.from(text).map((ch) => {
  const span = document.createElement('span');
  span.className = 'char';
  span.setAttribute('aria-hidden', 'true');
  span.textContent = ch === ' ' ? '\u00a0' : ch;
  el.appendChild(span);
  return span;
 });
}

function splitWords(el) {
 const words = (el.textContent || '').trim().split(/\s+/);
 el.textContent = '';
 return words.map((word, i) => {
  const span = document.createElement('span');
  span.className = 'w';
  span.textContent = word;
  el.appendChild(span);
  if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
  return span;
 });
}

/* A scrubbed timeline is 0..1 across a section's pinned length. */
const track = (trigger, scrub = 0.7) =>
 gsap.timeline({
  defaults: { ease: 'none' },
  scrollTrigger: { trigger, start: 'top top', end: 'bottom bottom', scrub },
 });

/* Anything goes wrong: drop every animation and show the plain page. */
function bail() {
 ScrollTrigger.getAll().forEach((t) => t.kill());
 gsap.globalTimeline.clear();
 gsap.set($('main *, .bgwords *'), { clearProps: 'all' });
 root.classList.add('no-stage', 'is-ready');
 ScrollTrigger.refresh();
}

if (!still) {
 try {
  init();
 } catch (err) {
  console.warn('[motion] animations disabled:', err);
  bail();
 }
 root.classList.add('is-ready');
}

function init() {
 /* ---------- hero: lines rise in once fonts are in, then glide on scroll ---------- */
 const hero = document.querySelector('.hero');
 if (hero) {
  const rows = $('[data-hero-row]', hero);
  const intro = $('[data-hero-in]', hero);

  gsap.set(rows, { yPercent: 100, opacity: 0 });
  gsap.set(intro, { y: 20, opacity: 0 });

  const finishHero = () => {
   rows.forEach((row) => (row.style.overflow = 'visible'));
   window.dispatchEvent(new Event('wt:hero-ready'));
  };

  const entrance = gsap
   .timeline({
    paused: true,
    defaults: { ease: 'power3.out' },
    onComplete: finishHero,
   })
   .to(rows, { yPercent: 0, opacity: 1, duration: 0.65, stagger: 0.08, force3D: true }, 0)
   .to(intro, { y: 0, opacity: 1, duration: 0.55, stagger: 0.06, force3D: true }, 0.25);

  const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  Promise.race([fontsReady, new Promise((resolve) => setTimeout(resolve, 800))]).then(() => {
   requestAnimationFrame(() => entrance.play());
  });

  const tl = track(hero, 0.8);
  tl.to(rows, { yPercent: -80, opacity: 0, duration: 0.35, stagger: 0.04, force3D: true }, 0.05)
   .to(intro, { y: -50, opacity: 0, duration: 0.22, stagger: 0.03, force3D: true }, 0.06)
   .to('[data-scroll-cue]', { opacity: 0, duration: 0.08 }, 0)
   .set({}, {}, 1);
 }

 /* ---------- service chapters: giant word behind the 3D object, copy in front ---------- */
 $('.chapter').forEach((section) => {
  const index = section.dataset.chapter;
  const word = document.querySelector(`[data-bgword="${index}"]`);
  const reveal = $('[data-r]', section);
  const wordChars = word ? splitChars(word) : [];

  gsap.set(reveal, { y: 46, opacity: 0 });
  if (word) gsap.set(word, { autoAlpha: 0, yPercent: -50 });

  const tl = track(section);
  if (word) {
   tl.set(word, { autoAlpha: 1 }, 0.02)
    .fromTo(word, { x: '-7vw' }, { x: '7vw', duration: 1 }, 0)
    .fromTo(wordChars, { yPercent: 118, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.2, stagger: 0.03 }, 0.03)
    .to(wordChars, { yPercent: -118, opacity: 0, duration: 0.14, stagger: 0.02 }, 0.74)
    .set(word, { autoAlpha: 0 }, 0.99);
  }
  tl.to(reveal, { y: 0, opacity: 1, duration: 0.12, stagger: 0.035 }, 0.07)
   .to(reveal, { y: -40, opacity: 0, duration: 0.1, stagger: 0.012 }, 0.82)
   .set({}, {}, 1);
 });

 /* ---------- principles: text swaps as the 3D carousel turns ---------- */
 const principles = document.querySelector('[data-principles]');
 if (principles) {
  const items = $('[data-p-item]', principles);
  const labels = $('[data-p-idx]', principles);
  const head = $('[data-p-head]', principles);
  const bottom = $('[data-p-bottom]', principles);
  let current = -1;

  const show = (i) => {
   if (i === current) return;
   current = i;
   items.forEach((el, k) => el.classList.toggle('is-active', k === i));
   labels.forEach((el, k) => el.classList.toggle('is-active', k === i));
  };
  show(0);

  ScrollTrigger.create({
   trigger: principles,
   start: 'top top',
   end: 'bottom bottom',
   onUpdate: (self) => show(Math.min(items.length - 1, Math.floor(self.progress * items.length))),
  });

  track(principles, 0.6)
   .fromTo(head, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.07 }, 0)
   .fromTo(bottom, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.08 }, 0.02)
   .to([head, bottom], { y: -30, opacity: 0, duration: 0.06 }, 0.94)
   .set({}, {}, 1);
 }

 /* ---------- vision: words light up as you read; mission follows ---------- */
 const vision = document.querySelector('[data-vision]');
 if (vision) {
  const text = vision.querySelector('[data-vision-text]');
  const mission = vision.querySelector('[data-mission]');
  const words = text ? splitWords(text) : [];

  gsap.set(words, { opacity: 0.14 });
  gsap.set(mission, { opacity: 0, y: 36 });
  track(vision, 0.6)
   .to(words, { opacity: 1, duration: 0.05, stagger: 0.42 / Math.max(1, words.length) }, 0.06)
   .to(mission, { opacity: 1, y: 0, duration: 0.14 }, 0.58)
   .set({}, {}, 1);
 }

 /* ---------- everything else eases in once ---------- */
 $('[data-reveal]').forEach((el) => {
  gsap.from(el, {
   y: 50,
   opacity: 0,
   duration: 1,
   ease: 'power3.out',
   scrollTrigger: { trigger: el, start: 'top 88%', once: true },
  });
 });

 /* ---------- HUD: counter, rail and accent colour follow active chapter ---------- */
 const chapters = $('[data-chapter]');
 const indexEl = document.querySelector('[data-hud-index]');
 const nameEl = document.querySelector('[data-hud-name]');
 const ticks = $('[data-hud-tick]');

 const setActive = (i, label, accent) => {
  if (indexEl) indexEl.textContent = String(i + 1).padStart(2, '0');
  if (nameEl && label) nameEl.textContent = label;
  ticks.forEach((tick, k) => {
   tick.classList.toggle('is-active', k === i);
   if (k === i) tick.setAttribute('aria-current', 'true');
   else tick.removeAttribute('aria-current');
  });
  if (accent) root.style.setProperty('--accent', accent);
 };
 setActive(0, 'Intro', '#c9a27e');

 /* Use passive IntersectionObserver for chapter HUD detection instead of layout-reading ScrollTriggers */
 if ('IntersectionObserver' in window) {
  const hudObserver = new IntersectionObserver(
   (entries) => {
    entries.forEach((entry) => {
     if (entry.isIntersecting) {
      const chapter = entry.target.closest('[data-chapter]');
      const i = chapters.indexOf(chapter);
      if (i >= 0) setActive(i, entry.target.dataset.hudLabel, chapter.dataset.accent);
     }
    });
   },
   { rootMargin: '-25% 0px -25% 0px', threshold: 0.25 },
  );
  $('[data-hud-label]').forEach((el) => hudObserver.observe(el));
 }

 /* The HUD steps aside when the footer arrives. */
 const footer = document.querySelector('.footer');
 if (footer) {
  ScrollTrigger.create({
   trigger: footer,
   start: 'top 92%',
   onEnter: () => root.classList.add('hud-off'),
   onLeaveBack: () => root.classList.remove('hud-off'),
  });
 }

 /* ---------- velocity skew: copy leans slightly into fast scrolling ---------- */
 const skewTargets = $('[data-skew]');
 if (skewTargets.length) {
  const setters = skewTargets.map((el) => gsap.quickTo(el, 'skewY', { duration: 0.8, ease: 'power3' }));
  let resetTimer = null;
  ScrollTrigger.create({
   start: 0,
   end: 'max',
   onUpdate: (self) => {
    const v = clamp(self.getVelocity() / -700, -3, 3);
    setters.forEach((set) => set(v));
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
     setters.forEach((set) => set(0));
    }, 120);
   },
  });
 }

 /* ---------- housekeeping ---------- */
 window.addEventListener('load', () => ScrollTrigger.refresh());
 if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());

 /* If the 3D stage gives up (context lost, render error), fall back to the plain page. */
 window.addEventListener('wt:stage-fail', bail);
}
