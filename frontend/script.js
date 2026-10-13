/* ============================================================
   Dipesh Patne | Films — frontend script
   - UI: menu, lightbox, reveal animations, counters, toasts
   - Backend: saves enquiries to the Django API, falls back to WhatsApp
   ============================================================ */

const API_BASE = "http://127.0.0.1:8000/api";
const WHATSAPP_NUMBER = "918468811790"; // business WhatsApp number

/* ---------- Preloader ---------- */
const preloader = document.getElementById("preloader");

window.addEventListener("load", () => {
  setTimeout(() => preloader?.classList.add("done"), 450);
});

// Safety: never trap the user behind the preloader
setTimeout(() => preloader?.classList.add("done"), 3500);

/* ---------- Mobile menu ---------- */
const menuBtn = document.getElementById("menuBtn");
const menu = document.getElementById("menu");

menuBtn?.addEventListener("click", () => {
  const open = menu.classList.toggle("open");
  menuBtn.textContent = open ? "×" : "☰";
  menuBtn.setAttribute("aria-expanded", String(open));
  menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
});

document.querySelectorAll(".menu a").forEach(link => {
  link.addEventListener("click", () => {
    menu.classList.remove("open");
    if (menuBtn) menuBtn.textContent = "☰";
  });
});

/* ---------- Header state + active link + back-to-top ---------- */
const header = document.getElementById("siteHeader");
const toTop = document.getElementById("toTop");
const navLinks = [...document.querySelectorAll(".menu a")];
const sections = navLinks
  .map(a => document.querySelector(a.getAttribute("href")))
  .filter(Boolean);
let lastScroll = 0;

function onScroll() {
  const y = window.scrollY;
  header?.classList.toggle("scrolled", y > 40);

  // hide header when scrolling down, show when scrolling up (mobile-friendly)
  if (y > 300 && y > lastScroll + 6) header?.classList.add("hidden-up");
  else if (y < lastScroll - 6 || y < 300) header?.classList.remove("hidden-up");
  lastScroll = y;

  toTop?.classList.toggle("show", y > 700);

  // active section highlight
  let currentId = "";
  sections.forEach(sec => {
    if (y >= sec.offsetTop - 140) currentId = sec.id;
  });
  navLinks.forEach(a => {
    a.classList.toggle("active", a.getAttribute("href") === `#${currentId}`);
  });
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

toTop?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* ---------- Reveal on scroll ---------- */
const revealEls = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16, rootMargin: "0px 0px -40px 0px" });

  revealEls.forEach(el => revealObserver.observe(el));
} else {
  revealEls.forEach(el => el.classList.add("visible"));
}

/* ---------- Animated counters ---------- */
const counters = document.querySelectorAll(".stat-number");

function animateCounter(el) {
  const target = parseInt(el.dataset.count || "0", 10);
  const duration = 1600;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    // ease-out for a satisfying slowdown at the end
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(target * eased);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

if ("IntersectionObserver" in window) {
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });
  counters.forEach(c => counterObserver.observe(c));
} else {
  counters.forEach(c => { c.textContent = c.dataset.count; });
}

/* ---------- Lightbox with prev / next ---------- */
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxClose = document.getElementById("lightboxClose");
const lightboxPrev = document.getElementById("lightboxPrev");
const lightboxNext = document.getElementById("lightboxNext");
const galleryItems = [...document.querySelectorAll(".gallery-item")];
let currentPhoto = 0;

function showPhoto(index) {
  if (!galleryItems.length) return;
  currentPhoto = (index + galleryItems.length) % galleryItems.length;
  const item = galleryItems[currentPhoto];
  lightboxImage.src = item.dataset.full;
  lightboxImage.alt = item.querySelector("img")?.alt || "Portfolio image";
}

function openLightbox(index) {
  if (!lightbox || !lightboxImage) return;
  showPhoto(index);
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");
}

function closeLightbox() {
  if (!lightbox || !lightboxImage) return;
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("no-scroll");
  lightboxImage.src = "";
}

galleryItems.forEach((item, index) => {
  item.addEventListener("click", () => openLightbox(index));
});

lightboxClose?.addEventListener("click", closeLightbox);
lightboxPrev?.addEventListener("click", () => showPhoto(currentPhoto - 1));
lightboxNext?.addEventListener("click", () => showPhoto(currentPhoto + 1));

lightbox?.addEventListener("click", event => {
  if (event.target === lightbox) closeLightbox();
});

document.addEventListener("keydown", event => {
  if (!lightbox?.classList.contains("open")) return;
  if (event.key === "Escape") closeLightbox();
  if (event.key === "ArrowLeft") showPhoto(currentPhoto - 1);
  if (event.key === "ArrowRight") showPhoto(currentPhoto + 1);
});

// swipe support for touch devices
let touchStartX = null;
lightbox?.addEventListener("touchstart", e => { touchStartX = e.touches[0].clientX; }, { passive: true });
lightbox?.addEventListener("touchend", e => {
  if (touchStartX === null) return;
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 46) showPhoto(currentPhoto + (dx < 0 ? 1 : -1));
  touchStartX = null;
}, { passive: true });

/* ---------- Footer year ---------- */
const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

/* ---------- Toast notifications ---------- */
const toast = document.getElementById("toast");
const toastMsg = document.getElementById("toastMsg");
let toastTimer = null;

function showToast(message, duration = 4200) {
  if (!toast || !toastMsg) return;
  toastMsg.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), duration);
}

/* ---------- Contact form: save to backend, then WhatsApp ---------- */
const form = document.getElementById("contactForm");
const submitBtn = document.getElementById("submitBtn");

function markInvalid(el, invalid) {
  el.classList.toggle("invalid", invalid);
}

form?.addEventListener("submit", async event => {
  event.preventDefault();

  const data = new FormData(form);
  const enquiry = {
    name: String(data.get("name") || "").trim(),
    phone: String(data.get("phone") || "").trim(),
    service: String(data.get("service") || "").trim(),
    message: String(data.get("message") || "").trim(),
  };

  // light client-side validation with visual feedback
  let valid = true;
  ["name", "phone", "service", "message"].forEach(key => {
    const el = form.elements[key];
    const ok = enquiry[key].length > 0;
    markInvalid(el, !ok);
    if (!ok) valid = false;
  });
  if (!valid) {
    showToast("Please fill in every field so I can get back to you.");
    return;
  }

  if (submitBtn) submitBtn.classList.add("loading");

  const whatsappText =
    `Hello Dipesh, I would like to make an enquiry.\n\n` +
    `Name: ${enquiry.name}\n` +
    `Phone: ${enquiry.phone}\n` +
    `Service: ${enquiry.service}\n` +
    `Message: ${enquiry.message}`;

  let saved = false;
  try {
    const response = await fetch(`${API_BASE}/enquiries/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(enquiry),
    });
    saved = response.ok;
  } catch (error) {
    console.warn("Could not reach Django backend; continuing with WhatsApp fallback.", error);
  } finally {
    if (submitBtn) submitBtn.classList.remove("loading");
  }

  if (saved) {
    showToast("Thank you! Your enquiry was saved. Opening WhatsApp…");
    form.reset();
  } else {
    showToast("Could not reach the server — WhatsApp will open so you can still send it.");
  }

  window.open(
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappText)}`,
    "_blank",
    "noopener"
  );
});

/* clear the invalid style as the user types */
["input", "change"].forEach(evt => {
  form?.addEventListener(evt, e => {
    if (e.target.classList?.contains("invalid")) markInvalid(e.target, false);
  });
});
