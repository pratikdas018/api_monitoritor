"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signOut,
} from "firebase/auth";

import { auth, googleProvider } from "../lib/firebase";

const AuthContext = createContext(undefined);

function mapFirebaseUser(firebaseUser) {
  if (!firebaseUser) return null;

  return {
    uid: firebaseUser.uid,
    name: firebaseUser.displayName ?? "",
    email: firebaseUser.email ?? "",
    photo: firebaseUser.photoURL ?? "",
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function initAuth() {
      try {
        // Persist session in local storage across refresh/browser restarts.
        await setPersistence(auth, browserLocalPersistence);
      } catch (error) {
        console.error("Failed to set auth persistence:", error);
      }

      const unsubscribe = onAuthStateChanged(
        auth,
        (firebaseUser) => {
          if (!active) return;
          setUser(mapFirebaseUser(firebaseUser));
          setLoading(false);
        },
        (error) => {
          console.error("Auth state listener failed:", error);
          if (!active) return;
          setUser(null);
          setLoading(false);
        },
      );

      return unsubscribe;
    }

    let unsubscribe = () => {};
    initAuth()
      .then((fn) => {
        if (typeof fn === "function") {
          unsubscribe = fn;
        }
      })
      .catch((error) => {
        console.error("Auth initialization failed:", error);
        setLoading(false);
      });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const loginWithGoogle = useCallback(async () => {
    try {
      setLoading(true);
      await setPersistence(auth, browserLocalPersistence);
      const result = await signInWithPopup(auth, googleProvider);
      const mapped = mapFirebaseUser(result.user);
      setUser(mapped);
      return mapped;
    } catch (error) {
      console.error("Google sign-in failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      loginWithGoogle,
      logout,
    }),
    [user, loading, loginWithGoogle, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
}
