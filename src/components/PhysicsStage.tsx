/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { PhysicsObject, PhysicsParams, ScrollMetrics, ThemePreset } from '../types';
import { Coins, Zap, HelpCircle } from 'lucide-react';

interface PhysicsStageProps {
  params: PhysicsParams;
  theme: ThemePreset;
  metrics: ScrollMetrics;
  setMetrics: React.Dispatch<React.SetStateAction<ScrollMetrics>>;
  boxes: PhysicsObject[];
  setBoxes: React.Dispatch<React.SetStateAction<PhysicsObject[]>>;
}

export default function PhysicsStage({
  params,
  theme,
  metrics,
  setMetrics,
  boxes,
  setBoxes,
}: PhysicsStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number | null>(null);
  
  // High precision states for loop
  const boxesRef = useRef<PhysicsObject[]>([]);
  const paramsRef = useRef<PhysicsParams>(params);
  
  // Track continuous scroll values
  const lastScrollY = useRef(window.scrollY);
  const lastScrollTime = useRef(performance.now());
  const scrollVelocity = useRef(0);
  const scrollAccumulator = useRef(0); // for deceleration

  // Drag states
  const draggedBoxId = useRef<string | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const lastPointerPos = useRef({ x: 0, y: 0 });
  const pointerVelocity = useRef({ x: 0, y: 0 });
  const lastPointerTime = useRef(0);

  // Active FPS tracking
  const fpsTicks = useRef<number[]>([]);

  // Boundaries size
  const [stageSize, setStageSize] = useState({ width: 500, height: 460 });

  // Sync references to prevent loop closures holding outdated state
  useEffect(() => {
    boxesRef.current = boxes;
  }, [boxes]);

  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  // Handle stage bounds resizing
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateSize = () => {
      if (containerRef.current) {
        setStageSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight || 460,
        });
      }
    };

    updateSize();
    const observer = new ResizeObserver(() => updateSize());
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Track window scroll speeds
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const now = performance.now();
      const dT = now - lastScrollTime.current;

      if (dT > 0) {
        // Delta displacement
        const dY = currentY - lastScrollY.current;
        // Instant speed
        const instantV = dY / dT; // pixels per millisecond

        // Low pass filter velocity to smooth wheel clicking
        const alpha = 0.25;
        scrollVelocity.current = scrollVelocity.current * (1 - alpha) + instantV * alpha;
        
        lastScrollY.current = currentY;
        lastScrollTime.current = now;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Primary animation physics loop
  useEffect(() => {
    const tick = (now: number) => {
      // 1. Calculate FPS
      fpsTicks.current.push(now);
      while (fpsTicks.current[0] < now - 1000) {
        fpsTicks.current.shift();
      }
      const currentFps = fpsTicks.current.length;

      // 2. Slow down scroll speeds gradually when user stops scrolling
      const currentScrollSpeed = scrollVelocity.current;
      scrollVelocity.current *= 0.92; // Damping decay
      if (Math.abs(scrollVelocity.current) < 0.01) {
        scrollVelocity.current = 0;
      }

      // Read current physical configurations safely
      const { 
        gravity, 
        restitution, 
        friction, 
        collisionEnabled, 
        scrollSensitivity, 
        scrollReactionMode 
      } = paramsRef.current;

      // Update positions of the current boxes list inside ref
      const currentBoxes = [...boxesRef.current];
      const speedMagnitude = currentScrollSpeed * 10; // amplified relative speed

      // 3. Move items
      currentBoxes.forEach((box) => {
        // If this box is currently held by mouse/finger, skip standard integrations
        if (draggedBoxId.current === box.id) {
          box.vx = pointerVelocity.current.x;
          box.vy = pointerVelocity.current.y;
          return; 
        }

        // Apply external scrolling force / impulses
        let scrollFy = 0;
        let scrollFx = 0;
        let torque = 0;

        if (scrollReactionMode === 'upward_lift') {
          // scroll down lifts boxes up (like high-velocity heat rising)
          scrollFy = -Math.abs(currentScrollSpeed) * scrollSensitivity * 7.5;
        } else if (scrollReactionMode === 'downward_push') {
          // scroll down pushes boxes down
          scrollFy = currentScrollSpeed * scrollSensitivity * 7.5;
        } else if (scrollReactionMode === 'rotational_torque') {
          // scroll translates to rotational torque and random horizontal swerve
          torque = currentScrollSpeed * scrollSensitivity * 4.5;
          scrollFx = Math.sin(box.y * 0.01) * currentScrollSpeed * scrollSensitivity * 1.5;
        } else if (scrollReactionMode === 'chaotic_blast') {
          // Blast left/right based on scroll activity
          if (Math.abs(currentScrollSpeed) > 0.02) {
            const angle = Math.random() * Math.PI * 2;
            const force = Math.abs(currentScrollSpeed) * scrollSensitivity * 8;
            scrollFx = Math.cos(angle) * force;
            scrollFy = Math.sin(angle) * force - 1; // slightly lift
          }
        }

        // Apply visual gravity (helium floats upwards!)
        const isHelium = box.label === 'Helium';
        const activeGravity = isHelium ? -gravity * 0.4 : gravity;

        // Apply air friction/air drag
        box.vx *= (1 - friction);
        box.vy *= (1 - friction);
        box.angularVelocity *= 0.98;

        // Euler integration: v += a
        box.vx += scrollFx;
        box.vy += activeGravity + scrollFy;

        // Cap maximum speed to prevent glitching out of stage boundaries
        const maxSpeed = 32;
        box.vx = Math.max(-maxSpeed, Math.min(maxSpeed, box.vx));
        box.vy = Math.max(-maxSpeed, Math.min(maxSpeed, box.vy));

        // Coordinate updates: s += v
        box.x += box.vx;
        box.y += box.vy;

        // Rotate boxes
        box.rotation += box.angularVelocity + torque;

        // Collision: floor boundary
        const bounceDwell = isHelium ? paramsRef.current.restitution * 0.7 : paramsRef.current.restitution;
        const groundHeight = stageSize.height - box.height;
        if (box.y > groundHeight) {
          box.y = groundHeight;
          box.vy = -box.vy * box.bounciness * bounceDwell;
          box.vx *= 0.85; // land friction
          box.angularVelocity = -box.vx * 0.3; // rolling torque
        }

        // Collision: ceiling boundary
        if (box.y < 0) {
          box.y = 0;
          box.vy = -box.vy * box.bounciness * bounceDwell;
          box.angularVelocity += box.vx * 0.2;
        }

        // Collision: right wall
        const wallRight = stageSize.width - box.width;
        if (box.x > wallRight) {
          box.x = wallRight;
          box.vx = -box.vx * box.bounciness * restitution;
          box.angularVelocity = box.vy * 0.4;
        }

        // Collision: left wall
        if (box.x < 0) {
          box.x = 0;
          box.vx = -box.vx * box.bounciness * restitution;
          box.angularVelocity = -box.vy * 0.4;
        }
      });

      // 4. Elastic Box-To-Box Collisions (Preserving momentum)
      if (collisionEnabled && currentBoxes.length > 1) {
        for (let i = 0; i < currentBoxes.length; i++) {
          for (let j = i + 1; j < currentBoxes.length; j++) {
            const b1 = currentBoxes[i];
            const b2 = currentBoxes[j];

            // Bounding circles approximations for absolute stability
            const r1 = Math.max(b1.width, b1.height) / 2;
            const r2 = Math.max(b2.width, b2.height) / 2;
            const c1 = { x: b1.x + b1.width / 2, y: b1.y + b1.height / 2 };
            const c2 = { x: b2.x + b2.width / 2, y: b2.y + b2.height / 2 };

            const dx = c2.x - c1.x;
            const dy = c2.y - c1.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDist = r1 + r2;

            if (distance < minDist) {
              // We have overlap! Resolve overlap (push them apart equally)
              const overlap = minDist - distance;
              // Avoid divide by zero
              const nx = distance === 0 ? 1 : dx / distance;
              const ny = distance === 0 ? 0 : dy / distance;

              // Do not displace if they are being dragged
              if (draggedBoxId.current !== b1.id) {
                b1.x -= nx * overlap * 0.5;
                b1.y -= ny * overlap * 0.5;
              }
              if (draggedBoxId.current !== b2.id) {
                b2.x += nx * overlap * 0.5;
                b2.y += ny * overlap * 0.5;
              }

              // Compute relative velocity in normal components
              const kx = b1.vx - b2.vx;
              const ky = b1.vy - b2.vy;
              const vn = kx * nx + ky * ny;

              // Only bounce if they are moving towards each other
              if (vn > 0) {
                // Elastic impulse calculation
                const combinedBounciness = Math.min(b1.bounciness, b2.bounciness) * restitution;
                const totalMass = b1.mass + b2.mass;
                const impulse = (1 + combinedBounciness) * vn / totalMass;

                if (draggedBoxId.current !== b1.id) {
                  b1.vx -= nx * impulse * b2.mass;
                  b1.vy -= ny * impulse * b2.mass;
                  b1.angularVelocity -= vn * 0.05;
                }
                if (draggedBoxId.current !== b2.id) {
                  b2.vx += nx * impulse * b1.mass;
                  b2.vy += ny * impulse * b1.mass;
                  b2.angularVelocity += vn * 0.05;
                }
              }
            }
          }
        }
      }

      // 5. Update React states
      setBoxes(currentBoxes);
      setMetrics({
        currentScrollY: window.scrollY,
        scrollSpeed: currentScrollSpeed,
        scrollAcceleration: speedMagnitude,
        scrollDirection: currentScrollSpeed > 0.03 ? 'DOWN' : currentScrollSpeed < -0.03 ? 'UP' : 'NONE',
        fps: currentFps
      });

      animationFrameId.current = requestAnimationFrame(tick);
    };

    animationFrameId.current = requestAnimationFrame(tick);
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [stageSize, setBoxes, setMetrics]);

  // Handle Drag & Drop Pointer Events
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, box: PhysicsObject) => {
    // Enable pointer capture to track moves outside container bounds
    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);

    const rect = target.getBoundingClientRect();
    const pointerX = e.clientX - rect.left;
    const pointerY = e.clientY - rect.top;

    draggedBoxId.current = box.id;
    dragOffset.current = {
      x: pointerX - box.x,
      y: pointerY - box.y
    };
    lastPointerPos.current = { x: e.clientX, y: e.clientY };
    pointerVelocity.current = { x: 0, y: 0 };
    lastPointerTime.current = performance.now();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggedBoxId.current) return;
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    
    const pointerX = e.clientX - rect.left;
    const pointerY = e.clientY - rect.top;

    // Direct state matching
    const currentBoxes = [...boxesRef.current];
    const index = currentBoxes.findIndex(b => b.id === draggedBoxId.current);
    if (index !== -1) {
      const box = currentBoxes[index];
      
      // Update coordinates
      box.x = pointerX - dragOffset.current.x;
      box.y = pointerY - dragOffset.current.y;
      
      // Wall limits for drags
      box.x = Math.max(0, Math.min(stageSize.width - box.width, box.x));
      box.y = Math.max(0, Math.min(stageSize.height - box.height, box.y));

      // Velocity calculation
      const now = performance.now();
      const dT = now - lastPointerTime.current;
      if (dT > 0) {
        pointerVelocity.current = {
          x: (e.clientX - lastPointerPos.current.x) / (dT / 16.6), // Standardized to pixels per frame at 60Hz
          y: (e.clientY - lastPointerPos.current.y) / (dT / 16.6)
        };
      }

      lastPointerPos.current = { x: e.clientX, y: e.clientY };
      lastPointerTime.current = now;
      setBoxes(currentBoxes);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggedBoxId.current) return;
    const target = e.currentTarget;
    target.releasePointerCapture(e.pointerId);

    // Release box with current pointer velocity
    const currentBoxes = [...boxesRef.current];
    const index = currentBoxes.findIndex(b => b.id === draggedBoxId.current);
    if (index !== -1) {
      const box = currentBoxes[index];
      box.vx = pointerVelocity.current.x * 1.2; // slight throw acceleration
      box.vy = pointerVelocity.current.y * 1.2;
      box.angularVelocity = (Math.random() - 0.5) * 15; // fun release spin
      setBoxes(currentBoxes);
    }
    
    draggedBoxId.current = null;
  };

  // Helper theme classes for visual rendering
  const getThemeStageBg = () => {
    switch (theme) {
      case 'cyberpunk':
        return 'bg-[#050510] border-cyan-500/40 pattern-grid';
      case 'warmwood':
        return 'bg-[#1c1815] border-amber-900/40';
      case 'bubbleglass':
        return 'bg-gradient-to-br from-indigo-950/10 to-purple-950/20 backdrop-blur-md border-white/10';
      default: // neumorphic / default (Artistic Flair)
        return 'bg-[#000000] border-[#1F1F1F] pattern-grid';
    }
  };

  const getThemeStageShadow = () => {
    switch (theme) {
      case 'cyberpunk':
        return 'shadow-[0_0_25px_rgba(6,182,212,0.15)]';
      case 'warmwood':
        return 'shadow-[inset_0_2px_15px_rgba(0,0,0,0.8)]';
      case 'bubbleglass':
        return 'shadow-2xl';
      default:
        return 'shadow-inner';
    }
  };

  const getThemeBoxClasses = (box: PhysicsObject) => {
    const isHelium = box.label === 'Helium';
    switch (theme) {
      case 'cyberpunk':
        return `border ${
          isHelium 
            ? 'border-pink-500 text-pink-400 bg-pink-950/30' 
            : 'border-cyan-400 text-cyan-400 bg-cyan-950/30'
        }`;
      case 'warmwood':
        return `bg-gradient-to-b ${
          isHelium 
            ? 'from-amber-700 to-amber-900 text-amber-100 shadow-md border-amber-600/30' 
            : 'from-orange-850 to-amber-950 text-amber-200 shadow-md border-orange-900/40'
        }`;
      case 'bubbleglass':
        return `backdrop-blur-xl border border-white/20 select-none ${
          isHelium 
            ? 'bg-gradient-to-tr from-pink-500/20 to-purple-500/30 text-pink-200' 
            : 'bg-gradient-to-tr from-cyan-500/20 to-indigo-500/30 text-cyan-200'
        } shadow-[inset_0_1px_4px_rgba(255,255,255,0.4)]`;
      default: // Default Slate / Artistic Flair style
        return `${
          isHelium 
            ? 'bg-[#1C1C1C] text-[#00FF41] border-2 border-[#00FF41] hover:bg-[#2C2C2C]' 
            : 'bg-[#111111] text-[#F2F2F2] border border-[#2D2D2D] hover:border-[#00FF41]'
        }`;
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      
      {/* Sandbox metrics bar */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="bg-[#050505] border border-[#1F1F1F] p-2.5 rounded-none">
          <span className="block text-[8px] text-[#555555] uppercase font-bold tracking-wider font-mono">Metrics FPS</span>
          <span className="text-xs font-mono font-black text-[#00FF41] flex items-center justify-center gap-1.5 mt-0.5">
            <span className={`w-1.5 h-1.5 ${metrics.fps > 55 ? 'bg-[#00FF41] animate-ping' : 'bg-amber-500'}`} />
            {metrics.fps} <span className="text-[9px] text-[#555555]">fps</span>
          </span>
        </div>
        <div className="bg-[#050505] border border-[#1F1F1F] p-2.5 rounded-none">
          <span className="block text-[8px] text-[#555555] uppercase font-bold tracking-wider font-mono">Scroll Speed</span>
          <span className="text-xs font-mono font-black text-[#00FF41] truncate block mt-0.5">
            {Math.abs(metrics.scrollSpeed * 10).toFixed(1)} <span className="text-[9px] text-[#555555]">px/s</span>
          </span>
        </div>
        <div className="bg-[#050505] border border-[#1F1F1F] p-2.5 rounded-none">
          <span className="block text-[8px] text-[#555555] uppercase font-bold tracking-wider font-mono">Direction</span>
          <span className={`text-[10px] font-mono font-black block mt-1 ${metrics.scrollDirection !== 'NONE' ? 'text-[#00FF41]' : 'text-[#555555]'}`}>
            {metrics.scrollDirection === 'DOWN' ? '↓ DOWN' : metrics.scrollDirection === 'UP' ? '↑ UP' : 'IDLE'}
          </span>
        </div>
        <div className="bg-[#050505] border border-[#1F1F1F] p-2.5 rounded-none">
          <span className="block text-[8px] text-[#555555] uppercase font-bold tracking-wider font-mono">Obj Count</span>
          <span className="text-xs font-mono font-black text-[#00FF41] block mt-0.5">
            {boxes.length} <span className="text-[9px] text-[#555555]">pcs</span>
          </span>
        </div>
      </div>

      {/* Physics Canvas Sandbox container */}
      <div 
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`w-full h-[480px] rounded-sm relative overflow-hidden select-none touch-none cursor-grab active:cursor-grabbing border transition-all ${getThemeStageBg()} ${getThemeStageShadow()}`}
        id="physics-main-sandbox"
      >
        {/* Dynamic Watermark details based on theme */}
        <div className="absolute inset-x-0 top-6 text-center pointer-events-none select-none px-6">
          <span className="text-[9px] font-mono tracking-[4px] text-[#555555] block uppercase font-bold">
            Interactive Physics Sandbox Stage
          </span>
          <span className="text-[8px] font-mono text-[#444444] block mt-1">
            💻 Drag boxes to throw with momentum · Scroll mouse wheel to trigger physical vectors
          </span>
        </div>

        {/* Physics boxes rendering */}
        {boxes.map((box) => {
          // Dynamic Ground shadow calculation (Bonus Feature)
          // Shadow size and depth shrink as altitude increases, and coordinates align directly with bottom of the element
          const altitude = stageSize.height - (box.y + box.height);
          const maxShadowDistance = stageSize.height * 0.8;
          const shadowScale = Math.max(0.2, 1 - (altitude / maxShadowDistance));
          const shadowOpacity = Math.max(0, 0.6 * (1 - (altitude / maxShadowDistance)));
          
          return (
            <React.Fragment key={box.id}>
              {/* Dynamic synchronized floor projection shadow */}
              <div 
                className="absolute pointer-events-none rounded-full transition-all duration-75"
                style={{
                  left: box.x + box.width / 2 - (box.width * shadowScale) / 2,
                  bottom: 12,
                  width: box.width * shadowScale,
                  height: 10 * shadowScale,
                  backgroundColor: 'rgba(0,0,0,0.85)',
                  opacity: shadowOpacity,
                  filter: 'blur(4px)',
                  transform: `scale(${shadowScale})`,
                  zIndex: 2,
                }}
              />

              {/* Physical Object Box */}
              <div
                onPointerDown={(e) => handlePointerDown(e, box)}
                className={`absolute flex flex-col items-center justify-center select-none ${
                  box.type === 'circle' ? 'rounded-full' : 'rounded-none'
                } ${getThemeBoxClasses(box)}`}
                style={{
                  left: box.x,
                  top: box.y,
                  width: box.width,
                  height: box.height,
                  transform: `rotate(${box.rotation}deg)`,
                  zIndex: draggedBoxId.current === box.id ? 50 : 10,
                  transition: draggedBoxId.current === box.id ? 'none' : 'transform 0.04s linear',
                }}
              >
                {/* Visual labels customized based on physics */}
                <div className="flex flex-col items-center px-1">
                  <span className="text-[9px] font-mono font-bold leading-none select-none tracking-tight">
                    {box.label}
                  </span>
                  <span className="text-[8px] font-mono font-normal opacity-50 block mt-1 select-none">
                    w:{box.mass} e:{box.bounciness.toFixed(1)}
                  </span>
                </div>
              </div>
            </React.Fragment>
          );
        })}

        {/* Empty list instruction placeholder */}
        {boxes.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 p-8 text-center pointer-events-none">
            <HelpCircle size={32} className="stroke-[#222222] animate-bounce mb-3" />
            <p className="font-bold text-xs uppercase tracking-widest text-[#8C8C8C] font-mono">Stage Offline // Empty</p>
            <p className="text-[10px] text-[#555555] mt-1 max-w-xs font-mono">
              Activate "+ Iron", "+ Helium" or "+ Tennis Ball" spawners on the left panel to inject physical items.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
