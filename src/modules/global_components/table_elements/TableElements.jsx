const BASE = 'w-full text-sm';

export default function TableElements({ children, className = '', ...props }) {
  return (
    <table className={`${BASE} ${className}`.trim()} {...props}>
      {children}
    </table>
  );
}

export { default as THead } from './THead';
export { default as TBody } from './TBody';
export { default as Tr } from './Tr';
export { default as Th } from './Th';
export { default as Td } from './Td';
