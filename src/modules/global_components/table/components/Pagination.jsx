import { ChevronLeft, ChevronRight } from 'lucide-react';


export default function Pagination({ page, totalPages, total, onChange, pageSizeSelector }) {
  if (totalPages <= 1) return null;

  const pages = buildPageList(page, totalPages);

  const navBtn = [
    'flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all text-gray-500',
    'hover:bg-cyan-50 hover:text-cyan-800 border border-transparent hover:border-cyan-200',
    'disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-transparent',
  ].join(' ');

  return (
    <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-white">

      <div className="flex items-center gap-3 text-xs text-gray-400">
        {pageSizeSelector}
        {total != null && (
          <span>{total} item{total !== 1 ? 's' : ''}</span>
        )}
      </div>

      <div className="flex items-center gap-0.5">
        <button onClick={() => onChange(page - 1)} disabled={page === 1} className={navBtn}>
          <ChevronLeft className="w-3.5 h-3.5" /> Prev
        </button>

        {pages.map((p, i) =>
          p === '...'
            ? <span key={`e${i}`} className="px-2 text-xs text-gray-300 select-none">···</span>
            : <button
                key={p}
                onClick={() => onChange(p)}
                className={`min-w-[32px] h-8 rounded-lg text-xs font-semibold transition-all ${
                  p === page
                    ? 'bg-gradient-to-br from-cyan-700 to-cyan-800 text-white shadow-sm shadow-cyan-900/20'
                    : 'text-gray-500 hover:bg-cyan-50 hover:text-cyan-800'
                }`}
              >
                {p}
              </button>
        )}

        <button onClick={() => onChange(page + 1)} disabled={page === totalPages} className={navBtn}>
          Next <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
}

function buildPageList(page, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages = [1];
  if (page > 3) pages.push('...');
  for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
    pages.push(i);
  }
  if (page < totalPages - 2) pages.push('...');
  pages.push(totalPages);
  return pages;
}
