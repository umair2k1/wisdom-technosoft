/* ============================================================
   Wisdom Technosoft — interaction layer
   Reveal, split text, sticky vision, nav, menu, progress.
   ============================================================ */
(function () {
  "use strict";

  var body = document.body;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var desktop = function () { return window.innerWidth > 980; };

  /* ---------- Split text ---------- */

  function splitWords(rootEl) {
    function walk(node) {
      if (node.nodeType === 3) {
        var text = node.nodeValue;
        if (!text) return null;
        var frag = document.createDocumentFragment();
        var parts = text.split(/(\s+)/);
        parts.forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(part));
            return;
          }
          var word = document.createElement("span");
          word.className = "word";
          var inner = document.createElement("span");
          inner.className = "word-in";
          inner.textContent = part;
          word.appendChild(inner);
          frag.appendChild(word);
        });
        return frag;
      }
      if (node.nodeType === 1) {
        if (node.tagName === "BR") return node.cloneNode();
        var clone = node.cloneNode(false);
        Array.prototype.forEach.call(node.childNodes, function (child) {
          var result = walk(child);
          if (result) clone.appendChild(result);
        });
        return clone;
      }
      return null;
    }

    var fragment = document.createDocumentFragment();
    Array.prototype.forEach.call(rootEl.childNodes, function (child) {
      var result = walk(child);
      if (result) fragment.appendChild(result);
    });
    rootEl.replaceChildren(fragment);
    rootEl.querySelectorAll(".word").forEach(function (word, i) {
      word.style.setProperty("--i", i);
    });
  }

  document.querySelectorAll("[data-split]").forEach(splitWords);

  /* ---------- Hero letters ---------- */

  var heroTitle = document.querySelector("[data-chars]");
  if (heroTitle) {
    var heroText = heroTitle.textContent.trim();
    heroTitle.setAttribute("aria-label", heroText);
    var heroFrag = document.createDocumentFragment();
    Array.from(heroText).forEach(function (char, i) {
      var outer = document.createElement("span");
      outer.className = "char";
      outer.setAttribute("aria-hidden", "true");
      outer.style.setProperty("--i", i);
      var inner = document.createElement("span");
      inner.className = "char-in";
      inner.textContent = char;
      outer.appendChild(inner);
      heroFrag.appendChild(outer);
    });
    heroTitle.replaceChildren(heroFrag);
  }

  /* ---------- Entrance ---------- */

  var isReady = false;
  function ready() {
    if (isReady) return;
    isReady = true;
    body.classList.add("is-ready");
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { setTimeout(ready, 80); });
  }
  setTimeout(ready, 1200);
  window.addEventListener("load", function () { setTimeout(ready, 120); });

  /* ---------- Reveal ---------- */

  var revealEls = Array.prototype.slice.call(
    document.querySelectorAll("[data-reveal], [data-split]")
  );

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -7% 0px" }
    );

    revealEls.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.94 && rect.bottom > 0) {
        el.classList.add("is-in");
      } else {
        revealObserver.observe(el);
      }
    });
  }

  /* ---------- Nav, progress, parallax ---------- */

  var nav = document.getElementById("nav");
  var progressBar = document.querySelector(".progress-bar");
  var hero = document.querySelector(".hero");
  var heroMark = document.querySelector(".hero-mark");
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-links a"));
  var sections = navLinks
    .map(function (link) { return document.querySelector(link.getAttribute("href")); })
    .filter(Boolean);
  var lastY = window.scrollY;
  var ticking = false;

  function updateActiveLink() {
    if (!sections.length) return;
    var marker = window.innerHeight * 0.38;
    var current = null;

    sections.forEach(function (section) {
      var rect = section.getBoundingClientRect();
      if (rect.top <= marker && rect.bottom > marker) current = section.id;
    });

    navLinks.forEach(function (link) {
      var active = current !== null && link.getAttribute("href") === "#" + current;
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }

  var visionScroll = document.querySelector(".vision-scroll");
  var visionWords = Array.prototype.slice.call(document.querySelectorAll(".vision-quote .vw"));

  function updateVision() {
    if (!visionScroll || !visionWords.length) return;
    if (reduceMotion || !desktop()) {
      visionWords.forEach(function (word) { word.classList.add("is-lit"); });
      return;
    }
    var rect = visionScroll.getBoundingClientRect();
    var distance = visionScroll.offsetHeight - window.innerHeight;
    var progress = distance > 0 ? (-rect.top) / distance : 1;
    progress = Math.max(0, Math.min(1, progress));
    var lit = Math.round(Math.max(0, Math.min(1, (progress - 0.06) / 0.74)) * visionWords.length);
    visionWords.forEach(function (word, i) {
      word.classList.toggle("is-lit", i < lit);
    });
  }

  function onScroll() {
    var y = window.scrollY;
    var scrollable = document.documentElement.scrollHeight - window.innerHeight;

    if (progressBar) {
      progressBar.style.transform = "scaleX(" + (scrollable > 0 ? y / scrollable : 0).toFixed(4) + ")";
    }

    if (nav) {
      nav.classList.toggle("is-scrolled", y > 48);
      if (body.classList.contains("menu-open")) {
        nav.classList.remove("is-hidden");
      } else {
        nav.classList.toggle("is-hidden", y > 360 && y > lastY + 1);
      }
    }
    lastY = y;

    if (!reduceMotion && desktop() && hero && heroMark) {
      var heroHeight = hero.offsetHeight;
      if (y <= heroHeight) {
        heroMark.style.transform = "translate3d(0," + (y * 0.16).toFixed(1) + "px,0) rotate(-4deg)";
      }
    }

    updateActiveLink();
    updateVision();
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(onScroll);
      }
    },
    { passive: true }
  );

  window.addEventListener("resize", function () {
    if (menuOpen && window.innerWidth > 980) setMenu(false);
    onScroll();
  });

  /* ---------- Mobile menu ---------- */

  var menu = document.getElementById("menu");
  var menuToggle = document.querySelector(".menu-toggle");
  var menuLinks = Array.prototype.slice.call(document.querySelectorAll(".menu-links a"));
  var menuOpen = false;

  function setMenu(open) {
    menuOpen = open;
    body.classList.toggle("menu-open", open);
    if (menuToggle) {
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }
    if (menu) menu.setAttribute("aria-hidden", String(!open));
    if (open) {
      nav.classList.remove("is-hidden");
      window.setTimeout(function () {
        if (menuLinks[0]) menuLinks[0].focus();
      }, 520);
    } else if (document.activeElement && menu.contains(document.activeElement) && menuToggle) {
      menuToggle.focus();
    }
  }

  if (menuToggle) {
    menuToggle.addEventListener("click", function () { setMenu(!menuOpen); });
  }
  menuLinks.forEach(function (link) {
    link.addEventListener("click", function () { setMenu(false); });
  });
  var menuFootLinks = Array.prototype.slice.call(document.querySelectorAll(".menu-foot a"));
  document.addEventListener("keydown", function (event) {
    if (!menuOpen) return;
    if (event.key === "Escape") {
      setMenu(false);
      return;
    }
    if (event.key !== "Tab") return;
    var focusables = [menuToggle].concat(menuLinks, menuFootLinks).filter(Boolean);
    if (!focusables.length) return;
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  /* ---------- Contact form progressive enhancement ---------- */

  var contactForm = document.getElementById("contact-form");
  if (contactForm) {
    var submitBtn = document.getElementById("contact-submit");
    var statusEl = document.getElementById("form-status");

    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      var formData = new FormData(contactForm);
      var payload = {
        name: (formData.get("name") || "").toString().trim(),
        email: (formData.get("email") || "").toString().trim(),
        phone: (formData.get("phone") || "").toString().trim(),
        service: (formData.get("service") || "").toString().trim(),
        message: (formData.get("message") || "").toString().trim(),
        website_url: (formData.get("website_url") || "").toString().trim()
      };

      // Honeypot check: reject bots quietly
      if (payload.website_url) {
        if (statusEl) {
          statusEl.className = "form-status is-success";
          statusEl.textContent = "Thank you! Your message has been received.";
        }
        contactForm.reset();
        return;
      }

      var origBtnContent = submitBtn ? submitBtn.innerHTML : "";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = "<span>Sending inquiry...</span>";
      }
      if (statusEl) {
        statusEl.className = "form-status";
        statusEl.style.display = "none";
      }

      fetch(contactForm.getAttribute("action") || "/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload)
      })
      .then(function (res) {
        if (!res.ok) {
          return res.json().then(function (data) {
            throw new Error(data && data.message ? data.message : "Submission failed");
          }).catch(function () {
            throw new Error("Unable to send inquiry at this time.");
          });
        }
        return res.json();
      })
      .then(function () {
        if (statusEl) {
          statusEl.className = "form-status is-success";
          statusEl.textContent = "Thank you! Your inquiry has been sent. We will get back to you within 1 business day.";
        }
        contactForm.reset();
      })
      .catch(function (err) {
        if (statusEl) {
          statusEl.className = "form-status is-error";
          statusEl.innerHTML = "Could not send form online (" + (err.message || "Network issue") + "). Please reach out directly to <a href=\"mailto:wisdomtechnosoft04@gmail.com\" style=\"color:inherit;text-decoration:underline;\">wisdomtechnosoft04@gmail.com</a> or <a href=\"tel:+917447331127\" style=\"color:inherit;text-decoration:underline;\">+91 74473 31127</a>.";
        }
      })
      .finally(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = origBtnContent;
        }
      });
    });
  }

  /* ---------- Kick off ---------- */

  onScroll();
})();

