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
  var currentGallery = [];
  var currentIndex = 0;

  function setMainImage(index, srcs, thumbButtons) {
    currentGallery = srcs;
    currentIndex = index;
    var mainImg = expandPanel.querySelector('.model-expand-main-image img');
    mainImg.src = srcs[index];
    thumbButtons.forEach(function (btn, i) {
      btn.classList.toggle('is-active', i === index);
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

    var pricingLink = expandPanel.querySelector('[data-expand-pricing-link]');
    if (pricingLink) {
      pricingLink.href = card.id ? 'models.html#' + card.id : 'models.html';
    }

    var thumbsWrap = expandPanel.querySelector('.model-expand-thumbs');
    thumbsWrap.innerHTML = '';
    var thumbButtons = [];
    gallerySrcs.forEach(function (src, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.dataset.src = src;
      var im = document.createElement('img');
      im.src = src;
      im.alt = name + ' detail photo';
      b.appendChild(im);
      b.addEventListener('click', function () { setMainImage(i, gallerySrcs, thumbButtons); });
      thumbsWrap.appendChild(b);
      thumbButtons.push(b);
    });
    setMainImage(0, gallerySrcs, thumbButtons);

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

    var mainImageEl = expandPanel.querySelector('.model-expand-main-image img');
    if (mainImageEl) {
      mainImageEl.addEventListener('click', function () {
        openLightbox(currentIndex);
      });
    }
  }

  /* ---------- Full-screen photo lightbox (swipe or arrow keys to move through a gallery) ---------- */
  var lightbox = document.querySelector('#photo-lightbox');
  var lightboxImg = lightbox ? lightbox.querySelector('img') : null;
  var lightboxCounter = lightbox ? lightbox.querySelector('.lightbox-counter') : null;
  var lightboxPrev = lightbox ? lightbox.querySelector('.lightbox-prev') : null;
  var lightboxNext = lightbox ? lightbox.querySelector('.lightbox-next') : null;
  var lightboxCloseBtn = lightbox ? lightbox.querySelector('.lightbox-close') : null;
  var lightboxHideTimeout = null;

  function showLightboxImage(index) {
    if (!lightbox || !currentGallery.length) return;
    currentIndex = ((index % currentGallery.length) + currentGallery.length) % currentGallery.length;
    lightboxImg.src = currentGallery[currentIndex];
    if (lightboxCounter) {
      lightboxCounter.textContent = (currentIndex + 1) + ' / ' + currentGallery.length;
    }
    var multi = currentGallery.length > 1;
    if (lightboxPrev) lightboxPrev.style.display = multi ? '' : 'none';
    if (lightboxNext) lightboxNext.style.display = multi ? '' : 'none';
    // keep the "See more" thumbnail row in sync with the lightbox position
    var thumbs = expandPanel ? expandPanel.querySelectorAll('.model-expand-thumbs button') : [];
    thumbs.forEach(function (btn, i) {
      btn.classList.toggle('is-active', i === currentIndex);
    });
    var mainImg = expandPanel ? expandPanel.querySelector('.model-expand-main-image img') : null;
    if (mainImg) mainImg.src = currentGallery[currentIndex];
  }

  function openLightbox(index) {
    if (!lightbox) return;
    showLightboxImage(index);
    clearTimeout(lightboxHideTimeout);
    lightbox.removeAttribute('hidden');
    document.body.classList.add('nav-locked');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { lightbox.classList.add('is-open'); });
    });
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    document.body.classList.remove('nav-locked');
    clearTimeout(lightboxHideTimeout);
    lightboxHideTimeout = setTimeout(function () {
      if (!lightbox.classList.contains('is-open')) lightbox.setAttribute('hidden', '');
    }, 220);
  }

  if (lightbox) {
    if (lightboxCloseBtn) lightboxCloseBtn.addEventListener('click', closeLightbox);
    if (lightboxPrev) lightboxPrev.addEventListener('click', function () { showLightboxImage(currentIndex - 1); });
    if (lightboxNext) lightboxNext.addEventListener('click', function () { showLightboxImage(currentIndex + 1); });

    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });

    var lbTouchStartX = null;
    var lbTouchStartY = null;

    lightbox.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1) return;
      lbTouchStartX = e.touches[0].clientX;
      lbTouchStartY = e.touches[0].clientY;
    }, { passive: true });

    lightbox.addEventListener('touchend', function (e) {
      if (lbTouchStartX === null) return;
      var touch = e.changedTouches[0];
      var dx = touch.clientX - lbTouchStartX;
      var dy = touch.clientY - lbTouchStartY;
      lbTouchStartX = null;
      lbTouchStartY = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) showLightboxImage(currentIndex + 1);
        else showLightboxImage(currentIndex - 1);
      }
    }, { passive: true });

    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showLightboxImage(currentIndex - 1);
      if (e.key === 'ArrowRight') showLightboxImage(currentIndex + 1);
    });
  }

});
