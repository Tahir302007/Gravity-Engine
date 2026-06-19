/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { 
  Activity, 
  HelpCircle, 
  Sparkles, 
  BookOpen, 
  Binary, 
  Code, 
  ChevronsDown,
  Info,
  Layers,
  Award
} from 'lucide-react';
import { PhysicsObject, PhysicsParams, ScrollMetrics, ThemePreset } from './types';
import ControlPanel from './components/ControlPanel';
import PhysicsStage from './components/PhysicsStage';
import MathView from './components/MathView';

// Default Physics Values
const DEFAULT_PARAMS: PhysicsParams = {
  gravity: 0.35,
  restitution: 0.8,
  friction: 0.012,
  collisionEnabled: true,
  scrollSensitivity: 2.2,
  scrollReactionMode: 'upward_lift',
};

// Initial physical items template list
const INITIAL_OBJECTS: PhysicsObject[] = [
  {
    id: 'object_iron',
    x: 40,
    y: 80,
    vx: 1.5,
    vy: 0,
    width: 68,
    height: 68,
    mass: 5.0,
    bounciness: 0.3,
    color: '#64748b',
    label: 'Iron WT',
    type: 'cube',
    rotation: 12,
    angularVelocity: 0,
    iconName: 'Shield',
  },
  {
    id: 'object_helium',
    x: 140,
    y: 320,
    vx: -1,
    vy: -2,
    width: 60,
    height: 60,
    mass: 0.8,
    bounciness: 0.65,
    color: '#ec4899',
    label: 'Helium',
    type: 'circle',
    rotation: -5,
    angularVelocity: 1,
    iconName: 'Cloud',
  },
  {
    id: 'object_tennis',
    x: 230,
    y: 120,
    vx: 2,
    vy: 0,
    width: 58,
    height: 58,
    mass: 1.5,
    bounciness: 0.9,
    color: '#10b981',
    label: 'Tennis',
    type: 'circle',
    rotation: 45,
    angularVelocity: -2,
    iconName: 'Activity',
  },
  {
    id: 'object_feather',
    x: 320,
    y: 50,
    vx: -0.5,
    vy: 0.5,
    width: 52,
    height: 52,
    mass: 0.4,
    bounciness: 0.5,
    color: '#eab308',
    label: 'Feather',
    type: 'circle',
    rotation: -30,
    angularVelocity: 0.5,
    iconName: 'Feather',
  },
];

export default function App() {
  const [params, setParams] = useState<PhysicsParams>(DEFAULT_PARAMS);
  const [theme, setTheme] = useState<ThemePreset>('neumorphic');
  const [boxes, setBoxes] = useState<PhysicsObject[]>(INITIAL_OBJECTS);
  
  // High accuracy metrics computed during animationFrame loop
  const [metrics, setMetrics] = useState<ScrollMetrics>({
    currentScrollY: 0,
    scrollSpeed: 0,
    scrollAcceleration: 0,
    scrollDirection: 'NONE',
    fps: 60
  });

  // Action: Add customized box presets
  const handleAddBox = useCallback((preset?: 'heavy' | 'light' | 'normal' | 'balloon') => {
    const id = `item_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const randomX = Math.max(20, Math.floor(Math.random() * 260));
    
    // Create configured physics parameters bases
    let newBox: PhysicsObject;
    
    if (preset === 'heavy') {
      newBox = {
        id,
        x: randomX,
        y: 40,
        vx: (Math.random() - 0.5) * 6,
        vy: 2,
        width: 72,
        height: 72,
        mass: 7.5,
        bounciness: 0.15,
        color: '#475569',
        label: 'Heavy Iron',
        type: 'cube',
        rotation: (Math.random() - 0.5) * 45,
        angularVelocity: (Math.random() - 0.5) * 5,
        iconName: 'Box',
      };
    } else if (preset === 'balloon') {
      newBox = {
        id,
        x: randomX,
        y: 380, // Spawn higher from bottom
        vx: (Math.random() - 0.5) * 4,
        vy: -4,
        width: 62,
        height: 62,
        mass: 0.7,
        bounciness: 0.7,
        color: '#f43f5e',
        label: 'Helium',
        type: 'circle',
        rotation: 0,
        angularVelocity: (Math.random() - 0.5) * 3,
        iconName: 'CloudSnow',
      };
    } else if (preset === 'light') {
      newBox = {
        id,
        x: randomX,
        y: 60,
        vx: (Math.random() - 0.5) * 10,
        vy: 0,
        width: 48,
        height: 48,
        mass: 0.3,
        bounciness: 0.45,
        color: '#fbbf24',
        label: 'Feather',
        type: 'cube',
        rotation: (Math.random() - 0.5) * 90,
        angularVelocity: (Math.random() - 0.5) * 12,
        iconName: 'Feather',
      };
    } else { // normal (tennis preset)
      newBox = {
        id,
        x: randomX,
        y: 50,
        vx: (Math.random() - 0.5) * 8,
        vy: 0,
        width: 58,
        height: 58,
        mass: 1.8,
        bounciness: 0.85,
        color: '#22c55e',
        label: 'Tennis',
        type: 'circle',
        rotation: (Math.random() - 0.5) * 60,
        angularVelocity: (Math.random() - 0.5) * 8,
        iconName: 'Dribbble',
      };
    }

    setBoxes(prev => [...prev, newBox]);
  }, []);

  // Action: Clear active boxes
  const handleClearBoxes = useCallback(() => {
    setBoxes([]);
  }, []);

  // Action: Restore baseline parameters
  const handleResetParams = useCallback(() => {
    setParams(DEFAULT_PARAMS);
    setBoxes(INITIAL_OBJECTS);
  }, []);

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#F2F2F2] flex flex-col font-sans p-6 sm:p-8 overflow-x-hidden" id="application-root">
      
      {/* Heavy high-contrast header section */}
      <header className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-[#1F1F1F] pb-6 mb-8 gap-4">
        <div className="flex flex-col text-left">
          <h1 className="text-6xl sm:text-7xl font-black tracking-tighter leading-none italic uppercase">
            Gravity<br />
            <span className="text-[#00FF41]">Engine</span>
          </h1>
          <p className="mt-4 text-[#8C8C8C] font-mono text-sm tracking-widest uppercase">
            Scroll Physics v1.0.4 // Learning & Sandboxed Prototype
          </p>
        </div>
        <div className="text-left sm:text-right flex flex-col items-start sm:items-end">
          <div className="bg-[#00FF41] text-[#0D0D0D] font-black px-4 py-1.5 mb-2 text-xs uppercase tracking-widest">
            STATUS: OPTIMIZED
          </div>
          <div className="flex items-center space-x-2 text-xs font-mono text-[#555555]">
            <span>REF: REQ_DOC_2024_A</span>
            <span className="text-[#00FF41] animate-pulse">●</span>
            <span>SYSTEM LATEST</span>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Controls & Formulas */}
        <div className="lg:col-span-4 lg:sticky lg:top-8 space-y-6 flex flex-col max-h-[calc(100vh-60px)] overflow-y-auto no-scrollbar pr-0 lg:pr-1" id="sticky-sidebar">
          <ControlPanel 
            params={params}
            setParams={setParams}
            theme={theme}
            setTheme={setTheme}
            onReset={handleResetParams}
            onAddBox={handleAddBox}
            onClearBoxes={handleClearBoxes}
          />
          <MathView 
            metrics={metrics}
            params={params}
          />
        </div>

        {/* Right Column: Interaction Physics Stage & Educational Section */}
        <div className="lg:col-span-8 space-y-8 flex flex-col">
          
          {/* Active Physics Simulator View container */}
          <div className="bg-[#111111] border border-[#1F1F1F] p-1 rounded-sm">
            <PhysicsStage 
              params={params}
              theme={theme}
              metrics={metrics}
              setMetrics={setMetrics}
              boxes={boxes}
              setBoxes={setBoxes}
            />
          </div>

          {/* Educational Documentation segment matching prototype blueprint styling */}
          <article className="border border-[#1F1F1F] bg-[#111111]/40 p-6 sm:p-8 space-y-8 text-left rounded-sm relative overflow-hidden">
            
            {/* Ambient Watermark */}
            <div className="absolute right-4 top-4 font-mono text-[9px] text-[#222] select-none tracking-widest uppercase">
              SANDBOX_LOG_01
            </div>

            <div className="border-b border-[#1F1F1F] pb-5">
              <span className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-[#00FF41] block mb-2">
                01 // OBJECTIVES
              </span>
              <h2 className="text-2xl font-black uppercase tracking-tight text-white italic">
                Scientific Scroll-Driven Kinematics
              </h2>
              <p className="text-xs text-[#8C8C8C] mt-2 leading-relaxed font-mono">
                By introducing real-time velocity-based math modules, we transform standard scroll activity into physical kinetic vectors. Scroll to influence the boxes directly and watch the gravity effects take place.
              </p>
            </div>

            {/* Structured Points */}
            <div className="space-y-6">
              
              <section className="group">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 bg-[#00FF41]"></div>
                  <h3 className="text-sm font-bold tracking-wider uppercase text-white group-hover:text-[#00FF41] transition-colors">
                    1. Scroll-Velocity Derivative sampling
                  </h3>
                </div>
                <p className="text-xs text-[#8C8C8C] mt-2 ml-5 leading-relaxed">
                  Web scroll offsets are sampled via continuous microsecond counts <code className="text-white font-mono bg-[#1F1F1F] px-1 rounded">performance.now()</code>. Sudden mouse acceleration bursts are smoothed using an exponential moving low-pass algorithm: <code className="text-[#00FF41] font-mono bg-black px-1.5 py-0.5 rounded">v' = v' * (1 - α) + v * α</code> to preserve flawless 60 FPS frame updates.
                </p>
              </section>

              <section className="group">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 bg-[#00FF41]"></div>
                  <h3 className="text-sm font-bold tracking-wider uppercase text-white group-hover:text-[#00FF41] transition-colors">
                    2. Semi-Implicit Euler numerical Integration
                  </h3>
                </div>
                <p className="text-xs text-[#8C8C8C] mt-2 ml-5 leading-relaxed">
                  Physical masses simulate gravity pull, bounciness restitution ratios, and air resistance friction curves within an instantaneous update cycle. Dynamic buoyancy limits also enable lightweight helium items to drift gracefully upwards against gravity vectors.
                </p>
              </section>

              <section className="group">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 bg-[#00FF41]"></div>
                  <h3 className="text-sm font-bold tracking-wider uppercase text-white group-hover:text-[#00FF41] transition-colors">
                    3. Dynamic Orthogonal Projection Shadows
                  </h3>
                </div>
                <p className="text-xs text-[#8C8C8C] mt-2 ml-5 leading-relaxed">
                  Human spatial perception requires precise ground coordinates. The renderer automatically maps realistic bottom shadows beneath every physical block. Shadows dynamically scale in footprint and opacity as objects fly upwards or tumble off boundaries.
                </p>
              </section>

              <section className="group">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 bg-[#00FF41]"></div>
                  <h3 className="text-sm font-bold tracking-wider uppercase text-white group-hover:text-[#00FF41] transition-colors">
                    4. Performance Optimization (rAF)
                  </h3>
                </div>
                <p className="text-xs text-[#8C8C8C] mt-2 ml-5 leading-relaxed font-mono">
                  To prevent layout thrashing and DOM paint bottlenecks, positions are kept inside React references and synchronized directly using high-performance inline CSS translation matrices.
                </p>
              </section>

            </div>

            {/* Bottom Status line */}
            <div className="pt-6 border-t border-[#1F1F1F] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#555555]">
              <span className="flex items-center gap-2 uppercase">
                <span className="w-2 h-2 bg-[#00FF41]"></span>
                GRAVITY ENGINE SYSTEM ACCREDITED
              </span>
              <span>COMPILING RUNTIME TARGETS ONLINE</span>
            </div>

          </article>

        </div>

      </main>

      {/* Footer Bar */}
      <footer className="mt-12 pt-6 border-t-2 border-[#1F1F1F] flex flex-col md:flex-row justify-between items-center gap-4 text-[#555555]">
        <div className="flex items-center gap-10 text-left">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-[#8C8C8C] font-bold">Project Phase</span>
            <span className="text-xs font-bold uppercase text-[#F2F2F2]">Prototype Alpha</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-[#8C8C8C] font-bold">Environment</span>
            <span className="text-xs font-bold uppercase text-[#F2F2F2]">Sandboxed Renderer</span>
          </div>
        </div>
        <div className="text-xs font-mono tracking-wider">
          [ SYSTEM READY // PUSH SCROLL TO INITIALIZE PHYSICS ]
        </div>
      </footer>

    </div>
  );
}
