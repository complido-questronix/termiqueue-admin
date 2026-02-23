import { useState, useEffect } from 'react';
import '../styles/Body.scss';
import '../styles/Requests.scss';
import TableSkeletonRows from './TableSkeletonRows';
import { fetchBuses, createBus } from '../services/api';

function Buses() {
  const [buses, setBuses] = useState([]); 
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBus(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Explicit conversion to Integers to avoid 422 errors
    const submissionData = {
      ...newBus,
      capacity: parseInt(newBus.capacity, 10) || 0,
      priority_seat: parseInt(newBus.priority_seat, 10) || 0,
      company_email: newBus.company_email || null,
      company_contact: newBus.company_contact || null
    };

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

  return (
    <main className="content">
      <div className="requests-container">
        <div className="requests-header">
          <div className="header-content">
            <div>
              <h1>Buses</h1>
              <p className="subtitle">Manage and track all buses in the fleet</p>
            </div>
            <button className="add-bus-btn" onClick={() => setShowAddModal(true)}>+ Add New Bus</button>
          </div>
        </div>

        {/* Search and Sort matched to UI */}
        <div className="search-sort-controls">
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
            <thead>
              {/* Header column order matched to target screenshot */}
              <tr>
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
                    <td className="center-col">
                      <span className={`status-badge ${getStatusClass(bus.status)}`}>
                        {bus.status}
                      </span>
                    </td>
                    <td>{bus.plate_number}</td>
                    <td className="center-col">{bus.capacity}</td>
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
        </div>
      </div>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content add-bus-modal">
            <div className="modal-header">
              <h2>Add New Bus</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>&times;</button>
            </div>
            <div className="modal-body scrollable-modal">
              <form onSubmit={handleSubmit}>
                <section className="form-section">
                  <h3 className="section-title">Bus Information</h3>
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
                </section>

                <section className="form-section">
                  <h3 className="section-title">Route Information</h3>
                  <div className="form-group">
                    <label>Origin *</label>
                    <input name="origin" value={newBus.origin} onChange={handleInputChange} required placeholder="e.g., Makati" />
                  </div>
                  <div className="form-group">
                    <label>Route *</label>
                    <input name="route_name" value={newBus.route_name} onChange={handleInputChange} required placeholder="e.g., One Ayala - BGC" />
                  </div>
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
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Buses;