import { collection, getDocs } from 'firebase/firestore';
import { db, firebaseInitialized } from '../firebase';
import { getBusesData } from '../data/busesData';
import { fetchBuses as fetchBusesFromApi } from './api';

const DASHBOARD_DATA_SOURCE = (import.meta.env.VITE_DASHBOARD_DATA_SOURCE || 'firebase').toLowerCase();

const normalizeTimestamp = (value) => {
  if (typeof value === 'number') {
    return value;
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  if (value && typeof value.toMillis === 'function') {
    return value.toMillis();
  }

  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  return Date.now();
};

const mapBusDocument = (docSnapshot) => {
  const bus = docSnapshot.data() || {};
  const normalizedStatus = (() => {
    const rawStatus = String(bus.status || '').trim().toLowerCase();

    if (rawStatus === 'active' || rawStatus === 'available' || rawStatus === 'in_transit' || rawStatus === 'arrived') {
      return 'Active';
    }

    if (rawStatus === 'maintenance') {
      return 'Maintenance';
    }

    return 'Inactive';
  })();

  const origin = String(bus.origin || '').trim();
  const destination = String(bus.destination || '').trim();
  const fallbackRoute = [origin, destination].filter(Boolean).join(' - ');

  return {
    id: bus.id || docSnapshot.id,
    busNumber: bus.bus_number || bus.busNumber || 'N/A',
    route: bus.route || fallbackRoute || 'N/A',
    busCompany: bus.bus_name || bus.busCompany || 'N/A',
    status: normalizedStatus,
    plateNumber: bus.plate_number || bus.plateNumber || 'N/A',
    capacity: Number(bus.capacity || 0),
    busAttendant: bus.attendant_name || bus.busAttendant || 'N/A',
    attendantId: bus.attendant_id || bus.attendantId || '',
    busCompanyEmail: bus.company_email || bus.busCompanyEmail || '',
    busCompanyContact: bus.company_contact || bus.busCompanyContact || '',
    registeredDestination: bus.destination || bus.registeredDestination || '',
    busPhoto: bus.busPhoto || null,
    qnextBoarded: Number(bus.boarded_count || bus.qnext_count || 0),
    lastUpdated: normalizeTimestamp(bus.updated_at || bus.arrived_at || bus.created_at || bus.lastUpdated),
  };
};

const normalizeDashboardStatus = (rawStatus) => {
  const normalizedStatus = String(rawStatus || '').trim().toLowerCase();

  if (normalizedStatus === 'active' || normalizedStatus === 'available' || normalizedStatus === 'in_transit' || normalizedStatus === 'arrived') {
    return 'Active';
  }

  if (normalizedStatus === 'maintenance') {
    return 'Maintenance';
  }

  return 'Inactive';
};

const mapBusFromApiToDashboard = (bus) => ({
  ...bus,
  status: normalizeDashboardStatus(bus.status),
  qnextBoarded: Number(bus.qnextBoarded || bus.boarded_count || 0),
  lastUpdated: normalizeTimestamp(bus.lastUpdated),
});

export const getDashboardTempBuses = () => getBusesData();

export const isDashboardFirebaseOnly = () => DASHBOARD_DATA_SOURCE === 'firebase';

export const fetchBusesFromFirebase = async () => {
  const snapshot = await getDocs(collection(db, 'buses'));
  return snapshot.docs.map(mapBusDocument);
};

export const fetchBusesFromApiSource = async () => {
  const buses = await fetchBusesFromApi();
  return Array.isArray(buses) ? buses.map(mapBusFromApiToDashboard) : [];
};

export const fetchDashboardBuses = async () => {
  const temporaryData = getDashboardTempBuses();

  if (DASHBOARD_DATA_SOURCE === 'local') {
    return {
      buses: temporaryData,
      warning: '',
    };
  }

  if (DASHBOARD_DATA_SOURCE === 'api') {
    try {
      const apiBuses = await fetchBusesFromApiSource();
      return {
        buses: apiBuses,
        warning: '',
      };
    } catch (error) {
      console.error('Failed to fetch dashboard data from API:', error);
      return {
        buses: temporaryData,
        warning: 'Unable to fetch dashboard data from API. Showing local fallback data.',
      };
    }
  }

  if (DASHBOARD_DATA_SOURCE === 'auto') {
    try {
      const apiBuses = await fetchBusesFromApiSource();
      if (apiBuses.length > 0) {
        return {
          buses: apiBuses,
          warning: '',
        };
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data from API:', error);
    }
  }

  if (!firebaseInitialized || !db) {
    if (DASHBOARD_DATA_SOURCE === 'firebase') {
      return {
        buses: [],
        warning: 'Firebase is not configured. Set your VITE_FIREBASE_* environment variables to load dashboard analytics.',
      };
    }

    return {
      buses: temporaryData,
      warning: '',
    };
  }

  try {
    const firebaseBuses = await fetchBusesFromFirebase();

    if (firebaseBuses.length > 0) {
      return {
        buses: firebaseBuses,
        warning: '',
      };
    }

    if (DASHBOARD_DATA_SOURCE === 'firebase') {
      return {
        buses: [],
        warning: 'No bus records found in Firebase yet. Dashboard is currently in Firebase-only mode.',
      };
    }

    if (DASHBOARD_DATA_SOURCE === 'auto') {
      return {
        buses: temporaryData,
        warning: 'API and Firebase data are unavailable. Showing local fallback data.',
      };
    }
  } catch (error) {
    console.error('Failed to fetch dashboard data from Firebase:', error);

    if (DASHBOARD_DATA_SOURCE === 'firebase') {
      return {
        buses: [],
        warning: 'Unable to fetch dashboard data from Firebase. Please check your connection and permissions.',
      };
    }

    if (DASHBOARD_DATA_SOURCE === 'auto') {
      return {
        buses: temporaryData,
        warning: 'API and Firebase data are unavailable. Showing local fallback data.',
      };
    }
  }

  return {
    buses: temporaryData,
    warning: '',
  };
};
