/* ==========================================================================
   PaintPro — Unified Global Script
   Theme toggle · Sticky nav · Mobile overlay · Project filters ·
   Before/After slider · Case-study thumbs · Carousel · Scroll reveal ·
   Auth Modal & Standalone Forms · Contact Form · Hero2 Carousel
   ========================================================================== */

/* Global menu toggle function accessible everywhere */
window.toggleMobileMenu = function (e, forceClose) {
  if (e && typeof e.preventDefault === "function") e.preventDefault();
  var overlay = document.querySelector("#mobilePanel, .mobile-panel, [data-nav-overlay]");
  var toggles = document.querySelectorAll(".menu-toggle, .menu-btn, [data-menu-open]");
  if (!overlay) return;

  var isOpen = forceClose === true ? false : (forceClose === false ? true : !overlay.classList.contains("is-open"));
  overlay.classList.toggle("is-open", isOpen);
  toggles.forEach(function (btn) {
    btn.classList.toggle("is-open", isOpen);
    btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });
  document.body.style.overflow = isOpen ? "hidden" : "";
};

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- Theme ---------------- */
  function initTheme() {
    var stored = null;
    try { stored = localStorage.getItem("paintpro-theme"); } catch (e) {}
    var theme = stored || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", theme);

    var toggles = document.querySelectorAll("[data-theme-toggle], [data-theme-btn]");
    toggles.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var current = document.documentElement.getAttribute("data-theme");
        var next = current === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        try { localStorage.setItem("paintpro-theme", next); } catch (e) {}
      });
    });
  }

  /* ---------------- RTL ---------------- */
  function initRTL() {
    var stored = null;
    try { stored = localStorage.getItem("paintpro-dir"); } catch (e) {}
    if (stored) {
      document.documentElement.setAttribute("dir", stored);
    }
    var currentDir = document.documentElement.getAttribute("dir") || "ltr";
    var rtlToggles = document.querySelectorAll("[data-rtl-toggle]");
    rtlToggles.forEach(function (btn) {
      btn.classList.toggle("is-active", currentDir === "rtl");
      btn.addEventListener("click", function () {
        var dir = document.documentElement.getAttribute("dir") || "ltr";
        var next = dir === "rtl" ? "ltr" : "rtl";
        document.documentElement.setAttribute("dir", next);
        rtlToggles.forEach(function (b) {
          b.classList.toggle("is-active", next === "rtl");
        });
        try { localStorage.setItem("paintpro-dir", next); } catch (e) {}
      });
    });
  }

  /* ---------------- Sticky nav & Mobile Drawer ---------------- */
  function initNav() {
    var nav = document.querySelector("[data-nav], .nav, #top");
    if (nav) {
      function update() {
        if (window.scrollY > 40) {
          nav.classList.add("is-solid");
          nav.classList.add("is-scrolled");
          nav.classList.remove("is-transparent");
        } else {
          nav.classList.remove("is-solid");
          nav.classList.remove("is-scrolled");
          nav.classList.add("is-transparent");
        }
      }
      update();
      window.addEventListener("scroll", update, { passive: true });
    }

    // Delegated click handler for drawer close and page link navigation
    document.addEventListener("click", function (e) {
      if (e.target.closest(".menu-toggle, .menu-btn, [data-menu-open]")) {
        return;
      }

      var overlay = document.querySelector("#mobilePanel, .mobile-panel, [data-nav-overlay]");
      if (!overlay || !overlay.classList.contains("is-open")) return;

      var closeBtn = e.target.closest("[data-menu-close]");
      if (closeBtn) {
        e.preventDefault();
        window.toggleMobileMenu(null, true);
        return;
      }

      // Do NOT prevent default on page navigation links so navigation executes naturally!
      var panelLink = e.target.closest(".mobile-panel a:not([data-theme-toggle]):not([data-rtl-toggle]), .mobile-nav-links a, .mobile-auth-actions a");
      if (panelLink) {
        window.toggleMobileMenu(null, true);
      }
    });

    window.addEventListener("keydown", function (e) {
      var overlay = document.querySelector("#mobilePanel, .mobile-panel, [data-nav-overlay]");
      if (e.key === "Escape" && overlay && overlay.classList.contains("is-open")) {
        window.toggleMobileMenu(null, true);
      }
    });

    window.addEventListener("resize", function () {
      var overlay = document.querySelector("#mobilePanel, .mobile-panel, [data-nav-overlay]");
      if (window.innerWidth > 1024 && overlay && overlay.classList.contains("is-open")) {
        window.toggleMobileMenu(null, true);
      }
    });
  }

  /* ---------------- Before / After sliders ---------------- */
  function initBeforeAfter() {
    var sliders = document.querySelectorAll("[data-ba], .ba-slider, [data-ba-slider]");
    sliders.forEach(function (root) {
      var afterTarget = root.querySelector(".ba-after-wrap, .ba-after, .ba-img.after");
      var handle = root.querySelector(".ba-handle");
      var line = root.querySelector(".ba-line");
      var rangeInput = root.querySelector(".ba-range-input");

      if (!afterTarget || !handle) return;

      function setPos(pct) {
        pct = Math.max(0, Math.min(100, pct));
        afterTarget.style.clipPath = "inset(0 0 0 " + pct + "%)";
        handle.style.left = pct + "%";
        if (line) line.style.left = pct + "%";
        handle.setAttribute("aria-valuenow", Math.round(pct));
        if (rangeInput && parseFloat(rangeInput.value) !== pct) {
          rangeInput.value = pct;
        }
      }

      if (rangeInput) {
        rangeInput.addEventListener("input", function (e) {
          setPos(parseFloat(e.target.value));
        });
        rangeInput.addEventListener("change", function (e) {
          setPos(parseFloat(e.target.value));
        });
      }

      var dragging = false;

      function posFromEvent(e) {
        var rect = root.getBoundingClientRect();
        var clientX = e.clientX;
        if (clientX === undefined && e.touches && e.touches.length > 0) {
          clientX = e.touches[0].clientX;
        }
        if (clientX === undefined) clientX = rect.left + rect.width / 2;
        var x = clientX - rect.left;
        return (x / rect.width) * 100;
      }

      function onDown(e) {
        if (e.target === rangeInput) return;
        dragging = true;
        root.classList.add("is-dragging");
        setPos(posFromEvent(e));
      }

      function onMove(e) {
        if (!dragging) return;
        setPos(posFromEvent(e));
      }

      function onUp() {
        dragging = false;
        root.classList.remove("is-dragging");
      }

      root.addEventListener("mousedown", onDown);
      root.addEventListener("touchstart", onDown, { passive: true });

      window.addEventListener("mousemove", onMove);
      window.addEventListener("touchmove", onMove, { passive: true });
      window.addEventListener("mouseup", onUp);
      window.addEventListener("touchend", onUp);

      handle.setAttribute("tabindex", "0");
      handle.setAttribute("role", "slider");
      handle.setAttribute("aria-label", "Before and after comparison");
      handle.setAttribute("aria-valuemin", "0");
      handle.setAttribute("aria-valuemax", "100");

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
              successMsg.textContent = 'Welcome back! Redirecting to PaintPro Dashboard...';
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

  /* ---------------- Standalone Auth Pages (login.html & signup.html) ---------------- */
  function initAuthPages() {
    document.querySelectorAll('[data-pwd-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var wrapper = btn.closest('.auth-input-wrapper');
        if (!wrapper) return;
        var input = wrapper.querySelector('input');
        if (!input) return;
        var isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        var icon = btn.querySelector('svg');
        if (icon) {
          icon.innerHTML = isPassword
            ? '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>'
            : '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
        }
      });
    });

    var demoBtn = document.querySelector('[data-demo-autofill]');
    if (demoBtn) {
      demoBtn.addEventListener('click', function () {
        var emailInput = document.getElementById('loginEmail');
        var pwdInput = document.getElementById('loginPassword');
        if (emailInput) emailInput.value = 'client@paintpro.com';
        if (pwdInput) pwdInput.value = 'PaintPro#2026';
        showToast('Demo credentials filled successfully!');
      });
    }

    document.querySelectorAll('[data-social-auth]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var provider = btn.getAttribute('data-social-auth') || 'Third-Party';
        var originalText = btn.innerHTML;
        btn.innerHTML = 'Connecting...';
        btn.disabled = true;
        setTimeout(function () {
          btn.innerHTML = originalText;
          btn.disabled = false;
          showToast('Connecting via ' + provider + '... Authentication successful!');
          setTimeout(function () {
            window.location.href = 'index.html';
          }, 1200);
        }, 800);
      });
    });

    var loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var submitBtn = loginForm.querySelector('button[type="submit"]');
        if (submitBtn) {
          var orig = submitBtn.innerHTML;
          submitBtn.innerHTML = 'Authenticating...';
          submitBtn.disabled = true;
          setTimeout(function () {
            submitBtn.innerHTML = orig;
            submitBtn.disabled = false;
            showToast('Sign in successful! Welcome back.');
            setTimeout(function () {
              window.location.href = 'index.html';
            }, 1000);
          }, 900);
        }
      });
    }

    var signupForm = document.getElementById('signupForm');
    if (signupForm) {
      signupForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var submitBtn = signupForm.querySelector('button[type="submit"]');
        if (submitBtn) {
          var orig = submitBtn.innerHTML;
          submitBtn.innerHTML = 'Creating Account...';
          submitBtn.disabled = true;
          setTimeout(function () {
            submitBtn.innerHTML = orig;
            submitBtn.disabled = false;
            showToast('Account created successfully! Redirecting...');
            setTimeout(function () {
              window.location.href = 'index.html';
            }, 1100);
          }, 1000);
        }
      });
    }

    function showToast(message) {
      var toast = document.querySelector('.auth-toast');
      if (!toast) {
        toast = document.createElement('div');
        toast.className = 'auth-toast';
        document.body.appendChild(toast);
      }
      toast.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px;color:var(--accent);"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg><span>' + message + '</span>';
      toast.classList.add('is-active');
      setTimeout(function () {
        toast.classList.remove('is-active');
      }, 3500);
    }
  }

  /* ---------------- Home 2 Hero 3-Image Carousel ---------------- */
  function initHero2Carousel() {
    var carousel = document.querySelector('[data-hero2-carousel]');
    if (!carousel) return;

    var slides = carousel.querySelectorAll('.hero2-carousel-slide');
    var dots = carousel.querySelectorAll('.hero2-carousel-dot');
    var prevBtn = carousel.querySelector('[data-carousel-prev]');
    var nextBtn = carousel.querySelector('[data-carousel-next]');
    if (!slides.length) return;

    var currentIndex = 0;
    var timer = null;
    var duration = 4500;

    function goToSlide(index) {
      slides[currentIndex].classList.remove('is-active');
      if (dots[currentIndex]) dots[currentIndex].classList.remove('is-active');

      currentIndex = (index + slides.length) % slides.length;

      slides[currentIndex].classList.add('is-active');
      if (dots[currentIndex]) dots[currentIndex].classList.add('is-active');
    }

    function nextSlide() {
      goToSlide(currentIndex + 1);
    }

    function prevSlide() {
      goToSlide(currentIndex - 1);
    }

    function startAutoSlide() {
      stopAutoSlide();
      timer = setInterval(nextSlide, duration);
    }

    function stopAutoSlide() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function (e) {
        e.preventDefault();
        nextSlide();
        startAutoSlide();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function (e) {
        e.preventDefault();
        prevSlide();
        startAutoSlide();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function (e) {
        e.preventDefault();
        goToSlide(i);
        startAutoSlide();
      });
    });

    carousel.addEventListener('mouseenter', stopAutoSlide);
    carousel.addEventListener('mouseleave', startAutoSlide);

    startAutoSlide();
  }

  /* ---------------- Featured Transformation Story Slider ---------------- */
  function initStorySlider() {
    var track = document.querySelector("[data-story-track]");
    var prevBtn = document.querySelector("[data-story-prev]");
    var nextBtn = document.querySelector("[data-story-next]");
    var dots = document.querySelectorAll("[data-story-dot]");
    if (!track) return;

    var slides = track.querySelectorAll(".story-slide");
    var currentIndex = 0;
    var totalSlides = slides.length;
    if (!totalSlides) return;

    function goToSlide(index) {
      if (index < 0) index = totalSlides - 1;
      if (index >= totalSlides) index = 0;
      currentIndex = index;

      track.style.transform = "translateX(-" + (currentIndex * 100) + "%)";

      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === currentIndex);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function (e) {
        e.preventDefault();
        goToSlide(currentIndex + 1);
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", function (e) {
        e.preventDefault();
        goToSlide(currentIndex - 1);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function (e) {
        e.preventDefault();
        goToSlide(i);
      });
    });

    goToSlide(0);
  }

  /* ---------------- Run All Initializations ---------------- */
  function runAllInit() {
    initTheme();
    initRTL();
    initNav();
    initBeforeAfter();
    initFilters();
    initCaseThumbs();
    initCarousel();
    initReveal();
    initAuthModal();
    initContactPage();
    initAuthPages();
    initHero2Carousel();
    initStorySlider();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runAllInit);
  } else {
    runAllInit();
  }
})();
