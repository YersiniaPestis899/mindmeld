import { 
  signInWithPopup, 
  GoogleAuthProvider,
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from './config';
import { setDoc, doc } from 'firebase/firestore';
import { db } from './config';

// Googleログインの実装
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    
    // ユーザー情報をFirestoreに保存
    const { uid, displayName, email, photoURL } = result.user;
    const userRef = doc(db, 'users', uid);
    
    await setDoc(userRef, {
      displayName,
      email,
      photoURL,
      lastLogin: new Date(),
      updatedAt: new Date()
    }, { merge: true });

    return result.user;
  } catch (error) {
    console.error('Google sign in error:', error);
    throw error;
  }
};

// ログアウト実装
export const signOutUser = async () => {
  try {
    await auth.signOut();
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

// 認証状態の監視
export const subscribeToAuth = (callback) => {
  return onAuthStateChanged(auth, callback);
};