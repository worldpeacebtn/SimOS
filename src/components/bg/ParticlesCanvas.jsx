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
