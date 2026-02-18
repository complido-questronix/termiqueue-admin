import { useState, useEffect } from 'react';
import '../styles/Body.scss';
import '../styles/Requests.scss';
// Uncomment when integrating with API:
// import { fetchBuses, createBus, updateBus, deleteBus } from '../services/api';

// Initial bus data - One Ayala, Philippines
// Note: Bus attendant is the source of truth for bus information
// TODO: Remove this when API is integrated
const initialBuses = [
  { id: 1, busNumber: 'OA-101', route: 'One Ayala - BGC', busCompany: 'JAM Transit', status: 'Active', plateNumber: 'UVW-823', capacity: 45, busAttendant: 'Juan Dela Cruz', busCompanyEmail: 'operations@jamtransit.com.ph', busCompanyContact: '+63 917 123 4567', registeredDestination: 'Bonifacio Global City, Taguig', busPhoto: null, lastUpdated: new Date('2026-02-18T10:30:00').getTime() },
  { id: 2, busNumber: 'OA-102', route: 'One Ayala - Ortigas', busCompany: 'RRCG Transport', status: 'Active', plateNumber: 'XYZ-456', capacity: 50, busAttendant: 'Maria Santos', busCompanyEmail: 'info@rrcgtransport.ph', busCompanyContact: '+63 918 234 5678', registeredDestination: 'Ortigas Center, Pasig City', busPhoto: null, lastUpdated: new Date('2026-02-18T09:15:00').getTime() },
  { id: 3, busNumber: 'OA-103', route: 'One Ayala - Quezon City', busCompany: 'Froehlich Tours', status: 'Maintenance', plateNumber: 'ABC-789', capacity: 48, busAttendant: 'Pedro Ramirez', busCompanyEmail: 'contact@froehlich.com.ph', busCompanyContact: '+63 919 345 6789', registeredDestination: 'Quezon City Circle, QC', busPhoto: null, lastUpdated: new Date('2026-02-17T14:20:00').getTime() },
  { id: 4, busNumber: 'OA-104', route: 'One Ayala - Mandaluyong', busCompany: 'HM Transport', status: 'Active', plateNumber: 'DEF-234', capacity: 42, busAttendant: 'Rosa Garcia', busCompanyEmail: 'support@hmtransport.ph', busCompanyContact: '+63 920 456 7890', registeredDestination: 'Mandaluyong City Center', busPhoto: null, lastUpdated: new Date('2026-02-18T08:45:00').getTime() },
  { id: 5, busNumber: 'OA-105', route: 'One Ayala - BGC', busCompany: 'JAM Transit', status: 'Active', plateNumber: 'GHI-567', capacity: 45, busAttendant: 'Carlos Reyes', busCompanyEmail: 'operations@jamtransit.com.ph', busCompanyContact: '+63 917 123 4567', registeredDestination: 'Bonifacio Global City, Taguig', busPhoto: null, lastUpdated: new Date('2026-02-16T16:30:00').getTime() },
  { id: 6, busNumber: 'OA-106', route: 'One Ayala - Alabang', busCompany: 'Partas Transport', status: 'Inactive', plateNumber: 'JKL-890', capacity: 52, busAttendant: 'N/A', busCompanyEmail: 'dispatch@partas.com.ph', busCompanyContact: '+63 921 567 8901', registeredDestination: 'Alabang Town Center, Muntinlupa', busPhoto: null, lastUpdated: new Date('2026-02-15T11:00:00').getTime() },
  { id: 7, busNumber: 'OA-107', route: 'One Ayala - Pasig', busCompany: 'RRCG Transport', status: 'Active', plateNumber: 'MNO-123', capacity: 50, busAttendant: 'Ana Mendoza', busCompanyEmail: 'info@rrcgtransport.ph', busCompanyContact: '+63 918 234 5678', registeredDestination: 'Pasig City Hall Area', busPhoto: null, lastUpdated: new Date('2026-02-18T07:20:00').getTime() },
  { id: 8, busNumber: 'OA-108', route: 'One Ayala - Cubao', busCompany: 'Genesis Transport', status: 'Active', plateNumber: 'PQR-456', capacity: 48, busAttendant: 'Ramon Cruz', busCompanyEmail: 'operations@genesistransport.ph', busCompanyContact: '+63 922 678 9012', registeredDestination: 'Araneta Center, Cubao QC', busPhoto: null, lastUpdated: new Date('2026-02-18T11:50:00').getTime() },
  { id: 9, busNumber: 'OA-109', route: 'One Ayala - Ortigas', busCompany: 'Froehlich Tours', status: 'Maintenance', plateNumber: 'STU-789', capacity: 48, busAttendant: 'N/A', busCompanyEmail: 'contact@froehlich.com.ph', busCompanyContact: '+63 919 345 6789', registeredDestination: 'Ortigas Center, Pasig City', busPhoto: null, lastUpdated: new Date('2026-02-14T13:10:00').getTime() },
  { id: 10, busNumber: 'OA-110', route: 'One Ayala - BGC', busCompany: 'JAM Transit', status: 'Active', plateNumber: 'VWX-012', capacity: 45, busAttendant: 'Luz Fernandez', busCompanyEmail: 'operations@jamtransit.com.ph', busCompanyContact: '+63 917 123 4567', registeredDestination: 'Bonifacio Global City, Taguig', busPhoto: null, lastUpdated: new Date('2026-02-18T06:30:00').getTime() },
  { id: 11, busNumber: 'OA-111', route: 'One Ayala - Marikina', busCompany: 'HM Transport', status: 'Active', plateNumber: 'YZA-345', capacity: 42, busAttendant: 'Jose Villaruz', busCompanyEmail: 'support@hmtransport.ph', busCompanyContact: '+63 920 456 7890', registeredDestination: 'Marikina City Center', busPhoto: null, lastUpdated: new Date('2026-02-17T15:40:00').getTime() },
  { id: 12, busNumber: 'OA-112', route: 'One Ayala - San Juan', busCompany: 'RRCG Transport', status: 'Active', plateNumber: 'BCD-678', capacity: 50, busAttendant: 'Elena Torres', busCompanyEmail: 'info@rrcgtransport.ph', busCompanyContact: '+63 918 234 5678', registeredDestination: 'San Juan City Hall', busPhoto: null, lastUpdated: new Date('2026-02-18T12:15:00').getTime() },
  { id: 13, busNumber: 'OA-113', route: 'One Ayala - Alabang', busCompany: 'Partas Transport', status: 'Inactive', plateNumber: 'EFG-901', capacity: 52, busAttendant: 'N/A', busCompanyEmail: 'dispatch@partas.com.ph', busCompanyContact: '+63 921 567 8901', registeredDestination: 'Alabang Town Center, Muntinlupa', busPhoto: null, lastUpdated: new Date('2026-02-13T10:00:00').getTime() },
  { id: 14, busNumber: 'OA-114', route: 'One Ayala - Quezon City', busCompany: 'Genesis Transport', status: 'Active', plateNumber: 'HIJ-234', capacity: 48, busAttendant: 'Ricardo Bonifacio', busCompanyEmail: 'operations@genesistransport.ph', busCompanyContact: '+63 922 678 9012', registeredDestination: 'Quezon City Circle, QC', busPhoto: null, lastUpdated: new Date('2026-02-18T13:00:00').getTime() },
  { id: 15, busNumber: 'OA-115', route: 'One Ayala - Pasig', busCompany: 'Froehlich Tours', status: 'Active', plateNumber: 'KLM-567', capacity: 48, busAttendant: 'Gloria Martinez', busCompanyEmail: 'contact@froehlich.com.ph', busCompanyContact: '+63 919 345 6789', registeredDestination: 'Pasig City Hall Area', busPhoto: null, lastUpdated: new Date('2026-02-16T09:25:00').getTime() },
];

function Buses() {
  const [buses, setBuses] = useState(initialBuses); // Use empty array [] when API is ready
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedBus, setSelectedBus] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('lastUpdated');
  const [sortOrder, setSortOrder] = useState('desc');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newBus, setNewBus] = useState({
    busNumber: '',
    route: '',
    busCompany: '',
    status: 'Active',
    plateNumber: '',
    capacity: '',
    busAttendant: '',
    busCompanyEmail: '',
    busCompanyContact: '',
    registeredDestination: '',
    busPhoto: null
  });

  // API Integration - Uncomment when backend is ready
  /*
  useEffect(() => {
    loadBuses();
  }, [currentPage, searchQuery, sortBy, sortOrder]);

  const loadBuses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchBuses({
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery,
        sortBy: sortBy,
        sortOrder: sortOrder
      });
      setBuses(data.buses); // Adjust based on your API response structure
      // If your API returns totalCount, you can calculate totalPages:
      // setTotalPages(Math.ceil(data.totalCount / itemsPerPage));
    } catch (err) {
      setError(err.message || 'Failed to load buses');
      console.error('Error loading buses:', err);
    } finally {
      setLoading(false);
    }
  };
  */

  // Filter buses based on search query
  const filteredBuses = buses.filter(bus => {
    const query = searchQuery.toLowerCase();
    return (
      bus.busNumber.toLowerCase().includes(query) ||
      bus.route.toLowerCase().includes(query) ||
      bus.busCompany.toLowerCase().includes(query) ||
      bus.plateNumber.toLowerCase().includes(query) ||
      bus.busAttendant.toLowerCase().includes(query) ||
      bus.status.toLowerCase().includes(query)
    );
  });

  // Sort buses
  const sortedBuses = [...filteredBuses].sort((a, b) => {
    let aValue, bValue;

    switch (sortBy) {
      case 'busNumber':
        aValue = a.busNumber;
        bValue = b.busNumber;
        break;
      case 'route':
        aValue = a.route;
        bValue = b.route;
        break;
      case 'busCompany':
        aValue = a.busCompany;
        bValue = b.busCompany;
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      case 'capacity':
        aValue = a.capacity;
        bValue = b.capacity;
        break;
      case 'lastUpdated':
      default:
        aValue = a.lastUpdated;
        bValue = b.lastUpdated;
        break;
    }

    if (sortBy === 'capacity' || sortBy === 'lastUpdated') {
      // Numeric comparison
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    } else {
      // String comparison
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    }
  });

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedBuses.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedBuses.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Reset to first page when search or sort changes
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  const handleSortOrderToggle = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    setCurrentPage(1);
  };

  // Handle row click
  const handleRowClick = (bus) => {
    setSelectedBus(bus);
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedBus(null);
  };

  // Open add bus modal
  const openAddModal = () => {
    setShowAddModal(true);
  };

  // Close add bus modal
  const closeAddModal = () => {
    setShowAddModal(false);
    setNewBus({
      busNumber: '',
      route: '',
      busCompany: '',
      status: 'Active',
      plateNumber: '',
      capacity: '',
      busAttendant: '',
      busCompanyEmail: '',
      busCompanyContact: '',
      registeredDestination: '',
      busPhoto: null
    });
  };

  // Handle input change in add bus form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBus(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!newBus.busNumber || !newBus.route || !newBus.busCompany || 
        !newBus.plateNumber || !newBus.capacity || !newBus.busAttendant ||
        !newBus.busCompanyEmail || !newBus.busCompanyContact || 
        !newBus.registeredDestination) {
      alert('Please fill in all required fields');
      return;
    }

    // API Integration - Uncomment when backend is ready
    /*
    try {
      setLoading(true);
      const newBusData = {
        ...newBus,
        capacity: parseInt(newBus.capacity)
      };
      const createdBus = await createBus(newBusData);
      setBuses(prev => [createdBus, ...prev]); // Add to beginning (latest first)
      closeAddModal();
      alert(`Bus ${newBus.busNumber} added successfully!`);
    } catch (err) {
      setError(err.message || 'Failed to add bus');
      alert('Failed to add bus. Please try again.');
      console.error('Error adding bus:', err);
    } finally {
      setLoading(false);
    }
    */

    // Local state update (current implementation)
    // Remove this block when API is integrated
    const newBusEntry = {
      ...newBus,
      id: buses.length > 0 ? Math.max(...buses.map(b => b.id)) + 1 : 1,
      capacity: parseInt(newBus.capacity),
      lastUpdated: Date.now()
    };
    setBuses(prev => [...prev, newBusEntry]);
    closeAddModal();
    
    // Show success message
    alert(`Bus ${newBus.busNumber} added successfully!`);
  };

  // Get status color class
  const getStatusClass = (status) => {
    switch (status) {
      case 'Active': return 'status-completed';
      case 'Maintenance': return 'status-in-progress';
      case 'Inactive': return 'status-pending';
      default: return '';
    }
  };

  return (
    <main className="content">
      <div className="requests-container">
        <div className="requests-header">
          <div className="header-content">
            <div>
              <h1>Buses</h1>
              <p className="subtitle">Manage and track all buses in the fleet</p>
            </div>
            <button className="add-bus-btn" onClick={openAddModal}>
              + Add New Bus
            </button>
          </div>
        </div>

        {/* Search and Sort Controls */}
        <div className="search-sort-controls">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search by bus number, route, company, plate, attendant, or status..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>
          
          <div className="sort-controls">
            <label htmlFor="sortBy">Sort by:</label>
            <select 
              id="sortBy" 
              value={sortBy} 
              onChange={handleSortChange}
              className="sort-select"
            >
              <option value="lastUpdated">Last Updated</option>
              <option value="busNumber">Bus Number</option>
              <option value="route">Route</option>
              <option value="busCompany">Company</option>
              <option value="status">Status</option>
              <option value="capacity">Capacity</option>
            </select>
            
            <button 
              onClick={handleSortOrderToggle}
              className="sort-order-btn"
              title={`Currently sorting ${sortOrder === 'asc' ? 'ascending' : 'descending'}`}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message" style={{ 
            padding: '1rem', 
            backgroundColor: '#f8d7da', 
            color: '#721c24', 
            borderRadius: '6px', 
            marginBottom: '1rem' 
          }}>
            {error}
          </div>
        )}

        <div className="table-container">
          <table className="requests-table">
            <thead>
              <tr>
                <th>Bus Number</th>
                <th>Route</th>
                <th>Bus Company</th>
                <th>Status</th>
                <th>Plate Number</th>
                <th>Capacity</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                    Loading buses...
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                    {searchQuery ? 'No buses found matching your search.' : 'No buses available.'}
                  </td>
                </tr>
              ) : (
                currentItems.map((bus) => (
                  <tr key={bus.id} onClick={() => handleRowClick(bus)} className="clickable-row">
                    <td className="bus-number">{bus.busNumber}</td>
                    <td>{bus.route}</td>
                    <td>{bus.busCompany}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(bus.status)}`}>
                        {bus.status}
                      </span>
                    </td>
                    <td>{bus.plateNumber}</td>
                    <td>{bus.capacity}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Previous
          </button>

          <div className="page-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
              <button
                key={number}
                onClick={() => paginate(number)}
                className={`page-number ${currentPage === number ? 'active' : ''}`}
              >
                {number}
              </button>
            ))}
          </div>

          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next
          </button>
        </div>

        <div className="table-info">
          Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, sortedBuses.length)} of {sortedBuses.length} buses
          {searchQuery && ` (filtered from ${buses.length} total)`}
        </div>
      </div>

      {/* Add Bus Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={closeAddModal}>
          <div className="modal-content add-bus-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Bus</h2>
              <button className="close-btn" onClick={closeAddModal}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-grid">
                <div className="form-section">
                  <h3>Bus Information</h3>
                  
                  <div className="form-group">
                    <label htmlFor="busNumber">Bus Number *</label>
                    <input
                      type="text"
                      id="busNumber"
                      name="busNumber"
                      value={newBus.busNumber}
                      onChange={handleInputChange}
                      placeholder="e.g., OA-116"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="plateNumber">Plate Number *</label>
                    <input
                      type="text"
                      id="plateNumber"
                      name="plateNumber"
                      value={newBus.plateNumber}
                      onChange={handleInputChange}
                      placeholder="e.g., ABC-123"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="capacity">Capacity *</label>
                    <input
                      type="number"
                      id="capacity"
                      name="capacity"
                      value={newBus.capacity}
                      onChange={handleInputChange}
                      placeholder="e.g., 45"
                      min="1"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="status">Status *</label>
                    <select
                      id="status"
                      name="status"
                      value={newBus.status}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="Active">Active</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Route Information</h3>
                  
                  <div className="form-group">
                    <label htmlFor="route">Route *</label>
                    <input
                      type="text"
                      id="route"
                      name="route"
                      value={newBus.route}
                      onChange={handleInputChange}
                      placeholder="e.g., One Ayala - BGC"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="registeredDestination">Registered Destination *</label>
                    <input
                      type="text"
                      id="registeredDestination"
                      name="registeredDestination"
                      value={newBus.registeredDestination}
                      onChange={handleInputChange}
                      placeholder="e.g., Bonifacio Global City, Taguig"
                      required
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h3>Bus Company</h3>
                  
                  <div className="form-group">
                    <label htmlFor="busCompany">Company Name *</label>
                    <input
                      type="text"
                      id="busCompany"
                      name="busCompany"
                      value={newBus.busCompany}
                      onChange={handleInputChange}
                      placeholder="e.g., JAM Transit"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="busCompanyEmail">Company Email *</label>
                    <input
                      type="email"
                      id="busCompanyEmail"
                      name="busCompanyEmail"
                      value={newBus.busCompanyEmail}
                      onChange={handleInputChange}
                      placeholder="e.g., operations@company.com.ph"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="busCompanyContact">Company Contact *</label>
                    <input
                      type="tel"
                      id="busCompanyContact"
                      name="busCompanyContact"
                      value={newBus.busCompanyContact}
                      onChange={handleInputChange}
                      placeholder="e.g., +63 917 123 4567"
                      required
                    />
                  </div>
                </div>

                <div className="form-section highlight-section">
                  <h3>Bus Attendant (Source of Truth)</h3>
                  
                  <div className="form-group">
                    <label htmlFor="busAttendant">Assigned Bus Attendant *</label>
                    <input
                      type="text"
                      id="busAttendant"
                      name="busAttendant"
                      value={newBus.busAttendant}
                      onChange={handleInputChange}
                      placeholder="e.g., Juan Dela Cruz"
                      required
                    />
                  </div>

                  <p className="info-note">
                    * The bus attendant is the primary source of truth for all bus information and operations.
                  </p>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={closeAddModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Add Bus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bus Details Modal */}
      {showModal && selectedBus && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Bus Details</h2>
              <button className="close-btn" onClick={closeModal}>&times;</button>
            </div>
            
            <div className="modal-body">
              <div className="bus-photo-section">
                <div className="bus-photo-placeholder">
                  {selectedBus.busPhoto ? (
                    <img src={selectedBus.busPhoto} alt={`Bus ${selectedBus.busNumber}`} />
                  ) : (
                    <div className="no-photo">
                      <span>📷</span>
                      <p>No photo available</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bus-info-grid">
                <div className="info-section">
                  <h3>Bus Information</h3>
                  <div className="info-row">
                    <span className="info-label">Bus Number:</span>
                    <span className="info-value">{selectedBus.busNumber}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Plate Number:</span>
                    <span className="info-value">{selectedBus.plateNumber}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Capacity:</span>
                    <span className="info-value">{selectedBus.capacity} passengers</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Status:</span>
                    <span className={`status-badge ${getStatusClass(selectedBus.status)}`}>
                      {selectedBus.status}
                    </span>
                  </div>
                </div>

                <div className="info-section">
                  <h3>Route Information</h3>
                  <div className="info-row">
                    <span className="info-label">Current Route:</span>
                    <span className="info-value">{selectedBus.route}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Registered Destination:</span>
                    <span className="info-value">{selectedBus.registeredDestination}</span>
                  </div>
                </div>

                <div className="info-section">
                  <h3>Bus Company</h3>
                  <div className="info-row">
                    <span className="info-label">Company Name:</span>
                    <span className="info-value">{selectedBus.busCompany}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Email:</span>
                    <span className="info-value">
                      <a href={`mailto:${selectedBus.busCompanyEmail}`}>{selectedBus.busCompanyEmail}</a>
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Contact Number:</span>
                    <span className="info-value">
                      <a href={`tel:${selectedBus.busCompanyContact}`}>{selectedBus.busCompanyContact}</a>
                    </span>
                  </div>
                </div>

                <div className="info-section highlight-section">
                  <h3>Bus Attendant (Source of Truth)</h3>
                  <div className="info-row">
                    <span className="info-label">Assigned Attendant:</span>
                    <span className="info-value attendant-name">{selectedBus.busAttendant}</span>
                  </div>
                  <p className="info-note">
                    * The bus attendant is the primary source of truth for all bus information and operations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Buses;