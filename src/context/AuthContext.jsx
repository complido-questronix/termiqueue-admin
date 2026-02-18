import { createContext, useState, useContext, useEffect } from 'react';
// 1. Import Firebase tools instead of the old API files
import { auth, db } from '../firebase'; 
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 2. Firebase "Watcher" - This checks if you are logged in automatically
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // If user exists in Auth, check if they are an Admin in Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        
        if (userDoc.exists() && userDoc.data().isAdmin === true) {
          setUser({ ...firebaseUser, ...userDoc.data() });
          setIsAuthenticated(true);
        } else {
          // Not an admin? Log them out!
          await signOut(auth);
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup the watcher
  }, []);

  // 3. New Firebase Login Logic
  const login = async (email, password) => {
    try {
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Immediately check if this person is an Admin in your "users" collection
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

      if (userDoc.exists() && userDoc.data().isAdmin === true) {
        setUser({ ...firebaseUser, ...userDoc.data() });
        setIsAuthenticated(true);
        return { success: true };
      } else {
        await signOut(auth); // Kick them out if not admin
        return { success: false, error: "Access Denied: You are not an Admin." };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: "Login failed. Check your email/password." 
      };
    }
  };

  // 4. New Firebase Logout Logic
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = { user, isAuthenticated, loading, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export default AuthContext;