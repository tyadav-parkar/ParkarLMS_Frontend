const BASE = 'bg-gradient-to-r from-cyan-700 to-cyan-800';

export default function THead({ children, className = '', ...props }) {
  return (
    <thead className={`${BASE} ${className}`.trim()} {...props}>
      {children}
    </thead>
  );
}
