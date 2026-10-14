"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { auth, firestore } from "@/firebase";

// The bits of users/{uid} that the whole site shows (header name + avatar). Kept live with a
// listener, so a change on the profile page shows up everywhere straight away.
export interface UserProfile {
  name: string | null;
  avatar: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  profile: UserProfile | null;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, profile: null });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const uid = user?.uid;
  useEffect(() => {
    setProfile(null);
    if (!uid) return;
    return onSnapshot(
      doc(firestore, "users", uid),
      (snap) => {
        const data = snap.data();
        // After a verified email change the sign-in email is new; keep the profile doc in step
        const email = auth.currentUser?.email;
        if (snap.exists() && email && data?.email !== email) {
          setDoc(snap.ref, { email }, { merge: true }).catch(() => {});
        }
        setProfile({
          name: typeof data?.name === "string" ? data.name : null,
          avatar: typeof data?.avatar === "string" ? data.avatar : null,
        });
      },
      // Not fatal: the header falls back to the sign-in name and initials
      () => setProfile(null),
    );
  }, [uid]);

  return (
    <AuthContext.Provider value={{ user, loading, profile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// For protected pages: sends logged-out users to the login modal, then back here after login
export const useRequireAuth = () => {
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!auth.loading && !auth.user) {
      router.replace(`/?login=1&next=${encodeURIComponent(pathname)}`);
    }
  }, [auth.loading, auth.user, router, pathname]);

  return auth;
};
