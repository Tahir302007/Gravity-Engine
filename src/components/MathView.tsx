/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Code, BookOpen, Binary, TrendingUp, Info } from 'lucide-react';
import { ScrollMetrics, PhysicsParams } from '../types';

interface MathViewProps {
  metrics: ScrollMetrics;
  params: PhysicsParams;
}

export default function MathView({ metrics, params }: MathViewProps) {
  const [activeTab, setActiveTab] = useState<'formulas' | 'code'>('formulas');

  const scrollCode = `// 1. High Performance Scroll Velocity Tracking
const scrollY = window.scrollY;
const now = performance.now();
const deltaTime = now - lastTimeRef.current;

if (deltaTime > 0) {
  // Compute raw velocity (pixels per millisecond)
  const rawVelocity = (scrollY - lastScrollYRef.current) / deltaTime;
  
  // Apply exponential low-pass filter to smooth out mouse wheel ticks
  const alpha = 0.2; // smoothing factor
  smoothedVelocity.current = smoothedVelocity.current * (1 - alpha) + rawVelocity * alpha;
  
  // Calculate instantaneous acceleration
  const acceleration = (smoothedVelocity.current - lastVelocityRef.current) / deltaTime;
  
  lastScrollYRef.current = scrollY;
  lastTimeRef.current = now;
  lastVelocityRef.current = smoothedVelocity.current;
}`;

  const physicsCode = `// 2. Semi-Implicit Euler Integration with Boundary Collisions
boxes.forEach(box => {
  // Apply forces: Gravity (g) + External Scroll Thrust
  let scrollThrust = 0;
  if (scrollReactionMode === 'upward_lift') {
    scrollThrust = -scrollSpeed * scrollSensitivity * 0.1;
  } else if (scrollReactionMode === 'downward_push') {
    scrollThrust = Math.abs(scrollSpeed) * scrollSensitivity * 0.1;
  }

  // Update velocity: v = v + a * dt
  box.vy += (gravity + scrollThrust) - (box.vy * friction);
  box.vx += (horizontalScrollForce) - (box.vx * friction);

  // Update position: x = x + v * dt
  box.y += box.vy;
  box.x += box.vx;
  
  // Collision Check (Ground Boundary Elastic Rebound)
  const bottomBoundary = stageHeight - box.height;
  if (box.y >= bottomBoundary) {
    box.y = bottomBoundary;
    box.vy = -box.vy * box.bounciness * restitutionPreset;
  }
});`;

  return (
    <div className="bg-[#111111] border border-[#1F1F1F] rounded-sm overflow-hidden shadow-xl" id="math-view-panel">
      {/* Tab bar */}
      <div className="flex border-b border-[#1F1F1F] bg-[#0A0A0A] px-4 py-2 justify-between items-center">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('formulas')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-mono font-bold uppercase transition-colors ${
              activeTab === 'formulas'
                ? 'bg-[#00FF41] text-[#0D0D0D]'
                : 'text-[#8C8C8C] hover:text-white'
            }`}
          >
            <Binary size={13} />
            <span>Formulas / Math</span>
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-mono font-bold uppercase transition-colors ${
              activeTab === 'code'
                ? 'bg-[#00FF41] text-[#0D0D0D]'
                : 'text-[#8C8C8C] hover:text-white'
            }`}
          >
            <Code size={13} />
            <span>Code Engine</span>
          </button>
        </div>
        <div className="flex items-center space-x-1.5 text-[#555555] text-[10px] font-mono font-semibold">
          <TrendingUp size={12} className="text-[#00FF41] animate-pulse" />
          <span>REAL-TIME ANALYZER</span>
        </div>
      </div>

      {/* Pane Content */}
      <div className="p-5 max-h-[360px] overflow-y-auto custom-scrollbar text-[#F2F2F2]">
        {activeTab === 'formulas' ? (
          <div className="space-y-4">
            {/* Live Metrics Header */}
            <div className="grid grid-cols-2 gap-3 mb-2">
              <div className="bg-[#050505] p-3 rounded-none border border-[#1F1F1F]">
                <span className="block text-[9px] text-[#8C8C8C] uppercase tracking-wider font-bold font-mono">Calculated Velocity</span>
                <span className="text-md font-mono font-extrabold text-[#00FF41] block mt-0.5">
                  {metrics.scrollSpeed.toFixed(2)} <span className="text-xs text-[#555555]">px/fr</span>
                </span>
              </div>
              <div className="bg-[#050505] p-3 rounded-none border border-[#1F1F1F]">
                <span className="block text-[9px] text-[#8C8C8C] uppercase tracking-wider font-bold font-mono">Active Reaction</span>
                <span className="text-xs font-mono font-bold text-[#F2F2F2] block truncate uppercase mt-1">
                  {params.scrollReactionMode.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-white mb-2 flex items-center gap-1.5 font-mono">
                <span className="w-1.5 h-1.5 bg-[#00FF41]" />
                1. Scroll-Velocity Derivative
              </h4>
              <p className="text-xs text-[#8C8C8C] leading-relaxed mb-2">
                Discrete delta sampling over continuous frame time. Measured using milliseconds difference between high-precision timestamps ($t$):
              </p>
              <div className="bg-[#050505] p-3 rounded-none font-mono text-center text-xs text-[#00FF41] border border-[#1F1F1F] my-2">
                {"Velocity (v) = \delta y / \delta t = \frac{Y_{curr} - Y_{prev}}{t_{curr} - t_{prev}}"}
              </div>
              <p className="text-xs text-[#8C8C8C] leading-relaxed">
                To eliminate erratic jitter from mechanical mouse wheels, an exponential moving average (low-pass filter) is applied: 
                <code className="text-[#00FF41] bg-black font-mono px-1 rounded mx-1">v' = v' &times; (1 - &alpha;) + v &times; &alpha;</code>, where <code className="text-white font-mono">&alpha; = 0.20</code>.
              </p>
            </div>

            <hr className="border-[#1F1F1F]" />

            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-white mb-2 flex items-center gap-1.5 font-mono">
                <span className="w-1.5 h-1.5 bg-[#00FF41]" />
                2. Momentum Insertion & Integration
              </h4>
              <p className="text-xs text-[#8C8C8C] leading-relaxed mb-2">
                Depending on the configured **reaction mode**, virtual kinetic impulses are transferred to the boxes. Gravity ($g = {params.gravity}$ px/fr&sup2;) pulls constant downforce:
              </p>
              <div className="bg-[#050505] p-3 rounded-none font-mono text-center text-xs text-[#00FF41] border border-[#1F1F1F] my-2">
                {"v_{y}^{new} = v_{y}^{old} + (g + F_{scroll}) \cdot dt - (v_{y}^{old} \cdot \mu)"}
              </div>
              <p className="text-xs text-[#8C8C8C] leading-relaxed">
                Where <code className="text-white font-mono">&mu; = {params.friction.toFixed(3)}</code> is the friction constant. The box's final vertical positioning uses semi-implicit Euler integration:
                <code className="text-[#00FF41] bg-black font-mono px-1 rounded ml-1">y_new = y_old + v_y * dt</code>.
              </p>
            </div>

            <hr className="border-[#1F1F1F]" />

            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-white mb-2 flex items-center gap-1.5 font-mono">
                <span className="w-1.5 h-1.5 bg-[#00FF41]" />
                3. Ground Rebound Restitution
              </h4>
              <p className="text-xs text-[#8C8C8C] leading-relaxed mb-1">
                Upon meeting the bottom boundaries, kinetic energy degrades during reflection relative to restitution properties:
              </p>
              <div className="bg-[#050505] p-3 rounded-none font-mono text-center text-xs text-[#00FF41] border border-[#1F1F1F] my-1 font-semibold">
                {"v_y = -v_y \times (e_{global} \times e_{box})"}
              </div>
              <p className="text-xs text-[#8C8C8C] leading-relaxed">
                This triggers a bounce, where displacement error correction aligns coordinates to prevent box clipping.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-[#8C8C8C] font-mono">Scroll Tracking (Throttled via rAF)</span>
              </div>
              <pre className="bg-[#050505] p-3 rounded-none text-[10px] font-mono text-[#00FF41] overflow-x-auto border border-[#1F1F1F]">
                {scrollCode}
              </pre>
            </div>
            
            <hr className="border-[#1F1F1F]" />

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-[#8C8C8C] font-mono">Physics Tick & Impulse</span>
              </div>
              <pre className="bg-[#050505] p-3 rounded-none text-[10px] font-mono text-[#00FF41] overflow-x-auto border border-[#1F1F1F]">
                {physicsCode}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
