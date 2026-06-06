import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { 
  PlusIcon, 
  PencilSquareIcon, 
  TrashIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import PageWrapper from '../../components/layout/PageWrapper.jsx';
import Table from '../../components/common/Table.jsx';
import Modal from '../../components/common/Modal.jsx';
import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';
import Badge from '../../components/common/Badge.jsx';
import SearchInput from '../../components/common/SearchInput.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import { useDebounce } from '../../hooks/useDebounce.js';
import { usersAPI } from '../../api/index.js';
import { useForm } from 'react-hook-form';
import { formatDate } from '../../utils/formatDate.js';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const debouncedSearch = useDebounce(search, 400);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    fetchUsers();
  }, [page, debouncedSearch, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (roleFilter) params.role = roleFilter;

      const response = await usersAPI.getAll(params);
      setUsers(response.data.users);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setSubmitLoading(true);
    try {
      if (editingUser) {
        await usersAPI.update(editingUser._id, data);
        toast.success('User updated');
      } else {
        await usersAPI.create(data);
        toast.success('User created');
      }
      setShowAddModal(false);
      setEditingUser(null);
      reset();
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    reset({
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      organization: user.organization || '',
    });
    setShowAddModal(true);
  };

  const handleDelete = async (user) => {
    try {
      await usersAPI.delete(user._id);
      toast.success('User deactivated');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to deactivate user');
    }
    setConfirmDelete(null);
  };

  const handleToggle = async (user) => {
    setTogglingId(user._id);
    try {
      await usersAPI.toggleActive(user._id);
      toast.success('User status updated');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update user');
    } finally {
      setTogglingId(null);
    }
  };
  
  const columns = [
    {
      header: 'Name',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-pale text-primary rounded-full flex items-center justify-center font-semibold text-xs">
            {row.fullName.charAt(0)}
          </div>
          <div>
            <div className="font-medium">{row.fullName}</div>
            <div className="text-xs text-neutral-500">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Role',
      render: (row) => <Badge>{row.role}</Badge>,
    },
    {
      header: 'Phone',
      key: 'phone',
    },
    {
      header: 'Organization',
      key: 'organization',
    },
    {
      header: 'Status',
      render: (row) => (
        <Badge className={row.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
          {row.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      header: 'Created',
      render: (row) => formatDate(row.createdAt),
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-1">
          <button
            onClick={() => handleEdit(row)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
            title="Edit"
          >
            <PencilSquareIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleToggle(row)}
            disabled={togglingId === row._id}
            className="text-xs px-2 py-1 text-neutral-700 hover:bg-neutral-100 rounded disabled:opacity-50 inline-flex items-center gap-1"
            title="Toggle Active"
          >
            {togglingId === row._id ? (
              <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : null}
            {row.isActive ? 'Deactivate' : 'Activate'}
          </button>
          <button
            onClick={() => setConfirmDelete(row)}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
            title="Delete"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];
  
  return (
    <PageWrapper>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">User Management</h1>
          <p className="text-neutral-600">Manage all system users</p>
        </div>
        <Button onClick={() => { setEditingUser(null); reset(); setShowAddModal(true); }} className="w-full sm:w-auto">
          <PlusIcon className="h-4 w-4" /> Add User
        </Button>
      </div>
      
      <div className="card p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by name, email, organization..."
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="input-field"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="organizer">Organizer</option>
            <option value="participant">Participant</option>
          </select>
          <div></div>
        </div>
      </div>
      
      <Table columns={columns} data={users} loading={loading} />
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      
      <Modal 
        isOpen={showAddModal} 
        onClose={() => { setShowAddModal(false); setEditingUser(null); reset(); }}
        title={editingUser ? 'Edit User' : 'Add New User'}
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <Input
            label="Full Name"
            required
            {...register('fullName', { required: 'Required' })}
            error={errors.fullName?.message}
          />
          <Input
            label="Email"
            type="email"
            required
            {...register('email', { 
              required: 'Required',
              pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' }
            })}
            error={errors.email?.message}
          />
          {!editingUser && (
            <Input
              label="Password"
              type="password"
              required
              {...register('password', { required: 'Required', minLength: 6 })}
              error={errors.password?.message}
            />
          )}
          <div>
            <label className="label">Role <span className="text-red-500">*</span></label>
            <select
              className="input-field"
              {...register('role', { required: 'Required' })}
            >
              <option value="participant">Participant</option>
              <option value="organizer">Organizer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <Input label="Phone" {...register('phone')} />
          <Input label="Organization" {...register('organization')} />
          
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => { setShowAddModal(false); setEditingUser(null); reset(); }}
              disabled={submitLoading}
            >
              Cancel
            </Button>
            <Button type="submit" loading={submitLoading}>
              {editingUser ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
      
      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => handleDelete(confirmDelete)}
        title="Deactivate User"
        message={`Are you sure you want to deactivate ${confirmDelete?.fullName}?`}
        confirmText="Deactivate"
      />
    </PageWrapper>
  );
};

export default UserManagement;
