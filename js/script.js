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
        var nameInput = form.querySelector("#name");
        var emailInput = form.querySelector("#email");
        var serviceInput = form.querySelector("#service");
        var messageInput = form.querySelector("#message");

        var nameVal = (nameInput && nameInput.value || "").trim();
        var emailVal = (emailInput && emailInput.value || "").trim();
        var serviceVal = (serviceInput && serviceInput.value || "").trim() || "General Project Development";
        var messageVal = (messageInput && messageInput.value || "").trim();

        if (!nameVal || !emailVal || !messageVal) {
          showMsg("Please fill in your name, email address, and project details.", "err");
          return;
        }
        var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);
        if (!emailOk) {
          showMsg("Please enter a valid email address.", "err");
          return;
        }

        var officialMail = (window.SITE_CONFIG && window.SITE_CONFIG.email) || "contact@technthesis.name.ng";
        var endpoint = (window.SITE_CONFIG && window.SITE_CONFIG.formEndpoint) || form.getAttribute("action") || ("https://formsubmit.co/ajax/" + officialMail);

        setSending(true);

        var payload = {
          name: nameVal,
          email: emailVal,
          service: serviceVal,
          message: messageVal,
          _subject: "New Project Inquiry: " + nameVal + " (" + serviceVal + ")",
          _replyto: emailVal
        };

        var handleSuccess = function (customMsg) {
          var firstName = nameVal.split(" ")[0];
          showMsg(
            customMsg ||
            ("Thanks, " + firstName + "! Your project details have been sent to our team at " + officialMail + ". We will review your project and get back to you within 24 hours."),
            "ok"
          );
          form.reset();
        };

        fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(payload)
        })
          .then(function (res) {
            return res.json().then(function (data) {
              if (res.ok && (data.success === true || data.success === "true" || !("success" in data))) {
                handleSuccess(data && data.message);
              } else if (data && data.message && data.message.indexOf("Activation") !== -1) {
                showMsg(
                  "Setup notice: An activation email was sent to " + officialMail + ". Please click 'Activate Form' in your Zoho inbox to confirm message forwarding.",
                  "ok"
                );
                form.reset();
              } else if (res.ok) {
                handleSuccess();
              } else {
                throw new Error(data && (data.error || data.message) || "Submission failed");
              }
            }).catch(function (err) {
              if (res.ok) {
                handleSuccess();
              } else {
                throw err;
              }
            });
          })
          .catch(function (err) {
            console.error("Form error:", err);
            showMsg(
              "Couldn't connect automatically. Please email us directly at " + officialMail + " or click WhatsApp for an instant response.",
              "err"
            );
          })
          .finally(function () {
            setSending(false);
          });
      });
    }
    
    /* ---------- Portfolio slideshow (hover-triggered) ---------- */
    document.addEventListener('DOMContentLoaded', () => {
      const slideshowWrappers = document.querySelectorAll('.portfolio-slideshow');
    
      slideshowWrappers.forEach((container) => {
        const primaryImg = container.querySelector('img[data-images]');
        if (!primaryImg) return;
    
        const images = primaryImg.getAttribute('data-images').split(',').map(s => s.trim());
        if (images.length <= 1) return;
    
        // Preload all assets in the background
        images.forEach(src => {
          const preload = new Image();
          preload.src = src;
        });
    
        // Style the primary image as the permanent base layer
        primaryImg.classList.add('slide-layer', 'base');
    
        // Create an overlay image layer for silky crossfades
        const fadeImg = document.createElement('img');
        fadeImg.className = 'slide-layer fade';
        fadeImg.alt = primaryImg.alt || 'Project preview';
        container.appendChild(fadeImg);
    
        // Create modern dot indicators
        const dotsTrack = document.createElement('div');
        dotsTrack.className = 'slideshow-dots';
        images.forEach((_, idx) => {
          const dot = document.createElement('span');
          dot.className = `slideshow-dot ${idx === 0 ? 'active' : ''}`;
          dotsTrack.appendChild(dot);
        });
        container.appendChild(dotsTrack);
    
        let currentIndex = 0;
        let timer = null;
        const triggerCard = container.closest('.project') || container;
    
        const setDots = (activeIndex) => {
          dotsTrack.querySelectorAll('.slideshow-dot').forEach((d, i) => {
            d.classList.toggle('active', i === activeIndex);
          });
        };
    
        const showSlide = (nextIndex) => {
          fadeImg.src = images[nextIndex];
          fadeImg.classList.add('visible');
          setDots(nextIndex);
    
          // Once the crossfade transition finishes, commit to the base layer
          setTimeout(() => {
            primaryImg.src = images[nextIndex];
            fadeImg.classList.remove('visible');
          }, 650);
        };
    
        triggerCard.addEventListener('mouseenter', () => {
          // 1800ms gives the user comfortable time to digest each screenshot
          timer = setInterval(() => {
            currentIndex = (currentIndex + 1) % images.length;
            showSlide(currentIndex);
          }, 1800);
        });
    
        triggerCard.addEventListener('mouseleave', () => {
          clearInterval(timer);
          if (currentIndex !== 0) {
            currentIndex = 0;
            showSlide(0);
          }
        });
      });
    });

  })();  