import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import PageWrapper from '../../components/layout/PageWrapper.jsx';
import Table from '../../components/common/Table.jsx';
import SearchInput from '../../components/common/SearchInput.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import { useDebounce } from '../../hooks/useDebounce.js';
import { auditAPI } from '../../api/index.js';
import { formatDateTime } from '../../utils/formatDate.js';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  
  const debouncedSearch = useDebounce(search, 400);
  
  useEffect(() => {
    fetchLogs();
  }, [page, debouncedSearch, actionFilter]);
  
  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 50 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (actionFilter) params.action = actionFilter;
      
      const response = await auditAPI.getAll(params);
      setLogs(response.data.logs);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      toast.error('Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };
  
  const columns = [
    {
      header: 'User',
      render: (row) => (
        <div>
          <div className="font-medium text-sm">{row.performedBy?.fullName || 'System'}</div>
          <div className="text-xs text-neutral-500">{row.performedBy?.email || '-'}</div>
        </div>
      ),
    },
    {
      header: 'Action',
      render: (row) => (
        <span className="px-2 py-1 bg-primary-pale text-primary rounded text-xs font-mono">
          {row.action}
        </span>
      ),
    },
    {
      header: 'Target',
      render: (row) => (
        <div>
          <div className="text-sm">{row.targetModel}</div>
          <div className="text-xs text-neutral-500 font-mono">{row.targetId?.slice(-6) || '-'}</div>
        </div>
      ),
    },
    {
      header: 'Details',
      key: 'details',
    },
    {
      header: 'IP',
      key: 'ipAddress',
    },
    {
      header: 'Timestamp',
      render: (row) => formatDateTime(row.timestamp),
    },
  ];
  
  return (
    <PageWrapper>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Audit Logs</h1>
        <p className="text-neutral-600">System activity trail</p>
      </div>
      
      <div className="card p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by user..."
          />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="input-field"
          >
            <option value="">All Actions</option>
            <option value="USER_LOGIN">User Login</option>
            <option value="EVENT_CREATED">Event Created</option>
            <option value="EVENT_PUBLISHED">Event Published</option>
            <option value="EVENT_CANCELLED">Event Cancelled</option>
            <option value="REGISTRATION_CREATED">Registration Created</option>
            <option value="REGISTRATION_CANCELLED">Registration Cancelled</option>
          </select>
        </div>
      </div>
      
      <Table columns={columns} data={logs} loading={loading} />
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </PageWrapper>
  );
};

export default AuditLogs;
