import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon, UsersIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import PublicLayout from '../../components/layout/PublicLayout.jsx';
import OrganizerCard from '../../components/features/OrganizerCard.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import { publicAPI } from '../../api/index.js';
import { useDebounce } from '../../hooks/useDebounce.js';

const PublicOrganizers = () => {
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    const fetchOrganizers = async () => {
      try {
        setLoading(true);
        const params = { page, limit: 12 };
        if (debouncedSearch) params.search = debouncedSearch;
        const response = await publicAPI.getOrganizers(params);
        setOrganizers(response.data.organizers);
        setTotalPages(response.data.totalPages);
      } catch (err) {
        toast.error('Failed to load organizers');
      } finally {
        setLoading(false);
      }
    };
    fetchOrganizers();
  }, [page, debouncedSearch]);

  return (
    <PublicLayout>
      <div className="bg-gradient-to-r from-primary-dark to-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Meet Our Organizers
          </h1>
          <p className="text-primary-light mb-6">
            Discover the people and organizations behind great events
          </p>
          <div className="bg-white rounded-xl p-2 shadow-lg flex items-center gap-2 max-w-2xl">
            <div className="pl-3 text-neutral-400">
              <MagnifyingGlassIcon className="h-5 w-5" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search organizers by name or organization..."
              className="flex-1 px-2 py-2 text-neutral-800 placeholder-neutral-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="card h-48 animate-pulse bg-neutral-100"
              />
            ))}
          </div>
        ) : organizers.length === 0 ? (
          <div className="card p-12 text-center text-neutral-500">
            <UsersIcon className="h-12 w-12 mx-auto text-neutral-300 mb-2" />
            <p>No organizers found.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {organizers.map((organizer) => (
                <OrganizerCard key={organizer._id} organizer={organizer} />
              ))}
            </div>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </PublicLayout>
  );
};

export default PublicOrganizers;
