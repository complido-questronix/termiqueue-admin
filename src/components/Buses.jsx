import { useState, useEffect } from 'react';
import '../styles/Body.scss';
import '../styles/Requests.scss';
import TableSkeletonRows from './TableSkeletonRows';
<<<<<<< HEAD
import {
  getArchivedBusesData,
  getBusesData,
  saveArchivedBusesData,
  saveBusesData,
} from '../data/busesData';
// Uncomment when integrating with API:
// import { fetchBuses, createBus, updateBus, deleteBus } from '../services/api';

function Buses() {
  const [buses, setBuses] = useState([]); // Use empty array [] when API is ready
  const [archivedBuses, setArchivedBuses] = useState([]);
  const [selectedBusIds, setSelectedBusIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedBus, setSelectedBus] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('active');
  const [sortBy, setSortBy] = useState('lastUpdated');
  const [sortOrder, setSortOrder] = useState('desc');
=======
import { fetchBuses, createBus } from '../services/api';

function Buses() {
  const [buses, setBuses] = useState([]); 
>>>>>>> dev-api
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedBus, setSelectedBus] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [newBus, setNewBus] = useState({
    bus_number: '',       // Required by backend
    plate_number: '',
    capacity: '',
    priority_seat: '',    // Required by backend
    status: 'Active',
    route_name: '',
    origin: '',           // Required by backend
    registered_destination: '',
    operator: '',
    company_email: '',
    company_contact: '',
    bus_attendant: '',
    driver_name: '' 
  });

  useEffect(() => {
<<<<<<< HEAD
    const timer = setTimeout(() => {
      setBuses(getBusesData());
      setArchivedBuses(getArchivedBusesData());
      setLoading(false);
    }, 700);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading) {
      saveBusesData(buses);
    }
  }, [buses, loading]);

  useEffect(() => {
    if (!loading) {
      saveArchivedBusesData(archivedBuses);
    }
  }, [archivedBuses, loading]);

  // API Integration - Uncomment when backend is ready
  /*
  useEffect(() => {
=======
>>>>>>> dev-api
    loadBuses();
  }, []);

  const loadBuses = async () => {
    try {
      setLoading(true);
      const data = await fetchBuses();
      // Handle different API response structures
      setBuses(Array.isArray(data) ? data : (data.buses || []));
    } catch (err) {
      console.error("Fetch failed:", err);
      setBuses([]); 
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  // Filter buses based on search query
  const sourceBuses = viewMode === 'active' ? buses : archivedBuses;

  const filteredBuses = sourceBuses.filter(bus => {
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
  const totalPages = Math.max(1, Math.ceil(sortedBuses.length / itemsPerPage));

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Reset to first page when search or sort changes
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleViewModeChange = (nextMode) => {
    setViewMode(nextMode);
    setCurrentPage(1);
    setSelectedBusIds([]);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  const handleSortOrderToggle = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    setCurrentPage(1);
  };

  const archiveBusIds = (busIds) => {
    if (!Array.isArray(busIds) || busIds.length === 0) {
      return;
    }

    const idsToArchive = new Set(busIds);
    const busesToArchive = buses.filter((bus) => idsToArchive.has(bus.id));

    if (busesToArchive.length === 0) {
      return;
    }

    const archivedEntries = busesToArchive.map((bus) => ({
      ...bus,
      previousStatus: bus.status,
      status: 'Archived',
      archivedAt: Date.now(),
      lastUpdated: Date.now(),
    }));

    setArchivedBuses((previousArchivedBuses) => [...archivedEntries, ...previousArchivedBuses]);
    setBuses((previousBuses) => previousBuses.filter((bus) => !idsToArchive.has(bus.id)));
    setSelectedBusIds((previousSelectedBusIds) => previousSelectedBusIds.filter((id) => !idsToArchive.has(id)));

    if (selectedBus && idsToArchive.has(selectedBus.id)) {
      closeModal();
    }
  };

  const deleteArchivedBusIds = (busIds, options = { confirm: true }) => {
    if (!Array.isArray(busIds) || busIds.length === 0) {
      return;
    }

    const idsToDelete = new Set(busIds);

    if (options.confirm) {
      const shouldDelete = window.confirm(
        idsToDelete.size > 1
          ? `Delete ${idsToDelete.size} archived buses permanently? This action cannot be undone.`
          : 'Delete this archived bus permanently? This action cannot be undone.'
      );

      if (!shouldDelete) {
        return;
      }
    }

    setArchivedBuses((previousArchivedBuses) => previousArchivedBuses.filter((bus) => !idsToDelete.has(bus.id)));
    setSelectedBusIds((previousSelectedBusIds) => previousSelectedBusIds.filter((id) => !idsToDelete.has(id)));

    if (selectedBus && idsToDelete.has(selectedBus.id)) {
      closeModal();
    }
  };

  const unarchiveBusIds = (busIds) => {
    if (!Array.isArray(busIds) || busIds.length === 0) {
      return;
    }

    const idsToRestore = new Set(busIds);
    const busesToRestore = archivedBuses.filter((bus) => idsToRestore.has(bus.id));

    if (busesToRestore.length === 0) {
      return;
    }

    const restoredBuses = busesToRestore.map((bus) => {
      const { previousStatus, archivedAt, ...restBus } = bus;

      return {
        ...restBus,
        status: previousStatus || 'Inactive',
        lastUpdated: Date.now(),
      };
    });

    setBuses((previousBuses) => [...restoredBuses, ...previousBuses]);
    setArchivedBuses((previousArchivedBuses) => previousArchivedBuses.filter((bus) => !idsToRestore.has(bus.id)));
    setSelectedBusIds((previousSelectedBusIds) => previousSelectedBusIds.filter((id) => !idsToRestore.has(id)));

    if (selectedBus && idsToRestore.has(selectedBus.id)) {
      closeModal();
    }
  };

  const handleArchiveBus = (busId) => {
    archiveBusIds([busId]);
  };

  const handleBatchArchive = () => {
    archiveBusIds(selectedBusIds);
  };

  const handleDeleteArchivedBus = (busId) => {
    deleteArchivedBusIds([busId]);
  };

  const handleUnarchiveBus = (busId) => {
    unarchiveBusIds([busId]);
  };

  const handleBatchDeleteArchived = () => {
    deleteArchivedBusIds(selectedBusIds);
  };

  const handleBatchUnarchive = () => {
    unarchiveBusIds(selectedBusIds);
  };

  const currentPageBusIds = currentItems.map((bus) => bus.id);
  const hasCurrentItems = currentPageBusIds.length > 0;
  const isAllCurrentPageSelected = hasCurrentItems && currentPageBusIds.every((id) => selectedBusIds.includes(id));

  const handleToggleSelectBus = (busId) => {
    setSelectedBusIds((previousSelectedBusIds) => (
      previousSelectedBusIds.includes(busId)
        ? previousSelectedBusIds.filter((id) => id !== busId)
        : [...previousSelectedBusIds, busId]
    ));
  };

  const handleToggleSelectAllCurrent = () => {
    if (!hasCurrentItems) {
      return;
    }

    setSelectedBusIds((previousSelectedBusIds) => {
      if (isAllCurrentPageSelected) {
        return previousSelectedBusIds.filter((id) => !currentPageBusIds.includes(id));
      }

      const selectedSet = new Set(previousSelectedBusIds);
      currentPageBusIds.forEach((id) => selectedSet.add(id));
      return Array.from(selectedSet);
    });
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
=======
>>>>>>> dev-api
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBus(prev => ({ ...prev, [name]: value }));
  };

<<<<<<< HEAD
  const handleBusPhotoUpload = (e) => {
    const file = e.target.files && e.target.files[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const imageData = typeof reader.result === 'string' ? reader.result : null;

      setNewBus((prevBus) => ({
        ...prevBus,
        busPhoto: imageData,
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeBusPhoto = () => {
    setNewBus((prevBus) => ({
      ...prevBus,
      busPhoto: null,
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
=======
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Explicit conversion to Integers to avoid 422 errors
    const submissionData = {
>>>>>>> dev-api
      ...newBus,
      capacity: parseInt(newBus.capacity, 10) || 0,
      priority_seat: parseInt(newBus.priority_seat, 10) || 0,
      company_email: newBus.company_email || null,
      company_contact: newBus.company_contact || null
    };
<<<<<<< HEAD
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
      case 'Archived': return 'status-archived';
      default: return '';
    }
  };

  const isArchivedView = viewMode === 'archived';
=======

    try {
      await createBus(submissionData);
      setShowAddModal(false);
      await loadBuses(); // Refresh data immediately
      
      // Reset form
      setNewBus({
        bus_number: '', plate_number: '', capacity: '', priority_seat: '', 
        status: 'Active', route_name: '', origin: '', registered_destination: '', 
        operator: '', company_email: '', company_contact: '', 
        bus_attendant: '', driver_name: '' 
      });
    } catch (err) {
      console.error("Backend Error Detail:", err.response?.data);
      alert(`Failed to save: ${JSON.stringify(err.response?.data?.detail || "Check console")}`);
    }
  };

  const handleRowClick = (bus) => {
    setSelectedBus(bus);
    setShowViewModal(true);
  };

  // Matched status colors to your screenshot
  const getStatusClass = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'active' || s === 'available') return 'status-completed'; // Green
    if (s === 'maintenance') return 'status-pending'; // Orange
    return 'status-in-progress';
  };

  const filteredBuses = (buses || []).filter(bus => 
    (bus.bus_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (bus.plate_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (bus.route_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (bus.operator || '').toLowerCase().includes(searchQuery.toLowerCase())
  );
>>>>>>> dev-api

  return (
    <main className="content">
      <div className="requests-container">
        <div className="requests-header">
          <div className="header-content">
            <div>
              <h1>Buses</h1>
              <p className="subtitle">Manage active buses, archive removals, and permanently delete archived entries</p>
            </div>
<<<<<<< HEAD
=======
            <button className="add-bus-btn" onClick={() => setShowAddModal(true)}>+ Add New Bus</button>
>>>>>>> dev-api
          </div>
        </div>

        {/* Search and Sort matched to UI */}
        <div className="search-sort-controls">
<<<<<<< HEAD
          <div className="search-sort-group">

            <div className="search-bar">
              <input
                type="text"
                placeholder={isArchivedView
                  ? 'Search archived buses by number, route, company, plate, attendant, or status...'
                  : 'Search by bus number, route, company, plate, attendant, or status...'}
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
          <div className="bus-actions-toolbar">
            <div className="view-toggle-group">
              <button
                type="button"
                className={`view-toggle-btn ${!isArchivedView ? 'active' : ''}`}
                onClick={() => handleViewModeChange('active')}
              >
                Active ({buses.length})
              </button>
              <button
                type="button"
                className={`view-toggle-btn ${isArchivedView ? 'active' : ''}`}
                onClick={() => handleViewModeChange('archived')}
              >
                Archived ({archivedBuses.length})
              </button>
            </div>

            {!isArchivedView && (
              <button className="add-bus-btn" onClick={openAddModal}>
                + Add New Bus
              </button>
            )}

            {selectedBusIds.length > 0 && (
              <div className="batch-actions-bar">
                <span>{selectedBusIds.length} selected</span>
                {isArchivedView ? (
                  <>
                    <button type="button" className="table-action-btn restore" onClick={handleBatchUnarchive}>
                      Unarchive Selected
                    </button>
                    <button type="button" className="table-action-btn delete" onClick={handleBatchDeleteArchived}>
                      Delete Permanently
                    </button>
                  </>
                ) : (
                  <button type="button" className="table-action-btn archive" onClick={handleBatchArchive}>
                    Archive Selected
                  </button>
                )}
              </div>
            )}
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
            <colgroup>
              <col style={{ width: '4%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '22%' }} />
              <col style={{ width: '18%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '8%' }} />
              <col style={{ width: '14%' }} />
            </colgroup>
=======
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search by bus number, route, company, plate..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="sort-controls">
            <select className="sort-select">
              <option>Last Updated</option>
            </select>
            <button className="sort-direction-btn">↓</button>
          </div>
        </div>

        <div className="table-container">
          <table className="requests-table">
>>>>>>> dev-api
            <thead>
              {/* Header column order matched to target screenshot */}
              <tr>
<<<<<<< HEAD
                <th className="center-col">
                  <input
                    type="checkbox"
                    className="table-checkbox"
                    checked={isAllCurrentPageSelected}
                    onChange={handleToggleSelectAllCurrent}
                    disabled={!hasCurrentItems}
                  />
                </th>
                <th>Bus Number</th>
                <th>Route</th>
                <th>Bus Company</th>
                <th className="center-col">Status</th>
                <th>Plate Number</th>
                <th className="center-col">Capacity</th>
                <th className="center-col">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeletonRows rows={6} columns={8} />
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                    {searchQuery
                      ? 'No buses found matching your search.'
                      : isArchivedView
                        ? 'No archived buses yet.'
                        : 'No active buses yet.'}
                  </td>
                </tr>
              ) : (
                currentItems.map((bus) => (
                  <tr key={bus.id} onClick={() => handleRowClick(bus)} className="clickable-row">
                    <td className="center-col" onClick={(event) => event.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="table-checkbox"
                        checked={selectedBusIds.includes(bus.id)}
                        onChange={() => handleToggleSelectBus(bus.id)}
                      />
                    </td>
                    <td className="bus-number">{bus.busNumber}</td>
                    <td>{bus.route}</td>
                    <td>{bus.busCompany}</td>
=======
                <th>BUS NUMBER</th>
                <th>ROUTE</th>
                <th>BUS COMPANY</th>
                <th className="center-col">STATUS</th>
                <th>PLATE NUMBER</th>
                <th className="center-col">CAPACITY</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <TableSkeletonRows rows={10} columns={6} /> : 
                filteredBuses.map((bus, index) => (
                  <tr key={bus.id || index} className="clickable-row" onClick={() => handleRowClick(bus)}>
                    <td className="bus-number-cell">{bus.bus_number}</td>
                    <td>{bus.route_name || 'No Route'}</td>
                    <td>{bus.operator || 'Independent'}</td>
>>>>>>> dev-api
                    <td className="center-col">
                      <span className={`status-badge ${getStatusClass(bus.status)}`}>
                        {bus.status}
                      </span>
                    </td>
                    <td>{bus.plate_number}</td>
                    <td className="center-col">{bus.capacity}</td>
                    <td className="center-col action-cell">
                      {isArchivedView ? (
                        <>
                          <button
                            type="button"
                            className="table-action-btn restore"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleUnarchiveBus(bus.id);
                            }}
                          >
                            Unarchive
                          </button>
                          <button
                            type="button"
                            className="table-action-btn delete"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDeleteArchivedBus(bus.id);
                            }}
                          >
                            Delete Permanently
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          className="table-action-btn archive"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleArchiveBus(bus.id);
                          }}
                        >
                          Archive
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>

          {/* Pagination Footer matched to UI */}
          <div className="table-footer">
            <p>Showing 1 to {filteredBuses.length} of {buses.length} buses</p>
            <div className="pagination">
              <button className="page-btn">Previous</button>
              <button className="page-btn active">1</button>
              <button className="page-btn">2</button>
              <button className="page-btn">Next</button>
            </div>
          </div>
<<<<<<< HEAD
        )}

        {sortedBuses.length > 0 && (
          <div className="table-info">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, sortedBuses.length)} of {sortedBuses.length} {isArchivedView ? 'archived' : 'active'} buses
            {searchQuery && ` (filtered from ${sourceBuses.length} total)`}
          </div>
        )}
=======
        </div>
>>>>>>> dev-api
      </div>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content add-bus-modal">
            <div className="modal-header">
              <h2>Add New Bus</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>&times;</button>
            </div>
<<<<<<< HEAD

            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-grid">
                <div className="form-section">
                  <h3>Bus Information</h3>

=======
            <div className="modal-body scrollable-modal">
              <form onSubmit={handleSubmit}>
                <section className="form-section">
                  <h3 className="section-title">Bus Information</h3>
>>>>>>> dev-api
                  <div className="form-group">
                    <label>Bus Number *</label>
                    <input name="bus_number" value={newBus.bus_number} onChange={handleInputChange} required placeholder="e.g., OA-116" />
                  </div>
                  <div className="form-group">
                    <label>Plate Number *</label>
                    <input name="plate_number" value={newBus.plate_number} onChange={handleInputChange} required placeholder="e.g., ABC-123" />
                  </div>
                  <div className="form-group">
                    <label>Capacity *</label>
                    <input type="number" name="capacity" value={newBus.capacity} onChange={handleInputChange} required placeholder="45" />
                  </div>
                  <div className="form-group">
                    <label>Priority Seats *</label>
                    <input type="number" name="priority_seat" value={newBus.priority_seat} onChange={handleInputChange} required placeholder="10" />
                  </div>
                  <div className="form-group">
                    <label>Status *</label>
                    <select name="status" value={newBus.status} onChange={handleInputChange}>
                      <option value="Active">Active</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </div>
<<<<<<< HEAD

                  <div className="form-group">
                    <label htmlFor="busPhoto">Upload Bus Photo</label>
                    <input
                      type="file"
                      id="busPhoto"
                      name="busPhoto"
                      accept="image/*"
                      onChange={handleBusPhotoUpload}
                    />
                  </div>

                  {newBus.busPhoto && (
                    <div className="bus-photo-placeholder add-bus-photo-preview">
                      <img src={newBus.busPhoto} alt="Bus preview" />
                    </div>
                  )}

                  {newBus.busPhoto && (
                    <button type="button" className="btn-cancel remove-photo-btn" onClick={removeBusPhoto}>
                      Remove Photo
                    </button>
                  )}
                </div>

                <div className="form-section">
                  <h3>Route Information</h3>

=======
                </section>

                <section className="form-section">
                  <h3 className="section-title">Route Information</h3>
>>>>>>> dev-api
                  <div className="form-group">
                    <label>Origin *</label>
                    <input name="origin" value={newBus.origin} onChange={handleInputChange} required placeholder="e.g., Makati" />
                  </div>
                  <div className="form-group">
                    <label>Route *</label>
                    <input name="route_name" value={newBus.route_name} onChange={handleInputChange} required placeholder="e.g., One Ayala - BGC" />
                  </div>
<<<<<<< HEAD
                </div>

                <div className="form-section">
                  <h3>Bus Company</h3>

=======
>>>>>>> dev-api
                  <div className="form-group">
                    <label>Registered Destination *</label>
                    <input name="registered_destination" value={newBus.registered_destination} onChange={handleInputChange} required placeholder="e.g., Pasig City" />
                  </div>
                </section>

                <section className="form-section">
                  <h3 className="section-title">Bus Company</h3>
                  <div className="form-group">
                    <label>Company Name *</label>
                    <input name="operator" value={newBus.operator} onChange={handleInputChange} required placeholder="e.g., JAM Transit" />
                  </div>
                </section>

                <section className="form-section attendant-section">
                  <h3 className="section-title">Bus Attendant (Source of Truth)</h3>
                  <div className="form-group">
                    <label>Assigned Bus Attendant *</label>
                    <input name="bus_attendant" value={newBus.bus_attendant} onChange={handleInputChange} required placeholder="e.g., Juan Dela Cruz" />
                  </div>
                </section>

                <div className="form-actions">
                  <button type="button" className="btn-cancel" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="btn-submit">Save Bus</button>
                </div>
<<<<<<< HEAD

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

              <div className="modal-actions-row">
                {selectedBus.status === 'Archived' ? (
                  <>
                    <button
                      type="button"
                      className="table-action-btn restore"
                      onClick={() => handleUnarchiveBus(selectedBus.id)}
                    >
                      Unarchive
                    </button>
                    <button
                      type="button"
                      className="table-action-btn delete"
                      onClick={() => handleDeleteArchivedBus(selectedBus.id)}
                    >
                      Delete Permanently
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="table-action-btn archive"
                    onClick={() => handleArchiveBus(selectedBus.id)}
                  >
                    Archive Bus
                  </button>
                )}
              </div>
=======
              </form>
>>>>>>> dev-api
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Buses;