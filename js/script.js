/**
 * THE SAFFRON TABLE — Premium Restaurant Website Demo
 * Vanilla JavaScript Implementation
 * 
 * Features:
 * 1. Responsive mobile navigation with backdrop & body scroll lock
 * 2. Sticky navigation with scroll-aware styling & active link highlight
 * 3. Accessible gallery lightbox with full keyboard navigation (Esc, Arrows)
 * 4. Interactive full menu modal with category tab switching
 * 5. Philosophy story modal
 * 6. Interactive reservation form validation with demo feedback dialog
 * 7. Dynamic footer copyright year & date input constraints
 * 8. Progressive reveal animations with IntersectionObserver & reduced motion support
 */

document.addEventListener('DOMContentLoaded', () => {
  // Flag JS support for graceful enhancement
  document.documentElement.classList.add('js-loaded');

  /* ==========================================================================
     1. Dynamic Year & Reservation Date Constraints
     ========================================================================== */
  const yearElement = document.getElementById('current-year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  const dateInput = document.getElementById('res-date');
  if (dateInput) {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    dateInput.min = todayStr;

    // Max reservation window: 60 days in advance (fine dining standard)
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 60);
    dateInput.max = maxDate.toISOString().split('T')[0];

    // Pre-populate with tomorrow's date for realistic demo preview
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    dateInput.value = tomorrow.toISOString().split('T')[0];
  }

  /* ==========================================================================
     2. Navigation Scroll Effect & Active Section Tracking
     ========================================================================== */
  const siteHeader = document.getElementById('site-header');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id], header[id]');

  function handleScroll() {
    if (!siteHeader) return;
    if (window.scrollY > 40) {
      siteHeader.classList.add('scrolled');
    } else {
      siteHeader.classList.remove('scrolled');
    }

    // High-precision viewport active section tracking
    let currentId = '';
    const headerHeight = siteHeader.offsetHeight || 88;

    sections.forEach(sec => {
      const rect = sec.getBoundingClientRect();
      // Element is active if its top has reached the header and its bottom is still below the header
      if (rect.top <= headerHeight + 50 && rect.bottom > headerHeight + 50) {
        currentId = sec.getAttribute('id');
      }
    });

    if (currentId) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentId}`) {
          link.classList.add('active');
        }
      });
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Initial check on page load

  /* ==========================================================================
     3. Mobile Navigation Drawer & Hamburger Toggle
     ========================================================================== */
  const navToggle = document.getElementById('nav-toggle');
  const navMenuWrapper = document.getElementById('nav-menu-wrapper');
  const navBackdrop = document.getElementById('nav-backdrop');
  const mobileDrawerClose = document.getElementById('mobile-drawer-close');

  function openNav() {
    if (!navToggle || !navMenuWrapper) return;
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Close navigation menu');
    navMenuWrapper.classList.add('open');
    if (navBackdrop) navBackdrop.classList.add('open');
    document.body.classList.add('nav-open');
    if (mobileDrawerClose) mobileDrawerClose.focus();
  }

  function closeNav() {
    if (!navToggle || !navMenuWrapper) return;
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open navigation menu');
    navMenuWrapper.classList.remove('open');
    if (navBackdrop) navBackdrop.classList.remove('open');
    document.body.classList.remove('nav-open');
  }

  if (navToggle) {
    navToggle.addEventListener('click', () => {
      const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
      if (isExpanded) {
        closeNav();
      } else {
        openNav();
      }
    });
  }

  if (mobileDrawerClose) {
    mobileDrawerClose.addEventListener('click', () => {
      closeNav();
      if (navToggle) navToggle.focus();
    });
  }

  if (navBackdrop) {
    navBackdrop.addEventListener('click', closeNav);
  }

  // Close mobile nav when clicking any nav link
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeNav();
    });
  });

  // Mobile nav focus trap and Escape key
  document.addEventListener('keydown', (e) => {
    if (!navMenuWrapper || !navMenuWrapper.classList.contains('open')) return;

    if (e.key === 'Escape') {
      closeNav();
      if (navToggle) navToggle.focus();
    } else if (e.key === 'Tab') {
      const focusableElements = navMenuWrapper.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (!focusableElements.length) return;
      const firstEl = focusableElements[0];
      const lastEl = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    }
  });

  /* ==========================================================================
     4. Gallery Lightbox with Full Keyboard Support
     ========================================================================== */
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxCounter = document.getElementById('lightbox-counter');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');
  let currentGalleryIndex = 0;
  let lastActiveGalleryTrigger = null;

  const galleryData = Array.from(galleryItems).map(item => ({
    full: item.getAttribute('data-full') || item.querySelector('img').src,
    caption: item.getAttribute('data-caption') || item.querySelector('img').alt,
    alt: item.querySelector('img').alt
  }));

  function showLightbox(index) {
    if (!lightbox || !galleryData.length) return;
    currentGalleryIndex = (index + galleryData.length) % galleryData.length;
    const currentItem = galleryData[currentGalleryIndex];

    lightboxImg.style.opacity = '0.4';
    lightboxImg.src = currentItem.full;
    lightboxImg.alt = currentItem.alt;
    lightboxImg.onload = () => {
      lightboxImg.style.opacity = '1';
    };
    lightboxCaption.textContent = currentItem.caption;
    lightboxCounter.textContent = `${currentGalleryIndex + 1} / ${galleryData.length}`;

    lightbox.classList.add('active');
    document.body.classList.add('modal-open');
    if (lightboxClose) lightboxClose.focus();
  }

  function hideLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('active');
    document.body.classList.remove('modal-open');
    if (lastActiveGalleryTrigger) {
      lastActiveGalleryTrigger.focus();
    }
  }

  function prevImage() {
    showLightbox(currentGalleryIndex - 1);
  }

  function nextImage() {
    showLightbox(currentGalleryIndex + 1);
  }

  // Touch Swipe Support for Mobile Lightbox
  let touchStartX = 0;
  let touchEndX = 0;

  if (lightbox) {
    lightbox.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchEndX - touchStartX;
      if (Math.abs(diff) > 45) {
        if (diff < 0) {
          nextImage();
        } else {
          prevImage();
        }
      }
    }, { passive: true });
  }

  galleryItems.forEach((item, index) => {
    // Click trigger
    item.addEventListener('click', () => {
      lastActiveGalleryTrigger = item;
      showLightbox(index);
    });

    // Keyboard Enter / Space trigger
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        lastActiveGalleryTrigger = item;
        showLightbox(index);
      }
    });
  });

  if (lightboxClose) {
    lightboxClose.addEventListener('click', hideLightbox);
  }

  if (lightboxPrev) {
    lightboxPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      prevImage();
    });
  }

  if (lightboxNext) {
    lightboxNext.addEventListener('click', (e) => {
      e.stopPropagation();
      nextImage();
    });
  }

  // Click outside dialog to close
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target.classList.contains('lightbox-dialog')) {
        hideLightbox();
      }
    });
  }

  // Lightbox keyboard shortcuts & focus trap
  document.addEventListener('keydown', (e) => {
    if (!lightbox || !lightbox.classList.contains('active')) return;

    if (e.key === 'Escape') {
      hideLightbox();
    } else if (e.key === 'ArrowLeft') {
      prevImage();
    } else if (e.key === 'ArrowRight') {
      nextImage();
    } else if (e.key === 'Tab') {
      // Focus trap within lightbox
      const focusables = [lightboxClose, lightboxPrev, lightboxNext].filter(el => el !== null);
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  });

  /* ==========================================================================
     5. Full Menu Interactive Modal & Tabs
     ========================================================================== */
  const btnViewFullMenu = document.getElementById('btn-view-full-menu');
  const menuModal = document.getElementById('menu-modal');
  const menuModalClose = document.getElementById('menu-modal-close');
  const menuTabs = document.querySelectorAll('.menu-tab-btn');
  const menuPanels = document.querySelectorAll('.menu-category-panel');
  let lastMenuTrigger = null;

  function openMenuModal() {
    if (!menuModal) return;
    menuModal.classList.add('active');
    document.body.classList.add('modal-open');
    if (menuModalClose) menuModalClose.focus();
  }

  function closeMenuModal() {
    if (!menuModal) return;
    menuModal.classList.remove('active');
    document.body.classList.remove('modal-open');
    if (lastMenuTrigger) lastMenuTrigger.focus();
  }

  if (btnViewFullMenu) {
    btnViewFullMenu.addEventListener('click', () => {
      lastMenuTrigger = btnViewFullMenu;
      openMenuModal();
    });
  }

  if (menuModalClose) {
    menuModalClose.addEventListener('click', closeMenuModal);
  }

  if (menuModal) {
    menuModal.addEventListener('click', (e) => {
      if (e.target === menuModal) {
        closeMenuModal();
      }
    });
  }

  // Menu Category Tab Switching
  menuTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetPanelId = tab.getAttribute('data-panel');

      // Update tabs state
      menuTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      // Update panels state
      menuPanels.forEach(panel => {
        if (panel.id === targetPanelId) {
          panel.classList.add('active');
        } else {
          panel.classList.remove('active');
        }
      });
    });
  });

  /* ==========================================================================
     6. Story Narrative Modal
     ========================================================================== */
  const btnOpenStory = document.getElementById('btn-open-story');
  const storyModal = document.getElementById('story-modal');
  const storyModalClose = document.getElementById('story-modal-close');
  let lastStoryTrigger = null;

  function openStoryModal() {
    if (!storyModal) return;
    storyModal.classList.add('active');
    document.body.classList.add('modal-open');
    if (storyModalClose) storyModalClose.focus();
  }

  function closeStoryModal() {
    if (!storyModal) return;
    storyModal.classList.remove('active');
    document.body.classList.remove('modal-open');
    if (lastStoryTrigger) lastStoryTrigger.focus();
  }

  if (btnOpenStory) {
    btnOpenStory.addEventListener('click', () => {
      lastStoryTrigger = btnOpenStory;
      openStoryModal();
    });
  }

  if (storyModalClose) {
    storyModalClose.addEventListener('click', closeStoryModal);
  }

  if (storyModal) {
    storyModal.addEventListener('click', (e) => {
      if (e.target === storyModal) {
        closeStoryModal();
      }
    });
  }

  // Close modals on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (menuModal && menuModal.classList.contains('active')) {
        closeMenuModal();
      }
      if (storyModal && storyModal.classList.contains('active')) {
        closeStoryModal();
      }
      if (demoReservationModal && demoReservationModal.classList.contains('active')) {
        closeDemoModal();
      }
    }
  });

  /* ==========================================================================
     7. Reservation Form Validation & Demo Feedback Dialog
     ========================================================================== */
  const reservationForm = document.getElementById('reservation-form');
  const demoReservationModal = document.getElementById('demo-reservation-modal');
  const demoModalSummary = document.getElementById('demo-modal-summary');
  const btnCloseDemoModal = document.getElementById('btn-close-demo-modal');

  function validateField(groupId, inputId, validatorFn) {
    const group = document.getElementById(groupId);
    const input = document.getElementById(inputId);
    if (!group || !input) return true;

    const isValid = validatorFn(input.value.trim());
    if (isValid) {
      group.classList.remove('has-error');
      input.classList.remove('error');
    } else {
      group.classList.add('has-error');
      input.classList.add('error');
    }
    return isValid;
  }

  if (reservationForm) {
    // Real-time clearance of errors on input
    ['res-date', 'res-time', 'res-guests', 'res-name', 'res-phone'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => {
          el.classList.remove('error');
          const group = el.closest('.form-group');
          if (group) group.classList.remove('has-error');
        });
        el.addEventListener('change', () => {
          el.classList.remove('error');
          const group = el.closest('.form-group');
          if (group) group.classList.remove('has-error');
        });
      }
    });

    reservationForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const isDateValid = validateField('group-date', 'res-date', val => val.length > 0);
      const isTimeValid = validateField('group-time', 'res-time', val => val.length > 0);
      const isGuestsValid = validateField('group-guests', 'res-guests', val => val.length > 0);
      const isNameValid = validateField('group-name', 'res-name', val => val.length >= 2);
      const isPhoneValid = validateField('group-phone', 'res-phone', val => {
        // Must contain at least 8 digits
        const digits = val.replace(/\D/g, '');
        return digits.length >= 8 && digits.length <= 15;
      });

      const isFormValid = isDateValid && isTimeValid && isGuestsValid && isNameValid && isPhoneValid;

      if (!isFormValid) {
        // Focus first invalid element
        const firstErrorInput = reservationForm.querySelector('.form-input.error, .form-select.error');
        if (firstErrorInput) {
          firstErrorInput.focus();
        }
        return;
      }

      // Collect submitted values for realistic demonstration preview
      const dateVal = document.getElementById('res-date').value;
      const timeVal = document.getElementById('res-time').value;
      const guestsVal = document.getElementById('res-guests').value;
      const nameVal = document.getElementById('res-name').value.trim();
      const phoneVal = document.getElementById('res-phone').value.trim();
      const areaVal = document.getElementById('res-area').value;
      const notesVal = document.getElementById('res-notes').value.trim();

      // Format date nicely
      let formattedDate = dateVal;
      try {
        const d = new Date(dateVal + 'T00:00:00');
        formattedDate = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
      } catch (err) {
        formattedDate = dateVal;
      }

      // Render summary in modal
      if (demoModalSummary) {
        demoModalSummary.innerHTML = `
          <div><strong>Guest Name:</strong> ${escapeHTML(nameVal)}</div>
          <div><strong>Phone Number:</strong> ${escapeHTML(phoneVal)}</div>
          <div><strong>Party Size:</strong> ${escapeHTML(guestsVal)}</div>
          <div><strong>Date &amp; Time:</strong> ${escapeHTML(formattedDate)} at ${escapeHTML(timeVal)}</div>
          <div><strong>Preferred Seating:</strong> ${escapeHTML(areaVal)}</div>
          ${notesVal ? `<div><strong>Special Notes:</strong> ${escapeHTML(notesVal)}</div>` : ''}
        `;
      }

      // Open demo confirmation modal
      if (demoReservationModal) {
        demoReservationModal.classList.add('active');
        document.body.classList.add('modal-open');
        if (btnCloseDemoModal) btnCloseDemoModal.focus();
      }
    });
  }

  function closeDemoModal() {
    if (!demoReservationModal) return;
    demoReservationModal.classList.remove('active');
    document.body.classList.remove('modal-open');
  }

  if (btnCloseDemoModal) {
    btnCloseDemoModal.addEventListener('click', closeDemoModal);
  }

  if (demoReservationModal) {
    demoReservationModal.addEventListener('click', (e) => {
      if (e.target === demoReservationModal) {
        closeDemoModal();
      }
    });
  }

  // HTML sanitization helper for input preview
  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }

  /* ==========================================================================
     8. Progressive Reveal Animations (IntersectionObserver)
     ========================================================================== */
  const revealElements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.12
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback: immediately reveal all
    revealElements.forEach(el => el.classList.add('is-revealed'));
  }
});
