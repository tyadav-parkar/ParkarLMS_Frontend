const BASE = 'divide-y divide-gray-100';

export default function TBody({ children, className = '', ...props }) {
  return (
    <tbody className={`${BASE} ${className}`.trim()} {...props}>
      {children}
    </tbody>
  );
}
