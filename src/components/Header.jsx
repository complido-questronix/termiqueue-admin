import '../styles/Header.scss';
import qnextLogo from '../assets/qnext.svg';
import { MdDashboard, MdAssignment } from 'react-icons/md';

function Header({ setCurrentPage, currentPage }) {
  return (
    <header className="sidebar">
      <nav>
        <div className='logo'>
          <img src={qnextLogo} alt="QNext Logo" />
        </div>
        <ul>
          <li>
            <button className={currentPage === 'dashboard' ? 'active' : ''} onClick={() => setCurrentPage('dashboard')}>
              <MdDashboard /> Dashboard
            </button>
          </li>
          <li>
            <button className={currentPage === 'requests' ? 'active' : ''} onClick={() => setCurrentPage('requests')}>
              <MdAssignment /> Requests
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;