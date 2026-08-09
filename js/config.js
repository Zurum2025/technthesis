/* ==========================================================================
   Tech 'n Thesis — Site Configuration
   👉 EDIT THIS FILE to change your WhatsApp link & email in one place.
   ========================================================================== */

window.SITE_CONFIG = {
  // Your WhatsApp Business short link.
  // This link already sends your pre-set custom message automatically,
  // so we DO NOT append a "?text=" message here.
  whatsappLink: "https://wa.me/message/7SJ5BP7MEURVI1",

  // Your contact email.
  email: "hello@technthesis.com"
};

/* ---- Applies the config to every WhatsApp link & email on the page ---- */
(function () {
  var cfg = window.SITE_CONFIG;
  var waURL = cfg.whatsappLink;

  // Any element with these classes/IDs becomes a WhatsApp link.
  var waSelectors = [
    ".wa-float", "#hero-wa", "#cta-wa", "#foot-wa", "#foot-wa-link",
    "#contact-wa", "#contact-wa-2", ".js-wa"
  ];
  waSelectors.forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el) {
      el.setAttribute("href", waURL);
    });
  });

  // Email links / text
  document.querySelectorAll(".js-email").forEach(function (el) {
    if (el.tagName === "A") el.setAttribute("href", "mailto:" + cfg.email);
    el.textContent = cfg.email;
  });
})();
