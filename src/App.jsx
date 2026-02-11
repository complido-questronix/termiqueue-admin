import './App.css';
import './styles/Header.scss';
import './styles/Body.scss';
import { useState, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Requests from './components/Requests';
import NotFound from './components/NotFound';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

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

  return (
    <div>
      <Header setCurrentPage={handleNavigation} currentPage={currentPage} />
      {currentPage === 'dashboard' && <Dashboard />}
      {currentPage === 'requests' && <Requests />}
      {currentPage === 'notfound' && <NotFound />}
    </div>
  );
}

export default App;
