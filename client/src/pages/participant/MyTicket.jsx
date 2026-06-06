import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowDownTrayIcon, PrinterIcon } from '@heroicons/react/24/outline';
import PageWrapper from '../../components/layout/PageWrapper.jsx';
import Button from '../../components/common/Button.jsx';
import TicketCard from '../../components/features/TicketCard.jsx';
import { registrationsAPI } from '../../api/index.js';

const MyTicket = () => {
  const { id } = useParams();
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchRegistration = async () => {
      try {
        const response = await registrationsAPI.getById(id);
        setRegistration(response.data);
      } catch (err) {
        toast.error('Failed to load ticket');
      } finally {
        setLoading(false);
      }
    };
    fetchRegistration();
  }, [id]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await registrationsAPI.downloadTicket(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ticket-${registration.ticketNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Ticket downloaded');
    } catch (err) {
      toast.error('Download failed');
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <PageWrapper><div>Loading ticket...</div></PageWrapper>;
  if (!registration) return <PageWrapper><div>Ticket not found</div></PageWrapper>;

  return (
    <PageWrapper>
      <div className="mb-4 no-print">
        <Link to="/participant/registrations" className="text-primary hover:underline text-sm">
          ← Back to Registrations
        </Link>
      </div>

      <div className="flex flex-wrap justify-end gap-2 mb-4 no-print">
        <Button variant="secondary" onClick={handlePrint}>
          <PrinterIcon className="h-4 w-4" /> Print
        </Button>
        <Button onClick={handleDownload} loading={downloading}>
          <ArrowDownTrayIcon className="h-4 w-4" /> Download PDF
        </Button>
      </div>

      <TicketCard registration={registration} event={registration.event} />
    </PageWrapper>
  );
};

export default MyTicket;
