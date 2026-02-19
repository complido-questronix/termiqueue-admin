import '../styles/Skeleton.scss';

function SkeletonLoader({ fullPage = false }) {
  return (
    <main className={fullPage ? 'skeleton-full-page' : 'content'}>
      <div className="skeleton-container">
        <div className="skeleton-header">
          <div className="skeleton-title shimmer" />
          <div className="skeleton-subtitle shimmer" />
        </div>

        <div className="skeleton-toolbar">
          <div className="skeleton-input shimmer" />
          <div className="skeleton-button shimmer" />
        </div>

        <div className="skeleton-table">
          <div className="skeleton-table-head">
            <div className="shimmer" />
            <div className="shimmer" />
            <div className="shimmer" />
            <div className="shimmer" />
            <div className="shimmer" />
            <div className="shimmer" />
          </div>

          <div className="skeleton-table-body">
            {[...Array(6)].map((_, index) => (
              <div className="skeleton-row" key={index}>
                <div className="shimmer" />
                <div className="shimmer" />
                <div className="shimmer" />
                <div className="shimmer" />
                <div className="shimmer" />
                <div className="shimmer" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

export default SkeletonLoader;