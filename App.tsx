import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Wheel } from './components/Wheel';
import { Fireworks } from './components/Fireworks';
import { BouncingText } from './components/BouncingText';
import { generateWheelItems, DEFAULT_FUN_ACTIVITIES } from './constants';
import { WheelItem, UserMode } from './types';

export default function App() {
  const [mode, setMode] = useState<UserMode>('student');
  const [funInput, setFunInput] = useState(DEFAULT_FUN_ACTIVITIES.join('\n'));
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<WheelItem | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  
  const wheelItems = useMemo(() => {
    const funList = funInput.split('\n').filter(line => line.trim() !== '');
    return generateWheelItems(mode, funList);
  }, [mode, funInput]);

  const handleSpin = useCallback(() => {
    if (isSpinning) return;

    setIsSpinning(true);
    setResult(null);

    // --- STEALTH RIGGED LOGIC ---
    // Target is strictly index 0 or 10
    const targetIndex = Math.random() > 0.5 ? 0 : 10;
    
    // Calculate total weight
    const totalWeight = wheelItems.reduce((acc, item) => acc + item.weight, 0);
    
    // Calculate start angle and width for the target slice based on weights
    let angleAccumulator = 0;
    for (let i = 0; i < targetIndex; i++) {
      angleAccumulator += wheelItems[i].weight;
    }
    
    const targetStartDeg = (angleAccumulator / totalWeight) * 360;
    const targetWidthDeg = (wheelItems[targetIndex].weight / totalWeight) * 360;
    
    // The center of the target slice is where we want to land
    const targetCenterDeg = targetStartDeg + (targetWidthDeg / 2);
    
    // Calculate required rotation:
    // To bring `targetCenterDeg` to the top (0 degrees), we must rotate backwards by `targetCenterDeg`.
    // Or rotation = 360 - targetCenterDeg.
    const targetPositionAngle = (360 - targetCenterDeg);
    
    // Spins
    const currentRot = rotation;
    const extraSpins = 360 * (8 + Math.floor(Math.random() * 4)); // Fast spins
    const baseRotation = Math.ceil(currentRot / 360) * 360; 
    
    // Add micro jitter to land slightly off-center within the thin slice for realism
    // Only +/- 10% of the slice width to ensure we stay inside
    const jitter = (Math.random() * targetWidthDeg * 0.2) - (targetWidthDeg * 0.1);

    const finalRotation = baseRotation + extraSpins + targetPositionAngle + jitter;

    setRotation(finalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      const landedItem = wheelItems[targetIndex];
      setResult(landedItem);
      setHistory(prev => [landedItem.label, ...prev].slice(0, 8));
    }, 6000); // 6s spin

  }, [isSpinning, rotation, wheelItems]);

  return (
    <div className="h-screen w-full flex flex-col md:flex-row overflow-hidden relative">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none z-0">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[100px]"></div>
         <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[100px]"></div>
      </div>

      {/* --- LEFT PANEL: CONTROL DECK --- */}
      <div className="w-full md:w-1/3 p-6 flex flex-col border-b md:border-b-0 md:border-r border-cyan-500/20 bg-[#0b0d1e]/90 backdrop-blur-md z-20 overflow-y-auto neon-box">
        
        <div className="mb-8">
          <div className="inline-block px-2 py-1 bg-gradient-to-r from-[#B5179E] to-purple-600 skew-x-[-10deg] mb-2">
             <span className="text-xs font-bold text-white skew-x-[10deg] block">BETA V2.0</span>
          </div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#4895EF] to-[#B5179E] font-cyber leading-tight">
            SYNTH<br/>DECIDER
          </h1>
          <p className="text-xs text-blue-300 mt-2 font-mono opacity-70">
            INTELLIGENCE MADE VISIBLE
          </p>
        </div>

        {/* Identity Protocol Switch */}
        <div className="mb-8 p-4 border border-cyan-500/30 rounded-lg bg-[#14162e]">
          <label className="text-[10px] text-cyan-400 font-bold mb-3 block tracking-[0.2em] uppercase">Operating Mode</label>
          <div className="flex gap-2">
            <button
              onClick={() => setMode('student')}
              className={`flex-1 py-2 text-xs font-bold font-cyber border rounded transition-all duration-300 ${
                mode === 'student' 
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(76,201,240,0.3)]' 
                  : 'bg-transparent border-gray-700 text-gray-500 hover:border-gray-500'
              }`}
            >
              STUDENT
            </button>
            <button
              onClick={() => setMode('worker')}
              className={`flex-1 py-2 text-xs font-bold font-cyber border rounded transition-all duration-300 ${
                mode === 'worker' 
                  ? 'bg-[#B5179E]/20 border-[#B5179E] text-[#e879f9] shadow-[0_0_10px_rgba(181,23,158,0.3)]' 
                  : 'bg-transparent border-gray-700 text-gray-500 hover:border-gray-500'
              }`}
            >
              WORKER
            </button>
          </div>
        </div>

        {/* Custom Options Input */}
        <div className="flex-1 flex flex-col min-h-[150px] mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="text-[10px] text-[#e879f9] font-bold tracking-[0.2em] uppercase">Entertainment Data</label>
          </div>
          <textarea
            value={funInput}
            onChange={(e) => setFunInput(e.target.value)}
            className="flex-1 bg-[#0f1125] text-blue-200 text-xs p-4 font-mono border border-blue-900/50 rounded focus:border-cyan-500 focus:outline-none focus:shadow-[0_0_10px_rgba(76,201,240,0.2)] resize-none leading-relaxed transition-all"
            placeholder="List activities..."
          />
        </div>

        {/* Stats / History */}
        <div className="mt-auto pt-4 border-t border-gray-800">
           <div className="flex justify-between items-end">
              <div>
                <span className="text-[10px] text-gray-500 block uppercase tracking-wider">Session</span>
                <span className="text-xl font-cyber text-white">
                   {history.length > 0 ? history[0] : '--'}
                </span>
              </div>
              <div className="text-right">
                 <span className="text-[10px] text-green-400 bg-green-900/20 px-2 py-0.5 rounded border border-green-800">
                   SYSTEM ACTIVE
                 </span>
              </div>
           </div>
        </div>
      </div>

      {/* --- RIGHT PANEL: VISUALIZATION --- */}
      <div className="relative flex-1 flex flex-col items-center justify-center p-4 overflow-hidden">
        
        {/* Render Effects only when result is shown */}
        {result && !isSpinning && (
          <>
            <Fireworks />
            <BouncingText />
          </>
        )}

        <div className="relative z-10">
           <Wheel 
             items={wheelItems} 
             rotation={rotation} 
             isSpinning={isSpinning} 
             onSpinClick={handleSpin}
             size={Math.min(window.innerWidth - 64, 500)}
           />
        </div>

        {/* Result Overlay */}
        {result && !isSpinning && (
           <div className="absolute z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80">
              <div className="bg-[#0b0d1e]/90 backdrop-blur-xl border-2 border-[#B5179E] shadow-[0_0_50px_rgba(181,23,158,0.4)] p-8 text-center rounded-xl animate-bounce-in">
                
                {/* Simplified Modal Content to let the Bouncing Text shine */}
                <span className="block text-[#4cc9f0] text-[10px] tracking-[0.3em] mb-4 font-bold uppercase">
                  OPTIMAL PATH SELECTED
                </span>
                
                <h2 className="text-5xl font-black text-white font-mono mb-6 text-glow">
                  {result.label}
                </h2>
                
                <div className="w-full h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent mb-6 opacity-50"></div>
                
                <button 
                  onClick={() => setResult(null)}
                  className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-sm font-bold rounded shadow-lg uppercase tracking-wider transition-all hover:scale-105 active:scale-95"
                >
                  Accept Fate
                </button>
              </div>
           </div>
        )}
      </div>
    </div>
  );
}
