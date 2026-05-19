import { memo } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserNodeData {
  profileImage?: string;
  name?: string;
}

type UserNodeType = Node<UserNodeData>;

function UserNode({ data }: NodeProps<UserNodeType>) {
  return (
    <div
      style={{
        width: 80,
        height: 80,
        borderRadius: '50%',
        border: '2px dashed rgba(201,169,110,0.6)',
        boxShadow: '0 0 0 12px rgba(201,169,110,0.06), 0 0 40px rgba(201,169,110,0.20)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        cursor: 'default',
      }}
    >
      <Avatar className="w-[68px] h-[68px]">
        <AvatarImage src={data.profileImage} alt={data.name ?? 'You'} />
        <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
          {data.name ? data.name.charAt(0) : 'Y'}
        </AvatarFallback>
      </Avatar>
      <Handle type="source" position={Position.Right} style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle type="target" position={Position.Left} style={{ opacity: 0, pointerEvents: 'none' }} />
    </div>
  );
}

export default memo(UserNode);
