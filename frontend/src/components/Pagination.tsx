interface PaginationProps {
  page: number;
  pages: number;
  total: number;
  onPageChange: (p: number) => void;
}

export default function Pagination({ page, pages, total, onPageChange }: PaginationProps) {
  if (pages <= 1) return null;

  const range = Array.from({ length: pages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === pages || Math.abs(p - page) <= 2
  );

  return (
    <div className="pagination" role="navigation" aria-label="Page navigation">
      <button
        className="pagination__btn"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
      >
        ‹
      </button>

      {range.map((p, idx) => {
        const prev = range[idx - 1];
        return (
          <>
            {prev && p - prev > 1 && (
              <span key={`ellipsis-${p}`} style={{ color: 'var(--color-text-dim)', padding: '0 0.25rem' }}>
                …
              </span>
            )}
            <button
              key={p}
              className={`pagination__btn ${p === page ? 'active' : ''}`}
              onClick={() => onPageChange(p)}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </button>
          </>
        );
      })}

      <button
        className="pagination__btn"
        onClick={() => onPageChange(page + 1)}
        disabled={page === pages}
        aria-label="Next page"
      >
        ›
      </button>
    </div>
  );
}
