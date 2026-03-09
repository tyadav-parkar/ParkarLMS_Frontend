export default function Pagination({ page, totalPages, total, label = 'items', onChange }) {
  if (totalPages <= 1) return null;

  const allPages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visiblePages = allPages.filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <div className="flex items-center justify-between px-5 py-3 border-t bg-gray-50 text-sm text-gray-600">
      <span>
        {total} {label}
      </span>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          className="px-3 py-1 rounded border hover:bg-white disabled:opacity-40"
        >
          ← Prev
        </button>

        {visiblePages.reduce((acc, p, i) => {
          if (i > 0 && p - visiblePages[i - 1] > 1) {
            acc.push(
              <span key={`ellipsis-${p}`} className="px-2">
                …
              </span>
            );
          }
          acc.push(
            <button
              key={p}
              onClick={() => onChange(p)}
              className={`px-3 py-1 rounded border ${
                p === page ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-white'
              }`}
            >
              {p}
            </button>
          );
          return acc;
        }, [])}

        <button
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
          className="px-3 py-1 rounded border hover:bg-white disabled:opacity-40"
        >
          Next →
        </button>
      </div>
    </div>
  );
}