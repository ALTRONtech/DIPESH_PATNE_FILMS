const menuBtn = document.getElementById("menuBtn");
const menu = document.getElementById("menu");

menuBtn.addEventListener("click", () => {
  menu.classList.toggle("open");
  menuBtn.textContent = menu.classList.contains("open") ? "×" : "☰";
});

document.querySelectorAll(".menu a").forEach(link => {
  link.addEventListener("click", () => {
    menu.classList.remove("open");
    menuBtn.textContent = "☰";
  });
});

const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxClose = document.getElementById("lightboxClose");

document.querySelectorAll(".gallery-item").forEach(item => {
  item.addEventListener("click", () => {
    lightboxImage.src = item.dataset.full;
    lightboxImage.alt = item.querySelector("img").alt;
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
  });
});

function closeLightbox() {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("no-scroll");
  lightboxImage.src = "";
}

lightboxClose.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", event => {
  if (event.target === lightbox) closeLightbox();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeLightbox();
});

document.getElementById("year").textContent = new Date().getFullYear();

document.getElementById("contactForm").addEventListener("submit", event => {
  event.preventDefault();

  const form = event.currentTarget;
  const data = new FormData(form);

  const name = data.get("name");
  const phone = data.get("phone");
  const service = data.get("service");
  const message = data.get("message");

  // IMPORTANT: Replace this number with your own WhatsApp number.
  const whatsappNumber = "919999999999";

  const text =
    `Hello Dipesh, I would like to make an enquiry.%0A%0A` +
    `Name: ${encodeURIComponent(name)}%0A` +
    `Phone: ${encodeURIComponent(phone)}%0A` +
    `Service: ${encodeURIComponent(service)}%0A` +
    `Message: ${encodeURIComponent(message)}`;

  window.open(`https://wa.me/${whatsappNumber}?text=${text}`, "_blank");
});
