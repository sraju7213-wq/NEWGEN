import { useAuthGuard } from '../hooks/useAuthGuard';

const ProtectedRoute = ({ children }) => {
  const { user, token, initialized } = useAuthGuard();
  if (!initialized) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div className="card">Loading workspace...</div>
      </div>
    );
  }
  if (!user || !token) {
    return null;
  }
  return children;
};

export default ProtectedRoute;
