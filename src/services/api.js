import axios from 'axios';
import mockAuthData from '../data/authMockData.json';

const API_URL = import.meta.env.VITE_API_URL || 'http://44.202.107.196:8080';

const getAuthHeaders = () => {
  const accessToken = localStorage.getItem('accessToken');

  if (!accessToken) {
    return {};
  }

  return {
    Authorization: `Bearer ${accessToken}`,
  };
};

const getFirstDefinedValue = (source, keys, fallback = '') => {
  for (const key of keys) {
    const value = source?.[key];
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }

  return fallback;
};

const mapApiStatusToUi = (rawStatus) => {
  const normalized = String(rawStatus || 'Inactive').trim().toLowerCase();

  if (normalized === 'available') {
    return 'Available';
  }

  if (normalized === 'active') {
    return 'Active';
  }

  if (normalized === 'in_transit') {
    return 'In Transit';
  }

  if (normalized === 'arrived') {
    return 'Arrived';
  }

  if (normalized === 'maintenance') {
    return 'Maintenance';
  }

  if (normalized === 'archived' || normalized === 'offline') {
    return 'Offline';
  }

  return 'Offline';
};

const mapUiStatusToApi = (rawStatus) => {
  const normalized = String(rawStatus || '').trim().toLowerCase();

  if (
    normalized === 'active' ||
    normalized === 'available' ||
    normalized === 'offline' ||
    normalized === 'in_transit' ||
    normalized === 'arrived'
  ) {
    return normalized;
  }

  if (normalized === 'in transit') {
    return 'in_transit';
  }

  if (normalized === 'offline') {
    return 'offline';
  }

  if (normalized === 'inactive' || normalized === 'maintenance' || normalized === 'archived') {
    return 'offline';
  }

  return 'available';
};

const splitRoute = (routeValue) => {
  const routeText = String(routeValue || '').trim();
  if (!routeText) {
    return { origin: '', destination: '' };
  }

  const parts = routeText.split('-').map((part) => part.trim()).filter(Boolean);
  if (parts.length < 2) {
    return { origin: parts[0] || '', destination: '' };
  }

  return {
    origin: parts[0],
    destination: parts.slice(1).join(' - '),
  };
};

const generateSecureAttendantId = () => {
  const length = 28;
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const cryptoApi = globalThis?.crypto;

  if (cryptoApi?.getRandomValues) {
    const bytes = new Uint8Array(length);
    cryptoApi.getRandomValues(bytes);
    return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('');
  }

  let fallback = '';
  while (fallback.length < length) {
    fallback += Math.random().toString(36).slice(2);
  }

  return fallback.slice(0, length);
};

const buildAttendantId = ({ attendantId }) => {
  const directId = String(attendantId || '').trim();
  if (directId) {
    return directId;
  }

  return generateSecureAttendantId();
};

const normalizeTimestamp = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  if (value && typeof value.toMillis === 'function') {
    const millis = value.toMillis();
    if (Number.isFinite(millis)) {
      return millis;
    }
  }

  if (typeof value === 'string') {
    const numericValue = Number(value);
    if (Number.isFinite(numericValue)) {
      return numericValue;
    }

    const parsedDate = Date.parse(value);
    if (!Number.isNaN(parsedDate)) {
      return parsedDate;
    }
  }

  return Date.now();
};

const normalizeBus = (bus, index) => {
  const normalizedCapacity = Number(getFirstDefinedValue(bus, ['capacity', 'seat_capacity', 'max_capacity'], 0));
  const normalizedLastUpdated = normalizeTimestamp(
    getFirstDefinedValue(
      bus,
      ['updated_at', 'arrived_at', 'last_updated', 'lastUpdated', 'updatedAt', 'created_at', 'createdAt'],
      Date.now()
    )
  );
  const origin = String(getFirstDefinedValue(bus, ['origin', 'route_origin', 'start_point'], '')).trim();
  const destination = String(getFirstDefinedValue(bus, ['destination', 'registered_destination', 'registeredDestination'], '')).trim();

  let normalizedRoute = String(getFirstDefinedValue(bus, ['route', 'route_name'], 'N/A')).trim();
  if (origin && destination) {
    normalizedRoute = `${origin} - ${destination}`;
  } else if (origin) {
    normalizedRoute = origin;
  } else if (destination) {
    normalizedRoute = destination;
  }

  return {
    id: getFirstDefinedValue(bus, ['id', 'bus_id', '_id'], index + 1),
    busNumber: String(getFirstDefinedValue(bus, ['busNumber', 'bus_number', 'busNo', 'code'], 'N/A')),
    route: normalizedRoute,
    busCompany: String(getFirstDefinedValue(bus, ['bus_name', 'busCompany', 'bus_company', 'company', 'operator'], 'N/A')),
    status: mapApiStatusToUi(getFirstDefinedValue(bus, ['status', 'bus_status'], 'Inactive')),
    plateNumber: String(getFirstDefinedValue(bus, ['plateNumber', 'plate_number', 'plateNo'], 'N/A')),
    capacity: Number.isFinite(normalizedCapacity) ? normalizedCapacity : 0,
    busAttendant: String(getFirstDefinedValue(bus, ['attendant_name', 'busAttendant', 'bus_attendant'], 'N/A')),
    attendantId: String(getFirstDefinedValue(bus, ['attendantId', 'attendant_id'], '')),
    busCompanyEmail: String(getFirstDefinedValue(bus, ['busCompanyEmail', 'company_email', 'email'], 'N/A')),
    busCompanyContact: String(getFirstDefinedValue(bus, ['busCompanyContact', 'company_contact', 'contact_number'], 'N/A')),
    registeredDestination: String(getFirstDefinedValue(bus, ['destination', 'registeredDestination', 'registered_destination'], 'N/A')),
    busPhoto: getFirstDefinedValue(bus, ['busPhoto', 'bus_photo', 'photo_url'], null),
    lastUpdated: normalizedLastUpdated,
  };
};

const extractBusArray = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.buses)) {
    return payload.buses;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
};

const extractSingleBus = (payload) => {
  if (!payload) {
    return null;
  }

  if (Array.isArray(payload)) {
    return payload[0] || null;
  }

  if (payload.bus && typeof payload.bus === 'object') {
    return payload.bus;
  }

  if (payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) {
    return payload.data;
  }

  return payload;
};

const mapBusToApiPayload = (busData = {}, options = { partial: false }) => {
  const payload = {};
  const { partial } = options;
  const routeParts = splitRoute(getFirstDefinedValue(busData, ['route', 'route_name'], ''));

  const assignMappedValue = (targetKey, sourceKeys, transform = (value) => value) => {
    for (const sourceKey of sourceKeys) {
      if (Object.prototype.hasOwnProperty.call(busData, sourceKey) && busData[sourceKey] !== undefined) {
        payload[targetKey] = transform(busData[sourceKey]);
        return;
      }
    }

    if (!partial) {
      payload[targetKey] = transform('');
    }
  };

  assignMappedValue('bus_number', ['bus_number', 'busNumber']);
  assignMappedValue('bus_name', ['bus_name', 'busName', 'operator', 'busCompany'], (value) => String(value || '').trim());
  assignMappedValue('plate_number', ['plate_number', 'plateNumber']);
  assignMappedValue('capacity', ['capacity', 'seat_capacity', 'max_capacity'], (value) => Number(value || 0));
  assignMappedValue('priority_seat', ['priority_seat', 'prioritySeat'], (value) => Number(value || 0));
  assignMappedValue('status', ['status', 'bus_status'], (value) => mapUiStatusToApi(value));
  assignMappedValue('origin', ['origin', 'route_origin'], (value) => String(value || '').trim());
  assignMappedValue('destination', ['destination', 'registeredDestination', 'route_destination'], (value) => String(value || '').trim());
  assignMappedValue('company_email', ['company_email', 'busCompanyEmail', 'email']);
  assignMappedValue('company_contact', ['company_contact', 'busCompanyContact', 'contact_number']);
  assignMappedValue('attendant_name', ['attendant_name', 'busAttendant', 'bus_attendant', 'attendantName']);
  assignMappedValue('attendant_id', ['attendant_id', 'attendantId'], (value) => String(value || '').trim());

  if (!partial) {
    if (!payload.bus_name || !String(payload.bus_name).trim()) {
      payload.bus_name = payload.bus_number || 'Bus';
    }

    if ((payload.priority_seat === '' || payload.priority_seat === undefined || Number.isNaN(payload.priority_seat))) {
      payload.priority_seat = 5;
    }

    if ((!payload.origin || !String(payload.origin).trim()) && routeParts.origin) {
      payload.origin = routeParts.origin;
    }

    if ((!payload.destination || !String(payload.destination).trim())) {
      payload.destination = getFirstDefinedValue(
        busData,
        ['registeredDestination', 'destination'],
        routeParts.destination
      ) || routeParts.destination;
    }

    if (!payload.attendant_id) {
      payload.attendant_id = buildAttendantId({
        attendantId: getFirstDefinedValue(busData, ['attendantId', 'attendant_id'], ''),
        attendantName: getFirstDefinedValue(busData, ['busAttendant', 'bus_attendant', 'attendant_name'], ''),
        busNumber: getFirstDefinedValue(busData, ['busNumber', 'bus_number'], ''),
      });
    }
  }

  if (partial && payload.attendant_id === undefined) {
    const generatedAttendantId = buildAttendantId({
      attendantId: getFirstDefinedValue(busData, ['attendantId', 'attendant_id'], ''),
      attendantName: getFirstDefinedValue(busData, ['busAttendant', 'bus_attendant', 'attendant_name'], ''),
      busNumber: getFirstDefinedValue(busData, ['busNumber', 'bus_number'], ''),
    });

    if (generatedAttendantId) {
      payload.attendant_id = generatedAttendantId;
    }
  }

  return payload;
};

// --- AUTH FUNCTIONS ---
export const loginAPI = async (email, password) => {
  const response = await axios.post(`${API_URL}/auth/login`, { email, password });
  return response.data;
};

export const logoutAPI = async () => {
  return await axios.post(`${API_URL}/auth/logout`);
};

export const getCurrentUser = async () => {
  try {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  } catch (error) {
    return null;
  }
};

// --- BUS FUNCTIONS (Add these to fix the Buses page crash) ---
export const fetchBuses = async (params = {}) => {
  const response = await axios.get(`${API_URL}/buses/`, {
    params,
    headers: getAuthHeaders(),
  });

  const rawBuses = extractBusArray(response.data);
  return rawBuses.map((bus, index) => normalizeBus(bus, index));
};

export const createBus = async (busData) => {
  const response = await axios.post(`${API_URL}/buses/`, mapBusToApiPayload(busData, { partial: false }), {
    headers: getAuthHeaders(),
  });

  const createdBus = extractSingleBus(response.data);
  return normalizeBus(createdBus || busData, 0);
};

export const updateBus = async (id, busData) => {
  const response = await axios.put(`${API_URL}/buses/${id}`, mapBusToApiPayload(busData, { partial: true }), {
    headers: getAuthHeaders(),
  });

  const updatedBus = extractSingleBus(response.data);
  return normalizeBus(updatedBus || { id, ...busData }, 0);
};

export const deleteBus = async (id) => {
  const response = await axios.delete(`${API_URL}/buses/${id}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
};