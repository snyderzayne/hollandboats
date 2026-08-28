// Holland Boats — shared site behavior

document.addEventListener('DOMContentLoaded', function () {
  // Mobile nav toggle
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { links.classList.remove('open'); });
    });
  }

  // Highlight current page in nav
  var here = (window.location.pathname.split('/').pop() || 'index.html');
  document.querySelectorAll('.nav-links a').forEach(function (a) {
    var href = a.getAttribute('href');
    if (href === here || (here === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  // Footer year
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // Contact form (static demo — no backend wired up)
  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = document.getElementById('form-status');
      if (status) {
        status.textContent = 'Thanks — your message has been noted. (Connect this form to an email service or backend to actually send it.)';
        status.classList.add('show');
      }
      form.reset();
    });
  }

  // Note: [data-reveal] markup is kept on elements for optional future use,
  // but intentionally has no visibility behavior attached — content should
  // never depend on JS/scroll timing to become visible.

  // ---------- Fleet gallery "See More" accordion (gallery.html) ----------
  // A single shared panel is moved in the DOM to sit right after whichever
  // fleet-row holds the selected model, so opening it pushes every row
  // below it (and the rest of the page) down. Only one model is open at a
  // time — picking a new one closes whatever was open first.
  var expandPanel = document.getElementById('model-expand-panel');
  var seeMoreButtons = document.querySelectorAll('.btn-see-more');

  if (expandPanel && seeMoreButtons.length) {
    var activeButton = null;

    var elName = document.getElementById('model-expand-name');
    var elTag = document.getElementById('model-expand-tag');
    var elDesc = document.getElementById('model-expand-desc');
    var elSpecs = document.getElementById('model-expand-specs');
    var elImage = document.getElementById('model-expand-image');
    var elThumbs = document.getElementById('model-expand-thumbs');
    var closeBtn = expandPanel.querySelector('.model-expand-close');

    function setMainImage(src, alt, thumbButtons) {
      elImage.src = src;
      elImage.alt = alt;
      thumbButtons.forEach(function (b) {
        b.classList.toggle('is-active', b.dataset.src === src);
      });
    }

    function closePanel() {
      expandPanel.classList.remove('is-open');
      if (activeButton) {
        activeButton.classList.remove('is-active');
        activeButton.textContent = 'See More';
      }
      activeButton = null;
      // Wait for the fade-out transition before actually hiding, so the
      // panel doesn't just disappear.
      window.setTimeout(function () {
        if (!expandPanel.classList.contains('is-open')) {
          expandPanel.setAttribute('hidden', '');
        }
      }, 220);
    }

    function openForCard(card, button) {
      var name = card.querySelector('h3') ? card.querySelector('h3').textContent : '';
      var tag = card.querySelector('.tag') ? card.querySelector('.tag').textContent : '';
      var descEl = card.querySelector('.body > p');
      var desc = descEl ? descEl.textContent : '';
      var specsEl = card.querySelector('.specs');
      var img = card.querySelector('.art-frame img');
      var gallerySrcs = (img && img.dataset.gallery ? img.dataset.gallery : (img ? img.src : ''))
        .split(',')
        .map(function (s) { return s.trim(); })
        .filter(Boolean);

      elName.textContent = name;
      elTag.textContent = tag;
      elDesc.textContent = desc;
      elSpecs.innerHTML = specsEl ? specsEl.innerHTML : '';

      elThumbs.innerHTML = '';
      var thumbButtons = [];
      gallerySrcs.forEach(function (src, i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.dataset.src = src;
        b.setAttribute('aria-label', name + ' photo ' + (i + 1));
        var thumbImg = document.createElement('img');
        thumbImg.src = src;
        thumbImg.alt = '';
        thumbImg.loading = 'lazy';
        b.appendChild(thumbImg);
        b.addEventListener('click', function () {
          setMainImage(src, img ? img.alt : name, thumbButtons);
        });
        elThumbs.appendChild(b);
        thumbButtons.push(b);
      });
      setMainImage(gallerySrcs[0] || '', img ? img.alt : name, thumbButtons);

      // Move the panel to sit right after the fleet-row that contains this card.
      var row = card.closest('.fleet-row');
      if (row && row.parentNode) {
        row.parentNode.insertBefore(expandPanel, row.nextSibling);
      }

      expandPanel.removeAttribute('hidden');
      // Force layout, then add the class on the next frame so the
      // opacity/transform transition actually runs.
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          expandPanel.classList.add('is-open');
        });
      });

      if (activeButton && activeButton !== button) {
        activeButton.classList.remove('is-active');
        activeButton.textContent = 'See More';
      }
      button.classList.add('is-active');
      button.textContent = 'Close Gallery';
      activeButton = button;

      window.setTimeout(function () {
        expandPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 260);
    }

    seeMoreButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        var targetId = button.dataset.target;
        var card = document.getElementById(targetId);
        if (!card) return;

        if (activeButton === button) {
          closePanel();
          return;
        }
        openForCard(card, button);
      });
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', closePanel);
    }
  }
});
