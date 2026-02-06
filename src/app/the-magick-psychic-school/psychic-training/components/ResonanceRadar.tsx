import React from 'react';
import { Sparkles } from 'lucide-react';

export type RadarCategory = {
  id: string;
  label: string;
  color: string;
  value?: number; // 0-100 or 0-1
  hits?: number;
  total?: number;
};

type ResonanceRadarProps = {
  categories: RadarCategory[];
  size?: number;
  title?: string;
};

export default function ResonanceRadar({ categories, size = 240, title = "Soul Resonance" }: ResonanceRadarProps) {
    const center = size / 2;
    const radius = (size / 2) - 40; // Padding for labels
    
    // Calculate points
    const points = categories.map((cat, i) => {
        const angle = (Math.PI * 2 * i) / categories.length - Math.PI / 2;
        let percentage = 0;
        
        if (cat.value !== undefined) {
            percentage = cat.value > 1 ? cat.value / 100 : cat.value;
        } else if (cat.total && cat.total > 0) {
            percentage = cat.hits! / cat.total;
        }
        
        const dist = radius * percentage; 
        return [
            center + dist * Math.cos(angle),
            center + dist * Math.sin(angle)
        ];
    });

    const pathData = points.length > 0 
        ? points.map((p, i) => (i === 0 ? 'M' : 'L') + p[0] + ',' + p[1]).join(' ') + 'Z'
        : '';

    if (categories.length < 3) return null; // Radar needs at least 3 points to look good

    return (
        <div className="flex flex-col items-center justify-center py-4 relative">
             <h4 className="text-amber-200 font-serif text-lg flex items-center gap-2 mb-2 uppercase tracking-widest">
                <Sparkles size={16}/> {title}
            </h4>
            
            <svg width={size} height={size} className="overflow-visible">
                {/* Grid Rings */}
                {[0.25, 0.5, 0.75, 1].map((scale, k) => (
                    <polygon 
                        key={k}
                        points={categories.map((_, i) => {
                            const angle = (Math.PI * 2 * i) / categories.length - Math.PI / 2;
                            const r = radius * scale;
                            return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
                        }).join(' ')}
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="1"
                    />
                ))}
                
                {/* Axes */}
                {categories.map((_, i) => {
                    const angle = (Math.PI * 2 * i) / categories.length - Math.PI / 2;
                    return (
                        <line 
                            key={i}
                            x1={center} y1={center}
                            x2={center + radius * Math.cos(angle)}
                            y2={center + radius * Math.sin(angle)}
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="1"
                        />
                    );
                })}

                {/* Data Shape */}
                <path d={pathData} fill="rgba(236, 72, 153, 0.2)" stroke="#ec4899" strokeWidth="2" filter="drop-shadow(0 0 4px rgba(236, 72, 153, 0.5))" />
                
                {/* Labels */}
                {categories.map((cat, i) => {
                    const angle = (Math.PI * 2 * i) / categories.length - Math.PI / 2;
                    const labelRadius = radius + 20;
                    const x = center + labelRadius * Math.cos(angle);
                    const y = center + labelRadius * Math.sin(angle);
                    
                    // Simple alignment adjustment based on position
                    const anchor = Math.abs(x - center) < 5 ? 'middle' : x > center ? 'start' : 'end';
                    
                    return (
                        <g key={cat.id}>
                            <text 
                                x={x} y={y} 
                                textAnchor={anchor} 
                                dominantBaseline="middle" 
                                fill={cat.value && cat.value > 0 ? cat.color : "#64748b"}
                                fontSize="10"
                                fontWeight="bold"
                                className="uppercase font-mono"
                            >
                                {cat.label}
                            </text>
                             {/* Optional Value Label */}
                             <text 
                                x={x} y={y + 12} 
                                textAnchor={anchor} 
                                dominantBaseline="middle" 
                                fill="white"
                                fontSize="10"
                                className="font-mono"
                            >
                                {cat.value !== undefined ? `${Math.round(cat.value > 1 ? cat.value : cat.value*100)}%` : ''}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}
