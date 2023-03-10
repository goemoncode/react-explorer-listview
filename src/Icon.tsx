interface TriangleProps extends React.SVGAttributes<SVGElement> {
  dir: 'up' | 'down' | 'left' | 'right';
}

export function Triangle({ dir, fill = 'currentColor', ...props }: TriangleProps) {
  return (
    <svg viewBox="0 0 8 8" fill={fill} {...props}>
      {dir === 'up' && <path d="M0 0h8l-4,4z" transform="translate(0,6) scale(1 -1)" />}
      {dir === 'down' && <path d="M0 0h8l-4,4z" transform="translate(0,2)" />}
      {dir === 'left' && <path d="M0 0v8l4,-4z" transform="translate(6,0) scale(-1 1)" />}
      {dir === 'right' && <path d="M0 0v8l4,-4z" transform="translate(2,0)" />}
    </svg>
  );
}

interface ChevronProps extends Omit<React.SVGAttributes<SVGElement>, 'xmlns'> {
  dir: 'up' | 'down';
}

export function Chevron({ dir, stroke = 'currentColor', ...props }: ChevronProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={stroke} {...props}>
      {dir === 'up' && <polyline points="6 15 12 9 18 15" />}
      {dir === 'down' && <polyline points="6 9 12 15 18 9" />}
    </svg>
  );
}
