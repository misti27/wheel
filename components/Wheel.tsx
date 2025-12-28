import React, { useMemo } from 'react';
import * as d3 from 'd3-shape';
import { WheelItem } from '../types';

interface WheelProps {
  items: WheelItem[];
  rotation: number;
  isSpinning: boolean;
  onSpinClick: () => void;
  size?: number;
}

export const Wheel: React.FC<WheelProps> = ({ 
  items, 
  rotation, 
  isSpinning, 
  onSpinClick, 
  size = 360 
}) => {
  const radius = size / 2;
  
  // Create arcs
  const arcs = useMemo(() => {
    const pie = d3.pie<WheelItem>()
      .sort(null)
      .value((d) => d.weight); // USE WEIGHT HERE
      
    const arcGenerator = d3.arc<d3.PieArcDatum<WheelItem>>()
      .innerRadius(radius * 0.25) 
      .outerRadius(radius - 5);

    return pie(items).map((p) => {
      const midAngle = (p.startAngle + p.endAngle) / 2;
      return {
        ...p,
        path: arcGenerator(p) || "",
        rotation: midAngle * (180 / Math.PI)
      };
    });
  }, [items, radius]);

  const getFontSize = (label: string, weight: number) => {
    // If it's a thin slice (weight < 1), make text smaller
    if (weight < 1) return 10;
    if (label.length > 8) return 9;
    if (label.length > 5) return 11;
    return 13;
  };

  return (
    <div className="relative flex justify-center items-center group">
      {/* Pointer */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-30 drop-shadow-[0_0_15px_#B5179E]">
        <svg width="50" height="50" viewBox="0 0 40 40">
           {/* Deep Grape Neon Pointer */}
           <path d="M20 40 L5 0 L35 0 Z" fill="#B5179E" stroke="white" strokeWidth="2" />
        </svg>
      </div>

      {/* Decorative Outer Rings */}
      <div 
        className="absolute rounded-full border border-cyan-500/30"
        style={{ width: size + 20, height: size + 20 }}
      ></div>
      <div 
        className="absolute rounded-full border border-purple-500/20 animate-pulse"
        style={{ width: size + 40, height: size + 40 }}
      ></div>

      {/* The Rotating Wheel */}
      <div 
        style={{ 
          width: size, 
          height: size,
          transform: `rotate(${rotation}deg)`,
          transition: isSpinning ? 'transform 6s cubic-bezier(0.2, 0.8, 0.1, 1)' : 'none'
        }}
        className="rounded-full relative z-10"
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Gradient definitions */}
          <defs>
             <linearGradient id="sliceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
               <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
               <stop offset="100%" stopColor="rgba(0,0,0,0.2)" />
             </linearGradient>
          </defs>

          <g transform={`translate(${radius}, ${radius})`}>
            {arcs.map((slice) => (
              <g key={slice.data.id}>
                {/* Segment Slice */}
                <path 
                  d={slice.path} 
                  fill={slice.data.color}
                  stroke="#0b0d1e" // Dark borders to blend with background
                  strokeWidth="2"
                  className="opacity-90 hover:opacity-100 transition-opacity"
                />
                
                {/* Text Group */}
                <text
                  transform={`rotate(${slice.rotation}) translate(0, -${radius - 20}) rotate(-90)`}
                  textAnchor="end"
                  alignmentBaseline="middle"
                  fill={slice.data.textColor}
                  fontSize={getFontSize(slice.data.label, slice.data.weight)}
                  fontWeight="700"
                  style={{ 
                    fontFamily: 'Noto Sans SC, sans-serif',
                    textShadow: '0 1px 3px rgba(0,0,0,0.8)' // Legibility shadow
                  }}
                >
                  {slice.data.label}
                </text>
              </g>
            ))}
          </g>
          
          {/* Decorative Center Hub */}
          <circle cx={size/2} cy={size/2} r={radius * 0.2} fill="#0b0d1e" stroke="#4895EF" strokeWidth="2" />
          <circle cx={size/2} cy={size/2} r={radius * 0.05} fill="#B5179E" />
        </svg>
      </div>

      {/* Center Button */}
      <button
        onClick={onSpinClick}
        disabled={isSpinning}
        className={`absolute z-20 w-20 h-20 rounded-full flex items-center justify-center border-2 border-cyan-400
          transition-all duration-300
          ${isSpinning 
            ? 'bg-purple-900/80 cursor-default scale-90' 
            : 'bg-gradient-to-br from-[#4361EE] to-[#7209B7] hover:scale-110 hover:shadow-[0_0_20px_#4CC9F0] cursor-pointer'}
        `}
      >
        <span className="font-cyber font-black text-sm text-white tracking-widest drop-shadow-md">
          {isSpinning ? "..." : "SPIN"}
        </span>
      </button>
    </div>
  );
};