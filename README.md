# Tech 'n Thesis — Business + Portfolio Website

A modern, responsive, fully static website for a computer science project development service.
Built with **pure HTML5, CSS3 and vanilla JavaScript** — no frameworks, no backend, no build tools.

## ✨ Features
- Sticky, blurred navigation bar with mobile hamburger menu
- Smooth scrolling & scroll-reveal animations (IntersectionObserver)
- Card-based services & portfolio grids with hover effects
- Accordion FAQ
- Frontend contact form with validation
- **Floating WhatsApp button on every page** + multiple WhatsApp CTAs
- Mobile-first responsive design + reduced-motion support
- SEO meta tags + accessible markup

## 📁 Structure
```
website/
├── index.html        # Home
├── services.html     # Services
├── portfolio.html    # Portfolio
├── faq.html          # FAQ (accordion)
├── contact.html      # Contact + form
├── css/style.css     # All styles
├── js/
│   ├── config.js     # 👈 EDIT: WhatsApp number, message & email
│   └── script.js     # Interactions
├── images/           # Your screenshots/logo
├── _redirects        # Optional Netlify pretty-URL config
└── README.md
```

## ⚙️ Set up your contact details (important!)
Open **`js/config.js`** and edit the top section:
```js
window.SITE_CONFIG = {
  whatsappLink: "https://wa.me/message/7SJ5BP7MEURVI1", // your WhatsApp Business link
  email: "hello@technthesis.com"
};
```
Every WhatsApp link/button and email on the site updates automatically.

> The WhatsApp Business link already delivers your pre-set custom message — no `?text=` needed.

## 🚀 Deploy (no backend needed)
**Netlify (drag & drop):** go to https://app.netlify.com/drop and drop the `website` folder.

**Cloudflare Pages / GitHub Pages:** push this folder to a repo and point the host at it.
No build command is required — set the build output / publish directory to the project root.

**Run locally:**
```
cd website
python3 -m http.server 8080
# open http://localhost:8080
```

## 🎨 Customize
- Colors live in CSS variables at the top of `css/style.css` (`:root`).
- Replace business name "Tech 'n Thesis" via find & replace.
- Swap portfolio screenshot placeholders with real images (see `images/README.txt`).
