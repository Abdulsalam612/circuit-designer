import {
  EmailAuthProvider,
  deleteUser,
  reauthenticateWithCredential,
  sendEmailVerification,
  updatePassword,
  updateProfile,
  verifyBeforeUpdateEmail,
  type User,
} from 'firebase/auth';
import { collection, deleteDoc, doc, getDocs, setDoc, writeBatch } from 'firebase/firestore';
import { firestore } from '@/firebase';

// Account changes for the profile page. The name and avatar live on users/{uid} (the name
// also on the Auth profile, which the rest of Firebase uses).

export const MAX_NAME_LENGTH = 50;
export const MIN_PASSWORD_LENGTH = 6; // Firebase's own minimum

const userDoc = (uid: string) => doc(firestore, 'users', uid);

// Email, password and delete need a recent sign-in, so ask for the password every time
// rather than failing with auth/requires-recent-login
const reauthenticate = (user: User, password: string) => {
  if (!user.email) throw new Error('This account has no email address.');
  return reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, password));
};

export const saveProfile = async (user: User, changes: { name?: string; avatar?: string | null }) => {
  if (changes.name !== undefined) {
    await updateProfile(user, { displayName: changes.name });
  }
  await setDoc(userDoc(user.uid), changes, { merge: true });
};

export const sendVerification = (user: User) => sendEmailVerification(user);

// The address only changes once the user clicks the link sent to the new one (Firebase
// then signs them out everywhere). AuthContext copies the new address onto users/{uid}.
export const changeEmail = async (user: User, password: string, newEmail: string) => {
  await reauthenticate(user, password);
  await verifyBeforeUpdateEmail(user, newEmail);
};

export const changePassword = async (user: User, currentPassword: string, newPassword: string) => {
  await reauthenticate(user, currentPassword);
  await updatePassword(user, newPassword);
};

// Deletes the user's circuits, their profile doc, then the sign-in account itself.
// Re-authenticating first means deleteUser can't fail for "sign in again" after the data
// is already gone.
export const deleteAccount = async (user: User, password: string) => {
  await reauthenticate(user, password);
  const circuits = await getDocs(collection(firestore, 'users', user.uid, 'circuits'));
  // A batch holds at most 500 writes
  for (let i = 0; i < circuits.docs.length; i += 450) {
    const batch = writeBatch(firestore);
    circuits.docs.slice(i, i + 450).forEach(d => batch.delete(d.ref));
    await batch.commit();
  }
  await deleteDoc(userDoc(user.uid));
  await deleteUser(user);
};
