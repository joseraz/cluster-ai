import { useReactFlow, useViewport } from '@xyflow/react';
import { Plus, Minus, Maximize2 } from 'lucide-react';

export function ZoomControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const { zoom } = useViewport();

  return (
    <div
      className="absolute bottom-6 right-6 z-10 flex flex-col items-center rounded-xl overflow-hidden shadow-lg"
      style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}
    >
      <button
        onClick={() => zoomIn({ duration: 200 })}
        className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
      >
        <Plus className="w-4 h-4" />
      </button>
      <div className="w-full h-px bg-white/15" />
      <span className="w-10 h-8 flex items-center justify-center text-white text-xs font-medium select-none">
        {Math.round(zoom * 100)}%
      </span>
      <div className="w-full h-px bg-white/15" />
      <button
        onClick={() => zoomOut({ duration: 200 })}
        className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
      >
        <Minus className="w-4 h-4" />
      </button>
      <div className="w-full h-px bg-white/15" />
      <button
        onClick={() => fitView({ duration: 300, padding: 0.2 })}
        className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
      >
        <Maximize2 className="w-4 h-4" />
      </button>
    </div>
  );
}
