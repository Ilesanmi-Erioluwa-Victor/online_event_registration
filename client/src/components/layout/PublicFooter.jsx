import { Link } from 'react-router-dom';

const PublicFooter = () => {
  return (
    <footer className="bg-primary-dark text-primary-light mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center font-bold text-white">
                E
              </div>
              <div>
                <div className="font-bold text-lg text-white">EventHub</div>
                <div className="text-xs text-primary-light">Register. Attend. Connect.</div>
              </div>
            </div>
            <p className="text-sm text-primary-light max-w-md">
              Discover and register for events that match your interests. From
              conferences and workshops to community meetups and concerts.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-white transition-colors">
                  All Events
                </Link>
              </li>
              <li>
                <Link to="/organizers" className="hover:text-white transition-colors">
                  Organizers
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3">Account</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link to="/forgot-password" className="hover:text-white transition-colors">
                  Forgot Password
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-light/20 mt-8 pt-6 text-sm text-center">
          &copy; {new Date().getFullYear()} EventHub. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
