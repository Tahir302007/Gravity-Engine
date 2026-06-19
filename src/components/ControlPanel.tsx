/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Sliders, 
  Zap, 
  RotateCcw, 
  Sparkles, 
  Plus, 
  Settings2, 
  Radio, 
  Shuffle, 
  Compass, 
  Activity,
  Layers
} from 'lucide-react';
import { PhysicsParams, ThemePreset } from '../types';

interface ControlPanelProps {
  params: PhysicsParams;
  setParams: React.Dispatch<React.SetStateAction<PhysicsParams>>;
  theme: ThemePreset;
  setTheme: (t: ThemePreset) => void;
  onReset: () => void;
  onAddBox: (preset?: 'heavy' | 'light' | 'normal' | 'balloon') => void;
  onClearBoxes: () => void;
}

export default function ControlPanel({
  params,
  setParams,
  theme,
  setTheme,
  onReset,
  onAddBox,
  onClearBoxes,
}: ControlPanelProps) {
  
  const handleSliderChange = (key: keyof PhysicsParams, val: number) => {
    setParams(prev => ({
      ...prev,
      [key]: val
    }));
  };

  const handleToggle = (key: keyof PhysicsParams) => {
    setParams(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Define Physics Presets
  const applyPreset = (presetName: string) => {
    switch (presetName) {
      case 'space':
        setParams({
          gravity: 0.05,
          restitution: 0.9,
          friction: 0.005,
          collisionEnabled: true,
          scrollSensitivity: 2.5,
          scrollReactionMode: 'chaotic_blast'
        });
        break;
      case 'heavy':
        setParams({
          gravity: 0.8,
          restitution: 0.2,
          friction: 0.03,
          collisionEnabled: true,
          scrollSensitivity: 0.8,
          scrollReactionMode: 'downward_push'
        });
        break;
      case 'trampoline':
        setParams({
          gravity: 0.35,
          restitution: 0.95,
          friction: 0.008,
          collisionEnabled: true,
          scrollSensitivity: 1.8,
          scrollReactionMode: 'upward_lift'
        });
        break;
      case 'feather':
        setParams({
          gravity: 0.08,
          restitution: 0.4,
          friction: 0.04,
          collisionEnabled: false,
          scrollSensitivity: 3.5,
          scrollReactionMode: 'upward_lift'
        });
        break;
    }
  };

  return (
    <div className="bg-[#111111] border border-[#1F1F1F] rounded-sm p-6 shadow-xl space-y-6 text-[#F2F2F2]" id="controls-panel">
      
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-[#1F1F1F] pb-4">
        <div className="flex items-center space-x-2">
          <Settings2 className="text-[#00FF41]" size={18} />
          <h2 className="font-mono font-black uppercase tracking-widest text-[#F2F2F2] text-sm">Simulation Desk</h2>
        </div>
        <button 
          onClick={onReset}
          className="p-1.5 bg-[#1C1C1C] hover:bg-[#2C2C2C] text-[#8C8C8C] hover:text-white rounded-none transition-colors border border-[#2D2D2D]"
          title="Restore standard values"
        >
          <RotateCcw size={13} />
        </button>
      </div>

      {/* Spawners */}
      <div className="space-y-3">
        <span className="block text-[10px] font-mono font-bold text-[#8C8C8C] uppercase tracking-wider">Dynamic Item Spawners</span>
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => onAddBox('heavy')}
            className="flex items-center justify-center space-x-1.5 py-2 px-3 text-xs font-mono font-bold uppercase rounded-none bg-[#1C1C1C] hover:bg-[#00FF41] hover:text-[#0D0D0D] border border-[#2D2D2D] hover:border-[#00FF41] transition-all"
          >
            <Plus size={13} />
            <span>+ Iron</span>
          </button>
          <button 
            onClick={() => onAddBox('balloon')}
            className="flex items-center justify-center space-x-1.5 py-2 px-3 text-xs font-mono font-bold uppercase rounded-none bg-[#1C1C1C] hover:bg-[#00FF41] hover:text-[#0D0D0D] border border-[#2D2D2D] hover:border-[#00FF41] transition-all"
          >
            <Plus size={13} />
            <span>+ Helium</span>
          </button>
          <button 
            onClick={() => onAddBox('normal')}
            className="flex items-center justify-center space-x-1.5 py-2 px-3 text-xs font-mono font-bold uppercase rounded-none bg-[#1C1C1C] hover:bg-[#00FF41] hover:text-[#0D0D0D] border border-[#2D2D2D] hover:border-[#00FF41] transition-all"
          >
            <Plus size={13} />
            <span>+ Tennis Ball</span>
          </button>
          <button 
            onClick={onClearBoxes}
            className="flex items-center justify-center space-x-1.5 py-2 px-3 text-xs font-mono font-bold uppercase rounded-none bg-red-950/20 text-red-500 hover:bg-red-950/40 border border-red-900/30 hover:border-red-900/50 transition-all"
          >
            <span>Reset stage</span>
          </button>
        </div>
      </div>

      {/* Presets segment */}
      <div className="space-y-3">
        <span className="block text-[10px] font-mono font-bold text-[#8C8C8C] uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles size={12} className="text-[#00FF41]" />
          Environment Presets
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => applyPreset('space')}
            className="p-2 text-xs font-mono rounded-none border border-[#1F1F1F] bg-[#0A0A0A] hover:bg-[#1C1C1C] text-[#F2F2F2] text-left transition-all"
          >
            <span className="block font-bold text-[#00FF41] text-[10px]">🌌 Galactic Void</span>
            <span className="text-[9px] text-[#555555]">g=0.05, zero-drag</span>
          </button>
          <button 
            onClick={() => applyPreset('heavy')}
            className="p-2 text-xs font-mono rounded-none border border-[#1F1F1F] bg-[#0A0A0A] hover:bg-[#1C1C1C] text-[#F2F2F2] text-left transition-all"
          >
            <span className="block font-bold text-[#00FF41] text-[10px]">🧱 Heavy Metal</span>
            <span className="text-[9px] text-[#555555]">g=0.80, low rebound</span>
          </button>
          <button 
            onClick={() => applyPreset('trampoline')}
            className="p-2 text-xs font-mono rounded-none border border-[#1F1F1F] bg-[#0A0A0A] hover:bg-[#1C1C1C] text-[#F2F2F2] text-left transition-all"
          >
            <span className="block font-bold text-[#00FF41] text-[10px]">🦘 High Trampoline</span>
            <span className="text-[9px] text-[#555555]">g=0.35, elastic</span>
          </button>
          <button 
            onClick={() => applyPreset('feather')}
            className="p-2 text-xs font-mono rounded-none border border-[#1F1F1F] bg-[#0A0A0A] hover:bg-[#1C1C1C] text-[#F2F2F2] text-left transition-all"
          >
            <span className="block font-bold text-[#00FF41] text-[10px]">🪶 Air Currents</span>
            <span className="text-[9px] text-[#555555]">g=0.08, drag force</span>
          </button>
        </div>
      </div>

      {/* Sliders parameters */}
      <div className="space-y-4">
        <span className="block text-[10px] font-mono font-bold text-[#8C8C8C] uppercase tracking-wider flex items-center gap-1.5">
          <Sliders size={12} className="text-[#00FF41]" />
          Physical Configuration
        </span>

        {/* Gravity ($g$) */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <label className="text-[#F2F2F2] font-semibold font-mono text-[11px]">Gravity Acceleration (g)</label>
            <span className="font-mono text-[#00FF41] bg-[#1C1C1C] border border-[#2D2D2D] px-2 py-0.5 rounded-none text-[10px] font-bold">
              {params.gravity.toFixed(2)} px/f²
            </span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="1.5" 
            step="0.01" 
            value={params.gravity}
            onChange={(e) => handleSliderChange('gravity', parseFloat(e.target.value))}
            className="w-full accent-[#00FF41] bg-black h-1 rounded-none cursor-pointer"
          />
        </div>

        {/* Restitution ($e$) */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <label className="text-[#F2F2F2] font-semibold font-mono text-[11px]">Restitution (e)</label>
            <span className="font-mono text-[#00FF41] bg-[#1C1C1C] border border-[#2D2D2D] px-2 py-0.5 rounded-none text-[10px] font-bold">
              {(params.restitution * 100).toFixed(0)}% rebound
            </span>
          </div>
          <input 
            type="range" 
            min="0.1" 
            max="1.0" 
            step="0.02" 
            value={params.restitution}
            onChange={(e) => handleSliderChange('restitution', parseFloat(e.target.value))}
            className="w-full accent-[#00FF41] bg-black h-1 rounded-none cursor-pointer"
          />
        </div>

        {/* Air Resistance (friction) */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <label className="text-[#F2F2F2] font-semibold font-mono text-[11px]">Air Resistance (Friction)</label>
            <span className="font-mono text-[#00FF41] bg-[#1C1C1C] border border-[#2D2D2D] px-2 py-0.5 rounded-none text-[10px] font-bold">
              {(params.friction * 100).toFixed(1)}% drag
            </span>
          </div>
          <input 
            type="range" 
            min="0.001" 
            max="0.06" 
            step="0.001" 
            value={params.friction}
            onChange={(e) => handleSliderChange('friction', parseFloat(e.target.value))}
            className="w-full accent-[#00FF41] bg-black h-1 rounded-none cursor-pointer"
          />
        </div>

        {/* Scroll sensitivity multiplier */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <label className="text-[#F2F2F2] font-semibold font-mono text-[11px]">Scroll Force Multiplier</label>
            <span className="font-mono text-[#00FF41] bg-[#1C1C1C] border border-[#2D2D2D] px-2 py-0.5 rounded-none text-[10px] font-bold">
              &times; {params.scrollSensitivity.toFixed(1)}
            </span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="5" 
            step="0.1" 
            value={params.scrollSensitivity}
            onChange={(e) => handleSliderChange('scrollSensitivity', parseFloat(e.target.value))}
            className="w-full accent-[#00FF41] bg-black h-1 rounded-none cursor-pointer"
          />
        </div>
      </div>

      {/* Event Scroll Interactions modes */}
      <div className="space-y-3">
        <span className="block text-[10px] font-mono font-bold text-[#8C8C8C] uppercase tracking-wider flex items-center gap-1.5">
          <Zap size={12} className="text-[#00FF41]" />
          Scroll Reaction Modes
        </span>
        <div className="space-y-2">
          {[
            { id: 'upward_lift', title: '🍃 Updraft Upward Lift', desc: 'Scrolling injects upward winds' },
            { id: 'downward_push', title: '⛈️ Downward Impact Push', desc: 'Forces boxes down on rapid scrolls' },
            { id: 'rotational_torque', title: '🌀 Angular Spin Torque', desc: 'Transforms delta speed into clockwise spin' },
            { id: 'chaotic_blast', title: '💥 Radial Chaotic Explosion', desc: 'Blasts objects outwards dynamically' }
          ].map(opt => (
            <label 
              key={opt.id}
              className={`flex items-start space-x-3 p-2.5 rounded-none border text-left cursor-pointer transition-all ${
                params.scrollReactionMode === opt.id
                  ? 'bg-[#1C1C1C] border-[#00FF41] text-white'
                  : 'bg-[#0A0A0A] border-[#1F1F1F] hover:bg-[#111111] text-[#8C8C8C] hover:text-white'
              }`}
            >
              <input 
                type="radio" 
                name="reactionMode"
                checked={params.scrollReactionMode === opt.id}
                onChange={() => setParams(p => ({ ...p, scrollReactionMode: opt.id as any }))}
                className="sr-only"
              />
              <div className="space-y-0.5 select-none">
                <span className="text-xs font-bold block uppercase font-mono tracking-wide">{opt.title}</span>
                <span className="text-[10px] text-[#555555] block leading-tight">{opt.desc}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Feature toggles */}
      <div className="space-y-2.5 pt-4 border-t border-[#1F1F1F]">
        <label className="flex items-center justify-between cursor-pointer group">
          <div className="flex flex-col text-left select-none">
            <span className="text-xs font-bold font-mono uppercase text-[#F2F2F2] group-hover:text-white transition-colors">Elastic Collisions</span>
            <span className="text-[10px] text-[#555555]">Allow balls & cubes to bounce off each other</span>
          </div>
          <div className="relative">
            <input 
              type="checkbox" 
              checked={params.collisionEnabled}
              onChange={() => handleToggle('collisionEnabled')}
              className="sr-only"
            />
            <div className={`w-9 h-5 rounded-none transition-colors border ${params.collisionEnabled ? 'bg-[#00FF41] border-[#00FF41]' : 'bg-black border-[#1F1F1F]'}`}>
              <div className={`absolute top-[3px] left-[3px] bg-[#0D0D0D] w-3.5 h-3.5 rounded-none transition-transform ${params.collisionEnabled ? 'translate-x-4 bg-black font-black' : 'bg-[#555555]'}`} />
            </div>
          </div>
        </label>
      </div>

      {/* Theme Presets */}
      <div className="space-y-3 pt-4 border-t border-[#1F1F1F]">
        <span className="block text-[10px] font-mono font-bold text-[#8C8C8C] uppercase tracking-wider flex items-center gap-1.5">
          <Layers size={12} className="text-[#00FF41]" />
          Skin / Aesthetic Theme
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { id: 'neumorphic', name: '🕶️ Slate Dark' },
            { id: 'cyberpunk', name: '🌌 Neon Wire' },
            { id: 'warmwood', name: '🪵 Warm Wood' },
            { id: 'bubbleglass', name: '🔮 Opal Glass' }
          ].map(themeOpt => (
            <button
              key={themeOpt.id}
              onClick={() => setTheme(themeOpt.id as ThemePreset)}
              className={`py-1.5 px-2 text-left text-xs font-mono font-bold rounded-none border transition-colors ${
                theme === themeOpt.id
                  ? 'bg-[#00FF41] text-[#0D0D0D] border-[#00FF41]'
                  : 'bg-[#0A0A0A] hover:bg-[#1C1C1C] border-[#1F1F1F] text-[#8C8C8C]'
              }`}
            >
              {themeOpt.name}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
