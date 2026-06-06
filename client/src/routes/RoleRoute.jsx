import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

const RoleRoute = ({ roles, children }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!roles.includes(user.role)) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }
  
  return children;
};

export default RoleRoute;
