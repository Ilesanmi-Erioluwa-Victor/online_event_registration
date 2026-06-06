import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import PageWrapper from '../../components/layout/PageWrapper.jsx';
import Table from '../../components/common/Table.jsx';
import Badge from '../../components/common/Badge.jsx';
import SearchInput from '../../components/common/SearchInput.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import { useDebounce } from '../../hooks/useDebounce.js';
import { registrationsAPI } from '../../api/index.js';
import { formatDate } from '../../utils/formatDate.js';

const AllRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [attendanceFilter, setAttendanceFilter] = useState('');
  
  const debouncedSearch = useDebounce(search, 400);
  
  useEffect(() => {
    fetchRegistrations();
  }, [page, debouncedSearch, statusFilter, attendanceFilter]);
  
  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 20 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter) params.status = statusFilter;
      if (attendanceFilter) params.attendance = attendanceFilter;
      
      const response = await registrationsAPI.getAll(params);
      setRegistrations(response.data.registrations);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      toast.error('Failed to fetch registrations');
    } finally {
      setLoading(false);
    }
  };
  
  const columns = [
    {
      header: 'Reg Code',
      render: (row) => <span className="font-mono text-xs">{row.registrationCode}</span>,
    },
    {
      header: 'Participant',
      render: (row) => (
        <div>
          <div className="font-medium">{row.fullName}</div>
          <div className="text-xs text-neutral-500">{row.email}</div>
        </div>
      ),
    },
    {
      header: 'Event',
      render: (row) => row.event?.title || '-',
    },
    {
      header: 'Date',
      render: (row) => formatDate(row.registrationDate),
    },
    {
      header: 'Status',
      render: (row) => <Badge status={row.status}>{row.status}</Badge>,
    },
    {
      header: 'Attendance',
      render: (row) => <Badge status={row.attendanceStatus}>{row.attendanceStatus}</Badge>,
    },
  ];
  
  return (
    <PageWrapper>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">All Registrations</h1>
        <p className="text-neutral-600">View all registrations across all events</p>
      </div>
      
      <div className="card p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by name, email, code..."
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field"
          >
            <option value="">All Status</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Waitlisted">Waitlisted</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <select
            value={attendanceFilter}
            onChange={(e) => setAttendanceFilter(e.target.value)}
            className="input-field"
          >
            <option value="">All Attendance</option>
            <option value="Pending">Pending</option>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
          </select>
        </div>
      </div>
      
      <Table columns={columns} data={registrations} loading={loading} />
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </PageWrapper>
  );
};

export default AllRegistrations;
