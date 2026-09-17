/* ==========================================================================
   Tech 'n Thesis — Vanilla JS
   Mobile nav, smooth scroll, FAQ accordion, scroll reveal, navbar shadow.
   No libraries.
   ========================================================================== */

   (function () {
    "use strict";
  
    /* ---------- Mobile nav toggle (hamburger) ---------- */
    var toggle = document.querySelector(".nav-toggle");
    var links = document.querySelector(".nav-links");
  
    if (toggle && links) {
      toggle.addEventListener("click", function () {
        var open = links.classList.toggle("open");
        toggle.classList.toggle("open", open);
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
  
      // Close menu when a link is clicked
      links.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () {
          links.classList.remove("open");
          toggle.classList.remove("open");
          toggle.setAttribute("aria-expanded", "false");
        });
      });
  
      // Close when clicking outside
      document.addEventListener("click", function (e) {
        if (!links.contains(e.target) && !toggle.contains(e.target)) {
          links.classList.remove("open");
          toggle.classList.remove("open");
          toggle.setAttribute("aria-expanded", "false");
        }
      });
    }
  
    /* ---------- Navbar shadow on scroll ---------- */
    var nav = document.querySelector(".nav");
    if (nav) {
      var onScroll = function () {
        nav.classList.toggle("scrolled", window.scrollY > 8);
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }
  
    /* ---------- Smooth scrolling for in-page anchors ---------- */
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href");
        if (id.length < 2) return;
        var target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          var top = target.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top: top, behavior: "smooth" });
        }
      });
    });
  
    /* ---------- FAQ accordion ---------- */
    var faqItems = document.querySelectorAll(".faq-item");
    faqItems.forEach(function (item) {
      var q = item.querySelector(".faq-q");
      var a = item.querySelector(".faq-a");
      if (!q || !a) return;
  
      q.addEventListener("click", function () {
        var isOpen = item.classList.contains("open");
  
        // Close all (single-open accordion)
        faqItems.forEach(function (other) {
          other.classList.remove("open");
          var oa = other.querySelector(".faq-a");
          var oq = other.querySelector(".faq-q");
          if (oa) oa.style.maxHeight = null;
          if (oq) oq.setAttribute("aria-expanded", "false");
        });
  
        // Open the clicked one (if it was closed)
        if (!isOpen) {
          item.classList.add("open");
          a.style.maxHeight = a.scrollHeight + "px";
          q.setAttribute("aria-expanded", "true");
        }
      });
    });
  
    /* ---------- Scroll reveal animations (IntersectionObserver) ---------- */
    var revealEls = document.querySelectorAll("[data-reveal]");
    if ("IntersectionObserver" in window && revealEls.length) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("in");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
      );
      revealEls.forEach(function (el) { io.observe(el); });
    } else {
      // Fallback: just show everything
      revealEls.forEach(function (el) { el.classList.add("in"); });
    }
  
    /* ---------- Footer year ---------- */
    var yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  
    /* ---------- Contact form ---------- */
    var form = document.getElementById("contact-form");
    if (form) {
      var msg = document.getElementById("form-msg");
      var submitBtn = form.querySelector('button[type="submit"]');
  
      var showMsg = function (text, type) {
        if (!msg) return;
        msg.textContent = text;
        msg.className = "form-msg show " + type;
      };
  
      var setSending = function (isSending) {
        if (!submitBtn) return;
        submitBtn.disabled = isSending;
        submitBtn.textContent = isSending ? "Sending…" : "Send message";
      };
  
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var name = form.querySelector("#name");
        var email = form.querySelector("#email");
        var message = form.querySelector("#message");
  
        if (!name.value.trim() || !email.value.trim() || !message.value.trim()) {
          showMsg("Please fill in your name, email and message.", "err");
          return;
        }
        var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
        if (!emailOk) {
          showMsg("Please enter a valid email address.", "err");
          return;
        }
  
        var endpoint = (window.SITE_CONFIG && window.SITE_CONFIG.formEndpoint) || "";
  
        // No backend/Formspree endpoint configured yet — be honest instead
        // of pretending the message was sent somewhere.
        if (!endpoint) {
          showMsg(
            "This form isn't connected to an inbox yet, so we won't receive this. " +
            "Please tap the WhatsApp button above, or email us directly for now.",
            "err"
          );
          return;
        }
  
        setSending(true);
  
        fetch(endpoint, {
          method: "POST",
          headers: { "Accept": "application/json" },
          body: new FormData(form)
        })
          .then(function (res) {
            if (res.ok) {
              showMsg(
                "Thanks, " + name.value.trim().split(" ")[0] +
                "! Your message has been sent. We usually reply within 24 hours — for an instant reply, tap WhatsApp.",
                "ok"
              );
              form.reset();
            } else {
              showMsg(
                "Something went wrong sending your message. Please try WhatsApp instead.",
                "err"
              );
            }
          })
          .catch(function () {
            showMsg(
              "Something went wrong sending your message. Please try WhatsApp instead.",
              "err"
            );
          })
          .finally(function () {
            setSending(false);
          });
      });
    }
  })();  