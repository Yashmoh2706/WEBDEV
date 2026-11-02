'use strict';

const CONTACT_EMAIL = 'starlinelogisticsza@gmail.com';
// Paste your Formspree URL here later (Step 8)
const FORM_ENDPOINT = 'https://formspree.io/f/mrpplbwz';

// Shortcuts
const $  = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));

// Builds an element safely (textContent can't run injected code)
function el(tag, text, className) {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (className) node.className = className;
  return node;
}

// ===== Mobile menu =====
const navToggle = $('.nav-toggle');
const mainNav = $('#main-nav');
if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const open = mainNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open);
  });
}

// ===== Scroll animation: cards fade in when they appear =====
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  $$('main .card, main h2').forEach((item) => {
    item.classList.add('reveal');
    observer.observe(item);
  });
}

// ===== Accordion (only one panel open at a time) =====
const triggers = $$('.accordion-trigger');
triggers.forEach((trigger) => {
  trigger.addEventListener('click', () => {
    const willOpen = trigger.getAttribute('aria-expanded') !== 'true';

    // close everything first
    triggers.forEach((other) => {
      other.setAttribute('aria-expanded', 'false');
      document.getElementById(other.getAttribute('aria-controls')).hidden = true;
    });

    // then open the one clicked
    if (willOpen) {
      trigger.setAttribute('aria-expanded', 'true');
      document.getElementById(trigger.getAttribute('aria-controls')).hidden = false;
    }
  });
});

// ===== Services data =====
const SERVICES = [
  { id: 'road-freight', name: 'Road Freight Transport', category: 'Core',
    summary: 'Full and shared loads moving general cargo across national routes.',
    details: 'Full and shared loads moving general cargo, dry goods and FMCG across national routes, with a key focus on the Johannesburg to Durban corridor.' },
  { id: 'container', name: 'Container Transport', category: 'Core',
    summary: 'Container repositioning, full haulage and port collection.',
    details: 'Container repositioning, full haulage and port collection services for import and export cargo.' },
  { id: 'clearing-forwarding', name: 'Clearing & Forwarding', category: 'Core',
    summary: 'Subcontracted clearing and forwarding with customs and port authorities.',
    details: 'Subcontracted clearing and forwarding, coordinating closely with customs and port authorities.' },
  { id: 'dedicated-fleet', name: 'Contracted & Dedicated Fleet Services', category: 'Core',
    summary: 'Long or short term fleet allocation with transparent updates.',
    details: 'Long or short term fleet allocation with transparent updates and communication.' },
  { id: 'git-insurance', name: 'Goods-in-Transit Insurance', category: 'Additional',
    summary: 'Cover for your cargo while it is on the move (R2m to R4m).',
    details: 'Goods-in-transit insurance with R2m to R4m coverage for client cargo while on the move.' },
  { id: 'warehousing', name: 'Warehousing Coordination', category: 'Additional',
    summary: 'Transfer between depots, with handling and staging support.',
    details: 'Transfer between depots, along with handling and staging support.' }
];

// ===== Modal (pop-up) =====
function openModal(service) {
  const overlay = el('div', null, 'modal-overlay');
  const modal = el('div', null, 'modal');
  const close = el('button', '\u00D7', 'modal-close');
  close.type = 'button';
  close.setAttribute('aria-label', 'Close');

  const link = el('a', 'Request a quote for this service', 'btn');
  link.href = 'enquiry.html?service=' + encodeURIComponent(service.id);

  modal.append(close, el('span', service.category + ' service', 'badge'),
               el('h2', service.name), el('p', service.details), link);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  function closeModal() {
    overlay.remove();
    document.removeEventListener('keydown', onKey);
  }
  function onKey(e) { if (e.key === 'Escape') closeModal(); }

  close.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', onKey);
}

// ===== Dynamic list =====
const servicesList = $('#services-list');
if (servicesList) {
  const search = $('#service-search');
  const category = $('#service-category');
  const sort = $('#service-sort');
  const count = $('#results-count');

  function renderServices() {
    const query = search.value.trim().toLowerCase();

    // 1) filter
    const results = SERVICES.filter((s) => {
      const text = (s.name + ' ' + s.summary + ' ' + s.details).toLowerCase();
      return text.includes(query) && (category.value === 'all' || s.category === category.value);
    });

    // 2) sort
    results.sort((a, b) => {
      if (sort.value === 'name-desc') return b.name.localeCompare(a.name);
      if (sort.value === 'category') return a.category.localeCompare(b.category) || a.name.localeCompare(b.name);
      return a.name.localeCompare(b.name);
    });

    // 3) draw the cards
    servicesList.replaceChildren();
    results.forEach((service) => {
      const card = el('article', null, 'card');
      const more = el('button', 'Learn more', 'btn btn-outline');
      more.type = 'button';
      more.addEventListener('click', () => openModal(service));
      card.append(el('span', service.category, 'badge'), el('h3', service.name),
                  el('p', service.summary), more);
      servicesList.appendChild(card);
    });

    if (results.length === 0) {
      servicesList.appendChild(el('p', 'No services match your search. Try a different word.', 'no-results'));
    }
    count.textContent = results.length + (results.length === 1 ? ' service found' : ' services found');
  }

  [search, category, sort].forEach((c) => c.addEventListener('input', renderServices));
  renderServices();
}

// ===== Lightbox =====
const galleryLinks = $$('.lightbox-link');
if (galleryLinks.length) {
  let current = 0;
  let overlay, image, caption;

  function showImage(index) {
    current = (index + galleryLinks.length) % galleryLinks.length; // wraps around
    const link = galleryLinks[current];
    image.src = link.href;
    image.alt = $('img', link).alt;
    caption.textContent = (current + 1) + ' / ' + galleryLinks.length + ' - ' + link.dataset.caption;
  }

  function closeLightbox() {
    overlay.remove();
    document.removeEventListener('keydown', onLightboxKey);
  }

  function onLightboxKey(e) {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showImage(current + 1);
    if (e.key === 'ArrowLeft') showImage(current - 1);
  }

  function openLightbox(index) {
    overlay = el('div', null, 'lightbox');
    const closeBtn = el('button', '\u00D7', 'lightbox-close');
    const prev = el('button', '\u2039', 'lightbox-prev');
    const next = el('button', '\u203A', 'lightbox-next');
    [closeBtn, prev, next].forEach((b) => (b.type = 'button'));
    image = document.createElement('img');
    caption = el('p', '', 'lightbox-caption');

    overlay.append(closeBtn, prev, image, caption, next);
    document.body.appendChild(overlay);

    closeBtn.addEventListener('click', closeLightbox);
    prev.addEventListener('click', () => showImage(current - 1));
    next.addEventListener('click', () => showImage(current + 1));
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeLightbox(); });
    document.addEventListener('keydown', onLightboxKey);
    showImage(index);
  }

  galleryLinks.forEach((link, index) => {
    link.addEventListener('click', (e) => {
      e.preventDefault(); // don't open the image on its own page
      openLightbox(index);
    });
  });
}

// ===== Leaflet map =====
if ($('#map') && typeof L !== 'undefined') {
  const durban = [-29.8497, 31.0047];
  const johannesburg = [-26.2041, 28.0473];

  const map = L.map('map').setView(durban, 6);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  const durbanMarker = L.marker(durban).addTo(map)
    .bindPopup('<strong>Durban (Head Office)</strong><br>41 Cannon Avenue, Berea');
  const jhbMarker = L.marker(johannesburg).addTo(map)
    .bindPopup('<strong>Johannesburg (Route Hub)</strong>');

  const route = L.polyline([durban, johannesburg], { color: '#14213d', weight: 3, dashArray: '8 8' }).addTo(map);
  map.fitBounds(route.getBounds(), { padding: [40, 40] });
  durbanMarker.openPopup();

  $('#map-durban').addEventListener('click', () => { map.flyTo(durban, 14); durbanMarker.openPopup(); });
  $('#map-jhb').addEventListener('click', () => { map.flyTo(johannesburg, 11); jhbMarker.openPopup(); });
  $('#map-route').addEventListener('click', () => map.flyToBounds(route.getBounds(), { padding: [40, 40] }));
}

// ===== Validation rules: each returns an error message, or '' if OK =====
const check = {
  fullName: (v) => /^[A-Za-z'.-]+(\s+[A-Za-z'.-]+)+$/.test(v.trim())
    ? '' : 'Enter your first name and surname (letters only).',

  text: (label, min, max) => (v) => {
    v = v.trim();
    if (v.length < min) return label + ' must be at least ' + min + ' characters.';
    if (v.length > max) return label + ' must be ' + max + ' characters or fewer.';
    return '';
  },

  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())
    ? '' : 'Enter a valid email, e.g. name@company.co.za.',

  // South African numbers: 0602258475 or +27602258475 (spaces allowed)
  phone: (required) => (v) => {
    const cleaned = v.replace(/[\s\-()]/g, '');
    if (!cleaned) return required ? 'Please enter your phone number.' : '';
    return /^(\+27|0)[1-9][0-9]{8}$/.test(cleaned) ? '' : 'Enter a valid SA number, e.g. 060 225 8475.';
  },

  select: (label) => (v) => (v ? '' : 'Please choose ' + label + '.'),

  number: (label, min, max) => (v) => {
    if (v === '') return label + ' is required.';
    const n = Number(v);
    return n < min || n > max ? label + ' must be between ' + min + ' and ' + max + '.' : '';
  },

  futureDate: (v) => {
    if (!v) return 'Please choose a pickup date.';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(v + 'T00:00:00') < today ? 'The pickup date cannot be in the past.' : '';
  }
};

// Show or clear the error under one field
function showError(field, message) {
  const holder = document.getElementById(field.id + '-error');
  if (holder) holder.textContent = message;
  field.classList.toggle('invalid', Boolean(message));
  field.classList.toggle('valid', !message && field.value.trim() !== '');
}

// Validate one field (fields inside a hidden section are skipped)
function validateField(field, rules) {
  if (field.closest('[hidden]')) { showError(field, ''); return true; }
  const message = rules[field.id](field.value);
  showError(field, message);
  return !message;
}

function setupValidation(form, rules, onValid) {
  form.setAttribute('novalidate', ''); // use our messages, not the browser's

  Object.keys(rules).forEach((id) => {
    const field = form.querySelector('#' + id);
    field.addEventListener('blur', () => validateField(field, rules));
    field.addEventListener('input', () => {
      if (field.classList.contains('invalid')) validateField(field, rules);
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault(); // stop the page reloading
    let firstBad = null;
    Object.keys(rules).forEach((id) => {
      const field = form.querySelector('#' + id);
      if (!validateField(field, rules) && !firstBad) firstBad = field;
    });
    if (firstBad) { firstBad.focus(); return; }
    onValid();
  });
}

// ===== Enquiry form =====
// DEMO rates for the POE. Change these to realistic numbers.
const ROUTES = {
  'local-durban': { label: 'Local (Durban area)',             base: 1800,  perTonne: 120, leadDays: 1 },
  'durban-jhb':   { label: 'Durban to Johannesburg corridor', base: 6500,  perTonne: 260, leadDays: 2 },
  'national':     { label: 'National (other provinces)',      base: 8500,  perTonne: 320, leadDays: 3 },
  'cross-border': { label: 'Cross-border (SADC region)',      base: 14000, perTonne: 480, leadDays: 5 }
};
const rand = new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', maximumFractionDigits: 0 });

const enquiryForm = $('#enquiry-form');
if (enquiryForm) {
  const freightBox = $('#freight-fields');
  const subBox = $('#subcontract-fields');
  const output = $('#enquiry-response');
  const submitBtn = $('#enquiry-submit');
  const typeRadios = $$('input[name="enquiry_type"]', enquiryForm);

  // No dates in the past
  $('#pickupDate').min = new Date().toISOString().split('T')[0];

  // Arrived from "Request a quote for this service"? Preselect it.
  const wanted = new URLSearchParams(window.location.search).get('service');
  if (wanted && $('#service option[value="' + wanted + '"]')) $('#service').value = wanted;

  // Show only the fields that fit the enquiry type
  const currentType = () => typeRadios.find((r) => r.checked).value;
  function toggleBlocks() {
    const isFreight = currentType() === 'freight-quote';
    freightBox.hidden = !isFreight;
    subBox.hidden = isFreight;
  }
  typeRadios.forEach((r) => r.addEventListener('change', toggleBlocks));
  toggleBlocks();

  const enquiryRules = {
    fullname:   check.fullName,
    company:    check.text('Company name', 2, 80),
    email:      check.email,
    phone:      check.phone(true),
    service:    check.select('a service'),
    route:      check.select('a route'),
    weight:     check.number('Load weight (tonnes)', 0.1, 40),
    pickupDate: check.futureDate,
    fleetSize:  check.number('Fleet size', 1, 500),
    message:    check.text('Message', 10, 500)
  };

  setupValidation(enquiryForm, enquiryRules, handleEnquiry);

  // AJAX: send the data in the background with fetch()
  async function sendWithAjax(data) {
    if (FORM_ENDPOINT.includes('YOUR_FORM_ID')) return true; // not set up yet
    const response = await fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.ok;
  }

  async function handleEnquiry() {
    const data = {
      fullname: $('#fullname').value.trim(),
      company: $('#company').value.trim(),
      email: $('#email').value.trim(),
      phone: $('#phone').value.trim(),
      enquiry_type: currentType(),
      message: $('#message').value.trim()
    };
    if (data.enquiry_type === 'freight-quote') {
      data.service = $('#service').value;
      data.route = $('#route').value;
      data.weight_tonnes = $('#weight').value;
      data.pickup_date = $('#pickupDate').value;
    } else {
      data.fleet_size = $('#fleetSize').value;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    let sent;
    try { sent = await sendWithAjax(data); } catch (error) { sent = false; }
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Enquiry';

    showEnquiryResponse(data, sent);
    enquiryForm.reset();
    $$('input, select, textarea', enquiryForm).forEach((f) => f.classList.remove('valid', 'invalid'));
    toggleBlocks();
  }

  function showEnquiryResponse(data, sent) {
    output.replaceChildren();
    output.className = 'response-box' + (sent ? '' : ' warning');
    output.hidden = false;
    output.appendChild(el('h3', 'Thank you, ' + data.fullname.split(' ')[0] + '!'));

    if (data.enquiry_type === 'freight-quote') {
      const route = ROUTES[data.route];
      const service = SERVICES.find((s) => s.id === data.service);
      const tonnes = Number(data.weight_tonnes);
      const estimate = route.base + route.perTonne * tonnes;
      const low = Math.round(estimate * 0.9 / 10) * 10;
      const high = Math.round(estimate * 1.1 / 10) * 10;

      // availability: compare the pickup date with the normal lead time
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const days = Math.round((new Date(data.pickup_date + 'T00:00:00') - today) / 86400000);
      let availability = days >= route.leadDays
        ? 'Fleet capacity is expected to be available for your pickup date.'
        : 'Your pickup is sooner than our usual ' + route.leadDays + '-day lead time, so availability will be confirmed by our team.';
      if (tonnes > 28) availability += ' A load this size may need more than one truck.';

      const list = document.createElement('ul');
      [
        'Service: ' + service.name,
        'Route: ' + route.label,
        'Load: ' + tonnes + ' tonne(s)',
        'Indicative cost: ' + rand.format(low) + ' to ' + rand.format(high),
        'Availability: ' + availability
      ].forEach((line) => list.appendChild(el('li', line)));
      output.append(el('p', 'We received your freight quote request:'), list,
        el('p', 'A consultant will contact you within 1 business day.'),
        el('p', 'This is an indicative estimate. The final price is confirmed after your load is assessed.', 'disclaimer'));
    } else {
      output.append(
        el('p', 'We received your subcontracting enquiry for ' + data.company + ' (' + data.fleet_size + ' vehicle(s)).'),
        el('p', 'Our team will contact you at ' + data.email + ' within 2 business days.'));
    }

    if (!sent) output.appendChild(el('p', 'We could not reach our server. Please also email ' + CONTACT_EMAIL + '.', 'disclaimer'));
    output.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

// ===== Contact form: validate, then compile an email =====
const contactForm = $('#contact-form');
if (contactForm) {
  const output = $('#email-output');

  const contactRules = {
    cname:    check.fullName,
    cemail:   check.email,
    cphone:   check.phone(false),   // optional, but checked if filled in
    ctype:    check.select('a message type'),
    cmessage: check.text('Message', 20, 1000)
  };

  setupValidation(contactForm, contactRules, () => {
    const name = $('#cname').value.trim();
    const email = $('#cemail').value.trim();
    const phone = $('#cphone').value.trim() || 'Not provided';
    const type = $('#ctype').value;
    const message = $('#cmessage').value.trim();

    const subject = '[Website: ' + type + '] Message from ' + name;
    const body = 'Hello Starline Logistics,\n\n' + message +
      '\n\n--\nName: ' + name + '\nEmail: ' + email + '\nPhone: ' + phone + '\nMessage type: ' + type;

    // mailto opens the visitor's email app; the Gmail link opens Gmail in the browser
    const mailto = 'mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    const gmail = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(CONTACT_EMAIL) +
      '&su=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);

    output.replaceChildren();
    output.hidden = false;
    output.append(el('h3', 'Your email is ready, ' + name.split(' ')[0] + '!'),
                  el('p', 'To: ' + CONTACT_EMAIL),
                  el('p', 'Subject: ' + subject),
                  el('pre', body, 'email-preview'));

    const actions = el('div', null, 'email-actions');
    const openMail = el('a', 'Send with my email app', 'btn');
    openMail.href = mailto;
    const openGmail = el('a', 'Send with Gmail', 'btn btn-outline');
    openGmail.href = gmail;
    openGmail.target = '_blank';
    openGmail.rel = 'noopener noreferrer';
    actions.append(openMail, openGmail);
    output.append(actions, el('p', 'Your message is only sent when you press send in your email program.', 'disclaimer'));
    output.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}