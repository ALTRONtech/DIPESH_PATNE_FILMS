const menuBtn = document.getElementById("menuBtn");
const menu = document.getElementById("menu");

menuBtn?.addEventListener("click", () => {
  menu.classList.toggle("open");
  menuBtn.textContent = menu.classList.contains("open") ? "×" : "☰";
});

document.querySelectorAll(".menu a").forEach(link => {
  link.addEventListener("click", () => {
    menu.classList.remove("open");
    if (menuBtn) menuBtn.textContent = "☰";
  });
});

const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxClose = document.getElementById("lightboxClose");

document.querySelectorAll(".gallery-item").forEach(item => {
  item.addEventListener("click", () => {
    if (!lightbox || !lightboxImage) return;
    lightboxImage.src = item.dataset.full;
    lightboxImage.alt = item.querySelector("img")?.alt || "Portfolio image";
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
  });
});

function closeLightbox() {
  if (!lightbox || !lightboxImage) return;
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("no-scroll");
  lightboxImage.src = "";
}

lightboxClose?.addEventListener("click", closeLightbox);
lightbox?.addEventListener("click", event => {
  if (event.target === lightbox) closeLightbox();
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeLightbox();
});

const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

const API_BASE = "http://127.0.0.1:8000/api";
const WHATSAPP_NUMBER = "918468811790"; // Update to your business WhatsApp number if needed.

document.getElementById("contactForm")?.addEventListener("submit", async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const enquiry = {
    name: String(data.get("name") || "").trim(),
    phone: String(data.get("phone") || "").trim(),
    service: String(data.get("service") || "").trim(),
    message: String(data.get("message") || "").trim(),
  };

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
  }

  if (saved) {
    alert("Thank you! Your enquiry was saved. WhatsApp will open so you can also send it directly.");
  } else {
    alert("The enquiry could not be saved to the website database. WhatsApp will open so you can still send it.");
  }
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappText)}`, "_blank", "noopener");
  if (saved) form.reset();
});
