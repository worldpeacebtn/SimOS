import React, { useEffect, useState } from "react";
import ParticlesCanvas from "./ParticlesCanvas";
import BunnyLines from "./BunnyLines";
import "./bg.css";

export default function IceBunnyBackground({ parallaxFactor = 0.06 }: { parallaxFactor?: number }) {
  const [offset, setOffset] = useState(0);
  const [mx, setMx] = useState(0);

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY || window.pageYOffset;
      setOffset(y * parallaxFactor);
