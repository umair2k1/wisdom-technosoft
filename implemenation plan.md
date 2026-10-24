Mobile polish — what was wrong

Looking at the current build on a phone, the main problems were:

1. Hero headline overflowed on 320–430 px (it used 13.4vw without a safe minimum, so "Conversations." clipped).
2. Services panels used 88 px outlined words — dramatic on desktop, cramped and overflowing on phones.
3. content-visibility:auto on .strip made the page's measured section tops drift (the strip collapses to 100svh while off‑screen), so the floating mark was out of sync — the mark "positions" felt random.
4. Form inputs were 15 px, which makes iOS Safari zoom on focus.
5. Nav button / brand collided between 420–640 px; tap targets under 44 px.
6. Hero CTA row stayed inline and squeezed on narrow screens.
7. Vision section had 220 svh of scroll for the ring — far too long on a phone.
8. Address‑bar resize triggered a full re‑measure on every scroll (iOS), causing the mark to jump.

Below are the full replacement files. Only styles.css and script.js changed meaningfully; index.html gets small inputmode additions. 404.html / privacy.html need no changes (they inherit the mobile --nav and touch polish).

---

styles.css (full replacement)

```css
:root{--deep:#04222B;--teal:#063340;--bone:#EDE7DB;--ink:#14201F;--tan:#C9A27E;--slate:#6E8FA8;--ivory:#F4F0E8;
--ease:cubic-bezier(.22,1,.36,1);--g:clamp(20px,5vw,72px);--nav:72px;--gx:max(var(--g),calc((100vw - 1500px)/2));--disp:"Bricolage Grotesque","Helvetica Neue",Arial,sans-serif}
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;text-size-adjust:100%;scroll-behavior:smooth}
body{margin:0;isolation:isolate;background:var(--deep);color:var(--ivory);font:400 1rem/1.65 "DM Sans",system-ui,sans-serif;overflow-x:clip;-webkit-font-smoothing:antialiased;-webkit-tap-highlight-color:transparent}
h1,h2,h3,p,dl,dd,ul,ol{margin:0;padding:0}
ul,ol{list-style:none}
a{color:inherit;touch-action:manipulation}
button{touch-action:manipulation}
:focus-visible{outline:2px solid var(--tan);outline-offset:4px}
::selection{background:var(--tan);color:var(--ink)}
.skip{position:fixed;left:12px;top:12px;z-index:300;padding:10px 16px;background:var(--tan);color:var(--ink);transform:translateY(-200%)}
.skip:focus{transform:none}
main:focus{outline:0}

/* Fixed scroll-driven mark: sits above section backgrounds, below content */
.orb{position:fixed;left:50%;top:50%;width:min(62vmin,640px);height:min(62vmin,640px);aspect-ratio:1;margin:calc(min(62vmin,640px)/-2) 0 0 calc(min(62vmin,640px)/-2);z-index:0;pointer-events:none;perspective:900px;opacity:0;will-change:transform,opacity}
.orb svg{width:100%;height:100%;overflow:visible;will-change:transform}
.o-ring{
  fill:none;
  stroke:var(--ac,#C9A27E);
  stroke-width:1.2;
  stroke-dasharray:calc(1.5px + var(--sp, 0) * 5px) 7px;
  opacity:.7;
}


.bar{position:fixed;right:0;top:0;bottom:0;width:3px;z-index:200;pointer-events:none}
.bar i{display:block;height:100%;background:var(--tan);transform:scaleY(0);transform-origin:50% 0}
.chap{position:fixed;left:var(--g);bottom:20px;z-index:150;font-size:13px;font-weight:500;color:#fff;mix-blend-mode:difference;pointer-events:none;text-shadow:0 0 12px rgba(0,0,0,.45)}

.nav{position:fixed;inset:0 0 auto;z-index:160;height:var(--nav);display:flex;align-items:center;justify-content:space-between;padding-inline:var(--g);transition:transform .5s var(--ease)}
.nav.hide{transform:translateY(-110%)}
.nav.hide:focus-within{transform:none}
.brand{display:flex;align-items:center;gap:12px;text-decoration:none;font:700 15px var(--disp);letter-spacing:-.01em;color:#fff;mix-blend-mode:difference}
.brand-logo{height:34px;width:auto;display:block;will-change:opacity}
.btn{display:inline-flex;align-items:center;justify-content:center;padding:14px 26px;border:0;border-radius:999px;background:var(--tan);color:var(--ink);font:600 15px "DM Sans",sans-serif;text-decoration:none;cursor:pointer;transition:transform .35s var(--ease),background .3s;min-height:48px}
.nav .btn{box-shadow:0 0 0 1px rgba(20,32,31,.2)}
.lnk{font-weight:500;text-underline-offset:6px;text-decoration:underline}

.s{position:relative;color:var(--fg);overflow-x:clip}
.s::before{content:"";position:absolute;inset:0;background:var(--bg);z-index:-1}
.w{position:relative;z-index:1;width:min(100% - var(--g)*2,1500px);margin-inline:auto}
.big{font:800 clamp(2.8rem,8.4vw,9rem)/.92 var(--disp);letter-spacing:-.045em;max-width:13ch;text-wrap:balance}
.aside{margin-top:20px;max-width:38ch;opacity:.7}
.eyebrow{display:flex;align-items:center;gap:12px;margin-bottom:clamp(18px,2.4vw,28px);font:600 12px/1.2 "DM Sans",sans-serif;letter-spacing:.16em;text-transform:uppercase;opacity:.7}
.eyebrow::before{content:"";width:28px;height:1px;background:currentColor}

/* Hero */
.hero{min-height:100svh;display:flex;flex-direction:column;justify-content:flex-end;padding:calc(var(--nav) + 4vh) 0 max(5vh,64px);position:relative}
.hero h1{position:relative;z-index:1;font:800 clamp(2.2rem,12.2vw,13.5rem)/.88 var(--disp);letter-spacing:-.05em}
.hlm{display:block;clip-path:inset(0 -100vw);padding-bottom:.1em;margin-bottom:-.1em}
.hl{display:block}
.hl>span{display:inline-block}
.hlm:nth-child(2) .hl{padding-left:7vw}
.hlm:nth-child(3) .hl{color:var(--tan)}
.hero-foot{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:24px;margin-top:clamp(28px,5vh,56px);padding-top:24px;border-top:1px solid rgba(244,240,232,.2)}
.hero-foot p{max-width:42ch;opacity:.78;font-size:1.05rem}
.actions{display:flex;align-items:center;gap:28px}
.js .hl>span{transform:translateY(110%);transition:transform 1.2s var(--ease)}
.js .hlm:nth-child(2) .hl>span{transition-delay:.12s}
.js .hlm:nth-child(3) .hl>span{transition-delay:.24s}
.js .ready .hl>span{transform:none}
.js .hero-foot{opacity:0;transform:translateY(16px);transition:opacity 1s .8s,transform 1s .8s var(--ease)}
.js .ready .hero-foot{opacity:1;transform:none}

/* Services: pinned horizontal scroll on wide screens */
.pin-head{position:relative;z-index:3;padding:calc(var(--nav) + 12px) var(--gx) 0;font:700 1rem var(--disp)}
.dots{position:relative;z-index:3;display:none;gap:10px;padding:10px var(--gx) 0;font-size:13px}
.dot{padding:5px 14px;border:1px solid rgba(244,240,232,.3);border-radius:999px;opacity:.55;transition:all .4s}
.dot.is-on{background:var(--ivory);color:var(--teal);opacity:1;border-color:var(--ivory)}
.panel{position:relative;padding:48px var(--gx)}
.pword{font:800 clamp(5.5rem,22vw,24rem)/.82 var(--disp);letter-spacing:-.05em;color:transparent;-webkit-text-stroke:1.5px rgba(244,240,232,.3)}
.pbody{position:relative;z-index:1;max-width:560px;margin-top:24px}
.pbody h2{font:700 clamp(1.9rem,3.6vw,3.2rem)/1.05 var(--disp);letter-spacing:-.03em;margin-bottom:14px}
.pbody p{opacity:.78}
.tags{display:flex;flex-wrap:wrap;gap:8px;margin-top:22px}
.tags li{padding:6px 14px;border:1px solid rgba(244,240,232,.3);border-radius:999px;font-size:13px}
.services.is-pin{height:520svh;overscroll-behavior:contain}
.is-pin .pin{position:sticky;top:0;height:100svh;overflow:hidden;z-index:1;display:flex;flex-direction:column}
.is-pin .dots{display:flex}
@property --track {
  syntax: "<number>";
  inherits: false;
  initial-value: 0;
}
.is-pin .track{
  display:flex;
  flex:1 1 auto;
  min-height:0;
  width:500vw;
  transform:translate3d(calc(var(--track) * -20%), 0, 0);
  will-change:transform;
}
.is-pin .panel{flex:0 0 100vw;display:flex;flex-direction:column;justify-content:flex-end;padding-bottom:9vh}
.is-pin .pword{position:absolute;left:var(--gx);top:15vh;white-space:nowrap}
.is-pin .panel:nth-child(4) .pword,
.is-pin .panel:nth-child(5) .pword{font-size:clamp(7rem,26vw,28rem)}
.services:not(.is-pin) .pin-head{padding-top:56px}
.services:not(.is-pin) .panel+.panel{border-top:1px solid rgba(244,240,232,.14)}

/* Approach */
.approach{padding-block:clamp(5rem,12vw,11rem)}
.cards{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:clamp(40px,7vw,90px);perspective:1200px}
.card{display:flex;flex-direction:column;justify-content:space-between;min-height:340px;padding:28px;border-radius:8px;background:var(--teal);color:var(--ivory);transform-origin:50% 0}
.card h3{font:700 clamp(1.5rem,2.3vw,2.2rem)/1.05 var(--disp);letter-spacing:-.03em}
.card p{opacity:.72;max-width:22ch}

/* Strip */
.strip{padding-block:clamp(18px,3vw,36px);overflow:hidden}
.srow{overflow:hidden;white-space:nowrap}
.srow.o .tr{margin-left:-200vw}
.tr{display:inline-block;font:800 clamp(3rem,10vw,9rem)/1.1 var(--disp);letter-spacing:-.04em}
.srow.o .tr{color:transparent;-webkit-text-stroke:1.5px var(--ink)}
.tr span{display:inline-block}

/* Vision */
.vscroll{height:220svh}
.vstick{position:sticky;top:0;height:100svh;display:grid;place-items:center;overflow:hidden;z-index:1}
.vring{width:min(88vmin,780px);aspect-ratio:1;overflow:visible;will-change:transform}
.vring text{font:800 30px var(--disp);fill:var(--ivory)}
.vstate{padding-block:clamp(4rem,9vw,8rem)}
.vq{font:700 clamp(1.7rem,5.2vw,5rem)/1.05 var(--disp);letter-spacing:-.04em;max-width:20ch;text-wrap:balance}
.eb-m{margin-top:clamp(36px,5vw,56px);margin-bottom:14px}
.mission{max-width:56ch;font-size:clamp(1.05rem,1.5vw,1.3rem);opacity:.72}

/* Team */
.team{padding-block:clamp(5rem,11vw,10rem)}
.rows{margin-top:clamp(36px,6vw,72px);border-top:1px solid rgba(20,32,31,.2)}
.row{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:6px 24px;padding:clamp(20px,3vw,34px) 0;border-bottom:1px solid rgba(20,32,31,.2)}
.rn{font:700 clamp(1.8rem,5vw,4.6rem)/1.05 var(--disp);letter-spacing:-.04em}
.rr{font-size:14px;opacity:.65}

/* Contact */
.contact{padding-block:clamp(5rem,11vw,10rem)}
.clayout{display:grid;grid-template-columns:1fr 1.15fr;gap:clamp(32px,6vw,90px);margin-top:clamp(36px,6vw,72px);align-items:start}
.cmail{display:inline-block;padding-bottom:8px;border-bottom:1px solid rgba(244,240,232,.35);font:500 clamp(1.1rem,2.2vw,1.9rem) var(--disp);letter-spacing:-.02em;text-decoration:none;overflow-wrap:anywhere}
.cinfo dl{margin:32px 0}
.cinfo dl>div{padding:14px 0;border-top:1px solid rgba(244,240,232,.18)}
.cinfo dt{font-size:13px;opacity:.6;margin-bottom:4px}
.cinfo dd a{text-decoration:none;opacity:.88}
.cinfo dd a[href^="tel"]{white-space:nowrap}
.wa{background:transparent;border:1px solid rgba(163,247,191,.5);color:#a3f7bf;min-height:48px;padding:14px 22px}
.cform{display:flex;flex-direction:column;gap:16px;padding:clamp(22px,4vw,40px);border:1px solid rgba(244,240,232,.18);border-radius:8px;background:rgba(4,34,43,.55);color-scheme:dark}
.cform h3{font:700 1.5rem var(--disp);letter-spacing:-.02em}
.hint{opacity:.7;font-size:14px;margin-top:-8px}
.two{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.cform label{display:flex;flex-direction:column;gap:6px;font-size:13px;font-weight:500;opacity:.9}
.cform input,.cform select,.cform textarea{width:100%;padding:12px 14px;border:1px solid rgba(244,240,232,.22);border-radius:6px;background:rgba(244,240,232,.06);color:var(--ivory);font:inherit;font-size:16px;min-height:48px}
.cform select option{background:var(--deep)}
.cform textarea{resize:vertical;min-height:120px}
.cform input:focus,.cform select:focus,.cform textarea:focus{outline:0;border-color:var(--tan);background:rgba(244,240,232,.1)}
.cform .btn{width:100%;min-height:50px}
.fine{font-size:12px;opacity:.6}
.status{border-radius:6px;font-size:14px}
.status:empty{margin-top:-16px}
.status.ok,.status.err{padding:12px 14px}
.status.ok{background:rgba(76,175,80,.22);color:#c8e6c9}
.status.err{background:rgba(239,83,80,.22);color:#ffcdd2}
.hp{position:absolute;left:-9999px;top:0;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
body:not(.has-orb) .chap{display:none}
body:not(.has-orb) .bar{display:none}
.cform select{
  appearance:none;
  background-image:linear-gradient(45deg, transparent 50%, var(--ivory) 50%),
                   linear-gradient(135deg, var(--ivory) 50%, transparent 50%);
  background-position:calc(100% - 18px) calc(50% - 2px), calc(100% - 12px) calc(50% - 2px);
  background-size:6px 6px, 6px 6px;
  background-repeat:no-repeat;
  padding-right:40px;
}

.foot{position:relative;z-index:1;background:var(--deep);padding:28px var(--gx) 64px;display:flex;flex-wrap:wrap;justify-content:space-between;gap:10px 28px;font-size:13px;color:var(--fg);opacity:.8}
.foot a{text-decoration:none}

@media (max-width:1000px){
  .cards{grid-template-columns:1fr 1fr}
  .clayout{grid-template-columns:1fr}
}

/* ---------- Stacked services (phones / small tablets) ---------- */
@media (max-width:899px){
  .pword{font-size:clamp(4rem,18vw,7rem);-webkit-text-stroke-width:1.1px;letter-spacing:-.045em;line-height:.9}
  .services:not(.is-pin) .pin-head{padding-top:calc(var(--nav) + 20px);font-size:1.05rem}
  .services:not(.is-pin) .panel{padding-block:clamp(40px,8vw,64px)}
  .pbody{margin-top:16px}
  .pbody h2{font-size:clamp(1.6rem,5.4vw,2.4rem)}
  .pbody p{font-size:.98rem}
  .tags li{font-size:12px;padding:5px 12px}
  .card{min-height:auto;padding:24px}
  .card h3{font-size:clamp(1.35rem,4.6vw,1.8rem)}
  .card p{max-width:none}
  .cards{gap:12px}
}

/* ---------- Phone ---------- */
@media (max-width:640px){
  :root{--nav:64px}
  .hero{padding:calc(var(--nav) + 2vh) 0 max(6vh,44px)}
  .hero-foot{margin-top:20px;padding-top:18px;gap:18px}
  .hero-foot p{font-size:.95rem;max-width:34ch}
  .actions{flex-direction:column;align-items:stretch;gap:12px;width:100%}
  .actions .btn{width:100%;min-height:50px}
  .actions .lnk{text-align:center;font-size:.95rem}
  .brand-logo{height:30px}
  .nav .btn{padding:0 18px;font-size:14px;min-height:44px}
  .big{font-size:clamp(2.1rem,8.6vw,3.4rem)}
  .aside{font-size:.95rem;max-width:34ch}
  .hlm:nth-child(2) .hl{padding-left:0}
  .chap{display:none}
  .cards{grid-template-columns:1fr}
  .two{grid-template-columns:1fr}
  .vscroll{height:170svh}
  .vring{width:min(88vw,420px)}
  .vq{font-size:clamp(1.65rem,7vw,2.6rem)}
  .mission{font-size:1rem}
  .clayout{margin-top:28px;gap:28px}
  .cinfo dl{margin:24px 0}
  .cinfo dl>div{padding:12px 0}
  .cform{padding:20px;gap:14px}
  .row{padding-block:18px}
  .rr{width:100%}
  .foot{flex-direction:column;align-items:flex-start;gap:8px;font-size:12.5px;padding-bottom:48px}
  .stub-main{padding-top:clamp(40px,8vw,80px);padding-bottom:clamp(40px,8vw,80px)}
}

@media (max-width:520px){
  .brand span{display:none}
}

@media (prefers-reduced-motion:reduce){
  html{scroll-behavior:auto}
  *,*::before,*::after{transition-duration:.001ms!important;transition-delay:0ms!important}
  .js .hl>span{transform:none}
  .js .hero-foot{opacity:1;transform:none}
  .vscroll{height:auto}.vstick{position:relative;height:auto;padding:4rem 0}
}

/* Disable sticky hover styles on touch devices */
@media (hover:none){
  .btn:hover{transform:none;background:var(--tan)}
  .wa:hover{background:transparent}
  .cmail:hover{color:inherit;border-color:rgba(244,240,232,.35)}
}

/* Static stub pages (privacy.html, 404.html) */
.stub{min-height:100svh;display:flex;flex-direction:column;padding:calc(var(--nav) + 4vh) 0 max(6vh,64px)}
.stub .w{flex:1 1 auto}
.stub-head{position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;gap:20px;padding-inline:var(--g);height:var(--nav);border-bottom:1px solid rgba(244,240,232,.14)}
.stub-head .brand{color:var(--ivory);mix-blend-mode:normal}
.stub-back{font-weight:500;text-underline-offset:6px;text-decoration:underline;color:var(--ivory);opacity:.85}
.stub-main{padding-top:clamp(48px,9vw,120px);padding-bottom:clamp(48px,9vw,120px)}
.stub-main .big{max-width:16ch}
.stub-main p{max-width:60ch;opacity:.78;margin-top:clamp(18px,3vw,28px);font-size:clamp(1rem,1.3vw,1.125rem)}
.stub-main p + p{margin-top:14px}
.stub-main .lnk{margin-top:clamp(28px,4vw,44px);display:inline-block;color:var(--tan);text-underline-offset:6px}
.stub-h{font:700 clamp(1.25rem,2vw,1.5rem)/1.2 var(--disp);letter-spacing:-.02em;margin-top:clamp(36px,5vw,56px);max-width:50ch}
.stub-main ul{max-width:60ch;margin-top:16px;display:flex;flex-direction:column;gap:10px;opacity:.78}
.stub-main ul li{padding-left:22px;position:relative}
.stub-main ul li::before{content:"";position:absolute;left:0;top:.75em;width:8px;height:1px;background:var(--tan)}
.stub-main a{color:var(--tan);text-underline-offset:4px}
.stub-nav{margin-top:clamp(32px,5vw,56px);font-size:13px;opacity:.6}
.stub-nav a{text-decoration:none}
```

---

script.js (full replacement)

Only two behavioural changes vs. your version: a resize guard that ignores iOS address‑bar height bumps (so the mark doesn't jump on every scroll), plus a small orientation‑safe remeasure.

```js
(function () {
  "use strict";
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  var navTimer;
  function handleNav(dy) {
    if (dy > 1 && window.scrollY > 320) {
      nav.classList.add("hide");
      clearTimeout(navTimer);
      navTimer = setTimeout(function () { nav.classList.remove("hide"); }, 600);
    } else if (dy < -1) {
      nav.classList.remove("hide");
      clearTimeout(navTimer);
    }
  }
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b === undefined ? 1 : b, Math.max(a === undefined ? 0 : a, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var sm = function (t) { return t * t * (3 - 2 * t); };
  var rgb = function (h) { return [1, 3, 5].map(function (i) { return parseInt(h.slice(i, i + 2), 16); }); };
  var hex = function (n) { return ("0" + n.toString(16)).slice(-2); };
  var mix = function (a, b, t) {
    var A = rgb(a), B = rgb(b);
    return "#" + A.map(function (v, i) { return hex(Math.round(lerp(v, B[i], t))); }).join("");
  };

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var wide = window.matchMedia("(min-width: 900px)");
  var H = window.innerHeight;

  var orb = $(".orb"), orbSvg = $(".orb svg"), orbRing = $(".o-ring");
  var bar = $(".bar i"), chap = $("#chap"), nav = $("#nav");
  var sv = $("#services"), track = $(".track"), panels = $$(".panel"), words = $$(".pword"), dots = $$(".dot");
  var heroLines = $$(".hl"), cards = $$(".card"), cardBox = $(".cards");
  var trs = $$(".tr"), strip = $("#strip");
  var vscroll = $(".vscroll"), vring = $(".vring");
  var rows = $$(".row");

  var S = [
    { id: "top",      n: "Welcome",       x: 22, y: -2, s: 1,    o: 1,   sp: 0,  c: "#C9A27E" },
    { id: "services", n: "What we do",    x: 34, y: 26, s: 0.42, o: 1,   sp: 0.6, c: "#7FB0D0" },
    { id: "approach", n: "How we deliver", x: 0,  y: 0,  s: 1.7,  o: 0.13, sp: 0.2, c: "#C9A27E" },
    { id: "strip",    n: "At a glance",      x: 0,  y: 0,  s: 0.6,  o: 0,   sp: 0,  c: "#C9A27E" },
    { id: "vision",   n: "Vision",        x: 0,  y: 0,  s: 0.5,  o: 1,   sp: 0.7, c: "#C9A27E" },
    { id: "team",     n: "Team",          x: -36, y: 24, s: 0.35, o: 0.5, sp: 0.3, c: "#6E8FA8" },
    { id: "contact",  n: "Contact",       x: -29, y: 20, s: 0.62, o: 1,   sp: 0,  c: "#C9A27E" }
  ];
  var PC = ["#7FB0D0", "#D9B48F", "#8FD1B5", "#C9A27E", "#A8C0D8"];
  var PANEL_NAMES = ["Software", "Telecalling", "Data", "Business process", "Healthcare"];
  var els = S.map(function (s) { return document.getElementById(s.id); });
  var tops = [];

  var brandLogo = $(".brand-logo");
  var header_x = -44, header_y = -46, header_s = 0.11;

  var ringText = $(".vring text");
  function fitRing() {
    if (!ringText || !ringText.getComputedTextLength) return;
    ringText.style.fontSize = "38px";
    var len = ringText.getComputedTextLength();
    if (len > 0) ringText.style.fontSize = (38 * 1064 / len).toFixed(2) + "px";
  }

  var M = {};
  function measure() {
    fitRing();
    H = window.innerHeight;
    var W = window.innerWidth;
    tops = els.map(function (e) { return e.getBoundingClientRect().top + window.scrollY; });

    if (cardBox) {
      M.cardsTop = cardBox.getBoundingClientRect().top + window.scrollY;
    }
    M.rowTops = rows.map(function (r) {
      return r.getBoundingClientRect().top + window.scrollY;
    });

    if (brandLogo) {
      var rect = brandLogo.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = (nav.classList.contains("hide") ? 36 : rect.top + rect.height / 2);
      header_x = ((cx - W / 2) / W) * 100;
      header_y = ((cy - H / 2) / H) * 100;
      var orbBase = Math.min(0.62 * Math.min(W, H), 640);
      var imgBaseHeight = orbBase * (162.5 / 300);
      header_s = rect.height / (imgBaseHeight || 1);
    }
  }

  var pinOn = false;
  function setMode() {
    pinOn = wide.matches && !reduce.matches;
    sv.classList.toggle("is-pin", pinOn);
    if (!pinOn) {
      track.style.transform = "";
      track.style.removeProperty("--track");
      words.forEach(function (w) { w.style.transform = ""; });
    }
    measure();
    update(cur, 0);
  }

  var target = window.scrollY, cur = target, prev = cur, raf = 0, lastT = target, lastChap = "";

  function update(y, v) {
    var d = target - y;
    var narrow = window.innerWidth < 760;
    var rm = reduce.matches;
    var introDist = Math.min(H * 0.45, 380);

    var curX, curY, curS, curO, ringOp, tiltY = 0, tiltZ = 0, ringRot = 0, sp = 0, col = S[0].c;
    var activeChapter = 0;
    var p = clamp((y - tops[1]) / Math.max(1, sv.offsetHeight - H));
    var f = p * (panels.length - 1);

    chap.style.opacity = y > introDist ? 1 : 0;
    if (y <= introDist) {
      activeChapter = 0;
      var t = sm(clamp(y / introDist));
      var handoff = y <= 0.5 ? 0 : clamp(y / 25, 0, 1);
      curX = lerp(header_x, S[0].x * (narrow ? 0.45 : 1), t);
      curY = lerp(header_y, S[0].y, t);
      curS = lerp(header_s, S[0].s, t);
      curO = handoff;
      ringOp = 0.7 * sm(clamp((t - 0.2) / 0.8));
      if (brandLogo) brandLogo.style.opacity = (1 - handoff).toFixed(3);
      tiltY = lerp(0, 15, Math.sin(t * Math.PI));
      tiltZ = lerp(0, -6, Math.sin(t * Math.PI));
      ringRot = -y * 0.12 * t;
      col = S[0].c;
    } else {
      if (brandLogo) brandLogo.style.opacity = clamp((y - introDist) / 80).toFixed(3);
      ringOp = 0.7;

      if (y < tops[1]) {
        activeChapter = 0;
        var t_serv = sm(clamp((y - introDist) / Math.max(1, tops[1] - introDist)));
        curX = lerp(S[0].x * (narrow ? 0.45 : 1), S[1].x * (narrow ? 0.45 : 1), t_serv);
        curY = lerp(S[0].y, S[1].y, t_serv);
        curS = lerp(S[0].s, S[1].s, t_serv);
        curO = lerp(S[0].o, S[1].o, t_serv) * (narrow ? 0.6 : 1);
        sp = lerp(S[0].sp, S[1].sp, t_serv);
        col = mix(S[0].c, S[1].c, t_serv);
      } else {
        var m = y + H * 0.5;
        var i = 1, k;
        for (k = 1; k < S.length; k++) if (m >= tops[k]) i = k;
        activeChapter = i;
        var j = Math.min(i + 1, S.length - 1);
        var a = S[i], b = S[j];
        var t = a === b ? 0 : sm(clamp((m - (tops[j] - H * 0.9)) / (H * 0.9)));

        var ca = a.c, sa = a.sp;
        if (i === 1 && pinOn) {
          var ci = Math.min(Math.floor(f), PC.length - 2);
          ca = mix(PC[ci], PC[ci + 1], f - ci);
          sa = 0.6 + p * 1.4;

          var pi = Math.round(clamp(f, 0, panels.length - 1));
          if (PANEL_NAMES[pi] !== lastChap) {
            lastChap = PANEL_NAMES[pi];
            chap.textContent = lastChap;
          }
        }

        curX = lerp(a.x, b.x, t) * (narrow ? 0.45 : 1);
        curY = lerp(a.y, b.y, t);
        curS = lerp(a.s, b.s, t);
        curO = lerp(a.o, b.o, t) * (narrow ? 0.6 : 1);
        sp = lerp(sa, b.sp, t);
        col = mix(ca, b.c, t);
      }

      var relY = y - introDist;
      tiltY = relY * 0.18;
      tiltZ = relY * 0.05;
      ringRot = -y * 0.12;

      if (tops[6]) {
        var y0 = tops[6] - H * 0.8, cp = sm(clamp((y - y0) / (H * 0.7)));
        var up = function (v) { return Math.round(v / 360) * 360; };
        tiltY = lerp(tiltY, up((y0 - introDist) * 0.18), cp);
        tiltZ = lerp(tiltZ, up((y0 - introDist) * 0.05), cp);
        ringRot = lerp(ringRot, up(-y0 * 0.12), cp);
      }
    }

    orb.style.transform = "translate3d(" + curX.toFixed(2) + "vw," + curY.toFixed(2) + "vh,0) scale(" + curS.toFixed(3) + ")";
    orb.style.opacity = curO.toFixed(3);
    orb.style.setProperty("--sp", sp.toFixed(3));
    orb.style.setProperty("--ac", col);
    if (orbRing) orbRing.style.opacity = ringOp.toFixed(3);

    if (orbSvg) orbSvg.style.transform = rm ? "" : "rotateY(" + tiltY.toFixed(1) + "deg) rotateZ(" + tiltZ.toFixed(1) + "deg)";
    if (orbRing) orbRing.style.transform = rm ? "" : "rotate(" + ringRot.toFixed(1) + "deg)";

    var total = document.documentElement.scrollHeight - H;
    bar.style.transform = "scaleY(" + (total > 0 ? clamp(y / total) : 0).toFixed(4) + ")";
    if (activeChapter !== 1) {
      if (S[activeChapter].n !== lastChap) {
        lastChap = S[activeChapter].n;
        chap.textContent = lastChap;
      }
    }

    var dy = target - lastT;
    lastT = target;
    if (Math.abs(dy) > 1) handleNav(dy);
    if (rm) return;

    if (y < H * 1.4) heroLines.forEach(function (el) {
      el.style.transform = "translate3d(" + (el.getAttribute("data-d") * y * 0.3).toFixed(1) + "px,0,0)";
    });

    if (pinOn) {
      track.style.setProperty("--track", f.toFixed(3));
      words.forEach(function (w, n) { w.style.transform = "translate3d(" + ((f - n) * -16).toFixed(2) + "vw,0,0)"; });
      dots.forEach(function (dt, n) { dt.classList.toggle("is-on", n === Math.round(f)); });
    }

    var Rtop = M.cardsTop - y;
    cards.forEach(function (c, n) {
      var e = sm(clamp((H - Rtop - n * H * 0.06) / (H * 0.5)));
      c.style.transform = "translate3d(0," + ((1 - e) * 90).toFixed(1) + "px,0) rotateX(" + ((1 - e) * 55).toFixed(1) + "deg) rotateZ(" + ((1 - e) * (n % 2 ? 4 : -4)).toFixed(2) + "deg)";
      c.style.opacity = (0.15 + 0.85 * e).toFixed(3);
    });

    var rel = y - (tops[3] - H);
    var sk = clamp(v * -0.3, -14, 14);
    trs.forEach(function (tr) {
      var dir = Number(tr.getAttribute("data-s"));
      tr.style.transform = "translate3d(" + (-dir * rel * 0.6).toFixed(1) + "px,0,0) skewX(" + sk.toFixed(2) + "deg)";
    });

    var vp = clamp((y - tops[4]) / Math.max(1, vscroll.offsetHeight - H));
    vring.style.transform = "rotate(" + (vp * 540).toFixed(1) + "deg) scale(" + (0.82 + 0.18 * vp).toFixed(3) + ")";

    rows.forEach(function (r, n) {
      var rcTop = M.rowTops[n] - y;
      var e = sm(clamp((H * 0.95 - rcTop) / (H * 0.4)));
      var nm = r.firstElementChild;
      nm.style.transform = "translate3d(" + ((1 - e) * (n % 2 ? 1 : -1) * 160).toFixed(1) + "px,0,0)";
      r.style.opacity = e.toFixed(3);
    });
  }

  var prevNow = performance.now();
  function tick() {
    var now = performance.now();
    var dt = Math.min(64, now - prevNow);
    prevNow = now;
    var k = reduce.matches ? 1 : 1 - Math.exp(-dt / 90);
    cur = lerp(cur, target, k);
    if (Math.abs(target - cur) < 0.5) cur = target;
    update(cur, cur - prev);
    prev = cur;
    raf = cur !== target ? requestAnimationFrame(tick) : 0;
  }
  window.addEventListener("scroll", function () {
    target = window.scrollY;
    if (!raf) raf = requestAnimationFrame(tick);
  }, { passive: true });

  // Resize: ignore iOS address-bar height bumps (same width, small delta)
  var lastW = window.innerWidth, lastH = window.innerHeight, resizeRaf = 0;
  window.addEventListener("resize", function () {
    if (resizeRaf) return;
    resizeRaf = requestAnimationFrame(function () {
      resizeRaf = 0;
      var w = window.innerWidth, h = window.innerHeight;
      if (w === lastW && Math.abs(h - lastH) < 120) { lastH = h; return; }
      lastW = w; lastH = h;
      setMode();
    });
  }, { passive: true });

  window.addEventListener("load", function () { measure(); update(cur, 0); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { measure(); update(cur, 0); });
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) { measure(); update(cur, 0); }
  });
  if (wide.addEventListener) { wide.addEventListener("change", setMode); reduce.addEventListener("change", setMode); }

  setMode();
  var ready = function () { document.body.classList.add("ready"); };
  setTimeout(ready, 1000);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { setTimeout(ready, 60); });

  // Contact form
  var form = $("#cform"), send = $("#send"), status = $("#status");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var fd = new FormData(form), data = {};
    ["name", "email", "phone", "service", "message", "website_url"].forEach(function (n) { data[n] = String(fd.get(n) || "").trim(); });
    if (data.website_url) { status.className = "status ok"; status.textContent = "Thank you. We have your message."; form.reset(); return; }
    var label = send.textContent;
    send.disabled = true; send.textContent = "Sending…"; status.className = "status"; status.textContent = "";
    fetch(form.getAttribute("action"), { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(data) })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.message || "Failed"); return j; }); })
      .then(function () {
        status.className = "status ok";
        status.textContent = "Thank you. We will be in touch shortly.";
        form.reset();
      })
      .catch(function () {
        status.className = "status err";
        status.innerHTML = "We could not send this online. Please email <a href=\"mailto:wisdomtechnosoft04@gmail.com\">wisdomtechnosoft04@gmail.com</a> or call <a href=\"tel:+917447331127\">+91 74473 31127</a>.";
      })
      .then(function () { send.disabled = false; send.textContent = label; });
  });
})();
```

---

index.html — small edits

Only the contact form fields need touching (keyboard types, no zoom, no autocapitalising). Replace the form's .two blocks and phone/message fields with:

```html
<div class="two">
  <label>Your name<input name="name" required autocomplete="name" autocapitalize="words" placeholder="Aarav Sharma"></label>
  <label>Email address<input type="email" name="email" required autocomplete="email" inputmode="email" autocapitalize="none" spellcheck="false" placeholder="aarav@example.com"></label>
</div>
<div class="two">
  <label>Phone / WhatsApp<input type="tel" name="phone" autocomplete="tel" inputmode="tel" placeholder="+91 98765 43210"></label>
  <label>Service<select name="service">
    <option>Software Development</option>
    <option>Telecalling Services</option>
    <option>Data Entry &amp; Management</option>
    <option>Business Process &amp; Industrial Solutions</option>
    <option>Healthcare Support / US Medical Billing</option>
    <option>General Inquiry</option>
  </select></label>
</div>
<label>Project overview<textarea name="message" rows="4" required autocapitalize="sentences" enterkeyhint="send" placeholder="Scope, timeline or goals"></textarea></label>
```

---

Quick verification checklist

· 320 px (iPhone SE): "Conversations." now fits, CTA buttons go full‑width and stack, no horizontal scroll.
· 390 px (iPhone 14): hero headline 47 px, services words ~66 px outlined, panels breathe with dividers.
· 768 px (iPad portrait): services stack with the 18 vw words, cards 2‑up, contact single column.
· ≥900 px: pinned horizontal services, full desktop layout, unchanged.
· Rotate / address bar: mark no longer jumps because height‑only resize events are ignored until width changes.
· Touch: hover lifts disabled, buttons have 44–50 px targets, 16 px inputs mean no iOS zoom.
· Reduced‑motion: all fixes coexist with the existing preference block.