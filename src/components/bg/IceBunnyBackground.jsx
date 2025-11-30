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
