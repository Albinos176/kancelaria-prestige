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
       INIT
    ============================================================ */
  handleScroll();
})();
