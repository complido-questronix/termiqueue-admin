import { collection, deleteField, doc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { db, firebaseInitialized } from '../firebase';

const BUSES_COLLECTION = 'buses';

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

const mapBusToFirebasePayload = (bus) => {
  const routeText = String(bus.route || '').trim();
  const routeParts = routeText.split('-').map((part) => part.trim()).filter(Boolean);
  const origin = routeParts[0] || '';
  const destination = bus.registeredDestination || routeParts.slice(1).join(' - ');
  const attendantName = bus.busAttendant || bus.attendant_name || bus.bus_attendant || '';
  const attendantId = buildAttendantId({
    attendantId: bus.attendantId || bus.attendant_id,
  });

  const parsedPrioritySeat = Number(bus.prioritySeat ?? bus.priority_seat ?? 5);
  const prioritySeat = Number.isFinite(parsedPrioritySeat) ? parsedPrioritySeat : 5;

  const parsedCapacity = Number(bus.capacity ?? 0);
  const capacity = Number.isFinite(parsedCapacity) ? parsedCapacity : 0;

  return {
    bus_number: bus.busNumber || '',
    bus_name: bus.busCompany || '',
    plate_number: bus.plateNumber || '',
    capacity,
    priority_seat: prioritySeat,
    origin,
    destination,
    status: String(bus.status || '').toLowerCase().replace(/\s+/g, '_'),
    attendant_id: attendantId,
    attendant_name: attendantName,
    company_email: bus.busCompanyEmail || '',
    company_contact: bus.busCompanyContact || '',
    current_location: null,
  };
};

const LEGACY_DUPLICATE_FIELDS = {
  attendantId: deleteField(),
  busAttendant: deleteField(),
  busCompany: deleteField(),
  busCompanyContact: deleteField(),
  busCompanyEmail: deleteField(),
  busNumber: deleteField(),
  lastUpdated: deleteField(),
  plateNumber: deleteField(),
  registeredDestination: deleteField(),
  route: deleteField(),
};

const findBusDocByNumber = async (busNumber) => {
  const busesRef = collection(db, BUSES_COLLECTION);

  const snakeSnapshot = await getDocs(query(busesRef, where('bus_number', '==', busNumber)));
  if (!snakeSnapshot.empty) {
    return snakeSnapshot.docs[0];
  }

  const camelSnapshot = await getDocs(query(busesRef, where('busNumber', '==', busNumber)));
  if (!camelSnapshot.empty) {
    return camelSnapshot.docs[0];
  }

  return null;
};

export const syncBusToFirebase = async (bus) => {
  if (!firebaseInitialized) {
    return { synced: false, reason: 'firebase-not-configured' };
  }

  const payload = mapBusToFirebasePayload(bus);
  const existingDoc = await findBusDocByNumber(payload.bus_number);

  if (existingDoc) {
    await updateDoc(existingDoc.ref, {
      ...payload,
      id: existingDoc.id,
      updated_at: serverTimestamp(),
      ...LEGACY_DUPLICATE_FIELDS,
    });
    return { synced: true, mode: 'updated' };
  }

  const newDocRef = doc(collection(db, BUSES_COLLECTION));

  await setDoc(newDocRef, {
    ...payload,
    id: newDocRef.id,
    boarded_count: 0,
    current_queue_id: null,
    last_proximity_notification_sent: null,
    arrived_at: null,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });

  return { synced: true, mode: 'created' };
};
