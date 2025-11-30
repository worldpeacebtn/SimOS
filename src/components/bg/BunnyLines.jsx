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
