(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    // Accessibility shortcut.
    if (!document.querySelector('.skip-link')) {
      var skip = document.createElement('a');
      skip.className = 'skip-link';
      skip.href = '#main-content';
      skip.textContent = 'Skip to main content';
      document.body.prepend(skip);
    }

    var main = document.querySelector('main');
    if (main && !main.id) main.id = 'main-content';

    // Reading progress indicator.
    var progress = document.createElement('div');
    progress.id = 'lw-progress';
    progress.setAttribute('aria-hidden', 'true');
    document.body.appendChild(progress);

    function updateScrollUI() {
      var scrollTop = window.scrollY || document.documentElement.scrollTop;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var percent = max > 0 ? Math.min(100, (scrollTop / max) * 100) : 0;
      progress.style.width = percent + '%';
      var nav = document.querySelector('.navbar');
      if (nav) nav.classList.toggle('lw-scrolled', scrollTop > 18);
      var top = document.getElementById('lw-top');
      if (top) top.classList.toggle('lw-show', scrollTop > 450);
    }
    window.addEventListener('scroll', updateScrollUI, { passive: true });
    updateScrollUI();

    // Back-to-top control.
    var topButton = document.createElement('button');
    topButton.id = 'lw-top';
    topButton.type = 'button';
    topButton.setAttribute('aria-label', 'Back to top');
    topButton.title = 'Back to top';
    topButton.innerHTML = '&#8593;';
    topButton.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    document.body.appendChild(topButton);

    // Reveal content progressively without changing existing HTML content.
    var selectors = [
      '.card', '.laptop-card', '.service-card', '.brand-box',
      '.list-group', '.category-section > .container',
      '.brand-heading .container', '.category-banner .container',
      'section > .container > .row'
    ];
    var revealNodes = [];
    selectors.forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (el) {
        if (!el.hasAttribute('data-lw-reveal')) {
          el.setAttribute('data-lw-reveal', '');
          revealNodes.push(el);
        }
      });
    });

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('lw-visible');
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
      revealNodes.forEach(function (el, index) {
        el.style.transitionDelay = Math.min(index % 6, 5) * 45 + 'ms';
        observer.observe(el);
      });
    } else {
      revealNodes.forEach(function (el) { el.classList.add('lw-visible'); });
    }

    // Set the correct active navigation item automatically.
    var page = window.location.pathname.split('/').pop().toLowerCase() || 'index.html';
    document.querySelectorAll('.navbar .nav-link').forEach(function (link) {
      var href = (link.getAttribute('href') || '').split('#')[0].toLowerCase();
      if (!href || href === '#') return;
      var isMatch = href === page;
      if (page === 'privacy-policy.html' || page === 'terms-conditions.html' || page === 'support.html') {
        isMatch = false;
      }
      link.classList.toggle('active', isMatch);
      if (isMatch) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });

    // Keep dropdown parents highlighted on category/brand pages.
    if (page === 'categories.html') {
      var cat = document.querySelector('.navbar a[href="categories.html"]');
      if (cat) cat.classList.add('active');
    }
    if (page === 'brands.html') {
      var brand = document.querySelector('.navbar a[href="brands.html"]');
      if (brand) brand.classList.add('active');
    }

    // Improve image performance and accessibility without replacing images.
    document.querySelectorAll('img').forEach(function (img, index) {
      if (!img.getAttribute('alt') || img.getAttribute('alt') === '...') {
        var src = img.getAttribute('src') || '';
        var name = src.split('/').pop().split('.')[0].replace(/[-_]+/g, ' ');
        img.setAttribute('alt', name ? name.replace(/\b\w/g, function (m) { return m.toUpperCase(); }) : 'Laptop World image');
      }
      if (index > 1 && !img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
      if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
    });

    // Add a small touch-friendly focus state to keyboard navigation.
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Tab') document.body.classList.add('lw-keyboard-nav');
    }, { once: true });

    // Automatic, randomized image sliders for Home/About highlights.
    document.querySelectorAll('[data-lw-slider]').forEach(function (slider) {
      var images = Array.prototype.slice.call(slider.querySelectorAll('.lw-slider-image'));
      var dotsWrap = slider.querySelector('.lw-slider-dots');
      if (images.length < 2) return;

      // Start from a random image so repeated visits do not always look identical.
      var current = Math.floor(Math.random() * images.length);
      images.forEach(function (img, index) { img.classList.toggle('is-active', index === current); });

      if (dotsWrap) {
        images.forEach(function (_, index) {
          var dot = document.createElement('span');
          dot.className = 'lw-slider-dot' + (index === current ? ' is-active' : '');
          dotsWrap.appendChild(dot);
        });
      }

      function showNext() {
        images[current].classList.remove('is-active');
        current = (current + 1) % images.length;
        images[current].classList.add('is-active');
        if (dotsWrap) {
          dotsWrap.querySelectorAll('.lw-slider-dot').forEach(function (dot, index) {
            dot.classList.toggle('is-active', index === current);
          });
        }
      }

      // Gentle 4.5 second rotation with a cross-fade/zoom effect.
      var timer = window.setInterval(showNext, 4500);
      slider.addEventListener('mouseenter', function () { window.clearInterval(timer); });
      slider.addEventListener('mouseleave', function () { timer = window.setInterval(showNext, 4500); });
    });

    // Current year in any common footer.
    document.querySelectorAll('[data-current-year]').forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  });
})();

/* Laptop World v2 additive interactions */
document.addEventListener('DOMContentLoaded', function () {
  var body = document.body;
  if (!body) return;

  // Give the site a consistent page identity for page-specific visual effects.
  var path = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  if (path === 'index.html') body.classList.add('lw-home');
  if (path === 'about.html') body.classList.add('lw-about');
  if (path === 'contact.html') body.classList.add('lw-contact');
  if (path === 'categories.html') body.classList.add('lw-categories');
  if (path === 'brands.html') body.classList.add('lw-brands');

  // Keep the sticky navbar visually elevated as soon as the user moves.
  var header = document.querySelector('header');
  var nav = document.querySelector('.navbar');
  function syncStickyNav() {
    if (header) header.classList.toggle('lw-header-scrolled', window.scrollY > 12);
    if (nav) nav.classList.toggle('lw-scrolled', window.scrollY > 12);
  }
  window.addEventListener('scroll', syncStickyNav, { passive: true });
  syncStickyNav();

  // Small semantic visual cues for the footer without replacing its content.
  document.querySelectorAll('footer.lw-footer a[href^="tel:"]').forEach(function (a) { a.setAttribute('aria-label', 'Call Laptop World'); });
  document.querySelectorAll('footer.lw-footer a[href^="mailto:"]').forEach(function (a) { a.setAttribute('aria-label', 'Email Laptop World'); });

  // Staggered reveal for about/story cards and home sections.
  var animated = document.querySelectorAll('body.lw-home .card, body.lw-home .service-card, body.lw-about .card');
  animated.forEach(function (el, i) {
    if (!el.hasAttribute('data-lw-reveal')) el.setAttribute('data-lw-reveal', '');
    el.style.transitionDelay = Math.min(i % 6, 5) * 55 + 'ms';
  });
});

document.addEventListener('DOMContentLoaded', function () {
  var page = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  if (page === 'laptop-guide.html' || page === 'faq.html') {
    var resources = document.querySelector('.navbar a[href="faq.html"]');
    if (resources) {
      resources.classList.add('active');
      resources.setAttribute('aria-current', 'page');
    }
  }
});
