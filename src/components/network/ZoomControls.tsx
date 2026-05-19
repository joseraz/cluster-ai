import { useReactFlow, useViewport } from '@xyflow/react';
import { Plus, Minus, Maximize2 } from 'lucide-react';

export function ZoomControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const { zoom } = useViewport();

  return (
    <div
      className="absolute bottom-6 right-6 z-10 flex flex-col items-center rounded-xl overflow-hidden shadow-lg"
      style={{ background: 'rgba(46,40,35,0.85)', border: '1px solid rgba(201,169,110,0.20)' }}
    >
      <button
        onClick={() => zoomIn({ duration: 200 })}
        className="w-10 h-10 flex items-center justify-center text-foreground hover:bg-primary/10 transition-colors"
      >
        <Plus className="w-4 h-4" />
      </button>
      <div className="w-full h-px bg-primary/20" />
      <span className="w-10 h-8 flex items-center justify-center text-foreground text-xs font-medium select-none">
        {Math.round(zoom * 100)}%
      </span>
      <div className="w-full h-px bg-primary/20" />
      <button
        onClick={() => zoomOut({ duration: 200 })}
        className="w-10 h-10 flex items-center justify-center text-foreground hover:bg-primary/10 transition-colors"
      >
        <Minus className="w-4 h-4" />
      </button>
      <div className="w-full h-px bg-primary/20" />
      <button
        onClick={() => fitView({ duration: 300, padding: 0.2 })}
        className="w-10 h-10 flex items-center justify-center text-foreground hover:bg-primary/10 transition-colors"
      >
        <Maximize2 className="w-4 h-4" />
      </button>
    </div>
  );
}
