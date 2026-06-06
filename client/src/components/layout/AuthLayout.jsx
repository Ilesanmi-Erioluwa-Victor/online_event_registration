const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-dark to-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4">
            <span className="text-3xl font-bold text-white">E</span>
          </div>
          <h1 className="text-3xl font-bold text-white">EventHub</h1>
          <p className="text-primary-light mt-1">Register. Attend. Connect.</p>
        </div>
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
