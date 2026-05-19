import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithPopup, 
  GoogleAuthProvider,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { createUserProfile } from './firestore';

const googleProvider = new GoogleAuthProvider();
// Force account selection on popup
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

/**
 * Register a user with Email and Password.
 * Updates their auth profile display name and registers a document in Firestore.
 */
export async function signUpWithEmail(email: string, password: string, fullName: string): Promise<FirebaseUser> {
  try {
    // 1. Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2. Set full name in Auth profile
    await updateProfile(user, {
      displayName: fullName
    });

    // 3. Create user profile in Firestore
    await createUserProfile(user.uid, {
      email: email,
      fullName: fullName,
      role: 'user',
    });

    return user;
  } catch (error: any) {
    console.error('Error in signUpWithEmail:', error);
    throw error;
  }
}

/**
 * Sign in a user with Email and Password.
 */
export async function signInWithEmail(email: string, password: string): Promise<FirebaseUser> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    console.error('Error in signInWithEmail:', error);
    throw error;
  }
}

/**
 * Sign in/Up with Google Popup.
 * If user is new, creates their profile document in Firestore.
 */
export async function signInWithGooglePopup(): Promise<FirebaseUser> {
  try {
    const userCredential = await signInWithPopup(auth, googleProvider);
    const user = userCredential.user;

    // Synchronize user profile in Firestore (will not overwrite existing fields)
    await createUserProfile(user.uid, {
      email: user.email || '',
      fullName: user.displayName || 'Google User',
      role: 'user',
    });

    return user;
  } catch (error: any) {
    console.error('Error in signInWithGooglePopup:', error);
    throw error;
  }
}

/**
 * Sign out the currently logged-in user.
 */
export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Error in signOutUser:', error);
    throw error;
  }
}
