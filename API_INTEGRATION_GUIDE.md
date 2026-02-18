# API/Firebase Integration Guide

## Current Status ✅

Your application is **API-ready** with the following setup:

### What's Already Configured:

1. ✅ **Axios Instance** (`src/services/api.js`)
   - Base URL configuration via `.env`
   - JWT token authentication
   - Request/Response interceptors
   - Token refresh logic

2. ✅ **Bus API Functions** 
   - `fetchBuses()` - Get all buses with pagination/filtering
   - `fetchBusById()` - Get single bus details
   - `createBus()` - Add new bus
   - `updateBus()` - Update existing bus
   - `deleteBus()` - Remove bus
   - `uploadBusPhoto()` - Upload bus photos

3. ✅ **Component Structure**
   - Loading states
   - Error handling
   - Commented API integration code (ready to uncomment)

---

## Integration Steps

### Option A: REST API (Express/Node.js Backend)

#### 1. Environment Setup
Create `.env` file in project root:
```env
VITE_API_URL=http://localhost:3000/api
# or your production URL:
# VITE_API_URL=https://your-api.com/api
```

#### 2. Backend API Requirements
Your backend should provide these endpoints:

**GET** `/api/buses`
- Query params: `page`, `limit`, `search`, `sortBy`, `sortOrder`
- Response:
```json
{
  "buses": [...],
  "totalCount": 100,
  "currentPage": 1,
  "totalPages": 10
}
```

**POST** `/api/buses`
- Body: Bus object
- Response: Created bus with `id` and `lastUpdated`

**PUT** `/api/buses/:id`
- Body: Updated bus data
- Response: Updated bus object

**DELETE** `/api/buses/:id`
- Response: Success message

**POST** `/api/buses/:id/photo`
- Content-Type: `multipart/form-data`
- Body: `photo` file
- Response: Updated bus with photo URL

#### 3. Activate API Integration in Component

In `src/components/Buses.jsx`:

1. **Uncomment the import:**
```javascript
import { fetchBuses, createBus, updateBus, deleteBus } from '../services/api';
```

2. **Initialize with empty array:**
```javascript
const [buses, setBuses] = useState([]); // Remove initialBuses
```

3. **Uncomment the useEffect block** (lines ~50-70)

4. **Uncomment the API call in handleSubmit** (lines ~180-200)

5. **Remove the local state update code** in handleSubmit

---

### Option B: Firebase/Firestore

#### 1. Install Firebase
```bash
npm install firebase
```

#### 2. Create Firebase Config
Create `src/services/firebase.js`:

```javascript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
```

#### 3. Create Firestore Service
Create `src/services/firestore.js`:

```javascript
import { 
  collection, 
  getDocs, 
  getDoc,
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';

const BUSES_COLLECTION = 'buses';

export const fetchBusesFromFirestore = async ({ 
  page = 1, 
  limitNum = 10, 
  search = '', 
  sortBy = 'lastUpdated', 
  sortOrder = 'desc' 
}) => {
  try {
    const busesRef = collection(db, BUSES_COLLECTION);
    let q = query(busesRef);

    // Add ordering
    q = query(q, orderBy(sortBy, sortOrder));

    // Add pagination
    q = query(q, limit(limitNum));

    const snapshot = await getDocs(q);
    let buses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Client-side search filtering (or use Algolia for better search)
    if (search) {
      const searchLower = search.toLowerCase();
      buses = buses.filter(bus => 
        bus.busNumber?.toLowerCase().includes(searchLower) ||
        bus.route?.toLowerCase().includes(searchLower) ||
        bus.busCompany?.toLowerCase().includes(searchLower) ||
        bus.plateNumber?.toLowerCase().includes(searchLower) ||
        bus.busAttendant?.toLowerCase().includes(searchLower) ||
        bus.status?.toLowerCase().includes(searchLower)
      );
    }

    return buses;
  } catch (error) {
    console.error('Error fetching buses:', error);
    throw error;
  }
};

export const createBusInFirestore = async (busData) => {
  try {
    const docRef = await addDoc(collection(db, BUSES_COLLECTION), {
      ...busData,
      lastUpdated: Timestamp.now().toMillis(),
      createdAt: Timestamp.now().toMillis()
    });
    
    return {
      id: docRef.id,
      ...busData,
      lastUpdated: Date.now()
    };
  } catch (error) {
    console.error('Error creating bus:', error);
    throw error;
  }
};

export const updateBusInFirestore = async (id, busData) => {
  try {
    const busRef = doc(db, BUSES_COLLECTION, id);
    await updateDoc(busRef, {
      ...busData,
      lastUpdated: Timestamp.now().toMillis()
    });
    
    return { id, ...busData };
  } catch (error) {
    console.error('Error updating bus:', error);
    throw error;
  }
};

export const deleteBusFromFirestore = async (id) => {
  try {
    await deleteDoc(doc(db, BUSES_COLLECTION, id));
  } catch (error) {
    console.error('Error deleting bus:', error);
    throw error;
  }
};

export const uploadBusPhotoToStorage = async (busId, photoFile) => {
  try {
    const storageRef = ref(storage, `buses/${busId}/${photoFile.name}`);
    await uploadBytes(storageRef, photoFile);
    const photoURL = await getDownloadURL(storageRef);
    
    // Update bus document with photo URL
    await updateBusInFirestore(busId, { busPhoto: photoURL });
    
    return photoURL;
  } catch (error) {
    console.error('Error uploading photo:', error);
    throw error;
  }
};
```

#### 4. Update Component for Firebase

In `src/components/Buses.jsx`:

```javascript
import { fetchBusesFromFirestore, createBusInFirestore } from '../services/firestore';

// In useEffect:
const loadBuses = async () => {
  try {
    setLoading(true);
    setError(null);
    const data = await fetchBusesFromFirestore({
      page: currentPage,
      limitNum: itemsPerPage,
      search: searchQuery,
      sortBy: sortBy,
      sortOrder: sortOrder
    });
    setBuses(data);
  } catch (err) {
    setError(err.message || 'Failed to load buses');
  } finally {
    setLoading(false);
  }
};

// In handleSubmit:
const createdBus = await createBusInFirestore(newBusData);
```

---

### Option C: Swagger/OpenAPI Integration

If you have a Swagger/OpenAPI spec:

#### 1. Generate API Client
```bash
npm install -g swagger-codegen-cli
swagger-codegen-cli generate -i swagger.json -l typescript-axios -o src/generated-api
```

#### 2. Use Generated Client
```javascript
import { BusesApi, Configuration } from './generated-api';

const config = new Configuration({
  basePath: import.meta.env.VITE_API_URL,
  accessToken: () => localStorage.getItem('accessToken')
});

const busesApi = new BusesApi(config);

// Use in component:
const buses = await busesApi.getBuses({ page: 1, limit: 10 });
```

---

## Firestore Database Structure

Recommended Firestore schema:

```
buses (collection)
  ├─ {busId} (document)
      ├─ busNumber: string
      ├─ route: string
      ├─ busCompany: string
      ├─ status: string ("Active" | "Maintenance" | "Inactive")
      ├─ plateNumber: string
      ├─ capacity: number
      ├─ busAttendant: string
      ├─ busCompanyEmail: string
      ├─ busCompanyContact: string
      ├─ registeredDestination: string
      ├─ busPhoto: string (URL)
      ├─ lastUpdated: timestamp
      └─ createdAt: timestamp
```

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /buses/{busId} {
      // Allow authenticated users to read
      allow read: if request.auth != null;
      
      // Only admin users can write
      allow write: if request.auth != null && 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

---

## Testing Checklist

- [ ] Set up `.env` variables
- [ ] Backend/Firebase endpoints are accessible
- [ ] Authentication tokens are working
- [ ] Fetch buses on component mount
- [ ] Create new bus via API
- [ ] Update existing bus
- [ ] Delete bus functionality
- [ ] Photo upload working
- [ ] Search and filtering work with API
- [ ] Pagination handled correctly
- [ ] Error handling displays properly
- [ ] Loading states show during API calls

---

## Migration Steps (Current → API)

1. **Test current setup** - Make sure everything works with mock data
2. **Set up backend/Firebase** - Create database and API endpoints
3. **Configure environment** - Add API URLs to `.env`
4. **Uncomment API code** - In Buses.jsx
5. **Remove mock data** - Delete `initialBuses` array
6. **Test incrementally** - Test each API function individually
7. **Handle edge cases** - Empty states, errors, slow connections
8. **Deploy** - Deploy backend and frontend

---

## Need Help?

Common issues:
- **CORS errors**: Configure backend CORS settings
- **401 Unauthorized**: Check token in localStorage
- **Slow loads**: Add pagination, implement caching
- **Search not working**: May need to implement search on backend

Your code is structured to make this transition smooth! Just follow the steps above for your chosen backend solution.
