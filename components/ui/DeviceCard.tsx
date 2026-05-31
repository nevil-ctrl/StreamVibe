'use client';
import Image from 'next/image';
import { useState, useRef } from 'react';

interface DeviceCardProps {
  icon: string;
  title: string;
  description: string;
}

export function DeviceCard({ icon, title, description }: DeviceCardProps) {
  const [spotlight, setSpotlight] = useState({ x: 0, y: 0, visible: false });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    setSpotlight({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      visible: true,
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setSpotlight((s) => ({ ...s, visible: false }))}
      style={{
        ...cardStyle,
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
      }}>
      {spotlight.visible && (
        <div
          style={{
            position: 'absolute',
            left: spotlight.x,
            top: spotlight.y,
            width: '220px',
            height: '220px',
            transform: 'translate(-50%, -50%)',
            background:
              'radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)',
            pointerEvents: 'none',
            transition: 'opacity 0.15s ease',
          }}
        />
      )}

      <div style={iconWrapStyle}>
        <div style={iconBoxStyle}>
          <Image src={icon} alt={title} width={20} height={36} />
        </div>
        <span className="text-white text-xl font-semibold">{title}</span>
      </div>
      <p className="text-[#999999] text-[15px] leading-7 m-0">{description}</p>
    </div>
  );
}
const cardStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'flex-start',
  padding: '30px',
  gap: '24px',
  borderRadius: '12px',
  border: '1px solid #262626',
  background:
    'linear-gradient(222deg, rgba(229, 0, 0, 0.50) -208.03%, rgba(229, 0, 0, 0.00) 41.32%), #0F0F0F',
};

const iconWrapStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '20px',
};

const iconBoxStyle = {
  padding: '16px',
  borderRadius: '12px',
  border: '1px solid #1F1F1F',
  background: '#141414',
};
