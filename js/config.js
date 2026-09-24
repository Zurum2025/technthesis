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
  
    // OPTIONAL: your Formspree endpoint, so the contact form on contact.html
    // actually delivers messages to your inbox.
    //   1. Go to https://formspree.io and create a free account.
    //   2. Create a new form and copy the endpoint it gives you
    //      (looks like "https://formspree.io/f/xxxxxxxx").
    //   3. Paste it below between the quotes.
    // Until you set this, the contact form will honestly tell visitors it
    // isn't connected yet and point them to WhatsApp/email instead of
    // pretending their message was sent.
    formEndpoint: "" // e.g. "https://formspree.io/f/xxxxxxxx"
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
  })();