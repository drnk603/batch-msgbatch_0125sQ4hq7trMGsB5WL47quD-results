(function() {
  'use strict';

  const CONFIG = {
    HEADER_SCROLL_THRESHOLD: 50,
    SCROLL_OFFSET: 80,
    FORM_SUBMIT_DELAY: 800,
    COUNT_DURATION: 2000,
    THANK_YOU_PAGE: 'thank_you.html'
  };

  const REGEX = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^[\+\d\s\(\)\-]{10,20}$/,
    NAME: /^[a-zA-ZÀ-ÿ\s\-']{2,50}$/,
    TEXT: /^[a-zA-Z0-9À-ÿ\s\-'.,!?()]{10,1000}$/
  };

  class BurgerMenu {
    constructor() {
      this.toggle = document.querySelector('.c-nav__toggle');
      this.menu = document.querySelector('.navbar-collapse');
      if (this.toggle && this.menu) {
        this.init();
      }
    }

    init() {
      this.toggle.addEventListener('click', () => this.toggleMenu());
      document.addEventListener('click', (e) => this.handleOutsideClick(e));
      this.menu.querySelectorAll('.c-nav__link').forEach(link => {
        link.addEventListener('click', () => this.closeMenu());
      });
    }

    toggleMenu() {
      const isExpanded = this.toggle.getAttribute('aria-expanded') === 'true';
      this.toggle.setAttribute('aria-expanded', !isExpanded);
      this.menu.classList.toggle('show');
      document.body.classList.toggle('u-no-scroll', !isExpanded);
    }

    closeMenu() {
      this.toggle.setAttribute('aria-expanded', 'false');
      this.menu.classList.remove('show');
      document.body.classList.remove('u-no-scroll');
    }

    handleOutsideClick(e) {
      if (!this.toggle.contains(e.target) && !this.menu.contains(e.target) && this.menu.classList.contains('show')) {
        this.closeMenu();
      }
    }
  }

  class StickyHeader {
    constructor() {
      this.header = document.querySelector('.l-header');
      if (this.header) {
        this.init();
      }
    }

    init() {
      window.addEventListener('scroll', () => this.handleScroll(), { passive: true });
      this.handleScroll();
    }

    handleScroll() {
      if (window.scrollY > CONFIG.HEADER_SCROLL_THRESHOLD) {
        this.header.classList.add('is-scrolled');
      } else {
        this.header.classList.remove('is-scrolled');
      }
    }
  }

  class ScrollSpy {
    constructor() {
      this.sections = document.querySelectorAll('.l-section[id]');
      this.navLinks = document.querySelectorAll('.c-nav__link[href^="#"]');
      if (this.sections.length && this.navLinks.length) {
        this.init();
      }
    }

    init() {
      window.addEventListener('scroll', () => this.updateActiveLink(), { passive: true });
      this.updateActiveLink();
    }

    updateActiveLink() {
      let currentSection = '';
      this.sections.forEach(section => {
        const sectionTop = section.offsetTop - CONFIG.SCROLL_OFFSET - 10;
        if (window.scrollY >= sectionTop) {
          currentSection = section.getAttribute('id');
        }
      });

      this.navLinks.forEach(link => {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
        if (link.getAttribute('href') === `#${currentSection}`) {
          link.classList.add('active');
          link.setAttribute('aria-current', 'page');
        }
      });
    }
  }

  class SmoothScroll {
    constructor() {
      this.links = document.querySelectorAll('a[href^="#"]');
      if (this.links.length) {
        this.init();
      }
    }

    init() {
      this.links.forEach(link => {
        link.addEventListener('click', (e) => this.handleClick(e));
      });
    }

    handleClick(e) {
      const href = e.currentTarget.getAttribute('href');
      if (href === '#' || !href) return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const targetPosition = target.offsetTop - CONFIG.SCROLL_OFFSET;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });

        const menu = document.querySelector('.navbar-collapse');
        const toggle = document.querySelector('.c-nav__toggle');
        if (menu && menu.classList.contains('show')) {
          toggle.setAttribute('aria-expanded', 'false');
          menu.classList.remove('show');
          document.body.classList.remove('u-no-scroll');
        }
      }
    }
  }

  class FormValidator {
    constructor(formId) {
      this.form = document.getElementById(formId);
      if (this.form) {
        this.init();
      }
    }

    init() {
      this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    handleSubmit(e) {
      e.preventDefault();
      this.clearErrors();

      const fields = this.collectFields();
      const errors = this.validateFields(fields);

      if (errors.length > 0) {
        this.displayErrors(errors);
        return;
      }

      this.submitForm();
    }

    collectFields() {
      const fields = {};
      this.form.querySelectorAll('input, textarea').forEach(input => {
        if (input.id) {
          fields[input.id] = {
            value: input.value.trim(),
            required: input.hasAttribute('required'),
            type: input.type,
            element: input
          };
        }
      });
      return fields;
    }

    validateFields(fields) {
      const errors = [];

      Object.keys(fields).forEach(key => {
        const field = fields[key];
        
        if (field.required && !field.value) {
          errors.push({ id: key, message: "Це поле обов'язкове" });
          return;
        }

        if (!field.value) return;

        if (key.includes('first') || key.includes('last') || key.includes('First') || key.includes('Last')) {
          if (!REGEX.NAME.test(field.value)) {
            errors.push({ id: key, message: "Введіть коректне ім'я (2-50 символів)" });
          }
        }

        if (field.type === 'email' || key.includes('email')) {
          if (!REGEX.EMAIL.test(field.value)) {
            errors.push({ id: key, message: 'Введіть коректну email адресу' });
          }
        }

        if (field.type === 'tel' || key.includes('phone')) {
          if (!REGEX.PHONE.test(field.value)) {
            errors.push({ id: key, message: 'Введіть коректний телефон (10-20 символів)' });
          }
        }

        if (key.includes('message') && field.value.length < 10) {
          errors.push({ id: key, message: 'Повідомлення має містити мінімум 10 символів' });
        }
      });

      const checkbox = this.form.querySelector('input[type="checkbox"][required]');
      if (checkbox && !checkbox.checked) {
        errors.push({ id: checkbox.id, message: 'Необхідно прийняти умови' });
      }

      const pollForm = this.form.id === 'pollForm';
      if (pollForm) {
        const checked = this.form.querySelector('input[type="radio"]:checked');
        if (!checked) {
          errors.push({ id: 'pollError', message: 'Виберіть один варіант' });
        }
      }

      return errors;
    }

    displayErrors(errors) {
      errors.forEach(error => {
        const field = document.getElementById(error.id);
        if (field) {
          field.classList.add('has-error', 'is-invalid');
          
          let errorDiv = field.parentElement.querySelector('.c-form__error, .invalid-feedback');
          if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'c-form__error invalid-feedback';
            field.parentElement.appendChild(errorDiv);
          }
          errorDiv.textContent = error.message;
          errorDiv.style.display = 'block';
        }
      });

      const firstError = document.querySelector('.has-error, .is-invalid');
      if (firstError) {
        firstError.focus();
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    clearErrors() {
      this.form.querySelectorAll('.has-error, .is-invalid').forEach(el => {
        el.classList.remove('has-error', 'is-invalid');
      });
      this.form.querySelectorAll('.c-form__error, .invalid-feedback').forEach(el => {
        el.style.display = 'none';
        el.textContent = '';
      });
    }

    submitForm() {
      const submitBtn = this.form.querySelector('button[type="submit"]');
      if (submitBtn) {
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.classList.add('is-disabled');
        submitBtn.textContent = 'Відправляється...';

        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.classList.remove('is-disabled');
          submitBtn.textContent = originalText;
          window.location.href = CONFIG.THANK_YOU_PAGE;
        }, CONFIG.FORM_SUBMIT_DELAY);
      }
    }
  }

  class ScrollToTop {
    constructor() {
      this.createButton();
    }

    createButton() {
      const btn = document.createElement('button');
      btn.innerHTML = '↑';
      btn.className = 'c-scroll-to-top';
      btn.setAttribute('aria-label', 'Прокрутити вгору');
      btn.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: var(--color-primary);
        color: white;
        border: none;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 999;
        font-size: 1.5rem;
        box-shadow: var(--shadow-lg);
      `;
      document.body.appendChild(btn);

      window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
          btn.style.opacity = '1';
          btn.style.visibility = 'visible';
        } else {
          btn.style.opacity = '0';
          btn.style.visibility = 'hidden';
        }
      }, { passive: true });

      btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  class CountUp {
    constructor() {
      this.counters = document.querySelectorAll('[data-count]');
      if (this.counters.length) {
        this.init();
      }
    }

    init() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
            this.animate(entry.target);
            entry.target.classList.add('counted');
          }
        });
      }, { threshold: 0.5 });

      this.counters.forEach(counter => observer.observe(counter));
    }

    animate(element) {
      const target = parseInt(element.getAttribute('data-count'));
      const duration = CONFIG.COUNT_DURATION;
      const step = target / (duration / 16);
      let current = 0;

      const timer = setInterval(() => {
        current += step;
        if (current >= target) {
          element.textContent = target;
          clearInterval(timer);
        } else {
          element.textContent = Math.floor(current);
        }
      }, 16);
    }
  }

  class ModalManager {
    constructor() {
      this.modals = document.querySelectorAll('[data-modal]');
      this.triggers = document.querySelectorAll('[data-modal-trigger]');
      if (this.modals.length || this.triggers.length) {
        this.init();
      }
    }

    init() {
      this.triggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
          e.preventDefault();
          const modalId = trigger.getAttribute('data-modal-trigger');
          this.open(modalId);
        });
      });

      this.modals.forEach(modal => {
        const closeBtn = modal.querySelector('[data-modal-close]');
        if (closeBtn) {
          closeBtn.addEventListener('click', () => this.close(modal));
        }
        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            this.close(modal);
          }
        });
      });
    }

    open(modalId) {
      const modal = document.querySelector(`[data-modal="${modalId}"]`);
      if (modal) {
        modal.style.display = 'flex';
        document.body.classList.add('u-no-scroll');
      }
    }

    close(modal) {
      modal.style.display = 'none';
      document.body.classList.remove('u-no-scroll');
    }
  }

  function initForms() {
    ['contactForm', 'pollForm'].forEach(formId => {
      if (document.getElementById(formId)) {
        new FormValidator(formId);
      }
    });

    const downloadForm = document.querySelector('.c-form:not([id])');
    if (downloadForm && downloadForm.querySelector('#download-first-name')) {
      downloadForm.id = 'downloadForm';
      new FormValidator('downloadForm');
    }
  }

  function init() {
    new BurgerMenu();
    new StickyHeader();
    new ScrollSpy();
    new SmoothScroll();
    new ScrollToTop();
    new CountUp();
    new ModalManager();
    initForms();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();