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

  /* ---------- Price configurator: build your own price from the price sheet ---------- */
  var PRICE_CONFIGS = {
    '14': {
      name: "Holland 14'",
      base: {
        title: 'Starting Boat',
        items: [
          { id: 'base-std', label: 'Standard finished boat', price: 10995, desc: 'White hull, foam cored bottom, three coosaboard seats w/ flotation, PVC guards, SS bow/transom eyes, 1" drain plug, non-skid & seat top paint, foam cored transom w/ coosaboard center, tiller steer setup.' },
          { id: 'base-cc', label: 'Center console finished boat', price: 14790, desc: 'Standard foam cored console installed with steering and two hatches.' }
        ]
      },
      groups: [
        {
          title: 'Options',
          type: 'checkbox',
          items: [
            { id: 'opt-console', label: 'Standard foam cored console, steering & storage hatch', price: 3795 },
            { id: 'opt-cc-seat', label: 'Center console w/ storage seat (add to center console boat)', price: 4510 },
            { id: 'opt-bow-storage', label: 'Bow storage with drain', price: 920 },
            { id: 'opt-cleats', label: 'Two spring cleats, reinforced mounting (add $50 per additional pair)', price: 330 },
            { id: 'opt-boot-top', label: 'Boot top', price: 895 },
            { id: 'opt-bottom-paint', label: 'Bottom paint', price: 995 },
            { id: 'opt-breast-hook', label: 'Breast hook, standard 8" (add $150 for 11")', price: 700 },
            { id: 'opt-spray-rails', label: "Spray rails, 8' PVC, 316 SS fasteners", price: 1040 },
            { id: 'opt-nav-lights', label: 'Navigation lights (LED anchor + red/green side)', price: 620 },
            { id: 'opt-bilge', label: 'Bilge pump', price: 400 },
            { id: 'opt-color-gelcoat', label: 'Colored hull, molded gelcoat', price: 825 },
            { id: 'opt-color-paint', label: 'Colored hull, painted (hand rolled & tipped)', price: 1850 }
          ]
        },
        {
          title: 'Suzuki Outboard',
          type: 'radio',
          allowNone: true,
          noneLabel: 'No outboard',
          items: [
            { id: 'ob-25-tb', label: '25 HP — Tiller, Black', price: 6339 },
            { id: 'ob-25-tw', label: '25 HP — Tiller, White', price: 6519 },
            { id: 'ob-25-rb', label: '25 HP — Remote, Black', price: 6249 },
            { id: 'ob-25-rw', label: '25 HP — Remote, White', price: 6429 },
            { id: 'ob-30-tb', label: '30 HP — Tiller, Black', price: 7349 },
            { id: 'ob-30-tw', label: '30 HP — Tiller, White', price: 7529 },
            { id: 'ob-30-rb', label: '30 HP — Remote, Black', price: 7219 },
            { id: 'ob-30-rw', label: '30 HP — Remote, White', price: 7399 },
            { id: 'ob-40-tb', label: '40 HP — Tiller, Black', price: 8336 },
            { id: 'ob-40-tw', label: '40 HP — Tiller, White', price: 8687 },
            { id: 'ob-40-rb', label: '40 HP — Remote, Black', price: 7938 },
            { id: 'ob-40-rw', label: '40 HP — Remote, White', price: 8289 }
          ]
        },
        {
          title: 'Outboard Installation',
          type: 'radio',
          allowNone: true,
          noneLabel: 'No installation needed',
          items: [
            { id: 'inst-tiller', label: 'Tiller installation & mounting (battery, fuel system, wiring, sea trial)', price: 780 },
            { id: 'inst-remote', label: 'Remote steer installation & mounting (battery, fuel system, wiring, throttle, steering, sea trial)', price: 990 }
          ]
        }
      ]
    },
    '32': {
      name: "Holland 32'",
      base: {
        title: 'Build Stage',
        items: [
          { id: 'tier-finished', label: 'Finished Boat, Less Engine', price: 284000, desc: "Fully finished hull and deck, mechanical systems installed, standard colors — see the full breakdown above for everything included." },
          { id: 'tier-assembled', label: 'Assembled Kit — Less Running Gear', price: 80550, desc: 'Complete deck unit kit assembled on hull — seams glassed, blended, trimmed, surface prepped.' },
          { id: 'tier-parts', label: 'Complete Kit, Parts Only (Unassembled)', price: 62625, desc: 'Hull, deck unit, windshield, port side panel, knee piece, shelter top — parts only.' },
          { id: 'tier-hull', label: 'Bare Hull Only', price: 33675, desc: 'Solid fiberglass hull (white), four stringers, molded quarter guards, molded skeg, sheer flange, trimmed.' }
        ]
      }
    },
    '38': {
      name: "Holland 38'",
      base: {
        title: 'Build Stage',
        items: [
          { id: 'tier-finished', label: "Finished Boat, Less Engine (21' Cockpit)", price: 379000, desc: "Fully finished hull and deck, mechanical systems installed, standard colors — see the full breakdown above for everything included." },
          { id: 'tier-assembled-21', label: "Assembled Kit, 21' Cockpit", price: 136300, desc: 'Complete kit, solid glass hull, deck unit — seams glassed/blended, surface prepped.' },
          { id: 'tier-assembled-23', label: "Assembled Kit, 23' Cockpit", price: 140360, desc: 'Complete kit; windshield narrowed, bulkhead pushed forward.' },
          { id: 'tier-hull', label: 'Bare Hull Only', price: 59920, desc: 'Solid fiberglass hull (white), four stringers, molded quarter guards, molded skeg, sheer flange, trimmed.' }
        ]
      }
    }
  };

  var priceConfigButtons = document.querySelectorAll('.btn-price-config');
  var priceModal = document.querySelector('#price-config-modal');

  if (priceModal && priceConfigButtons.length) {
    var pcTitle = priceModal.querySelector('[data-config-title]');
    var pcSub = priceModal.querySelector('[data-config-sub]');
    var pcBody = priceModal.querySelector('[data-config-body]');
    var pcTotal = priceModal.querySelector('[data-config-total]');
    var pcName = priceModal.querySelector('[data-config-name]');
    var pcNotes = priceModal.querySelector('[data-config-notes]');
    var pcError = priceModal.querySelector('[data-config-error]');
    var pcSaveBtn = priceModal.querySelector('[data-config-save]');
    var pcSendBtn = priceModal.querySelector('[data-config-send]');
    var pcCloseBtn = priceModal.querySelector('.price-config-close');
    var pcHideTimeout = null;
    var currentConfig = null;

    function formatMoney(n) {
      return '$' + Math.round(n).toLocaleString('en-US');
    }

    function renderOption(item, inputType, groupName, checked) {
      var wrap = document.createElement('label');
      wrap.className = 'price-config-option';
      var input = document.createElement('input');
      input.type = inputType;
      if (groupName) input.name = groupName;
      input.dataset.id = item.id;
      input.dataset.price = item.price;
      if (checked) input.checked = true;
      var labelWrap = document.createElement('span');
      labelWrap.className = 'opt-label';
      var nameEl = document.createElement('span');
      nameEl.className = 'opt-name';
      nameEl.textContent = item.label;
      labelWrap.appendChild(nameEl);
      if (item.desc) {
        var descEl = document.createElement('span');
        descEl.className = 'opt-desc';
        descEl.textContent = item.desc;
        labelWrap.appendChild(descEl);
      }
      var priceEl = document.createElement('span');
      priceEl.className = 'opt-price';
      priceEl.textContent = item.price ? formatMoney(item.price) : 'Included';
      wrap.appendChild(input);
      wrap.appendChild(labelWrap);
      wrap.appendChild(priceEl);
      input.addEventListener('change', updateTotal);
      return wrap;
    }

    function renderGroup(title, type, items, groupName, allowNone, noneLabel) {
      var section = document.createElement('div');
      section.className = 'price-config-group';
      var h4 = document.createElement('h4');
      h4.textContent = title;
      section.appendChild(h4);
      if (type === 'radio' && allowNone) {
        var noneItem = { id: groupName + '-none', label: noneLabel || 'None', price: 0 };
        section.appendChild(renderOption(noneItem, 'radio', groupName, true));
      }
      items.forEach(function (item, i) {
        var checked = type === 'radio' && !allowNone && i === 0;
        section.appendChild(renderOption(item, type, groupName, checked));
      });
      return section;
    }

    function updateTotal() {
      var total = 0;
      pcBody.querySelectorAll('input:checked').forEach(function (input) {
        total += Number(input.dataset.price) || 0;
      });
      pcTotal.textContent = formatMoney(total);
    }

    function collectSelections() {
      var lines = [];
      pcBody.querySelectorAll('input:checked').forEach(function (input) {
        var price = Number(input.dataset.price) || 0;
        var optionEl = input.closest('.price-config-option');
        var nameEl = optionEl ? optionEl.querySelector('.opt-name') : null;
        var label = nameEl ? nameEl.textContent : input.dataset.id;
        if (price > 0) lines.push({ label: label, price: price });
      });
      return lines;
    }

    function openPriceConfig(modelId) {
      currentConfig = PRICE_CONFIGS[modelId];
      if (!currentConfig) return;
      pcTitle.textContent = 'Build Your ' + currentConfig.name + ' Price';
      pcSub.textContent = currentConfig.groups
        ? 'Pick a starting boat, then add the options you want.'
        : 'Pick the build stage you want priced.';
      pcBody.innerHTML = '';
      pcBody.appendChild(renderGroup(currentConfig.base.title, 'radio', currentConfig.base.items, 'price-base', false));
      if (currentConfig.groups) {
        currentConfig.groups.forEach(function (group) {
          var groupName = 'price-group-' + group.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
          pcBody.appendChild(renderGroup(group.title, group.type, group.items, groupName, group.allowNone, group.noneLabel));
        });
      }
      pcName.value = '';
      pcNotes.value = '';
      pcError.setAttribute('hidden', '');
      updateTotal();

      clearTimeout(pcHideTimeout);
      priceModal.removeAttribute('hidden');
      document.body.classList.add('nav-locked');
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { priceModal.classList.add('is-open'); });
      });
    }

    function closePriceConfig() {
      priceModal.classList.remove('is-open');
      document.body.classList.remove('nav-locked');
      clearTimeout(pcHideTimeout);
      pcHideTimeout = setTimeout(function () {
        if (!priceModal.classList.contains('is-open')) priceModal.setAttribute('hidden', '');
      }, 220);
    }

    function buildSummaryText() {
      var lines = collectSelections();
      var total = 0;
      lines.forEach(function (l) { total += l.price; });
      var name = pcName.value.trim() || 'Not provided';
      var notes = pcNotes.value.trim();
      var text = "Holland's Boat Shop — Price Estimate\n";
      text += currentConfig.name + '\n';
      text += 'Date: ' + new Date().toLocaleDateString('en-US') + '\n';
      text += 'Customer: ' + name + '\n\n';
      text += 'Selections:\n';
      lines.forEach(function (l) {
        text += '  - ' + l.label + ': ' + formatMoney(l.price) + '\n';
      });
      text += '\nEstimated total: ' + formatMoney(total) + '\n';
      if (notes) text += '\nCustomer notes:\n' + notes + '\n';
      text += '\nThis is an estimate built from the current price sheet. Final pricing is confirmed by the shop before any order.\n';
      return text;
    }

    function validatePcName() {
      if (!pcName.value.trim()) {
        pcError.removeAttribute('hidden');
        pcName.focus();
        return false;
      }
      pcError.setAttribute('hidden', '');
      return true;
    }

    function loadLogoImage() {
      return new Promise(function (resolve) {
        var img = new Image();
        img.onload = function () { resolve(img); };
        img.onerror = function () { resolve(null); };
        img.src = 'assets/holland-icon-mark.png';
      });
    }

    function buildSummaryPdf(logoImg) {
      var jsPDFCtor = window.jspdf && window.jspdf.jsPDF;
      if (!jsPDFCtor) return null;

      var lines = collectSelections();
      var total = 0;
      lines.forEach(function (l) { total += l.price; });
      var name = pcName.value.trim() || 'Not provided';
      var notes = pcNotes.value.trim();

      var doc = new jsPDFCtor({ unit: 'pt', format: 'letter' });
      var pageWidth = doc.internal.pageSize.getWidth();
      var pageHeight = doc.internal.pageSize.getHeight();
      var margin = 56;
      var y = 56;

      function ensureSpace(nextLineHeight) {
        if (y + nextLineHeight > pageHeight - margin) {
          doc.addPage();
          y = 56;
        }
      }

      // --- Header: Holland logo mark, then "Holland's Boat Shop" below it ---
      if (logoImg) {
        var logoSize = 54;
        doc.addImage(logoImg, 'PNG', (pageWidth - logoSize) / 2, y, logoSize, logoSize);
        y += logoSize + 12;
      }
      doc.setFont('times', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(10, 29, 48);
      doc.text("Holland's Boat Shop", pageWidth / 2, y, { align: 'center' });
      y += 16;
      doc.setDrawColor(224, 216, 198);
      doc.setLineWidth(1);
      doc.line(margin, y, pageWidth - margin, y);
      y += 28;

      // --- Estimate details ---
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(27, 36, 48);
      doc.text(currentConfig.name + ' — Price Estimate', margin, y);
      y += 22;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10.5);
      doc.setTextColor(91, 100, 114);
      doc.text('Date: ' + new Date().toLocaleDateString('en-US'), margin, y);
      y += 16;
      doc.text('Customer: ' + name, margin, y);
      y += 26;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(47, 111, 98);
      doc.text('SELECTIONS', margin, y);
      y += 16;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10.5);
      doc.setTextColor(27, 36, 48);
      lines.forEach(function (l) {
        ensureSpace(18);
        var priceText = formatMoney(l.price);
        var labelMaxWidth = pageWidth - margin * 2 - 70;
        var wrapped = doc.splitTextToSize(l.label, labelMaxWidth);
        wrapped.forEach(function (row, i) {
          ensureSpace(16);
          doc.text(row, margin + 10, y);
          if (i === 0) doc.text(priceText, pageWidth - margin, y, { align: 'right' });
          y += 15;
        });
      });

      y += 8;
      ensureSpace(34);
      doc.setDrawColor(224, 216, 198);
      doc.line(margin, y, pageWidth - margin, y);
      y += 24;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(10, 29, 48);
      doc.text('Estimated total', margin, y);
      doc.text(formatMoney(total), pageWidth - margin, y, { align: 'right' });
      y += 30;

      if (notes) {
        ensureSpace(20);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(47, 111, 98);
        doc.text('CUSTOMER NOTES', margin, y);
        y += 16;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10.5);
        doc.setTextColor(27, 36, 48);
        var noteLines = doc.splitTextToSize(notes, pageWidth - margin * 2);
        noteLines.forEach(function (row) {
          ensureSpace(15);
          doc.text(row, margin, y);
          y += 15;
        });
        y += 14;
      }

      ensureSpace(30);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(139, 147, 160);
      var disclaimer = doc.splitTextToSize(
        'This is an estimate built from the current price sheet. Final pricing is confirmed by the shop before any order.',
        pageWidth - margin * 2
      );
      disclaimer.forEach(function (row) {
        ensureSpace(13);
        doc.text(row, margin, y);
        y += 13;
      });

      return doc;
    }

    if (pcSaveBtn) {
      pcSaveBtn.addEventListener('click', function () {
        if (!validatePcName()) return;
        loadLogoImage().then(function (logoImg) {
          var doc = buildSummaryPdf(logoImg);
          var modelSlug = currentConfig.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          if (doc) {
            doc.save(modelSlug + '-price-estimate.pdf');
          } else {
            // Fallback if the PDF library didn't load: download a plain-text summary instead
            var text = buildSummaryText();
            var blob = new Blob([text], { type: 'text/plain' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = modelSlug + '-price-estimate.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
          }
        });
      });
    }

    if (pcSendBtn) {
      pcSendBtn.addEventListener('click', function () {
        if (!validatePcName()) return;
        var text = buildSummaryText();
        var subject = 'Price estimate request — ' + currentConfig.name;
        var mailto = 'mailto:hollandsboatshopinc@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(text);
        window.location.href = mailto;
      });
    }

    priceConfigButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        openPriceConfig(button.dataset.priceModel);
      });
    });

    if (pcCloseBtn) pcCloseBtn.addEventListener('click', closePriceConfig);

    priceModal.addEventListener('click', function (e) {
      if (e.target === priceModal) closePriceConfig();
    });

    document.addEventListener('keydown', function (e) {
      if (!priceModal.classList.contains('is-open')) return;
      if (e.key === 'Escape') closePriceConfig();
    });
  }

});
