
import React, { useRef, useEffect, useCallback } from 'react';
import { Particle, Firework, ShowTheme } from '../types';

interface FireworkEngineProps {
  theme: ShowTheme;
  isPaused: boolean;
  onExplosion?: () => void;
}

const FireworkEngine: React.FC<FireworkEngineProps> = ({ theme, isPaused, onExplosion }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fireworksRef = useRef<Firework[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const frameIdRef = useRef<number | undefined>(undefined);

  const random = (min: number, max: number) => Math.random() * (max - min) + min;

  const calculateDistance = (p1x: number, p1y: number, p2x: number, p2y: number) => {
    return Math.sqrt(Math.pow(p1x - p2x, 2) + Math.pow(p1y - p2y, 2));
  };

  const createParticles = useCallback((x: number, y: number, color: string) => {
    let count = theme.particleCount;
    for (let i = 0; i < count; i++) {
      let vx = 0, vy = 0;
      
      if (theme.explosionType === 'ring') {
        const angle = (i / count) * Math.PI * 2;
        vx = Math.cos(angle) * random(4, 6);
        vy = Math.sin(angle) * random(4, 6);
      } else if (theme.explosionType === 'star') {
        const angle = (i / count) * Math.PI * 10;
        vx = Math.cos(angle) * random(2, 8);
        vy = Math.sin(angle) * random(2, 8);
      } else if (theme.explosionType === 'heart') {
        // Simple heart shape formula
        const angle = (i / count) * Math.PI * 2;
        const speed = random(3, 5);
        vx = 16 * Math.pow(Math.sin(angle), 3) * (speed / 10);
        vy = -(13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle)) * (speed / 10);
      } else {
        const angle = Math.random() * Math.PI * 2;
        const speed = random(1, 10);
        vx = Math.cos(angle) * speed;
        vy = Math.sin(angle) * speed;
      }

      particlesRef.current.push({
        x, y, vx, vy,
        alpha: 1,
        color,
        size: random(theme.particleSize * 0.5, theme.particleSize * 1.5),
        gravity: 0.05,
        friction: 0.95,
        decay: random(0.01, 0.03)
      });
    }
    if (onExplosion) onExplosion();
  }, [theme, onExplosion]);

  const createFirework = useCallback((canvasWidth: number, canvasHeight: number) => {
    const x = canvasWidth / 2 + random(-canvasWidth / 4, canvasWidth / 4);
    const y = canvasHeight;
    const targetX = random(0, canvasWidth);
    const targetY = random(0, canvasHeight / 2);
    const distance = calculateDistance(x, y, targetX, targetY);
    
    fireworksRef.current.push({
      x, y, targetX, targetY,
      distanceToTarget: distance,
      distanceTraveled: 0,
      coordinates: [],
      coordinateCount: 3,
      angle: Math.atan2(targetY - y, targetX - x),
      speed: 2,
      acceleration: 1.05,
      brightness: random(50, 70),
      targetRadius: 1,
      color: theme.colors[Math.floor(Math.random() * theme.colors.length)] || '#ffffff'
    });
  }, [theme.colors]);

  const update = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'lighter';

    // Update fireworks
    let fIdx = fireworksRef.current.length;
    while (fIdx--) {
      const f = fireworksRef.current[fIdx];
      
      f.speed *= f.acceleration;
      const vx = Math.cos(f.angle) * f.speed;
      const vy = Math.sin(f.angle) * f.speed;
      f.distanceTraveled = calculateDistance(f.x + vx, f.y + vy, f.targetX, f.targetY);

      f.x += vx;
      f.y += vy;

      ctx.beginPath();
      ctx.moveTo(f.x - vx * 3, f.y - vy * 3);
      ctx.lineTo(f.x, f.y);
      ctx.strokeStyle = f.color;
      ctx.lineWidth = 2;
      ctx.stroke();

      if (f.y <= f.targetY || Math.abs(f.x - f.targetX) < 10) {
        createParticles(f.x, f.y, f.color);
        fireworksRef.current.splice(fIdx, 1);
      }
    }

    // Update particles
    let pIdx = particlesRef.current.length;
    while (pIdx--) {
      const p = particlesRef.current[pIdx];
      p.vx *= p.friction;
      p.vy *= p.friction;
      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;

      if (p.alpha <= p.decay) {
        particlesRef.current.splice(pIdx, 1);
        continue;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    if (Math.random() < theme.launchFrequency) {
      createFirework(canvas.width, canvas.height);
    }
  }, [createFirework, createParticles, theme.launchFrequency]);

  const loop = useCallback(() => {
    if (!isPaused) {
      update();
    }
    frameIdRef.current = requestAnimationFrame(loop);
  }, [update, isPaused]);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    frameIdRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (frameIdRef.current !== undefined) cancelAnimationFrame(frameIdRef.current);
    };
  }, [loop]);

  const handleManualLaunch = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const x = canvas.width / 2;
    const y = canvas.height;
    const targetX = e.clientX;
    const targetY = e.clientY;
    const distance = calculateDistance(x, y, targetX, targetY);
    
    fireworksRef.current.push({
      x, y, targetX, targetY,
      distanceToTarget: distance,
      distanceTraveled: 0,
      coordinates: [],
      coordinateCount: 3,
      angle: Math.atan2(targetY - y, targetX - x),
      speed: 2,
      acceleration: 1.05,
      brightness: 70,
      targetRadius: 1,
      color: theme.colors[Math.floor(Math.random() * theme.colors.length)] || '#ffffff'
    });
  };

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 cursor-crosshair"
      onClick={handleManualLaunch}
    />
  );
};

export default FireworkEngine;
