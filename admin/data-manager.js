/**
 * data-manager.js — Reads data/content.json and injects into the DOM.
 */
(function () {
  'use strict';

  function get(obj, path, fallback) {
    var parts = String(path).split('.');
    var val = obj;
    for (var i = 0; i < parts.length; i++) {
      if (val === null || val === undefined || typeof val !== 'object') return fallback;
      val = val[parts[i]];
    }
    return val !== undefined && val !== null ? val : fallback;
  }

  function setText(selector, value) {
    if (value === undefined || value === null) return;
    document.querySelectorAll(selector).forEach(function (el) { el.textContent = value; });
  }

  function setHTML(selector, value) {
    if (value === undefined || value === null) return;
    document.querySelectorAll(selector).forEach(function (el) { el.innerHTML = value.replace(/\n/g, '<br>'); });
  }

  function setHref(selector, value) {
    if (value === undefined || value === null) return;
    document.querySelectorAll(selector).forEach(function (el) { el.setAttribute('href', value); });
  }

  function setAttr(selector, attr, value) {
    if (value === undefined || value === null) return;
    document.querySelectorAll(selector).forEach(function (el) { el.setAttribute(attr, value); });
  }

  function escapeHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  var observer = null;
  var carouselInitialized = false;

  function injectData(data) {
    if (!data) return;

    // ------ HERO ------
    setText('[data-field="hero.badge"]', get(data, 'hero.badge'));
    setHTML('[data-field="hero.title"]', get(data, 'hero.title'));
    setText('[data-field="hero.description"]', get(data, 'hero.description'));
    setText('[data-field="hero.btn_primary_text"]', get(data, 'hero.btn_primary_text'));
    setHref('[data-href="hero.btn_primary_href"]', get(data, 'hero.btn_primary_href'));
    setText('[data-field="hero.btn_secondary_text"]', get(data, 'hero.btn_secondary_text'));
    setHref('[data-href="hero.btn_secondary_href"]', get(data, 'hero.btn_secondary_href'));

    var stats = get(data, 'hero.stats', []);
    document.querySelectorAll('[data-field-type="hero-stat"]').forEach(function (el, i) {
      if (stats[i]) {
        var n = el.querySelector('.number');
        var l = el.querySelector('.label');
        if (n) n.textContent = stats[i].number;
        if (l) l.textContent = stats[i].label;
      }
    });

    // ------ CAROUSEL ------
    setText('[data-field="carousel.section_label"]', get(data, 'carousel.section_label'));
    setText('[data-field="carousel.section_title"]', get(data, 'carousel.section_title'));
    setText('[data-field="carousel.section_desc"]', get(data, 'carousel.section_desc'));

    var slides = get(data, 'carousel.slides', []);
    var carouselSection = document.getElementById('galeria-top');
    if (carouselSection && slides.length > 0) {
      var container = carouselSection.querySelector('.carousel-container');
      if (container) {
        // Remove existing tracks
        container.querySelectorAll('.carousel-track').forEach(function (t) { t.remove(); });
        var indicatorsEl = carouselSection.querySelector('.carousel-dots');
        if (indicatorsEl) indicatorsEl.innerHTML = '';

        slides.forEach(function (slide, i) {
          var track = document.createElement('div');
          track.className = 'carousel-track' + (i === 0 ? ' active' : '');
          track.innerHTML = '<img src="' + escapeHtml(slide.image) + '" alt="' + escapeHtml(slide.alt) + '" loading="lazy">' +
            '<div class="carousel-caption"><h3>' + escapeHtml(slide.title) + '</h3><span>' + escapeHtml(slide.caption) + '</span></div>';
          // Insert at end of container (before dots if inside)
          container.appendChild(track);

          if (indicatorsEl) {
            var dot = document.createElement('button');
            dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('aria-label', 'Slide ' + (i + 1));
            indicatorsEl.appendChild(dot);
          }
        });
      }
    }

    setText('[data-field="news_header.label"]', get(data, 'news_header.label'));
    setText('[data-field="news_header.title"]', get(data, 'news_header.title'));

    // ------ NEWS ------
    var news = get(data, 'news', []);
    var newsSection = document.querySelector('.news-section');
    if (newsSection && news.length > 0) {
      var newsGrid = newsSection.querySelector('.news-grid');
      if (newsGrid) {
        newsGrid.innerHTML = '';
        news.forEach(function (item) {
          var card = document.createElement('div');
          card.className = 'news-card fade-in';
          var metaHTML = '';
          if (item.meta) item.meta.forEach(function (m) { metaHTML += '<span class="news-meta-item">' + escapeHtml(m) + '</span>'; });
          card.innerHTML =
            '<div class="news-card-img">' +
              (item.image ? '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' : '') +
              (item.image_caption ? '<span class="img-caption">' + escapeHtml(item.image_caption) + '</span>' : '') +
            '</div>' +
            '<div class="news-card-body">' +
              '<div class="news-card-date">' + escapeHtml(item.date) + '</div>' +
              '<h3>' + escapeHtml(item.title) + '</h3>' +
              '<p>' + escapeHtml(item.body) + '</p>' +
              '<div class="news-card-meta">' + metaHTML + '</div>' +
            '</div>';
          newsGrid.appendChild(card);
          if (observer) observer.observe(card);
        });
      }
    }

    // ------ BANNER ------
    setHTML('[data-field="banner.title"]', get(data, 'banner.title'));
    setHTML('[data-field="banner.description"]', get(data, 'banner.description'));
    setAttr('[data-attr="banner.bg-img"]', 'src', get(data, 'banner.image'));
    setAttr('[data-attr="banner.logo"]', 'src', get(data, 'banner.logo'));

    // ------ CALENDAR ------
    setText('[data-field="calendar.label"]', get(data, 'calendar_section.label'));
    setText('[data-field="calendar.title"]', get(data, 'calendar_section.title'));
    setText('[data-field="calendar.description"]', get(data, 'calendar_section.description'));

    var calEvents = get(data, 'calendar_events', []);
    var calSection = document.getElementById('calendari');
    if (calSection && calEvents.length > 0) {
      var calList = calSection.querySelector('.cal-list');
      if (calList) {
        calList.innerHTML = '';
        calEvents.forEach(function (evt) {
          var featuredClass = evt.featured ? ' featured' : '';
          var collesHTML = '';
          if (evt.colles) evt.colles.forEach(function (c) { collesHTML += '<span class="cal-colla-tag">' + escapeHtml(c) + '</span>'; });
          var descHTML = evt.description ? '<p style="font-size:0.83rem;color:var(--gray);margin-top:4px;">' + escapeHtml(evt.description) + '</p>' : '';
          var item = document.createElement('div');
          item.className = 'cal-item fade-in' + featuredClass;
          item.innerHTML =
            '<div class="cal-date">' +
              (evt.day ? '<div class="day">' + escapeHtml(evt.day) + '</div>' : '') +
              '<div class="month">' + escapeHtml(evt.month) + '</div>' +
            '</div>' +
            '<div class="cal-info">' +
              '<h3>' + escapeHtml(evt.title) + '</h3>' +
              '<div class="cal-details">' +
                (evt.location ? '<div class="cal-detail">' + escapeHtml(evt.location) + '</div>' : '') +
                (evt.time ? '<div class="cal-detail">' + escapeHtml(evt.time) + '</div>' : '') +
              '</div>' +
              descHTML +
              (collesHTML ? '<div class="cal-colles">' + collesHTML + '</div>' : '') +
            '</div>';
          calList.appendChild(item);
          if (observer) observer.observe(item);
        });
      }
    }

    // ------ GALLERY ------
    var galleryData = get(data, 'gallery_section', null);
    var gallerySection = document.getElementById('galeria');
    if (gallerySection && galleryData && galleryData.items) {
      setText('[data-field="gallery.label"]', galleryData.label);
      setText('[data-field="gallery.title"]', galleryData.title);
      setText('[data-field="gallery.description"]', galleryData.description);

      var mosaic = gallerySection.querySelector('.gallery-mosaic');
      if (mosaic) {
        mosaic.innerHTML = '';
        galleryData.items.forEach(function (item) {
          var sizeClass = item.size ? ' ' + item.size : '';
          var el = document.createElement('div');
          el.className = 'gallery-item fade-in' + sizeClass;
          el.setAttribute('onclick', 'openLightbox(this)');
          el.innerHTML = '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.caption) + '" loading="lazy">' +
            '<div class="gallery-overlay"><span>' + escapeHtml(item.caption) + '</span></div>';
          mosaic.appendChild(el);
          if (observer) observer.observe(el);
        });
      }
    }

    // ------ COLLES ------
    setText('[data-field="colles_header.label"]', get(data, 'colles_header.label'));
    setText('[data-field="colles_header.title"]', get(data, 'colles_header.title'));
    setText('[data-field="colles_header.description"]', get(data, 'colles_header.description'));

    var colles = get(data, 'colles', []);
    var collesSection = document.getElementById('colles');
    if (collesSection && colles.length > 0) {
      var collesGrid = collesSection.querySelector('.colles-grid');
      if (collesGrid) {
        collesGrid.innerHTML = '';
        colles.forEach(function (colla) {
          var card = document.createElement('div');
          card.className = 'colla-card ' + colla.member_class + ' fade-in';
          card.innerHTML =
            '<div class="colla-card-img">' +
              '<img src="' + escapeHtml(colla.image) + '" alt="' + escapeHtml(colla.alt || '') + '" loading="lazy">' +
              '<span class="colla-badge">' + escapeHtml(colla.badge) + '</span>' +
            '</div>' +
            '<div class="colla-card-body">' +
              '<h3>' + escapeHtml(colla.name) + '</h3>' +
              '<div class="colla-count">' + escapeHtml(colla.count) + '</div>' +
              '<div class="label">' + escapeHtml(colla.label) + '</div>' +
              '<div class="colla-trainings">' +
                '<strong>' + escapeHtml(colla.training_schedule) + '</strong><br>' +
                escapeHtml(colla.training_location) +
              '</div>' +
            '</div>';
          collesGrid.appendChild(card);
          if (observer) observer.observe(card);
        });
      }
    }

    // ------ SOCIAL ------
    setText('[data-field="social.section_label"]', get(data, 'social.section_label'));
    setText('[data-field="social.section_title"]', get(data, 'social.section_title'));
    setText('[data-field="social.section_desc"]', get(data, 'social.section_desc'));

    var channels = get(data, 'social.channels', []);
    var mediaSection = document.getElementById('media');
    if (mediaSection && channels.length > 0) {
      var mediaGrid = mediaSection.querySelector('.media-grid');
      if (mediaGrid) {
        mediaGrid.innerHTML = '';
        channels.forEach(function (ch) {
          var card = document.createElement('div');
          card.className = 'media-card fade-in';
          card.innerHTML =
            '<div class="media-icon">' + escapeHtml(ch.icon) + '</div>' +
            '<h3>' + escapeHtml(ch.name) + '</h3>' +
            '<p>' + escapeHtml(ch.description) + '</p>' +
            '<a href="' + escapeHtml(ch.url) + '" target="_blank" class="btn-white">' + escapeHtml(ch.handle) + ' →</a>';
          mediaGrid.appendChild(card);
          if (observer) observer.observe(card);
        });
      }
    }

    // ------ SOCIS ------
    setText('[data-field="socis.section_label"]', get(data, 'socis.section_label'));
    setText('[data-field="socis.section_title"]', get(data, 'socis.section_title'));
    setText('[data-field="socis.section_desc"]', get(data, 'socis.section_desc'));
    setText('[data-field="socis.cta_icon"]', get(data, 'socis.cta_icon'));
    setText('[data-field="socis.cta_title"]', get(data, 'socis.cta_title'));
    setHTML('[data-field="socis.cta_description"]', get(data, 'socis.cta_description'));
    setText('[data-field="socis.cta_button_text"]', get(data, 'socis.cta_button_text'));
    setHref('[data-href="socis.cta_button_href"]', get(data, 'socis.cta_button_href'));

    var privateArea = get(data, 'socis.private_area', null);
    if (privateArea && privateArea.docs) {
      var privateContent = document.getElementById('socisPrivate');
      if (privateContent) {
        var docList = privateContent.querySelector('.doc-list');
        if (docList) {
          docList.innerHTML = '';
          privateArea.docs.forEach(function (doc) {
            var d = document.createElement('div');
            d.className = 'doc-item';
            d.innerHTML = '<span>' + escapeHtml(doc.substring(0, 2)) + '</span> ' + escapeHtml(doc.substring(2).trim());
            docList.appendChild(d);
          });
        }
      }
    }

    // ------ CONTACT ------
    setText('[data-field="contact.section_label"]', get(data, 'contact.section_label'));
    setText('[data-field="contact.section_title"]', get(data, 'contact.section_title'));
    setText('[data-field="contact.section_desc"]', get(data, 'contact.section_desc'));
    setText('[data-field="contact.address_title"]', get(data, 'contact.address_title'));
    setHTML('[data-field="contact.address"]', get(data, 'contact.address'));
    setText('[data-field="contact.email_title"]', get(data, 'contact.email_title'));
    setText('[data-field="contact.email"]', get(data, 'contact.email'));
    setHref('[data-href="contact.email_href"]', get(data, 'contact.email_href'));
    setText('[data-field="contact.schedule_title"]', get(data, 'contact.schedule_title'));
    setHTML('[data-field="contact.schedule"]', get(data, 'contact.schedule'));

    var contactForm = document.querySelector('.contact-form');
    if (contactForm) {
      var formTitle = contactForm.querySelector('h3');
      if (formTitle) formTitle.textContent = get(data, 'contact.form_title', formTitle.textContent);
      var labels = contactForm.querySelectorAll('label');
      var inputs = contactForm.querySelectorAll('input, textarea');
      var labelsData = ['contact.form_name_label', 'contact.form_email_label', 'contact.form_subject_label', 'contact.form_message_label'];
      var placeholders = ['contact.form_name_placeholder', 'contact.form_email_placeholder', 'contact.form_subject_placeholder', 'contact.form_message_placeholder'];
      labelsData.forEach(function (key, i) { if (labels[i]) labels[i].textContent = get(data, key, labels[i].textContent); });
      placeholders.forEach(function (key, i) { if (inputs[i]) inputs[i].placeholder = get(data, key, inputs[i].placeholder) || ''; });
      var submitBtn = contactForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.textContent = get(data, 'contact.form_submit', submitBtn.textContent);
    }

    // ------ SUGGERIMENTS ------
    setText('[data-field="suggeriments.section_label"]', get(data, 'suggeriments.section_label'));
    setText('[data-field="suggeriments.section_title"]', get(data, 'suggeriments.section_title'));
    setText('[data-field="suggeriments.icon"]', get(data, 'suggeriments.icon'));
    setText('[data-field="suggeriments.title"]', get(data, 'suggeriments.title'));
    setText('[data-field="suggeriments.description"]', get(data, 'suggeriments.description'));
    var suggerText = document.getElementById('suggerText');
    if (suggerText) suggerText.placeholder = get(data, 'suggeriments.placeholder', suggerText.placeholder);
    var suggerForm = document.querySelector('.sugger-form');
    if (suggerForm) { var btn = suggerForm.querySelector('button'); if (btn) btn.textContent = get(data, 'suggeriments.submit_text', btn.textContent); }

    // ------ FOOTER ------
    setText('[data-field="footer.brand_title"]', get(data, 'footer.brand_title'));
    setText('[data-field="footer.brand_description"]', get(data, 'footer.brand_description'));
    setText('[data-field="footer.navigation_title"]', get(data, 'footer.navigation_title'));
    setText('[data-field="footer.contact_title"]', get(data, 'footer.contact_title'));
    setHTML('[data-field="footer.copyright"]', get(data, 'footer.copyright'));

    // Footer dynamic links
    var footer = document.querySelector('.footer');
    if (footer) {
      var navLinks = footer.querySelectorAll('.footer-links:first-child a');
      var navData = get(data, 'footer.navigation', []);
      navData.forEach(function (link, i) {
        if (navLinks[i]) { navLinks[i].textContent = link.label; navLinks[i].href = link.href; }
      });
      var contactLinksCol = footer.querySelectorAll('.footer-links:nth-child(2) a');
      var contactLinks = get(data, 'footer.contact_links', []);
      contactLinks.forEach(function (link, i) {
        if (contactLinksCol[i]) { contactLinksCol[i].textContent = link.label; contactLinksCol[i].href = link.href; }
      });
    }
  }

  // ---- Load when DOM is ready ----
  document.addEventListener('DOMContentLoaded', function () {
    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.fade-in').forEach(function (el) { observer.observe(el); });

    // Fetch content from JSON
    fetch('data/content.json?v=' + Date.now())
      .then(function (resp) { if (!resp.ok) throw new Error('HTTP ' + resp.status); return resp.json(); })
      .then(function (data) { injectData(data); })
      .catch(function (err) { console.warn('[data-manager] Using static HTML fallback:', err.message); });
  });
})();
