"use client";
import { useEffect, useRef } from "react";

interface Bolt {
  id: number;
  x: number;
  delay: number;
  duration: number;
  side: "left" | "right";
}

export default function LightningEffect() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let boltId = 0;

    function createBolt() {
      if (!container) return;

      const side = Math.random() > 0.5 ? "left" : "right";
      const x = side === "left"
        ? Math.random() * 30
        : 70 + Math.random() * 30;

      const bolt = document.createElement("div");
      bolt.className = "lightning-bolt-el";
      bolt.style.cssText = `
        position: fixed;
        top: 0;
        left: ${x}%;
        width: 2px;
        height: ${30 + Math.random() * 40}vh;
        pointer-events: none;
        z-index: 9998;
        opacity: 0;
      `;

      // Zigzag SVG bolt
      const height = 200 + Math.random() * 200;
      const color = Math.random() > 0.5 ? "#f6e05e" : "#a78bfa";
      bolt.innerHTML = `
        <svg width="30" height="${height}" viewBox="0 0 30 ${height}" fill="none" xmlns="http://www.w3.org/2000/svg" style="overflow:visible">
          <filter id="glow-${boltId}">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <polyline
            points="15,0 5,${height * 0.35} 20,${height * 0.45} 2,${height}"
            stroke="${color}"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            fill="none"
            filter="url(#glow-${boltId})"
          />
          <polyline
            points="15,0 5,${height * 0.35} 20,${height * 0.45} 2,${height}"
            stroke="white"
            stroke-width="0.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            fill="none"
          />
        </svg>
      `;
      boltId++;

      container.appendChild(bolt);

      // Flash animation
      const startDelay = Math.random() * 100;
      setTimeout(() => {
        // Flash in
        bolt.style.opacity = "0.9";
        setTimeout(() => {
          bolt.style.opacity = "0.3";
          setTimeout(() => {
            bolt.style.opacity = "0.8";
            setTimeout(() => {
              bolt.style.opacity = "0";
              setTimeout(() => bolt.remove(), 200);
            }, 80);
          }, 60);
        }, 100);
      }, startDelay);
    }

    // Lance un éclair toutes les 2-5 secondes
    function scheduleNext() {
      const interval = 2000 + Math.random() * 3000;
      return setTimeout(() => {
        createBolt();
        // Parfois double éclair
        if (Math.random() > 0.6) {
          setTimeout(createBolt, 150);
        }
        timer = scheduleNext();
      }, interval);
    }

    let timer = scheduleNext();
    // Premier éclair rapidement
    setTimeout(createBolt, 800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9998 }}
      aria-hidden="true"
    />
  );
}
