'use client';

import React, { useRef, useEffect } from 'react';

interface DeadlockBlemishedCardProps {
  children: React.ReactNode;
  className?: string;
  allowedCorners?: ('top-right' | 'top-left' | 'bottom-right' | 'bottom-left')[];
  ripChance?: number;
}

interface Blemish {
  pos: number;
  depth: number;
  width: number;
  skew: number;
}

interface Blemishes {
  top: Blemish[];
  right: Blemish[];
  bottom: Blemish[];
  left: Blemish[];
}

interface Rip {
  type: 'partial';
  corner: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  path: { x: number; y: number }[];
}

const CORNER_RADIUS = 12;
const PARTIAL_RIP_CHANCE = 0.25;

export default function DeadlockBlemishedCard({ 
  children, 
  className = '', 
  allowedCorners = ['top-right', 'top-left', 'bottom-right', 'bottom-left'],
  ripChance = PARTIAL_RIP_CHANCE 
}: DeadlockBlemishedCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const blemishesRef = useRef<Blemishes | null>(null);
  const ripRef = useRef<Rip | null>(null);
  const isInitializedRef = useRef(false);
  
  const cachedPathRef = useRef<Path2D | null>(null);
  const cachedDimensionsRef = useRef<{ width: number; height: number } | null>(null);

  const generateBlemishes = (width: number, height: number): Blemishes => {
    const blemishes: Blemishes = { top: [], right: [], bottom: [], left: [] };
    const perimeter = 2 * (width + height);
    const blemishCount = Math.floor(perimeter / 150) + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < blemishCount; i++) {
      const edge = (['top', 'right', 'bottom', 'left'] as const)[Math.floor(Math.random() * 4)];
      const position = Math.random();
      const depth = 2 + Math.random() * 4;
      const blemishWidth = 10 + Math.random() * 40;
      const skew = Math.random() * 0.6 + 0.2;
      blemishes[edge].push({ pos: position, depth, width: blemishWidth, skew });
    }
    
    for (const edge in blemishes) {
      blemishes[edge as keyof Blemishes].sort((a, b) => a.pos - b.pos);
    }
    
    return blemishes;
  };

  const generateRip = (width: number, height: number, allowedCorners: ('top-right' | 'top-left' | 'bottom-right' | 'bottom-left')[], chance: number): Rip | null => {
    const roll = Math.random();
    
    if (roll < chance && allowedCorners.length > 0) {
      const corner = allowedCorners[Math.floor(Math.random() * allowedCorners.length)];
      const path: { x: number; y: number }[] = [];
      const segments = 20;
      const amplitude = 4 + Math.random() * 8;
      
      const ripDistX = width * (0.15 + Math.random() * 0.25);
      const ripDistY = height * (0.15 + Math.random() * 0.25);
      
      let startPoint: { x: number; y: number };
      let endPoint: { x: number; y: number };

      switch(corner) {
        case 'top-right':
          startPoint = { x: width - ripDistX, y: 0 };
          endPoint = { x: width, y: ripDistY };
          break;
        case 'top-left':
          startPoint = { x: ripDistX, y: 0 };
          endPoint = { x: 0, y: ripDistY };
          break;
        case 'bottom-right':
          startPoint = { x: width - ripDistX, y: height };
          endPoint = { x: width, y: height - ripDistY };
          break;
        case 'bottom-left':
          startPoint = { x: ripDistX, y: height };
          endPoint = { x: 0, y: height - ripDistY };
          break;
      }

      const dx = endPoint.x - startPoint.x;
      const dy = endPoint.y - startPoint.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);

      path.push({ x: startPoint.x, y: startPoint.y });
      for (let i = 1; i < segments; i++) {
        const along = (i / segments) * dist;
        const perp = (Math.random() - 0.5) * amplitude;
        path.push({
          x: startPoint.x + along * Math.cos(angle) + perp * Math.cos(angle + Math.PI / 2),
          y: startPoint.y + along * Math.sin(angle) + perp * Math.sin(angle + Math.PI / 2)
        });
      }
      path.push({ x: endPoint.x, y: endPoint.y });

      return { type: 'partial', corner, path };
    }
    
    return null;
  };

  const drawCardTexture = (ctx: CanvasRenderingContext2D, width: number, height: number, blemishes: Blemishes) => {
    const splotchCount = (width * height) / 150;

    for (let i = 0; i < splotchCount; i++) {
      const sx = Math.random() * width;
      const sy = Math.random() * height;
      const sRadius = 0.5 + Math.random() * 1.5;
      const sAlpha = 0.03 + Math.random() * 0.06;
      ctx.fillStyle = `rgba(0, 0, 0, ${sAlpha})`;
      ctx.beginPath();
      ctx.arc(sx, sy, sRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    const drawBlemishSplotches = (bx: number, by: number) => {
      for (let i = 0; i < 15; i++) { 
        const offsetX = (Math.random() - 0.5) * 40;
        const offsetY = (Math.random() - 0.5) * 40;
        const sRadius = 0.5 + Math.random() * 2;
        const sAlpha = 0.05 + Math.random() * 0.08; 
        ctx.fillStyle = `rgba(0, 0, 0, ${sAlpha})`;
        ctx.beginPath();
        ctx.arc(bx + offsetX, by + offsetY, sRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    
    blemishes.top.forEach(b => drawBlemishSplotches(b.pos * width, 0));
    blemishes.right.forEach(b => drawBlemishSplotches(width, b.pos * height));
    blemishes.bottom.forEach(b => drawBlemishSplotches(b.pos * width, height));
    blemishes.left.forEach(b => drawBlemishSplotches(0, b.pos * height));
  };

  const createCardPath = (width: number, height: number, blemishes: Blemishes, rip: Rip | null): Path2D => {
    const path = new Path2D();

    if (rip && rip.type === 'partial') {
      switch (rip.corner) {
        case 'top-left':
          path.moveTo(rip.path[rip.path.length - 1].x, rip.path[rip.path.length - 1].y);
          path.lineTo(0, height - CORNER_RADIUS);
          path.arcTo(0, height, CORNER_RADIUS, height, CORNER_RADIUS);
          path.lineTo(CORNER_RADIUS, height);
          addBlemishedBottomEdgeToPath(path, width, height, blemishes.bottom);
          path.arcTo(width, height, width, height - CORNER_RADIUS, CORNER_RADIUS);
          path.lineTo(width, height - CORNER_RADIUS);
          addBlemishedRightEdgeToPath(path, width, height, blemishes.right);
          path.arcTo(width, 0, width - CORNER_RADIUS, 0, CORNER_RADIUS);
          path.lineTo(width - CORNER_RADIUS, 0);
          addBlemishedTopEdgePartialToPath(path, width, blemishes.top, width - CORNER_RADIUS, rip.path[0].x);
          rip.path.forEach(p => path.lineTo(p.x, p.y));
          break;
          
        case 'top-right':
          path.moveTo(CORNER_RADIUS, 0);
          addBlemishedTopEdgePartialToPath(path, width, blemishes.top, CORNER_RADIUS, rip.path[0].x);
          rip.path.forEach(p => path.lineTo(p.x, p.y));
          path.lineTo(width, height - CORNER_RADIUS);
          path.arcTo(width, height, width - CORNER_RADIUS, height, CORNER_RADIUS);
          path.lineTo(width - CORNER_RADIUS, height);
          addBlemishedBottomEdgeToPath(path, width, height, blemishes.bottom);
          path.arcTo(0, height, 0, height - CORNER_RADIUS, CORNER_RADIUS);
          path.lineTo(0, height - CORNER_RADIUS);
          addBlemishedLeftEdgeToPath(path, width, height, blemishes.left);
          path.arcTo(0, 0, CORNER_RADIUS, 0, CORNER_RADIUS);
          break;
          
        case 'bottom-right':
          path.moveTo(CORNER_RADIUS, 0);
          addBlemishedTopEdgeToPath(path, width, height, blemishes.top);
          path.arcTo(width, 0, width, CORNER_RADIUS, CORNER_RADIUS);
          path.lineTo(width, CORNER_RADIUS);
          addBlemishedRightEdgePartialToPath(path, height, blemishes.right, CORNER_RADIUS, rip.path[0].y, width);
          rip.path.forEach(p => path.lineTo(p.x, p.y));
          path.lineTo(CORNER_RADIUS, height);
          path.arcTo(0, height, 0, height - CORNER_RADIUS, CORNER_RADIUS);
          path.lineTo(0, height - CORNER_RADIUS);
          addBlemishedLeftEdgeToPath(path, width, height, blemishes.left);
          path.arcTo(0, 0, CORNER_RADIUS, 0, CORNER_RADIUS);
          break;
          
        case 'bottom-left':
          path.moveTo(CORNER_RADIUS, 0);
          addBlemishedTopEdgeToPath(path, width, height, blemishes.top);
          path.arcTo(width, 0, width, CORNER_RADIUS, CORNER_RADIUS);
          path.lineTo(width, CORNER_RADIUS);
          addBlemishedRightEdgeToPath(path, width, height, blemishes.right);
          path.arcTo(width, height, width - CORNER_RADIUS, height, CORNER_RADIUS);
          path.lineTo(width - CORNER_RADIUS, height);
          addBlemishedBottomEdgePartialToPath(path, width, blemishes.bottom, width - CORNER_RADIUS, rip.path[0].x, height);
          rip.path.forEach(p => path.lineTo(p.x, p.y));
          path.lineTo(0, CORNER_RADIUS);
          path.arcTo(0, 0, CORNER_RADIUS, 0, CORNER_RADIUS);
          break;
      }
    } else {
      path.moveTo(CORNER_RADIUS, 0);
      addIntactCardPathToPath(path, width, height, blemishes);
    }

    path.closePath();
    return path;
  };

  const addBlemishedTopEdgeToPath = (path: Path2D, width: number, height: number, blemishes: Blemish[]) => {
    blemishes.forEach(b => {
      const bx = b.pos * width;
      const bStart = bx - b.width / 2;
      const bEnd = bx + b.width / 2;
      const bDeep = bx - b.width/2 + b.width * b.skew;
      path.lineTo(bStart, 0);
      path.lineTo(bDeep, b.depth);
      path.lineTo(bEnd, 0);
    });
    path.lineTo(width - CORNER_RADIUS, 0);
  };

  const addBlemishedTopEdgePartialToPath = (path: Path2D, width: number, blemishes: Blemish[], startX: number, endX: number) => {
    blemishes.forEach(b => {
      const bx = b.pos * width;
      const bStart = bx - b.width / 2;
      const bEnd = bx + b.width / 2;
      if (bStart >= startX && bEnd <= endX) {
        const bDeep = bx - b.width/2 + b.width * b.skew;
        path.lineTo(bStart, 0);
        path.lineTo(bDeep, b.depth);
        path.lineTo(bEnd, 0);
      }
    });
    path.lineTo(endX, 0);
  };

  const addBlemishedRightEdgeToPath = (path: Path2D, width: number, height: number, blemishes: Blemish[]) => {
    blemishes.forEach(b => {
      const by = b.pos * height;
      const bStart = by - b.width / 2;
      const bEnd = by + b.width / 2;
      const bDeep = by - b.width/2 + b.width * b.skew;
      path.lineTo(width, bStart);
      path.lineTo(width - b.depth, bDeep);
      path.lineTo(width, bEnd);
    });
    path.lineTo(width, height - CORNER_RADIUS);
  };

  const addBlemishedRightEdgePartialToPath = (path: Path2D, height: number, blemishes: Blemish[], startY: number, endY: number, width: number) => {
    blemishes.forEach(b => {
      const by = b.pos * height;
      const bStart = by - b.width / 2;
      const bEnd = by + b.width / 2;
      if (bStart >= startY && bEnd <= endY) {
        const bDeep = by - b.width/2 + b.width * b.skew;
        path.lineTo(width, bStart);
        path.lineTo(width - b.depth, bDeep);
        path.lineTo(width, bEnd);
      }
    });
    path.lineTo(width, endY);
  };

  const addBlemishedBottomEdgeToPath = (path: Path2D, width: number, height: number, blemishes: Blemish[]) => {
    for (let i = blemishes.length - 1; i >= 0; i--) {
      const b = blemishes[i];
      const bx = b.pos * width;
      const bStart = bx + b.width / 2;
      const bEnd = bx - b.width / 2;
      const bDeep = bx + b.width/2 - b.width * (1-b.skew);
      path.lineTo(bStart, height);
      path.lineTo(bDeep, height - b.depth);
      path.lineTo(bEnd, height);
    }
    path.lineTo(CORNER_RADIUS, height);
  };

  const addBlemishedBottomEdgePartialToPath = (path: Path2D, width: number, blemishes: Blemish[], startX: number, endX: number, height: number) => {
    for (let i = blemishes.length - 1; i >= 0; i--) {
      const b = blemishes[i];
      const bx = b.pos * width;
      const bStart = bx + b.width / 2;
      const bEnd = bx - b.width / 2;
      if (bStart <= startX && bEnd >= endX) {
        const bDeep = bx + b.width/2 - b.width * (1-b.skew);
        path.lineTo(bStart, height);
        path.lineTo(bDeep, height - b.depth);
        path.lineTo(bEnd, height);
      }
    }
    path.lineTo(endX, height);
  };

  const addBlemishedLeftEdgeToPath = (path: Path2D, width: number, height: number, blemishes: Blemish[]) => {
    for (let i = blemishes.length - 1; i >= 0; i--) {
      const b = blemishes[i];
      const by = b.pos * height;
      const bStart = by + b.width / 2;
      const bEnd = by - b.width / 2;
      const bDeep = by + b.width/2 - b.width * (1-b.skew);
      path.lineTo(0, bStart);
      path.lineTo(b.depth, bDeep);
      path.lineTo(0, bEnd);
    }
    path.lineTo(0, CORNER_RADIUS);
  };

  const addIntactCardPathToPath = (path: Path2D, width: number, height: number, blemishes: Blemishes) => {
    blemishes.top.forEach(b => {
      const bx = b.pos * width;
      const bStart = bx - b.width / 2;
      const bEnd = bx + b.width / 2;
      const bDeep = bx - b.width/2 + b.width * b.skew;
      path.lineTo(bStart, 0);
      path.lineTo(bDeep, b.depth);
      path.lineTo(bEnd, 0);
    });
    path.lineTo(width - CORNER_RADIUS, 0);
    path.arcTo(width, 0, width, CORNER_RADIUS, CORNER_RADIUS);
    path.lineTo(width, CORNER_RADIUS);
    blemishes.right.forEach(b => {
      const by = b.pos * height;
      const bStart = by - b.width / 2;
      const bEnd = by + b.width / 2;
      const bDeep = by - b.width/2 + b.width * b.skew;
      path.lineTo(width, bStart);
      path.lineTo(width - b.depth, bDeep);
      path.lineTo(width, bEnd);
    });
    path.lineTo(width, height - CORNER_RADIUS);
    path.arcTo(width, height, width - CORNER_RADIUS, height, CORNER_RADIUS);
    path.lineTo(width - CORNER_RADIUS, height);
    for (let i = blemishes.bottom.length - 1; i >= 0; i--) {
      const b = blemishes.bottom[i];
      const bx = b.pos * width;
      const bStart = bx + b.width / 2;
      const bEnd = bx - b.width / 2;
      const bDeep = bx + b.width/2 - b.width * (1-b.skew);
      path.lineTo(bStart, height);
      path.lineTo(bDeep, height - b.depth);
      path.lineTo(bEnd, height);
    }
    path.lineTo(CORNER_RADIUS, height);
    path.arcTo(0, height, 0, height - CORNER_RADIUS, CORNER_RADIUS);
    path.lineTo(0, height - CORNER_RADIUS);
    for (let i = blemishes.left.length - 1; i >= 0; i--) {
      const b = blemishes.left[i];
      const by = b.pos * height;
      const bStart = by + b.width / 2;
      const bEnd = by - b.width / 2;
      const bDeep = by + b.width/2 - b.width * (1-b.skew);
      path.lineTo(0, bStart);
      path.lineTo(b.depth, bDeep);
      path.lineTo(0, bEnd);
    }
    path.lineTo(0, CORNER_RADIUS);
    path.arcTo(0, 0, CORNER_RADIUS, 0, CORNER_RADIUS);
  };

  const drawCard = (ctx: CanvasRenderingContext2D, width: number, height: number, blemishes: Blemishes, rip: Rip | null) => {
    ctx.clearRect(0, 0, width, height);
    
    const dimensionsChanged = !cachedDimensionsRef.current || 
                              cachedDimensionsRef.current.width !== width || 
                              cachedDimensionsRef.current.height !== height;
    
    if (!cachedPathRef.current || dimensionsChanged) {
      cachedPathRef.current = createCardPath(width, height, blemishes, rip);
      cachedDimensionsRef.current = { width, height };
    }
    
    ctx.save();
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#386666'); 
    gradient.addColorStop(1, '#2E4F4F'); 
    ctx.fillStyle = gradient;
    ctx.fill(cachedPathRef.current);
    ctx.save();
    ctx.clip(cachedPathRef.current);
    drawCardTexture(ctx, width, height, blemishes);
    ctx.restore(); 
    ctx.restore();
  };

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const updateCanvas = () => {
      const width = container.offsetWidth;
      const height = container.offsetHeight;
      
      if (width === 0 || height === 0) return;
      
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      if (!isInitializedRef.current) {
        blemishesRef.current = generateBlemishes(width, height);
        ripRef.current = generateRip(width, height, allowedCorners, ripChance);
        isInitializedRef.current = true;
      }

      const ctx = canvas.getContext('2d');
      if (ctx && blemishesRef.current !== null) {
        drawCard(ctx, width, height, blemishesRef.current, ripRef.current);
      }
    };

    requestAnimationFrame(() => {
      updateCanvas();
    });

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(updateCanvas);
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [allowedCorners, ripChance]);

  return (
    <div ref={containerRef} className={`relative ${className}`} style={{ position: 'relative' }}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%',
          pointerEvents: 'none',
          willChange: 'transform'
        }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
