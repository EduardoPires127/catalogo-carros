"use client";

import { useRef, useState } from "react";

interface Props {
  availableCount: number;
  storeDescription: string;
}

export default function HeroSection({ availableCount, storeDescription }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const [mouse, setMouse] = useState({ x: 0.8, y: 0.4 });

  function handleMouseMove(e: React.MouseEvent) {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMouse({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  }

  function handleMouseLeave() {
    setMouse({ x: 0.8, y: 0.4 });
  }

  const dx = (mouse.x - 0.5);
  const dy = (mouse.y - 0.5);

  // Gradiente segue o mouse
  const bgStyle = {
    background: `radial-gradient(ellipse at ${(1 - mouse.x) * 100}% ${(1 - mouse.y) * 100}%, #fef08a 0%, #fefce8 35%, #ffffff 70%)`,
    transition: "background 0.15s ease",
  };

  // Blob moves more (decorative)
  const blobStyle = {
    transform: `translate(${dx * 60}px, ${dy * 40}px)`,
    transition: "transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  };

  // Second blob moves opposite direction
  const blob2Style = {
    transform: `translate(${dx * -40}px, ${dy * -30}px)`,
    transition: "transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  };

  // Text moves subtly
  const textStyle = {
    transform: `translate(${dx * 8}px, ${dy * 5}px)`,
    transition: "transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  };

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative overflow-hidden border-b border-yellow-100 cursor-default"
      style={bgStyle}
    >
      {/* Gold bar top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-300" />

      {/* Blob principal — segue o mouse */}
      <div
        className="absolute right-16 top-8 w-80 h-80 rounded-full bg-yellow-200/40 blur-3xl pointer-events-none"
        style={blobStyle}
      />

      {/* Blob secundário — direção oposta */}
      <div
        className="absolute left-0 bottom-0 w-64 h-64 rounded-full bg-yellow-100/30 blur-3xl pointer-events-none"
        style={blob2Style}
      />

      {/* Conteúdo com leve parallax */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="max-w-2xl" style={textStyle}>
          <span className="hero-badge inline-flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 uppercase tracking-wide">
            <span className="hero-dot w-1.5 h-1.5 rounded-full bg-yellow-500 inline-block" />
            {availableCount} carros disponíveis agora
          </span>

          <h1 className="hero-title text-4xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Encontre seu{" "}
            <span className="relative inline-block">
              <span className="text-yellow-500">próximo carro</span>
              <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-yellow-400/50 rounded-full" />
            </span>
            {" "}com a gente
          </h1>

          <p className="hero-subtitle text-lg text-gray-500 leading-relaxed">
            {storeDescription}. Seminovos com procedência e os melhores preços da região.
          </p>
        </div>
      </div>
    </section>
  );
}
