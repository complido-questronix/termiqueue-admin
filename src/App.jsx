import './App.css';
import './styles/Header.scss';
import './styles/Body.scss';
import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Requests from './components/Requests';
import NotFound from './components/NotFound';
import Login from './components/Login';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    // Check current URL on mount and when it changes
    const checkURL = () => {
      const pathname = window.location.pathname;
      
      if (pathname === '/requests') {
        setCurrentPage('requests');
      } else if (pathname === '/' || pathname === '') {
        setCurrentPage('dashboard');
      } else {
        setCurrentPage('notfound');
      }
    };

    checkURL();

    // Handle browser back/forward buttons
    window.addEventListener('popstate', checkURL);
    return () => window.removeEventListener('popstate', checkURL);
  }, []);

  const handleNavigation = (page) => {
    setCurrentPage(page);
    // Update URL without page reload
    if (page === 'requests') {
      window.history.pushState({}, '', '/requests');
    } else {
      window.history.pushState({}, '', '/');
    }
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem',
        color: '#096B72'
      }}>
        Loading...
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <Login />;
  }

  // Show app content if authenticated
  return (
    <div>
      <Header setCurrentPage={handleNavigation} currentPage={currentPage} />
      {currentPage === 'dashboard' && <Dashboard />}
      {currentPage === 'requests' && <Requests />}
      {currentPage === 'notfound' && <NotFound />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
