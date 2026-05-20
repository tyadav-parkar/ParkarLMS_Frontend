const BASE = 'px-5 py-3.5 text-sm text-gray-700';

export default function Td({ children, className = '', ...props }) {
  return (
    <td className={`${BASE} ${className}`.trim()} {...props}>
      {children}
    </td>
  );
}
