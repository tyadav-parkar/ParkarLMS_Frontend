const BASE = 'transition-colors';

export default function Tr({ children, className = '', onClick, ...props }) {
  return (
    <tr
      className={`${BASE} ${onClick ? 'cursor-pointer' : ''} ${className}`.trim()}
      onClick={onClick}
      {...props}
    >
      {children}
    </tr>
  );
}
