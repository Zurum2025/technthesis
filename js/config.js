/* ==========================================================================
   Tech 'n Thesis — Site Configuration
   EDIT THIS FILE to change your WhatsApp link, email, socials & contact form.
   ========================================================================== */

   window.SITE_CONFIG = {
    // Your WhatsApp Business short link.
    // This link already sends your pre-set custom message automatically,
    // so we DO NOT append a "?text=" message here.
    whatsappLink: "https://wa.me/message/7SJ5BP7MEURVI1",
  
    // Your contact email.
    email: "contact@technthesis.name.ng",

    facebookLink: "https://www.facebook.com/profile.php?id=61593274087810",
    linkedinLink: "https://www.linkedin.com/company/technthesis",
    githubLink: "https://github.com/TechnThesis",
  
    // Secure Form Backend (ZERO passwords required, 100% safe on GitHub Pages):
    // Form submissions are forwarded directly to your Zoho inbox (contact@technthesis.name.ng).
    //
    // Options:
    // 1. FormSubmit (Default): "https://formsubmit.co/ajax/contact@technthesis.name.ng"
    // 2. Formspree: "https://formspree.io/f/<your-form-id>"
    // 3. Web3Forms: "https://api.web3forms.com/submit"
    formEndpoint: "https://formsubmit.co/ajax/contact@technthesis.name.ng"
  };
  
  /* ---- Applies the config to every WhatsApp, email & social link on the page ---- */
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
  
    // Social links — every element with the matching class gets its href set.
    // (Kept inside this same function so `cfg` is still in scope — this used
    // to live in its own block after the IIFE closed, which referenced `cfg`
    // after it had gone out of scope and silently failed.)
    var socialSelectors = {
      ".js-facebook": cfg.facebookLink,
      ".js-linkedin": cfg.linkedinLink,
      ".js-github": cfg.githubLink
    };
    Object.keys(socialSelectors).forEach(function (sel) {
      var url = socialSelectors[sel];
      if (!url) return;
      document.querySelectorAll(sel).forEach(function (el) {
        el.setAttribute("href", url);
      });
    });

    // Update contact form action attribute to match config for native fallback
    var contactForm = document.getElementById("contact-form");
    if (contactForm && cfg.formEndpoint) {
      var nativeAction = cfg.formEndpoint.replace("/ajax/", "/");
      contactForm.setAttribute("action", nativeAction);
    }
  })();