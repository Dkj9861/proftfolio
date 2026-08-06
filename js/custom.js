/* Portfolio interactions — typing, skills, reveal, scroll progress */

(function () {
  "use strict";

  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Scroll progress bar ---------- */
  var progressBar = document.querySelector(".scroll-progress");
  var backBtn = document.getElementById("backToTop");

  function updateProgress() {
    if (!progressBar) return;
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct + "%";

    if (backBtn) {
      if (scrollTop > 420) backBtn.classList.add("is-visible");
      else backBtn.classList.remove("is-visible");
    }
  }
  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  if (backBtn) {
    backBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- Typing animation with pause ---------- */
  var el = document.getElementById("typing-animation");
  if (el) {
    var texts = [
      "Data Engineer",
      "dbt Developer",
      "Cloud Pipeline Builder",
      "GenAI Enthusiast"
    ];
    var textIndex = 0;
    var charIndex = 0;
    var deleting = false;
    var typeSpeed = 90;
    var deleteSpeed = 45;
    var holdDelay = 1600;

    function tick() {
      var current = texts[textIndex];
      if (!deleting) {
        el.textContent = current.slice(0, charIndex + 1);
        charIndex++;
        if (charIndex === current.length) {
          deleting = true;
          setTimeout(tick, holdDelay);
          return;
        }
        setTimeout(tick, typeSpeed);
      } else {
        el.textContent = current.slice(0, charIndex - 1);
        charIndex--;
        if (charIndex === 0) {
          deleting = false;
          textIndex = (textIndex + 1) % texts.length;
          setTimeout(tick, 400);
          return;
        }
        setTimeout(tick, deleteSpeed);
      }
    }

    el.classList.add("cursor-blink");
    setTimeout(tick, 600);
  }

  /* ---------- Skill bars animate on view ---------- */
  function animateSkills(root) {
    var bars = (root || document).querySelectorAll(".skill-mf .progress-bar");
    bars.forEach(function (bar) {
      var target = bar.getAttribute("aria-valuenow") || bar.style.width;
      if (typeof target === "string" && target.indexOf("%") !== -1) {
        target = parseInt(target, 10);
      }
      target = parseInt(target, 10) || 0;
      bar.style.width = target + "%";
      bar.classList.add("animated");
    });
  }

  /* ---------- Impact counters ---------- */
  function animateCount(node) {
    var end = parseInt(node.getAttribute("data-count"), 10) || 0;
    var suffix = node.getAttribute("data-suffix") || "";
    var duration = 1400;
    var startTime = null;

    function frame(ts) {
      if (!startTime) startTime = ts;
      var p = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      node.textContent = Math.round(end * eased) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal-up");
  if ("IntersectionObserver" in window) {
    var revealObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            if (entry.target.querySelector(".skill-mf")) {
              animateSkills(entry.target);
            }
            var counters = entry.target.querySelectorAll(".impact-num");
            counters.forEach(animateCount);
            revealObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (node) {
      revealObs.observe(node);
    });

    var skillSection = document.querySelector("#about-section .about-side");
    if (skillSection) {
      var skillObs = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              animateSkills(entry.target);
              skillObs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.25 }
      );
      skillObs.observe(skillSection);
    }
  } else {
    revealEls.forEach(function (node) {
      node.classList.add("is-visible");
    });
    animateSkills();
    document.querySelectorAll(".impact-num").forEach(animateCount);
  }

  /* Close mobile nav after tap */
  var navLinks = document.querySelectorAll("#ftco-nav .nav-link");
  var navCollapse = document.getElementById("ftco-nav");
  navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      if (window.innerWidth < 992 && navCollapse && navCollapse.classList.contains("show")) {
        if (window.jQuery) {
          window.jQuery(navCollapse).collapse("hide");
        } else {
          navCollapse.classList.remove("show");
        }
      }
    });
  });
})();
