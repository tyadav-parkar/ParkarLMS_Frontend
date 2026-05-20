const BASE = 'px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-cyan-200';

export default function Th({ children, className = '', ...props }) {
  return (
    <th className={`${BASE} ${className}`.trim()} {...props}>
      {children}
    </th>
  );
}
