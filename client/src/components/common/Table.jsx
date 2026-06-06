const Table = ({ columns, data, loading, emptyMessage = 'No data available', onRowClick }) => {
  if (loading) {
    return (
      <div className="card p-8 text-center text-neutral-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2">Loading...</p>
      </div>
    );
  }
  
  if (!data || data.length === 0) {
    return (
      <div className="card p-8 text-center text-neutral-500">
        {emptyMessage}
      </div>
    );
  }
  
  return (
    <div className="card overflow-x-auto">
      <table className="w-full">
        <thead className="bg-primary-pale border-b border-neutral-200">
          <tr>
            {columns.map((col, idx) => (
              <th 
                key={idx}
                className={`px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-neutral-200">
          {data.map((row, rowIdx) => (
            <tr 
              key={rowIdx}
              onClick={() => onRowClick && onRowClick(row)}
              className={onRowClick ? 'cursor-pointer hover:bg-neutral-50' : ''}
            >
              {columns.map((col, colIdx) => (
                <td key={colIdx} className={`px-4 py-3 text-sm text-neutral-700 ${col.cellClassName || ''}`}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
