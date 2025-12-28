import React, { useEffect, useRef } from 'react';
import { SYNTH_COLORS } from '../constants';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  decay: number;
}

export const Fireworks: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    
    const resizeObserver = new ResizeObserver(() => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    });
    resizeObserver.observe(document.body);

    let particles: Particle[] = [];
    let animationFrameId: number;

    const createExplosion = (x: number, y: number) => {
      const particleCount = 50;
      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 2;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          color: SYNTH_COLORS[Math.floor(Math.random() * SYNTH_COLORS.length)],
          decay: Math.random() * 0.02 + 0.015
        });
      }
    };

    // Initial bursts
    createExplosion(width / 2, height / 2);
    
    // Periodic random bursts
    const interval = setInterval(() => {
      const x = Math.random() * width * 0.8 + width * 0.1;
      const y = Math.random() * height * 0.6 + height * 0.1;
      createExplosion(x, y);
    }, 800);

    const render = () => {
      // Trail effect
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, width, height);

      ctx.globalCompositeOperation = 'lighter';

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05; // Gravity
        p.vx *= 0.95; // Air resistance
        p.vy *= 0.95;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(interval);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 z-40 pointer-events-none"
      width={window.innerWidth}
      height={window.innerHeight}
    />
  );
};
