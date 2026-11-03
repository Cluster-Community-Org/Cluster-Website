import React, { useEffect, useRef } from 'react';

export const CircuitCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    const gridSize = 36;
    const particles = [];

    for (let i = 0; i < 28; i++) {
      particles.push({
        x: Math.floor(Math.random() * (width / gridSize)) * gridSize,
        y: Math.floor(Math.random() * (height / gridSize)) * gridSize,
        vx: (Math.random() > 0.5 ? 1 : -1) * (Math.random() > 0.5 ? 2 : 0),
        vy: 0,
        life: 0,
        maxLife: 100 + Math.random() * 120,
        color: Math.random() > 0.35 ? '#C6FF4D' : '#F8F8F5'
      });
    }

    const render = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
      ctx.fillRect(0, 0, width, height);

      // Subtle dot matrix grid points as specified in CLUSTER graphic system
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      for (let x = 0; x < width; x += gridSize) {
        for (let y = 0; y < height; y += gridSize) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      particles.forEach((p) => {
        p.life++;
        p.x += p.vx;
        p.y += p.vy;

        if (p.x % gridSize === 0 && p.y % gridSize === 0 && Math.random() < 0.35) {
          if (p.vx !== 0) {
            p.vx = 0;
            p.vy = (Math.random() > 0.5 ? 2 : -2);
          } else {
            p.vy = 0;
            p.vx = (Math.random() > 0.5 ? 2 : -2);
          }
        }

        if (p.x < 0 || p.x > width || p.y < 0 || p.y > height || p.life > p.maxLife) {
          p.x = Math.floor(Math.random() * (width / gridSize)) * gridSize;
          p.y = Math.floor(Math.random() * (height / gridSize)) * gridSize;
          p.life = 0;
          p.vx = (Math.random() > 0.5 ? 1 : -1) * 2;
          p.vy = 0;
        }

        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = p.color === '#C6FF4D' ? 8 : 4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.color === '#C6FF4D' ? 2.5 : 1.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
    />
  );
};
