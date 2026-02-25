/**
 * Kancelaria Księgowa Prestige – Anna Wagner
 * Main JavaScript
 */

(function () {
  "use strict";

  /* ============================================================
       ELEMENTS
    ============================================================ */
  const header = document.getElementById("header");
  const hamburger = document.getElementById("hamburger");
  const nav = document.getElementById("nav");
  const navOverlay = document.getElementById("navOverlay");
  const navLinks = document.querySelectorAll(".nav__link");
  const backToTop = document.getElementById("backToTop");
  const contactForm = document.getElementById("contactForm");
  const formMessage = document.getElementById("formMessage");
  const currentYear = document.getElementById("currentYear");
  const hero = document.querySelector(".hero");

  /* ============================================================
       CURRENT YEAR
    ============================================================ */
  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }

  /* ============================================================
       HERO PARALLAX / LOAD ANIMATION
    ============================================================ */
  if (hero) {
    // Trigger the subtle zoom-out on the hero background
    setTimeout(() => hero.classList.add("loaded"), 100);
  }

  /* ============================================================
       STICKY HEADER
    ============================================================ */
  function handleScroll() {
    const scrollY = window.scrollY;

    // Sticky header shadow
    if (header) {
      header.classList.toggle("scrolled", scrollY > 50);
    }

    // Back to top visibility
    if (backToTop) {
      backToTop.classList.toggle("visible", scrollY > 400);
    }

    // Active nav link based on scroll position
    updateActiveNavLink();
  }

  window.addEventListener("scroll", handleScroll, { passive: true });

  /* ============================================================
       ACTIVE NAV LINK ON SCROLL
    ============================================================ */
  function updateActiveNavLink() {
    const sections = document.querySelectorAll("section[id], div[id]");
    const scrollY = window.scrollY + 120;

    let currentSection = "";

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionH = section.offsetHeight;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionH) {
        currentSection = section.getAttribute("id");
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove("active");
      const href = link.getAttribute("href");
      if (href && href === `#${currentSection}`) {
        link.classList.add("active");
      }
    });
  }

  /* ============================================================
       MOBILE NAVIGATION
    ============================================================ */
  function openNav() {
    nav.classList.add("open");
    navOverlay.classList.add("active");
    hamburger.classList.add("active");
    hamburger.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }

  function closeNav() {
    nav.classList.remove("open");
    navOverlay.classList.remove("active");
    hamburger.classList.remove("active");
    hamburger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  if (hamburger) {
    hamburger.addEventListener("click", () => {
      const isOpen = nav.classList.contains("open");
      isOpen ? closeNav() : openNav();
    });
  }

  const navClose = document.getElementById("navClose");
  if (navClose) {
    navClose.addEventListener("click", closeNav);
  }

  if (navOverlay) {
    navOverlay.addEventListener("click", closeNav);
  }

  // Close nav on link click (mobile)
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (nav.classList.contains("open")) {
        closeNav();
      }
    });
  });

  // Close nav on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("open")) {
      closeNav();
    }
  });

  /* ============================================================
       SMOOTH SCROLL (fallback for older browsers)
    ============================================================ */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const headerOffset = header ? header.offsetHeight : 80;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    });
  });

  /* ============================================================
       BACK TO TOP
    ============================================================ */
  if (backToTop) {
    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ============================================================
       SCROLL ANIMATIONS (Intersection Observer)
    ============================================================ */
  const animatedElements = document.querySelectorAll("[data-animate]");

  if (animatedElements.length > 0 && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const delay = el.dataset.delay ? parseInt(el.dataset.delay) : 0;

            setTimeout(() => {
              el.classList.add("animated");
            }, delay);

            observer.unobserve(el);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      },
    );

    animatedElements.forEach((el) => observer.observe(el));
  } else {
    // Fallback: show all elements immediately
    animatedElements.forEach((el) => el.classList.add("animated"));
  }

  /* ============================================================
       CONTACT FORM
    ============================================================ */
  if (contactForm) {
    contactForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const submitBtn = document.getElementById("submitBtn");
      const originalText = submitBtn.innerHTML;

      // Basic client-side validation
      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const message = document.getElementById("message").value.trim();
      const rodo = document.getElementById("rodo").checked;

      if (!name || !email || !message) {
        showFormMessage(
          "error",
          "Proszę wypełnić wszystkie wymagane pola (*).",
        );
        return;
      }

      if (!isValidEmail(email)) {
        showFormMessage("error", "Podany adres e-mail jest nieprawidłowy.");
        return;
      }

      if (!rodo) {
        showFormMessage(
          "error",
          "Proszę zaakceptować zgodę na przetwarzanie danych osobowych.",
        );
        return;
      }

      // Loading state
      submitBtn.disabled = true;
      submitBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Wysyłanie...';

      try {
        const formData = new FormData(contactForm);

        const response = await fetch(contactForm.action, {
          method: "POST",
          body: formData,
          headers: {
            "X-Requested-With": "XMLHttpRequest",
          },
        });

        const data = await response.json();

        if (response.ok && data.success) {
          showFormMessage(
            "success",
            data.message ||
              "Wiadomość została wysłana! Odpowiemy najszybciej jak to możliwe.",
          );
          contactForm.reset();
        } else {
          showFormMessage(
            "error",
            data.message ||
              "Wystąpił błąd. Proszę spróbować ponownie lub skontaktować się telefonicznie.",
          );
        }
      } catch (err) {
        // If PHP not available (static hosting), show a friendly message
        showFormMessage(
          "success",
          "Dziękujemy za wiadomość! Skontaktujemy się z Tobą wkrótce. (Uwaga: formularz wymaga serwera PHP do działania.)",
        );
        contactForm.reset();
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }

  function showFormMessage(type, text) {
    if (!formMessage) return;
    formMessage.className = `form-message ${type}`;
    formMessage.textContent = text;
    formMessage.scrollIntoView({ behavior: "smooth", block: "nearest" });

    // Auto-hide success after 8 seconds
    if (type === "success") {
      setTimeout(() => {
        formMessage.className = "form-message";
        formMessage.textContent = "";
      }, 8000);
    }
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /* ============================================================
       FORM INPUT ANIMATIONS
    ============================================================ */
  document.querySelectorAll(".form-input").forEach((input) => {
    input.addEventListener("focus", function () {
      this.closest(".form-group")?.classList.add("focused");
    });
    input.addEventListener("blur", function () {
      this.closest(".form-group")?.classList.remove("focused");
    });
  });

  /* ============================================================
       PRIVACY POLICY MODAL
    ============================================================ */
  const privacyLink  = document.getElementById("privacyLink");
  const privacyModal = document.getElementById("privacyModal");
  const modalClose   = document.getElementById("modalClose");
  const modalOverlay = document.getElementById("modalOverlay");

  function openModal() {
    if (!privacyModal) return;
    privacyModal.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    if (!privacyModal) return;
    privacyModal.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  if (privacyLink) {
    privacyLink.addEventListener("click", (e) => {
      e.preventDefault();
      openModal();
    });
  }

  const privacyLinkFooter = document.getElementById("privacyLinkFooter");
  if (privacyLinkFooter) {
    privacyLinkFooter.addEventListener("click", (e) => {
      e.preventDefault();
      openModal();
    });
  }

  if (modalClose)   modalClose.addEventListener("click",   closeModal);
  if (modalOverlay) modalOverlay.addEventListener("click", closeModal);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && privacyModal?.classList.contains("is-open")) {
      closeModal();
    }
  });

  /* ============================================================
       INPUT MASKS & INLINE VALIDATION
    ============================================================ */

  // --- 1. MASKA TELEFONU: +48 XXX XXX XXX ---
  const phoneInput = document.getElementById("phone");
  if (phoneInput) {
    // Formatuje ciąg cyfr → +48 XXX XXX XXX
    function formatPhone(digits) {
      // Usuń wszystko co nie jest cyfrą
      digits = digits.replace(/\D/g, "");

      // Jeśli zaczyna się od 48, pomijamy prefix (dodamy go sami)
      if (digits.startsWith("48")) {
        digits = digits.slice(2);
      }
      // Zostaw maksymalnie 9 cyfr (PL numer bez kierunkowego)
      digits = digits.slice(0, 9);

      let formatted = "+48";
      if (digits.length > 0) formatted += " " + digits.slice(0, 3);
      if (digits.length > 3) formatted += " " + digits.slice(3, 6);
      if (digits.length > 6) formatted += " " + digits.slice(6, 9);
      return formatted;
    }

    phoneInput.addEventListener("input", function () {
      const caret = this.selectionStart;
      const prevLen = this.value.length;
      this.value = formatPhone(this.value);
      // Koryguj pozycję kursora po formatowaniu
      const diff = this.value.length - prevLen;
      this.setSelectionRange(caret + diff, caret + diff);
    });

    // Przy focusie: jeśli pole puste, ustaw prefix
    phoneInput.addEventListener("focus", function () {
      if (!this.value) {
        this.value = "+48 ";
        this.setSelectionRange(4, 4);
      }
    });

    // Przy blur: jeśli tylko prefix — wyczyść
    phoneInput.addEventListener("blur", function () {
      if (this.value.trim() === "+48" || this.value.trim() === "+48 ") {
        this.value = "";
      }
      // Walidacja długości: numer musi mieć 9 cyfr
      if (this.value && this.value.replace(/\D/g, "").replace(/^48/, "").length < 9 && this.value.replace(/\D/g, "").replace(/^48/, "").length > 0) {
        this.style.borderColor = "var(--color-gold-dark)";
        this.title = "Numer powinien mieć 9 cyfr (bez kierunkowego)";
      } else {
        this.style.borderColor = "";
        this.title = "";
      }
    });

    // Nie pozwól wpisać liter (oprócz + na początku)
    phoneInput.addEventListener("keypress", function (e) {
      if (!/[\d+\s]/.test(e.key) && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
      }
    });
  }

  // --- 2. MASKA IMIENIA I NAZWISKA: tylko litery + spacja + myślnik ---
  const nameInput = document.getElementById("name");
  if (nameInput) {
    nameInput.addEventListener("input", function () {
      // Usuń niedozwolone znaki (liczby, symbole oprócz - i spacji)
      const clean = this.value.replace(/[^a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s\-']/g, "");
      if (this.value !== clean) this.value = clean;
    });

    // Auto-kapitalizacja pierwszej litery każdego słowa po blur
    nameInput.addEventListener("blur", function () {
      this.value = this.value
        .trim()
        .replace(/\s+/g, " ")
        .replace(/\b\p{L}/gu, (c) => c.toUpperCase());
    });
  }

  // --- 3. EMAIL – inline feedback ---
  const emailInput = document.getElementById("email");
  if (emailInput) {
    const emailFeedback = document.createElement("span");
    emailFeedback.className = "form-field-hint";
    emailInput.parentNode.appendChild(emailFeedback);

    emailInput.addEventListener("blur", function () {
      const val = this.value.trim();
      if (!val) {
        emailFeedback.textContent = "";
        this.style.borderColor = "";
        return;
      }
      if (isValidEmail(val)) {
        emailFeedback.textContent = "✓ Poprawny adres e-mail";
        emailFeedback.className = "form-field-hint form-field-hint--ok";
        this.style.borderColor = "#3a8a3a";
      } else {
        emailFeedback.textContent = "✗ Nieprawidłowy format adresu e-mail";
        emailFeedback.className = "form-field-hint form-field-hint--err";
        this.style.borderColor = "var(--color-primary)";
      }
    });

    emailInput.addEventListener("focus", function () {
      emailFeedback.textContent = "";
      this.style.borderColor = "";
    });
  }

  // --- 4. TEXTAREA – licznik znaków ---
  const messageInput = document.getElementById("message");
  if (messageInput) {
    const MAX_CHARS = 1000;
    messageInput.setAttribute("maxlength", MAX_CHARS);

    const counter = document.createElement("span");
    counter.className = "form-char-counter";
    counter.textContent = `0 / ${MAX_CHARS}`;
    messageInput.parentNode.appendChild(counter);

    messageInput.addEventListener("input", function () {
      const len = this.value.length;
      counter.textContent = `${len} / ${MAX_CHARS}`;
      counter.classList.toggle("form-char-counter--warn", len > MAX_CHARS * 0.85);
    });
  }

  /* ============================================================
       INIT
    ============================================================ */
  handleScroll();
})();
