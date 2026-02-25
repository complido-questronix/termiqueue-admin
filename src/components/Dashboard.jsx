import '../styles/Body.scss';
import { useEffect, useMemo, useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { MdDirectionsBus, MdAltRoute, MdTraffic, MdTimer } from 'react-icons/md';
import { fetchDashboardBuses } from '../services/dashboardService';

function Dashboard() {
  const [leftView, setLeftView] = useState('weekly');
  const [rightView, setRightView] = useState('weekly');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [reportPreviewUrl, setReportPreviewUrl] = useState('');
  const [reportFileName, setReportFileName] = useState('dashboard-analytics-report.pdf');
  const [dashboardWarning, setDashboardWarning] = useState('');
  const [buses, setBuses] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async () => {
      setIsLoading(true);

      try {
        const result = await fetchDashboardBuses();

        if (isMounted && result && Array.isArray(result.buses)) {
          setBuses(result.buses);
          setDashboardWarning(result.warning || '');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => () => {
    if (reportPreviewUrl) {
      URL.revokeObjectURL(reportPreviewUrl);
    }
  }, [reportPreviewUrl]);

  const analytics = useMemo(() => {
    const statusCounts = {
      Active: 0,
      Maintenance: 0,
      Inactive: 0,
    };

    const routeCounts = new Map();
    const companyMetrics = new Map();
    const weeklyMetrics = new Map();
    const monthlyMetrics = new Map();
    const yearlyMetrics = new Map();

    const weekDayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    weekDayOrder.forEach((day) => {
      weeklyMetrics.set(day, {
        label: day,
        buses: 0,
        qnext: 0,
        traditional: 0,
      });
    });

    let totalCapacity = 0;

    buses.forEach((bus) => {
      const normalizedStatus = bus.status === 'Active' || bus.status === 'Maintenance' || bus.status === 'Inactive'
        ? bus.status
        : 'Inactive';

      statusCounts[normalizedStatus] += 1;
      const isActiveBus = normalizedStatus === 'Active';

      routeCounts.set(bus.route, (routeCounts.get(bus.route) || 0) + 1);

      const existingCompanyMetrics = companyMetrics.get(bus.busCompany) || {
        label: bus.busCompany,
        buses: 0,
        qnext: 0,
        traditional: 0,
      };

      existingCompanyMetrics.buses += 1;
      const busCapacity = Math.max(0, Number(bus.capacity || 0));
      const boardedFromQnextRaw = Number(bus.qnextBoarded || 0);
      const boardedFromQnext = Math.min(busCapacity, Math.max(0, boardedFromQnextRaw));
      const traditionalQueueCount = Math.max(0, busCapacity - boardedFromQnext);

      existingCompanyMetrics.qnext += boardedFromQnext;
      existingCompanyMetrics.traditional += traditionalQueueCount;
      companyMetrics.set(bus.busCompany, existingCompanyMetrics);

      totalCapacity += busCapacity;

      const weekDayName = new Date(bus.lastUpdated).toLocaleDateString('en-US', {
        weekday: 'long',
      });

      const monthName = new Date(bus.lastUpdated).toLocaleDateString('en-US', {
        month: 'short',
      });

      const yearLabel = String(new Date(bus.lastUpdated).getFullYear());

      const weekDayData = weeklyMetrics.get(weekDayName) || {
        label: weekDayName,
        buses: 0,
        qnext: 0,
        traditional: 0,
      };

      weekDayData.buses += 1;
      weekDayData.qnext += boardedFromQnext;
      weekDayData.traditional += traditionalQueueCount;

      weeklyMetrics.set(weekDayName, weekDayData);

      const monthData = monthlyMetrics.get(monthName) || {
        label: monthName,
        buses: 0,
        qnext: 0,
        traditional: 0,
      };
      monthData.buses += 1;
      monthData.qnext += boardedFromQnext;
      monthData.traditional += traditionalQueueCount;
      monthlyMetrics.set(monthName, monthData);

      const yearData = yearlyMetrics.get(yearLabel) || {
        label: yearLabel,
        buses: 0,
        qnext: 0,
        traditional: 0,
      };
      yearData.buses += 1;
      yearData.qnext += boardedFromQnext;
      yearData.traditional += traditionalQueueCount;
      yearlyMetrics.set(yearLabel, yearData);
    });

    const routeData = Array.from(routeCounts.entries())
      .map(([route, busesCount]) => ({ label: route, buses: busesCount }))
      .sort((leftRoute, rightRoute) => rightRoute.buses - leftRoute.buses);

    const companyData = Array.from(companyMetrics.values())
      .sort((leftCompany, rightCompany) => rightCompany.buses - leftCompany.buses);

    const weeklyData = weekDayOrder.map((day) => weeklyMetrics.get(day));

    const monthlyData = monthOrder.map((month) => {
      const monthData = monthlyMetrics.get(month);
      return monthData || { label: month, buses: 0, qnext: 0, traditional: 0 };
    });

    const yearlyData = Array.from(yearlyMetrics.values()).sort((leftYear, rightYear) => Number(leftYear.label) - Number(rightYear.label));

    const delayedBuses = statusCounts.Maintenance + statusCounts.Inactive;

    return {
      totalBuses: buses.length,
      activeBuses: statusCounts.Active,
      delayedBuses,
      uniqueRoutes: routeCounts.size,
      avgCapacity: buses.length ? Math.round(totalCapacity / buses.length) : 0,
      maintenanceBuses: statusCounts.Maintenance,
      inactiveBuses: statusCounts.Inactive,
      weeklyData,
      monthlyData,
      yearlyData,
      routeData,
      companyData,
    };
  }, [buses]);

  const leftChartData = leftView === 'weekly'
    ? analytics.weeklyData
    : leftView === 'monthly'
      ? analytics.monthlyData
      : analytics.yearlyData;

  const leftPanelTitle = leftView === 'weekly'
    ? 'Total bus per week'
    : leftView === 'monthly'
      ? 'Total bus per month'
      : 'Total bus per year';

  const rightChartData = rightView === 'weekly'
    ? analytics.weeklyData
    : rightView === 'monthly'
      ? analytics.monthlyData
      : analytics.yearlyData;

  const rightPanelTitle = rightView === 'weekly'
    ? 'Traditional Queue vs QNExT per week'
    : rightView === 'monthly'
      ? 'Traditional Queue vs QNExT per month'
      : 'Traditional Queue vs QNExT per year';

  const companyStatusMixData = analytics.companyData.slice(0, 6);
  const topRouteVolumeData = analytics.routeData.slice(0, 6);

  const formatReportDate = (timestamp) => new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleCloseReportPreview = () => {
    if (reportPreviewUrl) {
      URL.revokeObjectURL(reportPreviewUrl);
    }

    setReportPreviewUrl('');
  };

  const handleDownloadPreviewPdf = () => {
    if (!reportPreviewUrl) {
      return;
    }

    const downloadLink = document.createElement('a');
    downloadLink.href = reportPreviewUrl;
    downloadLink.download = reportFileName;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const handleGenerateReport = () => {
    setIsGeneratingReport(true);

    try {
      const reportDate = new Date();
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });

      doc.setFontSize(18);
      doc.text('QNext Admin - Dashboard Analytics Report', 40, 42);

      doc.setFontSize(10);
      doc.text(`Generated: ${reportDate.toLocaleString()}`, 40, 60);
      doc.text(`Total records analyzed: ${buses.length}`, 40, 74);

      autoTable(doc, {
        startY: 90,
        head: [['KPI', 'Value']],
        body: [
          ['Total Buses', analytics.totalBuses],
          ['Active Buses', analytics.activeBuses],
          ['Delayed Buses', analytics.delayedBuses],
          ['Routes Covered', analytics.uniqueRoutes],
          ['Average Capacity', analytics.avgCapacity],
        ],
        styles: { fontSize: 10 },
        headStyles: { fillColor: [9, 107, 114] },
      });

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 16,
        head: [['Weekly Buses', 'Total']],
        body: analytics.weeklyData.map((item) => [item.label, item.buses]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [9, 107, 114] },
      });

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 16,
        head: [['Company', 'Traditional Queue', 'QNExT', 'Total Buses']],
        body: companyStatusMixData.map((item) => [
          item.label,
          item.traditional,
          item.qnext,
          item.buses,
        ]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [9, 107, 114] },
      });

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 16,
        head: [['Route', 'Assigned Buses']],
        body: topRouteVolumeData.map((item) => [item.label, item.buses]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [9, 107, 114] },
      });

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 16,
        head: [['Bus Number', 'Company', 'Route', 'Status', 'Capacity', 'Last Updated']],
        body: [...buses]
          .sort((leftBus, rightBus) => Number(rightBus.lastUpdated || 0) - Number(leftBus.lastUpdated || 0))
          .map((bus) => [
            bus.busNumber || 'N/A',
            bus.busCompany || 'N/A',
            bus.route || 'N/A',
            bus.status || 'N/A',
            Number(bus.capacity || 0),
            formatReportDate(bus.lastUpdated || Date.now()),
          ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [9, 107, 114] },
      });

      const fileDate = reportDate.toISOString().slice(0, 10);
      const nextFileName = `dashboard-analytics-report-${fileDate}.pdf`;
      const reportBlob = doc.output('blob');
      const nextPreviewUrl = URL.createObjectURL(reportBlob);

      if (reportPreviewUrl) {
        URL.revokeObjectURL(reportPreviewUrl);
      }

      setReportFileName(nextFileName);
      setReportPreviewUrl(nextPreviewUrl);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <main className="content">
      <div className="dashboard-v2">
        <div className="dashboard-toolbar">
          <h1>Dashboard Analytics</h1>
          <button
            type="button"
            className="report-btn"
            onClick={handleGenerateReport}
            disabled={isGeneratingReport || isLoading || buses.length === 0}
          >
            {isGeneratingReport ? 'Generating PDF...' : 'Preview Report (PDF)'}
          </button>
        </div>

        {dashboardWarning && (
          <div className="dashboard-warning-banner" role="alert">
            {dashboardWarning}
          </div>
        )}

        {isLoading ? (
          <>
            <div className="dashboard-kpis dashboard-kpis-loading">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="kpi-card kpi-card-skeleton">
                  <div className="skeleton-block skeleton-kpi-label" />
                  <div className="skeleton-block skeleton-kpi-value" />
                </div>
              ))}
            </div>

            <div className="dashboard-charts-grid">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="chart-container dashboard-panel dashboard-panel-skeleton">
                  <div className="skeleton-block skeleton-panel-title" />
                  <div className="skeleton-block skeleton-chart" />
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
        <div className="dashboard-kpis">
          <div className="kpi-card">
            <div>
              <h3>Total Buses</h3>
              <p className="kpi-value">{analytics.totalBuses}</p>
            </div>
            <span className="kpi-icon"><MdDirectionsBus /></span>
          </div>

          <div className="kpi-card">
            <div>
              <h3>Routes Covered</h3>
              <p className="kpi-value">{analytics.uniqueRoutes}</p>
            </div>
            <span className="kpi-icon"><MdAltRoute /></span>
          </div>

          <div className="kpi-card">
            <div>
              <h3>Active Buses</h3>
              <p className="kpi-value">{analytics.activeBuses}</p>
            </div>
            <span className="kpi-icon"><MdTraffic /></span>
          </div>

          <div className="kpi-card">
            <div>
              <h3>Delayed</h3>
              <p className="kpi-value">{analytics.delayedBuses}</p>
            </div>
            <span className="kpi-icon"><MdTimer /></span>
          </div>
        </div>

        <div className="dashboard-charts-grid">
          <div className="chart-container dashboard-panel">
            <div className="panel-header">
              <h2>{leftPanelTitle}</h2>
              <select value={leftView} onChange={(event) => setLeftView(event.target.value)}>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <ResponsiveContainer width="100%" height={290}>
              <LineChart data={leftChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" interval={0} tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="buses"
                  stroke="#096B72"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container dashboard-panel">
            <div className="panel-header">
              <h2>{rightPanelTitle}</h2>
              <select value={rightView} onChange={(event) => setRightView(event.target.value)}>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <ResponsiveContainer width="100%" height={290}>
              <AreaChart data={rightChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" interval={0} tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="traditional" name="Traditional Queue" stroke="#E3655B" fill="#E3655B" fillOpacity={0.16} />
                <Area type="monotone" dataKey="qnext" name="QNExT" stroke="#096B72" fill="#096B72" fillOpacity={0.22} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container dashboard-panel">
            <div className="panel-header">
              <h2>Traditional Queue vs QNExT by bus company (Top 6)</h2>
            </div>

            <ResponsiveContainer width="100%" height={290}>
              <BarChart data={companyStatusMixData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" interval={0} tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="traditional" name="Traditional Queue" stackId="queue" fill="#E3655B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="qnext" name="QNExT" stackId="queue" fill="#096B72" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container dashboard-panel">
            <div className="panel-header">
              <h2>Top routes by assigned buses</h2>
            </div>

            <ResponsiveContainer width="100%" height={290}>
              <BarChart data={topRouteVolumeData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" interval={0} tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="buses" name="Buses" fill="#096B72" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
          </>
        )}
      </div>

      {reportPreviewUrl && (
        <div className="dashboard-report-modal-overlay" onClick={handleCloseReportPreview}>
          <div className="dashboard-report-modal" onClick={(event) => event.stopPropagation()}>
            <div className="dashboard-report-modal-header">
              <h2>Report Preview</h2>
              <button type="button" className="report-close-btn" onClick={handleCloseReportPreview}>
                ×
              </button>
            </div>

            <div className="dashboard-report-modal-body">
              <iframe title="Dashboard Report Preview" src={reportPreviewUrl} className="dashboard-report-preview" />
            </div>

            <div className="dashboard-report-modal-actions">
              <button type="button" className="report-secondary-btn" onClick={handleCloseReportPreview}>
                Close
              </button>
              <button type="button" className="report-btn" onClick={handleDownloadPreviewPdf}>
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Dashboard;