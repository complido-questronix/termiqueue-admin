import '../styles/Skeleton.scss';

function TableSkeletonRows({ rows = 6, columns = 6 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="table-skeleton-row">
          {Array.from({ length: columns }).map((__, cellIndex) => (
            <td key={`${rowIndex}-${cellIndex}`}>
              <div className="table-skeleton-cell shimmer" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default TableSkeletonRows;