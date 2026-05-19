import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

interface ContactNodeData {
  initials: string;
  fullName: string;
}

function ContactNode({ data }: { data: ContactNodeData }) {
  return (
    <div
      title={data.fullName}
      style={{
        width: 52,
        height: 52,
        borderRadius: '50%',
        background: 'rgba(244,237,228,0.92)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 13,
        fontWeight: 600,
        color: '#1A1816',
        cursor: 'grab',
        userSelect: 'none',
        boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
      }}
    >
      {data.initials}
      <Handle type="source" position={Position.Right} style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle type="target" position={Position.Left} style={{ opacity: 0, pointerEvents: 'none' }} />
    </div>
  );
}

export default memo(ContactNode);
