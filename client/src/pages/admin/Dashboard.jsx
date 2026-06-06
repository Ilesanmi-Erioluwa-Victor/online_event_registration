import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CalendarDaysIcon, 
  UsersIcon, 
  ChartBarIcon, 
  ClipboardDocumentListIcon,
  UserGroupIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import PageWrapper from '../../components/layout/PageWrapper.jsx';
import { reportsAPI, eventsAPI, registrationsAPI } from '../../api/index.js';

const COLORS = ['#6C3BAA', '#E8472A', '#16A34A', '#0891B2', '#D97706', '#DC2626'];

const AdminDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [topEvents, setTopEvents] = useState([]);
  const [recentRegistrations, setRecentRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, monthlyRes, categoryRes, topRes, recentRes] = await Promise.all([
          reportsAPI.getSystemSummary(),
          reportsAPI.getRegistrationsByMonth(12),
          reportsAPI.getEventsByCategory(),
          reportsAPI.getTopEvents(5),
          registrationsAPI.getAll({ limit: 10 }),
        ]);
        
        setSummary(summaryRes.data);
        setMonthlyData(monthlyRes.data);
        setCategoryData(categoryRes.data);
        setTopEvents(topRes.data);
        setRecentRegistrations(recentRes.data.registrations);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  
  if (loading) {
    return (
      <PageWrapper>
        <div className="animate-pulse">Loading dashboard...</div>
      </PageWrapper>
    );
  }
  
  const metrics = [
    { label: 'Total Events', value: summary?.totalEvents || 0, icon: CalendarDaysIcon, color: 'bg-blue-500' },
    { label: 'Total Registrations', value: summary?.totalRegistrations || 0, icon: ClipboardDocumentListIcon, color: 'bg-green-500' },
    { label: 'Active Events', value: summary?.activeEvents || 0, icon: ChartBarIcon, color: 'bg-purple-500' },
    { label: 'Total Participants', value: summary?.totalParticipants || 0, icon: UserGroupIcon, color: 'bg-orange-500' },
    { label: 'Upcoming Events', value: summary?.upcomingEvents || 0, icon: CheckCircleIcon, color: 'bg-cyan-500' },
    { label: 'Total Organizers', value: summary?.totalOrganizers || 0, icon: UsersIcon, color: 'bg-pink-500' },
  ];
  
  return (
    <PageWrapper>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Admin Dashboard</h1>
        <p className="text-neutral-600">System overview and analytics</p>
      </div>
      
      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-neutral-500">{metric.label}</div>
                  <div className="text-2xl font-bold text-neutral-900 mt-1">
                    {metric.value.toLocaleString()}
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${metric.color}`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Quick Actions */}
      <div className="card p-4 mb-6">
        <h2 className="font-semibold mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/events" className="btn-primary text-sm">View All Events</Link>
          <Link to="/admin/users" className="btn-secondary text-sm">Manage Users</Link>
          <Link to="/admin/reports" className="btn-secondary text-sm">View Reports</Link>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-4">
          <h3 className="font-semibold mb-4">Registrations per Month</h3>
          <ResponsiveContainer width="100%" height={250}>
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
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
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
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-4">
          <h3 className="font-semibold mb-4">Top 5 Most Registered Events</h3>
          <div className="space-y-3">
            {topEvents.map((event, idx) => (
              <div key={event._id} className="flex items-center justify-between p-2 hover:bg-neutral-50 rounded">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-pale text-primary rounded-full flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{event.title}</div>
                    <div className="text-xs text-neutral-500">{event.eventCode}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-accent">{event.currentRegistrations}</div>
                  <div className="text-xs text-neutral-500">registrations</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="card p-4">
          <h3 className="font-semibold mb-4">Recent Registrations</h3>
          <div className="space-y-2">
            {recentRegistrations.slice(0, 5).map((reg) => (
              <div key={reg._id} className="flex items-center justify-between p-2 hover:bg-neutral-50 rounded text-sm">
                <div>
                  <div className="font-medium">{reg.fullName}</div>
                  <div className="text-xs text-neutral-500">{reg.event?.title}</div>
                </div>
                <div className="text-xs text-neutral-500">
                  {new Date(reg.registrationDate).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default AdminDashboard;
