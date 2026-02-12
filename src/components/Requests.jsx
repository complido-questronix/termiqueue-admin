import { useState } from 'react';
import '../styles/Body.scss';
import '../styles/Requests.scss';
// import { fetchRequests } from '../services/api'; // Uncomment when API is ready

// Sample data - replace with actual API data
// To use real API data:
// 1. Uncomment the import above
// 2. Use useEffect to fetch data on component mount:
//
// const [requests, setRequests] = useState([]);
// const [loading, setLoading] = useState(true);
//
// useEffect(() => {
//   const loadRequests = async () => {
//     try {
//       const data = await fetchRequests(currentPage, itemsPerPage);
//       setRequests(data.items);
//       setTotalPages(data.totalPages);
//     } catch (error) {
//       console.error('Error fetching requests:', error);
//     } finally {
//       setLoading(false);
//     }
//   };
//   loadRequests();
// }, [currentPage, itemsPerPage]);

const sampleRequests = [
  { id: 1, title: 'Website Redesign', status: 'In Progress', priority: 'High', assignee: 'John Doe', date: '2026-02-10', department: 'IT' },
  { id: 2, title: 'Database Migration', status: 'Pending', priority: 'Critical', assignee: 'Jane Smith', date: '2026-02-09', department: 'IT' },
  { id: 3, title: 'Marketing Campaign', status: 'Completed', priority: 'Medium', assignee: 'Mike Johnson', date: '2026-02-08', department: 'Marketing' },
  { id: 4, title: 'Security Audit', status: 'In Progress', priority: 'High', assignee: 'Sarah Williams', date: '2026-02-07', department: 'Security' },
  { id: 5, title: 'Customer Support Portal', status: 'Pending', priority: 'Medium', assignee: 'Tom Brown', date: '2026-02-06', department: 'Support' },
  { id: 6, title: 'Mobile App Update', status: 'In Progress', priority: 'High', assignee: 'Emily Davis', date: '2026-02-05', department: 'Development' },
  { id: 7, title: 'Server Maintenance', status: 'Completed', priority: 'Critical', assignee: 'Chris Wilson', date: '2026-02-04', department: 'IT' },
  { id: 8, title: 'Budget Review', status: 'Pending', priority: 'Low', assignee: 'Lisa Anderson', date: '2026-02-03', department: 'Finance' },
  { id: 9, title: 'Employee Training', status: 'In Progress', priority: 'Medium', assignee: 'David Martinez', date: '2026-02-02', department: 'HR' },
  { id: 10, title: 'Network Upgrade', status: 'Completed', priority: 'High', assignee: 'Robert Taylor', date: '2026-02-01', department: 'IT' },
  { id: 11, title: 'Content Management System', status: 'Pending', priority: 'Medium', assignee: 'Amanda White', date: '2026-01-31', department: 'Marketing' },
  { id: 12, title: 'API Integration', status: 'In Progress', priority: 'High', assignee: 'Kevin Harris', date: '2026-01-30', department: 'Development' },
  { id: 13, title: 'Performance Optimization', status: 'Pending', priority: 'Critical', assignee: 'Jennifer Lee', date: '2026-01-29', department: 'IT' },
  { id: 14, title: 'Data Backup System', status: 'Completed', priority: 'High', assignee: 'Mark Thompson', date: '2026-01-28', department: 'IT' },
  { id: 15, title: 'User Interface Improvements', status: 'In Progress', priority: 'Medium', assignee: 'Rachel Garcia', date: '2026-01-27', department: 'Design' },
];

function Requests() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sampleRequests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sampleRequests.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Get status color class
  const getStatusClass = (status) => {
    switch (status) {
      case 'Completed': return 'status-completed';
      case 'In Progress': return 'status-in-progress';
      case 'Pending': return 'status-pending';
      default: return '';
    }
  };

  // Get priority color class
  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'Critical': return 'priority-critical';
      case 'High': return 'priority-high';
      case 'Medium': return 'priority-medium';
      case 'Low': return 'priority-low';
      default: return '';
    }
  };

  return (
    <main className="content">
      <div className="requests-container">
        <div className="requests-header">
          <h1>Requests</h1>
          <p className="subtitle">Manage and track all system requests</p>
        </div>

        <div className="table-container">
          <table className="requests-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Assignee</th>
                <th>Department</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((request) => (
                <tr key={request.id}>
                  <td>#{request.id}</td>
                  <td className="title-cell">{request.title}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td>
                    <span className={`priority-badge ${getPriorityClass(request.priority)}`}>
                      {request.priority}
                    </span>
                  </td>
                  <td>{request.assignee}</td>
                  <td>{request.department}</td>
                  <td>{request.date}</td>
                </tr>
              ))}
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
          Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, sampleRequests.length)} of {sampleRequests.length} requests
        </div>
      </div>
    </main>
  );
}

export default Requests;