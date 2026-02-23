import { auth, db } from "../firebase"; // This points back to your firebase.js file
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";


export const loginAsAdmin = async (email, password) => {
  try {
    // This logs the user into Firebase Authentication
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // This looks at the "users" collection you created in your browser
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    // This checks if the isAdmin box is checked (true)
    if (userDoc.exists() && userDoc.data().isAdmin === true) {
      alert("Welcome Admin!");
      return true; 
    } else {
      alert("Access Denied: You are not an admin.");
      await auth.signOut(); 
      return false;
    }
  } catch (error) {
    alert("Error: " + error.message);
    return false;
  }
};
// Add this to the bottom of src/services/authService.js
export const getCurrentUser = () => {
  return auth.currentUser;
};