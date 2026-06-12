/* Jeslur Rahman - portfolio interactions */
(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- neural-network particle background ---------- */
  const canvas = document.getElementById("neural-bg");
  if (canvas && !reducedMotion) {
    const ctx = canvas.getContext("2d");
    let particles = [];
    let w, h, raf;
    const mouse = { x: null, y: null };

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      const count = Math.min(90, Math.floor((w * h) / 22000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.6 + 0.6,
      }));
    };

    const LINK_DIST = 130;

    const tick = () => {
      ctx.clearRect(0, 0, w, h);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(100, 244, 172, 0.35)";
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < LINK_DIST) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(100, 244, 172, ${0.12 * (1 - dist / LINK_DIST)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
        if (mouse.x !== null) {
          const p = particles[i];
          const dist = Math.hypot(p.x - mouse.x, p.y - mouse.y);
          if (dist < 160) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(124, 138, 255, ${0.18 * (1 - dist / 160)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
    window.addEventListener("mouseout", () => { mouse.x = mouse.y = null; });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else raf = requestAnimationFrame(tick);
    });

    resize();
    tick();
  }

  /* ---------- typewriter ---------- */
  const typedEl = document.getElementById("typed");
  if (typedEl) {
    const phrases = [
      "scalable web APIs.",
      "agentic AI systems.",
      "full-stack products.",
      "RAG pipelines.",
      "cloud-native platforms.",
    ];
    if (reducedMotion) {
      typedEl.textContent = phrases[0];
    } else {
      let pi = 0, ci = 0, deleting = false;
      const step = () => {
        const phrase = phrases[pi];
        ci += deleting ? -1 : 1;
        typedEl.textContent = phrase.slice(0, ci);

        let delay = deleting ? 38 : 72;
        if (!deleting && ci === phrase.length) { delay = 2100; deleting = true; }
        else if (deleting && ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; delay = 350; }
        setTimeout(step, delay);
      };
      step();
    }
  }

  /* ---------- scroll reveal ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if (reducedMotion) {
    revealEls.forEach((el) => el.classList.add("visible"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---------- animated counters ---------- */
  const counters = document.querySelectorAll(".stat__num");
  const animateCounter = (el) => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    const isFloat = !Number.isInteger(target);
    const duration = 1400;
    const start = performance.now();

    const frame = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const val = target * eased;
      el.textContent = (isFloat ? val.toFixed(1) : Math.round(val)) + suffix;
      if (t < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  };

  const counterIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (reducedMotion) {
            entry.target.textContent = entry.target.dataset.count + (entry.target.dataset.suffix || "");
          } else {
            animateCounter(entry.target);
          }
          counterIO.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );
  counters.forEach((el) => counterIO.observe(el));

  /* ---------- nav: scrolled state + progress + active section + orbs ---------- */
  const nav = document.getElementById("nav");
  const scrollBar = document.getElementById("scroll-bar");
  const sections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll(".nav__links a");
  const orbs = document.querySelectorAll(".orb");
  const ORB_SPEEDS = [
    { y: 0.18, x: 0.04, r: 0.018 },
    { y: -0.12, x: -0.05, r: -0.012 },
    { y: 0.09, x: 0.07, r: 0.02 },
    { y: -0.15, x: 0.03, r: -0.016 },
  ];
  let lastY = window.scrollY;

  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle("scrolled", y > 10);

    // hide nav scrolling down, reveal scrolling up
    const menuOpen = document.getElementById("nav-links")?.classList.contains("open");
    nav.classList.toggle("nav--hidden", y > lastY && y > 320 && !menuOpen);
    lastY = y;

    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollBar) scrollBar.style.width = `${(y / max) * 100}%`;

    // parallax ambient orbs, each drifts and breathes at its own rate
    if (!reducedMotion) {
      orbs.forEach((orb, i) => {
        const s = ORB_SPEEDS[i % ORB_SPEEDS.length];
        const scale = 1 + Math.sin(y * s.r * 0.05) * 0.12;
        orb.style.transform =
          `translate(${y * s.x}px, ${y * s.y}px) rotate(${y * s.r * 10}deg) scale(${scale.toFixed(3)})`;
      });
    }

    let current = "";
    sections.forEach((s) => {
      if (y >= s.offsetTop - 140) current = s.id;
    });
    navLinks.forEach((a) => a.classList.toggle("active", a.dataset.section === current));
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  const burger = document.getElementById("burger");
  const links = document.getElementById("nav-links");
  if (burger && links) {
    burger.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      burger.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", String(open));
    });
    links.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        links.classList.remove("open");
        burger.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
      })
    );
  }

  /* ---------- floating tech icons in hero ---------- */
  const techLayer = document.getElementById("tech-icons");
  if (techLayer && !reducedMotion) {
    const DEVICON = "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/";
    const TECH = [
      "csharp/csharp-original.svg",
      "python/python-original.svg",
      "java/java-original.svg",
      "typescript/typescript-original.svg",
      "javascript/javascript-original.svg",
      "react/react-original.svg",
      "angularjs/angularjs-original.svg",
      "dotnetcore/dotnetcore-original.svg",
      "nodejs/nodejs-original.svg",
      "go/go-original-wordmark.svg",
      "docker/docker-original.svg",
      "kubernetes/kubernetes-plain.svg",
      "azure/azure-original.svg",
      "mongodb/mongodb-original.svg",
      "postgresql/postgresql-original.svg",
      "flutter/flutter-original.svg",
      "spring/spring-original.svg",
    ];
    const MAX_ICONS = 10;

    const spawnIcon = () => {
      if (document.hidden || techLayer.childElementCount >= MAX_ICONS) return;
      const img = document.createElement("img");
      img.className = "tech-icon";
      img.src = DEVICON + TECH[Math.floor(Math.random() * TECH.length)];
      img.alt = "";
      img.width = Math.round(26 + Math.random() * 30);
      img.style.left = (2 + Math.random() * 90) + "%";
      img.style.top = (6 + Math.random() * 82) + "%";
      img.style.setProperty("--rot", (Math.random() * 50 - 25).toFixed(0) + "deg");
      const dur = 3.2 + Math.random() * 2.4;
      img.style.animationDuration = dur.toFixed(2) + "s";
      techLayer.appendChild(img);
      setTimeout(() => img.remove(), dur * 1000 + 150);
    };

    for (let i = 0; i < 4; i++) setTimeout(spawnIcon, 400 + i * 350);
    setInterval(spawnIcon, 800);
  }

  /* ---------- 3D tilt on cards ---------- */
  if (!reducedMotion && window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".service, .project, .article, .skill-group, .edu-card, .cert, .about__photo-frame").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const rx = ((0.5 - py) * 12).toFixed(2);
        const ry = ((px - 0.5) * 14).toFixed(2);
        card.style.transform =
          `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px) scale(1.02)`;
        card.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
        card.style.setProperty("--my", (py * 100).toFixed(1) + "%");
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  /* ---------- avatar spin on page load ---------- */
  const avatarImg = document.querySelector(".hero__avatar img");
  if (avatarImg && !reducedMotion) {
    const spinOnce = () => {
      avatarImg.classList.add("spin");
      avatarImg.addEventListener("animationend", () => avatarImg.classList.remove("spin"), { once: true });
    };
    if (document.readyState === "complete") spinOnce();
    else window.addEventListener("load", spinOnce, { once: true });
  }

  /* ---------- hero hire me: rocket flight to contact ---------- */
  const heroHire = document.getElementById("hero-hire");
  if (heroHire && !reducedMotion) {
    heroHire.addEventListener("click", (e) => {
      if (document.querySelector(".fly-rocket")) return;
      e.preventDefault();
      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });

      const r = heroHire.getBoundingClientRect();
      const start = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      const end = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.42 };
      const ctrl = {
        x: Math.max(start.x, end.x) + 180,
        y: Math.min(start.y, end.y) - 240,
      };

      const rocket = document.createElement("div");
      rocket.className = "fly-rocket";
      rocket.innerHTML =
        '<svg viewBox="0 0 24 24" width="42" height="42" fill="none" stroke="url(#rkt-grad)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
        '<defs><linearGradient id="rkt-grad" x1="0" y1="1" x2="1" y2="0">' +
        '<stop offset="0" stop-color="#64f4ac"/><stop offset="0.5" stop-color="#5ad7e6"/><stop offset="1" stop-color="#7c8aff"/>' +
        "</linearGradient></defs>" +
        '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09Z" fill="rgba(255,212,121,0.3)" stroke="#ffd479"/>' +
        '<path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2Z" fill="rgba(100,244,172,0.16)"/>' +
        '<path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>' +
        '<circle cx="15" cy="9" r="1.6" stroke="#ffd479"/>' +
        "</svg>";
      document.body.appendChild(rocket);

      const DURATION = 1700;
      const t0 = performance.now();
      let lastSpark = 0;

      const frame = (now) => {
        let t = Math.min((now - t0) / DURATION, 1);
        const k = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        const inv = 1 - k;
        const x = inv * inv * start.x + 2 * inv * k * ctrl.x + k * k * end.x;
        const y = inv * inv * start.y + 2 * inv * k * ctrl.y + k * k * end.y;
        const dx = 2 * inv * (ctrl.x - start.x) + 2 * k * (end.x - ctrl.x);
        const dy = 2 * inv * (ctrl.y - start.y) + 2 * k * (end.y - ctrl.y);
        const ang = Math.atan2(dy, dx) * (180 / Math.PI) + 45;

        rocket.style.left = x + "px";
        rocket.style.top = y + "px";
        rocket.style.transform = `translate(-50%, -50%) rotate(${ang}deg)`;

        if (now - lastSpark > 70 && t < 0.96) {
          lastSpark = now;
          const spark = document.createElement("span");
          spark.className = "rocket-spark";
          spark.style.left = x + "px";
          spark.style.top = y + "px";
          document.body.appendChild(spark);
          setTimeout(() => spark.remove(), 750);
        }

        if (t < 1) {
          requestAnimationFrame(frame);
        } else {
          const ring = document.createElement("span");
          ring.className = "rocket-ring";
          ring.style.left = end.x + "px";
          ring.style.top = end.y + "px";
          document.body.appendChild(ring);
          setTimeout(() => ring.remove(), 800);
          rocket.classList.add("landed");
          setTimeout(() => rocket.remove(), 900);
        }
      };
      requestAnimationFrame(frame);
    });
  }

  /* ---------- hire me click spinner ---------- */
  document.querySelectorAll(".btn--hire").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.classList.add("is-loading");
      setTimeout(() => btn.classList.remove("is-loading"), 2200);
    });
  });

  /* ---------- footer year ---------- */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
