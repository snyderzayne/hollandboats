document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Mobile nav toggle ---------- */
  var navToggle = document.querySelector('.nav-toggle');
  var navLinks = document.querySelector('.nav-links');
  var navOverlay = document.querySelector('[data-nav-overlay]');
  var siteHeader = document.querySelector('.site-header');

  function setNavOpen(isOpen) {
    if (!navLinks || !navToggle) return;
    if (isOpen && siteHeader) {
      var h = Math.ceil(siteHeader.getBoundingClientRect().height);
      document.documentElement.style.setProperty('--header-h', h + 'px');
    }
    navLinks.classList.toggle('is-open', isOpen);
    navToggle.classList.toggle('is-open', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    document.body.classList.toggle('nav-locked', isOpen);
    if (navOverlay) navOverlay.classList.toggle('is-open', isOpen);
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      setNavOpen(!navLinks.classList.contains('is-open'));
    });
    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setNavOpen(false); });
    });
    if (navOverlay) {
      navOverlay.addEventListener('click', function () { setNavOpen(false); });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setNavOpen(false);
    });
    window.addEventListener('resize', function () {
      if (navLinks.classList.contains('is-open') && siteHeader) {
        var h = Math.ceil(siteHeader.getBoundingClientRect().height);
        document.documentElement.style.setProperty('--header-h', h + 'px');
      }
    });
  }

  /* ---------- Active link highlighting ---------- */
  var path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a[href]').forEach(function (a) {
    var href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  /* ---------- Footer year ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Contact form demo submit ---------- */
  var contactForm = document.querySelector('[data-contact-form]');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var success = document.querySelector('[data-form-success]');
      if (success) {
        success.classList.add('is-visible');
        success.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      contactForm.reset();
    });
  }

  /* ---------- Fleet gallery "See more" accordion ---------- */
  var expandPanel = document.querySelector('#model-expand-panel');
  var seeMoreButtons = document.querySelectorAll('.btn-see-more');
  var activeButton = null;
  var hideTimeout = null;

  function setMainImage(src, thumbButtons) {
    var mainImg = expandPanel.querySelector('.model-expand-main-image img');
    mainImg.src = src;
    thumbButtons.forEach(function (btn) {
      btn.classList.toggle('is-active', btn.dataset.src === src);
    });
  }

  function closePanel() {
    if (!activeButton) return;
    expandPanel.classList.remove('is-open');
    activeButton.textContent = 'See more';
    activeButton.classList.remove('is-active');
    activeButton = null;
    clearTimeout(hideTimeout);
    hideTimeout = setTimeout(function () {
      if (!expandPanel.classList.contains('is-open')) {
        expandPanel.setAttribute('hidden', '');
      }
    }, 220);
  }

  function openForCard(card, button) {
    var name = card.querySelector('[data-name]').textContent;
    var tag = card.querySelector('[data-tag]').textContent;
    var desc = card.querySelector('[data-desc]').innerHTML;
    var specs = card.querySelector('[data-specs]').innerHTML;
    var gallerySrcs = Array.from(card.querySelectorAll('[data-gallery]')).map(function (img) {
      return img.getAttribute('src');
    });
    if (gallerySrcs.length === 0) {
      gallerySrcs = [card.querySelector('.art-frame img').getAttribute('src')];
    }

    expandPanel.querySelector('[data-expand-tag]').textContent = tag;
    expandPanel.querySelector('[data-expand-name]').textContent = name;
    expandPanel.querySelector('[data-expand-desc]').innerHTML = desc;
    expandPanel.querySelector('[data-expand-specs]').innerHTML = specs;

    var thumbsWrap = expandPanel.querySelector('.model-expand-thumbs');
    thumbsWrap.innerHTML = '';
    var thumbButtons = [];
    gallerySrcs.forEach(function (src) {
      var b = document.createElement('button');
      b.type = 'button';
      b.dataset.src = src;
      var im = document.createElement('img');
      im.src = src;
      im.alt = name + ' detail photo';
      b.appendChild(im);
      b.addEventListener('click', function () { setMainImage(src, thumbButtons); });
      thumbsWrap.appendChild(b);
      thumbButtons.push(b);
    });
    setMainImage(gallerySrcs[0], thumbButtons);

    card.insertAdjacentElement('afterend', expandPanel);
    expandPanel.removeAttribute('hidden');
    clearTimeout(hideTimeout);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        expandPanel.classList.add('is-open');
      });
    });

    button.textContent = 'Close';
    button.classList.add('is-active');
    activeButton = button;
  }

  if (expandPanel && seeMoreButtons.length) {
    seeMoreButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        var card = document.getElementById(button.dataset.target);
        if (activeButton === button) {
          closePanel();
          return;
        }
        if (activeButton) {
          activeButton.textContent = 'See more';
          activeButton.classList.remove('is-active');
        }
        openForCard(card, button);
      });
    });

    var closeBtn = expandPanel.querySelector('.model-expand-close');
    if (closeBtn) closeBtn.addEventListener('click', closePanel);
  }

});
