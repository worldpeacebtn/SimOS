import React, { useRef, useEffect } from "react";

type Props = {
  color?: string;
  count?: number;
  speed?: number;
  blendMode?: GlobalCompositeOperation | string;
};

export default function ParticlesCanvas({
  color = "rgba(255,140,60,0.85)",
  count,
  speed = 1,
  blendMode = "screen",
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);
  const particlesRef = useRef<any[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    function resize() {
      const w = Math.floor(window.innerWidth * dpr);
      const h = Math.floor(window.innerHeight * dpr);
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    const defaultCount = Math.round(Math.min(140, Math.max(40, window.innerWidth / 10)));
    const N = count ?? defaultCount;

    function initParticles() {
      particlesRef.current = Array.from({ length: N }).map(() => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: (Math.random() * 2 + 0.4) * (window.innerWidth < 720 ? 0.6 : 1),
        vx: (Math.random() - 0.5) * 0.6 * speed,
        vy: (Math.random() - 0.5) * 0.6 * speed,
        flicker: Math.random() * Math.PI * 2,
      }));
    }
    initParticles();

    let last = performance.now();
    let visible = !document.hidden;

    function onVisibility() {
      visible = !document.hidden;
      if (visible) animRef.current = requestAnimationFrame(loop);
      else if (animRef.current) cancelAnimationFrame(animRef.current);
    }
    document.addEventListener("visibilitychange", onVisibility);

    function loop(now: number) {
      if (!visible) return;
      const dt = Math.min(40, now - last) / 16.666;
      last = now;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.globalCompositeOperation = blendMode as GlobalCompositeOperation;

      for (const p of particlesRef.current) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        if (p.x < -20) p.x = window.innerWidth + 20;
        if (p.x > window.innerWidth + 20) p.x = -20;
        if (p.y < -20) p.y = window.innerHeight + 20;
        if (p.y > window.innerHeight + 20) p.y = -20;

        p.flicker += 0.02 * dt;
        const a = Math.max(0.12, Math.min(1, 0.5 + Math.sin(p.flicker) * 0.5));

        // derive rgba with flicker
        const rgba = color.replace(/rgba?\(([^)]+)\)/, (_m, g) => {
          const parts = g.split(",").map(s => s.trim());
          if (parts.length === 3) parts.push(String(a));
          else parts[3] = String(Math.max(0.08, Math.min(1, parseFloat(parts[3]) * a)));
          return `rgba(${parts.join(",")})`;
        });

        ctx.beginPath();
        const size = p.size * (0.6 + Math.abs(Math.sin(p.flicker)) * 0.9);
        ctx.fillStyle = rgba;
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(loop);
    }

    window.addEventListener("resize", resize);
    animRef.current = requestAnimationFrame(loop);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", resize);
    };
  }, [color, count, speed, blendMode]);

  return (
    <canvas
      ref={canvasRef}
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
