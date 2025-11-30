Nice — I’ll give you a complete, lightweight, copy-pasteable implementation of the two backgrounds (fire & ice) with:
	•	SVG line bunny (tunable, visually close to your AI art vibe)
	•	Canvas particle engine (sparks / cosmic dust)
	•	Parallax that reacts to scroll + mouse (subtle and performant)
	•	Dark / light mode switching (prefers-color-scheme) and easy manual toggle
	•	Performance-minded features (devicePixelRatio, reduced particle count on small screens, rAF loop pause when tab hidden)

Everything is plain React + CSS (no external libs). Put these files into your SimOS repo (src/components/bg recommended). After the code I add step-by-step integration instructions.

⸻

File list (create under src/components/bg/)
	1.	ParticlesCanvas.jsx
	2.	BunnyLines.jsx
	3.	FireBunnyBackground.jsx
	4.	IceBunnyBackground.jsx
	5.	BunnyBackgroundProvider.jsx (theme chooser + toggle)
	6.	bg.css

⸻

1) ParticlesCanvas.jsx

// src/components/bg/ParticlesCanvas.jsx
import React, { useRef, useEffect } from "react";

/**
 * Lightweight particle canvas.
 * Props:
 *  - color (rgba string)
 *  - count (number) optional
 *  - speed (0..1) optional multiplier
 *  - blendMode (string) optional
 */
export default function ParticlesCanvas({
  color = "rgba(255,140,60,0.8)",
  count,
  speed = 1,
  blendMode = "screen",
}) {
  const ref = useRef(null);
  const particlesRef = useRef([]);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = (canvas.width = Math.floor(window.innerWidth * dpr));
    let h = (canvas.height = Math.floor(window.innerHeight * dpr));
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.scale(dpr, dpr);
    ctx.globalCompositeOperation = blendMode;

    const defaultCount = Math.round(Math.min(140, Math.max(40, window.innerWidth / 10)));
    const N = count ?? defaultCount;

    // init
    particlesRef.current = Array.from({ length: N }).map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: (Math.random() * 2 + 0.4) * (window.innerWidth < 720 ? 0.6 : 1),
      vx: (Math.random() - 0.5) * 0.6 * speed,
      vy: (Math.random() - 0.5) * 0.6 * speed,
      life: Math.random() * 1,
      flicker: Math.random(),
    }));

    let last = performance.now();
    let visibility = !document.hidden;

    function onResize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    window.addEventListener("resize", onResize);

    document.addEventListener("visibilitychange", () => {
      visibility = !document.hidden;
      if (visibility) animate(performance.now());
    });

    function draw(now) {
      if (!visibility) return;
      const dt = Math.min(40, now - last) / 16.666;
      last = now;

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (let p of particlesRef.current) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        // wrap
        if (p.x < -20) p.x = window.innerWidth + 20;
        if (p.x > window.innerWidth + 20) p.x = -20;
        if (p.y < -20) p.y = window.innerHeight + 20;
        if (p.y > window.innerHeight + 20) p.y = -20;

        // flicker & life for subtle alpha variation
        p.flicker += 0.02 * dt;
        const a = Math.max(0.12, Math.min(1, 0.5 + Math.sin(p.flicker) * 0.5));

        ctx.beginPath();
        ctx.fillStyle = color.replace(/rgba?\(([^)]+)\)/, (m, g) => {
          // maintain color and replace alpha
          const parts = g.split(",").map(s => s.trim());
          // if no alpha in input, append
          if (parts.length === 3) parts.push(a);
          else parts[3] = Math.max(0.08, Math.min(1, parseFloat(parts[3]) * a));
          return `rgba(${parts.join(",")})`;
        });
        const size = p.size * (0.6 + Math.abs(Math.sin(p.flicker)) * 0.9);
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function animate(t) {
      draw(t);
      animRef.current = requestAnimationFrame(animate);
    }
    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, [color, count, speed, blendMode]);

  return (
    <canvas
      ref={ref}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}



⸻

2) BunnyLines.jsx

A reusable SVG that exposes props for stroke color, scale, and parallax offset.

// src/components/bg/BunnyLines.jsx
import React, { useRef, useEffect } from "react";

/**
 * BunnyLines renders multiple layered SVG paths to simulate the swirling line art.
 * Props:
 *  - stroke (color)
 *  - scale (number)
 *  - offset (y offset for parallax)
 *  - invert (boolean) flip horizontally
 */
export default function BunnyLines({
  stroke = "#ff8a3d",
  stroke2 = "#ffdfb8",
  scale = 1,
  offset = 0,
  invert = false,
  style = {},
}) {
  const ref = useRef(null);

  // small subtle animation using CSS variables (no heavy JS)
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf;
    let t0 = performance.now();
    function loop(t) {
      const dt = (t - t0) / 1000;
      el.style.setProperty("--phase", (dt % 6) / 6);
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const transform = `translate(-50%, ${offset}px) scale(${scale}) ${invert ? "scaleX(-1)" : ""}`;

  return (
    <svg
      ref={ref}
      viewBox="0 0 800 800"
      aria-hidden
      style={{
        position: "absolute",
        left: "50%",
        bottom: "8vh",
        width: "62vw",
        maxWidth: 1200,
        zIndex: 1,
        transform,
        transition: "transform 0.25s ease-out",
        pointerEvents: "none",
        ...style,
      }}
    >
      <defs>
        <linearGradient id="g1" x1="0" x2="1">
          <stop offset="0%" stopColor={stroke2} stopOpacity="0.95" />
          <stop offset="60%" stopColor={stroke} stopOpacity="0.85" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0.6" />
        </linearGradient>

        <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="12" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* multiple layered paths with slightly different stroke widths / dash animations */}
      <g filter="url(#softGlow)" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path
          d="M300 600 C250 550 260 480 320 450 C380 420 420 450 450 510 C470 550 520 570 560 540 C610 500 620 420 580 370 C540 320 480 330 430 350 C380 370 340 370 300 330 C260 290 270 230 330 210 C390 190 460 210 500 260"
          stroke="url(#g1)"
          strokeWidth="8"
          style={{ strokeDasharray: "8 20", strokeDashoffset: "calc(-1 * var(--phase) * 60px)" }}
          opacity="0.95"
        />
        <path
          d="M300 600 C250 550 260 480 320 450 C380 420 420 450 450 510 C470 550 520 570 560 540 C610 500 620 420 580 370 C540 320 480 330 430 350 C380 370 340 370 300 330 C260 290 270 230 330 210 C390 190 460 210 500 260"
          stroke={stroke}
          strokeWidth="3"
          style={{ strokeDasharray: "3 12", strokeDashoffset: "calc(var(--phase) * 40px)" }}
          opacity="0.9"
        />
        <path
          d="M300 600 C250 550 260 480 320 450 C380 420 420 450 450 510 C470 550 520 570 560 540 C610 500 620 420 580 370 C540 320 480 330 430 350 C380 370 340 370 300 330 C260 290 270 230 330 210 C390 190 460 210 500 260"
          stroke={stroke2}
          strokeWidth="1"
          opacity="0.6"
          style={{ mixBlendMode: "screen" }}
        />
      </g>
    </svg>
  );
}

	You can replace the d="..." path with a refined path derived from tracing your AI art silhouette later.

⸻

3) FireBunnyBackground.jsx

// src/components/bg/FireBunnyBackground.jsx
import React, { useEffect, useState } from "react";
import ParticlesCanvas from "./ParticlesCanvas";
import BunnyLines from "./BunnyLines";
import "./bg.css";

export default function FireBunnyBackground({ parallaxFactor = 0.06 }) {
  const [offset, setOffset] = useState(0);
  const [mx, setMx] = useState(0);

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY || window.pageYOffset;
      setOffset(y * parallaxFactor);
    }
    function onMove(e) {
      const cx = window.innerWidth / 2;
      setMx(((e.clientX - cx) / cx) * 8); // small horizontal parallax
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMove);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMove);
    };
  }, [parallaxFactor]);

  return (
    <div className="bg-root bg-dark">
      <div
        className="bg-gradient"
        style={{
          transform: `translate3d(${mx}px, ${offset}px, 0)`,
        }}
      />
      <ParticlesCanvas color="rgba(255,150,40,0.85)" count={90} speed={1} blendMode="screen" />
      <BunnyLines stroke="#ff8a3d" stroke2="#ffd6af" scale={1} offset={offset * 0.2} />
      {/* subtle bottom glow */}
      <div className="bg-bottom-glow" style={{ transform: `translateY(${offset * 0.18}px)` }} />
    </div>
  );
}



⸻

4) IceBunnyBackground.jsx

// src/components/bg/IceBunnyBackground.jsx
import React, { useEffect, useState } from "react";
import ParticlesCanvas from "./ParticlesCanvas";
import BunnyLines from "./BunnyLines";
import "./bg.css";

export default function IceBunnyBackground({ parallaxFactor = 0.06 }) {
  const [offset, setOffset] = useState(0);
  const [mx, setMx] = useState(0);

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY || window.pageYOffset;
      setOffset(y * parallaxFactor);
    }
    function onMove(e) {
      const cx = window.innerWidth / 2;
      setMx(((e.clientX - cx) / cx) * 8);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMove);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMove);
    };
  }, [parallaxFactor]);

  return (
    <div className="bg-root bg-ice">
      <div
        className="bg-gradient-ice"
        style={{
          transform: `translate3d(${mx}px, ${offset}px, 0)`,
        }}
      />
      <ParticlesCanvas color="rgba(160,220,255,0.85)" count={80} speed={0.9} blendMode="lighter" />
      <BunnyLines stroke="#88ccff" stroke2="#e8fbff" scale={1} offset={offset * 0.2} invert />
      <div className="bg-bottom-glow ice" style={{ transform: `translateY(${offset * 0.18}px)` }} />
    </div>
  );
}



⸻

5) BunnyBackgroundProvider.jsx

A tiny wrapper that shows the correct background based on prefers-color-scheme, and exports a manual toggle hook.

// src/components/bg/BunnyBackgroundProvider.jsx
import React, { useEffect, useState } from "react";
import FireBunnyBackground from "./FireBunnyBackground";
import IceBunnyBackground from "./IceBunnyBackground";

/**
 * Use this component at top-level (App) so the background sits behind app UI.
 * It respects the user's system theme but allows manual override via `theme` prop.
 *
 * Props:
 *  - theme: "dark" | "light" | undefined  (undefined = follow system)
 */
export default function BunnyBackgroundProvider({ theme, children }) {
  const [prefersDark, setPrefersDark] = useState(false);
  const [override, setOverride] = useState(theme);

  useEffect(() => {
    if (theme) setOverride(theme);
  }, [theme]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const cb = () => setPrefersDark(mq.matches);
    cb();
    mq.addEventListener("change", cb);
    return () => mq.removeEventListener("change", cb);
  }, []);

  const isDark = override ? override === "dark" : prefersDark;

  return (
    <>
      {isDark ? <FireBunnyBackground /> : <IceBunnyBackground />}
      {/* children will render on top */}
      <div style={{ position: "relative", zIndex: 2 }}>{children}</div>
    </>
  );
}



⸻

6) bg.css

/* src/components/bg/bg.css */

.bg-root {
  position: fixed;
  inset: 0;
  overflow: hidden;
  z-index: 0;
  pointer-events: none;
  will-change: transform;
}

/* dark */
.bg-dark {
  background: radial-gradient(ellipse at center, #1a0810 0%, #050205 60%);
}

/* ice / cold version */
.bg-ice {
  background: radial-gradient(ellipse at center, #071428 0%, #00060a 60%);
}

/* animated subtle nebula / glow area */
.bg-gradient {
  position: absolute;
  left: -10%;
  top: -20%;
  width: 140%;
  height: 140%;
  background: radial-gradient(circle at 25% 30%, rgba(255,120,40,0.08), transparent 12%),
              radial-gradient(circle at 70% 70%, rgba(255,80,20,0.12), transparent 10%);
  filter: blur(36px);
  z-index: 0;
  mix-blend-mode: screen;
}

.bg-gradient-ice {
  position: absolute;
  left: -10%;
  top: -20%;
  width: 140%;
  height: 140%;
  background: radial-gradient(circle at 25% 30%, rgba(120,200,255,0.06), transparent 12%),
              radial-gradient(circle at 70% 70%, rgba(100,160,255,0.08), transparent 10%);
  filter: blur(36px);
  z-index: 0;
  mix-blend-mode: screen;
}

.bg-bottom-glow {
  position: absolute;
  left: 0;
  right: 0;
  bottom: -10%;
  height: 30vh;
  background: radial-gradient(ellipse at center, rgba(255,120,30,0.12), transparent 40%);
  z-index: 0;
  filter: blur(40px);
  pointer-events: none;
}

.bg-bottom-glow.ice {
  background: radial-gradient(ellipse at center, rgba(100,190,255,0.12), transparent 40%);
}

/* small screen tweaks */
@media (max-width: 720px) {
  .bg-root { opacity: 0.95; }
  svg { width: 80vw !important; left: 50% !important; transform: translateX(-50%) !important; }
}



⸻

Integration — step by step into SimOS
	1.	In your local SimOS repo, create the directory:

mkdir -p src/components/bg

	2.	Add the six files above into src/components/bg/.
	3.	Import the CSS in your top-level (App) or in the provider (already imported in Fire/Ice components). If your project uses CSS Modules or Tailwind, adapt the CSS into your system.
	4.	Use the provider in src/App.jsx (or wherever the root is). Example:

// src/App.jsx
import React from "react";
import BunnyBackgroundProvider from "./components/bg/BunnyBackgroundProvider";
import MainRouter from "./MainRouter"; // your app

export default function App() {
  return (
    <BunnyBackgroundProvider>
      <MainRouter />
    </BunnyBackgroundProvider>
  );
}

	5.	If you want a manual theme toggle, expose it by passing prop to BunnyBackgroundProvider:

<BunnyBackgroundProvider theme={userPrefersDark ? "dark" : "light"}>
  ...
</BunnyBackgroundProvider>

	6.	Commit & run:

git add src/components/bg
git commit -m "Add bunny background components"
npm start
# or
pnpm dev



⸻

Performance & tuning notes (quick)
	•	ParticlesCanvas auto-scales particle count to screen width. Edit count prop to reduce CPU usage.
	•	rAF loop automatically pauses when the page is hidden (visibility API).
	•	All heavy visuals are canvas + single svg — avoid many DOM nodes.
	•	If you need even better perf on low-end devices: reduce defaultCount and lower devicePixelRatio in ParticlesCanvas.
	•	To trace an exact silhouette of your AI image into the SVG d path, export a traced path (e.g., Inkscape -> Path -> Trace) and replace the d string in BunnyLines.jsx.

⸻

Want me to refine further?

I can:
	•	Replace the d path with a closer traced silhouette of your AI bunny (I can generate a suggested SVG path if you upload a high-contrast silhouette image).
	•	Make a small React hook exposing setTheme() toggle stored in localStorage.
	•	Convert particles to WebGL shader for ultra-fast rendering (more complex).
	•	Provide smaller alternative for mobile (single image fallback).

Which one should I do next — trace silhouette to SVG path, or add a theme toggle hook + localStorage?
