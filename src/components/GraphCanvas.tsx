import React, { useEffect, useRef, useState, useCallback } from 'react';
import { LineConfig, TargetLine, LineAccuracy } from '../types';
import { LINE_THEMES } from '../mathUtils';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  vRot: number;
  alpha: number;
  life: number;
  maxLife: number;
  shape: 'star' | 'circle' | 'rect';
}

interface GraphCanvasProps {
  playerLines: LineConfig[];
  targetLines: TargetLine[];
  accuracies: LineAccuracy[];
  activeLineIndex: number;
  onSelectLine: (index: number) => void;
  showTargets: boolean;
  isVictory: boolean;
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  playerLines,
  targetLines,
  accuracies,
  activeLineIndex,
  onSelectLine,
  showTargets,
  isVictory,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number } | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number | null>(null);

  // Trigger celebration particles when isVictory becomes true
  useEffect(() => {
    if (isVictory) {
      const colors = ['#F43F5E', '#14B8A6', '#F59E0B', '#8B5CF6', '#EC4899', '#10B981', '#38BDF8', '#FBBF24'];
      const newParticles: Particle[] = [];
      const canvas = canvasRef.current;
      const w = canvas ? canvas.width / (window.devicePixelRatio || 1) : 500;
      const h = canvas ? canvas.height / (window.devicePixelRatio || 1) : 500;

      for (let i = 0; i < 90; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 3;
        newParticles.push({
          x: w / 2 + (Math.random() - 0.5) * 60,
          y: h / 2 + (Math.random() - 0.5) * 60,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 3.5, // initial upward burst
          size: Math.random() * 8 + 5,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.2,
          alpha: 1,
          life: 0,
          maxLife: 80 + Math.random() * 40,
          shape: Math.random() > 0.4 ? 'star' : Math.random() > 0.5 ? 'circle' : 'rect',
        });
      }
      particlesRef.current = newParticles;
    }
  }, [isVictory]);

  // Coordinate conversion helpers (-10 to 10)
  const mathToPixel = useCallback((mx: number, my: number, width: number, height: number) => {
    const padding = 28;
    const graphW = width - padding * 2;
    const graphH = height - padding * 2;
    // Map -10 -> padding, +10 -> width - padding
    const px = padding + ((mx + 10) / 20) * graphW;
    // Map +10 -> padding, -10 -> height - padding
    const py = padding + ((10 - my) / 20) * graphH;
    return { px, py };
  }, []);

  const pixelToMath = useCallback((px: number, py: number, width: number, height: number) => {
    const padding = 28;
    const graphW = width - padding * 2;
    const graphH = height - padding * 2;
    const mx = ((px - padding) / graphW) * 20 - 10;
    const my = 10 - ((py - padding) / graphH) * 20;
    return { mx, my };
  }, []);

  // Main Render Loop
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Adjust canvas resolution for retina displays
    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    // 1. Background
    ctx.fillStyle = '#FCFAF6';
    ctx.fillRect(0, 0, width, height);

    const padding = 28;
    const graphW = width - padding * 2;
    const graphH = height - padding * 2;

    // 2. Minor Grid lines (step 1)
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#F1ECE3';
    ctx.beginPath();
    for (let i = -10; i <= 10; i++) {
      if (i % 2 !== 0) {
        const { px } = mathToPixel(i, 0, width, height);
        const { py } = mathToPixel(0, i, width, height);
        ctx.moveTo(px, padding);
        ctx.lineTo(px, height - padding);
        ctx.moveTo(padding, py);
        ctx.lineTo(width - padding, py);
      }
    }
    ctx.stroke();

    // 3. Major Grid lines (step 2)
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = '#E2DDD4';
    ctx.beginPath();
    for (let i = -10; i <= 10; i += 2) {
      if (i !== 0) {
        const { px } = mathToPixel(i, 0, width, height);
        const { py } = mathToPixel(0, i, width, height);
        ctx.moveTo(px, padding);
        ctx.lineTo(px, height - padding);
        ctx.moveTo(padding, py);
        ctx.lineTo(width - padding, py);
      }
    }
    ctx.stroke();

    // 4. Ox and Oy Axes
    const origin = mathToPixel(0, 0, width, height);
    ctx.lineWidth = 2.4;
    ctx.strokeStyle = '#44403C';
    ctx.beginPath();
    // Ox axis
    ctx.moveTo(padding - 8, origin.py);
    ctx.lineTo(width - padding + 12, origin.py);
    // Oy axis
    ctx.moveTo(origin.px, height - padding + 8);
    ctx.lineTo(origin.px, padding - 12);
    ctx.stroke();

    // Axis Arrows
    ctx.fillStyle = '#44403C';
    // Ox Arrow (pointing right)
    ctx.beginPath();
    ctx.moveTo(width - padding + 14, origin.py);
    ctx.lineTo(width - padding + 6, origin.py - 5);
    ctx.lineTo(width - padding + 6, origin.py + 5);
    ctx.fill();

    // Oy Arrow (pointing top)
    ctx.beginPath();
    ctx.moveTo(origin.px, padding - 14);
    ctx.lineTo(origin.px - 5, padding - 6);
    ctx.lineTo(origin.px + 5, padding - 6);
    ctx.fill();

    // Axis Labels
    ctx.font = '700 13px "Fredoka", "Nunito", sans-serif';
    ctx.fillStyle = '#44403C';
    ctx.fillText('x', width - padding + 12, origin.py + 18);
    ctx.fillText('y', origin.px - 18, padding - 10);

    // Number Ticks on Axes
    ctx.font = '600 10.5px "JetBrains Mono", monospace';
    ctx.fillStyle = '#78716C';
    for (let i = -10; i <= 10; i += 2) {
      if (i === 0) continue;
      const { px } = mathToPixel(i, 0, width, height);
      const { py } = mathToPixel(0, i, width, height);

      // Tick on Ox
      ctx.beginPath();
      ctx.moveTo(px, origin.py - 3);
      ctx.lineTo(px, origin.py + 3);
      ctx.strokeStyle = '#57534E';
      ctx.stroke();

      // Number on Ox
      ctx.textAlign = 'center';
      ctx.fillText(`${i}`, px, origin.py + 15);

      // Tick on Oy
      ctx.beginPath();
      ctx.moveTo(origin.px - 3, py);
      ctx.lineTo(origin.px + 3, py);
      ctx.strokeStyle = '#57534E';
      ctx.stroke();

      // Number on Oy
      ctx.textAlign = 'right';
      ctx.fillText(`${i}`, origin.px - 6, py + 3.5);
    }

    // Origin "O"
    ctx.font = '600 11px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText('0', origin.px - 5, origin.py + 14);

    // 5. Target Lines (Dashed Gray with subtle glow)
    if (showTargets) {
      targetLines.forEach((target, index) => {
        const y1 = target.a * target.xMin + target.b;
        const y2 = target.a * target.xMax + target.b;

        const p1 = mathToPixel(target.xMin, y1, width, height);
        const p2 = mathToPixel(target.xMax, y2, width, height);

        // Faint glow halo
        ctx.save();
        ctx.strokeStyle = 'rgba(156, 163, 175, 0.25)';
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(p1.px, p1.py);
        ctx.lineTo(p2.px, p2.py);
        ctx.stroke();
        ctx.restore();

        // Target dashed line
        ctx.save();
        ctx.setLineDash([7, 6]);
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = '#94A3B8';
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(p1.px, p1.py);
        ctx.lineTo(p2.px, p2.py);
        ctx.stroke();

        // Target endpoint markers (small rings)
        [p1, p2].forEach((pt) => {
          ctx.beginPath();
          ctx.arc(pt.px, pt.py, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();
          ctx.strokeStyle = '#64748B';
          ctx.lineWidth = 1.8;
          ctx.setLineDash([]);
          ctx.stroke();
        });
        ctx.restore();
      });
    }

    // 6. Player Lines
    playerLines.forEach((line, index) => {
      const theme = LINE_THEMES[index % LINE_THEMES.length];
      const isSelected = index === activeLineIndex;
      const acc = accuracies[index];

      const y1 = line.a * line.xMin + line.b;
      const y2 = line.a * line.xMax + line.b;

      const p1 = mathToPixel(line.xMin, y1, width, height);
      const p2 = mathToPixel(line.xMax, y2, width, height);

      // Selected line halo or matched line glow
      ctx.save();
      if (acc?.isMatched) {
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.35)'; // emerald glow
        ctx.lineWidth = 13;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(p1.px, p1.py);
        ctx.lineTo(p2.px, p2.py);
        ctx.stroke();
      } else if (isSelected) {
        ctx.strokeStyle = `${theme.color}33`; // 20% alpha
        ctx.lineWidth = 12;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(p1.px, p1.py);
        ctx.lineTo(p2.px, p2.py);
        ctx.stroke();
      }

      // Draw Main Line
      ctx.lineWidth = isSelected ? 5 : 4;
      ctx.strokeStyle = theme.color;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(p1.px, p1.py);
      ctx.lineTo(p2.px, p2.py);
      ctx.stroke();

      // Endpoints (interactive dots)
      [p1, p2].forEach((pt, ptIdx) => {
        ctx.beginPath();
        ctx.arc(pt.px, pt.py, isSelected ? 6.5 : 5, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.strokeStyle = theme.color;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Inner center dot
        ctx.beginPath();
        ctx.arc(pt.px, pt.py, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = theme.color;
        ctx.fill();
      });

      // If matched, draw a cute badge near center
      if (acc?.isMatched) {
        const midX = (p1.px + p2.px) / 2;
        const midY = (p1.py + p2.py) / 2;

        ctx.fillStyle = '#10B981';
        ctx.beginPath();
        ctx.arc(midX, midY - 14, 8.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Checkmark
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(midX - 3.5, midY - 14);
        ctx.lineTo(midX - 1, midY - 11.5);
        ctx.lineTo(midX + 4.5, midY - 17);
        ctx.stroke();
      }
      ctx.restore();
    });

    // 7. Interactive Hover Cursor & Coordinates
    if (hoverCoord) {
      const { px, py } = mathToPixel(hoverCoord.x, hoverCoord.y, width, height);
      if (px >= padding && px <= width - padding && py >= padding && py <= height - padding) {
        ctx.save();
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = 'rgba(100, 116, 139, 0.4)';
        ctx.lineWidth = 1;

        // Vertical drop line to Ox
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px, origin.py);
        ctx.stroke();

        // Horizontal drop line to Oy
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(origin.px, py);
        ctx.stroke();

        // Hover point dot
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#475569';
        ctx.fill();
        ctx.restore();
      }
    }

    // 8. Celebration Particles Animation
    if (particlesRef.current.length > 0) {
      ctx.save();
      const updated: Particle[] = [];
      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.22; // gravity
        p.rotation += p.vRot;
        p.life += 1;
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);

        if (p.alpha > 0.02) {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;

          if (p.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          } else if (p.shape === 'rect') {
            ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
          } else {
            // Star shape
            ctx.beginPath();
            for (let s = 0; s < 5; s++) {
              ctx.lineTo(Math.cos(((18 + s * 72) * Math.PI) / 180) * p.size, -Math.sin(((18 + s * 72) * Math.PI) / 180) * p.size);
              ctx.lineTo(Math.cos(((54 + s * 72) * Math.PI) / 180) * (p.size / 2), -Math.sin(((54 + s * 72) * Math.PI) / 180) * (p.size / 2));
            }
            ctx.closePath();
            ctx.fill();
          }
          ctx.restore();
          updated.push(p);
        }
      });
      particlesRef.current = updated;
      ctx.restore();
    }

    ctx.restore();
  }, [
    mathToPixel,
    playerLines,
    targetLines,
    accuracies,
    activeLineIndex,
    showTargets,
    hoverCoord,
  ]);

  // Continuous animation loop for particles and real-time updates
  useEffect(() => {
    let active = true;
    const loop = () => {
      if (!active) return;
      draw();
      animFrameRef.current = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      active = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [draw]);

  // Mouse Move Event on Canvas
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const { mx, my } = pixelToMath(px, py, rect.width, rect.height);
    // Snap to 0.5 for nice readability
    const snappedX = Math.round(mx * 2) / 2;
    const snappedY = Math.round(my * 2) / 2;
    setHoverCoord({ x: snappedX, y: snappedY });
  };

  const handleMouseLeave = () => {
    setHoverCoord(null);
  };

  // Click on canvas to select nearest line
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const { mx, my } = pixelToMath(px, py, rect.width, rect.height);

    // Find closest player line
    let bestDist = Infinity;
    let bestIndex = -1;

    playerLines.forEach((line, idx) => {
      // Check distance to line segment
      if (mx >= Math.min(line.xMin, line.xMax) - 0.8 && mx <= Math.max(line.xMin, line.xMax) + 0.8) {
        const expectedY = line.a * mx + line.b;
        const dist = Math.abs(my - expectedY);
        if (dist < bestDist && dist < 1.8) {
          bestDist = dist;
          bestIndex = idx;
        }
      }
    });

    if (bestIndex !== -1 && bestIndex !== activeLineIndex) {
      onSelectLine(bestIndex);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full aspect-square max-w-[560px] mx-auto select-none">
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleCanvasClick}
        className="w-full h-full rounded-3xl shadow-sm border border-stone-200/80 cursor-crosshair transition-shadow hover:shadow-md bg-[#FCFAF6]"
        style={{ touchAction: 'none' }}
      />

      {/* Coordinate Tooltip in top corner */}
      {hoverCoord && (
        <div className="absolute top-3 right-3 bg-stone-900/80 text-white backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-mono font-medium shadow-sm pointer-events-none flex items-center gap-1.5 animate-fadeIn">
          <span className="text-stone-400">Tọa độ:</span>
          <span className="text-amber-300 font-bold">({hoverCoord.x.toFixed(1)}, {hoverCoord.y.toFixed(1)})</span>
        </div>
      )}

      {/* Grid range indicator indicator badge */}
      <div className="absolute bottom-3 left-3 bg-white/90 text-stone-500 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[11px] font-mono border border-stone-200 shadow-xs pointer-events-none">
        x, y ∈ [-10, 10]
      </div>
    </div>
  );
};
