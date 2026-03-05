"use client";

import { useCallback, useEffect, useState } from "react";
import {
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signOut,
  type User as FirebaseUser,
} from "firebase/auth";

import { auth, googleProvider } from "@/lib/firebase";
import { SESSION_COOKIE_NAME, USER_ID_COOKIE_NAME } from "@/lib/auth";

type AuthUser = {
  uid: string;
  name: string;
  email: string;
  photo: string;
};

function mapFirebaseUser(user: FirebaseUser | null): AuthUser | null {
  if (!user) return null;
  return {
    uid: user.uid,
    name: user.displayName ?? "",
    email: user.email ?? "",
    photo: user.photoURL ?? "",
  };
}

function setAppSessionCookie() {
  document.cookie = `${SESSION_COOKIE_NAME}=authenticated; path=/; max-age=604800; samesite=lax`;
}

function clearAppSessionCookie() {
  document.cookie = `${SESSION_COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
}

function setUserIdCookie(uid: string) {
  const encodedUid = encodeURIComponent(uid);
  document.cookie = `${USER_ID_COOKIE_NAME}=${encodedUid}; path=/; max-age=604800; samesite=lax`;
}

function clearUserIdCookie() {
  document.cookie = `${USER_ID_COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
}

export function useGoogleAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    setPersistence(auth, browserLocalPersistence).catch((error) => {
      console.error("[auth] persistence setup failed", error);
    });

    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        if (!mounted) return;
        const nextUser = mapFirebaseUser(firebaseUser);
        setUser(nextUser);
        if (nextUser) {
          setAppSessionCookie();
          setUserIdCookie(nextUser.uid);
        } else {
          clearAppSessionCookie();
          clearUserIdCookie();
        }
        setLoading(false);
      },
      (error) => {
        console.error("[auth] auth state listener failed", error);
        if (!mounted) return;
        setUser(null);
        clearAppSessionCookie();
        clearUserIdCookie();
        setLoading(false);
      },
    );

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const loginWithGoogle = useCallback(async () => {
    try {
      setLoading(true);
      await setPersistence(auth, browserLocalPersistence);
      const result = await signInWithPopup(auth, googleProvider);
      const nextUser = mapFirebaseUser(result.user);
      setUser(nextUser);
      setAppSessionCookie();
      if (nextUser) {
        setUserIdCookie(nextUser.uid);
      }
      return nextUser;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await signOut(auth);
      setUser(null);
      clearAppSessionCookie();
      clearUserIdCookie();
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    loading,
    loginWithGoogle,
    logout,
  };
}
