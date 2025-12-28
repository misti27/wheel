import React, { useEffect, useRef } from 'react';

interface TrailPoint {
  x: number;
  y: number;
  color: string;
  scale: number; // Store scale in trail
}

export const BouncingText: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const stateRef = useRef({
    phase: 'intro' as 'intro' | 'moving',
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    rotation: 0, // 0 to 360 for intro
    hue: 0,
    scale: 1, // Current scale of the text
    trail: [] as TrailPoint[]
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set initial canvas size
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Reset position to center on resize if still in intro
      if (stateRef.current.phase === 'intro') {
        stateRef.current.x = window.innerWidth / 2;
        stateRef.current.y = window.innerHeight / 2;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Initialize State
    // Random direction, very slow speed for readability
    const angle = Math.random() * Math.PI * 2;
    const speed = 4; 

    stateRef.current = {
      phase: 'intro',
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      rotation: 0,
      hue: 0,
      scale: 1,
      trail: []
    };

    const textString = "CONGRATULATIONS!";
    
    const update = () => {
      if (!ctx || !canvas) return;

      const state = stateRef.current;
      
      // Clear canvas for next frame
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const fontSize = Math.min(canvas.width * 0.12, 100); // Base font size
      ctx.font = `900 ${fontSize}px 'Orbitron'`;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';

      // Measure text for base collision bounds (unscaled)
      const metrics = ctx.measureText(textString);
      const baseTextWidth = metrics.width;
      const baseTextHeight = fontSize; 

      // Cycle Color
      state.hue = (state.hue + 5) % 360;
      const color = `hsl(${state.hue}, 100%, 60%)`;
      const strokeColor = '#ffffff';

      // --- LOGIC ---

      if (state.phase === 'intro') {
        // Intro Animation: Flip 360 degrees
        state.rotation += 4; 

        // Apply transforms
        ctx.save();
        ctx.translate(state.x, state.y);
        
        // Simulate 3D Flip using scaleY
        const scaleY = Math.cos((state.rotation * Math.PI) / 180);
        ctx.scale(1, scaleY);

        // Draw Text
        ctx.fillStyle = color;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 4;
        ctx.strokeText(textString, 0, 0);
        ctx.fillText(textString, 0, 0);
        
        ctx.restore();

        if (state.rotation >= 360) {
          state.phase = 'moving';
          state.rotation = 0;
          state.scale = 1; // Ensure start at 1
        }

      } else {
        // --- MOVING PHASE (Pinball) ---

        // Shrink Effect
        // Gradually decrease scale to 0.5
        if (state.scale > 0.5) {
          state.scale -= 0.002; // Very slow shrink to match slow speed
        }

        // Calculated Scaled Bounds for Collision
        const currentWidth = baseTextWidth * state.scale;
        const currentHeight = baseTextHeight * state.scale;

        // Update Physics
        state.x += state.vx;
        state.y += state.vy;

        // Wall Collisions (Left/Right)
        if (state.x + currentWidth / 2 > canvas.width) {
          state.x = canvas.width - currentWidth / 2;
          state.vx *= -1;
        } else if (state.x - currentWidth / 2 < 0) {
          state.x = currentWidth / 2;
          state.vx *= -1;
        }

        // Wall Collisions (Top/Bottom)
        if (state.y + currentHeight / 4 > canvas.height) {
          state.y = canvas.height - currentHeight / 4;
          state.vy *= -1;
        } else if (state.y - currentHeight / 2 < 0) {
           state.y = currentHeight / 2;
           state.vy *= -1;
        }

        // Update Trail History
        state.trail.push({ 
          x: state.x, 
          y: state.y, 
          color, 
          scale: state.scale 
        });
        
        // Keep trail length manageable
        if (state.trail.length > 30) {
          state.trail.shift();
        }

        // Draw Trail (Oldest first)
        state.trail.forEach((point, i) => {
           const alpha = (i / state.trail.length) * 0.4; // Fade out
           
           ctx.save();
           ctx.translate(point.x, point.y);
           ctx.scale(point.scale, point.scale);
           
           ctx.globalAlpha = alpha;
           ctx.fillStyle = point.color;
           ctx.strokeStyle = strokeColor;
           ctx.lineWidth = 2;
           
           ctx.strokeText(textString, 0, 0);
           ctx.fillText(textString, 0, 0);
           ctx.restore();
        });

        // Draw Main Text
        ctx.save();
        ctx.translate(state.x, state.y);
        ctx.scale(state.scale, state.scale);
        
        ctx.fillStyle = color;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 4;
        
        ctx.strokeText(textString, 0, 0);
        ctx.fillText(textString, 0, 0);
        
        ctx.restore();
      }

      requestRef.current = requestAnimationFrame(update);
    };

    requestRef.current = requestAnimationFrame(update);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef}
      className="fixed inset-0 z-[60] pointer-events-none"
      style={{ 
        width: '100vw', 
        height: '100vh',
        filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.3))'
      }}
    />
  );
};