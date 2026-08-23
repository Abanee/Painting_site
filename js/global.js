/* ==========================================================================
   PaintPro — Global Script
   Theme toggle · Sticky nav · Mobile overlay · Project filters ·
   Before/After slider (pointer events) · Case-study thumbs · Carousel ·
   Scroll reveal (reduced-motion aware)
   ========================================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- Theme ---------------- */
  function initTheme() {
    var stored = null;
    try { stored = localStorage.getItem("paintpro-theme"); } catch (e) {}
    var theme = stored || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", theme);

    var toggles = document.querySelectorAll("[data-theme-toggle]");
    toggles.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var current = document.documentElement.getAttribute("data-theme");
        var next = current === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        try { localStorage.setItem("paintpro-theme", next); } catch (e) {}
      });
    });
  }

  /* ---------------- Sticky nav ---------------- */
  function initNav() {
    var nav = document.querySelector("[data-nav]");
    if (!nav) return;
    function update() {
      if (window.scrollY > 40) {
        nav.classList.add("is-solid");
        nav.classList.remove("is-transparent");
      } else {
        nav.classList.remove("is-solid");
        nav.classList.add("is-transparent");
      }
    }
    update();
    window.addEventListener("scroll", update, { passive: true });

    var menuBtn = document.querySelector("[data-menu-open]");
    var closeBtn = document.querySelector("[data-menu-close]");
    var overlay = document.querySelector("[data-nav-overlay]");
    if (menuBtn && overlay) {
      menuBtn.addEventListener("click", function () {
        overlay.classList.add("is-open");
        document.body.style.overflow = "hidden";
      });
    }
    if (closeBtn && overlay) {
      closeBtn.addEventListener("click", function () {
        overlay.classList.remove("is-open");
        document.body.style.overflow = "";
      });
    }
    if (overlay) {
      overlay.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () {
          overlay.classList.remove("is-open");
          document.body.style.overflow = "";
        });
      });
    }
  }

  /* ---------------- Before / After sliders ---------------- */
  function initBeforeAfter() {
    var sliders = document.querySelectorAll("[data-ba]");
    sliders.forEach(function (root) {
      var afterImg = root.querySelector(".ba-after");
      var handle = root.querySelector(".ba-handle");
      var line = root.querySelector(".ba-line");
      if (!afterImg || !handle) return;

      var dragging = false;

      function setPos(pct) {
        pct = Math.max(0, Math.min(100, pct));
        afterImg.style.clipPath = "inset(0 0 0 " + pct + "%)";
        handle.style.left = pct + "%";
        if (line) line.style.left = pct + "%";
      }

      function posFromEvent(e) {
        var rect = root.getBoundingClientRect();
        var x = (e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0].clientX)) - rect.left;
        return (x / rect.width) * 100;
      }

      function onDown(e) {
        dragging = true;
        root.classList.add("is-dragging");
        if (handle.setPointerCapture && e.pointerId !== undefined) {
          try { handle.setPointerCapture(e.pointerId); } catch (err) {}
        }
        setPos(posFromEvent(e));
        e.preventDefault();
      }
      function onMove(e) {
        if (!dragging) return;
        setPos(posFromEvent(e));
      }
      function onUp() {
        dragging = false;
        root.classList.remove("is-dragging");
      }

      handle.addEventListener("pointerdown", onDown);
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);

      /* hover-drag on desktop even without pressing the handle first */
      root.addEventListener("pointerdown", function (e) {
        if (e.target === handle) return;
        dragging = true;
        setPos(posFromEvent(e));
      });
      root.addEventListener("pointermove", function (e) {
        if (root.matches(":hover") && e.buttons === 1) setPos(posFromEvent(e));
      });

      /* keyboard accessibility */
      handle.setAttribute("tabindex", "0");
      handle.setAttribute("role", "slider");
      handle.setAttribute("aria-label", "Before and after comparison");
      handle.setAttribute("aria-valuemin", "0");
      handle.setAttribute("aria-valuemax", "100");
      handle.addEventListener("keydown", function (e) {
        var current = parseFloat(handle.style.left) || 50;
        if (e.key === "ArrowLeft") { setPos(current - 5); e.preventDefault(); }
        if (e.key === "ArrowRight") { setPos(current + 5); e.preventDefault(); }
      });

      setPos(50);
    });
  }

  /* ---------------- Project filtering ---------------- */
  function initFilters() {
    var bar = document.querySelector("[data-filter-bar]");
    var grid = document.querySelector("[data-archive-grid]");
    var empty = document.querySelector("[data-archive-empty]");
    var countEl = document.querySelector("[data-project-count]");
    if (!bar || !grid) return;

    var chips = bar.querySelectorAll(".filter-chip");
    var cards = grid.querySelectorAll(".p-card");

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (c) { c.classList.remove("is-active"); });
        chip.classList.add("is-active");
        var val = chip.getAttribute("data-filter");
        var visible = 0;
        cards.forEach(function (card) {
          var cat = card.getAttribute("data-category");
          var show = val === "all" || cat === val;
          card.classList.toggle("is-hidden", !show);
          if (show) visible++;
        });
        if (empty) empty.classList.toggle("is-visible", visible === 0);
        if (countEl) countEl.textContent = visible + (visible === 1 ? " PROJECT" : " PROJECTS");
      });
    });
  }

  /* ---------------- Case study thumbnails ---------------- */
  function initCaseThumbs() {
    var thumbs = document.querySelectorAll("[data-case-thumb]");
    var ba = document.querySelector("[data-case-ba]");
    if (!thumbs.length || !ba) return;
    var beforeImg = ba.querySelector(".ba-before");
    var afterImg = ba.querySelector(".ba-after");

    thumbs.forEach(function (t) {
      t.addEventListener("click", function () {
        thumbs.forEach(function (o) { o.classList.remove("is-active"); });
        t.classList.add("is-active");
        var b = t.getAttribute("data-before");
        var a = t.getAttribute("data-after");
        if (b && beforeImg) beforeImg.src = b;
        if (a && afterImg) afterImg.src = a;
      });
    });

    var prev = document.querySelector("[data-case-prev]");
    var next = document.querySelector("[data-case-next]");
    var track = document.querySelector("[data-case-track]");
    if (track) {
      if (prev) prev.addEventListener("click", function () { track.scrollBy({ left: -100, behavior: reduceMotion ? "auto" : "smooth" }); });
      if (next) next.addEventListener("click", function () { track.scrollBy({ left: 100, behavior: reduceMotion ? "auto" : "smooth" }); });
    }
  }

  /* ---------------- More-from-archive carousel ---------------- */
  function initCarousel() {
    var track = document.querySelector("[data-more-track]");
    var prev = document.querySelector("[data-more-prev]");
    var next = document.querySelector("[data-more-next]");
    if (!track) return;
    function step() {
      var item = track.querySelector(".more-item");
      return item ? item.getBoundingClientRect().width + 24 : 320;
    }
    if (prev) prev.addEventListener("click", function () { track.scrollBy({ left: -step(), behavior: reduceMotion ? "auto" : "smooth" }); });
    if (next) next.addEventListener("click", function () { track.scrollBy({ left: step(), behavior: reduceMotion ? "auto" : "smooth" }); });
  }

  /* ---------------- Scroll reveal ---------------- */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });
    items.forEach(function (el) { io.observe(el); });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initTheme();
    initNav();
    initBeforeAfter();
    initFilters();
    initCaseThumbs();
    initCarousel();
    initReveal();
  });
})();
/* ============================================================
   PAINTPRO — GLOBAL JS
   Theme toggle · mobile menu · scroll reveal · counters ·
   before/after slider · smooth scroll · nav state
   ============================================================ */
(function () {
  'use strict';

  var root = document.documentElement;
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- Theme (dark / light) ---------------- */
  function initTheme() {
    var stored = null;
    try { stored = localStorage.getItem('paintpro-theme'); } catch (e) {}
    var systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = stored || (systemDark ? 'dark' : 'light');
    setTheme(theme, false);

    var buttons = document.querySelectorAll('[data-theme-btn]');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        setTheme(btn.getAttribute('data-theme-btn'), true);
      });
    });
  }

  function setTheme(theme, persist) {
    root.setAttribute('data-theme', theme);
    if (persist) {
      try { localStorage.setItem('paintpro-theme', theme); } catch (e) {}
    }
    document.querySelectorAll('[data-theme-btn]').forEach(function (btn) {
      btn.classList.toggle('is-active', btn.getAttribute('data-theme-btn') === theme);
      btn.setAttribute('aria-pressed', btn.getAttribute('data-theme-btn') === theme ? 'true' : 'false');
    });
  }

  /* ---------------- Sticky nav state ---------------- */
  function initNavScroll() {
    var nav = document.querySelector('.nav');
    if (!nav) return;
    function update() {
      nav.classList.toggle('is-scrolled', window.scrollY > 40);
    }
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  /* ---------------- Mobile menu ---------------- */
  function initMobileMenu() {
    var toggle = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (!toggle || !panel) return;

    function close() {
      toggle.classList.remove('is-open');
      panel.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
    function open() {
      toggle.classList.add('is-open');
      panel.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }

    toggle.addEventListener('click', function () {
      var isOpen = panel.classList.contains('is-open');
      isOpen ? close() : open();
    });

    panel.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', close);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
  }

  /* ---------------- Active nav link on scroll ---------------- */
  function initNavActiveState() {
    var links = document.querySelectorAll('.nav-menu a[href^="#"]');
    var sections = [];
    links.forEach(function (link) {
      var id = link.getAttribute('href').slice(1);
      var section = document.getElementById(id);
      if (section) sections.push({ link: link, section: section });
    });
    if (!sections.length) return;

    function update() {
      var pos = window.scrollY + 140;
      var current = sections[0];
      sections.forEach(function (item) {
        if (item.section.offsetTop <= pos) current = item;
      });
      sections.forEach(function (item) {
        item.link.classList.toggle('active', item === current);
      });
    }
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  /* ---------------- Smooth scroll for in-page anchors ---------------- */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var targetId = anchor.getAttribute('href');
        if (targetId.length < 2) return;
        var target = document.querySelector(targetId);
        if (!target) return;
        e.preventDefault();
        var navHeight = document.querySelector('.nav') ? document.querySelector('.nav').offsetHeight : 0;
        var top = target.getBoundingClientRect().top + window.scrollY - navHeight - 12;
        window.scrollTo({ top: top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      });
    });
  }

  /* ---------------- Scroll reveal ---------------- */
  function initScrollReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    items.forEach(function (el, i) {
      el.style.setProperty('--i', el.getAttribute('data-i') || i % 6);
      observer.observe(el);
    });
  }

  /* ---------------- Process step reveal ---------------- */
  function initProcessReveal() {
    var steps = document.querySelectorAll('.process-step');
    if (!steps.length) return;
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      steps.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var delay = parseInt(el.getAttribute('data-index') || '0', 10) * 130;
          setTimeout(function () { el.classList.add('is-visible'); }, delay);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.4 });
    steps.forEach(function (el) { observer.observe(el); });
  }

  /* ---------------- Counter animation ---------------- */
  function animateCounter(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 1400;
    var startTime = null;

    if (prefersReducedMotion) {
      el.textContent = target + suffix;
      return;
    }

    function step(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = Math.floor(eased * target);
      el.textContent = value + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target + suffix;
      }
    }
    requestAnimationFrame(step);
  }

  function initCounters() {
    var counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;
    if (!('IntersectionObserver' in window)) {
      counters.forEach(animateCounter);
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { observer.observe(el); });
  }

  /* ---------------- Before / After slider ---------------- */
  function initBeforeAfter() {
    var sliders = document.querySelectorAll('[data-ba-slider]');
    sliders.forEach(function (slider) {
      var afterWrap = slider.querySelector('.ba-after-wrap');
      var handle = slider.querySelector('.ba-handle');
      if (!afterWrap || !handle) return;
      var dragging = false;

      function setPosition(percent) {
        percent = Math.max(2, Math.min(98, percent));
        afterWrap.style.clipPath = 'inset(0 0 0 ' + percent + '%)';
        handle.style.left = percent + '%';
      }

      function positionFromEvent(clientX) {
        var rect = slider.getBoundingClientRect();
        var percent = ((clientX - rect.left) / rect.width) * 100;
        setPosition(percent);
      }

      function onMove(e) {
        if (!dragging) return;
        var clientX = e.touches ? e.touches[0].clientX : e.clientX;
        positionFromEvent(clientX);
      }
      function onUp() {
        dragging = false;
        document.body.style.userSelect = '';
      }

      handle.addEventListener('mousedown', function () { dragging = true; document.body.style.userSelect = 'none'; });
      handle.addEventListener('touchstart', function () { dragging = true; }, { passive: true });
      slider.addEventListener('click', function (e) {
        if (e.target === handle || handle.contains(e.target)) return;
        positionFromEvent(e.clientX);
      });

      window.addEventListener('mousemove', onMove);
      window.addEventListener('touchmove', onMove, { passive: true });
      window.addEventListener('mouseup', onUp);
      window.addEventListener('touchend', onUp);

      // Keyboard accessibility
      handle.setAttribute('tabindex', '0');
      handle.setAttribute('role', 'slider');
      handle.setAttribute('aria-label', 'Before and after comparison slider');
      handle.setAttribute('aria-valuemin', '0');
      handle.setAttribute('aria-valuemax', '100');
      handle.addEventListener('keydown', function (e) {
        var current = parseFloat(handle.style.left) || 50;
        if (e.key === 'ArrowLeft') { setPosition(current - 5); e.preventDefault(); }
        if (e.key === 'ArrowRight') { setPosition(current + 5); e.preventDefault(); }
      });

      setPosition(50);
    });
  }

  /* ---------------- Hero load-in ---------------- */
  function initHeroLoad() {
    var hero = document.querySelector('.hero');
    if (!hero) return;
    requestAnimationFrame(function () {
      setTimeout(function () { hero.classList.add('is-loaded'); }, 80);
    });
  }

  /* ---------------- Hero 2 load-in ---------------- */
  function initHero2Load() {
    var hero = document.querySelector('.hero2');
    if (!hero) return;
    requestAnimationFrame(function () {
      setTimeout(function () { hero.classList.add('is-loaded'); }, 80);
    });
  }

  /* ---------------- Decision panel (Home 2 hero) ---------------- */
  function initDecisionPanel() {
    var options = document.querySelectorAll('[data-decision-option]');
    if (!options.length) return;
    options.forEach(function (opt) {
      opt.addEventListener('click', function () {
        options.forEach(function (o) { o.classList.remove('is-active'); });
        opt.classList.add('is-active');
      });
    });
  }

  /* ---------------- Surface diagnosis hotspots ---------------- */
  function initDiagnosisHotspots() {
    var hotspots = document.querySelectorAll('[data-hotspot]');
    var panelTitle = document.querySelector('[data-diagnosis-title]');
    var panelCause = document.querySelector('[data-diagnosis-cause]');
    var panelFix = document.querySelector('[data-diagnosis-fix]');
    if (!hotspots.length || !panelTitle) return;

    function activate(hotspot) {
      hotspots.forEach(function (h) { h.classList.remove('is-active'); });
      hotspot.classList.add('is-active');
      panelTitle.textContent = hotspot.getAttribute('data-title') || '';
      if (panelCause) panelCause.textContent = hotspot.getAttribute('data-cause') || '';
      if (panelFix) panelFix.textContent = hotspot.getAttribute('data-fix') || '';
    }

    hotspots.forEach(function (h) {
      h.addEventListener('click', function () { activate(h); });
      h.addEventListener('mouseenter', function () { activate(h); });
    });
  }

  /* ---------------- Protection system layer reveal ---------------- */
  function initProtectionReveal() {
    var layers = document.querySelectorAll('.protection-layer');
    if (!layers.length) return;
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      layers.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          layers.forEach(function (el, i) {
            var delay = parseInt(el.getAttribute('data-layer') || i, 10) * 140;
            setTimeout(function () { el.classList.add('is-visible'); }, delay);
          });
          observer.disconnect();
        }
      });
    }, { threshold: 0.35 });
    observer.observe(layers[0].closest('.protection-visual'));
  }

  /* ---------------- Featured transformation story slider ---------------- */
  function initStorySlider() {
    var track = document.querySelector('[data-story-track]');
    if (!track) return;
    var slides = track.querySelectorAll('.story-slide');
    var dots = document.querySelectorAll('[data-story-dot]');
    var prevBtn = document.querySelector('[data-story-prev]');
    var nextBtn = document.querySelector('[data-story-next]');
    var index = 0;

    function update() {
      track.style.transform = 'translateX(-' + (index * 100) + '%)';
      dots.forEach(function (d, i) { d.classList.toggle('is-active', i === index); });
    }
    function go(delta) {
      index = (index + delta + slides.length) % slides.length;
      update();
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { go(-1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { go(1); });
    dots.forEach(function (d, i) {
      d.addEventListener('click', function () { index = i; update(); });
    });
    update();
  }

  /* ---------------- Services hero load-in ---------------- */
  function initServicesHeroLoad() {
    var hero = document.querySelector('.svc-hero');
    if (!hero) return;
    requestAnimationFrame(function () {
      setTimeout(function () { hero.classList.add('is-loaded'); }, 80);
    });
  }

  /* ---------------- Service scope step reveal ---------------- */
  function initScopeReveal() {
    var steps = document.querySelectorAll('.svc-scope-step');
    if (!steps.length) return;
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      steps.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    steps.forEach(function (el) { observer.observe(el); });
  }

  /* ---------------- Service detail explorer (tabs) ---------------- */
  function initServiceExplorer() {
    var tabs = document.querySelectorAll('[data-explorer-tab]');
    if (!tabs.length) return;

    var media = document.querySelector('[data-explorer-image]');
    var content = document.querySelector('[data-explorer-content]');
    var tag = document.querySelector('[data-explorer-tag]');
    var name = document.querySelector('[data-explorer-name]');
    var bestfor = document.querySelector('[data-explorer-bestfor]');
    var prep = document.querySelector('[data-explorer-prep]');
    var finish = document.querySelector('[data-explorer-finish]');
    var note = document.querySelector('[data-explorer-note]');

    function activate(tab) {
      tabs.forEach(function (t) { t.classList.remove('is-active'); });
      tab.classList.add('is-active');

      var apply = function () {
        if (tag) tag.textContent = tab.getAttribute('data-tag') || '';
        if (name) name.textContent = tab.getAttribute('data-name') || '';
        if (bestfor) bestfor.textContent = tab.getAttribute('data-bestfor') || '';
        if (prep) prep.textContent = tab.getAttribute('data-prep') || '';
        if (finish) finish.textContent = tab.getAttribute('data-finish') || '';
        if (note) note.textContent = tab.getAttribute('data-note') || '';
        if (media) {
          var newSrc = tab.getAttribute('data-image');
          if (newSrc) media.setAttribute('src', newSrc);
        }
      };

      if (prefersReducedMotion || !content || !media) {
        apply();
        return;
      }

      content.classList.add('is-fading');
      media.classList.add('is-fading');
      setTimeout(function () {
        apply();
        content.classList.remove('is-fading');
        media.classList.remove('is-fading');
      }, 220);
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () { activate(tab); });
    });
  }

  /* ---------------- Service selector (need -> recommendation) ---------------- */
  function initServiceSelector() {
    var options = document.querySelectorAll('[data-selector-option]');
    if (!options.length) return;

    var result = document.querySelector('[data-selector-result]');
    var needEl = document.querySelector('[data-selector-need]');
    var recEl = document.querySelector('[data-selector-rec]');
    var whyEl = document.querySelector('[data-selector-why]');

    options.forEach(function (opt) {
      opt.addEventListener('click', function () {
        options.forEach(function (o) { o.classList.remove('is-active'); });
        opt.classList.add('is-active');

        if (needEl) needEl.textContent = '"' + (opt.getAttribute('data-need') || '') + '"';
        if (recEl) recEl.textContent = opt.getAttribute('data-rec') || '';
        if (whyEl) whyEl.textContent = opt.getAttribute('data-why') || '';
        if (result) {
          result.classList.add('is-visible');
          if (!prefersReducedMotion) {
            result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }
      });
    });
  }

  /* ---------------- About hero load-in ---------------- */
  function initAboutHeroLoad() {
    var hero = document.querySelector('.ab-hero');
    if (!hero) return;
    requestAnimationFrame(function () {
      setTimeout(function () { hero.classList.add('is-loaded'); }, 80);
    });
  }

  /* ---------------- About principles reveal ---------------- */
  function initPrinciplesReveal() {
    var items = document.querySelectorAll('.ab-principle');
    if (!items.length) return;
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var delay = parseInt(el.getAttribute('data-index') || '0', 10) * 110;
          setTimeout(function () { el.classList.add('is-visible'); }, delay);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.3 });
    items.forEach(function (el) { observer.observe(el); });
  }

  /* ---------------- About culture statements reveal ---------------- */
  function initCultureReveal() {
    var items = document.querySelectorAll('.ab-culture-item');
    if (!items.length) return;
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var delay = parseInt(el.getAttribute('data-index') || '0', 10) * 130;
          setTimeout(function () { el.classList.add('is-visible'); }, delay);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.35 });
    items.forEach(function (el) { observer.observe(el); });
  }

  /* ---------------- About "day on site" line draw ---------------- */
  function initDayTrackReveal() {
    var track = document.querySelector('.ab-day-track');
    if (!track) return;
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      track.classList.add('is-visible');
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    observer.observe(track);
  }

  /* ---------------- Init ---------------- */
  document.addEventListener('DOMContentLoaded', function () {
    initTheme();
    initNavScroll();
    initMobileMenu();
    initNavActiveState();
    initSmoothScroll();
    initScrollReveal();
    initProcessReveal();
    initCounters();
    initBeforeAfter();
    initHeroLoad();
    initHero2Load();
    initDecisionPanel();
    initDiagnosisHotspots();
    initProtectionReveal();
    initStorySlider();
    initServicesHeroLoad();
    initScopeReveal();
    initServiceExplorer();
    initServiceSelector();
    initAboutHeroLoad();
    initPrinciplesReveal();
    initCultureReveal();
    initDayTrackReveal();
  });
})();

/* ==========================================================================
   MAINTENANCE & CARE — interactions
   Maintenance clock · 12-month calendar · Property care zones ·
   Interactive checklist · Print
   ========================================================================== */
(function () {
  "use strict";
  if (!document.querySelector(".mnt-hero") && !document.querySelector("[data-mnt-calendar]")) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- Maintenance clock ---------------- */
  function initClock() {
    var stages = document.querySelectorAll("[data-clock-stage]");
    if (!stages.length) return;
    stages.forEach(function (s, i) {
      s.addEventListener("click", function () {
        stages.forEach(function (o) { o.classList.remove("is-active"); });
        s.classList.add("is-active");
      });
      s.addEventListener("mouseenter", function () {
        stages.forEach(function (o) { o.classList.remove("is-active"); });
        s.classList.add("is-active");
      });
      if (i === 0) s.classList.add("is-active");
    });
  }

  /* ---------------- 12-month calendar ---------------- */
  var CARE_MONTHS = [
    { key: "jan", label: "JAN", title: "New Year Walkthrough", caption: "A fresh-start visual pass before the year gets busy.",
      items: ["Exterior walls for visible marks", "Entry points and door frames", "Previous repair or touch-up areas", "General condition notes"],
      tip: "A short walk-around now makes it easier to spot changes later in the year.",
      img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=80&auto=format&fit=crop" },
    { key: "feb", label: "FEB", title: "Trim & Detail Check", caption: "A closer look at the smaller surfaces that get overlooked.",
      items: ["Window frames and grilles", "Railings and metal fittings", "Touch-up areas from last year", "Door and gate hardware"],
      tip: "Small details often show wear before larger surfaces do.",
      img: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=900&q=80&auto=format&fit=crop" },
    { key: "mar", label: "MAR", title: "Pre-Summer Preparation", caption: "Getting ahead of stronger sun and rising temperatures.",
      items: ["Sun-facing exterior walls", "Terrace coating condition", "Expansion joints and seams", "Faded or chalky areas"],
      tip: "Surfaces facing direct sun tend to show change first.",
      img: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=900&q=80&auto=format&fit=crop" },
    { key: "apr", label: "APR", title: "Heat Exposure Review", caption: "Checking how surfaces are holding up under peak heat.",
      items: ["Exterior paint for fading", "Sealant around joints", "Roof and parapet edges", "Any early cracking"],
      tip: "Note any changes so they're easy to compare against later checks.",
      img: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&q=80&auto=format&fit=crop" },
    { key: "may", label: "MAY", title: "Pre-Monsoon Readiness", caption: "A practical check before heavier rain arrives.",
      items: ["Gutters and downpipes", "Terrace slope and drainage", "Existing cracks or gaps", "Loose or lifting surfaces"],
      tip: "Clearing drainage paths now can help rain run off as intended.",
      img: "https://images.unsplash.com/photo-1615529182904-14819c35db37?w=900&q=80&auto=format&fit=crop" },
    { key: "jun", label: "JUN", title: "Monsoon Preparation", caption: "A focused check as the season sets in.",
      items: ["Exterior walls for dampness or peeling", "Terrace drainage and slope", "Balcony edges and joints", "Visible cracks or surface deterioration"],
      tip: "Clear drainage, check joints, and look for early moisture signs before heavy rain.",
      img: "https://images.unsplash.com/photo-1646592474103-cfd22d1d9e34?w=900&q=80&auto=format&fit=crop" },
    { key: "jul", label: "JUL", title: "Active Monsoon Watch", caption: "Keeping an eye on things while the rain continues.",
      items: ["Seepage marks indoors", "Damp patches near windows", "Paint bubbling or softening", "Standing water on flat surfaces"],
      tip: "Photograph anything new so you can track if it changes.",
      img: "https://images.unsplash.com/photo-1591588582259-d4ee19da4ba0?w=900&q=80&auto=format&fit=crop" },
    { key: "aug", label: "AUG", title: "Mid-Monsoon Check", caption: "A second pass partway through the season.",
      items: ["Recurring damp spots", "Balcony water pooling", "Exterior staining or streaks", "Ventilation in wet areas"],
      tip: "Recurring issues in the same spot are worth noting for later.",
      img: "https://images.unsplash.com/photo-1750639258774-9a714379a093?w=900&q=80&auto=format&fit=crop" },
    { key: "sep", label: "SEP", title: "Post-Monsoon Assessment", caption: "Reviewing how surfaces held up once rain eases.",
      items: ["Algae or fungal growth", "Peeling caused by moisture", "Blocked or slow drainage", "Discoloured or dull patches"],
      tip: "This is often the clearest time to see what the season left behind.",
      img: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=900&q=80&auto=format&fit=crop" },
    { key: "oct", label: "OCT", title: "Post-Weather Check", caption: "A detailed look once the weather has settled.",
      items: ["Stains on interior or exterior surfaces", "Peeling or flaking paint", "Cracks that appeared or widened", "Moisture marks near joints"],
      tip: "Compare against earlier notes to see what's changed.",
      img: "https://images.unsplash.com/photo-1721815693498-cc28507c0ba2?w=900&q=80&auto=format&fit=crop" },
    { key: "nov", label: "NOV", title: "Festive Refresh Review", caption: "A tidy-up check before gatherings and visitors.",
      items: ["Entryway and common-area finishes", "Visible wear near high-traffic spots", "Touch-up candidates", "Lighting and fixture surrounds"],
      tip: "A quick refresh check can go a long way before guests arrive.",
      img: "https://images.unsplash.com/photo-1520587393050-c5298e1a8486?w=900&q=80&auto=format&fit=crop" },
    { key: "dec", label: "DEC", title: "Exterior Review", caption: "A year-end look at the outside of the property.",
      items: ["Faded or sun-worn surfaces", "Exposed or unprotected areas", "Overall coating condition", "Notes to carry into next year"],
      tip: "Use this review to plan any bigger maintenance for the year ahead.",
      img: "https://images.unsplash.com/photo-1760044280686-c5bf1edf3cbb?w=900&q=80&auto=format&fit=crop" }
  ];

  function initCalendar() {
    var wrap = document.querySelector("[data-mnt-calendar]");
    if (!wrap) return;
    var btns = wrap.querySelectorAll("[data-month]");
    var img = wrap.querySelector("[data-cal-img]");
    var monthLabel = wrap.querySelector("[data-cal-monthlabel]");
    var title = wrap.querySelector("[data-cal-title]");
    var caption = wrap.querySelector("[data-cal-caption]");
    var list = wrap.querySelector("[data-cal-list]");
    var tip = wrap.querySelector("[data-cal-tip]");
    var prev = wrap.querySelector("[data-cal-prev]");
    var next = wrap.querySelector("[data-cal-next]");
    var index = 5; /* June, matches the static markup */

    function render() {
      var m = CARE_MONTHS[index];
      btns.forEach(function (b) { b.classList.toggle("is-active", b.getAttribute("data-month") === m.key); });
      if (img) img.setAttribute("src", m.img);
      if (monthLabel) monthLabel.textContent = m.label + " \u2014 " + new Date(2026, index, 1).toLocaleString("en-US", { month: "long" }).toUpperCase();
      if (title) title.textContent = m.title;
      if (caption) caption.textContent = m.caption;
      if (tip) tip.textContent = m.tip;
      if (list) {
        list.innerHTML = "";
        m.items.forEach(function (it) {
          var li = document.createElement("li");
          li.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg><span></span>';
          li.querySelector("span").textContent = it;
          list.appendChild(li);
        });
      }
      var active = wrap.querySelector('.mnt-month-btn.is-active');
      if (active && active.scrollIntoView) active.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", inline: "center", block: "nearest" });
    }

    btns.forEach(function (b, i) {
      b.addEventListener("click", function () { index = i; render(); });
    });
    if (prev) prev.addEventListener("click", function () { index = (index - 1 + 12) % 12; render(); });
    if (next) next.addEventListener("click", function () { index = (index + 1) % 12; render(); });

    render();
  }

  /* ---------------- Property care zones ---------------- */
  function initZones() {
    var wrap = document.querySelector("[data-mnt-zones]");
    if (!wrap) return;
    var pins = wrap.querySelectorAll("[data-zone]");
    var iconEl = wrap.querySelector("[data-zone-icon]");
    var nameEl = wrap.querySelector("[data-zone-name]");
    var watchEl = wrap.querySelector("[data-zone-watch]");
    var oftenEl = wrap.querySelector("[data-zone-often]");
    var helpEl = wrap.querySelector("[data-zone-help]");

    function activate(pin) {
      pins.forEach(function (p) { p.classList.remove("is-active"); });
      pin.classList.add("is-active");
      if (nameEl) nameEl.textContent = pin.getAttribute("data-name") || "";
      if (watchEl) watchEl.textContent = pin.getAttribute("data-watch") || "";
      if (oftenEl) oftenEl.textContent = pin.getAttribute("data-often") || "";
      if (helpEl) helpEl.textContent = pin.getAttribute("data-help") || "";
      if (iconEl) iconEl.innerHTML = pin.getAttribute("data-icon") || "";
    }

    pins.forEach(function (p) {
      p.addEventListener("click", function () { activate(p); });
    });
    if (pins.length) activate(pins[0]);
  }

  /* ---------------- Checklist ---------------- */
  function initChecklist() {
    var wrap = document.querySelector("[data-mnt-checklist]");
    if (!wrap) return;
    var items = wrap.querySelectorAll(".mnt-check-item");
    var progress = wrap.querySelector("[data-check-progress]");
    var printBtn = wrap.querySelector("[data-check-print]");

    function update() {
      var checked = wrap.querySelectorAll(".mnt-check-item.is-checked").length;
      if (progress) progress.textContent = checked + " / " + items.length;
    }

    items.forEach(function (item) {
      item.setAttribute("tabindex", "0");
      item.setAttribute("role", "checkbox");
      item.setAttribute("aria-checked", "false");
      function toggle() {
        var isChecked = item.classList.toggle("is-checked");
        item.setAttribute("aria-checked", isChecked ? "true" : "false");
        update();
      }
      item.addEventListener("click", toggle);
      item.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
      });
    });

    if (printBtn) {
      printBtn.addEventListener("click", function () { window.print(); });
    }
    update();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initClock();
    initCalendar();
    initZones();
    initChecklist();
  });
})();

/* ==========================================================================
   PaintPro — RTL Toggle, Auth Modal & Contact Page Enhancement
   ========================================================================== */
(function () {
  'use strict';

  /* ---------------- RTL Mode Controller ---------------- */
  function initRTL() {
    var storedRTL = null;
    try { storedRTL = localStorage.getItem('paintpro-rtl'); } catch (e) {}
    var isRTL = storedRTL === 'true';

    function setRTL(state) {
      if (state) {
        document.documentElement.setAttribute('dir', 'rtl');
      } else {
        document.documentElement.removeAttribute('dir');
      }
      try { localStorage.setItem('paintpro-rtl', state ? 'true' : 'false'); } catch (e) {}

      document.querySelectorAll('[data-rtl-toggle]').forEach(function (btn) {
        btn.classList.toggle('is-active', state);
        btn.setAttribute('aria-pressed', state ? 'true' : 'false');
        var label = btn.querySelector('span');
        if (label) {
          label.textContent = state ? 'LTR' : 'RTL';
        }
      });
    }

    setRTL(isRTL);

    document.querySelectorAll('[data-rtl-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var current = document.documentElement.getAttribute('dir') === 'rtl';
        setRTL(!current);
      });
    });
  }

  /* ---------------- Auth / Client Login Modal ---------------- */
  function initAuthModal() {
    var modal = document.querySelector('[data-auth-modal]');
    if (!modal) return;

    var openBtns = document.querySelectorAll('[data-login-open]');
    var closeBtns = modal.querySelectorAll('[data-modal-close]');
    var tabs = modal.querySelectorAll('[data-auth-tab]');
    var form = modal.querySelector('#authForm');
    var autofillBtn = modal.querySelector('#authAutofill');
    var successMsg = modal.querySelector('#authSuccessMsg');
    var emailInput = modal.querySelector('#authEmail');
    var passInput = modal.querySelector('#authPassword');
    var submitBtn = modal.querySelector('#authSubmit');

    function openModal() {
      modal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      if (emailInput) setTimeout(function () { emailInput.focus(); }, 100);
    }

    function closeModal() {
      modal.classList.remove('is-open');
      document.body.style.overflow = '';
      if (successMsg) successMsg.style.display = 'none';
    }

    openBtns.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        openModal();
      });
    });

    closeBtns.forEach(function (btn) {
      btn.addEventListener('click', closeModal);
    });

    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) {
        closeModal();
      }
    });

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) { t.classList.remove('is-active'); });
        tab.classList.add('is-active');
        var mode = tab.getAttribute('data-auth-tab');
        if (submitBtn) {
          submitBtn.textContent = mode === 'register' ? 'Request Portal Access' : 'Sign In to Portal';
        }
      });
    });

    if (autofillBtn && emailInput && passInput) {
      autofillBtn.addEventListener('click', function () {
        emailInput.value = 'client@paintpro.com';
        passInput.value = 'PaintPro#2026';
      });
    }

    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (submitBtn) {
          var origText = submitBtn.textContent;
          submitBtn.textContent = 'Authenticating...';
          submitBtn.disabled = true;

          setTimeout(function () {
            submitBtn.textContent = origText;
            submitBtn.disabled = false;
            if (successMsg) {
              successMsg.textContent = 'Welcome back! Redirecting to PaintPro Project Dashboard...';
              successMsg.style.display = 'block';
              successMsg.classList.add('is-success');
            }
            setTimeout(function () {
              closeModal();
            }, 1800);
          }, 800);
        }
      });
    }
  }

  /* ---------------- Contact Page Form & FAQ ---------------- */
  function initContactPage() {
    var contactForm = document.querySelector('#contactInquiryForm');
    var successBanner = document.querySelector('#contactSuccessBanner');

    if (contactForm && successBanner) {
      contactForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var submitBtn = contactForm.querySelector('button[type="submit"]');
        if (submitBtn) {
          var originalContent = submitBtn.innerHTML;
          submitBtn.innerHTML = 'Sending Details...';
          submitBtn.disabled = true;

          setTimeout(function () {
            submitBtn.innerHTML = originalContent;
            submitBtn.disabled = false;
            contactForm.reset();
            successBanner.classList.add('is-visible');
            successBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 900);
        }
      });
    }

    var faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(function (item) {
      var question = item.querySelector('.faq-question');
      if (question) {
        question.addEventListener('click', function () {
          var isOpen = item.classList.contains('is-open');
          faqItems.forEach(function (other) { other.classList.remove('is-open'); });
          if (!isOpen) item.classList.add('is-open');
        });
      }
    });
  }

  /* ---------------- Initialize ---------------- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initRTL();
      initAuthModal();
      initContactPage();
    });
  } else {
    initRTL();
    initAuthModal();
    initContactPage();
  }
})();

