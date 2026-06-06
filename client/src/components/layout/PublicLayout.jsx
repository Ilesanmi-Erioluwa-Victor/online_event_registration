import PublicNavbar from './PublicNavbar.jsx';
import PublicFooter from './PublicFooter.jsx';

const PublicLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <PublicNavbar />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
};

export default PublicLayout;
