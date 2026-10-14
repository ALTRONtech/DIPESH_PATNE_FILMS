# Dipesh Patne | Films — Frontend

A one-page photography & videography portfolio for Dipesh Patne.
Built with plain HTML, CSS and JavaScript — no build step, no framework.

## What's inside

- `index.html` — the whole page: hero, about, gallery, services, video, contact
- `style.css` — dark editorial theme (DM Sans + Playfair Display) with animations
- `script.js` — menu, lightbox, scroll-reveal animations, counters, toasts, and the
  enquiry form that saves to the Django backend before opening WhatsApp
- `images/` — portfolio photographs

## Features

- Animated preloader and staggered hero entrance
- Scroll-reveal animations on every section (IntersectionObserver)
- Animated counters in the About section
- Gallery lightbox with previous/next buttons, keyboard arrows and touch swipe
- Custom toast notifications (no browser `alert()` popups)
- Mobile menu, sticky header with hide-on-scroll, back-to-top button
- Contact form validation, loading state, and graceful offline fallback

## Run it

Open `index.html` directly in a browser, or serve the folder with any static
server, e.g. VS Code Live Server (usually `http://127.0.0.1:5500`).

## Connecting to the backend

The form posts to `API_BASE` (`http://127.0.0.1:8000/api`) defined at the top of
`script.js`. Start the Django backend first (see
`../photography_business_backend/README.md`). If the backend is offline, the
form still opens WhatsApp so no enquiry is lost.

Update `WHATSAPP_NUMBER` in `script.js` to change where enquiries are sent.
