import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserNodeData {
  profileImage?: string;
  name?: string;
}

function UserNode({ data }: { data: UserNodeData }) {
  return (
    <div
      style={{
        width: 80,
        height: 80,
        borderRadius: '50%',
        border: '2px dashed rgba(255,255,255,0.7)',
        boxShadow: '0 0 0 12px rgba(255,255,255,0.04), 0 0 40px rgba(180,160,255,0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        cursor: 'default',
      }}
    >
      <Avatar className="w-[68px] h-[68px]">
        <AvatarImage src={data.profileImage} alt={data.name ?? 'You'} />
        <AvatarFallback className="bg-indigo-700 text-white text-sm font-semibold">
          {data.name ? data.name.charAt(0) : 'Y'}
        </AvatarFallback>
      </Avatar>
      <Handle type="source" position={Position.Right} style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle type="target" position={Position.Left} style={{ opacity: 0, pointerEvents: 'none' }} />
    </div>
  );
}

export default memo(UserNode);
