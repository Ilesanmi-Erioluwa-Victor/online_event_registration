import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import PageWrapper from '../../components/layout/PageWrapper.jsx';
import Button from '../../components/common/Button.jsx';
import { reportsAPI } from '../../api/index.js';

const COLORS = ['#6C3BAA', '#E8472A', '#16A34A', '#0891B2', '#D97706', '#DC2626'];

const Reports = () => {
  const [summary, setSummary] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [topEvents, setTopEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, monthlyRes, categoryRes, topRes] = await Promise.all([
          reportsAPI.getSystemSummary(),
          reportsAPI.getRegistrationsByMonth(12),
          reportsAPI.getEventsByCategory(),
          reportsAPI.getTopEvents(10),
        ]);

        setSummary(summaryRes.data);
        setMonthlyData(monthlyRes.data);
        setCategoryData(categoryRes.data);
        setTopEvents(topRes.data);
      } catch (err) {
        toast.error('Failed to load reports');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await reportsAPI.exportOverview();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'system-overview.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Report downloaded');
    } catch (err) {
      toast.error('Failed to export report');
    } finally {
      setExporting(false);
    }
  };
  
  if (loading) return <PageWrapper><div>Loading reports...</div></PageWrapper>;
  
  return (
    <PageWrapper>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Reports & Analytics</h1>
          <p className="text-neutral-600">System-wide statistics and reports</p>
        </div>
        <Button onClick={handleExport} loading={exporting} className="w-full sm:w-auto">
          <ArrowDownTrayIcon className="h-4 w-4" /> Export PDF
        </Button>
      </div>
      
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Events', value: summary?.totalEvents },
          { label: 'Total Registrations', value: summary?.totalRegistrations },
          { label: 'Total Users', value: summary?.totalUsers },
          { label: 'Active Events', value: summary?.activeEvents },
        ].map((item) => (
          <div key={item.label} className="card p-4">
            <div className="text-sm text-neutral-500">{item.label}</div>
            <div className="text-2xl font-bold text-primary mt-1">{item.value || 0}</div>
          </div>
        ))}
      </div>
      
      {/* Events by Status */}
      <div className="card p-4 mb-6">
        <h3 className="font-semibold mb-3">Events by Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {summary && Object.entries(summary.eventsByStatus || {}).map(([status, count]) => (
            <div key={status} className="bg-neutral-50 p-3 rounded">
              <div className="text-xs text-neutral-500">{status}</div>
              <div className="text-xl font-bold">{count}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-4">
          <h3 className="font-semibold mb-4">Monthly Registration Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#6C3BAA" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="card p-4">
          <h3 className="font-semibold mb-4">Events by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="card p-4">
        <h3 className="font-semibold mb-4">Top Events</h3>
        <div className="space-y-2">
          {topEvents.map((event, idx) => (
            <div key={event._id} className="flex items-center justify-between p-3 bg-neutral-50 rounded">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {idx + 1}
                </div>
                <div>
                  <div className="font-medium">{event.title}</div>
                  <div className="text-xs text-neutral-500">{event.eventCode}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-accent">{event.currentRegistrations}</div>
                <div className="text-xs text-neutral-500">/ {event.maxCapacity}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
};

export default Reports;
