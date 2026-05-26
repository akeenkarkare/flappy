import type { CSSProperties } from 'react';

type Props = {
  size?: number;
  color?: string;
  rotationDeg?: number;
  style?: CSSProperties;
};

export default function PlaneIcon({
  size = 22,
  color = '#1f6feb',
  rotationDeg = 0,
  style,
}: Props) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      style={{
        transform: `rotate(${rotationDeg}deg)`,
        transformOrigin: 'center',
        display: 'block',
        filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.45))',
        ...style,
      }}>
      <path
        d="M16 2 L18 14 L30 18 L30 21 L18 19 L17 27 L21 29 L21 30.5 L16 29.5 L11 30.5 L11 29 L15 27 L14 19 L2 21 L2 18 L14 14 Z"
        fill={color}
        stroke="rgba(0,0,0,0.35)"
        strokeWidth="0.5"
      />
    </svg>
  );
}
